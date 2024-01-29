const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isSystemRole: {
      type: Boolean,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
    },
    permissions: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
roleSchema.plugin(toJSON);

/**
 * @typedef Role
 */
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
