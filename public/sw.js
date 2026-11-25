// Service worker Kwélafé Lecture : met en cache l'interface, JAMAIS le contenu des livres.
// v2 (nov. 2026) :
//  - un fichier de la coquille manquant ne bloque plus l'installation ;
//  - seules les réponses valides sont mises en cache (avant, une erreur pendant un déploiement
//    pouvait rester en cache et empêcher un jeu de se charger) ;
//  - le cache est borné et les anciennes versions sont supprimées ;
//  - les jeux (/jeux-3d/) et leurs modèles ne passent jamais par ce cache.
const CACHE = "kwelafe-v2";
const PAGE_HORS_LIGNE = "/hors-ligne"; // servie par Cloudflare à partir de public/hors-ligne.html
const COQUILLE = ["/manifest.webmanifest", "/icone-192.png", "/icone-512.png", PAGE_HORS_LIGNE];
const MAX_ENTREES = 160;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // un fichier manquant ne doit pas empêcher l'installation
      .then((c) => Promise.all(COQUILLE.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

async function borner(cache) {
  const cles = await cache.keys();
  for (let i = 0; i < cles.length - MAX_ENTREES; i++) await cache.delete(cles[i]);
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/c/") || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/jeux-3d/")) return;
  if (url.pathname.startsWith("/_next/static/")) {
    // Fichiers versionnés par leur nom : cache d'abord, réseau sinon
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((rep) => {
      if (rep.ok && rep.type === "basic") {
        const copie = rep.clone();
        e.waitUntil(caches.open(CACHE).then((c) => c.put(e.request, copie).then(() => borner(c))));
      }
      return rep;
    })));
    return;
  }
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).catch(() => caches.match(PAGE_HORS_LIGNE).then((r) => r || Response.error())));
  }
});
