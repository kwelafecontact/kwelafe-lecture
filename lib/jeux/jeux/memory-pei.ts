// Memory péi : retrouver les paires de fruits et légumes.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { PHOTOS, photo } from "../commun/photos";

type Carte = { id: string; ouverte: number; cible: number; trouvee: boolean; x: number; y: number; vol: number };

class Memory implements Jeu {
  L: number; H: number;
  cartes: Carte[] = [];
  cols = 4; lignes = 3;
  choix: number[] = [];
  attente = 0; coups = 0; trouvees = 0; paires: number;
  temps = 0; limite: number | null; score = 0; serie = 0; fini = false;
  w = 80; h = 100; ox = 0; oy = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.paires = Math.min(12, 3 + Math.ceil(niveau / 2));
    const n = this.paires * 2;
    this.cols = n <= 8 ? 4 : n <= 12 ? 4 : n <= 16 ? 4 : n <= 20 ? 5 : 6;
    this.lignes = Math.ceil(n / this.cols);
    this.limite = niveau >= 8 ? 30 + this.paires * 6 : null;
    const ids = melanger(PHOTOS.map((p) => p.id), c.rnd).slice(0, this.paires);
    this.cartes = melanger([...ids, ...ids], c.rnd).map((id, i) => ({ id, ouverte: 0, cible: 0, trouvee: false, x: 0, y: 0, vol: -i * 0.05 }));
    this.disposer();
    this.hud();
  }
  disposer() {
    const W = this.L * 0.94, Hh = this.H * 0.7;
    this.w = Math.min(W / this.cols - 10, (Hh / this.lignes - 10) * 0.8, 120); this.h = this.w * 1.25;
    this.ox = (this.L - (this.w + 10) * this.cols) / 2 + 5; this.oy = this.H * 0.18;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  hud() { this.c.hud({ score: this.score, objectif: `${this.trouvees}/${this.paires} paires`, temps: this.limite != null ? Math.max(0, this.limite - this.temps) : null }); }
  pos(i: number) { return { x: this.ox + (i % this.cols) * (this.w + 10), y: this.oy + Math.floor(i / this.cols) * (this.h + 10) }; }
  down(x: number, y: number) {
    if (this.attente > 0 || this.fini) return;
    const i = this.cartes.findIndex((_, k) => { const p = this.pos(k); return x >= p.x && x <= p.x + this.w && y >= p.y && y <= p.y + this.h; });
    if (i < 0) return;
    const ca = this.cartes[i];
    if (ca.trouvee || ca.cible === 1 || this.choix.includes(i)) return;
    ca.cible = 1; this.choix.push(i); this.c.sons.clic();
    if (this.choix.length === 2) {
      this.coups++;
      const [a, b] = this.choix.map((k) => this.cartes[k]);
      if (a.id === b.id) {
        a.trouvee = b.trouvee = true; this.trouvees++; this.serie++;
        const gain = 50 + this.serie * 25; this.score += gain;
        const p = this.pos(this.choix[1]);
        setTimeout(() => { this.c.sons.bon(); this.c.fx.etoiles(p.x + this.w / 2, p.y + this.h / 2, 16); const nom = photo(a.id)?.nom; if (nom) this.c.fx.texte(nom, p.x + this.w / 2, p.y, "#fff", 20); this.c.fx.texte(`+${gain}`, p.x + this.w / 2, p.y + this.h, "#ffe066", 24); }, 250);
        this.choix = [];
        if (this.trouvees === this.paires) { this.fini = true; setTimeout(() => this.finir(true), 900); }
      } else { this.serie = 0; this.attente = 0.9; }
      this.hud();
    }
  }
  finir(gagne: boolean) {
    const ratio = this.coups / this.paires;
    const etoiles = !gagne ? 0 : ratio <= 1.6 ? 3 : ratio <= 2.3 ? 2 : 1;
    if (gagne && this.limite != null) this.score += Math.round(Math.max(0, this.limite - this.temps) * 5);
    this.c.fin({ gagne, score: this.score, etoiles });
  }
  maj(dt: number) {
    this.temps += dt;
    if (this.attente > 0) { this.attente -= dt; if (this.attente <= 0) { for (const k of this.choix) this.cartes[k].cible = 0; this.choix = []; this.c.sons.mauvais(); } }
    for (const ca of this.cartes) { ca.ouverte += (ca.cible - ca.ouverte) * Math.min(1, dt * 12); ca.vol = Math.min(1, ca.vol + dt * 2.5); }
    if (this.limite != null && !this.fini) { if (Math.floor(this.temps * 2) !== Math.floor((this.temps - dt) * 2)) this.hud(); if (this.temps >= this.limite) { this.fini = true; this.finir(false); } }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    this.cartes.forEach((ca, i) => {
      const p = this.pos(i), v = Math.max(0, ca.vol), e = v * v * (3 - 2 * v);
      const x = this.L / 2 + (p.x + this.w / 2 - this.L / 2) * e, y = this.H + (p.y + this.h / 2 - this.H) * e;
      const sx = Math.abs(Math.cos(ca.ouverte * Math.PI));
      const face = ca.ouverte > 0.5;
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.02, sx), 1);
      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
      if (face) {
        ctx.fillStyle = ca.trouvee ? "#fff6d8" : "#fffaf0"; arrondi(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12); ctx.fill();
        ctx.shadowColor = "transparent";
        sprite(ctx, this.c.img(ca.id), 0, -this.h * 0.06, this.w * 0.82, 0, 1, false);
        if (ca.trouvee) { ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 3; arrondi(ctx, -this.w / 2 + 2, -this.h / 2 + 2, this.w - 4, this.h - 4, 11); ctx.stroke(); }
      } else {
        const g = ctx.createLinearGradient(0, -this.h / 2, 0, this.h / 2); g.addColorStop(0, "#e8572a"); g.addColorStop(1, "#a8301a");
        ctx.fillStyle = g; arrondi(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(255,230,180,0.5)"; ctx.lineWidth = 2; arrondi(ctx, -this.w / 2 + 6, -this.h / 2 + 6, this.w - 12, this.h - 12, 8); ctx.stroke();
        texteContour(ctx, "K", 0, 0, this.w * 0.42, "#ffe8b0");
      }
      ctx.restore();
    });
  }
}

const def: DefJeu = {
  id: "memory-pei",
  titre: "Memory péi",
  accroche: "Retrouve les paires de fruits et légumes de La Réunion.",
  regles: ["Retourne deux cartes à la fois.", "Si elles sont pareilles, la paire reste visible.", "Moins tu fais de coups, plus tu gagnes d'étoiles.", "À partir du niveau 8, le temps est compté."],
  niveaux: 20,
  theme: THEMES.case,
  visuels: "photos",
  creer: (c, n) => new Memory(c, n),
};
export default def;
