// Service Worker for Pe Thui Tracker — Push Notifications

self.addEventListener('push', (event) => {
  let data = { title: 'Pe Thui Tracker', body: 'Bạn có thông báo mới!' };

  try {
    data = event.data.json();
  } catch (e) {
    // fallback
  }

  const options = {
    body: data.body,
    icon: '/Logo.png',
    badge: '/Logoo.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'vaccine-reminder',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
