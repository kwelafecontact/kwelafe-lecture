// Koup Koup : catalogue des fruits péi, modélisés en 3D par le code (aucune image nécessaire).
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { bruit3, fbm, graine } from "./bruit";

export type Jus = {
  couleur: string;      // couleur du jus
  quantite: number;     // 0 (sec) à 1 (très juteux)
  viscosite: number;    // 0 (liquide) à 1 (épais, coule lentement)
  graines?: string;     // couleur des pépins projetés
  morceaux?: string;    // couleur des petits morceaux projetés
  ecran?: boolean;      // éclabousse l'écran du joueur
};

export type DefFruit = {
  id: string;
  nom: string;          // nom français
  kreol: string;        // nom créole (à faire relire)
  rayon: number;        // rayon de collision (unités du monde)
  points: number;
  poids: number;        // fréquence d'apparition
  jus: Jus;
  special?: "or" | "lave";
};

export const FRUITS: DefFruit[] = [
  { id: "letchi", nom: "Letchi", kreol: "Letchi", rayon: 0.8, points: 1, poids: 10, jus: { couleur: "#f3e6dc", quantite: 0.7, viscosite: 0.35, morceaux: "#fff8ee", ecran: true } },
  { id: "mangue", nom: "Mangue", kreol: "Mang", rayon: 1.15, points: 1, poids: 9, jus: { couleur: "#f39a12", quantite: 0.75, viscosite: 0.85, morceaux: "#ffb52e" } },
  { id: "ananas", nom: "Ananas", kreol: "Zananas", rayon: 1.15, points: 1, poids: 7, jus: { couleur: "#f6d23a", quantite: 0.95, viscosite: 0.15, morceaux: "#ffe680", ecran: true } },
  { id: "banane", nom: "Banane", kreol: "Fig", rayon: 1.15, points: 1, poids: 8, jus: { couleur: "#f4ecc8", quantite: 0.12, viscosite: 0.9, morceaux: "#f7efcf" } },
  { id: "papaye", nom: "Papaye", kreol: "Papay", rayon: 1.1, points: 1, poids: 7, jus: { couleur: "#f37b2a", quantite: 0.6, viscosite: 0.6, graines: "#1d1612" } },
  { id: "grenadine", nom: "Fruit de la passion", kreol: "Grenadine", rayon: 0.75, points: 1, poids: 7, jus: { couleur: "#f2a91c", quantite: 0.8, viscosite: 0.55, graines: "#1a1410", ecran: true } },
  { id: "pasteque", nom: "Pastèque", kreol: "Pastèk", rayon: 1.35, points: 1, poids: 6, jus: { couleur: "#e8283a", quantite: 1, viscosite: 0.1, graines: "#160f0c", ecran: true } },
  { id: "citron", nom: "Citron vert", kreol: "Sitron", rayon: 0.6, points: 2, poids: 6, jus: { couleur: "#d6ec7a", quantite: 0.85, viscosite: 0.05, ecran: true } },
  { id: "mandarine", nom: "Mandarine", kreol: "Mandarine", rayon: 0.72, points: 1, poids: 7, jus: { couleur: "#ff8a18", quantite: 0.9, viscosite: 0.1, ecran: true } },
  { id: "coco", nom: "Noix de coco", kreol: "Koko", rayon: 1.0, points: 1, poids: 5, jus: { couleur: "#eef3f6", quantite: 0.7, viscosite: 0.05, morceaux: "#ffffff" } },
  { id: "bringelle", nom: "Aubergine", kreol: "Bringèl", rayon: 1.05, points: 1, poids: 5, jus: { couleur: "#efe5c4", quantite: 0.1, viscosite: 0.9, morceaux: "#efe7cc" } },
  { id: "goyavier", nom: "Goyavier", kreol: "Goyavié", rayon: 0.5, points: 2, poids: 6, jus: { couleur: "#e2475f", quantite: 0.7, viscosite: 0.4, graines: "#f3d9a8" } },
  { id: "piment", nom: "Piment", kreol: "Piman", rayon: 0.55, points: 3, poids: 4, jus: { couleur: "#d4141c", quantite: 0.35, viscosite: 0.3, graines: "#f6e3a3" } },
  { id: "letchi-or", nom: "Letchi doré", kreol: "Letchi doré", rayon: 0.85, points: 10, poids: 0, special: "or", jus: { couleur: "#ffd34d", quantite: 0.9, viscosite: 0.3, morceaux: "#fff1a8" } },
  { id: "lave", nom: "Roche de lave", kreol: "Roche de lave", rayon: 0.9, points: 0, poids: 0, special: "lave", jus: { couleur: "#ff6a00", quantite: 0, viscosite: 0 } },
];

export const fruitParId = (id: string) => FRUITS.find((f) => f.id === id)!;

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

function modeleLetchi(or = false): Modele {
  const g = revolution((t) => 0.74 * Math.pow(Math.sin(Math.PI * t), 0.8) * (1 - 0.07 * t), 1.5);
  const rouge = C("#b3122a"), sombre = C("#6e0a19"), clair = C("#e0505c"), dore = C("#ffcf40"), doreSombre = C("#c98a10");
  sculpter(
    g,
    (p) => {
      const b = bruit3(p.x * 9, p.y * 9, p.z * 9);
      return 0.055 * b * b + 0.012 * bruit3(p.x * 26, p.y * 26, p.z * 26);
    },
    (p) => {
      const b = bruit3(p.x * 9, p.y * 9, p.z * 9);
      if (or) return melange(doreSombre, dore, 0.4 + b * 0.8);
      return melange(melange(sombre, rouge, fbm(p.x * 2.5, p.y * 2.5, p.z * 2.5) * 1.6), clair, lisse(0.62, 0.95, b));
    }
  );
  const materiau = or
    ? peauPhysique({ metalness: 0.85, roughness: 0.22, emissive: C("#ff9a10"), emissiveIntensity: 0.22, clearcoat: 1 })
    : peauPhysique({ roughness: 0.62, clearcoat: 0.15 });
  return {
    corps: g, materiau,
    accessoires: () => {
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.35, 6), new THREE.MeshStandardMaterial({ color: or ? "#b88412" : "#5b3b1f", roughness: 0.8 }));
      tige.position.y = 0.82;
      return [tige];
    },
  };
}

function modeleMangue(): Modele {
  const h = 2.3;
  const g = revolution((t) => 0.8 * Math.pow(Math.sin(Math.PI * t), 0.7) * (1 + 0.1 * Math.sin(Math.PI * t * 2)), h);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setX(i, pos.getX(i) + 0.2 * Math.sin(Math.PI * (y / h + 0.5)));
    pos.setZ(i, pos.getZ(i) * 0.82);
  }
  const vert = C("#5f8f2c"), jaune = C("#eab52f"), rouge = C("#d8432a");
  sculpter(g, (p) => 0.006 * bruit3(p.x * 20, p.y * 20, p.z * 20), (p) => {
    const t = (p.y / h + 0.5) + (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.5) * 0.5;
    const base = melange(vert, jaune, lisse(0.15, 0.55, t));
    return melange(base, rouge, lisse(0.55, 0.95, t + (p.x > 0 ? 0.15 : -0.1)));
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.4 }), accessoires: () => [] };
}

function modeleAnanas(): Modele {
  const h = 1.9;
  const g = revolution((t) => 0.78 * Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * t)), 0.45), h, 56, 72);
  const brun = C("#6b5420"), or = C("#e3a52b"), vert = C("#6f8a2a");
  const oeil = (p: THREE.Vector3) => {
    const a = angle(p);
    const u = (a * 8) / Math.PI + p.y * 3.4, v = (a * 8) / Math.PI - p.y * 3.4;
    return Math.abs(Math.sin(u * Math.PI)) * Math.abs(Math.sin(v * Math.PI));
  };
  sculpter(g, (p) => 0.075 * Math.pow(oeil(p), 0.7), (p) => {
    const o = oeil(p);
    const base = melange(brun, or, Math.pow(o, 0.8) + (fbm(p.x * 3, p.y * 3, p.z * 3) - 0.5) * 0.4);
    return melange(base, vert, lisse(0.2, -0.9, p.y) * 0.5);
  });
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.6 }),
    accessoires: () => {
      const r = graine(7);
      const out: THREE.Object3D[] = [];
      for (let i = 0; i < 14; i++) {
        const f = feuille(0.75 + r() * 0.6, 0.1, i % 2 ? "#3c7a2c" : "#4f8f34");
        f.position.y = h / 2 - 0.08;
        f.rotation.y = (i / 14) * Math.PI * 2 + r() * 0.3;
        f.rotateX(0.15 + (i % 3) * 0.22 + r() * 0.15);
        out.push(f);
      }
      return out;
    },
  };
}

function modeleBanane(): Modele {
  const g = tubeCourbe(
    [new THREE.Vector3(-1.35, -0.15, 0), new THREE.Vector3(-0.7, 0.32, 0), new THREE.Vector3(0.1, 0.42, 0), new THREE.Vector3(0.85, 0.18, 0), new THREE.Vector3(1.35, -0.38, 0)],
    0.34,
    (t) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, t))), 0.32) * (t < 0.08 ? 0.6 + t * 5 : 1),
    5
  );
  const jaune = C("#f1cf35"), brun = C("#4f3518"), vertJ = C("#c9c43a");
  sculpter(g, null, (p) => {
    const bout = lisse(1.05, 1.35, Math.abs(p.x));
    const tache = lisse(0.78, 0.86, bruit3(p.x * 7, p.y * 7, p.z * 7));
    return melange(melange(melange(jaune, vertJ, lisse(-0.6, -1.2, p.x) * 0.5), brun, tache * 0.8), brun, bout);
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.45, clearcoat: 0.2 }), accessoires: () => [] };
}

function modelePapaye(): Modele {
  const h = 2.1;
  const g = revolution((t) => 0.58 * Math.pow(Math.sin(Math.PI * t), 0.6) * (1 + 0.38 * (1 - t)), h);
  const vert = C("#4c8a2c"), orange = C("#f08a24"), jaune = C("#f3c03b");
  sculpter(g, (p) => 0.025 * Math.cos(5 * angle(p)), (p) => {
    const t = p.y / h + 0.5 + (fbm(p.x * 2.2, p.y * 2.2, p.z * 2.2) - 0.5) * 0.7;
    return melange(melange(orange, jaune, 0.3), vert, lisse(0.35, 0.85, t));
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.4, clearcoat: 0.3 }), accessoires: () => [] };
}

function modeleGrenadine(): Modele {
  const g = revolution((t) => 0.7 * Math.pow(Math.sin(Math.PI * t), 0.85), 1.38);
  const violet = C("#3e1838"), prune = C("#6e2a5c"), point = C("#c49ab9");
  sculpter(g, (p) => 0.035 * (fbm(p.x * 3, p.y * 3, p.z * 3) - 0.5), (p) => {
    const base = melange(violet, prune, fbm(p.x * 4, p.y * 4, p.z * 4) * 1.4 - 0.2);
    return melange(base, point, lisse(0.86, 0.9, bruit3(p.x * 22, p.y * 22, p.z * 22)) * 0.7);
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.3 }), accessoires: () => [] };
}

function modelePasteque(): Modele {
  const g = revolution((t) => 1.24 * Math.pow(Math.sin(Math.PI * t), 0.75), 2.7, 48, 72);
  const fonce = C("#1d4a1b"), clair = C("#6e9f48");
  sculpter(g, (p) => 0.01 * bruit3(p.x * 10, p.y * 10, p.z * 10), (p) => {
    const s = Math.sin(angle(p) * 9 + 0.7 * Math.sin(p.y * 2.6) + fbm(p.x * 2, p.y * 2, p.z * 2) * 3);
    return melange(clair, fonce, lisse(-0.1, 0.35, s));
  });
  return { corps: g, materiau: peauPhysique({ roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.25 }), accessoires: () => [] };
}

function modeleCitron(): Modele {
  const g = revolution((t) => 0.52 * Math.pow(Math.sin(Math.PI * t), 0.8) * (t > 0.9 ? 1 - (t - 0.9) * 2.5 : 1), 1.2);
  const vert = C("#5d9c27"), clair = C("#a8cd48");
  sculpter(g, (p) => -0.012 * bruit3(p.x * 32, p.y * 32, p.z * 32), (p) => melange(vert, clair, fbm(p.x * 3, p.y * 3, p.z * 3) * 1.2 - 0.1));
  return { corps: g, materiau: peauPhysique({ roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.35 }), accessoires: () => [] };
}

function modeleMandarine(): Modele {
  const g = revolution((t) => 0.74 * Math.pow(Math.sin(Math.PI * t), 0.62), 1.15);
  const orange = C("#f0791b"), fonce = C("#d65a10");
  sculpter(g, (p) => -0.013 * bruit3(p.x * 30, p.y * 30, p.z * 30), (p) => melange(orange, fonce, lisse(0.2, 0.6, p.y) * 0.5 + (fbm(p.x * 4, p.y * 4, p.z * 4) - 0.5) * 0.5));
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.38, clearcoat: 0.45 }),
    accessoires: () => {
      const queue = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.12, 6), new THREE.MeshStandardMaterial({ color: "#41602a" }));
      queue.position.y = 0.58;
      const f = feuille(0.5, 0.13, "#3f7a2c");
      f.position.y = 0.6; f.rotation.z = -1.1;
      return [queue, f];
    },
  };
}

function modeleCoco(): Modele {
  const g = revolution((t) => 0.95 * Math.pow(Math.sin(Math.PI * t), 0.78) * (1 - 0.12 * t), 1.85);
  const brun = C("#5c391f"), clair = C("#9c6b3d");
  sculpter(
    g,
    (p) => 0.045 * fbm(angle(p) * 18, p.y * 1.4, 0, 3),
    (p) => melange(brun, clair, fbm(angle(p) * 28, p.y * 1.2, p.x, 3) * 1.6 - 0.3)
  );
  return { corps: g, materiau: peauPhysique({ roughness: 0.92 }), accessoires: () => [] };
}

function modeleBringelle(): Modele {
  const h = 2.3;
  const g = revolution((t) => 0.56 * Math.pow(Math.sin(Math.PI * t), 0.5) * (0.6 + 0.42 * (1 - t)), h);
  const violet = C("#2c0d38"), reflet = C("#5a2470");
  sculpter(g, null, (p) => melange(violet, reflet, fbm(p.x * 2, p.y * 2, p.z * 2) - 0.3));
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08 }),
    accessoires: () => {
      const vert = "#4c7a2a";
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.45, 8), new THREE.MeshStandardMaterial({ color: vert, roughness: 0.7 }));
      tige.position.y = h / 2 + 0.12;
      const out: THREE.Object3D[] = [tige];
      for (let i = 0; i < 5; i++) {
        const f = feuille(0.55, 0.16, vert);
        f.position.y = h / 2 - 0.02;
        f.rotation.y = (i / 5) * Math.PI * 2;
        f.rotateX(2.2);
        out.push(f);
      }
      return out;
    },
  };
}

function modeleGoyavier(): Modele {
  const g = revolution((t) => 0.44 * Math.pow(Math.sin(Math.PI * t), 0.85), 0.86);
  const rouge = C("#9a1634"), clair = C("#d04260");
  sculpter(g, (p) => 0.006 * bruit3(p.x * 25, p.y * 25, p.z * 25), (p) => melange(rouge, clair, fbm(p.x * 5, p.y * 5, p.z * 5) * 1.3 - 0.2));
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.3, clearcoat: 0.6 }),
    accessoires: () => {
      const couronne = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 6, 10), new THREE.MeshStandardMaterial({ color: "#3a1a14" }));
      couronne.rotation.x = Math.PI / 2;
      couronne.position.y = 0.42;
      return [couronne];
    },
  };
}

function modelePiment(): Modele {
  const g = tubeCourbe(
    [new THREE.Vector3(-0.65, 0.1, 0), new THREE.Vector3(-0.2, 0.05, 0), new THREE.Vector3(0.3, -0.12, 0), new THREE.Vector3(0.68, -0.42, 0)],
    0.21,
    (t) => (t < 0.04 ? 0.4 + t * 15 : Math.pow(1 - t, 0.55)),
    3, 48, 14
  );
  const rouge = C("#d1121b"), sombre = C("#8e0a10");
  sculpter(g, null, (p) => melange(rouge, sombre, fbm(p.x * 3, p.y * 3, p.z * 3) - 0.35));
  return {
    corps: g, materiau: peauPhysique({ roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
    accessoires: () => {
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.08, 0.28, 6), new THREE.MeshStandardMaterial({ color: "#3f6f25" }));
      tige.rotation.z = Math.PI / 2 + 0.3;
      tige.position.set(-0.78, 0.13, 0);
      return [tige];
    },
  };
}

function modeleLave(): Modele {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(0.82, 5);
  g.deleteAttribute("uv");
  g.deleteAttribute("normal");
  g = mergeVertices(g);
  g.computeVertexNormals();
  const pos = g.attributes.position as THREE.BufferAttribute;
  const nor = g.attributes.normal as THREE.BufferAttribute;
  const braise = new Float32Array(pos.count);
  const couleurs = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const roche = C("#2a2421"), rocheClaire = C("#4a3f39");
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i); n.fromBufferAttribute(nor, i);
    const crevasse = Math.abs(bruit3(p.x * 3.5, p.y * 3.5, p.z * 3.5) - 0.5);
    const b = 1 - lisse(0.02, 0.07, crevasse);
    p.addScaledVector(n, (fbm(p.x * 2, p.y * 2, p.z * 2) - 0.5) * 0.45 - b * 0.06);
    pos.setXYZ(i, p.x, p.y, p.z);
    braise[i] = b;
    const c = melange(roche, rocheClaire, fbm(p.x * 6, p.y * 6, p.z * 6));
    couleurs.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("braise", new THREE.BufferAttribute(braise, 1));
  g.setAttribute("color", new THREE.BufferAttribute(couleurs, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  const materiau = peauPhysique({ roughness: 0.85 });
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
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(1.0, 0.32, 0.04) * vBraise * (2.2 + 1.6 * uPulse);"
      );
  };
  return { corps: g, materiau, accessoires: () => [] };
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
