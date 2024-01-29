const Joi = require('joi');

const createAccount = {
  body: Joi.object().keys({
    ifsc_code: Joi.string().required(),
    beneficiary_name: Joi.string().required(),
    account_type: Joi.string().required(),
    account_number: Joi.number().required(),
    business_name: Joi.string().required(),
  }),
};

module.exports = { createAccount };
