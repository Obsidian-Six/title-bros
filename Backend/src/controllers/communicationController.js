import CommunicationLog from '../models/CommunicationLog.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/emailService.js';

/**
 * @desc    Get all communication logs (Emails & SMS)
 * @route   GET /api/v1/communications
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const getCommunicationLogs = asyncHandler(async (req, res) => {
  const { channel, type, search, page = 1, limit = 25 } = req.query;
  const filter = {};

  if (channel && channel !== 'ALL') {
    filter.channel = channel.toUpperCase();
  }

  if (type && type !== 'ALL') {
    filter.type = type.toUpperCase();
  }

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ recipient: regex }, { subject: regex }, { message: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    CommunicationLog.find(filter)
      .populate('customer', 'name email phone')
      .populate('sentBy', 'name role')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    CommunicationLog.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        logs,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      'Communication logs retrieved.'
    )
  );
});

/**
 * @desc    Send manual custom message (Email or SMS) to customer
 * @route   POST /api/v1/communications/send
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const sendManualMessage = asyncHandler(async (req, res) => {
  const { recipient, channel, subject, message, customerId, loanId } = req.body;

  if (!recipient || !message || !channel) {
    throw new ApiError(400, 'Recipient, channel (EMAIL/SMS), and message body are required.');
  }

  const validChannel = channel.toUpperCase();
  if (!['EMAIL', 'SMS'].includes(validChannel)) {
    throw new ApiError(400, "Channel must be 'EMAIL' or 'SMS'.");
  }

  // If Email, dispatch via emailService
  if (validChannel === 'EMAIL') {
    await sendEmail({
      email: recipient,
      subject: subject || 'Message from Title Bros Loans',
      text: message,
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #f7f8f4; color: #101512;">
          <h2 style="color: #087a45; margin-top: 0;">Title Bros Loans</h2>
          <p style="font-size: 15px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
          <hr style="border: none; border-top: 1px solid rgba(16,21,18,0.1); margin: 20px 0;"/>
          <p style="font-size: 12px; color: #68716b;">Title Bros Loans • Las Vegas, NV</p>
        </div>
      `,
    });
  }

  // Create audit log entry
  const logEntry = await CommunicationLog.create({
    customer: customerId || null,
    loan: loanId || null,
    channel: validChannel,
    recipient: recipient.trim(),
    subject: subject || (validChannel === 'SMS' ? 'SMS Notice' : 'Email Notice'),
    message: message.trim(),
    type: 'MANUAL',
    sentBy: req.user._id,
    sentByName: req.user.name,
    sentAt: new Date(),
  });

  res.status(201).json(
    new ApiResponse(201, logEntry, `Custom ${validChannel} message dispatched and recorded.`)
  );
});
