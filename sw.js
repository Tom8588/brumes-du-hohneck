/* Les Brumes du Hohneck : le jeu fonctionne aussi sans réseau une fois installé */
const CACHE = 'hohneck-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // le jeu : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne ; polices : cache d'abord
  const font = /fonts\.(googleapis|gstatic)\.com/.test(e.request.url);
  e.respondWith(font
    ? caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); return res; }))
    : fetch(e.request).then((res) => { if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return res; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html'))));
});
