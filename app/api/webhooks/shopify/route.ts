// Webhooks Shopify : commandes payées (codes cadeaux, achats), abonnements, clients.
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { config, CADEAUX } from "@/lib/config";
import { tous, executer } from "@/lib/cf";

function signatureValide(corps: string, signature: string | null) {
  if (!signature || !config.webhookSecret) return false;
  const attendu = createHmac("sha256", config.webhookSecret).update(corps, "utf8").digest("base64");
  const a = Buffer.from(attendu);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans 0/O ni 1/I pour éviter les confusions
function nouveauCode() {
  const bloc = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => ALPHABET[n % ALPHABET.length]).join("");
  return `KWELA-${bloc()}-${bloc()}`;
}

async function invaliderClient(idNumerique: number | string | undefined) {
  if (!idNumerique) return;
  await executer("UPDATE clients SET maj = NULL WHERE id = ?", `gid://shopify/Customer/${idNumerique}`);
}

export async function POST(req: NextRequest) {
  const corps = await req.text();
  if (!signatureValide(corps, req.headers.get("x-shopify-hmac-sha256"))) {
    return NextResponse.json({ erreur: "signature" }, { status: 401 });
  }
  const sujet = req.headers.get("x-shopify-topic");
  const data = JSON.parse(corps);

  if (sujet === "orders/paid") {
    const acheteur = data.customer?.id ? `gid://shopify/Customer/${data.customer.id}` : null;
    // Un code par exemplaire acheté, sans doublon si Shopify renvoie le webhook.
    const existants = await tous("SELECT code FROM codes_cadeaux WHERE commande = ?", String(data.id));
    if (!existants?.length) {
      const lignes: any[] = [];
      for (const l of data.line_items || []) {
        const mois = CADEAUX[l.sku];
        if (!mois) continue;
        for (let i = 0; i < (l.quantity || 1); i++) {
          lignes.push({ code: nouveauCode(), duree_mois: mois, commande: String(data.id), acheteur_id: acheteur, acheteur_email: data.email });
        }
      }
      for (const l of lignes) {
        await executer("INSERT INTO codes_cadeaux (code, duree_mois, commande, acheteur_id, acheteur_email) VALUES (?, ?, ?, ?, ?)", l.code, l.duree_mois, l.commande, l.acheteur_id, l.acheteur_email);
      }
    }
    await invaliderClient(data.customer?.id);
  } else if (sujet?.startsWith("subscription_contracts/")) {
    await invaliderClient(data.customer_id ?? data.admin_graphql_api_customer_id?.split("/").pop());
  } else if (sujet === "customers/update") {
    await invaliderClient(data.id);
  } else if (sujet === "orders/cancelled" || sujet === "refunds/create") {
    await invaliderClient(data.customer?.id);
  }
  return NextResponse.json({ ok: true });
}
