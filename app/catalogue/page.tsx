import NavBas from "@/components/NavBas";
import Bibliotheque from "@/components/Bibliotheque";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { leger } from "@/lib/leger";
import type { Format } from "@/lib/formats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue · Kwélafé" };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ univers?: string; format?: string; public?: string }> }) {
  const { univers, format, public: pourQui } = await searchParams;
  const { livres, acces, prog, favoris } = await contexte();
  const items = livres.map((l) => ({
    livre: leger(l), acces: !!acces.get(l.id), pourcentage: prog.get(l.id)?.pourcentage || 0, termine: !!prog.get(l.id)?.termine, favori: favoris.has(l.id),
  }));
  const f = (["epub", "pdf", "interactif"].includes(format || "") ? format : "tous") as Format | "tous";

  return (
    <>
      <main className="page">
        <header className="entete bandeau bandeau-catalogue">
          <div>
            <div className="sur-titre">Toute la bibliothèque Kwélafé</div>
            <h1>Catalogue</h1>
          </div>
        </header>
        {livres.length ? (
          <Bibliotheque items={items} mode="catalogue" formatInitial={f} universInitial={univers || ""} pourQuiInitial={(["tout-petits", "enfants", "ados", "adultes"].includes(pourQui || "") ? pourQui : "") as any} />
        ) : (
          <div className="vide"><div className="oiseau">🌿</div><p>Le catalogue se prépare. Reviens très vite !</p></div>
        )}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
