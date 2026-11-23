// Service worker Kwélafé Lecture : met en cache l'interface, JAMAIS le contenu des livres.
const CACHE = "kwelafe-v1";
const COQUILLE = ["/manifest.webmanifest", "/icone-192.png", "/icone-512.png", "/hors-ligne"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUILLE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/c/") || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((rep) => {
      const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(e.request, copie)); return rep;
    })));
    return;
  }
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match("/hors-ligne")));
  }
});
