const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

/**
 * Amazon SES Email Service
 * Region: ap-south-1 (Mumbai)
 * 
 * Environment Variables Required:
 *   AWS_ACCESS_KEY    – IAM access key with SES send permissions
 *   AWS_SECRET_KEY    – IAM secret key
 *   SES_FROM_EMAIL    – Verified sender address (default: support@zovotel.com)
 */

const sesClient = new SESClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@zovotel.com';

/**
 * Send an email via Amazon SES
 *
 * @param {Object}  options
 * @param {string}  options.to      – Recipient email address
 * @param {string}  options.subject – Email subject line
 * @param {string}  options.html    – HTML body content
 * @returns {Promise<Object>}       – SES response metadata on success
 */
const sendEmail = async ({ to, subject, html }) => {
  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log(`✅ Email sent successfully to ${to} | MessageId: ${response.MessageId}`);
    return response;
  } catch (error) {
    console.error(`❌ Email send failed to ${to} | Error: ${error.message}`);
    console.error('SES Error Details:', {
      code: error.name,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
    });
    throw error;
  }
};

module.exports = { sendEmail };
