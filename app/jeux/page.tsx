import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { CATALOGUE } from "@/lib/jeux/catalogue";

export const dynamic = "force-dynamic";

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

        <section className="section" style={{ marginTop: 0 }}>
          <h2>Fruits et légumes péi</h2>
          <div className="jeux-grille">
            {CATALOGUE.filter((j) => j.serie === "fruits").map((j) => {
              const contenu = (
                <>
                  <div className="jeu-visuel" style={{ background: j.fond }} aria-hidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/jeux/fruits/${j.vignette}.webp`} alt="" width={120} height={120} />
                  </div>
                  <div className="jeu-infos">
                    <h3>{j.titre}{j.troisD ? " 3D" : ""}</h3>
                    <p className="texte-doux">{j.accroche}</p>
                    <span className="jeu-etiquette">{acces ? "Jouer" : "Abonnés"}</span>
                  </div>
                </>
              );
              return acces ? <Link key={j.id} href={`/jeux/${j.id}`} className="jeu-carte">{contenu}</Link> : <div key={j.id} className="jeu-carte inactive">{contenu}</div>;
            })}
          </div>
        </section>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
