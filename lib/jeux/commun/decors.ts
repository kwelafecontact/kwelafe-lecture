// Visuels de décor fournis par KWélafé (fichiers public/jeux/decors/<jeu>/<plan>.webp).
// Tant qu'un plan n'est pas listé ici, le jeu dessine lui-même ce plan (ciel, relief, végétation, premier plan).
export type PlanDecor = "ciel" | "relief" | "vegetation" | "premier-plan";
export const DECORS_IMAGES: Record<string, PlanDecor[]> = {};
