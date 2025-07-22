const mongoose = require('mongoose');

const downlinkMessageSchema = new mongoose.Schema({
    // Common fields
    deviceId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    
    // Command/control data
    command: { type: String, required: true },
    
    // Dynamic fields to store all received data
    parameters: { type: mongoose.Schema.Types.Mixed, default: {} },
    
    // Status tracking
    status: { 
        type: String, 
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
    },
    
    // Metadata
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    error: { type: String }
}, {
    strict: false, // This allows storing fields not defined in the schema
    versionKey: false
});

// Create index for better query performance
downlinkMessageSchema.index({ deviceId: 1, timestamp: -1 });
downlinkMessageSchema.index({ status: 1 });

const DownlinkMessage = mongoose.model('DownlinkMessage', downlinkMessageSchema);

module.exports = DownlinkMessage;
