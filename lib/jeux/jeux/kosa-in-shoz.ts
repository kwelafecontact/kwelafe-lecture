// Kosa in shoz ? : les sirandanes contre la montre (devinettes du livre Kwélafé Production).
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger } from "../commun/moteur2d";
import { jauge } from "../commun/dessins";
import { paragraphe, panneau, dessinerTuile, dansTuile, type Tuile } from "../commun/texte";
import D from "../serie2/donnees";

const PAR_NIVEAU = 7;
const SIR = D.sirandanes;
const libelle = (s: (typeof SIR)[number]) => (s.rep ? `${s.rep} (${s.repFr})` : s.repFr[0].toUpperCase() + s.repFr.slice(1));

class Kosa implements Jeu {
  L: number; H: number;
  liste: (typeof SIR)[number][]; q = 0;
  tuiles: Tuile[] = []; bonne = 0;
  temps = 0; limite = 14; reste = 14;
  reponse: { ok: boolean; t: number } | null = null;
  score = 0; justes = 0; serie = 0; fini = false;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.liste = SIR.slice((niveau - 1) * PAR_NIVEAU, niveau * PAR_NIVEAU);
    this.preparer();
  }
  preparer() {
    const s = this.liste[this.q];
    const autres = melanger(SIR.filter((x) => x.repFr !== s.repFr), this.c.rnd).slice(0, 2).map(libelle);
    const choix = melanger([libelle(s), ...autres], this.c.rnd);
    this.bonne = choix.indexOf(libelle(s));
    this.tuiles = choix.map((texte) => ({ x: 0, y: 0, w: 0, h: 0, texte, etat: "", appui: 0 }));
    this.limite = this.reste = s.q.length < 60 ? 14 : s.q.length < 110 ? 18 : 22;
    this.reponse = null;
    this.disposer(); this.hud();
  }
  hud() { this.c.hud({ score: this.score, objectif: `${this.q + 1}/${this.liste.length}`, info: this.serie >= 3 ? `Série ×${this.serie >= 6 ? 3 : 2}` : undefined }); }
  get zone() { const w = Math.min(this.L - 40, 560); return { x: (this.L - w) / 2, w }; }
  disposer() {
    const { x, w } = this.zone, h = Math.min(74, this.H * 0.1), y0 = this.H * 0.56;
    this.tuiles.forEach((t, i) => Object.assign(t, { x, y: y0 + i * (h + 12), w, h }));
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.reponse || this.fini) return;
    const i = this.tuiles.findIndex((t) => dansTuile(x, y, t)); if (i < 0) return;
    this.tuiles[i].appui = 1;
    this.repondre(i);
  }
  up() { for (const t of this.tuiles) t.appui = 0; }
  repondre(i: number) {
    const ok = i === this.bonne;
    this.reponse = { ok, t: 2.2 };
    this.tuiles[this.bonne].etat = "bon";
    if (ok) {
      this.serie++; this.justes++;
      const mult = this.serie >= 6 ? 3 : this.serie >= 3 ? 2 : 1;
      const gain = Math.round((50 + 100 * (this.reste / this.limite)) * mult);
      this.score += gain;
      const t = this.tuiles[i];
      this.c.sons.bon(); this.c.fx.etoiles(t.x + t.w / 2, t.y + t.h / 2, 22);
      this.c.fx.texte(`+${gain}`, t.x + t.w / 2, t.y - 10, "#ffe066", 30);
      if (mult > 1) this.c.sons.combo(this.serie);
    } else {
      this.serie = 0; this.c.sons.mauvais(); this.c.fx.secouer(0.25);
      if (i >= 0) this.tuiles[i].etat = "faux";
    }
    this.hud();
  }
  maj(dt: number) {
    if (this.fini) return;
    this.temps += dt;
    if (!this.reponse) {
      const avant = Math.ceil(this.reste);
      this.reste -= dt;
      if (Math.ceil(this.reste) !== avant && this.reste < 4 && this.reste > 0) this.c.sons.tic();
      if (this.reste <= 0) { this.reste = 0; this.repondre(-1); }
      return;
    }
    this.reponse.t -= dt;
    if (this.reponse.t <= 0) {
      this.q++;
      if (this.q >= this.liste.length) {
        this.fini = true;
        const n = this.liste.length, e = this.justes >= n ? 3 : this.justes >= n - 2 ? 2 : this.justes >= Math.ceil(n / 2) ? 1 : 0;
        this.c.fin({ gagne: e > 0, score: this.score, etoiles: e });
        return;
      }
      this.preparer();
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const s = this.liste[this.q]; if (!s) return;
    const { x, w } = this.zone, y = this.H * 0.12, h = this.H * 0.4;
    panneau(ctx, x, y, w, h);
    ctx.font = "800 15px Nunito, sans-serif"; ctx.fillStyle = "#9a5a2a"; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillText("KOSA IN SHOZ ?", this.L / 2, y + 14);
    const hq = paragraphe(ctx, s.q, this.L / 2, y + 40, w - 40, 24, "#3a2412", "center", 800, h * 0.55);
    if (s.fr) paragraphe(ctx, s.fr, this.L / 2, y + 52 + hq, w - 50, 16, "#7a5a3a", "center", 600, h - hq - 70);
    if (this.reponse) {
      ctx.fillStyle = this.reponse.ok ? "#2e8a4a" : "#b8361d";
      paragraphe(ctx, (this.reponse.ok ? "Bravo ! " : "C'était : ") + s.repFr, this.L / 2, y + h - 34, w - 40, 18, this.reponse.ok ? "#2e8a4a" : "#b8361d");
    } else jauge(ctx, x + 20, y + h - 26, w - 40, 12, this.reste / this.limite);
    for (const t of this.tuiles) dessinerTuile(ctx, t, 18);
  }
}

const def: DefJeu = {
  id: "kosa-in-shoz",
  titre: "Kosa in shoz ?",
  accroche: "Les sirandanes de La Réunion, contre la montre !",
  regles: ["Lis la sirandane, puis touche la bonne réponse parmi les trois.", "Plus tu réponds vite, plus tu gagnes de points.", "Trois bonnes réponses de suite : points doublés ; six : triplés !", "Sept sirandanes par niveau."],
  niveaux: Math.ceil(SIR.length / PAR_NIVEAU),
  theme: THEMES.coucher,
  creer: (c, n) => new Kosa(c, n),
};
export default def;
