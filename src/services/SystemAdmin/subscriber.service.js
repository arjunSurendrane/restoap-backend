const { User } = require('../../models');

const getSubscribers = async (query) => {
  const { isubscribed, rowsPerPage, page } = query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(rowsPerPage, 10);
  console.log(isubscribed);
  console.log(pageNumber);
  console.log(pageSize);
  const aggregationPipeline = [
    {
      $unwind: '$roles',
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'roles',
        foreignField: '_id',
        as: 'user_roles',
      },
    },
    {
      $unwind: '$user_roles',
    },
    {
      $match: {
        'user_roles.name': 'supperadmin',
      },
    },
  ];
  let condition = {};
  if (isubscribed === true) {
    condition = {
      plan: { $exists: true, $ne: [] },
    };
  }
  if (isubscribed === false) {
    condition = {
      plan: { $exists: false, $ne: [] },
    };
  }
  aggregationPipeline.push({
    $match: condition,
  });
  if (pageNumber) {
    aggregationPipeline.push(
      {
        $skip: (pageNumber - 1) * pageSize, // Skip documents for previous pages
      },
      {
        $limit: pageSize, // Limit the number of documents per page
      }
    );
  }

  const getSubscriber = async () => User.aggregate(aggregationPipeline);
  const getCount = async () => User.countDocuments(condition);
  const [subscriber, count] = await Promise.all([getSubscriber(), getCount()]);

  return { subscriber, count };
};
module.exports = {
  getSubscribers,
};
