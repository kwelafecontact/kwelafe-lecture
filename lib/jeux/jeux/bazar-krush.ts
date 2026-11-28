// Bazar Krush (refonte KwFX v4.1) : on échange deux fruits voisins pour en aligner trois ou plus.
// Inventions péi : le bertel à remplir avec le fruit demandé, et l'alizé qui décale une ligne annoncée à l'avance.
import { Choix, Pouvoir, Guide, bertel, traitsAlize } from "../commun/outils-pei";
import { couleurDe } from "../commun/photos";
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, etoilesPour, melanger } from "../commun/moteur2d";
import { produit } from "../commun/produits";

const TYPES_TOUS = ["letchi", "mangue", "carambole", "combava", "grenadine", "orange", "goyave", "pasteque", "coco", "jamalac-blanc"];
type Case = { t: number; special: 0 | 1 | 2 | 3; y: number; x: number; s: number; vie: number } | null; // special 1 ligne, 2 colonne, 3 bombe

class Krush implements Jeu {
  L: number; H: number;
  C = 7; R = 8;
  g: Case[][] = [];
  types: string[];
  score = 0; coups: number; objectif: number;
  temps = 0;
  sel: { c: number; r: number } | null = null;
  depart: { x: number; y: number } | null = null;
  occupe = 0;        // animations en cours
  combo = 0;
  fini = false;
  echange: { a: [number, number]; b: [number, number]; retour: boolean; t: number } | null = null;
  cell = 50; ox = 0; oy = 0;
  pb: boolean;
  sac = { t: 0, n: 0, max: 20, pop: 0 };          // bertel à remplir avec un fruit précis
  alize: { r: number; dir: number; dans: number } | null = null;   // ligne que le vent va décaler
  ventPret = false; souffle = 0;
  choix: Choix; koudmin: Pouvoir; guide: Guide; choixFait = false; repos = 0; indice: { c: number; r: number }[] | null = null;
  cascadeMax = 0;

  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    this.choix = new Choix(c); this.koudmin = new Pouvoir(c, "🤝", "Koudmin"); this.guide = new Guide(niveau === 1);
    const nb = niveau <= 6 ? 5 : niveau <= 18 ? 6 : 7;
    this.types = melanger(TYPES_TOUS, c.rnd).slice(0, nb);
    this.coups = Math.max(14, 26 - Math.floor(niveau / 3));
    this.objectif = 1200 + niveau * 350;
    if (!this.pb) this.coups = 9999;
    this.sac = { t: Math.floor(c.rnd() * nb), n: 0, max: this.pb ? 12 + niveau : 16 + niveau * 2, pop: 0 };
    if (this.pb) this.nouvelAlize();
    this.disposer();
    this.remplir();
    this.hud();
    this.guide.dire("glisse", "Fais glisser un fruit vers son voisin pour en aligner trois.");
  }
  disposer() {
    const haut = Math.max(168, this.H * 0.22);
    this.cell = Math.min((this.L * 0.92) / this.C, (this.H - haut - Math.max(96, this.H * 0.13)) / this.R, 74);
    this.ox = (this.L - this.cell * this.C) / 2; this.oy = haut;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  hud() {
    if (this.pb) this.c.hud({ score: this.score, objectif: `${this.coups} coups`, info: `Objectif ${this.objectif}${this.alize ? ` · alizé dans ${this.alize.dans}` : ""}` });
    else this.c.hud({ score: this.score, objectif: `bertel ${this.sac.n}/${this.sac.max}`, info: "Remplis le bertel avec le fruit demandé" });
  }
  nouvelAlize() { this.alize = { r: Math.floor(this.c.rnd() * this.R), dir: this.c.rnd() < 0.5 ? -1 : 1, dans: 4 }; }
  /** L'alizé décale toute une ligne d'une case ; le fruit du bout revient de l'autre côté. */
  souffler() {
    const a = this.alize; if (!a) return;
    const ligne = Array.from({ length: this.C }, (_, c) => this.g[c][a.r]);
    for (let c = 0; c < this.C; c++) { const src = (c - a.dir + this.C) % this.C, ca = ligne[src]; this.g[c][a.r] = ca; if (ca && Math.abs(src - c) > 1) ca.x = a.dir > 0 ? -1 : this.C; }
    const y = this.oy + (a.r + 0.5) * this.cell;
    this.c.kw.joue("alizePei", a.dir > 0 ? this.ox : this.ox + this.cell * this.C, y, { intensite: 0.8 }); this.c.kw.son("vent"); this.c.kw.banniere("L'alizé souffle !", 0.45);
    this.souffle = 1; this.combo = 0; this.occupe = 0.4; this.nouvelAlize(); this.hud();
  }
  /** Koudmin : tous les fruits de la sorte demandée partent dans le bertel. */
  lancerKoudmin() {
    const m = new Set<string>();
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) if (this.g[c][r]?.t === this.sac.t) m.add(c + "," + r);
    this.c.kw.banniere("Koudmin !", 0.6);
    if (m.size) { this.combo = 0; this.detruire(m, null); }
  }
  chercherCoup(): { c: number; r: number }[] | null {
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) for (const [dc, dr] of [[1, 0], [0, 1]]) {
      const b = { c: c + dc, r: r + dr }; if (b.c >= this.C || b.r >= this.R) continue;
      this.permuter({ c, r }, b); const ok = this.trouver().size > 0; this.permuter({ c, r }, b); if (ok) return [{ c, r }, b];
    }
    return null;
  }

  nouvelle(r: number): Case { return { t: Math.floor(this.c.rnd() * this.types.length), special: 0, y: r - this.R - 1, x: 0, s: 1, vie: 1 }; }
  remplir() {
    for (let c = 0; c < this.C; c++) { this.g[c] = []; for (let r = 0; r < this.R; r++) {
      let k: number;
      do { k = Math.floor(this.c.rnd() * this.types.length); }
      while ((c >= 2 && this.g[c - 1][r]?.t === k && this.g[c - 2][r]?.t === k) || (r >= 2 && this.g[c][r - 1]?.t === k && this.g[c][r - 2]?.t === k));
      this.g[c][r] = { t: k, special: 0, y: r - this.R - 2 - c * 0.3, x: c, s: 1, vie: 1 };
    } }
  }
  vers(x: number, y: number) { const c = Math.floor((x - this.ox) / this.cell), r = Math.floor((y - this.oy) / this.cell); return c >= 0 && c < this.C && r >= 0 && r < this.R ? { c, r } : null; }

  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H)) return;
    this.repos = 0; this.indice = null;
    if (!this.occupe && this.koudmin.down(x, y, this.L, this.H)) { this.lancerKoudmin(); return; }
    this.down2(x, y);
  }
  down2(x: number, y: number) { if (this.occupe || this.fini) return; const p = this.vers(x, y); if (p) { this.sel = p; this.depart = { x, y }; this.c.kw.ev("clic", x, y); } }
  move(x: number, y: number) {
    if (!this.sel || !this.depart || this.occupe) return;
    const dx = x - this.depart.x, dy = y - this.depart.y;
    if (Math.hypot(dx, dy) < this.cell * 0.4) return;
    const d = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)];
    const b = { c: this.sel.c + d[0], r: this.sel.r + d[1] };
    if (b.c >= 0 && b.c < this.C && b.r >= 0 && b.r < this.R) this.essayer(this.sel, b);
    this.sel = null; this.depart = null;
  }
  up(x: number, y: number) {
    if (!this.sel || this.occupe) { this.sel = null; return; }
    const p = this.vers(x, y);
    if (p && (p.c !== this.sel.c || p.r !== this.sel.r) && Math.abs(p.c - this.sel.c) + Math.abs(p.r - this.sel.r) === 1) this.essayer(this.sel, p);
  }

  essayer(a: { c: number; r: number }, b: { c: number; r: number }) {
    this.permuter(a, b);
    const A = this.g[a.c][a.r]!, B = this.g[b.c][b.r]!;
    const bombe = A.special === 3 || B.special === 3;
    if (bombe) {
      this.coups--; this.c.kw.son("eclat"); this.avancerVent();
      const cible = A.special === 3 ? B.t : A.t;
      const marques = new Set<string>();
      for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) if (this.g[c][r]?.t === cible) marques.add(c + "," + r);
      marques.add(a.c + "," + a.r); marques.add(b.c + "," + b.r);
      this.combo = 0; this.detruire(marques, null); this.hud(); return;
    }
    if (this.trouver().size) { this.coups--; this.combo = 0; this.guide.fait(); this.avancerVent(); this.resoudre(b); this.hud(); }
    else { this.permuter(a, b); this.echange = { a: [a.c, a.r], b: [b.c, b.r], retour: true, t: 0.25 }; this.c.kw.ev("erreur", this.ox + (a.c + 0.5) * this.cell, this.oy + (a.r + 0.5) * this.cell); }
  }
  avancerVent() { if (this.alize && --this.alize.dans <= 0) this.ventPret = true; }
  permuter(a: { c: number; r: number }, b: { c: number; r: number }) { const t = this.g[a.c][a.r]; this.g[a.c][a.r] = this.g[b.c][b.r]; this.g[b.c][b.r] = t; }

  trouver(): Set<string> {
    const m = new Set<string>();
    for (let r = 0; r < this.R; r++) for (let c = 0; c < this.C - 2; c++) { const t = this.g[c][r]?.t; if (t != null && this.g[c + 1][r]?.t === t && this.g[c + 2][r]?.t === t) for (let k = 0; k < 3; k++) m.add(c + k + "," + r); }
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R - 2; r++) { const t = this.g[c][r]?.t; if (t != null && this.g[c][r + 1]?.t === t && this.g[c][r + 2]?.t === t) for (let k = 0; k < 3; k++) m.add(c + "," + (r + k)); }
    return m;
  }
  /** Longueur des alignements pour créer les fruits spéciaux. */
  speciaux(m: Set<string>, pivot: { c: number; r: number } | null) {
    const crees: { c: number; r: number; special: 1 | 2 | 3; t: number }[] = [];
    const vu = new Set<string>();
    for (const k of m) {
      if (vu.has(k)) continue;
      const [c, r] = k.split(",").map(Number);
      let h = 1; while (m.has(c + h + "," + r) && this.g[c + h][r]?.t === this.g[c][r]?.t) h++;
      let v = 1; while (m.has(c + "," + (r + v)) && this.g[c][r + v]?.t === this.g[c][r]?.t) v++;
      const n = Math.max(h, v);
      if (n >= 4) {
        const p = pivot && m.has(pivot.c + "," + pivot.r) ? pivot : { c, r };
        crees.push({ c: p.c, r: p.r, special: n >= 5 ? 3 : h >= v ? 2 : 1, t: this.g[c][r]!.t });
        for (let i = 0; i < h; i++) vu.add(c + i + "," + r);
        for (let i = 0; i < v; i++) vu.add(c + "," + (r + i));
      }
    }
    return crees;
  }
  resoudre(pivot: { c: number; r: number } | null) { const m = this.trouver(); if (m.size) this.detruire(m, pivot); }

  detruire(m: Set<string>, pivot: { c: number; r: number } | null) {
    const crees = this.speciaux(m, pivot);
    // les spéciaux pris dans l'explosion déclenchent leur effet
    const pile = [...m];
    while (pile.length) {
      const k = pile.pop()!; const [c, r] = k.split(",").map(Number); const ca = this.g[c][r];
      if (!ca || !ca.special) continue;
      const sp = ca.special; ca.special = 0;
      const ajout: string[] = [];
      if (sp === 1) for (let i = 0; i < this.C; i++) ajout.push(i + "," + r);
      if (sp === 2) for (let i = 0; i < this.R; i++) ajout.push(c + "," + i);
      if (sp === 3) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if (this.g[c + i]?.[r + j]) ajout.push(c + i + "," + (r + j));
      for (const a of ajout) if (!m.has(a)) { m.add(a); pile.push(a); }
      this.c.fx.secouer(0.2); this.c.kw.joue("impact", this.ox + (c + 0.5) * this.cell, this.oy + (r + 0.5) * this.cell, { intensite: 0.5 });
    }
    this.combo++; this.cascadeMax = Math.max(this.cascadeMax, this.combo);
    let pourSac = 0, coul = "#ffe066";
    const gain = m.size * 20 * this.combo;
    this.score += gain;
    let sx = 0, sy = 0;
    for (const k of m) {
      const [c, r] = k.split(",").map(Number); const ca = this.g[c][r]; if (!ca) continue;
      const x = this.ox + (c + 0.5) * this.cell, y = this.oy + (r + 0.5) * this.cell; sx += x; sy += y;
      this.c.fx.gerbe(x, y, couleurDe(this.types[ca.t]), 8, 180, 2);
      if (ca.t === this.sac.t) pourSac++;
      coul = couleurDe(this.types[ca.t]);
      this.g[c][r] = null;
    }
    for (const cr of crees) this.g[cr.c][cr.r] = { t: cr.t, special: cr.special, y: cr.r, x: cr.c, s: 1.4, vie: 1 };
    const cx = sx / m.size, cy = sy / m.size;
    const ret = this.c.kw.ev("bonne", cx, cy, { couleur: coul, points: gain });
    if (ret.pepite) { this.score += 150; this.c.fx.texte("Pépite +150", cx, cy - 40, "#FFD23F", 24); }
    if (this.combo === 3) this.c.kw.comboMax(cx, cy, "POKk !"); else if (this.combo >= 5) this.c.kw.comboMax(cx, cy, "OTÉ !");
    if (pourSac) {
      const avant = this.sac.n; this.sac.n = Math.min(this.sac.max, this.sac.n + pourSac); this.sac.pop = 1;
      this.koudmin.ajouter(pourSac / 14); this.c.kw.son("bertel");
      if (avant < this.sac.max && this.sac.n >= this.sac.max) { this.score += 300; this.c.kw.banniere("Bertel plein ! +300", 0.7); this.c.kw.joue("koudminPei", this.ox + this.cell, this.oy - 60, { intensite: 0.8 }); }
      if (!this.choixFait && this.sac.n >= this.sac.max / 2) {
        this.choixFait = true;
        this.choix.proposer([{ id: "etoile", ic: "✦", nom: "Une étoile", txt: "Un fruit étoile qui vide toute une sorte." }, this.pb ? { id: "coups", ic: "➕", nom: "4 coups de plus", txt: "Plus de temps pour viser l'objectif." } : { id: "raye", ic: "〰️", nom: "Deux fruits rayés", txt: "Chacun vide une ligne entière." }],
          (id) => { if (id === "coups") this.coups += 4; else this.poser(id === "etoile" ? [3] : [1, 2]); this.hud(); });
      }
    }
    this.c.fx.texte(`+${gain}`, sx / m.size, sy / m.size, "#ffe066", 26 + this.combo * 2);
    if (this.combo >= 3) this.c.fx.texte(this.combo >= 5 ? "Gayar gayar !" : "Gayar !", this.L / 2, this.oy - 30, "#9cff9c", 34);
    // gravité
    for (let c = 0; c < this.C; c++) {
      const col = this.g[c].filter((x) => x);
      const manque = this.R - col.length;
      const nouv: Case[] = [];
      for (let i = 0; i < manque; i++) { const n = this.nouvelle(i); n!.y = -manque + i - 0.5; n!.x = c; nouv.push(n); }
      this.g[c] = [...nouv, ...col];
    }
    this.occupe = 0.35;
    this.hud();
  }

  poser(speciaux: (1 | 2 | 3)[]) {
    for (const sp of speciaux) { const c = Math.floor(this.c.rnd() * this.C), r = Math.floor(this.c.rnd() * this.R), ca = this.g[c][r]; if (ca) { ca.special = sp; ca.s = 1.6; this.c.kw.joue("etoiles", this.ox + (c + 0.5) * this.cell, this.oy + (r + 0.5) * this.cell, { intensite: 0.6 }); } }
  }
  aDesCoups() {
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) for (const [dc, dr] of [[1, 0], [0, 1]]) {
      const b = { c: c + dc, r: r + dr }; if (b.c >= this.C || b.r >= this.R) continue;
      this.permuter({ c, r }, b); const ok = this.trouver().size > 0; this.permuter({ c, r }, b); if (ok) return true;
    }
    return false;
  }

  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert) return;
    this.temps += dt; this.koudmin.maj(dt); this.sac.pop = Math.max(0, this.sac.pop - dt * 3); this.souffle = Math.max(0, this.souffle - dt);
    let bouge = false;
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) {
      const ca = this.g[c][r]; if (!ca) continue;
      if (ca.y < r) { ca.y = Math.min(r, ca.y + dt * 14); bouge = true; } else ca.y = r;
      ca.x += (c - ca.x) * Math.min(1, dt * 18); if (Math.abs(ca.x - c) > 0.01) bouge = true;
      ca.s += (1 - ca.s) * Math.min(1, dt * 8);
    }
    if (this.echange) { this.echange.t -= dt; if (this.echange.t <= 0) this.echange = null; }
    if (this.occupe > 0) { this.occupe -= dt; if (this.occupe <= 0 && !bouge) { this.occupe = 0; this.resoudre(null); } else if (this.occupe <= 0) this.occupe = 0.05; return; }
    if (this.fini) return;
    if (bouge) return;
    if (!this.pb && this.sac.n >= this.sac.max) {
      this.fini = true;
      this.c.fin({ gagne: true, score: this.score, etoiles: this.cascadeMax >= 4 ? 3 : this.cascadeMax >= 3 ? 2 : 1, lignes: [`Bertel rempli · plus belle cascade ×${this.cascadeMax}`] });
      return;
    }
    if (this.coups <= 0) {
      this.fini = true;
      const gagne = this.score >= this.objectif;
      this.c.fin({ gagne, score: this.score, etoiles: etoilesPour(this.score, [this.objectif, this.objectif * 1.35, this.objectif * 1.8]), lignes: gagne ? undefined : [`Il manquait ${this.objectif - this.score} points. Tu y es presque !`] });
      return;
    }
    if (this.ventPret) { this.ventPret = false; this.souffler(); return; }
    if (!this.pb) { this.repos += dt; if (this.repos > 6 && !this.indice) this.indice = this.chercherCoup(); }
    if (!bouge && !this.aDesCoups()) { this.c.fx.texte("On mélange !", this.L / 2, this.H / 2, "#fff", 32); this.remplir(); }
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const { cell, ox, oy } = this;
    // bertel à remplir (au-dessus de la grille)
    const bw = Math.min(cell * 1.5, 92), bx = ox, byy = oy - bw - 14, e = 1 + this.sac.pop * 0.15;
    ctx.save(); ctx.translate(bx + bw / 2, byy + bw / 2); ctx.scale(e, e); ctx.translate(-bx - bw / 2, -byy - bw / 2);
    bertel(ctx, bx, byy, bw, bw, this.sac.n / this.sac.max, "#C9A45A", this.sac.n >= this.sac.max ? 1 : 0); ctx.restore();
    sprite(ctx, this.c.img(this.types[this.sac.t]), bx + bw * 1.45, byy + bw * 0.55, bw * 0.7);
    texteContour(ctx, `${this.sac.n}/${this.sac.max}`, bx + bw * 2.35, byy + bw * 0.55, Math.min(22, bw * 0.3), "#FFE066");
    ctx.fillStyle = "rgba(30,60,20,0.45)"; arrondi(ctx, ox - 8, oy - 8, cell * this.C + 16, cell * this.R + 16, 18); ctx.fill();
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) { ctx.fillStyle = (c + r) % 2 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)"; ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell); }
    ctx.save(); ctx.beginPath(); ctx.rect(ox - 8, oy - 8, cell * this.C + 16, cell * this.R + 16); ctx.clip();
    for (let c = 0; c < this.C; c++) for (let r = 0; r < this.R; r++) {
      const ca = this.g[c][r]; if (!ca) continue;
      const x = ox + (ca.x + 0.5) * cell, y = oy + (ca.y + 0.5) * cell;
      const sel = this.sel && this.sel.c === c && this.sel.r === r;
      const t = cell * 0.92 * ca.s * (sel ? 1.12 : 1) * (1 + Math.sin(this.temps * 3 + c + r) * 0.015);
      if (ca.special) {
        ctx.save(); ctx.globalCompositeOperation = "lighter";
        const g = ctx.createRadialGradient(x, y, 0, x, y, cell * 0.6); g.addColorStop(0, ca.special === 3 ? "rgba(255,240,140,0.9)" : "rgba(160,220,255,0.7)"); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(x - cell, y - cell, cell * 2, cell * 2); ctx.restore();
      }
      sprite(ctx, this.c.img(this.types[ca.t]), x, y, t, 0, 1, false);
      if (ca.special === 1 || ca.special === 2) { ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 3; ctx.beginPath(); if (ca.special === 1) { ctx.moveTo(x - cell * 0.4, y); ctx.lineTo(x + cell * 0.4, y); } else { ctx.moveTo(x, y - cell * 0.4); ctx.lineTo(x, y + cell * 0.4); } ctx.stroke(); }
      if (ca.special === 3) texteContour(ctx, "✦", x, y, cell * 0.5, "#fff6a0");
    }
    ctx.restore();
    // alizé annoncé : flèches sur la ligne qui va bouger
    if (this.alize) {
      const a = this.alize, y = oy + (a.r + 0.5) * cell, proche = a.dans <= 1;
      ctx.save(); ctx.globalAlpha = proche ? 0.6 + Math.sin(this.temps * 8) * 0.3 : 0.5;
      ctx.fillStyle = proche ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"; ctx.fillRect(ox, oy + a.r * cell, cell * this.C, cell);
      const fx = a.dir > 0 ? ox + cell * this.C + 4 : ox - 4;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(fx + a.dir * 14, y); ctx.lineTo(fx - a.dir * 2, y - 11); ctx.lineTo(fx - a.dir * 2, y + 11); ctx.closePath(); ctx.fill();
      ctx.restore();
      texteContour(ctx, String(a.dans), a.dir > 0 ? ox - 12 : ox + cell * this.C + 12, y, 18, "#fff");
    }
    if (this.souffle > 0) traitsAlize(ctx, this.L, this.H, this.temps * 3, this.souffle, oy / this.H, (oy + cell * this.R) / this.H);
    if (this.indice) for (const q of this.indice) { ctx.strokeStyle = `rgba(255,224,102,${0.6 + Math.sin(this.temps * 6) * 0.4})`; ctx.lineWidth = 4; arrondi(ctx, ox + q.c * cell + 3, oy + q.r * cell + 3, cell - 6, cell - 6, 10); ctx.stroke(); }
    this.koudmin.dessiner(ctx, this.L, this.H, this.temps);
    this.guide.dessiner(ctx, this.L, this.H, this.temps, oy + cell * this.R + 12);
    this.choix.dessiner(ctx, this.L, this.H);
  }
}

const def: DefJeu = {
  id: "bazar-krush",
  titre: "Bazar Krush",
  accroche: "Aligne les fruits péi par trois et enchaîne les cascades !",
  modes: {
    trankil: ["Fais glisser un fruit vers son voisin pour en aligner trois.", "Remplis le bertel avec le fruit demandé, sans limite de coups.", "Si tu cherches, un coup possible se met à briller."],
    probleme: ["Coups comptés : atteins l'objectif de points.", "L'alizé décale la ligne fléchée quand son compteur arrive à 0 : prépare ton coup.", "Remplis le bertel pour charger le koudmin, qui ramasse toute une sorte."],
  },
  decor: { lieu: "jardin", heure: "jour" }, themeFx: "fruits",
  regles: ["Fais glisser un fruit vers son voisin pour les échanger.", "Trois fruits identiques alignés disparaissent.", "Quatre alignés : un fruit rayé qui vide une ligne. Cinq : une étoile qui vide tous les fruits d'une sorte.", "Atteins l'objectif avant la fin des coups."],
  niveaux: 30,
  theme: THEMES.jardin,
  visuels: "photos",
  creer: (c, n) => new Krush(c, n),
};
export default def;
