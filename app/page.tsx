import Link from "next/link";
import NavBas from "@/components/NavBas";
import CarteLivre, { Couverture } from "@/components/CarteLivre";
import LienSite from "@/components/LienSite";
import BandeauVisiteur from "@/components/BandeauVisiteur";
import VersPortails from "@/components/VersPortails";
import { contexte } from "@/lib/contexte";
import { statistiques } from "@/lib/stats";
import { UNIVERS, config } from "@/lib/config";
import { FORMATS, formatDe, sansDoublon } from "@/lib/formats";
import { leger } from "@/lib/leger";
import { tous, urlCouverture } from "@/lib/cf";

export const dynamic = "force-dynamic";

function salut() {
  const h = Number(new Date().toLocaleString("fr-FR", { hour: "numeric", hour12: false, timeZone: "Indian/Reunion" }));
  return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
}

export default async function Accueil() {
  const { session, livres, progs, prog, acces, favoris, abonne } = await contexte();
  const stats = await statistiques(session.cid);
  const enCours = progs
    .filter((p) => !p.termine && p.pourcentage > 0)
    .map((p) => ({ p, l: livres.find((l) => l.id === p.livre_id) }))
    .filter((x) => x.l && acces.get(x.l.id))
    .slice(0, 6) as { p: (typeof progs)[number]; l: (typeof livres)[number] }[];
  const premier = enCours[0];
  const mystere = livres.find((l) => l.mystere_du_mois);
  const mesFavoris = livres.filter((l) => favoris.has(l.id));
  const lus = progs.filter((p) => p.termine).length;
  const objectif = 15;
  const visibles = sansDoublon(livres, acces);
  const une = mystere ?? [...visibles].sort((a, b) => b.cree_le.localeCompare(a.cree_le))[0];
  const nouveautes = [...visibles].sort((a, b) => b.cree_le.localeCompare(a.cree_le)).slice(0, 12);
  // Top 10 : les livres les plus ouverts par les lecteurs, complétés par les nouveautés
  const populaires = await tous<{ livre_id: string; n: number }>("SELECT livre_id, COUNT(*) AS n FROM progression GROUP BY livre_id ORDER BY n DESC LIMIT 30").catch(() => []);
  const top: typeof livres = [];
  for (const id of [...populaires.map((p) => p.livre_id), ...nouveautes.map((l) => l.id), ...visibles.map((l) => l.id)]) {
    const l = visibles.find((x) => x.id === id);
    if (l && !top.includes(l)) top.push(l);
    if (top.length === 10) break;
  }
  const fondUne = une ? urlCouverture(une.couverture) : null;

  return (
    <>
      <VersPortails />
      <main className="page">
        <div className="entete-accueil">
          <Link href="/portails" aria-label="Choisir un espace">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-kwelafe.webp" alt="Kwélafé Production" />
          </Link>
          <Link href="/portails" className="changer-espace">▦ Mes espaces</Link>
        </div>

        <header className="hero-accueil">
          <div className="hero-texte">
            <div className="sur-titre">{salut()}{session.prenom ? ` ${session.prenom}` : ""} !</div>
            <h1>Mi lir</h1>
            <p>Préserver aujourd'hui ce que nous voulons transmettre demain.</p>
          </div>
          <div className="hero-stats">
            <div className="stat-bulle feu"><b>{stats.serie}</b><span>🔥 jour{stats.serie > 1 ? "s" : ""} de suite</span></div>
            <div className="stat-bulle"><b>{stats.minutesAujourdhui}<small>/{objectif}</small></b><span>⏱ min aujourd'hui</span>
              <i className="anneau" style={{ ["--p" as any]: `${Math.min(100, (stats.minutesAujourdhui / objectif) * 100)}%` }} /></div>
            <div className="stat-bulle"><b>{lus}</b><span>📚 livre{lus > 1 ? "s" : ""} fini{lus > 1 ? "s" : ""}</span></div>
          </div>
        </header>

        {session.visiteur && <BandeauVisiteur />}

        <nav className="raccourcis" aria-label="Accès rapides">
          <Link href="/livres" style={{ ["--c" as any]: "#1f6fb2" }}><span aria-hidden>📚</span>Mes livres</Link>
          <Link href="/catalogue" style={{ ["--c" as any]: "#2e9d4f" }}><span aria-hidden>🔎</span>Catalogue</Link>
          <Link href="/jeux" style={{ ["--c" as any]: "#e8a200" }}><span aria-hidden>🎮</span>Jeux</Link>
          <Link href="/compte" style={{ ["--c" as any]: "#d6332a" }}><span aria-hidden>⭐</span>Mes progrès</Link>
        </nav>

        {premier ? (
          <section aria-label="Continuer ma lecture">
            <div className="continuer">
              <Couverture livre={premier.l} />
              <div className="infos">
                <div className="texte-doux" style={{ fontSize: 14 }}>Continuer ma lecture</div>
                <h3>{premier.l.titre}</h3>
                <div className="barre"><i style={{ width: `${premier.p.pourcentage}%` }} /></div>
                <div className="texte-doux" style={{ fontSize: 14, marginTop: 6 }}>Lu à {Math.round(premier.p.pourcentage)} %</div>
                <Link className="btn" href={`/lire/${premier.l.slug}`}>▶ Reprendre</Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="panneau panneau-couleur">
            <h2>Bienvenue dans ta bibliothèque</h2>
            <p style={{ margin: "6px 0 16px" }}>
              {abonne ? "Ton abonnement est actif : tous les livres marqués « Inclus » t'attendent." : "Retrouve ici les livres achetés sur la boutique Kwélafé."}
            </p>
            <Link className="btn" href="/livres">Voir mes livres</Link>
          </section>
        )}

        {une && (
          <section className="une" aria-label="À la une">
            {fondUne && <div className="une-fond" style={{ backgroundImage: `url(${fondUne})` }} aria-hidden />}
            <Couverture livre={une} />
            <div>
              <div className="sur-titre">{mystere ? "Le livre mystère du mois" : "À la une"}</div>
              <h2>{une.titre}</h2>
              {une.resume && <p>{une.resume}</p>}
              <div className="actions-une">
                {acces.get(une.id) && <Link className="btn clair" href={`/lire/${une.slug}`}>▶ Lire</Link>}
                <Link className="btn transp" href={`/livre/${une.slug}`}>ⓘ Plus d'infos</Link>
              </div>
            </div>
          </section>
        )}

        {enCours.length > 1 && (
          <section className="section">
            <h2>Mes lectures en cours</h2>
            <div className="rangee">
              {enCours.slice(1).map(({ l, p }) => (
                <CarteLivre key={l.id} livre={leger(l)} acces pourcentage={p.pourcentage} favori={favoris.has(l.id)} />
              ))}
            </div>
          </section>
        )}

        {mesFavoris.length > 0 && (
          <section className="section">
            <h2>❤ Mes favoris</h2>
            <div className="rangee">
              {mesFavoris.map((l) => (
                <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori />
              ))}
            </div>
          </section>
        )}

        {top.length >= 3 && (
          <section className="section">
            <h2>🏆 Le top 10 Kwélafé</h2>
            <div className="top10">
              {top.map((l, k) => (
                <Link key={l.id} href={`/livre/${l.slug}`} aria-label={`Numéro ${k + 1} : ${l.titre}`}>
                  <span className="rang" aria-hidden>{k + 1}</span>
                  <Couverture livre={l} verrouille={!acces.get(l.id)} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {nouveautes.length > 0 && (
          <section className="section">
            <h2>✨ Nouveautés</h2>
            <div className="rangee">
              {nouveautes.map((l) => (
                <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} />
              ))}
            </div>
          </section>
        )}

        {FORMATS.map((f) => {
          const liste = sansDoublon(livres.filter((l) => formatDe(l) === f.id), acces).slice(0, 12);
          if (!liste.length) return null;
          return (
            <section key={f.id} className="section rayon" style={{ ["--c" as any]: f.couleur, ["--cc" as any]: f.clair }}>
              <div className="entete-rayon">
                <span className="pastille-rayon">{f.emoji}</span>
                <div><h2>{f.nom}</h2><p>{f.texte}</p></div>
                <Link href={`/catalogue?format=${f.id}`} className="voir-tout">Voir tout ›</Link>
              </div>
              <div className="rangee">
                {liste.map((l) => (
                  <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} montrerFormat={false} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="section">
          <h2>Les univers</h2>
          <div className="univers">
            {UNIVERS.map((u) => (
              <Link key={u.id} href={`/catalogue?univers=${u.id}`} className="tuile" style={{ ["--c" as any]: u.couleur, ["--cc" as any]: u.clair }}>
                <span className="emoji" aria-hidden>{u.emoji}</span>
                <b>{u.nom}</b>
                <small>{livres.filter((l) => l.univers === u.id).length ? `${sansDoublon(livres.filter((l) => l.univers === u.id)).length} livres` : "Bientôt"}</small>
              </Link>
            ))}
          </div>
        </section>

        {!abonne && (
          <section className="section panneau panneau-couleur" style={{ textAlign: "center" }}>
            <h2>Envie de tout lire ?</h2>
            <p style={{ margin: "8px 0 16px" }}>Avec l'abonnement Kwélafé, toute la bibliothèque est à toi.</p>
            <a className="btn" href={config.abonnementUrl}>Découvrir l'abonnement</a>
          </section>
        )}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
