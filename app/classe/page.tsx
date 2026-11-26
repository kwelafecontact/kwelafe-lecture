import BoutonFait from "@/components/BoutonFait";
import { tous } from "@/lib/cf";
import { livresPublies } from "@/lib/donnees";
import { TYPES_DEVOIR, lienDevoir, dateDevoir, type Devoir } from "@/lib/devoirs";
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
  // Devoirs des 14 derniers jours et à venir
  const depuis = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const devoirs = await tous<Devoir>("SELECT * FROM devoirs WHERE groupe_id = ? AND echeance >= ? ORDER BY echeance", groupe.id, depuis).catch(() => [] as Devoir[]);
  const faits = new Set((await tous<{ devoir_id: string }>("SELECT devoir_id FROM devoirs_faits WHERE eleve = ?", session.cid).catch(() => [])).map((x) => x.devoir_id));
  const slugs: Record<string, string> = Object.fromEntries((await livresPublies()).map((l) => [l.id, l.slug]));
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

        <section className="section a-faire">
          <h2>📌 À faire</h2>
          {devoirs.length === 0 ? <p className="texte-doux">Rien à faire pour le moment. Profites-en pour lire un livre de la sélection !</p> : (
            <div className="liste-devoirs">
              {devoirs.map((d) => {
                const lien = lienDevoir(d, slugs);
                const jours = Math.round((new Date(d.echeance + "T12:00:00").getTime() - Date.now()) / 86400000);
                return (
                  <div key={d.id} className={`carte-devoir ${faits.has(d.id) ? "fini" : ""} ${jours < 0 ? "retard" : jours <= 1 ? "bientot" : ""}`}>
                    <span className="ico-devoir">{TYPES_DEVOIR[d.type]?.emoji || "📌"}</span>
                    <div className="infos-devoir">
                      <b>{d.titre}</b>
                      <small>📅 Pour {jours === 0 ? "aujourd'hui" : jours === 1 ? "demain" : `le ${dateDevoir(d.echeance)}`}{jours < 0 ? " (date passée)" : ""}</small>
                      {d.consigne && <p>{d.consigne}</p>}
                    </div>
                    <div className="actions-devoir">
                      {lien && <a className="btn" href={lien}>{TYPES_DEVOIR[d.type]?.verbe || "Ouvrir"}</a>}
                      <BoutonFait devoir={d.id} initial={faits.has(d.id)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

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
