"use client";
import { useState } from "react";
import Link from "next/link";
import { melanger } from "@/lib/quiz/questions";
import { BANQUE, type QuestionLivre } from "@/lib/quiz/banque";

type Question = QuestionLivre & { ok: number };
export const THEMES_QUIZ = [
  { id: "tout", nom: "Tout mélangé", emoji: "🎲" },
  { id: "creole", nom: "Mots créoles", emoji: "💬" },
  { id: "devinettes", nom: "Sirandanes", emoji: "❓" },
  { id: "animaux", nom: "Animaux", emoji: "🦎" },
  { id: "plantes", nom: "Plantes péi", emoji: "🌿" },
  { id: "tradition", nom: "Mots lontan", emoji: "🏡" },
];

const COULEURS = ["#e8283a", "#1e6ec8", "#f3b512", "#2f9a4a"];
const EMOJIS = ["🦜", "🐢", "🌋", "🍍"];

export default function QuizReunion({ famille }: { famille?: boolean }) {
  const [joueurs, setJoueurs] = useState<string[]>(famille ? ["Joueur 1", "Joueur 2"] : ["Moi"]);
  const [phase, setPhase] = useState<"accueil" | "passe" | "question" | "fin">("accueil");
  const [serie, setSerie] = useState<Question[]>([]);
  const [n, setN] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [choix, setChoix] = useState<number | null>(null);
  const [theme, setTheme] = useState("tout");
  const tours = famille ? 5 : 10; // questions par joueur

  const total = tours * joueurs.length;
  const joueur = n % joueurs.length;
  const q = serie[n];

  function lancer() {
    // « Tout mélangé » : on équilibre les thèmes pour ne pas tomber que sur des plantes
    const parTheme = THEMES_QUIZ.filter((t) => t.id !== "tout").map((t) => melanger(BANQUE.filter((q) => q.theme === t.id)));
    const source = theme === "tout" ? parTheme.flatMap((l) => l.slice(0, Math.ceil(total / parTheme.length) + 1)) : BANQUE.filter((q) => q.theme === theme);
    setSerie(melanger(source).slice(0, Math.min(total, source.length)).map((x) => {
      const ordre = melanger([0, 1, 2, 3]);
      return { ...x, r: ordre.map((i) => x.r[i]), ok: ordre.indexOf(0) };
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
      <p className="texte-doux">{famille ? "De 2 à 4 joueurs sur le même écran. Chacun son tour, on se passe l'appareil." : "10 questions tirées des livres Kwélafé."}</p>
      <div className="themes-quiz">
        {THEMES_QUIZ.map((t) => <button key={t.id} className={theme === t.id ? "actif" : ""} onClick={() => setTheme(t.id)}><span>{t.emoji}</span>{t.nom}</button>)}
      </div>
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
          <small className="texte-doux">📖 Tiré du livre « {q.source} »</small>
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
