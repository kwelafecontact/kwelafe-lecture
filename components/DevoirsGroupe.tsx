"use client";
// Devoirs d'une classe, côté enseignant.
import { useEffect, useState } from "react";
import { TYPES_DEVOIR, dateDevoir } from "@/lib/devoirs";

type Opt = { id: string; titre: string };
type D = { id: string; titre: string; consigne: string | null; type: string; cible: string | null; echeance: string; faits: number; qui: string | null };
type Props = { etabId: string; groupeId: string; livres: Opt[]; ressources: (Opt & { format: string })[]; jeux: Opt[] };

const demain = () => { const d = new Date(Date.now() + 86400000); return d.toISOString().slice(0, 10); };

export default function DevoirsGroupe({ etabId, groupeId, livres, ressources, jeux }: Props) {
  const [liste, setListe] = useState<D[]>([]);
  const [f, setF] = useState({ titre: "", consigne: "", type: "lire", cible: "", echeance: demain() });
  const [msg, setMsg] = useState("");
  const charger = () => fetch(`/api/etab/${etabId}/devoirs?groupe=${groupeId}`).then((r) => r.json()).then((j) => setListe(j.liste || [])).catch(() => {});
  useEffect(() => { charger(); }, [groupeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = f.type === "lire" ? livres : f.type === "jeu" ? jeux : f.type === "ecouter" ? ressources.filter((r) => ["mp3"].includes(r.format)) : f.type === "fiche" ? ressources.filter((r) => r.format !== "mp3") : [];
  const nomCible = (d: D) => [...livres, ...ressources, ...jeux].find((o) => o.id === d.cible)?.titre;

  async function donner(e: React.FormEvent) {
    e.preventDefault();
    const titre = f.titre.trim() || (f.cible ? `${TYPES_DEVOIR[f.type].verbe} : ${options.find((o) => o.id === f.cible)?.titre || ""}` : "");
    const r = await fetch(`/api/etab/${etabId}/devoirs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupe: groupeId, ...f, titre }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(j.erreur || "Erreur"); return; }
    setMsg("✅ Devoir donné à la classe"); setTimeout(() => setMsg(""), 2500);
    setF({ ...f, titre: "", consigne: "", cible: "" }); charger();
  }
  async function retirer(id: string) {
    await fetch(`/api/etab/${etabId}/devoirs`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ groupe: groupeId, devoir: id }) });
    charger();
  }

  return (
    <div className="devoirs-prof">
      <div style={{ fontWeight: 700, margin: "14px 0 6px" }}>📌 Devoirs de la classe</div>
      <form onSubmit={donner} className="form-ress">
        <div className="ligne-form">
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, cible: "" })}>
            {Object.entries(TYPES_DEVOIR).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.nom}</option>)}
          </select>
          {f.type !== "autre" && (
            <select value={f.cible} onChange={(e) => setF({ ...f, cible: e.target.value })} required>
              <option value="">{options.length ? "Choisir…" : f.type === "ecouter" ? "Ajoute d'abord un MP3 dans les ressources" : "Rien à choisir pour l'instant"}</option>
              {options.map((o) => <option key={o.id} value={o.id}>{o.titre}</option>)}
            </select>
          )}
          <label className="champ-date">Pour le <input type="date" value={f.echeance} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setF({ ...f, echeance: e.target.value })} required /></label>
        </div>
        <input placeholder="Titre (facultatif, sinon il est créé tout seul)" value={f.titre} maxLength={120} onChange={(e) => setF({ ...f, titre: e.target.value })} required={f.type === "autre"} />
        <textarea rows={2} placeholder="Consigne : lis jusqu'à la page 10, puis dessine ton passage préféré…" value={f.consigne} maxLength={600} onChange={(e) => setF({ ...f, consigne: e.target.value })} />
        <button className="btn">Donner le devoir</button>
        {msg && <p>{msg}</p>}
      </form>
      {liste.length > 0 && (
        <ul className="liste-devoirs-prof">
          {liste.map((d) => (
            <li key={d.id} className={d.echeance < new Date().toISOString().slice(0, 10) ? "passe" : ""}>
              <div>
                <b>{TYPES_DEVOIR[d.type]?.emoji} {d.titre}</b>
                <small>Pour le {dateDevoir(d.echeance)}{nomCible(d) ? ` · ${nomCible(d)}` : ""}</small>
                <small>✅ {d.faits} élève{d.faits > 1 ? "s ont" : " a"} fini{d.qui ? ` : ${d.qui}` : ""}</small>
              </div>
              <button className="lien" onClick={() => retirer(d.id)}>Retirer</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
