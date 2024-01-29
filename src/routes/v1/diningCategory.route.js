const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const diningCategoryValidation = require('../../validations/diningCategory.validation');
const diningCategoryController = require('../../controllers/diningCategory.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('DINING_CREATE'),
    validate(diningCategoryValidation.createDiningCategory),
    diningCategoryController.createDiningCategory
  )
  .get(validate(diningCategoryValidation.getAllDiningCategories), diningCategoryController.getAllDiningCategories);

router
  .route('/:diningCategoryId')
  .get(auth('DINING_READ'), validate(diningCategoryValidation.getDiningCategory), diningCategoryController.getDiningCategory)
  .put(
    auth('DINING_UPDATE'),
    validate(diningCategoryValidation.updateDiningCategory),
    diningCategoryController.updateDiningCategory
  )
  .delete(
    auth('DINING_DELETE'),
    validate(diningCategoryValidation.deleteDiningCategory),
    diningCategoryController.deleteDiningCategory
  );

router
  .route('/category/:storeId')
  .get(
    auth('DINING_READ'),
    validate(diningCategoryValidation.getDiningCategoryByRestaurant),
    diningCategoryController.getDiningCategoryByRestaurant
  );

module.exports = router;
