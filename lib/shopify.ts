// Tout ce qui parle à Shopify : connexion client (Customer Account API) et API Admin.
import { config } from "./config";

/* ---------- Connexion client (OAuth 2.0 + PKCE) ---------- */

type Decouverte = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
};

let cacheDecouverte: Decouverte | null = null;
let cacheGraphqlClient: string | null = null;

export async function decouverte(): Promise<Decouverte> {
  if (cacheDecouverte) return cacheDecouverte;
  const r = await fetch(`${config.shopUrl}/.well-known/openid-configuration`, { cache: "no-store" });
  if (!r.ok) throw new Error("Impossible de joindre la connexion Shopify (openid-configuration).");
  cacheDecouverte = (await r.json()) as Decouverte;
  return cacheDecouverte;
}

async function urlGraphqlClient(): Promise<string> {
  if (cacheGraphqlClient) return cacheGraphqlClient;
  const r = await fetch(`${config.shopUrl}/.well-known/customer-account-api`, { cache: "no-store" });
  if (!r.ok) throw new Error("Impossible de joindre la Customer Account API.");
  const j = (await r.json()) as { graphql_api: string };
  cacheGraphqlClient = j.graphql_api;
  return cacheGraphqlClient;
}

function base64url(octets: Uint8Array) {
  return Buffer.from(octets).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function aleatoire(n = 32) {
  const t = new Uint8Array(n);
  crypto.getRandomValues(t);
  return base64url(t);
}

export async function defiPkce(verifier: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64url(new Uint8Array(h));
}

export const urlRetour = () => `${config.appUrl}/auth/callback`;

export async function echangerCode(code: string, verifier: string) {
  const d = await decouverte();
  const corps = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.caClientId,
    redirect_uri: urlRetour(),
    code,
    code_verifier: verifier,
  });
  const entetes: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
  if (config.caClientSecret) {
    entetes.Authorization =
      "Basic " + Buffer.from(`${config.caClientId}:${config.caClientSecret}`).toString("base64");
  }
  const r = await fetch(d.token_endpoint, { method: "POST", headers: entetes, body: corps });
  if (!r.ok) throw new Error("Échange du code Shopify refusé : " + (await r.text()));
  return (await r.json()) as { access_token: string; id_token?: string };
}

export async function profilClient(accessToken: string) {
  const url = await urlGraphqlClient();
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: accessToken },
    body: JSON.stringify({
      query: "{ customer { id firstName emailAddress { emailAddress } } }",
    }),
  });
  const j = await r.json();
  const c = j?.data?.customer;
  if (!c?.id) throw new Error("Profil client introuvable.");
  return { id: c.id as string, prenom: (c.firstName as string) || "", email: c.emailAddress?.emailAddress as string };
}

/* ---------- API Admin ---------- */

let jetonAdmin: { valeur: string; expire: number } | null = null;

async function obtenirJetonAdmin(): Promise<string> {
  if (config.adminToken) return config.adminToken;
  if (jetonAdmin && jetonAdmin.expire > Date.now() + 60_000) return jetonAdmin.valeur;
  if (!config.adminClientId || !config.adminClientSecret) {
    throw new Error("API Admin Shopify non configurée.");
  }
  // Applications du Dev Dashboard : jeton par « client credentials » (valable environ 24 h).
  const r = await fetch(`https://${config.storeDomain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.adminClientId,
      client_secret: config.adminClientSecret,
    }),
  });
  if (!r.ok) throw new Error("Jeton Admin refusé : " + (await r.text()));
  const j = (await r.json()) as { access_token: string; expires_in?: number };
  jetonAdmin = { valeur: j.access_token, expire: Date.now() + (j.expires_in || 3600) * 1000 };
  return jetonAdmin.valeur;
}

export function adminConfigure() {
  return Boolean(config.storeDomain && (config.adminToken || (config.adminClientId && config.adminClientSecret)));
}

export async function adminGraphql<T = any>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const jeton = await obtenirJetonAdmin();
  const r = await fetch(`https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": jeton },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  const j = await r.json();
  if (j.errors) throw new Error("Erreur API Admin : " + JSON.stringify(j.errors));
  return j.data as T;
}

/** Calcule ce à quoi un client a droit : produits achetés + abonnement actif. */
export async function droitsDepuisShopify(customerId: string) {
  const data = await adminGraphql<any>(
    `query Droits($id: ID!) {
      customer(id: $id) {
        tags
        subscriptionContracts(first: 20) { nodes { status } }
        orders(first: 100, sortKey: CREATED_AT, reverse: true) {
          nodes {
            id name cancelledAt displayFinancialStatus
            lineItems(first: 50) { nodes { sku product { id } } }
          }
        }
      }
    }`,
    { id: customerId }
  );
  const c = data?.customer;
  const achats = new Set<string>();
  for (const o of c?.orders?.nodes || []) {
    const payee = ["PAID", "PARTIALLY_REFUNDED"].includes(o.displayFinancialStatus);
    if (!payee || o.cancelledAt) continue;
    for (const l of o.lineItems.nodes) if (l.product?.id) achats.add(l.product.id);
  }
  const tags: string[] = (c?.tags || []).map((t: string) => t.toLowerCase());
  const contratActif = (c?.subscriptionContracts?.nodes || []).some((s: any) => s.status === "ACTIVE");
  const abonne = contratActif || tags.some((t) => config.abonneTags.includes(t));
  return { achats: [...achats], abonne };
}
