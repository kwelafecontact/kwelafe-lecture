// Fusion péi : on lâche des fruits dans la tante ; deux fruits identiques fusionnent en un plus gros.
import { couleurDe } from "../commun/photos";
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, etoilesPour } from "../commun/moteur2d";

export const CHAINE = ["goyavier", "letchi", "longani", "mandarine", "goyave", "grenadine", "mangue", "papaye", "coco", "pasteque", "durian"];
const TAILLES = [0.055, 0.07, 0.085, 0.1, 0.115, 0.13, 0.15, 0.17, 0.19, 0.215, 0.245];
const SONS = "/jeux/sons/fusion-pei/";
const RECHARGE = 12;            // secondes pour recharger « Secoue la tante »
const PAR_NIVEAU = 450;         // points par niveau

type Boule = { k: number; x: number; y: number; vx: number; vy: number; r: number; rot: number; ne: number; dessus: number; gonfle: number };
type Onde = { x: number; y: number; r: number; max: number; vie: number; c: string };
type Goutte = { x: number; y: number; vx: number; vy: number; r: number; vie: number; max: number; c: string };
type Bouton = { id: "secoue" | "cueille"; x: number; y: number; r: number };

class Fusion implements Jeu {
  L: number; H: number;
  temps = 0; score = 0;
  boules: Boule[] = [];
  actuel = 0; suivant = 0;
  visee = 0;
  attente = 0;
  fini = false;
  alerte = 0;
  boite = { x: 0, y: 0, w: 0, h: 0 };
  base = 0;
  // effets propres au jeu
  ondes: Onde[] = [];
  gouttes: Goutte[] = [];
  // chaînes de fusions, niveaux et bonus
  chaine = 0; chaineT = 0;
  niveau = 1;
  charge = 0;                   // recharge de « Secoue la tante »
  cueillettes = 0;              // bonus gagnés par les chaînes
  serie = 0;                    // fusions comptées pour le prochain bonus
  secoue = 0;
  boutons: Bouton[] = [];
  appuiBouton = false;

  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H;
    this.disposer();
    this.actuel = this.tirer(); this.suivant = this.tirer();
    this.visee = this.boite.x + this.boite.w / 2;
    this.c.hud({ score: 0, info: "Niveau 1" });
    this.c.sons.prechargerFichiers(["plop", "fusion-1", "fusion-2", "gros", "secoue"].map((n) => SONS + n + ".mp3"));
  }
  // la difficulté monte : les fruits tirés deviennent plus variés avec les niveaux
  tirer() { const max = Math.min(6, 4 + Math.floor((this.niveau - 1) / 2)); return Math.floor(this.c.rnd() * (max + 1)); }
  disposer() {
    const w = Math.min(this.L * 0.92, this.H * 0.62, 460), h = Math.min(this.H * 0.66, w * 1.25);
    this.boite = { x: (this.L - w) / 2, y: this.H - h - 24, w, h };
    this.base = w;
    const r = 27, x = Math.max(56, this.boite.x - 4 + r);
    const by = Math.min(170, this.boite.y - r - 14); this.boutons = [{ id: "secoue", x, y: by, r }, { id: "cueille", x: x + r * 2.4, y: by, r }];
  }
  redim(L: number, H: number) { const ox = this.boite.x, oy = this.boite.y, ow = this.boite.w; this.L = L; this.H = H; this.disposer(); const s = this.boite.w / ow; for (const b of this.boules) { b.x = this.boite.x + (b.x - ox) * s; b.y = this.boite.y + this.boite.h - (oy + this.boite.h / s - b.y) * s; b.r = this.rayon(b.k); } }
  rayon(k: number) { return TAILLES[k] * this.base; }
  get ligne() { return this.boite.y + this.rayon(4) * 1.1; }
  son(n: string, vol = 1, vit = 1) { return this.c.sons.fichier(SONS + n + ".mp3", vol, vit * (0.96 + this.c.rnd() * 0.08)); }

  // Reprise après interruption : positions enregistrées relativement à la tante (indépendantes de l'écran)
  instantane() {
    if (this.fini) return null;
    const B = this.boite;
    return { v: 1, score: this.score, temps: this.temps, actuel: this.actuel, suivant: this.suivant, niveau: this.niveau, charge: this.charge, cueillettes: this.cueillettes,
      boules: this.boules.filter((b) => b.k >= 0).map((b) => ({ k: b.k, u: (b.x - B.x) / B.w, v: (b.y - B.y) / B.h, rot: b.rot })) };
  }
  restaurer(e: unknown) {
    const d = e as { v?: number; score: number; temps: number; actuel: number; suivant: number; niveau?: number; charge?: number; cueillettes?: number; boules: { k: number; u: number; v: number; rot: number }[] };
    if (!d || d.v !== 1 || !Array.isArray(d.boules)) return;
    const B = this.boite;
    this.score = d.score || 0; this.temps = d.temps || 0; this.actuel = d.actuel | 0; this.suivant = d.suivant | 0;
    this.niveau = Math.max(1, (d.niveau ?? 1) | 0); this.charge = d.charge || 0; this.cueillettes = (d.cueillettes ?? 0) | 0;
    this.boules = d.boules.map((b) => ({ k: b.k, x: B.x + b.u * B.w, y: B.y + b.v * B.h, vx: 0, vy: 0, r: this.rayon(b.k), rot: b.rot || 0, ne: 2, dessus: 0, gonfle: 0 }));
    this.c.hud({ score: this.score, info: "Niveau " + this.niveau });
  }
  bouton(x: number, y: number) { return this.boutons.find((b) => Math.hypot(x - b.x, y - b.y) < b.r + 8); }
  down(x: number, y: number) {
    if (this.fini) return;
    const b = this.bouton(x, y);
    if (b) { this.appuiBouton = true; if (b.id === "secoue") this.secouer(); else this.cueillir(); return; }
    this.appuiBouton = false; this.visee = x;
  }
  move(x: number) { if (!this.fini && !this.appuiBouton) this.visee = x; }
  up(x: number) {
    if (this.appuiBouton) { this.appuiBouton = false; return; }
    if (this.fini || this.attente > 0) return;
    const r = this.rayon(this.actuel);
    const px = Math.max(this.boite.x + r, Math.min(this.boite.x + this.boite.w - r, x));
    this.boules.push({ k: this.actuel, x: px, y: this.boite.y - r - 6, vx: 0, vy: 0, r, rot: 0, ne: 0, dessus: 0, gonfle: 0 });
    if (!this.son("plop", 0.7, 1.25 - this.actuel * 0.06)) this.c.sons.pop(this.actuel);
    this.actuel = this.suivant; this.suivant = this.tirer();
    this.attente = 0.45;
  }

  // Bonus rechargeable : la tante est secouée, les fruits sautent et se rapprochent
  secouer() {
    if (this.charge < RECHARGE) return;
    this.charge = 0; this.secoue = 0.8;
    for (const b of this.boules) { b.vy -= 380 + this.c.rnd() * 420; b.vx += (this.c.rnd() - 0.5) * 520; }
    if (!this.son("secoue", 0.9)) this.c.sons.mixeur();
    this.c.fx.secouer(0.45);
    this.c.fx.texte("Secoue la tante !", this.L / 2, this.boite.y - 30, "#9cf0ff", 32);
  }
  // Bonus de chaîne : on cueille les plus petits fruits de la tante (et on gagne leurs points)
  cueillir() {
    if (!this.cueillettes) return;
    const petits = this.boules.filter((b) => b.k >= 0 && b.k <= 1);
    if (!petits.length) { this.c.fx.texte("Pas de petits fruits", this.L / 2, this.boite.y - 30, "#fff", 22); return; }
    this.cueillettes--;
    let gain = 0;
    for (const b of petits) { b.k = -1; gain += 6; this.eclabousser(b.x, b.y, couleurDe(CHAINE[0]), 8, 0.6); this.c.fx.etoiles(b.x, b.y, 6); }
    this.boules = this.boules.filter((b) => b.k >= 0);
    this.ajouter(gain);
    this.c.sons.piece();
    this.c.fx.texte(`Cueillette ! +${gain}`, this.L / 2, this.boite.y - 30, "#ffe066", 32);
  }
  ajouter(n: number) {
    this.score += n;
    const niv = 1 + Math.floor(this.score / PAR_NIVEAU);
    if (niv > this.niveau) {
      this.niveau = niv;
      this.c.fx.texte("Niveau " + niv + " !", this.L / 2, this.H * 0.3, "#ffe23a", 44);
      this.c.fx.confettis(this.L); this.c.sons.victoire();
    }
    this.c.hud({ score: this.score, info: "Niveau " + this.niveau });
  }
  eclabousser(x: number, y: number, c: string, n: number, force: number) {
    for (let i = 0; i < n; i++) {
      const a = this.c.rnd() * Math.PI * 2, v = (120 + this.c.rnd() * 380) * force, max = 0.5 + this.c.rnd() * 0.6;
      this.gouttes.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 180 * force, r: (2 + this.c.rnd() * 5) * (0.7 + force * 0.5), vie: max, max, c });
    }
    if (this.gouttes.length > 400) this.gouttes.splice(0, this.gouttes.length - 400);
  }

  maj(dt: number) {
    for (const o of this.ondes) { o.vie -= dt; o.r += (o.max - o.r) * Math.min(1, dt * 9); }
    this.ondes = this.ondes.filter((o) => o.vie > 0);
    for (const g of this.gouttes) { g.vie -= dt; g.vy += 900 * dt; g.x += g.vx * dt; g.y += g.vy * dt; }
    this.gouttes = this.gouttes.filter((g) => g.vie > 0);
    if (this.fini) return;
    this.temps += dt;
    this.attente = Math.max(0, this.attente - dt);
    this.charge = Math.min(RECHARGE, this.charge + dt);
    this.secoue = Math.max(0, this.secoue - dt);
    if (this.chaineT > 0) { this.chaineT -= dt; if (this.chaineT <= 0) this.chaine = 0; }
    const g = 1500, B = this.boite;
    const sous = 3, h = dt / sous;
    for (let s = 0; s < sous; s++) {
      for (const b of this.boules) {
        b.vy += g * h; b.x += b.vx * h; b.y += b.vy * h;
        b.vx *= 0.995; b.ne += h;
        if (b.x - b.r < B.x) { b.x = B.x + b.r; b.vx = Math.abs(b.vx) * 0.3; }
        if (b.x + b.r > B.x + B.w) { b.x = B.x + B.w - b.r; b.vx = -Math.abs(b.vx) * 0.3; }
        if (b.y + b.r > B.y + B.h) { b.y = B.y + B.h - b.r; b.vy = -Math.abs(b.vy) * 0.15; b.vx *= 0.92; }
      }
      // collisions et fusions
      for (let i = 0; i < this.boules.length; i++) {
        for (let j = i + 1; j < this.boules.length; j++) {
          const a = this.boules[i], b = this.boules[j];
          if (a.k < 0 || b.k < 0) continue;
          const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), m = a.r + b.r;
          if (d >= m || d === 0) continue;
          if (a.k === b.k && a.k < CHAINE.length - 1) { this.fusionner(a, b); continue; }
          const nx = dx / d, ny = dy / d, chev = (m - d) / 2;
          const ma = a.r * a.r, mb = b.r * b.r, tot = ma + mb;
          a.x -= nx * chev * (mb / tot) * 2; a.y -= ny * chev * (mb / tot) * 2;
          b.x += nx * chev * (ma / tot) * 2; b.y += ny * chev * (ma / tot) * 2;
          const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (rv < 0) { const imp = -rv * 1.2; a.vx -= nx * imp * (mb / tot); a.vy -= ny * imp * (mb / tot); b.vx += nx * imp * (ma / tot); b.vy += ny * imp * (ma / tot); }
        }
      }
      this.boules = this.boules.filter((b) => b.k >= 0);
    }
    for (const b of this.boules) { b.rot += (b.vx * dt) / b.r; b.gonfle = Math.max(0, b.gonfle - dt * 3.2); }
    // fruit au-dessus de la ligne trop longtemps : fin
    let danger = false;
    for (const b of this.boules) {
      if (b.ne > 1 && b.y - b.r < this.ligne && this.secoue <= 0) { b.dessus += dt; if (b.dessus > 2.2) danger = true; } else b.dessus = 0;
    }
    this.alerte = this.boules.some((b) => b.dessus > 0.3) ? Math.min(1, this.alerte + dt * 2) : Math.max(0, this.alerte - dt * 2);
    if (danger) {
      this.fini = true;
      this.c.fin({ gagne: true, score: this.score, etoiles: etoilesPour(this.score, [400, 1200, 2500]) });
    }
  }

  fusionner(a: Boule, b: Boule) {
    const k = a.k + 1;
    const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
    a.k = -1; b.k = -1;
    const r = this.rayon(k);
    this.boules.push({ k, x, y, vx: (a.vx + b.vx) / 2, vy: Math.min(a.vy, b.vy) - 120, r, rot: 0, ne: 1, dessus: 0, gonfle: 1 });
    // chaîne : plusieurs fusions rapprochées multiplient les points
    this.chaine++; this.chaineT = 1.3;
    const mult = Math.min(5, this.chaine);
    const gain = (k + 1) * (k + 2) * mult;
    // onde de choc : les fruits voisins sont repoussés doucement
    for (const o of this.boules) {
      if (o.k < 0 || (o.x === x && o.y === y)) continue;
      const dx = o.x - x, dy = o.y - y, d = Math.hypot(dx, dy) || 1, portee = r * 2.6;
      if (d < portee) { const f = (1 - d / portee) * (160 + k * 30); o.vx += (dx / d) * f; o.vy += (dy / d) * f - 40; }
    }
    const coul = couleurDe(CHAINE[k]);
    this.ondes.push({ x, y, r: r * 0.6, max: r * 2.2, vie: 0.45, c: coul });
    this.eclabousser(x, y, coul, 14 + k * 3, 0.6 + k * 0.08);
    this.c.fx.gerbe(x, y, coul, 16 + k * 2, 200 + k * 20, 2);
    this.c.fx.texte(`+${gain}`, x, y - r, "#ffe066", 22 + k * 2);
    if (mult >= 2) this.c.fx.texte(`Chaîne ×${mult}`, x, y - r - 30, "#9cf0ff", 22 + mult * 3);
    if (k >= 7) { if (!this.son("gros", 0.9)) this.c.sons.fusion(k); } else if (!this.son(this.c.rnd() < 0.5 ? "fusion-1" : "fusion-2", 0.85, 1.3 - k * 0.07)) this.c.sons.fusion(k);
    if (mult >= 3) this.c.sons.combo(mult);
    if (k >= 8) { this.c.fx.etoiles(x, y, 30); this.c.fx.secouer(0.25); this.c.fx.eclair("255,240,190", 0.35); this.c.fx.texte("Gayar !", this.L / 2, this.H * 0.25, "#9cff9c", 40); }
    // toutes les 8 fusions : un bonus « Cueillette »
    this.serie++;
    if (this.serie % 8 === 0) { this.cueillettes = Math.min(3, this.cueillettes + 1); this.c.fx.texte("Bonus Cueillette !", this.L / 2, this.boite.y - 60, "#ffe066", 26); this.c.sons.bon(); }
    this.ajouter(gain);
  }

  dessinerTante(ctx: CanvasRenderingContext2D) {
    const B = this.boite;
    ctx.save();
    // ombre portée
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(B.x + B.w / 2, B.y + B.h + 16, B.w * 0.6, 14, 0, 0, Math.PI * 2); ctx.fill();
    // fond tressé : bandes de vacoa alternées
    arrondi(ctx, B.x - 12, B.y - 4, B.w + 24, B.h + 18, 24); ctx.save(); ctx.clip();
    const gr = ctx.createLinearGradient(0, B.y, 0, B.y + B.h); gr.addColorStop(0, "#b8854a"); gr.addColorStop(1, "#7a4e22");
    ctx.fillStyle = gr; ctx.fillRect(B.x - 12, B.y - 4, B.w + 24, B.h + 18);
    const pas = 16;
    for (let y = B.y, l = 0; y < B.y + B.h + 14; y += pas, l++) {
      for (let x = B.x - 12 + (l % 2) * pas, c = 0; x < B.x + B.w + 12; x += pas * 2, c++) {
        const g2 = ctx.createLinearGradient(x, y, x + pas, y + pas); g2.addColorStop(0, "rgba(255,225,170,0.35)"); g2.addColorStop(1, "rgba(90,50,15,0.25)");
        ctx.fillStyle = g2; ctx.fillRect(x + 1, y + 1, pas - 2, pas - 2);
      }
    }
    // intérieur plus sombre pour faire ressortir les fruits
    const v = ctx.createRadialGradient(B.x + B.w / 2, B.y + B.h * 0.6, B.w * 0.1, B.x + B.w / 2, B.y + B.h * 0.6, B.w * 0.8);
    v.addColorStop(0, "rgba(40,20,5,0.15)"); v.addColorStop(1, "rgba(40,20,5,0.5)"); ctx.fillStyle = v; ctx.fillRect(B.x, B.y, B.w, B.h);
    ctx.restore();
    // bord tressé épais
    ctx.lineWidth = 9; ctx.strokeStyle = "#8a5826"; arrondi(ctx, B.x - 12, B.y - 4, B.w + 24, B.h + 18, 24); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,220,160,0.55)"; ctx.setLineDash([7, 6]); arrondi(ctx, B.x - 12, B.y - 4, B.w + 24, B.h + 18, 24); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }

  dessinerBoutons(ctx: CanvasRenderingContext2D) {
    for (const b of this.boutons) {
      const pret = b.id === "secoue" ? this.charge >= RECHARGE : this.cueillettes > 0;
      const k = b.id === "secoue" ? this.charge / RECHARGE : this.cueillettes > 0 ? 1 : 0;
      ctx.save();
      ctx.fillStyle = "rgba(30,15,0,0.6)"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
      // anneau de recharge
      ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.strokeStyle = b.id === "secoue" ? "#7fe0ff" : "#ffd23a";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
      if (pret) { ctx.shadowColor = ctx.strokeStyle as string; ctx.shadowBlur = 14 + Math.sin(this.temps * 6) * 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 3, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0; }
      ctx.globalAlpha = pret ? 1 : 0.45; ctx.font = `${b.r}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b.id === "secoue" ? "🧺" : "✂️", b.x, b.y + 1);
      ctx.globalAlpha = 1;
      if (b.id === "cueille" && this.cueillettes > 0) { ctx.fillStyle = "#ffd23a"; ctx.beginPath(); ctx.arc(b.x + b.r * 0.72, b.y + b.r * 0.72, 10, 0, Math.PI * 2); ctx.fill(); texteContour(ctx, String(this.cueillettes), b.x + b.r * 0.72, b.y + b.r * 0.72 + 1, 13, "#3a1a00"); }
      ctx.restore();
    }
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const B = this.boite;
    this.dessinerTante(ctx);
    // ligne de danger, qui pulse quand un fruit déborde
    ctx.save(); ctx.setLineDash([10, 8]); const pul = this.alerte > 0 ? 0.5 + 0.5 * Math.sin(this.temps * 14) : 0;
    ctx.strokeStyle = `rgba(255,${120 - this.alerte * 100},${80 - this.alerte * 60},${0.5 + this.alerte * 0.5 * (0.5 + pul)})`; ctx.lineWidth = 3 + this.alerte * 2;
    ctx.beginPath(); ctx.moveTo(B.x, this.ligne); ctx.lineTo(B.x + B.w, this.ligne); ctx.stroke(); ctx.restore();
    if (this.alerte > 0) { ctx.fillStyle = `rgba(255,40,20,${this.alerte * 0.12 * (0.5 + pul)})`; ctx.fillRect(B.x, B.y, B.w, this.ligne - B.y); }
    // halo derrière les gros fruits
    for (const b of this.boules) if (b.k >= 7) {
      const hg = ctx.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r * 1.5); hg.addColorStop(0, "rgba(255,240,180,0.35)"); hg.addColorStop(1, "rgba(255,240,180,0)");
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    // fruits (le fruit né d'une fusion gonfle puis se pose)
    for (const b of this.boules) { const e = 1 + Math.sin(b.gonfle * Math.PI) * 0.18; sprite(ctx, this.c.img(CHAINE[b.k]), b.x, b.y, b.r * 2.25 * e, b.rot); }
    // ondes de fusion
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (const o of this.ondes) { const k = o.vie / 0.45; ctx.globalAlpha = k * 0.8; ctx.strokeStyle = o.c; ctx.lineWidth = 2 + 8 * k; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = k * 0.5; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 0.82, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    // jus qui gicle (gouttes brillantes avec reflet)
    for (const g of this.gouttes) {
      const a = Math.min(1, (g.vie / g.max) * 1.6); ctx.globalAlpha = a; ctx.fillStyle = g.c;
      const v = Math.hypot(g.vx, g.vy), s = Math.min(2.2, 1 + v / 600), ang = Math.atan2(g.vy, g.vx);
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(0, 0, g.r * s, g.r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.arc(g.r * 0.3, -g.r * 0.35, g.r * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;
    // fruit à lâcher + guide
    if (!this.fini) {
      const r = this.rayon(this.actuel);
      const x = Math.max(B.x + r, Math.min(B.x + B.w - r, this.visee));
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.setLineDash([4, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, B.y - r); ctx.lineTo(x, B.y + B.h); ctx.stroke(); ctx.setLineDash([]);
      sprite(ctx, this.c.img(CHAINE[this.actuel]), x, B.y - r - 8 + Math.sin(this.temps * 4) * 2, r * 2.25, Math.sin(this.temps * 2) * 0.08, this.attente > 0 ? 0.4 : 1);
      // suivant
      ctx.save(); ctx.fillStyle = "rgba(30,15,0,0.45)"; ctx.beginPath(); ctx.arc(this.L - 64, 150, 34, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      texteContour(ctx, "Suivant", this.L - 64, 106, 15, "#fff");
      sprite(ctx, this.c.img(CHAINE[this.suivant]), this.L - 64, 150, 48);
      this.dessinerBoutons(ctx);
    }
    // chaîne des fruits en bas
    const t = Math.min(30, this.L / (CHAINE.length + 2));
    const plus = Math.max(-1, ...this.boules.map((b) => b.k));
    CHAINE.forEach((id, i) => sprite(ctx, this.c.img(id), (this.L - CHAINE.length * t) / 2 + i * t + t / 2, this.H - 12, t * (i === plus ? 1.15 : 0.9), 0, i <= plus ? 1 : 0.45, false));
  }
}

const def: DefJeu = {
  id: "fusion-pei",
  titre: "Fusion péi",
  accroche: "Lâche les fruits dans la tante : deux fruits pareils fusionnent en un plus gros !",
  regles: [
    "Glisse le doigt pour viser, lâche pour faire tomber le fruit.",
    "Deux fruits identiques qui se touchent fusionnent. Plusieurs fusions à la suite font une chaîne qui multiplie les points.",
    "🧺 Secoue la tante : se recharge toutes les 12 secondes. ✂️ Cueillette : gagnée toutes les 8 fusions, elle retire les plus petits fruits.",
    "Du goyavier jusqu'au ti jacque géant : vise le plus gros ! Si un fruit reste au-dessus de la ligne, c'est fini.",
  ],
  niveaux: 0,
  theme: THEMES.lagon,
  visuels: "photos",
  creer: (c) => new Fusion(c),
};
export default def;
