// Le cari parfait : choisir les bons ingrédients, puis suivre les étapes dans l'ordre, sans que ça attache.
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger, sprite } from "../commun/moteur2d";
import { paragraphe, panneau, dessinerTuile, dansTuile, type Tuile } from "../commun/texte";
import D from "../serie2/donnees";

class Cari implements Jeu {
  L: number; H: number;
  r: (typeof D.recettes)[number];
  phase: "panier" | "etapes" | "fin" = "panier";
  tuiles: Tuile[] = []; restants = 0; prochaine = 0;
  erreurs = 0; score = 0; fini = false; temps = 0; attente = 0; vapeur = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.r = D.recettes[niveau - 1];
    this.panier();
  }
  panier() {
    this.phase = "panier";
    const items = melanger([...this.r.bons.map((t) => ({ t, ok: 1 })), ...this.r.intrus.map((t) => ({ t, ok: 0 }))], this.c.rnd);
    this.tuiles = items.map((i) => ({ x: 0, y: 0, w: 0, h: 0, texte: i.t, etat: "", appui: 0, data: i.ok }));
    this.restants = this.r.bons.length;
    this.disposer(); this.hud();
  }
  etapes() {
    this.phase = "etapes";
    this.tuiles = melanger(this.r.etapes.map((t, i) => ({ x: 0, y: 0, w: 0, h: 0, texte: t, etat: "" as const, appui: 0, data: i })), this.c.rnd);
    this.prochaine = 0; this.disposer(); this.hud();
  }
  hud() { this.c.hud({ score: this.score, objectif: this.phase === "panier" ? `Panier : ${this.r.bons.length - this.restants}/${this.r.bons.length}` : `Étape ${Math.min(this.prochaine + 1, this.r.etapes.length)}/${this.r.etapes.length}`, info: "🔥".repeat(this.erreurs) + "·".repeat(Math.max(0, 3 - this.erreurs)) }); }
  disposer() {
    const y0 = this.H * 0.34, dispo = this.H - y0 - 20;
    if (this.phase === "panier") {
      const cols = this.L > 520 ? 3 : 2, n = this.tuiles.length, lignes = Math.ceil(n / cols);
      const w = Math.min((this.L - 30 - (cols - 1) * 10) / cols, 200), h = Math.min(56, dispo / lignes - 10);
      const x0 = (this.L - (w * cols + (cols - 1) * 10)) / 2;
      this.tuiles.forEach((t, i) => Object.assign(t, { x: x0 + (i % cols) * (w + 10), y: y0 + Math.floor(i / cols) * (h + 10), w, h }));
    } else {
      const w = Math.min(this.L - 30, 560), h = Math.min(64, dispo / this.tuiles.length - 8);
      this.tuiles.forEach((t, i) => Object.assign(t, { x: (this.L - w) / 2, y: y0 + i * (h + 8), w, h }));
    }
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  faute(t: Tuile) {
    t.etat = "faux"; setTimeout(() => { if (t.etat === "faux") t.etat = ""; }, 500);
    this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.25); this.hud();
    if (this.erreurs >= 3) {
      this.fini = true; this.c.fx.texte("I atash ! Le cari a attaché…", this.L / 2, this.H * 0.28, "#ffb0a0", 26);
      setTimeout(() => this.c.fin({ gagne: false, score: this.score, etoiles: 0 }), 1200);
    }
  }
  down(x: number, y: number) {
    if (this.fini || this.attente > 0) return;
    const t = this.tuiles.find((t) => dansTuile(x, y, t) && t.etat !== "fait" && t.etat !== "bon"); if (!t) return;
    t.appui = 1;
    if (this.phase === "panier") {
      if (t.data === 1) {
        t.etat = "bon"; this.restants--; this.score += 30; this.vapeur = 1;
        this.c.sons.plouf(); this.c.fx.gerbe(this.L / 2, this.H * 0.2, "#ffd65a", 8, 160, 1);
        if (this.restants === 0) { this.c.sons.bon(); this.c.fx.texte("Le panier est prêt !", this.L / 2, this.H * 0.28, "#ffe066", 24); this.attente = 1.2; }
      } else this.faute(t);
    } else {
      if (t.data === this.prochaine) {
        t.etat = "fait"; this.prochaine++; this.score += 40; this.vapeur = 1; this.c.sons.pop(this.prochaine);
        this.c.fx.etoiles(t.x + t.w / 2, t.y + t.h / 2, 10);
        if (this.prochaine >= this.r.etapes.length) { this.phase = "fin"; this.c.sons.victoire(); this.attente = 3.2; }
      } else this.faute(t);
    }
    this.hud();
  }
  up() { for (const t of this.tuiles) t.appui = 0; }
  maj(dt: number) {
    this.temps += dt; this.vapeur = Math.max(0, this.vapeur - dt * 0.6);
    if (this.attente > 0 && !this.fini) {
      this.attente -= dt;
      if (this.attente <= 0) {
        if (this.phase === "panier") this.etapes();
        else if (this.phase === "fin") { this.fini = true; this.c.fin({ gagne: true, score: this.score, etoiles: 3 - this.erreurs }); }
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const w = Math.min(this.L - 30, 560);
    panneau(ctx, (this.L - w) / 2, this.H * 0.07, w, this.H * 0.22);
    sprite(ctx, this.c.img("obj-marmit"), (this.L - w) / 2 + 60, this.H * 0.18, Math.min(100, this.H * 0.16));
    for (let i = 0; i < 3; i++) {
      const a = 0.25 + this.vapeur * 0.5;
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 4; ctx.beginPath();
      const bx = (this.L - w) / 2 + 40 + i * 20;
      for (let k = 0; k < 10; k++) ctx.lineTo(bx + Math.sin(this.temps * 3 + k * 0.8 + i) * 5, this.H * 0.12 - k * 4);
      ctx.stroke();
    }
    const tx = (this.L - w) / 2 + 130, tw = w - 145;
    paragraphe(ctx, this.r.nom, tx + tw / 2, this.H * 0.085, tw, 24, "#8a2a12");
    paragraphe(ctx, this.r.fr, tx + tw / 2, this.H * 0.085 + 32, tw, 16, "#7a5a3a", "center", 700);
    const consigne = this.phase === "panier" ? "Touche seulement les bons ingrédients" : this.phase === "etapes" ? "Touche les étapes dans le bon ordre" : this.r.conseil;
    paragraphe(ctx, consigne, tx + tw / 2, this.H * 0.085 + 60, tw, this.phase === "fin" ? 15 : 17, "#3a2412", "center", 800, this.H * 0.12);
    if (this.phase !== "fin") for (const t of this.tuiles) dessinerTuile(ctx, t, 16);
    else this.r.etapes.forEach((e, i) => paragraphe(ctx, `${i + 1}. ${e}`, this.L / 2, this.H * 0.34 + i * 34, w, 15, "#fff", "center", 700));
  }
}

const def: DefJeu = {
  id: "cari-parfait",
  titre: "Le cari parfait",
  accroche: "Cuisine les recettes péi sans que ça attache !",
  regles: ["D'abord, le panier : touche seulement les bons ingrédients.", "Ensuite, la marmite : touche les étapes dans le bon ordre.", "Trois erreurs, et « i atash » : le cari a attaché !", "Une recette par niveau. Chaque famille a sa façon de faire : ici, une version simple."],
  niveaux: D.recettes.length,
  theme: THEMES.marche,
  images: { "obj-marmit": "/jeux/lontan/obj-marmit.webp" },
  creer: (c, n) => new Cari(c, n),
};
export default def;
