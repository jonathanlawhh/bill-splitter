export default defineEventHandler((event) => {
  const buildId = process.env.BUILD_ID || 'v1';
  
  const swCode = `
const CACHE_NAME = 'bill-splitter-${buildId}';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/bill-split-favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for offline usage or network failure
      });

      return cachedResponse || fetchPromise;
    })
  );
});
  `.trim();

  // Set headers to serve as a JavaScript service worker and prevent aggressive caching of the sw script itself
  setHeader(event, 'Content-Type', 'application/javascript');
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');

  return swCode;
});
