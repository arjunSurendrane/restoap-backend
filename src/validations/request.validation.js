const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createRequest = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    restaurantName: Joi.string().required(),
    restaurantPhone: Joi.string(),
    restaurantType: Joi.string().required(),
    location: Joi.string().required(),
    currency: Joi.string().required(),
    defaultLanguage: Joi.string().required(),
    localLanguages: Joi.array(),
  }),
};

const acceptRequest = {
  body: Joi.object().keys({
    userName: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    restaurantName: Joi.string().required(),
    restaurantType: Joi.string().required(),
    location: Joi.string().required(),
    restaurantPhone: Joi.string().required(),
  }),
};

module.exports = {
  createRequest,
  acceptRequest,
};
