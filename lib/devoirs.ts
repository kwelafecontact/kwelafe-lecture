// Devoirs de classe : ce que l'enseignant demande, avec une date.
export type Devoir = { id: string; groupe_id: string; titre: string; consigne: string | null; type: string; cible: string | null; echeance: string; cree_le: string };
export const TYPES_DEVOIR: Record<string, { nom: string; emoji: string; verbe: string }> = {
  lire: { nom: "Lire un livre", emoji: "📖", verbe: "Lire" },
  ecouter: { nom: "Écouter un extrait", emoji: "🎧", verbe: "Écouter" },
  fiche: { nom: "Faire une fiche", emoji: "📝", verbe: "Faire la fiche" },
  jeu: { nom: "Jouer à un jeu", emoji: "🎮", verbe: "Jouer" },
  autre: { nom: "Autre consigne", emoji: "📌", verbe: "À faire" },
};
/** Lien à ouvrir pour l'élève selon le type de devoir. */
export function lienDevoir(d: Pick<Devoir, "type" | "cible">, slugs: Record<string, string>) {
  if (!d.cible) return null;
  if (d.type === "lire") return slugs[d.cible] ? `/lire/${slugs[d.cible]}` : null;
  if (d.type === "jeu") return `/ecole/jeux/${d.cible}`;
  if (d.type === "fiche" || d.type === "ecouter") return `/api/ressources/${d.cible}`;
  return null;
}
export const dateDevoir = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
