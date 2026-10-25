// import mongoose from "mongoose";

// const installmentSchema = new mongoose.Schema(
//     {
//         installmentNumber: {
//             type: Number,
//             required: true,
//         },

//         dueDate: {
//             type: Date,
//             required: true,
//         },

//         amountDue: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         principalAmount: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         interestAmount: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         lateFee: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         amountPaid: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         remainingAmount: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         status: {
//             type: String,
//             enum: ["pending", "partial", "paid", "overdue"],
//             default: "pending",
//         },

//         paidAt: {
//             type: Date,
//             default: null,
//         },
//         arrangementMade: {
//             type: Boolean,
//             default: false,
//         },

//         arrangementNote: {
//             type: String,
//             default: "",
//             trim: true,
//         },

//         arrangementMadeAt: {
//             type: Date,
//             default: null,
//         },

//         arrangementMadeBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null,
//         },
//     },
//     { _id: true }
// );

// const repaymentScheduleSchema = new mongoose.Schema(
//     {
//         loanApplication: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "LoanApplication",
//             required: true,
//             unique: true,
//             index: true,
//         },

//         paymentPlanType: {
//             type: String,
//             enum: ["single", "installment"],
//             required: true,
//         },

//         frequency: {
//             type: String,
//             enum: ["weekly", "bi-weekly", "monthly", "single"],
//             required: true,
//         },

//         numberOfPayments: {
//             type: Number,
//             required: true,
//             min: 1,
//         },

//         firstDueDate: {
//             type: Date,
//             required: true,
//         },

//         totalPrincipal: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         totalInterest: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         totalScheduledAmount: {
//             type: Number,
//             required: true,
//             min: 0,
//         },

//         totalPaid: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         remainingBalance: {
//             type: Number,
//             default: 0,
//             min: 0,
//         },

//         status: {
//             type: String,
//             enum: ["active", "completed", "overdue", "cancelled"],
//             default: "active",
//             index: true,
//         },

//         installments: {
//             type: [installmentSchema],
//             default: [],
//         },

//         createdBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         },

//         updatedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// repaymentScheduleSchema.index({
//     status: 1,
//     firstDueDate: 1,
// });

// repaymentScheduleSchema.index({
//     "installments.dueDate": 1,
//     "installments.status": 1,
// });

// const RepaymentSchedule = mongoose.model(
//     "RepaymentSchedule",
//     repaymentScheduleSchema
// );

// export default RepaymentSchedule;


import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema(
  {
    installmentNumber: {
      type: Number,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    amountDue: {
      type: Number,
      required: true,
      min: 0,
    },

    principalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    interestAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Late fee assessed on this installment.
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Amount of the late fee already paid.
    lateFeePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Principal + interest paid.
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Remaining principal + interest.
    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    arrangementMade: {
      type: Boolean,
      default: false,
    },

    arrangementNote: {
      type: String,
      default: "",
      trim: true,
    },

    arrangementMadeAt: {
      type: Date,
      default: null,
    },

    arrangementMadeBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true }
);

const repaymentScheduleSchema = new mongoose.Schema(
  {
    loanApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      unique: true,
      index: true,
    },

    paymentPlanType: {
      type: String,
      enum: ["single", "installment"],
      required: true,
    },

    frequency: {
      type: String,
      enum: ["weekly", "bi-weekly", "monthly", "single"],
      required: true,
    },

    numberOfPayments: {
      type: Number,
      required: true,
      min: 1,
    },

    firstDueDate: {
      type: Date,
      required: true,
    },

    totalPrincipal: {
      type: Number,
      required: true,
      min: 0,
    },

    totalInterest: {
      type: Number,
      required: true,
      min: 0,
    },

    totalScheduledAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Includes normal payments + late-fee payments.
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Normal remaining amount + unpaid late fees.
    remainingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "completed", "overdue", "cancelled"],
      default: "active",
      index: true,
    },

    installments: {
      type: [installmentSchema],
      default: [],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

repaymentScheduleSchema.index({
  status: 1,
  firstDueDate: 1,
});

repaymentScheduleSchema.index({
  "installments.dueDate": 1,
  "installments.status": 1,
});

const RepaymentSchedule = mongoose.model(
  "RepaymentSchedule",
  repaymentScheduleSchema
);

export default RepaymentSchedule;