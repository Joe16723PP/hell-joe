const VERSION = "tuengwa-v3";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;

// The worker is served from the site root, including a GitHub Pages project path.
const BASE = new URL("./", self.location).pathname.replace(/\/$/, "");

const PAGES = ["/", "/library", "/session", "/exercise", "/barbell", "/recap", "/recap/exercise"];
const FILES = ["/sounds/tick.wav"];

function pagePath(path) {
  if (path === "/") return BASE ? `${BASE}/` : "/";
  return `${BASE}${path}/`;
}

function filePath(path) {
  return `${BASE}${path}`;
}

const PRECACHE = [...PAGES.map(pagePath), ...FILES.map(filePath)];
const HOME = pagePath("/");

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
  const path = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return (
    path.startsWith("/illustrations/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/sounds/") ||
    path.startsWith("/_next/static/")
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
    .catch(() => cached ?? caches.match(HOME));
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
