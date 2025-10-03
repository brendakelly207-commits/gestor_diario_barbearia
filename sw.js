const CACHE_NAME = 'gb-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/historico.html',
  '/dashboard.html',
  '/total.html',
  '/style.css',
  '/script.js',
  '/icons.png',
  '/icons/icon-512.png',
  
];

// Instalação do service worker e cache dos assets
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

// Intercepta requisições e responde do cache, atualizando se possível
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    fetch(evt.request).then(res => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(evt.request, resClone));
      return res;
    }).catch(() => caches.match(evt.request))
  );
});
