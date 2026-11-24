// Marchand du bazar : les clients arrivent avec leur liste, on les sert vite pour gagner des pièces.
import { type Contexte, type DefJeu, type Jeu, THEMES, FONDS_AQUARELLE, sprite, texteContour, arrondi, melanger, etoilesPour } from "../commun/moteur2d";
import { FRUITS_MARCHE, photosMarche } from "../commun/photos";
import { personnage, bulle, jauge, cagette, dans } from "../commun/dessins";

type Ligne = { id: string; n: number; servi: number };

class Marchand implements Jeu {
  L: number; H: number;
  temps = 0; pieces = 0; fini = false;
  duree = 75;
  objectif: number;
  etal: string[];
  liste: Ligne[] = [];
  patience = 1; dureePatience: number;
  client = 0; arrivee = 0; depart = 0;
  zones: { id: string; x: number; y: number; w: number; h: number }[] = [];
  secoue: Record<number, number> = {};
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.objectif = 80 + niveau * 18;
    this.dureePatience = Math.max(8, 18 - niveau * 0.4);
    const nb = niveau <= 6 ? 6 : niveau <= 14 ? 8 : 9;
    // au moins la moitié de l'étal vient des fruits ajoutés pour le marché
    const nouveaux = melanger(FRUITS_MARCHE, c.rnd).slice(0, Math.ceil(nb / 2));
    this.etal = melanger([...nouveaux, ...melanger(photosMarche().filter((id) => !nouveaux.includes(id)), c.rnd).slice(0, nb - nouveaux.length)], c.rnd);
    this.disposer(); this.nouveau(); this.hud();
  }
  hud() { this.c.hud({ score: this.pieces, objectif: `objectif ${this.objectif} 🪙`, temps: Math.max(0, this.duree - this.temps) }); }
  disposer() {
    const n = this.etal.length, cols = n <= 6 ? 3 : n <= 8 ? 4 : 3, lignes = Math.ceil(n / cols);
    const zoneH = this.H * 0.38, cw = Math.min((this.L * 0.92) / cols, 130), ch = Math.min(zoneH / lignes, 105);
    const x0 = (this.L - cw * cols) / 2, y0 = this.H - zoneH - 12;
    this.zones = this.etal.map((id, i) => ({ id, x: x0 + (i % cols) * cw + 5, y: y0 + Math.floor(i / cols) * ch + 5, w: cw - 10, h: ch - 10 }));
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  nouveau() {
    const nb = Math.min(this.etal.length, 1 + Math.floor(this.c.rnd() * Math.min(4, 1 + this.niveau / 4)));
    this.liste = melanger(this.etal, this.c.rnd).slice(0, nb).map((id) => ({ id, n: 1 + Math.floor(this.c.rnd() * Math.min(3, 1 + this.niveau / 6)), servi: 0 }));
    this.patience = 1; this.client = Math.floor(this.c.rnd() * 1000); this.arrivee = 0; this.depart = 0;
  }
  down(x: number, y: number) {
    if (this.fini || this.depart > 0) return;
    const i = this.zones.findIndex((z) => dans(x, y, z)); if (i < 0) return;
    const z = this.zones[i], l = this.liste.find((l) => l.id === z.id && l.servi < l.n);
    if (l) {
      l.servi++; this.c.sons.pop(l.servi);
      this.c.fx.gerbe(z.x + z.w / 2, z.y + z.h / 2, "#ffe066", 6, 150, 1);
      if (this.liste.every((l) => l.servi >= l.n)) this.encaisser();
    } else {
      this.secoue[i] = 0.4; this.c.sons.mauvais(); this.patience = Math.max(0, this.patience - 0.15);
    }
  }
  encaisser() {
    const total = this.liste.reduce((s, l) => s + l.n, 0);
    const gain = total * 4 + Math.round(this.patience * 12);
    this.pieces += gain; this.depart = 0.7;
    this.c.sons.piece(); this.c.fx.texte(`+${gain} 🪙`, this.L * 0.25, this.H * 0.12, "#ffe066", 32); this.c.fx.etoiles(this.L * 0.25, this.H * 0.2, 14);
    if (this.patience > 0.65) this.c.fx.texte("Merci !", this.L * 0.5, this.H * 0.3, "#9cff9c", 30);
    this.hud();
  }
  maj(dt: number) {
    if (this.fini) return;
    const avant = Math.ceil(this.duree - this.temps);
    this.temps += dt;
    if (Math.ceil(this.duree - this.temps) !== avant) this.hud();
    if (this.temps >= this.duree) { this.fini = true; this.c.fin({ gagne: this.pieces >= this.objectif, score: this.pieces, etoiles: etoilesPour(this.pieces, [this.objectif, this.objectif * 1.3, this.objectif * 1.6]) }); return; }
    for (const k in this.secoue) this.secoue[k] = Math.max(0, this.secoue[k] - dt);
    this.arrivee = Math.min(1, this.arrivee + dt * 2.2);
    if (this.depart > 0) { this.depart -= dt; if (this.depart <= 0) this.nouveau(); return; }
    if (this.arrivee >= 1) {
      this.patience -= dt / this.dureePatience;
      if (this.patience <= 0) { this.c.sons.mauvais(); this.c.fx.texte("Trop lent…", this.L / 2, this.H * 0.3, "#ffb0a0", 26); this.depart = 0.5; }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this;
    if (!FONDS_AQUARELLE.has("marchand-du-bazar")) {
    ctx.fillStyle = "#5e3a22"; ctx.fillRect(0, H * 0.58, L, H * 0.42);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#fff3e0" : "#3a8ae8"; const w = L / 12; ctx.beginPath(); ctx.moveTo(i * w, 0); ctx.lineTo((i + 1) * w, 0); ctx.lineTo((i + 1) * w, 36); ctx.arc(i * w + w / 2, 36, w / 2, 0, Math.PI); ctx.fill(); }
    }
    const sortie = this.depart > 0 ? (0.7 - this.depart) / 0.7 : 0;
    const cx = L * 0.18 - (1 - this.arrivee) * L * 0.4 + sortie * L * 0.8, cy = H * 0.32, t = Math.min(L, H) * 0.19;
    personnage(ctx, cx, cy, t, this.client, this.depart > 0 ? 1 : this.patience, this.temps);
    if (this.arrivee > 0.6 && this.depart <= 0) {
      const bw = Math.max(170, this.liste.length * 78 + 24), bx = Math.min(cx + t * 0.35, L - bw - 10), by = cy - t * 0.95;
      bulle(ctx, bx, by, bw, 96);
      this.liste.forEach((l, i) => {
        const x = bx + 44 + i * 78, fait = l.servi >= l.n;
        sprite(ctx, this.c.img(l.id), x, by + 42, 50, 0, fait ? 0.35 : 1, false);
        texteContour(ctx, fait ? "✓" : `${l.servi}/${l.n}`, x + 18, by + 74, 16, fait ? "#4cd47a" : "#fff");
      });
      jauge(ctx, bx + 12, by + 104, bw - 24, 10, this.patience);
    }
    this.zones.forEach((z, i) => {
      const dx = this.secoue[i] ? Math.sin(this.temps * 60) * 6 * this.secoue[i] : 0;
      cagette(ctx, z.x + dx, z.y, z.w, z.h);
      sprite(ctx, this.c.img(z.id), z.x + z.w / 2 + dx, z.y + z.h * 0.42, Math.min(z.w, z.h) * 0.92);
    });
    // tirelire
    ctx.fillStyle = "rgba(0,0,0,0.3)"; arrondi(ctx, L - 150, H * 0.5, 130, 44, 22); ctx.fill();
    texteContour(ctx, `🪙 ${this.pieces}`, L - 85, H * 0.5 + 22, 22, "#ffe066");
  }
}

const def: DefJeu = {
  id: "marchand-du-bazar",
  titre: "Marchand du bazar",
  accroche: "Tu tiens un étal au bazar. Les clients arrivent avec leur liste : sers-les vite !",
  regles: ["La bulle du client montre ce qu'il veut, et combien.", "Touche les produits de ton étal pour remplir sa commande.", "Plus tu es rapide, plus le client te donne de pièces.", "Atteins l'objectif de pièces avant la fin du temps."],
  niveaux: 20,
  theme: THEMES.marche,
  visuels: "photos",
  creer: (c, n) => new Marchand(c, n),
};
export default def;
