import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/models/User';

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  
  await mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password (plain text comparison)
    if (user.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Check if new password is same as current
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Update password (store as plain text)
    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      { 
        success: true,
        message: 'Password changed successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}