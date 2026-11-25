// Jeton court qui autorise la lecture d'un livre précis (30 minutes).
import { signer, verifier } from "./session";

// Les livres-applications web chargent leurs pages au fil de la lecture : jeton de 8 heures.
export async function creerJetonContenu(clientId: string, livreId: string, email: string, duree = 30 * 60) {
  return signer({ c: clientId, l: livreId, e: email }, duree);
}

export async function lireJetonContenu(jeton: string) {
  return verifier<{ c: string; l: string; e: string }>(jeton);
}
