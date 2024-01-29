const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService, roleService, stripeService } = require('../services');
const ApiError = require('../utils/ApiError');
const { defaultRoles, superAdminDefaultPermission } = require('../utils/defaultRoles');

/**
 *
 * Registration
 *
 * POST /auth/registration
 */
const register = async (req, res, next) => {
  // create session
  const session = await mongoose.startSession();
  // start transaction
  session.startTransaction();
  try {
    // create new user
    const defaultSuperAdminRole = superAdminDefaultPermission;
    const superAdminNewRole = await roleService.createSuperadminRole(defaultSuperAdminRole, session);
    if (!superAdminNewRole[0]) return next(new ApiError(400, 'Something went wrong.'));
    const user = await userService.createAdminUser({ ...req.body, roles: [superAdminNewRole[0]._id] }, session, next);
    const tokens = await tokenService.generateAuthTokens(user[0]);

    if (user) {
      // Send Welcoming and Verification Emails
      // await emailService.sendWelcomeMail(req.body.email);
      await emailService.sendVerificationEmail(req.body.email, tokens.access.token);
    }

    // commit transaction
    session.commitTransaction();
    res.status(httpStatus.CREATED).send({ user, tokens });
  } catch (error) {
    // roll back to previous state
    session.abortTransaction();
    res.status(500).send(error);
  }
};

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password, next);
  const tokens = await tokenService.generateAuthTokens(user);
  if (!user.isEmailVerified) {
    await emailService.sendVerificationEmail(req.body.email, tokens.access.token);
    return next(new ApiError(403, 'email address not verified'));
  }
  res.send({ user, tokens });
});

const resendVerificationMail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return next(new ApiError(404, 'user not exist'));
  }
  const tokens = await tokenService.generateAuthTokens(user);
  if (user.isEmailVerified) {
    return next(new ApiError(403, 'email address already verified'));
  }
  await emailService.sendVerificationEmail(req.body.email, tokens.access.token);
  res.send();
});

const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req);
  res.send(user);
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-console
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

/**
 *
 * Verify Email
 * PATCH /auth/verify-email
 */
const verifyEmail = catchAsync(async (req, res, next) => {
  const { _id, isEmailVerified, email, name } = req.user;
  if (isEmailVerified) return res.status(208).json({ message: 'Already verified user' });
  // Send Welcoming and Verification Emails
  const stripeCustomerId = await stripeService.stripeCustomer.createStripeCustomer({ email, id: _id, name });
  await userService.updateUserById({
    userId: _id,
    updateBody: { isEmailVerified: true, stripeCustomerId: stripeCustomerId.id },
    next,
  });
  emailService.sendWelcomeMail(email);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  getMe,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  resendVerificationMail,
  sendVerificationEmail,
  verifyEmail,
};
