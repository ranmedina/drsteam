const mysql = require('mysql');

const { PROD_MYSQL_USERNAME, PROD_MYSQL_PASSWORD } = process.env;

const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.NODE_ENV === 'prod' ? PROD_MYSQL_USERNAME : 'root',
  password: process.env.NODE_ENV === 'prod' ? PROD_MYSQL_PASSWORD : '',
  port: '3306',
  charset: 'utf8mb4',
  multipleStatements: true,
  supportBigNumbers: true,
  bigNumberStrings: true,
});

const init_mysql = () => {
  return new Promise((resolve, _reject) => {
    connection.connect((err) => {
      if (err) {
        throw err;
      }
      console.log('[MySQL] » Connected to server.');
    });
    resolve();
  });
};

module.exports = {
  init_mysql,
  connection,
};
