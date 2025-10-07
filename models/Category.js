import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String, default: '#3b82f6' },
  icon: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);