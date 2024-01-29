const { Payment } = require('../models');

const addnewPaymentData = async (
  {
    orderId,
    paymentId,
    totalAmount,
    paymentType = 'counter',
    recievedBy,
    cashierName,
    storeId,
    paymentMethod,
    paymentMeta,
    card,
    upi,
    cash,
  },
  session
) => {
  const paymentData = {
    orderId,
    paymentId,
    totalAmount,
    recievedBy,
    cashierName,
    paymentType,
    storeId,
    paymentMethod: paymentMethod || null,
    paymentMeta,
    card: card || 0,
    cash: cash || 0,
    upi: upi || 0,
  };
  const payment = await Payment.create([paymentData], { session });
  return payment;
};

module.exports = {
  addnewPaymentData,
};
