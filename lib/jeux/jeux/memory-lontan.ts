// Memory lontan : retrouver les paires d'objets d'autrefois (photos du livre « Les objets lontan », Kwélafé Production).
import { type DefJeu, THEMES } from "../commun/moteur2d";
import { Memory } from "./memory-pei";
import D from "../serie2/donnees";

const IDS = D.objets.map((o) => o.id);
const nom = (id: string) => D.objets.find((o) => o.id === id)?.nom;

const def: DefJeu = {
  id: "memory-lontan",
  titre: "Memory lontan",
  accroche: "Retrouve les paires d'objets d'autrefois : kalou, ferblan, lampe à pétrole…",
  regles: ["Retourne deux cartes à la fois.", "Si ce sont les mêmes objets lontan, la paire reste visible.", "Moins tu fais de coups, plus tu gagnes d'étoiles.", "À partir du niveau 8, le temps est compté."],
  niveaux: 20,
  theme: THEMES.marche,
  images: Object.fromEntries(IDS.map((id) => [id, `/jeux/lontan/${id}.webp`])),
  creer: (c, n) => new Memory(c, n, IDS, nom, 12),
};
export default def;
