// Les 10 jeux 3D « Jeux péi » : fichiers statiques dans public/jeux-3d/<dossier>/
// image : capture d'écran du jeu affichée sur la carte à la place de l'emoji.
export type Jeu3D = { id: string; titre: string; accroche: string; emoji: string; fond: string; image?: string };

export const JEUX_3D: Jeu3D[] = [
  { id: "koup-koup-3-v2", titre: "Koup Koup 3 v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🍍", fond: "linear-gradient(135deg,#5fc84a,#ffcf3a 50%,#ff5a2a)" },
  { id: "koup-rougail-v2", titre: "Koup Rougail v2", accroche: "Cuisine les recettes péi : tranche les bons ingrédients avant que le plat brûle.", emoji: "🍲", fond: "linear-gradient(135deg,#e8452c,#f6a31b 55%,#8a3a10)" },
  { id: "cascade-pei-v2", titre: "Cascade Péi v2", accroche: "Fais cascader les fruits péi : deux modes, gonis, pétards, boss et carnet.", emoji: "🍍", fond: "linear-gradient(135deg,#bff0a8,#3f8a3a 60%,#ffb21e)" },
  { id: "pete-petard-v3", titre: "Nouvel an", image: "/jeux-3d/pete-petard-v3/vignette.webp", accroche: "Le Barachois de nuit : les feux se mirent dans la mer. Attention à la dynamite !", emoji: "🎆", fond: "linear-gradient(135deg,#02030a,#0b1450 55%,#ff9a1f)" },
  { id: "mariaz-la-vanille-v2", titre: "Mariaz la vanille v2", accroche: "Vraies lianes de vanille, fleurs et gousses en 3D : marie les fleurs comme Edmond Albius.", emoji: "🌼", fond: "linear-gradient(135deg,#2e5a1e,#8ab43a 55%,#e8c84a)" },
  { id: "koup-kann", titre: "Koup Kann", accroche: "Coupe la canne au ras du sol pendant la campagne sucrière.", emoji: "🌾", fond: "linear-gradient(135deg,#6a8a2a,#c8a040 55%,#a83a1a)" },
  { id: "koup-kann-v2", titre: "Koup Kann v2", accroche: "Deux modes : récolte tranquille ou grand champ à relever, avec le cachalot qui passe.", emoji: "🌾", fond: "linear-gradient(135deg,#6a8a2a,#c8a040 55%,#a83a1a)" },
  { id: "tap-tap-moustik-v2", titre: "Tap Tap Moustik v2", accroche: "Chasse les moustiques tigres, vide les gîtes et protège les abeilles.", emoji: "🦟", fond: "linear-gradient(135deg,#5aa83a,#ffd24a 55%,#e84a8a)" },
  { id: "bichik-rush-v2", titre: "Bichik Rush v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🐟", fond: "linear-gradient(135deg,#ff9a6a,#3ab4d8 55%,#1a5a8a)" },
  { id: "marche-des-jus-v2", titre: "Le marché des jus v2", accroche: "Deux ambiances : Mi vé zoué trankil ou Mi rode problèm.", emoji: "🍹", fond: "linear-gradient(135deg,#5fc84a,#ffb21e 50%,#ff5a2a)" },
  { id: "bouclier-volcan-v2", titre: "Bouclier volcan v2", accroche: "Deux modes : balade tranquille ou éruption majeure avec bombe-mère toutes les 5 vagues.", emoji: "🌋", fond: "linear-gradient(135deg,#5a2a6a,#ff6a1a 55%,#2a1a14)" },
  { id: "kass-koko-v2", titre: "Kass Koko v2", accroche: "Deux modes : plage tranquille ou coco géant à briser toutes les 5 vagues.", emoji: "🥥", fond: "linear-gradient(135deg,#3ac8e8,#f4e2b0 55%,#2a8a3a)" },
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
