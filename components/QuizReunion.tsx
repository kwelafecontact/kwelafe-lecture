"use client";
import { useState } from "react";
import Link from "next/link";
import { QUESTIONS, melanger, type Question } from "@/lib/quiz/questions";

const COULEURS = ["#e8283a", "#1e6ec8", "#f3b512", "#2f9a4a"];
const EMOJIS = ["🦜", "🐢", "🌋", "🍍"];

export default function QuizReunion({ famille }: { famille?: boolean }) {
  const [joueurs, setJoueurs] = useState<string[]>(famille ? ["Joueur 1", "Joueur 2"] : ["Moi"]);
  const [phase, setPhase] = useState<"accueil" | "passe" | "question" | "fin">("accueil");
  const [serie, setSerie] = useState<Question[]>([]);
  const [n, setN] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [choix, setChoix] = useState<number | null>(null);
  const tours = famille ? 5 : 10; // questions par joueur

  const total = tours * joueurs.length;
  const joueur = n % joueurs.length;
  const q = serie[n];

  function lancer() {
    setSerie(melanger(QUESTIONS).slice(0, Math.min(total, QUESTIONS.length)).map((x) => {
      const ordre = melanger(x.r.map((_, i) => i));
      return { ...x, r: ordre.map((i) => x.r[i]), ok: ordre.indexOf(x.ok) };
    }));
    setScores(joueurs.map(() => 0)); setN(0); setChoix(null);
    setPhase(famille ? "passe" : "question");
  }
  function repondre(i: number) {
    if (choix !== null) return;
    setChoix(i);
    if (i === q.ok) setScores((s) => s.map((v, k) => (k === joueur ? v + 1 : v)));
  }
  function suivante() {
    setChoix(null);
    if (n + 1 >= serie.length) { setPhase("fin"); return; }
    setN(n + 1); setPhase(famille ? "passe" : "question");
  }

  if (phase === "accueil") return (
    <div className="quiz">
      <h1>{famille ? "Quiz en famille" : "Quiz péi"}</h1>
      <p className="texte-doux">{famille ? "De 2 à 4 joueurs sur le même écran. Chacun son tour, on se passe l'appareil." : "10 questions sur La Réunion : nature, histoire, culture et créole."}</p>
      {famille && (
        <div className="quiz-joueurs">
          {joueurs.map((j, k) => (
            <div key={k} className="quiz-joueur" style={{ borderColor: COULEURS[k] }}>
              <span>{EMOJIS[k]}</span>
              <input value={j} maxLength={14} onChange={(e) => setJoueurs(joueurs.map((v, x) => (x === k ? e.target.value : v)))} aria-label={`Prénom du joueur ${k + 1}`} />
              {joueurs.length > 2 && <button onClick={() => setJoueurs(joueurs.filter((_, x) => x !== k))} aria-label="Retirer">✕</button>}
            </div>
          ))}
          {joueurs.length < 4 && <button className="btn secondaire" onClick={() => setJoueurs([...joueurs, `Joueur ${joueurs.length + 1}`])}>+ Ajouter un joueur</button>}
        </div>
      )}
      <button className="btn large" onClick={lancer}>C'est parti !</button>
    </div>
  );

  if (phase === "passe") return (
    <div className="quiz quiz-passe" style={{ background: COULEURS[joueur] }} onClick={() => setPhase("question")}>
      <span className="quiz-gros">{EMOJIS[joueur]}</span>
      <h2>À toi, {joueurs[joueur] || `Joueur ${joueur + 1}`} !</h2>
      <p>Touche l'écran quand tu es prêt.</p>
    </div>
  );

  if (phase === "question" && q) return (
    <div className="quiz">
      <div className="quiz-haut">
        <span>Question {n + 1} / {serie.length}</span>
        {famille && <b style={{ color: COULEURS[joueur] }}>{EMOJIS[joueur]} {joueurs[joueur]}</b>}
      </div>
      <h2 className="quiz-question">{q.q}</h2>
      <div className="quiz-reponses">
        {q.r.map((r, i) => (
          <button key={i} onClick={() => repondre(i)} className={choix === null ? "" : i === q.ok ? "bonne" : i === choix ? "fausse" : "terne"}>{r}</button>
        ))}
      </div>
      {choix !== null && (
        <div className="quiz-info">
          <b>{choix === q.ok ? "Bravo !" : "Pas tout à fait."}</b> {q.info}
          <button className="btn" onClick={suivante}>{n + 1 >= serie.length ? "Voir les résultats" : "Suivante"}</button>
        </div>
      )}
    </div>
  );

  const max = Math.max(...scores);
  return (
    <div className="quiz">
      <h1>{famille ? "Classement" : "Résultat"}</h1>
      <div className="quiz-podium">
        {joueurs.map((j, k) => ({ j, k, s: scores[k] })).sort((a, b) => b.s - a.s).map(({ j, k, s }) => (
          <div key={k} className="quiz-ligne" style={{ borderColor: COULEURS[k] }}>
            <span>{s === max ? "🏆" : EMOJIS[k]}</span><b>{j}</b><span>{s} / {tours}</span>
          </div>
        ))}
      </div>
      <button className="btn large" onClick={lancer}>Rejouer</button>
      <Link className="btn secondaire large" href="/jeux">Retour aux jeux</Link>
    </div>
  );
}
