// Enhanced Service Worker for Simjur Push Notifications
const CACHE_NAME = 'simjur-sw-v1';
const NOTIFICATION_TAG = 'simjur-notification';

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => {})
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
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
        return self.clients.claim();
      })
  );
});

// Push Event
self.addEventListener('push', (event) => {
  try {
    if (!event.data) {
      return;
    }
    
    let data;
    try {
      data = event.data.json();
    } catch (parseError) {
      return;
    }
    
    if (!data.title) {
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
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
        .then(() => {
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
                .catch(() => {})
            );
          }
        })
        .catch(() => {
          // Fallback notification
          try {
            new Notification(data.title, {
              body: options.body,
              icon: options.icon
            });
          } catch (fallbackError) {
            // Silent fail
          }
        })
    );
    
  } catch (error) {
    // Silent fail for critical errors
  }
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  try {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    const targetUrl = notificationData.url || '/';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url === targetUrl && 'focus' in client) {
              return client.focus();
            }
          }
          
          for (const client of clientList) {
            if ('focus' in client && client.focused) {
              return client.navigate(targetUrl);
            }
          }
          
          return clients.openWindow(targetUrl);
        })
        .catch(() => {
          if (self.clients.openWindow) {
            return self.clients.openWindow(targetUrl);
          }
        })
    );
    
  } catch (error) {
    try {
      if (event.notification.data?.url) {
        event.waitUntil(
          clients.openWindow(event.notification.data.url)
        );
      }
    } catch (fallbackError) {
      // Silent fail
    }
  }
});

// Notification Close Event
self.addEventListener('notificationclose', (event) => {
  try {
    if (event.notification.tag) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(cache => {
            return cache.delete(`/notification-${event.notification.tag}`);
          })
          .catch(() => {})
      );
    }
  } catch (error) {
    // Silent fail
  }
});

// Push Subscription Change Event
self.addEventListener('pushsubscriptionchange', (event) => {
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
    // Silent fail
  }
});

// Message Event
self.addEventListener('message', (event) => {
  try {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'SKIP_WAITING':
        event.waitUntil(self.skipWaiting());
        break;
        
      case 'GET_SUBSCRIPTION':
        event.waitUntil(
          self.registration.pushManager.getSubscription()
            .then(subscription => {
              if (subscription) {
                return {
                  endpoint: subscription.endpoint,
                  keys: {
                    p256dh: subscription.getKey('p256dh') ? 
                      btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh'))))) : '',
                    auth: subscription.getKey('auth') ? 
                      btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth'))))) : ''
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
        // Unknown message type, ignore
        break;
    }
  } catch (error) {
    // Silent fail for message errors
  }
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-subscriptions') {
    event.waitUntil(
      self.registration.pushManager.getSubscription()
        .then(subscription => {
          // Subscription sync logic
        })
    );
  }
});

// Periodic Sync
setInterval(() => {
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
    .catch(() => {});
}, 60 * 60 * 1000); // Every hour