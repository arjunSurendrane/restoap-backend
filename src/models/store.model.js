const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const storeSchema = mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    storeType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
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
    state: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      trim: true,
    },
    currencySymbol: {
      type: String,
      trim: true,
    },
    taxName: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    fssaiNumber: {
      type: String,
      trim: true,
    },
    taxRate: {
      type: Number,
      trim: true,
      default: 0,
    },
    submerchantPaymentGatewayId: {
      type: String,
      trim: true,
    },
    notificationSound: {
      type: String,
    },
    parcelCharge: { type: Number, default: 0 },
    isKitchenHaveScreen: {
      type: Boolean,
      default: false,
    },
    isQrOrderAwailable: {
      type: Boolean,
      default: false,
    },
    isTakeawayAwailable: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
storeSchema.plugin(toJSON);
storeSchema.plugin(paginate);

/**
 * Head Branch already exits
 * @param {Boolean} isHeadBranch
 * @param {ObjectId} user
 * @returns {Promise<boolean}
 */

storeSchema.statics.isHeadBranchTaken = async function (user, isHeadBranch) {
  const branch = await this.findOne({ user, isHeadBranch });
  return !!branch;
};

/**
 * @typedef Store
 */
const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
