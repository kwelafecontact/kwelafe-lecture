// Progression des jeux : copie locale (IndexedDB) + envoi au serveur avec reprise.
// Le serveur reste la référence entre appareils ; la copie locale protège contre
// une coupure réseau, un arrêt brutal de l'onglet par iOS ou un rechargement.
import { sauvegarde, journal } from "@/public/jeux-3d/commun/performances";

export type PartieEnCours = { niveau: number; etat: unknown; t: number; mode?: string };
export type Local<D> = {
  donnees?: D;
  record?: number;
  partie?: PartieEnCours | null;
  aEnvoyer?: { score: number; donnees: D } | null;
};

const cle = (jeu: string) => "jeu:" + jeu;
const DUREE_REPRISE = 48 * 3600 * 1000; // une partie interrompue reste reprenable 48 h

export async function lireLocal<D>(jeu: string): Promise<Local<D>> {
  const v = await sauvegarde.lire<Local<D>>(cle(jeu), {});
  const l = v || {};
  if (l.partie && Date.now() - l.partie.t > DUREE_REPRISE) l.partie = null;
  return l;
}

// Écritures en série pour qu'une sauvegarde ancienne n'écrase jamais une plus récente
let file: Promise<unknown> = Promise.resolve();
export function modifierLocal<D>(jeu: string, f: (l: Local<D>) => Local<D>) {
  file = file.then(async () => {
    const l = await lireLocal<D>(jeu);
    await sauvegarde.ecrire(cle(jeu), f(l));
  }).catch((e) => console.error(e));
  return file;
}

/** Envoie le score au serveur ; en cas d'échec, il reste en attente et repartira plus tard. */
export async function envoyerScore<D>(jeu: string, score: number, donnees: D): Promise<{ record?: number } | null> {
  await modifierLocal<D>(jeu, (l) => ({ ...l, aEnvoyer: { score: Math.max(score, l.aEnvoyer?.score ?? 0), donnees } }));
  try {
    const rep = await fetch("/api/jeux/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jeu, score, donnees }) });
    if (!rep.ok) throw new Error("HTTP " + rep.status);
    const j = (await rep.json().catch(() => ({}))) as { record?: number };
    await modifierLocal<D>(jeu, (l) => ({ ...l, aEnvoyer: null }));
    return j;
  } catch (e) {
    journal("score-en-attente", jeu + " : " + String(e));
    return null;
  }
}

/** Renvoie un score resté en attente (au chargement du jeu et au retour du réseau). */
export async function renvoyerEnAttente<D>(jeu: string) {
  const l = await lireLocal<D>(jeu);
  if (!l.aEnvoyer) return;
  await envoyerScore(jeu, l.aEnvoyer.score, l.aEnvoyer.donnees);
}
