import { redirect } from "next/navigation";
import KoupKoup from "@/components/jeux/KoupKoup";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { premier } from "@/lib/cf";

export const dynamic = "force-dynamic";
export const metadata = { title: "Koup Koup · Kwélafé" };

export default async function PageKoupKoup() {
  const { session, abonne } = await contexte();
  if (!(abonne || session.admin || config.demo)) redirect("/jeux");
  const r = await premier<{ record: number; donnees: string }>(
    "SELECT record, donnees FROM scores_jeux WHERE client_id = ? AND jeu = 'koup-koup'", session.cid
  ).catch(() => null);
  let donnees = {};
  try { donnees = r ? JSON.parse(r.donnees || "{}") : {}; } catch { /* données illisibles : on repart de zéro */ }
  return <KoupKoup recordInitial={r?.record ?? 0} donneesInitiales={donnees} />;
}
