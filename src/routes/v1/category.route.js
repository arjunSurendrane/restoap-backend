const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const categoryController = require('../../controllers/category.controller');
const categoryValidation = require('../../validations/category.validation');

const router = express.Router();

router
  .route('/')
  .post(auth('MENU_CREATE'), validate(categoryValidation.createCategory), categoryController.createCategory)
  .delete(auth('MENU_DELETE'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

router
  .route('/:categoryId')
  .get(auth('MENU_READ'), validate(categoryValidation.getCategory), categoryController.getCategory)
  .patch(auth('MENU_UPDATE'), validate(categoryValidation.updateCategory), categoryController.updateCategory);

router
  .route('/category-list/:store')
  .get(
    auth('MENU_READ'),
    validate(categoryValidation.getRestaurantCategory),
    categoryController.getRestaurantMenuCategories
  );

module.exports = router;
