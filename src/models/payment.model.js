const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
      unique: true,
      required: true,
    },
    paymentId: {
      type: String,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: 'Customer',
    },
    paymentType: {
      type: String,
      enum: ['app', 'counter'],
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      ref: 'Store',
    },
    recievedBy: {
      type: String,
      trim: true,
    },
    cashierName: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      trim: true,
      enum: ['card', 'cash', 'upi', 'split'],
    },
    card: Number,
    upi: Number,
    cash: Number,
    transactionId: { type: String, trim: true },
    paymentMeta: Object,
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
