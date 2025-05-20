// Push Notifications Utility for MateLuxy

// Function to check if Push API is supported in this browser
function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Function to request permission for notifications
async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    console.log('Push notifications not supported');
    return { supported: false, granted: false };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { 
      supported: true, 
      granted: permission === 'granted' 
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { supported: true, granted: false, error };
  }
}

// Function to get current notification permission status
function getNotificationPermissionStatus() {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  
  return Notification.permission;
}

// Function to register service worker
async function registerServiceWorker() {
  if (!isPushNotificationSupported()) return null;
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered successfully', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Function to subscribe to push notifications
async function subscribeToPushNotifications(apiBaseUrl = import.meta.env.VITE_API_URL) {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Push notifications not supported' };
  }
  
  try {
    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      const permissionResult = await requestNotificationPermission();
      if (!permissionResult.granted) {
        return { 
          success: false, 
          message: 'Notification permission denied' 
        };
      }
    }
    
    // Register service worker if not already registered
    let serviceWorkerRegistration = await navigator.serviceWorker.ready;
    if (!serviceWorkerRegistration) {
      serviceWorkerRegistration = await registerServiceWorker();
      if (!serviceWorkerRegistration) {
        return { 
          success: false, 
          message: 'Service worker registration failed' 
        };
      }
    }
    
    // Get existing push subscription
    let subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    
    // If subscription doesn't exist, create one
    if (!subscription) {
      try {
        // Get public key from server
        const response = await fetch(`${apiBaseUrl}/api/push/vapid-public-key`);
        if (!response.ok) {
          throw new Error(`Failed to get VAPID key from server: ${response.status}`);
        }
        
        const vapidPublicKey = await response.text();
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        // Create new subscription
        subscription = await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return { 
          success: false, 
          message: `Error subscribing to push notifications: ${error.message}` 
        };
      }
    }
    
    try {
      // Send the subscription to the server
      const saveSubscriptionResponse = await fetch(`${apiBaseUrl}/api/push/save-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(subscription)
      });
      
      if (!saveSubscriptionResponse.ok) {
        console.warn('Failed to save subscription on server');
        return {
          success: true,
          subscription,
          warning: 'Subscription created but not saved on server',
          message: 'Successfully subscribed to push notifications (local only)'
        };
      }
    } catch (error) {
      console.warn('Error saving subscription on server:', error);
      return {
        success: true,
        subscription,
        warning: 'Subscription created but not saved on server',
        message: 'Successfully subscribed to push notifications (local only)'
      };
    }
    
    return { 
      success: true, 
      subscription, 
      message: 'Successfully subscribed to push notifications' 
    };
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return { 
      success: false, 
      message: 'Error subscribing to push notifications', 
      error: error.message 
    };
  }
}

// Function to unsubscribe from push notifications
async function unsubscribeFromPushNotifications(apiBaseUrl = import.meta.env.VITE_API_URL) {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Push notifications not supported' };
  }
  
  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const subscription = await serviceWorkerRegistration.pushManager.getSubscription();
    
    if (!subscription) {
      return { 
        success: true, 
        message: 'No subscription found to unsubscribe' 
      };
    }
    
    // Try to delete subscription from server
    try {
      const deleteSubscriptionResponse = await fetch(`${apiBaseUrl}/api/push/delete-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(subscription)
      });
      
      if (!deleteSubscriptionResponse.ok) {
        console.warn('Failed to delete subscription from server, continuing with local unsubscription');
      }
    } catch (error) {
      console.warn('Error deleting subscription from server, continuing with local unsubscription:', error);
    }
    
    // Unsubscribe locally
    const unsubscribeResult = await subscription.unsubscribe();
    
    return { 
      success: unsubscribeResult, 
      message: unsubscribeResult 
        ? 'Successfully unsubscribed from push notifications' 
        : 'Failed to unsubscribe from push notifications' 
    };
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return { 
      success: false, 
      message: 'Error unsubscribing from push notifications', 
      error: error.message 
    };
  }
}

// Utility function to convert base64 string to Uint8Array
// This is required for the applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

export {
  isPushNotificationSupported,
  requestNotificationPermission,
  getNotificationPermissionStatus,
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
}; 