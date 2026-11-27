import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import JeuxHorsLigne from "@/components/JeuxHorsLigne";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { CATALOGUE } from "@/lib/jeux/catalogue";
import { JEUX_3D } from "@/lib/jeux/jeux3d";
import { jeuGratuit } from "@/lib/jeux/gratuits";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jeux · Kwélafé" };

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

        <nav className="portes-jeux" aria-label="Types de jeux">
          <a href="#mini-jeux" className="porte-jeu" style={{ background: "linear-gradient(135deg,#ffb08a,#e8283a)" }}><span>🎮</span><b>Mini-jeux</b><small>Fruits, mots, lieux</small></a>
          <Link href="/jeux/quiz" className="porte-jeu" style={{ background: "linear-gradient(135deg,#8fe0ff,#1e6ec8)" }}><span>❓</span><b>Quiz</b><small>Teste tes connaissances</small></Link>
          <Link href="/jeux/famille" className="porte-jeu" style={{ background: "linear-gradient(135deg,#bff0a8,#2f9a4a)" }}><span>👨‍👩‍👧</span><b>En famille</b><small>Quiz et Dévine vite !</small></Link>
        </nav>

        <JeuxHorsLigne urls={CATALOGUE.filter((j) => !j.troisD && (acces || jeuGratuit(j.id))).map((j) => `/jeux/${j.id}`)} />

        {!acces && (
          <section className="panneau" style={{ marginBottom: 22 }}>
            <h2>Les jeux sont inclus dans l'abonnement</h2>
            <p className="texte-doux" style={{ margin: "6px 0 16px" }}>Abonne-toi pour jouer à tous les jeux Kwélafé et garder tes records sur tous tes appareils.</p>
            <a className="btn" href={config.abonnementUrl}>Découvrir l'abonnement</a>
          </section>
        )}

        {([["fruits", "Fruits et légumes péi"], ["reunion", "Jeux de La Réunion"], ["memoire", "Mémoire et transmission"]] as const).map(([serie, titre]) => (
        <section key={serie} id={serie === "fruits" ? "mini-jeux" : undefined} className="section" style={{ marginTop: serie === "fruits" ? 0 : undefined }}>
          <h2>{titre}</h2>
          <div className="jeux-grille">
            {CATALOGUE.filter((j) => j.serie === serie).map((j) => {
              const ouvert = acces || jeuGratuit(j.id);
              const contenu = (
                <>
                  <div className="jeu-visuel" style={{ background: j.fond }} aria-hidden>
                    {j.emoji ? <span className="jeu-emoji">{j.emoji}</span> : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={j.image || `/jeux/fruits/${j.vignette}.webp`} alt="" width={120} height={120} />
                    )}
                  </div>
                  <div className="jeu-infos">
                    <h3>{j.titre}{j.troisD ? " 3D" : ""}</h3>
                    <p className="texte-doux">{j.accroche}</p>
                    <span className="jeu-etiquette">{ouvert ? (acces ? "Jouer" : "Gratuit · Jouer") : "Abonnés"}</span>
                  </div>
                </>
              );
              return ouvert ? <Link key={j.id} href={`/jeux/${j.id}`} className="jeu-carte">{contenu}</Link> : <div key={j.id} className="jeu-carte inactive">{contenu}</div>;
            })}
          </div>
        </section>
        ))}

        <section className="section">
          <h2>Jeux péi en 3D</h2>
          <div className="jeux-grille">
            {JEUX_3D.map((j) => {
              const ouvert = acces || jeuGratuit(j.id, true);
              const contenu = (
                <>
                  <div className="jeu-visuel" style={{ background: j.fond }} aria-hidden>
                    <span className="jeu-emoji">{j.emoji}</span>
                  </div>
                  <div className="jeu-infos">
                    <h3>{j.titre}</h3>
                    <p className="texte-doux">{j.accroche}</p>
                    <span className="jeu-etiquette">{ouvert ? (acces ? "Jouer" : "Gratuit · Jouer") : "Abonnés"}</span>
                  </div>
                </>
              );
              return ouvert ? <Link key={j.id} href={`/jeux/3d/${j.id}`} className="jeu-carte">{contenu}</Link> : <div key={j.id} className="jeu-carte inactive">{contenu}</div>;
            })}
          </div>
        </section>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
