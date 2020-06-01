const games = [
  {
    name: 'Steam',
    appid: 753,
    short_name: 'steam',
    image: `https://${process.env.BACKEND_URL}/assets/steam.png`,
  },
  {
    name: 'Counter-Strike: Global Offensive',
    appid: 730,
    short_name: 'csgo',
    image: `https://${process.env.BACKEND_URL}/assets/csgo.png`,
  },
  {
    name: 'Dota 2',
    appid: 570,
    short_name: 'dota2',
    image: `https://${process.env.BACKEND_URL}/assets/dota2.png`,
  },
  // Feel free to uncomment these next two, but you might need to perform some implementation client-side
  // {
  //   name: 'Team Fortress 2',
  //   appid: 440,
  //   short_name: 'tf2',
  // },
  // {
  //   name: `PLAYERUNKNOWN'S BATTLEGROUNDS`,
  //   appid: 578080,
  //   short_name: 'pubg',
  // }
];

module.exports = games;
