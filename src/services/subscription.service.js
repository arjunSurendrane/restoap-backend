/* eslint-disable no-unreachable */
const httpStatus = require('http-status');
const { Subscription, Table } = require('../models');
const ApiError = require('../utils/ApiError');
const stripeService = require('./stripe');
const userService = require('./user.service');
const { tableService, menuItemService, storeService } = require('.');

/**
 * Create user subscription
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUserSubscription = async (reqData, next) => {
  try {
    // Create subscription in Stripe
    const session = await stripeService.stripeSessions.createCheckoutSession(reqData);

    // Update user collection with subscribed plan when billing is successfully completed
    if (session.payment_status === 'paid') {
      const userWithPlan = await userService.updateUserById({
        userId: reqData.user,
        updateBody: { plan: reqData.body.plan },
        next,
      });
      return userWithPlan;
    }
    throw new Error('Billing was not successfully completed.');
  } catch (error) {
    // If Stripe customer was created before the error occurred, delete it
    await stripeService.stripeCustomer.deleteStripeCustomer(reqData.user.stripeCustomerId);

    throw error;
  }
};

/**
 * Create a customer subscription
 * @param {Object} subsBody
 * @returns {Promise<Subscription>}
 */
const createSubscription = async (subsBody) => {
  const newSubs = Subscription.create(subsBody);
  return newSubs;
};

/**
 * Get subscription by ID
 * @param {ObjectId} id
 * @returns {Promise<Subscription>}
 */
const getSubscriptionById = async (id) => {
  const subscriptionObj = {};
  const subs = await Subscription.findById(id);
  // const stripe = await stripeService.getSubscriptionById(subs.stripeId);
  return { ...subscriptionObj };
};

/**
 * Get all subscription plans
 * @returns {Promise<Subscription>}
 */
const getSubscriptionPlans = async () => {
  // Retrieve all subscriptions from the Subscription collection
  const subscriptions = await Subscription.find().sort({ createdAt: 1 });

  // Array to store subscription details with product information
  // const subscriptionsWithProduct = [];

  // Fetch Stripe product details for each subscription
  // eslint-disable-next-line no-restricted-syntax
  // for (const subscription of subscriptions) {
  //   const { stripeId } = subscription;

  //   // Retrieve the product details from Stripe using the stripeProductId
  //   // eslint-disable-next-line no-await-in-loop
  //   // const stripeProduct = await stripeService.getSubscriptionById(stripeId);

  //   // Combine the subscription and product information
  //   const subscriptionWithProduct = {
  //     subscription,
  //     // stripeProduct,
  //   };

  //   // Add the combined information to the array
  //   subscriptionsWithProduct.push(subscriptionWithProduct);
  // }

  return subscriptions;
};

/**
 * Update subscription plan by ID
 * @param {ObjectId} subscriptionId
 * @param {Object} updateBody
 * @returns {Promise<Subscription>}
 */
const updateSubscriptionById = async (subId, updateBody) => {
  const sub = await getSubscriptionById(subId);
  if (!sub) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  }
  // if (updateBody.name === sub.name) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Name already taken');
  // }
  const updateSub = await Subscription.findByIdAndUpdate(subId, { ...updateBody }, { new: true });
  return updateSub;
};

const getSubscriptionUsingPlanId = async(stripeId) => Subscription.findOne({ stripeId }).lean();

/**
 * Limit user activity based on their subscription plan
 * @returns {Boolean} -  subscription plan
 */
const limitUserActivity = async ({ activityName, stripeId, storeId, userId, inputCount = 0 }) => {
  const getSubscription = async () => Subscription.findOne({ stripeId }).lean();
  const activity = {
    tables: async () => tableService.getTableByStoreId(storeId),
    stores: async () => storeService.getStoreByUserId(userId),
    users: async () => userService.getUserByStoreId(storeId),
  };

  const [subscription, activityData] = await Promise.all([getSubscription(), activity[activityName]()]);
  const { limits } = subscription;

  const count = activityData.length;
  console.log({ activityData, storeId });
  const totalCount = count + inputCount;
  console.log({ limit: limits[activityName], count: totalCount });
  if (limits[activityName] >= totalCount) return true;
  return false;
};

module.exports = {
  createUserSubscription,
  createSubscription,
  getSubscriptionPlans,
  getSubscriptionUsingPlanId,
  getSubscriptionById,
  updateSubscriptionById,
  limitUserActivity,
};
