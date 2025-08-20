import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, underscores, and hyphens'],
    minlength: [3, 'Username must be at least 3 characters long'],
    validate: {
      validator: function(v) {
        return !v.includes(" ") && v === v.toLowerCase();
      },
      message: props => `Username must be lowercase and cannot contain spaces`
    }
  },
  // Role: 'agent' or 'team'
  role: {
    type: String,
    enum: ['agent', 'team'],
    default: 'agent',
  },
  //General
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  //General
  profileImage: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true  
  },
  //Specific
  position: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  //Specific
  department: {
    type: String,
    default: ''
  },
  contactNumber: {
    type: String,
    default: ''
  },
  //Specific
  vcard: {
    type: String,
    default: ''
  },
  //Specific
  languages: {
    type: [String],
    default: []
  },
  aboutMe: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  // Modified to handle both string URLs and objects with platform/url
  socialLinks: {
    type: [String],
    default: [],
    // Custom validation to handle both string and object formats
    validate: {
      validator: function(v) {
        return Array.isArray(v);
      },
      message: props => `${props.value} is not a valid array of social links`
    }
  }
}, { timestamps: true });

const Agent = mongoose.model('Agent', AgentSchema);

export default Agent;