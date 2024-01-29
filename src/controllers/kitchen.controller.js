const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { KitchenService } = require('../services');

const createKitchen = catchAsync(async (req, res) => {
  const newKitchen = await KitchenService.createKitchen(req.body);
  res.send(httpStatus.CREATED, newKitchen);
});

const updateKitchen = catchAsync(async (req, res) => {
  const newKitchen = await KitchenService.updateKitchen(req.body);
  res.send(httpStatus.CREATED, newKitchen);
});

const deleteKitchen = catchAsync(async (req, res) => {
  await KitchenService.deleteKitchen(req.query.id);
  const data = {
    status: httpStatus.NO_CONTENT,
    message: 'Deleted Success',
  };
  res.send(data);
});

const getKitchen = catchAsync(async (req, res) => {
  const kitchens = await KitchenService.getKitchen(req.query.store);
  res.send(kitchens);
});

const assignItemsToKitchen = catchAsync(async (req, res) => {
  const kitchens = await KitchenService.assignMenuItemsToKitchen(req.query.itemId, req.body.kitchen);
  res.send(kitchens);
});

const disableKitchenOrChangeKitchen = catchAsync(async (req, res) => {
  const { action } = req.body;
  if (action === 'disable') {
    const kitchens = await KitchenService.KitchenItemsStatusChange(req.query.id, req.body.status);
    res.send(httpStatus.CREATED, kitchens);
  } else {
    const kitchens = await KitchenService.moveKitchenItems(req.query.id, req.body.kitchenId);
    res.send(kitchens);
  }
});

const deleteAllKitchenItems = catchAsync(async (req, res) => {
  await KitchenService.deleteAllKitchenItems(req.query.id);
  const data = {
    status: httpStatus.NO_CONTENT,
    message: 'Deleted Success',
  };
  res.send(data);
});

module.exports = {
  createKitchen,
  deleteKitchen,
  updateKitchen,
  getKitchen,
  disableKitchenOrChangeKitchen,
  deleteAllKitchenItems,
  assignItemsToKitchen,
};
