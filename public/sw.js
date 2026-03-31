/* Service Worker for YOUMAN App */

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Listener for background actions
self.addEventListener('push', (event) => {
    let data = { title: 'YOUMAN Alarm', body: 'Waktunya melaksanakan protokol harian Anda!' };
    try {
        data = event.data.json();
    } catch (e) {
        // use default
    }

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039430.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3039/3039430.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        tag: 'youman-alarm',
        requireInteraction: true,
        actions: [
            { action: 'check', title: 'I\'m Ready!' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action !== 'close') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/mobile' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/mobile');
                }
            })
        );
    }
});
