// Statistiques de lecture : série de jours, temps lu, livres terminés.
import { tous } from "./cf";

const jourReunion = (d: Date) => d.toLocaleDateString("fr-CA", { timeZone: "Indian/Reunion" });

export async function statistiques(clientId: string) {
  const jours = await tous<{ jour: string; secondes: number }>(
    "SELECT jour, secondes FROM jours_lecture WHERE client_id = ? ORDER BY jour DESC LIMIT 400", clientId
  );
  const set = new Set(jours.map((j) => j.jour));
  // Série : jours consécutifs jusqu'à aujourd'hui (ou hier, si la lecture du jour n'a pas encore commencé)
  let serie = 0;
  const d = new Date();
  if (!set.has(jourReunion(d))) d.setDate(d.getDate() - 1);
  while (set.has(jourReunion(d))) { serie++; d.setDate(d.getDate() - 1); }
  const aujourdhui = jours.find((j) => j.jour === jourReunion(new Date()))?.secondes || 0;
  const semaine = new Date(); semaine.setDate(semaine.getDate() - 6);
  const limite = jourReunion(semaine);
  const minutesSemaine = Math.round(jours.filter((j) => j.jour >= limite).reduce((t, j) => t + j.secondes, 0) / 60);
  const minutesTotal = Math.round(jours.reduce((t, j) => t + j.secondes, 0) / 60);
  // 7 derniers jours pour le petit graphique
  const derniers = Array.from({ length: 7 }, (_, k) => {
    const x = new Date(); x.setDate(x.getDate() - (6 - k));
    const cle = jourReunion(x);
    return { jour: x.toLocaleDateString("fr-FR", { weekday: "narrow", timeZone: "Indian/Reunion" }), minutes: Math.round((jours.find((j) => j.jour === cle)?.secondes || 0) / 60) };
  });
  return { serie, minutesAujourdhui: Math.round(aujourdhui / 60), minutesSemaine, minutesTotal, derniers };
}

export async function favorisDe(clientId: string) {
  const r = await tous<{ livre_id: string }>("SELECT livre_id FROM favoris WHERE client_id = ?", clientId);
  return new Set(r.map((x) => x.livre_id));
}
