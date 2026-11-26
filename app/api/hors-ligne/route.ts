// Prépare un livre pour la lecture hors connexion : jeton de 30 jours + liste des pages.
// Le livre est ensuite gardé CHIFFRÉ dans l'appareil (clé non exportable) et ne peut être lu que dans l'app.
import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { aAcces, client, livreParId } from "@/lib/donnees";
import { creerJetonContenu } from "@/lib/jeton-contenu";

const DUREE = 30 * 86400;

export async function GET(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({ erreur: "Connecte-toi" }, { status: 401 });
  if ((session as any).visiteur) return NextResponse.json({ erreur: "Réservé aux abonnés" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("livre") || "";
  const livre = await livreParId(id);
  if (!livre) return NextResponse.json({ erreur: "Livre introuvable" }, { status: 404 });
  const c = await client(session);
  if (!aAcces(c, livre, session)) return NextResponse.json({ erreur: "Accès terminé" }, { status: 403 });
  const m: any = livre.manifeste;
  if (m?.type !== "pdf") return NextResponse.json({ erreur: "Ce livre se lit en ligne uniquement" }, { status: 400 });
  const expire = Date.now() + DUREE * 1000;
  // Simple vérification (renouvellement) : pas besoin de renvoyer le jeton
  if (req.nextUrl.searchParams.get("verif")) return NextResponse.json({ ok: true, expire });
  const jeton = await creerJetonContenu(session.cid, livre.id, session.email, 6 * 3600);
  const fichiers = Array.from({ length: m.pages }, (_, k) => `pdf/${k + 1}.${m.ext || "webp"}`);
  return NextResponse.json({ jeton, expire, fichiers, livre: { id: livre.id, slug: livre.slug, titre: livre.titre, couverture: livre.couverture, manifeste: m } });
}
