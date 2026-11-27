import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { executer, premier, tous } from "@/lib/cf";

// Progrès « Apprendre le créole » sur le compte + ligue de la semaine (classement par XP gagnés depuis lundi)
const jourReunion = (d = new Date()) => new Date(d.getTime() + 4 * 3600000).toISOString().slice(0, 10);
function lundi() {
  const d = new Date(Date.now() + 4 * 3600000);
  const j = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - j);
  return d.toISOString().slice(0, 10);
}
type Ligne = { client_id: string; prenom: string | null; xp: number; serie: number; jour: string | null; finies: string; coeurs: number; jour_coeurs: string | null; semaine: string | null; xp_semaine: number };

function versClient(l: Ligne | null) {
  if (!l) return null;
  const auj = jourReunion();
  return { xp: l.xp, serie: l.serie, jour: l.jour || "", finies: JSON.parse(l.finies || "{}"), coeurs: l.jour_coeurs === auj ? l.coeurs : 5, jourCoeurs: auj, xpSemaine: l.semaine === lundi() ? l.xp_semaine : 0 };
}

async function classement(cid?: string) {
  const sem = lundi();
  const rows = await tous<{ client_id: string; prenom: string | null; xp_semaine: number }>(
    "SELECT client_id, prenom, xp_semaine FROM apprendre_progres WHERE semaine = ? AND xp_semaine > 0 ORDER BY xp_semaine DESC LIMIT 30", sem);
  return rows.map((r, i) => ({ rang: i + 1, prenom: r.prenom || "Lecteur", xp: r.xp_semaine, moi: r.client_id === cid }));
}

export async function GET() {
  const s = await lireSession();
  const connecte = !!s && !s.visiteur;
  const l = connecte ? await premier<Ligne>("SELECT * FROM apprendre_progres WHERE client_id = ?", s!.cid) : null;
  return NextResponse.json({ connecte, progres: versClient(l), classement: await classement(s?.cid), semaine: lundi() });
}

export async function POST(req: NextRequest) {
  const s = await lireSession();
  if (!s || s.visiteur) return NextResponse.json({ erreur: "Connecte-toi pour garder tes progrès." }, { status: 401 });
  const b = await req.json();
  const auj = jourReunion();
  const hier = jourReunion(new Date(Date.now() - 86400000));
  const sem = lundi();
  const l = (await premier<Ligne>("SELECT * FROM apprendre_progres WHERE client_id = ?", s.cid)) || {
    client_id: s.cid, prenom: s.prenom || null, xp: 0, serie: 0, jour: null, finies: "{}", coeurs: 5, jour_coeurs: auj, semaine: sem, xp_semaine: 0,
  };
  if (l.jour_coeurs !== auj) { l.coeurs = 5; l.jour_coeurs = auj; }
  if (l.semaine !== sem) { l.semaine = sem; l.xp_semaine = 0; }
  const finies = JSON.parse(l.finies || "{}") as Record<string, number>;

  if (b.action === "coeur") l.coeurs = Math.max(0, l.coeurs - 1);
  else if (b.action === "lecon") {
    const gain = Math.max(0, Math.min(25, Number(b.gain) || 0));
    const u = String(Number(b.unite) || 0);
    l.xp += gain; l.xp_semaine += gain;
    l.serie = l.jour === auj ? l.serie : l.jour === hier ? l.serie + 1 : 1;
    l.jour = auj;
    finies[u] = Math.max(Math.min(3, Number(b.etoiles) || 1), finies[u] || 0);
  } else if (b.action === "importer") {
    // Première connexion : reprendre les progrès faits sur cet appareil (une seule fois, plafonné)
    if (l.xp === 0 && b.local) {
      l.xp = Math.min(5000, Number(b.local.xp) || 0);
      l.serie = Math.min(365, Number(b.local.serie) || 0);
      l.jour = typeof b.local.jour === "string" ? b.local.jour.slice(0, 10) : null;
      for (const [k, v] of Object.entries(b.local.finies || {})) finies[String(Number(k))] = Math.min(3, Number(v) || 1);
    }
  } else return NextResponse.json({}, { status: 400 });

  l.finies = JSON.stringify(finies);
  await executer(
    `INSERT INTO apprendre_progres (client_id, prenom, xp, serie, jour, finies, coeurs, jour_coeurs, semaine, xp_semaine, maj) VALUES (?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(client_id) DO UPDATE SET prenom=excluded.prenom, xp=excluded.xp, serie=excluded.serie, jour=excluded.jour, finies=excluded.finies, coeurs=excluded.coeurs, jour_coeurs=excluded.jour_coeurs, semaine=excluded.semaine, xp_semaine=excluded.xp_semaine, maj=excluded.maj`,
    s.cid, s.prenom || l.prenom, l.xp, l.serie, l.jour, l.finies, l.coeurs, l.jour_coeurs, l.semaine, l.xp_semaine, new Date().toISOString());
  return NextResponse.json({ progres: versClient(l), classement: await classement(s.cid) });
}
