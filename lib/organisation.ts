// Rangement des livres pour les lecteurs : pour qui (âge) et collections (tomes d'une même série).
import type { Livre } from "./donnees";

export type Public = "tout-petits" | "enfants" | "ados" | "adultes";

export const PUBLICS: { id: Public; nom: string; age: string; emoji: string; couleur: string; clair: string }[] = [
  { id: "tout-petits", nom: "Tout-petits", age: "0 à 5 ans", emoji: "🍼", couleur: "#e8a200", clair: "#fdf2d6" },
  { id: "enfants", nom: "Enfants", age: "6 à 11 ans", emoji: "🧒", couleur: "#2e9d4f", clair: "#e2f4e7" },
  { id: "ados", nom: "Ados", age: "12 à 17 ans", emoji: "🎒", couleur: "#1f6fb2", clair: "#e3effa" },
  { id: "adultes", nom: "Adultes", age: "18 ans et plus", emoji: "📚", couleur: "#4b3a78", clair: "#ece8f6" },
];

const sansAccent = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Pour qui est ce livre : déduit de son univers et de son titre. */
export function publicsDe(l: Pick<Livre, "titre" | "univers">): Public[] {
  const t = sansAccent(l.titre);
  if (/premiers mots|abecedaire|imagier|tout-petit|comptine/.test(t)) return ["tout-petits", "enfants"];
  if (/kosa in shoz|sirandane|devinette|cherche et trouve|qui mange qui/.test(t)) return ["enfants", "ados", "adultes"];
  if (l.univers === "jeunesse") return ["enfants"];
  if (l.univers === "horreur") return ["adultes"];
  return ["ados", "adultes"];
}

const TOME = /[,\s:–—-]*\b(tome|volume|vol\.?)\s*([0-9]+|[ivx]+)\b.*$/i;

/** Nom de la collection d'un livre en plusieurs tomes (ou null), et son numéro de tome. */
export function collectionDe(titre: string): { nom: string; tome: number } | null {
  const m = titre.match(TOME);
  if (!m) return null;
  const nom = titre.slice(0, m.index).replace(/[\s,:–—-]+$/, "").trim();
  const brut = m[2].toLowerCase();
  const romains: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6 };
  const tome = /^\d+$/.test(brut) ? Number(brut) : romains[brut] || 0;
  return nom.length > 3 ? { nom, tome } : null;
}

export const cleCollection = (nom: string) => sansAccent(nom).replace(/[^a-z0-9]+/g, " ").trim();
