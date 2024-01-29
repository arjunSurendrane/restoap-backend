/* eslint-disable prettier/prettier */
const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tableValidation = require('../../validations/table.validation');
const tableController = require('../../controllers/table.controller');
// const { createTablePermission } = require('../../middlewares/permission');

const router = express.Router();

router
  .route('/')
  .post(auth('DINING_CREATE'), tableController.createTable);

router
  .route('/singleTable/:tableId')
  .get(auth('DINING_READ'), validate(tableValidation.getTableById), tableController.getTableById)
  .put(auth('DINING_UPDATE'), tableController.updateTable)
  .delete(auth('DINING_DELETE'), validate(tableValidation.deleteTableById), tableController.deleteTable);

router
  .route('/:storeId/:categoryId')
  .get(auth('DINING_READ'), validate(tableValidation.getTablesByCategory), tableController.getAllTablesByCategory);

router
  .route('/:storeId')
  .get(auth('DINING_READ'), validate(tableValidation.getTablesByRestaurant), tableController.getAllTablesByRestaurant);

module.exports = router;
