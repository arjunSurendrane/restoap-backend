const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

const createSystemRole = catchAsync(async (req, res) => {
  const systemRole = await roleService.createSystemRole(req.body);
  res.status(httpStatus.CREATED).send(systemRole);
});

const getAllRolesByStore = catchAsync(async (req, res) => {
  const role = await roleService.getAllRolesByStore(req.query.storeId);
  res.send(role);
});
const getRoleByRoleId = catchAsync(async (req, res) => {
  const role = await roleService.getRoleByRoleId(req.query.roleId);
  res.send(role);
});

const deleteRole = catchAsync(async (req, res) => {
  await roleService.deleteRole(req.query.id);
  res.status(httpStatus.NO_CONTENT).send('Deleted');
});
const updateRole = catchAsync(async (req, res) => {
  await roleService.updateRole(req.body);
  res.status(httpStatus.NO_CONTENT).send('Updated');
});

const assignPermissionToRole = catchAsync(async (req, res) => {
  const role = await roleService.assignPermission(req.body);
  res.send(role);
});

module.exports = {
  createSystemRole,
  getAllRolesByStore,
  getRoleByRoleId,
  deleteRole,
  updateRole,
  assignPermissionToRole,
};
