const express = require('express');
const auth = require('../../middlewares/auth');
const stripeController = require('../../controllers/stripe.controller');
const { stripeHelpers } = require('../../services/stripe');
const { razorpayController } = require('../../controllers');

const router = express.Router();

router.route('/plans').get(auth('BASIC'), stripeController.getSubscriptions);
router.route('/checkout-session').post(auth('BASIC'), stripeController.createCheckoutSession);
router.route('/create-account').post(stripeController.createAccount);
router.route('/update-subscription').post(stripeController.updateSubscription);

// Stripe Helpers Route
router.route('/attach-payment').post(auth('BASIC'), stripeHelpers.attachPaymentMethod);

module.exports = router;
