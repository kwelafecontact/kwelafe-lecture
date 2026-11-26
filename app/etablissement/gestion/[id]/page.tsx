import Link from "next/link";
import { redirect } from "next/navigation";
import GestionEtab from "@/components/GestionEtab";
import Avatar from "@/components/Avatar";
import { lireSession } from "@/lib/session";
import { etabAdministre, MOTS, type Groupe } from "@/lib/etablissements";
import { tous } from "@/lib/cf";
import { livresPublies } from "@/lib/donnees";
import { sansDoublon } from "@/lib/formats";
import { JEUX_ECOLE } from "@/lib/ecole-jeux";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gestion de l'établissement · Kwélafé" };

// Espace du responsable : personnalisation, classes ou groupes, codes d'accès, sélection de livres, suivi.
export default async function Gestion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await lireSession();
  if (!session) redirect("/bienvenue");
  const etab = await etabAdministre(session, id);
  if (!etab) redirect("/etablissement");
  const groupes = await tous<Groupe>("SELECT * FROM groupes WHERE etab_id = ? ORDER BY cree_le", id);
  const livres = sansDoublon((await livresPublies()).filter((l) => etab.type !== "ecole" || l.univers !== "horreur")).map((l) => ({ id: l.id, titre: l.titre }));
  const ressources = await tous<{ id: string; titre: string; format: string }>("SELECT id, titre, format FROM ressources ORDER BY titre").catch(() => []);
  return (
    <main className="page" style={{ paddingBottom: 40 }}>
      <Link href="/etablissement" className="lien">← Retour</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}><Avatar taille={48} cle="kw-avatar-prof" /><span className="texte-doux">Mon avatar d'{MOTS[etab.type].responsable}</span></div>
      <h1 style={{ marginTop: 10 }}>{MOTS[etab.type].emoji} {etab.nom}</h1>
      <p className="texte-doux">Abonnement actif jusqu'au {new Date(etab.fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
      <GestionEtab
        etab={{ id: etab.id, nom: etab.nom, type: etab.type, couleur: etab.couleur, message: etab.message || "", logo: etab.logo || "" }}
        groupes={groupes.map(({ empreinte, ...g }) => g)}
        livres={livres}
        ressources={ressources}
        jeux={JEUX_ECOLE.map((j) => ({ id: j.id, titre: j.titre }))}
      />
    </main>
  );
}
