import NavBas from "@/components/NavBas";
import MesLivres from "@/components/MesLivres";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function PageMesLivres() {
  const { livres, prog, acces } = await contexte();
  const items = livres
    .filter((l) => acces.get(l.id))
    .map((l) => ({ livre: l, pourcentage: prog.get(l.id)?.pourcentage || 0, termine: prog.get(l.id)?.termine || false }));
  return (
    <>
      <main className="page">
        <header className="entete"><h1>Mes livres</h1></header>
        {items.length ? (
          <MesLivres items={items} />
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
