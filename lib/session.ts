import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "./config";
import { premier, executer } from "./cf";

export type Session = {
  cid: string; // identifiant client Shopify (gid://shopify/Customer/...)
  email: string;
  prenom?: string;
  admin?: boolean;
  visiteur?: boolean; // mode visiteur, sans compte
  testeur?: string; // empreinte du code test de l'équipe
  eleve?: { e: string; g: string }; // élève ou lecteur entré avec le code de sa classe (établissement, groupe)
};

const NOM_COOKIE = "kw_session";
const DUREE = 60 * 60 * 24 * 30; // 30 jours

let cacheCle: Uint8Array | null = null;

export async function cleSecrete() {
  return cle();
}

/** Clé de signature : SESSION_SECRET si fourni, sinon secret aléatoire créé une fois et rangé dans la base. */
async function cle(): Promise<Uint8Array> {
  if (cacheCle) return cacheCle;
  let secret = config.sessionSecret;
  if (secret.length < 32) {
    const existant = await premier<{ valeur: string }>("SELECT valeur FROM reglages WHERE cle = 'session_secret'");
    if (existant) secret = existant.valeur;
    else {
      const octets = new Uint8Array(48);
      crypto.getRandomValues(octets);
      const nouveau = Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
      await executer("INSERT OR IGNORE INTO reglages (cle, valeur) VALUES ('session_secret', ?)", nouveau);
      secret = (await premier<{ valeur: string }>("SELECT valeur FROM reglages WHERE cle = 'session_secret'"))!.valeur;
    }
  }
  cacheCle = new TextEncoder().encode(secret);
  return cacheCle;
}

export async function signer(payload: Record<string, unknown>, dureeSecondes: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + dureeSecondes)
    .sign(await cle());
}

export async function verifier<T>(jeton: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(jeton, await cle());
    return payload as T;
  } catch {
    return null;
  }
}

export async function ouvrirSession(s: Session) {
  const jeton = await signer({ ...s, admin: !s.visiteur && !s.testeur && !s.eleve && config.adminEmails.includes(s.email.toLowerCase()) }, DUREE);
  const jar = await cookies();
  jar.set(NOM_COOKIE, jeton, {
    httpOnly: true,
    secure: config.appUrl.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: DUREE,
  });
  // Repère lisible par l'interface pour afficher la navigation de l'espace élève
  if (s.eleve) jar.set("kw_espace", "eleve", { path: "/", sameSite: "lax", secure: config.appUrl.startsWith("https"), maxAge: DUREE });
  else jar.delete("kw_espace");
}

export async function lireSession(): Promise<Session | null> {
  const jar = await cookies();
  const jeton = jar.get(NOM_COOKIE)?.value;
  if (!jeton) return null;
  return verifier<Session>(jeton);
}

export async function fermerSession() {
  const jar = await cookies();
  jar.delete(NOM_COOKIE);
}
