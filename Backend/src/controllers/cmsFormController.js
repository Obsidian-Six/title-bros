import CmsForm from '../models/CmsForm.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

import { sendEmail } from '../utils/emailService.js';

/**
 * @desc    Submit CMS form
 * @route   POST /api/v1/cms-forms
 * @access  Public
 */
export const submitForm = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required.');
  }

  const formSubmission = await CmsForm.create(req.body);

  // Send an email notification to the site admin via Gmail (Nodemailer)
  try {
    const adminEmail = process.env.SMTP_USER || 'admin@titlebros.com';
    await sendEmail({
      email: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${req.body.phone || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
  } catch (err) {
    console.error('Failed to send contact form email notification:', err);
  }

  res.status(201).json(new ApiResponse(201, formSubmission, 'Form submitted successfully.'));
});

/**
 * @desc    Get all CMS form submissions
 * @route   GET /api/v1/cms-forms
 * @access  Private (ADMIN)
 */
export const getFormSubmissions = asyncHandler(async (req, res) => {
  const submissions = await CmsForm.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, submissions, 'Form submissions retrieved.'));
});

/**
 * @desc    Mark form submission as read
 * @route   PATCH /api/v1/cms-forms/:id/read
 * @access  Private (ADMIN)
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const submission = await CmsForm.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!submission) throw new ApiError(404, 'Submission not found');
  res.status(200).json(new ApiResponse(200, submission, 'Marked as read.'));
});

/**
 * @desc    Delete a CMS form submission
 * @route   DELETE /api/v1/cms-forms/:id
 * @access  Private (ADMIN)
 */
export const deleteFormSubmission = asyncHandler(async (req, res) => {
  const submission = await CmsForm.findByIdAndDelete(req.params.id);
  if (!submission) throw new ApiError(404, 'Submission not found');
  res.status(200).json(new ApiResponse(200, null, 'Submission deleted successfully.'));
});
