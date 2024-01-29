const express = require('express');

const { subscriberController } = require('../../../controllers/systemAdmin');

const router = express.Router();

router.route('/').get(subscriberController.getSubscriber);

module.exports = router;
