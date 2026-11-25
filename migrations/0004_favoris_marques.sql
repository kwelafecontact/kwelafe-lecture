-- Favoris, marque-pages et jours de lecture (série)
CREATE TABLE IF NOT EXISTS favoris (
  client_id TEXT NOT NULL,
  livre_id TEXT NOT NULL,
  cree_le TEXT NOT NULL,
  PRIMARY KEY (client_id, livre_id)
);
CREATE TABLE IF NOT EXISTS marques (
  client_id TEXT NOT NULL,
  livre_id TEXT NOT NULL,
  liste TEXT NOT NULL DEFAULT '[]',
  PRIMARY KEY (client_id, livre_id)
);
CREATE TABLE IF NOT EXISTS jours_lecture (
  client_id TEXT NOT NULL,
  jour TEXT NOT NULL,
  secondes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (client_id, jour)
);
