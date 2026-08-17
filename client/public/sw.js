// ADRAR PWA service worker — network-first with offline fallback.
// Kept minimal: caches the app shell so the site meets install criteria and
// keeps working briefly offline.
const CACHE = "adrar-shell-v1";
const SHELL = ["/", "/manifest.json", "/icon-512.png", "/icon-192.png", "/apple-touch-icon.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL).catch(() => {}))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation requests; stale cache as fallback.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode !== "navigate" && !event.request.url.includes("/icon")) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match("/")))
  );
});
