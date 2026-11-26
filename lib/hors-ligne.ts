"use client";
// Livres hors connexion : stockés chiffrés (AES-GCM) dans IndexedDB.
// La clé est créée NON exportable : elle ne peut pas être lue, seulement utilisée par l'app.
// Le service worker lit la même base pour servir /c/hl/<livre>/<fichier>.
export const MAX_LIVRES = 5;
export type LivreHL = { id: string; slug: string; titre: string; couverture: string | null; manifeste: any; expire: number; ajoute: number };

function base(): Promise<IDBDatabase> {
  return new Promise((ok, ko) => {
    const r = indexedDB.open("kwelafe-hl", 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("cle"); d.createObjectStore("livres"); d.createObjectStore("fichiers"); };
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  });
}
function op<T>(magasin: string, mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  return base().then((d) => new Promise<T>((ok, ko) => { const t = d.transaction(magasin, mode); const r = f(t.objectStore(magasin)); r.onsuccess = () => ok(r.result as T); r.onerror = () => ko(r.error); }));
}
async function cle(): Promise<CryptoKey> {
  const k = await op<CryptoKey | undefined>("cle", "readonly", (s) => s.get("k"));
  if (k) return k;
  const n = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  await op("cle", "readwrite", (s) => s.put(n, "k"));
  return n;
}

export const listerHL = async () => ((await op<LivreHL[]>("livres", "readonly", (s) => s.getAll())) || []).sort((a, b) => b.ajoute - a.ajoute);
export const estHL = async (id: string) => !!(await op<LivreHL | undefined>("livres", "readonly", (s) => s.get(id)));

export async function supprimerHL(id: string) {
  const d = await base();
  await new Promise<void>((ok) => {
    const t = d.transaction(["livres", "fichiers"], "readwrite");
    t.objectStore("livres").delete(id);
    t.objectStore("fichiers").delete(IDBKeyRange.bound(`${id}/`, `${id}/￿`));
    t.oncomplete = () => ok(); t.onerror = () => ok();
  });
}

export async function telechargerHL(livreId: string, progres: (fait: number, total: number) => void) {
  const deja = await listerHL();
  if (!deja.some((l) => l.id === livreId) && deja.length >= MAX_LIVRES) throw new Error(`Tu as déjà ${MAX_LIVRES} livres hors connexion. Retire-en un pour en ajouter un autre.`);
  const r = await fetch(`/api/hors-ligne?livre=${encodeURIComponent(livreId)}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.erreur || "Téléchargement impossible");
  const k = await cle();
  const total = j.fichiers.length;
  for (let n = 0; n < total; n++) {
    const f = j.fichiers[n];
    const rep = await fetch(`/c/${j.jeton}/${f}`);
    if (!rep.ok) throw new Error("Une page n'a pas pu être téléchargée. Réessaie avec une bonne connexion.");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, await rep.arrayBuffer());
    await op("fichiers", "readwrite", (s) => s.put({ iv, data, type: rep.headers.get("Content-Type") || "image/webp" }, `${livreId}/${f}`));
    progres(n + 1, total);
  }
  const meta: LivreHL = { ...j.livre, expire: j.expire, ajoute: Date.now() };
  await op("livres", "readwrite", (s) => s.put(meta, livreId));
  // Garder la page de la bibliothèque hors connexion et son code
  navigator.serviceWorker?.controller?.postMessage({ kw: "prechauffer", urls: ["/mes-livres-hors-ligne"] });
  return meta;
}

/** De retour en ligne : prolonge les livres encore autorisés, retire ceux dont l'accès est fini. */
export async function verifierHL() {
  if (!navigator.onLine) return;
  for (const l of await listerHL()) {
    try {
      const r = await fetch(`/api/hors-ligne?livre=${encodeURIComponent(l.id)}&verif=1`);
      if (r.status === 403 || r.status === 404) await supprimerHL(l.id);
      else if (r.ok) { const j = await r.json(); await op("livres", "readwrite", (s) => s.put({ ...l, expire: j.expire }, l.id)); }
    } catch {}
  }
}
