const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { diningCategoryService } = require('../services');

const createDiningCategory = catchAsync(async (req, res) => {
  const category = await diningCategoryService.createDiningCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const updateDiningCategory = catchAsync(async (req, res) => {
  const updateCategory = await diningCategoryService.updateDiningCategoryById(req.params.diningCategoryId, req.body);
  res.send(updateCategory);
});

const deleteDiningCategory = catchAsync(async (req, res) => {
  await diningCategoryService.deleteDiningCategoryById(req.params.diningCategoryId);
  res.status(httpStatus.NO_CONTENT).send('Deleted success');
});

const getDiningCategory = catchAsync(async (req, res) => {
  const category = await diningCategoryService.getDiningCategory(req.params.diningCategoryId);
  res.send(category);
});

const getAllDiningCategories = catchAsync(async (req, res) => {
  const categories = await diningCategoryService.AllDiningCategories();
  res.send(categories);
});

const getDiningCategoryByRestaurant = catchAsync(async (req, res) => {
  const categories = await diningCategoryService.getAllDiningCategoryByRestaurant(req.params.storeId);
  res.send(categories);
});

module.exports = {
  createDiningCategory,
  updateDiningCategory,
  deleteDiningCategory,
  getAllDiningCategories,
  getDiningCategory,
  getDiningCategoryByRestaurant,
};
