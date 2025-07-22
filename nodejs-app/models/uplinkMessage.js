const mongoose = require('mongoose');

const uplinkMessageSchema = new mongoose.Schema({
    // Common fields
    deviceId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    
    // Dynamic fields to store all received data
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    
    // Metadata
    receivedAt: { type: Date, default: Date.now },
    rawData: { type: mongoose.Schema.Types.Mixed }
}, {
    strict: false, // This allows storing fields not defined in the schema
    versionKey: false
});

// Create index for better query performance
uplinkMessageSchema.index({ deviceId: 1, timestamp: -1 });

const UplinkMessage = mongoose.model('UplinkMessage', uplinkMessageSchema);

module.exports = UplinkMessage;
