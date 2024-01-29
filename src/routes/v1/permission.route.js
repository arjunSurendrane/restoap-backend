const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const permissionValidation = require('../../validations/permission.validation');
const permissionController = require('../../controllers/permission.controller');

const router = express.Router();

router
  .route('/')
  .post(
    // auth('CREATE_NEW_PERMISSION'),
    validate(permissionValidation.createPermission),
    permissionController.createPermission
  )
  .get(auth('BASIC'), permissionController.getPermission)
  .put(auth('BASIC'), permissionController.getPermission);

module.exports = router;
