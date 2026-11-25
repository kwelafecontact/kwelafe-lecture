-- Livres offerts à tous (offre Découverte et mode visiteur)
ALTER TABLE livres ADD COLUMN gratuit INTEGER NOT NULL DEFAULT 0;
