// Vocabulaire des établissements (utilisable côté navigateur).
export type TypeEtab = "ecole" | "mediatheque" | "collectivite";
/** Les mots changent selon le type d'établissement. */
export const MOTS: Record<TypeEtab, { nom: string; groupe: string; groupes: string; membres: string; responsable: string; prefixe: string; emoji: string }> = {
  ecole: { nom: "École", groupe: "classe", groupes: "classes", membres: "élèves", responsable: "enseignant", prefixe: "ECOLE", emoji: "🏫" },
  mediatheque: { nom: "Médiathèque", groupe: "groupe", groupes: "groupes", membres: "lecteurs", responsable: "bibliothécaire", prefixe: "MEDIA", emoji: "📚" },
  collectivite: { nom: "Collectivité", groupe: "groupe", groupes: "groupes", membres: "usagers", responsable: "référent", prefixe: "KW", emoji: "🏛️" },
};

