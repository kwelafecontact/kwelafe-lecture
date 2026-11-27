import NavBas from "@/components/NavBas";
import Puzzle from "@/components/Puzzle";

export const metadata = { title: "Puzzles de l'île · Kwélafé" };

export default function Page() {
  return (
    <>
      <main className="page page-creole-enfant">
        <header className="ce-entete">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/apprendre/mascotte.webp" alt="" />
          <div><div className="eyebrow">Coin des enfants</div><h1>Puzzles de l'île</h1><p>Remets les pièces à leur place pour retrouver l'image.</p></div>
        </header>
        <Puzzle />
      </main>
      <NavBas />
    </>
  );
}
