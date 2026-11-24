// Fusion péi : on lâche des fruits dans la tante ; deux fruits identiques fusionnent en un plus gros.
import { couleurDe } from "../commun/photos";
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, etoilesPour } from "../commun/moteur2d";
import { produit } from "../commun/produits";

export const CHAINE = ["goyavier", "letchi", "longani", "mandarine", "goyave", "grenadine", "mangue", "papaye", "coco", "pasteque", "durian"];
const TAILLES = [0.055, 0.07, 0.085, 0.1, 0.115, 0.13, 0.15, 0.17, 0.19, 0.215, 0.245];

type Boule = { k: number; x: number; y: number; vx: number; vy: number; r: number; rot: number; ne: number; dessus: number };

class Fusion implements Jeu {
  L: number; H: number;
  temps = 0; score = 0;
  boules: Boule[] = [];
  actuel = 0; suivant = 0;
  visee = 0;
  attente = 0;
  fini = false;
  alerte = 0;
  boite = { x: 0, y: 0, w: 0, h: 0 };
  base = 0;

  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H;
    this.disposer();
    this.actuel = this.tirer(); this.suivant = this.tirer();
    this.visee = this.boite.x + this.boite.w / 2;
    this.c.hud({ score: 0 });
  }
  tirer() { return Math.floor(this.c.rnd() * 5); }
  disposer() {
    const w = Math.min(this.L * 0.92, this.H * 0.62, 460), h = Math.min(this.H * 0.66, w * 1.25);
    this.boite = { x: (this.L - w) / 2, y: this.H - h - 24, w, h };
    this.base = w;
  }
  redim(L: number, H: number) { const ox = this.boite.x, oy = this.boite.y, ow = this.boite.w; this.L = L; this.H = H; this.disposer(); const s = this.boite.w / ow; for (const b of this.boules) { b.x = this.boite.x + (b.x - ox) * s; b.y = this.boite.y + this.boite.h - (oy + this.boite.h / s - b.y) * s; b.r = this.rayon(b.k); } }
  rayon(k: number) { return TAILLES[k] * this.base; }
  get ligne() { return this.boite.y + this.rayon(4) * 1.1; }

  down(x: number) { if (!this.fini) this.visee = x; }
  move(x: number) { if (!this.fini) this.visee = x; }
  up(x: number) {
    if (this.fini || this.attente > 0) return;
    const r = this.rayon(this.actuel);
    const px = Math.max(this.boite.x + r, Math.min(this.boite.x + this.boite.w - r, x));
    this.boules.push({ k: this.actuel, x: px, y: this.boite.y - r - 6, vx: 0, vy: 0, r, rot: 0, ne: 0, dessus: 0 });
    this.c.sons.pop(this.actuel);
    this.actuel = this.suivant; this.suivant = this.tirer();
    this.attente = 0.45;
  }

  maj(dt: number) {
    if (this.fini) return;
    this.temps += dt;
    this.attente = Math.max(0, this.attente - dt);
    const g = 1500, B = this.boite;
    const sous = 3, h = dt / sous;
    for (let s = 0; s < sous; s++) {
      for (const b of this.boules) {
        b.vy += g * h; b.x += b.vx * h; b.y += b.vy * h;
        b.vx *= 0.995; b.ne += h;
        if (b.x - b.r < B.x) { b.x = B.x + b.r; b.vx = Math.abs(b.vx) * 0.3; }
        if (b.x + b.r > B.x + B.w) { b.x = B.x + B.w - b.r; b.vx = -Math.abs(b.vx) * 0.3; }
        if (b.y + b.r > B.y + B.h) { b.y = B.y + B.h - b.r; b.vy = -Math.abs(b.vy) * 0.15; b.vx *= 0.92; }
      }
      // collisions et fusions
      for (let i = 0; i < this.boules.length; i++) {
        for (let j = i + 1; j < this.boules.length; j++) {
          const a = this.boules[i], b = this.boules[j];
          if (a.k < 0 || b.k < 0) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
          if (d >= m || d === 0) continue;
          if (a.k === b.k && a.k < CHAINE.length - 1) { this.fusionner(a, b); continue; }
          const nx = dx / d, ny = dy / d, chev = (m - d) / 2;
          const ma = a.r * a.r, mb = b.r * b.r, tot = ma + mb;
          a.x -= nx * chev * (mb / tot) * 2; a.y -= ny * chev * (mb / tot) * 2;
          b.x += nx * chev * (ma / tot) * 2; b.y += ny * chev * (ma / tot) * 2;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const imp = -rv * 1.2; a.vx -= nx * imp * (mb / tot); a.vy -= ny * imp * (mb / tot); b.vx += nx * imp * (ma / tot); b.vy += ny * imp * (ma / tot); }
        }
      }
      this.boules = this.boules.filter((b) => b.k >= 0);
    }
    for (const b of this.boules) b.rot += (b.vx * dt) / b.r;
    // fruit au-dessus de la ligne trop longtemps : fin
    let danger = false;
    for (const b of this.boules) {
      if (b.ne > 1 && b.y - b.r < this.ligne) { b.dessus += dt; if (b.dessus > 2.2) danger = true; } else b.dessus = 0;
    }
    this.alerte = this.boules.some((b) => b.dessus > 0.3) ? Math.min(1, this.alerte + dt * 2) : Math.max(0, this.alerte - dt * 2);
    if (danger) {
      this.fini = true;
      this.c.fin({ gagne: true, score: this.score, etoiles: etoilesPour(this.score, [400, 1200, 2500]) });
    }
  }

  fusionner(a: Boule, b: Boule) {
    const k = a.k + 1;
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
    a.k = -1; b.k = -1;
    const r = this.rayon(k);
    this.boules.push({ k, x, y, vx: (a.vx + b.vx) / 2, vy: Math.min(a.vy, b.vy) - 120, r, rot: 0, ne: 1, dessus: 0 });
    const gain = (k + 1) * (k + 2);
    this.score += gain;
    this.c.sons.fusion(k);
    this.c.fx.gerbe(x, y, couleurDe(CHAINE[k]), 16 + k * 2, 200 + k * 20, 2);
    this.c.fx.texte(`+${gain}`, x, y - r, "#ffe066", 22 + k * 2);
    if (k >= 8) { this.c.fx.etoiles(x, y, 30); this.c.fx.secouer(0.25); this.c.fx.texte("Gayar !", this.L / 2, this.H * 0.25, "#9cff9c", 40); }
    this.c.hud({ score: this.score });
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const B = this.boite;
    // tante (panier tressé)
    ctx.save();
    ctx.fillStyle = "rgba(90,50,20,0.55)"; arrondi(ctx, B.x - 10, B.y, B.w + 20, B.h + 14, 22); ctx.fill();
    ctx.strokeStyle = "rgba(200,150,90,0.6)"; ctx.lineWidth = 2;
    for (let y = B.y + 18; y < B.y + B.h; y += 18) { ctx.beginPath(); ctx.moveTo(B.x - 6, y); ctx.lineTo(B.x + B.w + 6, y); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,240,210,0.12)"; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.restore();
    // ligne de danger
    ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = `rgba(255,${120 - this.alerte * 100},${80 - this.alerte * 60},${0.5 + this.alerte * 0.5})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(B.x, this.ligne); ctx.lineTo(B.x + B.w, this.ligne); ctx.stroke(); ctx.restore();
    // fruits
    for (const b of this.boules) sprite(this.ctxSafe(ctx), this.c.img(CHAINE[b.k]), b.x, b.y, b.r * 2.25, b.rot);
    // fruit à lâcher + guide
    if (!this.fini) {
      const r = this.rayon(this.actuel);
      const x = Math.max(B.x + r, Math.min(B.x + B.w - r, this.visee));
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.setLineDash([4, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, B.y - r); ctx.lineTo(x, B.y + B.h); ctx.stroke(); ctx.setLineDash([]);
      sprite(ctx, this.c.img(CHAINE[this.actuel]), x, B.y - r - 8, r * 2.25, 0, this.attente > 0 ? 0.4 : 1);
      // suivant
      texteContour(ctx, "Suivant", this.L - 60, 110, 15, "#fff");
      sprite(ctx, this.c.img(CHAINE[this.suivant]), this.L - 60, 150, 48);
    }
    // chaîne des fruits en bas
    const t = Math.min(30, this.L / (CHAINE.length + 2));
    CHAINE.forEach((id, i) => sprite(ctx, this.c.img(id), (this.L - CHAINE.length * t) / 2 + i * t + t / 2, this.H - 12, t * 0.9, 0, 0.9, false));
  }
  ctxSafe(ctx: CanvasRenderingContext2D) { return ctx; }
}

const def: DefJeu = {
  id: "fusion-pei",
  titre: "Fusion péi",
  accroche: "Lâche les fruits dans la tante : deux fruits pareils fusionnent en un plus gros !",
  regles: ["Glisse le doigt pour viser, lâche pour faire tomber le fruit.", "Deux fruits identiques qui se touchent fusionnent.", "Du goyavier jusqu'au ti jacque géant : vise le plus gros !", "Si un fruit reste au-dessus de la ligne, c'est fini."],
  niveaux: 0,
  theme: THEMES.lagon,
  visuels: "photos",
  creer: (c) => new Fusion(c),
};
export default def;
