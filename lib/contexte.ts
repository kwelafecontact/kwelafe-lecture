import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { lireSession } from "./session";
import { aAcces, client, livresPublies, progressions, abonnementActif } from "./donnees";
import { favorisDe } from "./stats";
import { groupeDeSession, selectionDe } from "./etablissements";
import { publicsDe } from "./organisation";

/** Charge tout ce dont une page a besoin, ou renvoie vers l'écran de connexion. */
export async function contexte() {
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const [c, tousLivres, progs, favoris] = await Promise.all([client(session), livresPublies(), progressions(session.cid), favorisDe(session.cid)]);
  let livres = tousLivres;
  if (session.eleve) {
    // Élève : uniquement la sélection de son enseignant ; sans sélection, les livres jeunesse
    const info = await groupeDeSession(session);
    const sel = info ? selectionDe(info.groupe) : [];
    livres = sel.length ? tousLivres.filter((l) => sel.includes(l.id)) : tousLivres.filter((l) => publicsDe(l).some((p) => p === "tout-petits" || p === "enfants"));
  }
  // Réglage « masquer les livres d'horreur » (Réglages de l'app)
  const jar = await cookies();
  if (jar.get("kw_sans_horreur")?.value === "1") livres = livres.filter((l) => l.univers !== "horreur");
  const prog = new Map(progs.map((p) => [p.livre_id, p]));
  const acces = new Map(livres.map((l) => [l.id, aAcces(c, l, session)]));
  return { session, client: c, livres, progs, prog, acces, favoris, abonne: abonnementActif(c) };
}
