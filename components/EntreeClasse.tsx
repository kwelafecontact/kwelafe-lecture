"use client";
import { useState } from "react";

export default function EntreeClasse() {
  const [code, setCode] = useState("");
  const [prenom, setPrenom] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  async function entrer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur("");
    const r = await fetch("/api/classe/entrer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, prenom }) });
    if (r.ok) { try { sessionStorage.setItem("kw-portail", "1"); } catch {} window.location.href = "/classe"; return; }
    setErreur((await r.json().catch(() => ({}))).erreur || "Code refusé.");
    setEnCours(false);
  }
  return (
    <form className="actions" onSubmit={entrer} style={{ maxWidth: "none" }}>
      <input className="champ" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Ton prénom (facultatif)" autoComplete="given-name" aria-label="Prénom" />
      <input className="champ" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ECOLE-XXXX-XXXX" autoComplete="off" aria-label="Code de la classe" required style={{ letterSpacing: 1, textTransform: "uppercase" }} />
      <button className="btn large" disabled={enCours}>{enCours ? "Vérification…" : "Entrer dans ma classe"}</button>
      {erreur && <p className="message erreur">{erreur}</p>}
    </form>
  );
}
