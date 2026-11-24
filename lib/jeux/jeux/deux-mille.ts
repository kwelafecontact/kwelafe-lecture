// 2048 péi : on fait glisser les fruits ; deux fruits identiques fusionnent en un plus gros.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, etoilesPour } from "../commun/moteur2d";
import { produit } from "../commun/produits";
import { CHAINE } from "./fusion-pei";

type Tuile = { k: number; c: number; r: number; x: number; y: number; s: number; id: number };

const FONDS = ["#fff4dc", "#ffe0e0", "#fff2b0", "#ffd9a8", "#e6f5c8", "#ffc8c8", "#ffe39a", "#ffd0a0", "#fff0a0", "#d8f0c0", "#e8d8ff"];

class DeuxMille implements Jeu {
  L: number; H: number;
  N = 4;
  tuiles: Tuile[] = [];
  score = 0; temps = 0; fini = false;
  depart: { x: number; y: number } | null = null;
  ids = 0;
  cell = 80; ox = 0; oy = 0;
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.disposer();
    this.ajouter(); this.ajouter();
    this.c.hud({ score: 0 });
  }
  disposer() { this.cell = Math.min((this.L * 0.9) / this.N, (this.H * 0.6) / this.N, 120); this.ox = (this.L - this.cell * this.N) / 2; this.oy = (this.H - this.cell * this.N) / 2 + 30; }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  a(c: number, r: number) { return this.tuiles.find((t) => t.c === c && t.r === r); }
  ajouter() {
    const libres: [number, number][] = [];
    for (let c = 0; c < this.N; c++) for (let r = 0; r < this.N; r++) if (!this.a(c, r)) libres.push([c, r]);
    if (!libres.length) return;
    const [c, r] = libres[Math.floor(this.c.rnd() * libres.length)];
    this.tuiles.push({ k: this.c.rnd() < 0.85 ? 0 : 1, c, r, x: c, y: r, s: 0, id: this.ids++ });
  }
  down(x: number, y: number) { this.depart = { x, y }; }
  up(x: number, y: number) {
    if (!this.depart || this.fini) return;
    const dx = x - this.depart.x, dy = y - this.depart.y; this.depart = null;
    if (Math.hypot(dx, dy) < 25) return;
    if (Math.abs(dx) > Math.abs(dy)) this.glisser(Math.sign(dx), 0); else this.glisser(0, Math.sign(dy));
  }
  glisser(dc: number, dr: number) {
    let bouge = false; const fusionnees = new Set<number>();
    const ordre: Tuile[] = this.tuiles.slice().sort((a, b) => (dc ? (b.c - a.c) * dc : (b.r - a.r) * dr));
    for (const t of ordre) {
      if (t.k < 0) continue;
      let c = t.c, r = t.r;
      for (;;) {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= this.N || nr >= this.N) break;
        const o = this.a(nc, nr);
        if (!o) { c = nc; r = nr; continue; }
        if (o.k === t.k && !fusionnees.has(o.id) && o.k < CHAINE.length - 1) {
          o.k++; o.s = 1.35; fusionnees.add(o.id); t.k = -1; t.c = nc; t.r = nr;
          const gain = Math.pow(2, o.k + 1); this.score += gain;
          const x = this.ox + (nc + 0.5) * this.cell, y = this.oy + (nr + 0.5) * this.cell;
          this.c.fx.gerbe(x, y, produit(CHAINE[o.k]).jus.couleur, 12, 180, 2);
          this.c.fx.texte(`+${gain}`, x, y - this.cell * 0.4, "#ffe066", 22);
          this.c.sons.fusion(o.k);
          if (o.k >= 7) this.c.fx.etoiles(x, y, 20);
          bouge = true;
        }
        break;
      }
      if (t.k >= 0 && (c !== t.c || r !== t.r)) { t.c = c; t.r = r; bouge = true; }
    }
    this.tuiles = this.tuiles.filter((t) => t.k >= 0);
    if (bouge) { this.c.sons.swoosh(); this.ajouter(); this.c.hud({ score: this.score }); if (!this.peutJouer()) { this.fini = true; setTimeout(() => this.c.fin({ gagne: true, score: this.score, etoiles: etoilesPour(this.score, [500, 2000, 6000]) }), 600); } }
  }
  peutJouer() {
    if (this.tuiles.length < this.N * this.N) return true;
    for (const t of this.tuiles) for (const [dc, dr] of [[1, 0], [0, 1]]) { const o = this.a(t.c + dc, t.r + dr); if (o && o.k === t.k) return true; }
    return false;
  }
  maj(dt: number) {
    this.temps += dt;
    for (const t of this.tuiles) { t.x += (t.c - t.x) * Math.min(1, dt * 16); t.y += (t.r - t.y) * Math.min(1, dt * 16); t.s += (1 - t.s) * Math.min(1, dt * 10); }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { cell, ox, oy, N } = this;
    ctx.fillStyle = "rgba(80,30,50,0.45)"; arrondi(ctx, ox - 12, oy - 12, cell * N + 24, cell * N + 24, 22); ctx.fill();
    for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) { ctx.fillStyle = "rgba(255,255,255,0.14)"; arrondi(ctx, ox + c * cell + 5, oy + r * cell + 5, cell - 10, cell - 10, 14); ctx.fill(); }
    for (const t of this.tuiles) {
      const x = ox + (t.x + 0.5) * cell, y = oy + (t.y + 0.5) * cell;
      ctx.fillStyle = FONDS[t.k % FONDS.length]; arrondi(ctx, x - cell / 2 + 6, y - cell / 2 + 6, cell - 12, cell - 12, 14); ctx.fill();
      sprite(ctx, this.c.img(CHAINE[t.k]), x, y - 4, cell * 0.78 * t.s, 0, 1, false);
      texteContour(ctx, String(Math.pow(2, t.k + 1)), x + cell * 0.28, y + cell * 0.28, 18, "#fff");
    }
    texteContour(ctx, "Glisse le doigt dans une direction", this.L / 2, oy + cell * N + 40, 16, "#fff");
  }
}

const def: DefJeu = {
  id: "2048-pei",
  titre: "2048 péi",
  accroche: "Le célèbre 2048, avec des fruits péi à la place des nombres.",
  regles: ["Glisse le doigt : tous les fruits partent dans cette direction.", "Deux fruits identiques qui se rencontrent fusionnent.", "Du goyavier jusqu'au ti jacque : va le plus loin possible.", "La partie s'arrête quand plus rien ne bouge."],
  niveaux: 0,
  theme: THEMES.coucher,
  creer: (c) => new DeuxMille(c),
};
export default def;
