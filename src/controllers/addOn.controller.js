const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { addOnService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

const createAddOn = catchAsync(async (req, res) => {
  const addOn = await addOnService.createAddOn(req);
  res.status(httpStatus.CREATED).send(addOn);
});

const getAddOn = catchAsync(async (req, res) => {
  const addOn = await addOnService.getAddOnsById(req.params.categoryId);
  if (!addOn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the AddOns');
  }
  res.status(httpStatus.FOUND).send(addOn);
});

const getAddOnsByStore = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['storeId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate', 'storeId']);
  const allAddOns = await addOnService.getAddOnsByStore(filter, options);
  res.send(allAddOns);
});

const updateAddOn = catchAsync(async (req, res) => {
  const updatedAddOn = await addOnService.updateAddOn(req);
  res.status(httpStatus.CREATED).send(updatedAddOn);
});

const deleteAddOn = catchAsync(async (req, res) => {
  await addOnService.deleteAddOn(req);
  res.status(httpStatus.CREATED).send({ message: 'delete addOns' });
});

module.exports = {
  createAddOn,
  updateAddOn,
  getAddOn,
  getAddOnsByStore,
  deleteAddOn,
};
