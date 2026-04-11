/**
 * Zovotel Email Template Engine
 *
 * Professional, table-based HTML email templates for hotel booking workflows.
 * All templates use inline CSS for maximum email-client compatibility.
 *
 * Data Fields:
 *   customerName – Guest's full name
 *   hotelName    – Hotel name
 *   checkIn      – Check-in date string
 *   checkOut     – Check-out date string
 *   bookingId    – Unique booking reference
 *   amount       – Payment amount (number)
 *   otp          – One-time password (for OTP template)
 */

// ─── Brand Tokens ───────────────────────────────────────────────────────────────
const BRAND = {
  name: 'Zovotel',
  tagline: 'Your trusted hotel booking partner',
  supportEmail: 'support@zovotel.com',
  primaryColor: '#1a73e8',     // Signature blue
  primaryDark: '#1557b0',
  successColor: '#0d9f6e',
  successLight: '#d1fae5',
  dangerColor: '#dc2626',
  dangerLight: '#fee2e2',
  warningColor: '#f59e0b',
  warningLight: '#fef3c7',
  infoColor: '#6366f1',
  infoLight: '#e0e7ff',
  textDark: '#1f2937',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  bgBody: '#f3f4f6',
  bgCard: '#ffffff',
  bgSection: '#f9fafb',
  borderColor: '#e5e7eb',
  fontStack: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

// ─── Shared Helpers ─────────────────────────────────────────────────────────────

/**
 * Format a date string to Indian-locale long format.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

/**
 * Calculate number of nights between two dates.
 */
const calcNights = (checkIn, checkOut) => {
  try {
    const diff = new Date(checkOut) - new Date(checkIn);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return '—';
  }
};

/**
 * Format currency amount with Indian locale and ₹ symbol.
 */
const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// ─── Shared Components ──────────────────────────────────────────────────────────

/**
 * Email wrapper – opens the HTML document, body background, and outer table.
 */
const wrapperOpen = () => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgBody};font-family:${BRAND.fontStack};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgBody};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgCard};border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);max-width:600px;width:100%;">
`;

/**
 * Close the wrapper tables.
 */
const wrapperClose = () => `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Coloured header banner with icon and title.
 */
const headerBanner = ({ bgGradient, icon, title, subtitle }) => `
          <!-- Header Banner -->
          <tr>
            <td style="background:${bgGradient};padding:36px 32px;text-align:center;">
              <div style="width:52px;height:52px;background-color:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 14px;line-height:52px;font-size:26px;color:#ffffff;">
                ${icon}
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">
                ${title}
              </h1>
              ${subtitle ? `<p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${subtitle}</p>` : ''}
            </td>
          </tr>
`;

/**
 * Greeting block – "Dear customerName,"
 */
const greetingBlock = (customerName) => `
          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0;color:${BRAND.textDark};font-size:15px;line-height:1.6;">
                Dear <strong>${customerName || 'Guest'}</strong>,
              </p>
            </td>
          </tr>
`;

/**
 * Simple text paragraph inside the email body.
 */
const textBlock = (html) => `
          <tr>
            <td style="padding:12px 32px 0;">
              <p style="margin:0;color:${BRAND.textMuted};font-size:14px;line-height:1.7;">
                ${html}
              </p>
            </td>
          </tr>
`;

/**
 * A key-value detail row inside a details card.
 */
const detailRow = (label, value, { valueColor, valueFontSize, valueFont } = {}) => `
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">${label}</p>
                    <p style="margin:3px 0 0;color:${valueColor || BRAND.textDark};font-size:${valueFontSize || '15px'};font-weight:600;${valueFont ? `font-family:${valueFont};` : ''}">
                      ${value}
                    </p>
                  </td>
                </tr>
`;

/**
 * Thin separator line inside a details card.
 */
const separator = () => `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid ${BRAND.borderColor};margin:0;" /></td></tr>
`;

/**
 * Full branded footer with support info and copyright.
 */
const footerBlock = () => `
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.bgSection};padding:24px 32px;text-align:center;border-top:1px solid ${BRAND.borderColor};">
              <p style="margin:0;color:${BRAND.textDark};font-size:16px;font-weight:700;letter-spacing:-0.3px;">${BRAND.name}</p>
              <p style="margin:6px 0 0;color:${BRAND.textLight};font-size:12px;line-height:1.5;">
                ${BRAND.tagline}<br />
                Need help? <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>
              </p>
              <p style="margin:12px 0 0;color:${BRAND.textLight};font-size:11px;">
                This is an auto-generated email. Please do not reply.<br />
                &copy; ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </p>
            </td>
          </tr>
`;

/**
 * Info/tip callout box.
 */
const calloutBox = (html, { bgColor, borderColor, iconEmoji } = {}) => `
          <tr>
            <td style="padding:8px 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bgColor || BRAND.infoLight};border-radius:8px;border-left:4px solid ${borderColor || BRAND.infoColor};">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:${BRAND.textDark};font-size:13px;line-height:1.6;">
                      ${iconEmoji ? `${iconEmoji} ` : ''}${html}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;

/**
 * CTA (Call-to-Action) button.
 */
const ctaButton = (label, url, { bgColor } = {}) => `
          <tr>
            <td style="padding:8px 32px 24px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:${bgColor || BRAND.primaryColor};border-radius:8px;">
                    <a href="${url}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      ${label}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`;

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1: BOOKING CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════

const getBookingConfirmationTemplate = (data) => {
  const {
    customerName,
    hotelName,
    checkIn,
    checkOut,
    bookingId,
    amount,
    hotelAddress = '',
    roomDetails = [],
    rateConditions = {},
    cancellationPolicies = []
  } = data;
  const nights = calcNights(checkIn, checkOut);

  // Build room details HTML
  const buildRoomDetailsHtml = () => {
    if (!roomDetails || roomDetails.length === 0) return '';

    return roomDetails.map((room, index) => {
      const passengerCount = room.HotelPassenger?.length || 0;
      const adults = room.HotelPassenger?.filter(p => p.PaxType === 'Adult').length || 0;
      const children = room.HotelPassenger?.filter(p => p.PaxType === 'Child').length || 0;

      return `
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Room ${index + 1}</p>
                    <p style="margin:4px 0 0;color:${BRAND.textDark};font-size:15px;font-weight:600;">${room.RoomTypeName || room.name || 'Standard Room'}</p>
                    <p style="margin:2px 0 0;color:${BRAND.textMuted};font-size:13px;">${room.inclusion || room.mealType || 'Room Only'}</p>
                    <p style="margin:4px 0 0;color:${BRAND.textDark};font-size:13px;">
                      <strong>${adults}</strong> Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, <strong>${children}</strong> Child${children !== 1 ? 'ren' : ''}` : ''}
                    </p>
                  </td>
                </tr>
                ${index < roomDetails.length - 1 ? `<tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid ${BRAND.borderColor};margin:0;" /></td></tr>` : ''}
      `;
    }).join('');
  };

  // Build hotel policy HTML
  const buildHotelPolicyHtml = () => {
    const policies = [];

    if (rateConditions.checkInTimeBegin) {
      policies.push(`<strong>Check-in Time:</strong> From ${rateConditions.checkInTimeBegin}${rateConditions.checkInTimeEnd ? ` - ${rateConditions.checkInTimeEnd}` : ''}`);
    }
    if (rateConditions.checkOutTime) {
      policies.push(`<strong>Check-out Time:</strong> ${rateConditions.checkOutTime}`);
    }
    if (rateConditions.minimumCheckInAge) {
      policies.push(`<strong>Minimum Check-in Age:</strong> ${rateConditions.minimumCheckInAge}`);
    }
    if (rateConditions.cardsAccepted) {
      policies.push(`<strong>Cards Accepted:</strong> ${rateConditions.cardsAccepted}`);
    }
    if (rateConditions.specialInstructions) {
      policies.push(`<strong>Special Instructions:</strong> ${rateConditions.specialInstructions}`);
    }
    if (rateConditions.checkInInstructions) {
      // Strip HTML tags for email
      const instructions = rateConditions.checkInInstructions.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      policies.push(`<strong>Check-in Instructions:</strong> ${instructions}`);
    }
    if (rateConditions.otherPolicies && rateConditions.otherPolicies.length > 0) {
      rateConditions.otherPolicies.forEach(policy => {
        if (policy && !policy.includes('Cancellation Policy')) {
          policies.push(policy);
        }
      });
    }

    // Default early checkout policy
    policies.push('Early check out will attract full cancellation charge unless otherwise specified');

    if (policies.length === 0) return '';

    return `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid ${BRAND.borderColor};margin:0;" /></td></tr>
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Hotel Policy</p>
                    <div style="margin:8px 0 0;color:${BRAND.textDark};font-size:13px;line-height:1.6;">
                      ${policies.map(p => `<p style="margin:0 0 6px 0;">• ${p}</p>`).join('')}
                    </div>
                  </td>
                </tr>
    `;
  };

  // Build cancellation policy HTML
  const buildCancellationPolicyHtml = () => {
    if (!cancellationPolicies || cancellationPolicies.length === 0) return '';

    const policyRows = cancellationPolicies.map(policy => {
      const fromDate = policy.FromDate ? formatDate(policy.FromDate) : '-';
      const toDate = policy.ToDate ? formatDate(policy.ToDate) : '-';
      const charge = policy.ChargeType === 'Percentage'
        ? `${policy.CancellationCharge}%`
        : `₹${policy.CancellationCharge || 0}`;

      return `
                      <tr>
                        <td style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:12px;color:${BRAND.textDark};">${fromDate}</td>
                        <td style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:12px;color:${BRAND.textDark};">${toDate}</td>
                        <td style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:12px;color:${BRAND.dangerColor};font-weight:600;">${charge}</td>
                      </tr>
      `;
    }).join('');

    return `
                <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid ${BRAND.borderColor};margin:0;" /></td></tr>
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Cancellation Policy</p>
                    <p style="margin:4px 0 8px 0;color:${BRAND.textDark};font-size:13px;font-weight:600;">Room 01: ${roomDetails?.[0]?.RoomTypeName || roomDetails?.[0]?.name || 'Standard Room'}</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:8px;">
                      <thead>
                        <tr style="background-color:${BRAND.bgSection};">
                          <th style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:11px;text-align:left;color:${BRAND.textMuted};font-weight:600;">Cancelled on or After</th>
                          <th style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:11px;text-align:left;color:${BRAND.textMuted};font-weight:600;">Cancelled on or Before</th>
                          <th style="padding:8px;border:1px solid ${BRAND.borderColor};font-size:11px;text-align:left;color:${BRAND.textMuted};font-weight:600;">Cancellation Charges</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${policyRows}
                      </tbody>
                    </table>
                  </td>
                </tr>
    `;
  };

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #0d9f6e 0%, #10b981 50%, #34d399 100%)',
  icon: '✓',
  title: 'Booking Confirmed!',
  subtitle: 'Your reservation is all set',
})}
${greetingBlock(customerName)}
${textBlock(`Great news! Your booking at <strong style="color:${BRAND.textDark};">${hotelName}</strong> has been confirmed. Here are your reservation details:`)}

          <!-- Booking Details Card -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgSection};border-radius:10px;border:1px solid ${BRAND.borderColor};">
${detailRow('Booking ID', bookingId, { valueColor: BRAND.successColor, valueFontSize: '17px', valueFont: 'monospace' })}
${separator()}
${detailRow('Hotel', hotelName)}
${hotelAddress ? `
${separator()}
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Hotel Address</p>
                    <p style="margin:4px 0 0;color:${BRAND.textDark};font-size:14px;line-height:1.5;">${hotelAddress}</p>
                  </td>
                </tr>
` : ''}
${separator()}
                <!-- Check-in / Check-out side by side -->
                <tr>
                  <td style="padding:14px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Check-in</p>
                          <p style="margin:3px 0 0;color:${BRAND.textDark};font-size:14px;font-weight:600;">${formatDate(checkIn)}</p>
                        </td>
                        <td width="50%" style="vertical-align:top;">
                          <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Check-out</p>
                          <p style="margin:3px 0 0;color:${BRAND.textDark};font-size:14px;font-weight:600;">${formatDate(checkOut)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
${separator()}
${detailRow('Duration', `${nights} Night${nights !== 1 ? 's' : ''}`)}
${separator()}
${detailRow('Amount Paid', formatAmount(amount), { valueColor: BRAND.textDark, valueFontSize: '20px' })}
${roomDetails && roomDetails.length > 0 ? `
${separator()}
                <tr>
                  <td style="padding:14px 24px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;">Room Details</p>
                  </td>
                </tr>
${buildRoomDetailsHtml()}
` : ''}
${buildHotelPolicyHtml()}
${buildCancellationPolicyHtml()}
              </table>
            </td>
          </tr>

${calloutBox(
  `<strong>Tip:</strong> Please carry a valid photo ID at check-in. For any queries, contact us at <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: BRAND.successLight, borderColor: BRAND.successColor, iconEmoji: '💡' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2: PAYMENT SUCCESS
// ═══════════════════════════════════════════════════════════════════════════════

const getPaymentSuccessTemplate = (data) => {
  const { customerName, hotelName, bookingId, amount } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 50%, #669df6 100%)',
  icon: '₹',
  title: 'Payment Successful',
  subtitle: 'Your payment has been received',
})}
${greetingBlock(customerName)}
${textBlock(`We have successfully received your payment. Here's a summary of your transaction:`)}

          <!-- Payment Details Card -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgSection};border-radius:10px;border:1px solid ${BRAND.borderColor};">
${detailRow('Amount Paid', formatAmount(amount), { valueColor: BRAND.successColor, valueFontSize: '22px' })}
${separator()}
${detailRow('Booking ID', bookingId, { valueFont: 'monospace' })}
${separator()}
${detailRow('Hotel', hotelName)}
${separator()}
${detailRow('Status', '<span style="display:inline-block;background-color:#d1fae5;color:#065f46;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">PAID</span>')}
              </table>
            </td>
          </tr>

${calloutBox(
  `A booking confirmation email will follow shortly. If you don't receive it within 30 minutes, please contact <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: '#dbeafe', borderColor: BRAND.primaryColor, iconEmoji: '📧' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3: PAYMENT FAILED
// ═══════════════════════════════════════════════════════════════════════════════

const getPaymentFailedTemplate = (data) => {
  const { customerName, bookingId, amount } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
  icon: '✕',
  title: 'Payment Failed',
  subtitle: 'We could not process your payment',
})}
${greetingBlock(customerName)}
${textBlock(`Unfortunately, your payment could not be processed. Don't worry — no amount has been deducted from your account.`)}

          <!-- Failure Details Card -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.dangerLight};border-radius:10px;border:1px solid #fecaca;">
${bookingId ? detailRow('Booking ID', bookingId, { valueFont: 'monospace' }) : ''}
${bookingId ? separator() : ''}
${amount ? detailRow('Attempted Amount', formatAmount(amount)) : ''}
${amount ? separator() : ''}
${detailRow('Status', '<span style="display:inline-block;background-color:#fee2e2;color:#991b1b;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">FAILED</span>')}
              </table>
            </td>
          </tr>

${textBlock(`<strong>What you can do:</strong>`)}
          <tr>
            <td style="padding:4px 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:4px 0;color:${BRAND.textMuted};font-size:14px;line-height:1.7;">
                    • Ensure your card/bank account has sufficient funds<br/>
                    • Try a different payment method<br/>
                    • Wait a few minutes and try again<br/>
                    • Contact your bank if the issue persists
                  </td>
                </tr>
              </table>
            </td>
          </tr>

${calloutBox(
  `If the amount was deducted, it will be refunded within 5–7 business days. Need help? Contact <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.dangerColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: BRAND.warningLight, borderColor: BRAND.warningColor, iconEmoji: '⚠️' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4: OTP VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

const getOTPTemplate = (data) => {
  const { customerName, otp } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
  icon: '🔐',
  title: 'Verify Your Identity',
  subtitle: 'One-Time Password',
})}
${greetingBlock(customerName)}
${textBlock(`Use the following OTP to complete your verification. This code is valid for <strong>10 minutes</strong>.`)}

          <!-- OTP Display -->
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;background-color:${BRAND.bgSection};border-radius:12px;border:2px dashed ${BRAND.infoColor};">
                <tr>
                  <td style="padding:20px 48px;">
                    <p style="margin:0;color:${BRAND.textMuted};font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your OTP</p>
                    <p style="margin:8px 0 0;color:${BRAND.infoColor};font-size:36px;font-weight:800;letter-spacing:8px;font-family:monospace;">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

${calloutBox(
  `<strong>Important:</strong> Never share this OTP with anyone. ${BRAND.name} will never ask for your OTP via phone or email.`,
  { bgColor: BRAND.warningLight, borderColor: BRAND.warningColor, iconEmoji: '🔒' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5: CHECK-IN REMINDER
// ═══════════════════════════════════════════════════════════════════════════════

const getCheckinReminderTemplate = (data) => {
  const { customerName, hotelName, checkIn, bookingId } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%)',
  icon: '🔔',
  title: 'Check-in Reminder',
  subtitle: 'Your stay is approaching!',
})}
${greetingBlock(customerName)}
${textBlock(`This is a friendly reminder that your check-in at <strong style="color:${BRAND.textDark};">${hotelName}</strong> is coming up soon. We hope you're looking forward to your stay!`)}

          <!-- Reminder Details Card -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgSection};border-radius:10px;border:1px solid ${BRAND.borderColor};">
${detailRow('Hotel', hotelName)}
${separator()}
${detailRow('Check-in Date', formatDate(checkIn), { valueColor: BRAND.warningColor, valueFontSize: '16px' })}
${bookingId ? separator() : ''}
${bookingId ? detailRow('Booking ID', bookingId, { valueFont: 'monospace' }) : ''}
              </table>
            </td>
          </tr>

${textBlock(`<strong>Quick Checklist:</strong>`)}
          <tr>
            <td style="padding:4px 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:4px 0;color:${BRAND.textMuted};font-size:14px;line-height:1.7;">
                    ✅ Carry a valid government photo ID<br/>
                    ✅ Keep your booking confirmation handy<br/>
                    ✅ Check hotel check-in/check-out timings<br/>
                    ✅ Note the hotel's contact number
                  </td>
                </tr>
              </table>
            </td>
          </tr>

${calloutBox(
  `Have a wonderful stay! For any last-minute changes, contact <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: BRAND.warningLight, borderColor: BRAND.warningColor, iconEmoji: '🌟' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 6: BOOKING CANCELLATION
// ═══════════════════════════════════════════════════════════════════════════════

const getBookingCancellationTemplate = (data) => {
  const { customerName, hotelName, bookingId, amount } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
  icon: '✕',
  title: 'Booking Cancelled',
  subtitle: 'Your reservation has been cancelled',
})}
${greetingBlock(customerName)}
${textBlock(`We're sorry to see your plans change. Your booking at <strong style="color:${BRAND.textDark};">${hotelName}</strong> has been cancelled. Here's a summary:`)}

          <!-- Cancellation Details Card -->
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgSection};border-radius:10px;border:1px solid ${BRAND.borderColor};">
${detailRow('Booking ID', bookingId, { valueColor: BRAND.dangerColor, valueFontSize: '17px', valueFont: 'monospace' })}
${separator()}
${detailRow('Hotel', hotelName)}
${separator()}
${detailRow('Status', '<span style="display:inline-block;background-color:#fef3c7;color:#dc2626;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">CANCELLED</span>')}
${amount ? separator() : ''}
${amount ? detailRow('Refund Amount', formatAmount(amount), { valueColor: BRAND.successColor, valueFontSize: '20px' }) : ''}
              </table>
            </td>
          </tr>

${amount ? calloutBox(
  `Your refund of <strong>${formatAmount(amount)}</strong> will be processed within 5–7 business days to your original payment method.`,
  { bgColor: BRAND.successLight, borderColor: BRAND.successColor, iconEmoji: '💰' }
) : ''}

${textBlock(`Changed your mind? You can always book again on our platform. We'd love to help you find the perfect stay.`)}

${calloutBox(
  `Need help? Contact us at <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.dangerColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: BRAND.dangerLight, borderColor: BRAND.dangerColor, iconEmoji: '📞' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 7: REVIEW REQUEST (Admin Controlled)
// ═══════════════════════════════════════════════════════════════════════════════

const getReviewRequestTemplate = (data) => {
  const { customerName, hotelName, bookingId } = data;

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c4b5fd 100%)',
  icon: '⭐',
  title: 'How Was Your Stay?',
  subtitle: `We'd love your feedback`,
})}
${greetingBlock(customerName)}
${textBlock(`We hope you enjoyed your stay at <strong style="color:${BRAND.textDark};">${hotelName}</strong>! Your feedback helps us improve and helps fellow travelers make better choices.`)}

          <!-- Review Card -->
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgSection};border-radius:10px;border:1px solid ${BRAND.borderColor};">
                <tr>
                  <td style="padding:28px 24px;">
                    <p style="margin:0;font-size:36px;line-height:1;">⭐⭐⭐⭐⭐</p>
                    <p style="margin:12px 0 0;color:${BRAND.textDark};font-size:16px;font-weight:600;">Rate your experience</p>
                    <p style="margin:6px 0 0;color:${BRAND.textMuted};font-size:13px;">at ${hotelName}</p>
                    ${bookingId ? `<p style="margin:6px 0 0;color:${BRAND.textLight};font-size:11px;font-family:monospace;">Booking: ${bookingId}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

${textBlock(`Your review takes only a minute and makes a big difference. Thank you for choosing ${BRAND.name}!`)}

${calloutBox(
  `Questions about your recent stay? Reach out to <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.primaryColor};text-decoration:none;font-weight:600;">${BRAND.supportEmail}</a>`,
  { bgColor: '#ede9fe', borderColor: '#8b5cf6', iconEmoji: '💬' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 8: PROMOTIONAL OFFER (Admin Controlled)
// ═══════════════════════════════════════════════════════════════════════════════

const getOfferTemplate = (data) => {
  const { customerName, hotelName, amount } = data;
  const discountText = amount ? `${amount}%` : 'Special';

  return `${wrapperOpen()}
${headerBanner({
  bgGradient: 'linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)',
  icon: '🎉',
  title: `${discountText} OFF — Limited Time!`,
  subtitle: 'Exclusive deal just for you',
})}
${greetingBlock(customerName)}
${textBlock(`We've got an exclusive offer waiting for you! Book ${hotelName ? `at <strong style="color:${BRAND.textDark};">${hotelName}</strong>` : 'your next stay'} and enjoy amazing savings.`)}

          <!-- Offer Card -->
          <tr>
            <td style="padding:20px 32px;text-align:center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);border-radius:10px;border:2px dashed #f43f5e;">
                <tr>
                  <td style="padding:32px 24px;">
                    <p style="margin:0;color:#e11d48;font-size:48px;font-weight:800;line-height:1;">${discountText}</p>
                    <p style="margin:4px 0 0;color:#e11d48;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">DISCOUNT</p>
                    <p style="margin:12px 0 0;color:${BRAND.textMuted};font-size:14px;">on your next booking${hotelName ? ` at ${hotelName}` : ''}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

${ctaButton('Book Now →', '#', { bgColor: '#e11d48' })}

${calloutBox(
  `<strong>Hurry!</strong> This offer is available for a limited time only. Terms and conditions apply.`,
  { bgColor: BRAND.warningLight, borderColor: BRAND.warningColor, iconEmoji: '⏰' }
)}
${footerBlock()}
${wrapperClose()}`.trim();
};

// ─── Type → Template Mapping ────────────────────────────────────────────────────

const TEMPLATE_MAP = {
  booking_confirmation: getBookingConfirmationTemplate,
  payment_success: getPaymentSuccessTemplate,
  payment_failed: getPaymentFailedTemplate,
  otp_verification: getOTPTemplate,
  checkin_reminder: getCheckinReminderTemplate,
  booking_cancellation: getBookingCancellationTemplate,
  review_request: getReviewRequestTemplate,
  promotional_offer: getOfferTemplate,
};

/**
 * Retrieve the correct template function for a given email type.
 * @param {string} type – One of the TEMPLATE_MAP keys.
 * @returns {Function|null}
 */
const getTemplateByType = (type) => TEMPLATE_MAP[type] || null;

// ─── Exports ────────────────────────────────────────────────────────────────────

module.exports = {
  getBookingConfirmationTemplate,
  getPaymentSuccessTemplate,
  getPaymentFailedTemplate,
  getOTPTemplate,
  getCheckinReminderTemplate,
  getBookingCancellationTemplate,
  getReviewRequestTemplate,
  getOfferTemplate,
  getTemplateByType,
  TEMPLATE_MAP,
};
