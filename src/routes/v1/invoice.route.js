const express = require('express');

const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { subsInvoiceValidtion } = require('../../validations');

const { subsInvoiceController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth('BASIC'), validate(subsInvoiceValidtion.getInvoices), subsInvoiceController.getInvoices);

module.exports = router;
