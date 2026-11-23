import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { aAcces, client, livreParId } from "@/lib/donnees";
import { creerJetonContenu } from "@/lib/jeton-contenu";

// Renouvelle le jeton de lecture d'un livre (appelé régulièrement par le lecteur).
export async function GET(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const id = req.nextUrl.searchParams.get("livre");
  const livre = id ? await livreParId(id) : null;
  if (!livre) return NextResponse.json({}, { status: 404 });
  const c = await client(session);
  if (!aAcces(c, livre, session)) return NextResponse.json({}, { status: 403 });
  return NextResponse.json({ jeton: await creerJetonContenu(session.cid, livre.id, session.email) });
}
