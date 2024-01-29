const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { storeService, subscriptionService } = require('../services');
const ApiError = require('../utils/ApiError');

const createStore = catchAsync(async (req, res, next) => {
  const { plan, _id, submerchantPaymentGatewayId } = req.user;
  const { planId } = plan;

  const accessToCreate = await subscriptionService.limitUserActivity({
    activityName: 'stores',
    stripeId: planId,
    userId: _id,
    inputCount: 1,
  });

  if (!accessToCreate) {
    return next(new ApiError(403, `You have exceeded the limit. Please upgrade your subscription to create more stores.`));
  }
  req.body.submerchantPaymentGatewayId = submerchantPaymentGatewayId;

  const store = await storeService.createNewStore(req.body);
  res.status(httpStatus.CREATED).send(store);
});

const getStore = catchAsync(async (req, res) => {
  const store = await storeService.getStoreById(req.params.storeId);
  res.send(store);
});

const getStoresByOwner = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['user']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await storeService.getStoresByStoreOwner(filter, options);
  res.send(result);
});

const updateStore = catchAsync(async (req, res) => {
  const store = await storeService.updateStoreById(req.query.storeId, req.body);
  res.send(store);
});

const deleteStore = catchAsync(async (req, res) => {
  await storeService.deleteStoreById(req.query.storeId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateSettings = catchAsync(async (req, res) => {
  const { storeId } = req.params;
  const { isKitchenHaveScreen, parcelCharge, isQrOrderAwailable, isTakeawayAwailable } = req.body;
  const store = await storeService.updateSettings({
    isKitchenHaveScreen,
    parcelCharge,
    isQrOrderAwailable,
    isTakeawayAwailable,
    storeId,
  });
  res.send(store);
});

const updateParcelCharge = catchAsync(async (req, res) => {
  const { storeId } = req.params;
  const { parcelCharge } = req.body;
  const order = await storeService.updateParcelCharge({ storeId, parcelCharge });
  res.send(order);
});

module.exports = {
  createStore,
  getStoresByOwner,
  updateStore,
  deleteStore,
  getStore,
  updateSettings,
  updateParcelCharge,
};
