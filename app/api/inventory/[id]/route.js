import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';
import mongoose from 'mongoose';

// Activity Log Schema
const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['item_added', 'item_updated', 'item_deleted']
  },
  user: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// Helper function to log activity
async function logActivity(type, user, itemName, description) {
  try {
    console.log('Logging activity:', { type, user, itemName, description });
    const activity = new ActivityLog({
      type,
      user,
      itemName,
      description,
      timestamp: new Date()
    });
    await activity.save();
    console.log('Activity logged successfully:', activity._id);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// GET handler - get a single inventory item
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const item = await Inventory.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, item });
    
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

// PUT handler - update an inventory item
export async function PUT(request, { params }) {
  try {
    console.log('PUT request for item:', params.id);
    
    if (!process.env.MONGODB_URI) {
      const body = await request.json();
      return NextResponse.json({ success: true, item: { _id: params.id, ...body } });
    }

    await connectToDatabase();
    const body = await request.json();
    const { username, ...updateData } = body;
    
    console.log('Update data:', { username, updateData });

    // Get the old item data
    const oldItem = await Inventory.findById(params.id).lean();
    if (!oldItem) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    const quantity = Number(updateData.quantity || 0);
    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= 5) status = 'Low Stock';

    const item = await Inventory.findByIdAndUpdate(
      params.id,
      { ...updateData, status },
      { new: true, runValidators: true }
    );

    // Build description of changes
    const changes = [];
    if (oldItem.name !== item.name) changes.push(`name from "${oldItem.name}" to "${item.name}"`);
    if (oldItem.quantity !== item.quantity) changes.push(`quantity from ${oldItem.quantity} to ${item.quantity}`);
    if (oldItem.category !== item.category) changes.push(`category from "${oldItem.category}" to "${item.category}"`);
    if (oldItem.price !== item.price) changes.push(`price from $${oldItem.price} to $${item.price}`);
    if (oldItem.status !== item.status) changes.push(`status from "${oldItem.status}" to "${item.status}"`);

    const changeDescription = changes.length > 0 
      ? `Updated ${changes.join(', ')}` 
      : `Updated item: ${item.name}`;

    console.log('Change description:', changeDescription);

    // Log the activity
    await logActivity(
      'item_updated',
      username || 'Unknown User',
      item.name,
      changeDescription
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 500 });
  }
}

// DELETE handler - delete an inventory item
export async function DELETE(request, { params }) {
  try {
    console.log('DELETE request for item:', params.id);
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    console.log('Delete username:', username);

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: true, message: 'Item deleted' });
    }

    await connectToDatabase();

    const item = await Inventory.findById(params.id).lean();
    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    console.log('Deleting item:', item.name);

    await Inventory.findByIdAndDelete(params.id);

    // Log the activity
    await logActivity(
      'item_deleted',
      username || 'Unknown User',
      item.name,
      `Deleted item: ${item.name} (Quantity: ${item.quantity}, Category: ${item.category})`
    );

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete item' }, { status: 500 });
  }
}