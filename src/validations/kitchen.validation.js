const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createKitchen = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    store: Joi.string().custom(objectId),
    isActive: Joi.boolean(),
  }),
};

const updateKitchen = {
  query: Joi.object().keys({
    Id: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    store: Joi.string().custom(objectId),
    isActive: Joi.boolean(),
  }),
};

const getKitchens = {
  query: Joi.object().keys({
    store: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const deleteKitchen = {
  query: Joi.object().keys({
    store: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createKitchen,
  updateKitchen,
  getKitchens,
  deleteKitchen,
};
