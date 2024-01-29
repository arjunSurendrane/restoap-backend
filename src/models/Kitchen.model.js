const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const KitchenSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
KitchenSchema.plugin(toJSON);

/**
 * @typedef Role
 */
const Role = mongoose.model('Kitchen', KitchenSchema);

module.exports = Role;
