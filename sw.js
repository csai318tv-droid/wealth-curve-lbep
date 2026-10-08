/* 부의 곡선 L-BEP 계산기 — 서비스워커 (오프라인·설치형 앱 지원) */
const VERSION = 'lbep-2026-10-09-4';
const FONT_CACHE = VERSION + '-fonts';
const CORE = ['./', './index.html', './manifest.webmanifest', './pwa.js', './privacy.html', './membership.html', './outlook-2027.html', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 글꼴: 한 번 받으면 캐시 우선
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const c = await caches.open(FONT_CACHE);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok || res.type === 'opaque') c.put(req, res.clone());
        return res;
      } catch (err) { return Response.error(); }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  // 앱 파일: 인터넷이 되면 최신 것, 안 되면 저장해 둔 것
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    try {
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await c.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') { const idx = await c.match('./index.html'); if (idx) return idx; }
      return Response.error();
    }
  })());
});
