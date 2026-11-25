import Link from "next/link";
import { notFound } from "next/navigation";
import NavBas from "@/components/NavBas";
import { Couverture } from "@/components/CarteLivre";
import { contexte } from "@/lib/contexte";
import { UNIVERS, config } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function FicheLivre({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { livres, acces, prog } = await contexte();
  const livre = livres.find((l) => l.slug === slug);
  if (!livre) notFound();
  const ok = acces.get(livre.id);
  const p = prog.get(livre.id);
  const univers = UNIVERS.find((u) => u.id === livre.univers);
  const m = livre.manifeste;
  const nbPages = m.type === "pdf" ? m.pages : m.type === "web" ? m.pages || null : m.fixe ? m.pages.length : null;
  const typeTexte = livre.type === "epub_interactif" ? "Livre interactif" : "Livre";

  return (
    <>
      <main className="page">
        <Link href="/livres" className="retour">← Retour</Link>
        <div className="fiche">
          <Couverture livre={livre} verrouille={!ok} />
          <div>
            <h1>{livre.titre}</h1>
            <div className="meta">
              <span className={`badge ${livre.type === "epub_interactif" ? "interactif" : "inclus"}`}>{typeTexte}</span>
              {univers && <span className="badge inclus">{univers.nom}</span>}
              {nbPages && <span className="badge inclus">{nbPages} pages</span>}
            </div>
            {livre.resume && <p style={{ whiteSpace: "pre-line" }}>{livre.resume}</p>}
            <div style={{ marginTop: 22 }}>
              {ok ? (
                <Link className="btn large" href={`/lire/${livre.slug}`} style={{ maxWidth: 360 }}>
                  {p && p.pourcentage > 0 && !p.termine ? `Reprendre (${Math.round(p.pourcentage)} %)` : "Lire"}
                </Link>
              ) : (
                <>
                  <a className="btn large" href={livre.url_boutique || config.abonnementUrl} style={{ maxWidth: 360 }}>Découvrir sur la boutique</a>
                  <p className="texte-doux" style={{ marginTop: 12 }}>
                    {livre.inclus_abonnement ? "Ce livre est inclus dans l'abonnement Kwélafé." : "Ce livre est disponible à l'achat sur la boutique."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <NavBas />
    </>
  );
}
