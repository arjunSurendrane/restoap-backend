const config = require('../../config/config');
const stripe = require('../../config/stripe');
const { getSubscriptionOfCustomer } = require('./stripeSubscription.service');

/**
 * Create checkout session
 * @param {Object} sessionBody
 * @returns {Promise<stripe>}
 */
const createCheckoutSession = async (reqData) => {
  const { body, user } = reqData;
  const { priceId } = body;
  const { stripeCustomerId } = user;

  // const prices = await stripe.prices.list({
  //   product,
  // });
  // const paymentMethod = await stripe.paymentMethods.create({
  //   type: 'card',
  //   card: {
  //     number: '4242424242424242',
  //     exp_month: 12,
  //     exp_year: 2034,
  //     cvc: '314',
  //   },
  // });

  // console.log({ paymentMethod })

  // // Attach the Payment Method to the customer
  // await stripe.paymentMethods.attach(paymentMethod.id, {
  //   customer: stripeCustomerId,
  // });

  // await stripe.customers.update(stripeCustomerId, { address, default_payment_method: paymentMethod.id });

  // const subscription = await stripe.subscriptions.create({
  //   customer: stripeCustomerId,
  //   items: [{ price: priceId }],
  // });

  // const paymentIntent = stripe.paymentIntents.create({
  //   amount: 1000,
  //   currency: 'usd',
  //   customer: 'cus_1234567890',
  //   stripeAccount: 'acct_1234567890',
  //   transfer_data: {
  //     destination: 'acct_1234567890',
  //   },
  // });
  const list = await getSubscriptionOfCustomer(stripeCustomerId);

  if (list?.data?.length) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          quantity: 1,
          price: priceId,
        },
      ],
      customer: stripeCustomerId,
      billing_address_collection: 'required',
      success_url: `${config.clientURL}/activeSubscription`,
      cancel_url: `${config.clientURL}/dashboard`,
    });

    return session;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        quantity: 1,
        price: priceId,
      },
    ],
    customer: stripeCustomerId,
    billing_address_collection: 'required',
    subscription_data: {
      trial_period_days: 14,
    },
    payment_method_collection: 'if_required',
    success_url: `${config.clientURL}/activeSubscription`,
    cancel_url: `${config.clientURL}/dashboard`,
  });

  // return {
  //   clientSecret: subscription.latest_invoice.payment_intent.client_secret,
  //   subscriptionId: subscription.id,
  // };
  return session;
};

module.exports = { createCheckoutSession };
