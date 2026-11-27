// Tableau de bord du créateur de l'app (visible seulement pour l'éditeur dans Mon compte).
import Link from "next/link";
import { tous, premier } from "@/lib/cf";

const n = async (sql: string, ...a: unknown[]) => ((await premier<{ n: number }>(sql, ...a).catch(() => null))?.n ?? 0);

export default async function EspaceCreateur() {
  const il7j = new Date(Date.now() - 7 * 86400000).toISOString();
  const auj = new Date().toISOString().slice(0, 10);
  const [publies, brouillons, sansFiche, sansResume, lecteurs, lecteurs7, finis, abonnes, etabs, classes, eleves, devoirs, ressources, codes] = await Promise.all([
    n("SELECT COUNT(*) n FROM livres WHERE publie = 1"),
    n("SELECT COUNT(*) n FROM livres WHERE publie = 0"),
    n("SELECT COUNT(*) n FROM livres WHERE publie = 1 AND (shopify_product_id IS NULL OR shopify_product_id = '')"),
    n("SELECT COUNT(*) n FROM livres WHERE publie = 1 AND (resume IS NULL OR resume = '')"),
    n("SELECT COUNT(DISTINCT client_id) n FROM progression"),
    n("SELECT COUNT(DISTINCT client_id) n FROM progression WHERE maj >= ?", il7j),
    n("SELECT COUNT(*) n FROM progression WHERE termine = 1"),
    n("SELECT COUNT(*) n FROM clients WHERE abonne = 1 OR cadeau_jusqu >= ?", auj),
    n("SELECT COUNT(*) n FROM etablissements WHERE actif = 1"),
    n("SELECT COUNT(*) n FROM groupes"),
    n("SELECT COUNT(DISTINCT eleve) n FROM devoirs_faits"),
    n("SELECT COUNT(*) n FROM devoirs"),
    n("SELECT COUNT(*) n FROM ressources"),
    n("SELECT COUNT(*) n FROM codes_test WHERE revoque = 0 AND fin >= ?", new Date().toISOString()),
  ]);
  const top = await tous<{ titre: string; slug: string; n: number }>("SELECT l.titre, l.slug, COUNT(*) n FROM progression p JOIN livres l ON l.id = p.livre_id GROUP BY p.livre_id ORDER BY n DESC LIMIT 5").catch(() => []);
  const recents = await tous<{ titre: string; slug: string; cree_le: string }>("SELECT titre, slug, cree_le FROM livres WHERE publie = 1 ORDER BY cree_le DESC LIMIT 5").catch(() => []);
  const chiffres: [string, number, string][] = [
    ["📚", publies, "livres en ligne"], ["📝", brouillons, "brouillons"], ["👀", lecteurs7, "lecteurs actifs (7 jours)"], ["👥", lecteurs, "lecteurs au total"],
    ["⭐", abonnes, "abonnés et cadeaux actifs"], ["🏁", finis, "livres terminés"], ["🏫", etabs, "établissements actifs"], ["🎒", classes, "classes"],
    ["📌", devoirs, "devoirs donnés"], ["🧑‍🎓", eleves, "élèves ayant rendu un devoir"], ["🗂️", ressources, "ressources pédagogiques"], ["🔑", codes, "codes équipe actifs"],
  ];
  const aFaire = [
    sansFiche > 0 && { t: `${sansFiche} livre${sansFiche > 1 ? "s" : ""} en ligne sans fiche boutique liée`, h: "/admin#mes-livres" },
    sansResume > 0 && { t: `${sansResume} livre${sansResume > 1 ? "s" : ""} sans résumé`, h: "/admin#mes-livres" },
    brouillons > 0 && { t: `${brouillons} brouillon${brouillons > 1 ? "s" : ""} non publié${brouillons > 1 ? "s" : ""}`, h: "/admin#mes-livres" },
    ressources === 0 && { t: "Aucune fiche pédagogique déposée pour les enseignants", h: "/admin" },
  ].filter(Boolean) as { t: string; h: string }[];

  return (
    <section className="espace-createur">
      <div className="entete-createur"><span>🛠️</span><div><h2>Espace créateur</h2><p>Kwélafé Lecture en un coup d'œil</p></div></div>
      <div className="chiffres-createur">
        {chiffres.map(([e, v, t]) => <div key={t}><span>{e}</span><b>{v}</b><small>{t}</small></div>)}
      </div>
      <div className="outils-createur">
        <Link href="/admin#mes-livres">✏️ Modifier les livres</Link>
        <Link href="/admin">📥 Importer des livres</Link>
        <Link href="/admin">🏫 Établissements</Link>
        <Link href="/admin">🗂️ Ressources pédagogiques</Link>
        <Link href="/admin">🔑 Codes équipe et cadeaux</Link>
        <Link href="/ecole/ressources">👩‍🏫 Voir l'espace enseignant</Link>
        <Link href="/tableau-blanc">🖍️ Tableau blanc</Link>
        <Link href="/catalogue">🔎 Voir le catalogue</Link>
      </div>
      {aFaire.length > 0 && (
        <div className="a-faire-createur">
          <h3>À regarder</h3>
          {aFaire.map((x) => <Link key={x.t} href={x.h}>⚠️ {x.t} ›</Link>)}
        </div>
      )}
      <div className="listes-createur">
        <div><h3>❤️ Les plus lus</h3>{top.length ? <ol>{top.map((l) => <li key={l.slug}><Link href={`/livre/${l.slug}`}>{l.titre}</Link> <small>· {l.n} lecteur{l.n > 1 ? "s" : ""}</small></li>)}</ol> : <p className="texte-doux">Pas encore de lectures.</p>}</div>
        <div><h3>🆕 Derniers ajouts</h3><ul>{recents.map((l) => <li key={l.slug}><Link href={`/livre/${l.slug}`}>{l.titre}</Link> <small>· {new Date(l.cree_le).toLocaleDateString("fr-FR")}</small></li>)}</ul></div>
      </div>
    </section>
  );
}
