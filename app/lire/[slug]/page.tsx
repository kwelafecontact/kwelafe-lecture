import { notFound, redirect } from "next/navigation";
import Lecteur from "@/components/Lecteur";
import LecteurWeb from "@/components/LecteurWeb";
import { lireSession } from "@/lib/session";
import { aAcces, client, livreParSlug, progressionLivre } from "@/lib/donnees";
import { creerJetonContenu } from "@/lib/jeton-contenu";

export const dynamic = "force-dynamic";

export default async function PageLecture({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const livre = await livreParSlug(slug, session.admin); // l'éditeur peut prévisualiser un brouillon
  if (!livre) notFound();
  const c = await client(session);
  if (!aAcces(c, livre, session)) redirect(`/livre/${slug}`);
  const m = livre.manifeste;
  const p = await progressionLivre(session.cid, livre.id);
  if (m.type === "web") {
    const jetonWeb = await creerJetonContenu(session.cid, livre.id, session.email, 8 * 3600);
    return <LecteurWeb livre={{ id: livre.id, slug: livre.slug, titre: livre.titre, entree: m.entree, pages: m.pages || 0 }} jeton={jetonWeb} email={session.email} />;
  }
  const jeton = await creerJetonContenu(session.cid, livre.id, session.email);
  return (
    <Lecteur
      livre={{ id: livre.id, slug: livre.slug, titre: livre.titre, manifeste: m }}
      jetonInitial={jeton}
      positionInitiale={p?.position || { i: 0, f: 0 }}
      email={session.email}
    />
  );
}
