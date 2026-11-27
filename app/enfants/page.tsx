import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import Carrousel from "@/components/Carrousel";
import { Couverture } from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { sansDoublon } from "@/lib/formats";
import { publicsDe } from "@/lib/organisation";
import { JEUX_ECOLE } from "@/lib/ecole-jeux";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coin des enfants · Kwélafé" };

export default async function CoinEnfants() {
  const { livres, acces } = await contexte();
  const pourEnfants = sansDoublon(livres, acces).filter((l) => l.univers !== "horreur" && publicsDe(l).some((p) => p === "tout-petits" || p === "enfants"));
  const petits = pourEnfants.filter((l) => publicsDe(l).includes("tout-petits"));
  const grands = pourEnfants.filter((l) => !publicsDe(l).includes("tout-petits"));
  const Rayon = ({ titre, liste }: { titre: string; liste: typeof pourEnfants }) => liste.length ? (
    <section className="section">
      <h2 className="enf-titre">{titre}</h2>
      <Carrousel libelle={titre}>
        {liste.map((l) => <Link key={l.id} href={`/livre/${l.slug}`} className="car-livre"><Couverture livre={l} verrouille={!acces.get(l.id)} /><span>{l.titre}</span></Link>)}
      </Carrousel>
    </section>
  ) : null;

  return (
    <>
      <main className="page page-enfants">
        <header className="hero-enfants">
          <div className="eyebrow">Coin des enfants</div>
          <h1>Grandir avec son île.</h1>
          <p>Des activités simples, joyeuses et éducatives pour apprendre et transmettre en famille.</p>
          <div className="enf-bulles" aria-hidden>🌺 🐢 🦎 🌋 🍍 🐬</div>
        </header>

        <nav className="enf-portes">
          <a href="#lire" style={{ ["--c" as any]: "#f2b705" }}><span>📚</span>Lire</a>
          <Link href="/enfants/zistoir" style={{ ["--c" as any]: "#7a2e8f" }}><span>✨</span>Zistoir</Link>
          <a href="#jouer" style={{ ["--c" as any]: "#2e9d4f" }}><span>🎲</span>Jouer</a>
          <Link href="/jeux/famille" style={{ ["--c" as any]: "#d6332a" }}><span>👨‍👩‍👧</span>En famille</Link>
          <Link href="/enfants/creole" style={{ ["--c" as any]: "#1f6fb2" }}><span>🐦</span>Créole</Link>
        </nav>

        <div id="lire" />
        <Rayon titre="🍼 Pour les tout-petits" liste={petits} />
        <Rayon titre="🧒 Pour les 6-11 ans" liste={grands} />

        <section className="section enf-apprendre" id="jouer">
          <div className="eyebrow">Apprendre autrement</div>
          <h2>La curiosité commence ici.</h2>
          <p>Des fiches, des jeux et des découvertes adaptés aux enfants.</p>
          <div className="enf-jeux">
            {JEUX_ECOLE.map((j) => (
              <Link key={j.id} href={`/ecole/jeux/${j.id}`} style={{ ["--c" as any]: j.couleur }}>
                <span className="ej-emoji">{j.emoji}</span><b>{j.titre}</b><small>{j.desc}</small>
              </Link>
            ))}
          </div>
        </section>
        <div style={{ textAlign: "center" }}><Link className="lien-parents" href="/parents">🔒 Espace parents</Link></div>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
