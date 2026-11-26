"use client";
// Gestion d'un établissement par son responsable (enseignant, bibliothécaire, référent).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MOTS, type TypeEtab } from "@/lib/etab-mots";
import { NIVEAUX } from "@/lib/ecole";
import DevoirsGroupe from "@/components/DevoirsGroupe";

type G = { id: string; nom: string; niveau: string | null; responsable: string | null; apercu: string; actif: number; selection: string; message: string | null; connexions: number; dernier_usage: string | null };
type Props = { etab: { id: string; nom: string; type: TypeEtab; couleur: string; message: string; logo: string }; groupes: G[]; livres: { id: string; titre: string }[]; ressources: { id: string; titre: string; format: string }[]; jeux: { id: string; titre: string }[] };

const COULEURS = ["#2e9d4f", "#1f6fb2", "#d6332a", "#e8a200", "#4b3a78", "#b5562e", "#0f8b8d", "#1b2a4a"];
const date = (d: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "jamais");
const liste = (s: string): string[] => { try { return JSON.parse(s); } catch { return []; } };

export default function GestionEtab({ etab, groupes, livres, ressources, jeux }: Props) {
  const router = useRouter();
  const mots = MOTS[etab.type];
  const [perso, setPerso] = useState(etab);
  const [msg, setMsg] = useState("");
  const [nouveau, setNouveau] = useState({ nom: "", niveau: "", responsable: "" });
  const [codeAffiche, setCodeAffiche] = useState<{ groupe: string; code: string } | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);

  const api = (url: string, method: string, body: object) => fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, j: await r.json().catch(() => ({})) }));
  const dire = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

  async function enregistrerPerso() {
    const r = await api(`/api/etab/${etab.id}`, "PATCH", perso);
    dire(r.ok ? "Personnalisation enregistrée" : r.j.erreur || "Erreur");
    router.refresh();
  }
  async function chargerLogo(f: File | undefined) {
    if (!f) return;
    const img = new Image();
    img.src = URL.createObjectURL(f);
    await img.decode();
    const c = document.createElement("canvas");
    const k = Math.min(1, 256 / Math.max(img.width, img.height));
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    setPerso({ ...perso, logo: c.toDataURL("image/png") });
  }
  async function creer(e: React.FormEvent) {
    e.preventDefault();
    const r = await api(`/api/etab/${etab.id}/groupes`, "POST", nouveau);
    if (!r.ok) return dire(r.j.erreur || "Erreur");
    setCodeAffiche({ groupe: nouveau.nom, code: r.j.code });
    setNouveau({ nom: "", niveau: "", responsable: "" });
    router.refresh();
  }
  async function modifier(g: G, body: object) {
    const r = await api(`/api/etab/${etab.id}/groupes`, "PATCH", { groupe: g.id, ...body });
    if (r.j.code) setCodeAffiche({ groupe: g.nom, code: r.j.code });
    else dire(r.ok ? "Enregistré" : "Erreur");
    router.refresh();
  }

  return (
    <div className="gestion-etab">
      {msg && <div className="message ok" style={{ position: "sticky", top: 8, zIndex: 5 }}>{msg}</div>}

      <div className="outils-prof">
        <a className="btn large" href="/ecole/ressources">📚 Ressources pédagogiques</a>
        <a className="btn secondaire large" href="/tableau-blanc">🖍️ Tableau blanc</a>
      </div>
      <section className="panneau">
        <h2>🎨 Personnaliser {etab.type === "ecole" ? "l'école" : "l'espace"}</h2>
        <div className="formulaire">
          <label>Nom affiché<input type="text" value={perso.nom} onChange={(e) => setPerso({ ...perso, nom: e.target.value })} /></label>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Couleur</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COULEURS.map((c) => (
                <button key={c} type="button" onClick={() => setPerso({ ...perso, couleur: c })} aria-label={c} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: perso.couleur === c ? "4px solid #000" : "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
              ))}
            </div>
          </div>
          <label>Logo (image)
            <input type="file" accept="image/*" onChange={(e) => chargerLogo(e.target.files?.[0])} />
          </label>
          {perso.logo && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={perso.logo} alt="Logo" style={{ height: 56, borderRadius: 10 }} />
              <button type="button" className="bouton-texte" onClick={() => setPerso({ ...perso, logo: "" })}>Retirer</button>
            </div>
          )}
          <label>Message d'accueil pour tous les {mots.membres}
            <textarea rows={2} value={perso.message} onChange={(e) => setPerso({ ...perso, message: e.target.value })} placeholder="Bienvenue dans la bibliothèque numérique de l'école !" />
          </label>
          <div className="apercu-classe" style={{ ["--c" as any]: perso.couleur }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {perso.logo ? <img src={perso.logo} alt="" /> : <span>{mots.emoji}</span>}
            <b>{perso.nom}</b>
          </div>
          <button className="btn" onClick={enregistrerPerso}>Enregistrer</button>
        </div>
      </section>

      <section className="panneau">
        <h2>➕ Créer une {mots.groupe}</h2>
        <form className="formulaire" onSubmit={creer}>
          <label>Nom de la {mots.groupe}<input type="text" required value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} placeholder={etab.type === "ecole" ? "CE1 de Mme Payet" : "Club lecture du mercredi"} /></label>
          <label>Niveau
            <select value={nouveau.niveau} onChange={(e) => setNouveau({ ...nouveau, niveau: e.target.value })}>
              <option value="">Tous niveaux</option>
              {NIVEAUX.map((n) => <option key={n.id} value={n.id}>{n.nom}</option>)}
            </select>
          </label>
          <label>{mots.responsable[0].toUpperCase() + mots.responsable.slice(1)} (facultatif)<input type="text" value={nouveau.responsable} onChange={(e) => setNouveau({ ...nouveau, responsable: e.target.value })} placeholder="Mme Payet" /></label>
          <button className="btn">Créer et obtenir le code</button>
        </form>
        {codeAffiche && (
          <div className="message ok code-classe">
            Code d'accès pour <b>{codeAffiche.groupe}</b> :
            <strong style={{ userSelect: "all" }}>{codeAffiche.code}</strong>
            Donne ce code aux {mots.membres} : ils l'entrent dans « École et collectivité ». Note-le, il ne sera plus affiché.
          </div>
        )}
      </section>

      <section className="panneau">
        <h2>👥 Mes {mots.groupes} ({groupes.length})</h2>
        {groupes.length === 0 && <p className="texte-doux">Aucune {mots.groupe} pour l'instant.</p>}
        {groupes.map((g) => {
          const sel = liste(g.selection);
          const niveau = NIVEAUX.find((n) => n.id === g.niveau);
          return (
            <div key={g.id} className={`groupe-ligne ${g.actif ? "" : "inactif"}`}>
              <div className="groupe-tete" onClick={() => setOuvert(ouvert === g.id ? null : g.id)}>
                <div>
                  <b>{g.nom}</b>
                  <div className="texte-doux" style={{ fontSize: 13 }}>{niveau?.nom || "Tous niveaux"} · code …{g.apercu} · {g.connexions} connexion{g.connexions > 1 ? "s" : ""} · dernière : {date(g.dernier_usage)} · {sel.length} livre{sel.length > 1 ? "s" : ""} choisis</div>
                </div>
                <span>{ouvert === g.id ? "▲" : "▼"}</span>
              </div>
              {ouvert === g.id && (
                <div className="groupe-detail">
                  <label>Message pour la {mots.groupe}
                    <textarea rows={2} defaultValue={g.message || ""} onBlur={(e) => e.target.value !== (g.message || "") && modifier(g, { message: e.target.value })} placeholder="Cette semaine, on lit le conte de la page 12 !" />
                  </label>
                  <div style={{ fontWeight: 700, margin: "10px 0 6px" }}>Livres choisis pour la {mots.groupe}</div>
                  <div className="choix-livres">
                    {livres.map((l) => (
                      <label key={l.id} className="choix-livre">
                        <input type="checkbox" checked={sel.includes(l.id)} onChange={(e) => modifier(g, { selection: e.target.checked ? [...sel, l.id] : sel.filter((x) => x !== l.id) })} />
                        <span>{l.titre}</span>
                      </label>
                    ))}
                  </div>
                  <DevoirsGroupe etabId={etab.id} groupeId={g.id} livres={sel.length ? livres.filter((l) => sel.includes(l.id)) : livres} ressources={ressources} jeux={jeux} />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                    <button className="btn secondaire" onClick={() => confirm("Créer un nouveau code ? L'ancien ne marchera plus.") && modifier(g, { nouveauCode: true })}>🔑 Nouveau code</button>
                    <button className="btn secondaire" onClick={() => modifier(g, { actif: !g.actif })}>{g.actif ? "⏸ Suspendre l'accès" : "▶ Réactiver"}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
