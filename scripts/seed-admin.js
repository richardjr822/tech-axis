import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';
import { User } from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || Bun.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Business Owner data (plain password)
const businessOwner = {
  username: 'owner',
  password: 'owner123',
  fullName: 'Business Owner',
  role: 'owner',
  isActive: true
};

async function seedOwner() {
  try {
    console.log('👤 Starting business owner seeding...');
    console.log(`🔗 Connecting to MongoDB...`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if owner already exists
    const existingOwner = await User.findOne({ role: 'owner' });
    
    if (existingOwner) {
      console.log('⚠️  Business owner already exists. Updating...');
      await User.updateOne(
        { _id: existingOwner._id },
        { $set: businessOwner }
      );
      console.log('✅ Business owner updated');
    } else {
      console.log('📝 Creating business owner...');
      await User.create(businessOwner);
      console.log('✅ Business owner created');
    }
    
    // Display all users
    const allUsers = await User.find({}, { password: 0 });
    console.log('\n📋 All Users in Database:');
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
    console.log('\n📊 Business Owner Credentials:');
    console.log('   Username: owner');
    console.log('   Password: owner123');
    console.log('   Role: Business Owner (Full Control)');
    console.log('\n🚀 Business owner is ready to use!');
    
  } catch (error) {
    console.error('❌ Owner seeding error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

seedOwner();