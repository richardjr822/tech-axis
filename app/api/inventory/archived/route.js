import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';

export async function GET(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        items: [],
        total: 0
      });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    let query = { isArchived: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Inventory.countDocuments(query);
    const items = await Inventory.find(query)
      .sort({ archivedAt: -1 })
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
    console.error('Error fetching archived items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archived items', items: [] },
      { status: 500 }
    );
  }
}