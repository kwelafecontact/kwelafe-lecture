// Sur les traces des libres : frise de l'histoire de l'esclavage, de l'abolition et de la mémoire,
// et lieux du marronnage à relier à ce qu'ils rappellent. Faits vérifiés : voir serie3/memoire.ts.
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, dessinerTuile, dansTuile, POLICE, type Tuile } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";
import { EVENEMENTS, LIEUX_LIBRES, NIVEAUX_TRACES, type Evenement } from "../serie3/memoire";

const OR = "#e8b43a";

class Traces implements Jeu {
  L: number; H: number;
  type: "frise" | "lieux";
  // frise
  evs: Evenement[] = []; ordre: Evenement[] = []; cartes: Tuile[] = []; places = 0;
  lecture = -1;                       // index de l'événement dont on lit le savoir après la frise
  // lieux
  gauche: Tuile[] = []; droite: Tuile[] = []; choixG = -1; reliees = 0; info = "";
  erreurs = 0; score = 0; fini = false; temps = 0; attente = 0;
  suite: Bouton = { x: 0, y: 0, w: 220, h: 54, texte: "Continuer", actif: true, appui: 0, couleur: "#7a3a1a" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    const n = NIVEAUX_TRACES[(niveau - 1) % NIVEAUX_TRACES.length];
    this.type = n.type;
    if (n.type === "frise") {
      this.evs = n.ids.map((id) => EVENEMENTS[id]);
      this.ordre = [...this.evs].sort((a, b) => a.tri - b.tri);
      this.cartes = melanger(this.evs.map((e) => ({ x: 0, y: 0, w: 0, h: 0, texte: e.texte, etat: "" as const, appui: 0, data: this.ordre.indexOf(e) })), c.rnd);
    } else {
      const lx = n.idx.map((i) => LIEUX_LIBRES[i]);
      this.gauche = melanger(lx.map((l, i) => ({ x: 0, y: 0, w: 0, h: 0, texte: l.lieu, etat: "" as const, appui: 0, data: i })), c.rnd);
      this.droite = melanger(lx.map((l, i) => ({ x: 0, y: 0, w: 0, h: 0, texte: l.sens, etat: "" as const, appui: 0, data: i })), c.rnd);
      this.lx = lx;
    }
    this.disposer(); this.hud();
  }
  lx: typeof LIEUX_LIBRES = [];
  get total() { return this.type === "frise" ? this.evs.length : this.lx.length; }
  hud() {
    const fait = this.type === "frise" ? this.places : this.reliees;
    this.c.hud({ score: this.score, objectif: `${fait}/${this.total} ${this.type === "frise" ? "placés" : "reliés"}`, info: "✕".repeat(this.erreurs) + "·".repeat(Math.max(0, 3 - this.erreurs)) });
  }
  disposer() {
    const W = Math.min(this.L - 32, 620), x0 = (this.L - W) / 2;
    if (this.type === "frise") {
      const n = this.cartes.length, y0 = this.H * 0.4, dispo = this.H * 0.57;
      const h = Math.min(86, dispo / n - 10);
      this.cartes.forEach((t, i) => Object.assign(t, { x: x0, y: y0 + i * (h + 10), w: W, h }));
    } else {
      const marge = 12, w = (W - marge) / 2, n = this.gauche.length;
      const h = Math.min(104, (this.H * 0.52) / n - 10), y0 = this.H * 0.2;
      this.gauche.forEach((t, i) => Object.assign(t, { x: x0, y: y0 + i * (h + 10), w, h }));
      this.droite.forEach((t, i) => Object.assign(t, { x: x0 + w + marge, y: y0 + i * (h + 10), w, h }));
    }
    this.suite.x = this.L / 2 - this.suite.w / 2; this.suite.y = this.H - 84;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  faute() {
    this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.2); this.hud();
    if (this.erreurs >= 3) {
      this.fini = true;
      setTimeout(() => this.c.fin({ gagne: false, score: this.score, etoiles: 0, lignes: ["Pas grave : relis bien chaque carte et réessaie."] }), 700);
    }
  }
  down(x: number, y: number) {
    if (this.fini || this.attente > 0) return;
    if (this.type === "frise") {
      if (this.lecture >= 0) { if (dans(x, y, this.suite)) { this.suite.appui = 1; this.c.sons.clic(); this.lireSuivant(); } return; }
      const i = this.cartes.findIndex((t) => dansTuile(x, y, t) && t.etat !== "fait" && t.etat !== "bon");
      if (i < 0) return;
      const t = this.cartes[i];
      if (t.data === this.places) {
        t.etat = "bon"; this.places++; this.score += 100 + (this.erreurs === 0 ? 20 : 0);
        this.c.sons.pop(this.places); this.c.fx.etoiles(t.x + t.w / 2, t.y + t.h / 2, 12);
        const [sx, sy] = this.posCreneau(this.places - 1); this.c.fx.texte(this.ordre[this.places - 1].date, sx, sy - 26, "#ffe9a8", 18);
        setTimeout(() => { if (t.etat === "bon") t.etat = "fait"; }, 450);
        if (this.places === this.evs.length) { this.c.sons.bon(); this.attente = 0.9; }
      } else { t.etat = "faux"; setTimeout(() => { if (t.etat === "faux") t.etat = ""; }, 450); this.faute(); }
      this.hud();
      return;
    }
    // lieux
    if (this.reliees === this.lx.length) { if (dans(x, y, this.suite)) { this.suite.appui = 1; this.terminer(); } return; }
    const g = this.gauche.findIndex((t) => dansTuile(x, y, t) && t.etat !== "fait");
    if (g >= 0) { this.gauche.forEach((t) => t.etat === "choisi" && (t.etat = "")); this.gauche[g].etat = "choisi"; this.choixG = g; this.c.sons.clic(); return; }
    const d = this.droite.findIndex((t) => dansTuile(x, y, t) && t.etat !== "fait");
    if (d < 0 || this.choixG < 0) return;
    const tg = this.gauche[this.choixG], td = this.droite[d];
    if (tg.data === td.data) {
      tg.etat = td.etat = "bon"; this.reliees++; this.score += 120;
      this.info = this.lx[tg.data!].savoir;
      this.c.sons.bon(); this.c.fx.etoiles(td.x + td.w / 2, td.y + td.h / 2, 14);
      setTimeout(() => { tg.etat = td.etat = "fait"; }, 500);
      this.choixG = -1;
    } else { td.etat = "faux"; setTimeout(() => { if (td.etat === "faux") td.etat = ""; }, 500); this.faute(); }
    this.hud();
  }
  up() { this.suite.appui = 0; }
  lireSuivant() {
    this.lecture++;
    if (this.lecture >= this.ordre.length) this.terminer();
  }
  terminer() {
    if (this.fini) return;
    this.fini = true;
    const e = this.erreurs === 0 ? 3 : this.erreurs === 1 ? 2 : 1;
    const savoir = this.type === "frise"
      ? { titre: "Pour retenir", texte: this.ordre.map((v) => `${v.date} : ${v.texte}`).join("\n") }
      : { titre: "Les noms de la liberté", texte: "Les marrons ont laissé leurs noms aux montagnes de l'île. Les prononcer, c'est garder vivante la mémoire de ceux qui ont choisi la liberté." };
    this.c.fin({ gagne: true, score: this.score, etoiles: e, savoir });
  }
  maj(dt: number) {
    this.temps += dt;
    if (this.attente > 0) { this.attente -= dt; if (this.attente <= 0 && this.type === "frise") this.lecture = 0; }
  }
  /** Position du créneau i sur la frise. */
  posCreneau(i: number): [number, number] {
    const n = this.evs.length, W = Math.min(this.L - 60, 600), x0 = (this.L - W) / 2;
    return [x0 + (n === 1 ? W / 2 : (i * W) / (n - 1)), this.H * 0.29];
  }
  dessinerFrise(ctx: CanvasRenderingContext2D) {
    const n = this.evs.length, W = Math.min(this.L - 60, 600), x0 = (this.L - W) / 2, y = this.H * 0.29;
    panneau(ctx, x0 - 22, this.H * 0.16, W + 44, this.H * 0.21, "rgba(255,248,232,0.96)");
    paragraphe(ctx, this.lecture >= 0 ? "Bravo ! Découvre chaque date" : "Touche les cartes de la plus ancienne à la plus récente", this.L / 2, this.H * 0.172, W, 16, "#7a3a1a", "center", 800, 44);
    ctx.strokeStyle = "#7a3a1a"; ctx.lineWidth = 4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + W, y); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const [cx] = this.posCreneau(i), plein = i < this.places, lu = i === this.lecture;
      ctx.fillStyle = plein ? OR : "#fff"; ctx.strokeStyle = "#7a3a1a"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, y, lu ? 14 + Math.sin(this.temps * 6) * 2 : 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (plein) {
        const d = this.ordre[i].date, long = d.length > 6;
        const court = long ? d.slice(0, -5).replace("décembre", "déc.").replace("octobre", "oct.").replace("avril", "avr.") : d;
        ctx.font = `900 ${n > 5 ? 12 : 14}px ${POLICE}`; ctx.fillStyle = "#3a2412"; ctx.textBaseline = "top";
        ctx.textAlign = i === 0 && long ? "left" : i === n - 1 && long ? "right" : "center";
        const xt = ctx.textAlign === "left" ? cx - 12 : ctx.textAlign === "right" ? cx + 12 : cx;
        ctx.fillText(court, xt, y + 18);
        if (long) { ctx.font = `800 11px ${POLICE}`; ctx.fillText(d.slice(-4), xt, y + 34); }
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    if (this.type === "frise") {
      this.dessinerFrise(ctx);
      if (this.lecture >= 0 && this.lecture < this.ordre.length) {
        const e = this.ordre[this.lecture], w = Math.min(this.L - 32, 600), x = (this.L - w) / 2, y = this.H * 0.4, h = this.suite.y - y - 18;
        panneau(ctx, x, y, w, h);
        ctx.fillStyle = OR; arrondi(ctx, x + w / 2 - 90, y + 16, 180, 40, 20); ctx.fill();
        paragraphe(ctx, e.date, this.L / 2, y + 25, 170, 20, "#3a2412", "center", 900);
        const h1 = paragraphe(ctx, e.texte, this.L / 2, y + 76, w - 40, 22, "#3a2412", "center", 900, h * 0.4);
        paragraphe(ctx, e.savoir, this.L / 2, y + 96 + h1, w - 44, 18, "#6a4a2a", "center", 700, h - h1 - 110);
        this.suite.texte = this.lecture === this.ordre.length - 1 ? "Terminer" : "Date suivante";
        dessinerBouton(ctx, this.suite, this.temps);
        return;
      }
      for (const t of this.cartes) if (t.etat !== "fait") dessinerTuile(ctx, t, 17);
      return;
    }
    const W = Math.min(this.L - 32, 620);
    paragraphe(ctx, "Touche un lieu, puis ce qu'il rappelle", this.L / 2, this.H * 0.158, W, 17, "#fff", "center", 900);
    for (const t of this.gauche) dessinerTuile(ctx, t, 17);
    for (const t of this.droite) dessinerTuile(ctx, t, 14);
    if (this.info) {
      const y = this.gauche[this.gauche.length - 1].y + this.gauche[0].h + 14;
      const fin = this.reliees === this.lx.length, h = (fin ? this.suite.y - 14 : this.H - 20) - y;
      if (h > 50) {
        panneau(ctx, (this.L - W) / 2, y, W, h, "rgba(255,244,214,0.97)");
        paragraphe(ctx, this.info, this.L / 2, y + 12, W - 30, 16, "#3a2412", "center", 700, h - 20);
      }
      if (fin) { this.suite.texte = "Terminer"; dessinerBouton(ctx, this.suite, this.temps); }
    }
  }
}

const def: DefJeu = {
  id: "traces-des-libres",
  titre: "Sur les traces des libres",
  accroche: "Remets l'histoire dans l'ordre, de 1663 à aujourd'hui, et retrouve les lieux du marronnage.",
  regles: [
    "Frise : touche les cartes de la plus ancienne à la plus récente.",
    "Lieux : touche un lieu de l'île, puis ce qu'il rappelle.",
    "Après chaque frise, découvre l'histoire de chaque date.",
    "Trois erreurs et le niveau recommence. Sans erreur : 3 étoiles.",
  ],
  niveaux: NIVEAUX_TRACES.length,
  theme: THEMES.coucher,
  creer: (c, n) => new Traces(c, n),
};
export default def;
