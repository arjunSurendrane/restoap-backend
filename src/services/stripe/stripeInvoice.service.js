/* eslint-disable no-await-in-loop */
const stripe = require('../../config/stripe');
const ApiError = require('../../utils/ApiError');
const _ = require('lodash');

const getSubsInvoices = async ({ limit = 5, skip = null, customerId }, next) => {
  // Get invoice list
  const invoices = [];

  const invoice = await stripe.invoices.list({
    customer: customerId,
    limit: 24,
  });

  if (!invoice) return next(new ApiError(404, 'invoice not found'));
  const { data } = invoice;
  // eslint-disable-next-line no-plusplus
  _.map(data, async (data, i) => {
    invoices.push({
      index: i,
      number: data.number,
      dueAmount: data.amount_due,
      amountPaid: data.amount_paid,
      hostedInvoiceUrl: data.hosted_invoice_url,
      createdAt: data.created,
      dueDate: data.due_date ? data.due_date : data.period_end,
      currency: data.currency,
      name: data.customer_name,
      phone: data.customer_phone,
      address: data.customer_address,
      email: data.customer_email,
      discounts: data.discounts,
      subTotal: data.total_excluding_tax,
      total: data.total,
      quantity: data.lines.data[0].quantity,
      status: data.status,
      unitPrice: data.lines.data[0].price.unit_amount_decimal,
      plan: data.lines.data[0].plan.metadata.plan,
      planInterval: data.lines.data[0].plan.interval,
      PlanName: data.lines.data[0].plan.metadata.plan,
      tax: data.lines.data[0].tax_amounts,
    });
  });

  return invoices;
};

module.exports = { getSubsInvoices };
