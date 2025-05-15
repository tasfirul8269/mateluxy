import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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
  subject: {
    type: String,
    default: 'General Inquiry',
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  preferredContact: {
    type: [String],
    enum: ['email', 'phone', 'whatsapp', 'any'],
    default: ['email']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message; 