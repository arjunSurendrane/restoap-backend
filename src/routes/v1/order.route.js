/* eslint-disable prettier/prettier */
const express = require('express');
const orderController = require('../../controllers/order.controller');
const validate = require('../../middlewares/validate');
const { orderValidation } = require('../../validations');
const auth = require('../../middlewares/auth');

const router = express.Router();
router.route('/get-mystore-revenue').get(auth('BASIC'), orderController.totalRevenueOfStores);
router.route('/get-all-revenue').get(auth('BASIC'), orderController.totalRevenueOfAllStores);
router.route('/').post(auth('BASIC'), validate(orderValidation.createOrder), orderController.createOrder);

router
  .route('/:orderId')
  .patch(auth('BASIC'), validate(orderValidation.addSubOrder), orderController.addSuborder)
  .get(auth('BASIC'), validate(orderValidation.getOrder), orderController.getOrder);

router
  .route('/:orderId/sub-order/:suborderId')
  .patch(auth('BASIC'), validate(orderValidation.udpateOrderStatus), orderController.updateSuborderStatus);

router
  .route('/:orderId/sub-order/:suborderId/items')
  .patch(auth('BASIC'), validate(orderValidation.updateOrderItemStatus), orderController.updateOrderItemStatus);

router.route('/:orderId/print').patch(auth('BASIC'), orderController.printBill);

router
  .route('/:orderId/payment')
  .patch(auth('BASIC'), validate(orderValidation.settlePayment), orderController.settlePayment);

router
  .route('/store/:storeId/live')
  .get(auth('BASIC'), validate(orderValidation.getOrders), orderController.getLiveOrderByStore);
router.route('/store/:storeId').get(auth('BASIC'), orderController.getMainOrders);
router.route('/store/:storeId/order-history').get(orderController.getCompletedOrder);
router.route('/store/order-history').get(orderController.getCompletedOrder);
router.route('/store/:storeId/previous-order').get(orderController.getLastThreeDaysOrder);
router.route('/:orderId/update-all').patch(orderController.updateAllItemStatus);

module.exports = router;
