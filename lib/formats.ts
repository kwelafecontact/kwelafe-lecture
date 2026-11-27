// Formats des livres : chaque rayon (EPUB, PDF, Interactifs) ne montre qu'une fois le même livre.
import type { Livre } from "./donnees";

export type Format = "epub" | "pdf" | "interactif";

export const FORMATS: { id: Format; nom: string; court: string; emoji: string; couleur: string; clair: string; texte: string }[] = [
  { id: "epub", nom: "Livres EPUB", court: "EPUB", emoji: "📖", couleur: "#1f6fb2", clair: "#e3effa", texte: "Texte qui s'adapte à l'écran, pages animées" },
  { id: "pdf", nom: "Livres PDF", court: "PDF", emoji: "📄", couleur: "#d6332a", clair: "#fde6e3", texte: "La mise en page du livre imprimé" },
  { id: "interactif", nom: "Livres interactifs", court: "Interactif", emoji: "✨", couleur: "#2e9d4f", clair: "#e2f4e7", texte: "Jeux, sons et animations dans le livre" },
];

export function formatDe(l: Pick<Livre, "manifeste">): Format {
  if (l.manifeste.type === "pdf") return "pdf";
  if (l.manifeste.type === "web") return "interactif";
  return "epub";
}

export const infoFormat = (f: Format) => FORMATS.find((x) => x.id === f)!;

// Titre de base d'un livre, sans mention de format ou d'édition, pour reconnaître les versions d'un même livre
export function cleTitre(titre: string) {
  return titre
    .normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/\b(version|edition|relie|broche|kdp|epub|pdf|ipad|iphone|interactif|interactive|numerique|premium|final|app)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

// Regroupe les versions d'un même livre (PDF / EPUB) : même titre de base, ou même fiche Shopify principale.
// Les fiches partagées par 3 livres ou plus sont des packs : elles ne servent pas à regrouper.
const cacheGroupes = new WeakMap<object, Map<string, string>>();
export function groupes(livres: Pick<Livre, "id" | "titre" | "shopify_product_id">[]): Map<string, string> {
  const c = cacheGroupes.get(livres); if (c) return c;
  const ids = (l: Pick<Livre, "shopify_product_id">) => String(l.shopify_product_id || "").split(",").map((x) => x.trim()).filter(Boolean);
  const freq = new Map<string, number>();
  for (const l of livres) for (const x of new Set(ids(l))) freq.set(x, (freq.get(x) || 0) + 1);
  const pere = new Map<string, string>(livres.map((l) => [l.id, l.id]));
  const trouve = (x: string): string => { while (pere.get(x) !== x) x = pere.get(x)!; return x; };
  const unir = (a: string, b: string) => { const ra = trouve(a), rb = trouve(b); if (ra !== rb) pere.set(rb, ra); };
  const parTitre = new Map<string, string>();
  for (const l of livres) { const k = cleTitre(l.titre); if (parTitre.has(k)) unir(parTitre.get(k)!, l.id); else parTitre.set(k, l.id); }
  for (const a of livres) {
    const pa = ids(a)[0]; if (!pa || (freq.get(pa) || 0) >= 3) continue;
    for (const b of livres) if (a.id !== b.id && ids(b).includes(pa)) unir(a.id, b.id);
  }
  const res = new Map(livres.map((l) => [l.id, trouve(l.id)]));
  cacheGroupes.set(livres, res);
  return res;
}

/** Ne garde qu'un exemplaire de chaque livre : celui auquel le lecteur a accès, de préférence l'EPUB. */
export function sansDoublon<T extends Livre>(livres: T[], acces?: Map<string, boolean>): T[] {
  const g = groupes(livres);
  const rang = (l: T) => (acces && acces.get(l.id) ? 10 : 0) + (formatDe(l) === "epub" ? 2 : formatDe(l) === "interactif" ? 1 : 0);
  const vus = new Map<string, T>();
  for (const l of livres) {
    const k = g.get(l.id)!;
    const deja = vus.get(k);
    if (!deja || rang(l) > rang(deja)) vus.set(k, l);
  }
  return [...vus.values()];
}

/** Toutes les versions d'un livre, une par format (le livre lui-même compris). */
export function versions(livre: Livre, tous: Livre[]) {
  const g = groupes(tous); const k = g.get(livre.id);
  const res = new Map<Format, Livre>([[formatDe(livre), livre]]);
  for (const l of tous) if (g.get(l.id) === k && !res.has(formatDe(l))) res.set(formatDe(l), l);
  return res;
}

/** Les autres formats disponibles pour ce livre (un par format). */
export function autresFormats(livre: Livre, tous: Livre[]) {
  const f = formatDe(livre);
  return [...versions(livre, tous).entries()].filter(([format]) => format !== f).map(([format, l]) => ({ format, livre: l }));
}
