const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

// Add plan in request schema after confirmation
const requestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantType: {
      type: String,
      required: true,
      trim: true,
    },
    restaurantPhone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
    },
    defaultLanguage: {
      type: String,
      required: true,
      trim: true,
    },
    localLanguages: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
requestSchema.plugin(toJSON);

/**
 * @typedef Request
 */
const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
