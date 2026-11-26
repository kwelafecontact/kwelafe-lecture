import { notFound } from "next/navigation";
import NavBas from "@/components/NavBas";
import JeuEcole from "@/components/JeuEcole";
import { jeuEcole } from "@/lib/ecole-jeux";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const fiche = jeuEcole((await params).id);
  if (!fiche) notFound();
  return (<><main className="page"><JeuEcole fiche={fiche} /></main><NavBas /></>);
}
