"use client";
import { useEffect, useState } from "react";
import { DESSINS, PALETTE, type Dessin } from "@/lib/coloriages";
import { fx, preparerFx } from "@/lib/kwfx";

export default function Coloriage() {
  const [d, setD] = useState<Dessin | null>(null);
  const [couleur, setCouleur] = useState(PALETTE[0]);
  const [remp, setRemp] = useState<Record<number, string>>({});
  useEffect(() => { preparerFx({ theme: "flore", public: "enfant" }); }, []);
  useEffect(() => {
    if (!d) return;
    try { setRemp(JSON.parse(localStorage.getItem("kw-color-" + d.id) || "{}")); } catch { setRemp({}); }
  }, [d]);
  useEffect(() => { if (d) try { localStorage.setItem("kw-color-" + d.id, JSON.stringify(remp)); } catch {} }, [remp, d]);

  if (!d) return (
    <div className="sv-grille">
      {DESSINS.map((x) => <button key={x.id} style={{ ["--c" as any]: "#f08a24" }} onClick={() => setD(x)}><span>{x.emoji}</span><b>{x.titre}</b></button>)}
    </div>
  );

  function peindre(k: number, e: React.MouseEvent) {
    setRemp((r) => {
      const n = { ...r, [k]: couleur };
      if (Object.keys(n).length === d!.zones.length && Object.keys(r).length < d!.zones.length) setTimeout(() => fx("victoire"), 100);
      return n;
    });
    fx("clic", e.currentTarget as Element);
  }

  return (
    <div className="col-zone">
      <h2>{d.emoji} {d.titre}</h2>
      <svg viewBox={d.vb} className="col-svg" role="img" aria-label={`Coloriage : ${d.titre}`}>
        {d.zones.map((z, k) => <path key={k} d={z} fill={remp[k] || "#fff"} stroke="#2b2b2b" strokeWidth={3} strokeLinejoin="round" fillRule="evenodd" onClick={(e) => peindre(k, e)} />)}
        {d.traits?.map((t, k) => <path key={"t" + k} d={t} fill="none" stroke="#2b2b2b" strokeWidth={3} pointerEvents="none" />)}
      </svg>
      <div className="col-palette">
        {PALETTE.map((c) => <button key={c} aria-label={`Couleur ${c}`} className={c === couleur ? "sel" : ""} style={{ background: c }} onClick={() => setCouleur(c)} />)}
      </div>
      <div className="fz-nav">
        <button className="ce-gros secondaire" onClick={() => setRemp({})}>🧽 Effacer</button>
        <button className="ce-gros" onClick={() => setD(null)}>Un autre dessin</button>
      </div>
    </div>
  );
}
