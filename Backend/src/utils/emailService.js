/**
 * ==============================================================================
 * Email Service (Nodemailer with Title Bros Branding)
 * ==============================================================================
 * Dispatches transactional emails (such as Password Reset links) styled with
 * Title Bros brand identity (#087a45 primary green, #075a35 dark green, #101512 ink).
 * Includes a graceful fallback for local development if SMTP credentials are not set.
 */

import nodemailer from 'nodemailer';

/**
 * Sends an email using Nodemailer or logs to console if credentials are unset.
 * @param {Object} options - Email dispatch options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML formatted email body
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<Object>}
 */
export const sendEmail = async ({ email, subject, html, text }) => {
  const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (!hasSmtpConfig) {
    console.log('\n=============================================================');
    console.log('[EmailService Local Dev Notice] SMTP credentials not configured.');
    console.log(`[EmailService] Intended Recipient: ${email}`);
    console.log(`[EmailService] Subject: ${subject}`);
    console.log(`[EmailService] Content Preview / Text:\n${text || 'HTML Template dispatched'}`);
    console.log('=============================================================\n');
    return { devMode: true, message: 'Dispatched to dev console' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Title Bros Loans'}" <${process.env.EMAIL_FROM_ADDRESS || 'no-reply@titlebros.com'}>`,
    to: email,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Email sent successfully to ${email}. MessageId: ${info.messageId}`);
  return info;
};

/**
 * Generate Title Bros Branded Password Reset Email Template
 * @param {string} recipientName - User's name
 * @param {string} resetUrl - Complete clickable password reset URL
 * @param {number} expireMinutes - Validity window in minutes
 * @returns {string} - Styled HTML string
 */
export const getPasswordResetEmailTemplate = (recipientName, resetUrl, expireMinutes = 15) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Title Bros Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f8f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #101512;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f8f4; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid rgba(16, 21, 18, 0.08); box-shadow: 0 4px 24px rgba(16, 21, 18, 0.06);">
          <!-- Header Banner with Title Bros Signature Green -->
          <tr>
            <td style="background-color: #087a45; padding: 32px 40px; text-align: left;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 50%; width: 44px; height: 44px; text-align: center; vertical-align: middle;">
                    <span style="font-weight: 900; font-size: 20px; color: #087a45; line-height: 44px; display: inline-block;">TB</span>
                  </td>
                  <td style="padding-left: 14px;">
                    <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">TITLE BROS <span style="color: #b9ef3b;">LOANS</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #101512; letter-spacing: -0.3px;">
                Password Reset Request
              </h1>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #404642;">
                Hello <strong>${recipientName || 'Title Bros User'}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #404642;">
                We received a request to reset the password for your Title Bros account. Click the button below to choose a new password:
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #087a45;">
                    <a href="${resetUrl}" target="_blank" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; background-color: #087a45;">
                      Reset My Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.5; color: #68716b;">
                This link will expire in <strong>${expireMinutes} minutes</strong> for security. If you did not request this password reset, please ignore this email or reach out to our support team immediately.
              </p>

              <hr style="border: none; border-top: 1px solid rgba(16, 21, 18, 0.08); margin: 28px 0;">

              <!-- Fallback plain URL -->
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #8c9690; word-break: break-all;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #087a45; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f8f4; padding: 20px 40px; text-align: center; border-top: 1px solid rgba(16, 21, 18, 0.06);">
              <p style="margin: 0; font-size: 12px; color: #68716b;">
                &copy; ${new Date().getFullYear()} Title Bros Loans. All rights reserved. Las Vegas, Nevada.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
