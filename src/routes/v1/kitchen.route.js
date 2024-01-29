const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const kitchenValidation = require('../../validations/kitchen.validation');
const kitchenController = require('../../controllers/kitchen.controller');
// const { storageService } = require('../../services');

const router = express.Router();

router.route('/kitchen-status').put(auth('KITCHEN_UPDATE'), kitchenController.disableKitchenOrChangeKitchen);
router.route('/kitchen-status').delete(auth('KITCHEN_DELETE'), kitchenController.deleteAllKitchenItems);
router.route('/assign-items').put(auth('KITCHEN_UPDATE'), kitchenController.assignItemsToKitchen);
router
  .route('/')
  .post(auth('KITCHEN_CREATE'), validate(kitchenValidation.createKitchen), kitchenController.createKitchen)
  .delete(auth('KITCHEN_DELETE'), kitchenController.deleteKitchen)
  .put(auth('KITCHEN_UPDATE'), kitchenController.updateKitchen)
  .get(auth('KITCHEN_READ'), kitchenController.getKitchen);

module.exports = router;
