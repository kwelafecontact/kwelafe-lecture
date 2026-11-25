import Oiseau from "@/components/Oiseau";
import EntreeTest from "@/components/EntreeTest";

export const metadata = { title: "Accès équipe · Kwélafé" };

export default function PageTest() {
  return (
    <main className="bienvenue">
      <div className="logo"><Oiseau taille={96} /></div>
      <h1>Accès équipe</h1>
      <p className="devise">Entre le code test que Kwélafé t'a donné pour essayer toute l'application.</p>
      <EntreeTest />
      <a className="lien" href="/bienvenue" style={{ marginTop: 18 }}>Retour</a>
    </main>
  );
}
