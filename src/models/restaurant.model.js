const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isHeadBranch: {
      type: Boolean,
      default: true,
    },
    headBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    restaurantType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    logo: {
      type: String,
    },
    currency: {
      type: String,
      trim: true,
    },
    defaultLanguage: {
      type: String,
      trim: true,
    },
    localLanguages: [
      {
        type: String,
        trim: true,
      },
    ],
    notificationSound: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
restaurantSchema.plugin(toJSON);
restaurantSchema.plugin(paginate);

/**
 * @typedef Restaurant
 */
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
