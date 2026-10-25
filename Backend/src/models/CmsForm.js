import mongoose from 'mongoose';

const cmsFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true;
          const digits = v.replace(/\D/g, "");
          return digits.length === 10;
        },
        message: props => `${props.value} is not a valid 10-digit US phone number.`
      }
    },
    message: {
      type: String,
      required: true,
    },
    sourcePage: {
      type: String,
      default: 'Contact Us',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CmsForm = mongoose.model('CmsForm', cmsFormSchema);

export default CmsForm;
