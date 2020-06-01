const { BACKEND_URL, NODE_ENV } = process.env;
const redirectUrl = NODE_ENV === 'prod' ? `https://${BACKEND_URL}/` : 'http://localhost:8080/';
const userModel = require('../models/user');
const axios = require('axios');
const logger = new (require('dr-logger'))({
  fileName: 'auth.log',
});

exports.handleAuth = async (req, res) => {
  if (req.user) {
    const steamid = req.user.steamId;
    let user = {};
    try {
      const { data } = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?key=${process.env.STEAM_APIKEY}&steamids=${steamid}`
      );
      const { personaname, avatarmedium } = data.response.players[0];

      user = {
        username: personaname,
        avatar: avatarmedium,
      };
    } catch (e) {
      user = {
        username: null,
        avatar: null,
      };
    }

    const findUser = await userModel.findUserBySteamid(steamid);
    if (findUser) {
      req.session.user = {
        ...user,
        ...findUser,
      };
      if (Number(steamid) === process.env.STEAMID_ADMIN && !findUser.admin) {
        await userModel.setAdmin(steamid, true);
        req.session.user.admin = 1;
      }
      logger.log(`[AUTH] ${user.username} (${steamid}) signed in.`);
    } else {
      req.session.user = {
        steamid,
        admin: 0,
        banned: 0,
        last_visit: new Date().getTime(),
        ...user,
      };
      userModel.createUser(user.username, steamid);
      logger.log(`[AUTH] ${user.username} (${steamid}) signed in for the first time, user created.`);
    }
  }
  res.redirect(redirectUrl);
};

exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect(redirectUrl);
};
