import { redirect } from "next/navigation";
import Oiseau from "@/components/Oiseau";
import { lireSession } from "@/lib/session";
import { config } from "@/lib/config";

export default async function Bienvenue({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (await lireSession()) redirect("/portails");
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
        <a className="btn secondaire large" href="/auth/visiteur">Essayer sans compte</a>
        <p className="texte-doux" style={{ fontSize: 14, margin: "0" }}>Mode visiteur : quelques livres et jeux gratuits, sans inscription.</p>
        <a className="lien" href={config.abonnementUrl} style={{ marginTop: 6 }}>Découvrir l'abonnement</a>
        <a className="texte-doux" href="/test" style={{ fontSize: 14, marginTop: 10, textDecoration: "underline" }}>Accès équipe (code test)</a>
      </div>
      {erreur && (
        <p className="message erreur" style={{ maxWidth: 360 }}>
          La connexion n'a pas abouti. Ce n'est pas grave, tu peux réessayer dans un instant.
        </p>
      )}
      <p className="liens-legaux" style={{ marginTop: 28 }}>
        <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a> · <a href="/cgu">Conditions d'utilisation</a>
      </p>
      {config.demo && <p className="texte-doux" style={{ marginTop: 24, fontSize: 14 }}>Mode démonstration activé</p>}
    </main>
  );
}
