const { Order } = require('../models');
const Socket = require('../services/socket.service');

const operationTypeMessage = (operationType, updatedFields) => {
  const status = {
    insert: { orderStatus: 'insert' },
    update: updatedFields,
    delete: { orderStatus: 'delete' },
  };

  return status[operationType];
};

const createSocketServer = (io) => {
  try {
    // connect socket
    const websocketServer = new Socket(io);
    const orderStream = Order.watch([], { fullDocument: 'updateLookup' });

    // real-time order updates
    orderStream.on('change', (change) => {
      const { documentKey, updateDescription, fullDocument, operationType } = change;
      if (operationType === 'insert' || operationType === 'update') {
        data = operationTypeMessage(operationType, updateDescription?.updatedFields);
        // send notification-
        websocketServer.sendNotification({
          data,
          operationType,
          fullDocument,
          updatedFields: updateDescription?.updatedFields,
          orderId: documentKey?._id,
          storeId: fullDocument?.storeId,
        });
      }
    });
  } catch (error) {
    console.log('socket error' + error);
  }
};

module.exports = { createSocketServer };
