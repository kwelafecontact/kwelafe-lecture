import Link from "next/link";
import { groupeDeSession } from "@/lib/etablissements";
import Avatar from "@/components/Avatar";
import NavBas from "@/components/NavBas";
import ActiverCode from "@/components/ActiverCode";
import GuideInstallation from "@/components/GuideInstallation";
import LienSite from "@/components/LienSite";
import BandeauVisiteur from "@/components/BandeauVisiteur";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { tous } from "@/lib/cf";
import { statistiques } from "@/lib/stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon compte · Kwélafé" };

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function Compte() {
  const { session, client, abonne, progs, favoris } = await contexte();
  if (session.eleve) {
    const info = await groupeDeSession(session);
    return (
      <>
        <main className="page">
          <header className="entete" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar taille={64} cle="kw-avatar-eleve" />
            <div><div className="sur-titre">Espace élève</div><h1>{session.prenom || "Moi"}</h1></div>
          </header>
          <section className="panneau">
            <h2>🎒 Ma classe</h2>
            <p>{info ? <><b>{info.groupe.nom}</b> · {info.etab.nom}</> : "Classe introuvable"}</p>
            <Link className="btn large" href="/classe">Aller dans ma classe</Link>
          </section>
          <section className="panneau">
            <h2>📖 Mes lectures</h2>
            <p>{progs.filter((p) => p.termine).length} livre(s) terminé(s) · {progs.filter((p) => !p.termine && p.pourcentage > 0).length} en cours</p>
          </section>
          <section className="panneau">
            <h2>🚪 Quitter l'espace élève</h2>
            <p className="texte-doux">Pour rendre l'appareil ou changer de classe.</p>
            <a className="btn secondaire large" href="/auth/logout">Quitter l'espace élève</a>
          </section>
        </main>
        <NavBas />
      </>
    );
  }
  const stats = await statistiques(session.cid);
  const max = Math.max(15, ...stats.derniers.map((d) => d.minutes));
  const heures = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`);
  const codes = await tous("SELECT * FROM codes_cadeaux WHERE acheteur_id = ? ORDER BY cree_le DESC", session.cid);
  const cadeauActif = client.cadeau_jusqu && new Date(client.cadeau_jusqu) > new Date();

  return (
    <>
      <main className="page">
        <header className="entete" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar taille={64} />
          <div>
            <div className="sur-titre">{session.visiteur ? "Mode visiteur" : session.eleve ? "Espace élève" : session.testeur ? "Accès équipe" : session.email}</div>
            <h1>Mon compte</h1>
          </div>
        </header>

        {session.visiteur && <BandeauVisiteur />}
        {!session.visiteur && <a className="btn secondaire large" href="/mes-livres-hors-ligne" style={{ marginBottom: 18 }}>⬇️ Mes livres hors connexion</a>}

        <section className="panneau panneau-stats">
          <h2>📊 Mes lectures</h2>
          <div className="stats-grille">
            <div><b>🔥 {stats.serie}</b><span>jour{stats.serie > 1 ? "s" : ""} de suite</span></div>
            <div><b>{heures(stats.minutesSemaine)}</b><span>cette semaine</span></div>
            <div><b>{heures(stats.minutesTotal)}</b><span>au total</span></div>
            <div><b>{progs.filter((p) => p.termine).length}</b><span>livres terminés</span></div>
            <div><b>{progs.filter((p) => !p.termine && p.pourcentage > 0).length}</b><span>en cours</span></div>
            <div><b>❤ {favoris.size}</b><span>favoris</span></div>
          </div>
          <div className="graphe-jours" aria-label="Minutes de lecture des 7 derniers jours">
            {stats.derniers.map((d, k) => (
              <div key={k} className="colonne-jour">
                <i style={{ height: `${Math.max(4, (d.minutes / max) * 100)}%` }} title={`${d.minutes} min`} />
                <span>{d.jour}</span>
              </div>
            ))}
          </div>
          <p className="texte-doux" style={{ fontSize: 14, marginTop: 10 }}>Objectif conseillé : 15 minutes par jour. Lis un peu chaque jour pour faire grandir ta série 🔥</p>
        </section>

        <section className="panneau">
          <h2>Mon abonnement</h2>
          {abonne ? (
            <>
              <p className="statut ok">✓ Actif</p>
              {cadeauActif && !client.abonne && (
                <p style={{ marginTop: 10 }}>Abonnement cadeau valable jusqu'au <b>{dateFr(client.cadeau_jusqu!)}</b>.</p>
              )}
              {client.abonne && (
                <p style={{ marginTop: 14 }}>
                  <a className="btn secondaire" href={`${config.shopUrl}/account`}>Gérer mon abonnement</a>
                </p>
              )}
            </>
          ) : (
            <>
              <p className="statut non">Pas d'abonnement en cours</p>
              <p className="texte-doux" style={{ margin: "10px 0 16px" }}>Avec l'abonnement, tous les livres marqués « Inclus » sont à toi.</p>
              <a className="btn" href={config.abonnementUrl}>Découvrir l'abonnement</a>
            </>
          )}
        </section>

        <section className="panneau">
          <h2>🎁 J'ai reçu un cadeau</h2>
          <p className="texte-doux">Saisis le code reçu pour activer ton accès à la bibliothèque.</p>
          <ActiverCode />
        </section>

        {codes && codes.length > 0 && (
          <section className="panneau">
            <h2>Les cadeaux que j'ai offerts</h2>
            <p className="texte-doux">Donne ce code à la personne qui reçoit le cadeau.</p>
            <table className="tableau" style={{ marginTop: 10 }}>
              <tbody>
                {codes.map((c: any) => (
                  <tr key={c.code}>
                    <td><b style={{ letterSpacing: 1 }}>{c.code}</b></td>
                    <td>{c.duree_mois} mois</td>
                    <td>{c.utilise_le ? <span className="texte-doux">Activé</span> : <span className="badge inclus">À offrir</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="panneau">
          <h2>📲 Installer l'application</h2>
          <GuideInstallation />
        </section>

        <section className="panneau">
          <h2>Besoin d'aide ?</h2>
          <p className="texte-doux" style={{ marginBottom: 14 }}>Écris-nous, on te répond avec plaisir.</p>
          <a className="btn secondaire" href="mailto:kwelafe.contact@gmail.com">Contacter Kwélafé</a>
        </section>

        {session.admin && (
          <section className="panneau">
            <h2>Espace éditeur</h2>
            <a className="btn sauge" href="/admin">Gérer les livres</a>
          </section>
        )}

        <p style={{ textAlign: "center", marginTop: 26 }}>
          <a className="lien" href="/auth/logout">Me déconnecter</a>
        </p>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
