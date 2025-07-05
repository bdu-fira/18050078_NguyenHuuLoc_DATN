require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webhookController = require('./controllers/webhookController');
const ttnRoutes = require('./routes/ttnRoutes');

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const sensorDataRoutes = require('./routes/sensorDataRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://34.87.37.168:3001',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection setup
const MONGODB_USER = process.env.MONGODB_USER || 'test';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'test';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'nodejs-app';
const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';

const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:27017/${MONGODB_DATABASE}?authSource=admin`;

// Connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
  directConnection: false,
  ssl: false,
};

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB initial connection error:', err.message);
    console.error('❌ err:', err);
    console.error('❌ MONGODB_URI:', MONGODB_URI);
    process.exit(1);
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed on app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// API routes
app.use('/api/devices', deviceRoutes);
app.use('/api/sensor-data', sensorDataRoutes);
app.use('/api/ttn', ttnRoutes);

// Webhooks
app.post(
  '/api/webhooks',
  express.json({ limit: '10mb' }),
  webhookController.handleWebhook
);
app.get('/api/webhooks', webhookController.getWebhookData);
app.get('/api/webhooks/:id', webhookController.getWebhookById);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Node.js server with MongoDB is running!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
