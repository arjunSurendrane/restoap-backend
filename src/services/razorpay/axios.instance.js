const axios = require('axios');
const config = require('../../config/config');

/**
 * TODO: When sending API requests to Razorpay servers, it is recommended to honour the TTL of the entries
 * and avoid aggressive DNS caching at your end. This is applicable when you are not using Razorpay SDKs.
 * Consider implementing dynamic DNS resolution to ensure up-to-date IP addresses.
 */

// Create a function to create the Axios instance with custom configuration
const instance = axios.create({
  baseURL: `https://api.razorpay.com`,
  timeout: 10000,
  auth: {
    username: config.razorpay.apiKey,
    password: config.razorpay.secretKey,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = instance;
