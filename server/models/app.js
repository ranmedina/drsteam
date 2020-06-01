const { connection } = require('../config/connection');

exports.toggleSiteStatus = (status) => {
  connection.query('UPDATE appdata SET site_status=?', [status], (err, _result) => {
    if (err) {
      throw err;
    }
    console.log(`» Site status changed to ${status ? 'ENABLED' : 'DISABLED'}`);
  });
};
