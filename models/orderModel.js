import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerName: { type: String, required: true, trim: true },
  providerImage: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  serviceDate: { type: Date, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  price: { type: Number, default: 0 },
  isRepeatable: { type: Boolean, default: true },
  meta: { type: Object, default: {} },
  status: { type: String, enum: ['completed','cancelled','pending'], default: 'completed' }
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)
