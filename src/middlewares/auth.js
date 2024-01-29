const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Role } = require('../models');

const verifyCallback = (req, resolve, reject, requiredPermissionKey) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  const userRoles = await Role.find({ _id: { $in: user.roles } });
  const hasRequiredPermission = userRoles[0].permissions.some(
    (permission) => permission === requiredPermissionKey || requiredPermissionKey === 'BASIC'
  );
  if (!hasRequiredPermission) {
    return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
  }

  req.user = user;
  resolve();
};

const auth = (requiredPermissionKey) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredPermissionKey))(
      req,
      res,
      next
    );
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
