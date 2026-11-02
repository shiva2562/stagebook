// Network first for the app itself so updates show up; cached copy when offline (on stage without Wi-Fi).
const CACHE = 'stagebook-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const keep = res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(keep).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./index.html'))));
  } else if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(keep)));
  }
});
