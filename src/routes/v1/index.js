const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const diningCategoryRoute = require('./diningCategory.route');
// const requestRoute = require('./request.route');
const permissionRoute = require('./permission.route');
const tableRoute = require('./table.route');
const restaurantRoute = require('./restaurant.route');
const roleRoute = require('./role.route');
const categoryRoute = require('./category.route');
const storeRoutes = require('./store.route');
const stripeRoute = require('./stripe.route');
const subscriptionRoute = require('./subscription.route');
const menuItemRoute = require('./menuItem.route');
const orderRoute = require('./order.route');
const addOnRoute = require('./addOn.route');
const integrationRoute = require('./integration.route');
const systemAdmin = require('./systenAdmin/index');
const subsInvoiceRoute = require('./invoice.route');
const kitchenRoute = require('./kitchen.route');
const reportRoute = require('./report.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/stripe',
    route: stripeRoute,
  },
  {
    path: '/integration',
    route: integrationRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/dining-categories',
    route: diningCategoryRoute,
  },
  // {
  //   path: '/requests',
  //   route: requestRoute,
  // },
  {
    path: '/permissions',
    route: permissionRoute,
  },
  {
    path: '/table',
    route: tableRoute,
  },
  {
    path: '/restaurants',
    route: restaurantRoute,
  },
  {
    path: '/stores',
    route: storeRoutes,
  },
  {
    path: '/roles',
    route: roleRoute,
  },
  {
    path: '/categories',
    route: categoryRoute,
  },

  {
    path: '/subscriptions',
    route: subscriptionRoute,
  },
  {
    path: '/menuItem',
    route: menuItemRoute,
  },
  {
    path: '/order',
    route: orderRoute,
  },
  {
    path: '/addOn',
    route: addOnRoute,
  },
  {
    path: '/system-admin',
    route: systemAdmin,
  },
  {
    path: '/invoices',
    route: subsInvoiceRoute,
  },
  {
    path: '/kitchen',
    route: kitchenRoute,
  },
  {
    path: '/report',
    route: reportRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
