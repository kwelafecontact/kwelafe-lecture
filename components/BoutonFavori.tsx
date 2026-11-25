"use client";
import { useState } from "react";

export default function BoutonFavori({ livreId, initial }: { livreId: string; initial: boolean }) {
  const [favori, setFavori] = useState(initial);
  const [anim, setAnim] = useState(false);
  async function basculer() {
    setFavori(!favori);
    setAnim(true);
    setTimeout(() => setAnim(false), 500);
    const r = await fetch("/api/favoris", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ livre: livreId }) });
    if (r.ok) setFavori((await r.json()).favori);
  }
  return (
    <button className={`bouton-favori ${favori ? "actif" : ""} ${anim ? "anim" : ""}`} onClick={basculer} aria-pressed={favori}>
      <span aria-hidden>{favori ? "❤" : "♡"}</span> {favori ? "Dans mes favoris" : "Ajouter aux favoris"}
    </button>
  );
}
