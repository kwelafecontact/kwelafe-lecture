"use client";
import { useEffect, useState } from "react";

type Evt = Event & { prompt: () => Promise<void> };

export default function GuideInstallation() {
  const [appareil, setAppareil] = useState<"ios" | "android" | "autre">("autre");
  const [installe, setInstalle] = useState(false);
  const [evt, setEvt] = useState<Evt | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setAppareil(ios ? "ios" : /Android/.test(ua) ? "android" : "autre");
    setInstalle(window.matchMedia("(display-mode: standalone)").matches);
    const f = (e: Event) => { e.preventDefault(); setEvt(e as Evt); };
    window.addEventListener("beforeinstallprompt", f);
    return () => window.removeEventListener("beforeinstallprompt", f);
  }, []);

  if (installe) return <p className="statut ok">✓ L'application est installée</p>;

  return (
    <div>
      {appareil === "ios" && (
        <ol className="etapes">
          <li>Ouvre cette page dans <b>Safari</b>.</li>
          <li>Touche le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li>
          <li>Choisis <b>« Sur l'écran d'accueil »</b>, puis <b>Ajouter</b>.</li>
        </ol>
      )}
      {appareil === "android" && (
        evt ? (
          <button className="btn" onClick={() => evt.prompt()}>Installer l'application</button>
        ) : (
          <ol className="etapes">
            <li>Ouvre cette page dans <b>Chrome</b>.</li>
            <li>Touche les <b>trois points</b> en haut à droite.</li>
            <li>Choisis <b>« Installer l'application »</b> ou « Ajouter à l'écran d'accueil ».</li>
          </ol>
        )
      )}
      {appareil === "autre" && (
        evt ? <button className="btn" onClick={() => evt.prompt()}>Installer l'application</button>
            : <p className="texte-doux">Sur ordinateur, tu peux simplement ajouter cette page à tes favoris. Sur téléphone ou tablette, ouvre-la pour l'installer.</p>
      )}
    </div>
  );
}
