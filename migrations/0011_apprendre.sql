-- Progrès « Apprendre le créole » enregistrés sur le compte, et ligue de la semaine
CREATE TABLE IF NOT EXISTS apprendre_progres (
  client_id TEXT PRIMARY KEY,
  prenom TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  serie INTEGER NOT NULL DEFAULT 0,
  jour TEXT,
  finies TEXT NOT NULL DEFAULT '{}',
  coeurs INTEGER NOT NULL DEFAULT 5,
  jour_coeurs TEXT,
  semaine TEXT,
  xp_semaine INTEGER NOT NULL DEFAULT 0,
  maj TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_apprendre_semaine ON apprendre_progres (semaine, xp_semaine DESC);
