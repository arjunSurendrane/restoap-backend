const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const config = require('../config/config');
const welcomeMail = require('../assets/mailTemplates/welcomeMail');
const verificationEmail = require('../assets/mailTemplates/verficationEmail');
const SubscriptionUpgrade = require('../assets/mailTemplates/subscriptionUpgradedMail');
const SubscriptionCancel = require('../assets/mailTemplates/subscriptionCancelMail');
const SubscriptionExpired = require('../assets/mailTemplates/subscriptionExpired');
const SubscriptionPaymentSuccess = require('../assets/mailTemplates/subscriptionPaymentSuccessMail');
const SubscriptionDowngrade = require('../assets/mailTemplates/subscriptionDowngrade');
const SubscriptionPaymentReminder = require('../assets/mailTemplates/subscriptionPaymentReminderMail');

const ses = new SESClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Data: text,
        },
      },
      Subject: {
        Data: subject,
      },
    },
    Source: config.email.from,
  };
  await ses.send(new SendEmailCommand(params));
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${config.clientURL}/reset-password/${token}`;
  const text = `Dear user,
To reset your password, click on this link:<a href="${resetPasswordUrl}"> ${resetPasswordUrl} </a>
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  const text = verificationEmail(config.clientURL, token);
  await sendEmail(to, subject, text);
};


/**
 * Send Subscription upgrade mail
 */
const sendSubscriptionUpgradeMail = async (to, name, planname, amount, interval) => {
  const subject = 'Your Subscription Upgrade Confirmation';
  const text = SubscriptionUpgrade(name, planname, amount, interval);
  await sendEmail(to, subject, text);
};

/**
 * Send Subscription Downgrade mail
 */
const sendSubscriptionDowngradeMail = async (to, name, planname, amount, interval) => {
  const subject = 'Your Subscription Downgrade Confirmation';
  const text = SubscriptionDowngrade(name, planname, amount, interval);
  await sendEmail(to, subject, text);
};

/**
 * Send Subscripton cancel mail
 */
const sendSubscriptionCancelMail = async (to, name, planname, amount, date, interval) => {
  const subject = 'Subscription Cancellation Confirmation';
  const text = SubscriptionCancel(name, planname, amount, date, interval);
  await sendEmail(to, subject, text);
};

/**
 * Send Subscripton expired mail
 */
const SendSubscriptionExpriredMail = async (to, name, planname, date) => {
  const subject = 'Subscription Expired';
  const text = SubscriptionExpired(name, planname, date);
  await sendEmail(to, subject, text);
};

/**
 * Send Subscripton Payment Reminder
 */
const SendSubscriptionPaymentReminder = async ({ to, name, date, invoiceUrl, dueDate }) => {
  const subject = 'Payment Reminder';
  const text = SubscriptionPaymentReminder(name, date, invoiceUrl, dueDate);
  await sendEmail(to, subject, text);
};

/**
 * Send Subscripton Payment Success mail
 */
const SendSubscriptionPaymentSuccess = async (to, name, planname, amount, date, interval) => {
  const subject = 'Payment Success';
  const text = SubscriptionPaymentSuccess(name, planname, amount, date, interval);
  await sendEmail(to, subject, text);
};

/**
 * send welcome mail
 * @param {string} to
 * @returns {Promise}
 */
const sendWelcomeMail = async (to) => {
  const subject = 'Welcome Mail';
  const text = welcomeMail();
  await sendEmail(to, subject, text);
};
module.exports = {
  ses,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendSubscriptionUpgradeMail,
  SendSubscriptionExpriredMail,
  SendSubscriptionPaymentSuccess,
  sendSubscriptionDowngradeMail,
  SendSubscriptionPaymentReminder,
  sendSubscriptionCancelMail,
  sendWelcomeMail,
};
