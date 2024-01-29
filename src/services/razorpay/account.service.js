const axios = require('axios');
const dns = require('dns').promises;
const ApiError = require('../../utils/ApiError');
const API = require('./axios.instance');

const createAccount = async (
  { name, email, ifsc_code, beneficiary_name, account_type, account_number, business_name },
  next
) => {
  const createAccountEndpoint = `/v1/beta/accounts`;

  const requestData = {
    name,
    email,
    tnc_accepted: true,
    account_details: {
      business_name,
      business_type: 'individual',
    },
    bank_account: {
      ifsc_code,
      beneficiary_name,
      account_type,
      account_number,
    },
  };

  try {
    const response = await API.post(`${createAccountEndpoint}`, requestData);
    console.log('rsult', { response });
    return response.data;
  } catch (error) {
    console.log(error);
    throw next(new ApiError(400, error?.response?.data?.error?.description));
  }
};

module.exports = { createAccount };
