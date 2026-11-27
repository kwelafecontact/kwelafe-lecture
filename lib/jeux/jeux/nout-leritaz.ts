// Nout Léritaz : l'enfant devient enquêteur de la mémoire familiale. Il pose des questions à un gramoun
// (ou à un proche plus âgé) sur un objet lontan, une recette ou un moment de vie, et remplit son carnet.
import { type Contexte, type DefJeu, type Jeu, THEMES, arrondi, sprite } from "../commun/moteur2d";
import { paragraphe, panneau, dansTuile, couper, POLICE } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";
import D from "../serie2/donnees";
import { QUESTIONS_OBJET, QUESTIONS_RECETTE, QUESTIONS_VIE, BONUS_LERITAZ } from "../serie3/memoire";

type Sujet = { genre: string; titre: string; sous: string; image?: string; emoji?: string; qs: string[] };
const minus = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Les sujets alternent : objet lontan, moment de vie, recette. */
function sujet(n: number): Sujet {
  const k = (n - 1) % 3, r = Math.floor((n - 1) / 3);
  if (k === 0) {
    const o = D.objets[r % D.objets.length];
    return { genre: "Objet lontan", titre: o.nom, sous: o.fr, image: o.id, qs: QUESTIONS_OBJET.map((q) => q.replaceAll("{nom}", minus(o.nom))) };
  }
  if (k === 1) {
    const v = QUESTIONS_VIE[r % QUESTIONS_VIE.length];
    return { genre: "Souvenirs", titre: v.theme, sous: "Ce que les gramoun ont vécu", emoji: v.emoji, qs: v.qs };
  }
  const rc = D.recettes[r % D.recettes.length];
  return { genre: "Recette péi", titre: rc.nom, sous: rc.fr, emoji: "🍲", qs: QUESTIONS_RECETTE.map((q) => q.replaceAll("{nom}", rc.fr)) };
}

type Case = { x: number; y: number; w: number; h: number; texte: string; fait: boolean; appui: number; bonus?: boolean };

class Leritaz implements Jeu {
  L: number; H: number;
  s: Sujet; cases: Case[] = []; score = 0; fini = false; temps = 0;
  suite: Bouton = { x: 0, y: 0, w: 300, h: 54, texte: "Ranger dans mon carnet", actif: false, appui: 0, couleur: "#2e7d4f" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.s = sujet(niveau);
    const bonus = BONUS_LERITAZ[(niveau - 1) % BONUS_LERITAZ.length];
    this.cases = [...this.s.qs.map((texte) => ({ x: 0, y: 0, w: 0, h: 0, texte, fait: false, appui: 0 })), { x: 0, y: 0, w: 0, h: 0, texte: "Bonus : " + bonus, fait: false, appui: 0, bonus: true }];
    this.disposer(); this.hud();
  }
  get questionsFaites() { return this.cases.filter((k) => !k.bonus && k.fait).length; }
  hud() { this.c.hud({ score: this.score, objectif: `${this.questionsFaites}/3 questions` }); }
  entete() { const w = Math.min(this.L - 32, 600); return { x: (this.L - w) / 2, y: this.H * 0.155, w, h: this.H * 0.2 }; }
  disposer() {
    const e = this.entete(), y0 = e.y + e.h + 14, dispo = this.H - 96 - y0, h = Math.min(84, dispo / 4 - 10);
    this.cases.forEach((k, i) => Object.assign(k, { x: e.x, y: y0 + i * (h + 10), w: e.w, h }));
    this.suite.x = this.L / 2 - this.suite.w / 2; this.suite.y = this.H - 80;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.fini) return;
    if (this.suite.actif && dans(x, y, this.suite)) { this.suite.appui = 1; this.terminer(); return; }
    const k = this.cases.find((q) => dansTuile(x, y, q)); if (!k) return;
    k.appui = 1;
    if (k.fait) { k.fait = false; this.score -= k.bonus ? 150 : 100; this.c.sons.clic(); }
    else {
      k.fait = true; this.score += k.bonus ? 150 : 100;
      this.c.sons.bon(); this.c.fx.etoiles(k.x + k.w - 34, k.y + k.h / 2, 12);
      if (!k.bonus && this.questionsFaites === 3) this.c.fx.texte("Enquête réussie !", this.L / 2, this.H * 0.5, "#ffe066", 28);
    }
    this.suite.actif = this.questionsFaites === 3;
    this.hud();
  }
  up() { for (const k of this.cases) k.appui = 0; this.suite.appui = 0; }
  terminer() {
    this.fini = true;
    const bonus = this.cases.some((k) => k.bonus && k.fait);
    this.c.fin({
      gagne: true, score: this.score, etoiles: bonus ? 3 : 2,
      lignes: [`« ${this.s.titre} » rejoint ton carnet de mémoire.`, bonus ? "Bonus réussi : tu es un vrai gardien de la mémoire !" : "Essaie aussi le bonus la prochaine fois."],
      savoir: { titre: "Pourquoi c'est important", texte: "Les souvenirs des gramoun font partie du patrimoine de l'île. En les écoutant et en les notant, tu aides à transmettre demain ce qu'on a vécu hier." },
    });
  }
  maj(dt: number) { this.temps += dt; }
  dessiner(ctx: CanvasRenderingContext2D) {
    const e = this.entete();
    panneau(ctx, e.x, e.y, e.w, e.h, "rgba(255,248,232,0.97)");
    const tImg = e.h * 0.78, xi = e.x + 14 + tImg / 2, yi = e.y + e.h / 2;
    ctx.fillStyle = "rgba(122,74,30,0.10)"; arrondi(ctx, e.x + 14, e.y + (e.h - tImg) / 2, tImg, tImg, 16); ctx.fill();
    const im = this.s.image ? this.c.img(this.s.image) : undefined;
    if (im) sprite(ctx, im, xi, yi, tImg * 0.92, Math.sin(this.temps * 1.2) * 0.03, 1, true);
    else { ctx.fillStyle = "#000"; ctx.font = `${tImg * 0.6}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(this.s.emoji || "📖", xi, yi); }
    const xt = e.x + tImg + 30, wt = e.w - tImg - 44;
    ctx.fillStyle = "#2e7d4f"; arrondi(ctx, xt, e.y + 16, 130, 26, 13); ctx.fill();
    ctx.font = `900 13px ${POLICE}`; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(this.s.genre, xt + 65, e.y + 29);
    const h1 = paragraphe(ctx, this.s.titre, xt, e.y + 50, wt, 26, "#3a2412", "left", 900, e.h * 0.32);
    paragraphe(ctx, this.s.sous, xt, e.y + 56 + h1, wt, 15, "#7a5a3a", "left", 700, e.h - h1 - 70);
    for (const k of this.cases) {
      const s = 1 - k.appui * 0.04;
      ctx.save(); ctx.translate(k.x + k.w / 2, k.y + k.h / 2); ctx.scale(s, s); ctx.translate(-k.w / 2, -k.h / 2);
      panneau(ctx, 0, 0, k.w, k.h, k.fait ? (k.bonus ? "rgba(255,230,160,0.97)" : "rgba(210,242,210,0.97)") : k.bonus ? "rgba(255,245,215,0.95)" : "rgba(255,252,244,0.97)", 14);
      const r = Math.min(18, k.h * 0.26), cx = k.w - 16 - r, cy = k.h / 2;
      ctx.strokeStyle = k.bonus ? "#c88a1a" : "#2e7d4f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      if (k.fait) {
        ctx.fillStyle = k.bonus ? "#e8a020" : "#2e8a4a"; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx - r * 0.45, cy); ctx.lineTo(cx - r * 0.1, cy + r * 0.38); ctx.lineTo(cx + r * 0.5, cy - r * 0.4); ctx.stroke();
      }
      const lw = k.w - r * 2 - 44; let tt = 16, nl = couper(ctx, k.texte, lw, tt).length;
      while (nl * tt * 1.28 > k.h - 12 && tt > 11) { tt--; nl = couper(ctx, k.texte, lw, tt).length; }
      paragraphe(ctx, k.texte, 16, (k.h - nl * tt * 1.28) / 2, lw, tt, k.bonus ? "#7a4a10" : "#3a2412", "left", 800);
      ctx.restore();
    }
    dessinerBouton(ctx, this.suite, this.temps);
    if (!this.suite.actif) paragraphe(ctx, "Coche les trois questions pour ranger ton enquête", this.L / 2, this.suite.y - 26, this.L - 40, 13, "#fff", "center", 800);
  }
}

const def: DefJeu = {
  id: "nout-leritaz",
  titre: "Nout Léritaz",
  accroche: "Deviens enquêteur de la mémoire : interroge un gramoun sur les objets, les recettes et la vie lontan.",
  regles: [
    "Va voir un gramoun, ou un proche plus âgé que toi.",
    "Pose-lui les trois questions, écoute bien sa réponse, puis coche chaque question.",
    "Le bonus rapporte une étoile de plus.",
    "En classe : chaque élève mène son enquête à la maison et la raconte le lendemain.",
  ],
  niveaux: 18,
  theme: THEMES.case,
  images: Object.fromEntries(D.objets.map((o) => [o.id, `/jeux/lontan/${o.id}.webp`])),
  creer: (c, n) => new Leritaz(c, n),
};
export default def;
