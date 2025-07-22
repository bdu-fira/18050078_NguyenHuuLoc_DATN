const WebhookData = require('../models/webhookData');
const SensorData = require('../models/sensorData');
const UplinkMessage = require('../models/uplinkMessage');
const DownlinkMessage = require('../models/downlinkMessage');
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
      case 'uplink_message':
        // Handle uplink message event
        console.log('Processing uplink message event:', webhookData.payload);
        {
          const { end_device_ids, uplink_message, received_at } = webhookData.payload;
          const deviceId = end_device_ids?.device_id;
          
          if (!deviceId) {
            console.error('Missing device ID in uplink message');
            break;
          }
          
          // Create new uplink message document
          const uplinkDoc = new UplinkMessage({
            deviceId,
            timestamp: new Date(received_at || Date.now()),
            data: uplink_message,
            rawData: webhookData.payload
          });
          
          await uplinkDoc.save();
          console.log(`Uplink message saved for device: ${deviceId}`);
        }
        break;
      case 'downlink_message':
        // Handle downlink message event
        console.log('Processing downlink message event:', webhookData.payload);
        {
          const { downlink_queued, end_device_ids } = webhookData.payload;
          const deviceId = end_device_ids?.device_id;
          
          if (!deviceId) {
            console.error('Missing device ID in downlink message');
            break;
          }
          
          // Extract command and parameters from the downlink message
          const frmPayload = downlink_queued?.frm_payload || '';
          let command = 'unknown';
          let parameters = {};
          
          try {
            // Try to parse the payload if it's in a known format
            if (frmPayload) {
              const payloadStr = Buffer.from(frmPayload, 'base64').toString('utf-8');
              try {
                const payloadData = JSON.parse(payloadStr);
                command = payloadData.cmd || 'unknown';
                parameters = { ...payloadData };
                delete parameters.cmd; // Remove cmd from parameters
              } catch (e) {
                // If not JSON, use raw payload as command
                command = 'raw_payload';
                parameters = { payload: payloadStr };
              }
            }
            
            // Create new downlink message document
            const downlinkDoc = new DownlinkMessage({
              deviceId,
              timestamp: new Date(downlink_queued?.received_at || Date.now()),
              command,
              parameters,
              status: 'pending',
              sentAt: new Date(downlink_queued?.settings?.timestamp || Date.now()),
              rawData: webhookData.payload
            });
            
            await downlinkDoc.save();
            console.log(`Downlink message saved for device: ${deviceId}, command: ${command}`);
          } catch (error) {
            console.error('Error processing downlink message:', error);
          }
        }
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
