import Portails from "@/components/Portails";
import { contexte } from "@/lib/contexte";
import { CATALOGUE } from "@/lib/jeux/catalogue";
import { JEUX_3D } from "@/lib/jeux/jeux3d";
import { sansDoublon } from "@/lib/formats";
import { urlCouverture } from "@/lib/cf";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choisis ton espace · Kwélafé" };

// Écran d'entrée façon Netflix : le logo, puis le choix de l'espace.
export default async function PagePortails() {
  const { session, livres, progs, acces } = await contexte();
  const enCours = progs.find((p) => !p.termine && p.pourcentage > 0);
  const livreEnCours = enCours ? livres.find((l) => l.id === enCours.livre_id) : undefined;
  const couvertures = sansDoublon(livres, acces).map((l) => urlCouverture(l.couverture)).filter(Boolean).slice(0, 3) as string[];
  return (
    <Portails
      prenom={session.prenom || ""}
      visiteur={!!session.visiteur}
      eleve={!!session.eleve}
      nbLivres={sansDoublon(livres, acces).length}
      nbJeux={CATALOGUE.length + JEUX_3D.length}
      enCours={livreEnCours ? { titre: livreEnCours.titre, slug: livreEnCours.slug, pct: Math.round(enCours!.pourcentage) } : null}
      couvertures={couvertures}
    />
  );
}
