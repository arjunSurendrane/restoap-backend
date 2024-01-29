const { restaurantService, userService, storeService } = require('..');
const config = require('../../config/config');
const stripe = require('../../config/stripe');

const createAccount = async (req, next) => {
  const { user } = req;

  let accountId;

  if (!user.submerchantPaymentGatewayId) {
    // create account
    const account = await stripe.accounts.create({
      type: 'standard',
    });
    accountId = account.id;
    // store stripeaccount id
    const updateMerchantIdInUser = async () =>
      userService.updateUserById({ userId: user._id, updateBody: { submerchantPaymentGatewayId: accountId }, next });
    const updateMerchantIdInAllStores = async () =>
      storeService.updateStores({ user: user._id }, { submerchantPaymentGatewayId: accountId });
    await Promise.all([updateMerchantIdInAllStores(), updateMerchantIdInUser()]);
  } else {
    accountId = user.submerchantPaymentGatewayId;
  }

  // create account link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: config.clientURL,
    return_url: config.clientURL,
    type: 'account_onboarding',
  });

  return accountLink;
};

module.exports = { createAccount };
