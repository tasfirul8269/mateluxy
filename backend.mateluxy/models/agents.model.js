import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
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