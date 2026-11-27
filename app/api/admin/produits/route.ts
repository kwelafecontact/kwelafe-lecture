// Liste à jour des livres de la boutique Shopify (pour relier chaque fichier importé à sa fiche).
import { NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { adminConfigure, adminGraphql } from "@/lib/shopify";

// Les fiches « lieux » de la boutique ne sont pas des livres : on garde ce qui ressemble à un livre, un pack ou un coffret
const LIVRE = /(livre|tome|volume|guide|pdf|epub|cr[ée]ole|proverbe|superstition|ab[ée]c[ée]daire|mots|contes|roman|kosa|sirandane|saveurs|snack|glossaire|fleurs|dictionnaire|insultes|rituels|tr[ée]sors|demoiselles|assiette|coffret|pack|zarlor|ot[ée]|d[ée]senvo|je vois|forces du mal|signification|sois fi[èe]re|parler|imagier|jeu)/i;

export async function GET() {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  if (!adminConfigure()) return NextResponse.json({ produits: [] });
  const produits: { id: string; titre: string; url: string | null; couverture: string | null }[] = [];
  let apres: string | null = null;
  for (let page = 0; page < 5; page++) {
    const d: any = await adminGraphql(`query($apres:String){ products(first:100, after:$apres, query:"status:active") { pageInfo { hasNextPage endCursor } nodes { id title onlineStoreUrl featuredMedia { preview { image { url } } } } } }`, { apres });
    for (const n of d.products.nodes) {
      if (!LIVRE.test(n.title) || /abonnement|licence|carte cadeau/i.test(n.title)) continue;
      produits.push({ id: n.id.split("/").pop(), titre: n.title, url: n.onlineStoreUrl, couverture: n.featuredMedia?.preview?.image?.url || null });
    }
    if (!d.products.pageInfo.hasNextPage) break;
    apres = d.products.pageInfo.endCursor;
  }
  produits.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
  return NextResponse.json({ produits });
}
