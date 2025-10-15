import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';
import mongoose from 'mongoose';

// ActivityLog schema and logActivity helper (copy from your working code)
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

export async function GET(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Exclude archived items from main listing
    let query = { isArchived: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory', items: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { username, ...itemData } = body;

    const quantity = Number(itemData.quantity || 0);
    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= 5) status = 'Low Stock';

    const item = await Inventory.create({
      ...itemData,
      quantity,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await logActivity(
      'item_added',
      username || 'Unknown User',
      item.name,
      `Added new item: ${item.name} (Quantity: ${item.quantity}, Category: ${item.category})`
    );

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}