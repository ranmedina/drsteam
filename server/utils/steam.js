const axios = require('axios');

exports.getVanityURL = (steamid) => {
  if (!isNaN(steamid)) {
    throw null;
  }

  return new Promise(async (resolve, _reject) => {
    try {
      const {
        data: { response },
      } = await axios.get(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_APIKEY}&vanityurl=${steamid}`
      );
      if (Object.keys(response).includes('steamid')) {
        resolve(response.steamid);
      } else {
        resolve(null);
      }
    } catch (e) {
      resolve(null);
    }
  });
};

exports.convertID3ToID64 = (steamid) => {
  steamid = steamid.replace('[U:1:', '');
  steamid.substring(0, steamid.length - 1);
  return '765' + (parseInt(steamid) + 61197960265728);
};

exports.getPlayerSummaries = (steamid) => {
  return new Promise(async (resolve, _reject) => {
    try {
      const {
        data: { response },
      } = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${process.env.STEAM_APIKEY}&steamids=${steamid}`
      );
      if (response.players.length) {
        resolve(response.players[0]);
      } else {
        return null;
      }
    } catch (e) {
      resolve(null);
    }
  });
};
