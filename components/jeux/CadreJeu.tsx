"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DefJeu, Hud, Resultat } from "@/lib/jeux/commun/moteur2d";
import type { Moteur2D } from "@/lib/jeux/commun/moteur2d";
import { chargerJeu, fiche } from "@/lib/jeux/catalogue";

type Donnees = { etoiles?: Record<string, number>; record?: number };
type Ecran = "chargement" | "accueil" | "niveaux" | "jeu" | "pause" | "fin" | "erreur";

export default function CadreJeu({ id, recordInitial, donneesInitiales }: { id: string; recordInitial: number; donneesInitiales: Donnees }) {
  const zone = useRef<HTMLDivElement>(null);
  const moteur = useRef<Moteur2D | null>(null);
  const [def, setDef] = useState<DefJeu | null>(null);
  const [ecran, setEcran] = useState<Ecran>("chargement");
  const [hud, setHud] = useState<Hud>({});
  const [niveau, setNiveau] = useState(1);
  const [res, setRes] = useState<(Resultat & { nouveauRecord: boolean }) | null>(null);
  const [donnees, setDonnees] = useState<Donnees>(donneesInitiales || {});
  const [record, setRecord] = useState(recordInitial || 0);
  const [son, setSon] = useState(true);
  const etat = useRef({ donnees, record, niveau, def });
  etat.current = { donnees, record, niveau, def };
  const f = fiche(id);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [{ Moteur2D, precharger, FONDS_AQUARELLE, cheminFond }, d] = await Promise.all([import("@/lib/jeux/commun/moteur2d"), chargerJeu(id)]);
        await precharger(d?.visuels, { ...(d?.images || {}), ...(d && FONDS_AQUARELLE.has(d.id) ? { ["fond:" + d.id]: cheminFond(d.id) } : {}) });
        if (annule || !zone.current || !d) { if (!d) setEcran("erreur"); return; }
        try { if (localStorage.getItem("kw-son") === "0") setSon(false); } catch { /* rien */ }
        const m = new Moteur2D(zone.current, d, {
          hud: (h) => setHud((x) => ({ ...x, ...h })),
          fin: (r) => terminer(r),
        });
        try { if (localStorage.getItem("kw-son") === "0") m.sons.actif = false; } catch { /* rien */ }
        moteur.current = m;
        setDef(d);
        setEcran("accueil");
      } catch (e) {
        console.error(e);
        setEcran("erreur");
      }
    })();
    return () => { annule = true; moteur.current?.detruire(); moteur.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function terminer(r: Resultat) {
    const { donnees: d, record: rec, niveau: n, def: df } = etat.current;
    const etoiles = { ...(d.etoiles || {}) };
    if (df && df.niveaux > 0 && r.gagne) etoiles[n] = Math.max(etoiles[n] || 0, r.etoiles);
    const nouveauRecord = r.score > rec;
    const suivantes: Donnees = { ...d, etoiles, record: Math.max(rec, r.score) };
    setDonnees(suivantes);
    if (nouveauRecord) setRecord(r.score);
    setRes({ ...r, nouveauRecord });
    setTimeout(() => setEcran("fin"), 700);
    fetch("/api/jeux/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jeu: id, score: r.score, donnees: suivantes }) }).catch(() => {});
  }

  const jouer = (n: number) => {
    setNiveau(n); setRes(null); setHud({});
    moteur.current?.setPause(false);
    moteur.current?.lancer(n);
    setEcran("jeu");
  };
  const basculerPause = () => {
    if (ecran === "jeu") { moteur.current?.setPause(true); setEcran("pause"); }
    else if (ecran === "pause") { moteur.current?.setPause(false); setEcran("jeu"); }
  };
  const basculerSon = () => {
    const v = !son; setSon(v);
    if (moteur.current) moteur.current.sons.actif = v;
    try { localStorage.setItem("kw-son", v ? "1" : "0"); } catch { /* rien */ }
  };
  const etoilesNiv = donnees.etoiles || {};
  const debloque = (n: number) => n === 1 || (etoilesNiv[n - 1] || 0) > 0;
  const totalEtoiles = Object.values(etoilesNiv).reduce((s, x) => s + x, 0);

  return (
    <div className="kk-ecran kw-jeu">
      <div ref={zone} className="kk-scene" />

      <div className="kk-barre">
        <div className="kk-groupe">
          <Link href="/jeux" className="kk-rond" aria-label="Retour aux jeux">←</Link>
          {(ecran === "jeu" || ecran === "pause") && <button className="kk-rond" onClick={basculerPause} aria-label="Pause">{ecran === "pause" ? "▶" : "❚❚"}</button>}
        </div>
        {(ecran === "jeu" || ecran === "pause") && (
          <div className="kk-score">
            <b>{hud.score ?? 0}</b>
            <span>{def && def.niveaux > 0 ? `Niveau ${niveau}` : `Record ${Math.max(record, hud.score ?? 0)}`}{hud.objectif ? ` · ${hud.objectif}` : ""}</span>
          </div>
        )}
        <div className="kk-groupe">
          {(ecran === "jeu" || ecran === "pause") && hud.temps != null && <div className="kk-temps">{Math.ceil(hud.temps)}s</div>}
          <button className="kk-rond" onClick={basculerSon} aria-label={son ? "Couper le son" : "Activer le son"}>{son ? "🔊" : "🔇"}</button>
        </div>
      </div>
      {(ecran === "jeu") && hud.info && <div className="kw-info">{hud.info}</div>}

      {ecran === "chargement" && <div className="kk-centre"><div className="kk-chargement">Chargement…</div></div>}
      {ecran === "erreur" && <div className="kk-centre"><div className="kk-panneau"><h2>Oups</h2><p>Ce jeu n'a pas pu se charger.</p><Link href="/jeux" className="btn">Retour aux jeux</Link></div></div>}

      {ecran === "accueil" && def && (
        <div className="kk-centre kk-traversant">
          <div className="kk-panneau kk-menu">
            <div className="kk-titre kw-titre">{def.titre}</div>
            <p className="kk-accroche">{def.accroche}</p>
            <ul className="kw-regles">{def.regles.map((r, i) => <li key={i}>{r}</li>)}</ul>
            <div className="kk-boutons">
              {def.niveaux > 0
                ? <button className="btn" onClick={() => setEcran("niveaux")}>Jouer · {totalEtoiles}/{def.niveaux * 3} ★</button>
                : <button className="btn" onClick={() => jouer(1)}>Jouer{record ? ` · record ${record}` : ""}</button>}
            </div>
          </div>
        </div>
      )}

      {ecran === "niveaux" && def && (
        <div className="kk-centre">
          <div className="kk-panneau kw-niveaux">
            <h2>{def.titre}</h2>
            <div className="kw-grille">
              {Array.from({ length: def.niveaux }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`kw-niv ${debloque(n) ? "" : "verrou"}`} disabled={!debloque(n)} onClick={() => jouer(n)}>
                  <b>{debloque(n) ? n : "🔒"}</b>
                  <span>{[1, 2, 3].map((k) => <i key={k} className={(etoilesNiv[n] || 0) >= k ? "on" : ""}>★</i>)}</span>
                </button>
              ))}
            </div>
            <button className="btn secondaire" onClick={() => setEcran("accueil")}>Retour</button>
          </div>
        </div>
      )}

      {ecran === "pause" && (
        <div className="kk-centre"><div className="kk-panneau"><h2>Pause</h2>
          <div className="kk-boutons">
            <button className="btn" onClick={basculerPause}>Reprendre</button>
            <button className="btn secondaire" onClick={() => jouer(niveau)}>Recommencer</button>
          </div></div></div>
      )}

      {ecran === "fin" && res && def && (
        <div className="kk-centre">
          <div className="kk-panneau kk-fin">
            {def.niveaux > 0 && (
              <div className="kw-etoiles-fin">{[1, 2, 3].map((k) => <i key={k} className={res.etoiles >= k && res.gagne ? "on" : ""} style={{ animationDelay: `${k * 0.2}s` }}>★</i>)}</div>
            )}
            <h2>{res.gagne ? (def.niveaux > 0 ? "Gagné !" : "Bien joué !") : "Presque !"}</h2>
            {res.nouveauRecord && <div className="kk-badge">Nouveau record !</div>}
            <div className="kk-gros-score">{res.score}</div>
            <div className="kk-boutons">
              {def.niveaux > 0 && res.gagne && niveau < def.niveaux && <button className="btn" onClick={() => jouer(niveau + 1)}>Niveau suivant</button>}
              <button className={def.niveaux > 0 && res.gagne ? "btn secondaire" : "btn"} onClick={() => jouer(niveau)}>Encore une !</button>
              {def.niveaux > 0 && <button className="btn secondaire" onClick={() => setEcran("niveaux")}>Niveaux</button>}
            </div>
          </div>
        </div>
      )}
      {f && null}
    </div>
  );
}
