// Service Worker for Next-Push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.message,
    icon: data.icon || '/favicon-32x32.png',
    badge: '/favicon-16x16.png',
    vibrate: [200, 100, 200],
    data: { url: data.url, ...data }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  if (event.notification.data?.url) {
    event.waitUntil(clients.openWindow(urlToOpen));
  }
});