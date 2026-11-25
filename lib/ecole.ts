// Espace École : les ressources Kwélafé rangées par niveau scolaire et par thème.
import type { Public } from "./organisation";

export const NIVEAUX: { id: string; nom: string; detail: string; emoji: string; couleur: string; publics: Public[] }[] = [
  { id: "maternelle", nom: "Maternelle", detail: "PS, MS, GS · 3 à 5 ans", emoji: "🧸", couleur: "#e8a200", publics: ["tout-petits"] },
  { id: "cycle2", nom: "CP · CE1 · CE2", detail: "Cycle 2 · 6 à 8 ans", emoji: "✏️", couleur: "#2e9d4f", publics: ["tout-petits", "enfants"] },
  { id: "cycle3", nom: "CM1 · CM2 · 6e", detail: "Cycle 3 · 9 à 11 ans", emoji: "📐", couleur: "#1f6fb2", publics: ["enfants", "ados"] },
  { id: "college", nom: "Collège · Lycée", detail: "5e à terminale · 12 ans et plus", emoji: "🎓", couleur: "#4b3a78", publics: ["ados"] },
];

export const THEMES: { id: string; nom: string; emoji: string; couleur: string; clair: string; univers: string[]; mots: RegExp; jeux: string[] }[] = [
  { id: "langue", nom: "Langue créole", emoji: "💬", couleur: "#1f6fb2", clair: "#e3effa", univers: ["creole"], mots: /creole|kreol|mots|abecedaire|imagier|expression|proverbe|sirandane|kosa/, jeux: ["zarlor", "let-melanze", "expressions-a-recoller", "kosa-in-shoz"] },
  { id: "nature", nom: "Nature et animaux", emoji: "🌿", couleur: "#2e9d4f", clair: "#e2f4e7", univers: ["biodiversite"], mots: /plante|fleur|animaux|oiseau|poisson|qui mange|volcan|tisane|herbage/, jeux: ["gardiens-de-l-ile", "coulee-de-lave", "memory-pei", "trie-le-bazar"] },
  { id: "histoire", nom: "Histoire et patrimoine", emoji: "🏡", couleur: "#b5562e", clair: "#f8e7dd", univers: ["patrimoine"], mots: /histoire|lontan|kaz|case|metier|objet|esclavage|train|patrimoine/, jeux: ["memory-lontan", "oussa-i-le", "case-bleue"] },
  { id: "contes", nom: "Contes et lecture", emoji: "📖", couleur: "#e8a200", clair: "#fdf2d6", univers: ["jeunesse"], mots: /conte|noel|histoire de|cherche et trouve/, jeux: ["kosa-in-shoz", "oussa-i-le"] },
  { id: "cuisine", nom: "Cuisine et alimentation", emoji: "🍲", couleur: "#d6332a", clair: "#fde6e3", univers: ["cuisine"], mots: /cuisine|recette|saveur|snack|fruit|legume/, jeux: ["cari-parfait", "marche-des-jus", "trie-le-bazar", "rekolt-la"] },
];

export const sansAccentEcole = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
