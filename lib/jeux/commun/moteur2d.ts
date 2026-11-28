// Moteur commun des jeux 2D Kwélafé : boucle, dessin haute définition, effets, sons, images.
import { toutesLesImages } from "./produits";
import { PHOTOS } from "./photos";
import { Kw, DecorPei, type Mode, type ConfigDecor } from "./pei";
import { GestionnairePerf, dprCible, libererCanvas, reveillerAudio, endormirAudio, journal } from "@/public/jeux-3d/commun/performances";

export type Resultat = { gagne: boolean; score: number; etoiles: number; lignes?: string[]; savoir?: { titre: string; texte: string } };
/** Progression entre les parties (facultative) : monnaie, boutique, carnet, défi du jour. */
export type ArticleBoutique = { id: string; ic: string; nom: string; txt: string; niveau: number; max: number; prix: number | null; peut: boolean };
export type Progression = {
  monnaie(): string;
  defi(): string;
  boutique(): ArticleBoutique[];
  acheter(id: string): boolean;
  carnet(): { titre: string; total: number; pages: (string | null)[] };
};
export type Hud = { score?: number; objectif?: string; temps?: number | null; info?: string };

export type Contexte = {
  L: number;                // largeur utile (px CSS)
  H: number;                // hauteur utile
  img: (id: string) => HTMLImageElement | undefined;
  sons: SonsJeu;
  fx: Effets;
  rnd: () => number;
  mode: Mode;               // « Mi vé zoué trankil » ou « Mi rode problèm »
  niveau: number;
  kw: Kw;                   // directeur d'effets KwFX v4.1
  nuit: (n: number, duree?: number) => void;   // éclairage megaLumieres (0 jour, 1 nuit) + ciel du décor
  fin: (r: Resultat) => void;
  hud: (h: Hud) => void;
};

export interface Jeu {
  maj(dt: number): void;
  dessiner(ctx: CanvasRenderingContext2D): void;
  down?(x: number, y: number): void;
  move?(x: number, y: number): void;
  up?(x: number, y: number): void;
  redim?(L: number, H: number): void;
  /** Photo de la partie en cours (données simples) pour la reprendre après une interruption. */
  instantane?(): unknown;
  /** Remet la partie dans l'état d'une photo prise par instantane(). */
  restaurer?(etat: unknown): void;
}

export type Theme = { haut: string; bas: string; collines: string[]; soleil?: string };
export type DefJeu = {
  id: string;
  titre: string;
  accroche: string;
  regles: string[];
  niveaux: number;          // 0 = partie sans fin (on bat son record)
  /** Jeux refaits (KwFX v4.1) : règles en 3 lignes par mode, décor en plans, thème d'effets. */
  modes?: Record<Mode, string[]>;
  decor?: ConfigDecor;
  themeFx?: string;
  /** Nuit de départ selon le mode (0 à 1). */
  nuit?: (mode: Mode, niveau: number) => number;
  theme: Theme;
  visuels?: "photos";       // images photo des planches de KWélafé à la place des rendus 3D
  images?: Record<string, string>;   // images propres au jeu (id → chemin), préchargées avec lui
  creer: (c: Contexte, niveau: number) => Jeu;
  progression?: Progression;
  /** Décor calé sur le jeu : pas de zoom ni de dérive, et position verticale choisie par le jeu (h = hauteur affichée). */
  fondHaut?: (L: number, H: number, h: number) => number;
  /** Zoom fixe du décor calé par fondHaut, pour lui laisser de la marge de glissement (par défaut 1). */
  fondZoom?: number;
};

// ---------------------------------------------------------------------------
// Sons (fabriqués par le navigateur, aucune voix)
// ---------------------------------------------------------------------------
export class SonsJeu {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private bruitB: AudioBuffer | null = null;
  actif = true;
  reveiller() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.7;
      this.out.connect(this.ctx.destination);
      const n = this.ctx.sampleRate;
      this.bruitB = this.ctx.createBuffer(1, n, n);
      const d = this.bruitB.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    reveillerAudio(this.ctx);
  }
  /** Arrière-plan : on endort le son (iOS le met parfois en état « interrompu »). */
  endormir() { endormirAudio(this.ctx); }
  private ok() { return this.actif && this.ctx && this.out ? this.ctx : null; }
  private ton(t: number, d: number, f0: number, f1: number, v: number, type: OscillatorType = "sine") {
    const c = this.ctx!, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(this.out!); o.start(t); o.stop(t + d + 0.05);
  }
  private bruit(t: number, d: number, f: number, q: number, v: number) {
    const c = this.ctx!, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.bruitB; fl.type = "bandpass"; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl).connect(g).connect(this.out!); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05);
  }
  clic() { const c = this.ok(); if (c) this.ton(c.currentTime, 0.05, 900, 700, 0.08, "triangle"); }
  pop(h = 0) { const c = this.ok(); if (!c) return; const t = c.currentTime; this.ton(t, 0.09, 420 + h * 60, 900 + h * 90, 0.14); this.bruit(t, 0.04, 2500, 1, 0.05); }
  bon() { const c = this.ok(); if (!c) return; const t = c.currentTime; [660, 880, 1320].forEach((f, i) => this.ton(t + i * 0.06, 0.22, f, f, 0.11, "triangle")); }
  mauvais() { const c = this.ok(); if (!c) return; const t = c.currentTime; this.ton(t, 0.22, 300, 170, 0.16, "square"); }
  combo(n: number) { const c = this.ok(); if (!c) return; const t = c.currentTime; const b = 520 * Math.pow(1.06, Math.min(n, 10)); [1, 1.25, 1.5, 2].forEach((m, i) => this.ton(t + i * 0.05, 0.25, b * m, b * m, 0.09, "triangle")); }
  piece() { const c = this.ok(); if (!c) return; const t = c.currentTime; this.ton(t, 0.08, 1320, 1320, 0.1, "square"); this.ton(t + 0.07, 0.25, 1760, 1760, 0.1, "square"); }
  swoosh() { const c = this.ok(); if (c) this.bruit(c.currentTime, 0.18, 1400, 0.8, 0.08); }
  plouf() { const c = this.ok(); if (!c) return; const t = c.currentTime; this.ton(t, 0.12, 180, 70, 0.25); this.bruit(t, 0.12, 900, 1.2, 0.12); }
  fusion(n: number) { const c = this.ok(); if (!c) return; const t = c.currentTime; const f = 300 * Math.pow(1.12, n); this.ton(t, 0.18, f, f * 1.8, 0.14); this.bruit(t, 0.06, 3000, 1, 0.05); }
  mixeur() { const c = this.ok(); if (!c) return; const t = c.currentTime; for (let i = 0; i < 10; i++) this.bruit(t + i * 0.06, 0.08, 600 + i * 80, 2, 0.08); this.ton(t, 0.6, 90, 140, 0.12, "sawtooth"); }
  victoire() { const c = this.ok(); if (!c) return; const t = c.currentTime; [523, 659, 784, 1047].forEach((f, i) => this.ton(t + i * 0.11, 0.4, f, f, 0.13, "triangle")); }
  defaite() { const c = this.ok(); if (!c) return; const t = c.currentTime; [440, 370, 311, 262].forEach((f, i) => this.ton(t + i * 0.14, 0.4, f, f * 0.98, 0.12, "triangle")); }
  tic() { const c = this.ok(); if (c) this.ton(c.currentTime, 0.03, 1800, 1700, 0.05, "square"); }
  /** Sons enregistrés (fichiers mp3) : chargés au premier besoin ; renvoie false tant qu'ils ne sont pas prêts. */
  private tampons = new Map<string, AudioBuffer | null>();
  prechargerFichiers(urls: string[]) {
    const c = this.ctx; if (!c) return;
    for (const u of urls) if (!this.tampons.has(u)) { this.tampons.set(u, null); fetch(u).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject())).then((b) => c.decodeAudioData(b)).then((d) => this.tampons.set(u, d)).catch(() => {}); }
  }
  fichier(url: string, vol = 1, vit = 1): boolean {
    const c = this.ok(); if (!c) return false;
    const b = this.tampons.get(url); if (!b) { this.prechargerFichiers([url]); return false; }
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = b; s.playbackRate.value = vit; g.gain.value = vol; s.connect(g).connect(this.out!); s.start(); return true;
  }
  detruire() { this.ctx?.close(); this.ctx = null; }
}

// ---------------------------------------------------------------------------
// Effets : particules, textes flottants, secousses, flash
// ---------------------------------------------------------------------------
type Part = { x: number; y: number; vx: number; vy: number; vie: number; max: number; r: number; c: string; g: number; forme: 0 | 1 | 2; rot: number };
type Texte = { t: string; x: number; y: number; vie: number; c: string; taille: number };

export class Effets {
  parts: Part[] = [];
  textes: Texte[] = [];
  secousse = 0;
  flash = 0;
  flashC = "255,255,255";
  /** Gerbe de particules (forme 0 rond, 1 étoile, 2 goutte). */
  gerbe(x: number, y: number, couleur: string, n = 18, vitesse = 260, forme: 0 | 1 | 2 = 0, gravite = 500) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = vitesse * (0.3 + Math.random() * 0.9);
      const max = 0.5 + Math.random() * 0.6;
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - vitesse * 0.3, vie: max, max, r: 3 + Math.random() * 5, c: couleur, g: gravite, forme, rot: Math.random() * 6 });
    }
    if (this.parts.length > 700) this.parts.splice(0, this.parts.length - 700);
  }
  etoiles(x: number, y: number, n = 14) { this.gerbe(x, y, "#ffe066", n, 300, 1, 300); }
  confettis(L: number) {
    const cs = ["#ff5a5a", "#ffd23a", "#4cd47a", "#4ab0ff", "#ff8ad8"];
    for (let i = 0; i < 120; i++) this.parts.push({ x: Math.random() * L, y: -20, vx: (Math.random() - 0.5) * 120, vy: 80 + Math.random() * 220, vie: 3, max: 3, r: 4 + Math.random() * 4, c: cs[i % 5], g: 60, forme: 1, rot: Math.random() * 6 });
  }
  texte(t: string, x: number, y: number, c = "#ffe066", taille = 30) { this.textes.push({ t, x, y, vie: 1.1, c, taille }); }
  secouer(f = 0.35) { this.secousse = Math.max(this.secousse, f); }
  eclair(c = "255,255,255", f = 0.5) { this.flash = f; this.flashC = c; }
  maj(dt: number) {
    for (const p of this.parts) { p.vie -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 4; }
    this.parts = this.parts.filter((p) => p.vie > 0);
    for (const t of this.textes) { t.vie -= dt; t.y -= 45 * dt; }
    this.textes = this.textes.filter((t) => t.vie > 0);
    this.secousse = Math.max(0, this.secousse - dt);
    this.flash = Math.max(0, this.flash - dt * 2);
  }
  dessiner(ctx: CanvasRenderingContext2D, L: number, H: number) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.parts) {
      const a = Math.min(1, p.vie / p.max * 1.5);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.c;
      if (p.forme === 1) etoile(ctx, p.x, p.y, p.r * 1.4, p.rot);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (p.forme === 2 ? 0.8 : 1), 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
    for (const t of this.textes) {
      const a = Math.min(1, t.vie * 2.2), e = 1 + Math.max(0, t.vie - 0.9) * 2.5;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(t.x, t.y); ctx.scale(e, e);
      texteContour(ctx, t.t, 0, 0, t.taille, t.c);
      ctx.restore();
    }
    if (this.flash > 0) { ctx.fillStyle = `rgba(${this.flashC},${this.flash * 0.6})`; ctx.fillRect(0, 0, L, H); }
  }
}

export function etoile(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r, a = rot + (i / 10) * Math.PI * 2 - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

export function texteContour(ctx: CanvasRenderingContext2D, t: string, x: number, y: number, taille: number, couleur: string, align: CanvasTextAlign = "center") {
  ctx.font = `800 ${taille}px Nunito, system-ui, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, taille * 0.18); ctx.strokeStyle = "rgba(40,20,10,0.85)";
  ctx.strokeText(t, x, y);
  ctx.fillStyle = couleur; ctx.fillText(t, x, y);
}

export function arrondi(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Dessine une image centrée en (x, y) dans un carré de côté t, avec ombre douce. */
export function sprite(ctx: CanvasRenderingContext2D, im: HTMLImageElement | undefined, x: number, y: number, t: number, rot = 0, alpha = 1, ombre = true) {
  if (!im || !im.complete) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y); ctx.rotate(rot);
  if (ombre) { ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = t * 0.12; ctx.shadowOffsetY = t * 0.06; }
  ctx.drawImage(im, -t / 2, -t / 2, t, t);
  ctx.restore();
}

export const melanger = <T,>(a: T[], rnd: () => number) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

// ---------------------------------------------------------------------------
// Moteur
// ---------------------------------------------------------------------------
const cacheImages = new Map<string, HTMLImageElement>();
/** Retire des images du cache et libère leur mémoire décodée. */
export function libererImages(ids: string[]) {
  for (const id of ids) {
    const im = cacheImages.get(id);
    if (!im) continue;
    im.onload = im.onerror = null;
    im.removeAttribute("src");
    cacheImages.delete(id);
  }
}
export function precharger(visuels?: "photos", images?: Record<string, string>): Promise<void> {
  const liste = { ...toutesLesImages(), ...(images || {}) };
  if (visuels === "photos") for (const p of PHOTOS) liste["photo:" + p.id] = p.image;
  return Promise.all(Object.entries(liste).map(([id, src]) => new Promise<void>((ok) => {
    if (cacheImages.has(id)) return ok();
    const im = new Image(); im.decoding = "async"; im.src = src;
    im.onload = () => ok(); im.onerror = () => ok();
    cacheImages.set(id, im);
  }))).then(() => undefined);
}

export class Moteur2D {
  private cv: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private jeu: Jeu | null = null;
  private dernier = 0;
  private pause = false;
  private obs: ResizeObserver;
  private dpr = 1;
  private temps = 0;
  L = 1; H = 1;
  sons = new SonsJeu();
  fx = new Effets();
  private perf: GestionnairePerf;
  private redessin = 0;
  private seed = Date.now() & 0xffff;
  kw: Kw;
  mode: Mode = "trankil";
  private decorPei: DecorPei | null = null;
  private nuages = Array.from({ length: 6 }, (_, i) => ({ x: Math.random(), y: 0.05 + Math.random() * 0.25, s: 0.6 + Math.random() * 0.8, v: 0.004 + i * 0.002 }));

  constructor(
    private conteneur: HTMLElement,
    private def: DefJeu,
    private rappels: { fin: (r: Resultat) => void; hud: (h: Hud) => void; interruption?: (raison: string) => void; sauvegarde?: (raison: string) => void },
  ) {
    this.cv = document.createElement("canvas");
    this.cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block";
    conteneur.appendChild(this.cv);
    this.ctx = this.cv.getContext("2d")!;
    this.kw = new Kw(conteneur, def.id, def.themeFx || "fruits");
    if (def.decor) this.decorPei = new DecorPei(def.id, def.decor);
    // Résolution : 1,5 au plus sur iPhone, 2 ailleurs
    this.dpr = dprCible(2);
    this.perf = new GestionnairePerf({
      nom: "jeu-" + def.id,
      niveauInitial: 2,
      surPause: (raison) => {
        // Arrière-plan, verrouillage : la partie se met en pause ET l'écran de pause s'affiche
        // (avant, le moteur se figeait sans que l'interface le sache : jeu « bloqué »).
        if (this.jeu && !this.pause) { this.setPause(true); this.rappels.interruption?.(raison); }
        this.sons.endormir(); this.kw.pause(true);
      },
      surReprise: () => {
        // Au retour, iOS a pu vider la mémoire du canvas : on la réalloue et on redessine.
        this.redim();
        this.dernier = performance.now();
      },
      surSauvegarde: (raison) => this.rappels.sauvegarde?.(raison),
      surQualite: (niveau) => {
        // Niveau bas : résolution 1 ; le mode 30 i/s est appliqué par le gestionnaire.
        const d = niveau >= 2 ? dprCible(2) : niveau === 1 ? Math.min(dprCible(2), 1.25) : 1;
        if (d !== this.dpr) { this.dpr = d; this.redim(); }
      },
    });
    this.obs = new ResizeObserver(() => this.redim());
    this.obs.observe(conteneur);
    this.redim();
    this.perf.ecouter(this.cv, "pointerdown", this.pd);
    this.perf.ecouter(window, "pointermove", this.pm);
    this.perf.ecouter(window, "pointerup", this.pu);
    this.perf.ecouter(window, "pointercancel", this.pc);
    // Canvas 2D : certains navigateurs signalent la perte de sa mémoire
    this.perf.ecouter(this.cv, "contextlost", () => journal("canvas2d-perdu", def.id));
    this.perf.ecouter(this.cv, "contextrestored", () => { journal("canvas2d-restaure", def.id); this.redim(); });
    this.dernier = performance.now();
    this.perf.boucle(this.boucle);
  }

  private rnd = () => { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; };

  private appliquerNuit(n: number, duree?: number) {
    this.kw.eclairage(n, duree);
    if (this.def.modes) this.kw.ambiance(n >= 0.5 ? "veillee" : this.def.decor?.lieu === "lagon" || this.def.themeFx === "lagon" ? "lagon" : "jardin");
    if (this.decorPei) this.decorPei.heure = n >= 0.5 ? "veillee" : n >= 0.2 ? "soir" : this.def.decor!.heure === "veillee" ? "soir" : this.def.decor!.heure;
  }
  lancer(niveau: number, mode: Mode = "trankil") {
    this.sons.reveiller();
    this.mode = mode;
    const refait = !!this.def.modes;
    const nuit0 = this.def.nuit ? this.def.nuit(mode, niveau) : this.def.decor?.heure === "veillee" ? 0.6 : this.def.decor?.heure === "soir" ? 0.22 : 0;
    if (refait) {
      if (this.decorPei) this.decorPei.heure = this.def.decor!.heure;
      this.kw.preparer(mode, nuit0).then(() => { if (this.jeu) { this.appliquerNuit(nuit0, 10); this.kw.ev("debut"); } });
    }
    this.fx = new Effets();
    const c: Contexte = {
      L: this.L, H: this.H,
      img: (id) => (this.def.visuels === "photos" && cacheImages.get("photo:" + id)) || cacheImages.get(id),
      sons: this.sons, fx: this.fx, rnd: this.rnd, mode, niveau, kw: this.kw,
      nuit: (n, duree) => this.appliquerNuit(n, duree),
      fin: (r) => {
        this.jeu = null; this.kw.ambiance(null);
        if (refait) { if (r.gagne) this.kw.victoire(this.L, this.H); else this.kw.ev("defaite"); const f = this.kw.finPartie(r.score); if (f?.defi?.nouveau) (r.lignes ||= []).push("Défi du jour réussi !"); }
        else if (r.gagne) { this.sons.victoire(); this.fx.confettis(this.L); } else this.sons.defaite();
        this.rappels.fin(r);
      },
      hud: (h) => this.rappels.hud(h),
    };
    this.jeu = this.def.creer(c, niveau);
    // Essais automatiques en local : le jeu en cours est visible pour le robot de test
    if (typeof location !== "undefined" && (location.hostname === "127.0.0.1" || location.hostname === "localhost")) { (window as any).__kwJeu = this.jeu; (window as any).__kw = this.kw; }
  }
  arreter() { this.jeu = null; }
  setPause(p: boolean) { this.pause = p; this.dernier = performance.now(); this.kw.pause(p); }
  get enPause() { return this.pause; }
  get partieEnCours() { return !!this.jeu; }
  /** Photo de la partie en cours (si le jeu sait la prendre). */
  instantane(): unknown { try { return this.jeu?.instantane?.() ?? null; } catch (e) { console.error(e); return null; } }
  /** Reprend une partie photographiée ; renvoie false si le jeu ne sait pas la reprendre. */
  restaurer(etat: unknown): boolean {
    if (!this.jeu?.restaurer || etat == null) return false;
    try { this.jeu.restaurer(etat); return true; } catch (e) { console.error(e); return false; }
  }

  private redim() {
    const r = this.conteneur.getBoundingClientRect();
    const L = Math.max(1, r.width), H = Math.max(1, r.height);
    const w = Math.round(L * this.dpr), h = Math.round(H * this.dpr);
    const change = L !== this.L || H !== this.H;
    this.L = L; this.H = H;
    // Réaffecter width/height recrée la mémoire du canvas (utile après un retour d'arrière-plan)
    this.cv.width = w; this.cv.height = h;
    if (change) this.jeu?.redim?.(this.L, this.H);
  }
  private pos(e: PointerEvent) { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; }
  private appui = false;
  private pd = (e: PointerEvent) => { this.sons.reveiller(); if (this.pause) return; this.appui = true; const [x, y] = this.pos(e); this.jeu?.down?.(x, y); };
  private pm = (e: PointerEvent) => { if (this.pause || !this.appui) return; const [x, y] = this.pos(e); this.jeu?.move?.(x, y); };
  private pu = (e: PointerEvent) => { if (!this.appui) return; this.appui = false; if (this.pause) return; const [x, y] = this.pos(e); this.jeu?.up?.(x, y); };
  // Geste annulé par le système (centre de contrôle, appel…) : on relâche proprement
  private pc = (e: PointerEvent) => { this.pu(e); };

  private boucle = (now: number) => {
    // Hors partie ou en pause, le décor n'a pas besoin de 60 images par seconde
    if ((!this.jeu || this.pause) && this.fx.parts.length === 0) {
      if (++this.redessin % 3 !== 0) return;
    }
    now = performance.now();
    const dt = Math.max(0, Math.min(0.05, (now - this.dernier) / 1000));
    this.dernier = now;
    if (!this.pause) { this.temps += dt; if (!this.kw.fige()) this.jeu?.maj(dt); this.fx.maj(dt); }
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.decor(ctx);
    ctx.save();
    if (this.fx.secousse > 0) { const a = this.fx.secousse * 18; ctx.translate((Math.random() - 0.5) * a, (Math.random() - 0.5) * a); }
    this.jeu?.dessiner(ctx);
    this.fx.dessiner(ctx, this.L, this.H);
    ctx.restore();
  };

  /** Décor tropical animé : ciel, soleil, nuages, pitons en silhouette, feuillage. */
  private decor(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, th = this.def.theme;
    if (this.decorPei) { this.decorPei.dessiner(ctx, L, H, this.temps); return; }
    const fond = cacheImages.get("fond:" + this.def.id);
    if (fond && fond.complete && fond.naturalWidth > 0) {
      // fond aquarelle : recadré pour couvrir l'écran, avec une très lente respiration
      const cale = this.def.fondHaut;
      const z = cale ? (this.def.fondZoom ?? 1) : 1.04 + 0.02 * Math.sin(this.temps * 0.12);
      const s = Math.max(L / fond.naturalWidth, H / fond.naturalHeight) * z;
      const w = fond.naturalWidth * s, h = fond.naturalHeight * s;
      ctx.drawImage(fond, (L - w) / 2 + (cale ? 0 : Math.sin(this.temps * 0.07) * L * 0.01), cale ? cale(L, H, h) : (H - h) / 2, w, h);
      ctx.fillStyle = "rgba(255,250,240,0.12)"; ctx.fillRect(0, 0, L, H);
      const v = ctx.createRadialGradient(L / 2, H / 2, Math.min(L, H) * 0.4, L / 2, H / 2, Math.max(L, H) * 0.8);
      v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.22)");
      ctx.fillStyle = v; ctx.fillRect(0, 0, L, H);
      return;
    }
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.haut); g.addColorStop(1, th.bas);
    ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
    if (th.soleil) {
      const sg = ctx.createRadialGradient(L * 0.8, H * 0.15, 0, L * 0.8, H * 0.15, H * 0.35);
      sg.addColorStop(0, th.soleil); sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, 0, L, H);
    }
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (const n of this.nuages) {
      const x = ((n.x + this.temps * n.v) % 1.3) * L * 1.1 - L * 0.15, y = n.y * H, s = n.s * Math.min(L, H) * 0.06;
      ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.arc(x + s, y - s * 0.4, s * 1.2, 0, 7); ctx.arc(x + s * 2.1, y, s * 0.9, 0, 7); ctx.fill();
    }
    th.collines.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.moveTo(0, H);
      const base = H * (0.62 + i * 0.1), amp = H * (0.12 - i * 0.03);
      for (let x = 0; x <= L; x += 20) {
        const y = base - amp * (0.5 + 0.5 * Math.sin(x / L * (3 + i * 2) + i * 1.7 + this.temps * 0.02 * (i + 1))) - amp * 0.4 * Math.sin(x / L * 11 + i);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(L, H); ctx.closePath(); ctx.fill();
    });
    const v = ctx.createRadialGradient(L / 2, H / 2, Math.min(L, H) * 0.35, L / 2, H / 2, Math.max(L, H) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, L, H);
  }

  detruire() {
    this.perf.detruire();          // boucle, écouteurs et minuteries : tout est arrêté
    this.obs.disconnect();
    this.jeu = null;
    this.fx = new Effets();
    this.sons.detruire();
    this.kw.detruire();
    libererCanvas(this.cv);        // iOS : rend la mémoire du canvas tout de suite
    // Images propres à ce jeu (fond aquarelle, images spéciales, photos) : libérées en partant.
    // Les visuels de fruits communs à presque tous les jeux restent en cache.
    const propres = ["fond:" + this.def.id, ...Object.keys(this.def.images || {})];
    if (this.def.visuels === "photos") for (const p of PHOTOS) propres.push("photo:" + p.id);
    libererImages(propres);
  }
}

/** Calcule les étoiles d'après un score et trois paliers. */
export const etoilesPour = (score: number, paliers: [number, number, number]) => (score >= paliers[2] ? 3 : score >= paliers[1] ? 2 : score >= paliers[0] ? 1 : 0);

/** Jeux qui ont reçu leur fond aquarelle (fichier public/jeux/fonds/<id>.webp). */
export const FONDS_AQUARELLE = new Set<string>([
  "marche-des-jus", "fusion-pei", "bazar-krush", "2048-pei", "memory-pei", "kel-fri-sa", "trie-le-bazar", "rekolt-la", "let-melanze", "marchand-du-bazar",
  "kosa-in-shoz", "zarlor", "oussa-i-le", "memory-lontan", "ramasse-les-letchis", "cari-parfait", "gardiens-de-l-ile", "expressions-a-recoller", "case-bleue", "coulee-de-lave",
]);
/** Version des décors refaits : changer le chiffre force les appareils à retélécharger l'image (cache « d'abord »). */
const VERSIONS_FOND: Record<string, number> = { "rekolt-la": 2, "fusion-pei": 2, "marche-des-jus": 2 };
export const cheminFond = (id: string) => `/jeux/fonds/${id}.webp${VERSIONS_FOND[id] ? `?v=${VERSIONS_FOND[id]}` : ""}`;

export const THEMES: Record<string, Theme> = {
  marche: { haut: "#ffcf8a", bas: "#e9845a", collines: ["#c8644a", "#9e4a3a", "#6e3226"], soleil: "rgba(255,240,180,0.8)" },
  lagon: { haut: "#8fe0ff", bas: "#2aa6c8", collines: ["#2f8f6a", "#1f6a52", "#14473a"], soleil: "rgba(255,255,220,0.8)" },
  jardin: { haut: "#bff0a8", bas: "#5aa848", collines: ["#3f8a3a", "#2c6a2c", "#1c4a20"], soleil: "rgba(255,255,200,0.7)" },
  coucher: { haut: "#ff9a8a", bas: "#7a3a8a", collines: ["#5a2a6a", "#40204e", "#2a1436"], soleil: "rgba(255,210,160,0.8)" },
  nuit: { haut: "#1e2a5a", bas: "#3a2a5a", collines: ["#2a2048", "#1e1838", "#141028"], soleil: "rgba(255,240,200,0.35)" },
  case: { haut: "#a8e6e0", bas: "#4ab0a0", collines: ["#3a8a6a", "#2c6a50", "#1e4a38"], soleil: "rgba(255,250,210,0.7)" },
};
