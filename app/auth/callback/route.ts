import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { echangerCode, profilClient } from "@/lib/shopify";
import { ouvrirSession } from "@/lib/session";
import { client } from "@/lib/donnees";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const brut = jar.get("kw_oauth")?.value;
  jar.delete("kw_oauth");
  const erreur = (raison: string) => NextResponse.redirect(`${config.appUrl}/bienvenue?erreur=${encodeURIComponent(raison)}`);

  if (!code || !state || !brut) return erreur("connexion");
  const { verifier, state: attendu } = JSON.parse(brut);
  if (state !== attendu) return erreur("connexion");

  try {
    const jetons = await echangerCode(code, verifier);
    const profil = await profilClient(jetons.access_token);
    const session = { cid: profil.id, email: profil.email, prenom: profil.prenom };
    await ouvrirSession(session);
    await client(session, true); // synchronise achats et abonnement
    return NextResponse.redirect(`${config.appUrl}/`);
  } catch (e) {
    console.error(e);
    return erreur("connexion");
  }
}
