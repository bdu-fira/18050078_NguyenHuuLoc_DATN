const express = require('express');
const router = express.Router();
const Prompt = require('../models/prompt');
const SensorThreshold = require('../models/sensorThreshold');

// Get system and user prompts
router.get('/prompt', async (req, res) => {
  try {
    // Get the single prompt document
    let prompt = await Prompt.findOne();
    
    // If no prompt document exists, create one with defaults
    if (!prompt) {
      prompt = await Prompt.create({});
    }
    
    res.json({ 
      success: true, 
      data: {
        systemPrompt: prompt.systemPrompt || '',
        userPrompt: prompt.userPrompt || ''
      }
    });
  } catch (error) {
    console.error('Error getting prompts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update prompts
router.post('/prompt', async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;
    const updateData = {};
    
    if (systemPrompt !== undefined) {
      updateData.systemPrompt = systemPrompt;
    }
    
    if (userPrompt !== undefined) {
      updateData.userPrompt = userPrompt;
    }

    // Update or create the single prompt document
    const prompt = await Prompt.findOneAndUpdate(
      {},
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ 
      success: true, 
      data: {
        systemPrompt: prompt.systemPrompt || '',
        userPrompt: prompt.userPrompt || ''
      }
    });
  } catch (error) {
    console.error('Error updating prompts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get sensor thresholds
router.get('/thresholds', async (req, res) => {
  try {
    const thresholds = await SensorThreshold.find({});
    const thresholdMap = {};
    
    thresholds.forEach(threshold => {
      thresholdMap[threshold.sensorType] = threshold.thresholdValue;
    });
    
    res.json({ success: true, ...thresholdMap });
  } catch (error) {
    console.error('Error getting thresholds:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update sensor thresholds
router.post('/thresholds', async (req, res) => {
  try {
    const updates = [];
    const thresholds = req.body;
    
    for (const [sensorType, thresholdValue] of Object.entries(thresholds)) {
      updates.push(
        SensorThreshold.findOneAndUpdate(
          { sensorType },
          { thresholdValue },
          { upsert: true, new: true }
        )
      );
    }
    
    await Promise.all(updates);
    
    res.json({ success: true, ...thresholds });
  } catch (error) {
    console.error('Error updating thresholds:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Sensor Threshold routes
// Get all sensor thresholds
router.get('/thresholds', async (req, res) => {
  try {
    const thresholds = await SensorThreshold.find()
      .sort({ sensorType: 1 })
      .select('sensorType threshold unit -_id');
    
    // Convert to object with sensorType as key
    const thresholdsObj = thresholds.reduce((acc, threshold) => {
      acc[threshold.sensorType] = threshold.threshold;
      return acc;
    }, {});

    res.json({ success: true, thresholds: thresholdsObj });
  } catch (error) {
    console.error('Error getting sensor thresholds:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update sensor thresholds
router.post('/thresholds', async (req, res) => {
  try {
    const { temperature, humidity, co2, pm25 } = req.body;
    
    // Update or create each threshold
    const promises = [
      SensorThreshold.findOneAndUpdate(
        { sensorType: 'temperature' },
        { threshold: temperature, unit: '°C' },
        { upsert: true, new: true }
      ),
      SensorThreshold.findOneAndUpdate(
        { sensorType: 'humidity' },
        { threshold: humidity, unit: '%' },
        { upsert: true, new: true }
      ),
      SensorThreshold.findOneAndUpdate(
        { sensorType: 'co2' },
        { threshold: co2, unit: 'ppm' },
        { upsert: true, new: true }
      ),
      SensorThreshold.findOneAndUpdate(
        { sensorType: 'pm25' },
        { threshold: pm25, unit: 'µg/m³' },
        { upsert: true, new: true }
      )
    ];

    const updatedThresholds = await Promise.all(promises);
    
    // Convert to object with sensorType as key
    const thresholdsObj = updatedThresholds.reduce((acc, threshold) => {
      acc[threshold.sensorType] = threshold.threshold;
      return acc;
    }, {});

    res.json({ success: true, thresholds: thresholdsObj });
  } catch (error) {
    console.error('Error updating sensor thresholds:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
