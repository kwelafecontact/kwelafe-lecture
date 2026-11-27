import NavBas from "@/components/NavBas";
import Coloriage from "@/components/Coloriage";

export const metadata = { title: "Coloriages péi · Kwélafé" };

export default function Page() {
  return (
    <>
      <main className="page page-creole-enfant">
        <header className="ce-entete">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apprendre/mascotte.webp" alt="" />
          <div><div className="eyebrow">Coin des enfants</div><h1>Coloriages péi</h1><p>Choisis une couleur, puis touche une zone du dessin.</p></div>
        </header>
        <Coloriage />
      </main>
      <NavBas />
    </>
  );
}
