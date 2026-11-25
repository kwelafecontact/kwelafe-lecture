import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import { ouvrirSession } from "@/lib/session";

// Mode visiteur : entrer dans l'app sans compte. Seuls les livres et jeux gratuits s'ouvrent,
// le reste s'affiche verrouillé comme pour un lecteur sans abonnement. Aucun droit d'éditeur.
export async function GET() {
  await ouvrirSession({ cid: `visiteur-${crypto.randomUUID()}`, email: "visiteur@kwelafe.invalid", prenom: "", visiteur: true });
  return NextResponse.redirect(`${config.appUrl}/portails`);
}
