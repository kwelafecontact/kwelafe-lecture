// Les Gardiens de l'île : reconnaître les animaux qui vivent naturellement à La Réunion et ceux apportés par l'homme.
import { type Contexte, type DefJeu, type Jeu, THEMES, melanger, arrondi } from "../commun/moteur2d";
import { paragraphe, panneau, dansTuile, POLICE } from "../commun/texte";
import { dessinerBouton, dans, type Bouton } from "../commun/dessins";
import D from "../serie2/donnees";

const PAR_NIVEAU = 2;
type Carte = { id: string; x: number; y: number; w: number; h: number; etat: "" | "bon" | "faux"; appui: number };
const A = D.animaux as Record<string, { nom: string; emoji: string; gardien: boolean; info: string }>;

class Gardiens implements Jeu {
  L: number; H: number;
  missions: (typeof D.gardiens)[number][]; m = 0;
  cartes: Carte[] = []; bonne = -1;
  repondu = false; erreurs = 0; score = 0; fini = false; temps = 0;
  suite: Bouton = { x: 0, y: 0, w: 200, h: 54, texte: "Continuer", actif: true, appui: 0, couleur: "#2e8a4a" };
  constructor(private c: Contexte, private niveau: number) {
    this.L = c.L; this.H = c.H;
    this.missions = D.gardiens.slice((niveau - 1) * PAR_NIVEAU, niveau * PAR_NIVEAU);
    this.preparer();
  }
  get mission() { return this.missions[this.m]; }
  preparer() {
    const ids = melanger([...this.mission.ids], this.c.rnd);
    this.cartes = ids.map((id) => ({ id, x: 0, y: 0, w: 0, h: 0, etat: "", appui: 0 }));
    this.bonne = this.cartes.findIndex((ca) => (this.mission.mode === "T" ? A[ca.id].gardien : !A[ca.id].gardien));
    this.repondu = false; this.disposer();
    this.c.hud({ score: this.score, objectif: `Mission ${this.m + 1}/${this.missions.length}` });
  }
  disposer() {
    const w = Math.min((this.L - 50) / 2, 220), h = Math.min(w * 1.05, this.H * 0.25);
    const x0 = (this.L - (w * 2 + 14)) / 2, y0 = this.H * 0.22;
    this.cartes.forEach((ca, i) => Object.assign(ca, { x: x0 + (i % 2) * (w + 14), y: y0 + Math.floor(i / 2) * (h + 14), w, h }));
    this.suite.x = this.L / 2 - this.suite.w / 2; this.suite.y = this.H - 90;
  }
  redim(L: number, H: number) { this.L = L; this.H = H; this.disposer(); }
  down(x: number, y: number) {
    if (this.fini) return;
    if (this.repondu) { if (dans(x, y, this.suite)) { this.suite.appui = 1; this.suivant(); } return; }
    const i = this.cartes.findIndex((ca) => dansTuile(x, y, ca)); if (i < 0) return;
    this.repondu = true;
    const ca = this.cartes[i];
    this.cartes[this.bonne].etat = "bon";
    if (i === this.bonne) {
      this.score += 150; this.c.sons.bon(); this.c.fx.etoiles(ca.x + ca.w / 2, ca.y + ca.h / 2, 24);
      this.c.fx.texte(this.mission.mode === "T" ? "Gardien sauvé !" : "Intrus trouvé !", ca.x + ca.w / 2, ca.y, "#ffe066", 24);
    } else { ca.etat = "faux"; this.erreurs++; this.c.sons.mauvais(); this.c.fx.secouer(0.2); }
  }
  up() { this.suite.appui = 0; }
  suivant() {
    this.m++;
    if (this.m >= this.missions.length) {
      this.fini = true;
      const e = this.erreurs === 0 ? 3 : this.erreurs === 1 ? 2 : 1;
      this.c.fin({ gagne: true, score: this.score, etoiles: e });
      return;
    }
    this.preparer();
  }
  maj(dt: number) { this.temps += dt; }
  dessiner(ctx: CanvasRenderingContext2D) {
    if (!this.mission) return;
    const consigne = this.mission.mode === "T" ? "Trouve le gardien de l'île : l'animal qui vit ici naturellement." : "Trouve l'intrus : l'animal apporté par l'homme.";
    const w = Math.min(this.L - 40, 520);
    panneau(ctx, (this.L - w) / 2, this.H * 0.08, w, this.H * 0.11, this.mission.mode === "T" ? "rgba(225,250,225,0.96)" : "rgba(255,235,225,0.96)");
    paragraphe(ctx, consigne, this.L / 2, this.H * 0.08 + 12, w - 30, 19, "#2a3a20", "center", 800, this.H * 0.11 - 20);
    for (const ca of this.cartes) {
      const a = A[ca.id];
      const fond = ca.etat === "bon" ? "#c8f0c0" : ca.etat === "faux" ? "#f8c8b8" : "rgba(255,250,240,0.96)";
      panneau(ctx, ca.x, ca.y, ca.w, ca.h, fond, 20);
      ctx.font = `${ca.h * 0.42}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(a.emoji, ca.x + ca.w / 2, ca.y + ca.h * 0.4);
      ctx.font = `800 ${Math.min(18, ca.w / 10)}px ${POLICE}`; ctx.fillStyle = "#3a2412";
      ctx.fillText(a.nom, ca.x + ca.w / 2, ca.y + ca.h * 0.82);
      if (this.repondu) {
        ctx.fillStyle = a.gardien ? "#2e8a4a" : "#b8361d"; arrondi(ctx, ca.x + 8, ca.y + 8, ca.w - 16, 22, 11); ctx.fill();
        ctx.font = `800 12px ${POLICE}`; ctx.fillStyle = "#fff"; ctx.fillText(a.gardien ? "Gardien de l'île" : "Apporté par l'homme", ca.x + ca.w / 2, ca.y + 19);
      }
    }
    if (this.repondu) {
      const b = this.cartes[this.bonne], yb = this.cartes[3].y + this.cartes[3].h + 14;
      const hb = this.suite.y - yb - 12;
      panneau(ctx, (this.L - w) / 2, yb, w, hb);
      paragraphe(ctx, A[this.mission.mode === "T" ? b.id : this.cartes.find((ca) => A[ca.id].gardien)!.id].info, this.L / 2, yb + 12, w - 30, 16, "#3a2412", "center", 700, hb - 20);
      dessinerBouton(ctx, this.suite, this.temps);
    }
  }
}

const def: DefJeu = {
  id: "gardiens-de-l-ile",
  titre: "Les Gardiens de l'île",
  accroche: "Reconnais les animaux qui vivent naturellement à La Réunion.",
  regles: ["Lis bien la consigne : parfois il faut trouver le gardien, parfois l'intrus.", "Les gardiens vivent ici naturellement ; les intrus ont été apportés par l'homme.", "Après chaque réponse, découvre l'animal.", "Sans erreur, tu gagnes 3 étoiles."],
  niveaux: Math.ceil(D.gardiens.length / PAR_NIVEAU),
  theme: THEMES.jardin,
  creer: (c, n) => new Gardiens(c, n),
};
export default def;
