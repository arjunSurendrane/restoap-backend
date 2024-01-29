const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const diningCategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      trim: true,
    },
    additionalCharge: {
      type: Number,
      default: 0,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
diningCategorySchema.plugin(toJSON);
diningCategorySchema.plugin(paginate);

/**
 * @typedef DiningCategory
 */

const DiningCategory = mongoose.model('DiningCategory', diningCategorySchema);

module.exports = DiningCategory;
