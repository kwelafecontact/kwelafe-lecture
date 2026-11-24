-- Jeux Kwélafé : meilleurs scores et progression par joueur
CREATE TABLE IF NOT EXISTS scores_jeux (
  client_id TEXT NOT NULL,
  jeu TEXT NOT NULL,
  record INTEGER NOT NULL DEFAULT 0,
  parties INTEGER NOT NULL DEFAULT 0,
  donnees TEXT NOT NULL DEFAULT '{}',   -- JSON : niveau atteint, fruits découverts, etc.
  maj TEXT NOT NULL,
  PRIMARY KEY (client_id, jeu)
);

CREATE INDEX IF NOT EXISTS idx_scores_jeu ON scores_jeux(jeu, record DESC);
