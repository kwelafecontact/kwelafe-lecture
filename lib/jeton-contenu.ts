// Jeton court qui autorise la lecture d'un livre précis (30 minutes).
import { signer, verifier } from "./session";

export async function creerJetonContenu(clientId: string, livreId: string, email: string) {
  return signer({ c: clientId, l: livreId, e: email }, 30 * 60);
}

export async function lireJetonContenu(jeton: string) {
  return verifier<{ c: string; l: string; e: string }>(jeton);
}
