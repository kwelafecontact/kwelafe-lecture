-- Devoirs donnés par l'enseignant à une classe (lire, écouter, jouer, fiche) avec une date
CREATE TABLE IF NOT EXISTS devoirs (
  id TEXT PRIMARY KEY,
  groupe_id TEXT NOT NULL,
  titre TEXT NOT NULL,
  consigne TEXT,
  type TEXT NOT NULL,
  cible TEXT,
  echeance TEXT NOT NULL,
  cree_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_devoirs_groupe ON devoirs(groupe_id, echeance);
CREATE TABLE IF NOT EXISTS devoirs_faits (
  devoir_id TEXT NOT NULL,
  eleve TEXT NOT NULL,
  prenom TEXT,
  fait_le TEXT NOT NULL,
  PRIMARY KEY (devoir_id, eleve)
);
