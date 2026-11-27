"use client";
import { useEffect } from "react";
// Marque comme vues les alertes affichées, pour ne pas les montrer en boucle.
export default function ArrivesVu({ ids }: { ids: string[] }) {
  useEffect(() => { const t = setTimeout(() => ids.forEach((livre) => fetch("/api/alertes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ livre, action: "vu" }) })), 4000); return () => clearTimeout(t); }, [ids]);
  return null;
}
