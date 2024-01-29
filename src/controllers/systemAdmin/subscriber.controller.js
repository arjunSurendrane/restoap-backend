const httpStatus = require('http-status');
const { subscriberService } = require('../../services/SystemAdmin');
const catchAsync = require('../../utils/catchAsync');

const getSubscriber = catchAsync(async (req, res) => {
  const { query } = req;
  const subscribers = await subscriberService.getSubscribers(query);
  res.status(httpStatus.CREATED).send(subscribers);
});

module.exports = {
  getSubscriber,
};
