"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { MoteurKoupKoup, Mode, Resultat, InstantaneKK } from "@/lib/jeux/koupkoup/moteur";
import { FRUITS } from "@/lib/jeux/koupkoup/fruits";
import { lireLocal, modifierLocal, envoyerScore, renvoyerEnAttente } from "@/lib/jeux/commun/progression";

type Donnees = { panier?: Record<string, number>; meilleurCombo?: number; record?: number };
type Phase = "chargement" | "menu" | "jeu" | "pause" | "fin" | "erreur" | "graphique";

/** Fusionne deux paniers : on garde le plus grand nombre de coupes pour chaque fruit. */
function fusionner(a: Donnees, b?: Donnees): Donnees {
  if (!b) return a;
  const panier = { ...(a.panier || {}) };
  for (const [id, n] of Object.entries(b.panier || {})) panier[id] = Math.max(panier[id] || 0, n);
  return { ...a, panier, meilleurCombo: Math.max(a.meilleurCombo || 0, b.meilleurCombo || 0), record: Math.max(a.record || 0, b.record || 0) };
}

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
  // Incrémenté pour recréer le moteur graphique (sans recharger la page) si le contexte WebGL ne revient pas
  const [generation, setGeneration] = useState(0);
  const [reprise, setReprise] = useState<InstantaneKK | null>(null);
  const phaseRef = useRef<Phase>("chargement");
  phaseRef.current = phase;
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
    const nouveauRecord = r.score > recordRef.current;
    const suivantes: Donnees = { ...donneesRef.current, panier, meilleurCombo: Math.max(donneesRef.current.meilleurCombo || 0, r.meilleurCombo), record: Math.max(recordRef.current, r.score) };
    setDonnees(suivantes);
    if (nouveauRecord) setRecord(r.score);
    setResultat({ ...r, nouveauRecord, nouveaux });
    setPhase("fin");
    // Copie locale immédiate, puis serveur : hors ligne, le score repart au retour du réseau
    modifierLocal<Donnees>("koup-koup", (l) => ({ ...l, donnees: fusionner(suivantes, l.donnees), partie: null }));
    const j = await envoyerScore("koup-koup", r.score, suivantes);
    if (j && typeof j.record === "number") setRecord((x) => Math.max(x, j.record!));
  }, []);

  // Progression locale : fusion avec celle du serveur, et renvoi d'un score resté en attente
  useEffect(() => {
    let annule = false;
    lireLocal<Donnees>("koup-koup").then((l) => {
      if (annule) return;
      const p = l.partie?.etat as InstantaneKK | undefined;
      if (p && p.vies > 0) setReprise(p);
      if (!l.donnees) return;
      const fus = fusionner(donneesRef.current, l.donnees);
      setDonnees(fus);
      setRecord((x) => Math.max(x, fus.record || 0));
    }).catch(() => {});
    renvoyerEnAttente<Donnees>("koup-koup").catch(() => {});
    const enLigne = () => { renvoyerEnAttente<Donnees>("koup-koup").catch(() => {}); };
    window.addEventListener("online", enLigne);
    return () => { annule = true; window.removeEventListener("online", enLigne); };
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
          // Arrière-plan, verrouillage ou perte graphique : l'écran de pause s'affiche
          interruption: () => { if (phaseRef.current === "jeu") setPhase("pause"); },
          secours: () => setPhase("graphique"),
          // Partie en cours enregistrée régulièrement : reprise possible après un arrêt brutal
          sauvegarde: (p) => { if (p) modifierLocal<Donnees>("koup-koup", (l) => ({ ...l, partie: { niveau: 1, etat: p, t: Date.now() } })); },
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
  }, [finPartie, generation]);

  const jouer = (mode: Mode) => {
    modeRef.current = mode;
    setResultat(null);
    setReprise(null);
    setHud({ score: 0, vies: 3, temps: mode === "zen" ? 90 : null });
    moteur.current?.demarrer(mode);
    setPhase("jeu");
  };
  const reprendrePartie = () => {
    if (!reprise || !moteur.current) return;
    modeRef.current = reprise.mode;
    setResultat(null);
    moteur.current.restaurer(reprise);
    setReprise(null);
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

      {phase === "graphique" && (
        <div className="kk-centre">
          <div className="kk-panneau">
            <h2>Affichage interrompu</h2>
            <p>L'iPhone a libéré la mémoire graphique pendant la pause. Ton panier et ton record sont enregistrés.</p>
            <button className="btn" onClick={() => { setPhase("chargement"); setGeneration((g) => g + 1); }}>Relancer l'affichage</button>
          </div>
        </div>
      )}

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
              {reprise && <button className="btn" onClick={reprendrePartie}>Reprendre ma partie · {reprise.score} pts</button>}
              <button className={reprise ? "btn secondaire" : "btn"} onClick={() => jouer("classique")}>Classique · 3 vies</button>
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
