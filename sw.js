const CACHE_NAME = 'etf-portfolio-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 문서(index.html) 요청은 항상 네트워크를 우선 시도한다 — 온라인이면 앱이 항상 최신 버전으로
  // 열리고, 오프라인일 때만 캐시로 대체된다. (installed PWA가 "업데이트해도 옛날 버전이 뜬다"는
  // 문제를 막기 위함 — stale-while-revalidate는 최소 한 번은 구 버전을 보여주고 나서야 갱신됨)
  const isNav = event.request.mode === 'navigate' || event.request.url.endsWith('/index.html') || event.request.url.endsWith('/');
  if (isNav) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 그 외 정적 자원(아이콘, manifest, CDN 라이브러리): 캐시 우선 + 백그라운드 갱신
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            const clone = networkResp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
