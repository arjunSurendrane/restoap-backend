/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const subscriptionValidation = require('../../validations/subscription.validation');
const subscriptionController = require('../../controllers/subscription.controller');

const router = express.Router();


router
  .route('/')
  .get(subscriptionController.getSubscriptionsFromStripe)
  .patch(auth('BASIC'), subscriptionController.updgradeSubscriptionPlan)
  .delete(auth('BASIC'), subscriptionController.cancelSubscription)

router
  .route('/:subId')
  .get(subscriptionController.getSubscription)

router
  .route('/subscribe')
  .post(auth('BASIC'), subscriptionController.createUserSubscription);

router
  .route('/')
  .post(auth('BASIC'), validate(subscriptionValidation.createSubscription), subscriptionController.createNewSubscriptionPlan)
  .get(subscriptionController.getSubscriptions);

module.exports = router;
