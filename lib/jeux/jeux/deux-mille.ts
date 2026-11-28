// 2048 péi (refonte KwFX v4.1) : on fait glisser les fruits ; deux fruits identiques fusionnent en un plus gros.
// Inventions péi : la marée du lagon pousse tout vers le haut quand elle est pleine, et le van à vanner emporte les deux plus petits fruits.
import { couleurDe, photo } from "../commun/photos";
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi, texteContour } from "../commun/moteur2d";
import { CHAINE } from "./fusion-pei";
import { Combo, Choix, Pouvoir, Guide, plateau, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

type Tuile = { k: number; c: number; r: number; x: number; y: number; s: number; id: number; or: number };
type Photo = { score: number; tuiles: { k: number; c: number; r: number }[] };
const FONDS = ["#fff4dc", "#ffe0e0", "#fff2b0", "#ffd9a8", "#e6f5c8", "#ffc8c8", "#ffe39a", "#ffd0a0", "#fff0a0", "#d8f0c0", "#e8d8ff"];
const MAREE = 8;

class DeuxMille implements Jeu {
  L: number; H: number; N = 4; pb: boolean;
  tuiles: Tuile[] = []; score = 0; temps = 0; fini = false; ids = 0; coups = 0;
  depart: { x: number; y: number } | null = null;
  cell = 80; ox = 0; oy = 0;
  maree = MAREE; vague = 0; meilleur = 0; doublePoints = 0;
  avant: Photo | null = null;
  combo: Combo; choix: Choix; van: Pouvoir; guide: Guide; choixFait = false; vanSaut = 0;
  btnRetour: Btn = { x: 0, y: 0, w: 0, h: 0 };
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    this.combo = new Combo(c, 8); this.choix = new Choix(c); this.van = new Pouvoir(c, "🌾", "Van"); this.guide = new Guide(true);
    this.disposer(); this.ajouter(); this.ajouter(); this.hud();
    this.guide.dire("glisse", "Glisse le doigt : tous les fruits partent dans ce sens. Deux pareils fusionnent.");
  }
  hud() {
    const but = this.pb ? `Marée dans ${this.maree}` : "But : une papaye";
    this.c.hud({ score: this.score, info: `${but} · plus gros fruit : ${photo(CHAINE[this.meilleur])?.nom || CHAINE[this.meilleur]}` });
  }
  disposer() {
    const m = marge(this.L, this.H), haut = Math.max(150, this.H * 0.2), bas = Math.max(110, this.H * 0.15);
    this.cell = Math.min((this.L - m * 2) / this.N, (this.H - haut - bas) / this.N, 124);
    this.ox = (this.L - this.cell * this.N) / 2; this.oy = haut + (this.H - haut - bas - this.cell * this.N) / 2;
    this.btnRetour = { x: Math.max(m + 4, this.ox), y: this.oy + this.cell * this.N + 22, w: 132, h: 56 };
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  a(c: number, r: number) { return this.tuiles.find((t) => t.k >= 0 && t.c === c && t.r === r); }
  centre(t: { c: number; r: number }) { return { x: this.ox + (t.c + 0.5) * this.cell, y: this.oy + (t.r + 0.5) * this.cell }; }
  ajouter() {
    const libres: [number, number][] = [];
    for (let c = 0; c < this.N; c++) for (let r = 0; r < this.N; r++) if (!this.a(c, r)) libres.push([c, r]);
    if (!libres.length) return;
    const [c, r] = libres[Math.floor(this.c.rnd() * libres.length)];
    const or = this.pb && this.coups > 4 && this.c.rnd() < 0.12 ? 6 : 0;
    this.tuiles.push({ k: this.c.rnd() < 0.85 ? 0 : 1, c, r, x: c, y: r, s: 0, id: this.ids++, or });
    if (or) { const p = this.centre({ c, r }); this.c.kw.joue("poussiereOr", p.x, p.y, { intensite: 0.5 }); }
  }
  photo(): Photo { return { score: this.score, tuiles: this.tuiles.filter((t) => t.k >= 0).map((t) => ({ k: t.k, c: t.c, r: t.r })) }; }
  instantane() { return this.fini ? null : { v: 2, ...this.photo(), maree: this.maree, coups: this.coups }; }
  restaurer(e: unknown) {
    const d = e as Photo & { v?: number; maree?: number; coups?: number };
    if (!d || !Array.isArray(d.tuiles)) return;
    this.score = d.score || 0; this.maree = d.maree || MAREE; this.coups = d.coups || 0;
    this.tuiles = d.tuiles.map((t) => ({ k: t.k, c: t.c, r: t.r, x: t.c, y: t.r, s: 1, id: this.ids++, or: 0 }));
    this.meilleur = Math.max(0, ...this.tuiles.map((t) => t.k)); this.hud();
  }
  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H)) return;
    if (this.van.down(x, y, this.L, this.H)) { this.vanner(); return; }
    if (!this.pb && this.avant && dansBtn(x, y, this.btnRetour)) { this.restaurer(this.avant); this.avant = null; this.c.kw.ev("clic", x, y); return; }
    this.depart = { x, y };
  }
  up(x: number, y: number) {
    if (!this.depart || this.fini) return;
    const dx = x - this.depart.x, dy = y - this.depart.y; this.depart = null;
    if (Math.hypot(dx, dy) < 22) return;
    const p = this.photo();
    const bouge = Math.abs(dx) > Math.abs(dy) ? this.glisser(Math.sign(dx), 0) : this.glisser(0, Math.sign(dy));
    if (!bouge) return;
    this.avant = p; this.coups++; this.guide.fait(); this.ajouter();
    for (const t of this.tuiles) if (t.or > 0 && --t.or === 0) { const q = this.centre(t); this.c.fx.texte("Le doré s'éteint", q.x, q.y, "#fff", 14); }
    if (this.doublePoints > 0) this.doublePoints--;
    if (this.pb && --this.maree <= 0) this.monterMaree();
    this.hud(); this.verifier();
  }
  /** La marée est pleine : tout est poussé vers le haut, sans nouveau fruit. */
  monterMaree() {
    this.maree = MAREE; this.vague = 1;
    const y = this.oy + this.cell * this.N;
    this.c.kw.joue("mareePei", this.L / 2, y, { intensite: 0.9 }); this.c.kw.son("bulles"); this.c.kw.banniere("La marée monte !", 0.5);
    this.glisser(0, -1);
  }
  /** Le van à vanner : le vent emporte les deux plus petits fruits. */
  vanner() {
    const vivants = this.tuiles.filter((t) => t.k >= 0).sort((a, b) => a.k - b.k);
    if (vivants.length <= 2) return;
    this.vanSaut = 1;
    for (const t of vivants.slice(0, 2)) { const p = this.centre(t); this.c.kw.joue("vannagePei", p.x, p.y, { intensite: 0.8 }); t.k = -1; t.s = 0; }
    this.c.kw.son("van"); this.c.kw.onoma("FIOUu !!!", this.L / 2, this.oy + this.cell * 2, 0.7);
  }
  glisser(dc: number, dr: number): boolean {
    let bouge = false, fusions = 0; const fusionnees = new Set<number>();
    const ordre = this.tuiles.filter((t) => t.k >= 0).sort((a, b) => (dc ? (b.c - a.c) * dc : (b.r - a.r) * dr));
    for (const t of ordre) {
      let c = t.c, r = t.r;
      for (;;) {
        const nc = c + dc, nr = r + dr;
        if (nc < 0 || nr < 0 || nc >= this.N || nr >= this.N) break;
        const o = this.a(nc, nr);
        if (!o) { c = nc; r = nr; continue; }
        if (o.k === t.k && !fusionnees.has(o.id) && o.k < CHAINE.length - 1) {
          const dore = o.or > 0 || t.or > 0;
          o.k++; o.s = 1.35; o.or = 0; fusionnees.add(o.id); t.k = -1; t.c = nc; t.r = nr; fusions++;
          const p = this.centre(o), base = Math.pow(2, o.k + 1) * (dore ? 3 : 1) * (this.doublePoints > 0 ? 2 : 1);
          this.score += this.combo.bon(p.x, p.y, base, couleurDe(CHAINE[o.k]));
          if (dore) { this.c.kw.ev("pepite", p.x, p.y); this.c.fx.texte("Fruit doré ×3", p.x, p.y - 44, "#FFD23F", 20); }
          this.van.ajouter(0.1);
          if (o.k > this.meilleur) this.grandir(o);
          bouge = true;
        }
        break;
      }
      if (t.k >= 0 && (c !== t.c || r !== t.r)) { t.c = c; t.r = r; bouge = true; }
    }
    if (!fusions && bouge) this.combo.n = 0;
    if (fusions >= 2) this.c.kw.ev("combo", this.L / 2, this.oy + this.cell * 2, { n: fusions });
    return bouge;
  }
  grandir(o: Tuile) {
    this.meilleur = o.k; const p = this.centre(o);
    if (o.k >= 4) { this.c.kw.ev("niveau", p.x, p.y); this.c.kw.onoma(o.k >= 7 ? "OTÉ !" : "POKk !", p.x, p.y, 0.8); }
    if (o.k === 6 && !this.choixFait) {
      this.choixFait = true;
      this.choix.proposer([{ id: "van", ic: "🌾", nom: "Van chargé", txt: "Emporte tout de suite les deux plus petits fruits." }, { id: "double", ic: "✖️", nom: "Points doublés", txt: "Tes 10 prochains coups comptent double." }],
        (id) => { if (id === "van") this.van.ajouter(1); else this.doublePoints = 10; });
    }
  }
  bloque() {
    for (let c = 0; c < this.N; c++) for (let r = 0; r < this.N; r++) {
      const t = this.a(c, r); if (!t) return false;
      const d = this.a(c + 1, r), b = this.a(c, r + 1);
      if ((d && d.k === t.k) || (b && b.k === t.k)) return false;
    }
    return true;
  }
  verifier() {
    if (!this.pb && this.meilleur >= 7) return this.finir(true);
    if (!this.bloque()) return;
    if (!this.pb || this.van.pret) { this.van.charge = 0; this.vanner(); this.c.fx.texte(this.pb ? "Le van te sauve !" : "Un coup de van pour t'aider", this.L / 2, this.oy - 20, "#fff", 20); return; }
    this.finir(this.meilleur >= 6);
  }
  finir(gagne: boolean) {
    this.fini = true;
    const e = this.pb ? (this.meilleur >= 8 ? 3 : this.meilleur >= 7 ? 2 : this.meilleur >= 6 ? 1 : 0) : this.coups <= 220 ? 3 : this.coups <= 320 ? 2 : 1;
    setTimeout(() => this.c.fin({ gagne, score: this.score, etoiles: gagne ? e : 0, lignes: [`Plus gros fruit : ${photo(CHAINE[this.meilleur])?.nom || CHAINE[this.meilleur]} · ${this.coups} coups`] }), 600);
  }
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert) return;
    this.temps += dt; this.combo.maj(dt); this.van.maj(dt); this.vague = Math.max(0, this.vague - dt * 1.2); this.vanSaut = Math.max(0, this.vanSaut - dt * 2);
    for (const t of this.tuiles) { const v = Math.min(1, dt * 16); t.x += (t.c - t.x) * v; t.y += (t.r - t.y) * v; t.s += ((t.k < 0 ? 0 : 1) - t.s) * Math.min(1, dt * 10); }
    this.tuiles = this.tuiles.filter((t) => t.k >= 0 || (Math.abs(t.x - t.c) + Math.abs(t.y - t.r) > 0.05 && t.s > 0.05));
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { cell, ox, oy, N } = this, T = cell * N;
    plateau(ctx, ox - 10, oy - 10, T + 20, T + 20);
    for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) { ctx.fillStyle = "rgba(122,74,42,0.14)"; arrondi(ctx, ox + c * cell + 4, oy + r * cell + 4, cell - 8, cell - 8, 12); ctx.fill(); }
    // la marée monte dans le plateau
    if (this.pb) {
      const k = 1 - this.maree / MAREE, hh = T * (0.06 + k * 0.3) + this.vague * T * 0.5;
      ctx.save(); arrondi(ctx, ox - 10, oy - 10, T + 20, T + 20, 22); ctx.clip();
      ctx.fillStyle = `rgba(31,163,196,${0.28 + this.vague * 0.3})`; ctx.beginPath(); ctx.moveTo(ox - 10, oy + T + 10);
      for (let x = ox - 10; x <= ox + T + 10; x += 10) ctx.lineTo(x, oy + T + 10 - hh + Math.sin(x * 0.05 + this.temps * 3) * 5);
      ctx.lineTo(ox + T + 10, oy + T + 10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    for (const t of this.tuiles.slice().sort((a, b) => a.k - b.k)) {
      const k = Math.max(0, t.k), x = ox + (t.x + 0.5) * cell, y = oy + (t.y + 0.5) * cell, s = (cell - 8) * Math.max(0, t.s);
      if (s < 2) continue;
      ctx.fillStyle = FONDS[k % FONDS.length]; arrondi(ctx, x - s / 2, y - s / 2, s, s, 12); ctx.fill();
      if (t.or > 0) { ctx.strokeStyle = `rgba(255,196,0,${0.6 + Math.sin(this.temps * 6) * 0.4})`; ctx.lineWidth = 5; arrondi(ctx, x - s / 2, y - s / 2, s, s, 12); ctx.stroke(); texteContour(ctx, String(t.or), x + s * 0.34, y - s * 0.34, 15, "#FFD23F"); }
      sprite(ctx, this.c.img(CHAINE[k]), x, y - s * 0.04, s * 0.78, 0, 1, false);
    }
    this.combo.dessiner(ctx, this.L / 2, oy - 34);
    if (this.doublePoints > 0) texteContour(ctx, `Points ×2 : ${this.doublePoints} coups`, this.L / 2, oy + T + 26, 15, "#FFE066");
    if (!this.pb) bouton(ctx, this.btnRetour, "↩ Retour", "#7A4A2A", 0, !!this.avant);
    this.van.dessiner(ctx, this.L, this.H, this.temps);
    this.guide.dessiner(ctx, this.L, this.H, this.temps);
    this.choix.dessiner(ctx, this.L, this.H);
  }
}

const def: DefJeu = {
  id: "2048-pei", titre: "2048 péi", accroche: "Fais glisser les fruits : deux pareils fusionnent, du goyavier jusqu'au durian.",
  regles: [], niveaux: 0, theme: THEMES.coucher, visuels: "photos",
  modes: {
    trankil: ["Glisse le doigt : tous les fruits partent dans ce sens.", "Deux fruits pareils fusionnent. But : faire pousser une papaye.", "Bouton Retour pour annuler un coup. Si tu es coincé, le van t'aide."],
    probleme: ["Tous les 8 coups, la marée pousse tout vers le haut : prépare-toi.", "Fusionne un fruit doré avant la fin de son compteur : points ×3.", "Charge le van avec tes fusions : il emporte les deux plus petits fruits."],
  },
  decor: { lieu: "lagon", heure: "soir" }, themeFx: "lagon",
  creer: (c) => new DeuxMille(c),
};
export default def;
