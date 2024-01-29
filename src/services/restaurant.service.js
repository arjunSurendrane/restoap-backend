const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Restaurant, Role } = require('../models');
const { passwordService, emailService, userService } = require('.');

/**
 * Create new head branch by accepting request
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const createHeadRestaurant = async (body, next) => {
  const { userName, email, phone, restaurantName, restaurantType, location, restaurantPhone } = body;

  const password = await passwordService.createRandomPassword();
  const adminRole = await Role.findOne({ name: 'admin' });

  // Create user
  const newUser = await userService.createUser({ name: userName, email, phone, password, roles: adminRole._id });

  // Create restaurant
  if (newUser) {
    const newRestaurant = await Restaurant.create({
      name: restaurantName,
      user: newUser._id,
      restaurantType,
      location,
      phone: restaurantPhone,
    });
    if (newRestaurant) {
      const updatedUser = await userService.updateUserById({
        userId: newUser._id,
        updateBody: { restaurant: newRestaurant._id },
        next,
      });
      if (updatedUser) {
        await emailService.sendEmail(body.email, password);
      }
      return newRestaurant;
    }
    throw new new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error')();
  } else {
    throw new new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error')();
  }

  // Update user with restaurant ID

  // await emailService.sendEmail(body.email, password);
};

/**
 * Get Restaurant by id
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const getRestaurantById = async (id) => {
  return Restaurant.findById(id);
};

/**
 * Get Restaurant by id and delete
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const getRestaurantByIdAndDelete = async (id) => {
  return Restaurant.findByIdAndDelete(id);
};

/**
 * Get Restaurant by head branch
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const getRestaurantByHeadBranch = async (headBranch) => {
  return Restaurant.find({ headBranch });
};

/**
 * Create New Restaurant
 * @param {Object} restaurantObj
 * @returns {Promise<Restaurant>}
 */
const createRestaurant = async (restaurantObj) => {
  const response = await Restaurant.create(restaurantObj);
  if (!response) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not save restaurant');
  }
  return response;
};

/**
 * Get all branches of the Head Restaurant
 * @param {ObjectId} id
 * @returns {Promise<Restaurant>}
 */
const getRestaurantBranches = async (headBranchId) => {
  const branches = await getRestaurantByHeadBranch(headBranchId);
  if (!branches) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branches not found');
  }
  const headBranch = await getRestaurantById(headBranchId);
  if (!headBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  if (branches && headBranch) {
    const allOutlets = [headBranch, ...branches];
    return allOutlets;
    // eslint-disable-next-line no-else-return
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
};

/**
 * Update Restaurant
 * @param {ObjectId} restaurantId
 * @param {Object} restaurantObj
 * @returns {Promise<Restaurant>}
 */
const updateRestaurant = async (restaurantId, restaurantObj) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  Object.assign(restaurant, restaurantObj);
  await restaurant.save();
  return restaurant;
};

/**
 * Delete Restaurant
 * @param {ObjectId} restaurantId
 * @returns {Promise<Restaurant>}
 */
const deleteBranch = async (restaurantId) => {
  const restaurant = await getRestaurantById(restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  if (restaurant.isHeadBranch) {
    throw new ApiError(httpStatus.METHOD_NOT_ALLOWED, 'Head branch restaurant deletion is not allowed');
  } else {
    await getRestaurantByIdAndDelete(restaurantId);
  }
  return restaurant;
};

/**
 * Get All Restaurants
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Restaurant>}
 */
const getAllRestaurants = async (filter, options) => {
  const allRestaurants = await Restaurant.paginate(filter, options);
  return allRestaurants;
};

/**
 * Get restaurant by userId
 * @param {ObjectId} userId
 * @returns {Promise<Restaurant>}
 */
const getRestaurantsByUser = async (filter, options) => {
  const restaurant = await Restaurant.paginate(filter, options);
  return restaurant;
};

module.exports = {
  createHeadRestaurant,
  createRestaurant,
  updateRestaurant,
  getRestaurantById,
  getRestaurantBranches,
  getRestaurantByHeadBranch,
  getAllRestaurants,
  deleteBranch,
  getRestaurantsByUser,
};
