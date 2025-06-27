require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const webhookController = require('./controllers/webhookController');

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const sensorDataRoutes = require('./routes/sensorDataRoutes');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://34.87.37.168:3001', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/nodejs-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  keepAlive: true,
  keepAliveInitialDelay: 300000
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
  process.exit(1);
});

// API routes
app.use('/api/devices', deviceRoutes);
app.use('/api/sensor-data', sensorDataRoutes);

// Webhook endpoints
app.post('/api/webhooks',
  express.json({ limit: '10mb' }), // Increase payload size limit for webhooks
  webhookController.handleWebhook
);

// Admin endpoints (optional, consider adding authentication)
app.get('/api/webhooks', webhookController.getWebhookData);
app.get('/api/webhooks/:id', webhookController.getWebhookById);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Node.js server with MongoDB is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
