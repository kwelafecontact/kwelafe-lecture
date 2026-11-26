"use client";
// Tableau blanc de l'enseignant : écrire, dessiner, ajouter du texte, effacer. Fonctionne au doigt, au stylet et à la souris.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Outil = "stylo" | "surligneur" | "gomme" | "texte" | "ligne" | "rect" | "rond";
const COULEURS = ["#111111", "#d6332a", "#1f6fb2", "#2e9d4f", "#e8a200", "#7a2e8f", "#ffffff"];
const FONDS = { blanc: "#ffffff", noir: "#1d2b24", ligne: "#ffffff", carreaux: "#ffffff" } as const;
type Fond = keyof typeof FONDS;

export default function TableauBlanc() {
  const toile = useRef<HTMLCanvasElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [outil, setOutil] = useState<Outil>("stylo");
  const [couleur, setCouleur] = useState("#111111");
  const [epaisseur, setEpaisseur] = useState(4);
  const [fond, setFond] = useState<Fond>("blanc");
  const [texte, setTexte] = useState<{ x: number; y: number; v: string } | null>(null);
  const historique = useRef<ImageData[]>([]);
  const futur = useRef<ImageData[]>([]);
  const trace = useRef<{ actif: boolean; x: number; y: number; depart?: ImageData; x0: number; y0: number }>({ actif: false, x: 0, y: 0, x0: 0, y0: 0 });

  const ctx = () => toile.current!.getContext("2d")!;
  const memoriser = useCallback(() => {
    const c = toile.current!; historique.current.push(ctx().getImageData(0, 0, c.width, c.height));
    if (historique.current.length > 40) historique.current.shift();
    futur.current = [];
  }, []);

  // Taille de la toile = taille de l'écran (on garde le dessin en cas de rotation)
  useEffect(() => {
    const ajuster = () => {
      const c = toile.current!, z = zone.current!; const r = window.devicePixelRatio || 1;
      const ancien = c.width ? ctx().getImageData(0, 0, c.width, c.height) : null;
      c.width = z.clientWidth * r; c.height = z.clientHeight * r;
      c.style.width = z.clientWidth + "px"; c.style.height = z.clientHeight + "px";
      const x = ctx(); x.setTransform(r, 0, 0, r, 0, 0); x.lineCap = "round"; x.lineJoin = "round";
      if (ancien) x.putImageData(ancien, 0, 0);
    };
    ajuster(); window.addEventListener("resize", ajuster);
    return () => window.removeEventListener("resize", ajuster);
  }, []);

  const pos = (e: React.PointerEvent) => { const r = toile.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const style = (x: CanvasRenderingContext2D) => {
    x.globalCompositeOperation = outil === "gomme" ? "destination-out" : "source-over";
    x.globalAlpha = outil === "surligneur" ? 0.3 : 1;
    x.strokeStyle = couleur; x.lineWidth = outil === "gomme" ? epaisseur * 6 : outil === "surligneur" ? epaisseur * 4 : epaisseur;
  };

  function bas(e: React.PointerEvent) {
    const p = pos(e);
    if (outil === "texte") { setTexte({ x: p.x, y: p.y, v: "" }); return; }
    (e.target as Element).setPointerCapture(e.pointerId);
    memoriser();
    const c = toile.current!;
    trace.current = { actif: true, x: p.x, y: p.y, x0: p.x, y0: p.y, depart: ["ligne", "rect", "rond"].includes(outil) ? ctx().getImageData(0, 0, c.width, c.height) : undefined };
    const x = ctx(); style(x); x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + 0.1, p.y + 0.1); x.stroke();
  }
  function bouge(e: React.PointerEvent) {
    const t = trace.current; if (!t.actif) return;
    const p = pos(e); const x = ctx(); style(x);
    if (t.depart) {
      x.putImageData(t.depart, 0, 0); x.beginPath();
      if (outil === "ligne") { x.moveTo(t.x0, t.y0); x.lineTo(p.x, p.y); }
      else if (outil === "rect") x.rect(t.x0, t.y0, p.x - t.x0, p.y - t.y0);
      else x.ellipse((t.x0 + p.x) / 2, (t.y0 + p.y) / 2, Math.abs(p.x - t.x0) / 2, Math.abs(p.y - t.y0) / 2, 0, 0, Math.PI * 2);
      x.stroke(); return;
    }
    x.beginPath(); x.moveTo(t.x, t.y); x.lineTo(p.x, p.y); x.stroke();
    t.x = p.x; t.y = p.y;
  }
  const haut = () => { trace.current.actif = false; const x = ctx(); x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; };

  function poserTexte() {
    if (!texte || !texte.v.trim()) { setTexte(null); return; }
    memoriser();
    const x = ctx(); x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
    x.fillStyle = couleur; x.font = `700 ${12 + epaisseur * 4}px system-ui, sans-serif`; x.textBaseline = "top";
    texte.v.split("\n").forEach((l, k) => x.fillText(l, texte.x, texte.y + k * (16 + epaisseur * 5)));
    setTexte(null);
  }
  function annuler() { const h = historique.current.pop(); if (!h) return; const c = toile.current!; futur.current.push(ctx().getImageData(0, 0, c.width, c.height)); ctx().putImageData(h, 0, 0); }
  function refaire() { const f = futur.current.pop(); if (!f) return; const c = toile.current!; historique.current.push(ctx().getImageData(0, 0, c.width, c.height)); ctx().putImageData(f, 0, 0); }
  function effacerTout() { if (!confirmerEffacer()) return; memoriser(); const c = toile.current!; ctx().clearRect(0, 0, c.width, c.height); }
  // Pas de fenêtre « confirm » du navigateur : un double appui suffit
  const dernierAppui = useRef(0);
  function confirmerEffacer() { const t = Date.now(); const ok = t - dernierAppui.current < 1500; dernierAppui.current = t; if (!ok) alerteBreve("Appuie encore une fois pour tout effacer"); return ok; }
  const [message, setMessage] = useState("");
  function alerteBreve(m: string) { setMessage(m); setTimeout(() => setMessage(""), 1500); }

  function enregistrer() {
    const c = toile.current!; const o = document.createElement("canvas"); o.width = c.width; o.height = c.height;
    const x = o.getContext("2d")!; x.fillStyle = FONDS[fond]; x.fillRect(0, 0, o.width, o.height); x.drawImage(c, 0, 0);
    const a = document.createElement("a"); a.download = `tableau-kwelafe-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.png`; a.href = o.toDataURL("image/png"); a.click();
  }
  function pleinEcran() { const d: any = document; const el: any = document.documentElement; if (!d.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el); else d.exitFullscreen?.(); }

  const OUTILS: [Outil, string, string][] = [["stylo", "✏️", "Stylo"], ["surligneur", "🖍️", "Surligneur"], ["texte", "🔤", "Texte"], ["ligne", "📏", "Ligne"], ["rect", "▭", "Rectangle"], ["rond", "◯", "Cercle"], ["gomme", "🧽", "Gomme"]];
  return (
    <div className={`tableau-blanc fond-${fond}`}>
      <div className="tb-barre">
        <Link href="/ecole" className="tb-btn" aria-label="Retour">←</Link>
        <span className="tb-sep" />
        {OUTILS.map(([id, ico, nom]) => <button key={id} className={`tb-btn ${outil === id ? "actif" : ""}`} onClick={() => setOutil(id)} title={nom} aria-label={nom}>{ico}</button>)}
        <span className="tb-sep" />
        {COULEURS.map((c) => <button key={c} className={`tb-couleur ${couleur === c ? "actif" : ""}`} style={{ background: c }} onClick={() => { setCouleur(c); if (outil === "gomme") setOutil("stylo"); }} aria-label={`Couleur ${c}`} />)}
        <input type="range" min={1} max={14} value={epaisseur} onChange={(e) => setEpaisseur(+e.target.value)} aria-label="Épaisseur" className="tb-epaisseur" />
        <span className="tb-sep" />
        <button className="tb-btn" onClick={annuler} title="Annuler" aria-label="Annuler">↶</button>
        <button className="tb-btn" onClick={refaire} title="Refaire" aria-label="Refaire">↷</button>
        <button className="tb-btn" onClick={effacerTout} title="Tout effacer (appuyer deux fois)" aria-label="Tout effacer">🗑️</button>
        <select value={fond} onChange={(e) => setFond(e.target.value as Fond)} aria-label="Fond du tableau" className="tb-select">
          <option value="blanc">Tableau blanc</option><option value="noir">Tableau noir</option><option value="ligne">Lignes</option><option value="carreaux">Carreaux</option>
        </select>
        <button className="tb-btn" onClick={enregistrer} title="Enregistrer en image" aria-label="Enregistrer">💾</button>
        <button className="tb-btn" onClick={pleinEcran} title="Plein écran" aria-label="Plein écran">⛶</button>
      </div>
      <div className="tb-zone" ref={zone}>
        <canvas ref={toile} onPointerDown={bas} onPointerMove={bouge} onPointerUp={haut} onPointerCancel={haut} style={{ cursor: outil === "texte" ? "text" : "crosshair" }} />
        {texte && (
          <textarea autoFocus className="tb-texte" style={{ left: texte.x, top: texte.y, color: couleur, fontSize: 12 + epaisseur * 4 }} value={texte.v}
            onChange={(e) => setTexte({ ...texte, v: e.target.value })} onBlur={poserTexte} placeholder="Écris ici…" />
        )}
        {message && <div className="tb-message">{message}</div>}
      </div>
    </div>
  );
}
