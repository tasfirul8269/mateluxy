import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'PROPERTY_ADDED',
      'PROPERTY_UPDATED',
      'PROPERTY_DELETED',
      'AGENT_ADDED',
      'AGENT_UPDATED',
      'AGENT_DELETED',
      'ADMIN_ADDED',
      'ADMIN_UPDATED',
      'ADMIN_DELETED',
      'SYSTEM'
    ]
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  entityId: {
    type: String,
    default: null
  },
  entityName: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: null
  },
  title: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Pre-save hook to set icon, color, and title based on type
NotificationSchema.pre('save', function(next) {
  // Default icons, colors, and titles for each notification type
  const typeConfigs = {
    // Property notifications with enhanced styling
    'PROPERTY_ADDED': { 
      icon: '🏠', 
      color: 'bg-green-500',
      title: 'New Property Added'
    },
    'PROPERTY_UPDATED': { 
      icon: '🔄', 
      color: 'bg-blue-500',
      title: 'Property Updated'
    },
    'PROPERTY_DELETED': { 
      icon: '🗑️', 
      color: 'bg-red-500',
      title: 'Property Deleted'
    },
    
    // Agent notifications with enhanced styling
    'AGENT_ADDED': { 
      icon: '👤', 
      color: 'bg-green-500',
      title: 'New Agent Added'
    },
    'AGENT_UPDATED': { 
      icon: '🔄', 
      color: 'bg-blue-500',
      title: 'Agent Updated'
    },
    'AGENT_DELETED': { 
      icon: '🗑️', 
      color: 'bg-red-500',
      title: 'Agent Deleted'
    },
    
    // Admin notifications with enhanced styling
    'ADMIN_ADDED': { 
      icon: '👑', 
      color: 'bg-green-500',
      title: 'New Admin Added'
    },
    'ADMIN_UPDATED': { 
      icon: '🔄', 
      color: 'bg-blue-500',
      title: 'Admin Updated'
    },
    'ADMIN_DELETED': { 
      icon: '🗑️', 
      color: 'bg-red-500',
      title: 'Admin Deleted'
    },
    
    // System notifications
    'SYSTEM': { 
      icon: '⚙️', 
      color: 'bg-gray-500',
      title: 'System Notification'
    }
  };

  // Set icon, color, and title if not already set
  if (!this.icon && typeConfigs[this.type]) {
    this.icon = typeConfigs[this.type].icon;
  }
  
  if (!this.color && typeConfigs[this.type]) {
    this.color = typeConfigs[this.type].color;
  }
  
  if (!this.title && typeConfigs[this.type]) {
    this.title = typeConfigs[this.type].title;
  }
  
  next();
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification; 