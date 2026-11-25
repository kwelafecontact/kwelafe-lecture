// Jeux offerts à tous (offre Découverte, mode visiteur) : un par catégorie.
export const JEUX_GRATUITS = new Set(["memory-pei", "kosa-in-shoz", "3d:koup-koup"]);
export const jeuGratuit = (id: string, troisD = false) => JEUX_GRATUITS.has(troisD ? `3d:${id}` : id);
