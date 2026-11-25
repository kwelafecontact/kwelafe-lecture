import { NextRequest, NextResponse } from "next/server";
import { executer, premier } from "@/lib/cf";
import { empreinte } from "@/lib/codes-test";
import { ouvrirSession } from "@/lib/session";

// Entrée de l'équipe avec un code test : lecture complète, jamais de droits d'éditeur.
export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const e = await empreinte(String(code || ""));
  const r = await premier<{ nom: string; fin: string; revoque: number }>("SELECT nom, fin, revoque FROM codes_test WHERE empreinte = ?", e);
  if (!r || r.revoque || new Date(r.fin) <= new Date()) {
    await new Promise((ok) => setTimeout(ok, 800)); // freine les essais au hasard
    return NextResponse.json({ erreur: "Ce code n'est pas valable ou a expiré." }, { status: 403 });
  }
  await executer("UPDATE codes_test SET dernier_usage = ? WHERE empreinte = ?", new Date().toISOString(), e);
  await ouvrirSession({ cid: `testeur-${e.slice(0, 16)}`, email: "testeur@kwelafe.invalid", prenom: r.nom, testeur: e });
  return NextResponse.json({ ok: true });
}
