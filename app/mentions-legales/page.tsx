import PageLegale from "@/components/PageLegale";

export const metadata = { title: "Mentions légales · Kwélafé" };

// Les éléments entre crochets sont à compléter par l'éditeur.
export default function MentionsLegales() {
  return (
    <PageLegale titre="Mentions légales" maj="26 novembre 2026">
      <h2>Éditeur de l'application</h2>
      <p>
        L'application Kwélafé Lecture est éditée par <b>Kwélafé Production</b>, [forme juridique, par exemple entreprise individuelle ou SAS],
        immatriculée sous le numéro SIRET [à compléter], dont le siège est situé [adresse complète], La Réunion.
      </p>
      <p>Directeur de la publication : [prénom et nom].<br />Contact : <a href="mailto:contact@kwelafeproduction.com">contact@kwelafeproduction.com</a></p>
      <h2>Hébergement</h2>
      <p>
        L'application est hébergée par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis (cloudflare.com).
        Les données de l'application sont stockées dans la région Europe de l'Ouest.
      </p>
      <p>La boutique et la gestion des abonnements sont assurées par Shopify International Limited (Irlande), shopify.com.</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        L'ensemble des livres, textes, illustrations, jeux, logos et éléments graphiques de l'application sont la propriété de Kwélafé Production
        ou de leurs auteurs, et sont protégés par le Code de la propriété intellectuelle. Toute reproduction, copie, capture, diffusion ou
        extraction, totale ou partielle, sans autorisation écrite est interdite.
      </p>
      <h2>Signaler un problème</h2>
      <p>Pour toute question ou réclamation : <a href="mailto:contact@kwelafeproduction.com">contact@kwelafeproduction.com</a>.</p>
    </PageLegale>
  );
}
