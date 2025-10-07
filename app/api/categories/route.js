import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        categories: [
          { _id: 'c1', name: 'Electronics', isActive: true },
          { _id: 'c2', name: 'Peripherals', isActive: true },
          { _id: 'c3', name: 'Storage', isActive: true }
        ]
      });
    }
    await connectToDatabase();
    
    // Get all active categories
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 });
    
    return NextResponse.json({ 
      success: true, 
      categories
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      const data = await request.json();
      if (!data.name) {
        return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
      }
      return NextResponse.json({ success: true, category: { _id: `c-${Date.now()}`, ...data } }, { status: 201 });
    }
    await connectToDatabase();
    
    // Parse the request body
    const data = await request.json();
    
    // Simple validation
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Create new category
    const category = await Category.create(data);
    
    return NextResponse.json(
      { success: true, category },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}