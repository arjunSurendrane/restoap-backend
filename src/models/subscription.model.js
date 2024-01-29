const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const subscriptionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    stripeId: {
      type: String,
      required: true,
    },
    stripePriceApiId: {
      type: String,
      required: true,
    },
    billingPeriod: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    permissions: Object,
    features: [
      { feature: { type: String, required: true }, desc: { type: String }, active: { type: Boolean, default: true } },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
subscriptionSchema.plugin(toJSON);

/**
 * @typedef Subscription
 */
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
