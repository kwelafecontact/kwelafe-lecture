// Accès test pour l'équipe : codes créés par l'éditeur, limités dans le temps et révocables.
import { premier } from "./cf";

export async function empreinte(code: string) {
  const propre = code.trim().toUpperCase().replace(/\s+/g, "");
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("kw-test:" + propre));
  return Array.from(new Uint8Array(h), (o) => o.toString(16).padStart(2, "0")).join("");
}

export function nouveauCodeTest() {
  const lettres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const o = new Uint8Array(12);
  crypto.getRandomValues(o);
  const s = Array.from(o, (x) => lettres[x % lettres.length]).join("");
  return `KWTEST-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

/** Le code est-il encore valable (ni révoqué, ni expiré) ? */
export async function codeTestValide(empr: string | undefined) {
  if (!empr) return false;
  const r = await premier<{ fin: string; revoque: number }>("SELECT fin, revoque FROM codes_test WHERE empreinte = ?", empr);
  return !!r && !r.revoque && new Date(r.fin) > new Date();
}
