// Socle « péi » des jeux refaits (nov. 2026) : pont vers KwFX v4.1 et décor réunionnais en plusieurs plans.
// Le jeu dit ce qui se passe ; KwFX choisit effets, lumières et sons.
import { DECORS_IMAGES } from "./decors";

export type Mode = "trankil" | "probleme";
export const NOMS_MODE: Record<Mode, string> = { trankil: "Mi vé zoué trankil", probleme: "Mi rode problèm" };
export type Retour = { m: number; pepite: boolean; objet: unknown };
type Etape = Record<string, unknown> & { outil: string };

const SONS = "/jeux-3d/commun/kwfx-sons/";
const SONS_KW = ["bonne", "combo", "erreur", "coupe", "pepite", "niveau", "victoire", "defaite", "clic", "presque", "debut", "eclat", "bulles", "volcan", "impact", "oiseau", "vent"];
/** Bruitages propres aux jeux refaits (fichiers ajoutés dans kwfx-sons/pei/). */
export const SONS_PEI: string[] = ["van", "mixeur", "pieces", "bertel"];
/** Ambiances en boucle (ElevenLabs, sans voix) : jardin créole, lagon, veillée. */
export type Ambiance = "jardin" | "lagon" | "veillee";

let chargement: Promise<void> | null = null;
function chargerKwFX(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as any;
  if (w.KwFX && parseFloat(w.KwFX.version) >= 4) return Promise.resolve();
  if (!chargement) chargement = new Promise((ok) => {
    const s = document.createElement("script");
    s.src = "/jeux-3d/commun/kwelafe-fx.js?v=41"; s.async = true;
    s.onload = () => ok(); s.onerror = () => ok();
    document.head.appendChild(s);
  });
  return chargement;
}

/** Effets propres aux jeux refaits, ajoutés à la bibliothèque KwFX (une seule fois). */
const SYSTEMES: [string, Record<string, unknown>[], string][] = [
  ["alizePei", [{ nb: 26, sprite: "petale", zone: "ligne", vie: [0.9, 1.6], vitesse: [260, 520], angle: [-12, 8], taille: [6, 12], couleur: "#9BD86A", gravite: 40 },
    { nb: 14, sprite: "doux", zone: "ligne", vie: [0.5, 1], vitesse: [320, 600], angle: [-6, 6], taille: [3, 6], couleur: "#FFFFFF", melange: "add" }], "Rafale d'alizé"],
  ["vannagePei", [{ nb: 40, sprite: "rect", vie: [0.6, 1.3], vitesse: [120, 340], angle: [-150, -30], taille: [3, 7], couleur: "#E8C56A", gravite: 420 },
    { nb: 16, sprite: "doux", vie: [0.5, 0.9], vitesse: [60, 160], angle: [-140, -40], taille: [8, 16], couleur: "#FFF1C2", melange: "add" }], "Coup de van"],
  ["lusiolPei", [{ nb: 18, sprite: "doux", zone: "cercle", vie: [1.2, 2.4], vitesse: [10, 46], taille: [4, 9], couleur: "#D8FF6A", gravite: -14, melange: "add" },
    { nb: 6, sprite: "etoile", zone: "cercle", vie: [0.8, 1.4], vitesse: [20, 60], taille: [5, 9], couleur: "#FFF7A8", melange: "add" }], "Envol de lucioles"],
  ["mareePei", [{ nb: 36, sprite: "bulle", zone: "ligne", vie: [0.9, 1.7], vitesse: [60, 190], angle: [-110, -70], taille: [5, 13], couleur: "#BFF3FF", gravite: -60 },
    { nb: 22, sprite: "goutte", zone: "ligne", vie: [0.5, 1], vitesse: [140, 300], angle: [-130, -50], taille: [4, 8], couleur: "#3EC5E0", gravite: 520 }], "Vague de marée"],
  ["brumePei", [{ nb: 22, sprite: "fumee", zone: "cercle", vie: [1.2, 2.2], vitesse: [14, 50], taille: [40, 90], couleur: "#EAF2F5", gravite: -10 }], "Brume des Hauts"],
  ["lavePei", [{ nb: 34, sprite: "etincelle", vie: [0.6, 1.3], vitesse: [160, 420], angle: [-150, -30], taille: [4, 9], couleur: "#FF7A2E", gravite: 520, melange: "add" },
    { nb: 10, sprite: "fumee", vie: [1, 1.8], vitesse: [20, 70], angle: [-110, -70], taille: [30, 60], couleur: "#3A2A26", gravite: -30 }], "Réveil du volcan"],
  ["koudminPei", [{ nb: 30, sprite: "piece", vie: [0.8, 1.4], vitesse: [140, 360], angle: [-140, -40], taille: [7, 12], couleur: "#FFD23F", gravite: 520 },
    { nb: 12, sprite: "etoile", vie: [0.6, 1.1], vitesse: [80, 220], taille: [6, 12], couleur: "#FFFFFF", melange: "add" }], "Koudmin"],
];

/** Pont vers le directeur d'effets : tout appel est sans danger tant que KwFX n'est pas chargé. */
export class Kw {
  d: any = null;
  ml: any = null;
  mode: Mode = "trankil";
  private sons = true;
  private amb: HTMLAudioElement | null = null; private ambNom = "";
  constructor(private conteneur: HTMLElement, private idJeu: string, private theme = "fruits", private complement = false) {}

  async preparer(mode: Mode, nuit = 0) {
    this.mode = mode;
    await chargerKwFX();
    const K = (window as any).KwFX;
    if (!K || !this.conteneur.isConnected) return;
    for (const [nom, couches, titre] of SYSTEMES) { try { K.definirSysteme(nom, couches, { nom: titre, remplacer: true }); } catch { /* déjà là */ } }
    const pack: Record<string, string> = {};
    for (const n of SONS_KW) pack[n] = SONS + n + ".mp3";
    for (const n of SONS_PEI) pack[n] = SONS + "pei/" + n + ".mp3";
    try {
      if (!this.d) this.d = K.init({ theme: this.theme, public: "enfant", mode, support: "web", jeu: this.idJeu, conteneur: this.conteneur, sonsPack: pack, sons: this.sons, dprMax: 1.5, hautMessages: "30%", echelleMessages: 0.62, complement: this.complement });
      else { this.d.regler({ mode, sons: this.sons }); this.d.reinitialiser(); }
    } catch (e) { console.error(e); this.d = null; return; }
    this.eclairage(nuit);
  }
  /** megaLumieres : nuit de 0 (plein jour) à 1 ; les calques restent sous l'interface du jeu. */
  eclairage(nuit: number, duree = 1200) {
    if (!this.d) return;
    try {
      if (!this.ml) this.ml = this.d.megaLumieres({ nuit, z: 3, rebond: 0.45, sol: "#B05A34" });
      else this.ml.regler({ nuit, duree });
    } catch (e) { console.error(e); this.ml = null; }
  }
  /** Signale un événement du jeu. Renvoie le multiplicateur et la pépite décidés par KwFX. */
  ev(type: string, x?: number, y?: number, extra: Record<string, unknown> = {}): Retour {
    if (!this.d) return { m: 1, pepite: false, objet: null };
    try {
      const r = this.d.evenement(type, x == null ? extra : { x, y, ...extra }) || {};
      if (x != null && y != null && (type === "bonne" || type === "coupe" || type === "trouve" || type === "pepite")) this.eclat(x, y, (extra.couleur as string) || "#FFE9B5");
      return { m: Math.max(1, Math.round(r.multiplicateur || 1)), pepite: !!r.pepite, objet: r.objet || null };
    } catch (e) { console.error(e); return { m: 1, pepite: false, objet: null }; }
  }
  joue(nom: string, x?: number, y?: number, opts: Record<string, unknown> = {}) { try { this.d?.joue(nom, x == null ? opts : { x, y, ...opts }); } catch (e) { console.error(e); } }
  son(nom: string) { try { if (SONS_PEI.includes(nom)) { if (this.sons && !this.d?.audio?.echantillon(nom, {})) this.d?.son("clic"); } else this.d?.son(nom); } catch { /* rien */ } }
  /** Ambiance sonore en boucle, douce, sans voix. null pour l'arrêter. */
  ambiance(nom: Ambiance | null) {
    if ((nom || "") === this.ambNom) return;
    this.ambNom = nom || "";
    if (this.amb) { this.amb.pause(); this.amb.src = ""; this.amb = null; }
    if (!nom || typeof Audio === "undefined") return;
    const a = new Audio(SONS + "pei/" + nom + ".mp3"); a.loop = true; a.volume = 0.2; this.amb = a;
    if (this.sons) a.play().catch(() => { /* le navigateur attend un toucher */ });
  }
  onoma(texte: string, x: number, y: number, k = 0.7) { this.joue("onomatopee", x, y, { texte, intensite: k }); }
  banniere(texte: string, k = 0.6) { this.joue("banniere", undefined, undefined, { texte, intensite: k }); }
  meteo(nom: string | null, force = 1) { try { this.d?.meteo(nom, { force }); } catch { /* rien */ } }
  /** Séquence d'effets en données (vérifiée par KwFX avant d'être jouée). */
  plan(etapes: Etape[]) { try { const p = this.d?.executer(etapes); if (p && p.catch) p.catch((e: unknown) => console.error(e)); } catch (e) { console.error(e); } }
  /** Petit éclat de lumière qui éclaire le décor puis s'éteint. */
  eclat(x: number, y: number, couleur = "#FFE9B5", rayon = 150, duree = 520) {
    if (!this.ml) return;
    try { const l = this.ml.lumiere(x, y, { couleur, rayon, force: 0.9, scintille: 0.15 }); l.eteindre(duree); } catch { /* rien */ }
  }
  /** Lumière durable (lampe, luciole guidée) : renvoie l'objet lumière de KwFX ou null. */
  lampe(x: number, y: number, o: Record<string, unknown> = {}) { try { return this.ml ? this.ml.lumiere(x, y, { couleur: "#FFC46B", rayon: 170, scintille: 0.2, ...o }) : null; } catch { return null; } }
  lucioles(n: number) { try { this.ml?.lucioles(n); } catch { /* rien */ } }
  transition(type: "vague" | "lave" | "cyclone" | "pailleenqueue") { this.joue("transition", undefined, undefined, { type }); }
  fige(): boolean { try { return !!this.d?.estFige(); } catch { return false; } }
  /** Grand moment : combo maximal. */
  comboMax(x: number, y: number, texte = "OTÉ !") {
    this.plan([{ outil: "joue", nom: "hitstop", duree: 90 }, { outil: "joue", nom: "lignes", x, y, intensite: 0.8 }, { outil: "joue", nom: "onomatopee", x, y, texte, intensite: 0.9 },
      { outil: "joue", nom: "aura", x, y, intensite: 0.8 }, { outil: "son", nom: "combo" }]);
  }
  /** Fin de niveau puis victoire, en séquence. */
  victoire(L: number, H: number) {
    this.plan([{ outil: "evenement", type: "victoire" }, { outil: "joue", nom: "plan", x: L / 2, y: H * 0.42, duree: 700 }, { outil: "attendre", ms: 250 },
      { outil: "joue", nom: "confettis", x: L / 2, y: H * 0.2, intensite: 0.9 }, { outil: "joue", nom: "koudminPei", x: L / 2, y: H * 0.5, intensite: 0.8 }]);
  }
  finPartie(score: number) { try { return this.d?.finPartie(score) || null; } catch { return null; } }
  activerSons(v: boolean) { this.sons = v; try { this.d?.regler({ sons: v }); } catch { /* rien */ } if (this.amb) { if (v) this.amb.play().catch(() => {}); else this.amb.pause(); } }
  pause(p: boolean) { try { if (p) this.d?.pause(); else this.d?.reprendre(); } catch { /* rien */ } if (this.amb) { if (p || !this.sons) this.amb.pause(); else this.amb.play().catch(() => {}); } }
  detruire() { try { this.d?.detruire(); } catch { /* rien */ } this.d = null; this.ml = null; this.ambiance(null); }
}

// ---------------------------------------------------------------------------
// Décor réunionnais en quatre plans : ciel, relief, végétation, premier plan
// ---------------------------------------------------------------------------
export type Lieu = "marche" | "lagon" | "hauts" | "jardin" | "kaz" | "volcan";
export type Heure = "jour" | "soir" | "veillee";
export type ConfigDecor = { lieu: Lieu; heure: Heure };
const CIELS: Record<Heure, [string, string, string]> = {
  jour: ["#3FA9E0", "#9ADCF5", "#FFF4DC"],
  soir: ["#F28A5B", "#FFC27A", "#FFE9B5"],
  veillee: ["#0E1B3D", "#27305E", "#5A3F6B"],
};
const RELIEFS: Record<Heure, [string, string]> = { jour: ["#6FA98C", "#2E7D4F"], soir: ["#A5647A", "#5A2A4A"], veillee: ["#1D2A52", "#101A36"] };

function bruit(i: number, graine: number) { const s = Math.sin(i * 127.1 + graine * 311.7) * 43758.5453; return s - Math.floor(s); }

export class DecorPei {
  private imgs: Partial<Record<"ciel" | "relief" | "vegetation" | "premier-plan", HTMLImageElement>> = {};
  private feuilles = Array.from({ length: 9 }, (_, i) => ({ x: bruit(i, 1), y: bruit(i, 2), v: 0.03 + bruit(i, 3) * 0.05, r: bruit(i, 4) * 6 }));
  private nuages = Array.from({ length: 5 }, (_, i) => ({ x: bruit(i, 5), y: 0.06 + bruit(i, 6) * 0.2, s: 0.7 + bruit(i, 7) * 0.8, v: 0.006 + i * 0.003 }));
  heure: Heure;
  constructor(private id: string, public cfg: ConfigDecor) {
    this.heure = cfg.heure;
    for (const plan of DECORS_IMAGES[id] || []) { const im = new Image(); im.decoding = "async"; im.src = `/jeux/decors/${id}/${plan}.webp`; this.imgs[plan] = im; }
  }
  private pret(p: "ciel" | "relief" | "vegetation" | "premier-plan") { const im = this.imgs[p]; return im && im.complete && im.naturalWidth > 0 ? im : null; }
  private couvre(ctx: CanvasRenderingContext2D, im: HTMLImageElement, L: number, H: number, dx: number, bas = true) {
    const s = Math.max(L / im.naturalWidth, bas ? 0 : H / im.naturalHeight) * 1.06, w = im.naturalWidth * s, h = im.naturalHeight * s;
    ctx.drawImage(im, (L - w) / 2 + dx, bas ? H - h : (H - h) / 2, w, h);
  }

  dessiner(ctx: CanvasRenderingContext2D, L: number, H: number, t: number) {
    const h = this.heure, [c0, c1, c2] = CIELS[h], u = Math.min(L, H);
    // ---- plan 1 : ciel
    const ciel = this.pret("ciel");
    if (ciel) this.couvre(ctx, ciel, L, H, Math.sin(t * 0.03) * 6, false);
    else {
      const g = ctx.createLinearGradient(0, 0, 0, H * 0.75);
      g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
      const sx = L * (h === "soir" ? 0.72 : 0.8), sy = H * (h === "soir" ? 0.3 : 0.13), sr = u * 0.07;
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 5);
      sg.addColorStop(0, h === "veillee" ? "rgba(230,236,255,0.5)" : "rgba(255,246,200,0.9)"); sg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, 0, L, H * 0.7);
      ctx.fillStyle = h === "veillee" ? "#EEF1FF" : "#FFF7D6"; ctx.beginPath(); ctx.arc(sx, sy, sr * (h === "veillee" ? 0.7 : 1), 0, 7); ctx.fill();
      if (h === "veillee") { ctx.fillStyle = "#fff"; for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * (0.6 + bruit(i, 8)) + i)); ctx.fillRect(bruit(i, 9) * L, bruit(i, 10) * H * 0.45, 2, 2); } ctx.globalAlpha = 1; }
    }
    ctx.fillStyle = h === "veillee" ? "rgba(120,130,190,0.25)" : h === "soir" ? "rgba(255,225,200,0.7)" : "rgba(255,255,255,0.8)";
    for (const n of this.nuages) {
      const x = ((n.x + t * n.v) % 1.3) * L * 1.15 - L * 0.2, y = n.y * H, s = n.s * u * 0.055;
      ctx.beginPath(); ctx.ellipse(x, y, s * 1.6, s * 0.7, 0, 0, 7); ctx.ellipse(x + s * 1.3, y - s * 0.35, s * 1.3, s * 0.8, 0, 0, 7); ctx.ellipse(x + s * 2.6, y, s * 1.2, s * 0.6, 0, 0, 7); ctx.fill();
    }
    // paille-en-queue qui plane
    if (h !== "veillee") for (let k = 0; k < 2; k++) {
      const p = ((t * (0.035 + k * 0.012) + k * 0.47) % 1.4) - 0.2, x = p * L, y = H * (0.14 + k * 0.07) + Math.sin(t * 0.9 + k * 2) * u * 0.02, s = u * 0.022, a = Math.sin(t * 5 + k) * 0.5;
      ctx.strokeStyle = "#fff"; ctx.lineWidth = Math.max(1.5, s * 0.22); ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x - s * 1.5, y - s * (0.5 + a)); ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.2, x, y); ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.2, x + s * 1.5, y - s * (0.5 + a));
      ctx.moveTo(x, y); ctx.lineTo(x - s * 2.6, y + s * 0.5); ctx.stroke();
    }
    // ---- plan 2 : relief (pitons et remparts), avec un lent glissement
    const relief = this.pret("relief");
    if (relief) this.couvre(ctx, relief, L, H, Math.sin(t * 0.05) * 10);
    else RELIEFS[h].forEach((c, i) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, H);
      const base = H * (0.5 + i * 0.09), amp = H * (0.2 - i * 0.07), dx = Math.sin(t * 0.05 + i) * (6 + i * 8);
      for (let x = -20; x <= L + 20; x += 16) {
        const q = (x + dx) / L, piton = Math.max(0, 1 - Math.abs(q - (0.3 + i * 0.4)) * (2.4 - i)) ** 1.6;
        ctx.lineTo(x, base - amp * (piton * 0.9 + 0.25 * Math.sin(q * 9 + i * 2) + 0.08 * Math.sin(q * 31 + i)));
      }
      ctx.lineTo(L, H); ctx.closePath(); ctx.fill();
    });
    this.lieu(ctx, L, H, t, u);
    // ---- plan 3 : végétation
    const veg = this.pret("vegetation");
    if (veg) this.couvre(ctx, veg, L, H, Math.sin(t * 0.08) * 16);
    else {
      const sombre = h === "veillee" ? "#0C1A22" : h === "soir" ? "#2A3A2A" : "#1F6B3A";
      for (let i = 0; i < 4; i++) this.cocotier(ctx, L * (i < 2 ? 0.05 + i * 0.1 : 0.82 + (i - 2) * 0.1), H * 0.72, u * (0.2 + bruit(i, 11) * 0.08), t + i * 1.7, sombre, i % 2 ? 1 : -1);
      const sol = ctx.createLinearGradient(0, H * 0.68, 0, H);
      sol.addColorStop(0, h === "veillee" ? "#12241E" : h === "soir" ? "#5E5A32" : "#58A84A"); sol.addColorStop(1, h === "veillee" ? "#0A1512" : h === "soir" ? "#3A3420" : "#2E7D4F");
      ctx.fillStyle = sol; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= L; x += 24) ctx.lineTo(x, H * 0.72 + Math.sin(x / L * 5 + 1) * H * 0.012);
      ctx.lineTo(L, H); ctx.closePath(); ctx.fill();
    }
    // ---- plan 4 : premier plan (grandes feuilles dans les coins, pétales de flamboyant)
    const premier = this.pret("premier-plan");
    if (premier) this.couvre(ctx, premier, L, H, Math.sin(t * 0.12) * 24);
    else {
      const f = h === "veillee" ? "#0A2018" : h === "soir" ? "#28482A" : "#1C7A3C";
      for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) {
        const cote = k ? 1 : -1, x = k ? L + u * 0.02 : -u * 0.02, a = (k ? Math.PI : 0) + cote * (0.25 + j * 0.42) + Math.sin(t * 0.8 + j + k) * 0.05;
        ctx.save(); ctx.translate(x, H * 1.01); ctx.rotate(-Math.PI / 2 + (k ? -1 : 1) * (0.25 + j * 0.4) + Math.sin(t * 0.8 + j + k * 2) * 0.05);
        ctx.fillStyle = f; ctx.globalAlpha = 0.92; ctx.beginPath(); ctx.ellipse(u * 0.13, 0, u * 0.15, u * 0.045, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(u * 0.27, 0); ctx.stroke();
        ctx.restore(); void a;
      }
      ctx.fillStyle = h === "veillee" ? "rgba(216,255,106,0.8)" : "#E63946";
      for (const p of this.feuilles) {
        const y = ((p.y + t * p.v) % 1.1) * H, x = (p.x + Math.sin(t * 0.7 + p.r) * 0.03) * L, s = u * 0.008;
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.3 + p.r); ctx.globalAlpha = 0.75; ctx.beginPath(); ctx.ellipse(0, 0, s * 1.6, s * 0.8, 0, 0, 7); ctx.fill(); ctx.restore();
      }
    }
    // voile léger pour que le jeu reste lisible
    const v = ctx.createRadialGradient(L / 2, H / 2, u * 0.35, L / 2, H / 2, Math.max(L, H) * 0.8);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, h === "veillee" ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.22)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, L, H);
  }

  private cocotier(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, temps: number, c: string, sens: number) {
    const penche = sens * t * 0.18 + Math.sin(temps * 0.6) * t * 0.02, hx = x + penche, hy = y - t;
    ctx.strokeStyle = c; ctx.lineWidth = Math.max(3, t * 0.06); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.quadraticCurveTo(x + penche * 0.2, y - t * 0.5, hx, hy); ctx.stroke();
    ctx.lineWidth = Math.max(2, t * 0.035);
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.5 + Math.sin(temps * 1.1 + i) * 0.06, l = t * 0.42;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + Math.cos(a) * l * 0.7, hy + Math.sin(a) * l * 0.7 - l * 0.2, hx + Math.cos(a) * l, hy + Math.sin(a) * l + l * 0.3); ctx.stroke();
    }
  }

  /** Éléments propres au lieu, entre le relief et la végétation. */
  private lieu(ctx: CanvasRenderingContext2D, L: number, H: number, t: number, u: number) {
    const h = this.heure, lieu = this.cfg.lieu;
    if (lieu === "lagon") {
      const g = ctx.createLinearGradient(0, H * 0.56, 0, H * 0.74);
      g.addColorStop(0, h === "veillee" ? "#14365A" : "#1FA3C4"); g.addColorStop(1, h === "veillee" ? "#1E5A6A" : "#7FE3E0");
      ctx.fillStyle = g; ctx.fillRect(0, H * 0.56, L, H * 0.2);
      ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 3;
      ctx.beginPath(); for (let x = 0; x <= L; x += 14) ctx.lineTo(x, H * 0.575 + Math.sin(x * 0.03 + t * 1.6) * 3); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const y = H * (0.6 + i * 0.022), x = ((bruit(i, 12) + t * 0.02 * (i % 2 ? 1 : -1)) % 1 + 1) % 1 * L; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + u * 0.09, y); ctx.stroke(); }
    } else if (lieu === "volcan") {
      const x = L * 0.5, y = H * 0.36;
      ctx.fillStyle = h === "veillee" ? "#1A1420" : "#4A3430"; ctx.beginPath(); ctx.moveTo(x - u * 0.42, H * 0.7); ctx.lineTo(x - u * 0.07, y); ctx.lineTo(x + u * 0.07, y); ctx.lineTo(x + u * 0.42, H * 0.7); ctx.closePath(); ctx.fill();
      const lg = ctx.createRadialGradient(x, y, 0, x, y, u * 0.16); lg.addColorStop(0, "rgba(255,140,40,0.85)"); lg.addColorStop(1, "rgba(255,90,20,0)");
      ctx.fillStyle = lg; ctx.fillRect(x - u * 0.2, y - u * 0.2, u * 0.4, u * 0.3);
      for (let i = 0; i < 7; i++) { const p = (t * 0.12 + i / 7) % 1; ctx.fillStyle = `rgba(90,80,90,${0.35 * (1 - p)})`; ctx.beginPath(); ctx.arc(x + Math.sin(i * 2 + t * 0.4) * u * 0.03 + p * u * 0.08, y - p * u * 0.3, u * (0.03 + p * 0.06), 0, 7); ctx.fill(); }
    } else if (lieu === "marche") {
      const cs = ["#E63946", "#FFD23F", "#1FA3C4", "#2E7D4F", "#F28A5B"];
      for (let i = 0; i < 6; i++) {
        const x = L * (0.08 + i * 0.17), y = H * 0.62, w = u * 0.11;
        ctx.strokeStyle = "#5A3A22"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + u * 0.13); ctx.stroke();
        ctx.fillStyle = cs[i % 5]; ctx.globalAlpha = h === "veillee" ? 0.55 : 1; ctx.beginPath(); ctx.moveTo(x - w, y + Math.sin(t + i) * 1.5); ctx.quadraticCurveTo(x, y - w * 0.75, x + w, y + Math.sin(t + i + 1) * 1.5); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      }
    } else if (lieu === "kaz" || lieu === "jardin") {
      const x = L * (lieu === "kaz" ? 0.5 : 0.76), y = H * 0.66, w = u * (lieu === "kaz" ? 0.34 : 0.22);
      ctx.fillStyle = h === "veillee" ? "#2A3A5A" : "#F4E7C8"; ctx.fillRect(x - w / 2, y - w * 0.42, w, w * 0.48);
      ctx.fillStyle = h === "veillee" ? "#5A2A2E" : "#C8372D"; ctx.beginPath(); ctx.moveTo(x - w * 0.6, y - w * 0.42); ctx.lineTo(x, y - w * 0.82); ctx.lineTo(x + w * 0.6, y - w * 0.42); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff"; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(x - w * 0.55 + i * w * 0.1, y - w * 0.41, w * 0.03, 0, Math.PI); ctx.fill(); }
      ctx.fillStyle = h === "veillee" ? "#FFC46B" : "#3A6EA5"; ctx.fillRect(x - w * 0.34, y - w * 0.28, w * 0.16, w * 0.22); ctx.fillRect(x + w * 0.18, y - w * 0.28, w * 0.16, w * 0.22);
      ctx.fillStyle = "#7A4A2A"; ctx.fillRect(x - w * 0.07, y - w * 0.26, w * 0.14, w * 0.32);
      if (h !== "jour") for (let i = 0; i < 5; i++) { const p = (t * 0.15 + i / 5) % 1; ctx.fillStyle = `rgba(230,230,235,${0.3 * (1 - p)})`; ctx.beginPath(); ctx.arc(x + w * 0.3 + Math.sin(t + i) * 4, y - w * 0.8 - p * u * 0.16, u * (0.012 + p * 0.03), 0, 7); ctx.fill(); }
    } else if (lieu === "hauts") {
      for (let i = 0; i < 5; i++) {   // fanjans (fougères arborescentes)
        const x = L * (0.12 + i * 0.19), y = H * 0.7, s = u * (0.1 + bruit(i, 13) * 0.05);
        ctx.strokeStyle = h === "veillee" ? "#14261E" : "#3A2A1C"; ctx.lineWidth = Math.max(3, s * 0.09); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - s); ctx.stroke();
        ctx.strokeStyle = h === "veillee" ? "#1A3A2A" : "#3E9A58"; ctx.lineWidth = Math.max(2, s * 0.05);
        for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2 + Math.sin(t * 0.7 + i + j) * 0.05; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x + Math.cos(a) * s * 0.5, y - s * 1.35, x + Math.cos(a) * s * 0.85, y - s * 0.95 + Math.abs(Math.sin(a)) * s * 0.1); ctx.stroke(); }
      }
      for (let i = 0; i < 3; i++) { const x = ((t * 0.012 * (i + 1) + i * 0.4) % 1.4 - 0.2) * L; const g = ctx.createRadialGradient(x, H * (0.5 + i * 0.07), 0, x, H * (0.5 + i * 0.07), u * 0.5); g.addColorStop(0, "rgba(240,246,248,0.4)"); g.addColorStop(1, "rgba(240,246,248,0)"); ctx.fillStyle = g; ctx.fillRect(0, H * 0.3, L, H * 0.5); }
    }
  }
}
