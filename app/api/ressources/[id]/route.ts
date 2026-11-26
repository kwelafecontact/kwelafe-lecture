// Ouvre ou télécharge une ressource pédagogique : réservé aux enseignants (et à l'éditeur).
import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { premier, stockage } from "@/lib/cf";
import { estEnseignant, FORMATS_OK, type Ressource } from "@/lib/ressources";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const s = await lireSession();
  if (!(await estEnseignant(s))) return new NextResponse("Réservé aux enseignants.", { status: 403 });
  const r = await premier<Ressource>("SELECT * FROM ressources WHERE id = ?", (await params).id);
  if (!r) return new NextResponse("Introuvable", { status: 404 });
  const o = await (await stockage()).get(r.fichier);
  if (!o) return new NextResponse("Introuvable", { status: 404 });
  const nom = r.titre.normalize("NFD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "ressource";
  const telecharger = req.nextUrl.searchParams.get("dl");
  return new NextResponse(o.body, { headers: {
    "Content-Type": FORMATS_OK[r.format] || "application/octet-stream",
    "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename="${nom}.${r.format}"`,
    "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex",
  } });
}
