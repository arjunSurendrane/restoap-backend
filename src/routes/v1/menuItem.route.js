const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const menuItemValidation = require('../../validations/menuItem.validation');
const MenuItemController = require('../../controllers/menuItem.controller');
const { storageService } = require('../../services');

const router = express.Router();
// const upload = multer();
router.route('/multiple-upload').post(auth('MENU_CREATE'), MenuItemController.createMultipleMenu);
router.route('/get-signed-url').get(auth('MENU_CREATE'), MenuItemController.generateSignedUrl);

router
  .route('/')
  .post(auth('MENU_CREATE'), MenuItemController.createMenuItem)
  .delete(auth('MENU_DELETE'), validate(menuItemValidation.deleteMenuItems), MenuItemController.deleteMenuItem)
  .put(
    auth('MENU_UPDATE'),
    // storageService.upload.fields([{ name: 'image' }]),
    // validate(menuItemValidation.updateMenuItem),
    MenuItemController.updateMenuItem
  )
  .get(auth('MENU_READ'), MenuItemController.getMenuItem);

router.route('/:storeId').get(auth('MENU_READ'), MenuItemController.menuItemsByRestaurant);
router.route('/:storeId/:category').get(auth('MENU_READ'), MenuItemController.menuItemsByCategory);

module.exports = router;
