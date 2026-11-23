import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "./config";

export type Session = {
  cid: string; // identifiant client Shopify (gid://shopify/Customer/...)
  email: string;
  prenom?: string;
  admin?: boolean;
};

const NOM_COOKIE = "kw_session";
const DUREE = 60 * 60 * 24 * 30; // 30 jours

function cle() {
  if (config.sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET doit contenir au moins 32 caractères.");
  }
  return new TextEncoder().encode(config.sessionSecret);
}

export async function signer(payload: Record<string, unknown>, dureeSecondes: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + dureeSecondes)
    .sign(cle());
}

export async function verifier<T>(jeton: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(jeton, cle());
    return payload as T;
  } catch {
    return null;
  }
}

export async function ouvrirSession(s: Session) {
  const jeton = await signer({ ...s, admin: config.adminEmails.includes(s.email.toLowerCase()) }, DUREE);
  const jar = await cookies();
  jar.set(NOM_COOKIE, jeton, {
    httpOnly: true,
    secure: config.appUrl.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: DUREE,
  });
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
