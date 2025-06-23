const WebhookData = require('../models/webhookData');
const SensorData = require('../models/sensorData');
const dotenv = require('dotenv');
dotenv.config();

// Secret token for webhook verification (optional but recommended)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Process incoming webhook
exports.handleWebhook = async (req, res) => {
  try {
    const { headers, body } = req;

    // Verify webhook signature if secret is provided (optional)
    if (WEBHOOK_SECRET) {
      const signature = headers['x-webhook-signature'] || headers['authorization'];
      if (!signature || !verifySignature(signature, body, WEBHOOK_SECRET)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Extract event type and source from headers or body
    const eventType = headers['x-event-type'] || body.event?.type || 'unknown';
    const source = headers['x-webhook-source'] || body.source || 'unknown';
    console.log(body)
    // Save webhook data
    const webhookData = new WebhookData({
      eventType,
      source,
      payload: body,
      receivedAt: new Date(),
      processed: false
    });

    await webhookData.save();

    // Process the webhook data (you can add your business logic here)
    await processWebhookData(webhookData);

    // Update webhook as processed
    webhookData.processed = true;
    await webhookData.save();

    // Send immediate response
    res.status(200).json({
      status: 'success',
      message: 'Webhook received and processed',
      webhookId: webhookData._id
    });

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Save error information if we have a webhookData instance
    // if (webhookData) {
    //   webhookData.processingError = error.message;
    //   await webhookData.save();
    // }

    res.status(500).json({
      error: 'Error processing webhook',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Process webhook data (add your business logic here)
async function processWebhookData(webhookData) {
  try {
    // Example: Process different event types
    switch (webhookData.eventType) {
      case 'sensors_data':
        // Process sensor data
        console.log('Processing sensor data:', webhookData.payload);

        // Extract the decoded payload from the uplink message
        const { uplink_message, end_device_ids } = webhookData.payload;
        const decodedPayload = uplink_message?.decoded_payload || {};

        // Create sensor data document with the new format
        const sensorData = new SensorData({
          deviceId: end_device_ids?.device_id,
          timestamp: new Date(uplink_message?.received_at || Date.now()),
          ...decodedPayload, // Spread all the sensor data fields
          
          // Map location if available in the payload
          location: uplink_message?.locations?.user ? {
            type: 'Point',
            coordinates: [
              uplink_message?.locations?.user?.longitude || 0,
              uplink_message?.locations?.user?.latitude || 0
            ]
          } : undefined,
          
          // Store the raw payload in metadata for reference
          metadata: {
            ...webhookData.payload,
            processedAt: new Date()
          }
        });


        await sensorData.save();
        console.log(`Sensor data saved for device: ${sensorData.deviceId}`);
        break;
      case 'join_device':
        // Handle join device event
        console.log('Processing join device event:', webhookData.payload);
        console.log(webhookData.payload)
        break;
      // Add more event types as needed
      default:
        console.log(`Processing ${webhookData.eventType} event`);
    }
  } catch (error) {
    console.error('Error in webhook processing:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

// Verify webhook signature (example using HMAC-SHA256)
function verifySignature(signature, payload, secret) {
  // Remove 'Bearer ' if present
  const receivedSignature = signature.startsWith('Bearer ')
    ? signature.slice(7)
    : signature;

  // In a real implementation, you would verify the signature here
  // This is a simplified example
  return true; // Replace with actual verification logic
}

// Get all webhook data (for debugging/administration)
exports.getWebhookData = async (req, res) => {
  try {
    const { limit = 50, page = 1, eventType, source } = req.query;

    const query = {};
    if (eventType) query.eventType = eventType;
    if (source) query.source = source;

    const webhooks = await WebhookData.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhook data:', error);
    res.status(500).json({ error: 'Error fetching webhook data' });
  }
};

// Get webhook data by ID
exports.getWebhookById = async (req, res) => {
  try {
    const webhook = await WebhookData.findById(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }
    res.json(webhook);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    res.status(500).json({ error: 'Error fetching webhook' });
  }
};
