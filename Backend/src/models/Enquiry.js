import mongoose from "mongoose";

const ENQUIRY_STATUS = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  IN_PROGRESS: "IN_PROGRESS",
  CONVERTED: "CONVERTED",
  CLOSED: "CLOSED",
};

const enquirySchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    interestedIn: {
      type: String,
      enum: [
        "title-loan",
        "personal-loan",
        "general",
      ],
      required: true,
    },

    amountNeeded: {
      type: Number,
      default: 0,
      min: 0,
    },

    preferredContactMethod: {
      type: String,
      enum: [
        "phone",
        "email",
        "either",
        "",
      ],
      default: "",
    },

    preferredContactTime: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: Object.values(ENQUIRY_STATUS),
      default: ENQUIRY_STATUS.NEW,
      index: true,
    },

    source: {
      type: String,
      default: "WEBSITE",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    internalNotes: [
      {
        note: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        authorName: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

enquirySchema.index({
  email: 1,
  phone: 1,
});

export {
  ENQUIRY_STATUS,
};

export default mongoose.model(
  "Enquiry",
  enquirySchema,
);