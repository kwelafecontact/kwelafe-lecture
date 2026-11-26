// Types de ressources pédagogiques (utilisable côté client)
export const TYPES_RESSOURCE: Record<string, { nom: string; emoji: string }> = {
  fiche: { nom: "Fiche élève", emoji: "📝" },
  cours: { nom: "Cours", emoji: "📘" },
  corrige: { nom: "Corrigé", emoji: "✅" },
  activite: { nom: "Activité / jeu", emoji: "🎲" },
  evaluation: { nom: "Évaluation", emoji: "🎯" },
};
