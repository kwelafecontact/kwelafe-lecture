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
  { id: "horreur", nom: "Horreur et superstitions", emoji: "🌙", couleur: "#4b3a78", clair: "#ece8f6" },
  { id: "biodiversite", nom: "Biodiversité", emoji: "🌿", couleur: "#2e9d4f", clair: "#e2f4e7" },
  { id: "jeunesse", nom: "Enfants et jeunesse", emoji: "🧸", couleur: "#e8a200", clair: "#fdf2d6" },
  { id: "creole", nom: "Apprendre le créole", emoji: "💬", couleur: "#1f6fb2", clair: "#e3effa" },
  { id: "patrimoine", nom: "Culture et patrimoine", emoji: "🏡", couleur: "#b5562e", clair: "#f8e7dd" },
  { id: "cuisine", nom: "Cuisine et saveurs", emoji: "🍲", couleur: "#d6332a", clair: "#fde6e3" },
] as const;

export const CADEAUX: Record<string, number> = {
  "KW-BIB-CADEAU-3M": 3,
  "KW-BIB-CADEAU-6M": 6,
  "KW-BIB-CADEAU-12M": 12,
};
