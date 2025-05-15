import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  interest: {
    type: String,
    required: false,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  contactPreferences: {
    contactPhone: {
      type: Boolean,
      default: false
    },
    contactWhatsApp: {
      type: Boolean,
      default: false
    },
    contactEmail: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
contactSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
