// Service Worker for MateLuxy Real Estate Push Notifications
const CACHE_NAME = 'mateluxy-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json'
];

// Install event - cache important assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
  
  // Cache static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let notification = {};
  
  try {
    notification = event.data.json();
  } catch (e) {
    console.error('Error parsing push notification data:', e);
    notification = {
      title: 'New Property Request',
      body: 'You have a new property request',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: '/agent-pannel/property-requests'
      }
    };
  }

  const title = notification.title || 'MateLuxy Notification';
  const options = {
    body: notification.body || 'You have a new notification',
    icon: notification.icon || '/favicon.ico',
    badge: notification.badge || '/favicon.ico',
    data: notification.data || { url: '/agent-pannel/property-requests' },
    vibrate: [100, 50, 100],
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received', event);
  event.notification.close();
  
  // Handle notification action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Default action is to open the relevant page
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        const url = event.notification.data?.url || '/agent-pannel/property-requests';
        
        // If a window is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes('agent-pannel') && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Sync event for background syncing
self.addEventListener('sync', (event) => {
  console.log('Background sync event', event);
  
  if (event.tag === 'property-requests-sync') {
    event.waitUntil(syncPropertyRequests());
  }
});

// Function to sync property requests
async function syncPropertyRequests() {
  try {
    const response = await fetch('/api/property-requests/sync', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to sync property requests');
    }
    
    const data = await response.json();
    
    if (data.newRequests && data.newRequests.length > 0) {
      // Send notification for new requests
      self.registration.showNotification('New Property Requests', {
        body: `You have ${data.newRequests.length} new property requests.`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
          url: '/agent-pannel/property-requests'
        },
        vibrate: [100, 50, 100],
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'close',
            title: 'Dismiss'
          }
        ]
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error syncing property requests:', error);
    return null;
  }
} 