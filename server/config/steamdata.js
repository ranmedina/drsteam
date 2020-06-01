const axios = require('axios');
const { performance } = require('perf_hooks');
const games = require('./gamelist');
const { connection } = require('./connection');

const import_steam_prices = (options) => {
  return new Promise(async (resolve, _reject) => {
    const items = typeof options !== 'undefined' ? options.items : true;
    const apps = typeof options !== 'undefined' ? options.apps : true;

    if (items) {
      import_steam_items(() => {
        console.log(`[DATABASE] Imported skin list and prices.`);
      });
    }

    if (apps) {
      import_steam_apps(() => {
        console.log(`[DATABASE] Imported steam apps.`);

        console.log(`[DATABASE] Finished importing prices.`);
        resolve();
      });
    }
  });
};

const import_steam_items = async (cb) => {
  console.log(`[DATABASE] Importing skin list and prices...`);
  const start = performance.now();
  for (const e in games) {
    try {
      const { name, appid, short_name } = games[e];

      console.log(`[***] Importing ${name} (${appid}) prices...`);
      const httpTime = performance.now();
      const { data } = await axios.get(`https://api.steamapis.com/market/items/${appid}?api_key=${process.env.STEAMAPIS_KEY}`);

      console.log(
        `[*] Found ${Object.keys(data.data).length.toLocaleString('en')} skins (${((performance.now() - httpTime) / 600).toFixed(
          2
        )} seconds)`
      );

      const sqlTime = performance.now();

      data.data.forEach(({ market_name, market_hash_name, prices }) => {
        const price = prices !== undefined && prices.hasOwnProperty('safe') ? prices.safe : -1;
        connection.query(
          `INSERT INTO ${short_name}_data (market_name, market_hash_name, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE price=?`,
          [market_name, market_hash_name, price, price],
          (err, result) => {
            if (err) {
              throw err;
            }
          }
        );
      });

      console.log(
        `[++] ${games[e].name} data successfully imported and saved into database. (${((performance.now() - sqlTime) / 600).toFixed(
          2
        )} sec)`
      );
    } catch (err) {
      if (err.response.statusCode === 401) {
        console.log('[API] Steam items endpoint is not available, skipping...');
        break;
      }
      console.log(`[!] Error while importing ${games[e].name} prices: ${err}`);
    }
  }

  console.log(`*** The whole proccess took ${((performance.now() - start) / 600).toFixed(2)} seconds.`);
  cb();
};

const import_steam_apps = async (cb) => {
  console.log(`[DATABASE] Importing steam apps...`);
  const { data } = await axios.get(`http://api.steamapis.com/market/apps?api_key=${process.env.STEAMAPIS_KEY}`);
  data.forEach(({ appID, name, is_free, price_overview }) => {
    let price = 0;
    if (price_overview !== undefined) {
      price = isNaN(price_overview.final) ? 0 : price_overview.final / 100;
    }

    connection.query(
      `INSERT INTO steamapps (appid, name, isfree, price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE price=?`,
      [appID, name, is_free, price, price],
      (err, result) => {
        if (err) {
          throw err;
        }
      }
    );
  });
  cb();
};

module.exports = import_steam_prices;
