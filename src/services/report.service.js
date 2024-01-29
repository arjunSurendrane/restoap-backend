const mongoose = require('mongoose');
const { Order } = require('../models');
const moment = require('moment');
const XLSX = require('xlsx');

// Get the current date
const today = moment();

const todayStart = today.clone().subtract(0, 'days').startOf('day');
const todayEnd = today.clone().subtract(0, 'days').endOf('day');

const yesterdayStart = today.clone().subtract(1, 'days').startOf('day');
const yesterdayEnd = today.clone().subtract(1, 'days').endOf('day');

// Calculate the start of the week
const startofThisWeek = today.clone().subtract(0, 'weeks').startOf('week');
const endofThisWeek = today.clone().subtract(0, 'weeks').endOf('week');

// Calculate the start and end of previous week
const startofPreviousWeek = today.clone().subtract(1, 'weeks').startOf('week');
const endofPreviousWeek = today.clone().subtract(1, 'weeks').endOf('week');

//Calculate the start and end of this month
const startofThisMonth = today.clone().subtract(0, 'months').startOf('month');
const endofThisMonth = today.clone().subtract(0, 'months').endOf('month');

//Calculate the start and end of Previous month
const startofPreviousMonth = today.clone().subtract(1, 'months').startOf('month');
const endofPreviousMonth = today.clone().subtract(1, 'months').endOf('month');

//Calculate the start and end of This Year
const startofThisYear = today.clone().subtract(0, 'years').startOf('year');
const endofThisYear = today.clone().subtract(0, 'years').endOf('year');

//Calculate the start and end of Previous Year
const startofPreviousYear = today.clone().subtract(1, 'years').startOf('year');
const endofPreviousYear = today.clone().subtract(1, 'years').endOf('year');

const storeAdminOrderReportSummary = async ({ storeId }) => {
  console.log({
    today: moment(today).format('DD/MM/YYYY hh:mm:ss a'),
    todayStart: moment(todayStart).format('DD/MM/YYYY hh:mm:ss a'),
    todayEnd: moment(todayEnd).format('DD/MM/YYYY hh:mm:ss a'),
    startofThisWeek: moment(startofThisWeek).format('DD/MM/YYYY hh:mm:ss a'),
    endofThisMonth: moment(endofThisMonth).format('DD/MM/YYYY hh:mm:ss a'),
    endofPreviousWeek: moment(endofPreviousWeek).format('DD/MM/YYYY hh:mm:ss a'),
    startofPreviousWeek: moment(startofPreviousWeek).format('DD/MM/YYYY hh:mm:ss a'),
  });

  const aggregationPipeline = [
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        orderStatus: 'completed',
      },
    },
    {
      $facet: {
        totalSalesAmount: [
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        todayTotalSales: [
          {
            $match: {
              createdAt: { $lt: new Date(todayEnd), $gt: new Date(todayStart) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        yesterdaySales: [
          {
            $match: {
              createdAt: { $lt: new Date(yesterdayEnd), $gt: new Date(yesterdayStart) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        thisWeekSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofThisWeek), $gt: new Date(startofThisWeek) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        previousWeekSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofPreviousWeek), $gt: new Date(startofPreviousWeek) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        thisMonthSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofThisMonth), $gt: new Date(startofThisMonth) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        previousMonthSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofPreviousMonth), $gt: new Date(startofPreviousMonth) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        thisYearSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofThisYear), $gt: new Date(startofThisYear) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        previousYearSalesAmount: [
          {
            $match: {
              createdAt: { $lt: new Date(endofPreviousYear), $gt: new Date(startofPreviousYear) },
            },
          },
          {
            $group: {
              _id: 'null',
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
      },
    },
  ];

  return Order.aggregate(aggregationPipeline);
};

const matchDateRange = (startDate, endDate) => ({
  $match: {
    createdAt: { $lt: new Date(endDate), $gt: new Date(startDate) },
  },
});

const matchPaymentStatus = (paymentStatus) => ({
  $match: {
    'paymentDetails.paymentType': paymentStatus,
  },
});

const matchCustomerId = (customerId) => ({
  $match: { customerId: mongoose.Types.ObjectId(customerId) },
});

const matchSearch = (search) => ({
  $match: {
    $or: [
      { orderNumber: { $regex: new RegExp(`^${search}`, 'i') } },
      { customerName: { $regex: new RegExp(`^${search}`, 'i') } },
    ],
  },
});

const paginate = (skip, limit) => [
  {
    $skip: Number(skip),
  },
  {
    $limit: Number(limit),
  },
];

const matchCustomDate = (data) => {
  let pipelineStage = {};
  console.log({ data });
  switch (data) {
    case 'Today':
      pipelineStage = matchDateRange(todayStart, todayEnd);
      break;
    case 'This Week':
      pipelineStage = matchDateRange(startofThisWeek, endofThisWeek);
      break;
    case 'Last Week':
      pipelineStage = matchDateRange(startofPreviousWeek, endofPreviousWeek);
      break;
    case 'This Month':
      pipelineStage = matchDateRange(startofThisMonth, endofThisMonth);
      break;
    case 'Last Month':
      pipelineStage = matchDateRange(startofPreviousMonth, endofPreviousMonth);
      break;
    case 'This Year':
      pipelineStage = matchDateRange(startofThisYear, endofThisYear);
      break;
    case 'Yesterday':
      pipelineStage = matchDateRange(yesterdayStart, yesterdayEnd);
      break;
  }
  return pipelineStage;
};

const storeAdminOrderReport = async ({
  storeId,
  startDate = null,
  endDate = null,
  paymentStatus = null,
  customerId = null,
  search = null,
  page = null,
  customDate = null,
  limit = null,
}) => {
  console.log('start' + moment(startDate).format('DD MM yyyy'));
  console.log('end' + moment(endDate).endOf('day').format('DD MM yyyy hh:mm:ss'));
  const skip = (page - 1) * limit;
  const aggregationPipeline = [
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        orderStatus: 'completed',
      },
    },
    {
      $facet: {
        totalMainOrder: [{ $count: 'count' }],
        totalOrderAmount: [
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$finalBillAmount' },
            },
          },
        ],
        orders: [],
      },
    },
    {
      $unwind: '$totalMainOrder',
    },
    {
      $unwind: '$totalOrderAmount',
    },
  ];

  function isValidDate(date) {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  if ((isValidDate(startDate) && isValidDate(endDate)) || customDate) {
    if (customDate) {
      aggregationPipeline[2]['$facet'].orders.push(matchCustomDate(customDate));
      aggregationPipeline[2]['$facet'].totalOrderAmount.unshift(matchCustomDate(customDate));
      aggregationPipeline[2]['$facet'].totalMainOrder.unshift(matchCustomDate(customDate));
    } else {
      const newEndDate = moment(endDate).endOf('day');
      aggregationPipeline[2]['$facet'].orders.push(matchDateRange(startDate, newEndDate));
      aggregationPipeline[2]['$facet'].totalOrderAmount.unshift(matchDateRange(startDate, newEndDate));
      aggregationPipeline[2]['$facet'].totalMainOrder.unshift(matchDateRange(startDate, newEndDate));
    }
  }

  if (paymentStatus) {
    aggregationPipeline[2]['$facet'].orders.push(matchPaymentStatus(paymentStatus));
    aggregationPipeline[2]['$facet'].totalOrderAmount.unshift(matchPaymentStatus(paymentStatus));
    aggregationPipeline[2]['$facet'].totalMainOrder.unshift(matchPaymentStatus(paymentStatus));
  }

  if (customerId) {
    aggregationPipeline[2]['$facet'].orders.push(matchCustomerId(customerId));
    aggregationPipeline[2]['$facet'].totalOrderAmount.unshift(matchCustomerId(customerId));
    aggregationPipeline[2]['$facet'].totalMainOrder.unshift(matchCustomerId(customerId));
  }

  if (search) {
    aggregationPipeline[2]['$facet'].orders.push(matchSearch(search));
    aggregationPipeline[2]['$facet'].totalOrderAmount.unshift(matchSearch(search));
    aggregationPipeline[2]['$facet'].totalMainOrder.unshift(matchSearch(search));
  }

  if (page && limit) {
    aggregationPipeline[2]['$facet'].orders.push(...paginate(Number(skip), Number(limit)));
  }

  // aggregationPipeline.push({
  //   $facet: {
  //     totalOrderAmount: [
  //       {
  //         $group: {
  //           _id: null,
  //           totalAmount: { $sum: '$finalBillAmount' },
  //         },
  //       },
  //     ],
  //   },
  // });

  console.log(aggregationPipeline[2]['$facet'].totalOrderAmount);

  const order = await Order.aggregate(aggregationPipeline).allowDiskUse(true).exec();
  return order;
};

const storeAdminOrderReportDownload = async ({
  storeId,
  startDate = null,
  endDate = null,
  paymentStatus = null,
  customerId = null,
  search = null,
  customDate = null,
}) => {
  const aggregationPipeline = [
    {
      $match: {
        storeId: mongoose.Types.ObjectId(storeId),
        orderStatus: 'completed',
      },
    },
  ];

  function isValidDate(date) {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  if ((isValidDate(startDate) && isValidDate(endDate)) || customDate) {
    if (customDate) {
      aggregationPipeline.push(matchCustomDate(customDate));
    } else {
      aggregationPipeline.push(matchDateRange(startDate, endDate));
    }
  }

  if (paymentStatus) {
    aggregationPipeline.push(matchPaymentStatus(paymentStatus));
  }

  if (customerId) {
    aggregationPipeline.push(matchCustomerId(customerId));
  }

  if (search) {
    aggregationPipeline.push(matchSearch(search));
  }

  const order = await Order.aggregate(aggregationPipeline).allowDiskUse(true).exec();
  return order;
};

module.exports = { storeAdminOrderReportSummary, storeAdminOrderReport, storeAdminOrderReportDownload };
