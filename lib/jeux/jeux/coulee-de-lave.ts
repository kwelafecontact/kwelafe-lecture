// Coulée de lave : tourner les tuiles pour guider la lave du Piton de la Fournaise jusqu'à la mer, sans toucher les villages.
import { type Contexte, type DefJeu, type Jeu, THEMES, arrondi } from "../commun/moteur2d";
import { paragraphe } from "../commun/texte";

type Type = "I" | "L" | "T" | "V";
type Case = { t: Type; r: number; vis: number; lave: number };
const OUV: Record<Type, number[]> = { I: [0, 2], L: [0, 1], T: [0, 1, 2], V: [] };   // 0 nord, 1 est, 2 sud, 3 ouest
const ouvert = (c: Case, d: number) => OUV[c.t].some((o) => (o + c.r) % 4 === d);
export const TAILLES: [number, number][] = [
  ...Array(8).fill([4, 4]), ...Array(8).fill([4, 5]), ...Array(12).fill([5, 5]), ...Array(12).fill([5, 6]),
  ...Array(14).fill([6, 6]), ...Array(10).fill([6, 7]), ...Array(6).fill([7, 7]),
];

function aleatoire(graine: number) { let s = graine >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Génère un niveau qui a toujours une solution : un chemin du volcan à la mer, le reste rempli au hasard. */
export function generer(w: number, h: number, graine: number, taux: number) {
  const rnd = aleatoire(graine);
  for (let essai = 0; essai < 500; essai++) {
    const sx = Math.floor(rnd() * w), ex = Math.floor(rnd() * w);
    const chemin: [number, number][] = [[sx, 0]], vu = new Set([`${sx},0`]); let ok = false;
    for (let k = 0; k < w * h * 3; k++) {
      const [x, y] = chemin[chemin.length - 1];
      if (y === h - 1 && x === ex) { ok = true; break; }
      const pas: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      pas.sort(() => rnd() - 0.5).sort((a, b) => (-(a[1]) + (a[1] === -1 ? 0.6 : 0) + rnd() * 1.2) - (-(b[1]) + (b[1] === -1 ? 0.6 : 0) + rnd() * 1.2));
      let bouge = false;
      for (const [dx, dy] of pas) { const nx = x + dx, ny = y + dy; if (nx >= 0 && nx < w && ny >= 0 && ny < h && !vu.has(`${nx},${ny}`)) { chemin.push([nx, ny]); vu.add(`${nx},${ny}`); bouge = true; break; } }
      if (!bouge) break;
    }
    if (!ok || chemin.length < h + 1) continue;
    const DIR = (dx: number, dy: number) => (dy === -1 ? 0 : dx === 1 ? 1 : dy === 1 ? 2 : 3);
    const cases: (Case | null)[] = Array(w * h).fill(null), surChemin = new Set<number>();
    chemin.forEach(([x, y], k) => {
      const din = k === 0 ? 0 : DIR(chemin[k - 1][0] - x, chemin[k - 1][1] - y);
      const dout = k === chemin.length - 1 ? 2 : DIR(chemin[k + 1][0] - x, chemin[k + 1][1] - y);
      let c: Case;
      if ((din - dout + 4) % 2 === 0) c = { t: "I", r: din % 2 === 0 ? 0 : 1, vis: 0, lave: 0 };
      else { const s = new Set([din, dout]); const r = s.has(0) && s.has(1) ? 0 : s.has(1) && s.has(2) ? 1 : s.has(2) && s.has(3) ? 2 : 3; c = { t: "L", r, vis: 0, lave: 0 }; }
      cases[y * w + x] = c; surChemin.add(y * w + x);
    });
    let par = 0;
    const out = cases.map((c, i) => {
      if (!c) return rnd() < taux ? { t: "V" as Type, r: 0, vis: 0, lave: 0 } : { t: (["I", "L", "T"] as Type[])[Math.floor(rnd() * 3)], r: Math.floor(rnd() * 4), vis: 0, lave: 0 };
      let nr = Math.floor(rnd() * 4);
      if (c.t === "I" && nr % 2 === c.r % 2) nr = (c.r + 1) % 4;
      if (c.t === "L" && nr === c.r) nr = (c.r + 1 + Math.floor(rnd() * 3)) % 4;
      par += (c.r - nr + 8) % (c.t === "I" ? 2 : 4);
      return { ...c, r: nr };
    });
    out.forEach((c) => (c.vis = c.r));
    return { w, h, sx, ex, cases: out, par };
  }
  throw new Error("niveau impossible");
}

class Lave implements Jeu {
  L: number; H: number;
  w: number; h: number; sx: number; ex: number; cases: Case[]; par: number;
  tours = 0; gagne = false; fini = false; temps = 0; attente = 0;
  t = 50; ox = 0; oy = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    const [w, h] = TAILLES[niveau - 1];
    const g = generer(w, h, 1000 + niveau, 0.06 + 0.002 * niveau);
    Object.assign(this, g);
    this.w = g.w; this.h = g.h; this.sx = g.sx; this.ex = g.ex; this.cases = g.cases; this.par = g.par;
    this.disposer(); this.couler(); this.hud();
  }
  hud() { this.c.hud({ score: this.tours, objectif: `objectif ${this.par + 2} tours`, info: `${this.w}×${this.h}` }); }
  disposer() { this.t = Math.min((this.L - 30) / this.w, (this.H * 0.62) / this.h, 86); this.ox = (this.L - this.t * this.w) / 2; this.oy = this.H * 0.2; }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  couler() {
    for (const c of this.cases) c.lave = 0;
    const file: [number, number][] = [];
    const debut = this.cases[this.sx];
    if (ouvert(debut, 0)) { debut.lave = 1; file.push([this.sx, 0]); }
    while (file.length) {
      const [x, y] = file.shift()!, c = this.cases[y * this.w + x];
      for (let d = 0; d < 4; d++) {
        if (!ouvert(c, d)) continue;
        const nx = x + (d === 1 ? 1 : d === 3 ? -1 : 0), ny = y + (d === 2 ? 1 : d === 0 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= this.w || ny >= this.h) continue;
        const n = this.cases[ny * this.w + nx];
        if (!n.lave && ouvert(n, (d + 2) % 4)) { n.lave = 1; file.push([nx, ny]); }
      }
    }
    const fin = this.cases[(this.h - 1) * this.w + this.ex];
    return fin.lave > 0 && ouvert(fin, 2);
  }
  down(x: number, y: number) {
    if (this.fini || this.gagne) return;
    const i = Math.floor((x - this.ox) / this.t), j = Math.floor((y - this.oy) / this.t);
    if (i < 0 || j < 0 || i >= this.w || j >= this.h) return;
    const c = this.cases[j * this.w + i]; if (c.t === "V") { this.c.sons.mauvais(); return; }
    c.r = (c.r + 1) % 4; this.tours++; this.c.sons.clic();
    if (this.couler()) {
      this.gagne = true; this.attente = 1.8; this.c.sons.victoire();
      this.c.fx.gerbe(this.ox + (this.ex + 0.5) * this.t, this.oy + this.h * this.t + 20, "#6ac8ff", 30, 260, 1);
      this.c.fx.texte("La lave rejoint la mer !", this.L / 2, this.oy - 20, "#ffe066", 24);
    }
    this.hud();
  }
  maj(dt: number) {
    this.temps += dt;
    for (const c of this.cases) { let d = c.r - c.vis; if (d < -2) d += 4; if (d > 2) d -= 4; c.vis += d * Math.min(1, dt * 14); }
    if (this.gagne && !this.fini) {
      this.attente -= dt;
      if (this.attente <= 0) { this.fini = true; const e = this.tours <= this.par + 2 ? 3 : this.tours <= this.par * 2 + 4 ? 2 : 1; this.c.fin({ gagne: true, score: Math.max(10, 1000 - this.tours * 20), etoiles: e }); }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { t, ox, oy } = this;
    paragraphe(ctx, "Relie le volcan à la mer", this.L / 2, this.H * 0.075, this.L - 40, 18, "#fff");
    ctx.font = `${t * 0.7}px system-ui, "Apple Color Emoji", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🌋", ox + (this.sx + 0.5) * t, oy - t * 0.45);
    ctx.fillStyle = "#2a8ad8"; arrondi(ctx, ox - 6, oy + this.h * t + 4, this.w * t + 12, t * 0.5, 10); ctx.fill();
    ctx.fillText("🌊", ox + (this.ex + 0.5) * t, oy + this.h * t + t * 0.3);
    const pulse = 0.75 + 0.25 * Math.sin(this.temps * 5);
    this.cases.forEach((c, k) => {
      const x = ox + (k % this.w) * t, y = oy + Math.floor(k / this.w) * t;
      ctx.fillStyle = c.t === "V" ? "#6a8a4a" : "#3a2e2a"; arrondi(ctx, x + 2, y + 2, t - 4, t - 4, 8); ctx.fill();
      if (c.t === "V") { ctx.fillText("🏠", x + t / 2, y + t / 2); return; }
      ctx.save(); ctx.translate(x + t / 2, y + t / 2); ctx.rotate((c.vis * Math.PI) / 2);
      ctx.lineCap = "round"; ctx.lineWidth = t * 0.26;
      ctx.strokeStyle = c.lave ? `rgba(255,${Math.round(110 + 60 * pulse)},20,1)` : "#1e1814";
      if (c.lave) { ctx.shadowColor = "#ff6a00"; ctx.shadowBlur = 14 * pulse; }
      for (const o of OUV[c.t]) { const a = (o * Math.PI) / 2 - Math.PI / 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * t / 2, Math.sin(a) * t / 2); ctx.stroke(); }
      ctx.restore();
    });
  }
}

const def: DefJeu = {
  id: "coulee-de-lave",
  titre: "Coulée de lave",
  accroche: "Guide la lave du Piton de la Fournaise jusqu'à la mer, sans toucher les villages.",
  regles: ["Touche une case pour la faire tourner d'un quart de tour.", "La lave s'allume dans les canaux bien reliés.", "Relie le volcan, en haut, à la mer, en bas.", "Les villages ne bougent pas : contourne-les. Peu de tours = 3 étoiles."],
  niveaux: TAILLES.length,
  theme: THEMES.coucher,
  creer: (c, n) => new Lave(c, n),
};
export default def;
