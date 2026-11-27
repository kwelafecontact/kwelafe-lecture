"use client";
// Créole pour les enfants : une grande carte avec un dessin et un mot, trois grosses réponses. Pas de cœurs, que des encouragements.
import { useMemo, useState } from "react";
import { MOTS_ENFANTS, THEMES_ENFANTS, type MotEnfant } from "@/lib/creole-enfants";

const melange = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const BRAVO = ["Bravo !", "Super !", "Gayar !", "Trop fort !", "Bien joué !"];

export default function CreoleEnfant() {
  const [theme, setTheme] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [choisi, setChoisi] = useState<string | null>(null);
  const [etoiles, setEtoiles] = useState(0);
  const [sens, setSens] = useState<"kr" | "fr">("kr");

  const serie = useMemo(() => (theme ? melange(MOTS_ENFANTS.filter((m) => m.theme === theme)) : []), [theme]);
  const mot: MotEnfant | undefined = serie[i];
  const choix = useMemo(() => {
    if (!mot) return [];
    const autres = melange(MOTS_ENFANTS.filter((m) => m.fr !== mot.fr && m.kr !== mot.kr)).slice(0, 2);
    return melange([mot, ...autres]);
  }, [mot]);

  if (!theme) return (
    <div className="ce-accueil">
      <h2>Choisis un thème</h2>
      <div className="ce-themes">
        {THEMES_ENFANTS.map((t) => (
          <button key={t.id} style={{ ["--c" as any]: t.couleur }} onClick={() => { setTheme(t.id); setI(0); setEtoiles(0); setChoisi(null); }}>
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
          const etat = choisi ? (v === bonne ? "ok" : v === choisi ? "ko" : "") : "";
          return <button key={v} className={`ce-rep ${etat}`} disabled={!!choisi && ok} onClick={() => { if (choisi && ok) return; setChoisi(v); if (v === bonne && !choisi) setEtoiles((e) => e + 1); }}>{v}</button>;
        })}
      </div>
      {choisi && (
        <div className={`ce-retour-msg ${ok ? "bien" : "encore"}`}>
          {ok ? <><b>{BRAVO[i % BRAVO.length]}</b> {mot.kr} = {mot.fr}</> : <b>Presque ! Essaie encore 😊</b>}
          {ok && <button className="ce-gros" onClick={() => { setI(i + 1); setChoisi(null); }}>Suivant ➜</button>}
        </div>
      )}
    </div>
  );
}
