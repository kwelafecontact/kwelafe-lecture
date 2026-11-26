// L'élève coche (ou décoche) « J'ai fini » sur un devoir de sa classe.
import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, premier } from "@/lib/cf";

export async function POST(req: NextRequest) {
  const s = await lireSession();
  if (!s?.eleve) return NextResponse.json({}, { status: 403 });
  const { devoir, fait } = await req.json();
  const d = await premier("SELECT id FROM devoirs WHERE id = ? AND groupe_id = ?", devoir, s.eleve.g);
  if (!d) return NextResponse.json({}, { status: 404 });
  if (fait) await executer("INSERT OR REPLACE INTO devoirs_faits (devoir_id, eleve, prenom, fait_le) VALUES (?, ?, ?, ?)", devoir, s.cid, (s.prenom || "Élève").slice(0, 30), new Date().toISOString());
  else await executer("DELETE FROM devoirs_faits WHERE devoir_id = ? AND eleve = ?", devoir, s.cid);
  return NextResponse.json({ ok: true });
}
