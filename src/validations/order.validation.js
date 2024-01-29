const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getOrders = {
  params: Joi.object().keys({
    storeId: Joi.string().required(),
  }),
};

const addSubOrder = {
  body: Joi.object().keys({
    storeId: Joi.string().required(),
    items: Joi.array().required(),
    addons: Joi.array().optional(),
    orderType: Joi.string().required(),
  }),
};

const udpateOrderStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
    suborderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('open', 'verified', 'accepted', 'completed').required(),
  }),
};

const updateOrderItemStatus = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
    suborderId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('open', 'preparing', 'readytoserve', 'delivered').required(),
    itemIds: Joi.array().required(),
  }),
};

const settlePayment = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),

  body: Joi.object().keys({
    paymentMethod: Joi.string(),
    upi: Joi.number(),
    cash: Joi.number(),
    card: Joi.number(),
    totalAmount: Joi.number(),
    metadata: Joi.object(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const createOrder = {
  body: Joi.object().keys({
    items: Joi.array().items(
      Joi.object().keys({
        itemId: Joi.string().required(),
        quantity: Joi.number(),
        variant: Joi.string(),
        note: Joi.string(),
      })
    ),
    addons: Joi.array().items(
      Joi.object().keys({
        addonId: Joi.string().required(),
        quantity: Joi.number().required(),
        variant: Joi.string(),
      })
    ),

    storeId: Joi.string(),
    tableId: Joi.string().required().custom(objectId),
    orderType: Joi.string(),
  }),
};

module.exports = { getOrders, udpateOrderStatus, settlePayment, updateOrderItemStatus, getOrder, createOrder, addSubOrder };
