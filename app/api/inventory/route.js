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
    const activity = new ActivityLog({
      type,
      user,
      itemName,
      description,
      timestamp: new Date()
    });
    await activity.save();
    console.log('Activity logged:', { type, user, itemName });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// Mock data for fallback when DB is not configured
const mockItems = [
  { _id: 'm1', name: '27-inch 4K Monitor', description: 'Ultra HD 27-inch monitor', quantity: 20, category: 'Electronics', status: 'In Stock', price: 349.99 },
  { _id: 'm2', name: 'RGB Mechanical Keyboard', description: 'Mechanical gaming keyboard', quantity: 5, category: 'Peripherals', status: 'Low Stock', price: 89.99 },
  { _id: 'm3', name: 'HDMI 2.1 Cable 6ft', description: '6-foot HDMI 2.1 cable', quantity: 0, category: 'Cables', status: 'Out of Stock', price: 19.99 },
  { _id: 'm4', name: '1TB SSD Drive', description: '1TB SSD SATA', quantity: 12, category: 'Storage', status: 'In Stock', price: 129.99 }
];

function applyQueryToArray(arr, { page, limit, sort, order, search }) {
  let filtered = [...arr];
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(i =>
      i.name.toLowerCase().includes(s) ||
      (i.category || '').toLowerCase().includes(s) ||
      (i.description || '').toLowerCase().includes(s)
    );
  }
  const ord = order === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    const va = a[sort];
    const vb = b[sort];
    if (typeof va === 'string' && typeof vb === 'string') {
      return ord * va.localeCompare(vb);
    }
    return ord * ((va || 0) - (vb || 0));
  });
  const start = (page - 1) * limit;
  const end = page * limit;
  return {
    items: filtered.slice(start, end),
    pagination: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
      hasNext: end < filtered.length,
      hasPrev: start > 0
    }
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const sortParam = (searchParams.get('sort') || 'name');
  const orderParam = (searchParams.get('order') || 'asc');
  const search = (searchParams.get('search') || '').trim();

  // If DB URL is missing, serve mock data
  if (!process.env.MONGODB_URI) {
    const { items, pagination } = applyQueryToArray(mockItems, {
      page, limit, sort: sortParam, order: orderParam, search
    });
    return NextResponse.json({ success: true, items, pagination });
  }

  try {
    await connectToDatabase();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortField = ['name', 'quantity', 'status', 'price', 'createdAt', 'updatedAt'].includes(sortParam) ? sortParam : 'name';
    const order = orderParam.toLowerCase() === 'desc' ? -1 : 1;
    const total = await Inventory.countDocuments(filter);
    const items = await Inventory.find(filter)
      .sort({ [sortField]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    return NextResponse.json({ success: true, items, pagination });
  } catch (error) {
    console.error('Error fetching inventory, falling back to mock:', error.message);
    const { items, pagination } = applyQueryToArray(mockItems, {
      page, limit, sort: sortParam, order: orderParam, search
    });
    return NextResponse.json({ success: true, items, pagination });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, ...itemData } = body;

    // If DB not configured, just echo back with mock _id
    if (!process.env.MONGODB_URI) {
      const quantity = Number(itemData.quantity || 0);
      let status = 'In Stock';
      if (quantity === 0) status = 'Out of Stock';
      else if (quantity <= 5) status = 'Low Stock';
      return NextResponse.json({ success: true, item: { _id: `m-${Date.now()}`, ...itemData, status } }, { status: 201 });
    }

    await connectToDatabase();

    if (!itemData.name || !itemData.category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      );
    }

    const quantity = Number(itemData.quantity || 0);
    let status = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= 5) status = 'Low Stock';

    const item = await Inventory.create({
      name: itemData.name,
      description: itemData.description || '',
      quantity,
      category: itemData.category,
      status,
      price: itemData.price,
      supplier: itemData.supplier,
      serialNumber: itemData.serialNumber,
      lastRestocked: itemData.lastRestocked,
      image: itemData.image
    });

    // Log the activity
    await logActivity(
      'item_added',
      username || 'Unknown User',
      item.name,
      `Added new item: ${item.name} (Quantity: ${item.quantity}, Category: ${item.category}, Location: ${item.location || 'N/A'})`
    );

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ success: false, error: 'Failed to create item' }, { status: 500 });
  }
}