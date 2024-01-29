const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { AddOns } = require('../models');
const { deleteImageFromAws } = require('./storage.service');

/**
 * Get AddOn by id
 * @param {ObjectId} id
 * @returns {Promise<AddOns>}
 */
const getAddOnsById = async (id) => {
  return AddOns.findById(id);
};

/**
 * Get addons with array of id
 * @param {*} addOnsIds
 * @returns
 */
const getAddOnsFromArrayOfId = async (addOnsIds) => {
  console.log(addOnsIds);
  return AddOns.find({ _id: { $in: addOnsIds } });
};

/**
 * Create New Menu AddOns
 * @param {Object} addOnObj
 * @returns {Promise<AddOns>}
 */

const createAddOn = async (req) => {
  const image = {};
  if (req.file?.key) {
    // eslint-disable-next-line no-unused-expressions
    (image.name = req.file.key), (image.path = req.file.location);
    req.body.image = image;
  } else {
    req.body.image = image;
  }

  const { name, storeId } = req.body;
  if (req.body.variants?.length > 0) {
    req.body.variants = JSON.parse(req.body.variants);
  }

  const categoryNameSmallCase = name.toLowerCase();
  const duplicate = await AddOns.findOne({ storeId, name: categoryNameSmallCase });
  if (duplicate) {
    if (req.file) {
      await deleteImageFromAws(req?.file?.key);
    }
    throw new ApiError(httpStatus.CONFLICT, 'Item already exist');
  }
  req.body.name = categoryNameSmallCase;
  const response = await AddOns.create(req.body);
  if (!response) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Could not save addOns');
  }
  return response;
};

/**
 * Update Menu AddOns
 * @param {ObjectId} addOnId
 * @param {Object} addOnObj
 * @returns {Promise<AddOns>}
 */
const updateAddOn = async (req) => {
  console.log('req.body', req.body);
  const AddOn = await getAddOnsById(req.query.addOnId);
  if (!AddOn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AddOn not found');
  }
  console.log(AddOn);
  const image = {};
  if (req.file?.key) {
    image.name = req.file.key;
    image.path = req.file.location;
    req.body.image = image;
    await deleteImageFromAws(AddOn?.image?.name);
  } else {
    if (req.body?.image[0] === 'null') {
      req.body.image = {};
      await deleteImageFromAws(AddOn?.image?.name);
    } else {
      req.body.image = AddOn.image;
    }
  }

  const { name, storeId } = req.body;
  console.log('body', req.body);

  if (name && storeId) {
    const categoryNameSmallCase = name.toLowerCase();
    const duplicate = await AddOns.find({ storeId, name: categoryNameSmallCase });
    req.body.name = categoryNameSmallCase;
    console.log('duplicates', duplicate);
    if (duplicate[0]?._id === AddOn.id) {
      await deleteImageFromAws(req?.file?.key);
      throw new ApiError(httpStatus.CONFLICT, 'Item already exist');
    }
  }

  if (req.body.variants) {
    req.body.variants = JSON.parse(req.body.variants);
    console.log('variants', req.body.variants);
  } else {
    req.body.variants = [];
  }
  console.log('req.body', req.body);

  // await deleteImageFromAws(req.file.key);
  Object.assign(AddOn, req.body);
  await AddOn.save();
  return AddOn;
};

/**
 * Delete Menu AddOns
 * @param {ObjectId} addOnId
 * @param {Object} addOnObj
 * @returns {Promise<AddOns>}
 */
const deleteAddOn = async (req) => {
  console.log('addons', req);
  const AddOn = await getAddOnsById(req.query.addOnId);
  console.log('addon', AddOn);
  if (!AddOn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AddOn not found');
  } else if (AddOn.image) {
    await deleteImageFromAws(AddOn.image.name);
  }
  await AddOn.remove();
};

/**
 * Get All AddOns By Store
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<AddOns>}
 */
const getAddOnsByStore = async (filter, options) => {
  console.log(options);
  const allAddOns = await AddOns.paginate(filter, options);
  // console.log('allAddOns', allAddOns);
  return allAddOns;
};

module.exports = {
  getAddOnsById,
  createAddOn,
  updateAddOn,
  deleteAddOn,
  getAddOnsFromArrayOfId,
  getAddOnsByStore,
};
