import { cookies } from "next/headers";
import Link from "next/link";
import { tailleExtrait } from "@/lib/jeton-contenu";
import { notFound } from "next/navigation";
import NavBas from "@/components/NavBas";
import CarteLivre, { Couverture } from "@/components/CarteLivre";
import BoutonFavori from "@/components/BoutonFavori";
import BoutonHorsLigne from "@/components/BoutonHorsLigne";
import { contexte } from "@/lib/contexte";
import { UNIVERS, config } from "@/lib/config";
import { autresFormats, formatDe, infoFormat, sansDoublon, versions } from "@/lib/formats";
import { leger } from "@/lib/leger";
import { collectionDe, cleCollection } from "@/lib/organisation";

export const dynamic = "force-dynamic";

export default async function FicheLivre({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { livres, acces, prog, favoris } = await contexte();
  const livre = livres.find((l) => l.slug === slug);
  if (!livre) notFound();
  const ok = acces.get(livre.id);
  const p = prog.get(livre.id);
  const univers = UNIVERS.find((u) => u.id === livre.univers);
  const m = livre.manifeste;
  const nbPages = m.type === "pdf" ? m.pages : m.type === "web" ? m.pages || null : m.fixe ? m.pages.length : null;
  const f = infoFormat(formatDe(livre));
  const autres = autresFormats(livre, livres);
  const vers = versions(livre, livres);
  const vEpub = vers.get("epub") || vers.get("interactif");
  const vPdf = vers.get("pdf");
  const deuxFormats = !!(vEpub && vPdf);
  const pdfDabord = (await cookies()).get("kw_format")?.value === "pdf";
  const minutes = nbPages ? Math.max(5, Math.round(nbPages * 1.2)) : null;
  const coll = collectionDe(livre.titre);
  const tomes = coll
    ? sansDoublon(livres.filter((l) => l.id !== livre.id && formatDe(l) === formatDe(livre) && collectionDe(l.titre) && cleCollection(collectionDe(l.titre)!.nom) === cleCollection(coll.nom)), acces)
        .sort((a, b) => collectionDe(a.titre)!.tome - collectionDe(b.titre)!.tome)
    : [];
  const memeUnivers = sansDoublon(livres.filter((l) => l.univers === livre.univers && l.id !== livre.id && formatDe(l) === formatDe(livre)), acces).slice(0, 8);

  return (
    <>
      <main className="page">
        <Link href="/livres" className="retour">← Retour</Link>
        <div className="fiche" style={{ ["--c" as any]: univers?.couleur || "#c8361d", ["--cc" as any]: univers?.clair || "#fde6e3" }}>
          <div className="fiche-couv">
            <Couverture livre={livre} verrouille={!ok} />
          </div>
          <div>
            {univers && <Link href={`/univers/${univers.id}`} className="univers-lien">{univers.emoji} {univers.nom}</Link>}
            <h1>{livre.titre}</h1>
            <div className="meta">
              <span className="badge format" style={{ background: f.clair, color: f.couleur }}>{f.emoji} {f.nom.replace("Livres ", "Livre ")}</span>
              {nbPages && <span className="badge neutre">📑 {nbPages} pages</span>}
              {minutes && <span className="badge neutre">⏱ environ {minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`}</span>}
              {livre.inclus_abonnement && <span className="badge inclus">Inclus dans l'abonnement</span>}
            </div>
            {livre.resume && <p style={{ whiteSpace: "pre-line" }}>{livre.resume}</p>}

            {p && p.pourcentage > 0 && (
              <div className="progression-fiche">
                <div className="barre"><i style={{ width: `${Math.min(100, p.pourcentage)}%` }} /></div>
                <span>{p.termine ? "Terminé 🎉" : `Lu à ${Math.round(p.pourcentage)} %`}</span>
              </div>
            )}

            <div className="actions-fiche">
              {deuxFormats ? (
                <div className="choix-lecture" style={pdfDabord ? { flexDirection: "row-reverse" } : undefined}>
                  <Link className="btn large" href={acces.get(vEpub!.id) || tailleExtrait(vEpub!.manifeste as any) > 0 ? `/lire/${vEpub!.slug}` : (livre.url_boutique || config.abonnementUrl)}>📖 Lire en EPUB{acces.get(vEpub!.id) ? "" : " 🔒"}<small>Texte adapté à l'écran</small></Link>
                  <Link className="btn large secondaire" href={acces.get(vPdf!.id) || tailleExtrait(vPdf!.manifeste as any) > 0 ? `/lire/${vPdf!.slug}` : (livre.url_boutique || config.abonnementUrl)}>📄 Lire en classique (PDF){acces.get(vPdf!.id) ? "" : " 🔒"}<small>Mise en page du livre</small></Link>
                </div>
              ) : ok ? (
                <Link className="btn large" href={`/lire/${livre.slug}`}>
                  {p && p.pourcentage > 0 && !p.termine ? `Reprendre la lecture` : p?.termine ? "Relire" : formatDe(livre) === "pdf" ? "📄 Lire en classique (PDF)" : "📖 Lire en EPUB"}
                </Link>
              ) : (
                <>
                  {tailleExtrait(livre.manifeste as any) > 0 && <Link className="btn large" href={`/lire/${livre.slug}`}>📖 Lire un extrait gratuit</Link>}
                  <a className={`btn large ${tailleExtrait(livre.manifeste as any) > 0 ? "secondaire" : ""}`} href={livre.url_boutique || config.abonnementUrl}>Découvrir sur la boutique</a>
                </>
              )}
              <BoutonFavori livreId={livre.id} initial={favoris.has(livre.id)} />
              {ok && m.type === "pdf" && <BoutonHorsLigne livreId={livre.id} />}
            </div>
            {!ok && (
              <p className="texte-doux" style={{ marginTop: 12 }}>
                {livre.inclus_abonnement ? "Ce livre est inclus dans l'abonnement Kwélafé." : "Ce livre est disponible à l'achat sur la boutique."}
              </p>
            )}

            {autres.length > 0 && !deuxFormats && (
              <div className="autres-formats">
                <h3>Aussi disponible en</h3>
                <div className="liens-formats">
                  {autres.map(({ format, livre: l }) => {
                    const a = infoFormat(format);
                    return (
                      <Link key={l.id} href={`/livre/${l.slug}`} className="lien-format" style={{ ["--c" as any]: a.couleur, ["--cc" as any]: a.clair }}>
                        <span>{a.emoji}</span>
                        <div><b>{a.court}</b><small>{a.texte}</small></div>
                        {acces.get(l.id) ? <em>Inclus</em> : <em>🔒</em>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {tomes.length > 0 && coll && (
          <section className="section">
            <h2>Les autres tomes : {coll.nom}</h2>
            <div className="rangee">
              {tomes.map((l) => (
                <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} />
              ))}
            </div>
          </section>
        )}

        {memeUnivers.length > 0 && (
          <section className="section">
            <h2>Dans le même univers</h2>
            <div className="rangee">
              {memeUnivers.map((l) => (
                <CarteLivre key={l.id} livre={leger(l)} acces={!!acces.get(l.id)} pourcentage={prog.get(l.id)?.pourcentage} favori={favoris.has(l.id)} />
              ))}
            </div>
          </section>
        )}
      </main>
      <NavBas />
    </>
  );
}
