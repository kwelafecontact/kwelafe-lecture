// Les 10 jeux 3D « Jeux péi » : fichiers statiques dans public/jeux-3d/<dossier>/
export type Jeu3D = { id: string; titre: string; accroche: string; emoji: string; fond: string };

export const JEUX_3D: Jeu3D[] = [
  { id: "koup-koup", titre: "Koup Koup 2", accroche: "Coupe 32 fruits et légumes péi en vraie 3D.", emoji: "🥭", fond: "linear-gradient(135deg,#f39a12,#e8283a 55%,#6e2a5c)" },
  { id: "koup-koup-3", titre: "Koup Koup 3", accroche: "39 fruits et légumes péi tout neufs, modélisés dans Blender.", emoji: "🍍", fond: "linear-gradient(135deg,#ffcf3a,#ff6a2a 55%,#2a8a4a)" },
  { id: "koup-koup-3-v2", titre: "Koup Koup 3 v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🍍", fond: "linear-gradient(135deg,#5fc84a,#ffcf3a 50%,#ff5a2a)" },
  { id: "koup-rougail", titre: "Koup Rougail", accroche: "Tranche les bons ingrédients du rougail et du cari.", emoji: "🍲", fond: "linear-gradient(135deg,#e8452c,#f6a31b 55%,#3f7a2a)" },
  { id: "pete-petard", titre: "Pété Pétard", accroche: "Fais éclater les fusées de la nuit du 31 au Barachois.", emoji: "🎆", fond: "linear-gradient(135deg,#0b1450,#6a2a9a 55%,#ff9a1f)" },
  { id: "pete-petard-v2", titre: "Pété Pétard v2", accroche: "La nuit du 31 au Barachois : en douceur ou en grand bouquet.", emoji: "🎆", fond: "linear-gradient(135deg,#0b1450,#6a2a9a 55%,#ff9a1f)" },
  { id: "mariaz-la-vanille", titre: "Mariaz la vanille", accroche: "Marie les fleurs de vanille comme Edmond Albius en 1841.", emoji: "🌼", fond: "linear-gradient(135deg,#2e5a1e,#8ab43a 55%,#e8c84a)" },
  { id: "koup-kann", titre: "Koup Kann", accroche: "Coupe la canne au ras du sol pendant la campagne sucrière.", emoji: "🌾", fond: "linear-gradient(135deg,#6a8a2a,#c8a040 55%,#a83a1a)" },
  { id: "koup-kann-v2", titre: "Koup Kann v2", accroche: "Deux modes : récolte tranquille ou grand champ à relever, avec le cachalot qui passe.", emoji: "🌾", fond: "linear-gradient(135deg,#6a8a2a,#c8a040 55%,#a83a1a)" },
  { id: "tap-tap-moustik", titre: "Tap Tap Moustik", accroche: "Chasse les moustiques du jardin et vide les gîtes.", emoji: "🦟", fond: "linear-gradient(135deg,#5aa83a,#ffd24a 55%,#e84a8a)" },
  { id: "bichik-rush", titre: "Bichik Rush", accroche: "Ramasse les bichiques à la vouve, laisse passer les espèces protégées.", emoji: "🐟", fond: "linear-gradient(135deg,#ff9a6a,#3ab4d8 55%,#1a5a7a)" },
  { id: "bichik-rush-v2", titre: "Bichik Rush v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🐟", fond: "linear-gradient(135deg,#ff9a6a,#3ab4d8 55%,#1a5a8a)" },
  { id: "marche-des-jus", titre: "Le marché des jus", accroche: "Presse les fruits péi et sers chaque client avant qu'il parte.", emoji: "🍹", fond: "linear-gradient(135deg,#ffb21e,#e8283a 55%,#2a8a4a)" },
  { id: "marche-des-jus-v2", titre: "Le marché des jus v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🍹", fond: "linear-gradient(135deg,#5fc84a,#ffb21e 50%,#ff5a2a)" },
  { id: "bouclier-volcan", titre: "Bouclier volcan", accroche: "Tranche les bombes de lave et protège les randonneurs de l'Enclos.", emoji: "🌋", fond: "linear-gradient(135deg,#5a2a6a,#ff6a1a 55%,#2a1a14)" },
  { id: "kass-koko", titre: "Kass Koko", accroche: "Casse les noix de coco au bon moment sur la plage de l'Ouest.", emoji: "🥥", fond: "linear-gradient(135deg,#3ac8e8,#f4e2b0 55%,#2a8a3a)" },
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
