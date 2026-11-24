// Accès aux services Cloudflare : base D1 et stockage R2.
import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Result<T> = { results: T[] };
type D1Requete = { all<T>(): Promise<D1Result<T>>; first<T>(): Promise<T | null>; run(): Promise<unknown> };
export type D1 = {
  prepare(sql: string): { bind(...v: unknown[]): D1Requete };
  batch(s: unknown[]): Promise<unknown>;
};
export type R2Objet = { body: ReadableStream; text(): Promise<string>; httpMetadata?: { contentType?: string } };
export type R2 = {
  get(cle: string): Promise<R2Objet | null>;
  put(cle: string, valeur: ReadableStream | ArrayBuffer | Blob | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
};

async function env() {
  const { env } = await getCloudflareContext({ async: true });
  return env as unknown as { DB: D1; LIVRES: R2 };
}

/** Exécute une requête et renvoie toutes les lignes. */
export async function tous<T = any>(sql: string, ...params: unknown[]): Promise<T[]> {
  const { DB } = await env();
  const r = await DB.prepare(sql).bind(...params).all<T>();
  return r.results || [];
}

/** Exécute une requête et renvoie la première ligne (ou null). */
export async function premier<T = any>(sql: string, ...params: unknown[]): Promise<T | null> {
  const { DB } = await env();
  return DB.prepare(sql).bind(...params).first<T>();
}

/** Exécute une requête d'écriture et renvoie le nombre de lignes modifiées. */
export async function executer(sql: string, ...params: unknown[]): Promise<number> {
  const { DB } = await env();
  const r: any = await DB.prepare(sql).bind(...params).run();
  return r?.meta?.changes ?? 0;
}

export async function stockage(): Promise<R2> {
  return (await env()).LIVRES;
}

export function urlCouverture(chemin: string | null | undefined): string | null {
  if (!chemin) return null;
  if (chemin.startsWith("http") || chemin.startsWith("/")) return chemin;
  return `/couv/${chemin}`;
}
