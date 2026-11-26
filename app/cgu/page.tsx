import PageLegale from "@/components/PageLegale";

export const metadata = { title: "Conditions d'utilisation · Kwélafé" };

export default function CGU() {
  return (
    <PageLegale titre="Conditions générales d'utilisation" maj="26 novembre 2026">
      <h2>1. L'application</h2>
      <p>
        Kwélafé Lecture est une bibliothèque numérique consacrée à La Réunion : livres, jeux et ressources pédagogiques, à lire en ligne
        sur téléphone, tablette ou ordinateur. Elle est éditée par Kwélafé Production.
      </p>
      <h2>2. Accès</h2>
      <ul>
        <li><b>Mode visiteur :</b> gratuit, quelques livres et jeux de découverte.</li>
        <li><b>Achat d'un livre :</b> le livre acheté sur la boutique reste accessible dans l'application.</li>
        <li><b>Abonnement :</b> accès à tous les livres et jeux marqués « Inclus » pendant la durée de l'abonnement.</li>
        <li><b>Établissements :</b> accès pour les classes ou groupes selon le contrat signé avec l'école, la médiathèque ou la collectivité.</li>
      </ul>
      <h2>3. Abonnement et résiliation</h2>
      <p>
        L'abonnement est souscrit et payé sur la boutique kwelafeproduction.com. Il se renouvelle automatiquement à chaque échéance.
        Vous pouvez le résilier à tout moment depuis votre compte sur la boutique, en quelques clics ; l'accès reste ouvert jusqu'à la fin
        de la période déjà payée. Vous pouvez aussi utiliser la fonctionnalité « Résilier votre contrat » accessible sur le site, ou écrire à kwelafe.contact@gmail.com.
      </p>
      <h2>4. Droit de rétractation</h2>
      <p>
        Les livres numériques sont accessibles immédiatement. En commençant la lecture, vous acceptez que l'accès soit fourni tout de suite
        et vous renoncez à votre droit de rétractation de 14 jours pour ce contenu, conformément à l'article L221-28 du Code de la consommation.
      </p>
      <h2>5. Usage personnel et protection des livres</h2>
      <p>
        Les livres et jeux sont réservés à un usage personnel, familial ou, pour les établissements, pédagogique dans le cadre de leur contrat.
        Il est interdit de copier, capturer, enregistrer, imprimer, partager ou revendre tout ou partie des contenus, et de transmettre ses
        identifiants ou un code de classe en dehors de la classe concernée. En cas d'abus, l'accès peut être suspendu.
      </p>
      <h2>6. Disponibilité</h2>
      <p>
        Nous faisons de notre mieux pour que l'application soit disponible à tout moment, mais des interruptions peuvent arriver pour
        maintenance ou en cas de problème technique. Le catalogue peut évoluer.
      </p>
      <h2>7. Données personnelles</h2>
      <p>Voir notre <a href="/confidentialite">politique de confidentialité</a>.</p>
      <h2>8. Droit applicable</h2>
      <p>
        Ces conditions sont soumises au droit français. En cas de difficulté, contactez-nous d'abord à kwelafe.contact@gmail.com ;
        vous pouvez aussi recourir gratuitement au médiateur de la consommation désigné dans les conditions générales de vente de la boutique.
        Les conditions générales de vente de la boutique (achats et abonnements) s'appliquent en complément des présentes conditions.
      </p>
    </PageLegale>
  );
}
