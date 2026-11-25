import Link from "next/link";
import { redirect } from "next/navigation";
import NavBas from "@/components/NavBas";
import ImportLivre from "@/components/ImportLivre";
import ImportLot from "@/components/ImportLot";
import CodesTest from "@/components/CodesTest";
import { formatDe } from "@/lib/formats";
import BasculeAdmin from "@/components/BasculeAdmin";
import { sessionAdmin } from "@/lib/admin";
import { tous } from "@/lib/cf";
import { UNIVERS } from "@/lib/config";
import { tousLesLivres } from "@/lib/donnees";

export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!(await sessionAdmin())) redirect("/");
  const livres = await tousLesLivres();
  const codes = await tous("SELECT * FROM codes_cadeaux ORDER BY cree_le DESC LIMIT 50");
  const codesTest = await tous("SELECT empreinte, nom, fin, revoque, dernier_usage, apercu FROM codes_test ORDER BY cree_le DESC LIMIT 100").catch(() => []);

  return (
    <>
      <main className="page">
        <header className="entete"><h1>Espace éditeur</h1></header>

        <section className="panneau">
          <h2>📚 Importer toute la bibliothèque</h2>
          <ImportLot dejaImportes={livres.map((l) => `${formatDe(l)}|${l.titre}`)} produitsImportes={livres.map((l) => `${formatDe(l)}|${l.shopify_product_id || ""}`)} />
        </section>

        <section className="panneau">
          <h2>Ajouter un livre</h2>
          <ImportLivre />
        </section>

        <section className="panneau">
          <h2>Mes livres ({livres.length})</h2>
          <table className="tableau">
            <tbody>
              {livres.map((l) => (
                <tr key={l.id}>
                  <td>
                    <b>{l.titre}</b>
                    <div className="texte-doux" style={{ fontSize: 13 }}>
                      {UNIVERS.find((u) => u.id === l.univers)?.nom} · {formatDe(l) === "pdf" ? "PDF" : formatDe(l) === "interactif" ? "Livre interactif" : l.type === "epub_interactif" ? "EPUB animé" : "EPUB"}
                      {!l.shopify_product_id && " · pas de produit Shopify lié"}
                    </div>
                  </td>
                  <td style={{ minWidth: 190 }}>
                    <BasculeAdmin id={l.id} champ="publie" valeur={l.publie} libelle="Publié" />
                    <BasculeAdmin id={l.id} champ="inclus_abonnement" valeur={l.inclus_abonnement} libelle="Inclus abonnement" />
                    <BasculeAdmin id={l.id} champ="mystere_du_mois" valeur={l.mystere_du_mois} libelle="Mystère du mois" />
                    <BasculeAdmin id={l.id} champ="gratuit" valeur={l.gratuit} libelle="Gratuit (découverte)" />
                  </td>
                  <td><Link className="lien" href={`/lire/${l.slug}`}>Prévisualiser</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!livres.length && <p className="texte-doux">Aucun livre pour l'instant.</p>}
        </section>

        <section className="panneau">
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
