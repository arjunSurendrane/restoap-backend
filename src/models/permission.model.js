const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const permissionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
permissionSchema.plugin(toJSON);

/**
 * @typedef Permission
 */
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
