const OpenIDStrategy = require('passport-openid');
const passport = require('passport');
const { BACKEND_URL, NODE_ENV } = process.env;

const url = NODE_ENV === 'prod' ? `https://${BACKEND_URL}/` : 'http://localhost:3001/';

var steamStrategy = new OpenIDStrategy(
  {
    providerURL: 'https://steamcommunity.com/openid',
    stateless: true,
    returnURL: `${url}auth/steam/return`,
    realm: url,
  },
  function (identifier, done) {
    process.nextTick(function () {
      var user = {
        identifier: identifier,
        steamId: identifier.match(/\d+$/)[0],
      };
      return done(null, user);
    });
  }
);

passport.use(steamStrategy);

passport.serializeUser(function (user, done) {
  done(null, user.identifier);
});

passport.deserializeUser(function (identifier, done) {
  done(null, {
    identifier: identifier,
    steamId: identifier.match(/\d+$/)[0],
  });
});

module.exports = passport;
