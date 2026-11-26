// Ressources pédagogiques réservées aux enseignants et responsables d'établissement.
import type { Session } from "./session";
import { etabsAdministres, etabValide } from "./etablissements";

export type Ressource = { id: string; titre: string; theme: string; niveau: string; type: string; description: string | null; fichier: string; format: string; taille: number; cree_le: string };
import { TYPES_RESSOURCE } from "./ressources-types";
export { TYPES_RESSOURCE };
export const FORMATS_OK: Record<string, string> = {
  pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  mp3: "audio/mpeg",
};

/** Enseignant = éditeur, ou responsable d'au moins un établissement actif. */
export async function estEnseignant(session: Session | null) {
  if (!session || session.eleve || session.visiteur) return false;
  if (session.admin) return true;
  const etabs = await etabsAdministres(session);
  return etabs.some((e) => etabValide(e));
}
