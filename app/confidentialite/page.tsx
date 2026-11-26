import PageLegale from "@/components/PageLegale";

export const metadata = { title: "Politique de confidentialité · Kwélafé" };

export default function Confidentialite() {
  return (
    <PageLegale titre="Politique de confidentialité" maj="26 novembre 2026">
      <p>
        Kwélafé Production attache une grande importance à la vie privée de ses lecteurs, et tout particulièrement à celle des enfants.
        Cette page explique simplement quelles données nous utilisons, pourquoi, et quels sont vos droits, conformément au Règlement
        général sur la protection des données (RGPD) et à la loi Informatique et Libertés.
      </p>

      <h2>Responsable du traitement</h2>
      <p>Kwélafé (Kwélafé Production), micro-entreprise de Himen Nalem, 97 rue des Sources, 83600 Fréjus, France. SIRET 850 887 100 00020. Contact : <a href="mailto:kwelafe.contact@gmail.com">kwelafe.contact@gmail.com</a>.</p>

      <h2>Les données que nous utilisons</h2>
      <ul>
        <li><b>Familles et particuliers :</b> adresse e-mail et prénom du compte de la boutique, livres achetés et état de l'abonnement.</li>
        <li><b>Lecture :</b> livres ouverts, page atteinte, temps de lecture, marque-pages et favoris, pour reprendre la lecture là où vous l'avez laissée.</li>
        <li><b>Élèves et lecteurs d'un établissement :</b> aucune adresse e-mail, aucun nom de famille, aucune photo. L'élève entre avec le code de sa classe ; le prénom est facultatif. L'établissement voit seulement le nombre de connexions de chaque classe.</li>
        <li><b>Responsables d'établissement :</b> adresse e-mail professionnelle, nom de l'établissement, classes créées et livres choisis.</li>
        <li><b>Mode visiteur :</b> aucune donnée personnelle.</li>
      </ul>
      <p>L'avatar et les réglages de lecture (taille du texte, marque-page illustré) restent sur votre appareil.</p>

      <h2>Pourquoi nous les utilisons</h2>
      <ul>
        <li>Vous donner accès aux livres et aux jeux inclus dans votre achat ou votre abonnement (exécution du contrat).</li>
        <li>Garder votre progression, vos marque-pages et vos favoris.</li>
        <li>Permettre aux établissements de gérer leurs classes (exécution du contrat avec l'établissement).</li>
        <li>Protéger les livres contre la copie (intérêt légitime).</li>
      </ul>
      <p><b>Nous ne vendons aucune donnée. Il n'y a aucune publicité ni aucun outil de pistage publicitaire dans l'application.</b></p>

      <h2>Cookies</h2>
      <p>
        L'application utilise un seul cookie, indispensable à son fonctionnement : il garde votre session ouverte pendant 30 jours au plus.
        Aucun cookie de mesure d'audience ou de publicité n'est déposé. Aucun consentement n'est donc demandé.
      </p>

      <h2>Combien de temps nous les gardons</h2>
      <ul>
        <li>Progression et marque-pages : tant que le compte est actif, puis supprimés 3 ans après la dernière connexion.</li>
        <li>Données des classes : jusqu'à la fin de l'abonnement de l'établissement, puis supprimées dans un délai de 3 mois, sauf demande contraire de l'établissement.</li>
      </ul>

      <h2>Qui peut y accéder</h2>
      <p>
        Seule l'équipe de Kwélafé Production, et nos prestataires techniques pour l'hébergement (Cloudflare) et la boutique (Shopify),
        qui agissent selon nos instructions et sont liés par des engagements de confidentialité et de protection des données.
      </p>

      <h2>Les enfants</h2>
      <p>
        Pour les moins de 15 ans, le compte famille est créé et géré par un parent. Dans le cadre scolaire, l'établissement est responsable
        de l'utilisation de l'application par ses élèves et Kwélafé Production agit comme sous-traitant, selon le contrat signé avec l'établissement.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous pouvez à tout moment demander à consulter, corriger ou supprimer vos données, ou vous opposer à leur utilisation, en écrivant à
        <a href="mailto:kwelafe.contact@gmail.com"> kwelafe.contact@gmail.com</a>. Nous répondons dans un délai d'un mois.
        Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).
      </p>
    </PageLegale>
  );
}
