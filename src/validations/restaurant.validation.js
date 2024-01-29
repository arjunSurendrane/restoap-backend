const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRestaurant = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    user: Joi.string().required().custom(objectId),
    isHeadBranch: Joi.boolean(),
    headBranch: Joi.string().custom(objectId),
    restaurantType: Joi.string(),
    location: Joi.string().required(),
    phone: Joi.string().required(),
    coverImage: Joi.string(),
    logo: Joi.string(),
    currency: Joi.string().required(),
    defaultLanguage: Joi.string().required(),
    localLanguages: Joi.array(),
    notification: Joi.string(),
  }),
};

const getRestaurant = {
  params: Joi.object().keys({
    headBranchId: Joi.string().custom(objectId),
  }),
};

const updateRestaurant = {
  params: Joi.object().keys({
    restaurantId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    user: Joi.string().required().custom(objectId),
    isHeadBranch: Joi.boolean(),
    headBranch: Joi.string().custom(objectId),
    restaurantType: Joi.string(),
    location: Joi.string().required(),
    phone: Joi.string().required(),
    coverImage: Joi.string(),
    logo: Joi.string(),
    currency: Joi.string().required(),
    defaultLanguage: Joi.string().required(),
    localLanguages: Joi.array(),
    notification: Joi.string(),
  }),
};

const getRestaurantsByUser = {
  query: Joi.object().keys({
    name: Joi.string(),
    user: Joi.string().required().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = { createRestaurant, updateRestaurant, getRestaurant, getRestaurantsByUser };
