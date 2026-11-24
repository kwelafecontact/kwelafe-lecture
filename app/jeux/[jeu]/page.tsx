import { notFound, redirect } from "next/navigation";
import CadreJeu from "@/components/jeux/CadreJeu";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { premier } from "@/lib/cf";
import { fiche } from "@/lib/jeux/catalogue";

export const dynamic = "force-dynamic";

export default async function PageJeu({ params }: { params: Promise<{ jeu: string }> }) {
  const { jeu } = await params;
  const f = fiche(jeu);
  if (!f || f.troisD) notFound();
  const { session, abonne } = await contexte();
  if (!(abonne || session.admin || config.demo)) redirect("/jeux");
  const r = await premier<{ record: number; donnees: string }>(
    "SELECT record, donnees FROM scores_jeux WHERE client_id = ? AND jeu = ?", session.cid, jeu
  ).catch(() => null);
  let donnees = {};
  try { donnees = r ? JSON.parse(r.donnees || "{}") : {}; } catch { /* données illisibles */ }
  return <CadreJeu id={jeu} recordInitial={r?.record ?? 0} donneesInitiales={donnees} />;
}
