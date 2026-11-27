"use client";
// Suppression définitive d'un brouillon, en deux temps pour éviter les erreurs.
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupprimerBrouillon({ id, titre }: { id: string; titre: string }) {
  const [etape, setEtape] = useState<"repos" | "confirmer" | "envoi">("repos");
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  async function supprimer() {
    setEtape("envoi"); setErreur("");
    const r = await fetch("/api/admin/livres", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) { router.refresh(); return; }
    const d = await r.json().catch(() => ({}));
    setErreur(d.erreur || "La suppression a échoué."); setEtape("repos");
  }

  if (etape === "repos") return (
    <span>
      <button className="bouton-suppr" onClick={() => setEtape("confirmer")}>🗑️ Supprimer</button>
      {erreur && <small className="texte-erreur"> {erreur}</small>}
    </span>
  );
  return (
    <div className="confirm-suppr">
      <p>Supprimer définitivement « {titre} » ? <strong>Impossible de revenir en arrière.</strong></p>
      <button className="bouton-suppr fort" disabled={etape === "envoi"} onClick={supprimer}>{etape === "envoi" ? "Suppression…" : "Oui, supprimer"}</button>
      <button className="bouton-secondaire" disabled={etape === "envoi"} onClick={() => setEtape("repos")}>Annuler</button>
    </div>
  );
}
