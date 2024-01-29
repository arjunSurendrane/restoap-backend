const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const addOnController = require('../../controllers/addOn.controller');
const addOnValidation = require('../../validations/addOns.validations');
const { storageService } = require('../../services');

const router = express.Router();

router
  .route('/')
  .post(
    auth('MENU_CREATE'),
    // validate(addOnValidation.createAddOn),
    storageService.upload.single('image'),
    addOnController.createAddOn
  )
  .delete(auth('MENU_DELETE'), validate(addOnValidation.deleteAddOns), addOnController.deleteAddOn)
  .patch(
    auth('MENU_UPDATE'),
    // validate(addOnValidation.UpdateAddOns),
    storageService.upload.single('image'),
    addOnController.updateAddOn
  )
  .get(auth('MENU_READ'), validate(addOnValidation.getAddOnsByStore), addOnController.getAddOnsByStore);

module.exports = router;
