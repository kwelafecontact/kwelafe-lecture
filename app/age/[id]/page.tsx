import Link from "next/link";
import { notFound } from "next/navigation";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import RayonLivres from "@/components/RayonLivres";
import { contexte } from "@/lib/contexte";
import { UNIVERS } from "@/lib/config";
import { PUBLICS, publicsDe } from "@/lib/organisation";
import { sansDoublon } from "@/lib/formats";

export const dynamic = "force-dynamic";

export default async function PageAge({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = PUBLICS.find((x) => x.id === id);
  if (!p) notFound();
  const { livres, acces, prog, favoris } = await contexte();
  const duPublic = sansDoublon(livres, acces).filter((l) => publicsDe(l).includes(p.id));
  return (
    <>
      <main className="page">
        <Link href="/univers" className="retour-themes">← Thèmes et âges</Link>
        <header className="entete bandeau" style={{ background: p.clair, borderColor: p.couleur }}>
          <div><div className="sur-titre" style={{ color: p.couleur }}>{p.age}</div><h1 style={{ color: p.couleur }}>{p.emoji} {p.nom}</h1><p style={{ color: "#5a524a" }}>{duPublic.length} livres, rangés par thème</p></div>
        </header>
        {UNIVERS.map((u) => {
          const l = duPublic.filter((x) => x.univers === u.id).sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
          if (!l.length) return null;
          return (
            <section key={u.id} className="section">
              <h2 className="titre-rayon"><span>{u.emoji} {u.nom}</span><Link className="lien" href={`/univers/${u.id}?age=${p.id}`}>Voir le thème ›</Link></h2>
              <RayonLivres livres={l} acces={acces} prog={prog as any} favoris={favoris} />
            </section>
          );
        })}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
