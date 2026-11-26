import { NextRequest, NextResponse } from "next/server";
import { executer } from "@/lib/cf";
import { etabAdministre } from "@/lib/etablissements";
import { lireSession } from "@/lib/session";

// Personnalisation de l'établissement par son responsable : nom, couleur, message d'accueil, logo.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await etabAdministre(await lireSession(), id))) return NextResponse.json({}, { status: 403 });
  const { nom, couleur, message, logo } = await req.json();
  if (typeof nom === "string" && nom.trim()) await executer("UPDATE etablissements SET nom = ? WHERE id = ?", nom.trim().slice(0, 80), id);
  if (typeof couleur === "string" && /^#[0-9a-f]{6}$/i.test(couleur)) await executer("UPDATE etablissements SET couleur = ? WHERE id = ?", couleur, id);
  if (typeof message === "string") await executer("UPDATE etablissements SET message = ? WHERE id = ?", message.slice(0, 400) || null, id);
  if (typeof logo === "string") {
    if (logo && (!logo.startsWith("data:image/") || logo.length > 300_000)) return NextResponse.json({ erreur: "Logo trop lourd." }, { status: 400 });
    await executer("UPDATE etablissements SET logo = ? WHERE id = ?", logo || null, id);
  }
  return NextResponse.json({ ok: true });
}
