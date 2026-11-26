"use client";
import { useState } from "react";
import { NIVEAUX, THEMES } from "@/lib/ecole";
import { TYPES_RESSOURCE } from "@/lib/ressources-types";

type R = { id: string; titre: string; theme: string; niveau: string; type: string; format: string };

export default function RessourcesAdmin({ liste }: { liste: R[] }) {
  const [items, setItems] = useState(liste);
  const [envoi, setEnvoi] = useState(false);
  const [msg, setMsg] = useState("");
  async function ajouter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setEnvoi(true); setMsg("");
    const form = e.currentTarget; const fd = new FormData(form);
    const r = await fetch("/api/admin/ressources", { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setEnvoi(false);
    if (!r.ok) { setMsg(j.erreur || "Envoi impossible"); return; }
    setItems([{ id: j.id, titre: String(fd.get("titre")), theme: String(fd.get("theme")), niveau: String(fd.get("niveau")), type: String(fd.get("type")), format: String((fd.get("fichier") as File).name.split(".").pop()) }, ...items]);
    setMsg("✅ Ressource ajoutée"); form.reset();
  }
  async function retirer(id: string) {
    await fetch("/api/admin/ressources", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems(items.filter((x) => x.id !== id));
  }
  return (
    <div>
      <form onSubmit={ajouter} className="form-ress">
        <input name="titre" placeholder="Titre de la fiche (ex. Les oiseaux endémiques)" required maxLength={120} />
        <div className="ligne-form">
          <select name="theme" required>{THEMES.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.nom}</option>)}</select>
          <select name="niveau" required>{NIVEAUX.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}</select>
          <select name="type">{Object.entries(TYPES_RESSOURCE).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.nom}</option>)}</select>
        </div>
        <textarea name="description" placeholder="Description courte (facultatif)" maxLength={400} rows={2} />
        <input type="file" name="fichier" required accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.mp3" />
        <button className="btn" disabled={envoi}>{envoi ? "Envoi…" : "Ajouter la ressource"}</button>
        {msg && <p>{msg}</p>}
      </form>
      <ul className="liste-admin-ress">
        {items.map((r) => (
          <li key={r.id}>
            <span>{TYPES_RESSOURCE[r.type]?.emoji} <b>{r.titre}</b> · {THEMES.find((t) => t.id === r.theme)?.nom} · {NIVEAUX.find((n) => n.id === r.niveau)?.nom} · {r.format.toUpperCase()}</span>
            <button className="lien" onClick={() => retirer(r.id)}>Retirer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
