"use client";
import { useMemo, useState } from "react";
import CarteLivre from "./CarteLivre";
import type { Livre } from "@/lib/donnees";

type Item = { livre: Livre; pourcentage: number; termine: boolean };
const FILTRES = ["Tous", "En cours", "Terminés", "Interactifs"] as const;

export default function MesLivres({ items }: { items: Item[] }) {
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]>("Tous");
  const [q, setQ] = useState("");
  const liste = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => {
      if (t && !i.livre.titre.toLowerCase().includes(t)) return false;
      if (filtre === "En cours") return i.pourcentage > 0 && !i.termine;
      if (filtre === "Terminés") return i.termine;
      if (filtre === "Interactifs") return i.livre.type === "epub_interactif";
      return true;
    });
  }, [items, filtre, q]);

  return (
    <>
      <input className="recherche" type="search" placeholder="Chercher un livre…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Chercher un livre" />
      <div className="pastilles" role="tablist">
        {FILTRES.map((f) => (
          <button key={f} className={`pastille ${f === filtre ? "active" : ""}`} onClick={() => setFiltre(f)} role="tab" aria-selected={f === filtre}>
            {f}
          </button>
        ))}
      </div>
      {liste.length ? (
        <div className="grille">
          {liste.map((i) => (
            <CarteLivre key={i.livre.id} livre={i.livre} acces pourcentage={i.pourcentage} />
          ))}
        </div>
      ) : (
        <div className="vide"><div className="oiseau">🌿</div><p>Aucun livre ici pour le moment.</p></div>
      )}
    </>
  );
}
