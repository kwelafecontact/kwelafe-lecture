import { redirect } from "next/navigation";
import { lireSession } from "./session";
import { aAcces, client, livresPublies, progressions, abonnementActif } from "./donnees";
import { favorisDe } from "./stats";

/** Charge tout ce dont une page a besoin, ou renvoie vers l'écran de connexion. */
export async function contexte() {
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const [c, livres, progs, favoris] = await Promise.all([client(session), livresPublies(), progressions(session.cid), favorisDe(session.cid)]);
  const prog = new Map(progs.map((p) => [p.livre_id, p]));
  const acces = new Map(livres.map((l) => [l.id, aAcces(c, l, session)]));
  return { session, client: c, livres, progs, prog, acces, favoris, abonne: abonnementActif(c) };
}
