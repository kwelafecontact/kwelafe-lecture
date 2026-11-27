import NavBas from "@/components/NavBas";
import CreoleEnfant from "@/components/CreoleEnfant";

export const metadata = { title: "Mon premier créole · Kwélafé" };

export default function PageCreoleEnfant() {
  return (
    <>
      <main className="page page-creole-enfant">
        <header className="ce-entete">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apprendre/mascotte.webp" alt="" />
          <div><div className="eyebrow">Coin des enfants</div><h1>Mon premier créole</h1><p>Regarde le dessin, lis le mot, et trouve la bonne réponse !</p></div>
        </header>
        <CreoleEnfant />
      </main>
      <NavBas />
    </>
  );
}
