const CACHE_VERSION = 'mrg-date-night-offline-v1';
const CORE_CACHE = `${CACHE_VERSION}-core`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_GAME_FILES = [
  '/play.html',
  '/i18n-core.js',
  '/i18n-cards.js',
  '/locales/cards-sk.json',
  '/locales/cards-cz.json',
  '/locales/cards-pl.json',
  '/locales/cards-en.json',
  '/offline.html'
];

const OPTIONAL_FILES = [
  '/account.html',
  '/manifest.webmanifest',
  '/assets/devil-x.png',
  '/assets/mrgreys-x.jpg'
];

async function safeCache(cache, urls) {
  const results = await Promise.allSettled(urls.map(async (url) => {
    const req = new Request(url, { cache: 'reload' });
    const res = await fetch(req);
    if (!res || !res.ok) throw new Error(`Cache fetch failed: ${url}`);
    await cache.put(req, res.clone());
  }));
  return results;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    // Installation may not fail just because an optional asset is temporarily unavailable.
    await safeCache(cache, CORE_GAME_FILES);
    await safeCache(cache, OPTIONAL_FILES);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith('mrg-date-night-offline-') && ![CORE_CACHE, RUNTIME_CACHE].includes(name))
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'CACHE_GAME') {
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(CORE_CACHE);
        const required = await safeCache(cache, CORE_GAME_FILES);
        await safeCache(cache, OPTIONAL_FILES);
        const failedRequired = required.filter((r) => r.status === 'rejected').length;
        event.source?.postMessage({ type: 'CACHE_GAME_RESULT', ok: failedRequired === 0 });
      } catch (error) {
        event.source?.postMessage({ type: 'CACHE_GAME_RESULT', ok: false });
      }
    })());
  }
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isGameAsset(url) {
  return url.origin === self.location.origin && (
    url.pathname === '/play.html' ||
    url.pathname === '/account.html' ||
    url.pathname === '/i18n-core.js' ||
    url.pathname === '/i18n-cards.js' ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/offline.html' ||
    url.pathname.startsWith('/locales/') ||
    url.pathname.startsWith('/assets/')
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache APIs, auth, checkout or third-party network requests.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && isGameAsset(url)) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (error) {
        const exact = await caches.match(req, { ignoreSearch: true });
        if (exact) return exact;
        if (url.pathname.includes('play')) {
          const play = await caches.match('/play.html', { ignoreSearch: true });
          if (play) return play;
        }
        return (await caches.match('/offline.html')) || Response.error();
      }
    })());
    return;
  }

  if (isGameAsset(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(req, { ignoreSearch: true });
      if (cached) {
        // Refresh in the background whenever possible.
        event.waitUntil(fetch(req).then(async (fresh) => {
          if (fresh && fresh.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(req, fresh.clone());
          }
        }).catch(() => {}));
        return cached;
      }
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (error) {
        return Response.error();
      }
    })());
  }
});
