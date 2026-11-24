// Couverture tirée du livre lui-même : la première page d'un livre PDF (toujours à jour).
import { NextRequest, NextResponse } from "next/server";
import { stockage } from "@/lib/cf";
import { livreParId } from "@/lib/donnees";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const livre = await livreParId(id);
  if (!livre || livre.manifeste.type !== "pdf") return new NextResponse("Introuvable", { status: 404 });
  const ext = livre.manifeste.ext || "webp";
  const objet = await (await stockage()).get(`livres/${id}/pdf/1.${ext}`);
  if (!objet) return new NextResponse("Introuvable", { status: 404 });
  return new NextResponse(objet.body, {
    headers: { "Content-Type": ext === "jpg" ? "image/jpeg" : "image/webp", "Cache-Control": "public, max-age=3600" },
  });
}
