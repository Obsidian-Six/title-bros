import LoanApplication, { LOAN_STATUS } from '../models/LoanApplication.js';
import User, { USER_ROLES, USER_STATUS } from '../models/User.js';
import CommunicationLog from '../models/CommunicationLog.js';
import Session from '../models/Session.js';
import { generateToken } from '../utils/token.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc    Submit a new loan application (Public or Customer)
 * @route   POST /api/v1/loans/apply
 * @access  Public / Authenticated
 */
export const submitApplication = asyncHandler(async (req, res) => {
  const vehicleYear = req.body.year || req.body.vehicleYear || '';
  const vehicleMake = req.body.make || req.body.vehicleMake || '';
  const vehicleModel = req.body.model || req.body.vehicleModel || '';
  const rawEstimatedValue = req.body.estimatedValue || req.body.estimate || 0;
  const firstName = (req.body.firstName || '').trim();
  const lastName = (req.body.lastName || '').trim();
  const phone = (req.body.phone || '').trim();
  const email = (req.body.email || '').toLowerCase().trim();
  const rawAmountRequested = req.body.amountRequested || req.body.desiredAmount || req.body.amount || 0;
  const reasonForFunds = req.body.reasonForFunds || req.body.loanPurpose || '';
  const employmentStatus = req.body.employmentStatus || req.body.employment || '';
  const zipCode = req.body.zipCode || req.body.zip || '';
  const urgency = req.body.urgency || 'Immediately';

  // Clean numeric currency inputs (e.g. "$5,000" -> 5000)
  const parseNumeric = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const cleanAmountRequested = parseNumeric(rawAmountRequested);
  const cleanEstimatedValue = parseNumeric(rawEstimatedValue);

  if (!vehicleYear || !vehicleMake || !vehicleModel || !firstName || !lastName || !phone || !email || cleanAmountRequested <= 0) {
    throw new ApiError(400, 'Please complete all required vehicle, personal, and loan amount fields.');
  }

  // 1. Resolve customer account link
  let customerUser = null;
  let customerId = null;
  let authToken = null;

  if (req.user && req.user.role === USER_ROLES.CUSTOMER) {
    customerUser = req.user;
    customerId = req.user._id;
  } else {
    // Look up customer by email (case-insensitive)
    customerUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!customerUser) {
      // Auto-provision a verified customer account so borrower can track their portal
      const tempPassword = `TB-${Math.random().toString(36).slice(-8)}!`;
      customerUser = await User.create({
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: tempPassword,
        role: USER_ROLES.CUSTOMER,
        status: USER_STATUS.ACTIVE,
      });
    }
    customerId = customerUser._id;

    // Create session and token for this customer so their browser can immediately access /portal
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await Session.create({
      user: customerUser._id,
      role: customerUser.role,
      ipAddress: req.ip || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
      isValid: true,
      lastActiveAt: new Date(),
      expiresAt,
    });

    authToken = generateToken({
      id: customerUser._id,
      role: customerUser.role,
      sessionId: session._id,
    });
  }

  // 2. Create the loan application in MongoDB
  const newLoan = await LoanApplication.create({
    customer: customerId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    email: email.toLowerCase().trim(),
    zipCode: zipCode || '',
    employmentStatus: employmentStatus || '',
    vehicle: {
      year: String(vehicleYear).trim(),
      make: vehicleMake.trim(),
      model: vehicleModel.trim(),
      estimatedValue: cleanEstimatedValue,
      mileage: req.body.mileage || req.body.vehicleMileage || '',
      vin: req.body.vin || '',
      trim: req.body.trim || req.body.vehicleTrim || '',
    },
    amountRequested: cleanAmountRequested,
    reasonForFunds: reasonForFunds || '',
    urgency: urgency || 'Immediately',
    status: LOAN_STATUS.NEW,
    statusHistory: [
      {
        toStatus: LOAN_STATUS.NEW,
        changedByName: 'Customer (Online)',
        note: 'Application submitted via online application form.',
        changedAt: new Date(),
      },
    ],
  });

  // 3. Log automated confirmation communication
  await CommunicationLog.create({
    customer: customerId,
    loan: newLoan._id,
    channel: 'EMAIL',
    recipient: email.toLowerCase().trim(),
    subject: 'Title Bros Loan Application Received',
    message: `Hello ${firstName}, your auto title loan application for your ${vehicleYear} ${vehicleMake} ${vehicleModel} (#${newLoan._id.toString().slice(-6).toUpperCase()}) has been received. Our loan team is reviewing it now.`,
    type: 'AUTOMATED',
    sentByName: 'Title Bros Auto-Bot',
    sentAt: new Date(),
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        loanId: newLoan._id,
        loan: newLoan,
        status: newLoan.status,
        customer: {
          _id: customerUser._id,
          name: customerUser.name,
          email: customerUser.email,
          phone: customerUser.phone,
          role: customerUser.role,
        },
        token: authToken,
      },
      'Loan application submitted successfully.'
    )
  );
});

/**
 * @desc    Get Admin Overview Summary Stats & Alerts
 * @route   GET /api/v1/loans/admin/stats
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const getAdminStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    totalToday,
    pendingReview,
    unreadCount,
    approvedThisWeek,
    activeLoans,
    totalCustomers,
    recentApplications,
    waitingOver24h,
  ] = await Promise.all([
    LoanApplication.countDocuments({ createdAt: { $gte: startOfToday } }),
    LoanApplication.countDocuments({
      status: { $in: [LOAN_STATUS.NEW, LOAN_STATUS.UNDER_REVIEW, LOAN_STATUS.PENDING_DOCUMENTS] },
    }),
    LoanApplication.countDocuments({ isRead: false }),
    LoanApplication.countDocuments({
      status: LOAN_STATUS.APPROVED,
      updatedAt: { $gte: startOfWeek },
    }),
    LoanApplication.countDocuments({ status: LOAN_STATUS.APPROVED }),
    User.countDocuments({ role: USER_ROLES.CUSTOMER }),
    LoanApplication.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email phone vehicle amountRequested status isRead createdAt')
      .lean(),
    LoanApplication.find({
      status: { $in: [LOAN_STATUS.NEW, LOAN_STATUS.UNDER_REVIEW] },
      createdAt: { $lte: twentyFourHoursAgo },
    })
      .sort({ createdAt: 1 })
      .limit(5)
      .select('firstName lastName vehicle amountRequested createdAt status isRead')
      .lean(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalToday,
        pendingReview,
        unreadCount,
        approvedThisWeek,
        activeLoans,
        totalCustomers,
        recentApplications,
        alerts: {
          waitingOver24hCount: waitingOver24h.length,
          waitingOver24hItems: waitingOver24h,
        },
      },
      'Admin statistics loaded.'
    )
  );
});

/**
 * @desc    Get all loans with search, status filters, and pagination
 * @route   GET /api/v1/loans
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const getAllLoans = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status && status !== 'All') {
    filter.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { 'vehicle.make': searchRegex },
      { 'vehicle.model': searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [loans, total] = await Promise.all([
    LoanApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    LoanApplication.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        loans,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      'Loans list retrieved.'
    )
  );
});

/**
 * @desc    Get single loan application details by ID
 * @route   GET /api/v1/loans/:id
 * @access  Private
 */
export const getLoanById = asyncHandler(async (req, res) => {
  const loan = await LoanApplication.findById(req.params.id)
    .populate('customer', 'name email phone status createdAt')
    .populate('statusHistory.changedBy', 'name role')
    .populate('internalNotes.author', 'name role');

  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  // Customer authorization check: customers can only view their own loan
  if (
    req.user.role === USER_ROLES.CUSTOMER &&
    loan.customer?._id?.toString() !== req.user._id.toString() &&
    loan.email !== req.user.email
  ) {
    throw new ApiError(403, 'Unauthorized to view this loan application.');
  }

  // When staff reads the loan, mark isRead as true so notification clears
  if (
    (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN) &&
    !loan.isRead
  ) {
    loan.isRead = true;
    await loan.save();
  }

  res.status(200).json(new ApiResponse(200, loan, 'Loan details retrieved.'));
});

/**
 * @desc    Update loan status (Approve, Reject, Request Docs, Under Review)
 * @route   PATCH /api/v1/loans/:id/status
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const updateLoanStatus = asyncHandler(async (req, res) => {
  const { status, approvedTerms, rejectionReason, requestedDocuments, note } = req.body;

  if (!Object.values(LOAN_STATUS).includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${Object.values(LOAN_STATUS).join(', ')}`);
  }

  const loan = await LoanApplication.findById(req.params.id);
  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  const previousStatus = loan.status;
  loan.status = status;

  let auditNote = note || `Status updated from ${previousStatus} to ${status}`;

  // 1. Approval Logic
  if (status === LOAN_STATUS.APPROVED) {
    if (!approvedTerms?.loanAmount || !approvedTerms?.interestRate || !approvedTerms?.repaymentMonths) {
      throw new ApiError(400, 'Approval requires loan amount, interest rate, and repayment terms in months.');
    }

    const principal = Number(approvedTerms.loanAmount);
    const rate = Number(approvedTerms.interestRate) / 100 / 12;
    const months = Number(approvedTerms.repaymentMonths);

    // Standard amortization monthly payment calculation
    const monthly =
      rate > 0
        ? (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
        : principal / months;

    loan.approvedTerms = {
      loanAmount: principal,
      interestRate: Number(approvedTerms.interestRate),
      repaymentMonths: months,
      monthlyPayment: Math.round(monthly * 100) / 100,
      approvedAt: new Date(),
      approvedBy: req.user._id,
    };
    loan.rejectionReason = '';

    auditNote = `Approved for $${principal} at ${approvedTerms.interestRate}% over ${months} months.`;

    // Log approval notice
    await CommunicationLog.create({
      customer: loan.customer,
      loan: loan._id,
      channel: 'EMAIL',
      recipient: loan.email,
      subject: 'Congratulations! Your Title Bros Loan is Approved',
      message: `Great news! Your auto title loan for your ${loan.vehicle.year} ${loan.vehicle.make} ${loan.vehicle.model} has been APPROVED for $${principal}. Next step: Visit our office to sign your agreement and pick up your funds!`,
      type: 'AUTOMATED',
      sentBy: req.user._id,
      sentByName: req.user.name,
      sentAt: new Date(),
    });
  }

  // 2. Rejection Logic
  if (status === LOAN_STATUS.REJECTED) {
    loan.rejectionReason = rejectionReason || 'Criteria not met';
    auditNote = `Application rejected. Reason: ${loan.rejectionReason}`;

    // Log rejection notification
    await CommunicationLog.create({
      customer: loan.customer,
      loan: loan._id,
      channel: 'EMAIL',
      recipient: loan.email,
      subject: 'Update Regarding Your Title Bros Loan Application',
      message: `Thank you for applying. We are currently unable to approve your application for the following reason: ${loan.rejectionReason}. Feel free to contact our office to discuss alternative options.`,
      type: 'AUTOMATED',
      sentBy: req.user._id,
      sentByName: req.user.name,
      sentAt: new Date(),
    });
  }

  // 3. Request Documents Logic
  if (status === LOAN_STATUS.PENDING_DOCUMENTS) {
    if (Array.isArray(requestedDocuments) && requestedDocuments.length > 0) {
      loan.requestedDocuments = requestedDocuments;
      auditNote = `Requested documents: ${requestedDocuments.join(', ')}`;
    }

    // Log instructions to customer
    await CommunicationLog.create({
      customer: loan.customer,
      loan: loan._id,
      channel: 'SMS',
      recipient: loan.phone,
      subject: 'Action Needed: Documents Required for Title Bros Loan',
      message: `Title Bros Notice: Additional documents are required to complete your loan review: ${loan.requestedDocuments.join(', ')}. Please log in to your portal to upload them securely.`,
      type: 'AUTOMATED',
      sentBy: req.user._id,
      sentByName: req.user.name,
      sentAt: new Date(),
    });
  }

  // Record timestamped audit history
  loan.statusHistory.push({
    fromStatus: previousStatus,
    toStatus: status,
    changedBy: req.user._id,
    changedByName: req.user.name,
    note: auditNote,
    changedAt: new Date(),
  });

  await loan.save();

  res.status(200).json(new ApiResponse(200, loan, `Loan status updated to ${status}.`));
});

/**
 * @desc    Add internal note to loan application
 * @route   POST /api/v1/loans/:id/notes
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const addLoanNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  if (!note || !note.trim()) {
    throw new ApiError(400, 'Note content cannot be empty.');
  }

  const loan = await LoanApplication.findById(req.params.id);
  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  const newNote = {
    note: note.trim(),
    author: req.user._id,
    authorName: req.user.name,
    createdAt: new Date(),
  };

  loan.internalNotes.push(newNote);
  await loan.save();

  res.status(201).json(new ApiResponse(201, newNote, 'Internal note added successfully.'));
});

/**
 * @desc    Upload document to loan application (Customer or Admin)
 * @route   POST /api/v1/loans/:id/documents
 * @access  Private
 */
export const uploadLoanDoc = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select a file to upload.');
  }

  const loan = await LoanApplication.findById(req.params.id);
  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  const documentName = req.body.documentName || req.file.originalname;

  const newDoc = {
    name: documentName,
    originalName: req.file.originalname,
    filename: req.file.filename,
    path: `/uploads/documents/${req.file.filename}`,
    mimetype: req.file.mimetype,
    size: req.file.size,
    status: 'Received',
    uploadedAt: new Date(),
  };

  loan.documents.push(newDoc);

  // If loan was pending documents, log upload event
  loan.statusHistory.push({
    fromStatus: loan.status,
    toStatus: loan.status,
    changedBy: req.user._id,
    changedByName: req.user.name,
    note: `Document uploaded: ${documentName} (${req.file.originalname})`,
    changedAt: new Date(),
  });

  await loan.save();

  res.status(201).json(new ApiResponse(201, newDoc, 'Document uploaded successfully.'));
});

/**
 * @desc    Review uploaded document (Accept / Reject)
 * @route   PATCH /api/v1/loans/:id/documents/:docId
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const reviewLoanDoc = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    throw new ApiError(400, "Document status must be either 'Accepted' or 'Rejected'.");
  }

  const loan = await LoanApplication.findById(req.params.id);
  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  const doc = loan.documents.id(req.params.docId);
  if (!doc) {
    throw new ApiError(404, 'Document record not found.');
  }

  doc.status = status;
  doc.rejectionReason = status === 'Rejected' ? rejectionReason || 'Document unreadable' : '';

  loan.statusHistory.push({
    fromStatus: loan.status,
    toStatus: loan.status,
    changedBy: req.user._id,
    changedByName: req.user.name,
    note: `Document '${doc.name}' marked as ${status}${doc.rejectionReason ? ` (${doc.rejectionReason})` : ''}.`,
    changedAt: new Date(),
  });

  await loan.save();

  res.status(200).json(new ApiResponse(200, doc, `Document marked as ${status}.`));
});

/**
 * @desc    Get customer's own loan applications
 * @route   GET /api/v1/loans/my-applications
 * @access  Private (Customer)
 */
export const getMyApplications = asyncHandler(async (req, res) => {
  const emailRegex = new RegExp(`^${(req.user.email || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  const filter = {
    $or: [
      { customer: req.user._id },
      { email: emailRegex },
    ],
  };

  const userLoans = await LoanApplication.find(filter).sort({ createdAt: -1 }).lean();

  // If staff/superadmin is viewing the portal for testing, include all loans if they have no personal customer loans
  if (userLoans.length === 0 && (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN)) {
    const allLoans = await LoanApplication.find({}).sort({ createdAt: -1 }).limit(20).lean();
    return res.status(200).json(new ApiResponse(200, allLoans, 'Your applications loaded.'));
  }

  res.status(200).json(new ApiResponse(200, userLoans, 'Your applications loaded.'));
});

/**
 * @desc    Mark loan application as read by staff
 * @route   PATCH /api/v1/loans/:id/read
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
export const markLoanAsRead = asyncHandler(async (req, res) => {
  const loan = await LoanApplication.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  );

  if (!loan) {
    throw new ApiError(404, 'Loan application not found.');
  }

  res.status(200).json(new ApiResponse(200, loan, 'Loan marked as read.'));
});

/**
 * @desc    Dynamic geocoding proxy (Worldwide & United Kingdom coverage)
 * @route   GET /api/v1/loans/geocode
 * @access  Public
 */
export const geocodeAddress = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(200).json(new ApiResponse(200, [], 'Query too short'));
  }

  const queryText = q.trim();
  const results = [];
  const seen = new Set();

  const isUKPostcodeLike = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9]?[A-Z]{0,2}$/i.test(queryText);

  // 1. If query looks like a UK postcode, query postcodes.io first
  if (isUKPostcodeLike) {
    try {
      const cleanPc = queryText.replace(/\s+/g, '');
      const pcRes = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(cleanPc)}&limit=5`, {
        signal: AbortSignal.timeout(3000),
      });
      if (pcRes.ok) {
        const pcData = await pcRes.json();
        if (Array.isArray(pcData.result)) {
          for (const item of pcData.result) {
            const pc = item.postcode;
            const city = item.admin_district || item.parish || 'London';
            const state = item.region || item.admin_county || 'Greater London';
            const country = item.country || 'United Kingdom';
            const key = `${pc}-${city}`.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                id: `pc-${item.postcode}`,
                primary: `${pc}, ${city}`,
                secondary: `${state}, ${country}`,
                fullText: `${pc}, ${city}, ${state}, ${country}`,
                source: 'postcodes.io',
                parsed: {
                  street: '',
                  city,
                  state,
                  zipCode: pc,
                  country,
                },
              });
            }
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  // 2. Open-Meteo Fast Global Geocoding (super fast, sub-100ms)
  try {
    const omRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(queryText)}&count=5&language=en&format=json`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (omRes.ok) {
      const omData = await omRes.json();
      if (Array.isArray(omData.results)) {
        for (const item of omData.results) {
          const city = item.name || '';
          const state = item.admin2 || item.admin1 || '';
          const country = item.country || '';
          const postcode = item.postcodes?.[0] || '';
          const key = `${city}-${state}-${country}`.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            const secondary = [state, country].filter(Boolean).join(', ');
            results.push({
              id: `om-${item.id}`,
              primary: city,
              secondary,
              fullText: `${city}${secondary ? `, ${secondary}` : ''}`,
              source: 'open-meteo',
              parsed: {
                street: '',
                city,
                state,
                zipCode: postcode,
                country,
              },
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  // 3. Photon OpenStreetMap Geocoding (streets, venues, postcodes)
  try {
    const phRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(queryText)}&limit=6`,
      {
        headers: { 'User-Agent': 'TitleBrosApp/1.0' },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (phRes.ok) {
      const phData = await phRes.json();
      if (Array.isArray(phData.features)) {
        for (const feat of phData.features) {
          const p = feat.properties || {};
          const house = p.housenumber ? `${p.housenumber} ` : '';
          const street = p.street || p.name || '';
          const city = p.city || p.town || p.district || p.suburb || '';
          const state = p.state || p.county || '';
          const postcode = p.postcode || '';
          const country = p.country || '';

          const primary = `${house}${street}`.trim() || p.name || city;
          const secondary = [city, state, postcode, country].filter(Boolean).join(', ');
          const key = `${primary}-${city}-${postcode}`.toLowerCase();

          if (primary && !seen.has(key)) {
            seen.add(key);
            results.push({
              id: `ph-${p.osm_id || Math.random()}`,
              primary,
              secondary,
              fullText: `${primary}${secondary ? `, ${secondary}` : ''}`,
              source: 'photon',
              parsed: {
                street: `${house}${p.street || p.name || ''}`.trim(),
                city,
                state,
                zipCode: postcode,
                country,
              },
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore
  }

  return res.status(200).json(new ApiResponse(200, results.slice(0, 8), 'Geocode suggestions loaded.'));
});
