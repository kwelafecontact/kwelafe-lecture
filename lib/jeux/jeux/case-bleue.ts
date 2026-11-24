// L'énigme de la Case Bleue : escape game dans la kaz de Gramoun Zélie, une pièce par niveau.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, POLICE } from "../commun/texte";
import D from "../serie2/donnees";

type Objet = { x: number; y: number; t: number; img?: string; emoji?: string; nom: string; indice: string };
type Touche = { k: string; x: number; y: number; w: number; h: number; appui: number };

class CaseBleue implements Jeu {
  L: number; H: number;
  piece: (typeof D.escape)[number];
  vus = new Set<number>(); ouvert = -1;
  saisie = ""; erreurs = 0; aide = false; reussi = 0;
  touches: Touche[] = []; scene = { x: 0, y: 0, w: 0, h: 0 };
  score = 0; fini = false; temps = 0; secoue = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.piece = D.escape[niveau - 1];
    this.disposer();
    this.c.hud({ score: 0, objectif: `Pièce ${niveau}/${D.escape.length}`, info: `Code à ${this.piece.code.length} chiffres` });
  }
  get objets(): Objet[] { return this.piece.objets as unknown as Objet[]; }
  disposer() {
    this.scene = { x: 10, y: this.H * 0.25, w: this.L - 20, h: this.H * 0.33 };
    const kw = Math.min(74, (this.L - 60) / 4), kh = Math.min(48, this.H * 0.06), y0 = this.H - (kh + 8) * 3 - 14;
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "<", "0", "?"];
    this.touches = keys.map((k, i) => ({ k, x: this.L / 2 - (kw * 4 + 24) / 2 + (i % 4) * (kw + 8), y: y0 + Math.floor(i / 4) * (kh + 8), w: kw, h: kh, appui: 0 }));
    this.touches.push({ k: ">", x: this.L / 2 - 90, y: y0 - kh - 16, w: 180, h: kh, appui: 0 });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  pos(o: Objet) { const s = this.scene; return { x: s.x + (o.x / 1536) * s.w, y: s.y + ((o.y - 760) / 680) * s.h, t: Math.min(s.w, s.h * 1.6) * (o.t / 1536) * 1.5 }; }
  down(x: number, y: number) {
    if (this.fini || this.reussi > 0) return;
    const k = this.touches.find((t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h);
    if (k) {
      k.appui = 1; this.c.sons.clic();
      if (k.k === "<") this.saisie = this.saisie.slice(0, -1);
      else if (k.k === "?") { if (this.erreurs >= 2 || this.vus.size === this.objets.length) { this.aide = true; } else this.c.fx.texte("Fouille d'abord la pièce…", this.L / 2, this.H * 0.62, "#fff", 18); }
      else if (k.k === ">") this.valider();
      else if (this.saisie.length < this.piece.code.length) this.saisie += k.k;
      return;
    }
    const i = this.objets.findIndex((o) => { const p = this.pos(o); return Math.hypot(x - p.x, y - p.y) < p.t * 0.6; });
    if (i >= 0) { this.ouvert = i; if (!this.vus.has(i)) { this.vus.add(i); this.c.sons.pop(this.vus.size); this.score += 20; } }
    else this.ouvert = -1;
  }
  up() { for (const t of this.touches) t.appui = 0; }
  valider() {
    if (this.saisie === this.piece.code) {
      const gain = Math.max(100, 300 - this.erreurs * 60 - (this.aide ? 80 : 0)); this.score += gain;
      this.reussi = 3.2; this.c.sons.victoire(); this.c.fx.confettis(this.L);
    } else { this.erreurs++; this.saisie = ""; this.secoue = 0.4; this.c.sons.mauvais(); this.c.fx.secouer(0.2); }
    this.c.hud({ score: this.score });
  }
  maj(dt: number) {
    this.temps += dt; this.secoue = Math.max(0, this.secoue - dt);
    if (this.reussi > 0 && !this.fini) {
      this.reussi -= dt;
      if (this.reussi <= 0) { this.fini = true; const e = this.erreurs === 0 && !this.aide ? 3 : this.erreurs <= 2 && !this.aide ? 2 : 1; this.c.fin({ gagne: true, score: this.score, etoiles: e }); }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const p = this.piece, w = Math.min(this.L - 20, 580), x0 = (this.L - w) / 2;
    panneau(ctx, x0, this.H * 0.06, w, this.H * 0.18);
    paragraphe(ctx, p.titre, this.L / 2, this.H * 0.06 + 8, w - 20, 20, "#1b3a6a");
    paragraphe(ctx, this.reussi > 0 ? p.bravo : p.texte, this.L / 2, this.H * 0.06 + 36, w - 24, 15, "#3a2412", "center", 700, this.H * 0.18 - 42);
    // la pièce de la Case Bleue
    const s = this.scene;
    ctx.save(); arrondi(ctx, s.x, s.y, s.w, s.h, 18); ctx.clip();
    const mur = ctx.createLinearGradient(0, s.y, 0, s.y + s.h); mur.addColorStop(0, "#3a7ac8"); mur.addColorStop(0.68, "#2a5aa0"); mur.addColorStop(0.68, "#8a5a32"); mur.addColorStop(1, "#5e3a1e");
    ctx.fillStyle = mur; ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2;
    for (let x = s.x; x < s.x + s.w; x += 26) { ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y + s.h * 0.68); ctx.stroke(); }
    ctx.strokeStyle = "rgba(0,0,0,0.15)"; for (let y = s.y + s.h * 0.68; y < s.y + s.h; y += 14) { ctx.beginPath(); ctx.moveTo(s.x, y); ctx.lineTo(s.x + s.w, y); ctx.stroke(); }
    ctx.restore();
    this.objets.forEach((o, i) => {
      const q = this.pos(o), b = 1 + Math.sin(this.temps * 2.5 + i) * 0.03;
      if (!this.vus.has(i)) { ctx.fillStyle = `rgba(255,240,150,${0.25 + 0.15 * Math.sin(this.temps * 4 + i)})`; ctx.beginPath(); ctx.arc(q.x, q.y, q.t * 0.58, 0, 7); ctx.fill(); }
      if (o.img) sprite(ctx, this.c.img(o.img), q.x, q.y, q.t * b);
      else { ctx.font = `${q.t * 0.8 * b}px system-ui, "Apple Color Emoji", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(o.emoji || "❓", q.x, q.y); }
    });
    if (this.ouvert >= 0) {
      const o = this.objets[this.ouvert], hb = s.h * 0.48;
      panneau(ctx, s.x + 12, s.y + s.h - hb - 10, s.w - 24, hb, "rgba(255,252,235,0.97)");
      paragraphe(ctx, o.nom, this.L / 2, s.y + s.h - hb, s.w - 50, 16, "#8a2a12");
      paragraphe(ctx, o.indice, this.L / 2, s.y + s.h - hb + 24, s.w - 50, 15, "#3a2412", "center", 700, hb - 34);
    }
    // question, saisie, clavier
    const yq = s.y + s.h + 8;
    paragraphe(ctx, this.aide ? `Aide : ${p.aide}` : p.question, this.L / 2, yq, w - 10, 14, this.aide ? "#ffe066" : "#fff", "center", 800, 40);
    const n = p.code.length, cw = 40, dx = this.secoue > 0 ? Math.sin(this.temps * 60) * 8 * this.secoue : 0, yc = yq + 44;
    for (let i = 0; i < n; i++) {
      const x = this.L / 2 - (n * (cw + 8)) / 2 + i * (cw + 8) + dx;
      ctx.fillStyle = this.reussi > 0 ? "#3aa85a" : "rgba(255,255,255,0.92)"; arrondi(ctx, x, yc, cw, 46, 10); ctx.fill();
      ctx.font = `800 26px ${POLICE}`; ctx.fillStyle = this.reussi > 0 ? "#fff" : "#1b3a6a"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(this.reussi > 0 ? p.code[i] : this.saisie[i] || "", x + cw / 2, yc + 24);
    }
    for (const k of this.touches) {
      ctx.save(); ctx.translate(k.x + k.w / 2, k.y + k.h / 2); ctx.scale(1 - k.appui * 0.08, 1 - k.appui * 0.08);
      ctx.fillStyle = k.k === ">" ? "#2e8a4a" : k.k === "<" ? "#b8361d" : k.k === "?" ? "#e0a020" : "rgba(255,250,240,0.95)";
      arrondi(ctx, -k.w / 2, -k.h / 2, k.w, k.h, 10); ctx.fill();
      ctx.font = `800 ${k.k.length > 1 || /[<>?]/.test(k.k) ? 15 : 22}px ${POLICE}`; ctx.fillStyle = /[<>?]/.test(k.k) ? "#fff" : "#1b3a6a";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(k.k === "<" ? "Effacer" : k.k === ">" ? "Ouvrir" : k.k === "?" ? "Aide" : k.k, 0, 1);
      ctx.restore();
    }
  }
}

const IMGS: Record<string, string> = {};
for (const p of D.escape) for (const o of p.objets as unknown as Objet[]) if (o.img) IMGS[o.img] = `/jeux/lontan/${o.img}.webp`;

const def: DefJeu = {
  id: "case-bleue",
  titre: "L'énigme de la Case Bleue",
  accroche: "Retrouve le cahier de recettes de Gramoun Zélie, caché dans la Case Bleue.",
  regles: ["Touche les objets de la pièce pour trouver des indices.", "Assemble les indices pour trouver le code, puis touche Ouvrir.", "Le bouton Aide s'allume après deux erreurs ou quand tout est fouillé.", "Une pièce par niveau : sans erreur ni aide, 3 étoiles."],
  niveaux: D.escape.length,
  theme: THEMES.case,
  images: IMGS,
  creer: (c, n) => new CaseBleue(c, n),
};
export default def;
