import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import { contexte } from "@/lib/contexte";
import { UNIVERS } from "@/lib/config";
import { PUBLICS, publicsDe } from "@/lib/organisation";
import { sansDoublon } from "@/lib/formats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Thèmes et âges · Kwélafé" };

export default async function PortailUnivers() {
  const { livres, acces } = await contexte();
  const vis = sansDoublon(livres, acces);
  return (
    <>
      <main className="page">
        <header className="entete bandeau bandeau-catalogue">
          <div><div className="sur-titre">Trouve ton prochain livre</div><h1>Thèmes et âges</h1></div>
        </header>
        <section className="section">
          <h2>Par thème</h2>
          <div className="univers">
            {UNIVERS.map((u) => {
              const n = vis.filter((l) => l.univers === u.id).length;
              return (
                <Link key={u.id} href={`/univers/${u.id}`} className="tuile" style={{ ["--c" as any]: u.couleur, ["--cc" as any]: u.clair }}>
                  <span className="emoji">{u.emoji}</span><b>{u.nom}</b><small>{n ? `${n} livre${n > 1 ? "s" : ""}` : "Bientôt"}</small>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="section">
          <h2>Par âge</h2>
          <div className="univers">
            {PUBLICS.map((p) => {
              const n = vis.filter((l) => publicsDe(l).includes(p.id)).length;
              return (
                <Link key={p.id} href={`/age/${p.id}`} className="tuile" style={{ ["--c" as any]: p.couleur, ["--cc" as any]: p.clair }}>
                  <span className="emoji">{p.emoji}</span><b>{p.nom}</b><small>{p.age} · {n} livre{n > 1 ? "s" : ""}</small>
                </Link>
              );
            })}
          </div>
        </section>
        <p><Link className="lien" href="/catalogue?vue=recherche">🔎 Rechercher un livre précis ›</Link></p>
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
