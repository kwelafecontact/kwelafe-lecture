"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BANQUE, PAIRES, VRAI_FAUX, CHAINES, type QuestionLivre } from "@/lib/quiz/banque";
import { melanger } from "@/lib/quiz/questions";
import type { JeuEcole as Fiche } from "@/lib/ecole-jeux";

const THEME_QUIZ: Record<string, string> = { "mots-creoles": "creole", sirandanes: "devinettes", "qui-mange-qui": "animaux", plantes: "plantes", tisanerie: "tradition" };

function preparer(qs: QuestionLivre[], n: number) {
  return melanger(qs).slice(0, n).map((x) => { const o = melanger([0, 1, 2, 3]); return { ...x, r: o.map((i) => x.r[i]), ok: o.indexOf(0) }; });
}

function Fin({ score, total, rejouer }: { score: number; total: number; rejouer: () => void }) {
  const etoiles = score / total >= 0.9 ? 3 : score / total >= 0.6 ? 2 : score / total >= 0.3 ? 1 : 0;
  return (
    <div className="quiz" style={{ textAlign: "center" }}>
      <div className="quiz-gros">{"⭐".repeat(etoiles) || "💪"}</div>
      <h2>{score} / {total}</h2>
      <p>{etoiles === 3 ? "Bravo, c'est parfait !" : etoiles >= 1 ? "Bien joué, continue !" : "On recommence ensemble ?"}</p>
      <button className="btn large" onClick={rejouer}>Rejouer</button>
      <Link className="btn secondaire large" href="/ecole/jeux">Autres jeux de l'école</Link>
    </div>
  );
}

function Quiz({ theme, petits }: { theme: string; petits: boolean }) {
  const source = BANQUE.filter((q) => q.theme === theme && (!petits || q.public === "enfant" || theme === "creole"));
  const [cle, setCle] = useState(0);
  const serie = useMemo(() => preparer(source, 10), [cle]); // eslint-disable-line react-hooks/exhaustive-deps
  const [n, setN] = useState(0); const [score, setScore] = useState(0); const [choix, setChoix] = useState<number | null>(null);
  if (n >= serie.length) return <Fin score={score} total={serie.length} rejouer={() => { setCle(cle + 1); setN(0); setScore(0); setChoix(null); }} />;
  const q = serie[n];
  return (
    <div className="quiz">
      <div className="quiz-haut"><span>Question {n + 1} / {serie.length}</span><span>⭐ {score}</span></div>
      <h2 className="quiz-question">{q.q}</h2>
      <div className="quiz-reponses">
        {q.r.map((r, i) => <button key={i} onClick={() => { if (choix !== null) return; setChoix(i); if (i === q.ok) setScore(score + 1); }} className={choix === null ? "" : i === q.ok ? "bonne" : i === choix ? "fausse" : "terne"}>{r}</button>)}
      </div>
      {choix !== null && (
        <div className="quiz-info">
          <b>{choix === q.ok ? "Bravo !" : "Pas tout à fait."}</b> {q.info}
          <small className="texte-doux">📖 Tiré du livre « {q.source} »</small>
          <button className="btn" onClick={() => { setChoix(null); setN(n + 1); }}>Suivante</button>
        </div>
      )}
    </div>
  );
}

function Paires() {
  const [cle, setCle] = useState(0);
  const cartes = useMemo(() => melanger(melanger(PAIRES).slice(0, 6).flatMap(([kr, fr], k) => [{ k, t: kr, kr: true }, { k, t: fr, kr: false }])), [cle]); // eslint-disable-line react-hooks/exhaustive-deps
  const [ouvertes, setOuvertes] = useState<number[]>([]); const [trouvees, setTrouvees] = useState<number[]>([]); const [coups, setCoups] = useState(0);
  function toucher(i: number) {
    if (ouvertes.length === 2 || ouvertes.includes(i) || trouvees.includes(cartes[i].k)) return;
    const o = [...ouvertes, i]; setOuvertes(o);
    if (o.length === 2) {
      setCoups(coups + 1);
      if (cartes[o[0]].k === cartes[o[1]].k) { setTrouvees([...trouvees, cartes[i].k]); setOuvertes([]); }
      else setTimeout(() => setOuvertes([]), 1100);
    }
  }
  if (trouvees.length === 6) return <Fin score={Math.max(0, 12 - Math.max(0, coups - 6))} total={12} rejouer={() => { setCle(cle + 1); setTrouvees([]); setCoups(0); }} />;
  return (
    <div className="quiz">
      <div className="quiz-haut"><span>Paires trouvées : {trouvees.length} / 6</span><span>Essais : {coups}</span></div>
      <div className="grille-paires">
        {cartes.map((c, i) => {
          const vue = ouvertes.includes(i) || trouvees.includes(c.k);
          return <button key={i} className={`carte-paire ${vue ? "vue" : ""} ${trouvees.includes(c.k) ? "ok" : ""} ${c.kr ? "kr" : "fr"}`} onClick={() => toucher(i)}>{vue ? c.t : "?"}</button>;
        })}
      </div>
      <p className="texte-doux">Les cartes bleues sont en créole, les vertes en français. Mots tirés des livres « Kosa i mank ? » et « Qui mange qui à La Réunion ? ».</p>
    </div>
  );
}

function VraiFaux() {
  const [cle, setCle] = useState(0);
  const serie = useMemo(() => melanger(VRAI_FAUX), [cle]); // eslint-disable-line react-hooks/exhaustive-deps
  const [n, setN] = useState(0); const [score, setScore] = useState(0); const [rep, setRep] = useState<boolean | null>(null);
  if (n >= serie.length) return <Fin score={score} total={serie.length} rejouer={() => { setCle(cle + 1); setN(0); setScore(0); }} />;
  const q = serie[n];
  return (
    <div className="quiz">
      <div className="quiz-haut"><span>{n + 1} / {serie.length}</span><span>⭐ {score}</span></div>
      <h2 className="quiz-question">{q.q}</h2>
      <div className="vf-boutons">
        {[true, false].map((v) => <button key={String(v)} className={rep === null ? "" : v === q.v ? "bonne" : v === rep ? "fausse" : "terne"} onClick={() => { if (rep !== null) return; setRep(v); if (v === q.v) setScore(score + 1); }}>{v ? "✅ Vrai" : "❌ Faux"}</button>)}
      </div>
      {rep !== null && <div className="quiz-info"><b>{rep === q.v ? "Bravo !" : "Eh non !"}</b> C'est {q.v ? "vrai" : "faux"}. <small className="texte-doux">📖 « {q.source} »</small><button className="btn" onClick={() => { setRep(null); setN(n + 1); }}>Suivante</button></div>}
    </div>
  );
}

function Chaine() {
  const [cle, setCle] = useState(0);
  const serie = useMemo(() => melanger(CHAINES).slice(0, 5), [cle]); // eslint-disable-line react-hooks/exhaustive-deps
  const [n, setN] = useState(0); const [score, setScore] = useState(0);
  const [choisis, setChoisis] = useState<string[]>([]); const [verdict, setVerdict] = useState<null | boolean>(null);
  const melange = useMemo(() => (serie[n] ? melanger(serie[n]) : []), [serie, n]);
  if (n >= serie.length) return <Fin score={score} total={serie.length} rejouer={() => { setCle(cle + 1); setN(0); setScore(0); setChoisis([]); setVerdict(null); }} />;
  const bonne = serie[n];
  function prendre(a: string) {
    if (verdict !== null || choisis.includes(a)) return;
    const c = [...choisis, a]; setChoisis(c);
    if (c.length === bonne.length) { const ok = c.every((x, i) => x === bonne[i]); setVerdict(ok); if (ok) setScore(score + 1); }
  }
  return (
    <div className="quiz">
      <div className="quiz-haut"><span>Chaîne {n + 1} / {serie.length}</span><span>⭐ {score}</span></div>
      <h2 className="quiz-question">Touche dans l'ordre : d'abord ce qui est mangé, puis celui qui le mange.</h2>
      <div className="chaine-choisie">{choisis.map((c, i) => <span key={i}>{i > 0 && "→ "}{c}</span>)}</div>
      <div className="quiz-reponses">{melange.map((a) => <button key={a} disabled={choisis.includes(a)} className={choisis.includes(a) ? "terne" : ""} onClick={() => prendre(a)}>{a}</button>)}</div>
      {verdict !== null && <div className="quiz-info"><b>{verdict ? "Bravo !" : "Pas tout à fait."}</b> La bonne chaîne : {bonne.join(" → ")}. <small className="texte-doux">📖 « Qui mange qui à La Réunion ? »</small><button className="btn" onClick={() => { setChoisis([]); setVerdict(null); setN(n + 1); }}>Suivante</button></div>}
      {verdict === null && choisis.length > 0 && <button className="lien" onClick={() => setChoisis([])}>Effacer</button>}
    </div>
  );
}

export default function JeuEcole({ fiche }: { fiche: Fiche }) {
  const [petits, setPetits] = useState(true);
  const theme = THEME_QUIZ[fiche.id];
  return (
    <div>
      <div className="entete-jeu-ecole" style={{ background: fiche.couleur }}>
        <span>{fiche.emoji}</span><div><h1>{fiche.titre}</h1><p>{fiche.desc}</p></div>
      </div>
      {theme && theme !== "devinettes" && theme !== "animaux" && (
        <div className="choix-niveau-jeu">
          <button className={petits ? "actif" : ""} onClick={() => setPetits(true)}>Primaire</button>
          <button className={!petits ? "actif" : ""} onClick={() => setPetits(false)}>Collège et plus</button>
        </div>
      )}
      {theme ? <Quiz key={`${theme}-${petits}`} theme={theme} petits={petits && theme === "plantes"} /> : fiche.id === "paires" ? <Paires /> : fiche.id === "vrai-faux" ? <VraiFaux /> : <Chaine />}
    </div>
  );
}
