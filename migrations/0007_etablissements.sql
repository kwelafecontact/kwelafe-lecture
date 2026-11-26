-- Établissements (écoles, médiathèques, collectivités) et leurs groupes (classes) avec code d'accès.
CREATE TABLE IF NOT EXISTS etablissements (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'ecole',
  ville TEXT,
  couleur TEXT NOT NULL DEFAULT '#2e9d4f',
  message TEXT,
  logo TEXT,
  admins TEXT NOT NULL DEFAULT '',
  fin TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  cree_le TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS groupes (
  id TEXT PRIMARY KEY,
  etab_id TEXT NOT NULL,
  nom TEXT NOT NULL,
  niveau TEXT,
  responsable TEXT,
  empreinte TEXT NOT NULL UNIQUE,
  apercu TEXT NOT NULL,
  actif INTEGER NOT NULL DEFAULT 1,
  selection TEXT NOT NULL DEFAULT '[]',
  message TEXT,
  connexions INTEGER NOT NULL DEFAULT 0,
  dernier_usage TEXT,
  cree_le TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS groupes_etab ON groupes (etab_id);
