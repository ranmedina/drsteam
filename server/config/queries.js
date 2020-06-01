const { connection } = require('./connection');
const games = require('./gamelist');

const createDataTable = (cb) => {
  connection.query(
    "CREATE TABLE IF NOT EXISTS `appdata` ( \
      `site_status` BOOLEAN DEFAULT TRUE, \
      `inventory_calculations` INT DEFAULT '1', \
      `inventory_totalvalue` INT DEFAULT '1', \
      `inventory_average` INT DEFAULT '1', \
      `content_title` VARCHAR(64), \
      `content_ribbon` VARCHAR(64), \
      `content_content` VARCHAR(4096) \
    ); \
    INSERT INTO appdata (inventory_calculations, inventory_totalvalue, inventory_average, content_title, content_ribbon, content_content) \
      SELECT 1, 1, 1, null, null, null \
      WHERE NOT EXISTS (SELECT * from appdata);",
    (err, result) => cb(err, result)
  );
};

const createUsersTable = (cb) => {
  connection.query(
    "CREATE TABLE IF NOT EXISTS `users` ( \
    `username` VARCHAR(32), \
    `steamid` BIGINT, \
    `admin` SMALLINT(2) DEFAULT '0', \
    `banned` SMALLINT(2) DEFAULT '0', \
    `last_visit` BIGINT, \
    UNIQUE(steamid) \
  );",
    (err, result) => cb(err, result)
  );
};

const createGameTables = (cb) => {
  let game_count = 0;
  games.forEach((e) => {
    connection.query(
      'CREATE TABLE IF NOT EXISTS `' +
        e.short_name +
        '_data` ( \
        `index` INT NOT NULL AUTO_INCREMENT, \
        `market_name` VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, \
        `market_hash_name` VARCHAR(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, \
        `price` FLOAT DEFAULT 0.0, \
        PRIMARY KEY (`index`) \
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
      (err, _) => {
        if (err) {
          throw err;
        }
        console.log(`[DATABASE] » '${e.name}' table has been setup.`);
        if (++game_count === games.length) {
          cb();
        }
      }
    );
  });
};

const createAppsTable = (cb) => {
  connection.query(
    "CREATE TABLE IF NOT EXISTS `steamapps` ( \
    `index` INT NOT NULL AUTO_INCREMENT, \
    `appid` MEDIUMINT(8) DEFAULT '0', \
    `name` VARCHAR(128), \
    `isfree` SMALLINT(2) DEFAULT '0', \
    `price` DECIMAL(10, 2), \
    UNIQUE(appid), \
    PRIMARY KEY (`index`))",
    (err, result) => cb(err, result)
  );
};

const init_queries = () => {
  return new Promise((resolve, _reject) => {
    connection.query('USE drsteam');

    // Setup `appdata` table
    createDataTable((err, _) => {
      if (err) {
        throw err;
      }
      console.log('[DATABASE] » `appdata` table has been setup.');
    });
    // Setup `users` table
    createUsersTable((err, _) => {
      if (err) {
        throw err;
      }
      console.log('[DATABASE] » `users` table has been setup.');
    });

    // Setup `steamapps` table
    createAppsTable((err, _) => {
      if (err) {
        throw err;
      }
      console.log('[DATABASE] » `steamapps` table has been setup.');
    });

    // Setup games tables
    createGameTables((err, _) => {
      if (err) {
        throw err;
      }
      console.log(`[DATABASE] » All game tables has been setup.`);
      resolve();
    });
  });
};

module.exports = init_queries;
