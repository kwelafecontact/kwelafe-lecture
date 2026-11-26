// Limite d'appareils : 3 appareils actifs par compte (vus dans les 30 derniers jours).
// Comptes famille / visiteur / élève / équipe / admin : pas de limite ici.
import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, tous } from "@/lib/cf";

const MAX = 3;
const FENETRE = 30 * 86400 * 1000;
const idOk = (s: unknown) => typeof s === "string" && /^[a-z0-9-]{8,64}$/i.test(s);

async function liste(cid: string) {
  return tous<{ appareil: string; nom: string | null; vu: number }>("SELECT appareil, nom, vu FROM appareils WHERE cid = ? AND vu > ? ORDER BY vu DESC", cid, Date.now() - FENETRE);
}

export async function POST(req: NextRequest) {
  const s = await lireSession();
  if (!s) return NextResponse.json({ ok: true });
  if (s.admin || s.visiteur || s.testeur || s.eleve) return NextResponse.json({ ok: true });
  const { id, nom } = await req.json().catch(() => ({}));
  if (!idOk(id)) return NextResponse.json({ ok: true });
  const actifs = await liste(s.cid);
  const connu = actifs.some((a) => a.appareil === id);
  if (!connu && actifs.length >= MAX) return NextResponse.json({ ok: false, max: MAX, autres: actifs.map((a) => ({ id: a.appareil, nom: a.nom || "Appareil", vu: a.vu })) });
  await executer("INSERT INTO appareils (cid, appareil, nom, vu) VALUES (?, ?, ?, ?) ON CONFLICT(cid, appareil) DO UPDATE SET vu = excluded.vu, nom = excluded.nom", s.cid, id, String(nom || "").slice(0, 60), Date.now());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const s = await lireSession();
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });
  const { cible } = await req.json().catch(() => ({}));
  if (!idOk(cible)) return NextResponse.json({ ok: false }, { status: 400 });
  await executer("DELETE FROM appareils WHERE cid = ? AND appareil = ?", s.cid, cible);
  return NextResponse.json({ ok: true });
}
