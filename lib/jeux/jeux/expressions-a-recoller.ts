// Expressions à recoller : relier chaque expression créole à son sens, puis compléter une expression.
// Expressions tirées du livre « Les expressions de La Réunion, vol. 1 » (Kwélafé Production).
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger } from "../commun/moteur2d";
import { paragraphe, panneau, dessinerTuile, dansTuile, type Tuile } from "../commun/texte";
import D from "../serie2/donnees";

type Expr = (typeof D.expressions)[number];
const STOP = new Set("la le les lé i in an dan dann de d pou pa na sï sou èk son mon ou konm pï pi a alï minm inn é sa sat ek kë po".split(" "));
const motCle = (c: string) => {
  const ws = c.replace(/'/g, "' ").split(/\s+/).map((w) => w.replace(/[,.?!']/g, "")).filter((w) => w.length >= 3 && !STOP.has(w.toLowerCase()));
  return ws.sort((a, b) => b.length - a.length)[0];
};
// ordre fixe des expressions, pour que chaque niveau garde les mêmes
function ordre(): Expr[] { let s = 21; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; return melanger([...D.expressions], r); }
const ORDRE = ordre();
const MOTS = [...new Set(D.expressions.map((e) => motCle(e.c)).filter(Boolean))] as string[];

class Recoller implements Jeu {
  L: number; H: number;
  groupe: Expr[];
  gauche: Tuile[] = []; droite: Tuile[] = [];
  choixG = -1; reliees = 0; erreurs = 0;
  phase: "relie" | "complete" | "fin" = "relie";
  aCompleter: { e: Expr; mot: string; tuiles: Tuile[]; bonne: number } | null = null;
  attente = 0; score = 0; fini = false; temps = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.groupe = ORDRE.slice((niveau - 1) * 4, niveau * 4);
    this.gauche = melanger(this.groupe.map((e, i) => ({ x: 0, y: 0, w: 0, h: 0, texte: e.c, etat: "" as const, appui: 0, data: i })), c.rnd);
    this.droite = melanger(this.groupe.map((e, i) => ({ x: 0, y: 0, w: 0, h: 0, texte: e.f, etat: "" as const, appui: 0, data: i })), c.rnd);
    const cand = this.groupe.filter((e) => e.c.split(" ").length >= 3 && motCle(e.c));
    if (cand.length) {
      const e = cand[0], mot = motCle(e.c);
      const ch = melanger([mot, ...melanger(MOTS.filter((m) => m.toLowerCase() !== mot.toLowerCase()), c.rnd).slice(0, 2)], c.rnd);
      this.aCompleter = { e, mot, bonne: ch.indexOf(mot), tuiles: ch.map((texte) => ({ x: 0, y: 0, w: 0, h: 0, texte, etat: "" as const, appui: 0 })) };
    }
    this.disposer(); this.hud();
  }
  hud() { this.c.hud({ score: this.score, objectif: this.phase === "relie" ? `${this.reliees}/4 reliées` : "Complète", info: "✕".repeat(this.erreurs) + "·".repeat(Math.max(0, 3 - this.erreurs)) }); }
  disposer() {
    const marge = 14, w = Math.min((this.L - marge * 3) / 2, 300), x0 = (this.L - (w * 2 + marge)) / 2;
    const h = Math.min(92, (this.H * 0.68) / 4 - 10), y0 = this.H * 0.17;
    this.gauche.forEach((t, i) => Object.assign(t, { x: x0, y: y0 + i * (h + 10), w, h }));
    this.droite.forEach((t, i) => Object.assign(t, { x: x0 + w + marge, y: y0 + i * (h + 10), w, h }));
    if (this.aCompleter) {
      const tw = Math.min((this.L - 60) / 3, 170);
      this.aCompleter.tuiles.forEach((t, i) => Object.assign(t, { x: this.L / 2 - (tw * 3 + 20) / 2 + i * (tw + 10), y: this.H * 0.62, w: tw, h: 60 }));
    }
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  faute() {
    this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.2); this.hud();
    if (this.erreurs >= 3) { this.fini = true; setTimeout(() => this.c.fin({ gagne: false, score: this.score, etoiles: 0 }), 700); }
  }
  down(x: number, y: number) {
    if (this.fini || this.attente > 0) return;
    if (this.phase === "relie") {
      const g = this.gauche.findIndex((t) => dansTuile(x, y, t) && t.etat !== "fait");
      if (g >= 0) { this.gauche.forEach((t) => t.etat === "choisi" && (t.etat = "")); this.gauche[g].etat = "choisi"; this.choixG = g; this.c.sons.clic(); return; }
      const d = this.droite.findIndex((t) => dansTuile(x, y, t) && t.etat !== "fait");
      if (d < 0 || this.choixG < 0) return;
      const tg = this.gauche[this.choixG], td = this.droite[d];
      if (tg.data === td.data) {
        tg.etat = td.etat = "bon"; this.reliees++; this.score += 100;
        this.c.sons.bon(); this.c.fx.etoiles(td.x + td.w / 2, td.y + td.h / 2, 14);
        setTimeout(() => { tg.etat = td.etat = "fait"; }, 500);
        this.choixG = -1;
        if (this.reliees === 4) this.attente = 1.0;
      } else { td.etat = "faux"; setTimeout(() => { if (td.etat === "faux") td.etat = ""; }, 500); this.faute(); }
      this.hud();
    } else if (this.phase === "complete" && this.aCompleter) {
      const i = this.aCompleter.tuiles.findIndex((t) => dansTuile(x, y, t)); if (i < 0) return;
      const t = this.aCompleter.tuiles[i];
      if (i === this.aCompleter.bonne) {
        t.etat = "bon"; this.score += 150; this.c.sons.bon(); this.c.fx.etoiles(t.x + t.w / 2, t.y, 22);
        this.phase = "fin"; this.attente = 2.4;
      } else { t.etat = "faux"; this.faute(); }
    }
  }
  maj(dt: number) {
    this.temps += dt;
    if (this.attente > 0 && !this.fini) {
      this.attente -= dt;
      if (this.attente <= 0) {
        if (this.phase === "relie" && this.aCompleter) { this.phase = "complete"; this.hud(); }
        else { this.fini = true; this.c.fin({ gagne: true, score: this.score, etoiles: 3 - this.erreurs }); }
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    if (this.phase === "relie") {
      paragraphe(ctx, "Touche une expression, puis son sens", this.L / 2, this.H * 0.09, this.L - 40, 18, "#fff");
      for (const t of this.gauche) dessinerTuile(ctx, t, 17);
      for (const t of this.droite) dessinerTuile(ctx, t, 15);
      return;
    }
    const a = this.aCompleter!; const w = Math.min(this.L - 40, 560), x = (this.L - w) / 2, y = this.H * 0.14;
    panneau(ctx, x, y, w, this.H * 0.42);
    paragraphe(ctx, "Trouve le mot qui manque", this.L / 2, y + 16, w - 40, 16, "#9a5a2a");
    const texte = this.phase === "fin" ? a.e.c : a.e.c.replace(a.mot, "_____");
    const h1 = paragraphe(ctx, texte, this.L / 2, y + 46, w - 40, 26, "#3a2412");
    paragraphe(ctx, a.e.f, this.L / 2, y + 60 + h1, w - 50, 17, "#7a5a3a", "center", 600);
    if (this.phase === "fin") paragraphe(ctx, a.e.x, this.L / 2, y + this.H * 0.42 + 90, w, 16, "#fff", "center", 700);
    else for (const t of a.tuiles) dessinerTuile(ctx, t, 20);
  }
}

const def: DefJeu = {
  id: "expressions-a-recoller",
  titre: "Expressions à recoller",
  accroche: "Les expressions de La Réunion sont coupées en deux : recolle-les !",
  regles: ["Touche une expression créole, puis le sens qui lui correspond.", "Ensuite, trouve le mot qui manque dans une des expressions.", "Trois erreurs et le niveau recommence.", "Quatre expressions par niveau."],
  niveaux: Math.floor(D.expressions.length / 4),
  theme: THEMES.marche,
  creer: (c, n) => new Recoller(c, n),
};
export default def;
