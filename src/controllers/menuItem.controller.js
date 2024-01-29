const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { menuItemService, subscriptionService, storageService } = require('../services');
// const ApiError = require('../utils/ApiError');

const createMenuItem = catchAsync(async (req, res) => {
  // const { storeId } = req.body;

  // Get the user's plan.
  // const { plan } = req.user;

  // Get the plan ID.
  // const { planId } = plan;

  // Check the subscription limit for tables.
  // const accessToCreate = await subscriptionService.limitUserActivity({
  //   activityName: 'menuitems',
  //   stripeId: planId,
  //   storeId,
  // });

  // // Return an error if the limit has been exceeded.
  // if (!accessToCreate) return next(new ApiError(403, 'Limit exceeded'));

  const item = await menuItemService.createMenuItem(req, res);
  res.status(httpStatus.CREATED).send(item);
});

const getMenuItem = catchAsync(async (req, res) => {
  const items = await menuItemService.getMenuItem(req.query.menuItemId);
  res.send(items);
});
// const getSingleMenuItem = catchAsync(async (req, res) => {
//   const items = await menuItemService.getMenuItem(req.query.restaurantId);
//   res.send(items);
// });

const menuItemsByCategory = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['storeId', 'category']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const items = await menuItemService.getAllMenuItemsByCategory(filter, options);
  res.send(items);
});

const menuItemsByRestaurant = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['storeId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'searchValue', 'category', 'sort']);
  const items = await menuItemService.getMenuItemsByRestaurant(filter, options);
  res.send(items);
});

const updateMenuItem = catchAsync(async (req, res) => {
  const item = await menuItemService.updateMenuItem(req);
  res.status(httpStatus.CREATED).send(item);
});

const deleteMenuItem = catchAsync(async (req, res) => {
  // console.log('req.query', req.params, req.query);
  await menuItemService.deleteMenuItem(req.query.menuItemId);

  const message = 'Item deleted successfully';
  res.status(httpStatus.NO_CONTENT).send(message);
});

const createMultipleMenu = catchAsync(async (req, res, next) => {
  const data = await menuItemService.createMultipleMenu(req.body, next);
  res.status(httpStatus.CREATED).send(data);
});

const generateSignedUrl = catchAsync(async (req, res, next) => {
  const url = await storageService.getSignedUrl(req.query.key, next);
  res.status(httpStatus.CREATED).send({ signedUrl: url });
});
module.exports = {
  createMenuItem,
  getMenuItem,
  generateSignedUrl,
  // getSingleMenuItem,
  menuItemsByCategory,
  menuItemsByRestaurant,
  deleteMenuItem,
  updateMenuItem,
  createMultipleMenu,
};
