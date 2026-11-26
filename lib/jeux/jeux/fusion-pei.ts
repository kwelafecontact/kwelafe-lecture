// Fusion péi : on lâche des fruits dans la tante ; deux fruits identiques fusionnent en un plus gros.
import { couleurDe } from "../commun/photos";
import { type Contexte, type DefJeu, type Jeu, type Progression, THEMES, sprite, texteContour, arrondi, etoilesPour } from "../commun/moteur2d";

export const CHAINE = ["goyavier", "letchi", "longani", "mandarine", "goyave", "grenadine", "mangue", "papaye", "coco", "pasteque", "durian"];
const TAILLES = [0.055, 0.07, 0.085, 0.1, 0.115, 0.13, 0.15, 0.17, 0.19, 0.215, 0.245];
const SONS = "/jeux/sons/fusion-pei/";
let RECHARGE = 12;              // secondes pour recharger « Secoue la tante » (amélioration : 10 puis 8)

// ---------------------------------------------------------------- progression entre les parties
const FAITS = [
  "Le letchi a été introduit à Bourbon et à l'île de France en 1764 par Joseph-François Charpentier de Cossigny, après ses voyages en Chine.",
  "Le goyavier (Psidium cattleianum) est souvent appelé « goyavier de Chine », mais il vient en réalité du Brésil.",
  "À La Réunion, le goyavier pousse du bord de mer jusqu'à environ 1 300 mètres d'altitude sur la côte au vent.",
  "Le goyavier est aussi une plante envahissante : il forme des fourrés très denses qui gênent la forêt indigène.",
  "La cueillette du goyavier à la Plaine-des-Palmistes est devenue une vraie tradition, un peu comme les vendanges.",
  "La mangue José est une variété réunionnaise. Avec la Cogshall, elle fait l'essentiel de la production de l'île.",
  "La mangue est la quatrième production fruitière de La Réunion.",
  "On compte une cinquantaine de variétés de mangues à La Réunion : José, Cogshall, Carotte, Auguste…",
  "La saison du longani se termine vers juin, quand le tangor arrive sur les étals.",
  "Le marché forain de Saint-Paul s'installe sur le front de mer le vendredi toute la journée et le samedi matin.",
  "Le marché de Saint-Paul, l'un des plus anciens de l'île, rassemble plus de 300 vendeurs.",
  "Le marché forain de Saint-Pierre, en front de mer, est présenté comme le plus grand de La Réunion.",
  "Le Grand Marché de Saint-Denis est ouvert du lundi au samedi.",
  "La vannerie du vacoa est inscrite à l'inventaire du patrimoine culturel immatériel en France.",
  "Pour tresser le vacoa, on suit un rythme : « 2 brins levés, 2 brins laissés ».",
  "La fête du vacoa, à Saint-Philippe chaque mois d'août, a accueilli près de 100 000 visiteurs en 2023.",
];
const CLE = "fusionpei_v2";
type Sauvegarde = { sous: number; amelio: { tante: number; secoue: number; clients: number; balance: number }; faits: number[]; defi: { date: string; k: number; fait: boolean } | null };
let save: Sauvegarde = { sous: 0, amelio: { tante: 0, secoue: 0, clients: 0, balance: 0 }, faits: [], defi: null };
function charger() { try { const v = JSON.parse(localStorage.getItem(CLE) || "null"); if (v) save = { ...save, ...v, amelio: { ...save.amelio, ...(v.amelio || {}) } }; } catch { /* rien */ } }
function sauver() { try { localStorage.setItem(CLE, JSON.stringify(save)); } catch { /* rien */ } }
if (typeof window !== "undefined") charger();
const AMELIOS = [
  { id: "tante", ic: "🧺", nom: "Tante plus large", txt: "La tante tressée s'élargit un peu.", prix: [8, 20] },
  { id: "secoue", ic: "💨", nom: "Secoue plus souvent", txt: "« Secoue la tante » se recharge plus vite.", prix: [6, 15] },
  { id: "clients", ic: "🛒", nom: "Clients fidèles", txt: "Chaque livraison rapporte un sou de plus.", prix: [6, 15] },
  { id: "balance", ic: "⚖️", nom: "Balance juste", txt: "La pesée de la pause est plus facile.", prix: [5, 12] },
] as const;
const DEFIS = [
  { type: "livraisons", cible: 4, txt: (n: number) => `Livre ${n} commandes aux clients` },
  { type: "gates", cible: 4, txt: (n: number) => `Débarrasse ${n} fruits gâtés` },
  { type: "vanilles", cible: 2, txt: (n: number) => `Utilise ${n} vanilles magiques` },
  { type: "pesees", cible: 2, txt: (n: number) => `Réussis ${n} pesées justes` },
  { type: "papaye", cible: 1, txt: () => `Fais pousser une papaye` },
];
function defiDuJour() {
  const d = new Date(), cle = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  if (!save.defi || save.defi.date !== cle) { save.defi = { date: cle, k: (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % DEFIS.length, fait: false }; sauver(); }
  return { ...DEFIS[save.defi.k], fait: save.defi.fait };
}
const progression: Progression = {
  monnaie: () => `${save.sous} 🪙`,
  defi: () => { const d = defiDuJour(); return (d.fait ? "Défi du jour réussi : " : "Défi du jour : ") + d.txt(d.cible) + (d.fait ? "" : " · +5 🪙"); },
  boutique: () => AMELIOS.map((a) => { const n = save.amelio[a.id], prix = n < a.prix.length ? a.prix[n] : null; return { id: a.id, ic: a.ic, nom: a.nom, txt: a.txt, niveau: n, max: a.prix.length, prix, peut: prix != null && save.sous >= prix }; }),
  acheter: (id) => { const a = AMELIOS.find((x) => x.id === id); if (!a) return false; const n = save.amelio[a.id]; if (n >= a.prix.length || save.sous < a.prix[n]) return false; save.sous -= a.prix[n]; save.amelio[a.id]++; sauver(); return true; },
  carnet: () => ({ titre: "Carnet du marché", total: FAITS.length, pages: FAITS.map((f, i) => (save.faits.includes(i) ? f : null)) }),
};
const CLIENTS = ["Madame Payet", "Tonton Hoarau", "Mamie Grondin", "Monsieur Técher", "Madame Fontaine", "Tonton Rivière"];
type Commande = { k: number; nom: string; t: number; max: number; x: number; y: number; w: number };
const PAR_NIVEAU = 450;         // points par niveau

type Boule = { k: number; x: number; y: number; vx: number; vy: number; r: number; rot: number; ne: number; dessus: number; gonfle: number; gate?: boolean; joker?: boolean };
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
  // nouvelles mécaniques
  commandes: Commande[] = []; prochaineCommande = 6;
  actuelGate = false; suivantGate = false; actuelJoker = false; suivantJoker = false; lacher = 0; jokerNiveau = 0;
  accalmie = 0; pesee: { t: number; fini: boolean; ok: boolean } | null = null;
  stats: Record<string, number> = {}; sousPartie = 0;

  constructor(private c: Contexte) {
    this.L = c.L; this.H = c.H;
    this.disposer();
    this.actuel = this.tirer(); this.suivant = this.tirer();
    this.visee = this.boite.x + this.boite.w / 2;
    this.c.hud({ score: 0, info: "Niveau 1" });
    this.c.sons.prechargerFichiers(["plop", "fusion-1", "fusion-2", "gros", "secoue", "livraison", "balance"].map((n) => SONS + n + ".mp3"));
    charger(); RECHARGE = 12 - save.amelio.secoue * 2;
  }
  // la difficulté monte : les fruits tirés deviennent plus variés avec les niveaux
  tirer() { const max = Math.min(6, 4 + Math.floor((this.niveau - 1) / 2)); return Math.floor(this.c.rnd() * (max + 1)); }
  // une rangée sur grand écran, deux rangées sur téléphone pour garder des fruits bien visibles
  get rangeesListe() { return rangees(this.L); }
  get parRangee() { return Math.ceil(CHAINE.length / this.rangeesListe); }
  get tailleListe() { return taille(this.L); }
  get hauteurListe() { return hauteurListe(this.L); }
  disposer() {
    const g = geomBoite(this.L, this.H);
    this.boite = { x: g.x, y: g.y, w: g.w, h: g.h };
    this.base = g.w;
    setTimeout(() => this.placerCommandes(), 0);
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
    return { v: 1, sousPartie: this.sousPartie, score: this.score, temps: this.temps, actuel: this.actuel, suivant: this.suivant, niveau: this.niveau, charge: this.charge, cueillettes: this.cueillettes,
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
  compter(type: string, n = 1) {
    this.stats[type] = (this.stats[type] || 0) + n;
    const d = defiDuJour();
    if (!d.fait && d.type === type && this.stats[type] >= d.cible) { save.defi!.fait = true; save.sous += 5; sauver(); this.c.fx.texte("Défi du jour réussi ! +5 🪙", this.L / 2, this.H * 0.22, "#ffe066", 26); this.c.sons.victoire(); }
  }
  // ----- commandes des clients du marché : livrer un fruit le retire de la tante
  nouvelleCommande() {
    const min = 2, max = Math.min(7, 3 + this.niveau);
    const k = min + Math.floor(this.c.rnd() * (max - min + 1));
    const nom = CLIENTS[Math.floor(this.c.rnd() * CLIENTS.length)];
    const t = 40 - Math.min(14, this.niveau * 2);
    this.commandes.push({ k, nom, t, max: t, x: 0, y: 0, w: 96 });
    this.placerCommandes();
  }
  placerCommandes() {
    // entre les boutons (à gauche) et le fruit suivant (à droite)
    const b2 = this.boutons[1], g = b2 ? b2.x + b2.r + 8 : 20, d = this.L - 64 - 40, n = this.commandes.length;
    const w = Math.min(96, (d - g) / Math.max(1, n) - 6), y = b2 ? b2.y : 150, cx = (g + d) / 2;
    this.commandes.forEach((c, i) => { c.w = w; c.x = cx + (i - (n - 1) / 2) * (w + 6); c.y = y; });
  }
  livrable(b: Boule) { return !b.gate && !b.joker && this.commandes.some((c) => c.k === b.k); }
  livrer(b: Boule) {
    const i = this.commandes.findIndex((c) => c.k === b.k); if (i < 0) return;
    const c = this.commandes[i]; this.commandes.splice(i, 1); this.placerCommandes();
    b.k = -1; this.boules = this.boules.filter((o) => o.k >= 0);
    const pts = (c.k + 1) * 25, sous = 1 + save.amelio.clients;
    this.sousPartie += sous; this.compter("livraisons");
    this.eclabousser(b.x, b.y, couleurDe(CHAINE[c.k]), 18, 0.8); this.c.fx.etoiles(b.x, b.y, 14);
    this.c.fx.texte(`Merci ! +${pts} · +${sous} 🪙`, b.x, b.y - b.r - 10, "#ffe066", 24);
    if (!this.son("livraison", 0.85)) this.c.sons.piece();
    this.prochaineCommande = 4 + this.c.rnd() * 4;
    this.ajouter(pts);
  }
  // ----- pause entre deux niveaux : la pesée sur la balance du marchand
  lancerPesee() { this.accalmie = 4.6; this.pesee = { t: 0, fini: false, ok: false }; }
  aiguille() { return this.pesee ? Math.sin(this.pesee.t * (2.6 + this.niveau * 0.15)) : 0; }
  zonePesee() { return 0.16 + save.amelio.balance * 0.05; }
  peser() {
    const p = this.pesee; if (!p || p.fini) return; p.fini = true;
    p.ok = Math.abs(this.aiguille()) < this.zonePesee();
    if (!this.son("balance", 0.9)) this.c.sons.piece();
    if (p.ok) { this.sousPartie += 2; this.charge = RECHARGE; this.compter("pesees"); this.c.fx.texte("Pesée juste ! +2 🪙 et secoue rechargé", this.L / 2, this.H * 0.3, "#9cff9c", 24); this.c.sons.bon(); this.ajouter(30, true); }
    else this.c.fx.texte("La balance penche…", this.L / 2, this.H * 0.3, "#fff", 24);
  }
  bouton(x: number, y: number) { return this.boutons.find((b) => Math.hypot(x - b.x, y - b.y) < b.r + 8); }
  down(x: number, y: number) {
    if (this.fini) return;
    const b = this.bouton(x, y);
    if (b) { this.appuiBouton = true; if (b.id === "secoue") this.secouer(); else this.cueillir(); return; }
    if (this.pesee && !this.pesee.fini) { this.appuiBouton = true; this.peser(); return; }
    const cible = this.boules.find((o) => this.livrable(o) && Math.hypot(x - o.x, y - o.y) < o.r + 6);
    if (cible) { this.appuiBouton = true; this.livrer(cible); return; }
    this.appuiBouton = false; this.visee = x;
  }
  move(x: number) { if (!this.fini && !this.appuiBouton) this.visee = x; }
  up(x: number) {
    if (this.appuiBouton) { this.appuiBouton = false; return; }
    if (this.fini || this.attente > 0 || this.accalmie > 0) return;
    const r = this.rayon(this.actuel);
    const px = Math.max(this.boite.x + r, Math.min(this.boite.x + this.boite.w - r, x));
    this.boules.push({ k: this.actuel, x: px, y: this.boite.y - r - 6, vx: 0, vy: 0, r, rot: 0, ne: 0, dessus: 0, gonfle: 0, gate: this.actuelGate, joker: this.actuelJoker });
    if (!this.son("plop", 0.7, 1.25 - this.actuel * 0.06)) this.c.sons.pop(this.actuel);
    this.actuel = this.suivant; this.actuelGate = this.suivantGate; this.actuelJoker = this.suivantJoker;
    this.suivant = this.tirer(); this.lacher++;
    // fruit gâté de temps en temps à partir du niveau 2, vanille magique juste avant le niveau suivant
    this.suivantGate = this.niveau >= 2 && this.lacher % Math.max(4, 8 - this.niveau) === 0;
    this.suivantJoker = !this.suivantGate && this.jokerNiveau < this.niveau && this.score > this.niveau * PAR_NIVEAU - 90;
    if (this.suivantJoker) this.jokerNiveau = this.niveau;
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
  ajouter(n: number, sansNiveau = false) {
    this.score += n;
    if (sansNiveau) { this.c.hud({ score: this.score, info: "Niveau " + this.niveau }); return; }
    const niv = 1 + Math.floor(this.score / PAR_NIVEAU);
    if (niv > this.niveau) {
      this.niveau = niv;
      this.c.fx.texte("Niveau " + niv + " !", this.L / 2, this.H * 0.3, "#ffe23a", 44);
      this.c.fx.confettis(this.L); this.c.sons.victoire(); this.lancerPesee();
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
    if (this.accalmie > 0) { this.accalmie -= dt; if (this.pesee && !this.pesee.fini) { this.pesee.t += dt; if (this.accalmie < 0.8) this.peser(); } if (this.accalmie <= 0) this.pesee = null; }
    for (const c of this.commandes) c.t -= dt;
    if (this.commandes.some((c) => c.t <= 0)) { const parti = this.commandes.find((c) => c.t <= 0)!; this.c.fx.texte(`${parti.nom} s'en va…`, this.L / 2, this.boite.y - 30, "#ddd", 20); this.commandes = this.commandes.filter((c) => c.t > 0); this.placerCommandes(); this.prochaineCommande = 3; }
    if (this.commandes.length < (this.niveau >= 3 ? 2 : 1)) { this.prochaineCommande -= dt; if (this.prochaineCommande <= 0) { this.nouvelleCommande(); this.prochaineCommande = 8; } }
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
          if (a.joker || b.joker) { const j = a.joker ? a : b, o = a.joker ? b : a; if (!o.joker && !o.gate && o.k < CHAINE.length - 1) { j.k = -1; this.vanille(o); continue; } }
          if (a.k === b.k && a.k < CHAINE.length - 1 && !a.gate && !b.gate && !a.joker && !b.joker) { this.fusionner(a, b); continue; }
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
      if (b.ne > 1 && b.y - b.r < this.ligne && this.secoue <= 0 && this.accalmie <= 0) { b.dessus += dt; if (b.dessus > 2.2) danger = true; } else b.dessus = 0;
    }
    this.alerte = this.boules.some((b) => b.dessus > 0.3) ? Math.min(1, this.alerte + dt * 2) : Math.max(0, this.alerte - dt * 2);
    if (danger) {
      this.fini = true;
      this.sousPartie += Math.floor(this.score / 300); save.sous += this.sousPartie;
      const restants = FAITS.map((_, i) => i).filter((i) => !save.faits.includes(i)); let idx: number, neuf = false;
      if (restants.length) { idx = restants[Math.floor(this.c.rnd() * restants.length)]; save.faits.push(idx); neuf = true; } else idx = Math.floor(this.c.rnd() * FAITS.length);
      sauver();
      this.c.fin({ gagne: true, score: this.score, etoiles: etoilesPour(this.score, [400, 1200, 2500]),
        lignes: [`Niveau ${this.niveau} · +${this.sousPartie} 🪙 (réserve : ${save.sous})`],
        savoir: { titre: neuf ? `Nouveau dans ton carnet (${save.faits.length}/${FAITS.length})` : "Le saviez-vous ?", texte: FAITS[idx] } });
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
      if (o.gate && d < o.r + r * 1.6) { o.k = -1; this.compter("gates"); this.eclabousser(o.x, o.y, "#6a4a1a", 10, 0.5); this.c.fx.texte("Fruit gâté jeté ! +15", o.x, o.y - o.r, "#c8ff9c", 20); this.score += 15; continue; }
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
    if (k >= 7) this.compter("papaye");
    // toutes les 8 fusions : un bonus « Cueillette »
    this.serie++;
    if (this.serie % 8 === 0) { this.cueillettes = Math.min(3, this.cueillettes + 1); this.c.fx.texte("Bonus Cueillette !", this.L / 2, this.boite.y - 60, "#ffe066", 26); this.c.sons.bon(); }
    this.ajouter(gain);
  }

  // la vanille magique fait grandir d'un cran le fruit qu'elle touche
  vanille(o: Boule) {
    this.compter("vanilles");
    const k = o.k + 1, x = o.x, y = o.y; o.k = -1;
    const r = this.rayon(k);
    this.boules.push({ k, x, y, vx: 0, vy: -160, r, rot: 0, ne: 1, dessus: 0, gonfle: 1 });
    this.ondes.push({ x, y, r: r * 0.6, max: r * 2.6, vie: 0.45, c: "#e8c9ff" });
    this.c.fx.etoiles(x, y, 24); this.c.fx.texte("Vanille magique !", x, y - r - 10, "#f0d8ff", 26);
    if (!this.son("gros", 0.7, 1.3)) this.c.sons.fusion(k);
    this.ajouter((k + 1) * (k + 2) * 2);
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

  dessinerVanille(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
    ctx.save(); const hg = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 1.6); hg.addColorStop(0, "rgba(240,210,255,0.7)"); hg.addColorStop(1, "rgba(240,210,255,0)"); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x, y, r * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    sprite(ctx, this.c.img("vanille"), x, y, r * 2.4, rot + Math.sin(this.temps * 3) * 0.15);
    for (let i = 0; i < 3; i++) { const a = this.temps * 2 + i * 2.1; ctx.fillStyle = "#fff6c8"; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1, 2.5, 0, Math.PI * 2); ctx.fill(); }
  }
  dessinerCommandes(ctx: CanvasRenderingContext2D) {
    for (const c of this.commandes) {
      const w = c.w, h = 70, x = c.x - w / 2, y = c.y - h / 2, urgent = c.t < 8;
      ctx.save(); ctx.fillStyle = "rgba(255,248,230,0.94)"; arrondi(ctx, x, y, w, h, 14); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = urgent ? `rgba(230,60,30,${0.6 + 0.4 * Math.sin(this.temps * 10)})` : "#c8862a"; arrondi(ctx, x, y, w, h, 14); ctx.stroke();
      ctx.fillStyle = "#3a2410"; ctx.font = `700 ${w < 86 ? 9.5 : 11}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.fillText(c.nom, c.x, y + 14, w - 6);
      sprite(ctx, this.c.img(CHAINE[c.k]), c.x, y + 38, 34, 0, 1, false);
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(x + 10, y + h - 9, w - 20, 4); ctx.fillStyle = urgent ? "#e64a1e" : "#5ab43a"; ctx.fillRect(x + 10, y + h - 9, (w - 20) * Math.max(0, c.t / c.max), 4);
      ctx.restore();
    }
  }
  dessinerPesee(ctx: CanvasRenderingContext2D) {
    const cx = this.L / 2, R = Math.min(130, this.L * 0.32), cy = this.boite.y + R + 70, z = this.zonePesee(), a = this.aiguille();
    ctx.save(); ctx.fillStyle = "rgba(20,10,0,0.72)"; arrondi(ctx, cx - R - 24, cy - R - 56, R * 2 + 48, R + 110, 22); ctx.fill();
    texteContour(ctx, "La balance du marchand", cx, cy - R - 30, 20, "#ffe066");
    ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = "#5ad04a"; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2 - z * Math.PI / 2, -Math.PI / 2 + z * Math.PI / 2); ctx.stroke();
    const ang = -Math.PI / 2 + a * Math.PI / 2; ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R * 0.95, cy + Math.sin(ang) * R * 0.95); ctx.stroke();
    ctx.fillStyle = "#c8862a"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill();
    texteContour(ctx, this.pesee!.fini ? (this.pesee!.ok ? "Juste !" : "Raté") : "Touche quand l'aiguille est dans le vert", cx, cy + 34, 15, "#fff");
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
    for (const b of this.boules) {
      const e = 1 + Math.sin(b.gonfle * Math.PI) * 0.18;
      if (b.joker) { this.dessinerVanille(ctx, b.x, b.y, b.r, b.rot); continue; }
      sprite(ctx, this.c.img(CHAINE[b.k]), b.x, b.y, b.r * 2.25 * e, b.rot, b.gate ? 0.75 : 1);
      if (b.gate) { ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = "rgba(110,80,30,0.7)"; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 0.95, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        for (let m = 0; m < 2; m++) { const a = this.temps * 5 + m * 3; ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * b.r * 0.9, b.y - b.r * 0.6 + Math.sin(a * 1.7) * b.r * 0.3, 2.4, 0, Math.PI * 2); ctx.fill(); } }
      if (this.livrable(b)) { ctx.save(); ctx.strokeStyle = "#ffd23a"; ctx.lineWidth = 4; ctx.shadowColor = "#ffd23a"; ctx.shadowBlur = 12 + Math.sin(this.temps * 7) * 6; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 4, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); texteContour(ctx, "🛒", b.x + b.r * 0.75, b.y - b.r * 0.75, 18, "#fff"); }
    }
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
      const yv = B.y - r - 8 + Math.sin(this.temps * 4) * 2;
      if (this.actuelJoker) this.dessinerVanille(ctx, x, yv, r, 0);
      else { sprite(ctx, this.c.img(CHAINE[this.actuel]), x, yv, r * 2.25, Math.sin(this.temps * 2) * 0.08, this.attente > 0 || this.accalmie > 0 ? 0.4 : 1); if (this.actuelGate) texteContour(ctx, "gâté !", x, yv - r - 6, 14, "#d8b080"); }
      // suivant
      ctx.save(); ctx.fillStyle = "rgba(30,15,0,0.45)"; ctx.beginPath(); ctx.arc(this.L - 64, 150, 34, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      texteContour(ctx, "Suivant", this.L - 64, 106, 15, "#fff");
      if (this.suivantJoker) this.dessinerVanille(ctx, this.L - 64, 150, 22, 0); else sprite(ctx, this.c.img(CHAINE[this.suivant]), this.L - 64, 150, 48, 0, this.suivantGate ? 0.6 : 1);
      this.dessinerCommandes(ctx);
      if (this.pesee) this.dessinerPesee(ctx);
      this.dessinerBoutons(ctx);
    }
    // chaîne des fruits en bas
    // liste des fruits, du plus petit au plus gros, sur un bandeau bien lisible
    const t = this.tailleListe, plus = Math.max(-1, ...this.boules.map((b) => b.k));
    const pr = this.parRangee, lw = pr * t + 16, lx = (this.L - lw) / 2, ly = B.y + B.h + 20, lh = this.hauteurListe;
    ctx.save(); ctx.fillStyle = "rgba(255,248,230,0.9)"; arrondi(ctx, lx, ly, lw, lh, 16); ctx.fill(); ctx.strokeStyle = "#c8862a"; ctx.lineWidth = 2; arrondi(ctx, lx, ly, lw, lh, 16); ctx.stroke(); ctx.restore();
    CHAINE.forEach((id, i) => {
      const ligne = Math.floor(i / pr), col = i % pr, decal = ligne === 1 ? (pr * this.rangeesListe - CHAINE.length) * t / 2 : 0;
      const x = lx + 8 + decal + col * t + t / 2, y = ly + 8 + ligne * t + t / 2;
      if (i === plus) { ctx.save(); ctx.fillStyle = "rgba(255,210,58,0.45)"; ctx.beginPath(); ctx.arc(x, y, t * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      sprite(ctx, this.c.img(id), x, y, t * (i === plus ? 1.1 : 0.92), 0, i <= plus ? 1 : 0.5, false);
      if (i < CHAINE.length - 1 && col < pr - 1) { ctx.fillStyle = "rgba(120,70,20,0.5)"; ctx.font = "700 10px system-ui"; ctx.textAlign = "center"; ctx.fillText("›", x + t / 2, y + 4); }
    });
  }
}

// Disposition partagée entre le jeu et le décor : une rangée sur grand écran, deux sur téléphone.
const rangees = (L: number) => ((L - 40) / CHAINE.length < 40 ? 2 : 1);
const taille = (L: number) => Math.min(48, (L - 40) / Math.ceil(CHAINE.length / rangees(L)));
const hauteurListe = (L: number) => rangees(L) * taille(L) + 16;
function geomBoite(L: number, H: number) {
  const k = 1 + save.amelio.tante * 0.05;
  const w = Math.min(L * 0.92, H * 0.62 * k, 460 * k), h = Math.min(H * 0.58, w * 1.2);
  const bas = hauteurListe(L) + 30; // place réservée à la liste des fruits
  return { x: (L - w) / 2, y: Math.max(H * 0.3, H - h - bas - (H - h - bas) * 0.18), w, h };
}
// Décor « étal du marché forain » : le haut du comptoir peint (62,5 % de l’image) passe juste sous la tante.
const COMPTOIR = 0.625;
function fondHaut(L: number, H: number, h: number) {
  const g = geomBoite(L, H), y = g.y + g.h + 14 - COMPTOIR * h;
  return Math.min(0, Math.max(H - h, y)); // jamais de bord vide
}

const def: DefJeu = {
  id: "fusion-pei",
  titre: "Fusion péi",
  accroche: "Lâche les fruits dans la tante, fais-les grandir et sers les clients du marché !",
  regles: [
    "Glisse le doigt pour viser, lâche pour faire tomber le fruit.",
    "Deux fruits identiques qui se touchent fusionnent. Plusieurs fusions à la suite font une chaîne qui multiplie les points.",
    "🧺 Secoue la tante : se recharge toutes les 12 secondes. ✂️ Cueillette : gagnée toutes les 8 fusions, elle retire les plus petits fruits.",
    "🛒 Commandes : un client attend un fruit. Touche ce fruit dans la tante (cerclé d'or) pour le livrer : il libère de la place et rapporte des sous.",
    "Fruits gâtés : ils ne fusionnent pas. Fais une fusion juste à côté pour les jeter. La vanille magique fait grandir le fruit qu'elle touche.",
    "Entre deux niveaux, pèse les fruits sur la balance : touche quand l'aiguille est dans le vert. Si un fruit reste au-dessus de la ligne, c'est fini.",
  ],
  niveaux: 0,
  theme: THEMES.lagon,
  visuels: "photos",
  creer: (c) => new Fusion(c),
  progression,
  fondHaut,
  fondZoom: 1.35,
};
export default def;
