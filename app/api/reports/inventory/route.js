import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange');
    const categories = searchParams.get('categories');
    const statuses = searchParams.get('statuses');

    await connectToDatabase();

    // Build filter query - only non-archived items
    let filter = { 
      $or: [
        { isArchived: false },
        { isArchived: { $exists: false } }
      ]
    };

    // Date filtering
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDateTime;

      switch (dateRange) {
        case 'today':
          startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDateTime = new Date(weekAgo.getFullYear(), weekAgo.getMonth(), weekAgo.getDate(), 0, 0, 0, 0);
          break;
        case 'month':
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDateTime = new Date(monthAgo.getFullYear(), monthAgo.getMonth(), monthAgo.getDate(), 0, 0, 0, 0);
          break;
        case 'year':
          const yearAgo = new Date(now);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          startDateTime = new Date(yearAgo.getFullYear(), yearAgo.getMonth(), yearAgo.getDate(), 0, 0, 0, 0);
          break;
      }

      if (startDateTime) {
        filter.createdAt = { $gte: startDateTime };
      }
    }

    // Category filtering
    if (categories) {
      const categoryArray = categories.split(',').map(c => c.trim()).filter(Boolean);
      if (categoryArray.length > 0) {
        filter.category = { $in: categoryArray };
      }
    }

    // Status filtering
    if (statuses) {
      const statusArray = statuses.split(',').map(s => s.trim()).filter(Boolean);
      if (statusArray.length > 0) {
        filter.status = { $in: statusArray };
      }
    }

    console.log('Filter query:', JSON.stringify(filter, null, 2));

    // Fetch filtered items using Mongoose connection
    const db = mongoose.connection.db;
    
    // Use 'inventories' collection (pluralized from 'Inventory' model)
    const items = await db
      .collection("inventories")
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    console.log(`Found ${items.length} items from 'inventories' collection`);

    // If no items found, check what collections exist
    if (items.length === 0) {
      const collections = await db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
      
      // Try to fetch one sample item to see the structure
      const sampleItem = await db.collection("inventories").findOne({});
      console.log('Sample item from inventories:', sampleItem);
    }

    // Calculate summary statistics
    const summary = {
      totalItems: items.length,
      totalCategories: [...new Set(items.map(item => item.category))].length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      inStock: items.filter(item => item.status === 'In Stock').length,
      lowStock: items.filter(item => item.status === 'Low Stock').length,
      outOfStock: items.filter(item => item.status === 'Out of Stock').length,
    };

    // Format items for response
    const formattedItems = items.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      status: item.status,
      description: item.description || '',
      price: item.price || 0,
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    }));

    return NextResponse.json({
      success: true,
      items: formattedItems,
      summary,
      filters: {
        dateRange: dateRange || 'all',
        categories: categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : [],
        statuses: statuses ? statuses.split(',').map(s => s.trim()).filter(Boolean) : [],
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}