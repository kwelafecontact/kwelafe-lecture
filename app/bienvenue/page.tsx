import { redirect } from "next/navigation";
import Oiseau from "@/components/Oiseau";
import { lireSession } from "@/lib/session";
import { config } from "@/lib/config";

export default async function Bienvenue({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await lireSession()) redirect("/");
  const { erreur } = await searchParams;
  return (
    <main className="bienvenue">
      <div className="logo"><Oiseau taille={96} /></div>
      <h1>Bonjour !</h1>
      <p className="devise">« Préserver aujourd'hui ce que nous voulons transmettre demain. »</p>
      <div className="actions">
        <a className="btn large" href="/auth/login">Me connecter</a>
        <p className="texte-doux" style={{ fontSize: 15, margin: "4px 0 0" }}>
          Utilise la même adresse e-mail que sur la boutique Kwélafé. Tu recevras un code pour te connecter.
        </p>
        <a className="btn secondaire large" href={config.abonnementUrl}>Découvrir l'abonnement</a>
      </div>
      {erreur && (
        <p className="message erreur" style={{ maxWidth: 360 }}>
          La connexion n'a pas abouti. Ce n'est pas grave, tu peux réessayer dans un instant.
        </p>
      )}
      {config.demo && <p className="texte-doux" style={{ marginTop: 24, fontSize: 14 }}>Mode démonstration activé</p>}
    </main>
  );
}
