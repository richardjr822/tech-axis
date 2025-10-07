import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Inventory } from '@/models/Inventory';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    const category = await Category.findById(id).lean();
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    const itemCount = await Inventory.countDocuments({ category: category.name });
    return NextResponse.json({ category: { ...category, itemCount } }, { status: 200 });
  } catch (error) {
    console.error('Category GET by ID error:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    const data = await request.json();
    const oldCategory = await Category.findById(id);
    if (!oldCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    const nameChanged = data.name && data.name !== oldCategory.name;
    const updatedCategory = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (nameChanged) {
      await Inventory.updateMany({ category: oldCategory.name }, { category: data.name });
    }
    return NextResponse.json({ category: updatedCategory }, { status: 200 });
  } catch (error) {
    console.error('Category PUT error:', error);
    if (error.name === 'ValidationError') {
      const errors = {};
      for (const field in error.errors) errors[field] = error.errors[field].message;
      return NextResponse.json({ errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    const itemCount = await Inventory.countDocuments({ category: category.name });
    if (itemCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete category with ${itemCount} items. Please reassign or delete these items first.`,
        itemCount
      }, { status: 400 });
    }
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}