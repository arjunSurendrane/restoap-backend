const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Category, MenuItem } = require('../models');

/**
 * Get Category by id
 * @param {ObjectId} id
 * @returns {Promise<Category>}
 */
const getCategoryById = async (id) => {
  console.log('idsdfs', id);
  const category = await Category.findOne({ _id: id });
  return category;
};

/**
 * Create New Menu Category
 * @param {Object} categoryObj
 * @returns {Promise<Category>}
 */
const createCategory = async (categoryObj) => {
  const { name, store } = categoryObj;
  const categoryNameSmallCase = name.toLowerCase().trim();
  const duplicate = await Category.findOne({ store, name: categoryNameSmallCase });
  console.log(duplicate);
  if (duplicate) {
    throw new ApiError(httpStatus.CONFLICT, 'Item already exist');
  }
  categoryObj.name = categoryNameSmallCase;
  const response = await Category.create(categoryObj);
  if (!response) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not save category');
  }
  return response;
};

/**
 * Update Menu Category
 * @param {Object} categoryId
 * @param {Object} categoryObj
 * @returns {Promise<Category>}
 */
const updateCategory = async (categoryId, categoryObj) => {
  console.log(categoryId, categoryObj);
  const category = await getCategoryById(categoryId);
  console.log(category);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const categoryNameSmallCase = categoryObj.name.toLowerCase().trim();
  const duplicate = await Category.findOne({ store: categoryObj.store, name: categoryNameSmallCase });
  console.log(duplicate);
  if (duplicate) {
    if (category.active === categoryObj.active) {
      throw new ApiError(httpStatus.CONFLICT, 'Item already exist');
    }
  }
  await MenuItem.updateMany({ category: categoryId }, { Active: categoryObj.active });
  categoryObj.name = categoryNameSmallCase;
  Object.assign(category, categoryObj);
  await category.save();
  return category;
};

/**
 * Get All categories of store
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Category>}
 */
const getRestaurantMenuCategories = async (filter, options) => {
  if (options.searchValue) {
    // eslint-disable-next-line no-param-reassign
    filter = [
      {
        name: { $regex: options.searchValue, $options: 'i' },
      },
    ];
  }
  // console.log('filter ,oprions', filter, options);
  const allCategories = await Category.paginate(filter, options);
  // console.log('all categories', allCategories);
  return allCategories;
};

/**
 * delete category
 * @param {ObjectId} categoryId
 * @returns {Promise<Category>}
 */
const deleteCategory = async (categoryId) => {
  const category = await getCategoryById(categoryId);
  console.log('category', category);
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category Not Found');
  }

  const menuItem = await MenuItem.findOne({ category: categoryId });
  if (menuItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Cant able to delete this Category Items are allocated');
  }
  console.log('allCategories', category);
  await category.remove();
  // return allCategories;
};

module.exports = {
  deleteCategory,
  createCategory,
  updateCategory,
  getCategoryById,
  getRestaurantMenuCategories,
};
