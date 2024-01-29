const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { orderService, storeService, tableService, paymentService } = require('../services');
const ApiError = require('../utils/ApiError');

/**
 * Get Order By Store
 * GET /order/store/:{{storeId}}/live?status
 */
const getLiveOrderByStore = catchAsync(async (req, res) => {
  const start = new Date(Date.now());
  const { storeId } = req.params;
  let { status, suborderStatus, orderType } = req.query;
  if (!status) status = { $ne: 'completed' };
  if (!suborderStatus) suborderStatus = { $ne: 'completed' };
  if (!orderType) orderType = { $ne: null };
  const subend = new Date(Date.now());
  const orders = await orderService.getOrderWithStroeid(storeId, status, suborderStatus, orderType);
  const end = new Date(Date.now());
  res.status(200).send(orders);
});

/**
 * Create an order.
 * POST /order
 */
const createOrder = catchAsync(async (req, res, next) => {
  const { user, body } = req;
  const { storeId, tableId, items, addons, orderType } = body;

  // check if store exist or not;
  const getStore = async () => storeService.getStoreById(storeId);

  const getStoreKotAndBillNumber = async () => storeService.getOrderAndKotNumber(storeId);

  // check if table exist or not;
  const getTable = async () => tableService.getTableById(tableId);

  const [store, table, KotAndBillNumber] = await Promise.all([getStore(), getTable(), getStoreKotAndBillNumber()]);
  if (!table || !store) return next(new ApiError(404, 'invalid data'));
const start = new Date()
  // create order
  const order = await orderService.createOrder({ user, orderType, store, table, items, addons, KotAndBillNumber }, next);

  const end = new Date()

  // Send the response.
  res.status(httpStatus.CREATED).json(order);
});

/**
 * Add suborder
 * PATCH /order/:{{orderId}}
 */
const addSuborder = catchAsync(async (req, res, next) => {
  const { user, body } = req;
  const { orderId } = req.params;
  const { storeId, items, addons, orderType } = body;
  const getStore = async () => storeService.getStoreById(storeId);
  const getStoreKotAndBillNumber = async () => storeService.getOrderAndKotNumber(storeId);
  const [store, KotAndBillNumber] = await Promise.all([getStore(), getStoreKotAndBillNumber()]);
  if (!KotAndBillNumber || !store) return next(new ApiError(400, 'invalid data'));
  const order = await orderService.addSubOrders({ user, orderId, store, items, addons, orderType, KotAndBillNumber }, next);
  res.send(order);
});

/**
 * Update order status
 * PATCH /order/:orderId/sub-order/:suborderId
 */
const updateSuborderStatus = catchAsync(async (req, res) => {
  const { orderId, suborderId } = req.params;
  const { status } = req.body;
  const order = await orderService.updateSuborderStatus({ orderId, status, suborderId });
  res.send(order);
});

/**
 * Print Bill
 * PATCH /order/:{{orderId}}/print
 */
const printBill = catchAsync(async (req, res) => {
  const {
    params: { orderId },
    query: { suborderId },
  } = req;
  if (suborderId) {
    await orderService.updateSuborderKotPrintStatus(orderId, suborderId);
  } else {
    await orderService.updateOrder({ _id: orderId }, { isBillPrinted: true });
  }
  res.json({ messge: 'successfully updated' });
});

/**
 * Update Order Payment status
 * PATCH /order/:{{orderId}}/payment
 */
const settlePayment = async (req, res, next) => {
  const { paymentMethod, upi, cash, card, totalAmount, metadata } = req.body;
  const { orderId } = req.params;

  const session = await mongoose.startSession();
  // start transaction
  await session.startTransaction();
  try {
    const order = await orderService.updateOrder(
      { _id: orderId },
      { paymentDetails: { status: 'success', paymentType: 'counter' } },
      session
    );
    const {
      user: { email, firstName },
    } = req;
    if (!order) return next(new ApiError(400, 'Invalid order data'));

    const notCompletedOrder = order.subOrders.find((data) => data.orderStatus !== 'completed');
    if (!notCompletedOrder) await orderService.updateOrder({ _id: orderId }, { orderStatus: 'completed' }, session);

    const payment = await paymentService.addnewPaymentData(
      {
        orderId,
        totalAmount,
        recievedBy: email,
        cashierName: firstName,
        storeId: order.storeId,
        paymentMethod,
        paymentMeta: metadata,
        card,
        upi,
        cash,
      },
      session
    );
    // commit transaction
    await session.commitTransaction();
    res.send(payment);
  } catch (error) {
    // abort transaction
    await session.abortTransaction();
    res.status(500).json({ messge: 'something gone wrong' });
  } finally {
    await session.endSession();
  }
};

/**
 * Update all item status
 * PATCH /order/status
 */
const updateAllItemStatus = catchAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = await orderService.udpateallItemsStatus({ orderId, status });
  // if (order) websocketServer.sendOrderNotification(order);
  res.send(order);
});

/**
 * Update order items status
 * PATCH /order/:orderId/sub-order/:suborderId/items
 */
const updateOrderItemStatus = catchAsync(async (req, res) => {
  const { orderId, suborderId } = req.params;
  const { status, itemIds } = req.body;
  const order = await orderService.updateOrderItemsStatus({ orderId, suborderId, status, itemIds });
  if (status === 'delivered') {
    const updatedSuborder = order.subOrders.find((data) => data._id.toString() === suborderId.toString());
    const notDeliveredOrder = updatedSuborder.orderItems.find((item) => item.itemStatus !== 'delivered');
    if (!notDeliveredOrder) {
      const mainorderData = await orderService.updateSuborderStatus({ orderId, status: 'completed', suborderId });
      const unCompletedOrders = mainorderData.subOrders.find((data) => data.orderStatus !== 'completed');
      const isPaymentCompleted = mainorderData?.paymentDetails?.status == 'success';
      if (!unCompletedOrders && isPaymentCompleted) orderService.updateOrder({ _id: orderId }, { orderStatus: 'completed' });
    }
  }
  res.json(order);
});

/**
 * Get Order Data
 * GET /order/:{{orderId}}
 */
const getOrder = catchAsync(async (req, res) => {
  const start = new Date(Date.now());
  const { orderId } = req.params;
  const order = await orderService.getOrderWithOrderId(orderId);
  const end = new Date(Date.now());
  res.send(order);
});

/**
 * Get main order data based on store
 * GET /order/store/:{{storeId}}
 */
const getMainOrders = catchAsync(async (req, res) => {
  const start = new Date(Date.now());
  const {
    query: { page, limit, status, orderType, search },
    params: { storeId },
  } = req;
  const skip = (Number(page) - 1) * Number(limit) || 0;
  const order = await orderService.getMainOrder({
    storeId,
    limit: Number(limit) || 10,
    skip,
    search,
    status: status || 'completed',
    suborderFilter: orderType || null,
  });
  const end = new Date(Date.now());
  res.send(order);
});

/**
 * Get complete order
 */
const getCompletedOrder = catchAsync(async (req, res) => {
  const queries = req.query;
  const filters = {};
  const date = new Date();
  const { page } = queries;
  const { pageSize } = queries;

  if (req.query.from || req.query.to) {
    const from = new Date(req.query.from);

    const to = new Date(req.query.to);

    filters.createdAt = { $gte: from, $lte: to };
  }

  const result = await orderService.getCompletedOrder(filters, queries, page, pageSize);
  res.send(result);
});

/**
 * Get last 3 previous order
 */
const getLastThreeDaysOrder = catchAsync(async (req, res) => {
  const { storeId } = req.params;
  const results = await orderService.getLastThreeDaysOrder(storeId);
  res.send(results);
});

const totalRevenueOfAllStores = catchAsync(async (req, res) => {
  const revenues = await orderService.calculateTotalRevenueForAllStores(req.query.userId);
  res.send(revenues);
});

const totalRevenueOfStores = catchAsync(async (req, res) => {
  const revenues = await orderService.calculateTotalRevenueOfStores(req.query.storeId, req.query.date);
  res.send(revenues);
});

module.exports = {
  getLiveOrderByStore,
  updateSuborderStatus,
  getOrder,
  addSuborder,
  updateAllItemStatus,
  updateOrderItemStatus,
  settlePayment,
  getMainOrders,
  printBill,
  totalRevenueOfAllStores,
  totalRevenueOfStores,
  getCompletedOrder,
  createOrder,
  getLastThreeDaysOrder,
};
