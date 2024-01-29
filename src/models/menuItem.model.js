const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const menuItemSchema = mongoose.Schema(
  {
    storeId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Store',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    foodCategory: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    offerPrice: {
      type: Number,
      trim: true,
    },
    variants: {
      type: [
        {
          name: { type: String, trim: true },
          price: { type: Number, trim: true },
          offerPrice: { type: Number, trim: true },
        },
      ],
    },
    offer: {
      type: [
        {
          offerPercentage: { type: Number, trim: true },
          startDate: { type: Date, trim: true },
          endDate: { type: Date, trim: true },
        },
      ],
    },
    kitchen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kitchen',
    },
    addOns: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'AddOn',
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    taxInclude: {
      type: Boolean,
      default: false,
    },
    Active: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: String,
    },
    images: [{ type: mongoose.Schema.Types.Mixed }],
    videos: [{ type: mongoose.Schema.Types.Mixed }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json

menuItemSchema.plugin(toJSON);
menuItemSchema.plugin(paginate);

/**
 * @typedef menuItem
 */

const menuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = menuItem;
