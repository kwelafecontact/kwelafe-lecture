// Données des fruits péi, sans dépendance à Three.js (utilisables par tous les jeux).

export type Jus = {
  couleur: string;      // couleur du jus
  quantite: number;     // 0 (sec) à 1 (très juteux)
  viscosite: number;    // 0 (liquide) à 1 (épais, coule lentement)
  graines?: string;     // couleur des pépins projetés
  morceaux?: string;    // couleur des petits morceaux projetés
  ecran?: boolean;      // éclabousse l'écran du joueur
};

/** Profil sonore de la découpe, chaque valeur de 0 à 1. */
export type Son = {
  croquant?: number;  // chair ferme qui craque (pastèque, ananas, chouchou)
  coque?: number;     // coque dure qui claque (coco, fruit de la passion)
  mou?: number;       // chair tendre, son sourd et mouillé (banane, mangue)
  sec?: number;       // claquement sec et fin (vanille, piment)
  aigu?: number;      // hauteur du son : 0 grave (gros fruit), 1 aigu (petit fruit)
};

export type DefFruit = {
  id: string;
  nom: string;          // nom français
  kreol: string;        // nom créole (à faire relire)
  rayon: number;        // rayon de collision (unités du monde)
  points: number;
  poids: number;        // fréquence d'apparition
  jus: Jus;
  son: Son;
  special?: "or" | "lave";
};

export const FRUITS: DefFruit[] = [
  { id: "letchi", nom: "Letchi", kreol: "Letchi", rayon: 0.8, points: 1, poids: 10, jus: { couleur: "#f3e6dc", quantite: 0.7, viscosite: 0.35, morceaux: "#fff8ee", ecran: true }, son: { croquant: 0.3, mou: 0.2, aigu: 0.6 } },
  { id: "mangue", nom: "Mangue", kreol: "Mang", rayon: 1.15, points: 1, poids: 9, jus: { couleur: "#f39a12", quantite: 0.75, viscosite: 0.85, morceaux: "#ffb52e" }, son: { mou: 0.65, croquant: 0.05, aigu: 0.35 } },
  { id: "ananas", nom: "Ananas", kreol: "Zananas", rayon: 1.15, points: 1, poids: 7, jus: { couleur: "#f6d23a", quantite: 0.95, viscosite: 0.15, morceaux: "#ffe680", ecran: true }, son: { croquant: 0.75, aigu: 0.35 } },
  { id: "banane", nom: "Banane", kreol: "Fig", rayon: 1.15, points: 1, poids: 8, jus: { couleur: "#f4ecc8", quantite: 0.12, viscosite: 0.9, morceaux: "#f7efcf" }, son: { mou: 0.95, aigu: 0.4 } },
  { id: "papaye", nom: "Papaye", kreol: "Papay", rayon: 1.1, points: 1, poids: 7, jus: { couleur: "#f37b2a", quantite: 0.6, viscosite: 0.6, graines: "#1d1612" }, son: { mou: 0.6, croquant: 0.15, aigu: 0.35 } },
  { id: "grenadine", nom: "Fruit de la passion", kreol: "Grenadine", rayon: 0.75, points: 1, poids: 7, jus: { couleur: "#f2a91c", quantite: 0.8, viscosite: 0.55, graines: "#1a1410", ecran: true }, son: { coque: 0.35, croquant: 0.2, aigu: 0.6 } },
  { id: "pasteque", nom: "Pastèque", kreol: "Pastèk", rayon: 1.35, points: 1, poids: 6, jus: { couleur: "#e8283a", quantite: 1, viscosite: 0.1, graines: "#160f0c", ecran: true }, son: { croquant: 0.95, aigu: 0.15 } },
  { id: "citron", nom: "Citron vert", kreol: "Sitron", rayon: 0.6, points: 2, poids: 6, jus: { couleur: "#d6ec7a", quantite: 0.85, viscosite: 0.05, ecran: true }, son: { croquant: 0.35, aigu: 0.8 } },
  { id: "mandarine", nom: "Mandarine", kreol: "Mandarine", rayon: 0.72, points: 1, poids: 7, jus: { couleur: "#ff8a18", quantite: 0.9, viscosite: 0.1, ecran: true }, son: { croquant: 0.2, mou: 0.15, aigu: 0.65 } },
  { id: "coco", nom: "Noix de coco", kreol: "Koko", rayon: 1.0, points: 1, poids: 5, jus: { couleur: "#eef3f6", quantite: 0.7, viscosite: 0.05, morceaux: "#ffffff" }, son: { coque: 1, aigu: 0.3 } },
  { id: "bringelle", nom: "Aubergine", kreol: "Bringèl", rayon: 1.05, points: 1, poids: 5, jus: { couleur: "#efe5c4", quantite: 0.1, viscosite: 0.9, morceaux: "#efe7cc" }, son: { mou: 0.5, croquant: 0.25, aigu: 0.4 } },
  { id: "goyavier", nom: "Goyavier", kreol: "Goyavié", rayon: 0.5, points: 2, poids: 6, jus: { couleur: "#e2475f", quantite: 0.7, viscosite: 0.4, graines: "#f3d9a8" }, son: { croquant: 0.3, mou: 0.2, aigu: 0.9 } },
  { id: "piment", nom: "Piment", kreol: "Piman", rayon: 0.55, points: 3, poids: 4, jus: { couleur: "#d4141c", quantite: 0.35, viscosite: 0.3, graines: "#f6e3a3" }, son: { sec: 0.7, croquant: 0.4, aigu: 0.95 } },
  { id: "tijacque", nom: "Ti jacque", kreol: "Ti jacque", rayon: 1.35, points: 1, poids: 4, jus: { couleur: "#f6f2e4", quantite: 0.45, viscosite: 0.97, morceaux: "#efe3b8" }, son: { croquant: 0.55, mou: 0.25, aigu: 0.15 } },
  { id: "friyapin", nom: "Fruit à pain", kreol: "Friyapin", rayon: 1.15, points: 1, poids: 4, jus: { couleur: "#f7f4ea", quantite: 0.3, viscosite: 0.95, morceaux: "#f3e7b8" }, son: { croquant: 0.45, mou: 0.35, aigu: 0.25 } },
  { id: "goyave", nom: "Goyave", kreol: "Goyave", rayon: 0.7, points: 1, poids: 6, jus: { couleur: "#f27f8a", quantite: 0.6, viscosite: 0.5, graines: "#f1e2b8" }, son: { croquant: 0.45, mou: 0.2, aigu: 0.6 } },
  { id: "vanille", nom: "Gousse de vanille", kreol: "Vanille", rayon: 0.6, points: 3, poids: 3, jus: { couleur: "#2a170c", quantite: 0.05, viscosite: 0.95, graines: "#0d0805" }, son: { sec: 1, aigu: 0.85 } },
  { id: "carambole", nom: "Carambole", kreol: "Carambole", rayon: 0.85, points: 1, poids: 5, jus: { couleur: "#f2d64a", quantite: 0.85, viscosite: 0.1, ecran: true }, son: { croquant: 0.85, aigu: 0.55 } },
  { id: "chouchou", nom: "Chouchou", kreol: "Chouchou", rayon: 0.85, points: 1, poids: 5, jus: { couleur: "#e9f1d0", quantite: 0.5, viscosite: 0.2, morceaux: "#eef3dc" }, son: { croquant: 0.8, aigu: 0.5 } },
  { id: "bibasse", nom: "Bibasse", kreol: "Bibasse", rayon: 0.5, points: 2, poids: 5, jus: { couleur: "#ffad3a", quantite: 0.7, viscosite: 0.35, ecran: true }, son: { mou: 0.35, croquant: 0.15, aigu: 0.85 } },
  { id: "avocat", nom: "Avocat", kreol: "Avocat", rayon: 1.0, points: 1, poids: 4, jus: { couleur: "#c9d86a", quantite: 0.15, viscosite: 0.95, morceaux: "#d8e48a" }, son: { mou: 0.85, aigu: 0.3 } },
  { id: "pitaya", nom: "Fruit du dragon", kreol: "Fruit du dragon", rayon: 1.0, points: 1, poids: 4, jus: { couleur: "#e8327a", quantite: 0.7, viscosite: 0.4, graines: "#141010", ecran: true }, son: { mou: 0.4, croquant: 0.2, aigu: 0.45 } },
  { id: "canne", nom: "Canne à sucre", kreol: "Canne à sucre", rayon: 1.1, points: 2, poids: 3, jus: { couleur: "#efe8b0", quantite: 0.6, viscosite: 0.15, morceaux: "#f3eed0" }, son: { croquant: 0.9, sec: 0.4, aigu: 0.3 } },
  { id: "tamarin", nom: "Tamarin", kreol: "Tamarin", rayon: 0.9, points: 2, poids: 3, jus: { couleur: "#7a4a22", quantite: 0.1, viscosite: 0.97, graines: "#3a1e0c" }, son: { sec: 0.6, croquant: 0.3, aigu: 0.55 } },
  { id: "longani", nom: "Longani", kreol: "Longani", rayon: 0.5, points: 2, poids: 4, jus: { couleur: "#f4ece0", quantite: 0.6, viscosite: 0.3, graines: "#120c08" }, son: { croquant: 0.25, mou: 0.2, aigu: 0.85 } },
  { id: "jamalac", nom: "Jamalac", kreol: "Jamalac", rayon: 0.75, points: 1, poids: 4, jus: { couleur: "#fde0e0", quantite: 0.85, viscosite: 0.1, ecran: true }, son: { croquant: 0.7, aigu: 0.6 } },
  { id: "sapotille", nom: "Sapotille", kreol: "Sapotille", rayon: 0.65, points: 1, poids: 4, jus: { couleur: "#b88a5a", quantite: 0.35, viscosite: 0.8, graines: "#1a100a" }, son: { mou: 0.6, aigu: 0.5 } },
  { id: "atte", nom: "Atte", kreol: "Atte", rayon: 0.85, points: 1, poids: 4, jus: { couleur: "#f6f1e6", quantite: 0.45, viscosite: 0.85, graines: "#1a120c" }, son: { mou: 0.6, croquant: 0.15, aigu: 0.45 } },
  { id: "combava", nom: "Combava", kreol: "Combava", rayon: 0.65, points: 2, poids: 4, jus: { couleur: "#cfe27a", quantite: 0.7, viscosite: 0.05, ecran: true }, son: { croquant: 0.35, aigu: 0.75 } },
  { id: "cacao", nom: "Cabosse de cacao", kreol: "Cacao", rayon: 1.15, points: 1, poids: 3, jus: { couleur: "#f3eadc", quantite: 0.35, viscosite: 0.8, graines: "#6a2e3a" }, son: { coque: 0.4, croquant: 0.4, aigu: 0.3 } },
  { id: "canistel", nom: "Canistel", kreol: "Canistel", rayon: 0.85, points: 1, poids: 4, jus: { couleur: "#f6a418", quantite: 0.3, viscosite: 0.95, morceaux: "#ffb52e" }, son: { mou: 0.85, aigu: 0.4 } },
  { id: "figue-barbarie", nom: "Figue de Barbarie", kreol: "Figue de Barbarie", rayon: 0.8, points: 1, poids: 4, jus: { couleur: "#f06a2a", quantite: 0.75, viscosite: 0.4, graines: "#2a1a10", ecran: true }, son: { mou: 0.4, croquant: 0.2, aigu: 0.55 } },
  { id: "letchi-or", nom: "Letchi doré", kreol: "Letchi doré", rayon: 0.85, points: 10, poids: 0, special: "or", jus: { couleur: "#ffd34d", quantite: 0.9, viscosite: 0.3, morceaux: "#fff1a8" }, son: { croquant: 0.3, mou: 0.2, aigu: 0.6 } },
  { id: "lave", nom: "Roche de lave", kreol: "Roche de lave", rayon: 0.9, points: 0, poids: 0, special: "lave", jus: { couleur: "#ff6a00", quantite: 0, viscosite: 0 }, son: {} },
];

export const fruitParId = (id: string) => FRUITS.find((f) => f.id === id)!;
