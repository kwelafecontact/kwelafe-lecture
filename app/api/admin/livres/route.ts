import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { tous, executer } from "@/lib/cf";

function slugifier(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "livre";
}

// Accepte un ou plusieurs liens / numéros de produits Shopify (PDF, EPUB, packs, coffrets…)
function produitShopify(v: string | undefined | null) {
  const nums = [...new Set(String(v || "").match(/\d{6,}/g) || [])];
  return nums.length ? nums.map((n) => `gid://shopify/Product/${n}`).join(",") : null;
}

export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const b = await req.json();
  let slug = slugifier(b.titre);
  const pris = await tous<{ slug: string }>("SELECT slug FROM livres WHERE substr(slug, 1, ?) = ?", slug.length, slug);
  if (pris.some((p) => p.slug === slug)) slug = `${slug}-${pris.length + 1}`;
  try {
    await executer(
      `INSERT INTO livres (id, slug, titre, resume, univers, type, shopify_product_id, url_boutique, inclus_abonnement, mystere_du_mois, couverture, manifeste, publie)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0)`,
      b.id, slug, b.titre, b.resume || null, b.univers || null, b.type, produitShopify(b.produit), b.url_boutique || null,
      b.inclus_abonnement ? 1 : 0, b.couverture || null, JSON.stringify(b.manifeste)
    );
  } catch (e) {
    return NextResponse.json({ erreur: String(e) }, { status: 500 });
  }
  return NextResponse.json({ slug });
}

export async function PATCH(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { id, champ, valeur } = await req.json();
  if (!["publie", "mystere_du_mois", "inclus_abonnement", "gratuit"].includes(champ)) return NextResponse.json({}, { status: 400 });
  if (champ === "mystere_du_mois" && valeur) await executer("UPDATE livres SET mystere_du_mois = 0 WHERE id <> ?", id);
  await executer(`UPDATE livres SET ${champ} = ? WHERE id = ?`, valeur ? 1 : 0, id);
  return NextResponse.json({ ok: true });
}

// Modifier les informations d'un livre (titre, résumé, univers, fiches Shopify, lien boutique). L'adresse du livre ne change pas.
export async function PUT(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const b = await req.json();
  const titre = String(b.titre || "").trim().slice(0, 200);
  if (!b.id || !titre) return NextResponse.json({ erreur: "Le titre est obligatoire." }, { status: 400 });
  await executer("UPDATE livres SET titre = ?, resume = ?, univers = ?, shopify_product_id = ?, url_boutique = ? WHERE id = ?",
    titre, String(b.resume || "").slice(0, 2000) || null, String(b.univers || "creole"), produitShopify(b.produit), String(b.url_boutique || "").slice(0, 400) || null, b.id);
  return NextResponse.json({ ok: true });
}
