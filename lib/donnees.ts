// Accès aux données : livres, droits, progression.
import { tous, premier, executer } from "./cf";
import { config } from "./config";
import { adminConfigure, droitsDepuisShopify, droitsDepuisCompteClient, renouvelerJeton, type DroitsClient } from "./shopify";
import { chiffrer, dechiffrer } from "./chiffre";
import { creerCodesPourCommande } from "./cadeaux";
import type { Session } from "./session";

export type Manifeste =
  | {
      type: "epub";
      fixe: boolean;
      largeur?: number;
      hauteur?: number;
      pages: { href: string; titre?: string }[];
      sommaire: { titre: string; index: number }[];
    }
  | { type: "pdf"; pages: number; ratio: number; ext?: "webp" | "jpg" }
  // Livre-application web (index.html + pages) affiché tel quel dans une iframe isolée
  | { type: "web"; entree: string; pages?: number };

export type Livre = {
  id: string;
  slug: string;
  titre: string;
  resume: string | null;
  univers: string | null;
  type: "epub_texte" | "epub_interactif" | "pdf";
  shopify_product_id: string | null;
  url_boutique: string | null;
  inclus_abonnement: boolean;
  mystere_du_mois: boolean;
  couverture: string | null;
  manifeste: Manifeste;
  publie: boolean;
  gratuit: boolean;
  cree_le: string;
};

export type Client = {
  id: string;
  email: string;
  prenom: string | null;
  achats: string[];
  abonne: boolean;
  cadeau_jusqu: string | null;
  maj: string | null;
};

const SIX_HEURES = 6 * 3600 * 1000;

/* Conversion des lignes SQLite (0/1, JSON en texte) en objets */
export function versLivre(r: any): Livre {
  return { ...r, inclus_abonnement: !!r.inclus_abonnement, mystere_du_mois: !!r.mystere_du_mois, publie: !!r.publie, gratuit: !!r.gratuit, manifeste: JSON.parse(r.manifeste) };
}
function versClient(r: any): Client {
  return { ...r, abonne: !!r.abonne, achats: JSON.parse(r.achats || "[]") };
}
function versProgression(r: any): Progression {
  return { ...r, termine: !!r.termine, position: JSON.parse(r.position || '{"i":0,"f":0}') };
}

async function enregistrerClient(c: { id: string; email: string; prenom: string | null; achats: string[]; abonne: boolean; maj: string | null }) {
  await executer(
    `INSERT INTO clients (id, email, prenom, achats, abonne, maj) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET email = excluded.email, prenom = excluded.prenom, achats = excluded.achats, abonne = excluded.abonne, maj = excluded.maj`,
    c.id, c.email, c.prenom, JSON.stringify(c.achats), c.abonne ? 1 : 0, c.maj
  );
}

/** Enregistre les droits lus dans le compte client Shopify (et crée les codes des cadeaux achetés). */
export async function enregistrerDroitsClient(d: DroitsClient, refreshToken?: string) {
  await enregistrerClient({ id: d.id, email: d.email, prenom: d.prenom || null, achats: d.achats, abonne: d.abonne, maj: new Date().toISOString() });
  if (refreshToken) await executer("UPDATE clients SET jeton_renouv = ? WHERE id = ?", await chiffrer(refreshToken), d.id);
  const parCommande = new Map<string, { sku: string; quantite: number }[]>();
  for (const c of d.cadeaux) parCommande.set(c.commande, [...(parCommande.get(c.commande) || []), c]);
  for (const [commande, lignes] of parCommande) await creerCodesPourCommande(commande, lignes, d.id, d.email);
}

/** Récupère le client et rafraîchit ses droits depuis Shopify si besoin. */
export async function client(session: Session, forcer = false): Promise<Client> {
  const ligne = await premier("SELECT * FROM clients WHERE id = ?", session.cid);
  let c = ligne ? versClient(ligne) : null;
  const perime = !c?.maj || Date.now() - new Date(c.maj).getTime() > SIX_HEURES;
  const brut: any = ligne;
  if ((forcer || perime) && !config.demo && !session.visiteur && brut?.jeton_renouv && config.caClientId) {
    try {
      const jetons = await renouvelerJeton(await dechiffrer(brut.jeton_renouv));
      await enregistrerDroitsClient(await droitsDepuisCompteClient(jetons.access_token), jetons.refresh_token);
      c = versClient(await premier("SELECT * FROM clients WHERE id = ?", session.cid));
    } catch (e) {
      console.error("Mise à jour des droits par le compte client impossible", e);
    }
  } else if ((forcer || perime) && !config.demo && !session.visiteur && adminConfigure()) {
    try {
      const d = await droitsDepuisShopify(session.cid);
      await enregistrerClient({ id: session.cid, email: session.email, prenom: session.prenom || null, achats: d.achats, abonne: d.abonne, maj: new Date().toISOString() });
      c = versClient(await premier("SELECT * FROM clients WHERE id = ?", session.cid));
    } catch (e) {
      console.error("Rafraîchissement des droits impossible", e);
    }
  }
  if (!c) {
    await enregistrerClient({ id: session.cid, email: session.email, prenom: session.prenom || null, achats: [], abonne: config.demo, maj: null });
    c = versClient(await premier("SELECT * FROM clients WHERE id = ?", session.cid));
  }
  return c;
}

export function abonnementActif(c: Client) {
  return c.abonne || (c.cadeau_jusqu ? new Date(c.cadeau_jusqu) > new Date() : false);
}

export function aAcces(c: Client, l: Livre, session?: Session | null) {
  if (session?.admin || config.demo || l.gratuit) return true;
  const produits = (l.shopify_product_id || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (produits.some((p) => c.achats.includes(p))) return true;
  return l.inclus_abonnement && abonnementActif(c);
}

export async function livresPublies(): Promise<Livre[]> {
  return (await tous("SELECT * FROM livres WHERE publie = 1 ORDER BY cree_le DESC")).map(versLivre);
}

export async function tousLesLivres(): Promise<Livre[]> {
  return (await tous("SELECT * FROM livres ORDER BY cree_le DESC")).map(versLivre);
}

export async function livreParId(id: string): Promise<Livre | null> {
  const r = await premier("SELECT * FROM livres WHERE id = ?", id);
  return r ? versLivre(r) : null;
}

export async function livreParSlug(slug: string, inclureBrouillons = false): Promise<Livre | null> {
  const r = await premier(`SELECT * FROM livres WHERE slug = ? ${inclureBrouillons ? "" : "AND publie = 1"}`, slug);
  return r ? versLivre(r) : null;
}

export type Progression = { livre_id: string; position: { i: number; f: number }; pourcentage: number; termine: boolean; maj: string };

export async function progressions(clientId: string): Promise<Progression[]> {
  return (await tous("SELECT * FROM progression WHERE client_id = ? ORDER BY maj DESC", clientId)).map(versProgression);
}

export async function progressionLivre(clientId: string, livreId: string): Promise<Progression | null> {
  const r = await premier("SELECT * FROM progression WHERE client_id = ? AND livre_id = ?", clientId, livreId);
  return r ? versProgression(r) : null;
}
