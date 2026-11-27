"use client";
import { useEffect, useState } from "react";
import { fx, preparerFx } from "@/lib/kwfx";

const IMAGES = [
  { src: "/visuels/coin-enfants.webp?v=2", titre: "Les enfants lisent" },
  { src: "/visuels/accueil-reunion.webp", titre: "Paysage de l'île" },
  { src: "/visuels/jeux-famille.webp?v=4", titre: "En famille" },
  { src: "/apprendre/mascotte.webp", titre: "Kwélafé" },
];

function melanger(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  do { for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } } while (a.every((v, i) => v === i));
  return a;
}

export default function Puzzle() {
  const [img, setImg] = useState<(typeof IMAGES)[number] | null>(null);
  const [taille, setTaille] = useState(3);
  const [ordre, setOrdre] = useState<number[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [coups, setCoups] = useState(0);
  const [ratio, setRatio] = useState(1);
  useEffect(() => { preparerFx({ theme: "lagon", public: "enfant" }); }, []);
  const fini = ordre.length > 0 && ordre.every((v, i) => v === i);

  function demarrer(i: (typeof IMAGES)[number], t = taille) { const im = new Image(); im.onload = () => setRatio(im.naturalWidth / im.naturalHeight || 1); im.src = i.src; setImg(i); setTaille(t); setOrdre(melanger(t * t)); setSel(null); setCoups(0); }

  if (!img) return (
    <>
      <div className="pz-niveaux">
        {[2, 3, 4].map((t) => <button key={t} className={t === taille ? "sel" : ""} onClick={() => setTaille(t)}>{t === 2 ? "🐣 Facile" : t === 3 ? "🐢 Moyen" : "🦅 Difficile"}</button>)}
      </div>
      <div className="pz-choix">
        {IMAGES.map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <button key={i.src} onClick={() => demarrer(i)}><img src={i.src} alt="" /><b>{i.titre}</b></button>
        ))}
      </div>
    </>
  );

  function toucher(p: number, e: React.MouseEvent) {
    if (fini) return;
    if (sel === null) { setSel(p); fx("clic", e.currentTarget as Element); return; }
    if (sel === p) { setSel(null); return; }
    const n = [...ordre]; [n[sel], n[p]] = [n[p], n[sel]];
    setOrdre(n); setSel(null); setCoups(coups + 1);
    if (n[p] === p || n[sel] === sel) fx("bonne", e.currentTarget as Element);
    if (n.every((v, i) => v === i)) setTimeout(() => fx("victoire"), 150);
  }

  return (
    <div className="pz-zone">
      <p className="pz-aide">{fini ? `🎉 Bravo ! Puzzle fini en ${coups} coups.` : "Touche deux pièces pour les échanger."}</p>
      <div className="pz-grille" style={{ gridTemplateColumns: `repeat(${taille}, 1fr)`, aspectRatio: String(ratio) }}>
        {ordre.map((piece, p) => {
          const x = piece % taille, y = Math.floor(piece / taille);
          return <button key={p} className={`pz-piece ${sel === p ? "sel" : ""} ${piece === p ? "bien" : ""}`} onClick={(e) => toucher(p, e)}
            style={{ backgroundImage: `url(${img.src})`, backgroundSize: `${taille * 100}% ${taille * 100}%`, backgroundPosition: `${(x / (taille - 1)) * 100}% ${(y / (taille - 1)) * 100}%` }} aria-label={`Pièce ${p + 1}`} />;
        })}
      </div>
      <div className="fz-nav">
        <button className="ce-gros secondaire" onClick={() => demarrer(img)}>🔀 Mélanger</button>
        <button className="ce-gros" onClick={() => setImg(null)}>Une autre image</button>
      </div>
    </div>
  );
}
