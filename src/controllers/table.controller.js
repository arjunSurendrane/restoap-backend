const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { tableService, subscriptionService, storeService } = require('../services');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

/**
 * Create table
 * POST /table
 */
const createTable = catchAsync(async (req, res, next) => {
  // Get the tables from the request body.
  const { tables } = req.body;

  // Get the store ID from the first table.
  const { storeId } = tables[0];

  // Get the user's plan.
  const { plan, _id } = req.user;

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

  console.log({ planId });

  // Check the subscription limit for tables.
  const accessToCreate = await subscriptionService.limitUserActivity({
    activityName: 'tables',
    stripeId: planId,
    storeId,
    userId: _id,
    inputCount: tables.length,
  });

  if (!accessToCreate) {
    // Return an error if the limit has been exceeded.
    return next(new ApiError(403, `You have exceeded the limit. Please upgrade your subscription to create more tables.`));
  }

  // Create the table.
  const table = await tableService.createTable(req.body);

  // Send the response.
  res.status(httpStatus.CREATED).send(table);
});

const getTableById = catchAsync(async (req, res) => {
  const table = await tableService.getTable(req.params.tableId);
  res.send(table);
});

const getAllTablesByCategory = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['storeId', 'dineCategory']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const tables = await tableService.getTablesByCategory(filter, options);
  res.send(tables);
});

const getAllTablesByRestaurant = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['storeId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const tables = await tableService.getTablesByRestaurant(filter, options);
  res.send(tables);
});

const updateTable = catchAsync(async (req, res) => {
  const table = await tableService.updateTable(req.params.tableId, req.body);
  res.send(table);
});

const deleteTable = catchAsync(async (req, res) => {
  await tableService.deleteTable(req.params.tableId);
  res.status(httpStatus.NO_CONTENT).send();
});

const limitUser = catchAsync(async (req, res) => {
  const { storeId, subscriptionId } = req.body;
  const user = await subscriptionService.limitUserActivity('table', subscriptionId, storeId);
  res.send(user);
});

module.exports = {
  createTable,
  getTableById,
  getAllTablesByCategory,
  getAllTablesByRestaurant,
  updateTable,
  deleteTable,
  limitUser,
};
