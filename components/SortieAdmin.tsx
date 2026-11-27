"use client";
import { useState } from "react";
export default function SortieAdmin({ id, valeur }: { id: string; valeur: string | null | undefined }) {
  const [v, setV] = useState(valeur || "");
  return (
    <label className="case" style={{ fontSize: 14 }}>Sortie le{" "}
      <input type="date" value={v} onChange={async (e) => { setV(e.target.value); await fetch("/api/admin/livres", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, champ: "sortie_le", valeur: e.target.value }) }); }} />
    </label>
  );
}
