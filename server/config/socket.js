const socketIo = require('socket.io');
const appModel = require('../models/app');
const { connection } = require('../config/connection');

module.exports = (server) => {
  const io = socketIo(server);

  io.on('connection', (socket) => {
    // Site status update
    socket.on('site status change', (status) => {
      appModel.toggleSiteStatus(status);
      io.emit('site status change', status);
    });

    // Site stats update
    socket.on('inventory calculation', (data) => {
      let totalBefore = {
        value: 0,
        calcs: 0,
      };
      connection.query('SELECT inventory_totalvalue, inventory_calculations FROM appdata', (err, result) => {
        if (err) {
          throw err;
        }
        totalBefore.value = result[0].inventory_totalvalue;
        totalBefore.calcs = result[0].inventory_calculations;
      });
      connection.query(
        `UPDATE appdata SET inventory_totalvalue = inventory_totalvalue + ${Math.round(
          Number(data.total)
        )}, inventory_calculations = inventory_calculations + 1; SELECT inventory_totalvalue FROM appdata`,
        (err, result) => {
          if (err) {
            throw err;
          }
          
          io.emit('inventory total update', {
            before: totalBefore.value,
            after: result[1][0].inventory_totalvalue,
            addition: Number(data.total),
            calculations: totalBefore.calcs,
          });
        }
      );
    });
  });
};
