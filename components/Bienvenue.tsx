"use client";
import { useEffect, useState } from "react";
import Icone from "./Icones";

// Premier lancement : 3 écrans de bienvenue, puis une invitation discrète à installer l'app.
const ECRANS = [
  { img: "/visuels/accueil-reunion.webp", sur: "Bienvenue", titre: "Toute La Réunion dans une bibliothèque", texte: "Des livres sur l'île, le créole, le patrimoine et la nature, rangés par thème et par âge. Lisez sur téléphone, tablette ou ordinateur." },
  { img: "/visuels/coin-enfants.webp?v=2", sur: "Coin des enfants", titre: "Grandir avec son île", texte: "Des histoires à inventer, le créole en jeu, des coloriages, des puzzles et des fiches pour apprendre le volcan, les animaux ou les objets lontan." },
  { img: "/visuels/jeux-famille.webp?v=4", sur: "Chaque mois", titre: "Une bibliothèque qui grandit", texte: "Nouveaux livres, mystère du mois, quiz en famille et défis. Votre progression vous suit partout, et 5 livres restent lisibles sans connexion." },
];

type Evt = Event & { prompt: () => Promise<void> };

export default function Bienvenue() {
  const [etape, setEtape] = useState(-1);
  const [installer, setInstaller] = useState(false);
  const [evt, setEvt] = useState<Evt | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    try {
      const vu = localStorage.getItem("kw-bienvenue");
      const visites = Number(localStorage.getItem("kw-visites") || 0) + 1;
      localStorage.setItem("kw-visites", String(visites));
      if (!vu) setEtape(0);
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
      const refuse = localStorage.getItem("kw-installer-non");
      if (vu && !standalone && !refuse && visites >= 2) setInstaller(true);
    } catch {}
    const ua = navigator.userAgent;
    setIos(/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const f = (e: Event) => { e.preventDefault(); setEvt(e as Evt); };
    window.addEventListener("beforeinstallprompt", f);
    return () => window.removeEventListener("beforeinstallprompt", f);
  }, []);

  function finir() { try { localStorage.setItem("kw-bienvenue", "1"); } catch {} setEtape(-1); }

  if (etape >= 0) {
    const e = ECRANS[etape];
    const der = etape === ECRANS.length - 1;
    return (
      <div className="bienvenue-fond" role="dialog" aria-modal="true" aria-label="Bienvenue dans Kwélafé Lecture">
        <div className="bienvenue">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={e.img} alt="" />
          <div className="eyebrow">{e.sur}</div>
          <h2>{e.titre}</h2>
          <p>{e.texte}</p>
          <div className="bienvenue-points">{ECRANS.map((_, k) => <i key={k} className={k === etape ? "on" : ""} />)}</div>
          <div className="bienvenue-actions">
            <button className="app-lien" onClick={finir}>Passer</button>
            <button className="btn" onClick={() => (der ? finir() : setEtape(etape + 1))}>{der ? "C'est parti" : "Suivant"} <Icone nom="flecheD" taille={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  if (installer) {
    return (
      <div className="bandeau-installer" role="status">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icone-192.png" alt="" />
        <div><b>Installer Kwélafé sur votre écran d'accueil</b>{ios ? <>Dans Safari : bouton Partager <Icone nom="partager" taille={14} /> puis « Sur l'écran d'accueil ».</> : "Ouverture en plein écran, comme une vraie application."}</div>
        {evt && <button className="btn" onClick={async () => { await evt.prompt(); setInstaller(false); }}>Installer</button>}
        <button className="fermer" aria-label="Plus tard" onClick={() => { try { localStorage.setItem("kw-installer-non", "1"); } catch {} setInstaller(false); }}><Icone nom="fermer" taille={18} /></button>
      </div>
    );
  }
  return null;
}
