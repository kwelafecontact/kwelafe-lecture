"use client";
// Espace éditeur : ouvrir l'accès d'une école, d'une médiathèque ou d'une collectivité.
import { useState } from "react";
import { useRouter } from "next/navigation";

type E = { id: string; nom: string; type: string; ville: string | null; admins: string; fin: string; actif: number; nb: number };

export default function EtablissementsAdmin({ etabs }: { etabs: E[] }) {
  const router = useRouter();
  const [f, setF] = useState({ nom: "", type: "ecole", ville: "", admins: "", mois: 12 });
  const [err, setErr] = useState("");
  const api = (method: string, body: object) => fetch("/api/admin/etablissements", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  async function creer(e: React.FormEvent) {
    e.preventDefault();
    const r = await api("POST", f);
    if (!r.ok) return setErr((await r.json()).erreur || "Erreur");
    setF({ nom: "", type: "ecole", ville: "", admins: "", mois: 12 });
    router.refresh();
  }
  return (
    <div className="formulaire">
      <form onSubmit={creer} style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flex: "2 1 220px" }}>Nom<input type="text" required value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="École Jean-Albany" /></label>
          <label style={{ flex: "1 1 140px" }}>Type
            <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
              <option value="ecole">École / collège</option><option value="mediatheque">Médiathèque</option><option value="collectivite">Collectivité</option>
            </select>
          </label>
          <label style={{ flex: "1 1 140px" }}>Ville<input type="text" value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} /></label>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <label style={{ flex: "3 1 260px" }}>E-mail(s) des responsables (séparés par des virgules)<input type="text" value={f.admins} onChange={(e) => setF({ ...f, admins: e.target.value })} placeholder="directrice@ecole.re" /></label>
          <label style={{ flex: "1 1 120px" }}>Durée
            <select value={f.mois} onChange={(e) => setF({ ...f, mois: Number(e.target.value) })}>
              <option value={1}>1 mois (essai)</option><option value={12}>12 mois</option><option value={24}>24 mois</option>
            </select>
          </label>
          <button className="btn">Ouvrir l'accès</button>
        </div>
      </form>
      {err && <div className="message erreur">{err}</div>}
      {etabs.length > 0 && (
        <table className="tableau"><tbody>
          {etabs.map((e) => (
            <tr key={e.id}>
              <td><b>{e.nom}</b><div className="texte-doux" style={{ fontSize: 13 }}>{e.type}{e.ville ? ` · ${e.ville}` : ""} · {e.nb} groupe{e.nb > 1 ? "s" : ""} · jusqu'au {new Date(e.fin).toLocaleDateString("fr-FR")} · {e.admins || "aucun responsable"}</div></td>
              <td style={{ whiteSpace: "nowrap" }}>
                <a className="bouton-texte" href={`/etablissement/gestion/${e.id}`}>Gérer</a>{" "}
                <button className="bouton-texte" type="button" onClick={async () => { await api("PATCH", { id: e.id, mois: 12 }); router.refresh(); }}>+12 mois</button>{" "}
                <button className="bouton-texte" type="button" onClick={async () => { await api("PATCH", { id: e.id, actif: !e.actif }); router.refresh(); }}>{e.actif ? "Suspendre" : "Réactiver"}</button>
              </td>
            </tr>
          ))}
        </tbody></table>
      )}
    </div>
  );
}
