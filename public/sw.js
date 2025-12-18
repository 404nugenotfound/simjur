// Enhanced Service Worker for Simjur Push Notifications
const CACHE_NAME = 'simjur-sw-v1';
const NOTIFICATION_TAG = 'simjur-notification';

// Install Event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache created');
      })
      .catch(error => {
        console.error('❌ Failed to create cache:', error);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Push Event - Enhanced error handling
self.addEventListener('push', (event) => {
  console.log('📱 Push event received:', event);
  
  try {
    if (!event.data) {
      console.warn('⚠️ No data in push event');
      return;
    }
    
    let data;
    try {
      data = event.data.json();
      console.log('📊 Parsed push data:', data);
    } catch (parseError) {
      console.error('❌ Failed to parse push data:', parseError);
      return;
    }
    
    if (!data.title) {
      console.error('❌ Missing title in push data');
      return;
    }
    
    const options = {
      body: data.message || '',
      icon: data.icon || '/favicon-32x32.png',
      badge: data.badge || '/favicon-16x16.png',
      vibrate: [200, 100, 200],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      tag: data.tag || NOTIFICATION_TAG,
      renotify: true,
      data: {
        url: data.url || '/',
        timestamp: Date.now(),
        source: 'simjur-push',
        ...data.data
      }
    };
    
    console.log('🔔 Showing notification:', { title: data.title, options });
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
        .then(notification => {
          console.log('✅ Notification shown successfully');
          
          // Store notification reference
          if (data.tag) {
            event.waitUntil(
              caches.open(CACHE_NAME)
                .then(cache => {
                  return cache.put(`/notification-${data.tag}`, {
                    id: data.tag,
                    title: data.title,
                    body: options.body,
                    url: options.data.url,
                    timestamp: options.data.timestamp
                  });
                })
                .then(() => {
                  console.log('✅ Notification stored in cache');
                })
                .catch(cacheError => {
                  console.error('❌ Failed to store notification in cache:', cacheError);
                })
            );
          }
        })
        .catch(showError => {
          console.error('❌ Failed to show notification:', showError);
          
          try {
            const fallbackNotification = new Notification(data.title, {
              body: options.body,
              icon: options.icon
            });
            console.log('✅ Fallback notification shown');
          } catch (fallbackError) {
            console.error('❌ Even fallback notification failed:', fallbackError);
          }
        })
    );
    
  } catch (error) {
    console.error('🚨 Critical error in push handler:', error);
    
    try {
      self.registration.showNotification('Push Notification Error', {
        body: 'Failed to display notification',
        icon: '/favicon-32x32.png',
        tag: 'push-error',
        data: { error: error.message, timestamp: Date.now() }
      });
    } catch (fallbackError) {
      console.error('❌ Even fallback notification failed:', fallbackError);
    }
  }
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  try {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const targetUrl = notificationData.url || '/';
    
    console.log('🌐 Opening URL:', targetUrl);
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
        .then(clientList => {
          console.log('📋 Found clients:', clientList.length);
          
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              console.log('🎯 Focusing existing client');
              return client.focus();
            }
          }
          
          for (const client of clientList) {
            if ('focus' in client && client.focused) {
              console.log('📱 Focusing already focused client');
              return client.navigate(targetUrl);
            }
          }
          
          console.log('🪟 Opening new window');
          return clients.openWindow(targetUrl);
        })
        .catch(openError => {
          console.error('❌ Failed to open client:', openError);
          
          if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl);
          }
        })
    );
    
  } catch (error) {
    console.error('🚨 Critical error in notification click handler:', error);
    
    try {
      if (event.notification.data?.url) {
        event.waitUntil(
          clients.openWindow(event.notification.data.url)
        );
      }
    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
  }
});

// Notification Close Event
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
  
  try {
    if (event.notification.tag) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            return cache.delete(`/notification-${event.notification.tag}`);
          })
          .then(() => {
            console.log('✅ Notification data cleaned up');
          })
          .catch(error => {
            console.error('❌ Failed to cleanup notification data:', error);
          })
      );
    }
  } catch (error) {
    console.error('❌ Error in notification close handler:', error);
  }
});

// Push Subscription Change Event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('🔄 Subscription changed:', {
    oldSubscription: event.oldSubscription,
    newSubscription: event.newSubscription
  });
  
  try {
    // Notify clients about subscription change
    event.waitUntil(
      clients.matchAll()
        .then(clientList => {
          return Promise.all(
            clientList.map(client => {
              return client.postMessage({
                type: 'SUBSCRIPTION_CHANGED',
                payload: {
                  oldSubscription: event.oldSubscription,
                  newSubscription: event.newSubscription,
                  timestamp: Date.now()
                }
              });
            })
          );
        })
    );
  } catch (error) {
    console.error('❌ Failed to notify clients about subscription change:', error);
  }
});

// Message Event
self.addEventListener('message', (event) => {
  console.log('💬 Message received from client:', event.data);
  
  try {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'SKIP_WAITING':
        console.log('⏭ Skipping waiting for service worker');
        event.waitUntil(self.skipWaiting());
        break;
        
      case 'GET_SUBSCRIPTION':
        console.log('📋 Getting subscription for client');
        event.waitUntil(
          self.registration.pushManager.getSubscription()
            .then(subscription => {
              if (subscription) {
                return {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.getKey('p256dh') ? 
                      btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')))) : '',
                    auth: subscription.getKey('auth') ? 
                      btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')))) : ''
                  }
                };
              }
              return null;
            })
            .then(result => {
              if (event.ports && event.ports[0]) {
                event.ports[0].postMessage({
                  type: 'SUBSCRIPTION_RESULT',
                  payload: result
                });
              }
            })
        );
        break;
        
      default:
        console.log('ℹ️ Unknown message type:', type);
    }
  } catch (error) {
    console.error('❌ Error handling message from client:', error);
  }
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync event:', event.tag);
  
  if (event.tag === 'sync-subscriptions') {
    event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) {
            console.log('📤 Syncing subscription with server...');
          }
        })
    );
  }
});

// Periodic Sync
setInterval(() => {
  console.log('🕐 Periodic service worker check');
  
  const cutoffTime = Date.now() - (24 * 60 * 60 * 1000);
  
  caches.open(CACHE_NAME)
    .then(cache => {
      return cache.keys()
        .then(keys => {
          return Promise.all(
            keys
              .filter(key => key.startsWith('/notification-'))
              .map(key => cache.match(key))
              .then(responses => {
                return Promise.all(
                  responses.map(response => {
                    if (response && response.data) {
                      if (response.data.timestamp < cutoffTime) {
                        return cache.delete(key);
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  })
                );
              })
          );
        })
    })
    .then(() => {
      console.log('✅ Periodic cleanup completed');
    })
    .catch(error => {
      console.error('❌ Periodic cleanup failed:', error);
    });
}, 60 * 60 * 1000); // Every hour

// Console logging
console.log('🔧 Simjur Service Worker loaded');
console.log('🔧 Cache name:', CACHE_NAME);
console.log('🔧 Notification tag:', NOTIFICATION_TAG);