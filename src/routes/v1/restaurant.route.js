const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const restaurantValidation = require('../../validations/restaurant.validation');
const restaurantController = require('../../controllers/restaurant.controller');

const router = express.Router();
router
  .route('/branches')
  .get(auth('STORE_CREATE'), validate(restaurantValidation.getRestaurantsByUser), restaurantController.getRestaurantsByUser);

router
  .route('/')
  .post(auth('STORE_CREATE'), validate(restaurantValidation.createRestaurant), restaurantController.createRestaurant)
  .get(auth('STORE_CREATE'), restaurantController.getAllRestaurants);

router.route('/head').post(restaurantController.createHeadRestaurant);

router
  .route('/:restaurantId')
  .get(auth('STORE_CREATE'), validate(restaurantValidation.getRestaurant), restaurantController.getRestaurant)
  .patch(auth('STORE_CREATE'), validate(restaurantValidation.updateRestaurant), restaurantController.updateRestaurant)
  .delete(auth('STORE_CREATE'), validate(restaurantValidation.getRestaurant), restaurantController.deleteBranch);

router
  .route('/get-branches/:headBranchId')
  .get(auth('STORE_CREATE'), validate(restaurantValidation.getRestaurant), restaurantController.getRestaurantBranches);

module.exports = router;
