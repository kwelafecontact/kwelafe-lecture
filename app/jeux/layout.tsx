import { redirect } from "next/navigation";
import { lireSession } from "@/lib/session";
// Les élèves (entrés avec un code de classe) n'ont accès qu'aux jeux pédagogiques de l'espace École.
export default async function LayoutJeux({ children }: { children: React.ReactNode }) {
  const s = await lireSession();
  if (s?.eleve) redirect("/ecole/jeux");
  return <>{children}</>;
}
