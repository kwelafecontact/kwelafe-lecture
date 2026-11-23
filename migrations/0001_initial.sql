-- Kwélafé Lecture : base de données Cloudflare D1

CREATE TABLE IF NOT EXISTS livres (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  titre TEXT NOT NULL,
  resume TEXT,
  univers TEXT,
  type TEXT NOT NULL CHECK (type IN ('epub_texte','epub_interactif','pdf')),
  shopify_product_id TEXT,
  url_boutique TEXT,
  inclus_abonnement INTEGER NOT NULL DEFAULT 1,
  mystere_du_mois INTEGER NOT NULL DEFAULT 0,
  couverture TEXT,
  manifeste TEXT NOT NULL,            -- JSON
  publie INTEGER NOT NULL DEFAULT 0,
  cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,                -- gid://shopify/Customer/...
  email TEXT NOT NULL,
  prenom TEXT,
  achats TEXT NOT NULL DEFAULT '[]',  -- JSON : produits Shopify achetés
  abonne INTEGER NOT NULL DEFAULT 0,
  cadeau_jusqu TEXT,
  maj TEXT
);

CREATE TABLE IF NOT EXISTS progression (
  client_id TEXT NOT NULL,
  livre_id TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT '{"i":0,"f":0}',
  pourcentage REAL NOT NULL DEFAULT 0,
  termine INTEGER NOT NULL DEFAULT 0,
  maj TEXT NOT NULL,
  PRIMARY KEY (client_id, livre_id)
);

CREATE TABLE IF NOT EXISTS codes_cadeaux (
  code TEXT PRIMARY KEY,
  duree_mois INTEGER NOT NULL,
  commande TEXT,
  acheteur_id TEXT,
  acheteur_email TEXT,
  utilise_par TEXT,
  utilise_le TEXT,
  cree_le TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_codes_acheteur ON codes_cadeaux(acheteur_id);
CREATE INDEX IF NOT EXISTS idx_codes_commande ON codes_cadeaux(commande);
CREATE INDEX IF NOT EXISTS idx_progression_client ON progression(client_id, maj);
