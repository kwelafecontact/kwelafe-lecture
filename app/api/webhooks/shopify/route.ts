// Webhooks Shopify : commandes payées (codes cadeaux, achats), abonnements, clients.
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "@/lib/config";
import { creerCodesPourCommande } from "@/lib/cadeaux";
import { executer } from "@/lib/cf";

function signatureValide(corps: string, signature: string | null) {
  if (!signature || !config.webhookSecret) return false;
  const attendu = createHmac("sha256", config.webhookSecret).update(corps, "utf8").digest("base64");
  const a = Buffer.from(attendu);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
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
    const lignes = (data.line_items || []).map((l: any) => ({ sku: l.sku, quantite: l.quantity || 1 }));
    await creerCodesPourCommande(`gid://shopify/Order/${data.id}`, lignes, acheteur, data.email || null);
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
