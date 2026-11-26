"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { estHL, supprimerHL, telechargerHL } from "@/lib/hors-ligne";

export default function BoutonHorsLigne({ livreId }: { livreId: string }) {
  const [etat, setEtat] = useState<"?" | "non" | "oui" | "encours">("?");
  const [pct, setPct] = useState(0);
  const [erreur, setErreur] = useState("");
  useEffect(() => { if (typeof indexedDB === "undefined") return; estHL(livreId).then((v) => setEtat(v ? "oui" : "non")).catch(() => setEtat("non")); }, [livreId]);
  if (etat === "?") return null;
  async function lancer() {
    setErreur(""); setEtat("encours"); setPct(0);
    try { await telechargerHL(livreId, (f, t) => setPct(Math.round((f / t) * 100))); setEtat("oui"); }
    catch (e: any) { setErreur(e.message || "Erreur"); await supprimerHL(livreId).catch(() => {}); setEtat("non"); }
  }
  return (
    <div className="bloc-hors-ligne">
      {etat === "non" && <button className="btn secondaire large" onClick={lancer}>⬇️ Lire sans connexion</button>}
      {etat === "encours" && <div className="barre-telechargement"><span style={{ width: `${pct}%` }} /><b>Téléchargement… {pct} %</b></div>}
      {etat === "oui" && (
        <div className="hl-ok">
          ✅ Disponible sans connexion · <Link href="/mes-livres-hors-ligne">Mes livres hors connexion</Link>
          <button className="lien" onClick={async () => { await supprimerHL(livreId); setEtat("non"); }}>Retirer</button>
        </div>
      )}
      {erreur && <p className="texte-doux" style={{ color: "#c0392b" }}>{erreur}</p>}
    </div>
  );
}
