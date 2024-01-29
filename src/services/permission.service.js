const httpStatus = require('http-status');
const { Permission } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a permission
 * @param {Object} permissionBody
 * @returns {Promise<Permission>}
 */
const createPermission = async (permissionBody) => {
  if (await Permission.findOne({ key: permissionBody.key })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This permission already exist');
  }
  return Permission.create(permissionBody);
};

/**
 * Get permission By Store id
 * @param {ObjectId} storeId
 * @returns {Promise<Permission>}
 */
const getallPermission = async () => {
  const AllPermission = await Permission.find().sort({ createdAt: -1 });
  return AllPermission;
};

/**
 * Update permission
 * @param {ObjectId} permissionId
 * @returns {Promise<Permission>}
 */
const updatePermission = async (permissionId,permissionBody) => {
  const permission = await Permission.find({ _id: permissionId });
  return permission;
};

module.exports = {
  createPermission,
  getallPermission,
  updatePermission,
};
