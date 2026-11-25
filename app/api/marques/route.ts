import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, premier } from "@/lib/cf";

export type Marque = { i: number; f: number; titre: string; le: string };

// Marque-pages d'un livre, gardés sur le compte (retrouvés sur tous les appareils)
export async function GET(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const livre = req.nextUrl.searchParams.get("livre") || "";
  const r = await premier<{ liste: string }>("SELECT liste FROM marques WHERE client_id = ? AND livre_id = ?", session.cid, livre);
  return NextResponse.json({ liste: r ? JSON.parse(r.liste) : [] });
}

export async function PUT(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const { livre, liste } = await req.json();
  const propre: Marque[] = (Array.isArray(liste) ? liste : []).slice(0, 200).map((m: any) => ({
    i: Number(m.i) || 0, f: Number(m.f) || 0, titre: String(m.titre || "").slice(0, 120), le: String(m.le || new Date().toISOString()),
  }));
  await executer(
    `INSERT INTO marques (client_id, livre_id, liste) VALUES (?, ?, ?)
     ON CONFLICT(client_id, livre_id) DO UPDATE SET liste = excluded.liste`,
    session.cid, String(livre), JSON.stringify(propre)
  );
  return NextResponse.json({ ok: true });
}
