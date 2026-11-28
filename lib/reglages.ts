// Réglages de l'app, gardés sur l'appareil (localStorage) ; certains copiés en cookie pour que le serveur les lise.
export type Reglages = {
  taille: "normal" | "grand" | "tres-grand";
  theme: "clair" | "sepia" | "nuit";
  couleur: "lave" | "lagon" | "cirques" | "flamboyant" | "vanille" | "bourbon"; // couleur principale, aux couleurs de l'île
  animations: boolean;
  sons: boolean;
  format: "epub" | "pdf";
  objectif: number; // minutes de lecture par jour
  sansHorreur: boolean;
  limiteEnfants: number; // minutes par session dans le coin des enfants (0 = sans limite)
  profilAuto: boolean; // demander « qui joue ? » à chaque ouverture
  apprendreSansCoeurs: boolean;
};
export const DEFAUT: Reglages = { taille: "normal", theme: "clair", couleur: "lave", animations: true, sons: true, format: "epub", objectif: 15, sansHorreur: false, limiteEnfants: 0, profilAuto: true, apprendreSansCoeurs: false };
const CLE = "kw-reglages";
export function lireReglages(): Reglages {
  try { return { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE) || "{}") }; } catch { return DEFAUT; }
}
export function appliquerReglages(r: Reglages) {
  const h = document.documentElement;
  h.dataset.taille = r.taille; h.dataset.theme = r.theme; h.dataset.couleur = r.couleur || "lave"; h.dataset.animations = r.animations ? "oui" : "non";
  const an = "; path=/; max-age=31536000; samesite=lax";
  document.cookie = `kw_sans_horreur=${r.sansHorreur ? 1 : 0}${an}`;
  document.cookie = `kw_format=${r.format}${an}`;
  document.cookie = `kw_objectif=${r.objectif}${an}`;
}
export function ecrireReglages(r: Reglages) {
  try { localStorage.setItem(CLE, JSON.stringify(r)); } catch {}
  appliquerReglages(r);
}
