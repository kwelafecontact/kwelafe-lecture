import { tous } from "./cf";

export type Video = { youtube_id: string; theme: string; enfants: number; titre: string; chaine: string | null; duree: string | null; ordre: number; actif: number };

export const THEMES_VIDEO = [
  { id: "volcan", nom: "Le volcan", emoji: "🌋", couleur: "#d6332a" },
  { id: "histoire", nom: "Histoire de l'île", emoji: "📜", couleur: "#9a6a3a" },
  { id: "cirques", nom: "Cirques et montagnes", emoji: "⛰️", couleur: "#2f7d4f" },
  { id: "ocean", nom: "Océan et coraux", emoji: "🐠", couleur: "#0f7c99" },
  { id: "animaux", nom: "Animaux et biodiversité", emoji: "🦎", couleur: "#2e9d4f" },
  { id: "vanille", nom: "Vanille, canne et terre", emoji: "🌿", couleur: "#7a5230" },
  { id: "lontan", nom: "Objets lontan et kaz", emoji: "🏺", couleur: "#b8651b" },
  { id: "culture", nom: "Culture et créole", emoji: "🥁", couleur: "#7a2e8f" },
  { id: "cuisine", nom: "Cuisine péi", emoji: "🍲", couleur: "#e07a1f" },
];

export async function listeVideos(enfantsSeulement = false): Promise<Video[]> {
  try {
    return await tous<Video>(`SELECT * FROM videos WHERE actif = 1 ${enfantsSeulement ? "AND enfants = 1" : ""} ORDER BY ordre, ajoute_le`);
  } catch { return []; }
}

export const miniature = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export function idYoutube(u: string): string | null {
  const m = u.trim().match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/) || u.trim().match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
}
