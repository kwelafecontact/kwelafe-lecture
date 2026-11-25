"use client";
// Espace éditeur : créer et désactiver les codes test de l'équipe.
import { useState } from "react";
import { useRouter } from "next/navigation";

type Ligne = { empreinte: string; nom: string; fin: string; revoque: number; dernier_usage: string | null; apercu: string };
const date = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function CodesTest({ codes }: { codes: Ligne[] }) {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [jours, setJours] = useState(30);
  const [nouveau, setNouveau] = useState<{ code: string; nom: string } | null>(null);
  const [erreur, setErreur] = useState("");
  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const r = await fetch("/api/admin/codes-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, jours }) });
    const j = await r.json();
    if (!r.ok) return setErreur(j.erreur || "Création impossible");
    setNouveau({ code: j.code, nom });
    setNom("");
    router.refresh();
  }
  async function revoquer(empreinte: string) {
    await fetch("/api/admin/codes-test", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ empreinte }) });
    router.refresh();
  }
  const actif = (c: Ligne) => !c.revoque && new Date(c.fin) > new Date();
  return (
    <div className="formulaire">
      <p className="texte-doux" style={{ margin: 0 }}>
        Chaque code ouvre toute l'application en lecture, comme un abonné, sans compte et sans accès à cet espace éditeur.
        La personne l'entre sur la page <b>/test</b> (lien « Accès équipe » sur l'écran de connexion).
      </p>
      <form onSubmit={creer} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ flex: "1 1 180px" }}>Prénom de la personne
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </label>
        <label>Durée
          <select value={jours} onChange={(e) => setJours(Number(e.target.value))}>
            <option value={7}>7 jours</option><option value={30}>30 jours</option><option value={90}>90 jours</option>
          </select>
        </label>
        <button className="btn">Créer un code</button>
      </form>
      {erreur && <div className="message erreur">{erreur}</div>}
      {nouveau && (
        <div className="message ok">
          Code pour {nouveau.nom} : <b style={{ letterSpacing: 1, userSelect: "all" }}>{nouveau.code}</b><br />
          Note-le maintenant : il ne sera plus affiché ensuite.
        </div>
      )}
      {codes.length > 0 && (
        <table className="tableau">
          <tbody>
            {codes.map((c) => (
              <tr key={c.empreinte}>
                <td><b>{c.nom}</b><div className="texte-doux" style={{ fontSize: 13 }}>…{c.apercu} · jusqu'au {date(c.fin)}{c.dernier_usage ? ` · utilisé le ${date(c.dernier_usage)}` : " · pas encore utilisé"}</div></td>
                <td>{actif(c) ? <button className="bouton-texte" type="button" onClick={() => revoquer(c.empreinte)}>Désactiver</button> : <span className="texte-doux">{c.revoque ? "Désactivé" : "Expiré"}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
