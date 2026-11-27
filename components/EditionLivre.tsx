"use client";
// Clic sur un livre dans l'espace éditeur : modifier son titre, son résumé, son univers et sa fiche boutique.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UNIVERS } from "@/lib/config";

type L = { id: string; titre: string; resume: string | null; univers: string | null; shopify_product_id: string | null; url_boutique: string | null };

export default function EditionLivre({ livre, sousTitre }: { livre: L; sousTitre: string }) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [f, setF] = useState({ titre: livre.titre, resume: livre.resume || "", univers: livre.univers || "creole", produit: (livre.shopify_product_id || "").split(",").map((x) => x.split("/").pop()).filter(Boolean).join(", "), url_boutique: livre.url_boutique || "" });
  const [msg, setMsg] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault(); setEnvoi(true); setMsg("");
    const r = await fetch("/api/admin/livres", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: livre.id, ...f }) });
    setEnvoi(false);
    if (!r.ok) { setMsg((await r.json().catch(() => ({}))).erreur || "Enregistrement impossible"); return; }
    setMsg("✅ Enregistré"); setOuvert(false); router.refresh();
  }

  if (!ouvert) return (
    <button type="button" className="titre-editable" onClick={() => setOuvert(true)} title="Modifier ce livre">
      <b>{livre.titre}</b> <span aria-hidden>✏️</span>
      <div className="texte-doux" style={{ fontSize: 13 }}>{sousTitre}</div>
      {msg && <small>{msg}</small>}
    </button>
  );
  return (
    <form onSubmit={enregistrer} className="form-edition-livre">
      <label>Titre<input value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} required maxLength={200} /></label>
      <label>Résumé (affiché sur la fiche du livre)<textarea rows={4} value={f.resume} onChange={(e) => setF({ ...f, resume: e.target.value })} maxLength={2000} /></label>
      <label>Univers (rayon de l'app)
        <select value={f.univers} onChange={(e) => setF({ ...f, univers: e.target.value })}>
          {UNIVERS.map((u) => <option key={u.id} value={u.id}>{u.emoji} {u.nom}</option>)}
        </select>
      </label>
      <label>Fiches Shopify qui donnent accès (numéros ou liens, séparés par des virgules)
        <input value={f.produit} onChange={(e) => setF({ ...f, produit: e.target.value })} placeholder="ex. 11389357916497" />
      </label>
      <label>Lien de la fiche sur la boutique<input value={f.url_boutique} onChange={(e) => setF({ ...f, url_boutique: e.target.value })} placeholder="https://kwelafeproduction.com/products/..." /></label>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
        <button type="button" className="btn secondaire" onClick={() => setOuvert(false)}>Annuler</button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
