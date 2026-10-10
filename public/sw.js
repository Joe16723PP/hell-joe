const VERSION = "tuengwa-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;

// The app shell. Everything else, including illustrations, is cached as it is used.
const PRECACHE = ["/", "/library", "/session", "/exercise", "/barbell", "/recap", "/recap/exercise", "/sounds/tick.wav"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(page(request));
    return;
  }
  if (isStaticAsset(url.pathname)) {
    event.respondWith(asset(request));
  }
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/illustrations/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/sounds/") ||
    pathname.startsWith("/_next/static/")
  );
}

// A page the app has opened before comes from the cache, so the app works offline.
// A page it has not opened yet falls back to the home screen, which is always cached.
async function page(request) {
  const cache = await caches.open(PAGES_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) void cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached ?? caches.match("/"));
  return cached ?? network;
}

// Static files are content-hashed or versioned, so the first copy we keep stays valid.
async function asset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) void cache.put(request, response.clone());
  return response;
}
