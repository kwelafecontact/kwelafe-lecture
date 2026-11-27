"use client";
// Barrière parentale : un petit calcul à résoudre avant d'ouvrir l'espace parents (recommandation Apple / Google pour les apps enfants).
import { useEffect, useMemo, useState } from "react";

export default function BarriereParentale({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => { try { if (sessionStorage.getItem("kw-parent") === "1") setOk(true); } catch {} }, []);
  const [rep, setRep] = useState("");
  const [err, setErr] = useState(false);
  const q = useMemo(() => { const a = 6 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7); return { a, b, r: a * b }; }, [err]);
  if (ok) return <>{children}</>;
  return (
    <div className="barriere">
      <div className="barriere-ico">🔒</div>
      <h1>Espace réservé aux parents</h1>
      <p>Pour continuer, réponds à ce petit calcul.</p>
      <div className="barriere-q">{q.a} × {q.b} = ?</div>
      <input inputMode="numeric" value={rep} onChange={(e) => setRep(e.target.value.replace(/\D/g, ""))} aria-label="Résultat" autoFocus />
      <button className="btn large" onClick={() => {
        if (Number(rep) === q.r) { try { sessionStorage.setItem("kw-parent", "1"); } catch {} setOk(true); }
        else { setErr(!err); setRep(""); }
      }}>Valider</button>
    </div>
  );
}
