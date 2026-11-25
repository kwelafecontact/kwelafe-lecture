// Les 10 jeux 3D « Jeux péi » : fichiers statiques dans public/jeux-3d/<dossier>/
export type Jeu3D = { id: string; titre: string; accroche: string; emoji: string; fond: string };

export const JEUX_3D: Jeu3D[] = [
  { id: "koup-koup", titre: "Koup Koup 2", accroche: "Coupe 32 fruits et légumes péi en vraie 3D.", emoji: "🥭", fond: "linear-gradient(135deg,#f39a12,#e8283a 55%,#6e2a5c)" },
  { id: "koup-rougail", titre: "Koup Rougail", accroche: "Tranche les bons ingrédients du rougail et du cari.", emoji: "🍲", fond: "linear-gradient(135deg,#e8452c,#f6a31b 55%,#3f7a2a)" },
  { id: "pete-petard", titre: "Pété Pétard", accroche: "Fais éclater les fusées de la nuit du 31 au Barachois.", emoji: "🎆", fond: "linear-gradient(135deg,#0b1450,#6a2a9a 55%,#ff9a1f)" },
  { id: "mariaz-la-vanille", titre: "Mariaz la vanille", accroche: "Marie les fleurs de vanille comme Edmond Albius en 1841.", emoji: "🌼", fond: "linear-gradient(135deg,#2e5a1e,#8ab43a 55%,#e8c84a)" },
  { id: "route-littoral", titre: "Route du Littoral", accroche: "Libère les voitures coincées entre la falaise et l'océan.", emoji: "🚗", fond: "linear-gradient(135deg,#6a655d,#1f8fc4)" },
  { id: "kar-pei", titre: "Kar Péi", accroche: "Fais monter chaque voyageur dans le bon car jaune.", emoji: "🚌", fond: "linear-gradient(135deg,#ffd84a,#e0a000)" },
  { id: "blocs-de-kaz", titre: "Blocs de kaz", accroche: "Complète les lignes et construis des kaz créoles.", emoji: "🏠", fond: "linear-gradient(135deg,#f4c95d,#5fae46)" },
  { id: "pixel-pei", titre: "Pixel Péi", accroche: "Peins les images de l'île sur le tapis roulant.", emoji: "🎨", fond: "linear-gradient(135deg,#6ec6f0,#ff4b1f)" },
  { id: "kaz-gramoun", titre: "La kaz gramoun", accroche: "Fusionne les objets lontan et restaure la kaz.", emoji: "🏮", fond: "linear-gradient(135deg,#e8c89a,#8a4b1f)" },
  { id: "zoizodoku", titre: "Zoizodoku", accroche: "Le sudoku des oiseaux endémiques.", emoji: "🐦", fond: "linear-gradient(135deg,#b6d98a,#2e5a2a)" },
  { id: "mot-pei", titre: "Le mot péi du jour", accroche: "Un mot créole à trouver chaque jour.", emoji: "🔠", fond: "linear-gradient(135deg,#ffb36a,#c0392b)" },
  { id: "kosa-in-shoz", titre: "Kosa in shoz ? 3D", accroche: "Devinettes rapides : touche le bon objet péi.", emoji: "🍍", fond: "linear-gradient(135deg,#e6cf9e,#b8862e)" },
  { id: "tang-i-kour", titre: "Tang i kour", accroche: "Le tangue court entre les champs de cannes.", emoji: "🦔", fond: "linear-gradient(135deg,#9fd8f5,#3f8a35)" },
  { id: "apres-cyclone", titre: "Après le cyclone", accroche: "Ramasse, recloue, nettoie : le soleil revient.", emoji: "🌈", fond: "linear-gradient(135deg,#8d99a3,#ffc928)" },
];

export const jeu3d = (id: string) => JEUX_3D.find((j) => j.id === id);
