import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/models/User';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

// GET - Fetch all users
export async function GET(request) {
  try {
    await connectDB();
    
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const data = await request.json();
    
    await connectDB();
    
    // Check if username already exists
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = await User.create({
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      role: data.role || 'employee',
      isActive: true,
      createdBy: data.createdBy
    });
    
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}