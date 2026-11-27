"use client";
// Pont entre l'app et le moteur d'effets KwFX (public/jeux-3d/commun/kwelafe-fx.js).
// Le jeu dit seulement ce qui se passe ; KwFX choisit les particules, couleurs et bruitages.
import { lireReglages } from "./reglages";

type Directeur = { evenement: (nom: string, d?: Record<string, unknown>) => unknown; regler: (o: Record<string, unknown>) => void };
type Opts = { theme?: string; public?: "enfant" | "ado" | "adulte"; mode?: "trankil" | "probleme" };

let directeur: Directeur | null = null;
let chargement: Promise<void> | null = null;

function charger(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).KwFX) return Promise.resolve();
  if (!chargement) {
    chargement = new Promise((ok) => {
      const s = document.createElement("script");
      s.src = "/jeux-3d/commun/kwelafe-fx.js";
      s.async = true;
      s.onload = () => ok();
      s.onerror = () => ok();
      document.head.appendChild(s);
    });
  }
  return chargement;
}

/** À appeler à l'ouverture d'un jeu (theme : reunion, volcan, lagon, fruits, flore, oiseaux, lontan, noel, mystere). */
export async function preparerFx(o: Opts = {}) {
  const r = lireReglages();
  if (!r.animations) return;
  await charger();
  const K = (window as any).KwFX;
  if (!K) return;
  const opts = { theme: o.theme || "reunion", public: o.public || "enfant", mode: o.mode || "trankil", support: "web", sons: r.sons, messages: true };
  if (!directeur) {
    try { directeur = K.init(opts); } catch { directeur = null; }
  } else directeur.regler(opts);
}

/** bonne, erreur, presque, niveau, record, victoire, defaite, debut, clic */
export function fx(nom: string, cible?: Element | null, extra: Record<string, unknown> = {}) {
  if (!directeur) return;
  if (!lireReglages().animations) return;
  try { directeur.evenement(nom, cible ? { element: cible, ...extra } : extra); } catch {}
}
