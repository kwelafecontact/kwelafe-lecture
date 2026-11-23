import NavBas from "@/components/NavBas";
import ActiverCode from "@/components/ActiverCode";
import GuideInstallation from "@/components/GuideInstallation";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { tous } from "@/lib/cf";

export const dynamic = "force-dynamic";

const dateFr = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function Compte() {
  const { session, client, abonne } = await contexte();
  const codes = await tous("SELECT * FROM codes_cadeaux WHERE acheteur_id = ? ORDER BY cree_le DESC", session.cid);
  const cadeauActif = client.cadeau_jusqu && new Date(client.cadeau_jusqu) > new Date();

  return (
    <>
      <main className="page">
        <header className="entete">
          <div>
            <div className="sur-titre">{session.email}</div>
            <h1>Mon compte</h1>
          </div>
        </header>

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
