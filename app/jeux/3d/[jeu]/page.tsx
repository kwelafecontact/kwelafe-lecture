import { notFound, redirect } from "next/navigation";
import { contexte } from "@/lib/contexte";
import { config } from "@/lib/config";
import { jeu3d } from "@/lib/jeux/jeux3d";

export const dynamic = "force-dynamic";

// Jeux 3D « Jeux péi » : le jeu (fichiers statiques de public/jeux-3d) s'ouvre en plein écran.
export default async function PageJeu3D({ params }: { params: Promise<{ jeu: string }> }) {
  const { jeu } = await params;
  const j = jeu3d(jeu);
  if (!j) notFound();
  const { session, abonne } = await contexte();
  if (!(abonne || session.admin || config.demo)) redirect("/jeux");
  return (
    <iframe
      src={`/jeux-3d/${j.id}/index.html`}
      title={j.titre}
      allow="fullscreen; autoplay"
      style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", border: 0, background: "#0b1530", zIndex: 50 }}
    />
  );
}
