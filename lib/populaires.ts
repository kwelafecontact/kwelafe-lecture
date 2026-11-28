// Livres les plus ouverts par les lecteurs.
// Le calcul parcourt toute la table de progression : on le garde en cache une heure
// pour ne pas le refaire à chaque ouverture de l'accueil.
import { premier, executer, tous } from "./cf";

const CLE = "top_livres";
const DUREE = 60 * 60 * 1000;

export async function livresPopulaires(): Promise<string[]> {
  try {
    const r = await premier<{ valeur: string }>("SELECT valeur FROM reglages WHERE cle = ?", CLE);
    if (r?.valeur) {
      const c = JSON.parse(r.valeur) as { le: number; ids: string[] };
      if (Array.isArray(c.ids) && Date.now() - c.le < DUREE) return c.ids;
    }
  } catch { /* cache illisible : on recalcule */ }
  try {
    const lignes = await tous<{ livre_id: string }>(
      "SELECT livre_id, COUNT(*) AS n FROM progression GROUP BY livre_id ORDER BY n DESC LIMIT 30"
    );
    const ids = lignes.map((l) => l.livre_id);
    await executer(
      "INSERT INTO reglages (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur",
      CLE, JSON.stringify({ le: Date.now(), ids })
    ).catch(() => 0);
    return ids;
  } catch { return []; }
}
