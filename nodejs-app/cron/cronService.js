const cron = require('node-cron');
const mongoose = require('mongoose');

// Initialize MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/nodejs-app';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register all cron jobs
const registerJobs = () => {
  // Import and register all cron jobs
  require('./sampleJob');
  
  // Add more jobs as needed
  // require('./anotherJob');
  // require('./thirdJob');
};

// Start all cron jobs
const startJobs = () => {
  registerJobs();
  console.log('All cron jobs started');
};

// Stop all cron jobs
const stopJobs = () => {
  cron.stop();
  console.log('All cron jobs stopped');
};

module.exports = {
  start: startJobs,
  stop: stopJobs
};
