import NavBas from "@/components/NavBas";
import Bibliotheque from "@/components/Bibliotheque";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { leger } from "@/lib/leger";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes livres · Kwélafé" };

export default async function PageMesLivres() {
  const { livres, prog, acces, favoris } = await contexte();
  const items = livres
    .filter((l) => acces.get(l.id))
    .map((l) => ({ livre: leger(l), acces: true, pourcentage: prog.get(l.id)?.pourcentage || 0, termine: !!prog.get(l.id)?.termine, favori: favoris.has(l.id) }));
  return (
    <>
      <main className="page">
        <header className="entete bandeau bandeau-livres">
          <div>
            <div className="sur-titre">{items.length} livre{items.length > 1 ? "s" : ""} dans ta bibliothèque</div>
            <h1>Mes livres</h1>
          </div>
        </header>
        {items.length ? (
          <Bibliotheque items={items} mode="mes" />
        ) : (
          <div className="vide">
            <div className="oiseau">📚</div>
            <h2>Ta bibliothèque t'attend</h2>
            <p className="texte-doux">Les livres achetés sur la boutique Kwélafé, ou inclus dans ton abonnement, apparaîtront ici.</p>
            <a className="btn" href={config.abonnementUrl}>Découvrir la boutique</a>
          </div>
        )}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
