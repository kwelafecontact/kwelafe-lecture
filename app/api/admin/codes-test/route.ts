import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { executer } from "@/lib/cf";
import { empreinte, nouveauCodeTest } from "@/lib/codes-test";

// Créer un code test (affiché une seule fois) ou en désactiver un.
export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { nom, jours } = await req.json();
  const n = String(nom || "").trim().slice(0, 60);
  const d = Math.min(365, Math.max(1, Number(jours) || 30));
  if (!n) return NextResponse.json({ erreur: "Indique le prénom de la personne." }, { status: 400 });
  const code = nouveauCodeTest();
  const fin = new Date(Date.now() + d * 86400000).toISOString();
  await executer(
    "INSERT INTO codes_test (empreinte, nom, fin, cree_le, apercu) VALUES (?, ?, ?, ?, ?)",
    await empreinte(code), n, fin, new Date().toISOString(), code.slice(-4)
  );
  return NextResponse.json({ code, fin });
}

export async function PATCH(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { empreinte: e } = await req.json();
  await executer("UPDATE codes_test SET revoque = 1 WHERE empreinte = ?", String(e || ""));
  return NextResponse.json({ ok: true });
}
