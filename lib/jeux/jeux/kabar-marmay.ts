// Kabar Marmay : défis de parole pour oser s'exprimer en créole et en français, seul, en famille ou en classe.
// Il n'y a pas de mauvaise réponse : on gagne en osant parler. Contenus : livres Kwélafé (sirandanes,
// expressions, mots péi) et défis de parole de la série « Mémoire et transmission ».
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, POLICE } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";
import D from "../serie2/donnees";
import { DEFIS_PAROLE } from "../serie3/memoire";

const PAR_NIVEAU = 6, DUREE = 45;
type Defi = { cat: string; couleur: string; consigne: string; texte: string; aide?: string; reponse?: string };

const ENCOURAGEMENTS = ["Lé bon sa !", "Ou la ozé !", "Bravo !", "Lé fier !", "Kontinyé !", "Ala in bon kozman !"];

function fabriquer(niveau: number, rnd: () => number): Defi[] {
  const palier = niveau <= 3 ? 1 : niveau <= 6 ? 2 : 3;
  const libres = melanger(DEFIS_PAROLE.filter((d) => d.niveau === palier), rnd);
  const mots = melanger(D.zarlor, rnd), sir = melanger(D.sirandanes.filter((s) => s.rep), rnd), ex = melanger(D.expressions, rnd);
  const L: Defi[] = [];
  for (let i = 0; i < PAR_NIVEAU; i++) {
    const k = (i + niveau) % 4;
    if (k === 0 && libres.length) {
      const d = libres.shift()!;
      L.push({ cat: "Parole", couleur: "#c8361d", consigne: "Ton défi", texte: d.texte });
    } else if (k === 1) {
      const m = mots.shift()!;
      L.push(palier === 1
        ? { cat: "Mot péi", couleur: "#2e8a4a", consigne: "Dis ce mot bien fort, puis devine ce qu'il veut dire", texte: m.mot, reponse: `${m.mot} : ${m.sens}. ${m.indice}` }
        : { cat: "Mot péi", couleur: "#2e8a4a", consigne: "Fais une phrase en créole avec ce mot", texte: m.mot, aide: m.indice, reponse: `${m.mot} : ${m.sens}` });
    } else if (k === 2) {
      const s = sir.shift()!;
      L.push({ cat: "Sirandane", couleur: "#7a2e8f", consigne: "Pose cette sirandane à quelqu'un, avec le ton du conteur", texte: `« ${s.q} »`, aide: s.fr, reponse: `${s.rep} (${s.repFr})` });
    } else {
      const e = ex.shift()!;
      L.push(palier === 1
        ? { cat: "Expression", couleur: "#1e6e86", consigne: "Lis cette expression à voix haute, puis devine son sens", texte: `« ${e.c} »`, reponse: e.f }
        : { cat: "Expression", couleur: "#1e6e86", consigne: "Explique avec tes mots ce que veut dire", texte: `« ${e.c} »`, reponse: `${e.f} ${e.x}` });
    }
  }
  return L;
}

class Kabar implements Jeu {
  L: number; H: number;
  defis: Defi[]; i = 0; faits = 0; passes = 0; score = 0; fini = false; temps = 0;
  chrono = DUREE; vu = false; transition = 0; fierte = 0;
  historique: boolean[] = [];   // défis relevés (true) ou passés
  ok: Bouton = { x: 0, y: 0, w: 0, h: 60, texte: "Mi la fé !", actif: true, appui: 0, couleur: "#2e8a4a" };
  passe: Bouton = { x: 0, y: 0, w: 0, h: 60, texte: "Passe", actif: true, appui: 0, couleur: "#8a7a6a" };
  voir: Bouton = { x: 0, y: 0, w: 210, h: 46, texte: "Voir la réponse", actif: true, appui: 0, couleur: "#e8a020" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.defis = fabriquer(niveau, c.rnd);
    this.disposer(); this.hud();
  }
  get defi() { return this.defis[this.i]; }
  hud() { this.c.hud({ score: this.score, objectif: `Défi ${Math.min(this.i + 1, PAR_NIVEAU)}/${PAR_NIVEAU}` }); }
  carte() { const w = Math.min(this.L - 32, 560); return { x: (this.L - w) / 2, y: this.H * 0.15, w, h: this.H * 0.47 }; }
  disposer() {
    const k = this.carte(), g = 14, w = (k.w - g) / 2;
    Object.assign(this.passe, { x: k.x, y: k.y + k.h + 18, w: w * 0.8 });
    Object.assign(this.ok, { x: k.x + w * 0.8 + g, y: k.y + k.h + 18, w: k.w - w * 0.8 - g });
    this.voir.x = this.L / 2 - this.voir.w / 2; this.voir.y = k.y + k.h - this.voir.h - 16;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.fini || this.transition > 0) return;
    const d = this.defi;
    if (d.reponse && !this.vu && dans(x, y, this.voir)) { this.vu = true; this.voir.appui = 1; this.c.sons.pop(2); return; }
    if (dans(x, y, this.ok)) {
      this.ok.appui = 1; this.faits++; this.historique[this.i] = true; this.fierte = Math.min(1, this.fierte + 1 / PAR_NIVEAU);
      this.score += 100 + Math.round(this.chrono * 2);
      this.c.sons.combo(this.faits); this.c.fx.etoiles(this.ok.x + this.ok.w / 2, this.ok.y, 22);
      this.c.fx.texte(ENCOURAGEMENTS[Math.floor(this.c.rnd() * ENCOURAGEMENTS.length)], this.L / 2, this.carte().y + 30, "#ffe066", 30);
      const [tx, ty] = this.posTambour(this.i); this.c.fx.gerbe(tx, ty, "#ffb21e", 16, 220, 1, 200);
      this.suivant();
    } else if (dans(x, y, this.passe)) {
      this.passe.appui = 1; this.passes++; this.c.sons.swoosh(); this.suivant();
    }
  }
  up() { this.ok.appui = this.passe.appui = this.voir.appui = 0; }
  suivant() { this.transition = 0.35; this.hud(); }
  passerAuDefiSuivant() {
    this.i++; this.vu = false; this.chrono = DUREE;
    if (this.i >= this.defis.length) {
      this.fini = true;
      const e = this.faits >= 5 ? 3 : this.faits >= 3 ? 2 : 1;
      const lignes = [`Tu as relevé ${this.faits} défi${this.faits > 1 ? "s" : ""} sur ${PAR_NIVEAU}.`, this.faits === PAR_NIVEAU ? "Tu as osé parler à chaque fois : lé fier aou !" : "Chaque défi relevé, c'est un pas de plus pour oser parler."];
      this.c.fin({ gagne: true, score: this.score, etoiles: e, lignes, savoir: { titre: "Le saviez-vous ?", texte: "À l'école, le créole réunionnais est une langue vivante régionale. Parler ses deux langues, le créole et le français, aide à prendre confiance et à mieux apprendre." } });
      return;
    }
    this.hud();
  }
  maj(dt: number) {
    this.temps += dt;
    if (this.transition > 0) { this.transition -= dt; if (this.transition <= 0) this.passerAuDefiSuivant(); return; }
    if (!this.fini && this.chrono > 0) {
      const avant = Math.ceil(this.chrono); this.chrono = Math.max(0, this.chrono - dt);
      if (Math.ceil(this.chrono) !== avant && this.chrono <= 5 && this.chrono > 0) this.c.sons.tic();
    }
  }
  posTambour(i: number): [number, number] {
    const w = Math.min(this.L - 40, 520), x0 = (this.L - w) / 2;
    return [x0 + (i + 0.5) * (w / PAR_NIVEAU), this.H - 62];
  }
  tambour(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, allume: boolean, actif: boolean) {
    ctx.save(); ctx.translate(x, y + (actif ? Math.sin(this.temps * 8) * 2 : 0));
    if (allume) { ctx.shadowColor = "rgba(255,190,60,0.9)"; ctx.shadowBlur = 18; }
    ctx.fillStyle = allume ? "#c8702a" : "rgba(120,80,50,0.55)";
    ctx.beginPath(); ctx.moveTo(-t * 0.42, -t * 0.4); ctx.lineTo(t * 0.42, -t * 0.4); ctx.lineTo(t * 0.32, t * 0.5); ctx.lineTo(-t * 0.32, t * 0.5); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = allume ? "#f4ddb0" : "rgba(230,215,190,0.6)";
    ctx.beginPath(); ctx.ellipse(0, -t * 0.4, t * 0.42, t * 0.13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = allume ? "#6a3a14" : "rgba(80,50,30,0.5)"; ctx.lineWidth = 2;
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * t * 0.3, -t * 0.32); ctx.lineTo(k * t * 0.22, t * 0.45); ctx.stroke(); }
    ctx.restore();
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    // jauge de fierté
    const wj = Math.min(this.L - 40, 520), xj = (this.L - wj) / 2, yj = (this.ok.y + this.ok.h + this.H - 100) / 2;
    ctx.font = `900 14px ${POLICE}`; ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("Lé fier", xj, yj);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; arrondi(ctx, xj + 64, yj - 9, wj - 64, 18, 9); ctx.fill();
    const g = ctx.createLinearGradient(xj + 64, 0, xj + wj, 0); g.addColorStop(0, "#ffd65a"); g.addColorStop(1, "#ff7a2a");
    ctx.fillStyle = g; arrondi(ctx, xj + 64, yj - 9, Math.max(18, (wj - 64) * this.fierte), 18, 9); ctx.fill();
    if (this.i < this.defis.length) {
      const d = this.defi, k = this.carte(), glisse = this.transition > 0 ? (0.35 - this.transition) / 0.35 : 0;
      ctx.save(); ctx.globalAlpha = 1 - glisse; ctx.translate(-glisse * 60, 0);
      panneau(ctx, k.x, k.y, k.w, k.h, "rgba(255,250,238,0.97)");
      ctx.fillStyle = d.couleur; arrondi(ctx, k.x + 16, k.y + 16, 128, 30, 15); ctx.fill();
      ctx.font = `900 14px ${POLICE}`; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(d.cat, k.x + 80, k.y + 31);
      // chrono
      const cx = k.x + k.w - 36, cy = k.y + 32, r = 18, f = this.chrono / DUREE;
      ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = f > 0.25 ? "#2e8a4a" : "#d8432a"; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); ctx.stroke();
      ctx.font = `900 13px ${POLICE}`; ctx.fillStyle = "#3a2412"; ctx.fillText(String(Math.ceil(this.chrono)), cx, cy);
      let y = k.y + 62;
      y += paragraphe(ctx, d.consigne, this.L / 2, y, k.w - 40, 16, "#8a5a2a", "center", 800, 44) + 10;
      const basTexte = d.reponse ? this.voir.y - 10 : k.y + k.h - 16;
      const hT = paragraphe(ctx, d.texte, this.L / 2, y, k.w - 40, d.texte.length < 14 ? 40 : 24, "#3a2412", "center", 900, (basTexte - y) * 0.6);
      y += hT + 8;
      if (this.vu && d.reponse) {
        ctx.fillStyle = "rgba(232,160,32,0.16)"; arrondi(ctx, k.x + 16, y, k.w - 32, basTexte - y + this.voir.h + 4, 14); ctx.fill();
        paragraphe(ctx, d.reponse, this.L / 2, y + 8, k.w - 56, 17, "#5a3410", "center", 800, basTexte - y + this.voir.h - 12);
      } else {
        if (d.aide) paragraphe(ctx, d.aide, this.L / 2, y, k.w - 50, 15, "#7a6a5a", "center", 700, basTexte - y);
        if (d.reponse) dessinerBouton(ctx, this.voir, this.temps);
      }
      if (this.chrono <= 0 && !this.vu) paragraphe(ctx, "Temps écoulé : tu l'as fait ? Dis-le en touchant un bouton.", this.L / 2, k.y + k.h - (d.reponse ? 92 : 40), k.w - 40, 14, "#b8361d", "center", 800);
      ctx.restore();
      dessinerBouton(ctx, this.passe, this.temps);
      dessinerBouton(ctx, this.ok, this.temps);
    }
    const t = Math.min(52, (Math.min(this.L - 40, 520) / PAR_NIVEAU) * 0.7);
    for (let i = 0; i < PAR_NIVEAU; i++) { const [x, y] = this.posTambour(i); this.tambour(ctx, x, y, t, i < this.i && this.reussi(i), i === this.i); }
  }
  reussi(i: number) { return this.historique[i] ?? false; }
}

const def: DefJeu = {
  id: "kabar-marmay",
  titre: "Kabar Marmay",
  accroche: "Ose parler ! Des défis en créole et en français pour prendre confiance, seul, en famille ou en classe.",
  regles: [
    "Lis le défi, puis relève-le à voix haute devant quelqu'un.",
    "Tu l'as fait ? Touche « Mi la fé ! ». Tu préfères attendre ? Touche « Passe ».",
    "Il n'y a pas de mauvaise réponse : on gagne en osant parler.",
    "En classe : passez la tablette au suivant après chaque défi.",
  ],
  niveaux: 9,
  theme: THEMES.coucher,
  creer: (c, n) => new Kabar(c, n),
};
export default def;
