-- Appareils de lecture par compte (limite de 3 appareils actifs sur 30 jours)
CREATE TABLE IF NOT EXISTS appareils (
  cid TEXT NOT NULL,
  appareil TEXT NOT NULL,
  nom TEXT,
  vu INTEGER NOT NULL,
  PRIMARY KEY (cid, appareil)
);
CREATE INDEX IF NOT EXISTS idx_appareils_cid ON appareils(cid, vu);
