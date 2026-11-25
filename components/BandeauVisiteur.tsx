// Rappel affiché en mode visiteur : ce qui est ouvert, et comment tout débloquer.
import { config } from "@/lib/config";

export default function BandeauVisiteur() {
  return (
    <section className="bandeau-visiteur" aria-label="Mode visiteur">
      <div>
        <b>Mode visiteur</b>
        <span>Les livres et jeux marqués « Gratuit » sont ouverts. Connecte-toi ou abonne-toi pour tout lire.</span>
      </div>
      <div className="actions-visiteur">
        <a className="btn" href="/auth/login">Me connecter</a>
        <a className="btn secondaire" href={config.abonnementUrl}>S'abonner</a>
      </div>
    </section>
  );
}
