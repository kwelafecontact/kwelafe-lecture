// Moteur commun des jeux 2D Kwélafé : boucle, dessin haute définition, effets, sons, images.
import { toutesLesImages } from "./produits";

export type Resultat = { gagne: boolean; score: number; etoiles: number };
export type Hud = { score?: number; objectif?: string; temps?: number | null; info?: string };

export type Contexte = {
  L: number;                // largeur utile (px CSS)
  H: number;                // hauteur utile
  img: (id: string) => HTMLImageElement | undefined;
  sons: SonsJeu;
  fx: Effets;
  rnd: () => number;
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
}

export type Theme = { haut: string; bas: string; collines: string[]; soleil?: string };
export type DefJeu = {
  id: string;
  titre: string;
  accroche: string;
  regles: string[];
  niveaux: number;          // 0 = partie sans fin (on bat son record)
  theme: Theme;
  creer: (c: Contexte, niveau: number) => Jeu;
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
    if (this.ctx.state === "suspended") this.ctx.resume();
  }
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
export function precharger(): Promise<void> {
  const liste = toutesLesImages();
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
  private raf = 0;
  private dernier = 0;
  private pause = false;
  private obs: ResizeObserver;
  private dpr = 1;
  private temps = 0;
  L = 1; H = 1;
  sons = new SonsJeu();
  fx = new Effets();
  private seed = Date.now() & 0xffff;
  private nuages = Array.from({ length: 6 }, (_, i) => ({ x: Math.random(), y: 0.05 + Math.random() * 0.25, s: 0.6 + Math.random() * 0.8, v: 0.004 + i * 0.002 }));

  constructor(private conteneur: HTMLElement, private def: DefJeu, private rappels: { fin: (r: Resultat) => void; hud: (h: Hud) => void }) {
    this.cv = document.createElement("canvas");
    this.cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block";
    conteneur.appendChild(this.cv);
    this.ctx = this.cv.getContext("2d")!;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.obs = new ResizeObserver(() => this.redim());
    this.obs.observe(conteneur);
    this.redim();
    this.cv.addEventListener("pointerdown", this.pd);
    window.addEventListener("pointermove", this.pm);
    window.addEventListener("pointerup", this.pu);
    document.addEventListener("visibilitychange", this.vis);
    this.dernier = performance.now();
    this.boucle();
  }

  private rnd = () => { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; };

  lancer(niveau: number) {
    this.sons.reveiller();
    this.fx = new Effets();
    const c: Contexte = {
      L: this.L, H: this.H,
      img: (id) => cacheImages.get(id),
      sons: this.sons, fx: this.fx, rnd: this.rnd,
      fin: (r) => { this.jeu = null; if (r.gagne) { this.sons.victoire(); this.fx.confettis(this.L); } else this.sons.defaite(); this.rappels.fin(r); },
      hud: (h) => this.rappels.hud(h),
    };
    this.jeu = this.def.creer(c, niveau);
  }
  arreter() { this.jeu = null; }
  setPause(p: boolean) { this.pause = p; this.dernier = performance.now(); }

  private redim() {
    const r = this.conteneur.getBoundingClientRect();
    this.L = Math.max(1, r.width); this.H = Math.max(1, r.height);
    this.cv.width = Math.round(this.L * this.dpr); this.cv.height = Math.round(this.H * this.dpr);
    this.jeu?.redim?.(this.L, this.H);
  }
  private pos(e: PointerEvent) { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; }
  private appui = false;
  private pd = (e: PointerEvent) => { this.sons.reveiller(); if (this.pause) return; this.appui = true; const [x, y] = this.pos(e); this.jeu?.down?.(x, y); };
  private pm = (e: PointerEvent) => { if (this.pause || !this.appui) return; const [x, y] = this.pos(e); this.jeu?.move?.(x, y); };
  private pu = (e: PointerEvent) => { if (!this.appui) return; this.appui = false; if (this.pause) return; const [x, y] = this.pos(e); this.jeu?.up?.(x, y); };
  private vis = () => { if (document.hidden) this.setPause(true); };

  private boucle = () => {
    this.raf = requestAnimationFrame(this.boucle);
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.dernier) / 1000);
    this.dernier = now;
    if (!this.pause) { this.temps += dt; this.jeu?.maj(dt); this.fx.maj(dt); }
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
    cancelAnimationFrame(this.raf);
    this.obs.disconnect();
    this.cv.removeEventListener("pointerdown", this.pd);
    window.removeEventListener("pointermove", this.pm);
    window.removeEventListener("pointerup", this.pu);
    document.removeEventListener("visibilitychange", this.vis);
    this.sons.detruire();
    this.cv.remove();
  }
}

/** Calcule les étoiles d'après un score et trois paliers. */
export const etoilesPour = (score: number, paliers: [number, number, number]) => (score >= paliers[2] ? 3 : score >= paliers[1] ? 2 : score >= paliers[0] ? 1 : 0);

export const THEMES: Record<string, Theme> = {
  marche: { haut: "#ffcf8a", bas: "#e9845a", collines: ["#c8644a", "#9e4a3a", "#6e3226"], soleil: "rgba(255,240,180,0.8)" },
  lagon: { haut: "#8fe0ff", bas: "#2aa6c8", collines: ["#2f8f6a", "#1f6a52", "#14473a"], soleil: "rgba(255,255,220,0.8)" },
  jardin: { haut: "#bff0a8", bas: "#5aa848", collines: ["#3f8a3a", "#2c6a2c", "#1c4a20"], soleil: "rgba(255,255,200,0.7)" },
  coucher: { haut: "#ff9a8a", bas: "#7a3a8a", collines: ["#5a2a6a", "#40204e", "#2a1436"], soleil: "rgba(255,210,160,0.8)" },
  nuit: { haut: "#1e2a5a", bas: "#3a2a5a", collines: ["#2a2048", "#1e1838", "#141028"], soleil: "rgba(255,240,200,0.35)" },
  case: { haut: "#a8e6e0", bas: "#4ab0a0", collines: ["#3a8a6a", "#2c6a50", "#1e4a38"], soleil: "rgba(255,250,210,0.7)" },
};
