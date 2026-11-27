import { NextRequest, NextResponse } from "next/server";
import { executer } from "@/lib/cf";
import { lireSession } from "@/lib/session";

// « Préviens-moi » : le lecteur demande à être averti quand un livre à venir sort.
export async function POST(req: NextRequest) {
  const s = await lireSession();
  if (!s || s.visiteur) return NextResponse.json({ erreur: "connexion" }, { status: 401 });
  const { livre, action } = await req.json();
  if (typeof livre !== "string") return NextResponse.json({}, { status: 400 });
  if (action === "vu") await executer("UPDATE alertes SET vu = 1 WHERE client_id = ? AND livre_id = ?", s.cid, livre);
  else if (action === "retirer") await executer("DELETE FROM alertes WHERE client_id = ? AND livre_id = ?", s.cid, livre);
  else await executer("INSERT OR IGNORE INTO alertes (client_id, livre_id, cree_le) VALUES (?, ?, ?)", s.cid, livre, new Date().toISOString());
  return NextResponse.json({ ok: true });
}
