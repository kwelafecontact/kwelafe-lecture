"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BasculeAdmin({ id, champ, valeur, libelle }: { id: string; champ: string; valeur: boolean; libelle: string }) {
  const [v, setV] = useState(valeur);
  const router = useRouter();
  async function changer() {
    const nv = !v;
    setV(nv);
    await fetch("/api/admin/livres", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, champ, valeur: nv }) });
    router.refresh();
  }
  return (
    <label className="case" style={{ fontSize: 14 }}>
      <input type="checkbox" checked={v} onChange={changer} /> {libelle}
    </label>
  );
}
