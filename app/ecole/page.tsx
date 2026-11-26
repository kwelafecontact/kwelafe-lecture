import { JEUX_ECOLE } from "@/lib/ecole-jeux";
import Link from "next/link";
import NavBas from "@/components/NavBas";
import CarteLivre from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { NIVEAUX, THEMES, sansAccentEcole } from "@/lib/ecole";
import { publicsDe } from "@/lib/organisation";
import { sansDoublon } from "@/lib/formats";
import { leger } from "@/lib/leger";
import { CATALOGUE } from "@/lib/jeux/catalogue";
import { jeuGratuit } from "@/lib/jeux/gratuits";
import PastilleJeu from "@/components/PastilleJeu";

export const dynamic = "force-dynamic";
export const metadata = { title: "École · Kwélafé" };

export default async function Ecole({ searchParams }: { searchParams: Promise<{ niveau?: string; theme?: string }> }) {
  const { session, livres, acces, prog, favoris, abonne } = await contexte();
  const jeuxOuverts = abonne || !!session.admin;
  const q = await searchParams;
  const niveau = NIVEAUX.find((n) => n.id === q.niveau) ?? null;
  const theme = THEMES.find((t) => t.id === q.theme) ?? null;
  const url = (n?: string | null, t?: string | null) => {
    const p = new URLSearchParams();
    if (n) p.set("niveau", n);
    if (t) p.set("theme", t);
    const s = p.toString();
    return s ? `/ecole?${s}` : "/ecole";
  };

  // Jamais de livres d'horreur dans l'espace École
  const scolaires = sansDoublon(livres.filter((l) => l.univers !== "horreur"), acces);
  const duTheme = (t: (typeof THEMES)[number]) =>
    scolaires.filter((l) => (l.univers && t.univers.includes(l.univers)) || t.mots.test(sansAccentEcole(l.titre)));
  const duNiveau = (liste: typeof scolaires) =>
    niveau ? liste.filter((l) => publicsDe(l).some((p) => niveau.publics.includes(p))) : liste;

  const themesAffiches = theme ? [theme] : THEMES;

  return (
    <>
      <main className="page">
        <header className="bandeau bandeau-ecole">
          <div className="sur-titre">Kwélafé Academy</div>
          <h1>🎒 Espace École</h1>
          <p>Les ressources de La Réunion pour la classe et la maison, rangées par niveau et par thème.</p>
        </header>

        <section className="section">
          <h2>1. Choisis le niveau</h2>
          <div className="ecole-niveaux">
            {NIVEAUX.map((n) => (
              <Link key={n.id} href={url(niveau?.id === n.id ? null : n.id, theme?.id)} className={`ecole-niveau ${niveau?.id === n.id ? "actif" : ""}`} style={{ ["--c" as any]: n.couleur }}>
                <span aria-hidden>{n.emoji}</span>
                <b>{n.nom}</b>
                <small>{n.detail}</small>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>2. Choisis le thème</h2>
          <div className="univers">
            {THEMES.map((t) => {
              const nb = duNiveau(duTheme(t)).length;
              return (
                <Link key={t.id} href={url(niveau?.id, theme?.id === t.id ? null : t.id)} className={`tuile ${theme?.id === t.id ? "tuile-active" : ""}`} style={{ ["--c" as any]: t.couleur, ["--cc" as any]: t.clair }}>
                  <span className="emoji" aria-hidden>{t.emoji}</span>
                  <b>{t.nom}</b>
                  <small>{nb ? `${nb} livre${nb > 1 ? "s" : ""}` : "Bientôt"} · {JEUX_ECOLE.filter((j) => j.themes.includes(t.id)).length} jeux</small>
                </Link>
              );
            })}
          </div>
          {(niveau || theme) && <Link href="/ecole" className="voir-tout" style={{ display: "inline-block", marginTop: 12 }}>✕ Tout afficher</Link>}
        </section>

        {themesAffiches.map((t) => {
          const liste = duNiveau(duTheme(t));
          const jeux = JEUX_ECOLE.filter((j) => j.themes.includes(t.id));
          return (
            <section key={t.id} className="section rayon" style={{ ["--c" as any]: t.couleur, ["--cc" as any]: t.clair }}>
              <div className="entete-rayon">
                <span className="pastille-rayon">{t.emoji}</span>
                <div><h2>{t.nom}</h2><p>{niveau ? niveau.nom : "Tous niveaux"}</p></div>
              </div>
              {liste.length > 0 ? (
                <div className="rangee">
                  {liste.map((l) => (
                    <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} />
                  ))}
                </div>
              ) : (
                <p className="texte-doux">Les livres de ce thème pour ce niveau arrivent bientôt.</p>
              )}
              <div className="ecole-jeux">
                <span className="texte-doux">Pour s'entraîner en jouant :</span>
                {jeux.map((j) => <Link key={j.id} className="pastille" href={`/ecole/jeux/${j.id}`}>{j.emoji} {j.titre}</Link>)}
              </div>
            </section>
          );
        })}

        <section className="section panneau panneau-couleur" style={{ textAlign: "center" }}>
          <h2>Vous êtes enseignant ou établissement ?</h2>
          <p style={{ margin: "8px 0 16px" }}>
            Bientôt : mode projection pour le tableau, fiches à imprimer et accès pour toute la classe.
            Écrivez-nous pour une offre école, médiathèque ou collectivité.
          </p>
          <a className="btn" href="mailto:kwelafe.contact@gmail.com?subject=Offre%20%C3%A9cole%20Kw%C3%A9laf%C3%A9">Nous contacter</a>
        </section>
      </main>
      <NavBas />
    </>
  );
}
