const { connection } = require('../config/connection');
const axios = require('axios');
const steamApi = require('../utils/steam');

exports.createUser = (username, steamid) => {
  const currentTime = new Date().getTime();
  connection.query(
    `INSERT INTO users (username, steamid, admin, banned, last_visit) 
        VALUES (?, ${steamid}, 0, 0, ${currentTime}) 
        ON DUPLICATE KEY UPDATE username=?, last_visit=${currentTime}`,
    [username, username],
    (err, result) => {
      if (err) {
        throw err;
      }
      console.log(
        `[CREATE-USER] User was ${result.affectedRows === 2 ? 'updated' : 'created'} successfully. (${username} | STEAMID: ${steamid})`
      );
    }
  );
};

exports.findUserBySteamid = (steamid) => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM users WHERE steamid=${steamid} LIMIT 1`, (err, result) => {
      if (err) {
        console.log('[findUserBySteamid] ERROR:', err);
        reject(null);
      }
      resolve(result[0]);
    });
  });
};

exports.banUser = (steamid, value) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE users SET banned=? WHERE steamid=?`, [value ? 1 : 0, steamid], (err, result) => {
      if (err) {
        reject(err);
      }

      resolve(result);
    });
  });
};

exports.setAdmin = (steamid, value) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE users SET admin=? WHERE steamid=? LIMIT 1; DELETE FROM sessions WHERE data->>"$.user.steamid"=?;`,
      [value ? 1 : 0, steamid, steamid],
      (err, result) => {
        if (err) {
          reject(err);
        }

        resolve(result);
      }
    );
  });
};

exports.getOwnedGames = (steamid) => {
  return new Promise(async (resolve) => {
    const { data } = await axios.get(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.STEAM_APIKEY}&steamid=${steamid}&format=json&include_appinfo=true`
    );
    if (data.hasOwnProperty('response') && data.response.hasOwnProperty('games')) {
      data.response.games.map((e) => {
        delete e.has_community_visible_stats;
        delete e.playtime_windows_forever;
        delete e.playtime_mac_forever;
        delete e.playtime_linux_forever;
      });
      resolve(data.response.games);
    } else {
      resolve([]);
    }
  });
};

exports.extractSteamId = async (steamid) => {
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

  if (isNaN(steamid)) {
    steamid = steamApi.getVanityURL(steamid);
  }

  return steamid;
};