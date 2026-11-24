// Petit bruit 3D déterministe (value noise lissé) pour sculpter les fruits et les textures.

function hash(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h & 0xffff) / 0xffff;
}

const lisse = (t: number) => t * t * (3 - 2 * t);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Bruit de valeur 3D, résultat entre 0 et 1. */
export function bruit3(x: number, y: number, z: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = lisse(x - xi), yf = lisse(y - yi), zf = lisse(z - zi);
  const c000 = hash(xi, yi, zi), c100 = hash(xi + 1, yi, zi);
  const c010 = hash(xi, yi + 1, zi), c110 = hash(xi + 1, yi + 1, zi);
  const c001 = hash(xi, yi, zi + 1), c101 = hash(xi + 1, yi, zi + 1);
  const c011 = hash(xi, yi + 1, zi + 1), c111 = hash(xi + 1, yi + 1, zi + 1);
  return mix(
    mix(mix(c000, c100, xf), mix(c010, c110, xf), yf),
    mix(mix(c001, c101, xf), mix(c011, c111, xf), yf),
    zf
  );
}

/** Bruit fractal (plusieurs octaves), résultat environ entre 0 et 1. */
export function fbm(x: number, y: number, z: number, octaves = 4): number {
  let somme = 0, amp = 0.5, freq = 1, total = 0;
  for (let i = 0; i < octaves; i++) {
    somme += bruit3(x * freq, y * freq, z * freq) * amp;
    total += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return somme / total;
}

/** Générateur pseudo-aléatoire reproductible. */
export function graine(s: number) {
  let a = s >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Cellule = { f1: number; f2: number; id: number };

/**
 * Bruit cellulaire (Worley) : distance au point le plus proche (f1) et au suivant (f2).
 * Sert à dessiner les bosses du letchi, les facettes du fruit à pain, les pointes du jacque…
 */
export function worley(x: number, y: number, z: number): Cellule {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let f1 = 9, f2 = 9, id = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++) {
        const cx = xi + dx, cy = yi + dy, cz = zi + dz;
        const h1 = hashCell(cx, cy, cz, 1), h2 = hashCell(cx, cy, cz, 2), h3 = hashCell(cx, cy, cz, 3);
        const px = cx + h1, py = cy + h2, pz = cz + h3;
        const d = Math.hypot(px - x, py - y, pz - z);
        if (d < f1) { f2 = f1; f1 = d; id = hashCell(cx, cy, cz, 7); }
        else if (d < f2) f2 = d;
      }
  return { f1, f2, id };
}

function hashCell(x: number, y: number, z: number, s: number) {
  let h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791) ^ (s * 2654435761);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
