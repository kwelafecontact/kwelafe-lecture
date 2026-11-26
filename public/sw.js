// Service worker Kwélafé Lecture : met en cache l'interface, JAMAIS le contenu des livres.
// v2 (nov. 2026) :
//  - un fichier de la coquille manquant ne bloque plus l'installation ;
//  - seules les réponses valides sont mises en cache (avant, une erreur pendant un déploiement
//    pouvait rester en cache et empêcher un jeu de se charger) ;
//  - le cache est borné et les anciennes versions sont supprimées ;
//  - les jeux (/jeux-3d/) et leurs modèles ne passent jamais par ce cache.
// v3 (26 nov. 2026) : seuls les FICHIERS (images, sons…) de /jeux/ sont gardés « cache d'abord ».
//  Avant, les pages et données des jeux 2D (/jeux/fusion-pei, ?_rsc=…) l'étaient aussi :
//  une mise à jour d'un jeu n'arrivait jamais sur un appareil qui l'avait déjà ouvert.
const CACHE = "kwelafe-v5";
const CACHE_PAGES = "kwelafe-pages-v2";
// v5 : livres hors connexion, lus chiffrés depuis IndexedDB (/c/hl/<livre>/<fichier>) // pages et jeux gardés pour le hors connexion (jamais les livres)
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
    caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE && k !== CACHE_PAGES).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

async function borner(cache) {
  const cles = await cache.keys();
  for (let i = 0; i < cles.length - MAX_ENTREES; i++) await cache.delete(cles[i]);
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.startsWith("/c/hl/")) { e.respondWith(livreHorsLigne(url.pathname)); return; }
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
  // Images des jeux, avatars, marque-pages, logos : cache d'abord
  const fichier = /\.(webp|png|jpe?g|gif|svg|avif|mp3|m4a|ogg|wav|glb|woff2?)$/i.test(url.pathname);
  if ((fichier && /^\/(jeux|avatars|marque-pages)\//.test(url.pathname)) || /^\/logo-/.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((rep) => {
      if (rep.ok && rep.type === "basic") { const copie = rep.clone(); e.waitUntil(caches.open(CACHE_PAGES).then((c) => c.put(e.request, copie))); }
      return rep;
    })));
    return;
  }
  if (e.request.mode === "navigate") {
    // Pages de l'app (jamais le lecteur ni les livres) : réseau d'abord, copie gardée pour le hors connexion
    const gardable = /^\/($|portails|jeux|ecole|classe|catalogue|livres|compte|mes-livres-hors-ligne)/.test(url.pathname);
    e.respondWith(
      fetch(e.request).then((rep) => {
        if (gardable && rep.ok && rep.type === "basic") { const copie = rep.clone(); e.waitUntil(caches.open(CACHE_PAGES).then((c) => c.put(url.pathname, copie))); }
        return rep;
      }).catch(() => caches.match(url.pathname, { cacheName: CACHE_PAGES }).then((r) => r || caches.match(PAGE_HORS_LIGNE)).then((r) => r || Response.error()))
    );
  }
});

// Préparer les jeux pour le hors connexion : on garde chaque page de jeu et tous ses fichiers
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.kw !== "prechauffer" || !Array.isArray(d.urls)) return;
  e.waitUntil((async () => {
    const pages = await caches.open(CACHE_PAGES);
    const statiques = await caches.open(CACHE);
    let fait = 0;
    for (const u of d.urls) {
      try {
        const rep = await fetch(u, { credentials: "same-origin" });
        if (!rep.ok) continue;
        const html = await rep.clone().text();
        await pages.put(new URL(u, location.origin).pathname, rep);
        const fichiers = [...new Set(html.match(/\/(_next\/static|jeux|avatars)\/[^"'\s)\\]+/g) || [])];
        for (const f of fichiers) {
          const c = f.startsWith("/_next/") ? statiques : pages;
          if (!(await c.match(f))) { try { const r = await fetch(f); if (r.ok) await c.put(f, r); } catch {} }
        }
      } catch {}
      fait++;
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.postMessage({ kw: "progression-hors-ligne", fait, total: d.urls.length }));
    }
  })());
});

// Livres téléchargés : déchiffrés à la volée, jamais stockés en clair
function ouvrirHL() {
  return new Promise((ok, ko) => { const r = indexedDB.open("kwelafe-hl", 1); r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("cle"); d.createObjectStore("livres"); d.createObjectStore("fichiers"); }; r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
}
function lireHL(d, magasin, cle) {
  return new Promise((ok) => { const r = d.transaction(magasin).objectStore(magasin).get(cle); r.onsuccess = () => ok(r.result); r.onerror = () => ok(undefined); });
}
async function livreHorsLigne(chemin) {
  try {
    const reste = decodeURIComponent(chemin.slice("/c/hl/".length));
    const id = reste.split("/")[0];
    const d = await ouvrirHL();
    const [livre, k, f] = await Promise.all([lireHL(d, "livres", id), lireHL(d, "cle", "k"), lireHL(d, "fichiers", reste)]);
    if (!livre || !k || !f) return new Response("Introuvable", { status: 404 });
    if (livre.expire < Date.now()) return new Response("Expiré", { status: 403 });
    const clair = await crypto.subtle.decrypt({ name: "AES-GCM", iv: f.iv }, k, f.data);
    return new Response(clair, { headers: { "Content-Type": f.type, "Cache-Control": "no-store" } });
  } catch { return new Response("Erreur", { status: 500 }); }
}
