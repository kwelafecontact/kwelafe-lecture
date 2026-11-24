import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, premier } from "@/lib/cf";
import { IDS_JEUX } from "@/lib/jeux/catalogue";

const JEUX = IDS_JEUX;

/** Renvoie le record, le nombre de parties et les données (fruits découverts…) du joueur. */
export async function GET(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const jeu = req.nextUrl.searchParams.get("jeu") || "";
  if (!JEUX.has(jeu)) return NextResponse.json({ erreur: "Jeu inconnu" }, { status: 400 });
  const r = await premier<{ record: number; parties: number; donnees: string }>(
    "SELECT record, parties, donnees FROM scores_jeux WHERE client_id = ? AND jeu = ?", session.cid, jeu
  );
  return NextResponse.json({ record: r?.record ?? 0, parties: r?.parties ?? 0, donnees: r ? JSON.parse(r.donnees || "{}") : {} });
}

/** Enregistre une partie terminée : garde le meilleur score et met à jour les données. */
export async function POST(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({}, { status: 401 });
  const corps = await req.json().catch(() => null);
  const jeu = String(corps?.jeu || "");
  if (!JEUX.has(jeu)) return NextResponse.json({ erreur: "Jeu inconnu" }, { status: 400 });
  const score = Math.max(0, Math.min(1_000_000, Math.round(Number(corps?.score) || 0)));
  const donnees = JSON.stringify(corps?.donnees && typeof corps.donnees === "object" ? corps.donnees : {});
  if (donnees.length > 8000) return NextResponse.json({ erreur: "Données trop volumineuses" }, { status: 413 });
  await executer(
    `INSERT INTO scores_jeux (client_id, jeu, record, parties, donnees, maj) VALUES (?, ?, ?, 1, ?, ?)
     ON CONFLICT(client_id, jeu) DO UPDATE SET record = MAX(record, excluded.record), parties = parties + 1, donnees = excluded.donnees, maj = excluded.maj`,
    session.cid, jeu, score, donnees, new Date().toISOString()
  );
  const r = await premier<{ record: number; parties: number }>("SELECT record, parties FROM scores_jeux WHERE client_id = ? AND jeu = ?", session.cid, jeu);
  return NextResponse.json({ ok: true, record: r?.record ?? score, parties: r?.parties ?? 1 });
}
