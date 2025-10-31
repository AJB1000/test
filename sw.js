const CACHE_NAME = 'pwa-git01-v1';
const BASE_URL = self.location.pathname.replace(/sw\.js$/, '');

const urlsToCache = [
    `${BASE_URL}`,
    `${BASE_URL}index.html`,
    `${BASE_URL}script.js`,
    `${BASE_URL}manifest.json`,
    `${BASE_URL}icons/icon-192.png`,
    `${BASE_URL}icons/icon-512.png`
];

// Installation et mise en cache
self.addEventListener('install', event => {
    console.log('[SW] Installation');
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// Activation : suppression anciens caches
self.addEventListener('activate', event => {
    console.log('[SW] Activation');
    self.clients.claim();
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Si trouvé dans le cache → renvoie
            if (response) return response;

            // Sinon, tente le réseau
            return fetch(event.request).catch(() => {
                // En mode offline : renvoie index.html pour les navigations
                if (event.request.mode === 'navigate') {
                    return caches.match(`${BASE_URL}index.html`);
                }
            });
        })
    );
});
