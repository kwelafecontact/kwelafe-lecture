// Le marché des jus : le client commande un jus, on met les bons fruits dans le blender.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, melanger } from "../commun/moteur2d";
import { PRODUITS, produit, type Produit } from "../commun/produits";
import { personnage, bulle, jauge, dessinerBouton, cagette, dans, vers, type Bouton } from "../commun/dessins";

const JUTEUX = PRODUITS.filter((p) => p.categorie === "fruit" && p.jus.quantite >= 0.3 && p.id !== "coco").map((p) => p.id);

type Volant = { id: string; x: number; y: number; t: number; x0: number; y0: number; x1: number; y1: number };

class MarcheDesJus implements Jeu {
  L: number; H: number;
  temps = 0;
  score = 0;
  coeurs = 3;
  servis = 0;
  objectif: number;
  etal: string[];
  recette: string[] = [];
  dansBlender: string[] = [];
  patience = 1;
  dureePatience: number;
  client = 0;
  arrivee = 0;            // animation d'arrivée du client (0 → 1)
  mixage = 0;             // > 0 pendant le mixage
  verre = 0;              // > 0 : le verre part vers le client
  volants: Volant[] = [];
  secoue: Record<number, number> = {};
  btn: Bouton = { x: 0, y: 0, w: 160, h: 56, texte: "MIXER", actif: false, appui: 0, couleur: "#e8572a" };
  zones: { id: string; x: number; y: number; w: number; h: number }[] = [];
  niveau: number;
  fini = false;

  constructor(private c: Contexte, niveau: number) {
    this.L = c.L; this.H = c.H; this.niveau = niveau;
    this.objectif = 4 + Math.floor(niveau / 3);
    this.dureePatience = Math.max(9, 22 - niveau * 0.45);
    const nbEtal = niveau <= 5 ? 6 : niveau <= 15 ? 9 : 12;
    this.etal = melanger(JUTEUX, c.rnd).slice(0, nbEtal);
    this.disposer();
    this.nouveauClient();
    this.envoyerHud();
  }

  tailleRecette() {
    const n = this.niveau;
    const max = n <= 4 ? 1 : n <= 10 ? 2 : n <= 18 ? 3 : 4;
    return 1 + Math.floor(this.c.rnd() * max);
  }

  nouveauClient() {
    const k = Math.min(this.tailleRecette(), this.etal.length);
    this.recette = melanger(this.etal, this.c.rnd).slice(0, k).sort();
    this.dansBlender = [];
    this.patience = 1;
    this.client = Math.floor(this.c.rnd() * 1000);
    this.arrivee = 0;
  }

  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }

  disposer() {
    const { L, H } = this;
    const n = this.etal.length, cols = n <= 6 ? 3 : n <= 9 ? 3 : 4, lignes = Math.ceil(n / cols);
    const zoneH = H * 0.36, cw = Math.min((L * 0.92) / cols, 130), ch = Math.min(zoneH / lignes, 110);
    const x0 = (L - cw * cols) / 2, y0 = H - zoneH - 16;
    this.zones = this.etal.map((id, i) => ({ id, x: x0 + (i % cols) * cw + 5, y: y0 + Math.floor(i / cols) * ch + 5, w: cw - 10, h: ch - 10 }));
    this.btn.x = L / 2 - this.btn.w / 2; this.btn.y = y0 - 70;
  }

  get blender() { return { x: this.L * 0.68, y: this.H * 0.43, w: Math.min(this.L * 0.2, 120), h: Math.min(this.H * 0.2, 150) }; }

  envoyerHud() {
    this.c.hud({ score: this.score, objectif: `${this.servis}/${this.objectif} jus`, info: "❤".repeat(this.coeurs) + "♡".repeat(3 - this.coeurs) });
  }

  down(x: number, y: number) {
    if (this.fini) return;
    if (this.btn.actif && dans(x, y, this.btn)) { this.btn.appui = 1; this.mixer(); return; }
    if (this.mixage > 0 || this.verre > 0) return;
    const z = this.zones.find((z) => dans(x, y, z));
    if (!z) return;
    const manque = this.recette.filter((r) => !this.dansBlender.includes(r));
    if (manque.includes(z.id) && !this.volants.some((v) => v.id === z.id)) {
      const b = this.blender;
      this.volants.push({ id: z.id, x: z.x + z.w / 2, y: z.y + z.h / 2, t: 0, x0: z.x + z.w / 2, y0: z.y + z.h / 2, x1: b.x + b.w / 2, y1: b.y + b.h * 0.3 });
      this.c.sons.swoosh();
    } else {
      this.c.sons.mauvais();
      this.secoue[this.zones.indexOf(z)] = 0.4;
      this.patience = Math.max(0, this.patience - 0.12);
      this.c.fx.texte("Pa sa !", z.x + z.w / 2, z.y, "#ff6a5a", 26);
    }
  }
  up() { this.btn.appui = 0; }

  mixer() {
    if (this.dansBlender.length < this.recette.length || this.mixage > 0) return;
    this.mixage = 0.9;
    this.c.sons.mixeur();
    this.btn.actif = false;
  }

  couleurJus() {
    const cs = this.dansBlender.map((id) => produit(id).jus.couleur);
    if (!cs.length) return "#ffffff";
    let r = 0, g = 0, b = 0;
    for (const c of cs) { const n = parseInt(c.slice(1), 16); r += n >> 16; g += (n >> 8) & 255; b += n & 255; }
    return `rgb(${Math.round(r / cs.length)},${Math.round(g / cs.length)},${Math.round(b / cs.length)})`;
  }

  maj(dt: number) {
    if (this.fini) return;
    this.temps += dt;
    this.arrivee = Math.min(1, this.arrivee + dt * 2);
    for (const k in this.secoue) this.secoue[k] = Math.max(0, this.secoue[k] - dt);
    // fruits qui volent vers le blender
    for (const v of this.volants) {
      v.t = Math.min(1, v.t + dt * 2.4);
      const e = v.t * v.t * (3 - 2 * v.t);
      v.x = v.x0 + (v.x1 - v.x0) * e;
      v.y = v.y0 + (v.y1 - v.y0) * e - Math.sin(Math.PI * v.t) * this.H * 0.18;
      if (v.t >= 1) {
        this.dansBlender.push(v.id);
        this.c.sons.plouf();
        this.c.fx.gerbe(v.x1, v.y1 + 20, produit(v.id).jus.couleur, 14, 200, 2);
      }
    }
    this.volants = this.volants.filter((v) => v.t < 1);
    this.btn.actif = this.dansBlender.length === this.recette.length && this.mixage <= 0 && this.verre <= 0;

    if (this.mixage > 0) {
      this.mixage -= dt;
      if (this.mixage <= 0) { this.verre = 0.8; }
    } else if (this.verre > 0) {
      this.verre -= dt;
      if (this.verre <= 0) this.servir();
    } else if (this.arrivee >= 1) {
      this.patience -= dt / this.dureePatience;
      if (this.patience <= 0) {
        this.coeurs--;
        this.c.sons.mauvais();
        this.c.fx.secouer(0.3);
        this.c.fx.texte("Le client est parti…", this.L / 2, this.H * 0.3, "#ff7a6a", 26);
        if (this.coeurs <= 0) return this.terminer(false);
        this.nouveauClient();
        this.envoyerHud();
      }
    }
  }

  servir() {
    const bonus = Math.round(this.patience * 20);
    const gain = 10 * this.recette.length + bonus;
    this.score += gain;
    this.servis++;
    this.c.sons.piece();
    this.c.fx.etoiles(this.L * 0.25, this.H * 0.2, 18);
    this.c.fx.texte(`+${gain}`, this.L * 0.25, this.H * 0.12, "#ffe066", 34);
    if (this.patience > 0.6) this.c.fx.texte("Lé bon !", this.L * 0.5, this.H * 0.3, "#9cff9c", 30);
    this.envoyerHud();
    if (this.servis >= this.objectif) return this.terminer(true);
    this.nouveauClient();
  }

  terminer(gagne: boolean) {
    this.fini = true;
    this.c.fin({ gagne, score: this.score, etoiles: gagne ? this.coeurs : 0 });
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this;
    // étal en bois
    ctx.fillStyle = "#6e4426"; ctx.fillRect(0, H * 0.6, L, H * 0.4);
    ctx.fillStyle = "#845430"; for (let i = 0; i < 6; i++) ctx.fillRect(0, H * 0.6 + i * H * 0.07, L, 3);
    // auvent rayé
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#fff3e0" : "#e84a3a"; ctx.beginPath(); const w = L / 12; ctx.moveTo(i * w, 0); ctx.lineTo((i + 1) * w, 0); ctx.lineTo((i + 1) * w, 40); ctx.arc(i * w + w / 2, 40, w / 2, 0, Math.PI); ctx.fill(); }

    // client
    const cx = L * 0.2 - (1 - this.arrivee) * L * 0.4, cy = H * 0.3, t = Math.min(L, H) * 0.2;
    personnage(ctx, cx, cy, t, this.client, this.patience, this.temps);
    // bulle de commande
    const bw = Math.max(160, this.recette.length * 64 + 30), bx = cx + t * 0.35, by = cy - t * 0.95;
    if (this.arrivee > 0.6) {
      bulle(ctx, bx, by, bw, 92);
      ctx.fillStyle = "#3a2414"; ctx.font = "700 14px Nunito, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(this.recette.length > 1 ? "Un jus mélangé, s'il te plaît !" : "Un jus, s'il te plaît !", bx + 14, by + 20);
      this.recette.forEach((id, i) => {
        const ok = this.dansBlender.includes(id);
        sprite(ctx, this.c.img(id), bx + 40 + i * 64, by + 58, 52, 0, ok ? 0.35 : 1, false);
        if (ok) texteContour(ctx, "✓", bx + 40 + i * 64, by + 58, 30, "#4cd47a");
      });
      jauge(ctx, bx + 14, by + 100, bw - 28, 10, this.patience);
    }

    // blender
    const b = this.blender;
    const vib = this.mixage > 0 ? Math.sin(this.temps * 80) * 3 : 0;
    ctx.save(); ctx.translate(vib, 0);
    ctx.fillStyle = "rgba(220,240,255,0.35)"; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 3;
    arrondi(ctx, b.x, b.y, b.w, b.h, 14); ctx.fill(); ctx.stroke();
    const remplissage = this.mixage > 0 || this.verre > 0 ? 0.75 : this.dansBlender.length / Math.max(1, this.recette.length) * 0.5;
    if (remplissage > 0) {
      ctx.fillStyle = this.couleurJus();
      ctx.globalAlpha = 0.85;
      const hh = b.h * remplissage;
      arrondi(ctx, b.x + 4, b.y + b.h - hh - 4, b.w - 8, hh, 10); ctx.fill();
      ctx.globalAlpha = 1;
      if (this.mixage > 0) { ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h - hh / 2, (this.temps * 120 + i * 15) % 40, 0, Math.PI); ctx.stroke(); } }
    }
    this.dansBlender.forEach((id, i) => { if (this.mixage <= 0 && this.verre <= 0) sprite(ctx, this.c.img(id), b.x + b.w / 2 + (i - (this.dansBlender.length - 1) / 2) * 22, b.y + b.h * 0.7, 40, i, 1, false); });
    ctx.fillStyle = "#3a3a44"; arrondi(ctx, b.x - 10, b.y + b.h, b.w + 20, 38, 10); ctx.fill();
    ctx.fillStyle = this.mixage > 0 ? "#4cd47a" : "#ff5a4a"; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h + 19, 7, 0, 7); ctx.fill();
    ctx.restore();

    // verre qui part vers le client
    if (this.verre > 0) {
      const k = 1 - this.verre / 0.8;
      const gx = b.x + b.w / 2 + (cx + t * 0.5 - b.x - b.w / 2) * k, gy = b.y + b.h * 0.5 - Math.sin(Math.PI * k) * 60;
      ctx.fillStyle = "rgba(255,255,255,0.6)"; arrondi(ctx, gx - 18, gy - 28, 36, 56, 6); ctx.fill();
      ctx.fillStyle = this.couleurJus(); arrondi(ctx, gx - 15, gy - 14, 30, 39, 5); ctx.fill();
      ctx.strokeStyle = "#ff5a8a"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx + 6, gy - 40); ctx.lineTo(gx + 2, gy - 4); ctx.stroke();
    }

    // étal
    this.zones.forEach((z, i) => {
      const dx = this.secoue[i] ? Math.sin(this.temps * 60) * 6 * this.secoue[i] : 0;
      const voulu = this.recette.includes(z.id) && !this.dansBlender.includes(z.id) && this.niveau <= 3;
      cagette(ctx, z.x + dx, z.y, z.w, z.h, voulu ? 0.5 + 0.5 * Math.sin(this.temps * 6) : 0);
      const s = Math.min(z.w, z.h) * 0.95;
      sprite(ctx, this.c.img(z.id), z.x + z.w / 2 + dx, z.y + z.h * 0.42, s);
    });
    for (const v of this.volants) sprite(ctx, this.c.img(v.id), v.x, v.y, 60, v.t * 6);
    dessinerBouton(ctx, this.btn, this.temps);
  }
}

const def: DefJeu = {
  id: "marche-des-jus",
  titre: "Le marché des jus",
  accroche: "Au marché forain, les clients attendent leur jus. Sois rapide !",
  regles: ["Regarde la bulle : elle montre les fruits du jus.", "Touche les bons fruits pour les jeter dans le blender.", "Appuie sur MIXER, puis sers le client avant qu'il perde patience.", "Trois clients partis, et la partie s'arrête."],
  niveaux: 30,
  theme: THEMES.marche,
  creer: (c, n) => new MarcheDesJus(c, n),
};
export default def;
export type { Produit };
