"use client";
// Bouton « Jouer sans connexion » : garde tous les jeux 2D sur l'appareil.
import { useEffect, useState } from "react";

export default function JeuxHorsLigne({ urls }: { urls: string[] }) {
  const [etat, setEtat] = useState<"rien" | "en-cours" | "pret">("rien");
  const [avance, setAvance] = useState(0);
  useEffect(() => {
    try { if (localStorage.getItem("kw-jeux-hors-ligne") === "1") setEtat("pret"); } catch {}
    const recevoir = (e: MessageEvent) => {
      if (e.data?.kw !== "progression-hors-ligne") return;
      setAvance(Math.round((e.data.fait / e.data.total) * 100));
      if (e.data.fait >= e.data.total) { setEtat("pret"); try { localStorage.setItem("kw-jeux-hors-ligne", "1"); } catch {} }
    };
    navigator.serviceWorker?.addEventListener("message", recevoir);
    return () => navigator.serviceWorker?.removeEventListener("message", recevoir);
  }, []);
  async function preparer() {
    const reg = await navigator.serviceWorker?.ready;
    if (!reg?.active) return alert("Le mode hors connexion n'est pas disponible sur ce navigateur.");
    setEtat("en-cours"); setAvance(0);
    reg.active.postMessage({ kw: "prechauffer", urls: ["/jeux", ...urls] });
  }
  return (
    <div className="hors-ligne-jeux">
      <span aria-hidden>{etat === "pret" ? "✅" : "📴"}</span>
      <div>
        <b>{etat === "pret" ? "Jeux disponibles sans connexion" : "Jouer sans connexion"}</b>
        <small>{etat === "en-cours" ? `Préparation… ${avance} %` : etat === "pret" ? "Tu peux jouer même sans réseau (à Mafate, dans le car…)." : "Garde les jeux sur ton appareil pour jouer partout."}</small>
      </div>
      <button className="btn" onClick={preparer} disabled={etat === "en-cours"}>{etat === "pret" ? "Mettre à jour" : "Préparer"}</button>
    </div>
  );
}
