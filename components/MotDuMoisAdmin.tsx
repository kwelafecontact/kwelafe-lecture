"use client";
import { useState } from "react";
export default function MotDuMoisAdmin({ valeur }: { valeur: string }) {
  const [v, setV] = useState(valeur);
  const [ok, setOk] = useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <textarea rows={3} value={v} maxLength={600} onChange={(e) => { setV(e.target.value); setOk(""); }} placeholder="Ex. : Ce mois-ci, 4 nouveaux livres arrivent, dont un sur le volcan…" />
      <div><button className="btn" onClick={async () => { await fetch("/api/admin/mot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ valeur: v }) }); setOk("Enregistré ✓ (laisse vide pour le retirer)"); }}>Enregistrer le mot du mois</button> <small>{ok}</small></div>
    </div>
  );
}
