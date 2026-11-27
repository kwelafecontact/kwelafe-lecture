"use client";
import { useEffect, useState } from "react";
import { SAVOIRS, type Savoir } from "@/lib/savoirs-enfants";
import { fx, preparerFx } from "@/lib/kwfx";
import BoutonEcouter from "./BoutonEcouter";

export default function SavoirsEnfants() {
  const [s, setS] = useState<Savoir | null>(null);
  const [i, setI] = useState(0);
  const [quiz, setQuiz] = useState(false);
  useEffect(() => { preparerFx({ theme: "reunion", public: "enfant" }); }, []);

  if (!s) return (
    <div className="sv-grille">
      {SAVOIRS.map((x) => (
        <button key={x.id} style={{ ["--c" as any]: x.couleur }} onClick={() => { setS(x); setI(0); setQuiz(false); }}>
          <span>{x.emoji}</span><b>{x.titre}</b><small>{x.intro}</small>
        </button>
      ))}
    </div>
  );

  const retour = <button className="app-lien" onClick={() => setS(null)}>← Tous les thèmes</button>;
  if (quiz) return <><Quiz s={s} onFin={() => setS(null)} />{retour}</>;
  const f = s.fiches[i];
  const der = i >= s.fiches.length - 1;
  return (
    <div className="sv-fiche" style={{ ["--c" as any]: s.couleur }}>
      <div className="sv-haut"><span>{s.emoji} {s.titre}</span><span>{i + 1} / {s.fiches.length}</span></div>
      <div className="sv-carte">
        <div className="sv-emoji">{f.emoji}</div>
        <h2>{f.titre}</h2>
        <p>{f.texte}</p>
        <BoutonEcouter texte={`${f.titre}. ${f.texte}`} />
      </div>
      <div className="fz-nav">
        <button className="ce-gros secondaire" disabled={i === 0} onClick={() => setI(i - 1)}>←</button>
        {!der ? <button className="ce-gros" onClick={() => setI(i + 1)}>→</button> : <button className="ce-gros" onClick={() => setQuiz(true)}>🎯 Le petit quiz</button>}
      </div>
      {retour}
    </div>
  );
}

function Quiz({ s, onFin }: { s: Savoir; onFin: () => void }) {
  const [n, setN] = useState(0);
  const [rates, setRates] = useState<number[]>([]);
  const [ok, setOk] = useState(false);
  const [score, setScore] = useState(0);
  if (n >= s.quiz.length) return (
    <div className="sv-carte" style={{ ["--c" as any]: s.couleur }}>
      <div className="sv-emoji">{"⭐".repeat(Math.max(1, score))}</div>
      <h2>Bravo, tu as fini !</h2><p>{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""} du premier coup sur {s.quiz.length}.</p>
      <button className="ce-gros" onClick={onFin}>Choisir un autre thème</button>
    </div>
  );
  const q = s.quiz[n];
  return (
    <div className="sv-carte" style={{ ["--c" as any]: s.couleur }}>
      <div className="sv-haut"><span>🎯 Question {n + 1} / {s.quiz.length}</span></div>
      <h2>{q.q}</h2>
      <div className="ce-choix">
        {q.choix.map((c, k) => (
          <button key={k} className={`ce-rep ${ok && k === q.ok ? "ok" : ""}`} disabled={ok || rates.includes(k)}
            onClick={(e) => { if (k === q.ok) { fx("bonne", e.currentTarget); setOk(true); if (!rates.length) setScore(score + 1); } else { fx("presque", e.currentTarget); setRates([...rates, k]); } }}>{c}</button>
        ))}
      </div>
      {ok && <button className="ce-gros" onClick={() => { const m = n + 1; setN(m); setOk(false); setRates([]); if (m >= s.quiz.length) fx("victoire"); }}>Suivant ➜</button>}
    </div>
  );
}
