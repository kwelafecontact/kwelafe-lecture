import { notFound } from "next/navigation";
import NavBas from "@/components/NavBas";
import JeuEcole from "@/components/JeuEcole";
import CadreJeu3D from "@/components/jeux/CadreJeu3D";
import { jeuEcole } from "@/lib/ecole-jeux";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const fiche = jeuEcole((await params).id);
  if (!fiche) notFound();
  // Application autonome (ex. Le volcan de La Réunion) : ouverte en plein écran
  if (fiche.src) return <CadreJeu3D src={fiche.src} titre={fiche.titre} />;
  return (<><main className="page"><JeuEcole fiche={fiche} /></main><NavBas /></>);
}
