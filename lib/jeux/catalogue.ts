// Catalogue des jeux du site : informations légères (aucun code de jeu chargé ici).
import type { DefJeu } from "./commun/moteur2d";

export type FicheJeu = {
  id: string;
  titre: string;
  accroche: string;
  vignette: string;          // id d'une image de fruit
  fond: string;              // dégradé de la carte
  serie: "fruits" | "reunion";
  troisD?: boolean;          // jeu 3D avec sa propre page (Koup Koup)
};

export const CATALOGUE: FicheJeu[] = [
  { id: "koup-koup", titre: "Koup Koup", accroche: "Coupe les fruits péi en 3D et évite la lave.", vignette: "mangue-coupe", fond: "linear-gradient(135deg,#f39a12,#e8283a 55%,#6e2a5c)", serie: "fruits", troisD: true },
  { id: "marche-des-jus", titre: "Le marché des jus", accroche: "Prépare les jus que les clients commandent.", vignette: "ananas-coupe", fond: "linear-gradient(135deg,#ffcf8a,#e9845a)", serie: "fruits" },
  { id: "fusion-pei", titre: "Fusion péi", accroche: "Fusionne les fruits, du goyavier au ti jacque géant.", vignette: "pasteque", fond: "linear-gradient(135deg,#8fe0ff,#2aa6c8)", serie: "fruits" },
  { id: "bazar-krush", titre: "Bazar Krush", accroche: "Aligne trois fruits identiques, enchaîne les cascades.", vignette: "letchi", fond: "linear-gradient(135deg,#bff0a8,#3f8a3a)", serie: "fruits" },
  { id: "2048-pei", titre: "2048 péi", accroche: "Fais glisser et grandir les fruits.", vignette: "papaye", fond: "linear-gradient(135deg,#ffb08a,#b04a6a)", serie: "fruits" },
  { id: "memory-pei", titre: "Memory péi", accroche: "Retrouve les paires de fruits et légumes.", vignette: "carambole", fond: "linear-gradient(135deg,#ff9ab0,#d94a6a)", serie: "fruits" },
  { id: "kel-fri-sa", titre: "Kel fri sa ?", accroche: "Devine le fruit qui se dévoile peu à peu.", vignette: "grenadine-coupe", fond: "linear-gradient(135deg,#c9a8ff,#6a4ab0)", serie: "fruits" },
  { id: "trie-le-bazar", titre: "Trie le bazar", accroche: "Range fruits, légumes et épices dans le bon panier.", vignette: "chouchou", fond: "linear-gradient(135deg,#a8e6e0,#2c8a7a)", serie: "fruits" },
  { id: "rekolt-la", titre: "Rékolt la !", accroche: "Ramasse les bons fruits, évite les guêpes.", vignette: "goyavier", fond: "linear-gradient(135deg,#d8f0a0,#6aa83a)", serie: "fruits" },
  { id: "let-melanze", titre: "Lèt mélanzé", accroche: "Remets les lettres dans l'ordre.", vignette: "bibasse", fond: "linear-gradient(135deg,#ffe08a,#e0a020)", serie: "fruits" },
  { id: "marchand-du-bazar", titre: "Marchand du bazar", accroche: "Sers les clients vite pour gagner des pièces.", vignette: "mandarine", fond: "linear-gradient(135deg,#ff9a8a,#7a3a8a)", serie: "fruits" },
];

export const fiche = (id: string) => CATALOGUE.find((f) => f.id === id);
export const IDS_JEUX = new Set(CATALOGUE.map((f) => f.id));

/** Charge le code d'un jeu 2D à la demande. */
export async function chargerJeu(id: string): Promise<DefJeu | null> {
  switch (id) {
    case "marche-des-jus": return (await import("./jeux/marche-des-jus")).default;
    case "fusion-pei": return (await import("./jeux/fusion-pei")).default;
    case "bazar-krush": return (await import("./jeux/bazar-krush")).default;
    case "2048-pei": return (await import("./jeux/deux-mille")).default;
    case "memory-pei": return (await import("./jeux/memory-pei")).default;
    case "kel-fri-sa": return (await import("./jeux/kel-fri-sa")).default;
    case "trie-le-bazar": return (await import("./jeux/trie-le-bazar")).default;
    case "rekolt-la": return (await import("./jeux/rekolt-la")).default;
    case "let-melanze": return (await import("./jeux/let-melanze")).default;
    case "marchand-du-bazar": return (await import("./jeux/marchand-du-bazar")).default;
    default: return null;
  }
}
