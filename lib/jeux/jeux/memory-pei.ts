// Memory péi (refonte KwFX v4.1) : retrouver les paires.
// Inventions péi : à la veillée, les lucioles laissent voir un instant les cartes qu'elles survolent ; l'alizé échange deux cartes sous tes yeux.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { PHOTOS, photo, couleurDe } from "../commun/photos";
import { Combo, Choix, Guide, plateau, traitsAlize, marge } from "../commun/outils-pei";

type Carte = { id: string; ouverte: number; cible: number; trouvee: boolean; x: number; y: number; vol: number; lampe: any };
type Luciole = { a: number; b: number; ph: number; x: number; y: number; lampe: any };

export class Memory implements Jeu {
  L: number; H: number; pb: boolean;
  cartes: Carte[] = []; cols = 4; lignes = 3; paires: number;
  choix: number[] = []; attente = 0; coups = 0; trouvees = 0; rates = 0; suite = 0; defiFait = false;
  temps = 0; score = 0; fini = false; coupDoeil = 0; souffle = 0;
  w = 80; h = 100; ox = 0; oy = 0;
  lucioles: Luciole[] = [];
  combo: Combo; bonus: Choix; guide: Guide; bonusFait = false;
  constructor(private c: Contexte, private niveau: number, private pool: string[] = PHOTOS.map((p) => p.id), private nomDe: (id: string) => string | undefined = (id) => photo(id)?.nom, paireMax = 12) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    this.paires = Math.min(paireMax, pool.length, (this.pb ? 4 : 3) + Math.ceil(niveau / 2));
    const n = this.paires * 2;
    this.cols = n <= 16 ? 4 : n <= 20 ? 5 : 6; this.lignes = Math.ceil(n / this.cols);
    const ids = melanger(pool, c.rnd).slice(0, this.paires);
    this.cartes = melanger([...ids, ...ids], c.rnd).map((id, i) => ({ id, ouverte: 0, cible: 0, trouvee: false, x: 0, y: 0, vol: -i * 0.04, lampe: null }));
    this.combo = new Combo(c, 4); this.bonus = new Choix(c); this.guide = new Guide(niveau === 1);
    this.disposer(); this.cartes.forEach((ca, i) => { const p = this.pos(i); ca.x = p.x; ca.y = p.y; });
    if (this.pb) { for (let i = 0; i < 2; i++) this.lucioles.push({ a: 0.31 + i * 0.17, b: 0.23 + i * 0.11, ph: i * 2.4, x: 0, y: 0, lampe: null }); }
    else this.montrer(2.4);
    this.guide.dire("paires", this.pb ? "C'est la veillée : suis les lucioles, elles laissent voir les cartes." : "Regarde bien les cartes, puis retrouve les paires.");
    this.hud();
  }
  montrer(duree: number) { this.coupDoeil = duree; for (const ca of this.cartes) if (!ca.trouvee) ca.cible = 1; }
  disposer() {
    const m = marge(this.L, this.H), haut = Math.max(140, this.H * 0.17), W = this.L - m * 2, Hh = this.H - haut - Math.max(70, this.H * 0.09);
    this.w = Math.min(W / this.cols - 10, (Hh / this.lignes - 10) * 0.8, 124); this.h = this.w * 1.25;
    this.ox = (this.L - (this.w + 10) * this.cols) / 2 + 5; this.oy = haut + Math.max(0, (Hh - (this.h + 10) * this.lignes) / 2);
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  hud() { this.c.hud({ score: this.score, objectif: `${this.trouvees}/${this.paires} paires`, info: this.defiFait ? "Défi réussi : 3 paires d'affilée" : `Défi : 3 paires d'affilée (${Math.min(3, this.suite)}/3)` }); }
  pos(i: number) { return { x: this.ox + (i % this.cols) * (this.w + 10), y: this.oy + Math.floor(i / this.cols) * (this.h + 10) }; }
  centre(i: number) { const ca = this.cartes[i]; return { x: ca.x + this.w / 2, y: ca.y + this.h / 2 }; }
  voisines(i: number, j: number) { return Math.abs((i % this.cols) - (j % this.cols)) + Math.abs(Math.floor(i / this.cols) - Math.floor(j / this.cols)) === 1; }

  down(x: number, y: number) {
    if (this.fini || this.bonus.down(x, y, this.L, this.H)) return;
    if (this.attente > 0 || this.coupDoeil > 0) return;
    const i = this.cartes.findIndex((ca) => x >= ca.x && x <= ca.x + this.w && y >= ca.y && y <= ca.y + this.h);
    if (i < 0) return;
    const ca = this.cartes[i];
    if (ca.trouvee || ca.cible === 1 || this.choix.includes(i)) return;
    ca.cible = 1; this.choix.push(i); this.c.kw.ev("clic", x, y); this.guide.fait();
    const p = this.centre(i);
    if (this.pb && !ca.lampe) ca.lampe = this.c.kw.lampe(p.x, p.y, { rayon: this.w * 1.5, couleur: "#FFD9A0" });
    if (this.choix.length < 2) return;
    this.coups++;
    const [ia, ib] = this.choix, a = this.cartes[ia], b = this.cartes[ib];
    if (a.id === b.id) {
      a.trouvee = b.trouvee = true; this.trouvees++; this.suite++; this.choix = [];
      const q = this.centre(ia);
      setTimeout(() => {
        this.score += this.combo.bon(p.x, p.y, 60, couleurDe(a.id), "trouve");
        this.c.kw.joue("etoiles", q.x, q.y, { intensite: 0.5 });
        const nom = this.nomDe(a.id); if (nom) this.c.fx.texte(nom, p.x, p.y + this.h * 0.62, "#fff", 18);
        if (this.suite === 3 && !this.defiFait) { this.defiFait = true; this.score += 150; this.c.kw.banniere("Défi réussi ! +150", 0.6); }
        this.hud();
        if (this.trouvees === this.paires) { this.fini = true; setTimeout(() => this.finir(), 900); }
        else if (!this.bonusFait && this.trouvees >= Math.ceil(this.paires / 2)) this.proposer();
      }, 320);
    } else {
      const vraie = this.cartes.findIndex((o, k) => o.id === a.id && k !== ia);
      if (this.voisines(vraie, ib)) setTimeout(() => this.combo.presque(p.x, p.y, "Juste à côté !"), 300);
      this.suite = 0; this.combo.n = 0; this.rates++; this.attente = 0.95;
    }
    this.hud();
  }
  proposer() {
    this.bonusFait = true;
    this.bonus.proposer([{ id: "oeil", ic: "👀", nom: "Coup d'œil", txt: "Toutes les cartes se montrent un court instant." }, this.pb ? { id: "lucioles", ic: "✨", nom: "Deux lucioles de plus", txt: "Plus de lumière pour voir sous les cartes." } : { id: "paire", ic: "🎁", nom: "Une paire offerte", txt: "Une paire se retourne toute seule." }],
      (id) => {
        if (id === "oeil") this.montrer(1.5);
        else if (id === "lucioles") for (let i = 0; i < 2; i++) this.lucioles.push({ a: 0.4 + i * 0.13, b: 0.36 - i * 0.1, ph: 1 + i * 3, x: 0, y: 0, lampe: null });
        else { const i = this.cartes.findIndex((ca) => !ca.trouvee), j = this.cartes.findIndex((ca, k) => k !== i && ca.id === this.cartes[i].id); for (const k of [i, j]) { this.cartes[k].trouvee = true; this.cartes[k].cible = 1; } this.trouvees++; const p = this.centre(i); this.c.kw.ev("trouve", p.x, p.y); this.hud(); if (this.trouvees === this.paires) { this.fini = true; setTimeout(() => this.finir(), 900); } }
      });
  }
  /** L'alizé échange deux cartes encore cachées : on les voit glisser. */
  alize() {
    const libres = this.cartes.map((ca, i) => i).filter((i) => !this.cartes[i].trouvee && this.cartes[i].cible === 0);
    if (libres.length < 2) return;
    const [i, j] = melanger(libres, this.c.rnd);
    const t = this.cartes[i]; this.cartes[i] = this.cartes[j]; this.cartes[j] = t;
    this.souffle = 1.2; const p = this.centre(i);
    this.c.kw.joue("alizePei", 0, p.y, { intensite: 0.7 }); this.c.kw.son("vent"); this.c.fx.texte("L'alizé échange deux cartes", this.L / 2, this.oy - 22, "#fff", 18);
  }
  finir() {
    const ratio = this.coups / this.paires;
    for (const ca of this.cartes) ca.lampe?.eteindre(600);
    for (const l of this.lucioles) l.lampe?.eteindre(600);
    this.c.fin({ gagne: true, score: this.score, etoiles: ratio <= 1.7 ? 3 : ratio <= 2.4 ? 2 : 1, lignes: [`${this.coups} coups pour ${this.paires} paires`] });
  }
  maj(dt: number) {
    this.bonus.maj(dt); if (this.bonus.ouvert) return;
    this.temps += dt; this.combo.maj(dt); this.souffle = Math.max(0, this.souffle - dt);
    if (this.coupDoeil > 0) { this.coupDoeil -= dt; if (this.coupDoeil <= 0) for (const ca of this.cartes) if (!ca.trouvee) ca.cible = 0; }
    if (this.attente > 0) {
      this.attente -= dt;
      if (this.attente <= 0) {
        for (const k of this.choix) { const ca = this.cartes[k]; ca.cible = 0; ca.lampe?.eteindre(400); ca.lampe = null; }
        const p = this.centre(this.choix[1]); this.choix = [];
        this.c.kw.ev("erreur", p.x, p.y);
        if (this.pb && this.rates % 3 === 0) this.alize();
      }
    }
    this.cartes.forEach((ca, i) => {
      const p = this.pos(i), v = Math.min(1, dt * 7);
      ca.x += (p.x - ca.x) * v; ca.y += (p.y - ca.y) * v;
      ca.ouverte += (ca.cible - ca.ouverte) * Math.min(1, dt * 12); ca.vol = Math.min(1, ca.vol + dt * 2.5);
      if (ca.lampe) ca.lampe.deplacer(ca.x + this.w / 2, ca.y + this.h / 2);
    });
    const W = (this.w + 10) * this.cols, Hh = (this.h + 10) * this.lignes;
    for (const l of this.lucioles) {
      l.x = this.ox + W / 2 + Math.sin(this.temps * l.a + l.ph) * W * 0.48; l.y = this.oy + Hh / 2 + Math.sin(this.temps * l.b + l.ph * 1.7) * Hh * 0.48;
      if (!l.lampe) l.lampe = this.c.kw.lampe(l.x, l.y, { couleur: "#D8FF6A", rayon: this.w * 1.1, scintille: 0.4 });
      else l.lampe.deplacer(l.x, l.y);
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    plateau(ctx, this.ox - 14, this.oy - 14, (this.w + 10) * this.cols + 18, (this.h + 10) * this.lignes + 18, this.pb);
    this.cartes.forEach((ca) => {
      const v = Math.max(0, ca.vol), e = v * v * (3 - 2 * v);
      const cx = ca.x + this.w / 2, cy = ca.y + this.h / 2 + (1 - e) * this.H * 0.4;
      const k = Math.cos(ca.ouverte * Math.PI), face = ca.ouverte > 0.5, sx = Math.max(0.04, Math.abs(k));
      let vue = 0;   // carte cachée qu'une luciole laisse deviner
      if (!face) for (const l of this.lucioles) vue = Math.max(vue, 1 - Math.hypot(l.x - cx, l.y - cy) / (this.w * 0.85));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(sx * (ca.trouvee ? 0.96 : 1), ca.trouvee ? 0.96 : 1); ctx.globalAlpha = e;
      ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = face ? "#FFF8EA" : "#1FA3C4"; arrondi(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12); ctx.fill(); ctx.shadowColor = "transparent";
      if (face) {
        sprite(ctx, this.c.img(ca.id), 0, -this.h * 0.04, this.w * 0.82, 0, 1, false);
        if (ca.trouvee) { ctx.strokeStyle = "#3aa85a"; ctx.lineWidth = 4; arrondi(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12); ctx.stroke(); }
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2; arrondi(ctx, -this.w / 2 + 6, -this.h / 2 + 6, this.w - 12, this.h - 12, 8); ctx.stroke();
        ctx.fillStyle = "#FFD23F"; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + this.temps * 0.3; ctx.beginPath(); ctx.ellipse(Math.cos(a) * this.w * 0.14, Math.sin(a) * this.w * 0.14, this.w * 0.12, this.w * 0.07, a, 0, 7); ctx.fill(); }
        ctx.fillStyle = "#E63946"; ctx.beginPath(); ctx.arc(0, 0, this.w * 0.07, 0, 7); ctx.fill();
        if (vue > 0.05) { ctx.globalAlpha = e * Math.min(0.8, vue * 1.4); ctx.fillStyle = "#FFF8EA"; arrondi(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 12); ctx.fill(); sprite(ctx, this.c.img(ca.id), 0, -this.h * 0.04, this.w * 0.82, 0, 1, false); }
      }
      ctx.restore();
    });
    for (const l of this.lucioles) {
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, 22); g.addColorStop(0, "rgba(240,255,150,0.95)"); g.addColorStop(1, "rgba(216,255,106,0)");
      ctx.fillStyle = g; ctx.fillRect(l.x - 22, l.y - 22, 44, 44);
    }
    if (this.souffle > 0) traitsAlize(ctx, this.L, this.H, this.temps * 3, this.souffle, this.oy / this.H, 0.9);
    if (this.coupDoeil > 0) texteContour(ctx, "Regarde bien…", this.L / 2, this.oy - 24, 20, "#FFE066");
    this.combo.dessiner(ctx, this.L / 2, Math.max(96, this.H * 0.118));
    this.guide.dessiner(ctx, this.L, this.H, this.temps, this.H - Math.max(84, this.H * 0.11));
    this.bonus.dessiner(ctx, this.L, this.H);
  }
}

export const MODES_MEMORY = {
  trankil: ["Regarde les cartes au début, puis retourne-les deux par deux.", "Deux cartes pareilles restent visibles.", "Pas de chrono : prends ton temps."],
  probleme: ["C'est la veillée : chaque carte ouverte allume sa lampe.", "Les lucioles laissent voir un instant les cartes qu'elles survolent.", "Tous les trois ratés, l'alizé échange deux cartes sous tes yeux."],
};
const def: DefJeu = {
  id: "memory-pei", titre: "Memory péi", accroche: "Retrouve les paires de fruits et légumes, de jour ou à la veillée.",
  regles: [], niveaux: 20, theme: THEMES.case, visuels: "photos",
  modes: MODES_MEMORY, decor: { lieu: "kaz", heure: "jour" }, themeFx: "fruits",
  nuit: (mode) => (mode === "probleme" ? 0.72 : 0),
  creer: (c, n) => new Memory(c, n),
};
export default def;
