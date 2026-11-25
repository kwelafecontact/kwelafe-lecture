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

/** Ne garde qu'un exemplaire de chaque livre : celui auquel le lecteur a accès, sinon le plus récent. */
export function sansDoublon<T extends Livre>(livres: T[], acces?: Map<string, boolean>): T[] {
  const vus = new Map<string, T>();
  for (const l of livres) {
    const k = cleTitre(l.titre);
    const deja = vus.get(k);
    if (!deja) vus.set(k, l);
    else if (acces && !acces.get(deja.id) && acces.get(l.id)) vus.set(k, l);
  }
  return [...vus.values()];
}

/** Les autres formats disponibles pour ce livre (un par format). */
export function autresFormats(livre: Livre, tous: Livre[]) {
  const k = cleTitre(livre.titre);
  const f = formatDe(livre);
  const res = new Map<Format, Livre>();
  for (const l of tous) if (l.id !== livre.id && cleTitre(l.titre) === k && formatDe(l) !== f && !res.has(formatDe(l))) res.set(formatDe(l), l);
  return [...res.entries()].map(([format, l]) => ({ format, livre: l }));
}
