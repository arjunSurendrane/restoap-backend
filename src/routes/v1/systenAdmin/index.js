const express = require('express');

const route = express.Router();
const subscriberRoutes = require('./subscriber.route');

// Define routes using appropriate HTTP methods
route.use('/subscribers', subscriberRoutes);

module.exports = route;
