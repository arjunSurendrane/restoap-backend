const httpStatus = require('http-status');
// const pick = require('../utils/pick');
// const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { subscriptionService, stripeService, userService, storeService } = require('../services');
const ApiError = require('../utils/ApiError');
const { sendSubscriptionUpgradeMail } = require('../services/email.service');

const createNewSubscriptionPlan = catchAsync(async (req, res) => {
  // upgrade subscription
  const subs = await subscriptionService.createSubscription(req.body);
  res.status(httpStatus.CREATED).send(subs);
});

const createUserSubscription = catchAsync(async (req, res, next) => {
  const subs = await subscriptionService.createUserSubscription(req, next);
  res.send(subs);
});

const getSubscription = catchAsync(async (req, res) => {
  const sub = await subscriptionService.getSubscriptionById(req.params.subId);
  if (!sub) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(sub);
});

const getSubscriptions = catchAsync(async (req, res) => {
  const subs = await subscriptionService.getSubscriptionPlans();
  res.send(subs);
});

/**
 * Get subscriptions list
 * GET /subscription
 */
const getSubscriptionsFromStripe = catchAsync(async (req, res) => {
  const pricinglist = await stripeService.subscription.getSubscriptions();
  res.send(pricinglist);
});

/**
 * Cancel subscription
 * DELETE /subscription
 */
const cancelSubscription = catchAsync(async (req, res, next) => {
  const { plan } = req.user;
  if (!plan) return next(new ApiError(403, 'You do not have an active subscription plan'));
  // cancel subscription using subscription ID.
  await stripeService.subscription.cancelSubscription(plan.subscriptionId);
  // TODO: send email to the user

  // Send response to the client indicating that the subscription was updated successfully.
  res.json({ status: 'success', message: 'subscription updated' });
});

/**
 * Upgrade subscription
 * PATCH /subscription
 */
const updgradeSubscriptionPlan = catchAsync(async (req, res, next) => {
  const { plan, _id } = req.user;
  const { planId } = req.body;

  if (!plan) return next(new ApiError(403, 'You do not have an active subscription plan'));

  const getSotresCount = async () => storeService.getUserStoreCount(_id);
  const getNewSubscriptionStoreLimit = async () => subscriptionService.getSubscriptionUsingPlanId(planId);
  const [sotresCount, newSubscriptionStoreLimit] = await Promise.all([getSotresCount(), getNewSubscriptionStoreLimit()]);
  const {
    limits: { stores, tables, users },
  } = newSubscriptionStoreLimit;

  if (sotresCount > stores)
    return next(
      new ApiError(400, `Only ${stores} stores can be handled by this subscription package. archive the remaining ones`)
    );

  // debugger;

  // Upgrade subscription using subscription ID.
  const upgradeSubscription = await stripeService.stripeSessions.createCheckoutSession(req);

  // Send response to the client indicating that the subscription was updated successfully.
  res.send(upgradeSubscription);
});

/**
 * Update Subscription
 * PATCH /subscription/:subId
 */
// const updateSubscription = catchAsync(async (req, res) => {
//   const { permission } = req.body;
//   const sub = await subscriptionService.updateSubscriptionById(req.params.subId, req.body);
//   res.send(sub);
// });

module.exports = {
  createNewSubscriptionPlan,
  getSubscriptions,
  getSubscription,
  // updateSubscription,
  createUserSubscription,
  updgradeSubscriptionPlan,
  cancelSubscription,
  getSubscriptionsFromStripe,
};
