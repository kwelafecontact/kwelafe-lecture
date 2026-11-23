import Link from "next/link";
import NavBas from "@/components/NavBas";
import CarteLivre, { Couverture } from "@/components/CarteLivre";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { UNIVERS, config } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Accueil() {
  const { session, livres, progs, prog, acces, abonne } = await contexte();
  const enCours = progs
    .filter((p) => !p.termine && p.pourcentage > 0)
    .map((p) => ({ p, l: livres.find((l) => l.id === p.livre_id) }))
    .find((x) => x.l && acces.get(x.l.id));
  const mystere = livres.find((l) => l.mystere_du_mois);
  const nouveautes = livres.slice(0, 10);

  return (
    <>
      <main className="page">
        <header className="entete">
          <div>
            <div className="sur-titre">Bonjour{session.prenom ? ` ${session.prenom}` : ""} !</div>
            <h1>Mi lir</h1>
          </div>
        </header>

        {enCours?.l ? (
          <section aria-label="Continuer ma lecture">
            <div className="continuer">
              <Couverture livre={enCours.l} />
              <div className="infos">
                <div className="texte-doux" style={{ fontSize: 14 }}>Continuer ma lecture</div>
                <h3>{enCours.l.titre}</h3>
                <div className="barre"><i style={{ width: `${enCours.p.pourcentage}%` }} /></div>
                <div className="texte-doux" style={{ fontSize: 14, marginTop: 6 }}>Lu à {Math.round(enCours.p.pourcentage)} %</div>
                <Link className="btn" href={`/lire/${enCours.l.slug}`}>Reprendre</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="panneau">
            <h2>Bienvenue dans ta bibliothèque</h2>
            <p className="texte-doux" style={{ margin: "6px 0 16px" }}>
              {abonne
                ? "Ton abonnement est actif : tous les livres marqués « Inclus » t'attendent."
                : "Retrouve ici les livres achetés sur la boutique Kwélafé."}
            </p>
            <Link className="btn" href="/livres">Voir mes livres</Link>
          </section>
        )}

        {mystere && (
          <section className="section">
            <h2>Le livre mystère du mois</h2>
            <div style={{ maxWidth: 170 }}>
              <CarteLivre livre={mystere} acces={acces.get(mystere.id)!} pourcentage={prog.get(mystere.id)?.pourcentage} />
            </div>
          </section>
        )}

        {nouveautes.length > 0 && (
          <section className="section">
            <h2>Nouveautés</h2>
            <div className="rangee">
              {nouveautes.map((l) => (
                <CarteLivre key={l.id} livre={l} acces={acces.get(l.id)!} pourcentage={prog.get(l.id)?.pourcentage} />
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <h2>Les univers</h2>
          <div className="univers">
            {UNIVERS.map((u) => (
              <Link key={u.id} href={`/catalogue?univers=${u.id}`} className="tuile">
                <span className="emoji" aria-hidden>{u.emoji}</span>
                <b>{u.nom}</b>
              </Link>
            ))}
          </div>
        </section>

        {!abonne && (
          <section className="section panneau" style={{ textAlign: "center" }}>
            <h2>Envie de tout lire ?</h2>
            <p className="texte-doux" style={{ margin: "8px 0 16px" }}>Avec l'abonnement Kwélafé, toute la bibliothèque est à toi.</p>
            <a className="btn" href={config.abonnementUrl}>Découvrir l'abonnement</a>
          </section>
        )}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
