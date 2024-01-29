const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAddOn = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    storeId: Joi.string().custom(objectId),
    price: Joi.number().required(),
    image: Joi.object(),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
      })
    ),
  }),
};

const getAddOnsByStore = {
  params: Joi.object().keys({
    storeId: Joi.string().custom(objectId),
  }),
};

const deleteAddOns = {
  params: Joi.object().keys({
    addOnId: Joi.string().custom(objectId),
  }),
};

const UpdateAddOns = {
  params: Joi.object().keys({
    addOnId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    storeId: Joi.string().custom(objectId),
    price: Joi.number().required(),
    image: Joi.object(),
    variants: Joi.array().items(
      Joi.object({
        _id: Joi.string().custom(objectId),
        name: Joi.string(),
        price: Joi.number(),
      })
    ),
  }),
};

module.exports = {
  createAddOn,
  getAddOnsByStore,
  UpdateAddOns,
  deleteAddOns,
};
