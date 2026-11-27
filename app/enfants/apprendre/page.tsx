import NavBas from "@/components/NavBas";
import SavoirsEnfants from "@/components/SavoirsEnfants";

export const metadata = { title: "Apprendre en m'amusant · Kwélafé" };

export default function Page() {
  return (
    <>
      <main className="page page-creole-enfant">
        <header className="ce-entete">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apprendre/mascotte.webp" alt="" />
          <div><div className="eyebrow">Coin des enfants</div><h1>Apprendre en m'amusant</h1><p>Le volcan, les animaux, la nature, les gâteaux péi, les musées et les objets lontan.</p></div>
        </header>
        <SavoirsEnfants />
      </main>
      <NavBas />
    </>
  );
}
