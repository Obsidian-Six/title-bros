import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import LoanApplication from '../models/LoanApplication.js';
import CommunicationLog from '../models/CommunicationLog.js';
import Session from '../models/Session.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Get all customers with search and pagination
 * @route   GET /api/v1/customers
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const getCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = { role: USER_ROLES.CUSTOMER };

  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  // Aggregate application counts for each customer
  const customerIds = customers.map((c) => c._id);
  const loanStats = await LoanApplication.aggregate([
    { $match: { customer: { $in: customerIds } } },
    {
      $group: {
        _id: '$customer',
        totalLoans: { $sum: 1 },
        activeLoan: {
          $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = {};
  loanStats.forEach((s) => {
    statsMap[s._id.toString()] = s;
  });

  const formattedCustomers = customers.map((c) => ({
    ...c.toObject(),
    totalApplications: statsMap[c._id.toString()]?.totalLoans || 0,
    hasActiveLoan: (statsMap[c._id.toString()]?.activeLoan || 0) > 0,
  }));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        customers: formattedCustomers,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      'Customer directory loaded.'
    )
  );
});

/**
 * @desc    Get full Customer 360 profile (Personal info, loans, documents, communications, notes)
 * @route   GET /api/v1/customers/:id
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const getCustomerDetail = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.params.id).select('-password');
  if (!customer) {
    throw new ApiError(404, 'Customer profile not found.');
  }

  const [applications, communications] = await Promise.all([
    LoanApplication.find({
      $or: [{ customer: customer._id }, { email: customer.email }],
    }).sort({ createdAt: -1 }),
    CommunicationLog.find({
      $or: [{ customer: customer._id }, { recipient: customer.email }, { recipient: customer.phone }],
    }).sort({ sentAt: -1 }),
  ]);

  // Extract all documents uploaded across customer's applications
  const allDocuments = [];
  applications.forEach((app) => {
    app.documents.forEach((doc) => {
      allDocuments.push({
        ...doc.toObject(),
        applicationId: app._id,
        vehicle: `${app.vehicle.year} ${app.vehicle.make} ${app.vehicle.model}`,
      });
    });
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        profile: customer,
        applications,
        documents: allDocuments,
        communicationHistory: communications,
      },
      'Customer 360 profile retrieved.'
    )
  );
});

/**
 * @desc    Manually create a walk-in customer profile
 * @route   POST /api/v1/customers/walk-in
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const createWalkInCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, notes } = req.body;

  if (!name || !email || !phone) {
    throw new ApiError(400, 'Name, email, and phone number are required for walk-in customers.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(400, 'A customer with this email address already exists.');
  }

  // Create customer account with random temp password
  const tempPassword = `WalkIn-${Math.random().toString(36).slice(-8)}!`;
  const customer = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: tempPassword,
    role: USER_ROLES.CUSTOMER,
    status: USER_STATUS.ACTIVE,
  });

  // Log initial walk-in communication entry
  await CommunicationLog.create({
    customer: customer._id,
    channel: 'EMAIL',
    recipient: customer.email,
    subject: 'Welcome to Title Bros Loans',
    message: `Hello ${name}, welcome to Title Bros! Your walk-in account has been created by our Las Vegas office team. Note: ${notes || 'Walk-in registration'}`,
    type: 'AUTOMATED',
    sentBy: req.user._id,
    sentByName: req.user.name,
    sentAt: new Date(),
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
      },
      'Walk-in customer profile created successfully.'
    )
  );
});

/**
 * @desc    Permanently delete customer and all associated records & uploaded files (Super Admin only)
 * @route   DELETE /api/v1/customers/:id
 * @access  Private (SUPER_ADMIN)
 */
export const deleteCustomerPermanently = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const customer = await User.findById(id);
  if (!customer) {
    throw new ApiError(404, 'Customer profile not found.');
  }

  if (customer.role !== USER_ROLES.CUSTOMER) {
    throw new ApiError(400, 'Only customer accounts can be deleted via this endpoint.');
  }

  // 1. Locate all loan applications associated with this customer
  const applications = await LoanApplication.find({
    $or: [{ customer: customer._id }, { email: customer.email.toLowerCase() }],
  });

  // 2. Safely remove physical document files on disk
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  for (const app of applications) {
    if (Array.isArray(app.documents)) {
      for (const doc of app.documents) {
        if (doc.filename) {
          const filePath = path.join(uploadsDir, 'documents', doc.filename);
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.warn(`Could not delete file ${filePath}:`, err.message);
          }
        }
      }
    }
  }

  // 3. Delete all loan applications
  await LoanApplication.deleteMany({
    $or: [{ customer: customer._id }, { email: customer.email.toLowerCase() }],
  });

  // 4. Delete all communication logs
  await CommunicationLog.deleteMany({
    $or: [
      { customer: customer._id },
      { recipient: customer.email.toLowerCase() },
      { recipient: customer.phone },
    ],
  });

  // 5. Invalidate and delete all user sessions
  await Session.deleteMany({ user: customer._id });

  // 6. Delete the user document permanently
  await User.findByIdAndDelete(customer._id);

  res.status(200).json(
    new ApiResponse(
      200,
      { deletedCustomerId: id },
      `Customer ${customer.name} and all related applications, documents, and records have been permanently deleted.`
    )
  );
});

