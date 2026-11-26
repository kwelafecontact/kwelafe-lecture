// Établissements (écoles, médiathèques, collectivités), leurs groupes et les codes d'accès des élèves ou lecteurs.
import { premier, tous } from "./cf";
import type { Session } from "./session";
import { MOTS, type TypeEtab } from "./etab-mots";
export { MOTS, type TypeEtab };

export type Etab = { id: string; nom: string; type: TypeEtab; ville: string | null; couleur: string; message: string | null; logo: string | null; admins: string; fin: string; actif: number; cree_le: string };
export type Groupe = { id: string; etab_id: string; nom: string; niveau: string | null; responsable: string | null; empreinte: string; apercu: string; actif: number; selection: string; message: string | null; connexions: number; dernier_usage: string | null; cree_le: string };

export const nettoyerCode = (code: string) => code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

export async function empreinteGroupe(code: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("kw-groupe:" + nettoyerCode(code)));
  return Array.from(new Uint8Array(h), (o) => o.toString(16).padStart(2, "0")).join("");
}

export function nouveauCodeGroupe(type: TypeEtab) {
  const lettres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const o = new Uint8Array(8);
  crypto.getRandomValues(o);
  const s = Array.from(o, (x) => lettres[x % lettres.length]).join("");
  return `${MOTS[type].prefixe}-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const etabValide = (e: Pick<Etab, "actif" | "fin"> | null | undefined) => !!e && !!e.actif && new Date(e.fin) > new Date();

/** Le groupe (et son établissement) d'une session élève, s'ils sont encore valables. */
export async function groupeDeSession(session: Session) {
  if (!session.eleve) return null;
  const g = await premier<Groupe>("SELECT * FROM groupes WHERE id = ?", session.eleve.g);
  if (!g || !g.actif) return null;
  const e = await premier<Etab>("SELECT * FROM etablissements WHERE id = ?", g.etab_id);
  if (!etabValide(e)) return null;
  return { groupe: g, etab: e! };
}

/** Établissements que cette personne peut administrer (adresse inscrite par Kwélafé, ou éditeur). */
export async function etabsAdministres(session: Session | null): Promise<Etab[]> {
  if (!session || session.visiteur || session.testeur || session.eleve) return [];
  const liste = await tous<Etab>("SELECT * FROM etablissements ORDER BY nom").catch(() => [] as Etab[]);
  if (session.admin) return liste;
  const email = session.email.toLowerCase();
  return liste.filter((e) => e.admins.toLowerCase().split(/[\s,;]+/).includes(email));
}

/** Responsable d'un établissement abonné et valable : il lit tout, comme ses élèves. */
export async function responsableActif(email: string | undefined) {
  if (!email) return false;
  const e = email.toLowerCase();
  const liste = await tous<Etab>("SELECT * FROM etablissements WHERE actif = 1 AND admins LIKE ?", `%${e}%`).catch(() => [] as Etab[]);
  return liste.some((x) => etabValide(x) && x.admins.toLowerCase().split(/[\s,;]+/).includes(e));
}

/** Texte du filigrane du lecteur : jamais d'adresse technique pour un élève ou l'équipe. */
export async function libelleFiligrane(session: Session) {
  if (session.eleve) { const g = await groupeDeSession(session); return g ? `${g.etab.nom} · ${g.groupe.nom}` : "Kwélafé Academy"; }
  if (session.testeur) return `Accès équipe Kwélafé${session.prenom ? ` · ${session.prenom}` : ""}`;
  if (session.visiteur) return "Kwélafé · découverte";
  return session.email;
}

export async function etabAdministre(session: Session | null, id: string) {
  return (await etabsAdministres(session)).find((e) => e.id === id) ?? null;
}

export const selectionDe = (g: Pick<Groupe, "selection">): string[] => {
  try { const v = JSON.parse(g.selection); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
};
