const express = require('express');
const { razorpayController, stripeController } = require('../../controllers');
const { integrationValidation } = require('../../validations');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const router = express.Router();

router
  .route('/razorpay/accounts')
  .post(auth('BASIC'), validate(integrationValidation.createAccount), razorpayController.createSubMerchant);

router.route('/stripe/accounts').post(auth('BASIC'), stripeController.createAccount);

module.exports = router;
