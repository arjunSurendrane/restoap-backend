const authentication = require('../middlewares/socketAuth');

const notificationMessages = {
  verified: 'Order status was confirmed by the waiter',
  accepted: 'Kitchen has accepted the order status.',
  delivered: 'Changed order status to delivered by waiter',
  insert: 'New order received',
  delete: 'Order removed',
  completed: 'Order Bill paid',
};

class Socket {
  constructor(io) {
    this.io = io;
    io.use(authentication);

    io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  handleConnection(socket) {
    try {
      console.log('Connected to WebSocket connection');

      const { roles, storeId } = socket.user;
      const userRole = roles[0].name;
      console.log(userRole + storeId._id);
      socket.join(userRole + storeId._id);

      socket.on('disconnect', () => {
        console.log('Disconnected');
      });
    } catch (error) {
      socket.on('error', (err) => {
        if (err && err.message === 'unauthorized event') {
          socket.disconnect();
        }
      });
    }
  }

  sendNotification({ data, orderId, storeId, fullDocument, updatedFields, operationType }) {
    try {
      // TODO: Send notification to kitchen
      console.log({ operationType });
      let kitchenNotification = false;
      let suborderId = null;
      if (operationType === 'insert' && fullDocument.subOrders[0].orderStatus === 'verified') {
        suborderId = fullDocument.subOrders[0]._id;
        kitchenNotification = true;
      } else if (operationType === 'update') {
        const updatedFieldsArray = Object.keys(updatedFields);
        const resultFieldArray = Object.values(updatedFields);
        const suborderName = updatedFieldsArray.find((data) => data.startsWith('subOrder'));
        const index = suborderName.split('.')[1];
        suborderId = fullDocument.subOrders[index]._id;
        console.log({ resultFieldArray, updatedFields });
        if (updatedFieldsArray.length === 2 && resultFieldArray[1] === 'verified') {
          kitchenNotification = true;
        } else if (updatedFieldsArray.includes('subtotalBillAmount')) {
          const suborderLength = fullDocument.subOrders.length;
          if (fullDocument.subOrders[suborderLength - 1].orderStatus === 'verified') {
            kitchenNotification = true;
          }
        }
      }

      // const { orderStatus } = data;
      // const message = notificationMessages[orderStatus] || 'Order item status changed';
      let message;
      if (kitchenNotification) message = 'New order verified by waiter';
      console.log(storeId);
      this.sendNotificationToUser({ orderId, message, storeId,suborderId }, kitchenNotification);
    } catch (error) {
      console.log('send notification error' + error);
    }
  }

  sendNotificationToUser(sendData, kitchenNotification) {
    const { storeId } = sendData;
    console.log(`waiter${storeId}`);
    try {
      if (kitchenNotification) {
        console.log('send notification to kitchen uers');
        this.io.to(`kitchen${storeId}`).emit('notification', sendData);
      }
      this.io.to(`waiter${storeId}`).to(`kitchen${storeId}`).to(`cashier${storeId}`).emit('orderChanged', sendData);
    } catch (error) {
      console.log('send notifcation error' + error);
    }
  }
}

module.exports = Socket;
