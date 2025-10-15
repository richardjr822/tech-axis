import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'item_added',
      'item_updated',
      'item_deleted',
      'item_archived',
      'item_restored'
    ]
  },
  user: {
    type: String,
    required: true
  },
  itemName: {
    type: String
  },
  description: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);