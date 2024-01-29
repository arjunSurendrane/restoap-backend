const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Table = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    storeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Store',
      trim: true,
    },
    dineCategory: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'DiningCategory',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
Table.plugin(toJSON);
Table.plugin(paginate);

/**
 * @typedef TableCreation
 */

const TableSchema = mongoose.model('Table', Table);

module.exports = TableSchema;
