import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { executer } from "@/lib/cf";

export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { valeur } = await req.json();
  const v = String(valeur || "").slice(0, 600).trim();
  if (!v) await executer("DELETE FROM reglages WHERE cle = 'mot_du_mois'");
  else await executer("INSERT INTO reglages (cle, valeur) VALUES ('mot_du_mois', ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur", v);
  return NextResponse.json({ ok: true });
}
