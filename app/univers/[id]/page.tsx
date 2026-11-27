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

export default async function PageUnivers({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ age?: string }> }) {
  const { id } = await params;
  const { age } = await searchParams;
  const u = UNIVERS.find((x) => x.id === id);
  if (!u) notFound();
  const { livres, acces, prog, favoris } = await contexte();
  const duTheme = sansDoublon(livres, acces).filter((l) => l.univers === u.id);
  const ages = PUBLICS.filter((p) => duTheme.some((l) => publicsDe(l).includes(p.id)));
  const liste = duTheme.filter((l) => !age || publicsDe(l).includes(age as any)).sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
  return (
    <>
      <main className="page">
        <Link href="/univers" className="retour-themes">← Tous les thèmes</Link>
        <header className="entete bandeau" style={{ background: u.clair, borderColor: u.couleur }}>
          <div><div className="sur-titre">Thème</div><h1 style={{ color: u.couleur }}>{u.emoji} {u.nom}</h1><p>{liste.length} livre{liste.length > 1 ? "s" : ""}</p></div>
        </header>
        {ages.length > 1 && (
          <nav className="puces-age" aria-label="Filtrer par âge">
            <Link href={`/univers/${u.id}`} className={!age ? "actif" : ""}>Tous les âges</Link>
            {ages.map((p) => <Link key={p.id} href={`/univers/${u.id}?age=${p.id}`} className={age === p.id ? "actif" : ""}>{p.emoji} {p.nom}</Link>)}
          </nav>
        )}
        <RayonLivres livres={liste} acces={acces} prog={prog as any} favoris={favoris} />
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
