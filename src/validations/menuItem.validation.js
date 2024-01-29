const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createMenuItem = {
  body: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    category: Joi.string().required(),
    name: Joi.object().required(),
    foodCategory: Joi.string().required(),
    shortDescription: Joi.object(),
    description: Joi.object(),
    price: Joi.number().required(),
    variants: Joi.object(),
    addOns: Joi.array().items(Joi.string()),
    featured: Joi.boolean(),
    preparationTime: Joi.string(),
    images: Joi.array(),
    videos: Joi.array(),
  }),
};

const getMenuItemsByStore = {
  params: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMenuItemsByCategory = {
  params: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateMenuItem = {
  params: Joi.object().keys({
    menuItemId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    category: Joi.string().required(),
    name: Joi.object().required(),
    foodCategory: Joi.string().required(),
    shortDescription: Joi.object(),
    description: Joi.object(),
    price: Joi.number().required(),
    variants: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required(),
      })
    ),
    addOns: Joi.array().items(Joi.string()),
    featured: Joi.boolean(),
    preparationTime: Joi.string(),
    images: Joi.array(),
    videos: Joi.array(),
  }),
};

const deleteMenuItems = {
  params: Joi.object().keys({
    menuItemId: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createMultipleMenu = {
  body: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().required(),
    })
  ),
};

module.exports = {
  createMenuItem,
  getMenuItemsByStore,
  getMenuItemsByCategory,
  updateMenuItem,
  deleteMenuItems,
  createMultipleMenu,
};
