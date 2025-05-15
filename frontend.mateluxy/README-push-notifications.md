# Push Notifications Implementation Guide

This document describes how to implement push notifications on the backend for the MateLuxy Real Estate platform.

## Overview

Push notifications allow the platform to send notifications to agents about new property requests even when they don't have the website open. This implementation uses:

- Web Push API
- Service Workers
- VAPID (Voluntary Application Server Identification) for secure message sending

## Backend Requirements

To complete the push notification implementation, you'll need to add the following components to your backend:

### 1. Install Required Packages

```bash
npm install web-push
```

### 2. Generate VAPID Keys

You need to generate VAPID keys once and save them securely:

```javascript
const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

Store these keys securely in your environment variables.

### 3. Create Model for Push Subscriptions

Create a new model to store push subscriptions:

```javascript
// models/pushSubscription.model.js
import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  subscription: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // Auto-delete after 30 days if not used
  }
});

const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);

export default PushSubscription;
```

### 4. Create Push Notification Controller

```javascript
// controllers/push.controller.js
import webpush from 'web-push';
import PushSubscription from '../models/pushSubscription.model.js';
import { errorHandler } from '../utils/errors.js';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Change this to your contact email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Endpoint to provide the VAPID public key to clients
export const getVapidPublicKey = (req, res) => {
  res.status(200).send(process.env.VAPID_PUBLIC_KEY);
};

// Save a new push subscription
export const saveSubscription = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return next(errorHandler(400, 'Invalid subscription object'));
    }
    
    // Check if subscription already exists for this agent
    const existingSubscription = await PushSubscription.findOne({
      agentId,
      'subscription.endpoint': subscription.endpoint
    });
    
    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.subscription = subscription;
      existingSubscription.createdAt = Date.now(); // Reset expiration
      await existingSubscription.save();
      
      return res.status(200).json({
        success: true,
        message: 'Subscription updated successfully'
      });
    }
    
    // Create new subscription
    const newSubscription = new PushSubscription({
      agentId,
      subscription
    });
    
    await newSubscription.save();
    
    res.status(201).json({
      success: true,
      message: 'Push subscription saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete a push subscription
export const deleteSubscription = async (req, res, next) => {
  try {
    const agentId = req.user.id;
    const subscription = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return next(errorHandler(400, 'Invalid subscription object'));
    }
    
    await PushSubscription.findOneAndDelete({
      agentId,
      'subscription.endpoint': subscription.endpoint
    });
    
    res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Send a push notification to a specific agent
export const sendNotificationToAgent = async (agentId, payload) => {
  try {
    const subscriptions = await PushSubscription.find({ agentId });
    
    if (!subscriptions.length) {
      console.log(`No push subscriptions found for agent ${agentId}`);
      return { success: false, message: 'No subscriptions found' };
    }
    
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify(payload)
          );
          return { success: true, endpoint: sub.subscription.endpoint };
        } catch (error) {
          console.error('Error sending push notification:', error);
          
          // If subscription is no longer valid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            await PushSubscription.findByIdAndDelete(sub._id);
          }
          
          return { 
            success: false, 
            endpoint: sub.subscription.endpoint,
            error: error.message
          };
        }
      })
    );
    
    return { 
      success: true, 
      results,
      message: `Attempted to send notifications to ${subscriptions.length} subscriptions`
    };
  } catch (error) {
    console.error('Error in sendNotificationToAgent:', error);
    return { success: false, message: error.message };
  }
};
```

### 5. Create Push Notification Routes

```javascript
// routes/push.routes.js
import express from 'express';
import { verifyToken } from '../utils/verifyToken.js';
import { 
  getVapidPublicKey,
  saveSubscription,
  deleteSubscription
} from '../controllers/push.controller.js';

const router = express.Router();

// Get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Save push subscription
router.post('/save-subscription', verifyToken, saveSubscription);

// Delete push subscription
router.post('/delete-subscription', verifyToken, deleteSubscription);

export default router;
```

### 6. Integrate with Property Requests

Modify your property requests controller to send push notifications when a new request is created:

```javascript
// controllers/propertyRequests.controller.js
import { sendNotificationToAgent } from './push.controller.js';

// In your createPropertyRequest function, after saving the request:
const property = await Property.findById(propertyInfo.propertyId);
if (property && property.agent) {
  // Send push notification to the agent
  await sendNotificationToAgent(property.agent, {
    title: 'New Property Request',
    body: `${name} is interested in ${propertyInfo.propertyTitle}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: '/agent-pannel/property-requests'
    }
  });
}
```

### 7. Register Routes in Your Express App

```javascript
// index.js or app.js
import pushRouter from './routes/push.routes.js';

// Register push notification routes
app.use('/api/push', pushRouter);
```

### 8. Update Environment Configuration

Add these environment variables to your .env file:

```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

## Testing

1. Make sure your server and frontend are running
2. Log in as an agent
3. Click the bell icon to enable push notifications
4. Accept the browser permission
5. Create a new property request
6. Verify that you receive a push notification even when the browser tab is closed

## Further Improvements

- Add notification preferences for agents
- Implement notification grouping for multiple requests
- Add analytics for notification delivery rates
- Create a notification center on the backend to track all sent notifications 