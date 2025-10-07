import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  description: { type: String },
  serialNumber: { type: String },
  price: { type: Number },
  supplier: { type: String },
  lastRestocked: { type: Date },
  image: { type: String }
}, { timestamps: true });

export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);