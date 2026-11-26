// L'enseignant donne, consulte et retire les devoirs de ses classes.
import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { etabAdministre } from "@/lib/etablissements";
import { executer, premier, tous } from "@/lib/cf";
import { TYPES_DEVOIR } from "@/lib/devoirs";

async function droit(id: string, groupe: string) {
  const s = await lireSession();
  const etab = await etabAdministre(s, id);
  if (!etab) return false;
  return !!(await premier("SELECT id FROM groupes WHERE id = ? AND etab_id = ?", groupe, id));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const groupe = req.nextUrl.searchParams.get("groupe") || "";
  if (!(await droit(id, groupe))) return NextResponse.json({}, { status: 403 });
  const liste = await tous("SELECT d.*, (SELECT COUNT(*) FROM devoirs_faits f WHERE f.devoir_id = d.id) AS faits, (SELECT GROUP_CONCAT(prenom, ', ') FROM devoirs_faits f WHERE f.devoir_id = d.id) AS qui FROM devoirs d WHERE d.groupe_id = ? ORDER BY d.echeance", groupe);
  return NextResponse.json({ liste });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { groupe, titre, consigne, type, cible, echeance } = await req.json();
  if (!(await droit(id, groupe))) return NextResponse.json({}, { status: 403 });
  const t = String(titre || "").trim().slice(0, 120);
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(String(echeance))) return NextResponse.json({ erreur: "Titre et date obligatoires." }, { status: 400 });
  const did = crypto.randomUUID();
  await executer("INSERT INTO devoirs (id, groupe_id, titre, consigne, type, cible, echeance, cree_le) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    did, groupe, t, String(consigne || "").slice(0, 600) || null, TYPES_DEVOIR[type] ? type : "autre", String(cible || "").slice(0, 80) || null, echeance, new Date().toISOString());
  return NextResponse.json({ id: did });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { groupe, devoir } = await req.json();
  if (!(await droit(id, groupe))) return NextResponse.json({}, { status: 403 });
  await executer("DELETE FROM devoirs WHERE id = ? AND groupe_id = ?", devoir, groupe);
  await executer("DELETE FROM devoirs_faits WHERE devoir_id = ?", devoir);
  return NextResponse.json({ ok: true });
}
