const stripe = require('../../config/stripe');

const createStripeCustomer = async (data) => {
  const { email, id, name } = data;
  const customer = await stripe.customers.create({
    email: email,
    name,
    metadata: {
      userId: id.toString(),
    },
  });

  return customer;
};

const deleteStripeCustomer = async (customerId) => {
  try {
    const confirmation = await stripe.customers.del(customerId);

    return confirmation;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { createStripeCustomer, deleteStripeCustomer };
