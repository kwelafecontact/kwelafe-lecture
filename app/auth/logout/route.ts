import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { config } from "@/lib/config";
import { fermerSession } from "@/lib/session";
import { decouverte } from "@/lib/shopify";

// Déconnexion de l'app ET du compte client Shopify (pour pouvoir changer de compte)
export async function GET() {
  await fermerSession();
  const jar = await cookies();
  const idToken = jar.get("kw_idt")?.value;
  jar.delete("kw_idt");
  jar.delete("kw_espace");
  const retour = `${config.appUrl}/bienvenue`;
  if (idToken && !config.demo) {
    try {
      const d = await decouverte();
      if (d.end_session_endpoint) {
        const url = new URL(d.end_session_endpoint);
        url.searchParams.set("id_token_hint", idToken);
        url.searchParams.set("post_logout_redirect_uri", retour);
        return NextResponse.redirect(url.toString());
      }
    } catch {}
  }
  return NextResponse.redirect(retour);
}
