// Oussa i lé ? : retrouver un lieu de La Réunion sur la carte, en chaud / froid.
import { type Contexte, type DefJeu, type Jeu, THEMES, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, POLICE } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";
import D from "../serie2/donnees";

const PAR_NIVEAU = 5, ESSAIS = 6, TROUVE_KM = 3;
const COTE = D.cote as unknown as [number, number][];
const LAT0 = -21.13, KX = Math.cos((LAT0 * Math.PI) / 180);
const lats = COTE.map((p) => p[0]), lons = COTE.map((p) => p[1]);
const B = { latMin: Math.min(...lats), latMax: Math.max(...lats), lonMin: Math.min(...lons), lonMax: Math.max(...lons) };

function km(a: [number, number], b: [number, number]) {
  const r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r;
  const h = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}
const NIVEAUX_CHAUD: [number, string, string][] = [[6, "Brûlant !", "#ff3a1a"], [12, "Chaud", "#ff8a1a"], [20, "Tiède", "#ffd23a"], [30, "Froid", "#6ac8ff"], [999, "Glacé…", "#3a7aff"]];

type Touche = { lat: number; lon: number; d: number; t: number };

class Oussa implements Jeu {
  L: number; H: number;
  lieux: (typeof D.lieux)[number][]; i = 0;
  touches: Touche[] = []; etat: "cherche" | "trouve" | "rate" = "cherche";
  carte = { x: 0, y: 0, w: 0, h: 0 };
  score = 0; trouves = 0; essaisTotal = 0; fini = false; temps = 0;
  suite: Bouton = { x: 0, y: 0, w: 200, h: 54, texte: "Continuer", actif: true, appui: 0, couleur: "#2e8a4a" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.lieux = D.lieux.slice((niveau - 1) * PAR_NIVEAU, niveau * PAR_NIVEAU);
    this.disposer(); this.hud();
  }
  get lieu() { return this.lieux[this.i]; }
  hud() { this.c.hud({ score: this.score, objectif: `Lieu ${this.i + 1}/${this.lieux.length}`, info: `${Math.max(0, ESSAIS - this.touches.length)} essais` }); }
  disposer() {
    const top = this.H * 0.25, dispoH = this.H * 0.56, dispoW = this.L - 30;
    const rw = (B.lonMax - B.lonMin) * KX, rh = B.latMax - B.latMin;
    const s = Math.min(dispoW / rw, dispoH / rh);
    this.carte = { w: rw * s, h: rh * s, x: (this.L - rw * s) / 2, y: top + (dispoH - rh * s) / 2 };
    this.suite.x = this.L / 2 - this.suite.w / 2; this.suite.y = this.H - 76;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  vers(lat: number, lon: number) { const c = this.carte; return [c.x + ((lon - B.lonMin) / (B.lonMax - B.lonMin)) * c.w, c.y + ((B.latMax - lat) / (B.latMax - B.latMin)) * c.h] as const; }
  depuis(x: number, y: number) { const c = this.carte; return [B.latMax - ((y - c.y) / c.h) * (B.latMax - B.latMin), B.lonMin + ((x - c.x) / c.w) * (B.lonMax - B.lonMin)] as const; }
  down(x: number, y: number) {
    if (this.fini) return;
    if (this.etat !== "cherche") { if (dans(x, y, this.suite)) { this.suite.appui = 1; this.suivant(); } return; }
    const c = this.carte;
    if (x < c.x - 10 || x > c.x + c.w + 10 || y < c.y - 10 || y > c.y + c.h + 10) return;
    const [lat, lon] = this.depuis(x, y);
    const d = km([lat, lon], [this.lieu.lat, this.lieu.lon]);
    this.touches.push({ lat, lon, d, t: 0 });
    if (d <= TROUVE_KM) {
      this.etat = "trouve"; this.trouves++; this.essaisTotal += this.touches.length;
      const gain = 100 + (ESSAIS - this.touches.length) * 30; this.score += gain;
      const [px, py] = this.vers(this.lieu.lat, this.lieu.lon);
      this.c.sons.victoire(); this.c.fx.etoiles(px, py, 28); this.c.fx.texte(`Trouvé ! +${gain}`, px, py - 30, "#ffe066", 26);
    } else {
      const n = NIVEAUX_CHAUD.find((v) => d < v[0])!;
      const [px, py] = this.vers(lat, lon);
      this.c.fx.texte(n[1], px, py - 24, n[2], 22);
      d < 12 ? this.c.sons.bon() : this.c.sons.clic();
      if (this.touches.length >= ESSAIS) { this.etat = "rate"; this.essaisTotal += ESSAIS + 2; this.c.sons.mauvais(); }
    }
    this.hud();
  }
  up() { this.suite.appui = 0; }
  suivant() {
    this.i++; this.touches = []; this.etat = "cherche";
    if (this.i >= this.lieux.length) {
      this.fini = true;
      const moy = this.essaisTotal / this.lieux.length;
      const e = this.trouves < 3 ? (this.trouves > 0 ? 1 : 0) : this.trouves < this.lieux.length ? 1 : moy <= 2.5 ? 3 : moy <= 4 ? 2 : 1;
      this.c.fin({ gagne: this.trouves >= 3, score: this.score, etoiles: e });
      return;
    }
    this.hud();
  }
  maj(dt: number) { this.temps += dt; for (const t of this.touches) t.t += dt; }
  ile(ctx: CanvasRenderingContext2D) {
    const pts = COTE.map((p) => this.vers(p[0], p[1]));
    ctx.beginPath();
    const mid = (a: readonly number[], b: readonly number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(pts[pts.length - 1], pts[0]); ctx.moveTo(m0[0], m0[1]);
    pts.forEach((p, k) => { const m = mid(p, pts[(k + 1) % pts.length]); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); });
    ctx.closePath();
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const l = this.lieu; if (!l) return;
    const w = Math.min(this.L - 30, 560);
    panneau(ctx, (this.L - w) / 2, this.H * 0.065, w, this.H * 0.17);
    paragraphe(ctx, "Oussa i lé ?", this.L / 2, this.H * 0.065 + 8, w, 14, "#9a5a2a");
    const nIndices = this.etat === "cherche" ? Math.min(l.indices.length, 1 + this.touches.length) : l.indices.length;
    const titre = this.etat === "cherche" ? l.indices.slice(0, nIndices).join(" ") : l.nom;
    paragraphe(ctx, titre, this.L / 2, this.H * 0.065 + 28, w - 30, this.etat === "cherche" ? 17 : 24, "#3a2412", "center", 800, this.H * 0.17 - 36);
    // carte
    ctx.save();
    ctx.shadowColor = "rgba(0,40,80,0.45)"; ctx.shadowBlur = 24;
    this.ile(ctx); const g = ctx.createRadialGradient(...this.vers(-21.12, 55.52), 0, ...this.vers(-21.12, 55.52), this.carte.w * 0.6);
    g.addColorStop(0, "#5a7a3a"); g.addColorStop(0.45, "#4a9a3e"); g.addColorStop(1, "#8ac860"); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    ctx.save(); this.ile(ctx); ctx.clip();
    for (const [la, lo, r, col] of [[-21.099, 55.478, 0.2, "rgba(120,90,60,0.55)"], [-21.244, 55.709, 0.17, "rgba(110,60,40,0.6)"], [-21.17, 55.32, 0.12, "rgba(60,110,50,0.4)"]] as [number, number, number, string][]) {
      const [x, y] = this.vers(la, lo), rr = r * this.carte.w;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, col); gg.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = gg; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,240,0.8)"; ctx.lineWidth = 3; this.ile(ctx); ctx.stroke();
    // touches
    for (const t of this.touches) {
      const [x, y] = this.vers(t.lat, t.lon), n = NIVEAUX_CHAUD.find((v) => t.d < v[0])!;
      const col = t.d <= TROUVE_KM ? "#3aff6a" : n[2];
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = Math.max(0, 1 - t.t * 0.8);
      ctx.beginPath(); ctx.arc(x, y, 10 + t.t * 40, 0, 7); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    }
    if (this.etat !== "cherche") {
      const [x, y] = this.vers(l.lat, l.lon);
      ctx.fillStyle = "#ff3a5a"; ctx.beginPath(); ctx.arc(x, y - 16, 10, Math.PI, 0); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y - 16, 4, 0, 7); ctx.fill();
      ctx.font = `800 14px ${POLICE}`; const tw = ctx.measureText(l.nom).width + 16;
      ctx.fillStyle = "rgba(40,20,10,0.85)"; arrondi(ctx, x - tw / 2, y - 50, tw, 24, 12); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l.nom, x, y - 38);
      const yb = this.carte.y + this.carte.h + 6, hb = this.suite.y - yb - 10;
      if (hb > 40) { panneau(ctx, (this.L - w) / 2, yb, w, hb); paragraphe(ctx, l.info, this.L / 2, yb + 10, w - 30, 15, "#3a2412", "center", 700, hb - 16); }
      dessinerBouton(ctx, this.suite, this.temps);
    }
  }
}

const def: DefJeu = {
  id: "oussa-i-le",
  titre: "Oussa i lé ?",
  accroche: "Retrouve les lieux de La Réunion sur la carte, en chaud ou froid.",
  regles: ["Lis l'indice, puis touche la carte là où tu penses trouver le lieu.", "Brûlant, chaud, tiède, froid, glacé : la carte te guide.", "Chaque essai raté te donne un nouvel indice. Six essais par lieu.", "Cinq lieux par niveau : moins tu fais d'essais, plus tu gagnes."],
  niveaux: Math.ceil(D.lieux.length / PAR_NIVEAU),
  theme: THEMES.lagon,
  creer: (c, n) => new Oussa(c, n),
};
export default def;
