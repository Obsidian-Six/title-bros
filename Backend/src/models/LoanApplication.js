// import mongoose from 'mongoose';

// export const LOAN_STATUS = {
//   NEW: 'New',
//   UNDER_REVIEW: 'Under Review',
//   APPROVED: 'Approved',
//   REJECTED: 'Rejected',
//   PENDING_DOCUMENTS: 'Pending Documents',
// };

// const documentSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // e.g. 'Vehicle Title', 'Driver License'
//   originalName: { type: String, required: true },
//   filename: { type: String, required: true },
//   path: { type: String, required: true },
//   mimetype: { type: String, required: true },
//   size: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ['Received', 'Accepted', 'Rejected'],
//     default: 'Received',
//   },
//   rejectionReason: { type: String, default: '' },
//   uploadedAt: { type: Date, default: Date.now },
// });

// const statusHistorySchema = new mongoose.Schema({
//   fromStatus: { type: String },
//   toStatus: { type: String, required: true },
//   changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   changedByName: { type: String, default: 'System' },
//   note: { type: String, default: '' },
//   changedAt: { type: Date, default: Date.now },
// });

// const internalNoteSchema = new mongoose.Schema({
//   note: { type: String, required: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   authorName: { type: String, default: 'Staff' },
//   createdAt: { type: Date, default: Date.now },
// });

// const loanApplicationSchema = new mongoose.Schema(
//   {
//     customer: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       index: true,
//     },
//     // Applicant Personal Information
//     firstName: { type: String, required: true, trim: true },
//     lastName: { type: String, required: true, trim: true },
//     phone: {
//       type: String,
//       required: true,
//       trim: true,
//       index: true,
//       validate: {
//         validator: function (v) {
//           const digits = v.replace(/\D/g, "");
//           return digits.length === 10;
//         },
//         message: props => `${props.value} is not a valid 10-digit US phone number.`
//       }
//     },
//     email: { type: String, required: true, lowercase: true, trim: true, index: true },
//     zipCode: {
//       type: String,
//       default: '',
//       validate: {
//         validator: function (v) {
//           return !v || /^\d{5}(?:-\d{4})?$/.test(v.trim());
//         },
//         message: props => `${props.value} is not a valid US ZIP code.`
//       }
//     },
//     employmentStatus: { type: String, default: '' },

//     // Vehicle Information
//     vehicle: {
//       year: { type: String, required: true },
//       make: { type: String, required: true },
//       model: { type: String, required: true },
//       estimatedValue: { type: Number, default: 0 },
//       mileage: { type: String, default: '' },
//       vin: {
//         type: String,
//         default: '',
//         validate: {
//           validator: function (v) {
//             // If empty, pass. If provided, must be 17 chars and no I,O,Q.
//             return !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
//           },
//           message: props => `${props.value} is not a valid 17-character VIN (cannot contain I, O, or Q).`
//         }
//       },
//     },

//     // Loan Specifications
//     amountRequested: { type: Number, required: true },
//     loanType: {
//       type: String,
//       enum: ["title-loan", "personal-loan"],
//       required: true,
//       index: true,
//     },
//     reasonForFunds: { type: String, default: '' },
//     urgency: { type: String, default: 'Immediately' },

//     // Application Status & Read State
//     status: {
//       type: String,
//       enum: Object.values(LOAN_STATUS),
//       default: LOAN_STATUS.NEW,
//       index: true,
//     },
//     isRead: {
//       type: Boolean,
//       default: false,
//       index: true,
//     },

//     // Approval Decision & Terms
//     approvedTerms: {
//       loanAmount: { type: Number },
//       interestRate: { type: Number }, // e.g. 18.5%
//       repaymentMonths: { type: Number }, // e.g. 24 months
//       monthlyPayment: { type: Number },
//       approvedAt: { type: Date },
//       approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//       paymentPlanType: {
//         type: String,
//         enum: ["single", "installment"],
//         default: "installment",
//       },

//       frequency: {
//         type: String,
//         enum: ["weekly", "bi-weekly", "monthly", "single"],
//         default: "monthly",
//       },

//       numberOfPayments: {
//         type: Number,
//       },

//       firstDueDate: {
//         type: Date,
//       },
//     },

//     // Rejection Decision
//     rejectionReason: { type: String, default: '' },

//     // Requested Documents Checklist
//     requestedDocuments: [{ type: String }],

//     // Uploaded Documents
//     documents: [documentSchema],

//     // Audit Trail & Logs
//     statusHistory: [statusHistorySchema],
//     internalNotes: [internalNoteSchema],
//   },
//   {
//     timestamps: true,
//   }
// );

// // High-speed compound indexes for underwriting queries and customer lookups
// loanApplicationSchema.index({ status: 1, createdAt: -1 });
// loanApplicationSchema.index({ customer: 1, createdAt: -1 });
// loanApplicationSchema.index({ email: 1, createdAt: -1 });
// loanApplicationSchema.index({ isRead: 1 });
// loanApplicationSchema.index({ createdAt: -1 });

// const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);
// export default LoanApplication;


import mongoose from 'mongoose';

export const LOAN_STATUS = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING_DOCUMENTS: 'Pending Documents',
};

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  originalName: {
    type: String,
    required: true,
  },

  filename: {
    type: String,
    required: true,
  },

  path: {
    type: String,
    required: true,
  },

  mimetype: {
    type: String,
    required: true,
  },

  size: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ['Received', 'Accepted', 'Rejected'],
    default: 'Received',
  },

  rejectionReason: {
    type: String,
    default: '',
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const statusHistorySchema = new mongoose.Schema({
  fromStatus: {
    type: String,
  },

  toStatus: {
    type: String,
    required: true,
  },

  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  changedByName: {
    type: String,
    default: 'System',
  },

  note: {
    type: String,
    default: '',
  },

  changedAt: {
    type: Date,
    default: Date.now,
  },
});

const internalNoteSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true,
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  authorName: {
    type: String,
    default: 'Staff',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const loanApplicationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // ==========================================
    // APPLICANT PERSONAL INFORMATION
    // ==========================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,

      validate: {
        validator: function (v) {
          const digits = v.replace(/\D/g, '');
          return digits.length === 10;
        },

        message: props =>
          `${props.value} is not a valid 10-digit US phone number.`,
      },
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    zipCode: {
      type: String,
      default: '',

      validate: {
        validator: function (v) {
          return !v || /^\d{5}(?:-\d{4})?$/.test(v.trim());
        },

        message: props =>
          `${props.value} is not a valid US ZIP code.`,
      },
    },

    employmentStatus: {
      type: String,
      default: '',
    },

    // ==========================================
    // LOAN TYPE
    // ==========================================

    loanType: {
      type: String,
      enum: ['title-loan', 'personal-loan'],
      required: true,
      index: true,
    },

    // ==========================================
    // VEHICLE INFORMATION
    // ==========================================
    // Vehicle is ONLY required for Title Loan.
    // Backend/controller will enforce this based
    // on loanType.
    // ==========================================

    vehicle: {
      year: {
        type: String,
        default: '',
      },

      make: {
        type: String,
        default: '',
      },

      model: {
        type: String,
        default: '',
      },

      trim: {
        type: String,
        default: '',
      },

      estimatedValue: {
        type: Number,
        default: 0,
      },

      mileage: {
        type: String,
        default: '',
      },

      vin: {
        type: String,
        default: '',

        validate: {
          validator: function (v) {
            // Empty VIN is allowed.
            // If provided, it must be a valid 17-character VIN.
            return !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
          },

          message: props =>
            `${props.value} is not a valid 17-character VIN (cannot contain I, O, or Q).`,
        },
      },

      condition: {
        type: String,
        default: '',
      },

      color: {
        type: String,
        default: '',
      },

      titleStatus: {
        type: String,
        default: '',
      },

      existingLien: {
        type: String,
        default: '',
      },

      lienAmount: {
        type: Number,
        default: 0,
      },
    },

    // ==========================================
    // LOAN SPECIFICATIONS
    // ==========================================

    amountRequested: {
      type: Number,
      required: true,
    },

    reasonForFunds: {
      type: String,
      default: '',
    },

    urgency: {
      type: String,
      default: 'Immediately',
    },

    // ==========================================
    // APPLICATION STATUS
    // ==========================================

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

    // ==========================================
    // APPROVAL DECISION & TERMS
    // ==========================================

    approvedTerms: {
      loanAmount: {
        type: Number,
      },

      interestRate: {
        type: Number,
      },

      repaymentMonths: {
        type: Number,
      },

      monthlyPayment: {
        type: Number,
      },

      approvedAt: {
        type: Date,
      },

      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

      paymentPlanType: {
        type: String,
        enum: ['single', 'installment'],
        default: 'installment',
      },

      frequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly', 'single'],
        default: 'monthly',
      },

      numberOfPayments: {
        type: Number,
      },

      firstDueDate: {
        type: Date,
      },
    },

    // ==========================================
    // REJECTION
    // ==========================================

    rejectionReason: {
      type: String,
      default: '',
    },

    // ==========================================
    // DOCUMENTS
    // ==========================================

    requestedDocuments: [
      {
        type: String,
      },
    ],

    documents: [documentSchema],

    // ==========================================
    // AUDIT TRAIL
    // ==========================================

    statusHistory: [statusHistorySchema],

    internalNotes: [internalNoteSchema],
  },

  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

loanApplicationSchema.index({
  status: 1,
  createdAt: -1,
});

loanApplicationSchema.index({
  customer: 1,
  createdAt: -1,
});

loanApplicationSchema.index({
  email: 1,
  createdAt: -1,
});

loanApplicationSchema.index({
  isRead: 1,
});

loanApplicationSchema.index({
  createdAt: -1,
});

const LoanApplication = mongoose.model(
  'LoanApplication',
  loanApplicationSchema
);

export default LoanApplication;