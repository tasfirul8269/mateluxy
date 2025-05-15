import mongoose from 'mongoose';

const propertyRequestSchema = new mongoose.Schema({
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
  countryCode: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  propertyInfo: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    propertyTitle: {
      type: String,
      required: true
    }
  },
  privacyConsent: {
    type: Boolean,
    required: true,
    default: true
  },
  marketingConsent: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'completed'],
    default: 'new'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const PropertyRequest = mongoose.model('PropertyRequest', propertyRequestSchema);

export default PropertyRequest; 