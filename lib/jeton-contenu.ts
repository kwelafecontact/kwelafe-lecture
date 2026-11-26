// Jeton court qui autorise la lecture d'un livre précis (30 minutes).
import { signer, verifier } from "./session";

// Les livres-applications web chargent leurs pages au fil de la lecture : jeton de 8 heures.
export async function creerJetonContenu(clientId: string, livreId: string, email: string, duree = 30 * 60, extrait = 0) {
  return signer(extrait ? { c: clientId, l: livreId, e: email, x: extrait } : { c: clientId, l: livreId, e: email }, duree);
}

/** Nombre de pages (ou de chapitres) offertes en extrait, 0 si pas d'extrait possible. */
export function tailleExtrait(m: { type: string; pages?: unknown; fixe?: boolean }) {
  if (m.type === "web") return 0;
  const total = m.type === "pdf" ? Number(m.pages) || 0 : Array.isArray(m.pages) ? m.pages.length : 0;
  if (m.type === "epub" && !m.fixe) return total >= 3 ? 1 : 0; // livre à texte : le premier chapitre
  return total >= 6 ? Math.min(8, Math.max(3, Math.ceil(total * 0.1))) : 0;
}

export async function lireJetonContenu(jeton: string) {
  return verifier<{ c: string; l: string; e: string; x?: number }>(jeton);
}
