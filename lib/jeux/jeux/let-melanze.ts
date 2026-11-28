// Lèt mélanzé (refonte KwFX v4.1) : les lettres sont dans le van, on les touche dans l'ordre pour écrire le nom du fruit.
// Inventions péi : le coup de van mélange les lettres et chasse une lettre intruse ; la brume des Hauts se lève sur l'image à chaque bonne lettre.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { couleurDe } from "../commun/photos";
import { Combo, Choix, Guide, van, nappeBrume, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

// Mots simples (français courant) associés à une image
const MOTS: [string, string][] = [
  ["KAKI", "kaki"], ["COCO", "coco"], ["MURE", "mure"], ["FIGUE", "figue"], ["POMME", "pomme"], ["MELON", "melon"],
  ["PECHE", "peche"], ["SALAK", "salak"], ["MANGUE", "mangue"], ["LETCHI", "letchi"], ["ORANGE", "orange"], ["CEDRAT", "cedrat"],
  ["PAPAYE", "papaye"], ["GOYAVE", "goyave"], ["AVOCAT", "avocat"], ["DURIAN", "durian"], ["KIWANO", "kiwano"], ["VANILLE", "vanille"],
  ["LONGANI", "longani"], ["JAMALAC", "jamalac"], ["COMBAVA", "combava"], ["PASTEQUE", "pasteque"], ["CHOUCHOU", "chouchou"], ["COROSSOL", "corossol"],
  ["PHYSALIS", "physalis"], ["GOYAVIER", "goyavier"], ["MANDARINE", "mandarine"], ["CARAMBOLE", "carambole"], ["RAMBOUTAN", "ramboutan"], ["SAPOTILLE", "sapotille"],
  ["CHATAIGNE", "chataigne"], ["CACAHUETE", "cacahuete"], ["PAMPLEMOUSSE", "pamplemousse"],
];

type Tuile = { l: string; x: number; y: number; place: number; intrus: boolean; parti: number; secoue: number };
const ALPHA = "ABCDEGILMNOPRSTU";

class LetMelanze implements Jeu {
  L: number; H: number; pb: boolean;
  temps = 0; score = 0; fini = false;
  mots: [string, string][]; m = 0;
  tuiles: Tuile[] = []; ordre: number[] = [];
  aides = 0; erreurs = 0; aidesMot = 0; erreursMot = 0; bravo = 0; saut = 0;
  gratuits = 0; double = false; choixFait = false;
  btnAide: Btn = { x: 0, y: 0, w: 0, h: 0 }; btnVan: Btn = { x: 0, y: 0, w: 0, h: 0 };
  combo: Combo; choix: Choix; guide: Guide;
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    const debut = Math.min(MOTS.length - 4, Math.floor((c.niveau - 1) * 1.5));
    this.mots = melanger(MOTS.slice(debut, debut + 4), c.rnd).slice(0, 3).sort((a, b) => a[0].length - b[0].length);
    this.combo = new Combo(c, 3); this.choix = new Choix(c); this.guide = new Guide(c.niveau === 1);
    this.preparer();
  }
  get mot() { return this.mots[Math.min(this.m, this.mots.length - 1)][0]; }
  preparer() {
    const ls = this.mot.split("").map((l) => ({ l, intrus: false }));
    if (this.pb) for (let i = 0; i < 2; i++) { let l: string; do l = ALPHA[Math.floor(this.c.rnd() * ALPHA.length)]; while (this.mot.includes(l)); ls.push({ l, intrus: true }); }
    this.tuiles = ls.map((x) => ({ l: x.l, x: this.L / 2, y: this.H + 60, place: -1, intrus: x.intrus, parti: 0, secoue: 0 }));
    this.melangerVan(); this.bravo = 0; this.aidesMot = 0; this.erreursMot = 0;
    this.disposer(); this.hud();
    this.guide.dire("lettres", this.pb ? "Deux lettres intruses se cachent dans le van. Le coup de van en chasse une." : "Touche les lettres dans l'ordre pour écrire le nom du fruit.");
  }
  melangerVan() {
    let o = melanger(this.tuiles.map((_, i) => i), this.c.rnd);
    if (o.filter((i) => !this.tuiles[i].intrus).map((i) => this.tuiles[i].l).join("") === this.mot) o = o.reverse();
    this.ordre = o;
  }
  hud() { this.c.hud({ score: this.score, objectif: `mot ${this.m + 1}/3`, info: this.pb ? "Remplis toutes les cases, puis le mot se vérifie" : "Chaque lettre se vérifie tout de suite" }); }
  get van() { const m = marge(this.L, this.H); return { x: this.L / 2, y: this.H - m - Math.min(this.H * 0.2, 170), rx: Math.min(this.L * 0.44, 250), ry: Math.min(this.H * 0.12, 100) }; }
  get img() { const t = Math.min(this.L * 0.44, this.H * 0.22, 210); return { x: this.L / 2 - t / 2, y: Math.max(136, this.H * 0.165), t }; }
  caseT() { return Math.min((this.L - marge(this.L, this.H) * 2) / this.mot.length - 6, 58); }
  posCase(i: number) { const t = this.caseT(), w = (t + 6) * this.mot.length; return { x: this.L / 2 - w / 2 + i * (t + 6) + t / 2, y: this.img.y + this.img.t + 30 + t / 2 }; }
  posVan(k: number, n: number) { const V = this.van, cols = Math.min(n, 6), lg = Math.ceil(n / cols), c = k % cols, r = Math.floor(k / cols), nc = r === lg - 1 ? n - cols * (lg - 1) : cols, t = Math.min(V.rx * 1.7 / cols, 60); return { x: V.x + (c - (nc - 1) / 2) * t, y: V.y + (r - (lg - 1) / 2) * t * 0.95 - 4, t }; }
  disposer() { const m = marge(this.L, this.H), V = this.van, w = Math.min(this.L * 0.4, 170), h = 54, y = Math.min(this.H - m - h, V.y + V.ry + 16); this.btnAide = { x: this.L / 2 - w - 8, y, w, h }; this.btnVan = { x: this.L / 2 + 8, y, w, h }; }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  libres() { return this.ordre.filter((i) => this.tuiles[i].place < 0 && this.tuiles[i].parti === 0); }
  prochaine() { const pris = new Set(this.tuiles.map((t) => t.place)); for (let i = 0; i < this.mot.length; i++) if (!pris.has(i)) return i; return -1; }
  bienPlacees() { return this.tuiles.filter((t) => t.place >= 0 && this.mot[t.place] === t.l).length; }

  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H) || this.bravo > 0) return;
    if (dansBtn(x, y, this.btnAide)) { this.indice(); return; }
    if (dansBtn(x, y, this.btnVan)) { this.coupDeVan(); return; }
    const t = this.tuiles.find((t) => t.parti === 0 && Math.hypot(x - t.x, y - t.y) < 34); if (!t) return;
    this.guide.fait();
    if (t.place >= 0) { t.place = -1; this.c.kw.ev("clic", x, y); return; }
    const p = this.prochaine(); if (p < 0) return;
    if (!this.pb && this.mot[p] !== t.l) { t.secoue = 0.4; this.erreurs++; this.erreursMot++; this.combo.n = 0; this.combo.presque(x, y, "Pas encore celle-là"); return; }
    t.place = p; this.c.kw.ev("clic", x, y);
    if (this.mot[p] === t.l) this.c.kw.joue("brumePei", this.img.x + this.img.t / 2, this.img.y + this.img.t / 2, { intensite: 0.3 });
    if (this.prochaine() < 0) this.verifier();
  }
  verifier() {
    const fautes = this.tuiles.filter((t) => t.place >= 0 && this.mot[t.place] !== t.l);
    if (!fautes.length) return this.reussir();
    for (const t of fautes) { t.place = -1; t.secoue = 0.5; }
    this.erreurs++; this.erreursMot++; this.combo.n = 0;
    const p = this.posCase(Math.floor(this.mot.length / 2)); this.c.kw.ev("erreur", p.x, p.y); this.c.fx.texte(`${fautes.length} lettre${fautes.length > 1 ? "s" : ""} à replacer`, p.x, p.y - 40, "#fff", 18);
  }
  reussir() {
    const p = this.posCase(Math.floor(this.mot.length / 2)), base = Math.max(20, this.mot.length * 30 - this.aidesMot * 15 - this.erreursMot * 10) * (this.double ? 2 : 1);
    this.score += this.combo.bon(p.x, p.y, base, couleurDe(this.mots[Math.min(this.m, this.mots.length - 1)][1]));
    if (!this.aidesMot && !this.erreursMot) this.c.kw.onoma("OTÉ !", p.x, p.y - 30, 0.7);
    this.double = false; this.bravo = 1.5; this.hud();
  }
  indice() {
    const p = this.prochaine(); if (p < 0) return;
    for (const t of this.tuiles) if (t.place >= 0 && this.mot[t.place] !== t.l) t.place = -1;
    const q = this.prochaine(), t = this.tuiles.find((t) => t.place < 0 && !t.intrus && t.parti === 0 && t.l === this.mot[q]); if (!t) return;
    t.place = q; if (this.gratuits > 0) this.gratuits--; else { this.aides++; this.aidesMot++; }
    this.c.kw.joue("etoiles", t.x, t.y, { intensite: 0.4 }); this.c.kw.son("eclat");
    if (this.prochaine() < 0) this.verifier();
  }
  /** Coup de van : les lettres sautent et se mélangent ; en mode problèm, une lettre intruse s'envole. */
  coupDeVan() {
    this.saut = 1; this.melangerVan(); const V = this.van;
    this.c.kw.joue("vannagePei", V.x, V.y - 20, { intensite: 0.8 }); this.c.kw.son("van");
    const intrus = this.tuiles.find((t) => t.intrus && t.parti === 0);
    if (intrus) { intrus.place = -1; intrus.parti = 0.01; this.aides++; this.aidesMot++; this.c.kw.onoma("FIOUu !!!", V.x, V.y - 70, 0.6); }
  }
  suivant() {
    this.m++;
    if (this.m >= 3) { this.fini = true; const f = this.aides + this.erreurs; this.c.fin({ gagne: true, score: this.score, etoiles: f === 0 ? 3 : f <= 3 ? 2 : 1, lignes: [`3 mots écrits · ${this.erreurs} essai${this.erreurs > 1 ? "s" : ""} à refaire · ${this.aides} aide${this.aides > 1 ? "s" : ""}`] }); return; }
    if (!this.choixFait) { this.choixFait = true; this.choix.proposer([{ id: "aide", ic: "💡", nom: "Deux indices offerts", txt: "Deux indices qui ne coûtent rien." }, { id: "double", ic: "✖️", nom: "Points doublés", txt: "Le prochain mot compte double." }], (id) => { if (id === "aide") this.gratuits = 2; else this.double = true; }); }
    this.c.kw.transition(this.m === 1 ? "pailleenqueue" : "vague");
    this.preparer();
  }
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.combo.maj(dt); this.saut = Math.max(0, this.saut - dt * 2.2);
    if (this.bravo > 0) { this.bravo -= dt; if (this.bravo <= 0) this.suivant(); }
    const libres = this.libres(), n = libres.length;
    for (const t of this.tuiles) {
      t.secoue = Math.max(0, t.secoue - dt);
      if (t.parti > 0) { t.parti += dt; t.x += 420 * dt; t.y -= 260 * dt; continue; }
      const k = libres.indexOf(this.tuiles.indexOf(t));
      const cible = t.place >= 0 ? this.posCase(t.place) : this.posVan(Math.max(0, k), Math.max(1, n));
      const v = Math.min(1, dt * 12); t.x += (cible.x - t.x) * v; t.y += (cible.y - t.y) * v;
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, I = this.img, V = this.van, ct = this.caseT();
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 14; ctx.fillStyle = "#FFF8EA"; arrondi(ctx, I.x - 8, I.y - 8, I.t + 16, I.t + 16, 22); ctx.fill(); ctx.restore();
    sprite(ctx, this.c.img(this.mots[Math.min(this.m, this.mots.length - 1)][1]), I.x + I.t / 2, I.y + I.t / 2, I.t * 0.9 * (1 + Math.max(0, this.bravo - 1.2) * 0.4), 0, 1, false);
    if (this.pb && this.bravo <= 0) nappeBrume(ctx, I.x - 8, I.y - 8, I.t + 16, I.t + 16, this.temps, 1 - this.bienPlacees() / this.mot.length);
    const p = this.prochaine();
    for (let i = 0; i < this.mot.length; i++) {
      const q = this.posCase(i);
      ctx.fillStyle = "rgba(255,248,234,0.55)"; arrondi(ctx, q.x - ct / 2, q.y - ct / 2, ct, ct, 10); ctx.fill();
      ctx.strokeStyle = i === p && !this.pb ? `rgba(255,210,63,${0.7 + Math.sin(this.temps * 6) * 0.3})` : "rgba(122,74,42,0.6)"; ctx.lineWidth = i === p && !this.pb ? 4 : 2; arrondi(ctx, q.x - ct / 2, q.y - ct / 2, ct, ct, 10); ctx.stroke();
    }
    van(ctx, V.x, V.y, V.rx, V.ry, Math.sin(this.saut * Math.PI) * 22);
    for (const t of this.tuiles) {
      if (t.parti > 1.2) continue;
      const s = t.place >= 0 ? ct : Math.min(54, this.posVan(0, Math.max(1, this.libres().length)).t - 6), dx = t.secoue ? Math.sin(t.secoue * 50) * 5 : 0, dy = t.place < 0 && t.parti === 0 ? -Math.sin(this.saut * Math.PI) * (30 + (t.l.charCodeAt(0) % 5) * 6) : 0;
      ctx.save(); ctx.translate(t.x + dx, t.y + dy); ctx.rotate(t.parti * 6); ctx.globalAlpha = Math.max(0, 1 - t.parti);
      ctx.fillStyle = "rgba(0,0,0,0.25)"; arrondi(ctx, -s / 2, -s / 2 + 4, s, s, 10); ctx.fill();
      ctx.fillStyle = this.bravo > 0 && t.place >= 0 ? "#3aa85a" : "#FFD23F"; arrondi(ctx, -s / 2, -s / 2, s, s, 10); ctx.fill();
      texteContour(ctx, t.l, 0, 1, s * 0.6, "#fff"); ctx.restore();
    }
    bouton(ctx, this.btnAide, this.gratuits > 0 ? `Indice offert (${this.gratuits})` : "Indice", "#E0A020");
    bouton(ctx, this.btnVan, "Coup de van", "#7A4A2A");
    this.combo.dessiner(ctx, L / 2, Math.max(96, H * 0.118));
    this.guide.dessiner(ctx, L, H, this.temps, this.posCase(0).y + ct / 2 + 12);
    this.choix.dessiner(ctx, L, H);
  }
}

const def: DefJeu = {
  id: "let-melanze", titre: "Lèt mélanzé", accroche: "Les lettres sont dans le van : remets-les dans l'ordre.",
  regles: [], niveaux: 20, theme: THEMES.marche, visuels: "photos",
  modes: {
    trankil: ["Regarde l'image, puis touche les lettres dans l'ordre.", "Une lettre qui n'est pas la bonne revient dans le van, sans rien perdre.", "Indice place une lettre, Coup de van mélange les lettres."],
    probleme: ["Deux lettres intruses se cachent dans le van.", "L'image est dans la brume : elle se lève à chaque lettre bien placée.", "Le mot se vérifie quand toutes les cases sont remplies."],
  },
  decor: { lieu: "hauts", heure: "jour" }, themeFx: "flore",
  creer: (c) => new LetMelanze(c),
};
export default def;
