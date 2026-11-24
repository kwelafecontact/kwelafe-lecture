// Zarlor, le mot caché : deviner un mot créole en 6 essais (vert : bien placé, jaune : mal placé).
import { type Contexte, type DefJeu, type Jeu, THEMES, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, sansAccent, POLICE } from "../commun/texte";
import D from "../serie2/donnees";

const PAR_NIVEAU = 2, ESSAIS = 6;
const CLAVIER = ["AZERTYUIOP", "QSDFGHJKLM", "<WXCVBN>"];
type Touche = { k: string; x: number; y: number; w: number; h: number; appui: number };
type Etat = "g" | "y" | "n";

class Zarlor implements Jeu {
  L: number; H: number;
  mots: (typeof D.zarlor)[number][]; m = 0;
  cible = ""; lignes: string[] = []; etats: Etat[][] = []; saisie = "";
  touches: Touche[] = []; couleurs: Record<string, Etat> = {};
  fini = false; resultat: { ok: boolean; t: number } | null = null;
  score = 0; essaisTotal = 0; trouves = 0; temps = 0; secoue = 0;
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.mots = D.zarlor.slice((niveau - 1) * PAR_NIVEAU, niveau * PAR_NIVEAU);
    this.preparer();
  }
  preparer() {
    this.cible = sansAccent(this.mots[this.m].mot).replace(/[^A-Z]/g, "");
    this.lignes = []; this.etats = []; this.saisie = ""; this.couleurs = {}; this.resultat = null;
    this.disposer();
    this.c.hud({ score: this.score, objectif: `Mot ${this.m + 1}/${this.mots.length}`, info: `${this.cible.length} lettres` });
  }
  get n() { return this.cible.length; }
  get case() { return Math.min(52, (this.L - 40) / this.n - 6, (this.H * 0.42) / ESSAIS - 6); }
  disposer() {
    const kh = Math.min(52, this.H * 0.07), kw = Math.min(40, (this.L - 20) / 10 - 4), y0 = this.H - (kh + 6) * 3 - 16;
    this.touches = [];
    CLAVIER.forEach((r, ri) => {
      const ks = r.split(""), larg = ks.map((k) => (k === "<" || k === ">" ? kw * 1.6 : kw));
      const tot = larg.reduce((a, b) => a + b, 0) + (ks.length - 1) * 4;
      let x = (this.L - tot) / 2;
      ks.forEach((k, i) => { this.touches.push({ k, x, y: y0 + ri * (kh + 6), w: larg[i], h: kh, appui: 0 }); x += larg[i] + 4; });
    });
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.fini || this.resultat) return;
    const t = this.touches.find((t) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h); if (!t) return;
    t.appui = 1; this.c.sons.clic();
    if (t.k === "<") this.saisie = this.saisie.slice(0, -1);
    else if (t.k === ">") this.valider();
    else if (this.saisie.length < this.n) this.saisie += t.k;
  }
  up() { for (const t of this.touches) t.appui = 0; }
  valider() {
    if (this.saisie.length < this.n) { this.secoue = 0.4; this.c.sons.mauvais(); return; }
    const mot = this.saisie, cible = this.cible.split(""), e: Etat[] = Array(this.n).fill("n");
    const reste: Record<string, number> = {};
    cible.forEach((l, i) => { if (mot[i] === l) e[i] = "g"; else reste[l] = (reste[l] || 0) + 1; });
    mot.split("").forEach((l, i) => { if (e[i] !== "g" && reste[l]) { e[i] = "y"; reste[l]--; } });
    const rang: Record<Etat, number> = { n: 0, y: 1, g: 2 };
    mot.split("").forEach((l, i) => { const avant = this.couleurs[l]; if (!avant || rang[e[i]] > rang[avant]) this.couleurs[l] = e[i]; });
    this.lignes.push(mot); this.etats.push(e); this.saisie = "";
    if (mot === this.cible) {
      const gain = (ESSAIS + 1 - this.lignes.length) * 60; this.score += gain; this.trouves++; this.essaisTotal += this.lignes.length;
      this.c.sons.bon(); this.c.fx.confettis(this.L); this.c.fx.texte(`+${gain}`, this.L / 2, this.H * 0.3, "#ffe066", 34);
      this.resultat = { ok: true, t: 3 };
    } else if (this.lignes.length >= ESSAIS) {
      this.essaisTotal += ESSAIS + 2; this.c.sons.defaite(); this.resultat = { ok: false, t: 3.2 };
    } else this.c.sons.pop(this.lignes.length);
  }
  maj(dt: number) {
    this.temps += dt; this.secoue = Math.max(0, this.secoue - dt);
    if (this.resultat && !this.fini) {
      this.resultat.t -= dt;
      if (this.resultat.t <= 0) {
        this.m++;
        if (this.m >= this.mots.length) {
          this.fini = true;
          const moy = this.essaisTotal / this.mots.length;
          const e = this.trouves === 0 ? 0 : this.trouves < this.mots.length ? 1 : moy <= 3.5 ? 3 : moy <= 5 ? 2 : 1;
          this.c.fin({ gagne: this.trouves > 0, score: this.score, etoiles: e });
          return;
        }
        this.preparer();
      }
    }
  }
  dessiner(ctx: CanvasRenderingContext2D) {
    const mot = this.mots[this.m]; if (!mot) return;
    const w = Math.min(this.L - 40, 520);
    panneau(ctx, (this.L - w) / 2, this.H * 0.07, w, 56, "rgba(255,250,238,0.95)");
    paragraphe(ctx, "Indice : " + mot.indice, this.L / 2, this.H * 0.07 + 8, w - 24, 15, "#3a2412", "center", 700, 44);
    const t = this.case, gx = (this.L - this.n * (t + 6)) / 2, gy = this.H * 0.07 + 70;
    const dx = this.secoue > 0 ? Math.sin(this.temps * 60) * 8 * this.secoue : 0;
    for (let r = 0; r < ESSAIS; r++) for (let i = 0; i < this.n; i++) {
      const x = gx + i * (t + 6) + (r === this.lignes.length ? dx : 0), y = gy + r * (t + 6);
      const l = r < this.lignes.length ? this.lignes[r][i] : r === this.lignes.length ? this.saisie[i] || "" : "";
      const e = r < this.lignes.length ? this.etats[r][i] : null;
      ctx.fillStyle = e === "g" ? "#3aa85a" : e === "y" ? "#e0a820" : e === "n" ? "#7a7a80" : "rgba(255,255,255,0.85)";
      arrondi(ctx, x, y, t, t, 8); ctx.fill();
      if (l) { ctx.font = `800 ${t * 0.55}px ${POLICE}`; ctx.fillStyle = e ? "#fff" : "#3a2412"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(l, x + t / 2, y + t / 2 + 1); }
    }
    if (this.resultat) {
      const y = gy + ESSAIS * (t + 6) + 4;
      panneau(ctx, (this.L - w) / 2, y, w, 64, this.resultat.ok ? "rgba(220,250,220,0.97)" : "rgba(255,235,225,0.97)");
      paragraphe(ctx, `${mot.mot} : ${mot.sens}`, this.L / 2, y + 10, w - 24, 20, "#3a2412", "center", 800, 48);
    }
    for (const k of this.touches) {
      const e = this.couleurs[k.k];
      ctx.save(); ctx.translate(k.x + k.w / 2, k.y + k.h / 2); ctx.scale(1 - k.appui * 0.08, 1 - k.appui * 0.08);
      ctx.fillStyle = k.k === ">" ? "#2e8a4a" : k.k === "<" ? "#b8361d" : e === "g" ? "#3aa85a" : e === "y" ? "#e0a820" : e === "n" ? "#5a5a60" : "rgba(255,250,240,0.95)";
      arrondi(ctx, -k.w / 2, -k.h / 2, k.w, k.h, 8); ctx.fill();
      ctx.font = `800 ${k.k === "<" || k.k === ">" ? 13 : 18}px ${POLICE}`; ctx.fillStyle = e || k.k === "<" || k.k === ">" ? "#fff" : "#3a2412";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(k.k === "<" ? "Effacer" : k.k === ">" ? "Valider" : k.k, 0, 1);
      ctx.restore();
    }
  }
}

const def: DefJeu = {
  id: "zarlor",
  titre: "Zarlor, le mot caché",
  accroche: "Devine le mot créole caché en 6 essais.",
  regles: ["Tape un mot du bon nombre de lettres, puis Valider.", "Vert : la lettre est bien placée. Jaune : elle est dans le mot, mais ailleurs.", "Gris : la lettre n'est pas dans le mot.", "Un indice t'aide ; les accents ne comptent pas."],
  niveaux: Math.ceil(D.zarlor.length / PAR_NIVEAU),
  theme: THEMES.lagon,
  creer: (c, n) => new Zarlor(c, n),
};
export default def;
