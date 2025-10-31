// sw.js — Cache minimal pour fonctionner hors ligne

const CACHE_NAME = 'v26';
const urlsToCache = [
    './',
    './index.html',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Installation : cache les ressources
self.addEventListener('install', event => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
            .then(() => {
                console.log('[SW] Cache populated successfully');
                self.skipWaiting(); // active immédiatement le nouveau SW
            })
            .catch(err => {
                console.error('[SW] Cache addAll failed:', err);
            })
    );
});

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Activation : supprime les anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Récupération : sert index.html pour toute requête racine
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    console.log('[SW] Fetch intercepted:', event.request.url);

    // On ne gère que les requêtes de type "document" (pages HTML)
    if (event.request.destination === 'document') {
        console.log('[SW] Handling as document:', url.pathname, url.search);

        event.respondWith(
            (async () => {
                try {
                    // Essayer d'aller chercher en ligne
                    console.log('[SW] Trying network...');
                    const networkResponse = await fetch(event.request);
                    console.log('[SW] Network success, returning live response');
                    return networkResponse;
                } catch (error) {
                    console.warn('[SW] Network failed, falling back to cache', error);

                    // En offline, servir index.html depuis le cache
                    const cachedResponse = await caches.match('./index.html');
                    if (cachedResponse) {
                        console.log('[SW] Returning cached ./index.html');
                        return cachedResponse;
                    }

                    // Dernier recours : échec total
                    console.error('[SW] No network and no cache for ./index.html!');
                    return new Response('Offline and no cache available', {
                        status: 503,
                        statusText: 'Service Unavailable'
                    });
                }
            })()
        );
    } else {
        // Autres ressources : cache-first
        // event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
        // );
    }
});