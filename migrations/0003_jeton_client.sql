-- Jeton de renouvellement Shopify du client (chiffré), pour mettre à jour ses droits sans reconnexion
ALTER TABLE clients ADD COLUMN jeton_renouv TEXT;
