ALTER TABLE livres ADD COLUMN publie_le TEXT;
ALTER TABLE livres ADD COLUMN sortie_le TEXT;
CREATE TABLE IF NOT EXISTS alertes (client_id TEXT NOT NULL, livre_id TEXT NOT NULL, cree_le TEXT NOT NULL, vu INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (client_id, livre_id));
