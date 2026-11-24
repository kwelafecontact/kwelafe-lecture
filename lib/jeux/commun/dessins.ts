// Éléments de dessin partagés : personnages, boutons, cagettes, paniers, guêpe.
import { arrondi, texteContour } from "./moteur2d";

export const vers = (a: number, b: number, vitesse: number, dt: number) => a + (b - a) * (1 - Math.exp(-vitesse * dt));
export const dans = (x: number, y: number, r: { x: number; y: number; w: number; h: number }) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

const PEAUX = ["#8a5a3a", "#c68a5a", "#e8b48a", "#5e3a24", "#a8704a"];
const HABITS = ["#e84a5a", "#3a8ae8", "#f2b02a", "#4ab86a", "#a85ae8", "#ff7a3a"];

/** Client souriant (ou fâché) : tête, cheveux, chapeau de paille optionnel, haut coloré. */
export function personnage(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, graine: number, humeur: number, temps: number) {
  const peau = PEAUX[graine % PEAUX.length], habit = HABITS[(graine * 7) % HABITS.length];
  const balance = Math.sin(temps * 2 + graine) * t * 0.02;
  ctx.save();
  ctx.translate(x, y + balance);
  // corps
  ctx.fillStyle = habit;
  arrondi(ctx, -t * 0.42, t * 0.32, t * 0.84, t * 0.75, t * 0.3); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  arrondi(ctx, -t * 0.42, t * 0.32, t * 0.84, t * 0.18, t * 0.3); ctx.fill();
  // tête
  ctx.fillStyle = peau;
  ctx.beginPath(); ctx.arc(0, 0, t * 0.34, 0, Math.PI * 2); ctx.fill();
  // cheveux ou chapeau
  if (graine % 3 === 0) {
    ctx.fillStyle = "#e8c878";
    ctx.beginPath(); ctx.ellipse(0, -t * 0.22, t * 0.55, t * 0.12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -t * 0.3, t * 0.28, t * 0.18, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#c84a3a"; ctx.fillRect(-t * 0.28, -t * 0.3, t * 0.56, t * 0.05);
  } else {
    ctx.fillStyle = graine % 2 ? "#1e140e" : "#3a2414";
    ctx.beginPath(); ctx.arc(0, -t * 0.08, t * 0.35, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    if (graine % 3 === 1) { ctx.beginPath(); ctx.arc(t * 0.3, -t * 0.05, t * 0.12, 0, Math.PI * 2); ctx.fill(); }
  }
  // yeux
  ctx.fillStyle = "#1a0e08";
  const cligne = (Math.sin(temps * 1.7 + graine * 3) > 0.97) ? 0.15 : 1;
  ctx.beginPath(); ctx.ellipse(-t * 0.12, -t * 0.02, t * 0.04, t * 0.05 * cligne, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(t * 0.12, -t * 0.02, t * 0.04, t * 0.05 * cligne, 0, 0, Math.PI * 2); ctx.fill();
  // bouche selon l'humeur (1 content, 0 fâché)
  ctx.strokeStyle = "#5a1e14"; ctx.lineWidth = t * 0.035; ctx.lineCap = "round";
  ctx.beginPath();
  const c = (humeur - 0.5) * t * 0.16;
  ctx.moveTo(-t * 0.1, t * 0.13); ctx.quadraticCurveTo(0, t * 0.13 + c, t * 0.1, t * 0.13); ctx.stroke();
  // joues
  ctx.fillStyle = "rgba(255,110,110,0.25)";
  ctx.beginPath(); ctx.arc(-t * 0.2, t * 0.08, t * 0.06, 0, 7); ctx.arc(t * 0.2, t * 0.08, t * 0.06, 0, 7); ctx.fill();
  ctx.restore();
}

/** Bulle de dialogue avec pointe vers le bas à gauche. */
export function bulle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#fffaf0";
  arrondi(ctx, x, y, w, h, 18); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 24, y + h - 2); ctx.lineTo(x + 8, y + h + 18); ctx.lineTo(x + 46, y + h - 2); ctx.fill();
  ctx.restore();
}

/** Jauge horizontale (patience, temps…). */
export function jauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, v: number) {
  ctx.fillStyle = "rgba(0,0,0,0.3)"; arrondi(ctx, x, y, w, h, h / 2); ctx.fill();
  const c = v > 0.5 ? "#4cd47a" : v > 0.25 ? "#ffc23a" : "#ff5a4a";
  ctx.fillStyle = c; arrondi(ctx, x, y, Math.max(h, w * Math.max(0, Math.min(1, v))), h, h / 2); ctx.fill();
}

export type Bouton = { x: number; y: number; w: number; h: number; texte: string; actif: boolean; appui: number; couleur?: string };
export function dessinerBouton(ctx: CanvasRenderingContext2D, b: Bouton, temps: number) {
  const s = 1 - b.appui * 0.06 + (b.actif ? Math.sin(temps * 5) * 0.02 : 0);
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(s, s);
  ctx.globalAlpha = b.actif ? 1 : 0.5;
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
  ctx.fillStyle = b.couleur || "#c8361d";
  arrondi(ctx, -b.w / 2, -b.h / 2, b.w, b.h, b.h / 2); ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255,255,255,0.2)"; arrondi(ctx, -b.w / 2 + 4, -b.h / 2 + 3, b.w - 8, b.h * 0.4, b.h / 3); ctx.fill();
  texteContour(ctx, b.texte, 0, 2, Math.min(26, b.h * 0.42), "#fff");
  ctx.restore();
}

/** Cagette en bois du marché. */
export function cagette(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, surligne = 0) {
  ctx.save();
  ctx.fillStyle = "#8a5a32"; arrondi(ctx, x, y, w, h, 8); ctx.fill();
  ctx.fillStyle = "#a8743e";
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 4, y + h * (0.55 + i * 0.14), w - 8, h * 0.09);
  ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(x + 4, y + 4, w - 8, h * 0.5);
  if (surligne > 0) { ctx.strokeStyle = `rgba(255,230,120,${surligne})`; ctx.lineWidth = 4; arrondi(ctx, x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke(); }
  ctx.restore();
}

/** Panier tressé (tri). */
export function panier(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, titre: string, couleur: string, surligne = 0) {
  ctx.save();
  ctx.fillStyle = "#b8864a"; arrondi(ctx, x, y, w, h, 16); ctx.fill();
  ctx.strokeStyle = "#8a5e2e"; ctx.lineWidth = 2;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 6, y + (h * i) / 5); ctx.lineTo(x + w - 6, y + (h * i) / 5); ctx.stroke(); }
  for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(x + (w * i) / 8, y + 6); ctx.lineTo(x + (w * i) / 8, y + h - 6); ctx.stroke(); }
  ctx.fillStyle = couleur; arrondi(ctx, x + w * 0.1, y - 16, w * 0.8, 32, 16); ctx.fill();
  texteContour(ctx, titre, x + w / 2, y, 17, "#fff");
  if (surligne > 0) { ctx.strokeStyle = `rgba(255,240,140,${surligne})`; ctx.lineWidth = 5; arrondi(ctx, x - 3, y - 3, w + 6, h + 6, 18); ctx.stroke(); }
  ctx.restore();
}

/** Guêpe animée. */
export function guepe(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, temps: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(temps * 9) * t * 0.04);
  ctx.fillStyle = "rgba(220,240,255,0.7)";
  const a = Math.sin(temps * 40) * 0.4;
  ctx.beginPath(); ctx.ellipse(-t * 0.12, -t * 0.28, t * 0.16, t * 0.26, -0.5 + a, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(t * 0.12, -t * 0.28, t * 0.16, t * 0.26, 0.5 - a, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f2c21e"; ctx.beginPath(); ctx.ellipse(0, 0, t * 0.38, t * 0.24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#1a1208";
  for (let i = -1; i <= 1; i++) ctx.fillRect(i * t * 0.15 - t * 0.04, -t * 0.22, t * 0.08, t * 0.44);
  ctx.beginPath(); ctx.arc(-t * 0.4, 0, t * 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(t * 0.36, 0); ctx.lineTo(t * 0.52, 0); ctx.lineTo(t * 0.36, t * 0.05); ctx.fill();
  ctx.restore();
}
