require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { start, stop } = require('./cron/cronService');
const webhookController = require('./controllers/webhookController');

// Import routes
const deviceRoutes = require('./routes/deviceRoutes');
const sensorDataRoutes = require('./routes/sensorDataRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://34.87.37.168:3001/'
  ]
}));
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
  
  // Start cron jobs after database is initialized
  // start();
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

// API endpoints for cron job management
app.get('/api/cron/stop', (req, res) => {
  stop();
  res.json({ message: 'Cron jobs stopped' });
});

app.get('/api/cron/start', (req, res) => {
  start();
  res.json({ message: 'Cron jobs started' });
});

app.get('/api/cron/status', (req, res) => {
  res.json({ status: 'running' });
});

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
