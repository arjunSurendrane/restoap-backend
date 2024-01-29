const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const { storageService } = require('../../services');

const router = express.Router();
router.route('/AllUsers').get(auth('BASIC'), userController.getAllUserByStoreAdmin);
router
  .route('/')
  .post(auth('BASIC'), storageService.upload.single('avatarUrl'), userController.createUser)
  .get(auth('BASIC'), validate(userValidation.getUsers), userController.getUsers);

router.route('/store').get(auth('BASIC'), userController.getUserByStoreId);
router
  .route('/:userId')
  .get(auth('BASIC'), validate(userValidation.getUser), userController.getUser)
  .put(auth('BASIC'), storageService.upload.single('avatarUrl'), userController.updateUser)
  .delete(auth('BASIC'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;
