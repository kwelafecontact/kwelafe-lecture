// Koup Koup : catalogue des fruits péi, modélisés en 3D par le code (aucune image nécessaire).
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { bruit3, fbm, graine, worley } from "./bruit";

import { FRUITS, fruitParId, type DefFruit, type Jus, type Son } from "./donnees";
export { FRUITS, fruitParId, type DefFruit, type Jus, type Son };


// ---------------------------------------------------------------------------
// Outils de modélisation
// ---------------------------------------------------------------------------

const C = (hex: string) => new THREE.Color(hex);
const melange = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, Math.max(0, Math.min(1, t)));
const lisse = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Surface de révolution : profil(t) donne le rayon pour t de 0 (bas) à 1 (haut). */
function revolution(profil: (t: number) => number, hauteur: number, segV = 44, segR = 56) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= segV; i++) {
    const t = i / segV;
    const r = i === 0 || i === segV ? 0 : Math.max(0.001, profil(t));
    pts.push(new THREE.Vector2(r, -hauteur / 2 + t * hauteur));
  }
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(pts, segR);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g = mergeVertices(g, 1e-4);
  return g;
}

/** Tube courbe effilé (banane, piment). */
function tubeCourbe(points: THREE.Vector3[], rayon: number, effile: (t: number) => number, cotes = 0, segL = 64, segR = 16) {
  const courbe = new THREE.CatmullRomCurve3(points);
  const g0 = new THREE.TubeGeometry(courbe, segL, rayon, segR, false);
  const pos = g0.attributes.position as THREE.BufferAttribute;
  const uv = g0.attributes.uv as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = uv.getX(i);
    const a = uv.getY(i) * Math.PI * 2;
    const centre = courbe.getPointAt(Math.min(1, Math.max(0, t)));
    p.fromBufferAttribute(pos, i).sub(centre);
    let f = effile(t);
    if (cotes) f *= 1 + 0.07 * Math.cos(cotes * a);
    p.multiplyScalar(f).add(centre);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g0.deleteAttribute("uv");
  g0.deleteAttribute("normal");
  const g = mergeVertices(g0, 1e-3);
  g.center();
  return g;
}

/** Déplace chaque sommet le long de sa normale et peint les couleurs de peau. */
function sculpter(
  g: THREE.BufferGeometry,
  relief: ((p: THREE.Vector3) => number) | null,
  peau: (p: THREE.Vector3) => THREE.Color
) {
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const couleurs = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    if (relief) {
      n.fromBufferAttribute(nor, i);
      const d = relief(p);
      p.addScaledVector(n, d);
      pos.setXYZ(i, p.x, p.y, p.z);
    }
    const c = peau(p);
    couleurs[i * 3] = c.r; couleurs[i * 3 + 1] = c.g; couleurs[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(couleurs, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** Modifie le rayon de chaque sommet selon son angle autour de l'axe (côtes, sillons). */
function moduler(g: THREE.BufferGeometry, facteur: (angle: number, y: number) => number) {
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
    const f = facteur(Math.atan2(z, x), y);
    pos.setXYZ(i, x * f, y, z * f);
  }
  return g;
}

function peauPhysique(opts: THREE.MeshPhysicalMaterialParameters) {
  return new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, ...opts });
}

function feuille(longueur: number, largeur: number, couleur: string) {
  const g = new THREE.ConeGeometry(largeur, longueur, 5, 3);
  g.translate(0, longueur / 2, 0);
  g.scale(1, 1, 0.28);
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.6 }));
}

export type Modele = { corps: THREE.BufferGeometry; materiau: THREE.MeshPhysicalMaterial; accessoires: () => THREE.Object3D[] };

// ---------------------------------------------------------------------------
// Les modèles
// ---------------------------------------------------------------------------

const angle = (p: THREE.Vector3) => Math.atan2(p.z, p.x);
const hauteurRel = (p: THREE.Vector3, h: number) => p.y / h + 0.5; // 0 en bas, 1 en haut

/** Variante de sculpter : un seul calcul donne le relief et la couleur (bruits coûteux évalués une fois). */
function modeler(g: THREE.BufferGeometry, f: (p: THREE.Vector3) => [number, THREE.Color]) {
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const couleurs = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    n.fromBufferAttribute(nor, i);
    const [d, c] = f(p);
    if (d) { p.addScaledVector(n, d); pos.setXYZ(i, p.x, p.y, p.z); }
    couleurs[i * 3] = c.r; couleurs[i * 3 + 1] = c.g; couleurs[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(couleurs, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/** Tige courbe et effilée, ancrée à sa base (0,0,0) et dirigée vers le haut. */
function tige(longueur: number, r0: number, r1: number, courbure: number, couleur: string, bout?: string) {
  const courbe = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(courbure * longueur * 0.3, longueur * 0.55, 0),
    new THREE.Vector3(courbure * longueur, longueur, 0)
  );
  const g = new THREE.TubeGeometry(courbe, 12, 1, 8, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = uv.getX(i);
    const c = courbe.getPointAt(t);
    p.fromBufferAttribute(pos, i).sub(c).multiplyScalar(r0 + (r1 - r0) * t).add(c);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  g.computeVertexNormals();
  const groupe = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.75 });
  groupe.add(new THREE.Mesh(g, mat));
  // bout coupé, plus clair (bois frais)
  const fin = new THREE.Mesh(new THREE.CircleGeometry(r1 * 1.02, 10), new THREE.MeshStandardMaterial({ color: bout || "#c9b48a", roughness: 0.9 }));
  fin.position.copy(courbe.getPointAt(1));
  fin.lookAt(courbe.getPointAt(1).add(courbe.getTangentAt(1)));
  groupe.add(fin);
  return groupe;
}

/** Feuille cartoon détaillée : contour en goutte, nervure centrale plus claire, limbe courbé. */
function feuilleDetaillee(longueur: number, largeur: number, couleur: string, courbure = 0.25, pointe = 0.15) {
  const forme = new THREE.Shape();
  forme.moveTo(0, 0);
  forme.bezierCurveTo(largeur * 0.7, longueur * 0.15, largeur * 0.6, longueur * (0.85 - pointe), 0, longueur);
  forme.bezierCurveTo(-largeur * 0.6, longueur * (0.85 - pointe), -largeur * 0.7, longueur * 0.15, 0, 0);
  const g = new THREE.ShapeGeometry(forme, 14);
  // subdivision légère pour pouvoir courber la feuille
  const pos = g.attributes.position as THREE.BufferAttribute;
  const base = new THREE.Color(couleur), clair = base.clone().offsetHSL(0, -0.05, 0.12), fonce = base.clone().offsetHSL(0, 0.02, -0.1);
  const couleurs = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const t = y / longueur;
    // courbure le long de la feuille et légère gouttière au centre
    const z = courbure * longueur * t * t + Math.abs(x) * 0.35;
    pos.setZ(i, z);
    const nervure = Math.max(0, 1 - Math.abs(x) / (largeur * 0.08));
    const bord = Math.min(1, Math.abs(x) / (largeur * 0.5));
    const c = base.clone().lerp(fonce, bord * 0.6).lerp(clair, nervure * 0.8);
    couleurs.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(couleurs, 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, side: THREE.DoubleSide }));
}

/** Calice en étoile (sépales) posé au sommet ou à la base d'un fruit. */
function calice(n: number, longueur: number, largeur: number, couleur: string, inclinaison: number, y: number, versBas = false) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const f = feuilleDetaillee(longueur, largeur, couleur, 0.1, 0.25);
    const pivot = new THREE.Group();
    pivot.rotation.y = (i / n) * Math.PI * 2;
    f.rotation.x = versBas ? Math.PI / 2 + inclinaison : -(Math.PI / 2 - inclinaison);
    pivot.add(f);
    g.add(pivot);
  }
  g.position.y = y;
  return g;
}

function anneau(rayon: number, epaisseur: number, couleur: string, y: number) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(rayon, epaisseur, 6, 14), new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.85 }));
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}

// ---------------------------------------------------------------------------
// Les fruits
// ---------------------------------------------------------------------------

function modeleLetchi(or = false): Modele {
  // Petite sphère un peu en cœur, enveloppe écailleuse rose à rouge
  const h = 1.52;
  const g = revolution((t) => {
    const coeur = t < 0.35 ? Math.pow(t / 0.35, 0.55) : 1;
    return 0.75 * Math.pow(Math.sin(Math.PI * (0.02 + 0.96 * t)), 0.6) * (0.82 + 0.18 * coeur) * (1 - 0.05 * t);
  }, h, 80, 112);
  const rouges = [C("#d01c3c"), C("#e02a4a"), C("#bc1834"), C("#ea3a50"), C("#d42242")];
  const sillonC = C("#5a0a1a"), pointe = C("#f49aa0"), brun = C("#8e4422"), vertJ = C("#9a7a3a");
  const dores = [C("#e8b52c"), C("#f6cc45"), C("#d9a020")];
  modeler(g, (p) => {
    const w = worley(p.x * 10.5, p.y * 10.5, p.z * 10.5);
    const ecaille = Math.min(1, (w.f2 - w.f1) * 6);                    // 0 sur le bord de l'écaille, 1 au centre
    const plat = 0.026 * Math.pow(ecaille, 0.55);                         // écaille plate et légèrement bombée
    const pic = w.f1 < 0.06 ? (0.06 - w.f1) * 0.18 : 0;                  // minuscule pointe centrale
    const d = plat + pic;
    const sillon = 1 - Math.min(1, ecaille * 2.2);
    if (or) {
      const c = melange(dores[Math.floor(w.id * 3)], C("#fff0a0"), lisse(0.08, 0.0, w.f1) * 0.7);
      return [d, melange(c, C("#a87410"), sillon * 0.6)];
    }
    let c = rouges[Math.floor(w.id * 5)].clone();
    const haut = lisse(0.6, 1, hauteurRel(p, h));
    c = melange(c, brun, haut * 0.35 + (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.55) * 0.4);
    c = melange(c, vertJ, haut * lisse(0.7, 0.9, fbm(p.x * 3 + 7, p.y * 3, p.z * 3)) * 0.35);
    c = melange(c, pointe, lisse(0.07, 0.0, w.f1) * 0.45);
    return [d, melange(c, sillonC, sillon * 0.9)];
  });
  const materiau = or
    ? peauPhysique({ metalness: 0.8, roughness: 0.25, emissive: C("#ff9a10"), emissiveIntensity: 0.22, clearcoat: 1 })
    : peauPhysique({ roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.6 });
  return {
    corps: g, materiau,
    accessoires: () => {
      const t = tige(0.5, 0.04, 0.028, 0.5, or ? "#b88412" : "#6b4a24");
      t.position.y = h / 2 - 0.05;
      return [t];
    },
  };
}

function modeleMangue(): Modele {
  // Mangue José : ovale allongée, peau verte et jaune teintée d'orange, petit bec
  const h = 2.25;
  const g = revolution((t) => 0.72 * Math.pow(Math.sin(Math.PI * t), 0.6) * (1 + 0.12 * t), h, 80, 104);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), x = pos.getX(i), z = pos.getZ(i);
    const t = y / h + 0.5;
    let nx = x + 0.18 * Math.sin(Math.PI * t);
    if (x > 0) nx += 0.14 * Math.exp(-Math.pow((t - 0.2) / 0.09, 2));
    pos.setXYZ(i, nx, y, z * 0.86);
  }
  const vert = C("#4a7a22"), vertJ = C("#8fa82e"), jaune = C("#dcb02a"), orange = C("#e48a24"), rose = C("#c8502c"), lenticelle = C("#efdc9a");
  modeler(g, (p) => {
    const t = hauteurRel(p, h) + (fbm(p.x * 1.4, p.y * 1.4, p.z * 1.4) - 0.5) * 0.5;
    const soleil = lisse(0.0, 1.0, p.x * 0.7 + (t - 0.45));
    let c = melange(vert, vertJ, lisse(0.0, 0.4, t));
    c = melange(c, jaune, lisse(0.35, 0.7, t));
    c = melange(c, orange, soleil * 0.8);
    c = melange(c, rose, lisse(0.55, 1, soleil) * lisse(0.4, 0.9, t) * 0.8);
    c = melange(c, orange, lisse(0.45, 0.8, t) * 0.55);
    c = melange(c, rose, lisse(0.7, 0.95, t) * 0.5);
    const w = worley(p.x * 18, p.y * 18, p.z * 18);
    c = melange(c, lenticelle, lisse(0.055, 0.02, w.f1) * 0.5);
    return [0.003 * bruit3(p.x * 24, p.y * 24, p.z * 24), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.42, clearcoat: 0.22, clearcoatRoughness: 0.5 }),
    accessoires: () => {
      const t = tige(0.3, 0.055, 0.04, 0.25, "#5a4a26");
      t.position.set(0.16, h / 2 - 0.05, 0);
      return [t];
    },
  };
}

function modeleAnanas(): Modele {
  // Ananas Victoria : petit, svelte (hauteur ≈ 1,3 × diamètre), jaune d'or, couronne épineuse
  const h = 1.8;
  const g = revolution((t) => 0.68 * Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * t)), 0.38) * (1 - 0.1 * t), h, 96, 128);
  const COL = 13;                     // yeux par tour
  const DY = 0.2;                     // hauteur d'une rangée
  const or = C("#d99a2a"), orange = C("#cf741c"), vertB = C("#76862c"), bord = C("#38240c"), bractee = C("#b98a34"), epine = C("#2e1a08");
  modeler(g, (p) => {
    const a = (angle(p) + Math.PI) / (Math.PI * 2);   // 0..1 autour
    // grille hexagonale décalée d'une demi-case à chaque rangée (spirale des yeux)
    let best = 9, bu = 0, bv = 0, br = 0;
    const r0 = Math.round(p.y / DY);
    for (let r = r0 - 1; r <= r0 + 1; r++) {
      const dec = (r & 1) * 0.5;
      const cu = Math.round(a * COL - dec) + dec;
      for (let k = -1; k <= 1; k++) {
        const u = (cu + k) / COL;
        let du = (a - u) * COL; du -= Math.round(du / COL) * COL;
        const dv = (p.y - r * DY) / DY;
        const dist = Math.hypot(du * 0.95, dv * 1.0);
        if (dist < best) { best = dist; bu = du; bv = dv; br = r; }
      }
    }
    const hexa = Math.max(Math.abs(bu) * 1.0 + Math.abs(bv) * 0.5, Math.abs(bv) * 1.0);
    const interieur = Math.max(0, 1 - hexa * 1.95);                    // 1 au centre de l'œil, 0 au bord
    const t = hauteurRel(p, h);
    let c = melange(or, orange, (((br * 7) % 5) / 5) * 0.6 + lisse(0.5, 1, t) * 0.3 + (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.5) * 0.5);
    c = melange(c, vertB, lisse(0.4, 0.0, t) * 0.7 + lisse(0.0, -0.2, bv) * 0.25);
    c = melange(c, bractee, lisse(-0.15, -0.45, bv) * interieur * 0.8);   // lèvre de la bractée en bas de l'œil
    c = melange(c, bord, lisse(0.32, 0.0, interieur));
    c = melange(c, epine, lisse(0.1, 0.03, best));
    const d = 0.03 * Math.pow(interieur, 0.45) - 0.018 * lisse(0.25, 0.0, interieur) + (best < 0.08 ? 0.01 : 0);
    return [d, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.6, clearcoat: 0.12 }),
    accessoires: () => {
      const r = graine(11);
      const couronne = new THREE.Group();
      couronne.position.y = h / 2 - 0.05;
      for (let anneauI = 0; anneauI < 4; anneauI++) {
        const nb = [9, 9, 8, 6][anneauI];
        for (let i = 0; i < nb; i++) {
          const L = [1.3, 1.15, 0.9, 0.6][anneauI] * (0.85 + r() * 0.3);
          const f = feuilleDetaillee(L, 0.13, ["#3e7650", "#478254", "#55905a", "#62a060"][anneauI], 0.28 + anneauI * 0.08, 0.5);
          // petites épines sur le bord des feuilles
          for (let e = 0; e < 5; e++) {
            const ep = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.05, 4), new THREE.MeshStandardMaterial({ color: "#2f5a3a" }));
            const ty = L * (0.2 + e * 0.13);
            ep.position.set((e % 2 ? 1 : -1) * 0.045 * (1 - ty / L), ty, 0.28 * L * (ty / L) * (ty / L));
            ep.rotation.z = (e % 2 ? -1 : 1) * 1.2;
            f.add(ep);
          }
          const pivot = new THREE.Group();
          pivot.rotation.y = (i / nb) * Math.PI * 2 + anneauI * 0.35 + r() * 0.2;
          f.rotation.x = -(0.12 + (3 - anneauI) * 0.22 + r() * 0.1);
          pivot.add(f);
          couronne.add(pivot);
        }
      }
      return [couronne];
    },
  };
}

function modeleBanane(): Modele {
  const g = tubeCourbe(
    [new THREE.Vector3(-1.45, -0.12, 0), new THREE.Vector3(-0.8, 0.32, 0), new THREE.Vector3(0.05, 0.44, 0), new THREE.Vector3(0.85, 0.2, 0), new THREE.Vector3(1.4, -0.36, 0)],
    0.36,
    (t) => {
      const corps = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.3);
      return t < 0.12 ? corps * (0.45 + t * 4.5) : corps;           // le cou vers la queue
    },
    0, 96, 40
  );
  // cinq arêtes bien marquées
  const pos = g.attributes.position as THREE.BufferAttribute;
  const p = new THREE.Vector3();
  g.computeBoundingBox();
  const jaune = C("#e9c22e"), vertJ = C("#a9b636"), brun = C("#3a2814"), sucre = C("#6e4a1e"), arete = C("#d6ae26");
  // repère approximatif : angle autour de l'axe local de la banane (axe x, courbé)
  modeler(g, (q) => {
    p.copy(q);
    const a = Math.atan2(p.z, p.y - (0.44 - 0.35 * p.x * p.x));
    const crete = Math.pow(0.5 + 0.5 * Math.cos(5 * a), 6);
    const bout = lisse(1.1, 1.42, Math.abs(p.x));
    const w = worley(p.x * 9, p.y * 9, p.z * 9);
    let c = melange(jaune, vertJ, lisse(-0.4, -1.3, p.x) * 0.7);
    c = melange(c, arete, crete * 0.3);
    c = melange(c, sucre, lisse(0.07, 0.02, w.f1) * 0.85);           // taches de sucre
    c = melange(c, brun, bout);
    return [0.025 * crete - 0.012, c];
  });
  void pos;
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.45, clearcoat: 0.25 }),
    accessoires: () => {
      const t = tige(0.35, 0.09, 0.08, -0.15, "#5c6a2a", "#d8cfa0");
      t.rotation.z = Math.PI / 2 + 0.55;
      t.position.set(-1.45, -0.12, 0);
      return [t];
    },
  };
}

function modelePapaye(): Modele {
  const h = 2.2;
  const g = revolution((t) => 0.58 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 + 0.42 * (1 - t)), h, 72, 96);
  const vert = C("#3c7a2a"), vertC = C("#6a9a34"), jaune = C("#f2b434"), orange = C("#ee7d22");
  modeler(g, (p) => {
    const a = angle(p);
    const cote = Math.cos(5 * a);
    const t = hauteurRel(p, h);
    const stries = fbm(a * 3, p.y * 0.9, 0.5, 3);
    let c = melange(vert, vertC, stries);
    c = melange(c, jaune, lisse(0.65, 0.25, t + (stries - 0.5) * 0.6));
    c = melange(c, orange, lisse(0.4, 0.05, t + (stries - 0.5) * 0.4) * 0.8);
    c = melange(c, C("#f7e3a0"), lisse(0.94, 0.98, bruit3(p.x * 20, p.y * 20, p.z * 20)) * 0.5);
    return [0.03 * cote, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.38, clearcoat: 0.35 }),
    accessoires: () => {
      const t = tige(0.2, 0.08, 0.07, 0, "#3d5a22");
      t.position.y = h / 2 - 0.04;
      return [t, anneau(0.11, 0.03, "#4a3a1c", h / 2 - 0.03)];
    },
  };
}

function modeleGrenadine(): Modele {
  const h = 1.42;
  const g = revolution((t) => 0.7 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 - 0.04 * t), h, 64, 96);
  const violet = C("#3a1033"), prune = C("#6a2456"), rougeatre = C("#7e2a4a"), point = C("#d9b4cf");
  modeler(g, (p) => {
    const f = fbm(p.x * 3, p.y * 3, p.z * 3);
    let c = melange(violet, prune, f * 1.5 - 0.2);
    c = melange(c, rougeatre, lisse(0.6, 0.85, fbm(p.x * 1.5 + 4, p.y * 1.5, p.z * 1.5)) * 0.5);
    const w = worley(p.x * 14, p.y * 14, p.z * 14);
    c = melange(c, point, lisse(0.05, 0.015, w.f1) * 0.8);          // petites taches claires
    return [0.03 * (f - 0.5) - 0.006 * lisse(0.05, 0.015, w.f1), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.3 }),
    accessoires: () => {
      const t = tige(0.35, 0.035, 0.03, 0.5, "#4f6a2a");
      t.position.y = h / 2 - 0.03;
      return [t, anneau(0.07, 0.025, "#4f6a2a", h / 2 - 0.02)];
    },
  };
}

function modelePasteque(): Modele {
  const h = 2.7;
  const g = revolution((t) => 1.24 * Math.pow(Math.sin(Math.PI * t), 0.72), h, 72, 112);
  const fonce = C("#173f17"), clair = C("#7aad50"), moucheture = C("#a8cf78"), tacheSol = C("#d9c86a");
  modeler(g, (p) => {
    const a = angle(p);
    const n = fbm(p.x * 4, p.y * 4, p.z * 4, 4);
    const s = Math.sin(a * 8 + 0.6 * Math.sin(p.y * 2.4) + (n - 0.5) * 3.5);   // bandes aux bords déchiquetés
    let c = melange(clair, moucheture, lisse(0.55, 0.8, fbm(p.x * 6, p.y * 6, p.z * 6)) * 0.6);
    c = melange(c, fonce, lisse(0.0, 0.25, s));
    c = melange(c, tacheSol, lisse(0.6, 0.95, -p.z / 1.24 - p.y * 0.1) * 0.75); // tache où elle reposait au sol
    return [0.008 * bruit3(p.x * 12, p.y * 12, p.z * 12), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.25 }),
    accessoires: () => {
      const t = tige(0.3, 0.05, 0.035, 0.8, "#5a6a2a");
      t.position.y = h / 2 - 0.03;
      return [t];
    },
  };
}

function modeleCitron(): Modele {
  const h = 1.22;
  const g = revolution((t) => 0.52 * Math.pow(Math.sin(Math.PI * t), 0.75) * (t > 0.9 ? 1 - (t - 0.9) * 2.8 : 1) * (t < 0.08 ? 0.75 + t * 3 : 1), h, 96, 128);
  const vert = C("#4f9424"), clair = C("#9ccb46"), jaunatre = C("#c6d655");
  modeler(g, (p) => {
    const w = worley(p.x * 34, p.y * 34, p.z * 34);
    const pore = lisse(0.25, 0.0, w.f1);
    let c = melange(vert, clair, fbm(p.x * 3, p.y * 3, p.z * 3) * 1.3 - 0.15);
    c = melange(c, jaunatre, lisse(0.7, 0.9, fbm(p.x * 2 + 5, p.y * 2, p.z * 2)) * 0.4);
    c = melange(c, C("#3d7a1c"), pore * 0.3);
    return [-0.006 * pore, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.3 }),
    accessoires: () => [anneau(0.05, 0.02, "#6a7a2a", -h / 2 + 0.06), anneau(0.04, 0.02, "#7a8a3a", h / 2 - 0.02)],
  };
}

function modeleMandarine(): Modele {
  const h = 1.22;
  const g = revolution((t) => 0.74 * Math.pow(Math.sin(Math.PI * t), 0.42) * (1 - 0.03 * t), h, 80, 128);
  const orange = C("#e85a00"), fonce = C("#c04400"), clair = C("#f87c10");
  modeler(g, (p) => {
    const w = worley(p.x * 30, p.y * 30, p.z * 30);
    const pore = lisse(0.25, 0.0, w.f1);
    const t = hauteurRel(p, h);
    let c = melange(orange, clair, fbm(p.x * 3, p.y * 3, p.z * 3) * 1.2 - 0.2);
    c = melange(c, fonce, lisse(0.7, 1, t) * 0.4 + pore * 0.4);
    const nombril = lisse(0.08, 0.0, t) * 0.04;                        // petit creux en bas
    return [-0.013 * pore - nombril, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.4, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
    accessoires: () => {
      const t = tige(0.14, 0.03, 0.025, 0.3, "#456a28");
      t.position.y = h / 2 - 0.02;
      const etoile = calice(5, 0.12, 0.08, "#4a7a2a", 0.15, h / 2 - 0.02);
      const f = feuilleDetaillee(0.62, 0.3, "#3a7a2e", 0.3, 0.1);
      f.position.set(0.02, h / 2 + 0.08, 0);
      f.rotation.set(-1.1, 0.3, -0.5);
      return [t, etoile, f];
    },
  };
}

function modeleCoco(): Modele {
  const h = 1.9;
  const g = revolution((t) => 0.95 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 - 0.08 * t), h, 72, 112);
  moduler(g, (a) => 1 + 0.03 * Math.pow(0.5 + 0.5 * Math.cos(3 * a), 4));   // les trois arêtes
  const brun = C("#4e301b"), clair = C("#94673c"), fibre = C("#b48a58"), oeilC = C("#1e120a");
  const yeux = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => new THREE.Vector3(Math.cos(a + 0.5) * 0.24, h / 2 - 0.16, Math.sin(a + 0.5) * 0.24));
  modeler(g, (p) => {
    const a = angle(p);
    const fib = fbm(a * 26, p.y * 1.3, 0.3, 3);
    let c = melange(brun, clair, fib * 1.1 - 0.15 + (fbm(p.x * 3, p.y * 3, p.z * 3) - 0.5) * 0.6);
    c = melange(c, fibre, lisse(0.62, 0.8, fbm(a * 60 + p.y * 8, p.y * 2.5, 2, 2)) * 0.55);
    let d = 0.04 * fib + 0.015 * fbm(a * 60, p.y * 0.6, 2, 2);
    for (const o of yeux) {
      const dist = p.distanceTo(o);
      if (dist < 0.12) { c = melange(c, oeilC, lisse(0.12, 0.05, dist)); d -= lisse(0.12, 0.03, dist) * 0.04; }
    }
    return [d, c];
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.9 }), accessoires: () => [] };
}

function modeleBringelle(): Modele {
  const h = 2.3;
  const g = revolution((t) => 0.56 * Math.pow(Math.sin(Math.PI * t), 0.48) * (0.58 + 0.44 * (1 - t)), h, 72, 96);
  const violet = C("#25082f"), reflet = C("#5a2472"), vert = C("#4d7a2a");
  modeler(g, (p) => {
    const t = hauteurRel(p, h);
    let c = melange(violet, reflet, fbm(p.x * 2, p.y * 2, p.z * 2) * 0.9 - 0.25);
    c = melange(c, C("#6a5a3a"), lisse(0.9, 0.97, t) * 0.4);
    void vert;
    return [0.003 * bruit3(p.x * 18, p.y * 18, p.z * 18), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06 }),
    accessoires: () => {
      const t = tige(0.5, 0.09, 0.07, 0.25, "#557a2c", "#cfdca0");
      t.position.y = h / 2 - 0.05;
      const c = calice(6, 0.62, 0.28, "#4e7c2c", 0.55, h / 2 - 0.02, true);
      return [t, c];
    },
  };
}

function modeleGoyavier(): Modele {
  // Goyavier (goyave-fraise) : petite baie ronde rouge violacé, brillante, couronne de sépales en bas
  const h = 0.84;
  const g = revolution((t) => 0.44 * Math.pow(Math.sin(Math.PI * t), 0.5) * (1 - 0.05 * t), h, 56, 80);
  const rouge = C("#8a1430"), violet = C("#5e0f2e"), clair = C("#c4304c");
  modeler(g, (p) => {
    let c = melange(rouge, clair, fbm(p.x * 5, p.y * 5, p.z * 5) * 1.2 - 0.3);
    c = melange(c, violet, lisse(0.45, 0.0, hauteurRel(p, h)) * 0.55 + (fbm(p.x * 3 + 2, p.y * 3, p.z * 3) - 0.5) * 0.4);
    const w = worley(p.x * 22, p.y * 22, p.z * 22);
    c = melange(c, C("#e07080"), lisse(0.04, 0.012, w.f1) * 0.5);
    return [0.004 * bruit3(p.x * 25, p.y * 25, p.z * 25), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.22, clearcoat: 0.85, clearcoatRoughness: 0.2 }),
    accessoires: () => [calice(5, 0.1, 0.06, "#3a1a12", 0.2, -h / 2 + 0.02, true), anneau(0.05, 0.02, "#3a1a12", -h / 2 + 0.02)],
  };
}

function modelePiment(): Modele {
  const g = tubeCourbe(
    [new THREE.Vector3(-0.68, 0.12, 0), new THREE.Vector3(-0.2, 0.06, 0.02), new THREE.Vector3(0.3, -0.12, 0), new THREE.Vector3(0.7, -0.45, 0)],
    0.21,
    (t) => (t < 0.05 ? 0.5 + t * 10 : Math.pow(1 - t, 0.5)),
    3, 72, 20
  );
  const rouge = C("#cf1018"), sombre = C("#860810"), clair = C("#f0383a");
  modeler(g, (p) => {
    const f = fbm(p.x * 4, p.y * 4, p.z * 4);
    const ride = fbm(p.x * 1.5, p.y * 9, p.z * 9, 2);
    return [0.012 * (ride - 0.5), melange(melange(rouge, sombre, f - 0.3), clair, lisse(0.7, 0.9, ride) * 0.4)];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.04 }),
    accessoires: () => {
      const coupe = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: "#3f6f25", roughness: 0.6, side: THREE.DoubleSide }));
      coupe.rotation.z = Math.PI / 2 + 0.15;
      coupe.position.set(-0.7, 0.12, 0);
      const t = tige(0.32, 0.04, 0.03, 0.6, "#3f6f25");
      t.rotation.z = Math.PI / 2;
      t.position.set(-0.8, 0.13, 0);
      return [coupe, t];
    },
  };
}

function modeleTiJacque(): Modele {
  // Jeune jacque : gros ovale vert couvert de petites pointes hexagonales serrées
  const h = 2.6;
  const g = revolution((t) => 0.86 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 + 0.05 * Math.sin(Math.PI * t * 2)), h, 96, 128);
  const vert = C("#5a8628"), vertC = C("#7fa232"), pointe = C("#c8c85a"), creux = C("#355a16");
  modeler(g, (p) => {
    const w = worley(p.x * 15, p.y * 15, p.z * 15);
    const centre = Math.min(1, (w.f2 - w.f1) * 5);
    const pyramide = 0.045 * Math.pow(centre, 1.4);                     // pointe en pyramide
    let c = melange(vert, vertC, fbm(p.x * 1.4, p.y * 1.4, p.z * 1.4) * 1.3 - 0.25);
    c = melange(c, pointe, lisse(0.75, 1, centre) * 0.45);
    c = melange(c, creux, lisse(0.35, 0.0, centre) * 0.7);
    return [pyramide, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.7 }),
    accessoires: () => {
      const t = tige(0.55, 0.12, 0.1, 0.15, "#5a4a22");
      t.position.y = h / 2 - 0.05;
      return [t];
    },
  };
}

function modeleFriyapin(): Modele {
  const h = 1.95;
  const g = revolution((t) => 0.95 * Math.pow(Math.sin(Math.PI * t), 0.66), h, 72, 112);
  const vert = C("#7aa53a"), fonce = C("#46701f"), clair = C("#a3c45a"), latex = C("#eef0d8");
  modeler(g, (p) => {
    const w = worley(p.x * 6.2, p.y * 6.2, p.z * 6.2);
    const bord = lisse(0.09, 0.0, w.f2 - w.f1);                       // contour des facettes
    const centre = lisse(0.08, 0.0, w.f1);                             // petit point au centre
    let c = melange(vert, clair, w.id * 0.6 + (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.5) * 0.5);
    c = melange(c, fonce, bord * 0.8 + centre * 0.6);
    c = melange(c, latex, lisse(0.95, 0.985, bruit3(p.x * 16, p.y * 16, p.z * 16)) * 0.8);
    return [-0.035 * bord + 0.01 * (1 - w.f1), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.52, clearcoat: 0.2 }),
    accessoires: () => {
      const t = tige(0.4, 0.06, 0.05, 0.3, "#5d4a26");
      t.position.y = h / 2 - 0.04;
      return [t];
    },
  };
}

function modeleGoyave(): Modele {
  const h = 1.3;
  const g = revolution((t) => 0.64 * Math.pow(Math.sin(Math.PI * t), 0.7) * (1 - 0.18 * t), h, 64, 96);
  const vert = C("#8aa632"), jaune = C("#cfc248"), rose = C("#d07a4a"), point = C("#6a7a24");
  modeler(g, (p) => {
    const bosse = fbm(p.x * 2.2, p.y * 2.2, p.z * 2.2);
    let c = melange(vert, jaune, fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5) * 1.3 - 0.15);
    c = melange(c, rose, lisse(0.62, 0.85, fbm(p.x * 1.8 + 3, p.y * 1.8, p.z * 1.8)) * 0.45);
    const w = worley(p.x * 18, p.y * 18, p.z * 18);
    c = melange(c, point, lisse(0.05, 0.015, w.f1) * 0.6);
    return [0.04 * (bosse - 0.5), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.42, clearcoat: 0.3 }),
    accessoires: () => {
      const t = tige(0.18, 0.035, 0.03, 0.3, "#4f5a26");
      t.position.y = h / 2 - 0.03;
      return [t, calice(5, 0.14, 0.08, "#3e2e16", 0.25, -h / 2 + 0.03, true), anneau(0.08, 0.025, "#3e2e16", -h / 2 + 0.03)];
    },
  };
}

function modeleVanille(): Modele {
  const g = tubeCourbe(
    [new THREE.Vector3(-1.38, 0.18, 0), new THREE.Vector3(-0.62, -0.04, 0.04), new THREE.Vector3(0.18, -0.08, -0.03), new THREE.Vector3(0.92, 0.05, 0), new THREE.Vector3(1.36, 0.32, 0)],
    0.13,
    (t) => (t < 0.03 ? 0.35 + t * 20 : Math.pow(Math.sin(Math.PI * Math.min(1, t)), 0.16)),
    0, 96, 24
  );
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, pos.getZ(i) * 0.55);   // gousse aplatie
  const brun = C("#3a2213"), noir = C("#1a0e07"), reflet = C("#7a4c28");
  modeler(g, (p) => {
    const ride = fbm(p.x * 2, p.y * 26, p.z * 26, 3);                     // rides dans la longueur
    let c = melange(brun, noir, ride * 1.4 - 0.35);
    c = melange(c, reflet, lisse(0.72, 0.9, ride) * 0.5);
    return [0.018 * (ride - 0.5), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.3 }),
    accessoires: () => {
      const crochet = tige(0.16, 0.035, 0.02, 0.9, "#2a1a0e", "#5a3a20");
      crochet.rotation.z = Math.PI / 2 + 0.3;
      crochet.position.set(-1.38, 0.18, 0);
      return [crochet];
    },
  };
}

function modeleCarambole(): Modele {
  const h = 1.9;
  const g = revolution((t) => 0.84 * Math.pow(Math.sin(Math.PI * t), 0.5), h, 72, 120);
  moduler(g, (a) => 0.46 + 0.54 * Math.pow(0.5 + 0.5 * Math.cos(5 * a), 2.2));   // cinq côtes : en coupe, une étoile
  const jaune = C("#e8bb2a"), clair = C("#f6d84e"), vert = C("#a2ab34"), arete = C("#8a6418");
  modeler(g, (p) => {
    const a = angle(p);
    const cote = Math.pow(0.5 + 0.5 * Math.cos(5 * a), 14);
    const t = hauteurRel(p, h);
    let c = melange(jaune, clair, fbm(p.x * 3, p.y * 3, p.z * 3) * 1.2 - 0.2);
    c = melange(c, vert, lisse(0.3, 0.0, t) * 0.55 + lisse(0.75, 1, t) * 0.3);
    c = melange(c, arete, cote * 0.7);                                         // arêtes brunies
    return [0, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.2, clearcoat: 0.85, clearcoatRoughness: 0.18 }),
    accessoires: () => {
      const t = tige(0.18, 0.03, 0.025, 0.2, "#6a5a2a");
      t.position.y = h / 2 - 0.03;
      return [t];
    },
  };
}

function modeleChouchou(): Modele {
  const h = 1.55;
  const g = revolution((t) => 0.6 * Math.pow(Math.sin(Math.PI * t), 0.62) * (1 + 0.34 * (1 - t)), h, 72, 112);
  const clair = C("#76aa36"), vert = C("#467a20"), crete = C("#94c45a");
  modeler(g, (p) => {
    const a = angle(p);
    const t = hauteurRel(p, h);
    const sillon = Math.pow(0.5 + 0.5 * Math.cos(5 * a + 0.3), 9);
    const bouche = lisse(0.22, 0.0, t);                                       // fronces en bas
    const fronce = Math.sin(a * 14) * bouche * 0.03;
    const w = worley(p.x * 9, p.y * 9, p.z * 9);
    const epine = lisse(0.05, 0.0, w.f1) * 0.03;                              // rares petites épines
    let c = melange(clair, vert, fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5) * 1.2 - 0.15);
    c = melange(c, C("#4f7a26"), sillon * 0.45);
    c = melange(c, crete, (1 - sillon) * lisse(0.4, 0.8, t) * 0.3);
    return [-0.075 * sillon * (0.35 + bouche) + fronce + epine, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.38, clearcoat: 0.35 }),
    accessoires: () => {
      const t = tige(0.3, 0.05, 0.04, 0.5, "#5d7d33");
      t.position.y = h / 2 - 0.04;
      return [t];
    },
  };
}

function modeleBibasse(): Modele {
  const h = 1.0;
  const g = revolution((t) => 0.45 * Math.pow(Math.sin(Math.PI * t), 0.74) * (1 + 0.1 * (1 - t)), h, 56, 88);
  const orange = C("#e2861e"), jaune = C("#eeb238"), tache = C("#9a5818");
  modeler(g, (p) => {
    let c = melange(orange, jaune, fbm(p.x * 3, p.y * 3, p.z * 3) * 1.3 - 0.2);
    const w = worley(p.x * 12, p.y * 12, p.z * 12);
    c = melange(c, tache, lisse(0.06, 0.02, w.f1) * 0.5);
    return [0.004 * bruit3(p.x * 30, p.y * 30, p.z * 30), c];
  });
  return {
    corps: g,
    materiau: peauPhysique({ roughness: 0.55, sheen: 0.35, sheenRoughness: 0.7, sheenColor: C("#f0b060") }),   // léger duvet
    accessoires: () => {
      const t = tige(0.2, 0.03, 0.025, 0.4, "#5a4424");
      t.position.y = h / 2 - 0.02;
      return [t, calice(5, 0.09, 0.05, "#3a2a14", 0.1, -h / 2 + 0.02, true)];
    },
  };
}

function modeleLave(): Modele {
  // Scorie basaltique : bloc irrégulier, poreux (vacuoles), noir à brun rouille, magma dans les fissures
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.82, 30);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g = mergeVertices(g);
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const braise = new Float32Array(pos.count);
  const couleurs = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const noir = C("#141212"), gris = C("#3a3533"), rouille = C("#5e2c18"), cendre = C("#6a6260");
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i); n.fromBufferAttribute(nor, i);
    // forme anguleuse : bruit « en crêtes » + gros blocs
    const bloc = (fbm(p.x * 1.4, p.y * 1.4, p.z * 1.4) - 0.5) * 0.55;
    const crete = (1 - Math.abs(bruit3(p.x * 3, p.y * 3, p.z * 3) * 2 - 1)) * 0.08;
    // vacuoles : petits trous ronds
    const v = worley(p.x * 7, p.y * 7, p.z * 7);
    const trou = lisse(0.26, 0.06, v.f1);
    const v2 = worley(p.x * 16 + 5, p.y * 16, p.z * 16);
    const petitTrou = lisse(0.25, 0.05, v2.f1);
    // fissures où l'on voit le magma
    const fissure = 1 - lisse(0.006, 0.022, Math.abs(bruit3(p.x * 2.4, p.y * 2.4, p.z * 2.4) - 0.5));
    p.addScaledVector(n, bloc + crete - trou * 0.09 - petitTrou * 0.03 - fissure * 0.05);
    pos.setXYZ(i, p.x, p.y, p.z);
    braise[i] = Math.max(fissure, lisse(0.5, 1, trou) * 0.7);
    let c = melange(noir, gris, fbm(p.x * 5, p.y * 5, p.z * 5) * 1.4 - 0.3);
    c = melange(c, rouille, lisse(0.6, 0.85, fbm(p.x * 2.2 + 9, p.y * 2.2, p.z * 2.2)) * 0.7);
    c = melange(c, cendre, crete * 4 * lisse(0.6, 0.8, fbm(p.x * 8, p.y * 8, p.z * 8)) * 0.5);
    c = melange(c, noir, trou * 0.8 + petitTrou * 0.6);
    couleurs.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("braise", new THREE.BufferAttribute(braise, 1));
  g.setAttribute("color", new THREE.BufferAttribute(couleurs, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  const materiau = peauPhysique({ roughness: 0.95 });
  materiau.userData.pulsation = { value: 0 };
  materiau.onBeforeCompile = (shader) => {
    shader.uniforms.uPulse = materiau.userData.pulsation;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float braise;\nvarying float vBraise;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvBraise = braise;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vBraise;\nuniform float uPulse;")
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.3, 0.03) * pow(vBraise, 1.5) * (1.6 + 1.4 * uPulse);"
      );
  };
  return { corps: g, materiau, accessoires: () => [] };
}

// ---------------------------------------------------------------------------
// V4 : nouveaux fruits d'après les planches de référence de KWélafé
// ---------------------------------------------------------------------------

/** Bractée ou écaille en feuille, dégradé de couleur de la base à la pointe. */
function bractee(longueur: number, largeur: number, base: string, pointe: string, courbure = 0.5) {
  const f = feuilleDetaillee(longueur, largeur, base, courbure, 0.2);
  const pos = f.geometry.attributes.position as THREE.BufferAttribute;
  const col = f.geometry.attributes.color as THREE.BufferAttribute;
  const cp = C(pointe);
  for (let i = 0; i < pos.count; i++) {
    const t = lisse(0.45, 1, pos.getY(i) / longueur);
    const c = new THREE.Color(col.getX(i), col.getY(i), col.getZ(i)).lerp(cp, t);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  return f;
}

/** Pose un objet plaqué sur une surface de révolution, à l'angle a et à la hauteur y, incliné vers l'extérieur. */
function plaquer(o: THREE.Object3D, rayon: number, y: number, a: number, inclinaison: number) {
  o.rotation.y = Math.PI / 2;                 // le plan de la feuille devient tangent, la courbure part vers l'extérieur
  const penche = new THREE.Group();
  penche.add(o);
  penche.rotation.z = -inclinaison;
  penche.position.set(rayon, y, 0);
  const pivot = new THREE.Group();
  pivot.rotation.y = -a;
  pivot.add(penche);
  return pivot;
}

function modeleAvocat(): Modele {
  // Avocat vert lisse des jardins créoles : forme de poire, peau vert sombre finement grenue
  const h = 2.05;
  const prof = (t: number) => 0.66 * Math.pow(Math.sin(Math.PI * t), 0.5) * (1.06 - 0.46 * lisse(0.35, 1, t));
  const g = revolution(prof, h, 80, 104);
  const fonce = C("#2a4a16"), vert = C("#40681e"), clair = C("#6a8a2c"), point = C("#a8b860");
  modeler(g, (p) => {
    const f = fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5);
    let c = melange(fonce, vert, f * 1.4 - 0.2);
    c = melange(c, clair, lisse(0.62, 0.8, fbm(p.x * 1.2 + 3, p.y * 1.2, p.z * 1.2)) * 0.4);
    const w = worley(p.x * 26, p.y * 26, p.z * 26);
    c = melange(c, point, lisse(0.05, 0.015, w.f1) * 0.35);
    return [0.004 * bruit3(p.x * 30, p.y * 30, p.z * 30) - 0.003 * lisse(0.05, 0.015, w.f1), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.5 }),
    accessoires: () => {
      const t = tige(0.28, 0.05, 0.04, 0.3, "#5a5a28");
      t.position.y = h / 2 - 0.04;
      return [t];
    },
  };
}

function modelePitaya(): Modele {
  // Fruit du dragon : ovale rose fuchsia, grandes écailles roses à pointe verte
  const h = 1.95;
  const prof = (t: number) => 0.74 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 - 0.06 * t);
  const g = revolution(prof, h, 72, 104);
  const rose = C("#d81e6a"), clair = C("#f0508e"), fonce = C("#a8104e"), vert = C("#8aa83a");
  modeler(g, (p) => {
    const f = fbm(p.x * 2, p.y * 2, p.z * 2);
    let c = melange(fonce, rose, f * 1.4 - 0.1);
    c = melange(c, clair, lisse(0.6, 0.85, fbm(p.x * 3 + 5, p.y * 3, p.z * 3)) * 0.5);
    c = melange(c, vert, lisse(0.92, 1, hauteurRel(p, h)) * 0.6);
    return [0.02 * (f - 0.5), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    accessoires: () => {
      const r = graine(71), objets: THREE.Object3D[] = [];
      const N = 20;
      for (let i = 0; i < N; i++) {
        const t = 0.14 + 0.68 * (i / (N - 1));
        const a = i * 2.39996 + r() * 0.3;                // spirale dorée : écailles bien réparties
        const L = 0.36 + 0.12 * Math.sin(Math.PI * t);
        const b = bractee(L, L * 0.85, "#e0307a", "#9cc83a", 0.35);
        objets.push(plaquer(b, prof(t) * 0.97, -h / 2 + t * h, a, 0.1 + 0.18 * t));
      }
      for (let i = 0; i < 5; i++) {                       // petite couronne au sommet
        const b = bractee(0.32, 0.18, "#d8306e", "#8ab83a", 0.4);
        objets.push(plaquer(b, 0.08, h / 2 - 0.08, (i / 5) * Math.PI * 2, 0.5));
      }
      return objets;
    },
  };
}

function modeleCanne(): Modele {
  // Tronçon de canne à sucre : tige à nœuds, écorce violette et jaune, coupée net aux deux bouts
  const h = 2.5, R = 0.3;
  const g = revolution((t) => R * Math.min(1, Math.pow(Math.sin(Math.PI * t), 0.06)), h, 120, 48);
  const noeuds = [0.18, 0.5, 0.82];
  moduler(g, (_a, y) => {
    const t = y / h + 0.5;
    let f = 1;
    for (const n of noeuds) f += 0.09 * Math.exp(-Math.pow((t - n) / 0.018, 2)) - 0.04 * Math.exp(-Math.pow((t - n - 0.035) / 0.02, 2));
    return f;
  });
  const violet = C("#6a2a3a"), jaune = C("#c8a84a"), vert = C("#8a8a3a"), cire = C("#c8c0b0"), anneauC = C("#3a2418"), bout = C("#efe6c0");
  modeler(g, (p) => {
    const t = hauteurRel(p, h), a = angle(p);
    const stries = fbm(a * 30, p.y * 0.8, 1.3, 2);
    let c = melange(violet, jaune, lisse(0.45, 0.7, fbm(p.x * 1.5, p.y * 0.6, p.z * 1.5) + stries * 0.3));
    c = melange(c, vert, lisse(0.6, 0.8, fbm(p.x + 9, p.y * 0.5, p.z)) * 0.4);
    let d = 0.004 * stries;
    for (const n of noeuds) {
      const k = Math.abs(t - n);
      c = melange(c, anneauC, lisse(0.012, 0.002, k) * 0.85);
      c = melange(c, cire, lisse(0.05, 0.015, Math.abs(t - n - 0.04)) * 0.55);   // bande cireuse sous le nœud
    }
    const r = Math.hypot(p.x, p.z);
    if (t < 0.012 || t > 0.988) c = melange(bout, C("#d8cc98"), lisse(0, R, r) * 0.6);
    return [d, c];
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.35, clearcoat: 0.45, clearcoatRoughness: 0.35 }), accessoires: () => [] };
}

function modeleTamarin(): Modele {
  // Gousse de tamarin : courbe, bosselée par les graines, écorce cannelle mate et poudreuse
  const pts = [new THREE.Vector3(-1.05, -0.12, 0), new THREE.Vector3(-0.5, 0.1, 0), new THREE.Vector3(0.1, 0.16, 0), new THREE.Vector3(0.6, 0.05, 0), new THREE.Vector3(1.05, -0.2, 0)];
  const g = tubeCourbe(pts, 0.24, (t) => Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * t)), 0.35) * (0.78 + 0.22 * Math.abs(Math.sin(t * Math.PI * 4.5))), 0, 96, 24);
  g.scale(1, 1, 0.75);
  const cannelle = C("#9a6a3c"), clair = C("#c49464"), fonce = C("#5e3c1e");
  modeler(g, (p) => {
    const f = fbm(p.x * 6, p.y * 6, p.z * 6);
    let c = melange(fonce, cannelle, f * 1.6 - 0.1);
    c = melange(c, clair, lisse(0.55, 0.75, fbm(p.x * 12 + 2, p.y * 12, p.z * 12)) * 0.6);
    return [0.012 * (f - 0.5), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.95 }),
    accessoires: () => {
      const t = tige(0.25, 0.03, 0.025, 0.4, "#5a3a1e");
      t.rotation.z = Math.PI / 2 + 0.3;
      t.position.set(-1.0, -0.12, 0);
      return [t];
    },
  };
}

function modeleLongani(): Modele {
  // Longani (longane) : petite boule beige-brun, peau fine légèrement grumeleuse
  const h = 0.92;
  const g = revolution((t) => 0.47 * Math.pow(Math.sin(Math.PI * t), 0.55), h, 56, 80);
  const beige = C("#b8884a"), clair = C("#d4a868"), brun = C("#7e5428");
  modeler(g, (p) => {
    const f = fbm(p.x * 6, p.y * 6, p.z * 6);
    let c = melange(brun, beige, f * 1.5);
    c = melange(c, clair, lisse(0.6, 0.8, fbm(p.x * 14, p.y * 14, p.z * 14)) * 0.5);
    return [0.008 * bruit3(p.x * 40, p.y * 40, p.z * 40), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.75 }),
    accessoires: () => {
      const t = tige(0.3, 0.025, 0.02, 0.4, "#6a5030");
      t.position.y = h / 2 - 0.02;
      return [t];
    },
  };
}

function modeleJamalac(): Modele {
  // Jamalac : cloche rouge vif et très brillante, base large creusée de quatre lobes
  const h = 1.45;
  const g = revolution((t) => 0.7 * Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * t)), 0.42) * (1.05 - 0.5 * t), h, 72, 104);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.hypot(x, z), t = y / h + 0.5;
    const creux = t < 0.12 ? 0.22 * (1 - r / 0.7) * lisse(0.12, 0.0, t) : 0;     // base creusée
    const lobe = 1 + 0.07 * Math.cos(4 * Math.atan2(z, x)) * lisse(0.45, 0.0, t);
    pos.setXYZ(i, x * lobe, y + creux, z * lobe);
  }
  const rouge = C("#d8142a"), clair = C("#f0384a"), fonce = C("#9a0c1e"), creme = C("#f6d0b0");
  modeler(g, (p) => {
    const t = hauteurRel(p, h);
    let c = melange(fonce, rouge, fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5) * 1.5);
    c = melange(c, clair, lisse(0.6, 0.85, fbm(p.x * 4 + 3, p.y * 4, p.z * 4)) * 0.4);
    c = melange(c, creme, lisse(0.12, 0.02, t) * 0.5);
    return [0, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
    accessoires: () => {
      const t = tige(0.18, 0.035, 0.03, 0.2, "#7a5a2a");
      t.position.y = h / 2 - 0.02;
      const s = calice(4, 0.12, 0.09, "#8a3020", 0.2, -h / 2 + 0.14, true);
      return [t, s];
    },
  };
}

function modeleSapotille(): Modele {
  // Sapotille : ovale brun mat, peau poudreuse comme une pomme de terre
  const h = 1.3;
  const g = revolution((t) => 0.6 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 + 0.06 * (1 - t)), h, 64, 88);
  const brun = C("#7a5232"), clair = C("#a87a50"), fonce = C("#4e3220");
  modeler(g, (p) => {
    const f = fbm(p.x * 5, p.y * 5, p.z * 5);
    let c = melange(fonce, brun, f * 1.5);
    c = melange(c, clair, lisse(0.55, 0.8, fbm(p.x * 16, p.y * 16, p.z * 16)) * 0.6);
    return [0.005 * bruit3(p.x * 30, p.y * 30, p.z * 30), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.95 }),
    accessoires: () => {
      const t = tige(0.16, 0.03, 0.025, 0.3, "#5a3e24");
      t.position.y = h / 2 - 0.02;
      return [t];
    },
  };
}

function modeleAtte(): Modele {
  // Atte (pomme cannelle) : cœur vert couvert de bosses arrondies, sillons plus clairs
  const h = 1.6;
  const g = revolution((t) => 0.78 * Math.pow(Math.sin(Math.PI * (0.04 + 0.96 * t)), 0.55) * (1.05 - 0.22 * t), h, 80, 112);
  const vert = C("#7aa040"), fonce = C("#55782a"), clair = C("#b8cc78"), brun = C("#6a5a2a");
  modeler(g, (p) => {
    const w = worley(p.x * 4.6, p.y * 4.6, p.z * 4.6);
    const bosse = Math.min(1, (w.f2 - w.f1) * 3.2);
    const d = 0.07 * Math.pow(bosse, 0.6);
    let c = melange(fonce, vert, bosse * 1.1 + (w.id - 0.5) * 0.4);
    c = melange(c, clair, (1 - Math.min(1, bosse * 3)) * 0.75);                // sillons clairs et poudrés
    c = melange(c, brun, lisse(0.6, 0.85, fbm(p.x * 3, p.y * 3, p.z * 3)) * 0.25);
    return [d, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.6, clearcoat: 0.15 }),
    accessoires: () => {
      const t = tige(0.25, 0.05, 0.04, 0.3, "#5a4a26");
      t.position.y = h / 2 - 0.02;
      return [t];
    },
  };
}

function modeleCombava(): Modele {
  // Combava : petit agrume vert sombre, peau très bosselée et ridée, petit téton
  const h = 1.15;
  const g = revolution((t) => 0.6 * Math.pow(Math.sin(Math.PI * t), 0.5) * (1 + 0.08 * Math.sin(Math.PI * t)), h, 72, 104);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), t = y / h + 0.5;
    pos.setY(i, y + 0.12 * Math.pow(lisse(0.82, 1, t), 2));                     // téton au sommet
  }
  const vert = C("#3e6a1e"), clair = C("#6e9a34"), fonce = C("#24420e");
  modeler(g, (p) => {
    const ride = fbm(p.x * 4, p.y * 4, p.z * 4);
    const w = worley(p.x * 9, p.y * 9, p.z * 9);
    const bosse = Math.min(1, (w.f2 - w.f1) * 3);
    let c = melange(fonce, vert, bosse + ride * 0.5);
    c = melange(c, clair, lisse(0.7, 1, bosse) * 0.45);
    const pore = lisse(0.2, 0.0, worley(p.x * 30, p.y * 30, p.z * 30).f1);
    return [0.05 * (ride - 0.5) + 0.03 * bosse - 0.006 * pore, c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.4 }),
    accessoires: () => {
      const t = tige(0.18, 0.03, 0.025, 0.3, "#3e5a22");
      t.position.y = -h / 2 + 0.02;
      t.rotation.z = Math.PI;
      const f = feuilleDetaillee(0.55, 0.26, "#2e6a22", 0.25, 0.1);
      f.position.set(0, -h / 2 - 0.05, 0);
      f.rotation.set(2.0, 0.4, 0.3);
      return [t, f];
    },
  };
}

function modeleCacao(): Modele {
  // Cabosse de cacao : allongée, pointue, dix côtes, jaune orangé teinté de rouge brun
  const h = 2.3;
  const g = revolution((t) => 0.66 * Math.pow(Math.sin(Math.PI * t), 0.72) * (1 + 0.05 * Math.sin(2 * Math.PI * t)), h, 80, 120);
  moduler(g, (a) => 1 + 0.05 * Math.cos(10 * a) + 0.035 * Math.cos(5 * a));
  const jaune = C("#e4a82a"), orange = C("#d07020"), rouge = C("#8e3018"), vert = C("#8a9a2a");
  modeler(g, (p) => {
    const a = angle(p), t = hauteurRel(p, h);
    const f = fbm(p.x * 2, p.y * 2, p.z * 2);
    let c = melange(jaune, orange, f * 1.4 - 0.1);
    c = melange(c, rouge, lisse(0.55, 0.85, fbm(p.x * 1.4 + 4, p.y * 1.4, p.z * 1.4)) * 0.75);
    c = melange(c, vert, lisse(0.8, 1, t) * 0.35);
    const sillon = Math.pow(0.5 + 0.5 * Math.cos(10 * a + Math.PI), 10);
    c = melange(c, rouge, sillon * 0.35);
    const verrue = lisse(0.06, 0.0, worley(p.x * 12, p.y * 12, p.z * 12).f1) * 0.02;
    return [verrue + 0.01 * (f - 0.5), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.45, clearcoat: 0.3 }),
    accessoires: () => {
      const t = tige(0.35, 0.07, 0.055, 0.15, "#5a4a22");
      t.position.y = h / 2 - 0.05;
      return [t];
    },
  };
}

function modeleCanistel(): Modele {
  // Canistel (jaune d'œuf) : goutte pointue vers le bas, peau jaune d'or lisse
  const h = 1.75;
  const g = revolution((t) => 0.68 * Math.pow(Math.sin(Math.PI * t), 0.55) * (0.52 + 0.48 * lisse(0.0, 0.7, t)) * (1 - 0.08 * lisse(0.85, 1, t)), h, 72, 104);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) + 0.06 * Math.sin(Math.PI * (pos.getY(i) / h + 0.5)));
  const jaune = C("#e08a08"), clair = C("#eeaa18"), orange = C("#c86a06"), tache = C("#9a5a08");
  modeler(g, (p) => {
    let c = melange(jaune, clair, fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5) * 1.4 - 0.2);
    c = melange(c, orange, lisse(0.3, 0.0, hauteurRel(p, h)) * 0.5);
    c = melange(c, tache, lisse(0.04, 0.01, worley(p.x * 16, p.y * 16, p.z * 16).f1) * 0.4);
    return [0.003 * bruit3(p.x * 30, p.y * 30, p.z * 30), c];
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.35, clearcoat: 0.45, clearcoatRoughness: 0.35 }),
    accessoires: () => {
      const t = tige(0.28, 0.045, 0.035, 0.4, "#6a4a22");
      t.position.y = h / 2 - 0.03;
      const f = feuilleDetaillee(0.95, 0.38, "#2e7a2e", 0.3, 0.12);
      f.position.set(0.05, h / 2 + 0.12, 0);
      f.rotation.set(-1.0, 0.2, 0.9);
      return [t, f];
    },
  };
}

function modeleFigueBarbarie(): Modele {
  // Figue de Barbarie : ovale vert-jaune rosissant, aréoles brunes en quinconce, sommet creusé
  const h = 1.6;
  const g = revolution((t) => 0.6 * Math.pow(Math.sin(Math.PI * (0.03 + 0.97 * t)), 0.5) * (0.88 + 0.12 * t), h, 72, 104);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), t = y / h + 0.5, r = Math.hypot(x, z);
    if (t > 0.9) pos.setY(i, y - 0.1 * (1 - r / 0.6) * lisse(0.9, 1, t));       // sommet creusé (ombilic)
  }
  const vert = C("#7a9a26"), jaune = C("#c8b828"), rose = C("#d0502e"), areole = C("#4a2e18"), duvet = C("#d8c890");
  const N = 9;
  modeler(g, (p) => {
    const t = hauteurRel(p, h), a = angle(p);
    const soleil = lisse(-0.2, 0.9, p.x * 0.8 + (t - 0.5) * 0.6 + (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.5));
    let c = melange(vert, jaune, soleil);
    c = melange(c, rose, lisse(0.5, 1, soleil) * 0.7);
    // aréoles en quinconce
    const ligne = Math.round(t * 8), decale = (ligne % 2) * 0.5;
    const ta = (a / (Math.PI * 2)) * N - decale;
    const da = (ta - Math.round(ta)) * (Math.PI * 2 / N) * Math.hypot(p.x, p.z), dy = (t * 8 - ligne) * (h / 8);
    const dist = Math.hypot(da, dy);
    let d = 0;
    if (ligne > 0 && ligne < 8 && dist < 0.045) {
      c = melange(c, duvet, lisse(0.045, 0.03, dist) * 0.6);
      c = melange(c, areole, lisse(0.028, 0.01, dist));
      d = lisse(0.045, 0.0, dist) * 0.015;
    }
    return [d, c];
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.5, clearcoat: 0.2 }), accessoires: () => [] };
}

const CONSTRUCTEURS: Record<string, () => Modele> = {
  letchi: () => modeleLetchi(),
  "letchi-or": () => modeleLetchi(true),
  mangue: modeleMangue,
  ananas: modeleAnanas,
  banane: modeleBanane,
  papaye: modelePapaye,
  grenadine: modeleGrenadine,
  pasteque: modelePasteque,
  citron: modeleCitron,
  mandarine: modeleMandarine,
  coco: modeleCoco,
  bringelle: modeleBringelle,
  goyavier: modeleGoyavier,
  piment: modelePiment,
  lave: modeleLave,
  tijacque: modeleTiJacque,
  friyapin: modeleFriyapin,
  goyave: modeleGoyave,
  vanille: modeleVanille,
  carambole: modeleCarambole,
  chouchou: modeleChouchou,
  bibasse: modeleBibasse,
  avocat: modeleAvocat,
  pitaya: modelePitaya,
  canne: modeleCanne,
  tamarin: modeleTamarin,
  longani: modeleLongani,
  jamalac: modeleJamalac,
  sapotille: modeleSapotille,
  atte: modeleAtte,
  combava: modeleCombava,
  cacao: modeleCacao,
  canistel: modeleCanistel,
  "figue-barbarie": modeleFigueBarbarie,
};

const cacheModeles = new Map<string, Modele>();
export function modele(id: string): Modele {
  let m = cacheModeles.get(id);
  if (!m) { m = CONSTRUCTEURS[id](); cacheModeles.set(id, m); }
  return m;
}

// ---------------------------------------------------------------------------
// Textures de chair (vue en coupe), dessinées en rond : le centre au milieu, la peau au bord.
// ---------------------------------------------------------------------------

type Pinceau = { ctx: CanvasRenderingContext2D; R: number; c: number; rnd: () => number };

function disque(pi: Pinceau, f: number, style: string | CanvasGradient) {
  pi.ctx.beginPath();
  pi.ctx.arc(pi.c, pi.c, pi.R * f, 0, Math.PI * 2);
  pi.ctx.fillStyle = style;
  pi.ctx.fill();
}
function degrade(pi: Pinceau, f0: number, f1: number, stops: [number, string][]) {
  const g = pi.ctx.createRadialGradient(pi.c, pi.c, pi.R * f0, pi.c, pi.c, pi.R * f1);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
function graines(pi: Pinceau, n: number, fMin: number, fMax: number, couleur: string, taille: number, larme = true) {
  const { ctx } = pi;
  for (let i = 0; i < n; i++) {
    const a = pi.rnd() * Math.PI * 2;
    const r = pi.R * (fMin + (fMax - fMin) * Math.sqrt(pi.rnd()));
    const x = pi.c + Math.cos(a) * r, y = pi.c + Math.sin(a) * r;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + (larme ? Math.PI / 2 : pi.rnd() * 6));
    ctx.beginPath();
    ctx.ellipse(0, 0, taille * 0.55, taille, 0, 0, Math.PI * 2);
    ctx.fillStyle = couleur;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-taille * 0.15, -taille * 0.3, taille * 0.15, taille * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.restore();
  }
}
function quartiers(pi: Pinceau, n: number, f0: number, f1: number, ligne: string) {
  const { ctx } = pi;
  ctx.strokeStyle = ligne;
  ctx.lineWidth = pi.R * 0.018;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(pi.c + Math.cos(a) * pi.R * f0, pi.c + Math.sin(a) * pi.R * f0);
    ctx.lineTo(pi.c + Math.cos(a) * pi.R * f1, pi.c + Math.sin(a) * pi.R * f1);
    ctx.stroke();
  }
}
function fibres(pi: Pinceau, n: number, couleur: string, f0 = 0.1, f1 = 0.9) {
  const { ctx } = pi;
  ctx.strokeStyle = couleur;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < n; i++) {
    const a = pi.rnd() * Math.PI * 2;
    const r0 = pi.R * (f0 + pi.rnd() * 0.2), r1 = pi.R * (f1 - pi.rnd() * 0.2);
    ctx.beginPath();
    ctx.moveTo(pi.c + Math.cos(a) * r0, pi.c + Math.sin(a) * r0);
    ctx.lineTo(pi.c + Math.cos(a + 0.05) * r1, pi.c + Math.sin(a + 0.05) * r1);
    ctx.stroke();
  }
}
function brillance(pi: Pinceau) {
  disque(pi, 1, degrade(pi, 0, 1, [[0, "rgba(255,255,255,0.18)"], [0.6, "rgba(255,255,255,0.04)"], [1, "rgba(0,0,0,0.12)"]]));
}

const CHAIRS: Record<string, (pi: Pinceau) => void> = {
  letchi: (pi) => {
    disque(pi, 1, "#8e1222");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f6efe6"], [0.7, "#efe4d6"], [1, "#e3d2c2"]]));
    disque(pi, 0.42, degrade(pi, 0, 0.42, [[0, "#6a3b1c"], [0.8, "#3d2010"], [1, "#2a160a"]]));
    fibres(pi, 60, "rgba(255,255,255,0.25)", 0.45, 0.92);
  },
  "letchi-or": (pi) => {
    disque(pi, 1, "#c98a10");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#fff8d8"], [1, "#ffe48a"]]));
    disque(pi, 0.42, degrade(pi, 0, 0.42, [[0, "#ffd34d"], [1, "#b8780a"]]));
  },
  mangue: (pi) => {
    disque(pi, 1, "#7a8f2c");
    disque(pi, 0.97, degrade(pi, 0, 0.97, [[0, "#ffd04a"], [0.6, "#ffb22a"], [1, "#f39812"]]));
    fibres(pi, 90, "rgba(255,240,180,0.35)", 0.3, 0.95);
    pi.ctx.beginPath();
    pi.ctx.ellipse(pi.c, pi.c, pi.R * 0.52, pi.R * 0.18, 0.2, 0, Math.PI * 2);
    pi.ctx.fillStyle = "#f4e3b0";
    pi.ctx.fill();
  },
  ananas: (pi) => {
    disque(pi, 1, "#8a6a22");
    disque(pi, 0.93, degrade(pi, 0, 0.93, [[0, "#fff1a0"], [0.5, "#ffe066"], [1, "#f5c938"]]));
    fibres(pi, 120, "rgba(255,255,255,0.3)", 0.25, 0.9);
    disque(pi, 0.24, degrade(pi, 0, 0.24, [[0, "#fff6c8"], [1, "#f6e08a"]]));
  },
  banane: (pi) => {
    disque(pi, 1, "#d8b62c");
    disque(pi, 0.92, degrade(pi, 0, 0.92, [[0, "#fbf3d2"], [1, "#efe2b2"]]));
    graines(pi, 9, 0.05, 0.2, "#6d5a3a", pi.R * 0.03, false);
  },
  papaye: (pi) => {
    disque(pi, 1, "#5f8f2c");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#ffb070"], [0.6, "#ff8e3c"], [1, "#f37b2a"]]));
    disque(pi, 0.45, "#e86a1c");
    graines(pi, 70, 0.05, 0.42, "#1d1612", pi.R * 0.05, false);
  },
  grenadine: (pi) => {
    disque(pi, 1, "#4a1c42");
    disque(pi, 0.94, "#f6efe2");
    disque(pi, 0.82, degrade(pi, 0, 0.82, [[0, "#ffd04a"], [1, "#f2a91c"]]));
    graines(pi, 80, 0.05, 0.78, "#1a1410", pi.R * 0.045, false);
  },
  pasteque: (pi) => {
    disque(pi, 1, "#2b5d22");
    disque(pi, 0.96, "#dfeec2");
    disque(pi, 0.88, degrade(pi, 0, 0.88, [[0, "#ff4b5a"], [0.8, "#ec3043"], [1, "#f4707a"]]));
    graines(pi, 34, 0.35, 0.72, "#160f0c", pi.R * 0.05);
  },
  citron: (pi) => {
    disque(pi, 1, "#4e8c22");
    disque(pi, 0.95, "#f3f6dd");
    disque(pi, 0.88, degrade(pi, 0, 0.88, [[0, "#f2f8c0"], [1, "#d3ea7a"]]));
    quartiers(pi, 9, 0.08, 0.88, "rgba(250,252,235,0.9)");
    disque(pi, 0.09, "#f6f9e4");
  },
  mandarine: (pi) => {
    disque(pi, 1, "#e66a12");
    disque(pi, 0.95, "#fbe8cf");
    disque(pi, 0.89, degrade(pi, 0, 0.89, [[0, "#ffb050"], [1, "#ff8a18"]]));
    quartiers(pi, 10, 0.08, 0.89, "rgba(255,240,215,0.9)");
    disque(pi, 0.08, "#fff1dc");
  },
  coco: (pi) => {
    disque(pi, 1, "#5c391f");
    disque(pi, 0.86, "#3a2414");
    disque(pi, 0.8, "#fbfaf6");
    disque(pi, 0.58, degrade(pi, 0, 0.58, [[0, "#f3f7fa"], [1, "#e4ecf0"]]));
  },
  bringelle: (pi) => {
    disque(pi, 1, "#2c0d38");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f6f0d8"], [1, "#e6dcb8"]]));
    graines(pi, 60, 0.15, 0.75, "#9a8556", pi.R * 0.025, false);
  },
  goyavier: (pi) => {
    disque(pi, 1, "#8e1430");
    disque(pi, 0.92, degrade(pi, 0, 0.92, [[0, "#fbe0e4"], [1, "#f19aaa"]]));
    graines(pi, 26, 0.1, 0.55, "#f3d9a8", pi.R * 0.06, false);
  },
  piment: (pi) => {
    disque(pi, 1, "#c9111a");
    disque(pi, 0.82, "#e8313a");
    disque(pi, 0.55, "#f6d9c4");
    graines(pi, 18, 0.05, 0.45, "#f6e3a3", pi.R * 0.08, false);
  },
  tijacque: (pi) => {
    disque(pi, 1, "#5f7f26");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f7f1dc"], [0.6, "#f1e7c4"], [1, "#e8dcae"]]));
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + pi.rnd() * 0.2, r = pi.R * 0.6;
      pi.ctx.save(); pi.ctx.translate(pi.c + Math.cos(a) * r, pi.c + Math.sin(a) * r); pi.ctx.rotate(a);
      pi.ctx.beginPath(); pi.ctx.ellipse(0, 0, pi.R * 0.2, pi.R * 0.08, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#efdf9e"; pi.ctx.fill();
      pi.ctx.beginPath(); pi.ctx.ellipse(-pi.R * 0.02, 0, pi.R * 0.08, pi.R * 0.045, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#f8f3e2"; pi.ctx.fill();
      pi.ctx.restore();
    }
    fibres(pi, 110, "rgba(255,255,255,0.35)", 0.15, 0.95);
    disque(pi, 0.2, degrade(pi, 0, 0.2, [[0, "#fbf7ea"], [1, "#efe4c2"]]));
  },
  friyapin: (pi) => {
    disque(pi, 1, "#5b7f2a");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f6ecc6"], [0.7, "#f1e2a8"], [1, "#e9d892"]]));
    fibres(pi, 70, "rgba(255,250,230,0.4)", 0.25, 0.92);
    disque(pi, 0.22, degrade(pi, 0, 0.22, [[0, "#e6d29a"], [1, "#c9b070"]]));
  },
  goyave: (pi) => {
    disque(pi, 1, "#c9cf58");
    disque(pi, 0.94, degrade(pi, 0, 0.94, [[0, "#f6a0a6"], [0.7, "#f2848e"], [1, "#f6b7a0"]]));
    disque(pi, 0.55, "#ee7480");
    graines(pi, 40, 0.15, 0.52, "#f1e2b8", pi.R * 0.035, false);
  },
  vanille: (pi) => {
    disque(pi, 1, "#2e1a0e");
    disque(pi, 0.82, degrade(pi, 0, 0.82, [[0, "#1d0f07"], [1, "#3d2414"]]));
    graines(pi, 260, 0, 0.75, "#060302", pi.R * 0.018, false);
  },
  carambole: (pi) => {
    disque(pi, 1, "#c4a22c");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#fff3b0"], [0.5, "#fbe478"], [1, "#f2cc3c"]]));
    quartiers(pi, 5, 0.08, 0.95, "rgba(255,250,215,0.75)");
    graines(pi, 6, 0.12, 0.3, "#8a5a24", pi.R * 0.06);
    disque(pi, 0.07, "#fff6c8");
  },
  chouchou: (pi) => {
    disque(pi, 1, "#8db04e");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f6f9ea"], [1, "#e4eecc"]]));
    pi.ctx.beginPath();
    pi.ctx.ellipse(pi.c, pi.c, pi.R * 0.36, pi.R * 0.24, 0, 0, Math.PI * 2);
    pi.ctx.fillStyle = "#fbfaf2"; pi.ctx.fill();
    pi.ctx.strokeStyle = "rgba(170,190,130,0.7)"; pi.ctx.lineWidth = pi.R * 0.02; pi.ctx.stroke();
  },
  bibasse: (pi) => {
    disque(pi, 1, "#e8962a");
    disque(pi, 0.94, degrade(pi, 0, 0.94, [[0, "#ffd27a"], [1, "#ffae3e"]]));
    [[-0.17, 0], [0.17, 0.02], [0, -0.2]].forEach(([dx, dy]) => {
      pi.ctx.beginPath();
      pi.ctx.ellipse(pi.c + dx * pi.R, pi.c + dy * pi.R, pi.R * 0.17, pi.R * 0.13, dx * 3, 0, Math.PI * 2);
      pi.ctx.fillStyle = "#6a3c18"; pi.ctx.fill();
      pi.ctx.beginPath();
      pi.ctx.ellipse(pi.c + dx * pi.R - pi.R * 0.05, pi.c + dy * pi.R - pi.R * 0.04, pi.R * 0.05, pi.R * 0.03, 0, 0, Math.PI * 2);
      pi.ctx.fillStyle = "rgba(255,255,255,0.35)"; pi.ctx.fill();
    });
  },
  avocat: (pi) => {
    disque(pi, 1, "#24400e");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#f2eaa0"], [0.55, "#dfe28a"], [0.85, "#b8d060"], [1, "#8ab83e"]]));
    disque(pi, 0.42, degrade(pi, 0, 0.42, [[0, "#c8905a"], [0.7, "#9a6232"], [1, "#6a3e1c"]]));
    pi.ctx.beginPath(); pi.ctx.ellipse(pi.c - pi.R * 0.12, pi.c - pi.R * 0.12, pi.R * 0.1, pi.R * 0.06, -0.6, 0, Math.PI * 2);
    pi.ctx.fillStyle = "rgba(255,255,255,0.3)"; pi.ctx.fill();
  },
  pitaya: (pi) => {
    disque(pi, 1, "#c8185e");
    disque(pi, 0.93, degrade(pi, 0, 0.93, [[0, "#fbf8f4"], [0.9, "#f4eee8"], [1, "#f6c8d8"]]));
    graines(pi, 220, 0.02, 0.88, "#141010", pi.R * 0.022, false);
  },
  canne: (pi) => {
    disque(pi, 1, "#5e2434");
    disque(pi, 0.9, degrade(pi, 0, 0.9, [[0, "#f6f0d0"], [1, "#e8dcae"]]));
    graines(pi, 160, 0.05, 0.85, "rgba(190,170,110,0.55)", pi.R * 0.018, false);
  },
  tamarin: (pi) => {
    disque(pi, 1, "#9a6a3c");
    disque(pi, 0.86, degrade(pi, 0, 0.86, [[0, "#8a4e22"], [1, "#6a3816"]]));
    fibres(pi, 40, "rgba(220,170,110,0.35)", 0.2, 0.85);
    disque(pi, 0.36, degrade(pi, 0, 0.36, [[0, "#6a3a1c"], [1, "#3a1e0c"]]));
  },
  longani: (pi) => {
    disque(pi, 1, "#a87a40");
    disque(pi, 0.92, degrade(pi, 0, 0.92, [[0, "#fbf6ee"], [1, "#ece2d2"]]));
    disque(pi, 0.44, degrade(pi, 0, 0.44, [[0, "#3a2a20"], [0.8, "#160e0a"], [1, "#0a0604"]]));
    pi.ctx.beginPath(); pi.ctx.arc(pi.c + pi.R * 0.12, pi.c + pi.R * 0.1, pi.R * 0.12, 0, Math.PI * 2);
    pi.ctx.fillStyle = "#f2ead8"; pi.ctx.fill();
    fibres(pi, 50, "rgba(255,255,255,0.3)", 0.48, 0.9);
  },
  jamalac: (pi) => {
    disque(pi, 1, "#c8102a");
    disque(pi, 0.95, degrade(pi, 0, 0.95, [[0, "#fbf3ec"], [0.8, "#f6e2da"], [1, "#f6b0b0"]]));
    graines(pi, 120, 0.05, 0.85, "rgba(230,200,190,0.5)", pi.R * 0.03, false);
    disque(pi, 0.16, "#f2e0c8");
  },
  sapotille: (pi) => {
    disque(pi, 1, "#6a4428");
    disque(pi, 0.94, degrade(pi, 0, 0.94, [[0, "#d8a878"], [0.7, "#c8925e"], [1, "#b07a48"]]));
    fibres(pi, 60, "rgba(240,200,150,0.35)", 0.2, 0.9);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4, r = pi.R * 0.28;
      pi.ctx.save(); pi.ctx.translate(pi.c + Math.cos(a) * r, pi.c + Math.sin(a) * r); pi.ctx.rotate(a);
      pi.ctx.beginPath(); pi.ctx.ellipse(0, 0, pi.R * 0.16, pi.R * 0.07, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#140c08"; pi.ctx.fill();
      pi.ctx.beginPath(); pi.ctx.ellipse(-pi.R * 0.04, -pi.R * 0.02, pi.R * 0.06, pi.R * 0.02, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "rgba(255,255,255,0.35)"; pi.ctx.fill();
      pi.ctx.restore();
    }
  },
  atte: (pi) => {
    disque(pi, 1, "#6a9a3a");
    disque(pi, 0.92, degrade(pi, 0, 0.92, [[0, "#fdfaf2"], [1, "#f2ecda"]]));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2, r = pi.R * 0.55;
      pi.ctx.strokeStyle = "rgba(200,190,160,0.6)"; pi.ctx.lineWidth = pi.R * 0.012;
      pi.ctx.beginPath(); pi.ctx.moveTo(pi.c, pi.c); pi.ctx.lineTo(pi.c + Math.cos(a) * pi.R * 0.9, pi.c + Math.sin(a) * pi.R * 0.9); pi.ctx.stroke();
      pi.ctx.save(); pi.ctx.translate(pi.c + Math.cos(a + 0.2) * r, pi.c + Math.sin(a + 0.2) * r); pi.ctx.rotate(a);
      pi.ctx.beginPath(); pi.ctx.ellipse(0, 0, pi.R * 0.09, pi.R * 0.05, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#1a120c"; pi.ctx.fill();
      pi.ctx.restore();
    }
    disque(pi, 0.12, "#efe6cc");
  },
  combava: (pi) => {
    disque(pi, 1, "#2e5a16");
    disque(pi, 0.88, "#eef2d6");
    disque(pi, 0.78, degrade(pi, 0, 0.78, [[0, "#eef6b8"], [1, "#cfe27a"]]));
    quartiers(pi, 8, 0.08, 0.78, "rgba(250,252,230,0.9)");
    graines(pi, 6, 0.15, 0.4, "#f6f0d0", pi.R * 0.05);
  },
  cacao: (pi) => {
    disque(pi, 1, "#d08a20");
    disque(pi, 0.88, "#f2dca0");
    disque(pi, 0.72, degrade(pi, 0, 0.72, [[0, "#fbf8f2"], [1, "#efe6d8"]]));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, r = pi.R * 0.45;
      pi.ctx.save(); pi.ctx.translate(pi.c + Math.cos(a) * r, pi.c + Math.sin(a) * r); pi.ctx.rotate(a);
      pi.ctx.beginPath(); pi.ctx.ellipse(0, 0, pi.R * 0.16, pi.R * 0.1, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#fbf8f0"; pi.ctx.fill();
      pi.ctx.beginPath(); pi.ctx.ellipse(0, 0, pi.R * 0.11, pi.R * 0.065, 0, 0, Math.PI * 2); pi.ctx.fillStyle = "#6a2e3a"; pi.ctx.fill();
      pi.ctx.restore();
    }
    disque(pi, 0.12, "#e8dcc4");
  },
  canistel: (pi) => {
    disque(pi, 1, "#d89810");
    disque(pi, 0.96, degrade(pi, 0, 0.96, [[0, "#ffb830"], [0.7, "#f8a418"], [1, "#f09010"]]));
    graines(pi, 80, 0.1, 0.9, "rgba(255,210,120,0.35)", pi.R * 0.02, false);
    pi.ctx.beginPath(); pi.ctx.ellipse(pi.c, pi.c, pi.R * 0.32, pi.R * 0.22, 0.3, 0, Math.PI * 2);
    pi.ctx.fillStyle = "#4a2410"; pi.ctx.fill();
    pi.ctx.beginPath(); pi.ctx.ellipse(pi.c - pi.R * 0.08, pi.c - pi.R * 0.07, pi.R * 0.1, pi.R * 0.05, 0.3, 0, Math.PI * 2);
    pi.ctx.fillStyle = "rgba(255,255,255,0.3)"; pi.ctx.fill();
  },
  "figue-barbarie": (pi) => {
    disque(pi, 1, "#a8b040");
    disque(pi, 0.9, degrade(pi, 0, 0.9, [[0, "#ff8a3a"], [0.8, "#f46a20"], [1, "#e8a040"]]));
    graines(pi, 110, 0.05, 0.82, "#2a1a10", pi.R * 0.03, false);
  },
  lave: (pi) => {
    disque(pi, 1, "#2a2421");
    disque(pi, 0.85, degrade(pi, 0, 0.85, [[0, "#fff1b0"], [0.3, "#ffb030"], [0.7, "#ff5a00"], [1, "#7a1a00"]]));
  },
};

const cacheChairs = new Map<string, THREE.CanvasTexture>();
export function textureChair(id: string): THREE.CanvasTexture {
  let t = cacheChairs.get(id);
  if (t) return t;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 512;
  const ctx = cv.getContext("2d")!;
  const pi: Pinceau = { ctx, R: 250, c: 256, rnd: graine(id.length * 97 + 13) };
  (CHAIRS[id] || CHAIRS.letchi)(pi);
  brillance(pi);
  t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  cacheChairs.set(id, t);
  return t;
}
