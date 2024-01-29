const { stripeService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getInvoices = catchAsync(async (req, res, next) => {
  const { limit, skip, customerId } = req.query;
  const invoices = await stripeService.stripeInvoice.getSubsInvoices({ limit, skip, customerId }, next);
  res.send(invoices);
});

module.exports = { getInvoices };
