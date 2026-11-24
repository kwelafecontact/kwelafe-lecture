// Ramasse les letchis ! : les letchis tombent du pied, on les attrape dans la tant (panier) en évitant guêpes et feuilles mortes.
import { type Contexte, type DefJeu, type Jeu, THEMES, FONDS_AQUARELLE, sprite, etoilesPour } from "../commun/moteur2d";
import { guepe } from "../commun/dessins";

type Chute = { type: "letchi" | "grappe" | "guepe" | "feuille"; x: number; y: number; v: number; rot: number; vr: number; t: number };

class Letchis implements Jeu {
  L: number; H: number;
  px: number; cibleX: number; chutes: Chute[] = [];
  temps = 0; duree = 40; prochain = 0.4; score = 0; coeurs = 3; serie = 0; fini = false;
  objectif: number; vitesse: number; ecrase = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H; this.px = this.cibleX = c.L / 2;
    this.objectif = 120 + niveau * 25;
    this.vitesse = 170 + niveau * 9;
    this.hud();
  }
  hud() { this.c.hud({ score: this.score, objectif: `objectif ${this.objectif}`, temps: Math.max(0, this.duree - this.temps), info: "❤".repeat(this.coeurs) + "♡".repeat(Math.max(0, 3 - this.coeurs)) }); }
  redim(L: number, H: number) { this.L = L; this.H = H; }
  get panierY() { return this.H - 110; }
  get panierW() { return Math.min(130, this.L * 0.3); }
  down(x: number) { this.cibleX = x; }
  move(x: number) { this.cibleX = x; }
  lacher() {
    const r = this.c.rnd(), pGuepe = Math.min(0.28, 0.1 + this.niveau * 0.007), pFeuille = Math.min(0.18, 0.06 + this.niveau * 0.004);
    const type: Chute["type"] = r < pGuepe ? "guepe" : r < pGuepe + pFeuille ? "feuille" : r > 0.93 ? "grappe" : "letchi";
    const v = this.vitesse * (type === "feuille" ? 0.55 : type === "guepe" ? 1.1 : 0.85 + this.c.rnd() * 0.35);
    this.chutes.push({ type, x: 30 + this.c.rnd() * (this.L - 60), y: this.H * 0.12, v, rot: this.c.rnd() * 6, vr: (this.c.rnd() - 0.5) * 4, t: 0 });
  }
  maj(dt: number) {
    if (this.fini) return;
    const avant = Math.ceil(this.duree - this.temps);
    this.temps += dt; this.ecrase = Math.max(0, this.ecrase - dt * 4);
    if (Math.ceil(this.duree - this.temps) !== avant) this.hud();
    if (this.temps >= this.duree) {
      this.fini = true;
      this.c.fin({ gagne: this.score >= this.objectif, score: this.score, etoiles: etoilesPour(this.score, [this.objectif, this.objectif * 1.3, this.objectif * 1.6]) });
      return;
    }
    this.px += (this.cibleX - this.px) * Math.min(1, dt * 14);
    this.prochain -= dt;
    if (this.prochain <= 0) { this.lacher(); this.prochain = Math.max(0.28, 0.85 - this.niveau * 0.018) * (0.6 + this.c.rnd() * 0.8); }
    const pw = this.panierW, py = this.panierY;
    for (const ch of this.chutes) {
      ch.t += dt; ch.y += ch.v * dt; ch.rot += ch.vr * dt;
      if (ch.type === "feuille") ch.x += Math.sin(ch.t * 3) * 60 * dt;
      if (ch.type === "guepe") ch.x += Math.sin(ch.t * 6) * 90 * dt;
      if (ch.y > py - 10 && ch.y < py + 30 && Math.abs(ch.x - this.px) < pw / 2) {
        ch.y = this.H * 3;
        if (ch.type === "guepe") {
          this.coeurs--; this.serie = 0; this.c.sons.mauvais(); this.c.fx.secouer(0.35); this.c.fx.eclair("255,80,60", 0.35);
          this.c.fx.texte("Aïe ! Piqûre !", this.px, py - 40, "#ff8a7a", 24);
          if (this.coeurs <= 0) { this.fini = true; this.hud(); this.c.fin({ gagne: false, score: this.score, etoiles: 0 }); return; }
        } else if (ch.type === "feuille") {
          this.score = Math.max(0, this.score - 5); this.serie = 0; this.c.sons.clic(); this.c.fx.texte("−5", this.px, py - 30, "#c8a07a", 22);
        } else {
          this.serie++; this.ecrase = 1;
          const gain = (ch.type === "grappe" ? 30 : 10) + Math.min(this.serie, 15);
          this.score += gain; this.c.sons.pop(Math.min(8, this.serie));
          this.c.fx.gerbe(this.px, py, ch.type === "grappe" ? "#ffe066" : "#ff6a7a", 10, 200, 1);
          this.c.fx.texte(`+${gain}`, this.px, py - 30, "#ffe066", 22);
        }
        this.hud();
      }
    }
    this.chutes = this.chutes.filter((ch) => ch.y < this.H + 60);
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this;
    if (!FONDS_AQUARELLE.has("ramasse-les-letchis")) {
    // feuillage du pied de letchi
    const verts = ["#2c6a2c", "#3a8a34", "#4aa63e"];
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = verts[i % 3];
      const x = (i / 15) * L, y = H * 0.05 + Math.sin(i * 1.7) * 18;
      ctx.beginPath(); ctx.arc(x, y, 60 + (i % 4) * 12 + Math.sin(this.temps * 1.5 + i) * 2, 0, 7); ctx.fill();
    }
    for (let i = 0; i < 14; i++) { const x = ((i * 0.071 + 0.03) % 1) * L, y = H * 0.07 + ((i * 37) % 40); sprite(ctx, this.c.img("letchi"), x, y, 30, i, 1, false); }
    }
    for (const ch of this.chutes) {
      if (ch.type === "guepe") guepe(ctx, ch.x, ch.y, 48, this.temps);
      else if (ch.type === "feuille") {
        ctx.save(); ctx.translate(ch.x, ch.y); ctx.rotate(ch.rot); ctx.fillStyle = "#9a6a2a";
        ctx.beginPath(); ctx.ellipse(0, 0, 22, 10, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#6a4418"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(22, 0); ctx.stroke(); ctx.restore();
      } else sprite(ctx, this.c.img(ch.type === "grappe" ? "grappe" : "letchi"), ch.x, ch.y, ch.type === "grappe" ? 72 : 46, ch.rot * 0.3);
    }
    // la tant (panier tressé)
    const pw = this.panierW, py = this.panierY, s = 1 + this.ecrase * 0.06;
    ctx.save(); ctx.translate(this.px, py); ctx.scale(s, 1 / s);
    ctx.fillStyle = "#b8862e"; ctx.beginPath(); ctx.moveTo(-pw / 2, 0); ctx.lineTo(pw / 2, 0); ctx.lineTo(pw * 0.4, 56); ctx.lineTo(-pw * 0.4, 56); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#8a5a1a"; ctx.lineWidth = 2;
    for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(-pw / 2 + k * 2, k * 11); ctx.lineTo(pw / 2 - k * 2, k * 11); ctx.stroke(); }
    for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo((k * pw) / 9, 0); ctx.lineTo((k * pw * 0.8) / 9, 56); ctx.stroke(); }
    ctx.fillStyle = "#d8a84a"; ctx.fillRect(-pw / 2 - 4, -6, pw + 8, 10);
    ctx.restore();
  }
}

const def: DefJeu = {
  id: "ramasse-les-letchis",
  titre: "Ramasse les letchis !",
  accroche: "Sous le pied de letchi, attrape les fruits dans ta tant !",
  regles: ["Fais glisser ton doigt pour déplacer la tant (le panier).", "Attrape les letchis ; les grappes rapportent plus.", "Évite les guêpes : une piqûre fait perdre un cœur.", "Les feuilles mortes font perdre des points."],
  niveaux: 30,
  theme: THEMES.jardin,
  images: { grappe: "/jeux/reunion/letchi-grappe.webp" },
  creer: (c, n) => new Letchis(c, n),
};
export default def;
