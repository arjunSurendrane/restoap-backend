const { razorpayService, userService } = require('../services');
const catchAsync = require('../utils/catchAsync');

/**
 * Create a submerchant account
 * POST /integration/razorpay/accounts
 */
const createSubMerchant = catchAsync(async (req, res, next) => {
  const { _id, firstName, email } = req.user;

  /**
   * FIXME:When any error occurs after creating a sub-merchant account,
   * it is difficult to delete the created sub-merchant account and we can't create another one with the same email.
   */

  const subMerchant = await razorpayService.razorpayAccount.createAccount({ name: firstName, email, ...req.body }, next);
  await userService.updateUserById({ userId: _id, updateBody: { submerchantPaymentGatewayId: subMerchant.id }, next });
  res.send(subMerchant);
});

module.exports = { createSubMerchant };
