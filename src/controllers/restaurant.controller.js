const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { restaurantService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

const createHeadRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await restaurantService.createHeadRestaurant(req.body, next);
  res.status(httpStatus.CREATED).send(restaurant);
});
const createRestaurant = catchAsync(async (req, res) => {
  const restaurant = await restaurantService.createRestaurant(req.body);
  res.status(httpStatus.CREATED).send(restaurant);
});

const getRestaurant = catchAsync(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.restaurantId);
  if (!restaurant) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the restaurant');
  }
  res.status(httpStatus.FOUND).send(restaurant);
});

const getRestaurantBranches = catchAsync(async (req, res) => {
  const branches = await restaurantService.getRestaurantBranches(req.params.headBranchId);
  res.status(httpStatus.FOUND).send(branches);
});

const updateRestaurant = catchAsync(async (req, res) => {
  const updatedRestaurant = await restaurantService.updateRestaurant(req.params.restaurantId, req.body);
  res.status(httpStatus.CREATED).send(updatedRestaurant);
});

const deleteBranch = catchAsync(async (req, res) => {
  const response = await restaurantService.deleteBranch(req.params.restaurantId);
  res.send(response);
});

const getAllRestaurants = catchAsync(async (req, res) => {
  const filter = {};
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const allRestaurants = await restaurantService.getAllRestaurants(filter, options);
  res.status(httpStatus.FOUND).send(allRestaurants);
});

const getRestaurantsByUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user', 'name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await restaurantService.getRestaurantsByUser(filter, options);
  res.send(result);
});
module.exports = {
  createHeadRestaurant,
  createRestaurant,
  updateRestaurant,
  getRestaurant,
  getRestaurantBranches,
  getAllRestaurants,
  deleteBranch,
  getRestaurantsByUser,
};
