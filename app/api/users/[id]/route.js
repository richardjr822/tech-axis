import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/models/User';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
}

// PATCH - Update user (activate/deactivate)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    await connectDB();
    
    const user = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Prevent deleting owner account
    if (user.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot delete owner account' },
        { status: 403 }
      );
    }
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}