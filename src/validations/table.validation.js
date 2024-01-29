const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTable = {
  tables: Joi.array().items(
    Joi.object({
      _id: Joi.string().custom(objectId),
      name: Joi.string(),
      dineCategory: Joi.number(),
    })
  ),
};

const updateTable = {
  params: Joi.object().keys({
    tableId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    dineCategory: Joi.string().required().custom(objectId),
    name: Joi.string().required(),
  }),
};

const getTableById = {
  params: Joi.object().keys({
    tableId: Joi.string().required().custom(objectId),
  }),
};

const getTablesByCategory = {
  params: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
    categoryId: Joi.string().required().custom(objectId),
  }),
};

const getTablesByRestaurant = {
  params: Joi.object().keys({
    storeId: Joi.string().required().custom(objectId),
  }),
};

const deleteTableById = {
  params: Joi.object().keys({
    tableId: Joi.string().required().custom(objectId),
  }),
};
module.exports = {
  createTable,
  updateTable,
  getTableById,
  getTablesByCategory,
  getTablesByRestaurant,
  deleteTableById,
};
