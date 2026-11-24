// Lecture centralisée des réglages (variables d'environnement).
export const config = {
  appUrl: (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  sessionSecret: process.env.SESSION_SECRET || "",
  demo: process.env.DEMO_MODE === "1",
  adminEmails: (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  shopUrl: (process.env.SHOPIFY_SHOP_URL || "https://kwelafeproduction.com").replace(/\/$/, ""),
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN || "",
  shopId: process.env.SHOPIFY_SHOP_ID || "",
  abonnementUrl:
    process.env.SHOPIFY_BOUTIQUE_ABONNEMENT_URL ||
    "https://kwelafeproduction.com/products/abonnement-mensuel-kwelafe",
  caClientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || "",
  caClientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET || "",
  adminClientId: process.env.SHOPIFY_ADMIN_CLIENT_ID || "",
  adminClientSecret: process.env.SHOPIFY_ADMIN_CLIENT_SECRET || "",
  adminToken: process.env.SHOPIFY_ADMIN_TOKEN || "",
  apiVersion: process.env.SHOPIFY_API_VERSION || "2026-10",
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || "",
  abonneTags: (process.env.ABONNE_TAGS || "kwelafe-abonne")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean),
};

export const UNIVERS = [
  { id: "horreur", nom: "Horreur et superstitions", emoji: "🌙" },
  { id: "biodiversite", nom: "Biodiversité", emoji: "🌿" },
  { id: "jeunesse", nom: "Enfants et jeunesse", emoji: "🧸" },
  { id: "creole", nom: "Apprendre le créole", emoji: "💬" },
  { id: "patrimoine", nom: "Culture et patrimoine", emoji: "🏡" },
  { id: "cuisine", nom: "Cuisine et saveurs", emoji: "🍲" },
] as const;

export const CADEAUX: Record<string, number> = {
  "KW-BIB-CADEAU-3M": 3,
  "KW-BIB-CADEAU-6M": 6,
  "KW-BIB-CADEAU-12M": 12,
};
