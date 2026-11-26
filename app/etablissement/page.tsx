import Link from "next/link";
import { redirect } from "next/navigation";
import Oiseau from "@/components/Oiseau";
import EntreeClasse from "@/components/EntreeClasse";
import { lireSession } from "@/lib/session";
import { etabsAdministres, MOTS } from "@/lib/etablissements";

export const dynamic = "force-dynamic";
export const metadata = { title: "École et collectivité · Kwélafé" };

// Porte d'entrée des écoles, médiathèques et collectivités.
export default async function PageEtablissement() {
  const session = await lireSession();
  if (session?.eleve) redirect("/classe");
  const gerés = await etabsAdministres(session);
  const connecte = session && !session.visiteur && !session.testeur;
  return (
    <main className="bienvenue etab-entree">
      <div className="logo"><Oiseau taille={90} /></div>
      <h1>École et collectivité</h1>
      <p className="devise">Kwélafé Academy, la bibliothèque de La Réunion pour les classes, les médiathèques et les communes.</p>

      <div className="etab-cartes">
        <section className="etab-carte" style={{ ["--c" as any]: "#2e9d4f" }}>
          <h2>🎒 Je suis élève ou lecteur</h2>
          <p>Entre le code donné par ton enseignant ou ta médiathèque.</p>
          <EntreeClasse />
        </section>

        <section className="etab-carte" style={{ ["--c" as any]: "#1f6fb2" }}>
          <h2>👩‍🏫 Je gère une classe ou un lieu</h2>
          {gerés.length > 0 ? (
            <>
              <p>Ton espace de gestion :</p>
              <ul className="etab-liste">
                {gerés.map((e) => (
                  <li key={e.id}><Link className="btn" href={`/etablissement/gestion/${e.id}`}>{MOTS[e.type].emoji} {e.nom}</Link></li>
                ))}
              </ul>
            </>
          ) : connecte ? (
            <p>Ton adresse n'est rattachée à aucun établissement pour l'instant. Écris-nous pour ouvrir l'accès de ton école, de ta médiathèque ou de ta commune.</p>
          ) : (
            <>
              <p>Connecte-toi avec l'adresse e-mail enregistrée pour ton établissement.</p>
              <a className="btn" href="/auth/login">Me connecter</a>
            </>
          )}
          <a className="lien" href="mailto:contact@kwelafeproduction.com?subject=Offre%20%C3%A9tablissement%20Kw%C3%A9laf%C3%A9" style={{ marginTop: 10, display: "inline-block" }}>Demander une offre pour mon établissement</a>
        </section>
      </div>
      <Link className="lien" href="/portails" style={{ marginTop: 20 }}>← Retour</Link>
    </main>
  );
}
