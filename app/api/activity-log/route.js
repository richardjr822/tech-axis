import { NextResponse } from 'next/server';
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

// Check if model already exists to avoid recompilation error
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  await mongoose.connect(process.env.MONGODB_URI);
}

// GET - Fetch all activity logs
export async function GET(request) {
  try {
    await connectDB();

    const activities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Activity log fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST - Create new activity log
export async function POST(request) {
  try {
    await connectDB();

    const { type, user, itemName, description } = await request.json();

    // Validate input
    if (!type || !user || !itemName || !description) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['item_added', 'item_updated', 'item_deleted'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid activity type' },
        { status: 400 }
      );
    }

    // Create new activity log
    const newActivity = new ActivityLog({
      type,
      user,
      itemName,
      description,
      timestamp: new Date()
    });

    await newActivity.save();

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully',
      activity: newActivity
    }, { status: 201 });

  } catch (error) {
    console.error('Activity log creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}