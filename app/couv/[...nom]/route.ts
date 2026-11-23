// Couvertures des livres (publiques).
import { NextRequest, NextResponse } from "next/server";
import { stockage } from "@/lib/cf";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ nom: string[] }> }) {
  const { nom } = await params;
  const chemin = nom.map(decodeURIComponent).join("/");
  if (chemin.includes("..")) return new NextResponse("Interdit", { status: 403 });
  const objet = await (await stockage()).get(`couvertures/${chemin}`);
  if (!objet) return new NextResponse("Introuvable", { status: 404 });
  return new NextResponse(objet.body, {
    headers: { "Content-Type": objet.httpMetadata?.contentType || "image/jpeg", "Cache-Control": "public, max-age=86400" },
  });
}
