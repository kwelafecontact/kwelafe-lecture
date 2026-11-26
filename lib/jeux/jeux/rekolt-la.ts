// Rékolt la ! : les fruits sortent des buissons du jardin créole.
// Mécaniques : cueillir (toucher), faire des trios du même fruit, chasser le merle de Maurice d'un geste,
// éviter guêpes et fruits gâtés, pluie de letchis dorés avant la pause, arrosoir pendant la pause.
import { type Contexte, type DefJeu, type Jeu, type Progression, THEMES, sprite, etoilesPour, texteContour, arrondi } from "../commun/moteur2d";
import { PHOTOS } from "../commun/photos";
import { guepe } from "../commun/dessins";
// fruits péi du jardin, dans l'ordre où ils apparaissent avec les niveaux
const PEI = ["letchi", "mangue", "goyavier", "papaye", "longani", "goyave", "mandarine", "grenadine", "coco"];
const A_CUEILLIR = PEI.map((id) => PHOTOS.find((p) => p.id === id)).filter((p): p is (typeof PHOTOS)[number] => !!p);
const SONS = "/jeux/sons/rekolt-la/";

// ---------------------------------------------------------------- progression entre les parties
const FAITS = [
  "Le « merle de Maurice » est en réalité le bulbul orphée, un oiseau venu d'Asie, importé à Maurice en 1892 puis à La Réunion en 1972.",
  "Oiseau de cage apprécié pour son chant, le bulbul orphée est devenu envahissant à La Réunion après des fuites de cages.",
  "Le bulbul orphée concurrence le merle pays, un oiseau de La Réunion protégé depuis 1989.",
  "Le bulbul orphée mange surtout des fruits, et il disperse ainsi les graines de nombreuses plantes envahissantes.",
  "À La Réunion, le jardin créole est un emblème depuis le début du XVIIIe siècle.",
  "Beaucoup de plantes des jardins créoles sont arrivées par les bateaux venant des Indes qui faisaient escale à l'île.",
  "Le jardin créole mélange plusieurs étages de plantes : grands arbres fruitiers, arbustes, légumes et plantes de soin.",
  "Pierre Poivre, qui vivait à l'île de France, a introduit plus de 150 espèces d'arbres fruitiers dans les Mascareignes.",
  "En 1817, Nicolas Bréon devient directeur du Jardin de l'État à Saint-Denis et y amène près de soixante espèces d'arbres fruitiers.",
  "Le letchi a été introduit à Bourbon en 1764 par Joseph-François Charpentier de Cossigny.",
  "À La Réunion, les vergers de letchis couvrent environ 500 hectares et produisent quelque 8 000 tonnes de fruits.",
  "Le letchi réunionnais se récolte de la mi-novembre à la fin décembre : c'est le fruit vedette des fêtes de fin d'année.",
  "La Réunion a produit environ 38 000 tonnes de fruits en 2022.",
  "Les surfaces de cultures fruitières de La Réunion ont progressé de 17 % en dix ans.",
  "La mangue José est une variété réunionnaise, l'une des deux plus cultivées de l'île avec la Cogshall.",
  "Le goyavier se cueille surtout dans les Hauts humides, comme à la Plaine-des-Palmistes.",
];
const CLE = "rekoltla_v2";
type Sauvegarde = { graines: number; amelio: { gants: number; epouvantail: number; panier: number; arrosoir: number }; faits: number[]; defi: { date: string; k: number; fait: boolean } | null };
let save: Sauvegarde = { graines: 0, amelio: { gants: 0, epouvantail: 0, panier: 0, arrosoir: 0 }, faits: [], defi: null };
function charger() { try { const v = JSON.parse(localStorage.getItem(CLE) || "null"); if (v) save = { ...save, ...v, amelio: { ...save.amelio, ...(v.amelio || {}) } }; } catch { /* rien */ } }
function sauver() { try { localStorage.setItem(CLE, JSON.stringify(save)); } catch { /* rien */ } }
if (typeof window !== "undefined") charger();
const AMELIOS = [
  { id: "gants", ic: "🧤", nom: "Gants de jardin", txt: "La première piqûre de guêpe de chaque niveau ne compte pas.", prix: [10] },
  { id: "epouvantail", ic: "🎎", nom: "Épouvantail", txt: "Les merles viennent moins souvent.", prix: [6, 15] },
  { id: "panier", ic: "🧺", nom: "Grand panier", txt: "Les trios rapportent plus.", prix: [6, 15] },
  { id: "arrosoir", ic: "🚿", nom: "Bon arrosoir", txt: "L'arrosage de la pause est plus facile.", prix: [5, 12] },
] as const;
const DEFIS = [
  { type: "trios", cible: 5, txt: (n: number) => `Fais ${n} trios du même fruit` },
  { type: "merles", cible: 6, txt: (n: number) => `Chasse ${n} merles de Maurice` },
  { type: "arrosages", cible: 2, txt: (n: number) => `Réussis ${n} arrosages` },
  { type: "dores", cible: 8, txt: (n: number) => `Cueille ${n} letchis dorés` },
  { type: "fruits", cible: 80, txt: (n: number) => `Cueille ${n} fruits` },
];
function defiDuJour() {
  const d = new Date(), cle = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  if (!save.defi || save.defi.date !== cle) { save.defi = { date: cle, k: (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % DEFIS.length, fait: false }; sauver(); }
  return { ...DEFIS[save.defi.k], fait: save.defi.fait };
}
const progression: Progression = {
  monnaie: () => `${save.graines} 🌱`,
  defi: () => { const d = defiDuJour(); return (d.fait ? "Défi du jour réussi : " : "Défi du jour : ") + d.txt(d.cible) + (d.fait ? "" : " · +5 🌱"); },
  boutique: () => AMELIOS.map((a) => { const n = save.amelio[a.id], prix = n < a.prix.length ? a.prix[n] : null; return { id: a.id, ic: a.ic, nom: a.nom, txt: a.txt, niveau: n, max: a.prix.length, prix, peut: prix != null && save.graines >= prix }; }),
  acheter: (id) => { const a = AMELIOS.find((x) => x.id === id); if (!a) return false; const n = save.amelio[a.id]; if (n >= a.prix.length || save.graines < a.prix[n]) return false; save.graines -= a.prix[n]; save.amelio[a.id]++; sauver(); return true; },
  carnet: () => ({ titre: "Carnet du jardin créole", total: FAITS.length, pages: FAITS.map((f, i) => (save.faits.includes(i) ? f : null)) }),
};

// hauteur (fraction de l'image) du sol des trois terrasses du décor
const TERRASSES = [0.385, 0.565, 0.745];
// calage vertical du décor : centré, mais remonté ou descendu pour que les trois terrasses restent visibles
function fondHaut(L: number, H: number, h: number) {
  const centre = (H - h) / 2, min = H - 40 - TERRASSES[2] * h, max = 150 - TERRASSES[0] * h;
  const y = min <= max ? Math.min(max, Math.max(min, centre)) : centre;
  return Math.min(0, Math.max(H - h, y)); // jamais de bord vide
}
type Sortie = { trou: number; type: "fruit" | "gate" | "guepe" | "or" | "merle"; id: string; vie: number; max: number; touche: number; vole?: boolean };

class Rekolt implements Jeu {
  L: number; H: number;
  temps = 0; score = 0; coeurs = 3; fini = false;
  duree = 45;
  sorties: Sortie[] = [];
  prochain = 0.6;
  serie = 0;
  objectif: number;
  // trio : les derniers fruits cueillis
  derniers: string[] = [];
  // geste pour chasser le merle
  trace: { x: number; y: number }[] = []; appui = false;
  // pause au milieu du niveau : pluie dorée puis arrosoir
  phase: "jeu" | "pluie" | "arrosage" = "jeu"; phaseT = 0; pauseFaite = false;
  arrosoir = { niveau: 0, tient: false, fini: false, ok: false };
  pousse = 0;               // après un bon arrosage, les buissons donnent plus
  gantsUtilises = false;
  stats: Record<string, number> = {}; grainesPartie = 0;

  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.objectif = 300 + niveau * 60;
    charger();
    this.c.sons.prechargerFichiers(["cueille-1", "cueille-2", "guepe", "gate", "merle", "vol", "arrosoir", "or", "trio"].map((n) => SONS + n + ".mp3"));
    this.hud();
  }
  son(n: string, vol = 1, vit = 1) { return this.c.sons.fichier(SONS + n + ".mp3", vol, vit * (0.95 + this.c.rnd() * 0.1)); }
  redim(L: number, H: number) { this.L = L; this.H = H; }
  hud() { this.c.hud({ score: this.score, objectif: `objectif ${this.objectif}`, temps: Math.max(0, this.duree - this.temps), info: "❤".repeat(this.coeurs) + "♡".repeat(3 - this.coeurs) + (this.phase === "arrosage" ? " · Arrosage" : "") }); }
  compter(type: string, n = 1) {
    this.stats[type] = (this.stats[type] || 0) + n;
    const d = defiDuJour();
    if (!d.fait && d.type === type && this.stats[type] >= d.cible) { save.defi!.fait = true; save.graines += 5; sauver(); this.c.fx.texte("Défi du jour réussi ! +5 🌱", this.L / 2, this.H * 0.2, "#ffe066", 24); this.c.sons.victoire(); }
  }
  trous() {
    const cols = 3, w = Math.min(this.L / cols, 200);
    // les buissons sont posés sur les trois terrasses du décor (même calage que le moteur)
    const s = Math.max(this.L / 1024, this.H / 1542), fh = 1542 * s, haut = fondHaut(this.L, this.H, fh);
    const terre = TERRASSES.map((f) => haut + f * fh);
    const t = Math.min(w, (terre[1] - terre[0]) * 0.92);
    const x0 = (this.L - w * cols) / 2;
    return Array.from({ length: 9 }, (_, i) => ({ x: x0 + (i % cols) * w + w / 2, y: terre[Math.floor(i / cols)] - t * 0.22, t }));
  }
  posSortie(s: Sortie) { const p = this.trous()[s.trou]; return { x: p.x, y: p.y - p.t * 0.35, t: p.t }; }

  down(x: number, y: number) {
    if (this.fini) return;
    this.appui = true; this.trace = [{ x, y }];
    if (this.phase === "arrosage") { if (!this.arrosoir.fini) { this.arrosoir.tient = true; if (!this.son("arrosoir", 0.6)) this.c.sons.pop(2); } return; }
    const s = this.sorties.find((s) => !s.touche && s.type !== "merle" && (() => { const p = this.posSortie(s); return Math.hypot(p.x - x, p.y - y) < p.t * 0.42; })());
    if (s) this.cueillir(s);
  }
  move(x: number, y: number) {
    if (!this.appui || this.fini) return;
    const a = this.trace[this.trace.length - 1]; this.trace.push({ x, y }); if (this.trace.length > 12) this.trace.shift();
    // un geste rapide qui passe sur un merle le fait fuir
    for (const s of this.sorties) {
      if (s.type !== "merle" || s.touche) continue;
      const p = this.posSortie(s), d = Math.hypot(x - a.x, y - a.y);
      if (d > 8 && Math.hypot(p.x - x, p.y - y) < p.t * 0.5) this.chasser(s);
    }
  }
  up() {
    this.appui = false;
    if (this.phase === "arrosage" && this.arrosoir.tient) this.finArrosage();
  }

  cueillir(s: Sortie) {
    s.touche = 0.01;
    const p = this.posSortie(s);
    if (s.type === "guepe") {
      if (save.amelio.gants && !this.gantsUtilises) { this.gantsUtilises = true; this.c.fx.texte("Les gants te protègent !", p.x, p.y, "#9cf0ff", 22); this.son("guepe", 0.5); return; }
      this.coeurs--; this.serie = 0; if (!this.son("guepe", 0.9)) this.c.sons.mauvais(); this.c.fx.secouer(0.35); this.c.fx.eclair("255,80,60", 0.4);
      this.c.fx.texte("Aïe ! Piqûre !", p.x, p.y, "#ff8a7a", 26);
      if (this.coeurs <= 0) this.terminer(false);
    } else if (s.type === "gate") {
      this.score = Math.max(0, this.score - 15); this.serie = 0; this.derniers = []; if (!this.son("gate", 0.8)) this.c.sons.mauvais(); this.c.fx.texte("Gâté ! −15", p.x, p.y, "#c8a07a", 22);
    } else {
      this.serie++; this.compter("fruits");
      const or = s.type === "or";
      const gain = (or ? 40 : 10) + Math.min(this.serie, 10) * 2;
      this.score += gain;
      if (or) { this.compter("dores"); if (!this.son("or", 0.8)) this.c.sons.piece(); } else if (!this.son(this.c.rnd() < 0.5 ? "cueille-1" : "cueille-2", 0.75, 1 + Math.min(this.serie, 10) * 0.02)) this.c.sons.pop(Math.min(this.serie, 8));
      this.c.fx.gerbe(p.x, p.y, or ? "#ffe066" : "#9cff6a", 14, 220, or ? 1 : 0);
      this.c.fx.texte(`+${gain}`, p.x, p.y - 20, "#ffe066", 24);
      // trio : trois fois le même fruit d'affilée
      this.derniers.push(s.id); if (this.derniers.length > 3) this.derniers.shift();
      if (this.derniers.length === 3 && this.derniers.every((d) => d === s.id)) {
        const bonus = Math.round(60 * (1 + save.amelio.panier * 0.25)); this.score += bonus; this.grainesPartie++; this.compter("trios"); this.derniers = [];
        this.c.fx.texte(`Trio ! +${bonus} · +1 🌱`, this.L / 2, this.H * 0.24, "#9cff9c", 30); this.c.fx.etoiles(p.x, p.y, 20);
        if (!this.son("trio", 0.85)) this.c.sons.combo(3);
      }
    }
    this.hud();
  }
  chasser(s: Sortie) {
    s.touche = 0.01; const p = this.posSortie(s);
    this.score += 15; this.grainesPartie += 0.5; this.compter("merles");
    if (!this.son("merle", 0.85)) this.c.sons.pop(5);
    this.c.fx.texte("Ouste le merle ! +15", p.x, p.y - 10, "#c8f0ff", 22); this.c.fx.gerbe(p.x, p.y, "#6a4a2a", 8, 260, 0);
    this.hud();
  }

  // pluie de letchis dorés juste avant la pause, puis l'arrosoir
  lancerPluie() {
    this.phase = "pluie"; this.phaseT = 0; this.sorties = [];
    this.c.fx.texte("Pluie de letchis dorés !", this.L / 2, this.H * 0.2, "#ffe066", 30);
    for (let i = 0; i < 9; i++) this.sorties.push({ trou: i, type: "or", id: "letchi", vie: 1.8, max: 1.8, touche: 0 });
  }
  lancerArrosage() { this.phase = "arrosage"; this.phaseT = 0; this.sorties = []; this.arrosoir = { niveau: 0, tient: false, fini: false, ok: false }; this.hud(); }
  zoneArrosage() { const l = 0.14 + save.amelio.arrosoir * 0.04; return [0.62 - l / 2, 0.62 + l / 2]; }
  finArrosage() {
    const a = this.arrosoir; if (a.fini) return; a.fini = true; a.tient = false;
    const [z0, z1] = this.zoneArrosage(); a.ok = a.niveau >= z0 && a.niveau <= z1;
    if (a.ok) { this.pousse = 1; this.grainesPartie += 2; this.score += 30; this.compter("arrosages"); this.c.fx.texte("Bien arrosé ! Le jardin donne plus · +2 🌱", this.L / 2, this.H * 0.24, "#9cff9c", 22); this.c.sons.bon(); }
    else this.c.fx.texte(a.niveau > z1 ? "Trop d'eau, ça déborde !" : "Pas assez d'eau…", this.L / 2, this.H * 0.24, "#fff", 22);
    this.hud();
  }

  terminer(gagne: boolean) {
    if (this.fini) return; this.fini = true;
    const etoiles = gagne ? etoilesPour(this.score, [this.objectif, this.objectif * 1.3, this.objectif * 1.6]) : 0;
    const g = Math.floor(this.grainesPartie) + etoiles; save.graines += g;
    const restants = FAITS.map((_, i) => i).filter((i) => !save.faits.includes(i)); let idx: number, neuf = false;
    if (restants.length) { idx = restants[Math.floor(this.c.rnd() * restants.length)]; save.faits.push(idx); neuf = true; } else idx = Math.floor(this.c.rnd() * FAITS.length);
    sauver();
    this.c.fin({ gagne, score: this.score, etoiles, lignes: [`+${g} 🌱 (réserve : ${save.graines})`],
      savoir: { titre: neuf ? `Nouveau dans ton carnet (${save.faits.length}/${FAITS.length})` : "Le saviez-vous ?", texte: FAITS[idx] } });
  }

  maj(dt: number) {
    if (this.fini) return;
    this.phaseT += dt;
    if (this.phase === "arrosage") {
      const a = this.arrosoir;
      if (a.tient && !a.fini) { a.niveau = Math.min(1.05, a.niveau + dt * (0.42 + this.niveau * 0.01)); if (a.niveau >= 1.05) this.finArrosage(); }
      if (this.phaseT > 4.5) { if (!a.fini) this.finArrosage(); this.phase = "jeu"; this.prochain = 0.2; this.hud(); }
      return;
    }
    const avant = Math.ceil(this.duree - this.temps);
    this.temps += dt;
    if (Math.ceil(this.duree - this.temps) !== avant) this.hud();
    if (this.temps >= this.duree) { this.terminer(this.score >= this.objectif); return; }
    if (this.phase === "pluie") { if (this.phaseT > 2.2) this.lancerArrosage(); }
    else if (!this.pauseFaite && this.temps > this.duree / 2) { this.pauseFaite = true; this.lancerPluie(); }
    else {
      this.prochain -= dt;
      if (this.prochain <= 0) {
        const libres = Array.from({ length: 9 }, (_, i) => i).filter((i) => !this.sorties.some((s) => s.trou === i));
        if (libres.length) {
          const trou = libres[Math.floor(this.c.rnd() * libres.length)];
          const r = this.c.rnd(), pg = Math.min(0.28, 0.1 + this.niveau * 0.009), pm = this.niveau >= 2 ? Math.max(0.04, 0.12 - save.amelio.epouvantail * 0.035) : 0;
          const type: Sortie["type"] = r < pg ? "guepe" : r < pg + 0.1 ? "gate" : r < pg + 0.1 + pm ? "merle" : r > 0.97 - this.pousse * 0.05 ? "or" : "fruit";
          // peu de variétés à la fois pour que les trios soient possibles
          const choix = A_CUEILLIR.slice(0, 3 + Math.min(4, Math.floor(this.niveau / 3)));
          const max = type === "merle" ? 2.2 : Math.max(0.7, 1.6 - this.niveau * 0.04);
          this.sorties.push({ trou, type, id: type === "or" ? "letchi" : choix[Math.floor(this.c.rnd() * choix.length)].id, vie: max, max, touche: 0 });
        }
        this.prochain = Math.max(0.26, 0.85 - this.niveau * 0.025) * (0.6 + this.c.rnd() * 0.8) * (this.pousse ? 0.8 : 1);
      }
    }
    for (const s of this.sorties) {
      if (s.touche) s.touche += dt; else s.vie -= dt;
      // le merle qui n'a pas été chassé vole un fruit
      if (s.type === "merle" && !s.touche && s.vie <= 0 && !s.vole) { s.vole = true; this.score = Math.max(0, this.score - 10); const p = this.posSortie(s); this.c.fx.texte("Le merle a volé un fruit ! −10", p.x, p.y, "#ffb0a0", 20); if (!this.son("vol", 0.8)) this.c.sons.mauvais(); this.hud(); }
    }
    this.sorties = this.sorties.filter((s) => s.vie > -0.2 && s.touche < 0.25);
  }

  dessinerMerle(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, fuite: number) {
    // bulbul orphée : dos brun, ventre clair, huppe noire, tache rouge sur la joue et sous la queue
    ctx.save(); ctx.translate(x + fuite * t * 2, y - fuite * t * 1.5); ctx.scale(t / 100, t / 100);
    const pic = Math.sin(this.temps * 14) > 0.6 ? 6 : 0;
    ctx.fillStyle = "#6a4a2a"; ctx.beginPath(); ctx.ellipse(0, 0, 30, 20, -0.2, 0, 7); ctx.fill();
    ctx.fillStyle = "#f2ead8"; ctx.beginPath(); ctx.ellipse(4, 8, 20, 11, -0.2, 0, 7); ctx.fill();
    ctx.fillStyle = "#d8261e"; ctx.beginPath(); ctx.ellipse(-22, 12, 7, 5, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#5a3a20"; ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(-48, -10); ctx.lineTo(-44, 6); ctx.fill();
    ctx.fillStyle = "#1a1410"; ctx.beginPath(); ctx.arc(26, -14 + pic, 13, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, -24 + pic); ctx.lineTo(28, -46 + pic); ctx.lineTo(34, -22 + pic); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.ellipse(30, -6 + pic, 6, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#d8261e"; ctx.beginPath(); ctx.arc(31, -10 + pic, 3.5, 0, 7); ctx.fill();
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(29, -17 + pic, 2.4, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a2a2a"; ctx.beginPath(); ctx.moveTo(38, -14 + pic); ctx.lineTo(50, -11 + pic); ctx.lineTo(38, -9 + pic); ctx.fill();
    ctx.restore();
  }

  dessiner(ctx: CanvasRenderingContext2D) {
    const tr = this.trous();
    tr.forEach((p, i) => {
      const s = this.sorties.find((x) => x.trou === i);
      if (s) {
        const age = s.max - s.vie;
        const sortie = Math.min(1, age * 6, Math.max(0, (s.vie + 0.2) * 5)) * (s.touche && s.type !== "merle" ? 1 - s.touche * 4 : 1);
        const y = p.y - p.t * 0.35 * sortie + p.t * 0.2;
        if (s.type === "guepe") guepe(ctx, p.x, y - p.t * 0.05, p.t * 0.55, this.temps);
        else if (s.type === "merle") {
          sprite(ctx, this.c.img(A_CUEILLIR[i % 3].id), p.x - p.t * 0.12, y + p.t * 0.05, p.t * 0.45, 0, s.vole ? 0.2 : 1);
          this.dessinerMerle(ctx, p.x + p.t * 0.06, y - p.t * 0.14, p.t * 0.95, s.touche ? s.touche * 4 : 0);
          if (!s.touche && !s.vole) { ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.5 + 0.4 * Math.sin(this.temps * 10)})`; ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(p.x - p.t * 0.4, y - p.t * 0.35); ctx.lineTo(p.x + p.t * 0.4, y + p.t * 0.05); ctx.stroke(); ctx.restore(); texteContour(ctx, "Glisse !", p.x, y - p.t * 0.45, 14, "#fff"); }
        } else {
          if (s.type === "or") { ctx.save(); const hg = ctx.createRadialGradient(p.x, y, 4, p.x, y, p.t * 0.45); hg.addColorStop(0, "rgba(255,230,120,0.8)"); hg.addColorStop(1, "rgba(255,230,120,0)"); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(p.x, y, p.t * 0.45, 0, 7); ctx.fill(); ctx.restore(); }
          sprite(ctx, this.c.img(s.id), p.x, y, p.t * 0.62, Math.sin(this.temps * 4 + i) * 0.1);
          if (s.type === "or") { for (let k = 0; k < 4; k++) { const a = this.temps * 3 + k * 1.57; ctx.fillStyle = "#fff6b0"; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * p.t * 0.34, y + Math.sin(a) * p.t * 0.34, 3 + Math.sin(this.temps * 9 + k) * 1.5, 0, 7); ctx.fill(); } }
          if (s.type === "gate") {
            ctx.save(); ctx.globalAlpha = 0.65; ctx.fillStyle = "#4a3418";
            for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(p.x + Math.cos(k * 2.3) * p.t * 0.15, y + Math.sin(k * 1.7) * p.t * 0.13, p.t * (0.05 + (k % 3) * 0.025), 0, 7); ctx.fill(); }
            ctx.restore();
            ctx.fillStyle = "#1a1a1a"; for (let k = 0; k < 3; k++) { const a = this.temps * 6 + k * 2; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * p.t * 0.3, y - p.t * 0.2 + Math.sin(a * 1.3) * p.t * 0.1, 2.5, 0, 7); ctx.fill(); }
          }
        }
      }
      // buisson peint (même aquarelle que le décor), qui se balance doucement
      const im = this.c.img("buisson"), bw = p.t * 1.08, bh = im && im.naturalWidth ? bw * im.naturalHeight / im.naturalWidth : bw * 0.55;
      ctx.save(); ctx.fillStyle = "rgba(40,25,10,0.28)"; ctx.beginPath(); ctx.ellipse(p.x, p.y + p.t * 0.33, bw * 0.42, p.t * 0.06, 0, 0, 7); ctx.fill(); ctx.restore();
      if (im && im.naturalWidth) { ctx.save(); ctx.translate(p.x, p.y + p.t * 0.34); ctx.rotate(Math.sin(this.temps * 1.6 + i) * 0.015); ctx.drawImage(im, -bw / 2, -bh, bw, bh); ctx.restore(); }
      if (this.pousse && Math.sin(this.temps * 5 + i) > 0.7) { ctx.fillStyle = "rgba(255,255,200,0.9)"; ctx.beginPath(); ctx.arc(p.x + Math.cos(this.temps + i) * bw * 0.3, p.y - p.t * 0.05, 2.5, 0, 7); ctx.fill(); }
    });
    // panier des trois derniers fruits (pour viser le trio)
    const pw = 150, px = this.L / 2 - pw / 2, py = Math.max(96, tr[0].y - tr[0].t * 0.75 - 50);
    ctx.save(); ctx.fillStyle = "rgba(255,248,230,0.88)"; arrondi(ctx, px, py, pw, 46, 14); ctx.fill(); ctx.strokeStyle = "#a8742a"; ctx.lineWidth = 2; arrondi(ctx, px, py, pw, 46, 14); ctx.stroke(); ctx.restore();
    texteContour(ctx, "Trio", px + 22, py + 24, 13, "#7a4a1a");
    for (let k = 0; k < 3; k++) {
      const id = this.derniers[k], x = px + 58 + k * 34, y = py + 23;
      if (id) sprite(ctx, this.c.img(id), x, y, 30, 0, 1, false); else { ctx.strokeStyle = "rgba(120,80,30,0.35)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.stroke(); ctx.setLineDash([]); }
    }
    // trace du geste
    if (this.appui && this.trace.length > 1 && this.phase !== "arrosage") { ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); this.trace.forEach((q, k) => (k ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y))); ctx.stroke(); ctx.restore(); }
    if (this.phase === "arrosage") this.dessinerArrosoir(ctx);
  }
  dessinerArrosoir(ctx: CanvasRenderingContext2D) {
    const a = this.arrosoir, cx = this.L / 2, w = Math.min(300, this.L * 0.8), h = 230, x = cx - w / 2, y = this.H * 0.36;
    ctx.save(); ctx.fillStyle = "rgba(10,30,10,0.75)"; arrondi(ctx, x, y, w, h, 22); ctx.fill(); ctx.restore();
    texteContour(ctx, "L'arrosoir", cx, y + 28, 22, "#bff0ff");
    texteContour(ctx, a.fini ? (a.ok ? "Bien arrosé !" : "Raté") : "Garde le doigt appuyé, lâche dans la zone verte", cx, y + h - 18, 13, "#fff");
    const gx = cx - 30, gy = y + 48, gw = 60, gh = 140;
    ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.12)"; arrondi(ctx, gx, gy, gw, gh, 10); ctx.fill();
    const [z0, z1] = this.zoneArrosage(); ctx.fillStyle = "rgba(90,208,74,0.55)"; ctx.fillRect(gx, gy + gh * (1 - z1), gw, gh * (z1 - z0));
    const n = Math.min(1, a.niveau); const eau = ctx.createLinearGradient(0, gy + gh, 0, gy); eau.addColorStop(0, "#2a8ad8"); eau.addColorStop(1, "#7ad0ff");
    ctx.fillStyle = eau; ctx.fillRect(gx + 4, gy + gh * (1 - n), gw - 8, gh * n - 4);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; arrondi(ctx, gx, gy, gw, gh, 10); ctx.stroke(); ctx.restore();
    if (a.tient) for (let k = 0; k < 4; k++) { ctx.fillStyle = "#9ad8ff"; ctx.beginPath(); ctx.arc(gx + gw + 30 + Math.sin(this.temps * 20 + k) * 6, gy + 20 + ((this.temps * 200 + k * 30) % 120), 3, 0, 7); ctx.fill(); }
  }
}

const def: DefJeu = {
  id: "rekolt-la",
  titre: "Rékolt la !",
  accroche: "Les fruits sortent des buissons du jardin créole : cueille, fais des trios et chasse les merles !",
  regles: [
    "Touche les fruits avant qu'ils ne se cachent. Trois fois le même fruit d'affilée : Trio !",
    "Le merle de Maurice vient voler tes fruits : glisse le doigt sur lui pour le chasser.",
    "Évite les guêpes (une piqûre = un cœur) et les fruits gâtés.",
    "À mi-niveau : pluie de letchis dorés, puis l'arrosoir. Garde le doigt appuyé et lâche dans la zone verte.",
  ],
  niveaux: 20,
  theme: THEMES.jardin,
  visuels: "photos",
  images: { buisson: "/jeux/fonds/rekolt-la-buisson.webp" },
  fondHaut,
  creer: (c, n) => new Rekolt(c, n),
  progression,
};
export default def;
