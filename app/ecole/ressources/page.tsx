import Link from "next/link";
import { redirect } from "next/navigation";
import NavBas from "@/components/NavBas";
import { lireSession } from "@/lib/session";
import { tous } from "@/lib/cf";
import { NIVEAUX, THEMES } from "@/lib/ecole";
import { estEnseignant, TYPES_RESSOURCE, type Ressource } from "@/lib/ressources";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ressources pédagogiques · Kwélafé" };

const taille = (o: number) => (o > 1048576 ? `${(o / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round(o / 1024))} Ko`);

export default async function Ressources({ searchParams }: { searchParams: Promise<{ theme?: string; niveau?: string }> }) {
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const q = await searchParams;
  const prof = await estEnseignant(session);
  if (!prof) return (
    <><main className="page">
      <header className="entete"><div><div className="sur-titre">Espace enseignant</div><h1>Ressources pédagogiques</h1></div></header>
      <section className="panneau"><p>Cet espace est réservé aux enseignants et aux responsables d'établissement abonnés.</p>
        <Link className="btn" href="/ecole">Retour à l'espace École</Link></section>
    </main><NavBas /></>
  );
  const liste = await tous<Ressource>("SELECT * FROM ressources ORDER BY niveau, type, titre").catch(() => [] as Ressource[]);
  const theme = THEMES.find((t) => t.id === q.theme);
  const niveau = NIVEAUX.find((n) => n.id === q.niveau);
  const filtres = liste.filter((r) => (!theme || r.theme === theme.id) && (!niveau || r.niveau === niveau.id));
  return (
    <>
      <main className="page">
        <header className="entete"><div><div className="sur-titre">Espace enseignant</div><h1>Ressources pédagogiques</h1></div></header>
        <p className="texte-doux">Fiches, cours, corrigés et activités Kwélafé à projeter ou imprimer pour la classe. Choisis un thème, puis un niveau.</p>

        <h2 className="titre-etape">1. Le thème</h2>
        <div className="grille-themes-ress">
          {THEMES.map((t) => {
            const nb = liste.filter((r) => r.theme === t.id).length;
            return (
              <Link key={t.id} href={`/ecole/ressources?theme=${t.id}${niveau ? `&niveau=${niveau.id}` : ""}`} className={`carte-theme-ress ${theme?.id === t.id ? "actif" : ""}`} style={{ ["--c" as any]: t.couleur, ["--cc" as any]: t.clair }}>
                <span>{t.emoji}</span><b>{t.nom}</b><small>{nb} ressource{nb > 1 ? "s" : ""}</small>
              </Link>
            );
          })}
        </div>

        {theme && (
          <>
            <h2 className="titre-etape">2. Le niveau</h2>
            <div className="themes-quiz">
              <Link href={`/ecole/ressources?theme=${theme.id}`} className={`pastille ${!niveau ? "active" : ""}`}>Tous les niveaux</Link>
              {NIVEAUX.map((n) => {
                const nb = liste.filter((r) => r.theme === theme.id && r.niveau === n.id).length;
                return <Link key={n.id} href={`/ecole/ressources?theme=${theme.id}&niveau=${n.id}`} className={`pastille ${niveau?.id === n.id ? "active" : ""}`}>{n.emoji} {n.nom} ({nb})</Link>;
              })}
            </div>

            <h2 className="titre-etape">3. Les ressources {niveau ? `· ${niveau.nom}` : ""}</h2>
            {filtres.length === 0 ? (
              <section className="panneau"><p>Les ressources de ce thème{niveau ? " pour ce niveau" : ""} arrivent bientôt.</p></section>
            ) : (
              <div className="liste-ress">
                {filtres.map((r) => (
                  <div key={r.id} className="carte-ress">
                    <span className="ico-ress">{TYPES_RESSOURCE[r.type]?.emoji || "📄"}</span>
                    <div className="infos-ress">
                      <b>{r.titre}</b>
                      <small>{TYPES_RESSOURCE[r.type]?.nom || "Fiche"} · {NIVEAUX.find((n) => n.id === r.niveau)?.nom} · {r.format.toUpperCase()} · {taille(r.taille)}</small>
                      {r.description && <p className="texte-doux">{r.description}</p>}
                    </div>
                    <div className="actions-ress">
                      <a className="btn" href={`/api/ressources/${r.id}`} target="_blank" rel="noopener">Ouvrir</a>
                      <a className="btn secondaire" href={`/api/ressources/${r.id}?dl=1`}>Télécharger</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <p style={{ marginTop: 24 }}><Link className="btn secondaire" href="/tableau-blanc">🖍️ Ouvrir le tableau blanc</Link></p>
      </main>
      <NavBas />
    </>
  );
}
