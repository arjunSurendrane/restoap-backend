const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const roleValidation = require('../../validations/role.validation');
const roleController = require('../../controllers/role.controller');
// const { roleService } = require('../../services');

const router = express.Router();
router
  .route('/')
  .post(validate(roleValidation.createSystemRole), roleController.createSystemRole)
  .put(auth('USER_UPDATE'), roleController.updateRole)
  .get(auth('USER_READ'), validate(roleValidation.getAllRolesByStore), roleController.getAllRolesByStore)
  // eslint-disable-next-line
  .delete(auth('USER_DELETE'), roleController.deleteRole);

router
  .route('/assign-permission')
  .put(auth('USER_UPDATE'), validate(roleValidation.assignPermissionToRole), roleController.assignPermissionToRole);

router.route('/roleId').get(auth('USER_READ'), validate(roleValidation.getRole), roleController.getRoleByRoleId);

module.exports = router;
