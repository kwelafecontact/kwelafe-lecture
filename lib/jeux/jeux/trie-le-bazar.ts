// Trie le bazar : les produits arrivent sur le tapis, on les range dans le bon panier.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, arrondi } from "../commun/moteur2d";
import { PRODUITS, NOMS_CATEGORIE, type Categorie, type Produit } from "../commun/produits";
import { panier, dans } from "../commun/dessins";

type Objet = { p: Produit; x: number; y: number; tenu: boolean; tombe: number; rot: number };
const COULEURS: Record<Categorie, string> = { fruit: "#e8572a", legume: "#3a9a4a", epice: "#a8401a" };

class Trie implements Jeu {
  L: number; H: number;
  temps = 0; score = 0; erreurs = 0; tries = 0; fini = false;
  objets: Objet[] = [];
  prochain = 0.5;
  vitesse: number; objectif: number;
  cats: Categorie[];
  tenu: Objet | null = null;
  decal = { x: 0, y: 0 };
  serie = 0;
  surligne: Record<string, number> = {};
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.vitesse = 70 + niveau * 7;
    this.objectif = 10 + niveau;
    this.cats = niveau < 8 ? ["fruit", "legume"] : ["fruit", "legume", "epice"];
    this.hud();
  }
  redim(L: number, H: number) { this.L = L; this.H = H; }
  get tapisY() { return this.H * 0.36; }
  paniers() {
    const n = this.cats.length, w = Math.min((this.L * 0.9) / n - 14, 180), h = Math.min(this.H * 0.22, 140);
    const x0 = (this.L - (w + 14) * n) / 2 + 7, y = this.H - h - 30;
    return this.cats.map((cat, i) => ({ cat, x: x0 + i * (w + 14), y, w, h }));
  }
  hud() { this.c.hud({ score: this.score, objectif: `${this.tries}/${this.objectif}`, info: "✕".repeat(this.erreurs) + "·".repeat(Math.max(0, 3 - this.erreurs)) }); }
  generer() {
    const choix = PRODUITS.filter((p) => this.cats.includes(p.categorie));
    // un peu plus de légumes et d'épices qu'au hasard, pour l'équilibre
    const pool = this.c.rnd() < 0.45 ? choix.filter((p) => p.categorie !== "fruit") : choix;
    const p = pool[Math.floor(this.c.rnd() * pool.length)];
    this.objets.push({ p, x: -50, y: this.tapisY - 34, tenu: false, tombe: 0, rot: 0 });
  }
  down(x: number, y: number) {
    if (this.fini) return;
    const o = this.objets.slice().reverse().find((o) => !o.tombe && Math.hypot(o.x - x, o.y - y) < 50);
    if (o) { this.tenu = o; o.tenu = true; this.decal = { x: o.x - x, y: o.y - y }; this.c.sons.clic(); }
  }
  move(x: number, y: number) { if (this.tenu) { this.tenu.x = x + this.decal.x; this.tenu.y = y + this.decal.y; } }
  up(x: number, y: number) {
    const o = this.tenu; if (!o) return;
    this.tenu = null; o.tenu = false;
    const p = this.paniers().find((p) => dans(x, y, { x: p.x - 10, y: p.y - 40, w: p.w + 20, h: p.h + 60 }));
    if (!p) { o.y = this.tapisY - 34; return; }
    this.objets = this.objets.filter((z) => z !== o);
    if (p.cat === o.p.categorie) {
      this.serie++; this.tries++;
      const gain = 10 + this.serie * 2; this.score += gain;
      this.c.sons.bon(); this.c.fx.gerbe(p.x + p.w / 2, p.y, "#ffe066", 14, 220, 1);
      this.c.fx.texte(`+${gain}`, p.x + p.w / 2, p.y - 30, "#ffe066", 24);
      this.surligne[p.cat] = 0.8;
    } else {
      this.serie = 0; this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.25);
      this.c.fx.texte(`${o.p.nom} : ${NOMS_CATEGORIE[o.p.categorie].toLowerCase()} !`, this.L / 2, this.H * 0.55, "#ffb0a0", 22);
    }
    this.hud(); this.verifier();
  }
  verifier() {
    if (this.erreurs >= 3) { this.fini = true; this.c.fin({ gagne: false, score: this.score, etoiles: 0 }); }
    else if (this.tries >= this.objectif) { this.fini = true; this.c.fin({ gagne: true, score: this.score, etoiles: 3 - this.erreurs }); }
  }
  maj(dt: number) {
    if (this.fini) return;
    this.temps += dt;
    this.prochain -= dt;
    if (this.prochain <= 0) { this.generer(); this.prochain = Math.max(0.7, 2.2 - this.niveau * 0.07) * (0.7 + this.c.rnd() * 0.6); }
    for (const o of this.objets) {
      if (o.tenu) continue;
      if (o.tombe) { o.tombe += dt; o.y += 600 * dt * o.tombe * 2; o.rot += dt * 5; continue; }
      o.x += this.vitesse * dt;
      if (o.x > this.L + 20) { o.tombe = 0.01; this.erreurs++; this.serie = 0; this.c.sons.mauvais(); this.c.fx.texte("Raté !", this.L - 60, this.tapisY - 60, "#ffb0a0", 22); this.hud(); this.verifier(); }
    }
    this.objets = this.objets.filter((o) => o.y < this.H + 80);
    for (const k in this.surligne) this.surligne[k] = Math.max(0, this.surligne[k] - dt);
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const y = this.tapisY;
    // tapis roulant
    ctx.fillStyle = "#3a3a44"; arrondi(ctx, -10, y - 6, this.L + 20, 40, 10); ctx.fill();
    ctx.fillStyle = "#55555f";
    const dec = (this.temps * this.vitesse) % 40;
    for (let x = -40 + dec; x < this.L + 40; x += 40) ctx.fillRect(x, y - 2, 20, 30);
    ctx.fillStyle = "#2a2a30"; for (let x = 20; x < this.L; x += 120) { ctx.beginPath(); ctx.arc(x, y + 40, 12, 0, 7); ctx.fill(); }
    for (const p of this.paniers()) panier(ctx, p.x, p.y, p.w, p.h, NOMS_CATEGORIE[p.cat], COULEURS[p.cat], this.surligne[p.cat] || 0);
    for (const o of this.objets) sprite(ctx, this.c.img(o.p.id), o.x, o.y, o.tenu ? 92 : 78, o.rot + (o.tenu ? Math.sin(this.temps * 10) * 0.08 : 0));
  }
}

const def: DefJeu = {
  id: "trie-le-bazar",
  titre: "Trie le bazar",
  accroche: "Les produits défilent sur le tapis : range-les dans le bon panier !",
  regles: ["Attrape un produit sur le tapis et fais-le glisser dans son panier.", "Fruits, légumes, puis épices à partir du niveau 8.", "Un produit qui tombe au bout du tapis compte comme une erreur.", "Trois erreurs, et la partie s'arrête."],
  niveaux: 20,
  theme: THEMES.case,
  creer: (c, n) => new Trie(c, n),
};
export default def;
