const httpStatus = require('http-status');
const { Table, DiningCategory, Store } = require('../models');
const ApiError = require('../utils/ApiError');

const getTableNameById = async (id) => {
  return Table.findById(id);
};

const getAllTablesNamesByCategory = (restaurantId, dineCategory) => {
  return Table.find({ restaurantId, dineCategory });
};
const getAllTablesNamesByRestaurant = (storeId) => {
  return Table.find({ storeId }).populate('storeId');
};

const storeCheck = async (store) => {
  const storeStatus = await Store.findOne({ _id: store, isActive: true });

  if (!storeStatus) {
    throw new ApiError(httpStatus.CONFLICT, 'Please Active Store');
  }
};


/**
 * Get single table
 * @param {ObjectId} id
 * @returns {Promise<Table>}
 */
const getTableById = async (id) => {
  return Table.findById(id).populate('dineCategory');
};

/**
 * Get All Table in a Restaurant By Category
 * @param {ObjectId} restaurantId
 * @param {ObjectId} dineCategory
 * @returns {Promise<Table>}
 */
const getAllTablesByCategory = (filter, options) => {
  return Table.paginate(filter, options);
};

/**
 * Get All Table By Restaurant
 * @param {ObjectId} restaurantId
 * @returns {Promise<Table>}
 */
const getAllTablesByRestaurant = (filter, options) => {
  return Table.paginate(filter, options);
};

/**
 * Create a New Table
 * @param {Object} tableBody
 * @returns {Promise<Table>}
 */
const createTable = async (tableBody) => {
  const { tables } = tableBody;
  const { storeId } = tables[0];
  await storeCheck(storeId);
  const tableNames = tables.map((val) => val.name.toLowerCase());
  const checkDupTable = await Table.find({
    storeId,
    // dineCategory,
    name: { $in: tableNames },
  });
  if (checkDupTable.length > 0) {
    const conflictingTableName = checkDupTable[0].name;
    throw new ApiError(httpStatus.CONFLICT, `Table Name '${conflictingTableName}' already exists`);
    // throw new ApiError(httpStatus.CONFLICT, 'Table Name Exist',);
  }
  const updatedTables = tables.map((val) => ({
    ...val,
    name: val.name.toLowerCase(),
  }));
  const newTableName = await Table.insertMany(updatedTables);
  return newTableName;
};

const TableNameById = async (tableId) => {
  const tableName = await getTableNameById(tableId);
  if (!tableName) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Table Name Found');
  }
  return tableName;
};

const getTableNamesByCategory = async (restaurantId, dineCategoryId) => {
  const tableNames = await getAllTablesNamesByCategory(restaurantId, dineCategoryId);
  if (!tableNames) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tables Found');
  }
  return tableNames;
};

const getTableNamesByRestaurant = async (storeId) => {
  const tableNames = await getAllTablesNamesByRestaurant(storeId);
  if (!tableNames) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tables Found');
  }
  return tableNames;
};

/**
 * Get Table
 * @param {ObjectId} tableId
 * @returns {Promise<Table>}
 */
const getTable = async (tableId) => {
  const table = await getTableById(tableId);
  if (!table) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Table Name Found');
  }
  return table;
};

/**
 * Get Table By Category
 * @param {ObjectId} restaurantId
 * @param {ObjectId} dineCategoryId
 * @returns {Promise<Table>}
 */
const getTablesByCategory = async (filter, options) => {
  const tables = await getAllTablesByCategory(filter, options);
  if (!tables) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tables Found');
  }
  return tables;
};

/**
 * Get Table By Restaurant
 * @param {ObjectId} restaurantId
 * @returns {Promise<Table>}
 */
const getTablesByRestaurant = async (filter, options) => {
  const tables = await getAllTablesByRestaurant(filter, options);
  if (!tables) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tables Found');
  }
  return tables;
};

const getTableByStoreId = async (storeId) => {
  const tables = await Table.find({ storeId });
  return tables;
};

/**
 * Update Table
 * @param {ObjectId} tableId
 * @param {Object} tableBody
 * @return {Promise<Table>}
 */

const updateTable = async (tableId, tableBody) => {
  const { tables } = tableBody;
  const { storeId, dineCategory, name } = tables[0];
  await storeCheck(storeId);
  const nameToSmallLetter = name.toLowerCase();
  const table = await getTableById(tableId);

  if (!table) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Table Found');
  }

  // dup checking
  if (table) {
    const checkDupTable = await Table.findOne({ storeId, name: nameToSmallLetter });
    if (checkDupTable && checkDupTable?._id.toString() !== table?._id.toString()) {
      throw new ApiError(httpStatus.CONFLICT, 'Table name already exists');
    }
    // }
    const categoryCheck = await DiningCategory.findOne({ store: storeId, _id: dineCategory });

    if (!categoryCheck) {
      throw new ApiError(httpStatus.CONFLICT, 'No category found in this Restaurant');
    }
    // eslint-disable-next-line no-param-reassign
    const data = tables[0];
    data.name = nameToSmallLetter;
    Object.assign(table, data);
    await table.save();
    return table;
  }
};

/**
 * Delete Table
 * @param {ObjectId} tableId
 * @returns {Promise<Table>}
 */
const deleteTable = async (tableId) => {
  const table = await getTableById(tableId);
  await storeCheck(table.storeId);
  if (!table) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Tables Found');
  }
  await table.remove();
  return table;
};

module.exports = {
  createTable,
  getTable,
  getTablesByCategory,
  getTablesByRestaurant,
  getTableNamesByCategory,
  getTableNamesByRestaurant,
  getTableNameById,
  getTableByStoreId,
  TableNameById,
  getTableById,
  updateTable,
  deleteTable,
};
