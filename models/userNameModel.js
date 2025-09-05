import mongoose from 'mongoose';

const userNameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('userName', userNameSchema);