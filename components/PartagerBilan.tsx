"use client";
import { useState } from "react";
export default function PartagerBilan({ texte }: { texte: string }) {
  const [ok, setOk] = useState(false);
  async function partager() {
    const t = texte + " kwelafeproduction.com";
    try { if (navigator.share) { await navigator.share({ text: t }); return; } await navigator.clipboard.writeText(t); setOk(true); } catch {}
  }
  return <div className="bilan-partage"><p>{texte}</p><button className="btn" onClick={partager}>📤 Partager mon bilan</button>{ok && <small> Copié !</small>}</div>;
}
