"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActiverCode() {
  const [code, setCode] = useState("");
  const [etat, setEtat] = useState<{ ok: boolean; texte: string } | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  async function activer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setEtat(null);
    const r = await fetch("/api/cadeau", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    const j = await r.json();
    setEnvoi(false);
    setEtat({ ok: r.ok, texte: j.message });
    if (r.ok) { setCode(""); router.refresh(); }
  }

  return (
    <form onSubmit={activer} style={{ display: "grid", gap: 12, marginTop: 12 }}>
      <input className="champ" placeholder="KWELA-XXXX-XXXX" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Code cadeau" autoCapitalize="characters" autoComplete="off" />
      <button className="btn" disabled={envoi || code.trim().length < 6}>{envoi ? "Un instant…" : "Activer mon cadeau"}</button>
      {etat && <div className={`message ${etat.ok ? "ok" : "erreur"}`}>{etat.texte}</div>}
    </form>
  );
}
