import { NextRequest, NextResponse } from "next/server";
import { lireSession } from "@/lib/session";
import { client } from "@/lib/donnees";
import { premier, executer } from "@/lib/cf";

export async function POST(req: NextRequest) {
  const session = await lireSession();
  if (!session) return NextResponse.json({ message: "Connecte-toi d'abord." }, { status: 401 });
  const { code } = await req.json();
  const propre = String(code || "").trim().toUpperCase().replace(/\s+/g, "");
  const c = await premier<any>("SELECT * FROM codes_cadeaux WHERE code = ?", propre);
  if (!c) return NextResponse.json({ message: "Ce code n'existe pas. Vérifie les lettres et les chiffres." }, { status: 404 });
  if (c.utilise_le) return NextResponse.json({ message: "Ce code a déjà été activé." }, { status: 409 });

  const moi = await client(session);
  const depart = moi.cadeau_jusqu && new Date(moi.cadeau_jusqu) > new Date() ? new Date(moi.cadeau_jusqu) : new Date();
  depart.setMonth(depart.getMonth() + c.duree_mois);

  // Réservation atomique du code (évite une double activation).
  const pris = await executer("UPDATE codes_cadeaux SET utilise_par = ?, utilise_le = ? WHERE code = ? AND utilise_le IS NULL", session.cid, new Date().toISOString(), propre);
  if (!pris) return NextResponse.json({ message: "Ce code a déjà été activé." }, { status: 409 });

  await executer("UPDATE clients SET cadeau_jusqu = ? WHERE id = ?", depart.toISOString(), session.cid);
  const fin = depart.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return NextResponse.json({ message: `Merci ! Ton accès est ouvert jusqu'au ${fin}. Bonne lecture !` });
}
