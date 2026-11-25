import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer } from "@/lib/cf";

export async function POST(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const { livre, position, pourcentage, secondes } = await req.json();
  const pc = Math.max(0, Math.min(100, Number(pourcentage) || 0));
  await executer(
    `INSERT INTO progression (client_id, livre_id, position, pourcentage, termine, maj) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(client_id, livre_id) DO UPDATE SET position = excluded.position, pourcentage = excluded.pourcentage, termine = excluded.termine, maj = excluded.maj`,
    session.cid, String(livre), JSON.stringify({ i: Number(position?.i) || 0, f: Number(position?.f) || 0 }), pc, pc >= 98 ? 1 : 0, new Date().toISOString()
  );
  // Temps de lecture du jour (heure de La Réunion), pour la série de lecture et les statistiques
  const s = Math.max(0, Math.min(600, Math.round(Number(secondes) || 0)));
  const jour = new Date().toLocaleDateString("fr-CA", { timeZone: "Indian/Reunion" });
  await executer(
    `INSERT INTO jours_lecture (client_id, jour, secondes) VALUES (?, ?, ?)
     ON CONFLICT(client_id, jour) DO UPDATE SET secondes = secondes + excluded.secondes`,
    session.cid, jour, s
  );
  return NextResponse.json({ ok: true });
}
