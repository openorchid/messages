const cacheName = 'your-app-cache';
const filesToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  // Add other files to cache here
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
