const httpStatus = require('http-status');
const { Request, User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create new request
 * @param {Object} requestBody
 * @returns {Promise<Request>}
 */
const createRequest = async (requestBody) => {
  return Request.create(requestBody);
};

/**
 * Get request by id
 * @param {ObjectId} id
 * @returns {Promise<Request>}
 */
const getRequestById = async (id) => {
  return Request.findById(id);
};

/**
 * Get user by id and update with restaurantId
 * @param {ObjectId} id
 * @returns {Promise<Request>}
 */
const getUserByIdAndUpdate = async (userId, restaurantId) => {
  return User.findByIdAndUpdate(userId, { restaurantId }, { new: true });
};

/**
 * Get the request using id
 * @param {Object} requestParamsId
 * @returns {Promise<Request>}
 */
const getRequest = async (requestParamsId) => {
  const request = await getRequestById(requestParamsId);
  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Restaurant not found');
  }
  return request;
};

/**
 * Save the accepted user to the database
 * @param {Object} requestParamsId
 * @returns {Promise<Request>}
 */
const createUser = async (userObj) => {
  const newUser = new User(userObj);
  const savedUser = await newUser.save();
  return savedUser;
};

/**
 * Update the accepted user with restaurantId
 * @param {Object} requestParamsId
 * @returns {Promise<Request>}
 */
const updateUser = async (userId, restaurantId) => {
  return getUserByIdAndUpdate(userId, restaurantId);
};

module.exports = {
  createRequest,
  getRequest,
  createUser,
  updateUser,
  getRequestById,
};
