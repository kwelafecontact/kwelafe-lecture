import Link from "next/link";
import NavBas from "@/components/NavBas";
import CarteLivre from "@/components/CarteLivre";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { UNIVERS } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ univers?: string }> }) {
  const { univers } = await searchParams;
  const { livres, acces, prog } = await contexte();
  const choix = UNIVERS.find((u) => u.id === univers);
  const groupes = choix ? [choix] : UNIVERS;

  return (
    <>
      <main className="page">
        <header className="entete"><h1>Catalogue</h1></header>
        <div className="pastilles">
          <Link href="/catalogue" className={`pastille ${!choix ? "active" : ""}`} style={{ display: "inline-flex", alignItems: "center" }}>Tout</Link>
          {UNIVERS.map((u) => (
            <Link key={u.id} href={`/catalogue?univers=${u.id}`} className={`pastille ${choix?.id === u.id ? "active" : ""}`} style={{ display: "inline-flex", alignItems: "center" }}>
              {u.emoji} {u.nom}
            </Link>
          ))}
        </div>
        {groupes.map((u) => {
          const liste = livres.filter((l) => l.univers === u.id);
          if (!liste.length) return choix ? (
            <div key={u.id} className="vide"><div className="oiseau">🌿</div><p>Les livres de cet univers arrivent bientôt.</p></div>
          ) : null;
          return (
            <section key={u.id} className="section">
              <h2>{u.emoji} {u.nom}</h2>
              <div className="grille">
                {liste.map((l) => (
                  <CarteLivre key={l.id} livre={l} acces={acces.get(l.id)!} pourcentage={prog.get(l.id)?.pourcentage} montrerInclus />
                ))}
              </div>
            </section>
          );
        })}
        {livres.length === 0 && <div className="vide"><div className="oiseau">🌿</div><p>Le catalogue se prépare. Reviens très vite !</p></div>}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
