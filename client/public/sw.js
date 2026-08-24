// ADRAR PWA service worker — network-first with offline Safety Trip support.
const CACHE = "adrar-shell-v3";
const SHELL = ["/", "/safety-trip", "/manifest.json", "/icon-512.png", "/icon-192.png", "/apple-touch-icon.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const cacheableAsset = ["script", "style", "font", "image"].includes(event.request.destination);
  if (event.request.mode !== "navigate" && !cacheableAsset) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.status === 200) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || (event.request.mode === "navigate" ? caches.match("/safety-trip").then(safety => safety || caches.match("/")) : undefined))));
});
