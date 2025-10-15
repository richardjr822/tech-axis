import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';
import { ActivityLog } from '@/models/ActivityLog';

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const { username } = await request.json();

    // Archive the item
    const item = await Inventory.findByIdAndUpdate(
      id,
      { isArchived: true, archivedAt: new Date(), archivedBy: username, updatedAt: new Date() },
      { new: true }
    );

    // Log the archive action (this is what makes it appear in the activity log)
    try {
      await ActivityLog.create({
        type: 'item_archived',
        user: username || 'Unknown User',
        itemName: item?.name || '',
        description: `Archived item: ${item?.name || ''}`,
        timestamp: new Date()
      });
    } catch (logError) {
      console.error('Activity log failed:', logError);
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json({ success: false, error: 'Failed to archive item' }, { status: 500 });
  }
}