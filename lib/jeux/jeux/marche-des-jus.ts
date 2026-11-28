// Le marché des jus (refonte KwFX v4.1) : fruits au blender, puis on TIENT le bouton MIXER et on lâche dans la zone verte.
// Visuels : aquarelles ElevenLabs (nov. 2026). Les fruits sont repeints d'après les photos des planches de KWélafé,
// pour garder la forme exacte de chaque fruit péi. Fichiers dans public/jeux/marche-des-jus/.
// Inventions péi : la brume des Hauts cache la commande (on l'essuie du doigt), le koudmin du voisin prépare un jus entier.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, melanger } from "../commun/moteur2d";
import { photosJus, couleurDe, photo } from "../commun/photos";
import { bulle, jauge, dans } from "../commun/dessins";
import { Combo, Choix, Pouvoir, Guide, nappeBrume, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

// Un seul visuel par nom de fruit : certaines planches montrent deux fois le même fruit (deux « Abiu », deux « Safou »…),
// ce qui donnait deux cagettes au même nom sur l'étal. On garde la fiche nommée, pas le doublon « photo-… ».
const JUTEUX = (() => {
  const tous = photosJus(), vus = new Set<string>();
  const tri = [...tous.filter((id) => !id.startsWith("photo-")), ...tous.filter((id) => id.startsWith("photo-"))];
  return tri.filter((id) => { const n = photo(id)?.nom ?? id; if (vus.has(n)) return false; vus.add(n); return true; });
})();

const BASE = "/jeux/marche-des-jus/";
const NB_CLIENTS = 6;
/** Aquarelles du jeu : fruits, clients du marché, blender, verre, cagette, letchi d'or. */
const IMAGES: Record<string, string> = {
  "mdj:blender": BASE + "blender.webp", "mdj:verre": BASE + "verre.webp", "mdj:cagette": BASE + "cagette.webp", "mdj:letchi-or": BASE + "letchi-or.webp",
};
for (const id of JUTEUX) IMAGES["mdj:" + id] = `${BASE}fruits/${id}.webp`;
for (let i = 1; i <= NB_CLIENTS; i++) IMAGES["mdj:client-" + i] = `${BASE}client-${i}.webp`;

const prete = (im?: HTMLImageElement): im is HTMLImageElement => !!im && im.complete && im.naturalWidth > 0;
/** Dessine une image à la hauteur voulue, centrée en x, posée sur la ligne « bas ». */
function poser(ctx: CanvasRenderingContext2D, im: HTMLImageElement | HTMLCanvasElement | undefined, cx: number, bas: number, h: number, alpha = 1) {
  if (!im) return;
  const lw = im instanceof HTMLImageElement ? im.naturalWidth : im.width, lh = im instanceof HTMLImageElement ? im.naturalHeight : im.height;
  if (!lw || !lh) return;
  const w = h * lw / lh;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(im, cx - w / 2, bas - h, w, h); ctx.restore();
}
/** Verre de jus : l'aquarelle du verre (jus blanc) teintée à la couleur du fruit, gardée en mémoire par couleur. */
const verres = new Map<string, HTMLCanvasElement>();
function verreTeinte(im: HTMLImageElement | undefined, couleur: string): HTMLCanvasElement | undefined {
  if (!prete(im)) return undefined;
  let c = verres.get(couleur); if (c) return c;
  c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const x = c.getContext("2d"); if (!x) return undefined;
  x.drawImage(im, 0, 0);
  // couleur du jus éclaircie (un jus est plus clair que la peau du fruit), pour garder les reflets du verre
  const n = parseInt(couleur.replace("#", ""), 16), cl = (v: number) => Math.round(v + (255 - v) * 0.38);
  x.globalCompositeOperation = "multiply"; x.fillStyle = `rgb(${cl((n >> 16) & 255)},${cl((n >> 8) & 255)},${cl(n & 255)})`; x.fillRect(0, 0, c.width, c.height);
  x.globalAlpha = 1; x.globalCompositeOperation = "destination-in"; x.drawImage(im, 0, 0);
  verres.set(couleur, c); return c;
}
// Intérieur du bol du blender, en fractions de l'image (haut gauche, haut droit, bas droit, bas gauche).
const BOL = { hx0: 0.12, hx1: 0.77, haut: 0.14, bx0: 0.22, bx1: 0.66, bas: 0.57 };
type Volant = { id: string; t: number; x0: number; y0: number };

class MarcheDesJus implements Jeu {
  L: number; H: number; temps = 0; score = 0; fini = false;
  pb: boolean;
  etal: string[]; zones: { id: string; x: number; y: number; w: number; h: number }[] = [];
  recette: string[] = []; dedans: string[] = []; volants: Volant[] = [];
  client = 0; arrivee = 0; servis = 0; objectif: number; departs = 0; parfaits = 0; suite = 0; defiFait = false;
  patience = 1; dureePatience: number;
  tient = false; niveauJauge = 0; zone: [number, number]; double = false; verre = 0; verreOk = 0;
  brume = 0; brumeDans = 2.4; essuie = 0;
  or: { i: number; t: number } | null = null; prochainOr = 14;
  secoue: Record<number, number> = {};
  combo: Combo; choix: Choix; koudmin: Pouvoir; guide: Guide; choixFait = false; auto = 0;
  btnMix: Btn = { x: 0, y: 0, w: 0, h: 0 }; btnDouble: Btn = { x: 0, y: 0, w: 0, h: 0 };

  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    const n = c.niveau;
    this.objectif = this.pb ? 6 + Math.floor(n / 4) : 5;
    this.dureePatience = Math.max(11, 24 - n * 0.4);
    this.zone = this.pb ? [0.68, 0.84] : [0.5, 0.9];
    const nb = n <= 4 ? 6 : 9;
    this.etal = melanger(JUTEUX, c.rnd).slice(0, nb);
    this.combo = new Combo(c); this.choix = new Choix(c); this.koudmin = new Pouvoir(c, "🤝", "Koudmin"); this.guide = new Guide(n === 1);
    this.koudmin.place = (L, H) => ({ x: Math.max(marge(L, H) + 40, this.blender.x - this.blender.t * 0.62 - 86), y: this.btnMix.y + this.btnMix.h / 2 });
    this.disposer(); this.nouveauClient(); this.hud();
  }
  hud() {
    const coeurs = this.pb ? " · " + "🧡".repeat(3 - this.departs) : "";
    this.c.hud({ score: this.score, objectif: `${this.servis}/${this.objectif} jus${coeurs}`, info: this.defiFait ? "Défi réussi : 3 jus parfaits d'affilée" : `Défi : 3 jus parfaits d'affilée (${Math.min(3, this.suite)}/3)` });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  disposer() {
    const { L, H } = this, m = marge(L, H), n = this.etal.length, cols = 3, lg = Math.ceil(n / cols);
    const zoneH = Math.min(H * 0.36, lg * 112), cw = Math.min((L - m * 2) / cols, 132), ch = zoneH / lg, x0 = (L - cw * cols) / 2, y0 = H - zoneH - m - 4;
    this.zones = this.etal.map((id, i) => ({ id, x: x0 + (i % cols) * cw + 5, y: y0 + Math.floor(i / cols) * ch + 5, w: cw - 10, h: ch - 10 }));
    const bw = Math.min(L * 0.44, 200), bh = Math.max(58, Math.min(70, H * 0.085));
    this.btnMix = { x: L / 2 + 6, y: y0 - bh - 14, w: bw, h: bh };
    this.btnDouble = { x: L / 2 + 6, y: y0 - bh * 2 - 22, w: bw * 0.55, h: bh * 0.7 };
  }
  get blender() { const t = Math.min(this.L * 0.3, this.H * 0.2, 150); return { x: this.L / 2 - t * 0.62 - 10, y: this.btnMix.y + this.btnMix.h - t * 0.5, t }; }
  get bulleR() { const w = Math.min(this.L * 0.56, 300), h = Math.min(this.H * 0.13, 104); return { x: this.L * 0.4, y: Math.max(134, this.H * 0.165), w, h }; }

  nouveauClient() {
    const n = this.c.niveau, max = this.pb ? (n <= 3 ? 2 : 3) : n <= 2 ? 1 : n <= 8 ? 2 : 3;
    this.recette = melanger(this.etal, this.c.rnd).slice(0, 1 + Math.floor(this.c.rnd() * max));
    this.dedans = []; this.patience = 1; this.client = Math.floor(this.c.rnd() * 1000); this.arrivee = 0; this.niveauJauge = 0; this.double = false;
    this.brume = 0; this.brumeDans = 2.6; this.essuie = 0; this.auto = 0;
    const z = this.zones.find((q) => q.id === this.recette[0]);
    if (z) this.guide.dire("fruit", "Regarde la bulle, puis touche le même fruit sur ton étal.", { x: z.x + z.w / 2, y: z.y + z.h / 2 });
  }
  get pret() { return this.dedans.length === this.recette.length && this.volants.length === 0; }

  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H)) return;
    if (this.verre > 0) return;
    if (this.koudmin.down(x, y, this.L, this.H)) { this.lancerKoudmin(); return; }
    if (this.or) { const z = this.zones[this.or.i]; if (dans(x, y, z)) { this.or = null; this.score += 50; this.c.kw.ev("pepite", x, y); this.c.fx.texte("Letchi d'or +50", x, y - 30, "#FFD23F", 22); this.hud(); return; } }
    if (this.pb && this.pret && dansBtn(x, y, this.btnDouble)) { this.double = !this.double; this.c.kw.ev("clic", x, y); return; }
    if (dansBtn(x, y, this.btnMix)) {
      if (this.pret) { this.tient = true; this.guide.fait(); this.c.kw.son("mixeur"); } else this.c.kw.ev("clic", x, y);
      return;
    }
    if (this.pb && dans(x, y, this.bulleR) && this.brume > 0.5) { this.essuyer(); return; }
    const i = this.zones.findIndex((z) => dans(x, y, z)); if (i < 0) return;
    const id = this.zones[i].id;
    const manque = this.recette.filter((r) => !this.dedans.includes(r) && !this.volants.some((v) => v.id === r));
    if (manque.includes(id)) {
      const z = this.zones[i];
      this.volants.push({ id, t: 0, x0: z.x + z.w / 2, y0: z.y + z.h / 2 });
      this.c.kw.ev("clic", x, y); this.guide.fait("fruit");
    } else {
      this.secoue[i] = 0.4;
      if (this.pb) { this.patience -= 0.12; this.combo.rate(x, y); } else this.combo.presque(x, y, "Pas celui-là");
    }
  }
  move(x: number, y: number) { if (this.pb && this.brume > 0.5 && dans(x, y, this.bulleR)) this.essuyer(); }
  essuyer() { if (this.essuie > 0) return; this.essuie = 1.3; this.patience -= 0.07; this.c.kw.joue("brumePei", this.bulleR.x + this.bulleR.w / 2, this.bulleR.y + this.bulleR.h / 2, { intensite: 0.5 }); this.c.kw.son("vent"); }
  up() { if (this.tient) { this.tient = false; this.lacher(); } }

  lancerKoudmin() {
    this.dedans = this.recette.slice(); this.volants = []; this.auto = 1;
    const b = this.blender; this.c.kw.joue("koudminPei", b.x, b.y, { intensite: 0.8 }); this.c.kw.banniere("Koudmin ! Le voisin t'aide", 0.6);
  }
  lacher(auto = false) {
    let [a, b] = this.zone; if (this.double) { const mi = (a + b) / 2, d = (b - a) / 4; a = mi - d; b = mi + d; }
    const v = this.niveauJauge, B = this.blender, cx = B.x, cy = B.y - B.t * 0.2, coul = couleurDe(this.recette[0]);
    if (!this.pb && v < a && !auto) { this.guide.dire("tiens", "Tiens le bouton MIXER plus longtemps, lâche dans le vert."); return; }
    const ok = auto || (v >= a && v <= b), presque = !ok && (v > b ? v - b : a - v) < 0.1;
    let gain = 0;
    if (ok) {
      gain = this.combo.bon(cx, cy, (40 + this.recette.length * 20) * (this.double ? 2 : 1), coul);
      this.parfaits++; this.suite++; this.koudmin.ajouter(0.34); this.verreOk = 1;
      this.c.kw.joue("jus", cx, cy, { couleur: coul, intensite: 0.8 });
      if (this.suite === 3 && !this.defiFait) { this.defiFait = true; gain += 100; this.c.kw.banniere("Défi réussi ! +100", 0.7); }
    } else if (presque || !this.pb) {
      this.combo.presque(cx, cy, v > b ? "Ça déborde un peu !" : "Presque !"); gain = 20; this.suite = 0; this.combo.n = 0; this.verreOk = 0.5;
      this.c.kw.joue("jus", cx, cy, { couleur: coul, intensite: 0.4 });
    } else { this.combo.rate(cx, cy); this.suite = 0; this.verreOk = 0; this.departs++; }
    this.score += gain; this.verre = 1; this.hud();
  }
  suivant() {
    if (this.verreOk > 0) this.servis++;
    this.hud();
    if (this.servis >= this.objectif) return this.finir(true);
    if (this.pb && this.departs >= 3) return this.finir(false);
    if (!this.choixFait && this.servis === 3) {
      this.choixFait = true;
      this.choix.proposer([{ id: "zone", ic: "🟢", nom: "Zone verte plus large", txt: "Plus facile de réussir un jus parfait." }, { id: "koudmin", ic: "🤝", nom: "Koudmin tout de suite", txt: "Le voisin prépare un jus entier." }],
        (id) => { if (id === "zone") this.zone = [this.zone[0] - 0.07, this.zone[1] + 0.05]; else this.koudmin.ajouter(1); });
    }
    this.c.kw.joue("etoiles", this.L * 0.2, this.bulleR.y + this.bulleR.h * 0.5, { intensite: 0.4 });
    this.nouveauClient();
  }
  finir(gagne: boolean) {
    this.fini = true;
    const r = this.parfaits / Math.max(1, this.objectif);
    this.c.fin({ gagne, score: this.score, etoiles: !gagne ? 0 : r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, lignes: [`${this.parfaits} jus parfaits · meilleure série ${this.combo.meilleur}`] });
  }

  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.arrivee = Math.min(1, this.arrivee + dt * 2.2); this.combo.maj(dt); this.koudmin.maj(dt);
    for (const k in this.secoue) this.secoue[k] = Math.max(0, this.secoue[k] - dt);
    for (const v of this.volants) v.t += dt * 3.2;
    const arr = this.volants.filter((v) => v.t >= 1);
    for (const v of arr) { this.dedans.push(v.id); const B = this.blender; this.c.kw.joue("jus", B.x, B.y - B.t * 0.1, { couleur: couleurDe(v.id), intensite: 0.35 }); this.c.kw.son("bulles"); }
    this.volants = this.volants.filter((v) => v.t < 1);
    if (this.pret && !this.tient && this.verre <= 0) this.guide.dire("mix", "Tiens le bouton MIXER et lâche quand la jauge est dans le vert.", { x: this.btnMix.x + this.btnMix.w / 2, y: this.btnMix.y + this.btnMix.h / 2 });
    if (this.auto > 0 && this.verre <= 0) { this.niveauJauge = Math.min((this.zone[0] + this.zone[1]) / 2, this.niveauJauge + dt * 1.4); if (this.niveauJauge >= (this.zone[0] + this.zone[1]) / 2 - 0.001) { this.auto = 0; this.lacher(true); } }
    if (this.tient) {
      this.niveauJauge += dt * (this.pb ? 0.62 + this.c.niveau * 0.012 : 0.42);
      if (this.niveauJauge >= 1.05) { this.tient = false; this.niveauJauge = 1.05; this.lacher(); }
    }
    if (this.verre > 0) { this.verre -= dt * 1.1; if (this.verre <= 0) { this.verre = 0; this.suivant(); } return; }
    if (this.pb) {
      this.patience -= dt / this.dureePatience;
      this.essuie = Math.max(0, this.essuie - dt);
      this.brumeDans -= dt;
      const cible = this.brumeDans <= 0 && this.essuie <= 0 ? 1 : 0;
      this.brume += (cible - this.brume) * Math.min(1, dt * 3);
      if (this.patience <= 0) { this.departs++; this.suite = 0; this.combo.n = 0; this.verreOk = 0; this.verre = 0.6; this.c.kw.ev("presque", this.L * 0.2, this.H * 0.22); this.c.fx.texte("Le client reviendra", this.L / 2, this.H * 0.3, "#fff", 20); this.hud(); }
    }
    this.prochainOr -= dt;
    if (this.or) { this.or.t -= dt; if (this.or.t <= 0) this.or = null; }
    else if (this.prochainOr <= 0) { this.prochainOr = 16 + this.c.rnd() * 10; this.or = { i: Math.floor(this.c.rnd() * this.zones.length), t: 3 }; this.c.kw.son("eclat"); }
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, R = this.bulleR, B = this.blender;
    // client et commande
    const cx = L * 0.2, cy = R.y + R.h * 0.95, ct = Math.min(L * 0.3, H * 0.2, 150);
    ctx.save(); ctx.translate((1 - this.arrivee) * -L * 0.4 + (this.verre > 0 && this.verreOk <= 0 ? (1 - this.verre) * -L * 0.5 : 0), 0);
    // client du marché (aquarelle) : léger balancement, il s'agite quand la patience s'épuise
    const presse = this.pb && this.patience < 0.3 ? Math.sin(this.temps * 22) * 2.5 : 0;
    poser(ctx, this.c.img("mdj:client-" + (1 + this.client % NB_CLIENTS)), cx + presse, cy + ct * 1.05 + Math.sin(this.temps * 2 + this.client) * ct * 0.02, ct * 1.75);
    ctx.restore();
    if (this.arrivee > 0.6) {
      bulle(ctx, R.x, R.y, R.w, R.h);
      const t = Math.min(R.h * 0.72, R.w / this.recette.length - 10);
      this.recette.forEach((id, i) => {
        const x = R.x + R.w / 2 + (i - (this.recette.length - 1) / 2) * (t + 8), fait = this.dedans.includes(id);
        sprite(ctx, this.c.img("mdj:" + id), x, R.y + R.h / 2, t, 0, fait ? 0.35 : 1);
        if (fait) texteContour(ctx, "✓", x, R.y + R.h / 2, t * 0.6, "#3aa85a");
      });
      nappeBrume(ctx, R.x - 6, R.y - 6, R.w + 12, R.h + 12, this.temps, this.brume);
      if (this.brume > 0.6) texteContour(ctx, "Essuie la brume", R.x + R.w / 2, R.y + R.h / 2, 15, "#5A7A8A");
      if (this.pb) jauge(ctx, R.x, R.y + R.h + 10, R.w, 12, Math.max(0, this.patience));
    }
    // blender
    const bw = B.t * 0.62, bh = B.t, bx = B.x - bw / 2, by = B.y - bh * 0.62, vib = this.tient ? Math.sin(this.temps * 60) * 2 : 0;
    const imB = this.c.img("mdj:blender"), ih = bh * 1.22, iw = prete(imB) ? ih * imB.naturalWidth / imB.naturalHeight : bw, ix = B.x - iw / 2, iy = by + bh * 1.06 - ih;
    ctx.save(); ctx.translate(vib, 0);
    poser(ctx, imB, B.x, iy + ih, ih);
    if (this.dedans.length) {
      // jus dans le bol : monte avec chaque fruit, s'agite quand on mixe
      const k = this.dedans.length / this.recette.length * 0.75, haut = iy + ih * BOL.haut, bas = iy + ih * BOL.bas, yy = bas - (bas - haut) * k;
      ctx.save();
      ctx.beginPath(); ctx.moveTo(ix + iw * BOL.hx0, haut); ctx.lineTo(ix + iw * BOL.hx1, haut); ctx.lineTo(ix + iw * BOL.bx1, bas); ctx.lineTo(ix + iw * BOL.bx0, bas); ctx.closePath(); ctx.clip();
      ctx.fillStyle = couleurDe(this.dedans[this.dedans.length - 1]); ctx.globalAlpha = 0.78;
      ctx.beginPath(); ctx.moveTo(ix, bas + 4); for (let x = ix; x <= ix + iw; x += 6) ctx.lineTo(x, yy + Math.sin(x * 0.2 + this.temps * (this.tient ? 30 : 4)) * (this.tient ? 6 : 2)); ctx.lineTo(ix + iw, bas + 4); ctx.closePath(); ctx.fill();
      ctx.restore();
      poser(ctx, imB, B.x, iy + ih, ih, 0.28);   // reflets du verre par-dessus le jus
    }
    ctx.restore();
    for (const v of this.volants) { const e = v.t * v.t * (3 - 2 * v.t); sprite(ctx, this.c.img("mdj:" + v.id), v.x0 + (B.x - v.x0) * e, v.y0 + (by - v.y0) * e - Math.sin(e * Math.PI) * 70, 56, e * 5); }
    // jauge de mixage (verticale, à gauche du blender)
    if (this.pret || this.verre > 0 || this.niveauJauge > 0) {
      let [a, b] = this.zone; if (this.double) { const mi = (a + b) / 2, d = (b - a) / 4; a = mi - d; b = mi + d; }
      const jx = Math.min(bx, ix) - 28, jy = by, jw = 18, jh = bh * 0.86;
      ctx.fillStyle = "rgba(40,20,10,0.7)"; arrondi(ctx, jx, jy, jw, jh, 9); ctx.fill();
      ctx.fillStyle = "#3aa85a"; ctx.fillRect(jx, jy + jh * (1 - b), jw, jh * (b - a));
      ctx.fillStyle = "#FFE066"; const hh = jh * Math.min(1, this.niveauJauge); arrondi(ctx, jx + 4, jy + jh - hh, jw - 8, Math.max(4, hh), 4); ctx.fill();
    }
    bouton(ctx, this.btnMix, this.tient ? "LÂCHE !" : "MIXER", "#E8572A", this.tient ? 1 : 0, this.pret && this.verre <= 0);
    if (this.pb && this.pret && this.verre <= 0) bouton(ctx, this.btnDouble, this.double ? "×2 ✓" : "Double ×2", this.double ? "#3aa85a" : "#7A4A2A");
    if (this.verre > 0 && this.verreOk > 0) {
      // le verre de jus, à la couleur du fruit, part du blender vers le client
      const e = 1 - this.verre, hv = Math.max(64, ct * 0.62), yv = cy + ct * 0.55;
      poser(ctx, verreTeinte(this.c.img("mdj:verre"), couleurDe(this.recette[0])), B.x + (cx - B.x) * e, by + (yv - by) * e - Math.sin(e * Math.PI) * 60 + hv / 2, hv);
    }
    // étal (zone du pouce)
    this.zones.forEach((z, i) => {
      const s = this.secoue[i] ? Math.sin(this.secoue[i] * 50) * 5 : 0, or = this.or && this.or.i === i;
      // cagette en bois (aquarelle), le fruit posé dedans
      const cw = Math.min(z.w * 1.04, z.h * 1.2), chh = cw * 0.7475, mx = z.x + z.w / 2 + s, pied = z.y + z.h + 2;
      if (or) { ctx.save(); ctx.shadowColor = "rgba(255,220,90,0.95)"; ctx.shadowBlur = 22; poser(ctx, this.c.img("mdj:cagette"), mx, pied, chh); ctx.restore(); }
      else poser(ctx, this.c.img("mdj:cagette"), mx, pied, chh);
      sprite(ctx, this.c.img(or ? "mdj:letchi-or" : "mdj:" + z.id), mx, pied - chh * 0.66, Math.min(z.w, z.h) * 0.72, 0, this.dedans.includes(z.id) ? 0.45 : 1);
      const nom = photo(z.id)?.nom; if (nom && !or) texteContour(ctx, nom, z.x + z.w / 2 + s, z.y + z.h - 11, Math.min(13, z.w * 0.13), "#fff");
    });
    this.combo.dessiner(ctx, L * 0.2, this.bulleR.y - 6);
    this.koudmin.dessiner(ctx, L, H, this.temps);
    this.guide.dessiner(ctx, L, H, this.temps, this.btnMix.y - 150 > R.y + R.h ? R.y + R.h + 30 : undefined);
    this.choix.dessiner(ctx, L, H);
  }
}

const def: DefJeu = {
  id: "marche-des-jus", titre: "Le marché des jus", accroche: "Mixe le jus parfait pour chaque client du marché forain.",
  regles: [], niveaux: 30, theme: THEMES.marche, images: IMAGES,
  modes: {
    trankil: ["Touche les fruits de la bulle : ils sautent dans le blender.", "Tiens MIXER et lâche quand la jauge est dans le vert.", "Aucune hâte : le client attend, le voisin te donne un koudmin."],
    probleme: ["La brume des Hauts cache la commande : essuie-la, mais ça coûte de la patience.", "Zone verte étroite. Tente « Double ×2 » pour gagner plus.", "Trois clients repartis et la partie s'arrête."],
  },
  themeFx: "fruits",
  creer: (c) => new MarcheDesJus(c),
};
export default def;
