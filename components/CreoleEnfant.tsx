"use client";
// Créole pour les enfants : une grande carte avec un dessin et un mot, trois grosses réponses. Pas de cœurs, que des encouragements.
import { useEffect, useMemo, useState } from "react";
import { lireReglages } from "@/lib/reglages";
import BarriereParentale from "./BarriereParentale";
import { MOTS_ENFANTS, THEMES_ENFANTS, type MotEnfant } from "@/lib/creole-enfants";

const melange = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const BRAVO = ["Bravo !", "Super !", "Gayar !", "Trop fort !", "Bien joué !"];

type P = { id: string; nom: string; avatar: string | null };

export default function CreoleEnfant() {
  const [profils, setProfils] = useState<P[] | null>(null);
  const [joueur, setJoueur] = useState<{ id: string; nom: string; avatar: string } | null>(null);
  const [pause, setPause] = useState(false);
  useEffect(() => {
    fetch("/api/apprendre").then((r) => r.json()).then((d) => {
      const ps: P[] = d.connecte ? d.profils || [] : [];
      setProfils(ps);
      let deja: string | null = null;
      try { deja = sessionStorage.getItem("kw-app-profil"); } catch {}
      const trouve = ps.find((x) => x.id === deja);
      if (trouve) setJoueur({ id: trouve.id, nom: trouve.nom, avatar: trouve.avatar || "🐢" });
      else if (ps.length === 0) setJoueur({ id: "", nom: "", avatar: "⭐" });
    }).catch(() => { setProfils([]); setJoueur({ id: "", nom: "", avatar: "⭐" }); });
    const min = lireReglages().limiteEnfants;
    if (min > 0) { const t = setTimeout(() => setPause(true), min * 60000); return () => clearTimeout(t); }
  }, []);
  const [theme, setTheme] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [choisi, setChoisi] = useState<string | null>(null);
  const [etoiles, setEtoiles] = useState(0);
  const [sens, setSens] = useState<"kr" | "fr">("kr");
  const [rates, setRates] = useState<string[]>([]);

  const serie = useMemo(() => (theme ? melange(MOTS_ENFANTS.filter((m) => m.theme === theme)) : []), [theme]);
  const mot: MotEnfant | undefined = serie[i];
  const choix = useMemo(() => {
    if (!mot) return [];
    const autres = melange(MOTS_ENFANTS.filter((m) => m.fr !== mot.fr && m.kr !== mot.kr)).slice(0, 2);
    return melange([mot, ...autres]);
  }, [mot]);

  if (pause) return (
    <div className="ce-pause">
      <div className="ce-emoji">🌴</div>
      <h2>C'est l'heure de la pause !</h2>
      <p>Va jouer dehors, boire un verre d'eau, ou raconte à quelqu'un les mots que tu as appris.</p>
      <BarriereParentale><button className="ce-gros" onClick={() => setPause(false)}>Un parent continue</button></BarriereParentale>
    </div>
  );
  if (profils === null) return null;
  if (!joueur) return (
    <div className="ce-accueil">
      <h2>Qui joue ?</h2>
      <div className="ce-themes">
        {profils.map((x) => <button key={x.id} style={{ ["--c" as any]: "#1f6fb2" }} onClick={() => { setJoueur({ id: x.id, nom: x.nom, avatar: x.avatar || "🐢" }); try { sessionStorage.setItem("kw-app-profil", x.id); } catch {} }}><span>{x.avatar || "🐢"}</span>{x.nom}</button>)}
        <button style={{ ["--c" as any]: "#7a2e8f" }} onClick={() => setJoueur({ id: "", nom: "", avatar: "⭐" })}><span>⭐</span>Quelqu'un d'autre</button>
      </div>
    </div>
  );

  if (!theme) return (
    <div className="ce-accueil">
      {joueur.nom && <p className="ce-salut">{joueur.avatar} Oté {joueur.nom} ! <button className="app-lien" onClick={() => { setJoueur(null); try { sessionStorage.removeItem("kw-app-profil"); } catch {} }}>changer</button></p>}
      <h2>Choisis un thème</h2>
      <div className="ce-themes">
        {THEMES_ENFANTS.map((t) => (
          <button key={t.id} style={{ ["--c" as any]: t.couleur }} onClick={() => { setTheme(t.id); setI(0); setEtoiles(0); setChoisi(null); setRates([]); }}>
            <span>{t.emoji}</span>{t.nom}
          </button>
        ))}
      </div>
      <label className="ce-sens"><input type="checkbox" checked={sens === "fr"} onChange={(e) => setSens(e.target.checked ? "fr" : "kr")} /> Je connais déjà un peu : montre-moi le mot en français, je trouve le créole</label>
    </div>
  );

  const t = THEMES_ENFANTS.find((x) => x.id === theme)!;
  if (!mot) return (
    <div className="ce-fin" style={{ ["--c" as any]: t.couleur }}>
      <div className="ce-fin-etoiles">{"⭐".repeat(Math.max(1, Math.round((etoiles / serie.length) * 3)))}</div>
      <h2>Tu as trouvé {etoiles} mot{etoiles > 1 ? "s" : ""} sur {serie.length} !</h2>
      <p>Ti pa, ti pa, n'arivé. Reviens demain pour apprendre encore.</p>
      <button className="ce-gros" onClick={() => { setI(0); setEtoiles(0); setChoisi(null); }}>🔁 Rejouer</button>
      <button className="ce-gros secondaire" onClick={() => setTheme(null)}>🏠 Autres thèmes</button>
    </div>
  );

  const bonne = sens === "kr" ? mot.fr : mot.kr;
  const ok = choisi === bonne;
  return (
    <div className="ce-jeu" style={{ ["--c" as any]: t.couleur }}>
      <div className="ce-haut">
        <button className="ce-retour" onClick={() => setTheme(null)}>← Thèmes</button>
        <div className="ce-points">{serie.map((_, k) => <i key={k} className={k < i ? "fait" : k === i ? "ici" : ""} />)}</div>
        <span className="ce-score">⭐ {etoiles}</span>
      </div>
      <div className="ce-carte">
        <div className="ce-emoji">{mot.emoji}</div>
        <div className="ce-mot">{sens === "kr" ? mot.kr : mot.fr}</div>
        <div className="ce-question">{sens === "kr" ? "Qu'est-ce que ça veut dire ?" : "Comment on dit en créole ?"}</div>
      </div>
      <div className="ce-choix">
        {choix.map((c) => {
          const v = sens === "kr" ? c.fr : c.kr;
          const etat = choisi === v ? (v === bonne ? "ok" : "ko") : (ok && v === bonne ? "ok" : "");
          return <button key={v} className={`ce-rep ${etat}`} disabled={ok || rates.includes(v)} onClick={() => { if (ok) return; if (v === bonne && rates.length === 0) setEtoiles((e) => e + 1); if (v !== bonne) setRates([...rates, v]); setChoisi(v); }}>{v}</button>;
        })}
      </div>
      {choisi && (
        <div className={`ce-retour-msg ${ok ? "bien" : "encore"}`}>
          {ok ? <><b>{BRAVO[i % BRAVO.length]}</b> {mot.kr} = {mot.fr}</> : <b>Presque ! Essaie encore 😊</b>}
          {ok && <button className="ce-gros" onClick={() => { setI(i + 1); setChoisi(null); setRates([]); }}>Suivant ➜</button>}
        </div>
      )}
    </div>
  );
}
