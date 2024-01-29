const httpStatus = require('http-status');
const { DiningCategory, Store, Table } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Get a DiningCategory
 * @param {ObjectId} id
 * @returns {Promise<DiningCategory>}
 */
const getDiningCategoryById = async (id) => {
  return DiningCategory.findById(id);
};

/**
 * Get All DiningCategory
 * @returns {Promsie<DiningCategory>}
 */
const getAllDiningCategories = async () => {
  return DiningCategory.find({});
};

/**
 * Get All DiningCategory By Restaurant
 * @param {ObjectId} restaurant
 * @returns {Promise<DiningCategory>}
 */
const getDiningCategoryByRestaurant = async (store) => {
  return DiningCategory.find({ store });
};

const storeCheck = async (store) => {
  const storeStatus = await Store.findOne({ _id: store, isActive:true });

  if (!storeStatus) {
    throw new ApiError(httpStatus.CONFLICT, 'Please Active Store');
  }
};
/**
 * Create A New DiningCategory
 * @param {Object} categoryBody
 * @returns {Promise<DiningCategory>}
 */
const createDiningCategory = async (categoryBody) => {
  const { store, name } = categoryBody;

  const nameToSmall = name.toLowerCase();

  await storeCheck(store);
  const checkDupCat = await DiningCategory.findOne({ store, name: nameToSmall });

  if (checkDupCat) {
    throw new ApiError(httpStatus.CONFLICT, 'This dining category already exists in your store');
  }

  categoryBody.name = nameToSmall;
  const newDineCat = await DiningCategory.create(categoryBody);
  return newDineCat;
};

/**
 * Update dining category
 * @param {ObjectId} diningCategoryId
 * @param {Object} updateBody
 * @returns {Promise<DiningCategory>}
 */

const updateDiningCategoryById = async (diningCategoryId, updateBody) => {
  const { store, name } = updateBody;
  const nameToSamll = name.toLowerCase();
  await storeCheck(store);
  const categoryCheck = await Store.findOne({ _id: store });

  if (!categoryCheck) {
    throw new ApiError(httpStatus.CONFLICT, 'No Store found');
  }
  const diningCategory = await getDiningCategoryById(diningCategoryId);
  console.log('diningCategory', diningCategory);
  if (!diningCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'category not found');
  }

  if (diningCategory) {
    const checkDupCat = await DiningCategory.findOne({ store, name: nameToSamll });
    console.log('checkDupCat', typeof diningCategory?._id);
    console.log('checkDupCat', typeof checkDupCat?._id);
    if (checkDupCat?._id.toString() !== diningCategory?._id.toString()) {
      console.log('working');
      throw new ApiError(httpStatus.CONFLICT, 'category already exists');
    }
    console.log('working 2');
    await Table.updateMany({ dineCategory: diningCategory._id }, { active: updateBody.active });

    updateBody.name = nameToSamll;
    Object.assign(diningCategory, updateBody);
    await diningCategory.save();
    return diningCategory;
  }
};

/**
 * Delete dining category by id
 * @param {ObjectId} diningCategoryId
 * @returns {Promise<DiningCategory>}
 */

const deleteDiningCategoryById = async (diningCategoryId) => {
  
  const diningCategory = await getDiningCategoryById(diningCategoryId);
  await storeCheck(diningCategory.store);
  if (!diningCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  const tablesUnderDiningCategory = await Table.find({ dineCategory: diningCategoryId });

  if (tablesUnderDiningCategory.length > 0)
    throw new ApiError(
      httpStatus.METHOD_NOT_ALLOWED,
      'If you wish to remove this dining category will have to remove all the tables coming under this'
    );
  else await diningCategory.remove();

  return diningCategory;
};

/**
 * get single dining category
 * @param {Object} diningCategory
 * @return {Promise<DiningCategory>}
 */

// get a single dining category function
const getDiningCategory = async (diningCategoryId) => {
  await storeCheck(store);
  const diningCategory = await getDiningCategoryById(diningCategoryId);

  if (!diningCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'category not found');
  }

  return diningCategory;
};

/**
 * get all dining category By Restaurant
 * @param {ObjectId} restaurantId
 * @return {Promise<DiningCategory>}
 */

const getAllDiningCategoryByRestaurant = async (restaurant) => {
  // await storeCheck(restaurant);
  const diningCategory = await getDiningCategoryByRestaurant(restaurant);

  if (!diningCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'categories not found');
  }
  return diningCategory;
};

const AllDiningCategories = async () => {
  const diningCategory = await getAllDiningCategories();

  if (!diningCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'categories not found');
  }
  return diningCategory;
};

// exporting the functions
module.exports = {
  createDiningCategory,
  updateDiningCategoryById,
  deleteDiningCategoryById,
  AllDiningCategories,
  getDiningCategory,
  getAllDiningCategoryByRestaurant,
};
