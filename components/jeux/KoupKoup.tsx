"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MoteurKoupKoup, Mode, Resultat } from "@/lib/jeux/koupkoup/moteur";
import { FRUITS } from "@/lib/jeux/koupkoup/fruits";

type Donnees = { panier?: Record<string, number>; meilleurCombo?: number };
type Phase = "chargement" | "menu" | "jeu" | "pause" | "fin" | "erreur";

const A_DECOUVRIR = FRUITS.filter((f) => f.special !== "lave");

export default function KoupKoup({ recordInitial, donneesInitiales }: { recordInitial: number; donneesInitiales: Donnees }) {
  const scene = useRef<HTMLDivElement>(null);
  const moteur = useRef<MoteurKoupKoup | null>(null);
  const [phase, setPhase] = useState<Phase>("chargement");
  const [hud, setHud] = useState({ score: 0, vies: 3, temps: null as number | null });
  const [record, setRecord] = useState(recordInitial);
  const [donnees, setDonnees] = useState<Donnees>(donneesInitiales || {});
  const [resultat, setResultat] = useState<(Resultat & { nouveauRecord: boolean; nouveaux: string[] }) | null>(null);
  const [son, setSon] = useState(true);
  const [panierOuvert, setPanierOuvert] = useState(false);
  const modeRef = useRef<Mode>("classique");
  const donneesRef = useRef(donnees);
  donneesRef.current = donnees;
  const recordRef = useRef(record);
  recordRef.current = record;

  const finPartie = useCallback(async (r: Resultat) => {
    const avant = donneesRef.current.panier || {};
    const panier = { ...avant };
    const nouveaux: string[] = [];
    for (const [id, n] of Object.entries(r.coupes)) {
      if (!avant[id]) nouveaux.push(id);
      panier[id] = (panier[id] || 0) + n;
    }
    const suivantes: Donnees = { ...donneesRef.current, panier, meilleurCombo: Math.max(donneesRef.current.meilleurCombo || 0, r.meilleurCombo) };
    const nouveauRecord = r.score > recordRef.current;
    setDonnees(suivantes);
    if (nouveauRecord) setRecord(r.score);
    setResultat({ ...r, nouveauRecord, nouveaux });
    setPhase("fin");
    try {
      const rep = await fetch("/api/jeux/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jeu: "koup-koup", score: r.score, donnees: suivantes }),
      });
      const j = await rep.json();
      if (typeof j.record === "number") setRecord((x) => Math.max(x, j.record));
    } catch {
      /* hors ligne : le score reste affiché, il sera perdu au rechargement */
    }
  }, []);

  useEffect(() => {
    let annule = false;
    try {
      const s = localStorage.getItem("kk-son");
      if (s === "0") setSon(false);
    } catch { /* stockage indisponible */ }
    (async () => {
      try {
        const { MoteurKoupKoup } = await import("@/lib/jeux/koupkoup/moteur");
        if (annule || !scene.current) return;
        const m = new MoteurKoupKoup(scene.current, {
          etat: (e) => setHud({ score: e.score, vies: e.vies, temps: e.temps }),
          fin: (r) => finPartie(r),
        });
        moteur.current = m;
        try { if (localStorage.getItem("kk-son") === "0") m.setSon(false); } catch { /* rien */ }
        setPhase("menu");
      } catch (err) {
        console.error(err);
        setPhase("erreur");
      }
    })();
    return () => {
      annule = true;
      moteur.current?.detruire();
      moteur.current = null;
    };
  }, [finPartie]);

  const jouer = (mode: Mode) => {
    modeRef.current = mode;
    setResultat(null);
    setHud({ score: 0, vies: 3, temps: mode === "zen" ? 90 : null });
    moteur.current?.demarrer(mode);
    setPhase("jeu");
  };

  const basculerPause = () => {
    if (phase === "jeu") { moteur.current?.pause(); setPhase("pause"); }
    else if (phase === "pause") { moteur.current?.reprendre(); setPhase("jeu"); }
  };

  const basculerSon = () => {
    const v = !son;
    setSon(v);
    moteur.current?.setSon(v);
    try { localStorage.setItem("kk-son", v ? "1" : "0"); } catch { /* rien */ }
  };

  const panier = donnees.panier || {};
  const decouverts = A_DECOUVRIR.filter((f) => panier[f.id]).length;

  return (
    <div className="kk-ecran">
      <div ref={scene} className="kk-scene" />
      <div className="kk-vignette" aria-hidden />

      {/* Barre du haut */}
      <div className="kk-barre">
        <div className="kk-groupe">
          <Link href="/jeux" className="kk-rond" aria-label="Retour aux jeux">←</Link>
          {(phase === "jeu" || phase === "pause") && (
            <button className="kk-rond" onClick={basculerPause} aria-label={phase === "pause" ? "Reprendre" : "Pause"}>{phase === "pause" ? "▶" : "❚❚"}</button>
          )}
        </div>
        {(phase === "jeu" || phase === "pause" || phase === "fin") && (
          <div className="kk-score" aria-live="polite">
            <b>{hud.score}</b>
            <span>Record {Math.max(record, hud.score)}</span>
          </div>
        )}
        <div className="kk-groupe">
          {(phase === "jeu" || phase === "pause") && modeRef.current === "classique" && (
            <div className="kk-vies" aria-label={`${hud.vies} vies`}>
              {[0, 1, 2].map((i) => <i key={i} className={i < hud.vies ? "pleine" : ""} />)}
            </div>
          )}
          {(phase === "jeu" || phase === "pause") && hud.temps !== null && <div className="kk-temps">{hud.temps}s</div>}
          <button className="kk-rond" onClick={basculerSon} aria-label={son ? "Couper le son" : "Activer le son"}>{son ? "🔊" : "🔇"}</button>
        </div>
      </div>

      {phase === "chargement" && <div className="kk-centre"><div className="kk-chargement">Préparation des fruits…</div></div>}

      {phase === "erreur" && (
        <div className="kk-centre">
          <div className="kk-panneau">
            <h2>Oups</h2>
            <p>Ton appareil ne permet pas d'afficher ce jeu en 3D (WebGL indisponible). Essaie avec Safari ou Chrome à jour.</p>
            <Link href="/jeux" className="btn">Retour aux jeux</Link>
          </div>
        </div>
      )}

      {phase === "menu" && !panierOuvert && (
        <div className="kk-centre kk-traversant">
          <div className="kk-panneau kk-menu">
            <div className="kk-titre">Koup Koup</div>
            <p className="kk-accroche">Coupe les fruits péi d'un geste, fais gicler le jus… et surtout, ne touche pas la lave !</p>
            <div className="kk-boutons">
              <button className="btn" onClick={() => jouer("classique")}>Classique · 3 vies</button>
              <button className="btn secondaire" onClick={() => jouer("zen")}>Zen · 90 secondes</button>
              <button className="btn secondaire" onClick={() => setPanierOuvert(true)}>Mon panier ({decouverts}/{A_DECOUVRIR.length})</button>
            </div>
            <p className="kk-astuce">Astuce : coupe 3 fruits d'un seul geste pour un combo. Le letchi doré ralentit le temps.</p>
          </div>
        </div>
      )}

      {phase === "pause" && (
        <div className="kk-centre">
          <div className="kk-panneau">
            <h2>Pause</h2>
            <div className="kk-boutons">
              <button className="btn" onClick={basculerPause}>Reprendre</button>
              <button className="btn secondaire" onClick={() => { moteur.current?.reprendre(); jouer(modeRef.current); }}>Recommencer</button>
            </div>
          </div>
        </div>
      )}

      {phase === "fin" && resultat && !panierOuvert && (
        <div className="kk-centre">
          <div className="kk-panneau kk-fin">
            {resultat.nouveauRecord && <div className="kk-badge">Nouveau record !</div>}
            <div className="kk-gros-score">{resultat.score}</div>
            <div className="kk-stats">
              <span><b>{Object.values(resultat.coupes).reduce((s, n) => s + n, 0)}</b> fruits coupés</span>
              <span><b>x{resultat.meilleurCombo || 0}</b> meilleur combo</span>
              <span><b>{record}</b> record</span>
            </div>
            {resultat.nouveaux.length > 0 && (
              <p className="kk-nouveaux">
                Nouveau dans ton panier : {resultat.nouveaux.map((id) => FRUITS.find((f) => f.id === id)?.kreol).join(", ")}
              </p>
            )}
            <div className="kk-boutons">
              <button className="btn" onClick={() => jouer(modeRef.current)}>Encore une !</button>
              <button className="btn secondaire" onClick={() => setPanierOuvert(true)}>Mon panier</button>
              <button className="btn secondaire" onClick={() => setPhase("menu")}>Menu</button>
            </div>
          </div>
        </div>
      )}

      {panierOuvert && (
        <div className="kk-centre">
          <div className="kk-panneau kk-panier">
            <h2>Mon panier de fruits péi</h2>
            <p className="kk-accroche">{decouverts} sur {A_DECOUVRIR.length} découverts</p>
            <ul>
              {A_DECOUVRIR.map((f) => {
                const n = panier[f.id] || 0;
                return (
                  <li key={f.id} className={n ? "vu" : ""}>
                    <i style={{ background: n ? f.jus.couleur : undefined }} />
                    <b>{n ? f.kreol : "?"}</b>
                    <span>{n ? `${f.nom} · ${n} coupé${n > 1 ? "s" : ""}` : "Pas encore coupé"}</span>
                  </li>
                );
              })}
            </ul>
            <button className="btn" onClick={() => setPanierOuvert(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
