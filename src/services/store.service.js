const httpStatus = require('http-status');
const mongoose = require('mongoose');
const getSymbolFromCurrency = require('currency-symbol-map');
const { Store, DiningCategory, Category, Order, Role, User, Kitchen, Payment } = require('../models');
const { createSystemRole } = require('./role.service');
const { createKitchen } = require('./Kitchen.service');
const ApiError = require('../utils/ApiError');
const { defaultRoles } = require('../utils/defaultRoles');

// const ApiError = require('../utils/ApiError');

/**
 * get store by id
 * @param {ObjectId} id
 * @returns {Promise<Store>}
 */
const getStoreById = async (id) => {
  const store = await Store.findById(id);
  return store;
};

const getUserStoreCount = async(userId)=> Store.find({user:userId}).count()

const getStoreByIdWithAdminData = async (id) => Store.findById(id).populate('user');

const getOrderAndKotNumber = async (storeId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const aggregationPipeline = [
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        createdAt: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
      },
    },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        unwindAndCount: [{ $unwind: '$subOrders' }, { $count: 'count' }],
      },
    },
    {
      $project: {
        orderNo: { $arrayElemAt: ['$totalCount.count', 0] },
        kotNo: { $arrayElemAt: ['$unwindAndCount.count', 0] },
      },
    },
  ];
  return Order.aggregate(aggregationPipeline);
};

const updateStores = async (find, update) => {
  const stores = await Store.updateMany(find, update);
  return stores;
};

/**
 * Create a New store
 * @param {Object} storeBody
 * @returns {Promise<Store>}
 */
const createNewStore = async (storeBody) => {
  console.log({ storeBody });
  console.log(getSymbolFromCurrency(storeBody.currency));
  storeBody.currencySymbol = getSymbolFromCurrency(storeBody.currency);
  const store = await Store.create(storeBody);
  if (store) {
    // eslint-disable-next-line no-restricted-syntax
    for (const role of defaultRoles) {
      role.store = store.id;

      // eslint-disable-next-line no-await-in-loop
      await createSystemRole(role);
    }
    const data = {
      name: 'defaultKitchen',
      store: store._id,
      isDefault: true,
    };
    await createKitchen(data);
  }

  return store;
};
/**
 * Get stores by store owner
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getStoresByStoreOwner = async (filter, options) => {
  const stores = await Store.paginate(filter, options);
  return stores;
};

const getStoreByUserId = async (user) => {
  const store = await Store.find({ user });
  return store;
};

/**
 * update store
 * @param {ObjectId} storeId
 * @param {Object} updateBody
 * @return {Promise<Store>}
 */

const updateStoreById = async (storeId, updateBody) => {
  const { data } = updateBody;
  data.currencySymbol = getSymbolFromCurrency(data.currency);

  const { user, isHeadBranch } = data;
  const storeFound = await getStoreById(storeId);

  if (!storeFound) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Store Not Found');
  }

  if (isHeadBranch) {
    const changeHeadBranch = await Store.findOne({ user, isHeadBranch });
    if (changeHeadBranch) {
      changeHeadBranch.isHeadBranch = false;
      changeHeadBranch.save();
    }
  }
  const store = await Store.findByIdAndUpdate(storeId, { ...data }, { new: true });

  return store;
};

const deleteStoreById = async (storeId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const store = await getStoreById(storeId);

    if (!store) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Store not found');
    }

    const categoryUnderStore = await DiningCategory.findOne({ store: storeId });
    if (categoryUnderStore) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete store. Categories are allocated.');
    }

    const menuCategoryUnderStore = await Category.findOne({ store: storeId });
    if (menuCategoryUnderStore) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Cannot delete store. Menu Categories are allocated.');
    }

    const rolesUnderStore = await Role.find({ store: storeId });
    if (rolesUnderStore.length > 4) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Please delete Custom Roles.');
    }

    await Promise.all([
      Role.deleteMany({ store: storeId }),
      Payment.deleteMany({ storeId }),
      User.deleteMany({ storeId }),
      Kitchen.deleteMany({ store: storeId }),
      Order.deleteMany({ storeId }),
      store.remove(),
    ]);

    await session.commitTransaction();
    session.endSession();

    return store;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

const updateStore = async (storeId, updateBody) => Store.findByIdAndUpdate(storeId, updateBody);

const updateSettings = async ({ isKitchenHaveScreen, parcelCharge, isQrOrderAwailable, isTakeawayAwailable, storeId }) => {
  const store = await updateStore(storeId, {
    $set: { isKitchenHaveScreen, parcelCharge, isQrOrderAwailable, isTakeawayAwailable },
  });
  return store;
};

const updateParcelCharge = async ({ parcelCharge, storeId }) => {
  const store = await updateStore(storeId, { parcelCharge });
  return store;
};

module.exports = {
  createNewStore,
  getUserStoreCount,
  getOrderAndKotNumber,
  updateSettings,
  getStoresByStoreOwner,
  updateParcelCharge,
  getStoreByIdWithAdminData,
  updateStoreById,
  updateStores,
  deleteStoreById,
  getStoreById,
  getStoreByUserId,
};
