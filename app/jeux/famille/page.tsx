import Link from "next/link";
import NavBas from "@/components/NavBas";
export const metadata = { title: "Jeux en famille · Kwélafé" };
export default function Page() {
  return (
    <>
      <main className="page">
        <header className="entete entete-jeux"><div><div className="sur-titre">2 à 4 joueurs, un seul écran</div><h1>Jeux en famille</h1><p>Quiz, devinettes et défis tirés de nos livres, à jouer ensemble sur la varangue.</p></div></header>
        <div className="portes-jeux" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <Link href="/jeux/famille/quiz" className="porte-jeu" style={{ background: "linear-gradient(135deg,#8fe0ff,#1e6ec8)" }}><span>❓</span><b>Quiz en famille</b><small>Chacun son tour, 6 thèmes tirés de nos livres</small></Link>
          <Link href="/jeux/devine-vite" className="porte-jeu" style={{ background: "linear-gradient(135deg,#ffb08a,#e8283a)" }}><span>🗣️</span><b>Dévine vite !</b><small>1 minute pour faire deviner, en équipes, avec gages</small></Link>
        </div>
      </main>
      <NavBas />
    </>
  );
}
