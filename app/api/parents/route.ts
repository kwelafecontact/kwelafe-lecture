import { NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { tous } from "@/lib/cf";

// Espace parents : progression « Apprendre le créole » de chaque profil du compte
export async function GET() {
  const s = await lireSession();
  if (!s || s.visiteur) return NextResponse.json({ erreur: "Connecte-toi." }, { status: 401 });
  const profils = await tous<{ id: string; nom: string; avatar: string | null }>("SELECT id, nom, avatar FROM apprendre_profils WHERE client_id = ? ORDER BY cree_le", s.cid);
  const lignes = await tous<{ client_id: string; xp: number; serie: number; jour: string | null; finies: string; xp_semaine: number; semaine: string | null; maj: string }>(
    "SELECT client_id, xp, serie, jour, finies, xp_semaine, semaine, maj FROM apprendre_progres WHERE client_id = ? OR client_id LIKE ?", s.cid, `${s.cid}#%`);
  const parCle = new Map(lignes.map((l) => [l.client_id, l]));
  const fiche = (cle: string, nom: string, avatar: string) => {
    const l = parCle.get(cle);
    const finies = l ? (JSON.parse(l.finies || "{}") as Record<string, number>) : {};
    return { nom, avatar, xp: l?.xp || 0, serie: l?.serie || 0, dernier: l?.jour || null, unites: Object.keys(finies).length, etoiles: Object.values(finies).reduce((a, b) => a + b, 0), xpSemaine: l?.xp_semaine || 0 };
  };
  return NextResponse.json({
    titulaire: fiche(s.cid, s.prenom || "Moi", "⭐"),
    profils: profils.map((p) => fiche(`${s.cid}#${p.id}`, p.nom, p.avatar || "🐢")),
  });
}
