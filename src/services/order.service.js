/* eslint-disable no-return-await */
// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Order, Store, User } = require('../models');
const { findOneAndUpdate } = require('../models/token.model');
const { getMenuItemFromArrayofId } = require('./menuItem.service');
const { getAddOnsFromArrayOfId } = require('./addOns.service');
const { getTableById } = require('./table.service');
const ApiError = require('../utils/ApiError');
const { orderService } = require('.');

/**
 * Get Orders By Store
 * @param {ObjectId} storeId
 * @return {Promise<Order>}
 */
const getOrdersByStore = async (storeId) => {
  const Orders = await Order.find({ store: storeId });
  return Orders;
};

const getOrder = async (find) => {
  return await Order.findOne(find);
};

const getMainOrder = async ({ status, limit, skip, storeId, suborderFilter, search }) => {
  let tableNo;
  if (suborderFilter === 'take_away') {
    suborderFilter = {
      $elemMatch: { orderType: 'take_away' },
    };
  } else {
    suborderFilter = {
      $elemMatch: { orderType: { $ne: null } },
    };
  }
  if (!search) {
    tableNo = {
      $ne: null,
    };
  } else {
    tableNo = {
      $regex: new RegExp(`^${search}`, 'i'),
    };
  }
  const [orders, totalCount] = await Promise.all([
    Order.find({ storeId, orderStatus: status, subOrders: suborderFilter, tableNo })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip),
    Order.countDocuments({ storeId, orderStatus: status, subOrders: suborderFilter, tableNo }),
  ]);
  return { orders, totalCount };
};

/**
 * Get order with storeid.
 * @param {String} store
 * @param {String} orderStatus
 */
const getOrderWithStroeid = async (store, orderStatus, suborderStatus, orderType, kitchenName) => {
  const aggregationPipeline = [
    {
      $unwind: '$subOrders',
    },
    {
      $match: {
        storeId: mongoose.Types.ObjectId(`${store}`),
        orderStatus,
        'subOrders.orderStatus': suborderStatus,
        'subOrders.orderType': orderType,
      },
    },
    {
      $sort: {
        'subOrders.createdAt': -1,
      },
    },
  ];
  const order = await Order.aggregate(aggregationPipeline);
  return order;
};

const udpateOrderPaymentStatus = async (orderId, paymentMethod) =>
  Order.findByIdAndUpdate(orderId, { paymentType: paymentMethod, payment: { status: 'success' }, orderStatus: 'completed' });

/**
 * Update Order using order id
 */
const updateOrderbyId = async (orderId, updatedBody) => {
  return Order.findByIdAndUpdate(orderId, updatedBody, { new: true });
};

/**
 * Get order with orderid
 * @param {String} orderid
 * @returns
 */
const getOrderWithOrderId = async (orderid) => {
  return Order.findById(orderid);
};

/**
 * Update order
 */
const updateOrder = async (find, update, session) => {
  if (session) return Order.findOneAndUpdate(find, update, { new: true, session });
  return Order.findOneAndUpdate(find, update, { new: true });
};

const updateSuborderKotPrintStatus = async (orderId, suborderId) => {
  return await updateOrder({ _id: orderId, 'subOrder._id': suborderId }, { $set: { 'subOrders.$.isKotPrinted': true } });
};
/**
 * Update Order Status
 * @returns
 */
const updateSuborderStatus = async ({ orderId, status, suborderId }) => {
  return await updateOrder({ _id: orderId, 'subOrders._id': suborderId }, { $set: { 'subOrders.$.orderStatus': status } });
};

/**
 * Update order items status
 */
const updateOrderItemsStatus = async ({ orderId, itemIds, status, suborderId }) => {
  const updateOrderData = await Order.findOneAndUpdate(
    {
      _id: orderId,
      'subOrders._id': suborderId,
      'subOrders.orderItems._id': { $in: itemIds },
    },
    {
      $set: {
        'subOrders.$[subOrder].orderItems.$[item].itemStatus': status,
      },
    },
    {
      arrayFilters: [{ 'subOrder._id': suborderId }, { 'item._id': { $in: itemIds } }],
      new: true,
    }
  );

  return updateOrderData;
};

/**
 * Update all item status
 * @returns
 */
const udpateallItemsStatus = async ({ orderId, status }) => {
  let updatedOrder;
  if (status === 'printed') {
    const order = await updateOrder({ _id: orderId }, { $set: { 'items.$[].isPrinted': true } });
    return order;
  }
  if (status === 'preparing') {
    const order = await getOrderWithOrderId(orderId);
    const result = order?.items.map((item) => {
      if (item.status === 'open') item.status = 'preparing';
      return item;
    });
    updatedOrder = await updateOrderbyId(orderId, { $set: { items: result } });
  } else {
    updatedOrder = await updateOrder({ _id: orderId }, { $set: { 'items.$[].status': status } });
  }
  return updatedOrder;
};

const calculateTotalRevenueOfStores = async (storeId, date) => {
  try {
    let startDate;
    let endDate;
    if (date?.from || date?.to) {
      startDate = new Date(date.from);
      endDate = new Date(date.to);
    }
    // const totalOrders = await Order.countDocuments({ storeId: storeId, orderStatus: 'completed' });

    const totalRevenueByStore =
      //  [
      [
        {
          $match: {
            storeId: mongoose.Types.ObjectId(storeId),
            orderStatus: 'completed',
          },
        },
        {
          $facet: {
            totalMainOrder: [{ $count: 'count' }],
            totalOrderAmount: [
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: '$finalBillAmount' },
                },
              },
            ],
            unwindAndCount: [
              { $unwind: '$subOrders' },
              {
                $group: {
                  _id: '$subOrders.orderType',
                  totalAmount: { $sum: '$subOrders.subordersTotalPrice' },
                  totalCount: { $sum: 1 },
                },
              },
            ],
          },
        },
        {
          $unwind: '$totalMainOrder',
        },
      ];

    // {
    //   $group: {
    //     _id: '$order_type',
    //     totalAmount: { $sum: '$totalAmount' },
    //     orderCount: { $sum: 1 },
    //     data: { $push: '$$ROOT' },
    //   },
    // },
    // {
    //   $project: {
    //     totalAmount: 1,
    //     orderCount: 1,
    //     'data.store': 1,
    //     'data._id': 1,
    //   },
    // },
    // ];

    if (startDate && endDate) {
      totalRevenueByStore[0].$match.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    const totalRevenue = await Order.aggregate(totalRevenueByStore).exec();
    const totalEmployees = await User.aggregate([
      {
        $match: {
          storeId: mongoose.Types.ObjectId(storeId),
        },
      },
      {
        $group: {
          _id: null, // Group by null to get the total count without any grouping
          sum: { $sum: 1 },
        },
      },
    ]);
    // Log intermediate results
    if (totalRevenue) {
      totalRevenue.push({ Employees: totalEmployees[0]?.sum });
    }

    return totalRevenue;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const calculateTotalRevenueForAllStores = async (userId) => {
  try {
    const storeIds = await Store.find({ user: userId });

    const newStoreIds = storeIds.map((data) => mongoose.Types.ObjectId(data.id));

    const totalRevenueByStore = await Order.aggregate([
      {
        $match: {
          storeId: { $in: newStoreIds },
          orderStatus: 'completed',
        },
      },
      {
        $facet: {
          totalMainOrder: [{ $count: 'count' }],
          totalOrderAmount: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$finalBillAmount' },
              },
            },
          ],
          unwindAndCount: [
            { $unwind: '$subOrders' },
            {
              $group: {
                _id: '$subOrders.orderType',
                totalAmount: { $sum: '$subOrders.subordersTotalPrice' },
                totalCount: { $sum: 1 },
              },
            },
          ],
        },
      },
      {
        $unwind: '$totalMainOrder',
      },
    ]).exec();
    const totalEmployees = await User.aggregate([
      {
        $match: {
          storeId: { $in: newStoreIds },
        },
      },
      {
        $group: {
          _id: null, // Group by null to get the total count without any grouping
          sum: { $sum: 1 },
        },
      },
    ]);
    if (totalEmployees) {
      totalRevenueByStore.push({ Employees: totalEmployees[0]?.sum });
    }

    // const result = await Promise.all(
    //   totalRevenueByStore.map(async ({ _id, totalAmount }) => {
    //     const storeInfo = await Store.findById(_id).exec();
    //     return {
    //       storeId: _id,
    //       storeName: storeInfo ? storeInfo.name : 'Unknown Store', // Replace with your store name field
    //       totalRevenue: totalAmount, // Use totalAmount here
    //     };
    //   })
    // );

    return totalRevenueByStore;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

/**
 * Get Order  by store
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const getCompletedOrder = async (filters, queries, page, pageSize) => {
  const aggregationPipeline = [];

  if (filters && filters.createdAt) {
    aggregationPipeline.push({
      $match: {
        $and: [filters, { orderStatus: 'completed' }, { store: mongoose.Types.ObjectId(queries.store) }],
      },
    });
  }
  const skip = (page - 1) * pageSize;

  aggregationPipeline.push({ $skip: skip }, { $limit: Number(pageSize) });

  try {
    const order = await Order.aggregate(aggregationPipeline);

    // Uncomment the next line if you want to paginate the results
    return order; // You might want to return the result here
  } catch (error) {
    console.error('Error:', error);
    throw error; // Handle the error as needed
  }
};

/**
 * get last 3 days previous order
 */

const getLastThreeDaysOrder = async (storeId) => {
  const order = await Order.find({
    storeId: storeId,
    orderStatus: 'completed',
    createdAt: { $gte: new Date(new Date().getTime() - 3 * 60 * 60 * 24 * 1000) },
    orderStatus: 'completed',
  }).sort({ createdAt: -1 });
  return order;
};

/**
 * get not completed orders
 */
const getNotCompletedOrderByUserId = async (data) => {
  const order = await Order.findOne(data);
  return order;
};

/**
 * Find the totalAmount of product
 */
const findProductTotalAmount = async ({ orderItems, productIds, items, storeId }, next) => {
  // If no product IDs are provided, return default values.
  if (!productIds?.length) {
    return { productTotalAmount: 0, totalDiscount: 0, totalAmountWithTax: 0 };
  }

  // Retrieve menu item data from the database using the provided IDs.
  const products = await getMenuItemFromArrayofId(productIds);

  // If no matching menu items are found in the database, throw an error.
  if (!products.length) {
    throw next(new ApiError(400, 'Menu items not found. Please choose different ones.'));
  }

  // Initialize variables to track total amount with tax and total discount.
  let totalAmountWithTax = 0;
  let totalDiscount = 0;

  // Calculate the total amount for menu items using reduce.
  const productTotalAmount = items.reduce((sum, item, index) => {
    // Find the selected menu item based on item ID.
    const product = products.find((data) => item?.itemId == data?._id);

    // If the menu item is not available in the selected store, throw an error.
    if (product.storeId[0].toString() !== storeId.toString()) {
      throw next(new ApiError(400, `${product.name} is not available in the store.`));
    }

    // If the item is not found, skip it.
    if (!item) return sum;

    // Initialize an empty object in the orderItems array for this item.
    orderItems[index] = {};

    // Populate order item data for this item.
    orderItems[index].name = product.name;
    orderItems[index].itemId = product._id;
    orderItems[index].quantity = item.quantity || 1;
    orderItems[index].note = item.note || '';

    // Check if there is a variant selected for this item.
    const variantName = item.variant || null;

    // If a variant is selected, find and assign its details.
    if (variantName) {
      const variant = product.variants.find((data) => data.name === variantName);

      // If the variant is not found, throw an error.
      if (!variant) {
        throw next(new ApiError(400, `${product.name} does not have ${variantName} variant`));
      }

      // Assign variant details to the order item.
      orderItems[index].variant = {
        variantName,
        price: variant.offerPrice || variant.price,
      };

      // Update the menu item's price with the variant price.
      product.price = variant.price;
      product.offerPrice = variant.offerPrice;
    }

    // Assign base and final prices for the item.
    orderItems[index].basePrice = product.price;
    orderItems[index].offerPrice = product.offerPrice;
    const itemDiscount = product.price - product.offerPrice || 0;
    const total = product.offerPrice || product.price;
    const quantity = orderItems[index].quantity;
    orderItems[index].itemTotalDiscount = (itemDiscount || 0) * quantity;
    orderItems[index].finalPrice = total * quantity;
    orderItems[index].isVeg = product.foodCategory === 'Veg';
    orderItems[index].kitchen = product.kitchen?._id;
    orderItems[index].kitchenName = product.kitchen?.name;
    orderItems[index].categoryDetails = { category: product.categoryName };

    // Calculate total discount and total amount with tax.
    totalDiscount += orderItems[index].itemTotalDiscount;
    if (product.taxInclude) {
      totalAmountWithTax += orderItems[index].finalPrice;
    }

    // Accumulate the final price to the sum.
    return sum + orderItems[index].finalPrice;
  }, 0);

  return { productTotalAmount, totalDiscount, totalAmountWithTax };
};

/**
 * find addons total amount
 */
const findAddOnsTotalAmount = async ({ addonsData, addons, addonsIds }, next) => {
  // If no addons are selected, return 0 as the total amount.
  if (!addons?.length) return 0;

  // Retrieve addon data from the database using the provided addon IDs.
  const addonsDataFromdb = await getAddOnsFromArrayOfId(addonsIds);

  // If no matching addons are found in the database, throw an error.
  if (!addonsDataFromdb.length) {
    throw next(new ApiError(400, 'Addons not found. Please choose different ones.'));
  }

  // Calculate the total amount for addons using reduce.
  const addOnsTotalAmount = addonsDataFromdb.reduce((sum, addon, index) => {
    // Find the selected addon based on addon ID.
    const item = addons.find((data) => data?.addonId == addon.id);

    // If the addon is not found, skip it.
    if (!item) return sum;

    // Initialize an empty object in the addonsData array for this addon.
    addonsData[index] = {};

    // Populate addon data for this addon.
    addonsData[index].addonId = addon._id;
    addonsData[index].quantity = item.quantity || 1;
    addonsData[index].note = item.note || '';
    addonsData[index].name = addon.name;

    // Check if there is a variant selected for this addon.
    const variantName = item.variant || null;

    // If a variant is selected, find and assign its details.
    if (variantName) {
      const variant = addon.variants.find((data) => data.name === variantName);

      // If the variant is not found, throw an error.
      if (!variant) {
        throw next(new ApiError(400, `${addon.name} does not have the ${variantName} variant`));
      }

      // Assign variant details to the addon data.
      addonsData[index].variant = {
        variantName,
        price: variant.price,
      };

      // Update the addon's price with the variant price.
      addon.price = variant.price;
    }

    // Assign base and final prices for the addon.
    addonsData[index].basePrice = addon.price;
    addonsData[index].finalPrice = addon.price * addonsData[index].quantity;

    // Accumulate the final price to the sum.
    return sum + addonsData[index].finalPrice;
  }, 0);

  return addOnsTotalAmount;
};

const calculateAdditionalCharge = (amount, diningCategoryAdditionalCharge = 0) => {
  const percentage = diningCategoryAdditionalCharge / 100;
  return amount * percentage;
};

const calculateTax = (amount, taxIncludedItemAmount = 0, taxRate = 0) => {
  const percentage = taxRate / 100;
  const amountWithoutTaxIncludedItem = amount - taxIncludedItemAmount;
  return amountWithoutTaxIncludedItem * percentage;
};

const calculateParcelCharge = (amount, parcelCharge = 0, orderType, mainOrderParcelCharge = 0) => {
  if (orderType !== 'take_away') {
    return 0;
  }
  const percentage = parcelCharge / 100;
  const newSuborderParcelCharge = amount * percentage;
  return newSuborderParcelCharge + mainOrderParcelCharge;
};

const calculateTotalOrderAmount = (amount, parcelCharge = 0, tax = 0, additionalCharge = 0) => {
  return amount + parcelCharge + tax + additionalCharge;
};

/**
 * Create Order
 */
const createOrder = async (
  { user, store, table, items, addons, isSelfOrder = false, orderType = 'dining', KotAndBillNumber },
  next
) => {
  // Create an array of all item and addon IDs to retrieve corresponding data.
  const productIds = items?.map((data) => data?.itemId);
  const addonsIds = addons?.map((data) => data?.addonId);

  // Initialize arrays to store order items and addons.
  const orderItems = [];
  const addonsData = [];

  // Execute both processes in parallel: find productTotal, addOnsTotal, and populate orderItems and addonsData arrays.
  const [totalMenuitemsAmount] = await Promise.all([
    findProductTotalAmount({ orderItems, productIds, items, storeId: store._id }, next),
  ]);

  // If both orderItems and addonsData arrays are empty, it means there is no data, so send an error response.
  if (!orderItems.length) {
    throw next(new ApiError(400, 'Product not found.'));
  }

  const dateObject = new Date(Date.now());
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const day = dateObject.getDate();

  // Create a KOT (Kitchen Order Ticket) number.
  const kotNumber =
    `KOT-${month}${day}` + (((KotAndBillNumber[0].kotNo / 10000 || 1) + 1).toFixed(4).split('.')[1] || '0000');

  const isKitchenHaveScreen = store.isKitchenHaveScreen;

  // Create a sub-order object.
  const suborder = {
    kotNumber,
    orderStatus: isKitchenHaveScreen ? 'verified' : 'accepted',
    addons: addonsData,
    orderItems,
    orderType,
    waiterId: user._id,
    waiterName: user.firstName,
    createdAt: new Date(Date.now()),
    totalAppliedDiscount: totalMenuitemsAmount.totalDiscount,
    subordersTotalPrice: totalMenuitemsAmount.productTotalAmount,
    isSelfOrder,
  };

  // Destructure the dineCategory.
  const { dineCategory } = table;

  const diningCategoryAdditionalCharge = dineCategory.additionalCharge;
  const additionalCharge = calculateAdditionalCharge(suborder.subordersTotalPrice, diningCategoryAdditionalCharge);
  const taxRate = store.taxRate;
  const tax = calculateTax(suborder.subordersTotalPrice, totalMenuitemsAmount.totalAmountWithTax, taxRate);
  const parcelChargeInPercentage = store.parcelCharge;
  const parcelCharge = calculateParcelCharge(suborder.subordersTotalPrice, parcelChargeInPercentage, orderType);
  const totalBillAmount = calculateTotalOrderAmount(suborder.subordersTotalPrice, parcelCharge, tax, additionalCharge);

  const finalBillAmount = totalBillAmount.toFixed(0);
  const roundoffAmount = finalBillAmount - totalBillAmount;
  // const roundoffFixedValue = roundoffAmount.toFixed(2);

  // Extract the first two letters of the store name to create an order number prefix.
  const prefix = store.name.slice(0, 2).toUpperCase();
  // Save the order data to the database and return the result.
  const mainOrder = await Order.create({
    charges: {
      tax: tax.toFixed(2),
      additionalCharge: {
        name: dineCategory.name,
        amount: additionalCharge.toFixed(2),
        percentage: diningCategoryAdditionalCharge || 0,
      },
      appliedDiscount: suborder.totalAppliedDiscount,
      taxIncludeItemTotalPrice: totalMenuitemsAmount.totalAmountWithTax,
      parcelCharge: parcelCharge.toFixed(2),
    },
    orderNumber: `${day}${month}` + ((KotAndBillNumber[0].orderNo / 1000 + 1 || 1) + 1).toFixed(3).split('.')[1],
    storeId: store._id,
    storeName: store.name,
    tableNo: table.name,
    tableId: table._id,
    subtotalBillAmount: suborder.subordersTotalPrice,
    grossAmount: totalBillAmount.toFixed(2),
    roundoffAmount: Math.abs(roundoffAmount.toFixed(2)),
    finalBillAmount,
    currency: store.currency,
    subOrders: [suborder],
  });
  const kitchenGroupedItems = suborder.orderItems.reduce((result, item) => {
    (result[item.kitchenName] = result[item.kitchenName] || []).push(item);
    return result;
  }, {});

  return { mainOrder, suborder: { kitchenGroupedItems, ...suborder } };
};

/**
 * Add suborders
 */
const addSubOrders = async (
  { orderId, user, store, items, addons, isSelfOrder = false, orderType = 'dining', KotAndBillNumber },
  next
) => {
  // Extract item and addon IDs from the provided data.
  const productIds = items?.map((data) => data?.itemId);
  const addonsIds = addons?.map((data) => data?.addonId);

  // Initialize arrays to store order items and addons.
  const orderItems = [];
  const addonsData = [];

  // Function to fetch the main order based on orderId.
  const getMainOrder = () => getOrderWithOrderId(orderId);

  // Execute multiple processes in parallel using Promise.all.
  const [totalMenuitemsAmount, totalAddonsAmount, mainOrder] = await Promise.all([
    // Calculate total amount for menu items.
    findProductTotalAmount({ orderItems, productIds, items, storeId: store._id }, next),

    // Calculate total amount for addons.
    findAddOnsTotalAmount({ addonsIds, addons, addonsData }, next),

    // Fetch the main order.
    getMainOrder(),
  ]);

  // If there are no order items or addons, throw an error.
  if (!orderItems.length && !addonsData.length) {
    throw next(new ApiError(400, 'Products do not exist.'));
  }

  // If the mainOrder is not found, throw an error.
  if (!mainOrder) {
    throw next(new ApiError(400, 'Please choose the correct order since there is no other way.'));
  }

  if (mainOrder.paymentDetails && mainOrder.paymentDetails.status) {
    throw next(new ApiError(400, 'This order already settled'));
  }

  // Create a KOT (Kitchen Order Ticket) number.
  const dateObject = new Date(Date.now());
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const day = dateObject.getDate();

  // Create a KOT (Kitchen Order Ticket) number.
  const kotNumber =
    `KOT-${month}${day}` + (((KotAndBillNumber[0].kotNo / 10000 || 1) + 1).toFixed(4).split('.')[1] || '0000');

  const isKitchenHaveScreen = store.isKitchenHaveScreen;

  // Create the suborder object.

  // const isKitchenHaveScreen = store.isKitchenHaveScreen;

  const suborder = {
    kotNumber,
    orderStatus: isKitchenHaveScreen ? 'verified' : 'accepted',
    orderItems,
    orderType,
    waiterId: user._id,
    waiterName: user.firstName,
    createdAt: new Date(Date.now()),
    totalAppliedDiscount: totalMenuitemsAmount.totalDiscount,
    subordersTotalPrice: totalMenuitemsAmount.productTotalAmount,
    isSelfOrder,
  };

  // Calculate subtotal bill amount by adding the main order's subtotal and suborder's total.
  const subtotalBillAmount = mainOrder.subtotalBillAmount + suborder.subordersTotalPrice;

  // Extract charges and discounts from the main order.
  const {
    charges: {
      tax: mainOrderTax,
      additionalCharge: { amount, percentage: additionalChargePercentage, name: additionalChargeName },
      appliedDiscount,
      taxIncludeItemTotalPrice,
      parcelCharge: mainOrderParcelCharge,
    },
  } = mainOrder;

  const additionalCharge = calculateAdditionalCharge(subtotalBillAmount, additionalChargePercentage);
  const taxIncludedItemAmount = taxIncludeItemTotalPrice + totalMenuitemsAmount.totalAmountWithTax;
  const taxRate = store.taxRate;
  const tax = calculateTax(subtotalBillAmount, taxIncludedItemAmount, taxRate);
  const parcelChargeInPercentage = store.parcelCharge;
  const parcelCharge = calculateParcelCharge(
    suborder.subordersTotalPrice,
    parcelChargeInPercentage,
    orderType,
    mainOrderParcelCharge
  );
  const totalBillAmount = calculateTotalOrderAmount(subtotalBillAmount, parcelCharge, tax, additionalCharge);

  // Calculate the total discount by summing applied discounts from both mainOrder and suborder.
  const discount = (appliedDiscount || 0) + suborder.totalAppliedDiscount;

  // Construct the charges object with tax, appliedDiscount, and additionalCharge.
  const charges = {
    tax: tax.toFixed(2),
    appliedDiscount: discount,
    taxIncludeItemTotalPrice: taxIncludedItemAmount,
    additionalCharge: {
      amount: additionalCharge.toFixed(2),
      percentage: additionalChargePercentage,
      name: additionalChargeName,
    },
    parcelCharge: parcelCharge.toFixed(2),
  };

  // Calculate the final bill amount by adding the subtotal and tax.
  const finalBillAmount = totalBillAmount.toFixed(0);
  const roundoffAmount = finalBillAmount - totalBillAmount;
  const roundoffFixedValue = roundoffAmount.toFixed(2);

  // Update the order with the new suborder and charges.
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      subtotalBillAmount,
      charges,
      grossAmount: totalBillAmount.toFixed(2),
      finalBillAmount,
      roundoffAmount: Math.abs(roundoffFixedValue),
      $push: { subOrders: suborder },
    },
    { new: true }
  );

  const kitchenGroupedItems = suborder.orderItems.reduce((result, item) => {
    (result[item.kitchenName] = result[item.kitchenName] || []).push(item);
    return result;
  }, {});
  // Return the updated order with added suborders.
  return { mainOrder: order, suborder: { kitchenGroupedItems, ...suborder } };
};

module.exports = {
  getOrdersByStore,
  getOrderWithStroeid,
  updateSuborderStatus,
  createOrder,
  addSubOrders,
  updateSuborderKotPrintStatus,
  getOrder,
  getMainOrder,
  getOrderWithOrderId,
  updateOrderItemsStatus,
  udpateallItemsStatus,
  updateOrderbyId,
  udpateOrderPaymentStatus,
  calculateTotalRevenueForAllStores,
  calculateTotalRevenueOfStores,
  getCompletedOrder,
  updateOrder,
  getLastThreeDaysOrder,
};
