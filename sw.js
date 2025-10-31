// sw.js — Cache minimal pour fonctionner hors ligne

const CACHE_NAME = 'v16';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Installation : cache les ressources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
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
});

// Récupération : sert index.html pour toute requête racine
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    if (url.pathname === '/' || url.pathname === '/index.html') {
        event.respondWith(
            caches.match('/index.html')
                .then(response => response || fetch(event.request))
        );
        return;
    }

    // Autres ressources : cache-first
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});