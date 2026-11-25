import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, premier } from "@/lib/cf";

// Ajoute ou retire un livre des favoris du lecteur
export async function POST(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const { livre } = await req.json();
  const id = String(livre || "");
  if (!id) return NextResponse.json({}, { status: 400 });
  const deja = await premier("SELECT 1 AS x FROM favoris WHERE client_id = ? AND livre_id = ?", session.cid, id);
  if (deja) await executer("DELETE FROM favoris WHERE client_id = ? AND livre_id = ?", session.cid, id);
  else await executer("INSERT INTO favoris (client_id, livre_id, cree_le) VALUES (?, ?, ?)", session.cid, id, new Date().toISOString());
  return NextResponse.json({ favori: !deja });
}
