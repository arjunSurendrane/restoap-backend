/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const moment = require('moment');
const { userService, emailService } = require('..');
const config = require('../../config/config');
const stripe = require('../../config/stripe');
const ApiError = require('../../utils/ApiError');
const { cancelSubscription } = require('./stripeSubscription.service');
const { subscription } = require('.');

const subscripitonGrade = {
  'Gourmet Gold Plan': 3,
  'Culinary Pro Plan': 2,
  'Feast Master Plan': 1,
};

const sendSubscriptionCreateMail = async ({
  previousPlan,
  newPlan,
  subscriptionId,
  email,
  firstName,
  metadata,
  amount,
  interval,
}) => {
  if (previousPlan > newPlan || previousPlan < newPlan) {
    // Cancel previous subscription
    console.log('subscription canceled');
    await subscription.cancelSubscription(subscriptionId);
    if (previousPlan < newPlan) {
      console.log('upgraded');
      await emailService.sendSubscriptionUpgradeMail(email, firstName, metadata.plan, amount / 100, interval);
    } else {
      console.log('downgraded');
      await emailService.sendSubscriptionDowngradeMail(email, firstName, metadata.plan, amount / 100, interval);
    }
  } else {
    await emailService.SendSubscriptionPaymentSuccess(
      email,
      firstName,
      metadata.plan,
      amount / 100,
      moment().format('MMM Do YYYY'),
      interval
    );
  }
};

/**
 * Handle subscription created webhook event
 */
async function subscriptionCreated(event) {
  const data = event.data.object;
  const eventType = event.type;
  console.log('subscripton created');
  const { plan, current_period_start, current_period_end, status: planStatus } = data;
  const { metadata, product, amount, interval, currency, status } = plan;
  await stripe.subscriptions.update(data.id, {
    collection_method: 'send_invoice',
    days_until_due: 7,
  });
  const user = await userService.updateUserByStripeCustomerId(data.customer, {
    plan: {
      name: metadata.plan,
      status: status || planStatus,
      subscriptionId: data.id,
      planId: product,
      amount,
      interval,
      currency,
      current_period_start: current_period_start * 1000,
      current_period_end: current_period_end * 1000,
    },
  });
  const { email, firstName } = user;
  const { name, subscriptionId } = user.plan;
  const previousPlan = subscripitonGrade[name];
  const newPlan = subscripitonGrade[metadata.plan];
  sendSubscriptionCreateMail({ previousPlan, newPlan, subscriptionId, email, firstName, metadata, amount, interval });
}

/**
 * Handle subscription updated webhook event
 */
async function subscriptionUpdated(event) {
  const data = event.data.object;
  const { previous_attributes } = event.data;
  const { status: prevStatus } = previous_attributes;
  const eventType = event.type;
  const { plan, current_period_start, status, current_period_end } = data;
  const { metadata, product, amount, interval, currency } = plan;
  if (prevStatus === 'trialing') {
    await userService.updateUserByStripeCustomerId(data.customer, {
      plan: {
        name: metadata.plan,
        status,
        subscriptionId: data.id,
        planId: product,
        amount,
        interval,
        currency,
        current_period_start: current_period_start * 1000,
        current_period_end: current_period_end * 1000,
      },
    });
    return null;
  }
  if (!(status === 'past_due')) return null;
  const user = await userService.updateUserByStripeCustomerId(data.customer, {
    plan: {
      name: metadata.plan,
      status,
      subscriptionId: data.id,
      planId: product,
      amount,
      interval,
      currency,
      current_period_start: current_period_start * 1000,
      current_period_end: current_period_end * 1000,
    },
  });
  const { email, firstName } = user;
  const { name, subscriptionId } = user.plan;
  await emailService.sendSubscriptionCancelMail(
    email,
    firstName,
    metadata.plan,
    amount / 100,
    moment().format('MMM Do YYYY'),
    interval
  );
  return cancelSubscription(data.id);
}

/**
 * Handle subscription deleted webhook event
 */
async function subscriptionDeleted(event) {
  const data = event.data.object;
  const eventType = event.type;
  const { plan } = data;
  // delete plan field
  const { metadata, product, amount, interval, currency } = plan;
  console.log('caneled');
  const user = await userService.updateUser(
    { stripeCustomerId: data.customer, 'plan.subscriptionId': data.id },
    {
      $unset: { plan: {} },
    }
  );
}

/**
 * Handle subscription Pastdue webhook event
 */
async function sendInvoice(event) {
  const data = event.data.object;
  const eventType = event.type;
  const { plan, hosted_invoice_url, due_date } = data;
  const user = await userService.getUserByCustomerid(data.customer);
  const { email, firstName } = user;
  await emailService.SendSubscriptionPaymentReminder({
    to: email,
    name: firstName,
    date: moment().format('MMM Do YYYY'),
    invoiceUrl: hosted_invoice_url,
    dueDate: moment(due_date * 1000).format('MMM Do YYYY'),
  });
}

/**
 * Handle subscription unpaid webhook event
 */
async function subscriptionUnpaid(event) {
  const data = event.data.object;
  const { plan } = data;
  const { metadata, product, amount, interval, currency } = plan;
  const user = await userService.updateUserByStripeCustomerId(data.customer, {
    $unset: { plan: {} },
  });
  const { email, firstName } = user;
  await emailService.SendSubscriptionExpriredMail(email, firstName, metadata.plan, moment().format('MMM Do YYYY'));
  await cancelSubscription(data.id);
}

const trialEnd = async (event) => {
  const data = event.data.object;
  const { plan, current_period_start, status, current_period_end } = data;
  console.log('Trial end');
};

/**
 * Handle Webhook Request
 * @param {Object} rawBody - req.body
 * @returns {Object}
 */
const handleWebhook = async (rawBody, sig, next) => {
  const endpointSecret = config.stripe.stripeWebhookSecret;
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (error) {
    throw next(new ApiError(400, `no signature found${error}`));
  }
  switch (event.type) {
    case 'customer.subscription.created':
      await subscriptionCreated(event);
      break;
    case 'customer.subscription.updated':
      await subscriptionUpdated(event);
      break;
    case 'customer.subscription.deleted':
      await subscriptionDeleted(event);
      break;
    case 'customer.subscription.past_due':
      await sendInvoice(event);
      break;
    case 'customer.subscription.unpaid':
      await subscriptionUnpaid(event);
      break;
    case 'invoice.sent':
      await sendInvoice(event);
      break;
    case 'customer.subscription.trial_will_end':
      await trialEnd(event);
      break;
    default:
  }
  return null;
};

module.exports = { handleWebhook };
