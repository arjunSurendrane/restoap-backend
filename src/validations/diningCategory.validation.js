const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDiningCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    store: Joi.string().required().custom(objectId),
    additionalCharge: Joi.number().required(),
    active: Joi.boolean(),
  }),
};

const getAllDiningCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    store: Joi.string().custom(objectId),
    additionalCharge: Joi.number(),
  }),
};

const updateDiningCategory = {
  params: Joi.object().keys({
    diningCategoryId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().messages({
        'string.empty': 'Category name cannot be empty.',
      }),
      active: Joi.boolean(),
      store: Joi.string().custom(objectId),
      additionalCharge: Joi.number().messages({
        'number.base': 'Additional charge must be a number.',
        'number.min': 'Additional charge must be a positive number.',
      }),
    })
    .min(1),
};

const deleteDiningCategory = {
  params: Joi.object().keys({
    diningCategoryId: Joi.string().custom(objectId),
  }),
};

const getDiningCategory = {
  params: Joi.object().keys({
    diningCategoryId: Joi.string().custom(objectId),
  }),
};

const getDiningCategoryByRestaurant = {
  params: Joi.object().keys({
    storeId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createDiningCategory,
  getAllDiningCategories,
  updateDiningCategory,
  deleteDiningCategory,
  getDiningCategory,
  getDiningCategoryByRestaurant,
};
