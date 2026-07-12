// Service Worker for ジャンケンバトラーズ
//
// IMPORTANT: bump CACHE_NAME every time you re-deploy a new build.
// This mainly matters for the offline fallback cache now (see below) — the
// network-first fetch strategy no longer depends on it for freshness.
const CACHE_NAME = 'janken-battlers-v29';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-180.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((err) => console.warn('SW install cache failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// network-first: testers always get the newest build while online, falling
// back to the cached copy so the game still opens if they're offline.
//
// IMPORTANT: the network fetch below uses {cache: 'no-store'}. Without it,
// this "network" request can still be silently answered by the BROWSER's own
// HTTP cache (a separate layer underneath the Service Worker's Cache API) if
// GitHub Pages sends any cache-friendly headers on index.html or the asset
// files — meaning testers could keep seeing an old index.html, or an old
// card image after it was replaced under the same filename, even though this
// code "tried the network first" the whole time. no-store forces a real
// round-trip to the server every time, which is what we actually want here.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(event.request, copy))
          .catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
