const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSubscription = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    stripeId: Joi.string().required(),
    features: Joi.array().required(),
  }),
};

const getSubscription = {
  params: Joi.object().keys({
    subId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createSubscription,
  getSubscription,
};
