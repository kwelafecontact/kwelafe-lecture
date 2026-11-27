// Parcours « Apprendre le créole » : mots tirés des livres Kwélafé (OTÉ ! Les zarlor, Kosa i mank ?).
import { BANQUE, PAIRES } from "./quiz/banque";

export type Mot = { kr: string; fr: string; source: string };
export type Unite = { id: number; titre: string; emoji: string; couleur: string; mots: Mot[] };

const NOMS: [string, string, string][] = [
  ["Bonjour et salutations", "👋", "#2e9d4f"], ["Les petites questions", "❓", "#1f6fb2"], ["Le temps qui passe", "⏰", "#e8a200"],
  ["Les gens autour de moi", "👨‍👩‍👧", "#d6332a"], ["Combien ?", "🔢", "#7a2e8f"], ["Les émotions", "💛", "#e0457b"],
  ["Le corps et les sensations", "🖐️", "#2e9d4f"], ["Parler et raconter", "🗣️", "#1f6fb2"], ["La culture péi", "🎶", "#e8a200"],
  ["Mots du quotidien", "🏡", "#d6332a"], ["Animaux et nature", "🦎", "#2e9d4f"], ["À la maison", "🍲", "#7a2e8f"],
];

export function mots(): Mot[] {
  const res: Mot[] = [];
  const vus = new Set<string>();
  for (const q of BANQUE) {
    const m = q.q.match(/^Que veut dire « (.+) » \?$/);
    if (q.theme !== "creole" || !m) continue;
    const kr = m[1].trim();
    if (!vus.has(kr)) { vus.add(kr); res.push({ kr, fr: q.r[0], source: q.source }); }
  }
  for (const [kr, fr, source] of PAIRES) if (!vus.has(kr)) { vus.add(kr); res.push({ kr, fr, source }); }
  return res;
}

export function unites(): Unite[] {
  const tous = mots();
  const res: Unite[] = [];
  for (let i = 0; i < tous.length && res.length < NOMS.length; i += 8) {
    const [titre, emoji, couleur] = NOMS[res.length];
    res.push({ id: res.length + 1, titre, emoji, couleur, mots: tous.slice(i, i + 8) });
  }
  return res;
}
