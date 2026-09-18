import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      index: true,
    },
    channel: {
      type: String,
      enum: ['EMAIL', 'SMS'],
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['AUTOMATED', 'MANUAL'],
      default: 'AUTOMATED',
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentByName: {
      type: String,
      default: 'System',
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommunicationLog = mongoose.model('CommunicationLog', communicationLogSchema);
export default CommunicationLog;
