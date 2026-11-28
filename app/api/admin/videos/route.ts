import { NextRequest, NextResponse } from "next/server";
import { sessionAdmin } from "@/lib/admin";
import { executer } from "@/lib/cf";
import { idYoutube } from "@/lib/videos";

// Ajouter une vidéo en collant un lien YouTube : le titre et la chaîne sont lus automatiquement.
export async function POST(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { lien, theme, enfants, titre } = await req.json();
  const id = idYoutube(String(lien || ""));
  if (!id) return NextResponse.json({ erreur: "Lien YouTube non reconnu" }, { status: 400 });
  let t = String(titre || "").trim(), chaine = "";
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    if (r.ok) { const j = await r.json() as { title?: string; author_name?: string }; if (!t) t = j.title || ""; chaine = j.author_name || ""; }
    else if (!t) return NextResponse.json({ erreur: "Vidéo introuvable sur YouTube" }, { status: 404 });
  } catch { if (!t) return NextResponse.json({ erreur: "YouTube injoignable, indique un titre" }, { status: 502 }); }
  await executer("INSERT INTO videos (youtube_id, theme, enfants, titre, chaine, ordre) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(ordre),0)+1 FROM videos)) ON CONFLICT(youtube_id) DO UPDATE SET theme = excluded.theme, enfants = excluded.enfants, titre = excluded.titre, actif = 1", id, String(theme || "histoire"), enfants ? 1 : 0, t, chaine);
  return NextResponse.json({ ok: true, id, titre: t, chaine });
}

export async function DELETE(req: NextRequest) {
  if (!(await sessionAdmin())) return NextResponse.json({}, { status: 403 });
  const { id } = await req.json();
  await executer("UPDATE videos SET actif = 0 WHERE youtube_id = ?", String(id));
  return NextResponse.json({ ok: true });
}
