const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { requestService, restaurantService } = require('../services');

const createRequest = catchAsync(async (req, res) => {
  const request = await requestService.createRequest(req.body);
  res.status(httpStatus.CREATED).send(request);
});

const acceptRequest = catchAsync(async (req, res, next) => {
  const newRestaurant = await restaurantService.createHeadRestaurant(req.body, next);
  res.status(httpStatus.CREATED).sent(newRestaurant);
});

module.exports = {
  createRequest,
  acceptRequest,
};
