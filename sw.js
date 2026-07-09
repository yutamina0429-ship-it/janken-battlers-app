// Service Worker for ジャンケンバトラーズ
//
// IMPORTANT: bump CACHE_NAME every time you re-deploy a new build.
// Testers' browsers will keep serving the OLD cached index.html forever
// otherwise (network-first still refreshes the cache in the background,
// but only after the next successful online load — bumping the version
// forces an immediate clean switch instead of waiting for that).
const CACHE_NAME = 'janken-battlers-v27';

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

// network-first: testers always get the newest build while online (the big
// html file just re-downloads), falling back to the cached copy so the game
// still opens if they're offline (e.g. testing on a train, flaky wifi, etc).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
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
