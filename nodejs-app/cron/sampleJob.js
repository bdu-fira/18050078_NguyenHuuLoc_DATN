const cron = require('node-cron');
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/nodejs-app';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define JobLog schema only once
const jobLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  status: String
});

// Create JobLog model only once
let JobLog = mongoose.models.JobLog || mongoose.model('JobLog', jobLogSchema);

// Sample job that runs every minute
const sampleJob = cron.schedule('*/1 * * * *', async () => {
  console.log('Running sample job at:', new Date().toISOString());
  
  try {
    // Log to MongoDB
    const jobLog = new JobLog({
      status: 'success',
      timestamp: new Date()
    });
    await jobLog.save();
    console.log('Job completed successfully');
  } catch (error) {
    console.error('Job failed:', error);
  }
});

// Start the job
// sampleJob.start();
