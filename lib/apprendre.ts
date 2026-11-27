// Parcours « Apprendre le créole » : mots tirés des livres Kwélafé (OTÉ ! Les zarlor, Kosa i mank ?).
import { BANQUE, PAIRES } from "./quiz/banque";

export type Mot = { kr: string; fr: string; source: string };
export type Unite = { id: number; titre: string; emoji: string; couleur: string; mots: Mot[] };

const NOMS: [string, string, string][] = [
  ["Bonjour et salutations", "👋", "#2e9d4f"], ["Les petites questions", "❓", "#1f6fb2"], ["Le temps qui passe", "⏰", "#e8a200"],
  ["Les gens autour de moi", "👨‍👩‍👧", "#d6332a"], ["Combien ?", "🔢", "#7a2e8f"], ["Les émotions", "💛", "#e0457b"],
  ["Le corps et les sensations", "🖐️", "#2e9d4f"], ["Parler et raconter", "🗣️", "#1f6fb2"], ["La culture péi", "🎶", "#e8a200"],
  ["Mots du quotidien", "🏡", "#d6332a"], ["Animaux et nature", "🦎", "#2e9d4f"], ["À la maison", "🍲", "#7a2e8f"], ["Les mots doux", "💕", "#e0457b"], ["En promenade", "🚶", "#1f6fb2"], ["À l’école", "🏫", "#e8a200"], ["Encore plus de mots", "🌺", "#d6332a"],
];

// Mots de « Mon abécédaire créole réunionnais » (graphie de l'Académie)
const ABECEDAIRE: [string, string][] = [
  ["Akoz ?", "pourquoi ?"], ["Alon", "allons, partons"], ["Ali", "lui"], ["Ansort azot", "débrouillez-vous"], ["Anparé", "attraper"],
  ["Bondié", "le bon Dieu"], ["Bourik", "âne"], ["Bordmèr", "le rivage"], ["Boug", "homme"], ["Désord", "faire du bruit"], ["Doudou", "chéri, chérie"],
  ["Ékout", "écouter"], ["Ékol", "école"], ["Foutan", "moquerie"], ["Fariné", "pluie fine"], ["Fanm", "femme"], ["Ganyé", "réussir"], ["Grin", "haricots"],
  ["Gèté", "regarder, surveiller"], ["Koman i lé ?", "comment ça va ?"], ["Kanèt", "billes"], ["Kari", "plat traditionnel (cari)"],
  ["Mon gaté", "mon chéri"], ["Mwin lé an lèr", "je suis heureux"], ["Mi èm a ou", "je t'aime"], ["Na d'moun", "il y a quelqu'un"], ["Nénèr", "amoureux, amoureuse"],
  ["Nafèr", "quelque chose"], ["Pirat", "avare"], ["Pourviké", "pourvu que"], ["Persé", "essorer"], ["Rodé", "chercher"], ["Siouplé", "s'il vous plaît"],
  ["Sakouyé", "secouer"], ["Sokolatine", "pain au chocolat"], ["Shaviré", "renverser"], ["Ti", "petit"], ["Totoshé", "frapper"], ["Také", "fermer"],
  ["Vé", "vouloir"], ["Viraz", "virage"], ["War", "regarder"], ["Zot", "vous"],
];
const norme = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z ]+/g, " ").replace(/\s+/g, " ").trim();

export function mots(): Mot[] {
  const res: Mot[] = [];
  const vus = new Set<string>();
  const sens = new Set<string>(); // un même sens n'apparaît qu'une fois : jamais deux bonnes réponses possibles
  function ajouter(kr: string, fr: string, source: string) {
    const k = norme(kr), f = norme(fr);
    if (!k || !f || vus.has(k) || sens.has(f)) return;
    vus.add(k); sens.add(f); res.push({ kr, fr, source });
  }
  for (const q of BANQUE) {
    const m = q.q.match(/^Que veut dire « (.+) » \?$/);
    if (q.theme !== "creole" || !m) continue;
    const kr = m[1].trim();
    ajouter(kr, q.r[0], q.source);
  }
  for (const [kr, fr] of ABECEDAIRE) ajouter(kr, fr, "Mon abécédaire créole réunionnais");
  for (const [kr, fr, source] of PAIRES) ajouter(kr, fr, source);
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
