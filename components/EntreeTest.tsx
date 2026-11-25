"use client";
import { useState } from "react";

export default function EntreeTest() {
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  async function entrer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur("");
    const r = await fetch("/api/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    if (r.ok) { window.location.href = "/"; return; }
    setErreur((await r.json().catch(() => ({}))).erreur || "Code refusé.");
    setEnCours(false);
  }
  return (
    <form className="actions" onSubmit={entrer}>
      <input className="champ" value={code} onChange={(e) => setCode(e.target.value)} placeholder="KWTEST-XXXX-XXXX-XXXX" autoComplete="off" aria-label="Code test" required />
      <button className="btn large" disabled={enCours}>{enCours ? "Vérification…" : "Entrer"}</button>
      {erreur && <p className="message erreur">{erreur}</p>}
    </form>
  );
}
