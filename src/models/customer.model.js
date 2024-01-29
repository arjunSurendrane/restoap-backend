/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
// const { roles } = require('../config/roles');

const customerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: false,
      trim: true,
    },
    picture: {
      type: String,
      required: false,
      trim: true,
    },
    lastName: {
      type: String,
      required: false,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
    },
    firebaseId: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
customerSchema.plugin(toJSON);
customerSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeCustomerId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
customerSchema.statics.isEmailTaken = async function (email, excludeCustomerId) {
  const customer = await this.findOne({ email, _id: { $ne: excludeCustomerId } });
  return !!customer;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
customerSchema.methods.isPasswordMatch = async function (password) {
  const customer = this;
  return bcrypt.compare(password, customer.password);
};

customerSchema.pre('save', async function (next) {
  const customer = this;
  if (customer.isModified('password')) {
    customer.password = await bcrypt.hash(customer.password, 8);
  }
  next();
});

/**
 * @typedef Customer
 */
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
