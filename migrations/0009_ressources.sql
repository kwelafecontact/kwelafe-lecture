-- Ressources pédagogiques pour les enseignants (fiches, cours), rangées par thème et par niveau
CREATE TABLE IF NOT EXISTS ressources (
  id TEXT PRIMARY KEY,
  titre TEXT NOT NULL,
  theme TEXT NOT NULL,
  niveau TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'fiche',
  description TEXT,
  fichier TEXT NOT NULL,
  format TEXT NOT NULL,
  taille INTEGER NOT NULL DEFAULT 0,
  cree_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ressources ON ressources(theme, niveau);
