import { notFound, redirect } from "next/navigation";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { jeuGratuit } from "@/lib/jeux/gratuits";
import { jeu3d } from "@/lib/jeux/jeux3d";
import CadreJeu3D from "@/components/jeux/CadreJeu3D";

export const dynamic = "force-dynamic";

// Jeux 3D « Jeux péi » : le jeu (fichiers statiques de public/jeux-3d) s'ouvre en plein écran.
export default async function PageJeu3D({ params }: { params: Promise<{ jeu: string }> }) {
  const { jeu } = await params;
  const j = jeu3d(jeu);
  if (!j) notFound();
  const { session, abonne } = await contexte();
  if (!(abonne || session.admin || config.demo || jeuGratuit(j.id, true))) redirect("/jeux");
  return <CadreJeu3D src={`/jeux-3d/${j.id}/index.html`} titre={j.titre} />;
}
