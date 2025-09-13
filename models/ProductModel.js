import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  mrp: {
    type: Number,
    required: true,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'Rs',
    enum: ['Rs', '$', '€', '£']
  },
  taxInfo: {
    type: String,
    default: 'Inclusive of all taxes'
  },
  colors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    hexCode: {
      type: String,
      trim: true
    },
    images: [{
      type: String
    }],
    isAvailable: {
      type: Boolean,
      default: true
    },
    additionalPrice: {
      type: Number,
      default: 0
    }
  }],
  sizes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    additionalPrice: {
      type: Number,
      default: 0
    }
  }],
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  returnPolicy: {
    type: String,
    default: '30 days return policy'
  },
  warranty: {
    type: String,
    default: '6 months warranty'
  }
}, {
  timestamps: true
});

// Generate SKU before saving
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await mongoose.model('Product').countDocuments();
    this.sku = `SKU${Date.now()}${count + 1}`;
  }
  next();
});

export default mongoose.model('Product', productSchema);