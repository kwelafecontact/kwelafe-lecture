// Jeux de l'espace École : uniquement pédagogiques, construits à partir du contenu des livres Kwélafé.
// Ils sont séparés des jeux de l'espace famille / individuel.
// src : application autonome (fichiers statiques de public/jeux-3d) ouverte en plein écran.
export type JeuEcole = { id: string; titre: string; emoji: string; desc: string; themes: string[]; couleur: string; src?: string };
export const JEUX_ECOLE: JeuEcole[] = [
  { id: "mots-creoles", titre: "Les mots créoles", emoji: "💬", desc: "Que veut dire cette expression ? (livre OTÉ ! Les zarlor)", themes: ["langue"], couleur: "#1f6fb2" },
  { id: "paires", titre: "Paires créole-français", emoji: "🃏", desc: "Retourne les cartes et associe chaque mot à sa traduction.", themes: ["langue"], couleur: "#3a86c8" },
  { id: "sirandanes", titre: "Sirandanes", emoji: "❓", desc: "Les devinettes créoles : Kosa i lé ?", themes: ["langue", "contes", "cuisine"], couleur: "#7a2e8f" },
  { id: "qui-mange-qui", titre: "Qui mange qui ?", emoji: "🦎", desc: "Les chaînes alimentaires des animaux de l'île.", themes: ["nature"], couleur: "#2e9d4f" },
  { id: "chaine", titre: "Remets la chaîne en ordre", emoji: "🔗", desc: "Du plus petit repas au plus grand chasseur.", themes: ["nature"], couleur: "#3f8a3a" },
  { id: "vrai-faux", titre: "Vrai ou faux nature", emoji: "✅", desc: "Vrai ou faux sur les animaux de La Réunion.", themes: ["nature"], couleur: "#109ca3" },
  { id: "plantes", titre: "Les plantes péi", emoji: "🌿", desc: "Reconnais les plantes de La Réunion.", themes: ["nature", "cuisine"], couleur: "#1f7a5c" },
  { id: "volcan", titre: "Le volcan de La Réunion", emoji: "🌋", desc: "Cycle 3 : coupe du volcan, carte, frise, maths, alertes et mots créoles.", themes: ["nature"], couleur: "#d9480f", src: "/jeux-3d/volcan-cycle3/index.html" },
  { id: "tisanerie", titre: "Les mots lontan", emoji: "🏡", desc: "Les mots de la tisanerie créole d'autrefois.", themes: ["histoire", "langue"], couleur: "#b5562e" },
];
export const jeuEcole = (id: string) => JEUX_ECOLE.find((j) => j.id === id);
