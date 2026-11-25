"use client";
// Lecteur Kwélafé : EPUB à mise en page fixe, EPUB à texte redimensionnable et PDF (pages en images).
// iPad / tablette : une page en portrait, deux pages en paysage.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Manifeste } from "@/lib/donnees";

type Props = {
  livre: { id: string; slug: string; titre: string; manifeste: Exclude<Manifeste, { type: "web" }> };
  jetonInitial: string;
  positionInitiale: { i: number; f: number };
  email: string;
};

const THEMES = {
  clair: { nom: "Clair", fond: "#fffdf8" },
  sepia: { nom: "Sépia", fond: "#f4ecd8" },
  nuit: { nom: "Nuit", fond: "#1c1b1a" },
} as const;
type Theme = keyof typeof THEMES;

function lirePref<T>(cle: string, defaut: T): T {
  try {
    const v = localStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}
function ecrirePref(cle: string, v: unknown) {
  try { localStorage.setItem(cle, JSON.stringify(v)); } catch {}
}

export default function Lecteur({ livre, jetonInitial, positionInitiale, email }: Props) {
  const m = livre.manifeste;
  const mode: "pdf" | "fixe" | "texte" = m.type === "pdf" ? "pdf" : m.fixe ? "fixe" : "texte";
  const total = m.type === "pdf" ? m.pages : m.pages.length;

  const jetonRef = useRef(jetonInitial);
  const [i, setI] = useState(() => Math.min(Math.max(0, positionInitiale.i || 0), total - 1));
  const [debutChapitre, setDebutChapitre] = useState<number | "fin">(positionInitiale.f || 0);
  const [etatTexte, setEtatTexte] = useState({ page: 0, pages: 1 });
  const [barre, setBarre] = useState(true);
  const [panneau, setPanneau] = useState<null | "sommaire" | "aa">(null);
  const [taille, setTaille] = useState(115);
  const [theme, setTheme] = useState<Theme>("clair");
  const [zoom, setZoom] = useState(false);
  const [fin, setFin] = useState(false);
  const [dims, setDims] = useState({ w: 1024, h: 768 });
  const cadres = useRef<(HTMLIFrameElement | null)[]>([]);

  /* ---------- Dimensions et préférences ---------- */
  useEffect(() => {
    const maj = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    maj();
    window.addEventListener("resize", maj);
    setTaille(lirePref("kw_taille", 115));
    setTheme(lirePref<Theme>("kw_theme", "clair"));
    return () => window.removeEventListener("resize", maj);
  }, []);

  const paysage = dims.w > dims.h;
  const double = mode !== "texte" && paysage && dims.w >= 700 && !zoom;
  const colonnes = mode === "texte" && paysage && dims.w >= 900 ? 2 : 1;

  /* ---------- Pages affichées (simple ou double) ---------- */
  const affichees = useMemo(() => {
    if (mode === "texte") return [i];
    if (!double || i === 0) return [i];
    const debut = i % 2 === 1 ? i : i - 1;
    return [debut, debut + 1].filter((p) => p < total);
  }, [i, double, mode, total]);

  /* ---------- Navigation ---------- */
  const envoyerAuCadre = (msg: object) => cadres.current[0]?.contentWindow?.postMessage(msg, "*");

  const suivant = useCallback(() => {
    if (mode === "texte") return envoyerAuCadre({ cmd: "suivant" });
    const dernier = affichees[affichees.length - 1];
    if (dernier >= total - 1) return setFin(true);
    setI(dernier + 1);
  }, [mode, affichees, total]);

  const precedent = useCallback(() => {
    setFin(false);
    if (mode === "texte") return envoyerAuCadre({ cmd: "precedent" });
    const premier = affichees[0];
    if (premier <= 0) return;
    setI(double && premier > 1 ? premier - 2 : premier - 1);
  }, [mode, affichees, double]);

  const allerA = (index: number) => {
    setFin(false);
    setDebutChapitre(0);
    setI(Math.min(Math.max(0, index), total - 1));
    setPanneau(null);
  };

  const basculerBarre = useCallback(() => setBarre((b) => !b), []);
  const toucher = useCallback(
    (x: number) => {
      if (x < 0.15) precedent();
      else if (x > 0.85) suivant();
      else basculerBarre();
    },
    [precedent, suivant, basculerBarre]
  );

  /* ---------- Messages venant des pages du livre ---------- */
  useEffect(() => {
    function recevoir(e: MessageEvent) {
      const d = e.data;
      if (!d || d.kw !== 1) return;
      const index = cadres.current.findIndex((c) => c?.contentWindow === e.source);
      if (index < 0) return;
      if (d.k === "toucher") {
        const x = affichees.length === 2 ? (index === 0 ? d.x / 2 : 0.5 + d.x / 2) : d.x;
        toucher(x);
      } else if (d.k === "glisser") {
        if (d.dir === "suivant") suivant(); else precedent();
      } else if (d.k === "etat") {
        setEtatTexte({ page: d.page, pages: d.pages });
      } else if (d.k === "bord") {
        if (d.dir === "suivant") {
          if (i < total - 1) { setDebutChapitre(0); setI(i + 1); } else setFin(true);
        } else if (i > 0) { setDebutChapitre("fin"); setI(i - 1); }
      } else if (d.k === "lien" && m.type === "epub") {
        const cible = String(d.href).split("#")[0];
        const idx = m.pages.findIndex((p) => p.href === cible || p.href.endsWith("/" + cible));
        if (idx >= 0) allerA(idx);
      }
    }
    window.addEventListener("message", recevoir);
    return () => window.removeEventListener("message", recevoir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affichees, toucher, suivant, precedent, i, total]);

  /* ---------- Clavier ---------- */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") suivant();
      if (e.key === "ArrowLeft") precedent();
      if (e.key === "Escape") setPanneau(null);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [suivant, precedent]);

  /* ---------- Barre d'outils : disparaît après 3,5 secondes ---------- */
  useEffect(() => {
    if (!barre || panneau) return;
    const t = setTimeout(() => setBarre(false), 3500);
    return () => clearTimeout(t);
  }, [barre, panneau, i]);

  /* ---------- Renouvellement du jeton de lecture (toutes les 20 minutes) ---------- */
  useEffect(() => {
    const t = setInterval(async () => {
      const r = await fetch(`/api/jeton?livre=${livre.id}`);
      if (r.ok) jetonRef.current = (await r.json()).jeton;
    }, 20 * 60 * 1000);
    return () => clearInterval(t);
  }, [livre.id]);

  /* ---------- Progression : enregistrée toutes les 10 secondes et à la fermeture ---------- */
  const fraction = mode === "texte" ? etatTexte.page / Math.max(1, etatTexte.pages) : 0;
  const pourcentage =
    mode === "texte"
      ? ((i + (etatTexte.pages > 1 ? (etatTexte.page + 1) / etatTexte.pages : 1)) / total) * 100
      : ((affichees[affichees.length - 1] + 1) / total) * 100;
  const aEnvoyer = useRef({ cle: "", corps: "" });
  aEnvoyer.current.corps = JSON.stringify({ livre: livre.id, position: { i, f: fraction }, pourcentage: fin ? 100 : pourcentage });

  useEffect(() => {
    const envoyer = (beacon = false) => {
      const corps = aEnvoyer.current.corps;
      if (corps === aEnvoyer.current.cle) return;
      aEnvoyer.current.cle = corps;
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/progression", new Blob([corps], { type: "application/json" }));
      else fetch("/api/progression", { method: "POST", headers: { "Content-Type": "application/json" }, body: corps, keepalive: true }).catch(() => {});
    };
    const t = setInterval(() => envoyer(), 10_000);
    const cacher = () => { if (document.visibilityState === "hidden") envoyer(true); };
    document.addEventListener("visibilitychange", cacher);
    window.addEventListener("pagehide", () => envoyer(true));
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", cacher); envoyer(true); };
  }, []);

  /* ---------- Préchargement des pages PDF suivantes ---------- */
  useEffect(() => {
    if (mode !== "pdf") return;
    const dernier = affichees[affichees.length - 1];
    for (let p = dernier + 1; p <= Math.min(total - 1, dernier + 2); p++) {
      const img = new Image();
      img.src = `/c/${jetonRef.current}/pdf/${p + 1}.${m.type === "pdf" ? m.ext || "webp" : "webp"}`;
    }
  }, [affichees, mode, total]);

  /* ---------- Réglages du texte ---------- */
  const changerTaille = (delta: number) => {
    const t = Math.min(180, Math.max(80, taille + delta));
    setTaille(t);
    ecrirePref("kw_taille", t);
    envoyerAuCadre({ cmd: "police", t });
  };
  const changerTheme = (th: Theme) => {
    setTheme(th);
    ecrirePref("kw_theme", th);
    envoyerAuCadre({ cmd: "theme", th });
  };

  /* ---------- Adresse de la page de texte (rechargée seulement au changement de chapitre) ---------- */
  const srcTexte = useMemo(() => {
    if (m.type !== "epub" || mode !== "texte") return "";
    return `/c/${jetonRef.current}/${encodeURI(m.pages[i].href)}#m=r&c=${colonnes}&t=${taille}&th=${theme}&f=${debutChapitre}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, colonnes, mode]);

  /* ---------- Gestes sur les pages PDF ---------- */
  const depart = useRef<{ x: number; y: number } | null>(null);
  const surDebutToucher = (e: React.TouchEvent) => {
    if (e.touches.length === 1) depart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    else depart.current = null;
  };
  const surFinToucher = (e: React.TouchEvent) => {
    if (!depart.current || zoom) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - depart.current.x, dy = t.clientY - depart.current.y;
    depart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { e.preventDefault(); dx < 0 ? suivant() : precedent(); }
  };

  /* ---------- Mise à l'échelle ---------- */
  const marge = 12;
  const zoneL = dims.w - marge * 2;
  const zoneH = dims.h - marge * 2;
  let echelle = 1, larg = 768, haut = 1024;
  if (mode === "fixe" && m.type === "epub") {
    larg = m.largeur || 768;
    haut = m.hauteur || 1024;
    echelle = Math.min(zoneL / (larg * affichees.length), zoneH / haut);
  }
  let hImg = 0, lImg = 0;
  if (m.type === "pdf") {
    const n = affichees.length;
    hImg = Math.min(zoneH, (zoneL / n) * m.ratio);
    lImg = hImg / m.ratio;
    if (zoom) { lImg = Math.min(dims.w * 2, 2400); hImg = lImg * m.ratio; }
  }

  const fond = mode === "texte" ? THEMES[theme].fond : "#efeae1";
  const sombre = mode === "texte" && theme === "nuit";
  const sommaire = m.type === "epub" ? (m.sommaire.length ? m.sommaire : m.pages.map((p, k) => ({ titre: p.titre || `Page ${k + 1}`, index: k }))) : [];

  const libellePosition =
    mode === "texte"
      ? `Chapitre ${i + 1} sur ${total}`
      : affichees.length === 2
        ? `Pages ${affichees[0] + 1}-${affichees[1] + 1} sur ${total}`
        : `Page ${i + 1} sur ${total}`;

  return (
    <div className={`lecteur ${sombre ? "sombre" : ""}`} style={{ background: fond }}>
      {/* ----- Zone de lecture ----- */}
      <div
        className={`scene ${zoom ? "zoom" : ""}`}
        onTouchStart={mode === "pdf" ? surDebutToucher : undefined}
        onTouchEnd={mode === "pdf" ? surFinToucher : undefined}
        onClick={mode === "pdf" ? (e) => toucher(zoom ? 0.5 : e.clientX / dims.w) : undefined}
        onContextMenu={(e) => e.preventDefault()}
      >
        {mode === "texte" && (
          <iframe
            key={srcTexte}
            ref={(el) => { cadres.current[0] = el; }}
            src={srcTexte}
            title={livre.titre}
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            className="cadre-texte"
          />
        )}

        {mode === "fixe" && m.type === "epub" && (
          <div className="planche">
            {affichees.map((p, k) => (
              <div key={p} className="feuille" style={{ width: larg * echelle, height: haut * echelle }}>
                <iframe
                  ref={(el) => { cadres.current[k] = el; }}
                  src={`/c/${jetonRef.current}/${encodeURI(m.pages[p].href)}#m=f`}
                  title={`${livre.titre}, page ${p + 1}`}
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  style={{ width: larg, height: haut, transform: `scale(${echelle})` }}
                />
              </div>
            ))}
          </div>
        )}

        {mode === "pdf" && (
          <div className="planche">
            {affichees.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p}
                src={`/c/${jetonRef.current}/pdf/${p + 1}.${m.type === "pdf" ? m.ext || "webp" : "webp"}`}
                alt={`Page ${p + 1}`}
                draggable={false}
                className="page-pdf"
                style={{ width: lImg, height: hImg }}
              />
            ))}
          </div>
        )}

        <div className="filigrane" aria-hidden>{email}</div>
      </div>

      {/* ----- Barre du haut ----- */}
      <header className={`barre-haut ${barre ? "visible" : ""}`}>
        <Link href={`/livre/${livre.slug}`} className="bouton-rond" aria-label="Retour à ma bibliothèque">←</Link>
        <div className="titre-lecteur">{livre.titre}</div>
        {sommaire.length > 0 ? (
          <button className="bouton-rond" onClick={() => setPanneau(panneau === "sommaire" ? null : "sommaire")} aria-label="Sommaire">☰</button>
        ) : <span style={{ width: 48 }} />}
      </header>

      {/* ----- Barre du bas ----- */}
      <footer className={`barre-bas ${barre ? "visible" : ""}`}>
        <div className="ligne-curseur">
          <button className="bouton-rond" onClick={precedent} aria-label="Page précédente">‹</button>
          <input
            type="range"
            min={0}
            max={Math.max(0, total - 1)}
            value={i}
            onChange={(e) => allerA(Number(e.target.value))}
            aria-label="Aller à la page"
          />
          <button className="bouton-rond" onClick={suivant} aria-label="Page suivante">›</button>
        </div>
        <div className="ligne-infos">
          <span>{libellePosition}{mode === "texte" && etatTexte.pages > 1 ? ` · page ${etatTexte.page + 1}/${etatTexte.pages}` : ""}</span>
          {mode === "texte" && <button className="bouton-texte" onClick={() => setPanneau(panneau === "aa" ? null : "aa")}>Aa</button>}
          {mode === "pdf" && <button className="bouton-texte" onClick={() => setZoom(!zoom)}>{zoom ? "Taille normale" : "🔍 Agrandir"}</button>}
        </div>
      </footer>

      {/* ----- Panneaux ----- */}
      {panneau === "sommaire" && (
        <div className="voile" onClick={() => setPanneau(null)}>
          <div className="panneau-lecteur" onClick={(e) => e.stopPropagation()}>
            <h2>Sommaire</h2>
            <ul className="liste-sommaire">
              {sommaire.map((s, k) => (
                <li key={k}>
                  <button className={s.index === i ? "actif" : ""} onClick={() => allerA(s.index)}>{s.titre}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {panneau === "aa" && (
        <div className="voile" onClick={() => setPanneau(null)}>
          <div className="panneau-lecteur" onClick={(e) => e.stopPropagation()}>
            <h2>Affichage</h2>
            <div className="reglage">
              <button className="btn secondaire" onClick={() => changerTaille(-10)} aria-label="Texte plus petit">A−</button>
              <span>{taille} %</span>
              <button className="btn secondaire" onClick={() => changerTaille(10)} aria-label="Texte plus grand" style={{ fontSize: 22 }}>A+</button>
            </div>
            <div className="reglage">
              {(Object.keys(THEMES) as Theme[]).map((th) => (
                <button key={th} className={`pastille-theme ${theme === th ? "active" : ""}`} style={{ background: THEMES[th].fond, color: th === "nuit" ? "#eee" : "#222" }} onClick={() => changerTheme(th)}>
                  {THEMES[th].nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {fin && (
        <div className="voile">
          <div className="panneau-lecteur" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 54 }}>🌺</div>
            <h2>Fin du livre</h2>
            <p className="texte-doux" style={{ margin: "8px 0 20px" }}>Mèsi pou la lektir ! Un autre livre t'attend dans ta bibliothèque.</p>
            <div style={{ display: "grid", gap: 10 }}>
              <Link className="btn" href="/livres">Retour à mes livres</Link>
              <button className="btn secondaire" onClick={() => setFin(false)}>Rester sur cette page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
