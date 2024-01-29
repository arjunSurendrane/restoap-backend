const stripe = require('../../config/stripe');

/**
 * Get subscription plans from stripe
 * @returns {Promise<stripe>}
 */
const getSubscriptions = async () => {
  const fetchPlans = async () => stripe.plans.list();
  const fetchProducts = async () => stripe.products.list();
  const [plans, products] = await Promise.all([fetchPlans(), fetchProducts()]);
  const subscriptions = [];
  products.data.forEach((product, index) => {
    const item = plans.data.filter((plan) => plan.product === product.id);
    if (product.active) {
      subscriptions[index] = {};
      subscriptions[index].id = product.id;
      subscriptions[index].description = product.description;
      subscriptions[index].features = product.features;
      subscriptions[index].name = product.name;
      subscriptions[index].pricing = item;
    }
  });
  return subscriptions.sort((a, b) => {
    return a.pricing[a.pricing.length - 1].amount - b.pricing[b.pricing.length - 1].amount;
  });
};

/**
 * Update Subscription
 * @param {*} data
 * @returns
 */
const updateSubscription = async (subscriptionId, priceid) => {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceid,
      },
    ],
  });
  return updatedSubscription;
};

const cancelSubscription = async (subid) => {
  const subscription = await stripe.subscriptions.cancel(subid);
  return subscription;
};

/**
 * Get subscription plans from stripe
 * @returns {Promise<stripe>}
 */
const getSubscriptionById = async (id) => {
  const plan = await stripe.products.retrieve(id);
  return plan;
};

const getSubscriptionOfCustomer = async (id) => {
  const subList = await stripe.subscriptions.list({
    customer: id,
    status: 'all',
    limit: 3,
  });
  return subList;
};

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  getSubscriptionOfCustomer,
  updateSubscription,
  cancelSubscription,
};
