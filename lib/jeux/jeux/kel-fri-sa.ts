// Kel fri sa ? : un fruit se dévoile peu à peu ; il faut le reconnaître le plus vite possible.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { PRODUITS, type Produit } from "../commun/produits";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";

type Mode = "cases" | "zoom" | "ombre";

class KelFriSa implements Jeu {
  L: number; H: number;
  temps = 0; score = 0; coeurs = 3; fini = false;
  questions: Produit[]; q = 0;
  mode: Mode = "cases";
  revele = 0;             // 0 → 1 au fil de la question
  duree: number;
  cases: number[] = [];   // ordre de disparition des cases
  boutons: (Bouton & { id: string })[] = [];
  reponse: { ok: boolean; t: number } | null = null;
  serie = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.questions = melanger(PRODUITS, c.rnd).slice(0, 6);
    this.duree = Math.max(5, 10 - niveau * 0.3);
    this.preparer();
  }
  get cadre() { const t = Math.min(this.L * 0.62, this.H * 0.4, 320); return { x: this.L / 2 - t / 2, y: this.H * 0.15, t }; }
  preparer() {
    const modes: Mode[] = this.niveau <= 3 ? ["cases"] : this.niveau <= 7 ? ["cases", "ombre"] : ["cases", "zoom", "ombre"];
    this.mode = modes[Math.floor(this.c.rnd() * modes.length)];
    this.revele = 0; this.reponse = null;
    this.cases = melanger(Array.from({ length: 36 }, (_, i) => i), this.c.rnd);
    const bonne = this.questions[this.q];
    const autres = melanger(PRODUITS.filter((p) => p.id !== bonne.id), this.c.rnd).slice(0, 3);
    const choix = melanger([bonne, ...autres], this.c.rnd);
    this.boutons = choix.map((p) => ({ id: p.id, x: 0, y: 0, w: 0, h: 54, texte: p.nom, actif: true, appui: 0, couleur: "#6a4ab0" }));
    this.disposer();
    this.c.hud({ score: this.score, objectif: `${this.q + 1}/6`, info: "❤".repeat(this.coeurs) + "♡".repeat(3 - this.coeurs) });
  }
  disposer() {
    const w = Math.min(this.L * 0.44, 230), y0 = this.cadre.y + this.cadre.t + 30;
    this.boutons.forEach((b, i) => { b.w = w; b.x = this.L / 2 + (i % 2 ? 8 : -w - 8); b.y = y0 + Math.floor(i / 2) * 68; });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.reponse || this.fini) return;
    const b = this.boutons.find((b) => dans(x, y, b)); if (!b) return;
    b.appui = 1;
    const ok = b.id === this.questions[this.q].id;
    this.reponse = { ok, t: 1.3 };
    const C = this.cadre;
    if (ok) {
      this.serie++;
      const gain = Math.round(100 * (1 - this.revele * 0.7)) + this.serie * 10;
      this.score += gain;
      this.c.sons.bon(); this.c.fx.etoiles(this.L / 2, C.y + C.t / 2, 26);
      this.c.fx.texte(`+${gain}`, this.L / 2, C.y + C.t / 2, "#ffe066", 36);
      b.couleur = "#3aa85a";
    } else {
      this.serie = 0; this.coeurs--; this.c.sons.mauvais(); this.c.fx.secouer(0.25);
      b.couleur = "#c8361d";
      const bonne = this.boutons.find((x) => x.id === this.questions[this.q].id); if (bonne) bonne.couleur = "#3aa85a";
    }
  }
  up() { for (const b of this.boutons) b.appui = 0; }
  maj(dt: number) {
    if (this.fini) return;
    this.temps += dt;
    if (!this.reponse) {
      this.revele = Math.min(1, this.revele + dt / this.duree);
      if (this.revele >= 1) { this.reponse = { ok: false, t: 1.3 }; this.coeurs--; this.serie = 0; this.c.sons.mauvais(); const bonne = this.boutons.find((x) => x.id === this.questions[this.q].id); if (bonne) bonne.couleur = "#3aa85a"; }
    } else {
      this.reponse.t -= dt;
      if (this.reponse.t <= 0) {
        if (this.coeurs <= 0) { this.fini = true; this.c.fin({ gagne: false, score: this.score, etoiles: 0 }); return; }
        this.q++;
        if (this.q >= this.questions.length) { this.fini = true; this.c.fin({ gagne: true, score: this.score, etoiles: this.coeurs }); return; }
        this.preparer();
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const C = this.cadre, p = this.questions[this.q];
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 18; ctx.fillStyle = "#fffaf0"; arrondi(ctx, C.x - 10, C.y - 10, C.t + 20, C.t + 20, 22); ctx.fill();
    ctx.restore();
    ctx.save(); arrondi(ctx, C.x, C.y, C.t, C.t, 14); ctx.clip();
    ctx.fillStyle = "#f3ecdc"; ctx.fillRect(C.x, C.y, C.t, C.t);
    const fini = !!this.reponse;
    const im = this.c.img(p.id);
    if (this.mode === "zoom" && !fini) {
      const z = 1 + (1 - this.revele) * 5;
      sprite(ctx, im, C.x + C.t / 2, C.y + C.t / 2, C.t * 0.9 * z, 0, 1, false);
    } else if (this.mode === "ombre" && !fini) {
      sprite(ctx, im, C.x + C.t / 2, C.y + C.t / 2, C.t * 0.9, 0, 1, false);
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = `rgba(30,20,40,${1 - this.revele * 0.9})`; ctx.fillRect(C.x, C.y, C.t, C.t);
      ctx.globalCompositeOperation = "source-over";
    } else {
      sprite(ctx, im, C.x + C.t / 2, C.y + C.t / 2, C.t * 0.9, 0, 1, false);
      if (!fini) {
        const visibles = Math.floor(this.revele * 36 * 1.05);
        const s = C.t / 6;
        for (let i = visibles; i < 36; i++) { const k = this.cases[i]; ctx.fillStyle = (k + Math.floor(k / 6)) % 2 ? "#6a4ab0" : "#7d5cc8"; ctx.fillRect(C.x + (k % 6) * s, C.y + Math.floor(k / 6) * s, s + 1, s + 1); }
      }
    }
    ctx.restore();
    if (fini) texteContour(ctx, p.nom, this.L / 2, C.y + C.t + 6, 22, this.reponse!.ok ? "#9cff9c" : "#ffd0c0");
    const libelle = { cases: "Les cases s'envolent…", zoom: "Le zoom recule…", ombre: "L'ombre s'éclaire…" }[this.mode];
    if (!fini) texteContour(ctx, libelle, this.L / 2, C.y - 26, 16, "#fff");
    for (const b of this.boutons) dessinerBouton(ctx, b, this.temps);
  }
}

const def: DefJeu = {
  id: "kel-fri-sa",
  titre: "Kel fri sa ?",
  accroche: "Un fruit se cache derrière les cases. Reconnais-le avant les autres !",
  regles: ["L'image se dévoile petit à petit.", "Touche le bon nom le plus vite possible : plus tu es rapide, plus tu gagnes.", "Trois erreurs et la partie s'arrête.", "Six fruits à trouver par niveau."],
  niveaux: 15,
  theme: THEMES.coucher,
  creer: (c, n) => new KelFriSa(c, n),
};
export default def;
