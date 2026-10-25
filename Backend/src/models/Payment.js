import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    loanApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: true,
      index: true,
    },

    repaymentSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepaymentSchedule",
      required: true,
      index: true,
    },

    installmentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    amountReceived: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "money_order",
        "bank_transfer",
        "stripe",
        "other",
      ],
      required: true,
    },

    // stripePaymentIntentId: {
    //   type: String,
    //   default: "",
    //   index: true,
    // },

    // stripeCheckoutSessionId: {
    //   type: String,
    //   default: "",
    //   index: true,
    // },

    stripePaymentIntentId: {
  type: String,
  default: undefined,
},

stripeCheckoutSessionId: {
  type: String,
  default: undefined,
},

    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "completed",
      index: true,
    },

    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    receivedByName: {
      type: String,
      default: "System",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({
  loanApplication: 1,
  paymentDate: -1,
});

paymentSchema.index(
  { stripeCheckoutSessionId: 1 },
  { unique: true, sparse: true }
);

paymentSchema.index(
  { stripePaymentIntentId: 1 },
  { unique: true, sparse: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;