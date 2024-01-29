const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { permissionService } = require('../services');
const ApiError = require('../utils/ApiError');

const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);
  res.status(httpStatus.CREATED).send(permission);
});
const getPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.getallPermission();
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permisssion Not Found');
  }
  res.send(permission);
});

const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.getallPermission();
  if (!permission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Permisssion Not Found');
  }
  res.send(permission);
});

module.exports = { createPermission, getPermission, updatePermission };
