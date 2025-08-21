const CACHE_NAME = 'echoroom-v5';
const urlsToCache = [
  '/',
  '/EchoRoom.png',
  '/manifest.json'
];

// Check if running on iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip service worker for iOS Safari to prevent interference
  if (isIOS && request.mode === 'navigate') {
    return;
  }

  // Images: Cache-first with stale-while-revalidate
  if (request.destination === 'image') {
    event.respondWith((async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      } catch (error) {
        console.error('Image fetch error:', error);
        return fetch(request);
      }
    })());
    return;
  }

  // Default: Cache falling back to network
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).catch(() => {
          // Return a fallback response for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Network error', { status: 408 });
        });
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        return fetch(request);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
