import { NextRequest, NextResponse } from "next/server";
import { executer, premier } from "@/lib/cf";
import { empreinteGroupe, etabAdministre, nouveauCodeGroupe, type Groupe } from "@/lib/etablissements";
import { NIVEAUX } from "@/lib/ecole";
import { lireSession } from "@/lib/session";

// Classes ou groupes d'un établissement : création (le code n'est montré qu'une fois), réglages, nouveau code.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const etab = await etabAdministre(await lireSession(), id);
  if (!etab) return NextResponse.json({}, { status: 403 });
  const { nom, niveau, responsable } = await req.json();
  const n = String(nom || "").trim().slice(0, 60);
  if (!n) return NextResponse.json({ erreur: "Donne un nom (par exemple CE1 de Mme Payet)." }, { status: 400 });
  const code = nouveauCodeGroupe(etab.type);
  const gid = crypto.randomUUID();
  await executer(
    "INSERT INTO groupes (id, etab_id, nom, niveau, responsable, empreinte, apercu, cree_le) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    gid, id, n, NIVEAUX.some((x) => x.id === niveau) ? niveau : null, String(responsable || "").slice(0, 60) || null,
    await empreinteGroupe(code), code.slice(-4), new Date().toISOString()
  );
  return NextResponse.json({ id: gid, code });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const etab = await etabAdministre(await lireSession(), id);
  if (!etab) return NextResponse.json({}, { status: 403 });
  const b = await req.json();
  const g = await premier<Groupe>("SELECT * FROM groupes WHERE id = ? AND etab_id = ?", String(b.groupe || ""), id);
  if (!g) return NextResponse.json({}, { status: 404 });
  if (typeof b.actif === "boolean") await executer("UPDATE groupes SET actif = ? WHERE id = ?", b.actif ? 1 : 0, g.id);
  if (typeof b.message === "string") await executer("UPDATE groupes SET message = ? WHERE id = ?", b.message.slice(0, 400) || null, g.id);
  if (Array.isArray(b.selection)) await executer("UPDATE groupes SET selection = ? WHERE id = ?", JSON.stringify(b.selection.map(String).slice(0, 60)), g.id);
  if (typeof b.niveau === "string") await executer("UPDATE groupes SET niveau = ? WHERE id = ?", NIVEAUX.some((x) => x.id === b.niveau) ? b.niveau : null, g.id);
  if (b.nouveauCode) {
    const code = nouveauCodeGroupe(etab.type);
    await executer("UPDATE groupes SET empreinte = ?, apercu = ? WHERE id = ?", await empreinteGroupe(code), code.slice(-4), g.id);
    return NextResponse.json({ code });
  }
  return NextResponse.json({ ok: true });
}
