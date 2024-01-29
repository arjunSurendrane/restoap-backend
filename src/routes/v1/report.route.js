const express = require('express');
const { reportController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/super-admin/:storeId/summary', auth('BASIC'), reportController.storeAdminOrderReportSummary);
router.get('/download/:storeId', auth('BASIC'), reportController.downloadReport);
router.get('/super-admin/:storeId', auth('BASIC'), reportController.storeAdminOrderReport);

module.exports = router;
