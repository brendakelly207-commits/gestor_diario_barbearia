const CACHE_NAME = 'gb-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/historico.html',
  '/dashboard.html',
  '/total.html',
  '/style.css',
  '/script.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then(res => res || fetch(evt.request))
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});
