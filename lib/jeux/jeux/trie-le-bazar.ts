// Trie le bazar (refonte KwFX v4.1) : les produits arrivent dans le van, on les lance d'un geste vers le bon bertel.
// Inventions péi : le van à vanner (un coup de van chasse la paille), et l'alizé qui dévie le lancer.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour } from "../commun/moteur2d";
import { PRODUITS, NOMS_CATEGORIE, type Categorie, type Produit } from "../commun/produits";
import { Combo, Choix, Guide, bertel, van, traitsAlize, marge } from "../commun/outils-pei";

const COULEURS: Record<Categorie, string> = { fruit: "#E8B45A", legume: "#8FBF6A", epice: "#D98A5A" };
type Objet = { p: Produit | null; x: number; y: number; vx: number; vy: number; vol: boolean; rot: number; t: number; retour: boolean };

class Trie implements Jeu {
  L: number; H: number; pb: boolean;
  temps = 0; score = 0; erreurs = 0; presques = 0; tries = 0; objectif: number; fini = false;
  cats: Categorie[]; file: (Produit | null)[] = [];
  o: Objet | null = null; prise: { x: number; y: number; t: number } | null = null;
  vent = 0; ventCible = 0; ventDans = 5; saut = 0;
  suite: { cat: Categorie | null; n: number } = { cat: null, n: 0 };
  surligne: Record<string, number> = {};
  etiquettes = 0; double = 0; choixFait = false;
  combo: Combo; choix: Choix; guide: Guide;
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    const n = c.niveau;
    this.cats = this.pb || n >= 8 ? ["fruit", "legume", "epice"] : ["fruit", "legume"];
    this.objectif = this.pb ? 14 + n : 10 + Math.floor(n / 2);
    this.combo = new Combo(c, 5); this.choix = new Choix(c); this.guide = new Guide(n === 1);
    for (let i = 0; i < 3; i++) this.file.push(this.tirer());
    this.suivant(); this.hud();
  }
  hud() { this.c.hud({ score: this.score, objectif: `${this.tries}/${this.objectif}${this.pb ? " · " + "🧡".repeat(Math.max(0, 3 - this.erreurs)) : ""}`, info: this.suite.n >= 2 ? `Série ${NOMS_CATEGORIE[this.suite.cat!]} : ${this.suite.n}/5` : "5 produits de suite dans le même bertel : bonus" }); }
  tirer(): Produit | null {
    if (this.pb && this.c.rnd() < 0.16) return null;   // paille à chasser d'un coup de van
    const dispo = PRODUITS.filter((p) => this.cats.includes(p.categorie));
    const pool = this.c.rnd() < 0.5 ? dispo.filter((p) => p.categorie !== "fruit") : dispo;
    return pool[Math.floor(this.c.rnd() * pool.length)];
  }
  get centreVan() { return { x: this.L / 2, y: this.H - marge(this.L, this.H) - Math.min(this.H * 0.16, 130), rx: Math.min(this.L * 0.3, 150), ry: Math.min(this.H * 0.085, 70) }; }
  paniers() {
    const m = marge(this.L, this.H), n = this.cats.length, w = Math.min((this.L - m * 2) / n - 12, 170), h = Math.min(this.H * 0.2, w * 1.05), x0 = (this.L - (w + 12) * n) / 2 + 6, y = Math.max(150, this.H * 0.19);
    return this.cats.map((cat, i) => ({ cat, x: x0 + i * (w + 12), y, w, h }));
  }
  suivant() {
    const V = this.centreVan;
    this.o = { p: this.file.shift()!, x: V.x, y: V.y - 6, vx: 0, vy: 0, vol: false, rot: 0, t: 0, retour: false };
    this.file.push(this.tirer());
    if (this.o.p === null) this.guide.dire("paille", "De la paille ! Touche le van pour la chasser d'un coup de van.", { x: V.x, y: V.y });
    else { const b = this.paniers().find((q) => q.cat === this.o!.p!.categorie)!; this.guide.dire("lance", `Glisse le produit vers son bertel : ${NOMS_CATEGORIE[b.cat].toLowerCase()}.`, { x: b.x + b.w / 2, y: b.y + b.h / 2 }); }
  }
  redim(L: number, H: number) { this.L = L; this.H = H; if (this.o && !this.o.vol) { const V = this.centreVan; this.o.x = V.x; this.o.y = V.y - 6; } }
  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H)) return;
    const o = this.o; if (!o || o.vol) return;
    const b = this.paniers().find((q) => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h);
    if (b && !this.pb) { this.lancer(b.x + b.w / 2 - o.x, b.y + b.h / 2 - o.y, 0.42); return; }   // trankil : toucher le bertel suffit
    this.prise = { x, y, t: this.temps };
  }
  up(x: number, y: number) {
    const pr = this.prise, o = this.o; this.prise = null;
    if (!pr || !o || o.vol || this.fini) return;
    const dx = x - pr.x, dy = y - pr.y, V = this.centreVan;
    if (Math.hypot(dx, dy) < 26) { if (Math.hypot(pr.x - V.x, (pr.y - V.y) * 1.6) < V.rx * 1.2) this.coupDeVan(); return; }
    if (dy > -10) return;
    const d = Math.hypot(dx, dy), port = (o.y - this.paniers()[0].y - this.paniers()[0].h * 0.5) / Math.max(0.3, -dy / d);
    this.lancer(dx / d * port, dy / d * port, 0.5);
  }
  lancer(dx: number, dy: number, duree: number) {
    const o = this.o!; o.vol = true; o.t = 0; o.vx = dx / duree; o.vy = dy / duree; this.guide.fait(); this.c.kw.son("vent");
  }
  /** Coup de van : la paille s'envole. Un vrai produit, lui, retombe dans le van. */
  coupDeVan() {
    const o = this.o!, V = this.centreVan; this.saut = 1; this.guide.fait();
    this.c.kw.joue("vannagePei", V.x, V.y - 20, { intensite: 0.8 }); this.c.kw.son("van");
    if (o.p === null) { this.score += this.combo.bon(V.x, V.y - 60, 30, "#E8C56A"); this.c.kw.onoma("FIOUu !!!", V.x, V.y - 90, 0.6); this.reussi(null); }
    else this.c.fx.texte("Ce n'est pas de la paille", V.x, V.y - 80, "#fff", 18);
  }
  reussi(cat: Categorie | null) {
    this.tries++;
    if (cat) {
      this.suite = this.suite.cat === cat ? { cat, n: this.suite.n + 1 } : { cat, n: 1 };
      if (this.suite.n === 5) { this.suite.n = 0; this.score += 200; this.c.kw.banniere("Bertel plein ! +200", 0.6); const b = this.paniers().find((q) => q.cat === cat)!; this.c.kw.joue("koudminPei", b.x + b.w / 2, b.y + b.h / 2, { intensite: 0.8 }); }
    }
    if (this.etiquettes > 0) this.etiquettes--; if (this.double > 0) this.double--;
    this.hud();
    if (this.tries >= this.objectif) { this.fini = true; this.o = null; const f = this.erreurs + this.presques; setTimeout(() => this.c.fin({ gagne: true, score: this.score, etoiles: f === 0 ? 3 : f <= 2 ? 2 : 1, lignes: [`${this.tries} produits triés · meilleure série ${this.combo.meilleur}`] }), 500); return; }
    if (!this.choixFait && this.tries === 6) {
      this.choixFait = true;
      this.choix.proposer([{ id: "etiq", ic: "🏷️", nom: "Étiquettes", txt: "Les 8 prochains produits montrent leur famille." }, { id: "double", ic: "✖️", nom: "Points doublés", txt: "Les 8 prochains produits comptent double." }], (id) => { if (id === "etiq") this.etiquettes = 8; else this.double = 8; });
    }
    this.suivant();
  }
  arrive() {
    const o = this.o!, b = this.paniers().find((q) => o.x >= q.x - 6 && o.x <= q.x + q.w + 6);
    if (o.p === null) { this.rate(o.x, o.y, "La paille ne va pas au bertel"); return; }
    if (!b) { this.presques++; this.combo.n = 0; this.combo.presque(o.x, o.y, "À côté !"); o.retour = true; return; }
    this.surligne[b.cat] = 1;
    if (b.cat === o.p.categorie) { this.score += this.combo.bon(b.x + b.w / 2, b.y + b.h * 0.4, 40 * (this.double > 0 ? 2 : 1), o.p.jus.couleur); this.c.kw.son("bertel"); this.reussi(b.cat); }
    else this.rate(o.x, o.y, `${o.p.nom} : ${NOMS_CATEGORIE[o.p.categorie].toLowerCase().replace(/s$/, "")}`);
  }
  rate(x: number, y: number, texte: string) {
    const o = this.o!; this.suite.n = 0; this.c.fx.texte(texte, x, y - 30, "#fff", 18);
    if (this.pb) { this.erreurs++; this.combo.rate(x, y); if (this.erreurs >= 3) { this.fini = true; this.o = null; this.hud(); setTimeout(() => this.c.fin({ gagne: false, score: this.score, etoiles: 0, lignes: [`${this.tries} produits triés sur ${this.objectif}`] }), 500); return; } }
    else { this.presques++; this.combo.n = 0; this.c.kw.ev("erreur", x, y); }
    o.retour = true; this.hud();
  }
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.combo.maj(dt); this.saut = Math.max(0, this.saut - dt * 2.5);
    for (const k in this.surligne) this.surligne[k] = Math.max(0, this.surligne[k] - dt * 2);
    if (this.pb) {
      this.ventDans -= dt;
      if (this.ventDans <= 0) { this.ventDans = 5 + this.c.rnd() * 4; this.ventCible = (this.c.rnd() < 0.5 ? -1 : 1) * (0.4 + this.c.rnd() * 0.6) * (this.c.rnd() < 0.2 ? 0 : 1); if (this.ventCible) this.c.kw.joue("alizePei", this.ventCible > 0 ? 0 : this.L, this.H * 0.45, { intensite: Math.abs(this.ventCible) }); }
      this.vent += (this.ventCible - this.vent) * Math.min(1, dt * 2);
    }
    const o = this.o; if (!o) return;
    const V = this.centreVan;
    if (o.retour) { o.x += (V.x - o.x) * Math.min(1, dt * 9); o.y += (V.y - 6 - o.y) * Math.min(1, dt * 9); o.rot *= 0.9; if (Math.hypot(o.x - V.x, o.y - V.y + 6) < 4) { o.retour = false; o.vol = false; } return; }
    if (o.vol) {
      o.t += dt; o.vx += this.vent * 720 * dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += dt * 7;
      const P = this.paniers()[0];
      if (o.y <= P.y + P.h * 0.5 || o.t > 1.2) this.arrive();
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, V = this.centreVan;
    for (const b of this.paniers()) {
      bertel(ctx, b.x, b.y, b.w, b.h, this.suite.cat === b.cat ? this.suite.n / 5 : 0, COULEURS[b.cat], this.surligne[b.cat] || 0);
      texteContour(ctx, NOMS_CATEGORIE[b.cat], b.x + b.w / 2, b.y + b.h * 0.62, Math.min(22, b.w * 0.16), "#fff");
    }
    if (this.pb) {
      traitsAlize(ctx, L, H, this.temps, this.vent, 0.36, 0.7);
      if (Math.abs(this.vent) > 0.1) texteContour(ctx, (this.vent > 0 ? "Alizé  ➜" : "⬅  Alizé") + (Math.abs(this.vent) > 0.7 ? " fort" : ""), L / 2, H * 0.5, 18, "#fff");
    }
    van(ctx, V.x, V.y, V.rx, V.ry, Math.sin(this.saut * Math.PI) * 26);
    // file d'attente (les deux suivants)
    this.file.slice(0, 2).forEach((p, i) => { const x = V.x - V.rx - 26 - i * 44, y = V.y + 6; ctx.globalAlpha = 0.75 - i * 0.25; if (p) sprite(ctx, this.c.img(p.id), x, y, 40); else this.paille(ctx, x, y, 16); ctx.globalAlpha = 1; });
    const o = this.o;
    if (o) {
      const t = Math.min(V.rx * 0.9, 96) * (o.vol ? 1 - Math.min(0.35, o.t * 0.5) : 1), dy = o.vol ? 0 : -Math.sin(this.saut * Math.PI) * 40;
      if (o.p) { sprite(ctx, this.c.img(o.p.id), o.x, o.y + dy, t, o.rot); if (this.etiquettes > 0 && !o.vol) texteContour(ctx, NOMS_CATEGORIE[o.p.categorie].replace(/s$/, ""), o.x, o.y + t * 0.62, 15, "#FFE066"); }
      else if (this.saut <= 0 || o.vol) this.paille(ctx, o.x, o.y + dy, t * 0.42);
      if (!o.vol && !o.retour && this.prise) { ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 4; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.moveTo(o.x, o.y - t * 0.5); ctx.lineTo(o.x, o.y - t * 1.4); ctx.stroke(); ctx.setLineDash([]); }
    }
    this.combo.dessiner(ctx, L / 2, Math.max(96, H * 0.118));
    this.guide.dessiner(ctx, L, H, this.temps, H * 0.52);
    this.choix.dessiner(ctx, L, H);
  }
  paille(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = "#B8943A"; ctx.lineWidth = Math.max(2, r * 0.16); ctx.lineCap = "round";
    for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.5); ctx.lineTo(-Math.cos(a) * r, -Math.sin(a) * r * 0.5); ctx.stroke(); }
    ctx.restore();
  }
}

const def: DefJeu = {
  id: "trie-le-bazar", titre: "Trie le bazar", accroche: "Lance chaque produit du van vers son bertel.",
  regles: [], niveaux: 20, theme: THEMES.case,
  modes: {
    trankil: ["Un produit arrive dans le van.", "Glisse-le vers son bertel, ou touche simplement le bon bertel.", "Si tu te trompes, il revient : aucune erreur comptée."],
    probleme: ["Lance d'un geste : l'alizé dévie le produit, vise en avance.", "De la paille ? Touche le van pour la chasser d'un coup de van.", "Fruits, légumes, épices. Trois erreurs et la partie s'arrête."],
  },
  decor: { lieu: "kaz", heure: "jour" }, themeFx: "lontan",
  creer: (c) => new Trie(c),
};
export default def;
