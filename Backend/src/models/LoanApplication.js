import mongoose from 'mongoose';

export const LOAN_STATUS = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING_DOCUMENTS: 'Pending Documents',
};

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'Vehicle Title', 'Driver License'
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Received', 'Accepted', 'Rejected'],
    default: 'Received',
  },
  rejectionReason: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema({
  fromStatus: { type: String },
  toStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedByName: { type: String, default: 'System' },
  note: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
});

const internalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'Staff' },
  createdAt: { type: Date, default: Date.now },
});

const loanApplicationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    // Applicant Personal Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    zipCode: { type: String, default: '' },
    employmentStatus: { type: String, default: '' },

    // Vehicle Information
    vehicle: {
      year: { type: String, required: true },
      make: { type: String, required: true },
      model: { type: String, required: true },
      estimatedValue: { type: Number, default: 0 },
      mileage: { type: String, default: '' },
      vin: { type: String, default: '' },
    },

    // Loan Specifications
    amountRequested: { type: Number, required: true },
    reasonForFunds: { type: String, default: '' },
    urgency: { type: String, default: 'Immediately' },

    // Application Status & Read State
    status: {
      type: String,
      enum: Object.values(LOAN_STATUS),
      default: LOAN_STATUS.NEW,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Approval Decision & Terms
    approvedTerms: {
      loanAmount: { type: Number },
      interestRate: { type: Number }, // e.g. 18.5%
      repaymentMonths: { type: Number }, // e.g. 24 months
      monthlyPayment: { type: Number },
      approvedAt: { type: Date },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },

    // Rejection Decision
    rejectionReason: { type: String, default: '' },

    // Requested Documents Checklist
    requestedDocuments: [{ type: String }],

    // Uploaded Documents
    documents: [documentSchema],

    // Audit Trail & Logs
    statusHistory: [statusHistorySchema],
    internalNotes: [internalNoteSchema],
  },
  {
    timestamps: true,
  }
);

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);
export default LoanApplication;
