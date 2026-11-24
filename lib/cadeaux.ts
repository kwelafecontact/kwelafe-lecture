// Création des codes cadeaux (un par exemplaire acheté, jamais en double pour une même commande).
import { CADEAUX } from "./config";
import { tous, executer } from "./cf";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O ni 1/I
export function nouveauCode() {
  const bloc = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => ALPHABET[n % ALPHABET.length]).join("");
  return `KWELA-${bloc()}-${bloc()}`;
}

export async function creerCodesPourCommande(
  commande: string,
  lignes: { sku: string; quantite: number }[],
  acheteurId: string | null,
  acheteurEmail: string | null
) {
  const existants = await tous("SELECT code FROM codes_cadeaux WHERE commande = ?", commande);
  if (existants.length) return;
  for (const l of lignes) {
    const mois = CADEAUX[l.sku];
    if (!mois) continue;
    for (let i = 0; i < (l.quantite || 1); i++) {
      await executer(
        "INSERT INTO codes_cadeaux (code, duree_mois, commande, acheteur_id, acheteur_email) VALUES (?, ?, ?, ?, ?)",
        nouveauCode(), mois, commande, acheteurId, acheteurEmail
      );
    }
  }
}
