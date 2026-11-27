"use client";
// Parcours façon Duolingo : unités en chemin, leçons de 10 exercices, XP, série de jours, cœurs.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Unite, Mot } from "@/lib/apprendre";

type Progres = { xp: number; serie: number; jour: string; finies: Record<number, number>; coeurs: number; jourCoeurs: string; xpSemaine?: number };
type Rang = { rang: number; prenom: string; xp: number; moi: boolean };
type Exo = { type: "fr" | "kr"; mot: Mot; choix: string[] } | { type: "paires"; mots: Mot[] };

const CLE = "kw-apprendre-v1";
const auj = () => new Date().toISOString().slice(0, 10);
const hier = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const melange = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const MAX_COEURS = 5;

function lire(): Progres {
  const vide = { xp: 0, serie: 0, jour: "", finies: {}, coeurs: MAX_COEURS, jourCoeurs: auj() };
  try {
    const p = { ...vide, ...JSON.parse(localStorage.getItem(CLE) || "{}") } as Progres;
    if (p.jourCoeurs !== auj()) { p.coeurs = MAX_COEURS; p.jourCoeurs = auj(); }
    return p;
  } catch { return vide; }
}
function ecrire(p: Progres) { try { localStorage.setItem(CLE, JSON.stringify(p)); } catch {} }

function preparer(u: Unite, toutes: Unite[]): Exo[] {
  const pool = toutes.flatMap((x) => x.mots);
  const revision = toutes.filter((x) => x.id < u.id).flatMap((x) => x.mots);
  const cible = [...u.mots, ...melange(revision).slice(0, 2)];
  const leurres = (bon: string, champ: "fr" | "kr") => melange(pool.map((m) => m[champ]).filter((x) => x !== bon)).slice(0, 3);
  const exos: Exo[] = [];
  melange(cible).slice(0, 8).forEach((m, i) => {
    const type = i % 2 ? "kr" : "fr";
    const bon = type === "fr" ? m.fr : m.kr;
    exos.push({ type, mot: m, choix: melange([bon, ...leurres(bon, type)]) });
  });
  exos.splice(3, 0, { type: "paires", mots: melange(u.mots).slice(0, 4) });
  exos.push({ type: "paires", mots: melange(u.mots).slice(4, 8).length === 4 ? melange(u.mots).slice(4, 8) : melange(u.mots).slice(0, 4) });
  return exos;
}

export default function Apprendre({ unites }: { unites: Unite[] }) {
  const [p, setP] = useState<Progres | null>(null);
  const [lecon, setLecon] = useState<{ u: Unite; exos: Exo[]; i: number; erreurs: number } | null>(null);
  const [fin, setFin] = useState<{ xp: number; etoiles: number; u: Unite } | null>(null);
  const [connecte, setConnecte] = useState(false);
  const [classement, setClassement] = useState<Rang[]>([]);
  useEffect(() => {
    const local = lire();
    setP(local);
    fetch("/api/apprendre").then((r) => r.json()).then(async (d) => {
      setClassement(d.classement || []);
      if (!d.connecte) return;
      setConnecte(true);
      let srv = d.progres;
      if ((!srv || srv.xp === 0) && local.xp > 0) {
        const r = await fetch("/api/apprendre", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "importer", local }) });
        const j = await r.json(); srv = j.progres; setClassement(j.classement || []);
      }
      if (srv) { setP(srv); ecrire(srv); }
    }).catch(() => {});
  }, []);
  if (!p) return null;

  const maj = (n: Progres) => { setP(n); ecrire(n); };
  const envoyer = (corps: object) => fetch("/api/apprendre", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corps) })
    .then((r) => r.json()).then((j) => { if (j.progres) maj(j.progres); if (j.classement) setClassement(j.classement); }).catch(() => {});
  const debloquee = (id: number) => id === 1 || p.finies[id - 1] !== undefined;

  function terminer(erreurs: number, u: Unite) {
    const etoiles = erreurs === 0 ? 3 : erreurs <= 2 ? 2 : 1;
    const gain = 10 + (3 - erreurs > 0 ? (3 - erreurs) * 5 : 0);
    const serie = p!.jour === auj() ? p!.serie : p!.jour === hier() ? p!.serie + 1 : 1;
    maj({ ...p!, xp: p!.xp + gain, serie, jour: auj(), xpSemaine: (p!.xpSemaine || 0) + gain, finies: { ...p!.finies, [u.id]: Math.max(etoiles, p!.finies[u.id] || 0) } });
    if (connecte) envoyer({ action: "lecon", unite: u.id, etoiles, gain });
    setLecon(null); setFin({ xp: gain, etoiles, u });
  }

  if (lecon) return <Lecon lecon={lecon} coeurs={p.coeurs}
    onErreur={() => { maj({ ...p, coeurs: Math.max(0, p.coeurs - 1) }); if (connecte) envoyer({ action: "coeur" }); }}
    onSuivant={(err) => { const i = lecon.i + 1; if (i >= lecon.exos.length) terminer(err, lecon.u); else setLecon({ ...lecon, i, erreurs: err }); }}
    onQuitter={() => setLecon(null)} />;

  if (fin) return (
    <div className="app-fin">
      <div className="app-mascotte grand" aria-hidden><img src="/apprendre/mascotte.webp" alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /></div>
      <h1>Bravo, leçon terminée !</h1>
      <div className="app-etoiles">{"★".repeat(fin.etoiles)}<span>{"★".repeat(3 - fin.etoiles)}</span></div>
      <div className="app-gains"><div><b>+{fin.xp}</b><small>XP</small></div><div><b>🔥 {p.serie}</b><small>jour{p.serie > 1 ? "s" : ""} de suite</small></div></div>
      <button className="app-btn" onClick={() => setFin(null)}>Continuer</button>
    </div>
  );

  const prochaine = unites.find((u) => p.finies[u.id] === undefined) || unites[unites.length - 1];
  return (
    <>
      <header className="app-entete">
        <div className="app-stats">
          <span title="Série de jours">🔥 {p.serie}</span>
          <span title="Points d'expérience">⭐ {p.xp} XP</span>
          <span title="Cœurs (reviennent chaque jour)">❤️ {p.coeurs}</span>
        </div>
        <div className="app-hero">
          <div className="app-mascotte" aria-hidden><img src="/apprendre/mascotte.webp" alt="" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} /></div>
          <div>
            <div className="eyebrow">Apprendre le créole réunionnais</div>
            <h1>Ti pa, ti pa, n'arivé.</h1>
            <p>Quelques minutes par jour, des mots tirés de nos livres, et ton créole grandit.</p>
          </div>
        </div>
      </header>

      <div className="app-chemin">
        {unites.map((u, k) => {
          const ok = debloquee(u.id);
          const fait = p.finies[u.id];
          const actuelle = u.id === prochaine.id;
          return (
            <div key={u.id} className={`app-noeud ${k % 4 === 1 ? "d1" : k % 4 === 3 ? "g1" : ""}`}>
              <button
                className={`app-rond ${fait !== undefined ? "fait" : ok ? "ouvert" : "ferme"} ${actuelle ? "actuel" : ""}`}
                style={{ ["--c" as any]: u.couleur }}
                disabled={!ok || (p.coeurs === 0)}
                onClick={() => setLecon({ u, exos: preparer(u, unites), i: 0, erreurs: 0 })}
                aria-label={`${u.titre}${ok ? "" : " (verrouillé)"}`}
              >
                <span>{ok ? u.emoji : "🔒"}</span>
              </button>
              {actuelle && ok && <div className="app-bulle">Commencer !</div>}
              <div className="app-noeud-titre"><b>{u.titre}</b>{fait !== undefined && <small>{"★".repeat(fait)}</small>}</div>
            </div>
          );
        })}
      </div>
      <section className="app-ligue">
        <div className="app-ligue-tete"><span>🏆</span><div><b>Ligue de la semaine</b><small>Classement des XP gagnés depuis lundi. On repart à zéro chaque lundi.</small></div></div>
        {!connecte && <p className="app-ligue-info">Connecte-toi pour garder tes progrès sur tous tes appareils et entrer dans la ligue. <a href="/auth/login">Me connecter</a></p>}
        {classement.length === 0 ? <p className="app-ligue-info">Personne encore cette semaine : fais une leçon et prends la première place !</p> : (
          <ol className="app-classement">
            {classement.slice(0, 15).map((r) => (
              <li key={r.rang} className={r.moi ? "moi" : ""}>
                <span className="cl-rang">{r.rang <= 3 ? ["🥇", "🥈", "🥉"][r.rang - 1] : r.rang}</span>
                <span className="cl-nom">{r.moi ? "Toi" : r.prenom}</span>
                <span className="cl-xp">{r.xp} XP</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      {p.coeurs === 0 && <p className="app-alerte">Plus de cœurs pour aujourd'hui : reviens demain, ou relis un livre en attendant 📚</p>}
      <p className="app-source">Les mots viennent des livres <Link href="/catalogue">OTÉ ! Les zarlor</Link> et Kosa i mank ?</p>
    </>
  );
}

function Lecon({ lecon, coeurs, onErreur, onSuivant, onQuitter }: {
  lecon: { u: Unite; exos: Exo[]; i: number; erreurs: number }; coeurs: number;
  onErreur: () => void; onSuivant: (erreurs: number) => void; onQuitter: () => void;
}) {
  const exo = lecon.exos[lecon.i];
  const [choisi, setChoisi] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const [erreurs, setErreurs] = useState(lecon.erreurs);
  // Paires
  const gauche = useMemo(() => (exo.type === "paires" ? melange(exo.mots.map((m) => m.kr)) : []), [exo]);
  const droite = useMemo(() => (exo.type === "paires" ? melange(exo.mots.map((m) => m.fr)) : []), [exo]);
  const [selG, setSelG] = useState<string | null>(null);
  const [trouves, setTrouves] = useState<string[]>([]);
  const [rate, setRate] = useState<string | null>(null);
  useEffect(() => { setChoisi(null); setVerdict(null); setSelG(null); setTrouves([]); setRate(null); }, [lecon.i]);

  const bonne = exo.type === "fr" ? exo.mot.fr : exo.type === "kr" ? exo.mot.kr : "";
  function verifier() {
    const ok = choisi === bonne;
    setVerdict(ok);
    if (!ok) { setErreurs((e) => e + 1); onErreur(); }
  }
  function clicDroite(fr: string) {
    if (!selG || exo.type !== "paires") return;
    const m = exo.mots.find((x) => x.kr === selG)!;
    if (m.fr === fr) { const t = [...trouves, selG]; setTrouves(t); setSelG(null); if (t.length === exo.mots.length) setVerdict(true); }
    else { setRate(fr); setErreurs((e) => e + 1); onErreur(); setTimeout(() => setRate(null), 500); }
  }

  const pct = Math.round((lecon.i / lecon.exos.length) * 100);
  return (
    <div className="app-lecon" style={{ ["--c" as any]: lecon.u.couleur }}>
      <div className="app-barre-haut">
        <button className="app-quitter" onClick={onQuitter} aria-label="Quitter">✕</button>
        <div className="app-progression"><i style={{ width: `${pct}%` }} /></div>
        <span className="app-coeurs">❤️ {coeurs}</span>
      </div>

      {exo.type === "paires" ? (
        <>
          <h2 className="app-consigne">Relie les paires</h2>
          <div className="app-paires">
            <div>{gauche.map((kr) => <button key={kr} className={`app-tuile ${trouves.includes(kr) ? "ok" : ""} ${selG === kr ? "sel" : ""}`} disabled={trouves.includes(kr)} onClick={() => setSelG(kr)}>{kr}</button>)}</div>
            <div>{droite.map((fr) => { const fini = exo.mots.some((m) => m.fr === fr && trouves.includes(m.kr)); return <button key={fr} className={`app-tuile ${fini ? "ok" : ""} ${rate === fr ? "ko" : ""}`} disabled={fini} onClick={() => clicDroite(fr)}>{fr}</button>; })}</div>
          </div>
        </>
      ) : (
        <>
          <h2 className="app-consigne">{exo.type === "fr" ? "Que veut dire ce mot ?" : "Comment dit-on en créole ?"}</h2>
          <div className="app-carte-mot"><span className="app-mini-mascotte" aria-hidden>🐦</span><b>{exo.type === "fr" ? exo.mot.kr : exo.mot.fr}</b></div>
          <div className="app-choix">
            {exo.choix.map((c) => (
              <button key={c} disabled={verdict !== null}
                className={`app-tuile ${choisi === c ? "sel" : ""} ${verdict !== null && c === bonne ? "ok" : ""} ${verdict === false && c === choisi ? "ko" : ""}`}
                onClick={() => setChoisi(c)}>{c}</button>
            ))}
          </div>
        </>
      )}

      <div className={`app-pied ${verdict === true ? "bien" : verdict === false ? "mal" : ""}`}>
        {verdict === true && <div className="app-retour">🎉 Bien joué !{exo.type !== "paires" && <small>{exo.mot.kr} = {exo.mot.fr}</small>}</div>}
        {verdict === false && <div className="app-retour">La bonne réponse : <b>{bonne}</b>{exo.type !== "paires" && <small>Tiré du livre {exo.mot.source}</small>}</div>}
        {verdict === null && exo.type !== "paires" && <button className="app-btn" disabled={!choisi} onClick={verifier}>Vérifier</button>}
        {verdict !== null && <button className="app-btn" onClick={() => onSuivant(erreurs)}>Continuer</button>}
      </div>
    </div>
  );
}
