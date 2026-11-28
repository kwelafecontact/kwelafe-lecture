// Kel fri sa ? (refonte KwFX v4.1) : c'est le joueur qui dévoile le fruit. Moins il dévoile, plus il gagne.
// Inventions péi : la brume des Hauts qu'on essuie du doigt (trankil) ; la nuit, une luciole lanterne qu'on guide et dont la lumière s'épuise (problèm).
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour, melanger } from "../commun/moteur2d";
import { photosNommees, couleurDe } from "../commun/photos";
import { Combo, Choix, Guide, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

type Produit = { id: string; nom?: string };
const G = 12;   // grille de brume

class KelFriSa implements Jeu {
  L: number; H: number; pb: boolean;
  temps = 0; score = 0; coeurs = 3; fini = false; bonnes = 0;
  questions: Produit[]; q = 0;
  brume: number[] = []; energie = 1; doigt: { x: number; y: number } | null = null; lampe: any = null;
  boutons: (Btn & { id: string; texte: string; etat: 0 | 1 | 2; cache: boolean })[] = [];
  reponse: { ok: boolean; t: number } | null = null;
  moitie = 0; double = false; choixFait = false;
  combo: Combo; choix: Choix; guide: Guide;
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    this.questions = melanger(photosNommees(), c.rnd).slice(0, 6);
    this.combo = new Combo(c, 4); this.choix = new Choix(c); this.guide = new Guide(c.niveau === 1);
    this.preparer();
  }
  get cadre() { const t = Math.min(this.L * 0.7, this.H * 0.38, 340); return { x: this.L / 2 - t / 2, y: Math.max(132, this.H * 0.17), t }; }
  get decouvert() { return this.brume.reduce((s, v) => s + (1 - v), 0) / (G * G); }
  get mise() { return Math.max(20, Math.round(150 * (this.pb ? this.energie : 1 - this.decouvert))); }
  preparer() {
    this.reponse = null; this.brume = new Array(G * G).fill(1); this.energie = 1; this.doigt = null;
    const bonne = this.questions[this.q];
    const autres = melanger(photosNommees().filter((p) => p.id !== bonne.id && p.nom !== bonne.nom), this.c.rnd).slice(0, 3);
    const liste = melanger([bonne, ...autres], this.c.rnd);
    this.boutons = liste.map((p) => ({ id: p.id, texte: p.nom!, x: 0, y: 0, w: 0, h: 0, etat: 0, cache: false }));
    if (this.moitie > 0) { this.moitie--; melanger(this.boutons.filter((b) => b.id !== bonne.id), this.c.rnd).slice(0, 2).forEach((b) => (b.cache = true)); }
    this.disposer(); this.hud();
    const C = this.cadre;
    this.guide.dire("essuie", this.pb ? "Pose le doigt sur l'image : la luciole éclaire un petit rond. Sa lumière s'épuise." : "Essuie la brume avec ton doigt. Moins tu en enlèves, plus tu gagnes.", { x: C.x + C.t / 2, y: C.y + C.t / 2 });
  }
  hud() { this.c.hud({ score: this.score, objectif: `${this.q + 1}/6${this.pb ? " · " + "🧡".repeat(this.coeurs) : ""}`, info: `Cette réponse vaut ${this.mise * (this.double ? 2 : 1)} points` }); }
  disposer() {
    const m = marge(this.L, this.H), C = this.cadre, w = Math.min((this.L - m * 2 - 12) / 2, 240), h = Math.max(56, Math.min(68, this.H * 0.085));
    const y0 = Math.min(C.y + C.t + 40, this.H - m - h * 2 - 22);
    this.boutons.forEach((b, i) => { b.w = w; b.h = h; b.x = this.L / 2 + (i % 2 ? 6 : -w - 6); b.y = y0 + Math.floor(i / 2) * (h + 12); });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  dansCadre(x: number, y: number) { const C = this.cadre; return x >= C.x && x <= C.x + C.t && y >= C.y && y <= C.y + C.t; }
  essuyer(x: number, y: number) {
    if (this.reponse) return;
    const C = this.cadre; this.doigt = { x, y }; this.guide.fait();
    if (this.pb) return;
    const gx = (x - C.x) / C.t * G, gy = (y - C.y) / C.t * G, avant = this.mise;
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) { const d = Math.hypot(i + 0.5 - gx, j + 0.5 - gy); if (d < 1.7) this.brume[j * G + i] = Math.min(this.brume[j * G + i], Math.max(0, (d - 0.7))); }
    if (this.mise !== avant) this.hud();
  }
  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H) || this.reponse) return;
    if (this.dansCadre(x, y)) { this.essuyer(x, y); return; }
    const b = this.boutons.find((b) => !b.cache && dansBtn(x, y, b)); if (!b) return;
    const ok = b.id === this.questions[this.q].id, C = this.cadre, cx = this.L / 2, cy = C.y + C.t / 2;
    this.reponse = { ok, t: 1.5 }; this.doigt = null;
    if (ok) {
      b.etat = 1; this.bonnes++;
      this.score += this.combo.bon(cx, cy, this.mise * (this.double ? 2 : 1), couleurDe(b.id), "trouve");
      if (this.mise >= 120) this.c.kw.onoma("OTÉ !", cx, cy, 0.8);
    } else {
      b.etat = 2; if (this.pb) this.coeurs--;
      this.combo.rate(b.x + b.w / 2, b.y + b.h / 2);
      const bonne = this.boutons.find((o) => o.id === this.questions[this.q].id); if (bonne) bonne.etat = 1;
      this.c.fx.texte("C'était : " + this.questions[this.q].nom, cx, C.y - 16, "#fff", 20);
    }
    this.double = false; this.hud();
  }
  move(x: number, y: number) { if (this.dansCadre(x, y)) this.essuyer(x, y); else this.doigt = null; }
  up() { this.doigt = null; }
  suivant() {
    this.q++;
    if (this.q >= 6 || (this.pb && this.coeurs <= 0)) {
      this.fini = true; this.lampe?.eteindre(300);
      const gagne = this.bonnes >= 3 && (!this.pb || this.coeurs > 0);
      this.c.fin({ gagne, score: this.score, etoiles: !gagne ? 0 : this.bonnes >= 6 ? 3 : this.bonnes >= 5 ? 2 : 1, lignes: [`${this.bonnes} fruits reconnus sur 6`] });
      return;
    }
    if (!this.choixFait && this.q === 3) {
      this.choixFait = true;
      this.choix.proposer([{ id: "moitie", ic: "✂️", nom: "Deux réponses en moins", txt: "Pour les deux prochains fruits, il ne reste que deux choix." }, { id: "double", ic: "✖️", nom: "Points doublés", txt: "Le prochain fruit compte double." }],
        (id) => { if (id === "moitie") { this.moitie = 1; melanger(this.boutons.filter((b) => b.id !== this.questions[this.q].id), this.c.rnd).slice(0, 2).forEach((b) => (b.cache = true)); } else this.double = true; this.hud(); });
    }
    this.c.kw.joue("feuilles", this.L / 2, this.cadre.y, { intensite: 0.4 });
    this.preparer();
  }
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.combo.maj(dt);
    if (this.reponse) { this.reponse.t -= dt; for (let i = 0; i < this.brume.length; i++) this.brume[i] = Math.max(0, this.brume[i] - dt * 3); if (this.reponse.t <= 0) this.suivant(); return; }
    if (this.pb) {
      if (this.doigt && this.energie > 0) {
        const avant = this.mise; this.energie = Math.max(0, this.energie - dt / 4.5);
        if (!this.lampe) this.lampe = this.c.kw.lampe(this.doigt.x, this.doigt.y, { couleur: "#D8FF6A", rayon: this.cadre.t * 0.4, scintille: 0.35 }); else this.lampe.deplacer(this.doigt.x, this.doigt.y);
        if (this.mise !== avant) this.hud();
      } else if (this.lampe) { this.lampe.eteindre(250); this.lampe = null; }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const C = this.cadre, bonne = this.questions[this.q];
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 18; ctx.fillStyle = this.pb ? "#1B2440" : "#FFF8EA"; arrondi(ctx, C.x - 8, C.y - 8, C.t + 16, C.t + 16, 24); ctx.fill(); ctx.restore();
    ctx.save(); arrondi(ctx, C.x, C.y, C.t, C.t, 18); ctx.clip();
    ctx.fillStyle = "#FFF8EA"; ctx.fillRect(C.x, C.y, C.t, C.t);
    if (bonne) sprite(ctx, this.c.img(bonne.id), C.x + C.t / 2, C.y + C.t / 2, C.t * 0.86, 0, 1, false);
    if (this.pb) {
      // nuit : seul le rond de la luciole est éclairé
      const a = this.reponse ? Math.max(0, this.reponse.t - 0.9) / 0.6 : 1;
      if (a > 0) {
        if (this.doigt && this.energie > 0 && !this.reponse) {
          const r = C.t * 0.2, g = ctx.createRadialGradient(this.doigt.x, this.doigt.y, r * 0.3, this.doigt.x, this.doigt.y, r);
          g.addColorStop(0, "rgba(10,16,34,0)"); g.addColorStop(1, `rgba(10,16,34,${0.98 * a})`);
          ctx.fillStyle = g; ctx.fillRect(C.x, C.y, C.t, C.t);
          ctx.fillStyle = "rgba(240,255,150,0.95)"; ctx.beginPath(); ctx.arc(this.doigt.x + Math.sin(this.temps * 9) * 5, this.doigt.y - r * 0.5 + Math.cos(this.temps * 7) * 4, 4, 0, 7); ctx.fill();
        } else { ctx.fillStyle = `rgba(10,16,34,${0.98 * a})`; ctx.fillRect(C.x, C.y, C.t, C.t); }
      }
    } else {
      const cell = C.t / G;
      for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const v = this.brume[j * G + i]; if (v > 0.01) { ctx.fillStyle = `rgba(234,242,245,${Math.min(1, v)})`; ctx.fillRect(C.x + i * cell - 0.5, C.y + j * cell - 0.5, cell + 1, cell + 1); } }
      if (!this.reponse) for (let k = 0; k < 4; k++) { const x = C.x + (((k * 0.31 + this.temps * 0.04) % 1)) * C.t, y = C.y + ((k * 0.57) % 1) * C.t, g = ctx.createRadialGradient(x, y, 0, x, y, C.t * 0.4); g.addColorStop(0, `rgba(255,255,255,${0.22 * (1 - this.decouvert)})`); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(C.x, C.y, C.t, C.t); }
    }
    ctx.restore();
    // réserve de lumière ou de brume = ce que vaut la réponse
    const v = this.pb ? this.energie : 1 - this.decouvert, jy = C.y + C.t + 14;
    ctx.fillStyle = "rgba(40,20,10,0.6)"; arrondi(ctx, C.x, jy, C.t, 12, 6); ctx.fill();
    ctx.fillStyle = this.pb ? "#D8FF6A" : "#BFF3FF"; arrondi(ctx, C.x, jy, Math.max(10, C.t * v), 12, 6); ctx.fill();
    for (const b of this.boutons) { if (b.cache) continue; bouton(ctx, b, b.texte, b.etat === 1 ? "#3aa85a" : b.etat === 2 ? "#B8674A" : "#6A4AB0"); }
    this.combo.dessiner(ctx, this.L / 2, Math.max(96, this.H * 0.118));
    this.guide.dessiner(ctx, this.L, this.H, this.temps, C.y + C.t * 0.72);
    this.choix.dessiner(ctx, this.L, this.H);
  }
}

const def: DefJeu = {
  id: "kel-fri-sa", titre: "Kel fri sa ?", accroche: "Devine le fruit en dévoilant le moins possible.",
  regles: [], niveaux: 15, theme: THEMES.nuit, visuels: "photos",
  modes: {
    trankil: ["Essuie la brume des Hauts avec ton doigt.", "Touche le nom du fruit dès que tu le reconnais.", "Moins tu enlèves de brume, plus la réponse rapporte."],
    probleme: ["Il fait nuit : guide la luciole avec ton doigt, elle éclaire un petit rond.", "Sa lumière s'épuise : ce qu'il en reste, ce sont tes points.", "Trois erreurs et la partie s'arrête."],
  },
  decor: { lieu: "hauts", heure: "jour" }, themeFx: "flore",
  nuit: (mode) => (mode === "probleme" ? 0.6 : 0.05),
  creer: (c) => new KelFriSa(c),
};
export default def;
