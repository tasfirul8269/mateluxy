import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Real Estate', 'Investment', 'Lifestyle', 'Business', 'Policy', 'Sustainability']
  },
  author: {
    type: String,
    default: 'Admin'
  },
  featured: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    required: false,
    unique: true
  }
}, { timestamps: true });

// Generate slug from title
NewsSchema.pre('save', function(next) {
  console.log('Pre-save hook running for News model');
  console.log('Title:', this.title);
  
  // Always generate a slug regardless of title modification
  this.slug = this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);
  
  console.log('Generated slug:', this.slug);
  next();
});

const News = mongoose.model('News', NewsSchema);

export default News; 