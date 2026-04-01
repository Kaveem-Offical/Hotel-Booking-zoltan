/**
 * Booking Confirmed Email Template
 *
 * Generates a professional, mobile-friendly HTML email for booking confirmation.
 * Styled with inline CSS for maximum email client compatibility.
 *
 * @param {Object} data
 * @param {string} data.userName      – Guest's full name
 * @param {string} data.hotelName     – Hotel name
 * @param {string} data.checkIn       – Check-in date (e.g. "2024-12-25")
 * @param {string} data.checkOut      – Check-out date (e.g. "2024-12-28")
 * @param {string} data.bookingId     – Unique booking reference ID
 * @param {string} [data.roomType]    – Room type (optional)
 * @param {number} [data.totalAmount] – Total amount paid (optional)
 * @param {string} [data.currency]    – Currency code (optional, default INR)
 * @returns {string} HTML email string
 */
const bookingConfirmedTemplate = (data) => {
  const {
    userName,
    hotelName,
    checkIn,
    checkOut,
    bookingId,
    roomType = '',
    totalAmount = null,
    currency = 'INR',
  } = data;

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const nights = (() => {
    try {
      const diff = new Date(checkOut) - new Date(checkIn);
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return '–';
    }
  })();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00b894 0%,#00cec9 100%);padding:40px 32px;text-align:center;">
              <div style="width:56px;height:56px;background-color:rgba(255,255,255,0.25);border-radius:50%;margin:0 auto 16px;line-height:56px;font-size:28px;">
                ✓
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Booking Confirmed!
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">
                Your reservation is all set
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
                Great news! Your booking at <strong style="color:#2d3436;">${hotelName}</strong> has been confirmed. Here are your reservation details:
              </p>
            </td>
          </tr>

          <!-- Booking Details Card -->
          <tr>
            <td style="padding:24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8f9fa;border-radius:12px;border:1px solid #e9ecef;">
                
                <!-- Booking ID -->
                <tr>
                  <td style="padding:20px 24px 12px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking ID</p>
                    <p style="margin:4px 0 0;color:#00b894;font-size:18px;font-weight:700;font-family:monospace;">${bookingId}</p>
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

                <!-- Dates Row -->
                <tr>
                  <td style="padding:16px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Check-in</p>
                          <p style="margin:4px 0 0;color:#2d3436;font-size:14px;font-weight:600;">${formatDate(checkIn)}</p>
                        </td>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Check-out</p>
                          <p style="margin:4px 0 0;color:#2d3436;font-size:14px;font-weight:600;">${formatDate(checkOut)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>

                <!-- Duration & Room -->
                <tr>
                  <td style="padding:16px 24px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Duration</p>
                          <p style="margin:4px 0 0;color:#2d3436;font-size:14px;font-weight:600;">${nights} Night${nights !== 1 ? 's' : ''}</p>
                        </td>
                        ${roomType ? `
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Room Type</p>
                          <p style="margin:4px 0 0;color:#2d3436;font-size:14px;font-weight:600;">${roomType}</p>
                        </td>
                        ` : ''}
                      </tr>
                    </table>
                  </td>
                </tr>

                ${totalAmount !== null ? `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e9ecef;margin:0;" /></td></tr>
                <tr>
                  <td style="padding:16px 24px 20px;">
                    <p style="margin:0;color:#636e72;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Total Amount</p>
                    <p style="margin:4px 0 0;color:#2d3436;font-size:22px;font-weight:700;">${currency === 'INR' ? '₹' : currency + ' '}${Number(totalAmount).toLocaleString('en-IN')}</p>
                  </td>
                </tr>
                ` : ''}

              </table>
            </td>
          </tr>

          <!-- Info Note -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#e8f8f5;border-radius:8px;border-left:4px solid #00b894;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#2d3436;font-size:14px;line-height:1.6;">
                      💡 <strong>Tip:</strong> Please carry a valid photo ID at check-in. For any queries, contact us at <a href="mailto:support@zovotel.com" style="color:#00b894;text-decoration:none;font-weight:600;">support@zovotel.com</a>
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

module.exports = { bookingConfirmedTemplate };
