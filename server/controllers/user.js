const axios = require('axios');
const games = require('../config/gamelist');
const SteamAPI = require('../utils/steam');
const steamidConverter = require('steamidconvert')();
const { buildResponse } = require('../utils/buildResponse');
const { STATUS_BADREQUEST, STATUS_FORBIDDEN, STATUS_INTERNALERROR, STATUS_OK } = require('../utils/responseCodes');
const { connection } = require('../config/connection');
const userModel = require('../models/user');
const logger = require('dr-logger');
const userLogger = new logger({
  fileName: 'item.log',
});
const banLogger = new logger({
  fileName: 'bans.log',
});

exports.getSummary = (req, res) => {
  res.status(STATUS_OK.status).send(req.session.user);
};

exports.getInventory = async (req, res) => {
  // Uncomment to apply request connection timeouts
  // req.connection.setTimeout( 1000 * 10 );
  let { steamid } = req.query;
  if (!steamid) {
    return res.status(404).send({
      error: 'Missing parameters',
    });
  }
  const game = games.find(({ appid }) => appid == req.query.appid);
  if (!game) {
    return res.status(404).send({
      error: 'Invalid appid',
    });
  }

  if (steamid.search('steamcommunity.com') !== -1) {
    let lastSlash;
    if (steamid.search('/id/') !== -1) {
      lastSlash = steamid.indexOf('/', steamid.search('/id/') + 4);
      steamid = steamid.slice(steamid.search('/id/') + 4, lastSlash === -1 ? steamid.length : lastSlash);
    } else if (steamid.search('/profiles/') !== -1) {
      lastSlash = steamid.indexOf('/', steamid.search('/profiles/') + 10);
      steamid = steamid.slice(steamid.search('/profiles/') + 10, lastSlash === -1 ? steamid.length : lastSlash);
    }
  }

  let customURL;
  // Convert Steam ID64 to Custom URL
  try {
    const {
      data: { response },
    } = await axios.get(
      `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_APIKEY}&vanityurl=${steamid}`
    );
    if (Object.keys(response).includes('steamid')) {
      customURL = response.steamid;
    } else {
      customURL = steamid;
    }
  } catch (e) {
    return res
      .status(STATUS_INTERNALERROR.status)
      .send(buildResponse(STATUS_INTERNALERROR, 'Internal Server Error', {}, Error().stack));
  }
  const contextid = Number(req.query.appid) === 753 ? 6 : 2;
  let data;
  try {
    data = await axios.get(`https://steamcommunity.com/inventory/${customURL}/${req.query.appid}/${contextid}`);
    if (!data.data.total_inventory_count) {
      userLogger.log(`[STEAMID] ${customURL} checked his ${req.query.appid} inventory but has no items.`);
      console.log(`${customURL} checked his ${req.query.appid} inventory but has no items.`);
      return res.status(200).send({
        inventory: [],
        total: -1, // Indicates for inventory doesn't exist
      });
    }
  } catch (error) {
    switch (error.response.status) {
      case 404:
        return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Invalid Steam ID or URL', {}, null));
      case 403:
        return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Inventory is private', {}, null));
      case 500:
        return res
          .status(STATUS_BADREQUEST.status)
          .send(buildResponse(STATUS_BADREQUEST, 'Could not load inventory, please try again in a few moments', {}, null));
      default:
        return res
          .status(STATUS_FORBIDDEN.status)
          .send(buildResponse(STATUS_FORBIDDEN, 'Too many requests, please try again later', {}, Error().stack));
    }
  }
  data = data.data;
  let market_hash_names = [];
  data.descriptions.map((e) => {
    delete e.appid;
    delete e.background_color;
    delete e.commodity;
    delete e.currency;
    delete e.descriptions;
    delete e.market_buy_country_restriction;
    delete e.market_tradable_restriction;
    delete e.tradable;
    market_hash_names.push(e.market_hash_name);
  });
  const { name, appid, short_name } = game;
  connection.query(`SELECT * FROM ${short_name}_data WHERE market_hash_name IN (?)`, [market_hash_names], (err, skinList) => {
    if (err) {
      throw err;
    }

    let classids = [],
      itemsAmount = 0,
      total = 0,
      unpricedItems = 0;
    data.assets.map((a) => classids.push(a.classid));
    data.descriptions = data.descriptions
      .filter((e) => e.marketable === 1)
      .filter((e, index, self) => index === self.findIndex((t) => t.market_hash_name === e.market_hash_name));
    data.descriptions.map(async (skin) => {
      const marketName = skin.market_name;
      if (skin.marketable) {
        skin.price = 0;
        const skinRef = skinList.find((e) => e.market_name == marketName && e.market_hash_name === skin.market_hash_name);
        if (skinRef) {
          skin.price = skinRef.price;
        } else if (!skinRef && unpricedItems <= 5) {
          // Incase of undefined price, manually attempt importing skin price from Steam Market API
          // ... and update it in the database.
          // If too many unpriced skins found - abort. This is to avoid being blocked from Steam API.
          console.log(`[WARNING - ${appid}] Could not find ${marketName} price from database. Trying Steam Market API...`);
          try {
            unpricedItems++;

            try {
              const { data } = await axios.get(
                `https://steamcommunity.com/market/priceoverview/?currency=1&appid=${appid}&market_hash_name=${encodeURI(
                  skin.market_hash_name
                )}`
              );
              const price = data.median_price.replace('$', '');
              connection.query(
                `INSERT INTO ${short_name}_data (market_name, market_hash_name, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE price=?`,
                [marketName, skin.market_hash_name, price, price],
                (err, _) => {
                  if (err) {
                    throw err;
                  }
                  console.log(`[SUCCESS - ${appid}] ${marketName} price is updated to $${price} in the database.`);
                  skin.price = price;
                }
              );
            } catch (_) {
              console.log(`[WARNING - ${appid}] Could not find ${marketName} price from Steam API.`);
            }
          } catch (e) {
            console.log(`[FAIL - ${appid}] Could not get ${marketName} price. Setting to $0.`, e);
          }
        }
        total += Number(skin.price);
      } else {
        skin.price = 'Unmarketable';
      }
      skin.game = name;
      skin.rarity = 'None';
      switch (appid) {
        case 753:
          // Steam
          const gameIndex = Object.keys(skin.tags).findIndex((e) => skin.tags[e].category === 'Game');
          if (gameIndex !== -1) {
            skin.game = skin.tags[gameIndex]['localized_tag_name'];
          }

          const dropIndex = Object.keys(skin.tags).findIndex((e) => skin.tags[e].category === 'droprate');
          if (dropIndex !== -1) {
            skin.rarity = skin.tags[dropIndex]['localized_tag_name'];
          }
        default:
          // CS:GO, Dota 2
          if (appid === 730) {
            const exteriorIndex = Object.keys(skin.tags).findIndex((e) => skin.tags[e].category === 'Exterior');
            if (exteriorIndex !== -1) {
              skin.exterior = skin.tags[exteriorIndex]['localized_tag_name'];
            } else {
              const typeIndex = Object.keys(skin.tags).findIndex((e) => skin.tags[e].category === 'Type');
              skin.exterior = skin.tags[typeIndex]['localized_tag_name'];
            }
          }
          const rarityIndex = Object.keys(skin.tags).findIndex((e) => skin.tags[e].category === 'Rarity');
          if (rarityIndex !== -1) {
            skin.rarity = skin.tags[rarityIndex]['localized_tag_name'];
            skin.color = skin.tags[rarityIndex]['color'];
          }
      }
      skin.count = classids.filter((e) => e === skin.classid).length;
      total += skin.count * skin.price - skin.price;
      itemsAmount += skin.count;
      skin.color = skin.color || 'ffffff';
    });
    userLogger.log(
      `[STEAMID] ${customURL} checked his ${req.query.appid} inventory and got total of $${Number(total).toFixed(
        2
      )} for ${itemsAmount} items.`
    );
    res.status(200).json({
      inventory: data.descriptions,
      items_count: itemsAmount,
      total: Number(total).toFixed(2),
    });
  });
};

exports.getSteamId = async (req, res) => {
  const { steamid } = req.query;
  if (!steamid) {
    return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Missing parameter: steamid', {}, null));
  }
  let data = {
    customURL: req.session.user ? req.session.user.username : null,
  };
  if (isNaN(steamid)) {
    if (steamid.match(/^STEAM_([0-5]):([0-1]):([0-9]+)$/)) {
      data.id32 = steamid;
      data.id64 = steamidConverter.convertTo64(data.id32);
      data.id3 = steamidConverter.convertToNewFormat(data.id32);
    } else if (steamid.match(/^\[([a-zA-Z]):([0-5]):([0-9]+)(:[0-9]+)?\]$/)) {
      data.id3 = steamid;
      data.id64 = SteamAPI.convertID3ToID64(data.id3);
      data.id32 = steamidConverter.convertToText(data.id64);
    } else {
      const steamID64 = await SteamAPI.getVanityURL(steamid);
      if (steamID64 === null) {
        return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Could not find steam id', {}, null));
      }
      data.id64 = steamID64;
      data.id32 = steamidConverter.convertToText(data.id64);
      data.id3 = steamidConverter.convertToNewFormat(data.id32);
    }
    if (data.id32 === null || data.id3 === null || data.id64 === null) {
      return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Could not find steam id', {}, null));
    }
  } else {
    data.id3 = steamidConverter.convertToText(steamid);
    data.id64 = steamid;
    data.id32 = steamidConverter.convertToNewFormat(data.id3);
  }

  const playerData = await SteamAPI.getPlayerSummaries(data.id64);
  if (playerData === null) {
    return res
      .status(STATUS_INTERNALERROR.status)
      .send(buildResponse(STATUS_INTERNALERROR, 'An error occured, please try again', {}, null));
  }

  const urlSearchForId = playerData.profileurl.search('/id/');
  if (urlSearchForId !== -1) {
    data.customURL = playerData.profileurl.slice(urlSearchForId + 4, playerData.profileurl.length - 1);
  } else {
    data.customURL = null;
  }

  data = {
    ...data,
    nickname: playerData.personaname,
    visibility: playerData.communityvisibilitystate, // 3 = Public, 2 = Friends Only, 1 = Private
    commentPermission: playerData.commentpermission,
    createdAt: playerData.timecreated,
  };

  userLogger.log(`[STEAMID] ${data.nickname} (${steamid}) checked his SteamID.`);

  return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, null, data, null));
};

exports.getAll = (req, res) => {
  connection.query('SELECT * FROM users', (err, result) => {
    if (err) {
      throw err;
    }

    return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, null, { users: result }, null));
  });
};

exports.banUser = (req, res) => {
  if (!req.session.user) {
    return res.status(STATUS_FORBIDDEN.status).send(buildResponse(STATUS_FORBIDDEN, 'Unauthorized', {}, null));
  }
  const { steamid, value } = req.body;
  if (!steamid || value === undefined) {
    return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Missing parameters', {}, null));
  }

  try {
    userModel.banUser(steamid, value);
    banLogger.log(`[BAN] ${steamid} was ${value ? 'banned' : 'unbanned'} by '${req.session.user.username}'.`);
    return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, `User has been ${value ? 'banned' : 'unbanned'}`, {}, null));
  } catch (err) {
    throw err;
  }
};

exports.setAdmin = (req, res) => {
  if (!req.session.user) {
    return res.status(STATUS_FORBIDDEN.status).send(buildResponse(STATUS_FORBIDDEN, 'Unauthorized', {}, null));
  }
  const { steamid, value } = req.body;
  if (!steamid || value === undefined) {
    return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Missing parameters', {}, null));
  }

  try {
    userModel.setAdmin(steamid, value);
    userLogger.log(`[ADMIN] ${steamid} was ${value ? 'set' : 'unset'} as an admin by '${req.session.user.username}'.`);
    return res
      .status(STATUS_OK.status)
      .send(buildResponse(STATUS_OK, `User has been ${value ? 'set' : 'unset'} as an admin`, {}, null));
  } catch (err) {
    throw err;
  }
};

exports.getGamesWorth = async (req, res) => {
  if (!req.query.steamid) {
    return res.status(404).send({
      error: 'Missing parameters',
    });
  }

  const steamid = await userModel.extractSteamId(req.query.steamid);
  if (steamid === null) {
    return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Invalid steam id', {}, null));
  }

  const games = await userModel.getOwnedGames(steamid);
  if (!games.length) {
    return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, 'No games found', {}, null));
  }

  let appids = [];
  games.map(({ appid }) => appids.push(appid));
  connection.query(`SELECT * FROM steamapps WHERE appid IN (?)`, [appids], async (err, result) => {
    if (err) {
      userLogger.log(`[getGamesWorth - ${steamid}]: error in MySQL query: ${err}`);
      return res
        .status(STATUS_INTERNALERROR.status)
        .send(buildResponse(STATUS_OK, 'Could not load games, please try again in a few moments', {}, null));
    }

    let total = 0;
    await games.asyncMap(async (e) => {
      const game = result.find(({ appid }) => appid === e.appid);
      if (game !== undefined) {
        e.price = Number(result.find(({ appid }) => appid === e.appid).price);
      } else {
        // Item does not exist in database, manually get price from Steam API
        console.log(`[DATABASE] Could not find ${e.name}, trying Steam API...`);
        try {
          const { data } = await axios.get(
            `https://store.steampowered.com/api/appdetails?appids=${e.appid}&cc=us&filters=price_overview`
          );

          e.price =
            data[e.appid].data === undefined || !data[e.appid].data.hasOwnProperty('price_overview')
              ? 0
              : Number(data[e.appid].data.price_overview.final / 100);
          connection.query(
            'INSERT INTO steamapps (appid, name, isfree, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE price=?',
            [e.appid, e.name, e.price === 0, e.price, e.price],
            (err, _result) => {
              if (err) {
                return console.log(
                  `[DATABASE] Successfully imported ${e.name} - ${e.appid} from Steam API but could not update it in database: ${err}`
                );
              }

              console.log(`[DATABASE] Successfully imported ${e.name} - ${e.appid} from Steam API. Price updated to $${e.price}.`);
            }
          );
        } catch (_err) {
          console.log(`[DATABASE] Could not import ${e.name} - ${e.appid} from Steam API, skipping...`);
          e.price = 0;
        }
      }
      total += e.price;
    });

    userLogger.log(`[STEAM VALUE]: ${steamid} checked his steam value and got $${total} with ${games.length} games.`);
    return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, null, { total, games }, null));
  });
};

Array.prototype.asyncMap = async function (callback) {
  for (let index = 0; index < this.length; index++) {
    await callback(this[index], index, this);
  }
};
