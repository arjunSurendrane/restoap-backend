const httpStatus = require('http-status');
const { User, Store } = require('../models');
const ApiError = require('../utils/ApiError');
const { upload, deleteImageFromAws } = require('./storage.service');
const { getRoleByName } = require('./role.service');
const { getStoresByStoreOwner } = require('./store.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async ({ body, file, next }) => {
  if (await User.isEmailTaken(body.email)) {
    next(new ApiError(httpStatus.CONFLICT, 'Email already taken'));
  }
  const avatarUrl = {};
  if (file?.key) {
    avatarUrl.id = file.key;
    avatarUrl.name = file.location;
    // avatarUrl = { id: file.key, name: file.location };
  }
  body.avatarUrl = avatarUrl;
  body.roles = JSON.parse(body.roles);
  return User.create([body]);
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createAdminUser = async (body, session, next) => {
  // ----

  if (await User.isEmailTaken(body.email)) {
    throw next(new ApiError(httpStatus.BAD_REQUEST, 'Email already taken'));
  }

  return User.create([body], { session });
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id).populate('roles').populate('storeId');
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email }).populate({ path: 'roles' });
};
/**
 * Get user by StoreId
 * @param {ObjectId} storeId
 * @returns {Promise<User>}
 */
const getUserByStoreId = async (storeId) => {
  const storeUser = await User.find({ storeId }).populate('roles');

  return storeUser;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async ({ userId, updateBody, file, next }) => {
  const user = await getUserById(userId);
  // if (!user) {
  //   throw next(new ApiError(httpStatus.NOT_FOUND, 'User not found'));
  // }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw next(new ApiError(httpStatus.BAD_REQUEST, 'Email already taken'));
  }
  await User.findByIdAndUpdate(user._id, { ...updateBody }, { new: true });
  return user;
};

const updateUserByStripeCustomerId = async (stripeCustomerId, updateBody) => {
  const user = await User.findOneAndUpdate({ stripeCustomerId }, updateBody);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
  return user;
};

const updateUser = async (find, update) => {
  const user = await User.findOneAndUpdate(find, update);
  return user;
};

const getUserByCustomerid = async (stripeCustomerId) => {
  const user = await User.findOne({ stripeCustomerId });
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'No user found');
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user.avatarUrl?.id) {
    await deleteImageFromAws(user.avatarUrl?.id);
  }

  await user.remove();
  return user;
};

const getAllUsersUnderSuperAdmin = async (req) => {
  try {
    if (req.query.storeId !== 'undefined') {
      const user = await User.find({
        storeId: { $in: req.query.storeId },
      });
      return user;
    }
    if (req.query.userId) {
      const storeIds = await Store.find({ user: req.query.userId });
      if (storeIds) {
        const newStoreIds = storeIds.map((data) => data.id);
        const user = await User.find({
          storeId: { $in: newStoreIds },
          // isActive: true,
        });
        return user;
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateUser,
  deleteUserById,
  getUserByStoreId,
  getUserByCustomerid,
  getAllUsersUnderSuperAdmin,
  updateUserByStripeCustomerId,
  createAdminUser,
};
