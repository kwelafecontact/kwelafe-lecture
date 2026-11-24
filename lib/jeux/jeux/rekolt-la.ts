// Rékolt la ! : les fruits sortent des buissons du jardin créole ; on ramasse les bons, on évite les guêpes.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, etoilesPour } from "../commun/moteur2d";
import { PHOTOS } from "../commun/photos";
const A_CUEILLIR = PHOTOS.filter((p) => p.id !== "vanille");
import { guepe } from "../commun/dessins";

type Sortie = { trou: number; type: "fruit" | "gate" | "guepe" | "or"; id: string; vie: number; max: number; touche: number };

class Rekolt implements Jeu {
  L: number; H: number;
  temps = 0; score = 0; coeurs = 3; fini = false;
  duree = 45;
  sorties: Sortie[] = [];
  prochain = 0.6;
  serie = 0;
  objectif: number;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.objectif = 300 + niveau * 60;
    this.hud();
  }
  redim(L: number, H: number) { this.L = L; this.H = H; }
  hud() { this.c.hud({ score: this.score, objectif: `objectif ${this.objectif}`, temps: Math.max(0, this.duree - this.temps), info: "❤".repeat(this.coeurs) + "♡".repeat(3 - this.coeurs) }); }
  trous() {
    const cols = 3, lignes = 3, w = Math.min(this.L / cols, 200), h = Math.min((this.H * 0.62) / lignes, 170);
    const x0 = (this.L - w * cols) / 2, y0 = this.H * 0.3;
    return Array.from({ length: 9 }, (_, i) => ({ x: x0 + (i % cols) * w + w / 2, y: y0 + Math.floor(i / cols) * h + h * 0.6, t: Math.min(w, h) }));
  }
  down(x: number, y: number) {
    if (this.fini) return;
    const tr = this.trous();
    const s = this.sorties.find((s) => !s.touche && Math.hypot(tr[s.trou].x - x, tr[s.trou].y - tr[s.trou].t * 0.35 - y) < tr[s.trou].t * 0.42);
    if (!s) return;
    s.touche = 0.01;
    const p = tr[s.trou], py = p.y - p.t * 0.35;
    if (s.type === "guepe") {
      this.coeurs--; this.serie = 0; this.c.sons.mauvais(); this.c.fx.secouer(0.35); this.c.fx.eclair("255,80,60", 0.4);
      this.c.fx.texte("Aïe ! Piqûre !", p.x, py, "#ff8a7a", 26);
      if (this.coeurs <= 0) { this.fini = true; this.c.fin({ gagne: false, score: this.score, etoiles: 0 }); }
    } else if (s.type === "gate") {
      this.score = Math.max(0, this.score - 15); this.serie = 0; this.c.sons.mauvais(); this.c.fx.texte("Gâté ! −15", p.x, py, "#c8a07a", 22);
    } else {
      this.serie++;
      const gain = (s.type === "or" ? 50 : 10) + Math.min(this.serie, 10) * 2;
      this.score += gain; this.c.sons.pop(Math.min(this.serie, 8));
      this.c.fx.gerbe(p.x, py, s.type === "or" ? "#ffe066" : "#9cff6a", 14, 220, s.type === "or" ? 1 : 0);
      this.c.fx.texte(`+${gain}`, p.x, py - 20, "#ffe066", 24);
    }
    this.hud();
  }
  maj(dt: number) {
    if (this.fini) return;
    const avant = Math.ceil(this.duree - this.temps);
    this.temps += dt;
    if (Math.ceil(this.duree - this.temps) !== avant) this.hud();
    if (this.temps >= this.duree) {
      this.fini = true;
      this.c.fin({ gagne: this.score >= this.objectif, score: this.score, etoiles: etoilesPour(this.score, [this.objectif, this.objectif * 1.3, this.objectif * 1.6]) });
      return;
    }
    this.prochain -= dt;
    if (this.prochain <= 0) {
      const libres = Array.from({ length: 9 }, (_, i) => i).filter((i) => !this.sorties.some((s) => s.trou === i));
      if (libres.length) {
        const trou = libres[Math.floor(this.c.rnd() * libres.length)];
        const r = this.c.rnd(), pg = Math.min(0.32, 0.12 + this.niveau * 0.01);
        const type: Sortie["type"] = r < pg ? "guepe" : r < pg + 0.12 ? "gate" : r > 0.97 ? "or" : "fruit";
        const fr = A_CUEILLIR;
        const max = Math.max(0.7, 1.6 - this.niveau * 0.04);
        this.sorties.push({ trou, type, id: type === "or" ? "letchi-or" : fr[Math.floor(this.c.rnd() * fr.length)].id, vie: max, max, touche: 0 });
      }
      this.prochain = Math.max(0.28, 0.85 - this.niveau * 0.025) * (0.6 + this.c.rnd() * 0.8);
    }
    for (const s of this.sorties) { if (s.touche) s.touche += dt; else s.vie -= dt; }
    this.sorties = this.sorties.filter((s) => s.vie > -0.2 && s.touche < 0.25);
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const tr = this.trous();
    tr.forEach((p, i) => {
      const s = this.sorties.find((x) => x.trou === i);
      // le fruit sort du buisson (dessiné derrière les feuilles du devant)
      if (s) {
        const age = s.max - s.vie;
        const sortie = Math.min(1, age * 6, Math.max(0, (s.vie + 0.2) * 5)) * (s.touche ? 1 - s.touche * 4 : 1);
        const y = p.y - p.t * 0.35 * sortie + p.t * 0.2;
        if (s.type === "guepe") guepe(ctx, p.x, y - p.t * 0.05, p.t * 0.55, this.temps);
        else {
          sprite(ctx, this.c.img(s.id), p.x, y, p.t * 0.62, Math.sin(this.temps * 4 + i) * 0.1);
          if (s.type === "gate") {
            ctx.save(); ctx.globalAlpha = 0.65; ctx.fillStyle = "#4a3418";
            for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(p.x + Math.cos(k * 2.3) * p.t * 0.15, y + Math.sin(k * 1.7) * p.t * 0.13, p.t * (0.05 + (k % 3) * 0.025), 0, 7); ctx.fill(); }
            ctx.restore();
            ctx.fillStyle = "#1a1a1a"; for (let k = 0; k < 3; k++) { const a = this.temps * 6 + k * 2; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * p.t * 0.3, y - p.t * 0.2 + Math.sin(a * 1.3) * p.t * 0.1, 2.5, 0, 7); ctx.fill(); }
          }
        }
      }
      // buisson
      ctx.save();
      const verts = ["#2f7a2a", "#3a8f34", "#4aa63e"];
      for (let k = 0; k < 7; k++) {
        ctx.fillStyle = verts[k % 3];
        const a = (k / 7) * Math.PI - Math.PI, bx = p.x + Math.cos(a) * p.t * 0.38, by = p.y + p.t * 0.12 + Math.sin(a) * p.t * 0.12;
        ctx.beginPath(); ctx.arc(bx, by, p.t * 0.2 + Math.sin(this.temps * 2 + k + i) * 1.5, 0, 7); ctx.fill();
      }
      ctx.fillStyle = "#3a8f34"; ctx.beginPath(); ctx.ellipse(p.x, p.y + p.t * 0.25, p.t * 0.48, p.t * 0.16, 0, 0, 7); ctx.fill();
      ctx.restore();
    });
  }
}

const def: DefJeu = {
  id: "rekolt-la",
  titre: "Rékolt la !",
  accroche: "Les fruits sortent des buissons du jardin créole : ramasse-les vite !",
  regles: ["Touche les fruits avant qu'ils ne se cachent.", "Évite les guêpes : une piqûre te fait perdre un cœur.", "Les fruits gâtés font perdre des points.", "Le letchi doré rapporte gros !"],
  niveaux: 20,
  theme: THEMES.jardin,
  visuels: "photos",
  creer: (c, n) => new Rekolt(c, n),
};
export default def;
