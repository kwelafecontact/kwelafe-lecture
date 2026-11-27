// Catalogue des jeux du site : informations légères (aucun code de jeu chargé ici).
import type { DefJeu } from "./commun/moteur2d";

export type FicheJeu = {
  id: string;
  titre: string;
  accroche: string;
  vignette: string;          // id d'une image de fruit
  image?: string;            // chemin d'une autre image de vignette
  emoji?: string;            // ou un pictogramme
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
  { id: "kosa-in-shoz", titre: "Kosa in shoz ?", accroche: "Les sirandanes de La Réunion, contre la montre.", vignette: "", emoji: "❓", fond: "linear-gradient(135deg,#c9a8ff,#7a2e8f)", serie: "reunion" },
  { id: "zarlor", titre: "Zarlor, le mot caché", accroche: "Devine le mot créole en 6 essais.", vignette: "", emoji: "🔤", fond: "linear-gradient(135deg,#8fe0ff,#1e6e86)", serie: "reunion" },
  { id: "oussa-i-le", titre: "Oussa i lé ?", accroche: "Retrouve les lieux de l'île, en chaud ou froid.", vignette: "", emoji: "🗺️", fond: "linear-gradient(135deg,#ffb08a,#d9442b)", serie: "reunion" },
  { id: "memory-lontan", titre: "Memory lontan", accroche: "Les paires d'objets d'autrefois.", vignette: "", image: "/jeux/lontan/obj-lanp.webp", fond: "linear-gradient(135deg,#e8c89a,#8a4b1f)", serie: "reunion" },
  { id: "ramasse-les-letchis", titre: "Ramasse les letchis !", accroche: "Attrape les letchis, évite les guêpes.", vignette: "", image: "/jeux/reunion/letchi-grappe.webp", fond: "linear-gradient(135deg,#bff0a8,#c8202f)", serie: "reunion" },
  { id: "cari-parfait", titre: "Le cari parfait", accroche: "Cuisine sans que ça attache.", vignette: "", image: "/jeux/lontan/obj-marmit.webp", fond: "linear-gradient(135deg,#ffcf8a,#b5482a)", serie: "reunion" },
  { id: "gardiens-de-l-ile", titre: "Les Gardiens de l'île", accroche: "Reconnais les animaux de La Réunion.", vignette: "", emoji: "🦎", fond: "linear-gradient(135deg,#bff0a8,#2e7d4f)", serie: "reunion" },
  { id: "expressions-a-recoller", titre: "Expressions à recoller", accroche: "Relie les expressions créoles à leur sens.", vignette: "", emoji: "💬", fond: "linear-gradient(135deg,#ff9ab0,#d9442b)", serie: "reunion" },
  { id: "case-bleue", titre: "L'énigme de la Case Bleue", accroche: "Escape game dans la kaz de Gramoun Zélie.", vignette: "", emoji: "🔑", fond: "linear-gradient(135deg,#7ab0f0,#1b2a4a)", serie: "reunion" },
  { id: "coulee-de-lave", titre: "Coulée de lave", accroche: "Guide la lave du volcan jusqu'à la mer.", vignette: "", emoji: "🌋", fond: "linear-gradient(135deg,#ff9a5a,#5a2a1c)", serie: "reunion" },
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
    case "kosa-in-shoz": return (await import("./jeux/kosa-in-shoz")).default;
    case "zarlor": return (await import("./jeux/zarlor")).default;
    case "oussa-i-le": return (await import("./jeux/oussa-i-le")).default;
    case "memory-lontan": return (await import("./jeux/memory-lontan")).default;
    case "ramasse-les-letchis": return (await import("./jeux/ramasse-les-letchis")).default;
    case "cari-parfait": return (await import("./jeux/cari-parfait")).default;
    case "gardiens-de-l-ile": return (await import("./jeux/gardiens-de-l-ile")).default;
    case "expressions-a-recoller": return (await import("./jeux/expressions-a-recoller")).default;
    case "case-bleue": return (await import("./jeux/case-bleue")).default;
    case "coulee-de-lave": return (await import("./jeux/coulee-de-lave")).default;
    default: return null;
  }
}
