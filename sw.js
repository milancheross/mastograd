const CACHE_NAME = 'mastograd-bojanka-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/coloring-library.js',
  './js/coloring-engine.js',
  './js/coloring-ui.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key.startsWith('mastograd-bojanka-') && key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Refresh application files online; keep the last successful response for offline use.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request, { cache: 'no-cache' });
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    } catch (err) {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw err;
    }
  })());
});
