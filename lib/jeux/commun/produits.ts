// Produits péi utilisés par les jeux 2D (images tirées des modèles 3D de Koup Koup).
import { FRUITS, type DefFruit } from "../koupkoup/donnees";

export type Categorie = "fruit" | "legume" | "epice";

const CATEGORIES: Record<string, Categorie> = {
  bringelle: "legume", chouchou: "legume", tijacque: "legume", friyapin: "legume",
  piment: "epice", vanille: "epice", combava: "epice",
};

// Produits gardés pour Koup Koup seulement (ni fruit ni légume au sens du tri)
const HORS_BAZAR = ["canne", "cacao"];

export type Produit = DefFruit & { categorie: Categorie; image: string; imageCoupe: string };

export const PRODUITS: Produit[] = FRUITS.filter((f) => !f.special && !HORS_BAZAR.includes(f.id)).map((f) => ({
  ...f,
  categorie: CATEGORIES[f.id] || "fruit",
  image: `/jeux/fruits/${f.id}.webp`,
  imageCoupe: `/jeux/fruits/${f.id}-coupe.webp`,
}));

export const produit = (id: string) => PRODUITS.find((p) => p.id === id)!;
export const fruitsSeuls = () => PRODUITS.filter((p) => p.categorie === "fruit");

/** Liste des images à précharger : entières et coupées, plus quelques spéciales. */
export function toutesLesImages(): Record<string, string> {
  const r: Record<string, string> = {};
  for (const p of PRODUITS) { r[p.id] = p.image; r[p.id + "-coupe"] = p.imageCoupe; }
  r["letchi-or"] = "/jeux/fruits/letchi-or.webp";
  r["lave"] = "/jeux/fruits/lave.webp";
  return r;
}

export const NOMS_CATEGORIE: Record<Categorie, string> = { fruit: "Fruits", legume: "Légumes", epice: "Épices" };
