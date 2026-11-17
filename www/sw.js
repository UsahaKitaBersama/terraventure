const CACHE = 'terraventure-v1';
const SHELL = ['./','./index.html','./manifest.json'];
const CDN = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([...SHELL, ...CDN])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (SHELL.includes(url.pathname) || CDN.includes(e.request.url)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
    return;
  }
  if (url.hostname.includes('tile.openstreetmap.org')) {
    e.respondWith(fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open('osm-tiles').then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request)));
  }
});
