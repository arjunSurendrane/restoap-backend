const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createStore = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    user: Joi.string().required().custom(objectId),
    storeType: Joi.string().optional(),
    // address: Joi.string().required(),
    location: Joi.string().required(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pinCode: Joi.string().optional(),
    taxName: Joi.string().allow(''),
    taxRate: Joi.string().allow(''),
    gstNumber: Joi.string().allow(''),
    fssaiNumber: Joi.string().allow(''),
    phone: Joi.string().required(),
    coverImage: Joi.string().optional(),
    logo: Joi.string().optional(),
    currency: Joi.string().required(),
    country: Joi.string().required(),
    notification: Joi.string().optional(),
    submerchantPaymentGatewayId: Joi.string().allow(''),
  }),
};

const updateStore = {
  query: Joi.object().keys({
    storeId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.allow().required(),
    user: Joi.string().required().custom(objectId),
    submerchantPaymentGatewayId: Joi.string().allow(''),
    storeType: Joi.string(),
    location: Joi.string().required(),
    city: Joi.string(),
    state: Joi.string(),
    pinCode: Joi.string(),
    taxName: Joi.string(),
    taxRate: Joi.string(),
    phone: Joi.string().required(),
    coverImage: Joi.string(),
    logo: Joi.string(),
    currency: Joi.string().required(),
    gstNumber: Joi.string().allow(''),
    fssaiNumber: Joi.string().allow(''),
    notification: Joi.string(),
  }),
};

const getStoresByOwner = {
  query: Joi.object().keys({
    user: Joi.string().custom(objectId).required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteStore = {
  query: Joi.object().keys({
    storeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  updateStore,
  createStore,
  getStoresByOwner,
  deleteStore,
};
