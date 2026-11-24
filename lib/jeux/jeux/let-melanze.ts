// Lèt mélanzé : remettre les lettres dans l'ordre pour écrire le nom du fruit ou du légume.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";

// Mots simples (français courant) associés à une image
const MOTS: [string, string][] = [
  ["COCO", "coco"], ["FIG", "banane"], ["MANGUE", "mangue"], ["LETCHI", "letchi"], ["CITRON", "citron"], ["PIMENT", "piment"],
  ["ANANAS", "ananas"], ["BANANE", "banane"], ["PAPAYE", "papaye"], ["GOYAVE", "goyave"], ["JACQUE", "tijacque"], ["BIBASSE", "bibasse"],
  ["VANILLE", "vanille"], ["PASTEQUE", "pasteque"], ["CHOUCHOU", "chouchou"], ["GOYAVIER", "goyavier"], ["MANDARINE", "mandarine"], ["CARAMBOLE", "carambole"],
  ["AUBERGINE", "bringelle"], ["GRENADINE", "grenadine"], ["FRUIT A PAIN", "friyapin"],
].filter(([m]) => m !== "FIG") as [string, string][];

type Tuile = { l: string; x: number; y: number; tx: number; ty: number; place: number; i: number };

class LetMelanze implements Jeu {
  L: number; H: number;
  temps = 0; score = 0; fini = false;
  mots: [string, string][]; m = 0;
  tuiles: Tuile[] = [];
  places: (number | null)[] = [];
  aides = 0; erreurs = 0;
  bravo = 0;
  btnAide: Bouton = { x: 0, y: 0, w: 130, h: 46, texte: "Indice", actif: true, appui: 0, couleur: "#e0a020" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    // trois mots par niveau, du plus court au plus long
    const debut = Math.min(MOTS.length - 3, Math.floor((niveau - 1) * 1.5));
    this.mots = melanger(MOTS.slice(debut, debut + 4), c.rnd).slice(0, 3).sort((a, b) => a[0].length - b[0].length);
    this.preparer();
  }
  get mot() { return this.mots[this.m][0]; }
  lettres() { return this.mot.split("").map((l, i) => ({ l, i })).filter((x) => x.l !== " "); }
  preparer() {
    const ls = this.lettres();
    let ordre = melanger(ls, this.c.rnd);
    if (ordre.map((x) => x.l).join("") === ls.map((x) => x.l).join("")) ordre = ordre.reverse();
    this.tuiles = ordre.map((x, k) => ({ l: x.l, x: this.L / 2, y: this.H + 50, tx: 0, ty: 0, place: -1, i: k }));
    this.places = this.mot.split("").map(() => null);
    this.bravo = 0;
    this.disposer();
    this.c.hud({ score: this.score, objectif: `${this.m + 1}/3 mots` });
  }
  get t() { return Math.min(56, (this.L * 0.9) / Math.max(7, this.mot.length)); }
  disposer() {
    const t = this.t, n = this.mot.length;
    const x0 = (this.L - n * (t + 6)) / 2;
    this.slots = this.mot.split("").map((_, k) => ({ x: x0 + k * (t + 6), y: this.H * 0.5, w: t, h: t * 1.1 }));
    const libres = this.tuiles.filter((x) => x.place < 0);
    const parLigne = Math.min(7, this.tuiles.length), tl = t * 1.05;
    this.tuiles.forEach((tu, k) => {
      if (tu.place >= 0) { const s = this.slots[tu.place]; tu.tx = s.x + s.w / 2; tu.ty = s.y + s.h / 2; return; }
      const j = libres.indexOf(tu), lg = Math.floor(j / parLigne), col = j % parLigne;
      const nbL = Math.min(parLigne, libres.length - lg * parLigne);
      tu.tx = (this.L - nbL * (tl + 8)) / 2 + col * (tl + 8) + tl / 2; tu.ty = this.H * 0.68 + lg * (tl + 12);
      void k;
    });
    this.btnAide.x = this.L / 2 - this.btnAide.w / 2; this.btnAide.y = this.H - 70;
  }
  slots: { x: number; y: number; w: number; h: number }[] = [];
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.fini || this.bravo > 0) return;
    if (dans(x, y, this.btnAide)) { this.btnAide.appui = 1; this.indice(); return; }
    const t = this.t;
    const tu = this.tuiles.find((tu) => Math.abs(tu.x - x) < t * 0.55 && Math.abs(tu.y - y) < t * 0.6);
    if (!tu) return;
    this.c.sons.clic();
    if (tu.place >= 0) { this.places[tu.place] = null; tu.place = -1; }
    else {
      const k = this.places.findIndex((p, i) => p === null && this.mot[i] !== " ");
      if (k < 0) return;
      this.places[k] = tu.i; tu.place = k;
    }
    this.disposer(); this.verifier();
  }
  up() { this.btnAide.appui = 0; }
  indice() {
    // place la prochaine bonne lettre
    const k = this.mot.split("").findIndex((l, i) => l !== " " && (this.places[i] === null || this.tuiles.find((t) => t.i === this.places[i])!.l !== l));
    if (k < 0) return;
    const occupant = this.tuiles.find((t) => t.place === k); if (occupant) { occupant.place = -1; this.places[k] = null; }
    const tu = this.tuiles.find((t) => t.place < 0 && t.l === this.mot[k]); if (!tu) return;
    tu.place = k; this.places[k] = tu.i; this.aides++; this.c.sons.pop(3);
    this.disposer(); this.verifier();
  }
  verifier() {
    const plein = this.mot.split("").every((l, i) => l === " " || this.places[i] !== null);
    if (!plein) return;
    const ecrit = this.mot.split("").map((l, i) => (l === " " ? " " : this.tuiles.find((t) => t.i === this.places[i])!.l)).join("");
    if (ecrit === this.mot) {
      const gain = Math.max(20, 40 + this.mot.length * 10 - this.aides * 15);
      this.score += gain; this.bravo = 1.4; this.c.sons.bon();
      this.c.fx.etoiles(this.L / 2, this.H * 0.5, 24); this.c.fx.texte(`+${gain}`, this.L / 2, this.H * 0.42, "#ffe066", 32);
    } else { this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.2); this.c.fx.texte("Pas tout à fait…", this.L / 2, this.H * 0.42, "#ffb0a0", 24); }
    this.c.hud({ score: this.score, objectif: `${this.m + 1}/3 mots` });
  }
  maj(dt: number) {
    this.temps += dt;
    for (const tu of this.tuiles) { tu.x += (tu.tx - tu.x) * Math.min(1, dt * 14); tu.y += (tu.ty - tu.y) * Math.min(1, dt * 14); }
    if (this.bravo > 0) {
      this.bravo -= dt;
      if (this.bravo <= 0) {
        this.m++;
        if (this.m >= this.mots.length) { this.fini = true; const e = this.aides === 0 ? 3 : this.aides <= 2 ? 2 : 1; this.c.fin({ gagne: true, score: this.score, etoiles: e }); return; }
        this.aides = 0; this.preparer();
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const id = this.mots[this.m][1];
    const ti = Math.min(this.H * 0.26, 200);
    ctx.save(); ctx.fillStyle = "rgba(255,250,235,0.85)"; ctx.beginPath(); ctx.arc(this.L / 2, this.H * 0.27, ti * 0.62, 0, 7); ctx.fill(); ctx.restore();
    sprite(ctx, this.c.img(id), this.L / 2, this.H * 0.27, ti * (1 + Math.sin(this.temps * 2) * 0.02), Math.sin(this.temps) * 0.05);
    const t = this.t;
    this.slots.forEach((s, i) => { if (this.mot[i] === " ") return; ctx.fillStyle = this.bravo > 0 ? "rgba(120,220,120,0.5)" : "rgba(0,0,0,0.25)"; arrondi(ctx, s.x, s.y, s.w, s.h, 10); ctx.fill(); });
    for (const tu of this.tuiles) {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#fff4d6"; arrondi(ctx, tu.x - t / 2, tu.y - t * 0.55, t, t * 1.1, 10); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#5a3412"; ctx.font = `800 ${t * 0.6}px Nunito, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(tu.l, tu.x, tu.y + 2);
    }
    dessinerBouton(ctx, this.btnAide, this.temps);
    texteContour(ctx, "Touche les lettres dans l'ordre", this.L / 2, this.H * 0.5 - 30, 16, "#fff");
  }
}

const def: DefJeu = {
  id: "let-melanze",
  titre: "Lèt mélanzé",
  accroche: "Les lettres sont mélangées : retrouve le nom du fruit ou du légume !",
  regles: ["Regarde l'image, puis touche les lettres dans le bon ordre.", "Touche une lettre placée pour la retirer.", "Le bouton Indice place une bonne lettre, mais rapporte moins de points.", "Trois mots par niveau, de plus en plus longs."],
  niveaux: 12,
  theme: THEMES.marche,
  creer: (c, n) => new LetMelanze(c, n),
};
export default def;
