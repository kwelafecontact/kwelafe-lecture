// Visuels photo des fruits (planches de KWélafé, nov. 2026), utilisés par les jeux 2D marqués visuels: "photos".
import { FRUITS } from "../koupkoup/donnees";

export type Photo = { id: string; couleur: string; nom?: string; produit?: boolean };

const BRUT: Photo[] = [
  {"id": "pomme", "couleur": "#ab3c21", "nom": "Pomme"},
  {"id": "figue", "couleur": "#75475d", "nom": "Figue"},
  {"id": "grenadine", "couleur": "#7d3a3e", "produit": true},
  {"id": "photo-1-4", "couleur": "#d9a814"},
  {"id": "physalis", "couleur": "#d39137", "nom": "Physalis"},
  {"id": "pamplemousse", "couleur": "#d67d33", "nom": "Pamplemousse"},
  {"id": "photo-1-7", "couleur": "#79372d"},
  {"id": "cedrat", "couleur": "#cea40d", "nom": "Cédrat"},
  {"id": "canistel", "couleur": "#c48912", "produit": true},
  {"id": "figue-barbarie", "couleur": "#a95349", "produit": true},
  {"id": "salak", "couleur": "#7b3e29", "nom": "Salak"},
  {"id": "kiwano", "couleur": "#e07b0c", "nom": "Kiwano"},
  {"id": "cerise-cayenne", "couleur": "#902e21", "nom": "Cerise à côtes"},
  {"id": "photo-2-6", "couleur": "#c99714", "nom": "Abiu"},
  {"id": "photo-2-7", "couleur": "#5b3a59", "nom": "Safou"},
  {"id": "avocat", "couleur": "#858020", "produit": true},
  {"id": "photo-3-1", "couleur": "#ca6d5f"},
  {"id": "goyavier", "couleur": "#b23d1f", "produit": true},
  {"id": "photo-3-3", "couleur": "#833d5a"},
  {"id": "cacahuete", "couleur": "#ca9451", "nom": "Cacahuète"},
  {"id": "cajou", "couleur": "#bf6f26", "nom": "Pomme cajou"},
  {"id": "chataigne", "couleur": "#9b6c2b", "nom": "Châtaigne"},
  {"id": "vanille", "couleur": "#604640", "produit": true},
  {"id": "oseille", "couleur": "#94292a", "nom": "Oseille de Guinée"},
  {"id": "sapotille", "couleur": "#8c5a2f", "produit": true},
  {"id": "prune-rouge", "couleur": "#9b2725", "nom": "Prune rouge"},
  {"id": "prune-violette", "couleur": "#7d4058", "nom": "Prune violette"},
  {"id": "peche", "couleur": "#cb653d", "nom": "Pêche"},
  {"id": "prune-jaune", "couleur": "#c6941e", "nom": "Prune jaune"},
  {"id": "kaki", "couleur": "#d85d16", "nom": "Kaki"},
  {"id": "mure", "couleur": "#413c26", "nom": "Mûre"},
  {"id": "mure-blanche", "couleur": "#b5a35a", "nom": "Mûre blanche"},
  {"id": "combava", "couleur": "#57701a", "produit": true},
  {"id": "orange", "couleur": "#c76813", "nom": "Orange"},
  {"id": "melon", "couleur": "#c8af75", "nom": "Melon"},
  {"id": "pasteque", "couleur": "#556d23", "produit": true},
  {"id": "mandarine", "couleur": "#c85e19", "produit": true},
  {"id": "goyave", "couleur": "#c09e17", "produit": true},
  {"id": "photo-5-7", "couleur": "#af2021"},
  {"id": "jamalac-jaune", "couleur": "#c79e1e", "nom": "Jamalac jaune"},
  {"id": "jamalac", "couleur": "#a22922", "produit": true},
  {"id": "jamalac-blanc", "couleur": "#bbac78", "nom": "Jamalac blanc"},
  {"id": "photo-6-3", "couleur": "#614e27"},
  {"id": "durian", "couleur": "#8a7024", "nom": "Durian"},
  {"id": "atte", "couleur": "#998943", "produit": true},
  {"id": "corossol", "couleur": "#757a24", "nom": "Corossol"},
  {"id": "photo-6-7", "couleur": "#a24a40"},
  {"id": "photo-6-8", "couleur": "#c4980f"},
  {"id": "carambole", "couleur": "#bf9a0b", "produit": true},
  {"id": "photo-7-2", "couleur": "#7e751a", "nom": "Vavangue"},
  {"id": "photo-7-3", "couleur": "#c07914", "nom": "Abricotier-péi"},
  {"id": "photo-7-4", "couleur": "#883745", "nom": "Caïmite"},
  {"id": "photo-7-5", "couleur": "#cf6b21"},
  {"id": "photo-7-6", "couleur": "#92582c"},
  {"id": "photo-7-7", "couleur": "#4e374b"},
  {"id": "letchi", "couleur": "#b74136", "produit": true},
  {"id": "longani", "couleur": "#a67a20", "produit": true},
  {"id": "ramboutan", "couleur": "#b9361e", "nom": "Ramboutan"},
  {"id": "papaye", "couleur": "#c27d08", "produit": true},
  {"id": "coco", "couleur": "#93582c", "produit": true},
  {"id": "mangue", "couleur": "#b1551f", "produit": true},
  {"id": "photo-8-6", "couleur": "#b15e23"},
  {"id": "cacao", "couleur": "#b55020", "nom": "Cabosse de cacao"},
  {"id": "chouchou", "couleur": "#a0a238", "produit": true},
  {"id": "abiu", "couleur": "#a98e17", "nom": "Abiu"},
  {"id": "abricotier-pei", "couleur": "#b47626", "nom": "Abricotier-péi"},
  {"id": "caimite", "couleur": "#86544e", "nom": "Caïmite"},
  {"id": "groseille-ceylan", "couleur": "#7c4e18", "nom": "Groseille de Ceylan"},
  {"id": "guajilote", "couleur": "#9a9d25", "nom": "Guajilote"},
  {"id": "liane-poc-poc", "couleur": "#879c1c", "nom": "Liane poc-poc"},
  {"id": "prune-pei", "couleur": "#954c40", "nom": "Prune péi"},
  {"id": "safou", "couleur": "#663f55", "nom": "Safou"},
  {"id": "vavangue", "couleur": "#868c15", "nom": "Vavangue"}
];

/** Toutes les photos ; le nom vient de la fiche du fruit quand il existe déjà dans le catalogue. */
export const PHOTOS: (Photo & { image: string })[] = BRUT.map((p) => ({
  ...p,
  nom: p.nom ?? (p.produit ? FRUITS.find((f) => f.id === p.id)?.nom : undefined),
  image: `/jeux/photos/${p.id}.webp`,
}));

export const photo = (id: string) => PHOTOS.find((p) => p.id === id);
/** Photos dont le nom est sûr (pour les jeux qui affichent le nom). */
export const photosNommees = () => PHOTOS.filter((p) => !!p.nom);
/** Couleur de jus ou d'éclat pour un identifiant (photo, sinon fruit du catalogue). */
export function couleurDe(id: string): string {
  return photo(id)?.couleur ?? FRUITS.find((f) => f.id === id)?.jus.couleur ?? "#ffe066";
}

/** Fruits ajoutés pour les jeux du marché (planches étiquetées de KWélafé). */
export const FRUITS_MARCHE = ["abiu", "abricotier-pei", "caimite", "groseille-ceylan", "guajilote", "liane-poc-poc", "prune-pei", "safou", "vavangue",
  "canistel", "figue-barbarie", "salak", "kiwano", "cerise-cayenne", "jamalac", "durian", "letchi"];
const PAS_EN_JUS = ["vanille", "cacahuete", "chataigne", "coco", "cacao", "chouchou", "avocat", "oseille"];
/** Photos utilisables au marché : nom connu (les photos sans nom sûr restent à part). */
export const photosMarche = () => PHOTOS.filter((p) => !!p.nom && p.id !== "vanille").map((p) => p.id);
/** Fruits qu'on peut mettre dans un jus. */
export const photosJus = () => PHOTOS.filter((p) => !!p.nom && !PAS_EN_JUS.includes(p.id)).map((p) => p.id);
