"use client";
// « Dévine vite ! » : jeu d'équipe façon OléMains, version péi. 1 minute pour faire deviner un maximum de mots.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MOTS_A_DEVINER } from "@/lib/quiz/banque";
import { melanger } from "@/lib/quiz/questions";

const THEMES = [
  { id: "animaux", nom: "Animaux et nature", emoji: "🦎", consigne: "Fais deviner l'animal ou la plante sans dire le mot." },
  { id: "devinettes", nom: "Choses de la kaz et du jardin", emoji: "🍍", consigne: "Fais deviner la chose sans dire le mot." },
  { id: "creole", nom: "Expressions créoles", emoji: "💬", consigne: "Fais deviner l'expression créole : explique son sens ou mime-la !" },
  { id: "plantes", nom: "Plantes péi", emoji: "🌿", consigne: "Fais deviner la plante : sa forme, ses fleurs, où elle pousse…" },
  { id: "mime", nom: "Tout en mime", emoji: "🤫", consigne: "Interdit de parler : mime seulement !" },
];
const GAGES = [
  "Chante le refrain d'une chanson péi de ton choix.",
  "Fais le cri du coq trois fois, bien fort.",
  "Danse un séga pendant 10 secondes.",
  "Dis « Mi aime aou » à tout le monde avec ta plus belle voix.",
  "Imite le papangue qui plane au-dessus des cannes.",
  "Raconte une sirandane à ton équipe.",
  "Marche comme un endormi sur sa branche jusqu'à la porte.",
  "Fais une grimace de tangue pendant 5 secondes.",
  "Dis trois mots créoles que tu aimes.",
  "Tu donnes le prochain mot à l'autre équipe avec le sourire !",
];
const COULEURS = ["#e8283a", "#1e6ec8", "#f3b512", "#2f9a4a"];
const DUREE = 60;

function pioche(theme: string) {
  const m = MOTS_A_DEVINER;
  const base = theme === "animaux" ? [...m.animaux, ...m.enfants] : theme === "mime" ? [...m.animaux, ...m.devinettes] : theme === "devinettes" ? m.devinettes : m[theme] || [];
  return melanger([...new Set(base)]).map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}

export default function DevineVite() {
  const [equipes, setEquipes] = useState(["Équipe 1", "Équipe 2"]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [manches, setManches] = useState(3);
  const [phase, setPhase] = useState<"accueil" | "pret" | "jeu" | "bilan" | "fin">("accueil");
  const [tour, setTour] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [mots, setMots] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [trouves, setTrouves] = useState<string[]>([]);
  const [passes, setPasses] = useState<string[]>([]);
  const [temps, setTemps] = useState(DUREE);
  const [gage, setGage] = useState("");
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);
  const equipe = tour % equipes.length;

  useEffect(() => () => { if (minuteur.current) clearInterval(minuteur.current); }, []);
  useEffect(() => {
    if (phase === "jeu" && temps <= 0) {
      if (minuteur.current) clearInterval(minuteur.current);
      setScores((s) => s.map((v, k) => (k === equipe ? v + trouves.length : v)));
      setGage(trouves.length < 3 ? GAGES[Math.floor(Math.random() * GAGES.length)] : "");
      try { navigator.vibrate?.([200, 100, 200]); } catch {}
      setPhase("bilan");
    }
  }, [temps, phase, equipe, trouves.length]);

  function lancerPartie() { setScores(equipes.map(() => 0)); setTour(0); setMots(pioche(theme.id)); setIdx(0); setPhase("pret"); }
  function go() {
    setTrouves([]); setPasses([]); setTemps(DUREE); setPhase("jeu");
    minuteur.current = setInterval(() => setTemps((t) => t - 1), 1000);
  }
  function suivant(ok: boolean) {
    const m = mots[idx % mots.length];
    ok ? setTrouves((t) => [...t, m]) : setPasses((p) => [...p, m]);
    setIdx(idx + 1);
  }
  function tourSuivant() {
    if (tour + 1 >= manches * equipes.length) { setPhase("fin"); return; }
    setTour(tour + 1); setPhase("pret");
  }

  if (phase === "accueil") return (
    <div className="quiz">
      <h1>Dévine vite !</h1>
      <p className="texte-doux">Le jeu d'ambiance péi en équipes. Un joueur tient l'écran et fait deviner un maximum de mots à son équipe en 1 minute, sans jamais dire le mot. Moins de 3 mots trouvés ? Un gage !</p>
      <h3>Les équipes</h3>
      <div className="quiz-joueurs">
        {equipes.map((j, k) => (
          <div key={k} className="quiz-joueur" style={{ borderColor: COULEURS[k] }}>
            <input value={j} maxLength={16} onChange={(e) => setEquipes(equipes.map((v, x) => (x === k ? e.target.value : v)))} aria-label={`Nom de l'équipe ${k + 1}`} />
            {equipes.length > 2 && <button onClick={() => setEquipes(equipes.filter((_, x) => x !== k))} aria-label="Retirer">✕</button>}
          </div>
        ))}
        {equipes.length < 4 && <button className="btn secondaire" onClick={() => setEquipes([...equipes, `Équipe ${equipes.length + 1}`])}>+ Ajouter une équipe</button>}
      </div>
      <h3>Le thème</h3>
      <div className="themes-quiz">{THEMES.map((t) => <button key={t.id} className={theme.id === t.id ? "actif" : ""} onClick={() => setTheme(t)}><span>{t.emoji}</span>{t.nom}</button>)}</div>
      <h3>Nombre de manches</h3>
      <div className="themes-quiz">{[2, 3, 5].map((n) => <button key={n} className={manches === n ? "actif" : ""} onClick={() => setManches(n)}>{n} manches</button>)}</div>
      <button className="btn large" onClick={lancerPartie}>C'est parti !</button>
    </div>
  );

  if (phase === "pret") return (
    <div className="quiz quiz-passe" style={{ background: COULEURS[equipe] }}>
      <h2>{equipes[equipe]}</h2>
      <p>Manche {Math.floor(tour / equipes.length) + 1} / {manches}</p>
      <p><b>{theme.emoji} {theme.consigne}</b></p>
      <p>Donne l'écran au joueur qui fait deviner. Les autres ne regardent pas l'écran !</p>
      <button className="btn large" style={{ background: "#fff", color: "#222" }} onClick={go}>Je suis prêt : 1 minute !</button>
    </div>
  );

  if (phase === "jeu") return (
    <div className="devine-jeu" style={{ background: COULEURS[equipe] }}>
      <div className={`devine-temps ${temps <= 10 ? "urgent" : ""}`}>{temps}</div>
      <div className="devine-mot">{mots[idx % mots.length]}</div>
      <div className="devine-boutons">
        <button className="passer" onClick={() => suivant(false)}>⏭ Passer</button>
        <button className="trouve" onClick={() => suivant(true)}>✅ Trouvé !</button>
      </div>
      <div className="devine-compte">{trouves.length} trouvé{trouves.length > 1 ? "s" : ""}</div>
    </div>
  );

  if (phase === "bilan") return (
    <div className="quiz">
      <h2>Temps écoulé !</h2>
      <p><b>{equipes[equipe]}</b> a trouvé <b>{trouves.length}</b> mot{trouves.length > 1 ? "s" : ""}.</p>
      {trouves.length > 0 && <p className="texte-doux">✅ {trouves.join(", ")}</p>}
      {passes.length > 0 && <p className="texte-doux">⏭ {passes.join(", ")}</p>}
      {gage && <div className="panneau gage"><b>🎭 Gage !</b><p>{gage}</p></div>}
      <div className="quiz-podium">{equipes.map((e, k) => <div key={k} className="quiz-ligne" style={{ borderColor: COULEURS[k] }}><b>{e}</b><span>{scores[k]} pts</span></div>)}</div>
      <button className="btn large" onClick={tourSuivant}>{tour + 1 >= manches * equipes.length ? "Voir le classement" : "Équipe suivante"}</button>
    </div>
  );

  const max = Math.max(...scores);
  return (
    <div className="quiz" style={{ textAlign: "center" }}>
      <div className="quiz-gros">🏆</div>
      <h1>{equipes.filter((_, k) => scores[k] === max).join(" et ")} gagne{equipes.filter((_, k) => scores[k] === max).length > 1 ? "nt" : ""} !</h1>
      <div className="quiz-podium">{equipes.map((e, k) => ({ e, k, s: scores[k] })).sort((a, b) => b.s - a.s).map(({ e, k, s }) => <div key={k} className="quiz-ligne" style={{ borderColor: COULEURS[k] }}><b>{e}</b><span>{s} pts</span></div>)}</div>
      <button className="btn large" onClick={() => setPhase("accueil")}>Nouvelle partie</button>
      <Link className="btn secondaire large" href="/jeux">Retour aux jeux</Link>
    </div>
  );
}
