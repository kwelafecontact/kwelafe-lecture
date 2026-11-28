import Link from "next/link";
import MotDuMoisAdmin from "@/components/MotDuMoisAdmin";
import VideosAdmin from "@/components/VideosAdmin";
import { listeVideos } from "@/lib/videos";
import { tous as tousSql } from "@/lib/cf";
import { redirect } from "next/navigation";
import NavBas from "@/components/NavBas";
import ImportLivre from "@/components/ImportLivre";
import ImportLot from "@/components/ImportLot";
import CodesTest from "@/components/CodesTest";
import EtablissementsAdmin from "@/components/EtablissementsAdmin";
import RessourcesAdmin from "@/components/RessourcesAdmin";
import { formatDe } from "@/lib/formats";
import BasculeAdmin from "@/components/BasculeAdmin";
import ListeLivresAdmin from "@/components/ListeLivresAdmin";
import { sessionAdmin } from "@/lib/admin";
import { tous } from "@/lib/cf";
import { UNIVERS } from "@/lib/config";
import { tousLesLivres } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await sessionAdmin())) redirect("/");
  const livres = await tousLesLivres();
  const codes = await tous("SELECT * FROM codes_cadeaux ORDER BY cree_le DESC LIMIT 50");
  const ressources = await tous("SELECT id, titre, theme, niveau, type, format FROM ressources ORDER BY cree_le DESC").catch(() => []);
  const etabs = await tous("SELECT e.*, (SELECT COUNT(*) FROM groupes g WHERE g.etab_id = e.id) AS nb FROM etablissements e ORDER BY e.cree_le DESC").catch(() => []);
  const codesTest = await tous("SELECT empreinte, nom, fin, revoque, dernier_usage, apercu FROM codes_test ORDER BY cree_le DESC LIMIT 100").catch(() => []);

  const videos = await listeVideos();
  const motDuMois = (await tousSql<{ valeur: string }>("SELECT valeur FROM reglages WHERE cle = 'mot_du_mois'").catch(() => []))[0]?.valeur || "";
  return (
    <>
      <main className="page">
        <header className="entete"><h1>Espace éditeur</h1></header>

        <nav className="sommaire-admin" aria-label="Sommaire">
          <a href="#mes-livres">📚 Mes livres</a><a href="#importer">📥 Importer</a><a href="#etabs">🏫 Établissements</a><a href="#ressources">🗂️ Ressources</a><a href="#codes">🔑 Codes</a>
        </nav>

        <section className="panneau" id="mot-du-mois">
          <h2>💬 Le mot du mois (affiché en haut de l'accueil)</h2>
          <MotDuMoisAdmin valeur={motDuMois} />
        </section>

        <section className="panneau" id="videos">
          <h2>🎬 Découvrir La Réunion : les vidéos</h2>
          <VideosAdmin videos={videos} />
        </section>

        <section className="panneau" id="mes-livres">
          <h2>Mes livres ({livres.filter((l) => l.publie).length} en ligne)</h2>
          <p className="texte-doux" style={{ marginTop: 0 }}>Choisis un format. Clique sur un titre pour modifier le titre, le résumé, l&apos;univers ou la fiche boutique.</p>
          <ListeLivresAdmin livres={livres.map((l) => ({ id: l.id, slug: l.slug, titre: l.titre, resume: l.resume, univers: l.univers, shopify_product_id: l.shopify_product_id, url_boutique: l.url_boutique, publie: !!l.publie, inclus_abonnement: !!l.inclus_abonnement, mystere_du_mois: !!l.mystere_du_mois, gratuit: !!l.gratuit, format: formatDe(l) === "pdf" ? "pdf" : formatDe(l) === "interactif" ? "interactif" : l.type === "epub_interactif" ? "anime" : "epub", cree_le: l.cree_le }))} />
        </section>

        <details className="panneau replie" id="importer">
          <summary><h2>📥 Importer toute la bibliothèque</h2></summary>
          <ImportLot dejaImportes={livres.map((l) => `${formatDe(l)}|${l.titre}`)} produitsImportes={livres.map((l) => `${formatDe(l)}|${l.shopify_product_id || ""}`)} />
        </details>

        <details className="panneau replie">
          <summary><h2>➕ Ajouter un seul livre</h2></summary>
          <ImportLivre />
        </details>


        <section className="panneau" id="etabs">
          <h2>Écoles, médiathèques et collectivités</h2>
          <EtablissementsAdmin etabs={etabs as any} />
        </section>

        <section className="panneau" id="ressources">
          <h2>📚 Ressources pédagogiques (fiches et cours pour les enseignants)</h2>
          <RessourcesAdmin liste={ressources as any} />
        </section>

        <section className="panneau" id="codes">
          <h2>Accès test pour l'équipe</h2>
          <CodesTest codes={codesTest as any} />
        </section>

        <section className="panneau">
          <h2>Codes cadeaux</h2>
          <table className="tableau">
            <tbody>
              {(codes || []).map((c: any) => (
                <tr key={c.code}>
                  <td><b>{c.code}</b></td>
                  <td>{c.duree_mois} mois</td>
                  <td className="texte-doux">{c.acheteur_email || "—"}</td>
                  <td>{c.utilise_le ? "Activé" : "Libre"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!codes?.length && <p className="texte-doux">Les codes apparaîtront ici après chaque achat d'un cadeau.</p>}
        </section>
      </main>
      <NavBas />
    </>
  );
}
