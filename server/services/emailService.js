const { SendMailClient } = require('zeptomail');
const { getTemplateByType } = require('./emailTemplates');

/**
 * Zoho ZeptoMail Email Service
 *
 * Replaces Amazon SES with ZeptoMail for transactional emails.
 *
 * Environment Variables Required:
 *   ZEPTOMAIL_TOKEN    – Send Mail Token from ZeptoMail Mail Agent
 *   ZEPTOMAIL_FROM     – Verified sender address (default: support@zovotel.com)
 *   ZEPTOMAIL_FROM_NAME – Sender display name (default: Zovotel)
 */

const ZEPTOMAIL_URL = 'api.zeptomail.com/';
const ZEPTOMAIL_TOKEN = process.env.ZEPTOMAIL_TOKEN;
const FROM_EMAIL = process.env.ZEPTOMAIL_FROM || process.env.SES_FROM_EMAIL || 'support@zovotel.com';
const FROM_NAME = process.env.ZEPTOMAIL_FROM_NAME || 'Zovotel';

// Initialise the ZeptoMail client
let client;
if (ZEPTOMAIL_TOKEN) {
  client = new SendMailClient({ url: ZEPTOMAIL_URL, token: ZEPTOMAIL_TOKEN });
  console.log('✅ ZeptoMail client initialized successfully');
} else {
  console.warn('⚠️  ZEPTOMAIL_TOKEN not set – emails will be logged but NOT sent.');
  console.warn('   To enable email sending, add ZEPTOMAIL_TOKEN to your .env file');
}

// Log sender configuration
console.log(`📧 Email FROM address: ${FROM_EMAIL}`);

/**
 * Send an email via Zoho ZeptoMail
 *
 * @param {Object}  options
 * @param {string|string[]}  options.to      – Recipient email address(es)
 * @param {string}  options.subject – Email subject line
 * @param {string}  options.html    – HTML body content
 * @param {string}  [options.toName] – Recipient display name
 * @returns {Promise<Object>}       – ZeptoMail response on success
 */
const sendEmail = async ({ to, subject, html, toName }) => {
  // Normalise recipients into array format
  const recipients = (Array.isArray(to) ? to : [to]).map((addr) => ({
    email_address: {
      address: addr,
      name: toName || addr.split('@')[0],
    },
  }));

  // Build the mail payload
  const mailPayload = {
    from: {
      address: FROM_EMAIL,
      name: FROM_NAME,
    },
    to: recipients,
    subject,
    htmlbody: html,
  };

  // If no token configured, log the email and return gracefully
  if (!client) {
    console.log(`📧  [DRY-RUN] Email to ${to} | Subject: "${subject}" (ZEPTOMAIL_TOKEN not configured)`);
    console.log(`    Check server logs - email not sent because ZEPTOMAIL_TOKEN is missing`);
    return { dryRun: true, to, subject };
  }

  // Validate recipient email
  if (!to || (Array.isArray(to) && to.length === 0) || (typeof to === 'string' && !to.includes('@'))) {
    console.error(`❌ Email validation failed: invalid recipient "${to}"`);
    throw new Error(`Invalid recipient email: ${to}`);
  }

  try {
    const response = await client.sendMail(mailPayload);
    console.log(`✅ Email sent successfully to ${to} | Subject: "${subject}"`);
    return response;
  } catch (error) {
    console.error(`❌ Email send failed to ${to} | Error: ${error.message || JSON.stringify(error)}`);
    console.error('ZeptoMail Error Details:', {
      errorCode: error.error_code,
      message: error.message,
      details: error.details,
    });
    throw error;
  }
};

/**
 * Send a typed email using the template engine.
 * Looks up the template by type, injects data, and sends.
 *
 * @param {Object}  options
 * @param {string}  options.type    – Template type key (e.g. 'booking_confirmation')
 * @param {string|string[]} options.to – Recipient email
 * @param {Object}  options.data    – Data payload for the template
 * @param {string}  options.subject – Email subject line
 * @returns {Promise<Object>}
 */
const sendTypedEmail = async ({ type, to, data, subject }) => {
  const templateFn = getTemplateByType(type);
  if (!templateFn) {
    throw new Error(`Unknown email template type: "${type}"`);
  }

  const html = templateFn(data);
  return sendEmail({ to, subject, html, toName: data.customerName });
};

module.exports = { sendEmail, sendTypedEmail };
