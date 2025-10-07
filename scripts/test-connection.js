// Import environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  try {
    console.log('🔍 Testing MongoDB connection with Bun...');
    console.log(`🔗 Connection string: ${MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connection successful!');
    
    // Get database information
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📁 Connected to database: ${dbName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    
    if (collections.length === 0) {
      console.log('   - No collections found (empty database)');
    } else {
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name} (${count} documents)`);
      }
    }
    
    console.log('\n✨ Database connection test completed successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.name === 'MongoParseError') {
      console.error('   Invalid connection string format. Please check your MONGODB_URI in .env.local');
    }
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('   Could not connect to MongoDB server. Possible causes:');
      console.error('   - Network connectivity issues');
      console.error('   - MongoDB service is not running');
      console.error('   - IP whitelist restrictions on MongoDB Atlas');
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Connection closed');
    }
    
    // Exit process for Bun scripts
    process.exit(0);
  }
}

testConnection();