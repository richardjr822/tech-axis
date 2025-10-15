import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Inventory } from '@/models/Inventory';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      // Basic mock stats
      return NextResponse.json({
        success: true,
        stats: {
          overview: { totalItems: 4, totalQuantity: 37 },
          statusBreakdown: { inStock: 2, lowStock: 1, outOfStock: 1 },
          categoryBreakdown: [
            { category: 'Electronics', count: 1 },
            { category: 'Peripherals', count: 1 },
            { category: 'Storage', count: 1 },
            { category: 'Cables', count: 1 }
          ]
        }
      });
    }
    
    await connectToDatabase();
    
    // Only count non-archived items
    const notArchived = { isArchived: { $ne: true } };

    // Get overview statistics
    const totalItems = await Inventory.countDocuments(notArchived);
    const totalQuantity = await Inventory.aggregate([
      { $match: notArchived },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    
    // Get status breakdown
    const statusCounts = await Inventory.aggregate([
      { $match: notArchived },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get category breakdown
    const categoryCounts = await Inventory.aggregate([
      { $match: notArchived },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Format the response
    const stats = {
      overview: {
        totalItems,
        totalQuantity: totalQuantity.length > 0 ? totalQuantity[0].total : 0
      },
      statusBreakdown: {
        inStock: statusCounts.find(s => s._id === 'In Stock')?.count || 0,
        lowStock: statusCounts.find(s => s._id === 'Low Stock')?.count || 0,
        outOfStock: statusCounts.find(s => s._id === 'Out of Stock')?.count || 0
      },
      categoryBreakdown: categoryCounts.map(c => ({
        category: c._id,
        count: c.count
      }))
    };
    
    return NextResponse.json({ 
      success: true, 
      stats
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory statistics' },
      { status: 500 }
    );
  }
}