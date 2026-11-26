import { JEUX_ECOLE } from "@/lib/ecole-jeux";
import Link from "next/link";
import { redirect } from "next/navigation";
import NavBas from "@/components/NavBas";
import Avatar from "@/components/Avatar";
import CarteLivre from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { groupeDeSession, MOTS, selectionDe } from "@/lib/etablissements";
import { NIVEAUX, THEMES } from "@/lib/ecole";
import { leger } from "@/lib/leger";
import { CATALOGUE } from "@/lib/jeux/catalogue";
import { jeuGratuit } from "@/lib/jeux/gratuits";
import PastilleJeu from "@/components/PastilleJeu";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ma classe · Kwélafé" };

// Espace d'un élève ou d'un lecteur : aux couleurs de son établissement, avec la sélection de son enseignant.
export default async function Classe() {
  const { session, livres, acces, prog, favoris, abonne } = await contexte();
  const info = await groupeDeSession(session);
  if (!info) redirect("/etablissement");
  const { groupe, etab } = info;
  const mots = MOTS[etab.type];
  const niveau = NIVEAUX.find((n) => n.id === groupe.niveau);
  const ids = selectionDe(groupe);
  const selection = ids.map((id) => livres.find((l) => l.id === id)).filter(Boolean) as typeof livres;
  const jeux = JEUX_ECOLE;
  return (
    <>
      <main className="page">
        <div className="barre-retour-classe">
          <Link href="/portails" className="bouton-rond" aria-label="Retour à l'accueil">←</Link>
          <a href="/auth/logout" className="lien">Quitter l'espace élève</a>
        </div>
        <header className="bandeau-classe" style={{ ["--c" as any]: etab.couleur }}>
          {etab.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={etab.logo} alt="" className="logo-etab" />
          ) : (
            <span className="logo-etab vide" aria-hidden>{mots.emoji}</span>
          )}
          <div>
            <div className="sur-titre">{etab.nom}{etab.ville ? ` · ${etab.ville}` : ""}</div>
            <h1>{groupe.nom}</h1>
            <p className="ligne-avatar"><Avatar taille={40} cle="kw-avatar-eleve" />{session.prenom ? `Bonjour ${session.prenom} ! ` : "Bonjour ! "}{niveau ? niveau.nom : ""}{groupe.responsable ? ` · avec ${groupe.responsable}` : ""}</p>
          </div>
        </header>

        {(groupe.message || etab.message) && (
          <section className="mot-classe" style={{ ["--c" as any]: etab.couleur }}>
            <b>📌 Le mot {etab.type === "ecole" ? "de la classe" : "de l'équipe"}</b>
            <p>{groupe.message || etab.message}</p>
          </section>
        )}

        <section className="section">
          <h2>⭐ La sélection {etab.type === "ecole" ? "de la classe" : "du moment"}</h2>
          {selection.length > 0 ? (
            <div className="rangee">
              {selection.map((l) => (
                <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} />
              ))}
            </div>
          ) : (
            <p className="texte-doux">Ton {mots.responsable} n'a pas encore choisi de livres. En attendant, explore l'espace École !</p>
          )}
        </section>

        <section className="section">
          <h2>📚 Par thème{niveau ? ` · ${niveau.nom}` : ""}</h2>
          <div className="univers">
            {THEMES.map((t) => (
              <Link key={t.id} href={`/ecole?theme=${t.id}${niveau ? `&niveau=${niveau.id}` : ""}`} className="tuile" style={{ ["--c" as any]: t.couleur, ["--cc" as any]: t.clair }}>
                <span className="emoji" aria-hidden>{t.emoji}</span>
                <b>{t.nom}</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>🎮 Apprendre en jouant</h2>
          <div className="ecole-jeux">
            {jeux.map((j) => <Link key={j.id} className="pastille" href={`/ecole/jeux/${j.id}`}>{j.emoji} {j.titre}</Link>)}
          </div>
        </section>
        <p className="texte-doux" style={{ textAlign: "center", fontSize: 13, marginTop: 24 }}>Accès offert par {etab.nom} · Kwélafé Academy</p>
      </main>
      <NavBas />
    </>
  );
}
