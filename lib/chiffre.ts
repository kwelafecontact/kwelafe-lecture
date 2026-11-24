// Chiffrement AES-GCM des jetons Shopify stockés dans la base.
import { cleSecrete } from "./session";

async function cleAes() {
  const brute = await crypto.subtle.digest("SHA-256", (await cleSecrete()) as BufferSource);
  return crypto.subtle.importKey("raw", brute, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const b64 = (o: Uint8Array) => Buffer.from(o).toString("base64");
const deb64 = (t: string) => new Uint8Array(Buffer.from(t, "base64"));

export async function chiffrer(texte: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cleAes(), new TextEncoder().encode(texte));
  return `${b64(iv)}.${b64(new Uint8Array(c))}`;
}

export async function dechiffrer(paquet: string) {
  const [iv, c] = paquet.split(".");
  const clair = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deb64(iv) }, await cleAes(), deb64(c));
  return new TextDecoder().decode(clair);
}
