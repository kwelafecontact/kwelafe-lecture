"use client";
// Lecteur Kwélafé : EPUB à mise en page fixe, EPUB à texte redimensionnable et PDF (pages en images).
// iPad / tablette : une page en portrait, deux pages en paysage.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MARQUE_PAGES } from "@/lib/marque-pages";
import Link from "next/link";
import type { Manifeste } from "@/lib/donnees";

type Marque = { i: number; f: number; titre: string; le: string };

type Props = {
  livre: { id: string; slug: string; titre: string; manifeste: Exclude<Manifeste, { type: "web" }> };
  jetonInitial: string;
  positionInitiale: { i: number; f: number };
  email: string;
  extrait?: { pages: number; boutique: string; abonnement: string };
  code?: string; // code du compte, caché dans le filigrane invisible
  horsLigne?: boolean; // livre téléchargé : pas de jeton à renouveler, progression gardée sur l'appareil
  onFermer?: () => void;
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

const ZOOM_DEPART = 0.5;

export default function Lecteur({ livre, jetonInitial, positionInitiale, email, extrait, code, horsLigne, onFermer }: Props) {
  const m = livre.manifeste;
  const mode: "pdf" | "fixe" | "texte" = m.type === "pdf" ? "pdf" : m.fixe ? "fixe" : "texte";
  const total = Math.min(m.type === "pdf" ? m.pages : m.pages.length, extrait?.pages || Infinity);

  const jetonRef = useRef(jetonInitial);
  const [i, setI] = useState(() => Math.min(Math.max(0, positionInitiale.i || 0), total - 1));
  const [debutChapitre, setDebutChapitre] = useState<number | "fin">(positionInitiale.f || 0);
  const [etatTexte, setEtatTexte] = useState({ page: 0, pages: 1 });
  const [barre, setBarre] = useState(true);
  const [panneau, setPanneau] = useState<null | "menu" | "aa">(null);
  const [ongletMenu, setOngletMenu] = useState<"sommaire" | "pages" | "marques">("sommaire");
  const [marques, setMarques] = useState<Marque[]>([]);
  const [lumiere, setLumiere] = useState(1);
  const [chaud, setChaud] = useState(0);
  const [nuitPages, setNuitPages] = useState(false);
  const [diaporama, setDiaporama] = useState(0);
  const [rappel, setRappel] = useState(0);
  const [pause, setPause] = useState(false);
  const [pleinEcran, setPleinEcran] = useState(false);
  const [toast, setToast] = useState("");
  const [allerVers, setAllerVers] = useState("");
  const [secondes, setSecondes] = useState(0);
  const tours = useRef({ n: 0, depuis: Date.now() });
  const raccourcis = useRef<{ marque: () => void; plein: () => void; tableau: boolean; quitterTableau: () => void }>({ marque: () => {}, plein: () => {}, tableau: false, quitterTableau: () => {} });
  const [taille, setTaille] = useState(115);
  const [theme, setTheme] = useState<Theme>("clair");
  const [zoomNiv, setZoomNiv] = useState(ZOOM_DEPART); // à l'ouverture : 50 % (choix Kwélafé), jusqu'à 4
  const zoom = zoomNiv > 1.01;
  const zoomChange = Math.abs(zoomNiv - ZOOM_DEPART) > 0.01;
  const [cadrage, setCadrage] = useState<"page" | "largeur">("page");
  const [eclair, setEclair] = useState<"" | "g" | "d">("");
  const [motif, setMotif] = useState("lagon");
  const [ecranMasque, setEcranMasque] = useState(false);
  const [appareils, setAppareils] = useState<null | { max: number; autres: { id: string; nom: string; vu: number }[] }>(null);
  const [tableau, setTableau] = useState(false); // mode tableau pour la classe
  const [ecranNoir, setEcranNoir] = useState(false);
  const [pointeur, setPointeur] = useState<{ x: number; y: number } | null>(null);
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
    setLumiere(lirePref("kw_lumiere", 1));
    setChaud(lirePref("kw_chaud", 0));
    setNuitPages(lirePref("kw_nuit_pages", false));
    setRappel(lirePref("kw_rappel", 0));
    setCadrage(lirePref<"page" | "largeur">("kw_cadrage2", "page"));
    setMotif(lirePref("kw_marque_motif", "lagon"));
    return () => window.removeEventListener("resize", maj);
  }, []);

  const paysage = dims.w > dims.h;
  const grandEcran = dims.w >= 900 && dims.h >= 560;
  const double = mode !== "texte" && paysage && grandEcran && !zoom && cadrage === "page";
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

  const allerA = (index: number, fractionChapitre = 0) => {
    setFin(false);
    // Même chapitre en mode texte : on demande simplement à la page de se placer
    if (mode === "texte" && index === i) { envoyerAuCadre({ cmd: "fraction", f: fractionChapitre }); setPanneau(null); return; }
    setDebutChapitre(fractionChapitre);
    setI(Math.min(Math.max(0, index), total - 1));
    setPanneau(null);
  };

  const basculerBarre = useCallback(() => setBarre((b) => !b), []);
  const flash = (c: "g" | "d") => { setEclair(c); setTimeout(() => setEclair(""), 260); };
  const changerZoom = useCallback((z: number) => setZoomNiv(Math.round(Math.min(4, Math.max(0.5, z)) * 100) / 100), []);
  const toucher = useCallback(
    (x: number) => {
      if (x < 0.25) { flash("g"); precedent(); }
      else if (x > 0.75) { flash("d"); suivant(); }
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

  // Le zoom reste le même d'une page à l'autre (on revient à 100 % avec ✕ ou Échap)

  /* ---------- Protection : écran noir quand l'app passe en arrière-plan, pendant une capture d'écran sur ordinateur ou à l'impression ---------- */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const masquer = (duree = 0) => { setEcranMasque(true); if (t) clearTimeout(t); if (duree) t = setTimeout(() => setEcranMasque(false), duree); };
    const vis = () => (document.visibilityState === "hidden" ? masquer() : setTimeout(() => setEcranMasque(false), 250));
    // Toucher une page affichée dans un cadre fait perdre le focus à la fenêtre : ce n'est pas une sortie de l'app
    const perteFocus = () => setTimeout(() => { if (document.activeElement?.tagName !== "IFRAME") masquer(); }, 0);
    const retourFocus = () => setTimeout(() => setEcranMasque(false), 250);
    const touche = (e: KeyboardEvent) => {
      const cap = e.key === "PrintScreen" || ((e.metaKey || e.ctrlKey) && e.shiftKey && ["3", "4", "5", "s", "S"].includes(e.key));
      if (cap) { masquer(2500); try { navigator.clipboard?.writeText(""); } catch {} }
      if ((e.metaKey || e.ctrlKey) && ["p", "P", "s", "S"].includes(e.key) && !e.shiftKey) { e.preventDefault(); masquer(1500); }
    };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("blur", perteFocus);
    window.addEventListener("focus", retourFocus);
    window.addEventListener("keydown", touche, true);
    window.addEventListener("keyup", touche, true);
    const avantImpression = () => masquer();
    window.addEventListener("beforeprint", avantImpression);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      window.removeEventListener("blur", perteFocus);
      window.removeEventListener("focus", retourFocus);
      window.removeEventListener("keydown", touche, true);
      window.removeEventListener("keyup", touche, true);
      window.removeEventListener("beforeprint", avantImpression);
      if (t) clearTimeout(t);
    };
  }, []);

  /* ---------- Rythme de lecture (pour estimer le temps restant) ---------- */
  useEffect(() => { tours.current.n++; }, [i, etatTexte.page]);

  /* ---------- Limite d'appareils (3 par compte) ---------- */
  const verifierAppareil = useCallback(async () => {
    if (horsLigne || extrait) return;
    let id = "";
    try { id = localStorage.getItem("kw-appareil") || ""; if (!id) { id = crypto.randomUUID(); localStorage.setItem("kw-appareil", id); } } catch { return; }
    const ua = navigator.userAgent;
    const nom = /iPad/.test(ua) ? "iPad" : /iPhone/.test(ua) ? "iPhone" : /Android/.test(ua) ? (/Mobile/.test(ua) ? "Téléphone Android" : "Tablette Android") : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "PC Windows" : "Ordinateur";
    try {
      const r = await fetch("/api/appareil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, nom }) });
      const j = await r.json();
      setAppareils(j.ok === false ? { max: j.max, autres: j.autres } : null);
    } catch {}
  }, [horsLigne, extrait]);
  useEffect(() => { verifierAppareil(); }, [verifierAppareil]);
  async function liberer(cible: string) {
    await fetch("/api/appareil", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cible }) }).catch(() => {});
    verifierAppareil();
  }

  /* ---------- Clavier ---------- */
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      // Les télécommandes de présentation envoient PageDown / PageUp
      if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && raccourcis.current.tableau)) { e.preventDefault(); suivant(); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); precedent(); }
      if (e.key === "Escape") { setPanneau(null); setZoomNiv(ZOOM_DEPART); if (raccourcis.current.tableau) raccourcis.current.quitterTableau(); }
      if ((e.key === "n" || e.key === "N" || e.key === ".") && raccourcis.current.tableau) setEcranNoir((v) => !v);
      if (e.key === "+" || e.key === "=") setZoomNiv((z) => Math.min(4, z + 0.5));
      if (e.key === "-") setZoomNiv((z) => Math.max(0.5, z - 0.25));
      if (e.key === "b" || e.key === "B") raccourcis.current.marque();
      if (e.key === "f" || e.key === "F") raccourcis.current.plein();
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
    if (horsLigne) return;
    const t = setInterval(async () => {
      try { const r = await fetch(`/api/jeton?livre=${livre.id}`); if (r.ok) jetonRef.current = (await r.json()).jeton; } catch {}
    }, 20 * 60 * 1000);
    return () => clearInterval(t);
  }, [livre.id, horsLigne]);
  useEffect(() => { if (horsLigne) try { localStorage.setItem(`kw-hl-pos-${livre.id}`, JSON.stringify({ i, f: 0 })); } catch {} }, [horsLigne, livre.id, i]);

  /* ---------- Progression : enregistrée toutes les 10 secondes et à la fermeture ---------- */
  const fraction = mode === "texte" ? etatTexte.page / Math.max(1, etatTexte.pages) : 0;
  const pourcentage =
    mode === "texte"
      ? ((i + (etatTexte.pages > 1 ? (etatTexte.page + 1) / etatTexte.pages : 1)) / total) * 100
      : ((affichees[affichees.length - 1] + 1) / total) * 100;
  const aEnvoyer = useRef({ cle: "", corps: "", secondes: 0 });
  aEnvoyer.current.corps = JSON.stringify({ livre: livre.id, position: { i, f: fraction }, pourcentage: fin ? 100 : pourcentage });

  /* ---------- Temps de lecture : compté seulement quand l'écran est visible ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      aEnvoyer.current.secondes++;
      setSecondes((x) => x + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const envoyer = (beacon = false) => {
      if (extrait) return; // un extrait ne compte pas comme une lecture
      const sec = aEnvoyer.current.secondes;
      if (aEnvoyer.current.corps === aEnvoyer.current.cle && sec < 5) return;
      aEnvoyer.current.cle = aEnvoyer.current.corps;
      aEnvoyer.current.secondes = 0;
      const corps = JSON.stringify({ ...JSON.parse(aEnvoyer.current.corps), secondes: sec });
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/progression", new Blob([corps], { type: "application/json" }));
      else fetch("/api/progression", { method: "POST", headers: { "Content-Type": "application/json" }, body: corps, keepalive: true }).catch(() => {});
    };
    const t = setInterval(() => envoyer(), 20_000);
    const cacher = () => { if (document.visibilityState === "hidden") envoyer(true); };
    const avantFermeture = () => envoyer(true);
    document.addEventListener("visibilitychange", cacher);
    window.addEventListener("pagehide", avantFermeture);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", cacher); window.removeEventListener("pagehide", avantFermeture); envoyer(true); };
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

  /* ---------- Marque-pages (gardés sur le compte) ---------- */
  useEffect(() => {
    fetch(`/api/marques?livre=${livre.id}`).then((r) => (r.ok ? r.json() : { liste: [] })).then((j) => setMarques(j.liste || [])).catch(() => {});
  }, [livre.id]);
  const montrer = (t: string) => { setToast(t); setTimeout(() => setToast(""), 2200); };
  const titrePosition = (index: number) => {
    if (m.type === "epub") {
      const chap = [...(m.sommaire || [])].reverse().find((x) => x.index <= index);
      if (mode === "texte") return `${chap?.titre || m.pages[index]?.titre || `Chapitre ${index + 1}`} · page ${etatTexte.page + 1}`;
      return `Page ${index + 1}${chap ? ` · ${chap.titre}` : ""}`;
    }
    return `Page ${index + 1}`;
  };
  const marqueIci = marques.findIndex((x) => x.i === i && (mode !== "texte" || Math.abs(x.f - fraction) < 0.02));
  const enregistrerMarques = (liste: Marque[]) => {
    setMarques(liste);
    fetch("/api/marques", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ livre: livre.id, liste }) }).catch(() => {});
  };
  function basculerMarque() {
    if (marqueIci >= 0) { enregistrerMarques(marques.filter((_, k) => k !== marqueIci)); montrer("Marque-page retiré"); }
    else {
      const liste = [...marques, { i, f: fraction, titre: titrePosition(i), le: new Date().toISOString() }].sort((a, b) => a.i - b.i || a.f - b.f);
      enregistrerMarques(liste);
      montrer("🔖 Marque-page ajouté");
    }
  }

  /* ---------- Plein écran ---------- */
  function basculerPleinEcran() {
    const d: any = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) {
      const el: any = document.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else (d.exitFullscreen || d.webkitExitFullscreen)?.call(d);
  }
  useEffect(() => {
    const maj = () => { setPleinEcran(!!(document.fullscreenElement || (document as any).webkitFullscreenElement)); setZoomNiv(ZOOM_DEPART); setTimeout(() => setDims({ w: window.innerWidth, h: window.innerHeight }), 150); };
    document.addEventListener("fullscreenchange", maj);
    document.addEventListener("webkitfullscreenchange", maj);
    return () => { document.removeEventListener("fullscreenchange", maj); document.removeEventListener("webkitfullscreenchange", maj); };
  }, []);

  /* ---------- Défilement automatique des pages ---------- */
  useEffect(() => {
    if (!diaporama || panneau || fin) return;
    const t = setTimeout(() => suivant(), diaporama * 1000);
    return () => clearTimeout(t);
  }, [diaporama, i, etatTexte.page, panneau, fin, suivant]);

  /* ---------- Rappel de pause ---------- */
  useEffect(() => {
    if (rappel && secondes > 0 && secondes % (rappel * 60) === 0) setPause(true);
  }, [secondes, rappel]);

  function entrerTableau() {
    setTableau(true); setBarre(false); setPanneau(null); setZoomNiv(ZOOM_DEPART); setCadrage("page");
    const el: any = document.documentElement; const d: any = document;
    if (!d.fullscreenElement && !d.webkitFullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  }
  function quitterTableau() {
    setTableau(false); setEcranNoir(false); setPointeur(null); setBarre(true);
    const d: any = document; if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen)?.call(d);
  }
  raccourcis.current = { marque: basculerMarque, plein: basculerPleinEcran, tableau, quitterTableau };
  const changerReglage = <T,>(cle: string, set: (v: T) => void) => (v: T) => { set(v); ecrirePref(cle, v); };

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
  const pince = useRef<{ d: number; z: number } | null>(null);
  const dernierTap = useRef(0);
  const ecart = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const surDebutToucher = (e: React.TouchEvent) => {
    if (e.touches.length === 2) { pince.current = { d: ecart(e.touches), z: zoomNiv }; depart.current = null; return; }
    if (e.touches.length === 1) depart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    else depart.current = null;
  };
  const surBougerToucher = (e: React.TouchEvent) => {
    if (pince.current && e.touches.length === 2) changerZoom(pince.current.z * (ecart(e.touches) / pince.current.d));
  };
  const surFinToucher = (e: React.TouchEvent) => {
    if (pince.current) { if (e.touches.length < 2) pince.current = null; return; }
    const maintenant = Date.now();
    if (maintenant - dernierTap.current < 300 && depart.current) { dernierTap.current = 0; depart.current = null; changerZoom(zoom ? 1 : 2); e.preventDefault(); return; }
    dernierTap.current = maintenant;
    if (!depart.current || zoom) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - depart.current.x, dy = t.clientY - depart.current.y;
    depart.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { e.preventDefault(); dx < 0 ? suivant() : precedent(); }
  };

  /* ---------- Mise à l'échelle ---------- */
  // Marges : presque rien sur téléphone, un peu d'air sur tablette et ordinateur
  const marge = dims.w < 600 ? 2 : dims.w < 1100 ? 10 : 24;
  const zoneL = dims.w - marge * 2;
  const zoneH = dims.h - marge * 2;
  const surface = (lp: number, hp: number, n: number) => {
    const entiere = Math.min(zoneL / (lp * n), zoneH / hp);
    const largeur = Math.min(zoneL / (lp * n), (zoneL > 1100 ? 1100 : zoneL) / (lp * n));
    return (cadrage === "largeur" ? largeur : entiere) * zoomNiv;
  };
  let echelle = 1, larg = 768, haut = 1024;
  if (mode === "fixe" && m.type === "epub") {
    larg = m.largeur || 768;
    haut = m.hauteur || 1024;
    echelle = surface(larg, haut, affichees.length);
  }
  let hImg = 0, lImg = 0;
  if (m.type === "pdf") {
    const k = surface(1000, 1000 * m.ratio, affichees.length);
    lImg = 1000 * k;
    hImg = lImg * m.ratio;
  }
  const deborde = mode !== "texte" && ((m.type === "pdf" && (hImg > zoneH + 2 || lImg * affichees.length > zoneL + 2)) || (mode === "fixe" && (haut * echelle > zoneH + 2 || larg * echelle * affichees.length > zoneL + 2)));

  const fond = mode === "texte" ? THEMES[theme].fond : "#efeae1";
  const sombre = mode === "texte" && theme === "nuit";
  const sommaire = m.type === "epub" ? (m.sommaire.length ? m.sommaire : m.pages.map((p, k) => ({ titre: p.titre || `Page ${k + 1}`, index: k }))) : [];

  const libellePosition =
    mode === "texte"
      ? `Chapitre ${i + 1} sur ${total}`
      : affichees.length === 2
        ? `Pages ${affichees[0] + 1}-${affichees[1] + 1} sur ${total}`
        : `Page ${i + 1} sur ${total}`;

  // Temps restant estimé : rythme réel de la séance, sinon environ 50 secondes par page
  const pagesRestantes = mode === "texte" ? Math.max(0, (100 - pourcentage) / 100) * Math.max(total, 1) * 6 : Math.max(0, total - 1 - affichees[affichees.length - 1]);
  const tempsParPage = tours.current.n >= 4 ? Math.min(240, Math.max(15, (Date.now() - tours.current.depuis) / 1000 / tours.current.n)) : 50;
  const minutesRestantes = Math.round((pagesRestantes * tempsParPage) / 60);
  const texteRestant = fin || pourcentage >= 99.5 ? "Terminé" : minutesRestantes < 1 ? "moins d'une minute" : minutesRestantes >= 60 ? `${Math.floor(minutesRestantes / 60)} h ${String(minutesRestantes % 60).padStart(2, "0")} restantes` : `${minutesRestantes} min restantes`;
  const filtrePages = nuitPages && mode !== "texte" ? "invert(0.92) hue-rotate(180deg) brightness(0.95)" : undefined;
  const fondFinal = nuitPages && mode !== "texte" ? "#121212" : fond;

  return (
    <div
      className={`lecteur ${sombre || (nuitPages && mode !== "texte") ? "sombre" : ""} ${tableau ? "mode-tableau" : ""}`}
      style={{ background: tableau ? "#000" : fondFinal }}
      onMouseMove={tableau ? (e) => setPointeur({ x: e.clientX, y: e.clientY }) : undefined}
      onMouseLeave={tableau ? () => setPointeur(null) : undefined}
    >
      {/* ----- Zone de lecture ----- */}
      <div
        className={`scene ${deborde ? "defile" : ""}`}
        onTouchStart={mode === "pdf" ? surDebutToucher : undefined}
        onTouchMove={mode === "pdf" ? surBougerToucher : undefined}
        onTouchEnd={mode === "pdf" ? surFinToucher : undefined}
        onWheel={mode !== "texte" ? (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); changerZoom(zoomNiv - e.deltaY / 300); } } : undefined}
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
          <div className="planche" style={{ filter: filtrePages }}>
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
          <div className="planche" style={{ filter: filtrePages }}>
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
        {code && (
          <div className="filigrane-invisible" aria-hidden>
            {Array.from({ length: 40 }, (_, k) => <span key={k}>KW·{code}</span>)}
          </div>
        )}
      </div>
      {appareils && (
        <div className="ecran-appareils">
          <div className="panneau">
            <h2>📱 {appareils.max} appareils maximum</h2>
            <p className="texte-doux">Ton compte est déjà utilisé sur {appareils.max} appareils. Déconnecte-en un pour lire ici.</p>
            {appareils.autres.map((a) => (
              <div key={a.id} className="ligne-appareil">
                <span><b>{a.nom}</b><small>Vu le {new Date(a.vu).toLocaleDateString("fr-FR")}</small></span>
                <button className="btn secondaire" onClick={() => liberer(a.id)}>Déconnecter</button>
              </div>
            ))}
            <p className="texte-doux" style={{ fontSize: 13 }}>Les élèves entrés avec un code de classe ne sont pas concernés.</p>
            <Link className="lien" href={`/livre/${livre.slug}`}>Retour</Link>
          </div>
        </div>
      )}
      {tableau && (
        <>
          {pointeur && <div className="pointeur-laser" style={{ left: pointeur.x, top: pointeur.y }} aria-hidden />}
          {ecranNoir && <div className="tableau-noir" onClick={() => setEcranNoir(false)} />}
          <div className="tableau-outils">
            <span className="tableau-page">{i + 1} / {total}</span>
            <button onClick={() => setEcranNoir((v) => !v)} title="Écran noir (N)">⬛</button>
            <button onClick={quitterTableau} title="Quitter le mode tableau (Échap)">✕</button>
          </div>
        </>
      )}
      {ecranMasque && !tableau && (
        <div className="ecran-protege" onClick={() => setEcranMasque(false)}>
          <span>🔒</span>
          <b>Lecture protégée</b>
          <small>Touche l'écran pour reprendre ta lecture</small>
        </div>
      )}
      {chaud > 0 && <div className="calque-chaud" style={{ opacity: chaud * 0.35 }} aria-hidden />}
      {lumiere < 1 && <div className="calque-lumiere" style={{ opacity: (1 - lumiere) * 0.85 }} aria-hidden />}
      {marqueIci >= 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="marque-page-visuel" src={`/marque-pages/${motif}.svg`} alt="Page marquée" />
      )}
      <button className={`fleche-page gauche ${barre ? "visible" : ""}`} onClick={(e) => { e.stopPropagation(); flash("g"); precedent(); }} aria-label="Page précédente">‹</button>
      <button className={`fleche-page droite ${barre ? "visible" : ""}`} onClick={(e) => { e.stopPropagation(); flash("d"); suivant(); }} aria-label="Page suivante">›</button>
      {eclair && <div className={`eclair-zone ${eclair}`} aria-hidden />}
      {zoomChange && mode !== "texte" && (
        <div className="pastille-zoom" role="group" aria-label="Zoom">
          <button onClick={() => changerZoom(zoomNiv - 0.25)} aria-label="Dézoomer">−</button>
          <span>{Math.round(zoomNiv * 100)} %</span>
          <button onClick={() => changerZoom(zoomNiv + 0.5)} aria-label="Zoomer">+</button>
          <button onClick={() => setZoomNiv(ZOOM_DEPART)} aria-label="Revenir à la page entière">✕</button>
        </div>
      )}
      <div className={`progression-fine ${barre ? "cachee" : ""}`} aria-hidden><i style={{ width: `${Math.min(100, fin ? 100 : pourcentage)}%` }} /></div>
      {toast && <div className="toast-lecteur" role="status">{toast}</div>}
      {extrait && <div className="bandeau-extrait">Extrait gratuit · {extrait.pages} {m.type === "epub" && mode === "texte" ? "chapitre" : "pages"}</div>}

      {/* ----- Barre du haut ----- */}
      <header className={`barre-haut ${barre ? "visible" : ""}`}>
        {onFermer ? <button onClick={onFermer} className="bouton-rond" aria-label="Retour à mes livres hors connexion">←</button> : <Link href={`/livre/${livre.slug}`} className="bouton-rond" aria-label="Retour à ma bibliothèque">←</Link>}
        <div className="titre-lecteur">{livre.titre}</div>
        <button className={`bouton-rond ${marqueIci >= 0 ? "actif" : ""}`} onClick={basculerMarque} aria-label={marqueIci >= 0 ? "Retirer le marque-page" : "Ajouter un marque-page"} title="Marque-page (B)">🔖</button>
        <button className="bouton-rond" onClick={() => { setOngletMenu(sommaire.length ? "sommaire" : "pages"); setPanneau("menu"); }} aria-label="Sommaire, pages et marque-pages">☰</button>
        <button className="bouton-rond" onClick={() => setPanneau("aa")} aria-label="Réglages de lecture">Aa</button>
        <button className="bouton-rond" onClick={entrerTableau} aria-label="Mode tableau" title="Mode tableau pour la classe">📽</button>
        <button className="bouton-rond cache-mobile" onClick={basculerPleinEcran} aria-label="Plein écran" title="Plein écran (F)">{pleinEcran ? "🗗" : "⛶"}</button>
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
          <span className="pourcent">{Math.round(fin ? 100 : pourcentage)} % · ⏱ {texteRestant}</span>
          <span className="outils-bas">
            {diaporama > 0 && <button className="bouton-texte actif" onClick={() => setDiaporama(0)}>⏸ Arrêter</button>}
            {mode !== "texte" && (
              <>
                <button className="bouton-texte" onClick={() => changerZoom(zoomNiv - 0.25)} aria-label="Dézoomer">−</button>
                <button className="bouton-texte" onClick={() => setZoomNiv(ZOOM_DEPART)} title="Revenir au zoom de départ">🔍 {Math.round(zoomNiv * 100)} %</button>
                <button className="bouton-texte" onClick={() => changerZoom(zoomNiv + 0.5)} aria-label="Zoomer">+</button>
                <button className="bouton-texte" onClick={() => { const c = cadrage === "page" ? "largeur" : "page"; setCadrage(c); ecrirePref("kw_cadrage2", c); setZoomNiv(ZOOM_DEPART); }}>
                  {cadrage === "page" ? "↔ Pleine largeur" : "▣ Page entière"}
                </button>
              </>
            )}
          </span>
        </div>
      </footer>

      {/* ----- Panneaux ----- */}
      {panneau === "menu" && (
        <div className="voile" onClick={() => setPanneau(null)}>
          <div className="panneau-lecteur large" onClick={(e) => e.stopPropagation()}>
            <div className="onglets-lecteur" role="tablist">
              {sommaire.length > 0 && <button role="tab" aria-selected={ongletMenu === "sommaire"} className={ongletMenu === "sommaire" ? "actif" : ""} onClick={() => setOngletMenu("sommaire")}>☰ Sommaire</button>}
              {mode !== "texte" && <button role="tab" aria-selected={ongletMenu === "pages"} className={ongletMenu === "pages" ? "actif" : ""} onClick={() => setOngletMenu("pages")}>▦ Pages</button>}
              <button role="tab" aria-selected={ongletMenu === "marques"} className={ongletMenu === "marques" ? "actif" : ""} onClick={() => setOngletMenu("marques")}>🔖 Marque-pages {marques.length > 0 && <small>{marques.length}</small>}</button>
            </div>

            {ongletMenu === "sommaire" && (
              <ul className="liste-sommaire">
                {sommaire.map((s, k) => {
                  const suivantIdx = sommaire[k + 1]?.index ?? total;
                  const ici = i >= s.index && i < suivantIdx;
                  return (
                    <li key={k}>
                      <button className={ici ? "actif" : ""} onClick={() => allerA(s.index)}>
                        <span>{s.titre}</span>{mode !== "texte" && <em>{s.index + 1}</em>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {ongletMenu === "pages" && mode !== "texte" && (
              <>
                <form className="aller-page" onSubmit={(e) => { e.preventDefault(); const n = parseInt(allerVers, 10); if (n >= 1 && n <= total) allerA(n - 1); }}>
                  <label>Aller à la page
                    <input type="number" min={1} max={total} inputMode="numeric" value={allerVers} onChange={(e) => setAllerVers(e.target.value)} placeholder={`1 à ${total}`} />
                  </label>
                  <button className="btn">OK</button>
                </form>
                <div className="vignettes">
                  {Array.from({ length: total }, (_, p) => (
                    <button key={p} className={`vignette ${affichees.includes(p) ? "actif" : ""}`} onClick={() => allerA(p)} aria-label={`Page ${p + 1}`}>
                      {m.type === "pdf" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/c/${jetonRef.current}/pdf/${p + 1}.${m.ext || "webp"}`} alt="" loading="lazy" draggable={false} style={{ aspectRatio: `1 / ${m.ratio}` }} />
                      ) : (
                        <span className="vignette-texte">{m.type === "epub" && m.pages[p]?.titre ? m.pages[p].titre : ""}</span>
                      )}
                      <b>{p + 1}</b>
                      {marques.some((x) => x.i === p) && <i className="mini-marque">🔖</i>}
                    </button>
                  ))}
                </div>
              </>
            )}

            {ongletMenu === "marques" && (
              marques.length ? (
                <ul className="liste-marques">
                  {marques.map((x, k) => (
                    <li key={k}>
                      <button className="aller" onClick={() => allerA(x.i, x.f)}>
                        <span>🔖</span>
                        <div><b>{x.titre}</b><small>{new Date(x.le).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</small></div>
                      </button>
                      <button className="retirer" onClick={() => enregistrerMarques(marques.filter((_, j) => j !== k))} aria-label="Retirer ce marque-page">✕</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="vide" style={{ padding: "24px 10px" }}>
                  <div style={{ fontSize: 44 }}>🔖</div>
                  <p>Touche 🔖 en haut de l'écran pour marquer une page et la retrouver plus tard, sur tous tes appareils.</p>
                  <button className="btn" onClick={() => { basculerMarque(); setPanneau(null); }}>Marquer cette page</button>
                </div>
              )
            )}
          </div>
        </div>
      )}
      {panneau === "aa" && (
        <div className="voile" onClick={() => setPanneau(null)}>
          <div className="panneau-lecteur" onClick={(e) => e.stopPropagation()}>
            <h2>Réglages de lecture</h2>
            {mode === "texte" && (
              <>
                <h3 className="titre-reglage">Taille du texte</h3>
                <div className="reglage">
                  <button className="btn secondaire" onClick={() => changerTaille(-10)} aria-label="Texte plus petit">A−</button>
                  <span>{taille} %</span>
                  <button className="btn secondaire" onClick={() => changerTaille(10)} aria-label="Texte plus grand" style={{ fontSize: 22 }}>A+</button>
                </div>
                <h3 className="titre-reglage">Couleur de la page</h3>
                <div className="reglage">
                  {(Object.keys(THEMES) as Theme[]).map((th) => (
                    <button key={th} className={`pastille-theme ${theme === th ? "active" : ""}`} style={{ background: THEMES[th].fond, color: th === "nuit" ? "#eee" : "#222" }} onClick={() => changerTheme(th)}>
                      {THEMES[th].nom}
                    </button>
                  ))}
                </div>
              </>
            )}
            {mode !== "texte" && (
              <>
                <h3 className="titre-reglage">Cadrage de la page</h3>
                <div className="choix-ligne">
                  {([["page", "▣ Page entière"], ["largeur", "↔ Pleine largeur"]] as const).map(([c, nom]) => (
                    <button key={c} className={`pastille ${cadrage === c ? "active" : ""}`} onClick={() => { setCadrage(c); ecrirePref("kw_cadrage2", c); setZoomNiv(ZOOM_DEPART); }}>{nom}</button>
                  ))}
                </div>
                <p className="texte-doux" style={{ fontSize: 13, margin: "6px 0 0" }}>Pour zoomer : pince avec deux doigts, touche deux fois la page, ou Ctrl + molette sur ordinateur.</p>
              </>
            )}
            <h3 className="titre-reglage">🔖 Mon marque-page</h3>
            <div className="choix-marques">
              {MARQUE_PAGES.map((mp) => (
                <button key={mp.id} className={`choix-marque ${motif === mp.id ? "actif" : ""}`} onClick={() => { setMotif(mp.id); ecrirePref("kw_marque_motif", mp.id); }} aria-label={mp.nom}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/marque-pages/${mp.id}.svg`} alt="" loading="lazy" />
                  <small>{mp.nom}</small>
                </button>
              ))}
            </div>
            {mode !== "texte" && (
              <label className="interrupteur">
                <span>🌙 Mode nuit <small>Pages sombres, plus douces pour les yeux le soir</small></span>
                <input type="checkbox" checked={nuitPages} onChange={(e) => changerReglage("kw_nuit_pages", setNuitPages)(e.target.checked)} />
              </label>
            )}
            <h3 className="titre-reglage">☀️ Luminosité</h3>
            <input className="curseur" type="range" min={0.35} max={1} step={0.05} value={lumiere} onChange={(e) => changerReglage("kw_lumiere", setLumiere)(Number(e.target.value))} aria-label="Luminosité" />
            <h3 className="titre-reglage">🕯️ Lumière chaude <small>(filtre anti-lumière bleue)</small></h3>
            <input className="curseur chaud" type="range" min={0} max={1} step={0.05} value={chaud} onChange={(e) => changerReglage("kw_chaud", setChaud)(Number(e.target.value))} aria-label="Lumière chaude" />
            <h3 className="titre-reglage">▶ Tourner les pages tout seul</h3>
            <div className="choix-ligne">
              {[0, 10, 20, 40, 60].map((sec) => (
                <button key={sec} className={`pastille ${diaporama === sec ? "active" : ""}`} onClick={() => { setDiaporama(sec); if (sec) { setPanneau(null); montrer(`Page suivante toutes les ${sec} s`); } }}>
                  {sec ? `${sec} s` : "Non"}
                </button>
              ))}
            </div>
            <h3 className="titre-reglage">⏰ Me rappeler de faire une pause</h3>
            <div className="choix-ligne">
              {[0, 20, 30, 45].map((mn) => (
                <button key={mn} className={`pastille ${rappel === mn ? "active" : ""}`} onClick={() => changerReglage("kw_rappel", setRappel)(mn)}>
                  {mn ? `${mn} min` : "Non"}
                </button>
              ))}
            </div>
            <p className="texte-doux" style={{ fontSize: 14, marginTop: 16 }}>
              Lu pendant cette séance : <b>{Math.floor(secondes / 60)} min</b>. Raccourcis clavier : ← → pour tourner, B pour marquer, F pour le plein écran.
            </p>
            <button className="btn secondaire large cache-ordi" onClick={basculerPleinEcran} style={{ marginTop: 10 }}>{pleinEcran ? "Quitter le plein écran" : "⛶ Plein écran"}</button>
          </div>
        </div>
      )}
      {pause && (
        <div className="voile">
          <div className="panneau-lecteur" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 54 }}>☕</div>
            <h2>Une petite pause ?</h2>
            <p className="texte-doux" style={{ margin: "8px 0 20px" }}>Tu lis depuis {Math.round(secondes / 60)} minutes. Repose tes yeux un instant, regarde au loin, bois un verre d'eau.</p>
            <button className="btn large" onClick={() => setPause(false)}>Reprendre la lecture</button>
          </div>
        </div>
      )}
      {fin && (
        <div className="voile">
          <div className="panneau-lecteur" style={{ textAlign: "center" }}>
            {extrait ? (
              <>
                <div style={{ fontSize: 54 }}>📖</div>
                <h2>Fin de l'extrait</h2>
                <p className="texte-doux" style={{ margin: "8px 0 20px" }}>Tu as aimé ? Lis la suite avec l'abonnement Kwélafé, ou procure-toi ce livre sur la boutique.</p>
                <div style={{ display: "grid", gap: 10 }}>
                  <a className="btn" href={extrait.abonnement}>Lire la suite avec l'abonnement</a>
                  <a className="btn secondaire" href={extrait.boutique}>Voir le livre sur la boutique</a>
                  <Link className="lien" href={`/livre/${livre.slug}`}>Retour à la fiche du livre</Link>
                </div>
              </>
            ) : (<>
            <div style={{ fontSize: 54 }}>🌺</div>
            <h2>Fin du livre</h2>
            <p className="texte-doux" style={{ margin: "8px 0 20px" }}>Mèsi pou la lektir ! Un autre livre t'attend dans ta bibliothèque.</p>
            <div style={{ display: "grid", gap: 10 }}>
              <Link className="btn" href="/livres">Retour à mes livres</Link>
              <button className="btn secondaire" onClick={() => setFin(false)}>Rester sur cette page</button>
            </div>
            </>)}
          </div>
        </div>
      )}
    </div>
  );
}
