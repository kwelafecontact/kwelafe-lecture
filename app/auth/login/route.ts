import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { aleatoire, decouverte, defiPkce, urlRetour } from "@/lib/shopify";
import { ouvrirSession } from "@/lib/session";

export async function GET() {
  // Mode démo : connexion immédiate, sans Shopify, pour tester l'application.
  if (config.demo) {
    await ouvrirSession({
      cid: "demo-client",
      email: config.adminEmails[0] || "demo@kwelafeproduction.com",
      prenom: "Kwélafé",
    });
    return NextResponse.redirect(`${config.appUrl}/portails`);
  }

  const d = await decouverte();
  const verifier = aleatoire(48);
  const state = aleatoire(16);
  const nonce = aleatoire(16);
  const jar = await cookies();
  jar.set("kw_oauth", JSON.stringify({ verifier, state, nonce }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const url = new URL(d.authorization_endpoint);
  url.searchParams.set("client_id", config.caClientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", urlRetour());
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", await defiPkce(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("locale", "fr");
  return NextResponse.redirect(url.toString());
}
