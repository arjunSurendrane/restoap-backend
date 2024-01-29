const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, subscriptionService, storeService } = require('../services');
const { storageService } = require('../services');
const { User } = require('../models');

const createUser = catchAsync(async (req, res, next) => {
  const { body, file } = req;
  console.log(file, 'fileupload');
  const { plan, _id } = req.user;
  const { storeId } = body;
  let planId;
  if (plan && plan.planId) {
    // Get the plan ID.
    planId = plan.planId;
  } else {
    const store = await storeService.getStoreByIdWithAdminData(storeId);
    if (!store) return next(new ApiError(400, 'Invalid order data'));
    console.log({ store });
    planId = store.user.plan.planId;
  }
  const accessToCreate = await subscriptionService.limitUserActivity({
    activityName: 'users',
    stripeId: planId,
    userId: _id,
    inputCount: 1,
    storeId,
  });
  if (!accessToCreate) {
    // Return an error if the limit has been exceeded.
    return next(new ApiError(403, `You have exceeded the limit. Please upgrade your subscription to create more staff.`));
  }
  // if (!file) throw new ApiError(404, 'Files Missing');
  body.plan = req.user.plan
  const user = await userService.createUser({ body, file, next });
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  console.log('userId inside getUser', req.query.userId);
  const user = await userService.getUserById(req.query.userId);
  if (!user) {
    console.log('no such user in db');
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  console.log(console.log('getUser'), user);
  res.send(user);
});
const getUserByStoreId = catchAsync(async (req, res) => {
  console.log('req.body', req.query.storeId);
  const users = await userService.getUserByStoreId(req.query.storeId);
  if (!users) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found for Store');
  }
  res.send(users);
});

const updateUser = catchAsync(async (req, res, next) => {
  const item = await userService.getUserById(req.params.userId);

  const { body, file } = req;
  body.roles = JSON.parse(body.roles);
  const avatarUrl = {};
  if (file?.key) {
    avatarUrl.id = file.key;
    avatarUrl.name = file.location;
    body.avatarUrl = avatarUrl;
    const Key = item.avatarUrl?.id;
    const deletedRes = await storageService.deleteImageFromAws(Key);
  } else {
    avatarUrl.id = item.avatarUrl?.id;
    avatarUrl.name = item.avatarUrl?.name;
    body.avatarUrl = avatarUrl;
  }

  const user = await userService.updateUserById({ userId: req.params.userId, updateBody: body, file, next });
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getAllUserByStoreAdmin = catchAsync(async (req, res) => {
  console.log('get all users', req.user);
  const allUsers = await userService.getAllUsersUnderSuperAdmin(req);
  res.send(allUsers);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByStoreId,
  getAllUserByStoreAdmin,
};
