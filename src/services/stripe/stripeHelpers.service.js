const stripe = require('../../config/stripe');
const catchAsync = require('../../utils/catchAsync');

const attachPaymentMethod = catchAsync(async (req, res) => {
  const { paymentMethod } = req.body;
  const { stripeCustomerId } = req.user;
  // Attach the  payment method to the customer
  await stripe.paymentMethods.attach(paymentMethod, { customer: stripeCustomerId });

  // Set it as the default payment method
  const result = await stripe.customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethod },
  });

  res.send(result);
});

module.exports = { attachPaymentMethod };
