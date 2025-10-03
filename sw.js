self.addEventListener("install", event => {
  console.log("Service Worker: Instalado");
  event.waitUntil(
    caches.open("app-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./script.js",
        "./dashboard.html",
        "./historico.html",
        "./icons.png"
      ]);
    })
  );
});

self.addEventListener("activate", event => {
  console.log("Service Worker: Ativado");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== "app-cache").map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
