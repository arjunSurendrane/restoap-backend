const httpStatus = require('http-status');
const { MenuItem, Store, Category, Kitchen } = require('../models');
const ApiError = require('../utils/ApiError');
const { upload, deleteImageFromAws } = require('./storage.service');
const mongoose = require('mongoose');
const cron = require('node-cron');
const he = require('he');
const menuItem = require('../models/menuItem.model');

const removeOfferDetails = (endDate) => {
  // if (newMenu.offer.length > 0) {
  // const endDate = newMenu.offer[0].endDate;
  const dateObject = new Date(endDate);
  const year = dateObject.getFullYear();
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const day = dateObject.getDate();
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  cron.schedule(`0 ${minutes} ${hours} ${day} ${month} *`, async () => {
    newMenu.offer = [];
    newMenu.offer = [];
    await MenuItem.findByIdAndUpdate(newMenu._id, {
      $unset: {
        'variants.$[].offerPrice': 1,
        offerPrice: 1,
      },
      $set: {
        offer: [],
      },
    });
  });
  // }
};
/**
 * get menu by Id
 * @param {ObjectId} id
 * @return {Promise<MenuItem}
 */

const getMenuItem = async (id) => {
  const item = await MenuItem.findById(id).populate('storeId').populate('category').populate('addOns');
  return item;
};

/**
 * An array of IDs is used to get the menu item
 * @param {ObjectId} productIds
 * @returns {Array}
 */
const getMenuItemFromArrayofId = async (productIds) => {
  return await MenuItem.find({ _id: { $in: productIds } })
    .populate('kitchen')
    .lean();
};

/**
 * create menuItem
 * @param {Object} menuItemBody
 * @returns {Promise<MenuItem>}
 */

const createMenuItem = async (req, res) => {
  console.log(req.body);
  // if (req.files === undefined) {
  //   throw new ApiError(httpStatus.CONFLICT, 'Error :No File Selected');
  // }
  //  else {
  //   const images = [];
  //   // const videos = [];
  //   if (req.files.image && req.files.image.length > 0) {
  //     images.push({ id: req.files.image[0].key, name: req.files.image[0].location });
  //   }
  //   console.log('categoryId', req.body);
  // if (req.files.video && req.files.video.length > 0) {
  //   videos.push({ id: req.files.video[0].key, name: req.files.video[0].location });
  // }

  const { storeId, name } = req.body;
  const nameToSmallLetter = name?.en?.toLowerCase();

  // if (!nameToSmallLetter) {
  //   throw new ApiError(httpStatus.CONFLICT, 'Please choose item name in english also');
  // }

  const findStore = async () => await Store.findOne({ _id: storeId });
  const findCategory = async () => await Category.findOne({ _id: req.body.category });

  const [store, category] = await Promise.all([findStore(), findCategory()]);

  if (!store) {
    throw new ApiError(httpStatus.CONFLICT, 'Store not found');
  }
  console.log('categoryId', req.body.category);

  if (!category) {
    throw new ApiError(httpStatus.CONFLICT, 'No category found in this restaurant');
  }
  // console.log('category', categoryategory);
  req.body.categoryName = category.name;

  // let langCodes = [];
  // console.log(name);

  // // eslint-disable-next-line no-restricted-syntax
  // for (const langCode of Object.keys(name)) {
  //   if (!langCodes.includes(langCode)) {
  //     langCodes.push(langCode);
  //   }
  // }

  // const newItemNames = langCodes.reduce((acc, lang) => ({ ...acc, [lang]: name[lang] }), {});
  // console.log('newItem', newItemNames);
  // const orConditions = langCodes.map((lang) => ({ [`name.${lang}`]: newItemNames[lang] }));

  // console.log('orCondition', orConditions);
  // // Check if a menu item with the same name exists in any language for the same restaurant
  // const checkDupMenuItem = await MenuItem.findOne({
  //   $or: orConditions,
  //   storeId,
  // });

  // if (checkDupMenuItem) {
  //   const deleteMultipleImages = async (images) => {
  //     for (const image of images) {
  //       await deleteImageFromAws(image);
  //     }
  //   };
  //   throw new ApiError(httpStatus.CONFLICT, 'item already exist');
  // }

  // req.body.name.en = nameToSmallLetter;
  // if (req.body.variants) {
  //   req.body.variants = JSON.parse(req.body.variants);
  //   console.log('variants', req.body.variants);
  // }

  // if (req.body.offer) {
  //   req.body.offer = JSON.parse(req.body.offer);
  //   console.log('variants', req.body.offer);
  // } else {
  //   req.body.offer = [];
  // }

  // if (req.body.video) {
  //   req.body.videos = JSON.parse(req.body.video);
  // }

  // req.body.addOns = JSON.parse(req.body.addOns);
  // console.log('addOns', req.body.addOns);

  // req.body.images = images;
  console.log(req.body);
  const encodedString = req.body.description;
  const decodedString = he.decode(encodedString);
  req.body.description = decodedString;

  const newMenu = await MenuItem.create(req.body);

  if (newMenu?.offer?.length > 0) {
    const endDate = newMenu.offer[0].endDate;
    removeOfferDetails(endDate);
  }

  console.log('menu item', newMenu);
  return newMenu;
};
// };

/**
 * get all menu items by restaurant
 * @param {Object} filter
 * @param {Object} options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<MenuItem>}
 */

const getMenuItemsByRestaurant = async (filter, options) => {
  if (options.searchValue) {
    // eslint-disable-next-line no-param-reassign
    filter.$or = [
      {
        categoryName: { $regex: options.searchValue, $options: 'i' },
      },
      {
        size: { $regex: options.searchValue, $options: 'i' },
      },
      {
        name: { $regex: options.searchValue, $options: 'i' },
      },
    ];
  }

  if (options.category) {
    filter.category = options.category;
  }
  if (options.sort === true) {
    filter.featured = true;
  }
  const items = await MenuItem.paginate(filter, options);
  if (!items) {
    throw new ApiError(httpStatus.NOT_FOUND, 'item not found');
  }
  return items;
};

/**
 * get all menu items by Category
 * @param {Object} filter
 * @param {Object} options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<MenuItem>}
 */

const getAllMenuItemsByCategory = async (filter, options) => {
  const items = await MenuItem.paginate(filter, options);
  if (!items) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No category found');
  }
  return items;
};

/**
 * Delete menuItem
 * @param {ObjectId} id
 * @return {Promise<MenuItem>}
 */
const deleteMenuItem = async (menuItemId) => {
  console.log('menuItemId', menuItemId);
  const item = await getMenuItem(menuItemId);
  console.log('item', item);
  const key = item.images[0]?.id;

  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'item not found');
  } else {
    if (item.images && item.images.length > 0) {
      // Assuming images are stored with id as the key
      const imageKey = item.images[0]?.id;
      console.log('image key', imageKey);
      const imageDeletionResult = await deleteImageFromAws(imageKey);
      console.log('Image deletion result', imageDeletionResult);
    }

    if (item?.videos && item?.videos?.length > 0) {
      // Assuming videos are stored with id as the key
      const videoKey = item.videos[0]?.id;
      console.log('video key', videoKey);
      const videoDeletionResult = await deleteImageFromAws(videoKey);
      console.log('Video deletion result', videoDeletionResult);
    }

    // Now that the image and video deletion is handled, you can choose whether to remove the item from the database.
    await item.remove();
  }

  return item;
};

/**
 * Update menuItem
 * @param {ObjectId} id
 * @return {Promise<MenuItem>}
 */
const updateMenuItem = async (req, res) => {
  console.log('first console', req.body);
  // const { name, id } = req.body;
  const item = await getMenuItem(req.body.id);
  console.log('item', item);
  if (req.body?.images[0]?.id !== item?.images[0]?.id) {
    await deleteImageFromAws(item?.images[0]?.id);
  }
  if (req.body?.images.length === 0) {
    await deleteImageFromAws(item?.images[0]?.id);
  }

  if (req.body.videos.length > 0) {
    if (req.body?.videos[0]?.id !== item.videos[0]?.id) await deleteImageFromAws(item?.videos[0]?.id);
  } else {
    if (req.body?.videos.length === 0) {
      // req.body.images = [];
      await deleteImageFromAws(item?.videos[0]?.id);
    }
  }

  // const nameToSmallLetter = name?.en?.toLowerCase();
  // if (!nameToSmallLetter) {
  //   throw new ApiError(httpStatus.CONFLICT, 'Please choose item name in english also');
  // }
  // const findStore = async () => await Store.findOne({ _id: storeId });
  const category = await Category.findOne({ _id: item.category });
  console.log(category);
  if (category.active === false) {
    throw new ApiError(httpStatus.CONFLICT, 'Please active the category');
  }
  // const [store, category] = await Promise.all([findStore(), findCategory()]);

  // if (!store) {
  //   throw new ApiError(httpStatus.CONFLICT, 'Store not found');
  // }
  // console.log('categoryId', req.body.category);

  // if (!category) {
  //   throw new ApiError(httpStatus.CONFLICT, 'No category found in this restaurant');
  // }
  // console.log('category', categoryategory);
  // req.body.categoryName = category.name;
  // console.log('body sjdfkjsd ', req.body);
  // // req.body.name.en = nameToSmallLetter;
  // if (req.body.variants) {
  //   req.body.variants = JSON.parse(req.body.variants);
  //   console.log('variants', req.body.variants);
  // }
  // // if (req.body.addOns !== 'undefined') {
  // //   req.body.addOns = JSON.parse(req.body.addOns);
  // //   console.log('addOns', req.body.addOns);
  // // }

  // if (req.body.offer) {
  //   req.body.offer = JSON.parse(req.body.offer);
  //   console.log('variants', req.body.offer);
  // } else {
  //   req.body.offer = [];
  //   req.body.offerPrice = '';
  // }

  // if (req.body.video) {
  //   req.body.videos = JSON.parse(req.body.video);
  // } else {
  //   req.body.videos = [];
  // }

  // req.body.videos = videos;
  // req.body.images = images;
  console.log(req.body);

  const encodedString = req.body.description;
  const decodedString = he.decode(encodedString);
  req.body.description = decodedString;
  // Object.assign(item, req.body);
  // await item.Save();
  // return item;
  const newMenu = await MenuItem.findByIdAndUpdate(req.body.id, { ...req.body }, { new: true });

  if (newMenu?.offer?.length > 0) {
    const endDate = newMenu.offer[0].endDate;
    removeOfferDetails(endDate);
  }
  return;
};

const createMultipleMenu = async (body, next) => {
  const { menuItems } = body;
  console.log(menuItems);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    for (const menu of menuItems) {
      const dupItem = await MenuItem.findOne({ storeId: menu.storeId, name: menu.name });
      console.log('dupItem', dupItem);
      if (dupItem) {
        await session.abortTransaction();
        session.endSession();
        next(new ApiError(httpStatus.CONFLICT, 'Item already exist'));
      }
      const categoryToSmall = menu.categoryName.toLowerCase().trim();
      let category = await Category.findOne({ name: categoryToSmall, store: menu.storeId }).session(session);
      console.log('already', category);
      if (!category) {
        const newCategoryArray = await Category.create(
          [
            {
              name: categoryToSmall,
              store: menu.storeId[0],
            },
          ],
          { session }
        );
        const newCategory = newCategoryArray[0];
        console.log('new Category', newCategory);
        menu.category = newCategory._id;
        menu.categoryName = newCategory.name;
      } else {
        menu.category = category._id;
        menu.categoryName = category.name;
      }
      const kitchenToSmall = menu.kitchen.toLowerCase().trim();
      let kitchen = await Kitchen.findOne({ name: kitchenToSmall, store: menu.storeId }).session(session);
      if (!kitchen) {
        const newKitchen = await Kitchen.create(
          [
            {
              name: kitchenToSmall,
              store: menu?.storeId,
            },
          ],
          { session }
        );
        console.log(newKitchen);
        menu.kitchen = newKitchen?._id;
      } else {
        menu.kitchen = kitchen?._id;
      }
      console.log(menu);
      console.log('working');
      // menuItem.storeId;
      if (menu.featured === 'Yes') {
        menu.featured = true;
      } else {
        menu.featured = false;
      }
      if (menu.taxInclude === 'Yes') {
        menu.taxInclude = true;
      } else {
        menu.taxInclude = false;
      }
      console.log(menu);
      const menuItem = await MenuItem.create([menu], { session });
    }
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    // throw new ApiError(err);
    console.log(err);
    await session.abortTransaction();
    session.endSession();
  }
};
// };

module.exports = {
  createMenuItem,
  getMenuItem,
  getMenuItemsByRestaurant,
  getAllMenuItemsByCategory,
  deleteMenuItem,
  createMultipleMenu,
  getMenuItemFromArrayofId,
  updateMenuItem,
};
