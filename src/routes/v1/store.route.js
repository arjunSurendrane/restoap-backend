const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { storeValidation } = require('../../validations');
const { storeController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(auth('STORE_CREATE'), validate(storeValidation.createStore), storeController.createStore)
  .get(auth('STORE_READ'), validate(storeValidation.getStoresByOwner), storeController.getStoresByOwner)
  .put(auth('STORE_UPDATE'), storeController.updateStore)
  .delete(auth('STORE_DELETE'), validate(storeValidation.deleteStore), storeController.deleteStore);
router.route('/:storeId').put(auth('STORE_UPDATE'), storeController.updateStore).get(storeController.getStore);
router.route('/settings/:storeId').patch(auth('STORE_UPDATE'), storeController.updateSettings);
router.route('/settings/parcel').patch(auth('STORE_UPDATE'), storeController.updateParcelCharge);

module.exports = router;
