const httpStatus = require('http-status');
const getRawBody = require('raw-body');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { stripeService, userService } = require('../services');
const config = require('../config/config');
const stripe = require('../config/stripe');
const { stripeAccount } = require('../services/stripe');

const getSubscriptions = catchAsync(async (req, res) => {
  const plans = await stripeService.subscription.getSubscriptions();
  if (!plans) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(plans);
});

const createCheckoutSession = catchAsync(async (req, res) => {
  const session = await stripeService.stripeSessions.createCheckoutSession(req);
  res.send(session);
});

const createStripeWebhook = async (req, res) => {

  let data;
  let eventType;

  const payload = req.body;
  const webhookSecret = config.stripe.stripeWebhookSecret;
  if (webhookSecret) {
    let event;
    const signature = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.log(`⚠️ Webhook signature verification failed:  ${error}`);
      return res.sendStatus(400);
    }
    // Extract the object from the event.
    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  // Handle the checkout.session.completed event
  if (eventType === 'customer.created') {
    console.log('customer crated');
  }

  res.status(200).end();
};

/**
 * Create Stripe Account
 *
 * POST /stripe/create-account
 */
const createAccount = catchAsync(async (req, res, next) => {
  const account = await stripeAccount.createAccount(req, next);
  res.send(account);
});

/**
 * Handle Webhook Request
 *
 * POST /webhook
 */
const handleWebhookRequest = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  await stripeService.stripeWebhook.handleWebhook(req.body, sig, next);
  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

const updateSubscription = catchAsync(async (req, res) => {
  await stripeService.subscription.updateSubscription(req.body);
  res.send();
});

module.exports = {
  getSubscriptions,
  createCheckoutSession,
  createStripeWebhook,
  createAccount,
  handleWebhookRequest,
  updateSubscription,
};
