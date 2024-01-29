const { reportService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const XLSX = require('xlsx');

/**
 * Store Admin Sales Report Summary
 * GET report/super-admin/:storeId/summary
 */
const storeAdminOrderReportSummary = catchAsync(async (req, res, next) => {
  const { storeId } = req.params;
  const report = await reportService.storeAdminOrderReportSummary({ storeId });
  res.send(report);
});

const downloadReport = catchAsync(async (req, res, next) => {
  // Your code to generate the Excel file (similar to what you have)
  const { startDate, endDate, paymentStatus, customerId, search, customDate } = req.query;
  const { storeId } = req.params;
  const order = await reportService.storeAdminOrderReportDownload({
    storeId,
    startDate,
    endDate,
    paymentStatus,
    customerId,
    customDate,
    search,
  });
  const downloadDate= order.map(data=>{
    return {
      Tax: data.charges.tax,
      Additional_Amount:data.charges.additionalCharge.amount,
      Order_Number:data.orderNumber,
      Store_Name:data.storeName,
      Table_No:data.tableNo,
      Customer_Name:data.customerName,
      SubTotal_Bill:data.subtotalBillAmount,
      Gross_Amount:data.grossAmount,
      Roundoff_Amount:data.roundoffAmount,
      FinalBill_Amount:data.finalBillAmount,
      Currency:data.currency,
    }
  })
  
  const worksheet = XLSX.utils.json_to_sheet(downloadDate);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Send the Excel file to the client as a response
  const data = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  console.log({ data });
  res.send(data);
});

/**
 * Store Admin Sales Report
 * GET report/super-admin/:storeId
 */
const storeAdminOrderReport = catchAsync(async (req, res, next) => {
  const { startDate, endDate, paymentStatus, customerId, search, page, limit, customDate } = req.query;
  const { storeId } = req.params;

  const report = await reportService.storeAdminOrderReport({
    storeId,
    startDate,
    endDate,
    paymentStatus,
    customerId,
    customDate,
    search,
    page,
    limit,
  });
  res.send(report);
});

module.exports = { storeAdminOrderReportSummary, storeAdminOrderReport, downloadReport };
