import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';
import mongoose from 'mongoose';

// ActivityLog schema and logActivity helper (as in your working code)
const activityLogSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['item_added', 'item_updated', 'item_deleted', 'item_archived', 'item_restored'] },
  user: { type: String, required: true },
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
async function logActivity(type, user, itemName, description) {
  try {
    const activity = new ActivityLog({ type, user, itemName, description, timestamp: new Date() });
    await activity.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    let username = 'Unknown User';
    try {
      const body = await request.json();
      if (body.username) username = body.username;
    } catch {}

    const item = await Inventory.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    item.isArchived = false;
    item.archivedAt = null;
    item.archivedBy = null;
    await item.save();

    // LOG THE RESTORE ACTION
    await logActivity(
      'item_restored',
      username,
      item.name,
      `Restored item: ${item.name}`
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error restoring item:', error);
    return NextResponse.json({ success: false, error: 'Failed to restore item' }, { status: 500 });
  }
}