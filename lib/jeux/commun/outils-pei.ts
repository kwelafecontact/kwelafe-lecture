// Outils de jeu communs aux jeux refaits : combo visible, choix entre deux bonus, pouvoir à charger, guide du premier niveau, météo péi.
import { type Contexte, texteContour, arrondi } from "./moteur2d";

/** Marge sûre : rien d'important à moins de cette distance des bords (pouce, encoche, gestes du système). */
export const marge = (L: number, H: number) => Math.max(18, Math.min(L, H) * 0.05);

/** Combo et multiplicateur visibles. Le multiplicateur vient de KwFX (série du joueur). */
export class Combo {
  n = 0; meilleur = 0; m = 1; pop = 0; total = 0;
  constructor(private c: Contexte, private seuilMax = 6) {}
  /** Bonne action : renvoie les points gagnés (base × multiplicateur, bonus si pépite). */
  bon(x: number, y: number, base: number, couleur?: string, type: "bonne" | "coupe" | "trouve" = "bonne"): number {
    this.n++; this.meilleur = Math.max(this.meilleur, this.n); this.pop = 1;
    const r = this.c.kw.ev(type, x, y, couleur ? { couleur, points: base } : { points: base });
    this.m = Math.max(r.m, 1 + Math.floor(this.n / 3));
    let gain = base * this.m;
    if (r.pepite) { gain += base * 5; this.c.fx.texte("Pépite !", x, y - 46, "#FFD23F", 24); }
    if (this.n === this.seuilMax || (this.n > this.seuilMax && this.n % this.seuilMax === 0)) this.c.kw.comboMax(x, y, ["OTÉ !", "POKk !", "VLAP !", "FIOUu !!!"][Math.floor(this.n / this.seuilMax) % 4]);
    this.c.fx.texte(`+${gain}`, x, y - 20, "#ffe066", 22 + Math.min(14, this.m * 3));
    this.total += gain;
    return gain;
  }
  presque(x: number, y: number, texte = "Presque !") { this.c.kw.ev("presque", x, y); this.c.fx.texte(texte, x, y - 20, "#BFF3FF", 22); }
  rate(x: number, y: number, grave = false) { this.n = 0; this.m = 1; this.c.kw.ev("erreur", x, y, { grave }); }
  maj(dt: number) { this.pop = Math.max(0, this.pop - dt * 3); }
  /** Pastille « ×3 · série 7 » ; à placer en haut, sous le score. */
  dessiner(ctx: CanvasRenderingContext2D, x: number, y: number) {
    if (this.n < 2) return;
    const e = 1 + this.pop * 0.25, w = 118, h = 34;
    ctx.save(); ctx.translate(x, y); ctx.scale(e, e);
    ctx.fillStyle = this.m >= 3 ? "rgba(230,57,70,0.92)" : "rgba(40,20,10,0.72)"; arrondi(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fill();
    texteContour(ctx, `×${this.m} · série ${this.n}`, 0, 1, 17, "#FFE066");
    ctx.restore();
  }
}

export type Bonus = { id: string; ic: string; nom: string; txt: string };
/** Choix entre deux bonus : le jeu se met en attente tant que le joueur n'a pas choisi. */
export class Choix {
  cartes: Bonus[] | null = null;
  private rappel: ((id: string) => void) | null = null;
  private t = 0;
  constructor(private c: Contexte) {}
  get ouvert() { return !!this.cartes; }
  proposer(a: [Bonus, Bonus], rappel: (id: string) => void) { this.cartes = a; this.rappel = rappel; this.t = 0; this.c.kw.son("pepite"); }
  private rects(L: number, H: number) {
    const w = Math.min(L * 0.4, 230), h = Math.min(H * 0.3, 210), e = Math.min(18, L * 0.04), y = H * 0.5 - h / 2;
    return [{ x: L / 2 - w - e / 2, y, w, h }, { x: L / 2 + e / 2, y, w, h }];
  }
  down(x: number, y: number, L: number, H: number): boolean {
    if (!this.cartes) return false;
    if (this.t < 0.35) return true;
    this.rects(L, H).forEach((r, i) => {
      if (this.cartes && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        const b = this.cartes[i]; this.cartes = null;
        this.c.kw.ev("clic", x, y); this.c.kw.joue("koudminPei", r.x + r.w / 2, r.y + r.h / 2, { intensite: 0.6 });
        this.rappel?.(b.id);
      }
    });
    return true;
  }
  maj(dt: number) { if (this.cartes) this.t += dt; }
  dessiner(ctx: CanvasRenderingContext2D, L: number, H: number) {
    if (!this.cartes) return;
    ctx.fillStyle = "rgba(20,10,4,0.55)"; ctx.fillRect(0, 0, L, H);
    const rs = this.rects(L, H), a = Math.min(1, this.t * 4);
    texteContour(ctx, "Choisis ton bonus", L / 2, rs[0].y - 34, Math.min(30, L * 0.07), "#FFE066");
    rs.forEach((r, i) => {
      const b = this.cartes![i], dy = (1 - a) * 40 + Math.sin(this.t * 3 + i * 2) * 3;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, dy);
      ctx.fillStyle = "#FFF4DC"; ctx.shadowColor = "rgba(0,0,0,0.4)"; ctx.shadowBlur = 18; arrondi(ctx, r.x, r.y, r.w, r.h, 20); ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = i ? "#1FA3C4" : "#E63946"; ctx.lineWidth = 4; arrondi(ctx, r.x, r.y, r.w, r.h, 20); ctx.stroke();
      ctx.font = `${Math.min(52, r.h * 0.3)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(b.ic, r.x + r.w / 2, r.y + r.h * 0.26);
      ctx.fillStyle = "#3A2410"; ctx.font = `800 ${Math.min(19, r.w * 0.11)}px Nunito, system-ui, sans-serif`; ctx.fillText(b.nom, r.x + r.w / 2, r.y + r.h * 0.52);
      ctx.font = `600 ${Math.min(14, r.w * 0.08)}px Nunito, system-ui, sans-serif`;
      lignes(ctx, b.txt, r.w - 22).forEach((l, k) => ctx.fillText(l, r.x + r.w / 2, r.y + r.h * 0.68 + k * 17));
      ctx.restore();
    });
  }
}

export function lignes(ctx: CanvasRenderingContext2D, texte: string, largeur: number): string[] {
  const mots = texte.split(" "), r: string[] = []; let l = "";
  for (const m of mots) { const essai = l ? l + " " + m : m; if (ctx.measureText(essai).width > largeur && l) { r.push(l); l = m; } else l = essai; }
  if (l) r.push(l);
  return r;
}

/** Pouvoir à charger : gros bouton rond en bas à droite, loin des bords. */
export class Pouvoir {
  charge = 0; pulse = 0;
  /** Position choisie par le jeu (centre du bouton) ; par défaut en bas à droite. */
  place: ((L: number, H: number) => { x: number; y: number }) | null = null;
  constructor(private c: Contexte, public ic: string, public nom: string) {}
  get pret() { return this.charge >= 1; }
  ajouter(v: number) { const avant = this.pret; this.charge = Math.min(1, this.charge + v); if (!avant && this.pret) { this.c.kw.son("pepite"); this.pulse = 1; } }
  rect(L: number, H: number) { const r = Math.min(38, Math.min(L, H) * 0.09), m = marge(L, H), p = this.place?.(L, H); return p ? { x: p.x - r, y: p.y - r, w: r * 2, h: r * 2, r } : { x: L - m - r * 2 - 6, y: H - m - r * 2 - 10, w: r * 2, h: r * 2, r }; }
  /** Renvoie true si le pouvoir vient d'être déclenché. */
  down(x: number, y: number, L: number, H: number): boolean {
    const b = this.rect(L, H);
    if (Math.hypot(x - (b.x + b.r), y - (b.y + b.r)) > b.r * 1.25) return false;
    if (!this.pret) { this.c.kw.ev("clic", x, y); return false; }
    this.charge = 0; return true;
  }
  maj(dt: number) { this.pulse = Math.max(0, this.pulse - dt); }
  dessiner(ctx: CanvasRenderingContext2D, L: number, H: number, temps: number) {
    const b = this.rect(L, H), cx = b.x + b.r, cy = b.y + b.r, e = this.pret ? 1 + Math.sin(temps * 6) * 0.06 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(e, e);
    ctx.fillStyle = this.pret ? "#FFD23F" : "rgba(40,20,10,0.6)"; ctx.beginPath(); ctx.arc(0, 0, b.r, 0, 7); ctx.fill();
    ctx.strokeStyle = "#FFF4DC"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, b.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.charge); ctx.stroke();
    ctx.font = `${b.r}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = this.pret ? 1 : 0.6; ctx.fillText(this.ic, 0, 2);
    ctx.restore();
    if (this.pret) texteContour(ctx, this.nom, cx, b.y - 12, 13, "#FFE066");
  }
}

/** Guide du premier niveau : une phrase courte en bas, un rond qui bat sur la cible. */
export class Guide {
  texte: string | null = null; cible: { x: number; y: number } | null = null;
  private vus = new Set<string>();
  constructor(private actif: boolean) {}
  dire(cle: string, texte: string, cible?: { x: number; y: number }) { if (!this.actif || this.vus.has(cle)) return; this.vus.add(cle); this.texte = texte; this.cible = cible || null; }
  fait(cle?: string) { if (cle && !this.vus.has(cle)) return; this.texte = null; this.cible = null; }
  dessiner(ctx: CanvasRenderingContext2D, L: number, H: number, temps: number, yBulle?: number) {
    if (!this.texte) return;
    if (this.cible) { const r = 26 + Math.sin(temps * 5) * 6; ctx.strokeStyle = "#FFE066"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(this.cible.x, this.cible.y, r, 0, 7); ctx.stroke(); ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(this.cible.x, this.cible.y, r + 9, 0, 7); ctx.stroke(); }
    ctx.font = "800 16px Nunito, system-ui, sans-serif";
    const ls = lignes(ctx, this.texte, Math.min(L * 0.84, 420)), w = Math.min(L * 0.9, 450), h = 22 + ls.length * 21, x = L / 2 - w / 2, y = yBulle ?? H * 0.115;
    ctx.fillStyle = "rgba(255,244,220,0.96)"; arrondi(ctx, x, y, w, h, 16); ctx.fill();
    ctx.strokeStyle = "#FFD23F"; ctx.lineWidth = 3; arrondi(ctx, x, y, w, h, 16); ctx.stroke();
    ctx.fillStyle = "#3A2410"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ls.forEach((l, i) => ctx.fillText(l, L / 2, y + 22 + i * 21));
  }
}

/** Traits de vent de l'alizé (force de -1 à 1 : négatif = vers la gauche). */
export function traitsAlize(ctx: CanvasRenderingContext2D, L: number, H: number, temps: number, force: number, y0 = 0.15, y1 = 0.85) {
  if (Math.abs(force) < 0.05) return;
  ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) {
    const p = ((temps * (0.5 + (i % 4) * 0.13) * Math.sign(force) + i * 0.173) % 1 + 1) % 1, y = H * (y0 + ((i * 0.618) % 1) * (y1 - y0)), x = p * (L + 160) - 80, l = 40 + (i % 3) * 30;
    ctx.lineWidth = 2 + (i % 2); ctx.globalAlpha = 0.25 + Math.abs(force) * 0.5;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l * 0.5 * Math.sign(force), y - 6, x + l * Math.sign(force), y + 2); ctx.stroke();
  }
  ctx.restore();
}

/** Nappe de brume des Hauts (densite de 0 à 1) sur un rectangle. */
export function nappeBrume(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, temps: number, densite: number) {
  if (densite <= 0.01) return;
  ctx.save(); arrondi(ctx, x, y, w, h, 18); ctx.clip();
  ctx.fillStyle = `rgba(234,242,245,${0.86 * densite})`; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 6; i++) {
    const cx = x + (((i * 0.37 + temps * 0.05 * (i % 2 ? 1 : -1)) % 1 + 1) % 1) * w, cy = y + ((i * 0.53) % 1) * h, r = Math.max(w, h) * 0.45;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(255,255,255,${0.5 * densite})`); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/** Panneau clair derrière une zone de jeu, pour qu'elle reste lisible sur le décor. */
export function plateau(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, sombre = false) {
  ctx.save(); ctx.fillStyle = sombre ? "rgba(14,22,40,0.62)" : "rgba(255,244,220,0.82)"; ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  arrondi(ctx, x, y, w, h, 22); ctx.fill(); ctx.restore();
  ctx.strokeStyle = sombre ? "rgba(255,196,107,0.5)" : "rgba(122,74,42,0.5)"; ctx.lineWidth = 3; arrondi(ctx, x, y, w, h, 22); ctx.stroke();
}

/** Bertel (sac tressé en vacoa) avec son remplissage de 0 à 1. */
export function bertel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rempli: number, couleur = "#C9A45A", surligne = 0) {
  ctx.save();
  ctx.strokeStyle = "#8A6A2E"; ctx.lineWidth = Math.max(3, w * 0.05); ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.18, w * 0.3, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = couleur; ctx.beginPath(); ctx.moveTo(x + w * 0.06, y + h * 0.2); ctx.lineTo(x + w * 0.94, y + h * 0.2); ctx.lineTo(x + w * 0.84, y + h); ctx.lineTo(x + w * 0.16, y + h); ctx.closePath(); ctx.fill();
  ctx.clip();
  ctx.strokeStyle = "rgba(90,60,20,0.35)"; ctx.lineWidth = 2;
  for (let i = -6; i < 12; i++) { ctx.beginPath(); ctx.moveTo(x + i * w * 0.12, y + h * 0.2); ctx.lineTo(x + i * w * 0.12 + h * 0.5, y + h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + i * w * 0.12 + h * 0.5, y + h * 0.2); ctx.lineTo(x + i * w * 0.12, y + h); ctx.stroke(); }
  if (rempli > 0) { ctx.fillStyle = "rgba(255,210,63,0.45)"; const hh = h * 0.8 * Math.min(1, rempli); ctx.fillRect(x, y + h - hh, w, hh); }
  ctx.restore();
  if (surligne > 0) { ctx.strokeStyle = `rgba(255,224,102,${surligne})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + w * 0.06, y + h * 0.2); ctx.lineTo(x + w * 0.94, y + h * 0.2); ctx.lineTo(x + w * 0.84, y + h); ctx.lineTo(x + w * 0.16, y + h); ctx.closePath(); ctx.stroke(); }
}

/** Van (plateau rond tressé) vu de dessus, centré en (x, y). */
export function van(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, saut = 0) {
  ctx.save(); ctx.translate(x, y - saut);
  ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(0, ry * 0.25 + saut, rx * 1.02, ry * 0.9, 0, 0, 7); ctx.fill();
  ctx.fillStyle = "#D9B36A"; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = "#8A6A2E"; ctx.lineWidth = Math.max(4, rx * 0.05); ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 7); ctx.stroke();
  ctx.strokeStyle = "rgba(138,106,46,0.35)"; ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.ellipse(0, 0, rx * i / 5, ry * i / 5, 0, 0, 7); ctx.stroke(); }
  ctx.restore();
}

/** Bouton large pour le pouce. */
export type Btn = { x: number; y: number; w: number; h: number };
export const dansBtn = (x: number, y: number, b: Btn) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
export function bouton(ctx: CanvasRenderingContext2D, b: Btn, texte: string, couleur = "#E8572A", appui = 0, actif = true) {
  ctx.save(); ctx.globalAlpha = actif ? 1 : 0.5; ctx.translate(0, appui * 3);
  ctx.fillStyle = "rgba(0,0,0,0.3)"; arrondi(ctx, b.x, b.y + 5, b.w, b.h, b.h / 2.4); ctx.fill();
  ctx.fillStyle = couleur; arrondi(ctx, b.x, b.y, b.w, b.h, b.h / 2.4); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.22)"; arrondi(ctx, b.x + 4, b.y + 4, b.w - 8, b.h * 0.42, b.h / 3); ctx.fill();
  texteContour(ctx, texte, b.x + b.w / 2, b.y + b.h / 2 + 1, Math.min(22, b.h * 0.42), "#fff");
  ctx.restore();
}
