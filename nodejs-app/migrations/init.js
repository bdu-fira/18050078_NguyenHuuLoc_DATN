const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function initDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process?.env?.MONGODB_URI || 'mongodb://mongodb:27017/nodejs-app';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      keepAlive: true,
      keepAliveInitialDelay: 300000
    });

    console.log('Connected to MongoDB');
    
    // Get the database connection
    const db = mongoose.connection.db;
    
    // Check if sensors_data collection exists
    const sensorCollections = await db.listCollections({ name: 'sensors_data' }).toArray();
    const sensorCollectionExists = sensorCollections.length > 0;
    
    // Check if devices collection exists
    const deviceCollections = await db.listCollections({ name: 'devices' }).toArray();
    const deviceCollectionExists = deviceCollections.length > 0;
    
    if (!sensorCollectionExists) {
      console.log('Creating sensors_data collection...');
      
      // Create the collection by inserting a dummy document
      await db.collection('sensors_data').insertOne({
        deviceId: 'init',
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create indexes manually
      console.log('Creating indexes...');
      
      // Create 2dsphere index for location
      await db.collection('sensors_data').createIndex(
        { location: '2dsphere' },
        { background: true, name: 'location_2dsphere' }
      );
      
      // Create compound index for deviceId and timestamp
      await db.collection('sensors_data').createIndex(
        { deviceId: 1, timestamp: -1 },
        { background: true, name: 'deviceId_1_timestamp_-1' }
      );
      
      // Create index on deviceId
      await db.collection('sensors_data').createIndex(
        { deviceId: 1 },
        { background: true, name: 'deviceId_1' }
      );
      
      console.log('Created sensors_data collection with indexes');
    } else {
      console.log('sensors_data collection already exists');
      
      // Ensure indexes exist (safe to run even if they do)
      try {
        await db.collection('sensors_data').createIndex(
          { location: '2dsphere' },
          { background: true, name: 'location_2dsphere' }
        );
        
        await db.collection('sensors_data').createIndex(
          { deviceId: 1, timestamp: -1 },
          { background: true, name: 'deviceId_1_timestamp_-1' }
        );
        
        await db.collection('sensors_data').createIndex(
          { deviceId: 1 },
          { background: true, name: 'deviceId_1' }
        );
        
        console.log('Verified/created indexes on existing collection');
      } catch (error) {
        console.warn('Error creating indexes (they may already exist):', error.message);
      }
    }
    
    // Initialize devices collection if it doesn't exist
    if (!deviceCollectionExists) {
      console.log('Creating devices collection...');
      
      // Create the collection by inserting a sample device
      await db.collection('devices').insertOne({
        deviceId: 'sample-device-001',
        location: {
          lat: 10.762622,
          lng: 106.660172
        },
        name: 'Sample Device',
        description: 'Initial sample device',
        sensorConfigurations: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Create indexes for devices collection
      await db.collection('devices').createIndex(
        { deviceId: 1 },
        { unique: true, background: true, name: 'deviceId_1' }
      );
      
      console.log('Created devices collection with indexes');
    } else {
      console.log('devices collection already exists');
      
      // Ensure deviceId index exists
      try {
        await db.collection('devices').createIndex(
          { deviceId: 1 },
          { unique: true, background: true, name: 'deviceId_1' }
        );
        console.log('Verified/created indexes on devices collection');
      } catch (error) {
        console.warn('Error creating device indexes (they may already exist):', error.message);
      }
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Execute migration if run directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;
