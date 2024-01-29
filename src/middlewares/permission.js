const { subscriptionService, tableService } = require('../services');
const ApiError = require('../utils/ApiError');

const createTablePermission = async (req, res, next) => {
  const { user, storeId } = req.user;
  const { subscriptionId } = user.plan;
  const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
  const { permissions } = subscription;
  const table = await tableService.getTableNamesByRestaurant(storeId);
  if (table.length >= permissions[table]) return next(new ApiError(403, 'limit exceeded'));
  next();
};

module.exports = { createTablePermission };
