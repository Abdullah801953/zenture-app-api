import mongoose from 'mongoose';

const shoeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'Rs',
    enum: ['Rs', '$', '€', '£']
  },
  duration: {
    type: String,
    required: true,
    enum: ['Month', 'Quarter', 'Year', 'Lifetime']
  },
  features: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    required: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('shoe', shoeSchema);