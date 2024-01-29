const httpStatus = require('http-status');
const { Role } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * FIND ROLE
 * @param {Object} restaurantObj
 * @returns {Promise<Restaurant>}
 */
const findRoleId = async (roleName) => {
  const role = await Role.find({ name: roleName });
  if (role.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }
  const roleId = role[0]._id;
  return roleId;
};

/**
 * GET ROLE BY NAME
 * @param {string} name
 * @returns {Promise<Role>}
 */
const getRoleByName = async (roleName, next) => {
  // console.log('roleName', roleName);
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw next(new ApiError(httpStatus.NOT_FOUND, 'Role not found'));
  }
  const { _id } = role;
  return _id;
};

/**
 * Create role
 * @param {Object} roleBody
 * @returns {Promise<Role>}
 */
const createSystemRole = async (roleBody) => {
  // roleBody.name = roleBody.name.toLowerCase();
  const dupRole = await Role.findOne({ store: roleBody.store, name: roleBody.name });
  if (dupRole) {
    throw new ApiError(httpStatus.CONFLICT, 'Role already exist');
  }
  console.log(roleBody);
  if (!roleBody.permissions) {
    roleBody.permissions = ['STORE_READ', 'MANAGER_ACCESS', 'DASHBOARD_READ'];
  }
  // console.log(roleBody);
  Role.create(roleBody);
};

const createSuperadminRole = async (roleBody, session) => Role.create([roleBody], session);

/**
 * Get Role By Store
 * @param {ObjectId} storeId
 * @returns {Promise<Role>}
 */
const getAllRolesByStore = async (storeId) => {
  const roles = await Role.find({ store: storeId }).sort({ createdAt: '-1' });

  if (!roles) {
    throw new ApiError(httpStatus.CONFLICT, 'No Roles found');
  }
  return roles;
};

/**
 * Get Role By Store
 * @param {ObjectId} roleId
 * @returns {Promise<Role>}
 */
const getRoleByRoleId = async (roleId) => {
  const role = await Role.findById({ _id: roleId });
  // console.log('role', role);
  if (!role) {
    throw new ApiError(httpStatus.CONFLICT, 'No Roles found');
  }
  return role;
};

/**
 * Update Role
 * @param {ObjectId} id
 * @return {Promise<Role>}
 */

const updateRole = async (body) => {
  // console.log(body);
  const { id, name, store } = body;
  const role = await Role.find({ id });
  if (!role) {
    throw new ApiError(httpStatus.CONFLICT, 'No role found');
  }
  const nameSmallcase = name.toLowerCase();
  const dupRole = await Role.findOne({ store, name: nameSmallcase });
  if (dupRole) {
    throw new ApiError(httpStatus.CONFLICT, 'Role already exist');
  }
  await Role.findByIdAndUpdate(id, { ...body });
  return Role;
};

/**
 * Delete role
 * @param {ObjectId} Id
 * @return {Promise<Role>}
 */

const deleteRole = async (id) => {
  const role = await Role.findOne({ _id: id });

  if (!role) {
    throw new ApiError(httpStatus.CONFLICT, 'No role found');
  }
  await role.remove();
};

/**
 * Assign permission to a role
 * @param {Object} body
 * @returns {Promise<Role>}
 */
const assignPermission = async (body) => {
  const { roleId } = body;

  // Check role exists
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  const updatedRole = await Role.findByIdAndUpdate(roleId, { permissions: body.permissionKey });
  return updatedRole;
};

module.exports = {
  findRoleId,
  createSystemRole,
  getRoleByName,
  getRoleByRoleId,
  createSuperadminRole,
  getAllRolesByStore,
  deleteRole,
  updateRole,
  assignPermission,
};
