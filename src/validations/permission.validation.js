const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPermission = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    key: Joi.string().required(),
    module: Joi.string().required(),
  }),
};
const updatePermission = {
  params: Joi.object().keys({
    permissionId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    key: Joi.string().required(),
    module: Joi.string().required(),
  }),
};

module.exports = { createPermission, updatePermission };
