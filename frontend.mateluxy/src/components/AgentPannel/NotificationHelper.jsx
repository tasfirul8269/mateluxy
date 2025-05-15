import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  isPushNotificationSupported, 
  getNotificationPermissionStatus,
  subscribeToPushNotifications
} from '@/utils/pushNotifications';

// This component doesn't render anything visible
// It helps manage notifications across the application
export function NotificationHelper() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only initialize once
    if (initialized) return;
    
    const initializeNotifications = async () => {
      try {
        // Check if push notifications are supported
        if (!isPushNotificationSupported()) {
          console.log('Push notifications are not supported in this browser');
          return;
        }

        // Check current permission status
        const permission = getNotificationPermissionStatus();
        
        // If permission was granted before, ensure subscription is active
        if (permission === 'granted') {
          // Get user preference from settings
          const savedSettings = localStorage.getItem('agent_settings');
          let pushEnabled = false;
          
          if (savedSettings) {
            try {
              const parsedSettings = JSON.parse(savedSettings);
              pushEnabled = parsedSettings.pushNotificationsEnabled;
            } catch (error) {
              console.error('Error parsing saved settings:', error);
            }
          }
          
          // If user has enabled push notifications in settings, ensure subscription
          if (pushEnabled) {
            const result = await subscribeToPushNotifications();
            if (!result.success) {
              console.warn('Failed to reestablish push notification subscription:', result.message);
            }
          }
        }
        
        // Register service worker message handler for notifications
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };
    
    initializeNotifications();
    
    // Clean up event listener when component unmounts
    return () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [initialized]);
  
  // Handle messages from service worker
  const handleServiceWorkerMessage = (event) => {
    if (event.data && event.data.type === 'NOTIFICATION') {
      // Display toast notification
      toast(event.data.title, {
        description: event.data.body,
        action: {
          label: 'View',
          onClick: () => {
            if (event.data.data && event.data.data.url) {
              window.location.href = event.data.data.url;
            }
          }
        }
      });
    }
  };
  
  // This component doesn't render anything visible
  return null;
} 