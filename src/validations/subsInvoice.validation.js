const Joi = require('joi');

const getInvoices = {
  query: Joi.object().keys({
    limit: Joi.number(),
    customerId: Joi.string(),
    skip: Joi.number(),
  }),
};

module.exports = { getInvoices };
