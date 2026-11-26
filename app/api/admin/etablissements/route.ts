import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { executer } from "@/lib/cf";

// Espace éditeur : créer un établissement abonné, le prolonger ou le suspendre.
export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { nom, type, ville, admins, mois } = await req.json();
  const n = String(nom || "").trim().slice(0, 80);
  if (!n) return NextResponse.json({ erreur: "Indique le nom de l'établissement." }, { status: 400 });
  const t = ["ecole", "mediatheque", "collectivite"].includes(type) ? type : "ecole";
  const fin = new Date(Date.now() + Math.min(36, Math.max(1, Number(mois) || 12)) * 30.5 * 86400000).toISOString();
  const id = crypto.randomUUID();
  await executer(
    "INSERT INTO etablissements (id, nom, type, ville, admins, fin, cree_le) VALUES (?, ?, ?, ?, ?, ?, ?)",
    id, n, t, String(ville || "").slice(0, 60) || null, String(admins || "").toLowerCase().slice(0, 400), fin, new Date().toISOString()
  );
  return NextResponse.json({ id });
}

export async function PATCH(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { id, actif, mois, admins } = await req.json();
  if (typeof actif === "boolean") await executer("UPDATE etablissements SET actif = ? WHERE id = ?", actif ? 1 : 0, id);
  if (mois) await executer("UPDATE etablissements SET fin = ? WHERE id = ?", new Date(Date.now() + Number(mois) * 30.5 * 86400000).toISOString(), id);
  if (typeof admins === "string") await executer("UPDATE etablissements SET admins = ? WHERE id = ?", admins.toLowerCase().slice(0, 400), id);
  return NextResponse.json({ ok: true });
}
