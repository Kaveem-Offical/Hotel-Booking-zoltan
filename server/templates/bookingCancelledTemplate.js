/**
 * Booking Cancelled Email Template
 *
 * Generates a professional, mobile-friendly HTML email for booking cancellation.
 * Styled with inline CSS for maximum email client compatibility.
 *
 * @param {Object} data
 * @param {string} data.userName    – Guest's full name
 * @param {string} data.hotelName   – Hotel name
 * @param {string} data.bookingId   – Booking reference ID
 * @param {string} [data.reason]    – Cancellation reason/remarks (optional)
 * @param {number} [data.refundAmount] – Refund amount if applicable (optional)
 * @param {string} [data.currency]  – Currency code (optional, default INR)
 * @returns {string} HTML email string
 */
const bookingCancelledTemplate = (data) => {
  const {
    userName,
    hotelName,
    bookingId,
    reason = '',
    refundAmount = null,
    currency = 'INR',
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Cancelled</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#e17055 0%,#d63031 100%);padding:40px 32px;text-align:center;">
              <div style="width:56px;height:56px;background-color:rgba(255,255,255,0.25);border-radius:50%;margin:0 auto 16px;line-height:56px;font-size:28px;">
                ✕
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Booking Cancelled
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">
                Your reservation has been cancelled
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 32px 0;">
              <p style="margin:0;color:#2d3436;font-size:16px;line-height:1.6;">
                Hi <strong>${userName}</strong>,
              </p>
              <p style="margin:12px 0 0;color:#636e72;font-size:15px;line-height:1.6;">
                We're sorry to see your plans change. Your booking at <strong style="color:#2d3436;">${hotelName}</strong> has been cancelled. Here's a summary:
              </p>
            </td>
          </tr>

          <!-- Cancellation Details Card -->
          <tr>
            <td style="padding:24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;border-radius:12px;border:1px solid #e9ecef;">
                
                <!-- Booking ID -->
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking ID</p>
                    <p style="margin:4px 0 0;color:#d63031;font-size:18px;font-weight:700;font-family:monospace;">${bookingId}</p>
                  </td>
                </tr>

                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>

                <!-- Hotel Name -->
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Hotel</p>
                    <p style="margin:4px 0 0;color:#2d3436;font-size:16px;font-weight:600;">${hotelName}</p>
                  </td>
                </tr>

                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>

                <!-- Status -->
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Status</p>
                    <p style="margin:4px 0 0;">
                      <span style="display:inline-block;background-color:#ffeaa7;color:#d63031;font-size:13px;font-weight:700;padding:4px 12px;border-radius:20px;">CANCELLED</span>
                    </p>
                  </td>
                </tr>

                ${reason ? `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Reason</p>
                    <p style="margin:4px 0 0;color:#2d3436;font-size:14px;line-height:1.5;">${reason}</p>
                  </td>
                </tr>
                ` : ''}

                ${refundAmount !== null ? `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>
                <tr>
                  <td style="padding:16px 24px 20px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Refund Amount</p>
                    <p style="margin:4px 0 0;color:#00b894;font-size:22px;font-weight:700;">${currency === 'INR' ? '₹' : currency + ' '}${Number(refundAmount).toLocaleString('en-IN')}</p>
                    <p style="margin:4px 0 0;color:#636e72;font-size:12px;">Refund will be processed within 5–7 business days</p>
                  </td>
                </tr>
                ` : ''}

              </table>
            </td>
          </tr>

          <!-- Re-book CTA -->
          <tr>
            <td style="padding:0 32px 8px;text-align:center;">
              <p style="margin:0;color:#636e72;font-size:14px;line-height:1.6;">
                Changed your mind? You can always book again on our platform.
              </p>
            </td>
          </tr>

          <!-- Support Note -->
          <tr>
            <td style="padding:16px 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#ffeaa7;border-radius:8px;border-left:4px solid #fdcb6e;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#2d3436;font-size:14px;line-height:1.6;">
                      📞 <strong>Need help?</strong> If you have any questions about this cancellation or need assistance, please reach out to us at <a href="mailto:support@zovotel.com" style="color:#d63031;text-decoration:none;font-weight:600;">support@zovotel.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:24px 32px;text-align:center;border-top:1px solid #e9ecef;">
              <p style="margin:0;color:#2d3436;font-size:16px;font-weight:700;letter-spacing:-0.3px;">Zovotel</p>
              <p style="margin:8px 0 0;color:#b2bec3;font-size:13px;line-height:1.5;">
                Your trusted hotel booking partner<br />
                © ${new Date().getFullYear()} Zovotel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

module.exports = { bookingCancelledTemplate };
