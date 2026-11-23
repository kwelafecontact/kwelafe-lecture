// Réception d'un morceau de livre envoyé depuis l'espace éditeur, rangé dans le stockage privé R2.
import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { stockage } from "@/lib/cf";

export async function PUT(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const chemin = req.nextUrl.searchParams.get("chemin") || "";
  const zone = req.nextUrl.searchParams.get("zone") === "couvertures" ? "couvertures" : "livres";
  if (!chemin || chemin.includes("..") || chemin.startsWith("/")) return NextResponse.json({ erreur: "chemin" }, { status: 400 });
  const contenu = await req.arrayBuffer();
  await (await stockage()).put(`${zone}/${chemin}`, contenu, {
    httpMetadata: { contentType: req.headers.get("content-type") || "application/octet-stream" },
  });
  return NextResponse.json({ ok: true });
}
