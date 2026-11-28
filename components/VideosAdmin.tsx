"use client";
import { useState } from "react";
import { THEMES_VIDEO, type Video } from "@/lib/videos";

export default function VideosAdmin({ videos }: { videos: Video[] }) {
  const [lien, setLien] = useState(""); const [theme, setTheme] = useState("volcan"); const [enfants, setEnfants] = useState(true);
  const [msg, setMsg] = useState(""); const [liste, setListe] = useState(videos);
  async function ajouter() {
    setMsg("…");
    const r = await fetch("/api/admin/videos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lien, theme, enfants }) });
    const j = await r.json();
    if (!r.ok) { setMsg(j.erreur || "Erreur"); return; }
    setMsg(`Ajoutée : ${j.titre}`); setLien("");
    setListe([{ youtube_id: j.id, theme, enfants: enfants ? 1 : 0, titre: j.titre, chaine: j.chaine, duree: null, ordre: 999, actif: 1 }, ...liste.filter((v) => v.youtube_id !== j.id)]);
  }
  async function retirer(id: string) {
    await fetch("/api/admin/videos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setListe(liste.filter((v) => v.youtube_id !== id));
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={lien} onChange={(e) => setLien(e.target.value)} placeholder="Colle un lien YouTube" style={{ flex: "1 1 260px" }} />
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>{THEMES_VIDEO.map((t) => <option key={t.id} value={t.id}>{t.emoji} {t.nom}</option>)}</select>
        <label className="case"><input type="checkbox" checked={enfants} onChange={(e) => setEnfants(e.target.checked)} /> Adaptée aux enfants</label>
        <button className="btn" onClick={ajouter} disabled={!lien}>Ajouter</button>
      </div>
      {msg && <small>{msg}</small>}
      <details><summary>{liste.length} vidéos en ligne</summary>
        <ul style={{ fontSize: 14, columns: 2 }}>{liste.map((v) => <li key={v.youtube_id}>{v.titre} <i>({v.chaine})</i> <button className="app-lien" onClick={() => retirer(v.youtube_id)}>retirer</button></li>)}</ul>
      </details>
    </div>
  );
}
