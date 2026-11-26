import { NextRequest, NextResponse } from "next/server";
import { executer, premier } from "@/lib/cf";
import { empreinteGroupe, etabValide, type Etab, type Groupe } from "@/lib/etablissements";
import { ouvrirSession } from "@/lib/session";

// Un élève ou un lecteur entre avec le code de sa classe ou de son groupe.
export async function POST(req: NextRequest) {
  const { code, prenom } = await req.json();
  const g = await premier<Groupe>("SELECT * FROM groupes WHERE empreinte = ?", await empreinteGroupe(String(code || "")));
  const e = g ? await premier<Etab>("SELECT * FROM etablissements WHERE id = ?", g.etab_id) : null;
  if (!g || !g.actif || !etabValide(e)) {
    await new Promise((ok) => setTimeout(ok, 800));
    return NextResponse.json({ erreur: "Ce code n'est pas valable. Vérifie-le avec ton enseignant ou ta médiathèque." }, { status: 403 });
  }
  await executer("UPDATE groupes SET connexions = connexions + 1, dernier_usage = ? WHERE id = ?", new Date().toISOString(), g.id);
  const p = String(prenom || "").trim().slice(0, 30);
  await ouvrirSession({ cid: `eleve-${g.id.slice(0, 8)}-${crypto.randomUUID().slice(0, 8)}`, email: "eleve@kwelafe.invalid", prenom: p, eleve: { e: g.etab_id, g: g.id } });
  const rep = NextResponse.json({ ok: true });
  // Repère lisible par l'interface (aucune donnée) : affiche la navigation de l'espace élève
  rep.cookies.set("kw_espace", "eleve", { path: "/", sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
  return rep;
}
