// Import environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Define schemas for seeding
const InventorySchema = new mongoose.Schema({
  id: Number,
  name: String,
  quantity: Number,
  category: String,
  status: String,
  description: String,
  serialNumber: String,
  price: Number,
  supplier: String,
  lastRestocked: Date,
  image: String
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  color: String,
  icon: String,
  isActive: Boolean
}, { timestamps: true });

// Sample data
const sampleCategories = [
  { id: 1, name: "Electronics", description: "Computer and electronic equipment", color: "#3b82f6", icon: "cpu", isActive: true },
  { id: 2, name: "Peripherals", description: "Input and output devices", color: "#10b981", icon: "mouse", isActive: true },
  { id: 3, name: "Audio", description: "Sound equipment and accessories", color: "#6366f1", icon: "headphones", isActive: true },
  { id: 4, name: "Storage", description: "Data storage solutions", color: "#f97316", icon: "hard-drive", isActive: true },
  { id: 5, name: "Cables", description: "Connectivity cables and adapters", color: "#8b5cf6", icon: "cable", isActive: true },
  { id: 6, name: "Networking", description: "Network equipment and accessories", color: "#14b8a6", icon: "wifi", isActive: true },
  { id: 7, name: "Components", description: "Internal computer components", color: "#ec4899", icon: "chip", isActive: true },
  { id: 8, name: "Software", description: "Software licenses and products", color: "#f43f5e", icon: "code", isActive: false }
];

const sampleInventory = [
  { id: 1, name: "27-inch 4K Monitor", quantity: 20, category: "Electronics", status: "In Stock", description: "Ultra HD 27-inch monitor with HDMI and DisplayPort", serialNumber: "MON-4K-27-001", price: 349.99, supplier: "Tech Supplies Inc.", lastRestocked: new Date('2025-08-15') },
  { id: 2, name: "Intel i7 Processor", quantity: 10, category: "Components", status: "In Stock", description: "11th Gen Intel Core i7 desktop processor", serialNumber: "CPU-I7-11-001", price: 329.99, supplier: "Tech Supplies Inc.", lastRestocked: new Date('2025-09-01') },
  { id: 3, name: "RGB Mechanical Keyboard", quantity: 5, category: "Peripherals", status: "Low Stock", description: "Mechanical gaming keyboard with RGB backlighting", serialNumber: "KEY-MEC-RGB-001", price: 89.99, supplier: "Gamer Gear Ltd.", lastRestocked: new Date('2025-08-20') },
  { id: 4, name: "Wireless Gaming Mouse", quantity: 15, category: "Peripherals", status: "In Stock", description: "Ergonomic wireless mouse with adjustable DPI", serialNumber: "MOU-WL-GAM-001", price: 59.99, supplier: "Gamer Gear Ltd.", lastRestocked: new Date('2025-09-05') },
  { id: 5, name: "Noise Cancelling Headphones", quantity: 8, category: "Audio", status: "In Stock", description: "Over-ear wireless headphones with active noise cancellation", serialNumber: "HPH-NC-BT-001", price: 199.99, supplier: "Sound Solutions", lastRestocked: new Date('2025-08-25') },
  { id: 6, name: "32GB USB 3.0 Flash Drive", quantity: 3, category: "Storage", status: "Low Stock", description: "High-speed USB 3.0 flash drive, 32GB capacity", serialNumber: "USB-32-3.0-001", price: 24.99, supplier: "Memory Masters", lastRestocked: new Date('2025-08-10') },
  { id: 7, name: "HDMI 2.1 Cable 6ft", quantity: 0, category: "Cables", status: "Out of Stock", description: "6-foot HDMI 2.1 cable for 4K/8K video", serialNumber: "CBL-HDMI-2.1-001", price: 19.99, supplier: "Cable Connections", lastRestocked: new Date('2025-07-30') },
  { id: 8, name: "1TB SSD Drive", quantity: 12, category: "Storage", status: "In Stock", description: "1TB solid state drive, SATA interface", serialNumber: "SSD-1TB-SATA-001", price: 129.99, supplier: "Memory Masters", lastRestocked: new Date('2025-09-10') },
  { id: 9, name: "WiFi 6 Router", quantity: 7, category: "Networking", status: "In Stock", description: "Dual-band WiFi 6 router with Gigabit Ethernet", serialNumber: "NET-WIFI6-RTR-001", price: 149.99, supplier: "Network Pro", lastRestocked: new Date('2025-08-28') },
  { id: 10, name: "Graphics Card RTX 3070", quantity: 2, category: "Components", status: "Low Stock", description: "NVIDIA RTX 3070 8GB graphics card", serialNumber: "GPU-RTX3070-001", price: 599.99, supplier: "Tech Supplies Inc.", lastRestocked: new Date('2025-08-05') },
  { id: 11, name: "USB-C to HDMI Adapter", quantity: 18, category: "Cables", status: "In Stock", description: "USB Type-C to HDMI adapter for displays", serialNumber: "CBL-USBC-HDMI-001", price: 29.99, supplier: "Cable Connections", lastRestocked: new Date('2025-09-12') },
  { id: 12, name: "Windows 11 Pro License", quantity: 25, category: "Software", status: "In Stock", description: "Windows 11 Professional Edition license key", serialNumber: "SW-WIN11-PRO-001", price: 199.99, supplier: "Software Solutions", lastRestocked: new Date('2025-09-15') },
  { id: 13, name: "Webcam 4K", quantity: 9, category: "Peripherals", status: "In Stock", description: "4K USB webcam with microphone", serialNumber: "CAM-4K-USB-001", price: 79.99, supplier: "Vision Tech", lastRestocked: new Date('2025-08-22') },
  { id: 14, name: "16GB RAM Kit (2x8GB)", quantity: 4, category: "Components", status: "Low Stock", description: "16GB DDR4 RAM kit, two 8GB modules", serialNumber: "RAM-16-DDR4-001", price: 89.99, supplier: "Memory Masters", lastRestocked: new Date('2025-08-18') },
  { id: 15, name: "Bluetooth Speaker", quantity: 0, category: "Audio", status: "Out of Stock", description: "Portable Bluetooth speaker with 20-hour battery life", serialNumber: "SPK-BT-20HR-001", price: 69.99, supplier: "Sound Solutions", lastRestocked: new Date('2025-07-25') }
];

// Connect to database and seed data
async function seedDatabase() {
  try {
    console.log('📊 Starting Tech Axis database seeding...');
    console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Create models for seeding
    const Category = mongoose.model('Category', CategorySchema);
    const Inventory = mongoose.model('Inventory', InventorySchema);
    
    // Clean existing data
    console.log('\n🧹 Cleaning existing data...');
    const categoryDeleteResult = await Category.deleteMany({});
    console.log(`   Deleted ${categoryDeleteResult.deletedCount} categories`);
    
    const inventoryDeleteResult = await Inventory.deleteMany({});
    console.log(`   Deleted ${inventoryDeleteResult.deletedCount} inventory items`);
    
    // Insert categories
    console.log('\n📝 Inserting categories...');
    const categoryResult = await Category.insertMany(sampleCategories);
    console.log(`✅ Added ${categoryResult.length} categories`);
    
    // Insert inventory items
    console.log('\n📦 Inserting inventory items...');
    const inventoryResult = await Inventory.insertMany(sampleInventory);
    console.log(`✅ Added ${inventoryResult.length} inventory items`);
    
    // Display summary
    console.log('\n📊 Database seeding complete!');
    console.log('   Summary:');
    console.log(`   - Categories: ${categoryResult.length}`);
    console.log(`   - Inventory Items: ${inventoryResult.length}`);
    
    // Display category counts
    const categoryCounts = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Items per Category:');
    categoryCounts.forEach(c => {
      console.log(`   - ${c._id}: ${c.count} items`);
    });
    
    console.log('\n🚀 Tech Axis database is ready to use!');
    
  } catch (error) {
    console.error('❌ Database seeding error:', error.message);
  } finally {
    // Close connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
    
    process.exit(0);
  }
}

seedDatabase();