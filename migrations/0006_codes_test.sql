-- Codes d'accès test pour l'équipe (lecture complète, sans droits d'éditeur). Seule l'empreinte du code est gardée.
CREATE TABLE IF NOT EXISTS codes_test (
  empreinte TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  fin TEXT NOT NULL,
  cree_le TEXT NOT NULL,
  revoque INTEGER NOT NULL DEFAULT 0,
  dernier_usage TEXT,
  apercu TEXT NOT NULL
);
