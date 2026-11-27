"use client";
import { useState } from "react";
import BoutonEcouter from "./BoutonEcouter";
import { COMPAGNONS, HEROS, LIEUX, OBJETS, histoire, type Choix } from "@/lib/zistoir";

const ETAPES = [
  { titre: "Choisis ton héros", liste: HEROS },
  { titre: "Où part-il ?", liste: LIEUX },
  { titre: "Avec quel compagnon ?", liste: COMPAGNONS },
  { titre: "Et dans le sac ?", liste: OBJETS },
] as const;

export default function FabriqueZistoir() {
  const [choix, setChoix] = useState<Choix[]>([]);
  const [page, setPage] = useState(0);
  const etape = choix.length;
  if (etape < 4) {
    const e = ETAPES[etape];
    return (
      <div className="fz">
        <div className="fz-etapes">{ETAPES.map((x, k) => <i key={k} className={k < etape ? "fait" : k === etape ? "ici" : ""}>{k < etape ? choix[k].emoji : k + 1}</i>)}</div>
        <h2>{e.titre}</h2>
        <div className="fz-cartes">
          {(e.liste as readonly Choix[]).map((c) => (
            <button key={c.id} onClick={() => setChoix([...choix, c])}><span>{c.emoji}</span>{c.nom[0].toUpperCase() + c.nom.slice(1)}</button>
          ))}
        </div>
        {etape > 0 && <button className="app-lien" onClick={() => setChoix(choix.slice(0, -1))}>← Revenir</button>}
      </div>
    );
  }
  const z = histoire(HEROS.find((x) => x.id === choix[0].id)!, LIEUX.find((x) => x.id === choix[1].id)!, COMPAGNONS.find((x) => x.id === choix[2].id)!, OBJETS.find((x) => x.id === choix[3].id)!);
  const finie = page >= z.pages.length - 1;
  return (
    <div className="fz-livre">
      <div className="fz-couv">{choix.map((c) => c.emoji).join(" ")}</div>
      <h2>{z.titre}</h2>
      <p className="fz-texte">{z.pages[page]}</p>
      <BoutonEcouter texte={(page === 0 ? z.titre + ". " : "") + z.pages[page]} />
      <div className="fz-nav">
        <button className="ce-gros secondaire" disabled={page === 0} onClick={() => setPage(page - 1)}>←</button>
        <span>{page + 1} / {z.pages.length}</span>
        {!finie ? <button className="ce-gros" onClick={() => setPage(page + 1)}>→</button> : <button className="ce-gros" onClick={() => { setChoix([]); setPage(0); }}>✨ Une autre</button>}
      </div>
    </div>
  );
}
