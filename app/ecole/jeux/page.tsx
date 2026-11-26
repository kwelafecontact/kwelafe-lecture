import Link from "next/link";
import NavBas from "@/components/NavBas";
import { JEUX_ECOLE } from "@/lib/ecole-jeux";
import { THEMES } from "@/lib/ecole";
export const metadata = { title: "Jeux de l'école · Kwélafé" };
export default function Page() {
  return (
    <>
      <main className="page">
        <header className="entete"><div><div className="sur-titre">Espace École</div><h1>Jeux pédagogiques</h1></div></header>
        <p className="texte-doux">Des jeux pour apprendre, construits à partir des livres Kwélafé : langue créole, nature, patrimoine. Aucune publicité, aucun achat, aucune donnée personnelle demandée.</p>
        {THEMES.map((t) => {
          const jeux = JEUX_ECOLE.filter((j) => j.themes.includes(t.id));
          if (!jeux.length) return null;
          return (
            <section key={t.id} className="section">
              <h2>{t.emoji} {t.nom}</h2>
              <div className="jeux-grille">
                {jeux.map((j) => (
                  <Link key={j.id} href={`/ecole/jeux/${j.id}`} className="jeu-carte">
                    <div className="jeu-visuel" style={{ background: j.couleur }} aria-hidden><span className="jeu-emoji">{j.emoji}</span></div>
                    <div className="jeu-infos"><h3>{j.titre}</h3><p className="texte-doux">{j.desc}</p><span className="jeu-etiquette">Jouer</span></div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
      <NavBas />
    </>
  );
}
