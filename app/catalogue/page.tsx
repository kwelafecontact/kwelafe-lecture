import Link from "next/link";
import { redirect } from "next/navigation";
import RayonLivres from "@/components/RayonLivres";
import { UNIVERS } from "@/lib/config";
import { sansDoublon } from "@/lib/formats";
import NavBas from "@/components/NavBas";
import Bibliotheque from "@/components/Bibliotheque";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { leger } from "@/lib/leger";
import type { Format } from "@/lib/formats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue · Kwélafé" };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ univers?: string; format?: string; public?: string; vue?: string }> }) {
  const { univers, format, public: pourQui, vue } = await searchParams;
  if (univers && !vue) redirect(`/univers/${univers}`);
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
        <nav className="puces-age">
          <Link href="/catalogue" className={vue ? "" : "actif"}>📚 Par thème</Link>
          <Link href="/univers">🧭 Thèmes et âges</Link>
          <Link href="/catalogue?vue=recherche" className={vue ? "actif" : ""}>🔎 Recherche et filtres</Link>
        </nav>
        {!vue && livres.length ? UNIVERS.map((u) => {
          const l = sansDoublon(livres, acces).filter((x) => x.univers === u.id).sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
          if (!l.length) return null;
          return (
            <section key={u.id} className="section">
              <h2 className="titre-rayon" style={{ color: u.couleur }}><span>{u.emoji} {u.nom} <small>({l.length})</small></span><Link className="lien" href={`/univers/${u.id}`}>Ouvrir le thème ›</Link></h2>
              <RayonLivres livres={l} acces={acces} prog={prog} favoris={favoris} />
            </section>
          );
        }) : livres.length ? (
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
