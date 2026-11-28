// Le marché des jus (v3, nov. 2026) : plusieurs clients à la fois devant le comptoir, deux blenders à mener de front.
// On choisit d'abord un blender, on y met les fruits d'une commande, on lance MIXER, on l'arrête dans le vert, puis on sert le client.
// Visuels : aquarelles ElevenLabs (nov. 2026). Les fruits sont repeints d'après les photos des planches de KWélafé,
// pour garder la forme exacte de chaque fruit péi. Fichiers dans public/jeux/marche-des-jus/.
// Inventions péi : la brume des Hauts cache la commande (on l'essuie du doigt), le koudmin du voisin prépare un jus entier.
import { type Contexte, type DefJeu, type Jeu, THEMES, sprite, texteContour, arrondi, melanger } from "../commun/moteur2d";
import { photosJus, couleurDe, photo } from "../commun/photos";
import { bulle, jauge, dans } from "../commun/dessins";
import { Combo, Choix, Pouvoir, Guide, nappeBrume, bouton, dansBtn, marge, type Btn } from "../commun/outils-pei";

// Un seul visuel par nom de fruit : certaines planches montrent deux fois le même fruit (deux « Abiu », deux « Safou »…),
// ce qui donnait deux cagettes au même nom sur l'étal. On garde la fiche nommée, pas le doublon « photo-… ».
const JUTEUX = (() => {
  const tous = photosJus(), vus = new Set<string>();
  const tri = [...tous.filter((id) => !id.startsWith("photo-")), ...tous.filter((id) => id.startsWith("photo-"))];
  return tri.filter((id) => { const n = photo(id)?.nom ?? id; if (vus.has(n)) return false; vus.add(n); return true; });
})();

const BASE = "/jeux/marche-des-jus/";
const NB_CLIENTS = 6;
/** Aquarelles du jeu : fruits, clients du marché, blender, verre, cagette, letchi d'or. */
const IMAGES: Record<string, string> = {
  "mdj:blender": BASE + "blender.webp", "mdj:verre": BASE + "verre.webp", "mdj:cagette": BASE + "cagette.webp", "mdj:letchi-or": BASE + "letchi-or.webp",
};
for (const id of JUTEUX) IMAGES["mdj:" + id] = `${BASE}fruits/${id}.webp`;
for (let i = 1; i <= NB_CLIENTS; i++) IMAGES["mdj:client-" + i] = `${BASE}client-${i}.webp`;

const prete = (im?: HTMLImageElement): im is HTMLImageElement => !!im && im.complete && im.naturalWidth > 0;
/** Dessine une image à la hauteur voulue, centrée en x, posée sur la ligne « bas ». */
function poser(ctx: CanvasRenderingContext2D, im: HTMLImageElement | HTMLCanvasElement | undefined, cx: number, bas: number, h: number, alpha = 1) {
  if (!im) return;
  const lw = im instanceof HTMLImageElement ? im.naturalWidth : im.width, lh = im instanceof HTMLImageElement ? im.naturalHeight : im.height;
  if (!lw || !lh) return;
  const w = h * lw / lh;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.drawImage(im, cx - w / 2, bas - h, w, h); ctx.restore();
}
/** Verre de jus : l'aquarelle du verre (jus blanc) teintée à la couleur du fruit, gardée en mémoire par couleur. */
const verres = new Map<string, HTMLCanvasElement>();
function verreTeinte(im: HTMLImageElement | undefined, couleur: string): HTMLCanvasElement | undefined {
  if (!prete(im)) return undefined;
  let c = verres.get(couleur); if (c) return c;
  c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const x = c.getContext("2d"); if (!x) return undefined;
  x.drawImage(im, 0, 0);
  // couleur du jus éclaircie (un jus est plus clair que la peau du fruit), pour garder les reflets du verre
  const n = parseInt(couleur.replace("#", ""), 16), cl = (v: number) => Math.round(v + (255 - v) * 0.38);
  x.globalCompositeOperation = "multiply"; x.fillStyle = `rgb(${cl((n >> 16) & 255)},${cl((n >> 8) & 255)},${cl(n & 255)})`; x.fillRect(0, 0, c.width, c.height);
  x.globalAlpha = 1; x.globalCompositeOperation = "destination-in"; x.drawImage(im, 0, 0);
  verres.set(couleur, c); return c;
}
// Intérieur du bol du blender, en fractions de l'image (haut gauche, haut droit, bas droit, bas gauche).
const BOL = { hx0: 0.12, hx1: 0.77, haut: 0.14, bx0: 0.22, bx1: 0.66, bas: 0.57 };

// ---------------------------------------------------------------------------
// Décor calé sur le jeu : le bord du comptoir de l'aquarelle sert de repère à toute la mise en place.
// Les clients se tiennent DERRIÈRE le comptoir, les blenders et les cagettes sont posés DESSUS.
const ZOOM = 1.16;
/** Bord lointain du comptoir dans l'image (fractions x, y) : il monte de la gauche vers la droite, puis redescend. */
const BORD: [number, number][] = [[0, 0.611], [0.72, 0.567], [1, 0.588]];
const BORD_CENTRE = 0.581;
function cadre(L: number, H: number) {
  const h = Math.max(L, H) * ZOOM, cible = H * (L < H ? 0.455 : 0.52);
  const haut = Math.min(0, Math.max(H - h, cible - BORD_CENTRE * h)), gauche = (L - h) / 2;
  return { h, haut, gauche, y: haut + BORD_CENTRE * h };
}
/** Hauteur du bord du comptoir à l'écran, à l'abscisse x. */
function bordA(L: number, H: number, x: number) {
  const k = cadre(L, H), u = Math.max(0, Math.min(1, (x - k.gauche) / k.h));
  const [a, b] = u <= BORD[1][0] ? [BORD[0], BORD[1]] : [BORD[1], BORD[2]];
  return k.haut + (a[1] + (b[1] - a[1]) * (u - a[0]) / (b[0] - a[0])) * k.h;
}

type Client = { n: number; img: number; recette: string[]; patience: number; arrive: number; part: number; content: boolean; t0: number; saute: number };
type Blender = { dedans: string[]; etat: "libre" | "mixe" | "pret"; jauge: number; palier: number; qualite: number; secoue: number; pop: number };
type Volant = { id: string; t: number; x0: number; y0: number; b: number };
type Verre = { t: number; x0: number; y0: number; slot: number; couleur: string };
type Rect = { x: number; y: number; w: number; h: number };

const melange = (ids: string[]) => {
  if (!ids.length) return "#ffe066";
  let r = 0, g = 0, b = 0;
  for (const id of ids) { const n = parseInt(couleurDe(id).replace("#", ""), 16); r += (n >> 16) & 255; g += (n >> 8) & 255; b += n & 255; }
  const h = (v: number) => Math.round(v / ids.length).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
};
const memeJus = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

class MarcheDesJus implements Jeu {
  L: number; H: number; temps = 0; score = 0; fini = false;
  pb: boolean;
  etal: string[]; zones: (Rect & { id: string })[] = [];
  nbSlots: number; clients: (Client | null)[] = []; attente: number[] = []; numero = 0; maxFruits: number;
  blenders: Blender[] = [0, 1].map(() => ({ dedans: [], etat: "libre", jauge: 0, palier: 0, qualite: 0, secoue: 0, pop: 0 }));
  choisi = -1;
  volants: Volant[] = []; verres: Verre[] = [];
  servis = 0; objectif: number; departs = 0; parfaits = 0; suite = 0; defiFait = false; enchaine = 0; dernierService = -99;
  dureePatience: number; zone: [number, number]; vitesse: number;
  brume = 0; brumeDans = 9; essuie = 0;
  or: { i: number; t: number } | null = null; prochainOr = 14;
  secoue: Record<number, number> = {};
  combo: Combo; choix: Choix; koudmin: Pouvoir; guide: Guide; choixFait = false;
  // mise en place (recalculée à chaque changement de taille)
  yC = 0; hClient = 100; hBulle = 50; wSlot = 100; hautClients = 0;
  hBl = 120; yBl = 0; ecart = 140; btn: Btn[] = [{ x: 0, y: 0, w: 0, h: 0 }, { x: 0, y: 0, w: 0, h: 0 }];

  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H; this.pb = c.mode === "probleme";
    const n = c.niveau, m = marge(c.L, c.H);
    const voulu = this.pb ? (n <= 1 ? 3 : n <= 5 ? 4 : 5) : n <= 2 ? 2 : n <= 6 ? 3 : n <= 14 ? 4 : 5;
    this.nbSlots = Math.max(2, Math.min(voulu, Math.floor((c.L - m * 2) / 62)));
    this.maxFruits = this.pb ? (n <= 3 ? 2 : 3) : n <= 2 ? 1 : n <= 8 ? 2 : 3;
    this.objectif = this.pb ? Math.min(18, 8 + Math.floor(n / 3)) : Math.min(14, 6 + Math.floor(n / 3));
    this.dureePatience = Math.max(16, 32 - n * 0.4);
    this.zone = this.pb ? [0.62, 0.8] : [0.5, 0.9];
    this.vitesse = this.pb ? 0.22 + n * 0.006 : 0.34;   // problèm : le vert arrive vers 3 s, le débordement vers 5 s
    this.etal = melanger(JUTEUX, c.rnd).slice(0, n <= 4 ? 6 : 9);
    this.combo = new Combo(c); this.choix = new Choix(c); this.koudmin = new Pouvoir(c, "🤝", "Koudmin"); this.guide = new Guide(n === 1);
    this.koudmin.place = (L, H) => { const r = Math.min(38, Math.min(L, H) * 0.09); return { x: Math.max(marge(L, H) + r, L / 2 - this.ecart / 2 - this.hBl * 0.42 - r - 30), y: this.yBl + this.hBl * 0.55 }; };
    this.clients = Array.from({ length: this.nbSlots }, () => null);
    this.attente = this.clients.map((_, i) => 0.3 + i * (this.pb ? 1.6 : 2.4));
    this.disposer(); this.hud();
  }
  hud() {
    const coeurs = this.pb ? " · " + "🧡".repeat(Math.max(0, 3 - this.departs)) : "";
    this.c.hud({ score: this.score, objectif: `${this.servis}/${this.objectif} jus${coeurs}`, info: this.defiFait ? "Défi réussi : 3 jus parfaits d'affilée" : `Défi : 3 jus parfaits d'affilée (${Math.min(this.suite, 3)}/3)` });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }

  /** Tout se place par rapport au bord du comptoir : clients derrière, blenders puis cagettes dessus. */
  disposer() {
    const { L, H } = this, m = marge(L, H), k = cadre(L, H), paysage = L > H;
    this.yC = k.y;
    // clients et bulles, entre le haut de l'écran (score, défi, guide) et le comptoir
    const hautLibre = Math.max(128, H * 0.155) + (this.c.niveau === 1 ? 70 : 0);   // niveau 1 : place pour la phrase du guide
    this.wSlot = (L - m * 2) / this.nbSlots;
    this.hBulle = Math.max(40, Math.min(58, H * 0.07));
    this.hClient = Math.max(70, Math.min(this.wSlot * 1.75, this.yC - hautLibre - this.hBulle - 10, H * 0.26));
    this.hautClients = this.yC - this.hClient * 0.9 - this.hBulle - 8;
    // blenders posés sur le comptoir, juste devant le bord
    this.hBl = Math.max(92, Math.min(150, H * (paysage ? 0.2 : 0.155)));
    this.ecart = Math.max(this.hBl * 0.555 + 62, Math.min(L * 0.36, 190));
    const basBord = Math.max(bordA(L, H, L / 2 - this.ecart), bordA(L, H, L / 2 + this.ecart));
    this.yBl = basBord + 8;
    const hBtn = Math.max(38, Math.min(46, H * 0.055)), wBtn = Math.min(this.ecart - 10, 132), yBtn = this.yBl + this.hBl + 6;
    this.btn = [0, 1].map((i) => ({ x: this.xBl(i) - wBtn / 2, y: yBtn, w: wBtn, h: hBtn }));
    // étal : les cagettes occupent le bas du comptoir, à portée de pouce
    const haut = yBtn + hBtn + 12, bas = H - m - 2, n = this.etal.length, dispo = Math.max(60, bas - haut);
    let cols = 3, mieux = -1;
    for (const c of paysage ? [3, 5, 6, 9] : [3, 4, 5]) {
      const lg = Math.ceil(n / c), w = Math.min((L - m * 2) / c, 150), h = Math.min(dispo / lg, 118), note = Math.min(w, h * 1.25);
      if (note > mieux + 0.5) { mieux = note; cols = c; }
    }
    const lg = Math.ceil(n / cols), cw = Math.min((L - m * 2) / cols, 150), ch = Math.min(dispo / lg, 118), x0 = (L - cw * cols) / 2, y0 = bas - ch * lg;
    this.zones = this.etal.map((id, i) => ({ id, x: x0 + (i % cols) * cw + 4, y: y0 + Math.floor(i / cols) * ch + 3, w: cw - 8, h: ch - 6 }));
  }
  xBl(i: number) { return this.L / 2 + (i ? 1 : -1) * this.ecart / 2 + 9; }
  xSlot(i: number) { return marge(this.L, this.H) + this.wSlot * (i + 0.5); }
  /** Zone tactile d'un blender (bol, socle et jauge). */
  rectBl(i: number): Rect { const w = this.hBl * 0.555 + 34; return { x: this.xBl(i) - w / 2 - 10, y: this.yBl - 6, w: w + 10, h: this.hBl + 8 }; }
  rectVider(i: number): Rect { const r = 15; return { x: this.xBl(i) + this.hBl * 0.555 / 2 - 2, y: this.yBl - 4, w: r * 2, h: r * 2 }; }
  rectClient(i: number): Rect { return { x: this.xSlot(i) - this.wSlot / 2, y: this.hautClients - 4, w: this.wSlot, h: this.yC - this.hautClients + 10 }; }
  rectBulle(i: number): Rect { const w = Math.min(this.wSlot - 6, 150); return { x: this.xSlot(i) - w / 2, y: this.hautClients, w, h: this.hBulle }; }

  // ------------------------------------------------------------------ clients
  nouveauClient(slot: number) {
    const n = this.c.niveau, presents = this.clients.filter(Boolean) as Client[];
    const place = Math.max(1, Math.floor((Math.min(this.wSlot - 6, 150) - 10) / 27));
    const max = Math.max(1, Math.min(this.maxFruits, place, 3));
    let recette: string[] = [];
    for (let essai = 0; essai < 8; essai++) {
      recette = melanger(this.etal, this.c.rnd).slice(0, 1 + Math.floor(this.c.rnd() * max));
      if (!presents.some((p) => memeJus(p.recette, recette))) break;   // deux clients n'attendent pas le même jus
    }
    let img = Math.floor(this.c.rnd() * NB_CLIENTS);
    for (let essai = 0; essai < 6 && presents.some((p) => p.img === img); essai++) img = (img + 1) % NB_CLIENTS;
    this.clients[slot] = { n: ++this.numero, img, recette, patience: 1, arrive: 0, part: 0, content: false, t0: this.temps, saute: 0 };
    this.c.kw.son("clic");
    if (n === 1 && this.numero === 1) this.guide.dire("blender", "Touche un blender pour le choisir.", { x: this.xBl(0), y: this.yBl + this.hBl * 0.45 });
  }
  /** Client servi ou parti : la place se libère, un autre arrive bientôt. */
  liberer(slot: number, content: boolean) { const cl = this.clients[slot]; if (!cl || cl.part > 0) return; cl.part = 0.001; cl.content = content; }
  /** Client qui attend exactement ce jus (le plus pressé d'abord). */
  clientPour(dedans: string[]) {
    let mieux = -1;
    this.clients.forEach((cl, i) => { if (cl && cl.part === 0 && cl.arrive > 0.6 && memeJus(cl.recette, dedans) && !this.verres.some((v) => v.slot === i) && (mieux < 0 || cl.patience < this.clients[mieux]!.patience)) mieux = i; });
    return mieux;
  }
  /** Ce mélange peut-il encore devenir la commande de quelqu'un ? */
  utile(dedans: string[]) { return this.clients.some((cl) => cl && cl.part === 0 && dedans.every((d) => cl.recette.includes(d))); }

  // ------------------------------------------------------------------ gestes
  down(x: number, y: number) {
    if (this.fini || this.choix.down(x, y, this.L, this.H)) return;
    if (this.koudmin.down(x, y, this.L, this.H)) { this.lancerKoudmin(); return; }
    if (this.or) { const z = this.zones[this.or.i]; if (dans(x, y, z)) { this.or = null; this.score += 50; this.c.kw.ev("pepite", x, y); this.c.fx.texte("Letchi d'or +50", x, y - 30, "#FFD23F", 22); this.hud(); return; } }
    // 1. les blenders : vider, bouton MIXER / STOP, ou simple choix
    for (let i = 0; i < 2; i++) {
      const b = this.blenders[i];
      if (b.etat !== "mixe" && b.dedans.length && dans(x, y, this.rectVider(i))) { this.vider(i); return; }
      if (dansBtn(x, y, this.btn[i])) { this.choisir(i, x, y); this.actionner(i); return; }
      if (dans(x, y, this.rectBl(i))) {
        const deja = this.choisi === i; this.choisir(i, x, y);
        if (b.etat === "mixe") this.arreter(i);                       // toucher un blender qui tourne l'arrête
        else if (deja && b.etat === "libre" && b.dedans.length) this.actionner(i);   // deuxième toucher : on lance
        return;
      }
    }
    // 2. les clients : servir un jus prêt
    for (let i = 0; i < this.nbSlots; i++) {
      const cl = this.clients[i];
      if (!cl || cl.part > 0 || !dans(x, y, this.rectClient(i))) continue;
      if (this.pb && this.brume > 0.5) { this.essuyer(); return; }
      this.servir(i, x, y); return;
    }
    // 3. l'étal : un fruit va dans le blender choisi
    const i = this.zones.findIndex((z) => dans(x, y, z)); if (i < 0) return;
    this.poserFruit(i, x, y);
  }
  move(x: number, y: number) { if (this.pb && this.brume > 0.5 && y > this.hautClients - 6 && y < this.hautClients + this.hBulle + 6) this.essuyer(); }
  up() { /* plus de bouton à tenir : le blender tourne tout seul, on l'arrête d'un toucher */ }
  essuyer() { if (this.essuie > 0) return; this.essuie = 1.3; this.brumeDans = 11 + this.c.rnd() * 6; this.c.kw.joue("brumePei", this.L / 2, this.hautClients + this.hBulle / 2, { intensite: 0.5 }); this.c.kw.son("vent"); }

  choisir(i: number, x: number, y: number) {
    if (this.choisi !== i) { this.choisi = i; this.blenders[i].pop = 1; this.c.kw.ev("clic", x, y); }
    this.guide.fait("blender");
    const cl = this.clients.find((q) => q && q.part === 0);
    if (cl && !this.blenders[i].dedans.length) { const z = this.zones.find((q) => q.id === cl.recette[0]); if (z) this.guide.dire("fruit", "Regarde la bulle d'un client, puis touche le même fruit sur ton étal.", { x: z.x + z.w / 2, y: z.y + z.h / 2 }); }
  }
  poserFruit(i: number, x: number, y: number) {
    const z = this.zones[i], id = z.id;
    if (this.choisi < 0) { this.blenders.forEach((b) => (b.pop = 1)); this.combo.presque(x, y, "Choisis d'abord un blender"); return; }
    const b = this.blenders[this.choisi], enVol = this.volants.filter((v) => v.b === this.choisi).map((v) => v.id), prevu = [...b.dedans, ...enVol];
    if (b.etat !== "libre") { b.secoue = 0.4; this.combo.presque(x, y, b.etat === "mixe" ? "Ce blender tourne : prends l'autre" : "Ce jus est prêt : sers-le d'abord"); return; }
    if (prevu.includes(id)) { this.secoue[i] = 0.4; return; }
    if (prevu.length >= 3) { b.secoue = 0.4; this.combo.presque(x, y, "Le blender est plein"); return; }
    if (!this.pb && !this.utile([...prevu, id])) { this.secoue[i] = 0.4; this.combo.presque(x, y, "Personne n'a commandé ça"); return; }
    this.volants.push({ id, t: 0, x0: z.x + z.w / 2, y0: z.y + z.h / 2, b: this.choisi });
    this.c.kw.ev("clic", x, y); this.guide.fait("fruit");
  }
  vider(i: number) {
    const b = this.blenders[i]; b.dedans = []; b.etat = "libre"; b.jauge = 0; b.secoue = 0.3;
    this.volants = this.volants.filter((v) => v.b !== i);
    this.c.kw.joue("bulles", this.xBl(i), this.yBl + this.hBl * 0.3, { intensite: 0.4 }); this.c.kw.son("bulles");
    if (this.pb) { this.suite = 0; this.combo.n = 0; this.hud(); }
  }
  /** Bouton sous le blender : MIXER, puis STOP. */
  actionner(i: number) {
    const b = this.blenders[i];
    if (b.etat === "mixe") return this.arreter(i);
    if (b.etat === "pret") { const s = this.clientPour(b.dedans); if (s >= 0) this.servir(s, this.xSlot(s), this.yC - this.hClient * 0.5); else this.combo.presque(this.xBl(i), this.yBl, "Personne n'attend ce jus"); return; }
    if (!b.dedans.length || this.volants.some((v) => v.b === i)) { b.pop = 1; return; }
    b.etat = "mixe"; b.jauge = 0; b.palier = 0; this.c.kw.son("mixeur"); this.guide.fait("mix");
    this.guide.dire("stop", this.pb ? "Touche STOP quand la jauge est dans le vert." : "Touche STOP dans le vert : la jauge t'y attend.", { x: this.btn[i].x + this.btn[i].w / 2, y: this.btn[i].y + this.btn[i].h / 2 });
  }
  arreter(i: number, auto = false) {
    const b = this.blenders[i]; if (b.etat !== "mixe") return;
    const [a, z] = this.zone, v = b.jauge, x = this.xBl(i), y = this.yBl + this.hBl * 0.3, coul = melange(b.dedans);
    b.etat = "pret"; b.qualite = auto || (v >= a && v <= z) ? 1 : 0.5; b.pop = 1; this.guide.fait("stop");
    this.c.kw.joue("anneau", x, y, { couleur: coul, intensite: 0.6 }); if (b.qualite === 1) this.c.kw.joue("etoiles", x, y, { intensite: 0.5 });
    this.c.fx.texte(b.qualite === 1 ? "Jus parfait !" : v < a ? "Pas assez mixé" : "Un peu trop mixé", x, y - 26, b.qualite === 1 ? "#B8F28A" : "#BFF3FF", 19);
    const s = this.clientPour(b.dedans);
    if (s >= 0) this.guide.dire("sers", "Le jus est prêt : touche le client qui l'a commandé.", { x: this.xSlot(s), y: this.yC - this.hClient * 0.55 });
  }
  deborder(i: number) {
    const b = this.blenders[i], x = this.xBl(i), y = this.yBl + this.hBl * 0.2;
    this.c.kw.joue("bulles", x, y, { intensite: 1 }); this.c.kw.joue("anneau", x, y, { couleur: melange(b.dedans), intensite: 0.9 }); this.combo.rate(x, y);
    this.c.fx.texte("Ça a débordé !", x, y - 26, "#fff", 20);
    b.dedans = []; b.etat = "libre"; b.jauge = 0; b.secoue = 0.5; this.suite = 0; this.hud();
  }
  /** Servir le client du créneau « slot » avec un jus prêt qui correspond (le blender choisi d'abord). */
  servir(slot: number, x: number, y: number) {
    const cl = this.clients[slot]; if (!cl) return;
    const ordre = this.choisi >= 0 ? [this.choisi, 1 - this.choisi] : [0, 1];
    const prets = ordre.filter((i) => this.blenders[i].etat === "pret");
    const i = prets.find((k) => memeJus(this.blenders[k].dedans, cl.recette));
    if (i === undefined) {
      cl.saute = 0.4;
      if (!prets.length) this.combo.presque(x, y, "Prépare d'abord son jus");
      else { this.combo.presque(x, y, "Ce n'est pas sa commande"); if (this.pb) cl.patience -= 0.06; }
      return;
    }
    if (this.verres.some((v) => v.slot === slot)) return;
    const b = this.blenders[i], bx = this.xBl(i), by = this.yBl + this.hBl * 0.3, coul = melange(b.dedans), base = 40 + cl.recette.length * 20;
    let gain = 0;
    if (b.qualite === 1) {
      gain = this.combo.bon(x, y, base, coul); this.parfaits++; this.suite++; this.koudmin.ajouter(0.25);
      if (this.suite === 3 && !this.defiFait) { this.defiFait = true; gain += 100; this.c.kw.banniere("Défi réussi ! +100", 0.7); }
    } else { this.combo.presque(x, y, "Bon, mais pas parfait"); gain = 20 + cl.recette.length * 10; this.suite = 0; this.combo.n = 0; }
    if (this.pb) { const pb = Math.round(Math.max(0, cl.patience) * 20); if (pb >= 8) { gain += pb; this.c.fx.texte(`Pourboire +${pb}`, x, y - 52, "#FFD23F", 16); } }
    // deux services coup sur coup : c'est tout l'intérêt des deux blenders
    if (this.temps - this.dernierService < 3.2) { this.enchaine++; const bonus = 15 * this.enchaine; gain += bonus; this.c.kw.onoma(this.enchaine >= 3 ? "OTÉ !" : "POKk !", this.L / 2, this.yC - 20, 0.6); this.c.fx.texte(`Doublé ! +${bonus}`, this.L / 2, this.yC + 14, "#FFE066", 22); }
    else this.enchaine = 0;
    this.dernierService = this.temps;
    this.score += gain; this.servis++;
    this.verres.push({ t: 0, x0: bx, y0: by, slot, couleur: coul });
    b.dedans = []; b.etat = "libre"; b.jauge = 0; this.guide.fait("sers");
    if (this.servis === 1) this.guide.dire("deux", "Bravo ! Tu as deux blenders : prépare deux jus en même temps.", { x: this.xBl(1 - i), y: this.yBl + this.hBl * 0.45 });
    this.hud();
  }
  lancerKoudmin() {
    // le voisin prépare, dans un blender libre, le jus du client le plus pressé
    let cible: Client | null = null;
    for (const cl of this.clients) if (cl && cl.part === 0 && !this.blenders.some((b) => b.etat !== "libre" && memeJus(b.dedans, cl.recette)) && (!cible || cl.patience < cible.patience)) cible = cl;
    const ordre = this.choisi >= 0 ? [1 - this.choisi, this.choisi] : [0, 1];
    const i = ordre.find((k) => this.blenders[k].etat === "libre" && !this.blenders[k].dedans.length) ?? ordre.find((k) => this.blenders[k].etat === "libre");
    if (!cible || i === undefined) { this.koudmin.charge = 1; this.c.fx.texte("Libère d'abord un blender", this.L / 2, this.yBl - 10, "#fff", 18); return; }
    const b = this.blenders[i]; this.volants = this.volants.filter((v) => v.b !== i);
    b.dedans = cible.recette.slice(); b.etat = "pret"; b.qualite = 1; b.pop = 1;
    this.c.kw.joue("koudminPei", this.xBl(i), this.yBl + this.hBl * 0.4, { intensite: 0.8 }); this.c.kw.banniere("Koudmin ! Le voisin t'aide", 0.6);
  }
  apresDepart() {
    if (this.fini) return;
    if (this.servis >= this.objectif && !this.verres.length) return this.finir(true);
    if (this.pb && this.departs >= 3) return this.finir(false);
    if (!this.choixFait && this.servis >= 3 && this.servis < this.objectif) {
      this.choixFait = true;
      this.choix.proposer([{ id: "zone", ic: "🟢", nom: "Zone verte plus large", txt: "Plus facile de réussir un jus parfait." }, { id: "koudmin", ic: "🤝", nom: "Koudmin tout de suite", txt: "Le voisin prépare un jus entier." }],
        (id) => { if (id === "zone") this.zone = [this.zone[0] - 0.07, Math.min(0.95, this.zone[1] + 0.05)]; else this.koudmin.ajouter(1); });
    }
  }
  finir(gagne: boolean) {
    this.fini = true;
    const r = this.parfaits / Math.max(1, this.objectif);
    this.c.fin({ gagne, score: this.score, etoiles: !gagne ? 0 : r >= 0.8 ? 3 : r >= 0.5 ? 2 : 1, lignes: [`${this.parfaits} jus parfaits · meilleure série ${this.combo.meilleur}`] });
  }

  // ------------------------------------------------------------------ temps qui passe
  maj(dt: number) {
    this.choix.maj(dt); if (this.choix.ouvert || this.fini) return;
    this.temps += dt; this.combo.maj(dt); this.koudmin.maj(dt);
    for (const k in this.secoue) this.secoue[k] = Math.max(0, this.secoue[k] - dt);
    // fruits en vol vers leur blender
    for (const v of this.volants) v.t += dt * 3.2;
    for (const v of this.volants.filter((q) => q.t >= 1)) {
      const b = this.blenders[v.b];
      if (b.etat === "libre" && b.dedans.length < 3 && !b.dedans.includes(v.id)) { b.dedans.push(v.id); b.pop = 0.6; this.c.kw.joue("anneau", this.xBl(v.b), this.yBl + this.hBl * 0.25, { couleur: couleurDe(v.id), intensite: 0.35 }); this.c.kw.son("bulles"); }
      if (b.etat === "libre" && this.clientPour(b.dedans) >= 0) this.guide.dire("mix", "La commande est complète : touche MIXER.", { x: this.btn[v.b].x + this.btn[v.b].w / 2, y: this.btn[v.b].y + this.btn[v.b].h / 2 });
    }
    this.volants = this.volants.filter((v) => v.t < 1);
    // blenders qui tournent : la jauge monte toute seule
    this.blenders.forEach((b, i) => {
      b.secoue = Math.max(0, b.secoue - dt); b.pop = Math.max(0, b.pop - dt * 2.5);
      if (b.etat !== "mixe") return;
      const [a, z] = this.zone, milieu = (a + z) / 2;
      if (!this.pb && b.jauge >= milieu && b.palier < 5) { b.palier += dt; return; }   // mode tranquille : la jauge attend dans le vert
      b.jauge += dt * this.vitesse * (!this.pb && b.palier >= 5 ? 0.5 : 1);
      if (b.jauge >= 1.04) { if (this.pb) this.deborder(i); else { b.jauge = 1; this.arreter(i); } }
    });
    // verres servis
    for (const v of this.verres) v.t += dt * 1.5;
    for (const v of this.verres.filter((q) => q.t >= 1)) { this.liberer(v.slot, true); this.c.kw.joue("etoiles", this.xSlot(v.slot), this.yC - this.hClient * 0.6, { intensite: 0.4 }); }
    this.verres = this.verres.filter((v) => v.t < 1);
    // clients : arrivée, patience, départ
    let reste = this.objectif - this.servis - this.clients.filter((cl) => cl && cl.part === 0).length;
    this.clients.forEach((cl, i) => {
      if (!cl) {
        if (reste <= 0) return;
        this.attente[i] -= dt; if (this.attente[i] <= 0) { this.nouveauClient(i); reste--; }
        return;
      }
      cl.saute = Math.max(0, cl.saute - dt);
      if (cl.part > 0) {
        cl.part += dt * 1.6;
        if (cl.part >= 1) { this.clients[i] = null; this.attente[i] = (this.pb ? 0.8 : 1.4) + this.c.rnd() * 1.6; this.apresDepart(); }
        return;
      }
      cl.arrive = Math.min(1, cl.arrive + dt * 2.2);
      if (this.pb && !this.verres.some((v) => v.slot === i)) {
        cl.patience -= dt / this.dureePatience;
        if (cl.patience <= 0) { this.departs++; this.suite = 0; this.combo.n = 0; this.liberer(i, false); this.c.kw.ev("presque", this.xSlot(i), this.yC - this.hClient * 0.5); this.c.fx.texte("Le client reviendra", this.xSlot(i), this.hautClients - 6, "#fff", 17); this.hud(); }
      }
    });
    if (this.servis >= this.objectif && !this.verres.length && !this.clients.some((cl) => cl && cl.part > 0)) this.finir(true);
    // brume des Hauts (mode problèm, à partir du niveau 2) : elle cache les commandes, on l'essuie du doigt
    if (this.pb && this.c.niveau >= 2) {
      this.essuie = Math.max(0, this.essuie - dt); this.brumeDans -= dt;
      const cible = this.brumeDans <= 0 && this.essuie <= 0 ? 1 : 0;
      this.brume += (cible - this.brume) * Math.min(1, dt * 3);
    }
    this.prochainOr -= dt;
    if (this.or) { this.or.t -= dt; if (this.or.t <= 0) this.or = null; }
    else if (this.prochainOr <= 0) { this.prochainOr = 16 + this.c.rnd() * 10; this.or = { i: Math.floor(this.c.rnd() * this.zones.length), t: 3 }; this.c.kw.son("eclat"); }
  }

  // ------------------------------------------------------------------ dessin
  dessiner(ctx: CanvasRenderingContext2D) {
    const { L, H } = this;
    this.dessinerClients(ctx);
    this.dessinerComptoir(ctx);
    for (let i = 0; i < 2; i++) this.dessinerBlender(ctx, i);
    // étal (zone du pouce)
    const attendus = new Set<string>(); this.clients.forEach((cl) => { if (cl && cl.part === 0) cl.recette.forEach((r) => attendus.add(r)); });
    this.zones.forEach((z, i) => {
      const s = this.secoue[i] ? Math.sin(this.secoue[i] * 50) * 5 : 0, or = this.or && this.or.i === i;
      const cw = Math.min(z.w * 1.04, z.h * 1.25), chh = cw * 0.7475, mx = z.x + z.w / 2 + s, pied = z.y + z.h + 2;
      if (or) { ctx.save(); ctx.shadowColor = "rgba(255,220,90,0.95)"; ctx.shadowBlur = 22; poser(ctx, this.c.img("mdj:cagette"), mx, pied, chh); ctx.restore(); }
      else poser(ctx, this.c.img("mdj:cagette"), mx, pied, chh);
      const dansChoisi = this.choisi >= 0 && this.blenders[this.choisi].dedans.includes(z.id);
      sprite(ctx, this.c.img(or ? "mdj:letchi-or" : "mdj:" + z.id), mx, pied - chh * 0.66, Math.min(z.w, z.h * 1.1) * 0.7, 0, dansChoisi ? 0.45 : !or && !attendus.has(z.id) && !this.pb ? 0.8 : 1);
      const nom = photo(z.id)?.nom;
      if (nom && !or && z.h >= 52) {
        // le nom tient toujours dans sa cagette : on réduit la taille pour les noms longs
        let t = Math.min(13, z.w * 0.115 + 2); ctx.font = `800 ${t}px Nunito, system-ui, sans-serif`;
        const lw = ctx.measureText(nom).width; if (lw > z.w + 2) t = Math.max(8, t * (z.w + 2) / lw);
        texteContour(ctx, nom, mx, z.y + z.h - 9, t, "#fff");
      }
    });
    // fruits en vol
    for (const v of this.volants) { const e = v.t * v.t * (3 - 2 * v.t), bx = this.xBl(v.b); sprite(ctx, this.c.img("mdj:" + v.id), v.x0 + (bx - v.x0) * e, v.y0 + (this.yBl - v.y0) * e - Math.sin(e * Math.PI) * 60, 50, e * 5); }
    // verres servis : du blender vers le client
    for (const v of this.verres) {
      const e = v.t * v.t * (3 - 2 * v.t), hv = Math.max(46, this.hClient * 0.42), xc = this.xSlot(v.slot), yc = this.yC - this.hClient * 0.3;
      poser(ctx, verreTeinte(this.c.img("mdj:verre"), v.couleur), v.x0 + (xc - v.x0) * e, v.y0 + (yc - v.y0) * e - Math.sin(e * Math.PI) * 50 + hv / 2, hv);
    }
    // série en cours, à droite des blenders
    if (this.combo.n >= 2) {
      const w = 70, h = 50, x = Math.min(L - marge(L, H) - w, this.xBl(1) + this.hBl * 0.32 + 24), y = this.yBl + this.hBl * 0.3, e = 1 + this.combo.pop * 0.2;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(e, e);
      ctx.fillStyle = this.combo.m >= 3 ? "rgba(230,57,70,0.92)" : "rgba(40,20,10,0.72)"; arrondi(ctx, -w / 2, -h / 2, w, h, 14); ctx.fill();
      texteContour(ctx, `×${this.combo.m}`, 0, -8, 21, "#FFE066"); texteContour(ctx, `série ${this.combo.n}`, 0, 13, 12, "#fff");
      ctx.restore();
    }
    this.koudmin.dessiner(ctx, L, H, this.temps);
    this.guide.dessiner(ctx, L, H, this.temps, Math.max(122, H * 0.148));
    this.choix.dessiner(ctx, L, H);
  }

  dessinerClients(ctx: CanvasRenderingContext2D) {
    const prets = this.blenders.filter((b) => b.etat === "pret");
    this.clients.forEach((cl, i) => {
      if (!cl) return;
      const x = this.xSlot(i), h = this.hClient, pied = bordA(this.L, this.H, x) + h * 0.1;
      const monte = (1 - cl.arrive) * h * 0.55, sort = cl.part * h * 0.7, alpha = Math.min(1, cl.arrive * 1.6) * (1 - cl.part);
      const presse = this.pb && cl.patience < 0.3 && cl.part === 0 ? Math.sin(this.temps * 22) * 2.5 : 0, saut = cl.saute ? Math.sin(cl.saute * 40) * 4 : 0;
      poser(ctx, this.c.img("mdj:client-" + (1 + cl.img)), x + presse + saut, pied + monte + sort + Math.sin(this.temps * 2 + cl.n) * h * 0.012, h, alpha);
    });
    // bulles de commande, au-dessus des têtes
    this.clients.forEach((cl, i) => {
      if (!cl || cl.part > 0 || cl.arrive < 0.6) return;
      const R = this.rectBulle(i), pret = prets.some((b) => memeJus(b.dedans, cl.recette));
      ctx.save();
      if (pret) { ctx.shadowColor = "rgba(90,220,110,0.95)"; ctx.shadowBlur = 16 + Math.sin(this.temps * 6) * 5; }
      ctx.fillStyle = "#fffaf0"; arrondi(ctx, R.x, R.y, R.w, R.h, 14); ctx.fill();
      ctx.beginPath(); ctx.moveTo(R.x + R.w / 2 - 9, R.y + R.h - 1); ctx.lineTo(R.x + R.w / 2, R.y + R.h + 10); ctx.lineTo(R.x + R.w / 2 + 9, R.y + R.h - 1); ctx.fill();
      ctx.restore();
      if (pret) { ctx.strokeStyle = "#3aa85a"; ctx.lineWidth = 3; arrondi(ctx, R.x, R.y, R.w, R.h, 14); ctx.stroke(); }
      const k = cl.recette.length, t = Math.min(R.h * 0.72, (R.w - 8) / k - 3), sel = this.choisi >= 0 ? this.blenders[this.choisi].dedans : [];
      cl.recette.forEach((id, j) => {
        const fx = R.x + R.w / 2 + (j - (k - 1) / 2) * (t + 3), fait = sel.includes(id) && sel.every((d) => cl.recette.includes(d));
        sprite(ctx, this.c.img("mdj:" + id), fx, R.y + R.h / 2 - (this.pb ? 3 : 0), t, 0, fait ? 0.4 : 1, false);
        if (fait) texteContour(ctx, "✓", fx, R.y + R.h / 2 - (this.pb ? 3 : 0), t * 0.6, "#3aa85a");
      });
      if (this.pb) jauge(ctx, R.x + 6, R.y + R.h - 9, R.w - 12, 5, Math.max(0, cl.patience));
    });
    if (this.pb && this.brume > 0.02) {
      const m = marge(this.L, this.H);
      nappeBrume(ctx, m - 6, this.hautClients - 8, this.L - m * 2 + 12, this.hBulle + 22, this.temps, this.brume);
      if (this.brume > 0.6) texteContour(ctx, "Essuie la brume", this.L / 2, this.hautClients + this.hBulle / 2, 16, "#5A7A8A");
    }
  }

  /** Le comptoir repasse devant les clients : ils sont bien derrière l'étal. */
  dessinerComptoir(ctx: CanvasRenderingContext2D) {
    const { L, H } = this, fond = this.c.img("fond:marche-des-jus");
    if (!prete(fond)) return;
    const k = cadre(L, H);
    ctx.save();
    ctx.beginPath(); ctx.moveTo(0, H);
    for (const [u, v] of BORD) ctx.lineTo(k.gauche + u * k.h, k.haut + v * k.h);
    ctx.lineTo(L, H); ctx.closePath(); ctx.clip();
    ctx.drawImage(fond, k.gauche, k.haut, k.h, k.h);
    // mêmes voiles que le décor du moteur, pour que le raccord ne se voie pas
    ctx.fillStyle = "rgba(255,250,240,0.12)"; ctx.fillRect(0, 0, L, H);
    const v = ctx.createRadialGradient(L / 2, H / 2, Math.min(L, H) * 0.4, L / 2, H / 2, Math.max(L, H) * 0.8);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, L, H);
    ctx.restore();
  }

  dessinerBlender(ctx: CanvasRenderingContext2D, i: number) {
    const b = this.blenders[i], x = this.xBl(i), ih = this.hBl, imB = this.c.img("mdj:blender"), iw = prete(imB) ? ih * imB.naturalWidth / imB.naturalHeight : ih * 0.555;
    const ix = x - iw / 2, iy = this.yBl, choisi = this.choisi === i;
    const vib = b.etat === "mixe" ? Math.sin(this.temps * 60) * 1.8 : b.secoue ? Math.sin(b.secoue * 50) * 4 : 0, e = 1 + b.pop * 0.08;
    // ombre posée sur le bois, et halo du blender choisi
    ctx.save();
    ctx.fillStyle = "rgba(60,30,10,0.28)"; ctx.beginPath(); ctx.ellipse(x, iy + ih * 0.985, iw * 0.62, ih * 0.06, 0, 0, 7); ctx.fill();
    if (choisi) { ctx.strokeStyle = `rgba(255,224,102,${0.75 + Math.sin(this.temps * 5) * 0.2})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, iy + ih * 0.985, iw * 0.78, ih * 0.085, 0, 0, 7); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(x + vib, iy + ih); ctx.scale(e, e); ctx.translate(-x, -(iy + ih));
    if (choisi) { ctx.save(); ctx.shadowColor = "rgba(255,224,102,0.9)"; ctx.shadowBlur = 14; poser(ctx, imB, x, iy + ih, ih); ctx.restore(); }
    else poser(ctx, imB, x, iy + ih, ih, 0.94);
    if (b.dedans.length) {
      const k = b.etat === "libre" ? b.dedans.length / 3 * 0.7 : 0.78, haut = iy + ih * BOL.haut, bas = iy + ih * BOL.bas, yy = bas - (bas - haut) * k, agite = b.etat === "mixe";
      ctx.save();
      ctx.beginPath(); ctx.moveTo(ix + iw * BOL.hx0, haut); ctx.lineTo(ix + iw * BOL.hx1, haut); ctx.lineTo(ix + iw * BOL.bx1, bas); ctx.lineTo(ix + iw * BOL.bx0, bas); ctx.closePath(); ctx.clip();
      ctx.fillStyle = b.etat === "libre" ? couleurDe(b.dedans[b.dedans.length - 1]) : melange(b.dedans); ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.moveTo(ix, bas + 4); for (let px = ix; px <= ix + iw; px += 6) ctx.lineTo(px, yy + Math.sin(px * 0.2 + this.temps * (agite ? 30 : 4)) * (agite ? 5 : 1.5)); ctx.lineTo(ix + iw, bas + 4); ctx.closePath(); ctx.fill();
      ctx.restore();
      poser(ctx, imB, x, iy + ih, ih, 0.28);
    }
    ctx.restore();
    // ce qu'il y a dedans : petits fruits au-dessus du couvercle
    if (b.dedans.length) { const t = Math.min(24, ih * 0.2); b.dedans.forEach((id, j) => sprite(ctx, this.c.img("mdj:" + id), x + (j - (b.dedans.length - 1) / 2) * (t + 2) - iw * 0.08, iy - t * 0.45, t, 0, 1, false)); }
    if (choisi && !b.dedans.length) texteContour(ctx, "▼", x - iw * 0.08, iy - 12 + Math.sin(this.temps * 5) * 3, 16, "#FFE066");
    // jauge de mixage, à gauche du bol
    if (b.etat === "mixe") {
      const [a, z] = this.zone, jw = 14, jh = ih * 0.5, jx = ix - jw - 6, jy = iy + ih * 0.1;
      ctx.fillStyle = "rgba(40,20,10,0.75)"; arrondi(ctx, jx - 2, jy - 2, jw + 4, jh + 4, 8); ctx.fill();
      ctx.fillStyle = "#e0523a"; ctx.fillRect(jx, jy, jw, jh * (1 - z));
      ctx.fillStyle = "#3aa85a"; ctx.fillRect(jx, jy + jh * (1 - z), jw, jh * (z - a));
      ctx.fillStyle = "#e8c860"; ctx.fillRect(jx, jy + jh * (1 - a), jw, jh * a);
      const yy = jy + jh * (1 - Math.min(1, b.jauge));
      ctx.fillStyle = "#fff"; ctx.strokeStyle = "#3A2410"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(jx - 7, yy - 6); ctx.lineTo(jx + jw * 0.55, yy); ctx.lineTo(jx - 7, yy + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (b.etat === "pret") texteContour(ctx, b.qualite === 1 ? "★" : "✓", ix - 4, iy + ih * 0.3, 22, b.qualite === 1 ? "#FFD23F" : "#B8F28A");
    // vider le blender (petite croix)
    if (b.etat !== "mixe" && b.dedans.length) { const r = this.rectVider(i), cx = r.x + r.w / 2, cy = r.y + r.h / 2; ctx.fillStyle = "rgba(60,30,14,0.82)"; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, 7); ctx.fill(); texteContour(ctx, "✕", cx, cy + 1, 14, "#fff"); }
    // bouton : MIXER, STOP, puis jus prêt
    const occupe = this.volants.some((v) => v.b === i);
    const texte = b.etat === "mixe" ? "STOP !" : b.etat === "pret" ? "Jus prêt" : "MIXER";
    const coul = b.etat === "mixe" ? "#C8321E" : b.etat === "pret" ? "#3aa85a" : "#E8572A";
    bouton(ctx, this.btn[i], texte, coul, 0, b.etat !== "libre" || (b.dedans.length > 0 && !occupe));
  }
}

function fondHaut(L: number, H: number) { return cadre(L, H).haut; }

const def: DefJeu = {
  id: "marche-des-jus", titre: "Le marché des jus", accroche: "Deux blenders, plusieurs clients : mène tes jus de front au marché forain.",
  regles: [], niveaux: 30, theme: THEMES.marche, images: IMAGES,
  modes: {
    trankil: ["Choisis un blender, puis touche les fruits de la bulle d'un client.", "Touche MIXER, puis STOP quand la jauge est dans le vert : elle t'y attend.", "Touche le client pour le servir. Deux blenders : prépare deux jus à la fois."],
    probleme: ["Jusqu'à 5 clients s'impatientent : garde tes deux blenders occupés.", "Zone verte étroite, et un blender oublié déborde. La brume des Hauts cache les commandes.", "Deux services coup sur coup rapportent un doublé. Trois clients repartis et la partie s'arrête."],
  },
  themeFx: "fruits", fondHaut, fondZoom: ZOOM,
  creer: (c) => new MarcheDesJus(c),
};
export default def;
