const Setting = require('../models/Setting');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find({}).sort({ type: 1 });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

// Get setting by id or type
const getSetting = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the id is a valid ObjectId (24 character hex string)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isObjectId) {
      query = { _id: id };
    } else {
      query = { type: id };
    }
    
    const setting = await Setting.findOne(query);
    
    if (!setting) {
      return res.status(404).json({ 
        message: `Setting ${isObjectId ? 'with the specified ID' : `of type '${id}'`} not found` 
      });
    }
    
    res.status(200).json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
};

// Create or update a setting
const upsertSetting = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (!type || !['prompt', 'threshold'].includes(type)) {
      return res.status(400).json({ message: 'Invalid setting type. Must be either "prompt" or "threshold"' });
    }
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Data must be a valid object' });
    }
    
    const setting = await Setting.findOneAndUpdate(
      { type },
      { data },
      { 
        new: true,
        upsert: true,
        runValidators: true 
      }
    );
    
    res.status(200).json({
      message: `Setting '${type}' has been ${setting.isNew ? 'created' : 'updated'}`,
      setting
    });
  } catch (error) {
    res.status(500).json({ message: 'Error saving setting', error: error.message });
  }
};

// Delete a setting by id or type
const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the id is a valid ObjectId (24 character hex string)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let query;
    if (isObjectId) {
      query = { _id: id };
    } else {
      query = { type: id };
    }
    
    const setting = await Setting.findOneAndDelete(query);
    
    if (!setting) {
      return res.status(404).json({ 
        message: `Setting ${isObjectId ? 'with the specified ID' : `of type '${id}'`} not found` 
      });
    }
    
    res.status(200).json({ 
      message: `Setting '${setting.type}' has been deleted`,
      deletedSetting: setting
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting setting', error: error.message });
  }
};

module.exports = {
  getSettings,
  getSetting,
  upsertSetting,
  deleteSetting
};
