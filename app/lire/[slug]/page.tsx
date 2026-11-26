import { notFound, redirect } from "next/navigation";
import Lecteur from "@/components/Lecteur";
import LecteurWeb from "@/components/LecteurWeb";
import { lireSession } from "@/lib/session";
import { aAcces, client, livreParSlug, progressionLivre } from "@/lib/donnees";
import { creerJetonContenu, tailleExtrait } from "@/lib/jeton-contenu";
import { config } from "@/lib/config";
import { libelleFiligrane } from "@/lib/etablissements";

export const dynamic = "force-dynamic";

export default async function PageLecture({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const livre = await livreParSlug(slug, session.admin); // l'éditeur peut prévisualiser un brouillon
  if (!livre) notFound();
  const c = await client(session);
  const m = livre.manifeste;
  const ouvert = aAcces(c, livre, session);
  const extrait = ouvert ? 0 : tailleExtrait(m as any);
  if (!ouvert && !extrait) redirect(`/livre/${slug}`);
  const p = await progressionLivre(session.cid, livre.id);
  const filigrane = await libelleFiligrane(session);
  const empreinteCompte = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("kw-fil:" + session.cid))), (o) => o.toString(16).padStart(2, "0")).join("").slice(0, 8).toUpperCase();
  if (m.type === "web") {
    const jetonWeb = await creerJetonContenu(session.cid, livre.id, session.email, 8 * 3600);
    return <LecteurWeb livre={{ id: livre.id, slug: livre.slug, titre: livre.titre, entree: m.entree, pages: m.pages || 0 }} jeton={jetonWeb} email={filigrane} />;
  }
  const jeton = await creerJetonContenu(session.cid, livre.id, session.email, 30 * 60, extrait);
  return (
    <Lecteur
      livre={{ id: livre.id, slug: livre.slug, titre: livre.titre, manifeste: m }}
      jetonInitial={jeton}
      positionInitiale={extrait ? { i: 0, f: 0 } : p?.position || { i: 0, f: 0 }}
      extrait={extrait ? { pages: extrait, boutique: livre.url_boutique || config.abonnementUrl, abonnement: config.abonnementUrl } : undefined}
      email={filigrane}
      code={empreinteCompte}
    />
  );
}
