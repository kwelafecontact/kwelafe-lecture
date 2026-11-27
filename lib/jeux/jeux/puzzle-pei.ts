// Puzzle péi : de vraies pièces de puzzle (avec tenons et mortaises) taillées dans les tableaux aquarelle
// des jeux Kwélafé. On fait glisser chaque pièce à sa place ; elle s'aimante quand elle est bien posée.
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger, arrondi, cheminFond } from "../commun/moteur2d";
import { paragraphe, panneau, POLICE } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";

type Tableau = { id: string; titre: string; savoir: string };
const TABLEAUX: Tableau[] = [
  { id: "marche-des-jus", titre: "L'étal du bord de mer", savoir: "Sur les marchés de l'île, les letchis et les mangues arrivent en été austral, autour de Noël." },
  { id: "kel-fri-sa", titre: "Les champs de cannes", savoir: "La canne à sucre est coupée pendant la campagne sucrière, à peu près de juillet à décembre." },
  { id: "kosa-in-shoz", titre: "La varangue au coucher du soleil", savoir: "La varangue est la véranda de la case créole : on s'y repose à l'ombre et on y reçoit les visiteurs." },
  { id: "ramasse-les-letchis", titre: "Le pied de letchis", savoir: "Le letchi mûrit en fin d'année : c'est le fruit des fêtes de Noël et du Nouvel An à La Réunion." },
  { id: "cari-parfait", titre: "Le cari au feu de bois", savoir: "Lontan, le cari mijotait dans une marmite en fonte, posée sur un feu de bois entre trois pierres." },
  { id: "gardiens-de-l-ile", titre: "La forêt dans les nuages", savoir: "Les Pitons, cirques et remparts de La Réunion sont inscrits au patrimoine mondial de l'UNESCO depuis 2010." },
  { id: "memory-pei", titre: "La table de la cuisine", savoir: "Le café Bourbon pointu, cultivé à La Réunion depuis le XVIIIe siècle, est l'un des cafés les plus rares du monde." },
  { id: "coulee-de-lave", titre: "La coulée de lave", savoir: "Le Piton de la Fournaise est l'un des volcans les plus actifs du monde. En mars 2026, sa lave a atteint l'océan pour la première fois depuis dix-neuf ans." },
  { id: "trie-le-bazar", titre: "La boutik du quartier", savoir: "Dans la boutik de quartier, on achetait souvent à crédit : le marchand notait tout dans un carnet." },
  { id: "bazar-krush", titre: "Le jardin créole", savoir: "Autour de la kaz, le jardin créole mêle fleurs, arbres fruitiers, légumes et plantes à tisane." },
  { id: "2048-pei", titre: "Coucher de soleil sur l'océan", savoir: "De juin à octobre, les baleines à bosse viennent près des côtes de l'île pour mettre bas et allaiter leurs petits." },
  { id: "marchand-du-bazar", titre: "La rue du marché", savoir: "Sur les marchés, on trouve aussi l'artisanat péi : vannerie en vacoa, broderie de Cilaos, sculptures en bois." },
  { id: "expressions-a-recoller", titre: "Le village créole", savoir: "Hell-Bourg, dans le cirque de Salazie, est classé parmi les Plus Beaux Villages de France pour ses cases créoles." },
  { id: "let-melanze", titre: "L'étal aux épices", savoir: "Piment, ail, gingembre, curcuma : ces épices donnent leur goût aux caris et aux rougails péi." },
  { id: "memory-lontan", titre: "L'intérieur de la kaz", savoir: "Dans la kaz lontan, le buffet et l'armoire gardaient la vaisselle et les beaux habits des grandes occasions." },
  { id: "zarlor", titre: "Le bord de mer", savoir: "Le sable des plages change selon les lieux : blanc et corallien dans l'ouest, noir et volcanique à l'Étang-Salé." },
  { id: "fusion-pei", titre: "L'étal face au lagon", savoir: "Le plus grand lagon de l'île est celui de l'Hermitage, protégé par une barrière de corail." },
  { id: "case-bleue", titre: "Le chemin de la kaz", savoir: "Lontan, la cour (lakour) était la vraie pièce à vivre de la kaz : on y cuisinait, on y lavait, on y jouait." },
];

/** Grille selon le niveau : de 12 pièces au début à 35 pour les experts. */
const grille = (n: number): [number, number] => (n <= 4 ? [3, 4] : n <= 9 ? [4, 5] : n <= 14 ? [4, 6] : [5, 7]);

type Piece = {
  col: number; lig: number; x: number; y: number;      // position actuelle (coin haut gauche du cœur de la pièce)
  bords: [number, number, number, number];            // haut, droite, bas, gauche : 0 plat, 1 tenon, -1 mortaise
  posee: boolean; eclat: number;
};

class Puzzle implements Jeu {
  L: number; H: number;
  t: Tableau; cols: number; ligs: number;
  pieces: Piece[] = []; ordre: Piece[] = [];          // ordre d'affichage (la dernière est au-dessus)
  bx = 0; by = 0; bw = 0; bh = 0; pw = 0; ph = 0;     // plateau et taille d'une pièce
  zone = { x: 0, y: 0, w: 0, h: 0 };                  // bac des pièces en vrac
  prise: Piece | null = null; dx = 0; dy = 0;
  posees = 0; score = 0; temps = 0; fini = false; modele = false; finAnim = 0;
  aide: Bouton = { x: 0, y: 0, w: 132, h: 40, texte: "Modèle", actif: true, appui: 0, couleur: "#2e7d4f" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.t = TABLEAUX[(niveau - 1) % TABLEAUX.length];
    [this.cols, this.ligs] = grille(niveau);
    // bords : chaque bord intérieur reçoit un tenon d'un côté et la mortaise correspondante de l'autre
    const hor: number[][] = [], ver: number[][] = [];
    for (let l = 0; l < this.ligs; l++) { hor[l] = []; for (let k = 0; k < this.cols - 1; k++) hor[l][k] = c.rnd() < 0.5 ? 1 : -1; }
    for (let l = 0; l < this.ligs - 1; l++) { ver[l] = []; for (let k = 0; k < this.cols; k++) ver[l][k] = c.rnd() < 0.5 ? 1 : -1; }
    for (let l = 0; l < this.ligs; l++) for (let k = 0; k < this.cols; k++) {
      this.pieces.push({
        col: k, lig: l, x: 0, y: 0, posee: false, eclat: 0,
        bords: [l === 0 ? 0 : -ver[l - 1][k], k === this.cols - 1 ? 0 : hor[l][k], l === this.ligs - 1 ? 0 : ver[l][k], k === 0 ? 0 : -hor[l][k - 1]],
      });
    }
    this.disposer(true);
    this.ordre = melanger([...this.pieces], c.rnd);
    this.hud();
  }
  get total() { return this.pieces.length; }
  get facile() { return this.niveau <= 9; }
  hud() { this.c.hud({ score: this.score, objectif: `${this.posees}/${this.total} pièces` }); }
  /** Calcule le plateau et le bac ; au premier appel, éparpille les pièces dans le bac. */
  disposer(eparpiller = false) {
    const ancien = { bx: this.bx, by: this.by, pw: this.pw, ph: this.ph, z: { ...this.zone } };
    const haut = this.H * 0.155, paysage = this.L > this.H * 1.05;
    const ratio = 2 / 3;                                    // les tableaux sont en portrait 2:3
    if (paysage) {
      this.bh = this.H - haut - 20; this.bw = this.bh * ratio;
      if (this.bw > this.L * 0.5) { this.bw = this.L * 0.5; this.bh = this.bw / ratio; }
      this.bx = 24; this.by = haut + (this.H - haut - 20 - this.bh) / 2;
      this.zone = { x: this.bx + this.bw + 30, y: haut + 50, w: this.L - (this.bx + this.bw + 30) - 20, h: this.H - haut - 70 };
    } else {
      this.bh = Math.min(this.H * 0.5, (this.L - 40) / ratio); this.bw = this.bh * ratio;
      this.bx = (this.L - this.bw) / 2; this.by = haut + 8;
      const y0 = this.by + this.bh + 16;
      this.zone = { x: 14, y: y0, w: this.L - 28, h: this.H - y0 - 14 };
    }
    this.pw = this.bw / this.cols; this.ph = this.bh / this.ligs;
    // bouton « Modèle » en haut à droite du bac ; les pièces sont éparpillées sous lui
    this.aide.x = this.zone.x + this.zone.w - this.aide.w; this.aide.y = paysage ? haut + 4 : this.zone.y;
    if (!paysage) { this.zone.y += this.aide.h + 6; this.zone.h -= this.aide.h + 6; }
    const marge = Math.min(this.pw, this.ph) * 0.28;
    for (const p of this.pieces) {
      if (p.posee) { p.x = this.bx + p.col * this.pw; p.y = this.by + p.lig * this.ph; continue; }
      if (eparpiller || !ancien.pw) {
        const e = this.echelleBac, dw = this.pw * e, dh = this.ph * e, mg = marge * e;
        const cx = this.zone.x + mg + dw / 2 + this.c.rnd() * Math.max(1, this.zone.w - dw - mg * 2);
        const cy = this.zone.y + mg + dh / 2 + this.c.rnd() * Math.max(1, this.zone.h - dh - mg * 2);
        p.x = cx - this.pw / 2; p.y = cy - this.ph / 2;
      } else {
        // garde la position relative dans le bac après un changement de taille d'écran
        const rx = (p.x - ancien.z.x) / Math.max(1, ancien.z.w), ry = (p.y - ancien.z.y) / Math.max(1, ancien.z.h);
        p.x = this.zone.x + Math.min(1, Math.max(0, rx)) * Math.max(1, this.zone.w - this.pw);
        p.y = this.zone.y + Math.min(1, Math.max(0, ry)) * Math.max(1, this.zone.h - this.ph);
      }
    }
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  /** Échelle d'une pièce : en miniature tant qu'elle est dans le bac, taille réelle dès qu'on la prend. */
  get echelleBac() { return this.total >= 30 ? 0.55 : this.total >= 20 ? 0.62 : 0.78; }
  dansBac(p: Piece) {
    const cx = p.x + this.pw / 2, cy = p.y + this.ph / 2;
    return this.L > this.H * 1.05 ? cx > this.bx + this.bw + 10 : cy > this.by + this.bh + 6;
  }
  echelle(p: Piece) { return !p.posee && p !== this.prise && this.dansBac(p) ? this.echelleBac : 1; }
  cible(p: Piece) { return { x: this.bx + p.col * this.pw, y: this.by + p.lig * this.ph }; }
  down(x: number, y: number) {
    if (this.fini) return;
    if (dans(x, y, this.aide)) { this.aide.appui = 1; this.modele = true; this.c.sons.clic(); return; }
    for (let i = this.ordre.length - 1; i >= 0; i--) {
      const p = this.ordre[i];
      if (p.posee) continue;
      const e = this.echelle(p), cx = p.x + this.pw / 2, cy = p.y + this.ph / 2;
      const hw = (this.pw / 2) * e * 1.15, hh = (this.ph / 2) * e * 1.15;
      if (Math.abs(x - cx) <= hw && Math.abs(y - cy) <= hh) {
        this.prise = p;
        this.dx = this.pw / 2 + (x - cx) / e * 0.6; this.dy = this.ph / 2 + (y - cy) / e * 0.6;   // la pièce grandit sous le doigt
        this.move(x, y);
        this.ordre.splice(i, 1); this.ordre.push(p);
        this.c.sons.pop(1);
        return;
      }
    }
  }
  move(x: number, y: number) {
    if (!this.prise) return;
    this.prise.x = Math.max(-this.pw * 0.5, Math.min(this.L - this.pw * 0.5, x - this.dx));
    this.prise.y = Math.max(this.H * 0.12, Math.min(this.H - this.ph * 0.5, y - this.dy));
  }
  up() {
    this.aide.appui = 0; this.modele = false;
    const p = this.prise; if (!p) return;
    this.prise = null;
    const c = this.cible(p), tol = Math.min(this.pw, this.ph) * 0.3;
    if (Math.abs(p.x - c.x) < tol && Math.abs(p.y - c.y) < tol) {
      p.x = c.x; p.y = c.y; p.posee = true; p.eclat = 1; this.posees++;
      this.score += 50 + Math.max(0, 30 - Math.floor(this.temps / 10));
      this.ordre.splice(this.ordre.indexOf(p), 1); this.ordre.unshift(p);  // les pièces posées passent dessous
      this.c.sons.fusion(Math.min(8, Math.floor(this.posees / 3)));
      this.c.fx.etoiles(c.x + this.pw / 2, c.y + this.ph / 2, 10);
      this.hud();
      if (this.posees === this.total) this.terminer();
    } else this.c.sons.swoosh();
  }
  terminer() {
    this.fini = true; this.finAnim = 0.001;
    const parPiece = this.temps / this.total;
    const e = parPiece <= 8 ? 3 : parPiece <= 15 ? 2 : 1;
    this.score += e * 100;
    this.c.fx.texte(this.t.titre, this.L / 2, this.by + this.bh / 2, "#ffe066", 28);
    const m = Math.floor(this.temps / 60), s = Math.floor(this.temps % 60);
    setTimeout(() => this.c.fin({
      gagne: true, score: this.score, etoiles: e,
      lignes: [`« ${this.t.titre} » est complet : ${this.total} pièces en ${m ? `${m} min ` : ""}${s} s.`],
      savoir: { titre: "Le saviez-vous ?", texte: this.t.savoir },
    }), 2200);
  }
  maj(dt: number) {
    if (!this.fini) this.temps += dt; else this.finAnim += dt;
    for (const p of this.pieces) if (p.eclat > 0) p.eclat = Math.max(0, p.eclat - dt * 1.6);
  }
  /** Contour d'une pièce (cœur w×h à l'origine), avec tenons et mortaises. */
  chemin(ctx: CanvasRenderingContext2D, p: Piece, w: number, h: number) {
    const cote = (x0: number, y0: number, x1: number, y1: number, b: number) => {
      const dx = x1 - x0, dy = y1 - y0, nx = dy, ny = -dx;   // normale vers l'extérieur (sens horaire)
      const P = (u: number, v: number): [number, number] => [x0 + dx * u + nx * v * b, y0 + dy * u + ny * v * b];
      if (!b) { ctx.lineTo(x1, y1); return; }
      const s = 0.2;                                          // hauteur du tenon par rapport au côté
      ctx.lineTo(...P(0.36, 0));
      ctx.bezierCurveTo(...P(0.40, 0), ...P(0.42, s * 0.25), ...P(0.38, s * 0.55));
      ctx.bezierCurveTo(...P(0.34, s * 0.95), ...P(0.42, s * 1.1), ...P(0.5, s * 1.1));
      ctx.bezierCurveTo(...P(0.58, s * 1.1), ...P(0.66, s * 0.95), ...P(0.62, s * 0.55));
      ctx.bezierCurveTo(...P(0.58, s * 0.25), ...P(0.60, 0), ...P(0.64, 0));
      ctx.lineTo(x1, y1);
    };
    const [hb, db, bb, gb] = p.bords;
    ctx.beginPath(); ctx.moveTo(0, 0);
    cote(0, 0, w, 0, hb ? hb * (Math.min(w, h) / w) : 0);
    cote(w, 0, w, h, db ? db * (Math.min(w, h) / h) : 0);
    cote(w, h, 0, h, bb ? bb * (Math.min(w, h) / w) : 0);
    cote(0, h, 0, 0, gb ? gb * (Math.min(w, h) / h) : 0);
    ctx.closePath();
  }
  dessinerPiece(ctx: CanvasRenderingContext2D, p: Piece, im: HTMLImageElement, levee: boolean) {
    const w = this.pw, h = this.ph, sx = im.naturalWidth / this.bw, sy = im.naturalHeight / this.bh;
    const m = Math.min(w, h) * 0.3;
    ctx.save();
    const e = this.echelle(p);
    ctx.translate(p.x + w / 2, p.y + h / 2); ctx.scale(e, e); ctx.translate(-w / 2, -h / 2);
    if (levee) { ctx.translate(-2, -4); ctx.scale(1.04, 1.04); }
    this.chemin(ctx, p, w, h);
    if (!p.posee) {
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = levee ? 18 : 8; ctx.shadowOffsetY = levee ? 10 : 4;
      ctx.fillStyle = "#3a2412"; ctx.fill(); ctx.restore();
    }
    ctx.save(); ctx.clip();
    const x0 = p.col * w - m, y0 = p.lig * h - m;
    ctx.drawImage(im, Math.max(0, x0 * sx), Math.max(0, y0 * sy), (w + m * 2) * sx, (h + m * 2) * sy, Math.max(-m, -p.col * w), Math.max(-m, -p.lig * h), w + m * 2, h + m * 2);
    ctx.restore();
    ctx.lineWidth = p.posee ? 0.8 : 1.6;
    ctx.strokeStyle = p.posee ? "rgba(60,36,18,0.18)" : "rgba(255,250,235,0.85)"; ctx.stroke();
    if (p.eclat > 0) { ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,224,102,${p.eclat})`; ctx.stroke(); }
    ctx.restore();
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const im = this.c.img(this.t.id);
    // plateau
    panneau(ctx, this.bx - 8, this.by - 8, this.bw + 16, this.bh + 16, "rgba(255,248,232,0.95)", 14);
    ctx.fillStyle = "rgba(90,60,30,0.12)"; ctx.fillRect(this.bx, this.by, this.bw, this.bh);
    if (im && im.complete && (this.facile || this.modele || this.fini)) {
      ctx.save(); ctx.globalAlpha = this.fini ? Math.min(1, this.finAnim * 1.5) : this.modele ? 0.9 : 0.22;
      ctx.drawImage(im, this.bx, this.by, this.bw, this.bh); ctx.restore();
    }
    ctx.strokeStyle = "rgba(90,60,30,0.18)"; ctx.lineWidth = 1;
    for (let k = 1; k < this.cols; k++) { ctx.beginPath(); ctx.moveTo(this.bx + k * this.pw, this.by); ctx.lineTo(this.bx + k * this.pw, this.by + this.bh); ctx.stroke(); }
    for (let l = 1; l < this.ligs; l++) { ctx.beginPath(); ctx.moveTo(this.bx, this.by + l * this.ph); ctx.lineTo(this.bx + this.bw, this.by + l * this.ph); ctx.stroke(); }
    // titre du tableau dans le bac
    ctx.font = `900 14px ${POLICE}`; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    if (this.L > this.H * 1.05) ctx.fillText(this.t.titre, this.zone.x, this.H * 0.155 + 14);
    if (!im || !im.complete) { paragraphe(ctx, "Chargement du tableau…", this.L / 2, this.by + this.bh / 2, this.bw, 16, "#7a5a3a"); return; }
    if (!(this.modele && !this.fini)) for (const p of this.ordre) this.dessinerPiece(ctx, p, im, p === this.prise);
    if (!this.fini) {
      dessinerBouton(ctx, this.aide, this.temps);
      if (this.modele) { ctx.fillStyle = "rgba(0,0,0,0.55)"; arrondi(ctx, this.bx + 10, this.by + 10, 190, 30, 15); ctx.fill(); ctx.font = `800 13px ${POLICE}`; ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText("Lâche le bouton pour jouer", this.bx + 22, this.by + 25); }
    }
  }
}

const def: DefJeu = {
  id: "puzzle-pei",
  titre: "Puzzle péi",
  accroche: "Reconstitue les tableaux de La Réunion : marchés, volcan, champs de cannes, varangue, kaz lontan…",
  regles: [
    "Fais glisser chaque pièce à sa place sur le plateau : elle s'aimante quand elle est bien posée.",
    "Garde le doigt sur « Modèle » pour revoir le tableau entier.",
    "Le puzzle grandit avec les niveaux : de 12 à 35 pièces. Jusqu'au niveau 9, le tableau est dessiné en transparence.",
    "Plus tu vas vite, plus tu gagnes d'étoiles. Chaque tableau fini t'apprend quelque chose sur l'île.",
  ],
  niveaux: TABLEAUX.length,
  theme: THEMES.lagon,
  images: Object.fromEntries(TABLEAUX.map((t) => [t.id, cheminFond(t.id)])),
  creer: (c, n) => new Puzzle(c, n),
};
export default def;
