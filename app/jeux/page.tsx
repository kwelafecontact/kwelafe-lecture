import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

const JEUX = [
  {
    slug: "koup-koup",
    titre: "Koup Koup",
    resume: "Coupe les fruits péi en 3D, fais gicler le jus et évite la lave du volcan.",
    fond: "linear-gradient(135deg, #f39a12 0%, #e8283a 55%, #6e2a5c 100%)",
    emoji: "🥭",
    disponible: true,
  },
  {
    slug: "",
    titre: "Le marché des jus",
    resume: "Bientôt : prépare les jus que les clients commandent en créole.",
    fond: "linear-gradient(135deg, #8a9a7b 0%, #4c7a2a 100%)",
    emoji: "🍹",
    disponible: false,
  },
];

export default async function PageJeux() {
  const { session, abonne } = await contexte();
  const acces = abonne || session.admin || config.demo;
  return (
    <>
      <main className="page">
        <header className="entete">
          <div>
            <div className="sur-titre">Apprendre en s'amusant</div>
            <h1>Jeux péi</h1>
          </div>
        </header>

        {!acces && (
          <section className="panneau" style={{ marginBottom: 22 }}>
            <h2>Les jeux sont inclus dans l'abonnement</h2>
            <p className="texte-doux" style={{ margin: "6px 0 16px" }}>Abonne-toi pour jouer à tous les jeux Kwélafé et garder tes records sur tous tes appareils.</p>
            <a className="btn" href={config.abonnementUrl}>Découvrir l'abonnement</a>
          </section>
        )}

        <div className="jeux-grille">
          {JEUX.map((j) => {
            const contenu = (
              <>
                <div className="jeu-visuel" style={{ background: j.fond }} aria-hidden><span>{j.emoji}</span></div>
                <div className="jeu-infos">
                  <h3>{j.titre}</h3>
                  <p className="texte-doux">{j.resume}</p>
                  {j.disponible ? <span className="jeu-etiquette">{acces ? "Jouer" : "Abonnés"}</span> : <span className="jeu-etiquette bientot">Bientôt</span>}
                </div>
              </>
            );
            return j.disponible && acces ? (
              <Link key={j.titre} href={`/jeux/${j.slug}`} className="jeu-carte">{contenu}</Link>
            ) : (
              <div key={j.titre} className="jeu-carte inactive">{contenu}</div>
            );
          })}
        </div>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
