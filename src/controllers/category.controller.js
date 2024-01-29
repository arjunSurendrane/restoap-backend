const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { categoryService } = require('../services');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

const createCategory = catchAsync(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getCategory = catchAsync(async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.categoryId);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Could not find the category');
  }
  res.status(httpStatus.FOUND).send(category);
});

const getRestaurantMenuCategories = catchAsync(async (req, res) => {
  const filter = pick(req.params, ['store']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate', 'searchValue']);
  const allCategories = await categoryService.getRestaurantMenuCategories(filter, options);
  res.send(allCategories);
});

const updateCategory = catchAsync(async (req, res) => {
  const updatedCategory = await categoryService.updateCategory(req.params.categoryId, req.body);
  res.status(httpStatus.CREATED).send(updatedCategory);
});

const deleteCategory = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.query.categoryId);
  res.status(httpStatus.CREATED).send({ message: 'category deleted succesfully' });
});

module.exports = {
  createCategory,
  updateCategory,
  getCategory,
  getRestaurantMenuCategories,
  deleteCategory,
};
