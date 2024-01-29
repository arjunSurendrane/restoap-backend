const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createSystemRole = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array(),
    store: Joi.string().required(),
    // isSystemRole: Joi.string(),
  }),
};
const getAllRolesByStore = {
  query: Joi.object().keys({
    storeId: Joi.string().required(),
  }),
};

const getRole = {
  query: Joi.object().keys({
    roleId: Joi.string().required(),
  }),
};

const assignPermissionToRole = {
  body: Joi.object().keys({
    roleId: Joi.string().required().custom(objectId),
    permissionKey: Joi.array(),
  }),
};

const updateRole = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    permissions: Joi.array(),
    store: Joi.string().required(),
    // isSystemRole: Joi.string(),
  }),
};

module.exports = {
  getRole,
  updateRole,
  createSystemRole,
  assignPermissionToRole,
  getAllRolesByStore,
};
