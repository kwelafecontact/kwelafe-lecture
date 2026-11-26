// Espace éditeur : ajouter ou retirer une ressource pédagogique (fichier gardé dans le stockage R2, jamais public).
import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { executer, premier, stockage } from "@/lib/cf";
import { FORMATS_OK, TYPES_RESSOURCE } from "@/lib/ressources";
import { NIVEAUX, THEMES } from "@/lib/ecole";

export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const f = await req.formData();
  const fichier = f.get("fichier");
  const titre = String(f.get("titre") || "").trim().slice(0, 120);
  const theme = String(f.get("theme") || ""), niveau = String(f.get("niveau") || ""), type = String(f.get("type") || "fiche");
  if (!(fichier instanceof File) || !titre) return NextResponse.json({ erreur: "Titre et fichier obligatoires." }, { status: 400 });
  if (!THEMES.some((t) => t.id === theme) || !NIVEAUX.some((n) => n.id === niveau)) return NextResponse.json({ erreur: "Thème ou niveau inconnu." }, { status: 400 });
  const ext = (fichier.name.split(".").pop() || "").toLowerCase();
  if (!FORMATS_OK[ext]) return NextResponse.json({ erreur: "Format accepté : PDF, image, Word, PowerPoint ou MP3." }, { status: 400 });
  if (fichier.size > 40 * 1024 * 1024) return NextResponse.json({ erreur: "Fichier trop lourd (40 Mo maximum)." }, { status: 400 });
  const id = crypto.randomUUID();
  const cle = `ressources/${id}.${ext}`;
  await (await stockage()).put(cle, await fichier.arrayBuffer(), { httpMetadata: { contentType: FORMATS_OK[ext] } });
  await executer("INSERT INTO ressources (id, titre, theme, niveau, type, description, fichier, format, taille, cree_le) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    id, titre, theme, niveau, TYPES_RESSOURCE[type] ? type : "fiche", String(f.get("description") || "").slice(0, 400) || null, cle, ext, fichier.size, new Date().toISOString());
  return NextResponse.json({ id });
}

export async function DELETE(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { id } = await req.json();
  const r = await premier<{ fichier: string }>("SELECT fichier FROM ressources WHERE id = ?", id);
  if (r) { try { await (await stockage()).delete?.(r.fichier); } catch {} await executer("DELETE FROM ressources WHERE id = ?", id); }
  return NextResponse.json({ ok: true });
}
