const CACHE_NAME = "minimal-todo-v15-cloud";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Supabase / CDN -> cacheleme
  if (url.hostname.includes("supabase.co") || url.hostname.includes("cdn.jsdelivr.net") || url.hostname.includes("unpkg.com")) {
    return;
  }

  // Sayfa gezintilerinde (navigation) index fallback
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Diğer şeylerde network-first, cache fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});