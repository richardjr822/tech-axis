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
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user with plain password comparison
    const user = await User.findOne({ 
      username: username,
      password: password 
    }).lean();

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Account has been deactivated. Contact administrator.' },
        { status: 403 }
      );
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}