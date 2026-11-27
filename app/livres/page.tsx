import Link from "next/link";
import NavBas from "@/components/NavBas";
import LienSite from "@/components/LienSite";
import RayonLivres from "@/components/RayonLivres";
import { Couverture } from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { sansDoublon } from "@/lib/formats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mes lectures · Kwélafé" };

function quand(iso: string) {
  const j = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return j <= 0 ? "aujourd'hui" : j === 1 ? "hier" : j < 30 ? `il y a ${j} jours` : new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default async function PageMesLectures() {
  const { livres, progs, prog, acces, favoris } = await contexte();
  // Seulement les livres ouverts, du plus récent au plus ancien
  const lus = progs
    .map((p) => ({ p, l: livres.find((l) => l.id === p.livre_id) }))
    .filter((x) => x.l && (x.p.pourcentage > 0 || x.p.termine)) as { p: (typeof progs)[number]; l: (typeof livres)[number] }[];
  const enCours = lus.filter((x) => !x.p.termine);
  const finis = lus.filter((x) => x.p.termine);
  // Suggestions : mêmes univers que mes lectures, pas encore ouverts, accessibles en premier
  const mesUnivers = new Set(lus.map((x) => x.l.univers));
  const dejaLus = new Set(lus.map((x) => x.l.id));
  const suggestions = sansDoublon(livres, acces)
    .filter((l) => !dejaLus.has(l.id))
    .sort((a, b) => Number(mesUnivers.has(b.univers)) - Number(mesUnivers.has(a.univers)) || Number(!!acces.get(b.id)) - Number(!!acces.get(a.id)) || b.cree_le.localeCompare(a.cree_le))
    .slice(0, 8);

  const Ligne = ({ x }: { x: (typeof lus)[number] }) => (
    <Link href={`/lire/${x.l.slug}`} className="ligne-lecture">
      <Couverture livre={x.l} />
      <div>
        <b>{x.l.titre}</b>
        <div className="barre"><i style={{ width: `${x.p.termine ? 100 : Math.round(x.p.pourcentage)}%` }} /></div>
        <small className="texte-doux">{x.p.termine ? "✅ Terminé" : `Lu à ${Math.round(x.p.pourcentage)} %`} · {quand(x.p.maj)}</small>
      </div>
      <span className="ll-action">{x.p.termine ? "Relire" : "▶ Reprendre"}</span>
    </Link>
  );

  return (
    <>
      <main className="page">
        <header className="entete-editorial">
          <div className="eyebrow">Mon coin lecture</div>
          <h1>Mes lectures</h1>
          <p>Les livres que tu as ouverts, du plus récent au plus ancien.</p>
        </header>
        {lus.length === 0 ? (
          <div className="vide">
            <div className="oiseau">📖</div>
            <h2>Aucune lecture pour l'instant</h2>
            <p className="texte-doux">Choisis un livre dans ta bibliothèque : il apparaîtra ici dès que tu l'auras ouvert.</p>
            <Link className="btn" href="/catalogue">Aller à ma bibliothèque</Link>
          </div>
        ) : (
          <>
            {enCours.length > 0 && <section className="section"><h2>En cours <small className="texte-doux">({enCours.length})</small></h2><div className="liste-lectures">{enCours.map((x) => <Ligne key={x.l.id} x={x} />)}</div></section>}
            {finis.length > 0 && <section className="section"><h2>Terminés <small className="texte-doux">({finis.length})</small></h2><div className="liste-lectures">{finis.map((x) => <Ligne key={x.l.id} x={x} />)}</div></section>}
          </>
        )}
        {suggestions.length > 0 && (
          <section className="section">
            <h2>✨ Pour ta prochaine lecture</h2>
            <RayonLivres livres={suggestions} acces={acces} prog={prog as any} favoris={favoris} />
          </section>
        )}
        <LienSite />
      </main>
      <NavBas />
    </>
  );
}
