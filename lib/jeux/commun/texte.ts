// Outils de texte et de cartes pour les jeux 2D (texte sur plusieurs lignes, panneaux, boutons à long libellé).
import { arrondi } from "./moteur2d";

export const POLICE = "Nunito, system-ui, sans-serif";

/** Coupe un texte en lignes qui tiennent dans la largeur donnée. */
export function couper(ctx: CanvasRenderingContext2D, texte: string, largeur: number, taille: number, poids = 800): string[] {
  ctx.font = `${poids} ${taille}px ${POLICE}`;
  const sortie: string[] = [];
  for (const para of texte.split("\n")) {
    let ligne = "";
    for (const mot of para.split(/\s+/)) {
      const essai = ligne ? ligne + " " + mot : mot;
      if (ctx.measureText(essai).width > largeur && ligne) { sortie.push(ligne); ligne = mot; } else ligne = essai;
    }
    sortie.push(ligne);
  }
  return sortie;
}

/** Écrit un paragraphe ; renvoie la hauteur occupée. La taille baisse si le texte dépasse hMax. */
export function paragraphe(ctx: CanvasRenderingContext2D, texte: string, x: number, y: number, largeur: number, taille: number,
  couleur = "#3a2412", align: CanvasTextAlign = "center", poids = 800, hMax = Infinity): number {
  let t = taille, l = couper(ctx, texte, largeur, t, poids);
  while (l.length * t * 1.28 > hMax && t > 11) { t -= 1; l = couper(ctx, texte, largeur, t, poids); }
  ctx.font = `${poids} ${t}px ${POLICE}`;
  ctx.fillStyle = couleur; ctx.textAlign = align; ctx.textBaseline = "top";
  l.forEach((s, i) => ctx.fillText(s, x, y + i * t * 1.28));
  return l.length * t * 1.28;
}

/** Panneau crème arrondi avec ombre portée. */
export function panneau(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, couleur = "rgba(255,250,238,0.96)", r = 18) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.28)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = couleur; arrondi(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();
}

export type Tuile = { x: number; y: number; w: number; h: number; texte: string; etat: "" | "choisi" | "bon" | "faux" | "fait"; appui: number; data?: number };

const COULEURS: Record<Tuile["etat"], [string, string]> = {
  "": ["#fffaf0", "#3a2412"], choisi: ["#ffd65a", "#3a2412"], bon: ["#3aa85a", "#fff"], faux: ["#d8432a", "#fff"], fait: ["rgba(255,255,255,0.35)", "rgba(60,40,20,0.5)"],
};

/** Tuile de réponse au texte libre (sur plusieurs lignes si besoin). */
export function dessinerTuile(ctx: CanvasRenderingContext2D, t: Tuile, taille = 18) {
  const [fond, encre] = COULEURS[t.etat];
  const s = 1 - t.appui * 0.05;
  ctx.save();
  ctx.translate(t.x + t.w / 2, t.y + t.h / 2); ctx.scale(s, s);
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
  ctx.fillStyle = fond; arrondi(ctx, -t.w / 2, -t.h / 2, t.w, t.h, 14); ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(t.x + t.w / 2, t.y + t.h / 2); ctx.scale(s, s);
  let tt = taille, l = couper(ctx, t.texte, t.w - 20, tt);
  while (l.length * tt * 1.22 > t.h - 10 && tt > 11) { tt -= 1; l = couper(ctx, t.texte, t.w - 20, tt); }
  ctx.font = `800 ${tt}px ${POLICE}`; ctx.fillStyle = encre; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const h0 = -((l.length - 1) * tt * 1.22) / 2;
  l.forEach((s2, i) => ctx.fillText(s2, 0, h0 + i * tt * 1.22));
  ctx.restore();
}

export const dansTuile = (x: number, y: number, t: { x: number; y: number; w: number; h: number }) => x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h;

/** Retire les accents et met en majuscules (pour comparer des mots). */
export const sansAccent = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
