// Marchand du bazar (refonte KwFX v4.1) : on remplit le bertel du client avec les produits de l'étal.
// Inventions péi : le bertel à remplir pour un prix juste (le client donne un budget, pas une liste) ; le marché du soir, éclairé à la lampe, avec ses prix de fin de marché.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, melanger } from "../commun/moteur2d";
import { photosMarche, photo, couleurDe } from "../commun/photos";
import { personnage, bulle, jauge, cagette, dans } from "../commun/dessins";
import { Combo, Choix, Guide, bertel, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

type Ligne = { id: string; n: number; servi: number };
type Volant = { id: string; t: number; x0: number; y0: number };
const prixDe = (id: string) => 1 + (id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0) % 4);

class Marchand implements Jeu {
  L: number; H: number; pb: boolean;
  temps = 0; pieces = 0; fini = false;
  etal: string[]; zones: { id: string; x: number; y: number; w: number; h: number }[] = [];
  liste: Ligne[] = []; budget = 0; sac: string[] = []; volants: Volant[] = [];
  client = 0; arrivee = 0; depart = 0; servis = 0; objectif: number; parfaits = 0; departs = 0;
  patience = 1; dureePatience: number;
  soir = false; promo: string | null = null; lampe: any = null;
  pourboire = 0; choixFait = false; secoue: Record<number, number> = {}; pop = 0;
  btn: Btn = { x: 0, y: 0, w: 0, h: 0 };
  combo: Combo; choix: Choix; guide: Guide;
  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    const n = c.niveau;
    this.objectif = this.pb ? 6 + Math.floor(n / 5) : 5;
    this.dureePatience = Math.max(14, 30 - n * 0.5);
    this.etal = melanger(photosMarche(), c.rnd).slice(0, 6);
    if (this.pb && !this.etal.some((id) => prixDe(id) === 1)) { const un = photosMarche().find((id) => prixDe(id) === 1 && !this.etal.includes(id)); if (un) this.etal[0] = un; }
    this.combo = new Combo(c, 4); this.choix = new Choix(c); this.guide = new Guide(n === 1);
    this.disposer(); this.nouveau(); this.hud();
  }
  prix(id: string) { return Math.max(1, prixDe(id) - (this.promo === id ? 1 : 0)); }
  get total() { return this.sac.reduce((s, id) => s + this.prix(id), 0); }
  hud() { this.c.hud({ score: this.pieces, objectif: `${this.servis}/${this.objectif} clients${this.pb ? " · " + "🧡".repeat(3 - this.departs) : ""}`, info: this.soir ? "Marché du soir : un produit est en promotion" : this.pb ? "Remplis le bertel pour le prix juste" : "Sers ce que montre la bulle" }); }
  disposer() {
    const { L, H } = this, m = marge(L, H), cols = 3, lg = 2, zoneH = Math.min(H * 0.34, 236), cw = Math.min((L - m * 2) / cols, 136), ch = zoneH / lg, x0 = (L - cw * cols) / 2, y0 = H - zoneH - m - 4;
    this.zones = this.etal.map((id, i) => ({ id, x: x0 + (i % cols) * cw + 5, y: y0 + Math.floor(i / cols) * ch + 5, w: cw - 10, h: ch - 10 }));
    const bw = Math.min(L * 0.42, 190), bh = Math.max(56, Math.min(66, H * 0.08));
    this.btn = { x: L / 2 + 10, y: y0 - bh - 14, w: bw, h: bh };
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  get bulleR() { const w = Math.min(this.L * 0.58, 310), h = Math.min(this.H * 0.13, 104); return { x: this.L * 0.38, y: Math.max(134, this.H * 0.165), w, h }; }
  get sacR() { const t = Math.min(this.L * 0.3, this.H * 0.17, 130); return { x: this.L / 2 - t - 14, y: this.btn.y + this.btn.h - t, w: t, h: t }; }
  nouveau() {
    const n = this.c.niveau;
    this.sac = []; this.volants = []; this.patience = 1; this.client = Math.floor(this.c.rnd() * 1000); this.arrivee = 0; this.depart = 0;
    if (this.pb) {
      // un budget qu'on peut toujours atteindre pile avec 2 à 4 produits de l'étal
      const k = 2 + Math.floor(this.c.rnd() * Math.min(3, 1 + n / 5));
      this.budget = melanger(this.etal, this.c.rnd).slice(0, k).reduce((s, id) => s + this.prix(id), 0); this.liste = [];
      this.guide.dire("budget", "Le client donne un budget. Choisis des produits pour tomber pile sur ce prix.");
    } else {
      const nb = 1 + Math.floor(this.c.rnd() * Math.min(3, 1 + n / 4));
      this.liste = melanger(this.etal, this.c.rnd).slice(0, nb).map((id) => ({ id, n: 1 + Math.floor(this.c.rnd() * Math.min(3, 1 + n / 6)), servi: 0 }));
      const z = this.zones.find((q) => q.id === this.liste[0].id)!;
      this.guide.dire("sers", "Touche sur ton étal les produits que montre la bulle.", { x: z.x + z.w / 2, y: z.y + z.h / 2 });
    }
  }
  complet() { return this.pb ? this.total === this.budget : this.liste.every((l) => l.servi >= l.n); }
  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H) || this.depart > 0) return;
    if (this.pb && dansBtn(x, y, this.btn)) { this.servir(); return; }
    if (this.pb && dans(x, y, this.sacR) && this.sac.length) { const id = this.sac.pop()!; this.c.kw.ev("clic", x, y); this.c.fx.texte("− " + (photo(id)?.nom || ""), x, y - 24, "#fff", 16); return; }
    const i = this.zones.findIndex((z) => dans(x, y, z)); if (i < 0) return;
    const z = this.zones[i], id = z.id;
    if (this.pb) {
      if (this.total + this.prix(id) > this.budget) { this.secoue[i] = 0.4; this.combo.presque(x, y, "Trop cher pour ce budget"); return; }
    } else {
      const l = this.liste.find((q) => q.id === id && q.servi + this.volants.filter((v) => v.id === id).length < q.n);
      if (!l) { this.secoue[i] = 0.4; this.combo.presque(x, y, "Pas dans sa liste"); return; }
    }
    this.volants.push({ id, t: 0, x0: z.x + z.w / 2, y0: z.y + z.h / 2 }); this.c.kw.ev("clic", x, y); this.guide.fait();
  }
  servir() {
    const S = this.sacR, cx = S.x + S.w / 2, cy = S.y + S.h / 2, ecart = this.budget - this.total;
    if (!this.sac.length) return;
    let gain: number;
    if (ecart === 0) { gain = this.budget * 10 + Math.round(Math.max(0, this.patience) * 30); this.parfaits++; this.payer(gain, cx, cy, true); }
    else if (ecart <= 1) { this.combo.n = 0; this.combo.presque(cx, cy, "Presque le prix juste"); gain = this.budget * 5; this.pieces += gain; this.depart = 0.01; this.servis++; }
    else { this.combo.presque(cx, cy, `Il reste ${ecart} pièces à dépenser`); return; }
    this.hud();
  }
  payer(gain: number, x: number, y: number, parfait: boolean) {
    if (this.pourboire > 0) { gain *= 2; this.pourboire--; }
    if (this.soir && !this.pb) gain += 20;
    this.pieces += this.combo.bon(x, y, gain, "#FFD23F"); this.pop = 1;
    this.c.kw.joue("koudminPei", x, y, { intensite: parfait ? 0.9 : 0.5 }); this.c.kw.son("pieces");
    this.depart = 0.01; this.servis++; this.hud();
  }
  suivant() {
    if (this.servis >= this.objectif) return this.finir(true);
    if (this.pb && this.departs >= 3) return this.finir(false);
    if (!this.soir && this.servis >= Math.ceil(this.objectif / 2)) this.tombeeDuSoir();
    if (!this.choixFait && this.servis === 2) {
      this.choixFait = true;
      this.choix.proposer([{ id: "pourboire", ic: "🪙", nom: "Pourboire", txt: "Tes deux prochains clients paient double." }, this.pb ? { id: "patience", ic: "🌴", nom: "Clients patients", txt: "Les clients attendent plus longtemps." } : { id: "bonus", ic: "🎁", nom: "Petit cadeau", txt: "50 pièces tout de suite." }],
        (id) => { if (id === "pourboire") this.pourboire = 2; else if (id === "patience") this.dureePatience *= 1.5; else { this.pieces += 50; this.hud(); } });
    }
    this.c.kw.joue("etoiles", this.L * 0.2, this.H * 0.25, { intensite: 0.4 });
    this.nouveau();
  }
  /** Le soleil se couche : on allume la lampe de l'étal, un produit passe en prix de fin de marché. */
  tombeeDuSoir() {
    this.soir = true; this.c.nuit(0.62, 2500);
    const z0 = this.zones[1], z1 = this.zones[4];
    this.lampe = this.c.kw.lampe(z0.x + z0.w / 2, (z0.y + z1.y + z1.h) / 2, { couleur: "#FFC46B", rayon: Math.max(this.L, this.H) * 0.5, force: 1.3, scintille: 0.12 });
    this.c.kw.lampe(this.L * 0.3, this.bulleR.y + this.bulleR.h * 0.6, { couleur: "#FFD9A0", rayon: this.L * 0.5, force: 1.1 });
    this.c.kw.lucioles(14);
    const chers = this.etal.filter((id) => prixDe(id) >= 2); this.promo = chers[Math.floor(this.c.rnd() * chers.length)] || null;
    this.c.kw.banniere("Le marché du soir commence", 0.5); this.c.kw.son("oiseau"); this.hud();
  }
  finir(gagne: boolean) {
    this.fini = true; const r = this.parfaits / this.objectif;
    this.c.fin({ gagne, score: this.pieces, etoiles: !gagne ? 0 : this.pb ? (r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1) : this.combo.meilleur >= 4 ? 3 : this.combo.meilleur >= 2 ? 2 : 1, lignes: [`${this.servis} clients servis · ${this.pieces} pièces`] });
  }
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.combo.maj(dt); this.arrivee = Math.min(1, this.arrivee + dt * 2.2); this.pop = Math.max(0, this.pop - dt * 3);
    for (const k in this.secoue) this.secoue[k] = Math.max(0, this.secoue[k] - dt);
    for (const v of this.volants) v.t += dt * 3.4;
    for (const v of this.volants.filter((q) => q.t >= 1)) {
      const S = this.sacR; this.pop = 1; this.c.kw.joue("eclat", S.x + S.w / 2, S.y + S.h * 0.4, { couleur: couleurDe(v.id), intensite: 0.3 }); this.c.kw.son("bertel");
      if (this.pb) this.sac.push(v.id); else { const l = this.liste.find((q) => q.id === v.id && q.servi < q.n); if (l) l.servi++; this.sac.push(v.id); }
    }
    this.volants = this.volants.filter((v) => v.t < 1);
    if (this.depart > 0) { this.depart += dt * 1.4; if (this.depart >= 1) this.suivant(); return; }
    if (!this.pb && this.complet() && !this.volants.length) { const S = this.sacR; this.payer(this.liste.reduce((s, l) => s + l.n, 0) * 15, S.x + S.w / 2, S.y + S.h / 2, true); return; }
    if (this.pb) {
      if (this.complet()) this.guide.dire("servir", "Pile le bon prix ! Touche SERVIR.", { x: this.btn.x + this.btn.w / 2, y: this.btn.y + this.btn.h / 2 });
      this.patience -= dt / this.dureePatience;
      if (this.patience <= 0) { this.departs++; this.combo.n = 0; this.depart = 0.01; this.c.kw.ev("presque", this.L * 0.2, this.H * 0.22); this.c.fx.texte("Le client reviendra demain", this.L / 2, this.H * 0.3, "#fff", 20); this.hud(); }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, R = this.bulleR, S = this.sacR;
    const cx = L * 0.19, cy = R.y + R.h * 0.95, ct = Math.min(L * 0.3, H * 0.2, 150);
    ctx.save(); ctx.translate((1 - this.arrivee) * -L * 0.4 - this.depart * L * 0.5, 0);
    personnage(ctx, cx, cy, ct, this.client, this.pb ? this.patience : 1, this.temps); ctx.restore();
    if (this.arrivee > 0.6 && this.depart <= 0) {
      bulle(ctx, R.x, R.y, R.w, R.h);
      if (this.pb) { texteContour(ctx, `Budget : ${this.budget} 🪙`, R.x + R.w / 2, R.y + R.h * 0.36, Math.min(24, R.w * 0.1), "#7A3A1A"); texteContour(ctx, "pile, sans dépasser", R.x + R.w / 2, R.y + R.h * 0.72, Math.min(15, R.w * 0.06), "#8A6A4A"); jauge(ctx, R.x, R.y + R.h + 10, R.w, 12, Math.max(0, this.patience)); }
      else {
        const t = Math.min(R.h * 0.62, R.w / this.liste.length - 26);
        this.liste.forEach((l, i) => { const x = R.x + R.w / 2 + (i - (this.liste.length - 1) / 2) * (t + 34) - 10, ok = l.servi >= l.n; sprite(ctx, this.c.img(l.id), x, R.y + R.h / 2, t, 0, ok ? 0.35 : 1); texteContour(ctx, ok ? "✓" : `×${l.n - l.servi}`, x + t * 0.7, R.y + R.h / 2, Math.min(22, t * 0.4), ok ? "#3aa85a" : "#7A3A1A"); });
      }
    }
    // bertel du client
    const e = 1 + this.pop * 0.1;
    ctx.save(); ctx.translate(S.x + S.w / 2, S.y + S.h / 2); ctx.scale(e, e); ctx.translate(-S.x - S.w / 2, -S.y - S.h / 2);
    bertel(ctx, S.x, S.y, S.w, S.h, this.pb ? this.total / Math.max(1, this.budget) : this.sac.length / Math.max(1, this.liste.reduce((s, l) => s + l.n, 0)), "#C9A45A", this.complet() ? 1 : 0);
    this.sac.slice(-4).forEach((id, i) => sprite(ctx, this.c.img(id), S.x + S.w * (0.3 + (i % 2) * 0.4), S.y + S.h * (0.42 + Math.floor(i / 2) * 0.26), S.w * 0.36, 0, 1, false));
    ctx.restore();
    if (this.pb) {
      texteContour(ctx, `${this.total} / ${this.budget} 🪙`, S.x + S.w / 2, S.y - 14, 19, this.total === this.budget ? "#9CFF9C" : "#FFE066");
      bouton(ctx, this.btn, "SERVIR", this.complet() ? "#3aa85a" : "#E8572A", 0, this.sac.length > 0);
      if (this.sac.length) texteContour(ctx, "Touche le bertel pour retirer", S.x + S.w / 2, S.y + S.h + 14, 12, "#fff");
    }
    for (const v of this.volants) { const k = v.t * v.t * (3 - 2 * v.t); sprite(ctx, this.c.img(v.id), v.x0 + (S.x + S.w / 2 - v.x0) * k, v.y0 + (S.y + S.h * 0.3 - v.y0) * k - Math.sin(k * Math.PI) * 70, 54, k * 4); }
    // étal (zone du pouce)
    this.zones.forEach((z, i) => {
      const s = this.secoue[i] ? Math.sin(this.secoue[i] * 50) * 5 : 0, promo = this.promo === z.id;
      cagette(ctx, z.x + s, z.y, z.w, z.h, promo ? 0.8 : 0);
      sprite(ctx, this.c.img(z.id), z.x + z.w / 2 + s, z.y + z.h * 0.44, Math.min(z.w, z.h) * 0.7);
      const nom = photo(z.id)?.nom; if (nom) texteContour(ctx, nom, z.x + z.w / 2 + s, z.y + z.h - 11, Math.min(13, z.w * 0.13), "#fff");
      if (this.pb) { ctx.fillStyle = promo ? "#E63946" : "#FFD23F"; ctx.beginPath(); ctx.arc(z.x + z.w - 16 + s, z.y + 16, 15, 0, 7); ctx.fill(); texteContour(ctx, String(this.prix(z.id)), z.x + z.w - 16 + s, z.y + 17, 17, "#fff"); }
    });
    if (this.soir) { const z = this.zones[1]; ctx.fillStyle = "#FFE9B5"; ctx.beginPath(); ctx.arc(z.x + z.w / 2, z.y - 14 + Math.sin(this.temps * 1.5) * 2, 9, 0, 7); ctx.fill(); ctx.strokeStyle = "#5A3A22"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(z.x + z.w / 2, z.y - 23); ctx.lineTo(z.x + z.w / 2, z.y - 40); ctx.stroke(); }
    this.combo.dessiner(ctx, L * 0.2, this.bulleR.y - 6);
    this.guide.dessiner(ctx, L, H, this.temps, R.y + R.h + 30);
    this.choix.dessiner(ctx, L, H);
    void arrondi;
  }
}

const def: DefJeu = {
  id: "marchand-du-bazar", titre: "Marchand du bazar", accroche: "Remplis le bertel de chaque client, du matin jusqu'au marché du soir.",
  regles: [], niveaux: 20, theme: THEMES.coucher, visuels: "photos",
  modes: {
    trankil: ["La bulle montre ce que veut le client.", "Touche les produits de ton étal : ils sautent dans son bertel.", "Aucun chrono. Le soir, on allume la lampe et les clients sont généreux."],
    probleme: ["Le client donne seulement un budget.", "Remplis son bertel pour tomber pile sur ce prix, puis touche SERVIR.", "Le soir, un produit passe en promotion : les comptes changent."],
  },
  decor: { lieu: "marche", heure: "jour" }, themeFx: "reunion",
  creer: (c) => new Marchand(c),
};
export default def;
