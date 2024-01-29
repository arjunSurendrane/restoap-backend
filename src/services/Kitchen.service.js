const httpStatus = require('http-status');
const { Kitchen, MenuItem } = require('../models');
const ApiError = require('../utils/ApiError');

const createKitchen = async (body) => {
  const { store, name } = body;
  const nameToSmallCase = name.toLowerCase();
  const dup = await Kitchen.findOne({ store, name: nameToSmallCase });
  if (dup) {
    throw new ApiError(httpStatus.CONFLICT, 'Kitchen Already Exist');
  }
  body.name = nameToSmallCase;
  const kitchen = await Kitchen.create(body);
  return kitchen;
};

const updateKitchen = async (body) => {
  console.log(body);
  const { store, name, id } = body;
  const nameToSmallCase = name?.toLowerCase();

  if (name) {
    const dup = await Kitchen.find({ store, name: nameToSmallCase });
    console.log(dup);
    // if (dup.length > 1) {
    //   throw new ApiError(httpStatus.CONFLICT, 'Kitchen Already Exist');
    // }
  }

  if (body.isActive === false) {
    const menuItems = await MenuItem.find({ kitchen: id });
    if (menuItems.length > 0) {
      throw new ApiError(httpStatus.CONFLICT, 'Aleardy Items are allocated,first move it or  disable permanently');
    }
  } else {
    await MenuItem.updateMany({ kitchen: id }, { $set: { Active: true } });
  }

  body.name = nameToSmallCase;
  const kitchen = await Kitchen.findByIdAndUpdate(id, body, { new: true });
  return kitchen;
};

const KitchenItemsStatusChange = async (id, status) => {
  const kitchen = await Kitchen.findByIdAndUpdate(id, { isActive: status });
  if (kitchen) {
    const menuItems = await MenuItem.updateMany({ kitchen: id }, { $set: { Active: status } });
    return menuItems;
  }
};

const moveKitchenItems = async (id, kitchenId) => {
  const menuItems = await MenuItem.updateMany({ kitchen: id }, { $set: { kitchen: kitchenId } });
  return menuItems;
};

const assignMenuItemsToKitchen = async (itemId, kitchen) => {
  await MenuItem.findByIdAndUpdate(itemId, { $set: { kitchen: kitchen } });
};

const deleteKitchen = async (id) => {
  const kitchen = await Kitchen.findOne({ _id: id });

  if (!kitchen) {
    throw new ApiError(httpStatus.CONFLICT, 'No Kitchen found');
  }

  const menuItems = await MenuItem.find({ kitchen: id });
  console.log(menuItems);
  if (menuItems.length > 0) {
    // const menuItems = await MenuItem.updateMany({ store: id }, { $set: { kitchen: id } });
    throw new ApiError(httpStatus.CONFLICT, 'Items are Exist please move the items to other kitchen');
    // MenuItem.updateMany({})
  }
  await kitchen.remove();
};

const deleteAllKitchenItems = async (id, kitchenId) => {
  const kitchen = await Kitchen.findOne({ _id: id });

  if (kitchen) {
    await kitchen.remove();
    const menuItems = await MenuItem.deleteMany({ kitchen: id });
    return menuItems;
  }
};

const getKitchen = async (store) => {
  const kitchen = await Kitchen.find({ store }).sort({ createdAt: -1 });
  if (!kitchen) {
    throw new ApiError(httpStatus.CONFLICT, 'No Kitchen found');
  }
  return kitchen;
};

module.exports = {
  createKitchen,
  updateKitchen,
  getKitchen,
  deleteKitchen,
  KitchenItemsStatusChange,
  deleteAllKitchenItems,
  moveKitchenItems,
  assignMenuItemsToKitchen,
};
