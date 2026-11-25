// =====================================================================
// ROUTE DU LITTORAL - jeu de déblocage façon « Arrows Puzzle »
// La route entre Saint-Denis et La Possession est bouchée, coincée entre
// la falaise et l'océan. Chaque voiture ne peut avancer que dans le sens
// de sa flèche : touche-les dans le bon ordre pour libérer la route.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, etoilesPour, choisir, hasard } from '../commun/kwelafe.js';
import { voiture, falaise, ocean, payanke, galet, cocotier, texAsphalte, ombrer } from '../commun/decor.js';

const CASE = 1.3;
const COULEURS = [0xd32f2f, 0xffffff, 0x1f6fd1, 0x2c2c2c, 0xbfc5cc, 0xffc928, 0x2fa84f, 0xff7a1a, 0x7b4bd6, 0x18a5a0];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // (dx, dz) : +x, -x, +z, -z

let grille = { C: 5, R: 5 };
let monde, plateau, voitures = [], coeurs = 3, niveau = stock.lire('route-niveau', 1), occupe = false;

monde = creerMonde({
  soleil: { elevation: 38, azimut: 235, intensite: 2.5 },
  ombre: { taille: 12 },
  brouillard: { couleur: 0xbfe0f2, pres: 70, loin: 260 },
  cadrer(cam, ratio) {
    const w = grille.C * CASE + 3, d = grille.R * CASE + 3;
    if (ratio < 1) {
      const dist = Math.max(d * 1.15, (w / ratio) * 1.22) + 3;
      cam.position.set(0, dist * 0.74, dist * 0.74);
      cam.lookAt(0, 0, 0.3);
    } else {
      // paysage : on recule et on baisse la caméra pour voir la falaise et la mer
      const dist = d * 1.55 + 5;
      cam.position.set(0, dist * 0.6, dist * 0.88);
      cam.lookAt(0, 0.5, -1.2);
    }
  },
});
const { scene } = monde;

// ---------- Décor : falaise derrière, enrochement et océan devant ----------
const mer = ocean(500); mer.position.set(0, -1.4, 255); scene.add(mer);
monde.chaque((dt, t) => mer.maj(t));
const roc = falaise(200, 38); roc.position.set(0, -1, -15); scene.add(roc);
const accotement = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 5), new THREE.MeshStandardMaterial({ color: 0x6a655d, roughness: 1 }));
accotement.position.set(0, -0.5, -12.5); accotement.receiveShadow = true; scene.add(accotement);
const route = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 20), new THREE.MeshStandardMaterial({ map: texAsphalte([40, 5]), roughness: 0.92 }));
route.position.set(0, -0.52, 0); route.receiveShadow = true; scene.add(route);
// filets de protection contre les chutes de pierres
const matPoteau = new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 0.7, roughness: 0.4 });
const filet = new THREE.Mesh(new THREE.PlaneGeometry(200, 5), new THREE.MeshStandardMaterial({ color: 0x9aa3a8, transparent: true, opacity: 0.25, metalness: 0.6, roughness: 0.5, side: THREE.DoubleSide }));
filet.position.set(0, 2, -13.6);
for (let x = -90; x < 90; x += 3.5) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5, 6), matPoteau);
  p.position.set(x, 2, -13.5); p.castShadow = true; scene.add(p);
}
// séparateur béton et enrochement côté mer
const glissiere = new THREE.Mesh(new THREE.BoxGeometry(200, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: 0.9 }));
glissiere.position.set(0, 0.3, 10.3); glissiere.castShadow = glissiere.receiveShadow = true; scene.add(glissiere);
for (let x = -60; x < 60; x += 1.5) { const g = galet(0.9 + Math.random() * 0.6); g.position.set(x, -0.9 + Math.random() * 0.5, 12 + Math.random() * 2.5); g.rotation.y = Math.random() * 6; scene.add(g); }
for (const x of [-26, -15, 17, 29]) { const c = cocotier(6 + Math.random() * 2, 0.5); c.position.set(x, 0, -11.5); scene.add(c); }
const oiseaux = [payanke(), payanke()];
oiseaux.forEach(o => { scene.add(o); o.scale.setScalar(0.9); });
monde.chaque((dt, t) => oiseaux.forEach((o, i) => {
  const a = t * 0.25 + i * Math.PI;
  o.position.set(Math.cos(a) * 12, 7 + i * 2 + Math.sin(t) * 0.5, -6 + Math.sin(a) * 5);
  o.rotation.y = -a; o.rotation.z = 0.25; o.maj(t + i);
}));

// ---------- Flèche peinte sur le toit ----------
const texFleche = toile(128, 128, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.fillStyle = '#ffffff'; c.strokeStyle = '#10204a'; c.lineWidth = 8; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(118, 64); c.lineTo(70, 18); c.lineTo(70, 44); c.lineTo(12, 44); c.lineTo(12, 84); c.lineTo(70, 84); c.lineTo(70, 110); c.closePath();
  c.stroke(); c.fill();
});
const matFleche = new THREE.MeshBasicMaterial({ map: texFleche, transparent: true, depthWrite: false });

// ---------- Plateau ----------
function versMonde(c, r) { return new THREE.Vector3((c - (grille.C - 1) / 2) * CASE, 0, (r - (grille.R - 1) / 2) * CASE); }

function construirePlateau() {
  if (plateau) scene.remove(plateau);
  plateau = new THREE.Group();
  const w = grille.C * CASE, d = grille.R * CASE;
  const tex = toile(512, 512, (c, W, H) => {
    c.clearRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 5; c.setLineDash([22, 18]);
    for (let i = 1; i < grille.C; i++) { const x = (i / grille.C) * W; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let i = 1; i < grille.R; i++) { const y = (i / grille.R) * H; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    c.setLineDash([]); c.strokeStyle = '#ffffff'; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10);
  });
  const marquage = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  marquage.rotation.x = -Math.PI / 2; marquage.position.y = 0.005; plateau.add(marquage);
  scene.add(plateau);
}

function cellules(v) { const [dx, dz] = DIRS[v.dir]; return [[v.c, v.r], [v.c - dx, v.r - dz]]; }
function grilleOccupation(liste) {
  const g = new Map();
  for (const v of liste) if (!v.parti) for (const [c, r] of cellules(v)) g.set(c + ',' + r, v);
  return g;
}
/** distance libre devant une voiture (Infinity si elle peut sortir) */
function cheminLibre(v, liste) {
  const g = grilleOccupation(liste);
  const [dx, dz] = DIRS[v.dir];
  let c = v.c + dx, r = v.r + dz, pas = 0;
  while (c >= 0 && c < grille.C && r >= 0 && r < grille.R) {
    const o = g.get(c + ',' + r);
    if (o && o !== v) return pas;
    c += dx; r += dz; pas++;
  }
  return Infinity;
}

function generer(n) {
  for (let essai = 0; essai < 400; essai++) {
    const liste = [];
    let tentatives = 0;
    while (liste.length < n && tentatives++ < 600) {
      const dir = Math.floor(Math.random() * 4), [dx, dz] = DIRS[dir];
      const c = Math.floor(Math.random() * grille.C), r = Math.floor(Math.random() * grille.R);
      const tc = c - dx, tr = r - dz;
      if (tc < 0 || tc >= grille.C || tr < 0 || tr >= grille.R) continue;
      const g = grilleOccupation(liste);
      if (g.has(c + ',' + r) || g.has(tc + ',' + tr)) continue;
      // éviter deux voitures face à face sur la même ligne (blocage définitif)
      liste.push({ c, r, dir });
    }
    if (liste.length < n) continue;
    // vérifie qu'une solution existe (on retire tant qu'une voiture peut sortir)
    const copie = liste.map(v => ({ ...v })); let progres = true;
    while (progres) { progres = false; for (const v of copie) if (!v.parti && cheminLibre(v, copie) === Infinity) { v.parti = true; progres = true; } }
    const libresDebut = liste.filter(v => cheminLibre(v, liste) === Infinity).length;
    if (copie.every(v => v.parti) && libresDebut <= Math.max(2, n * 0.35)) return liste;
  }
  return null;
}

function parametresNiveau(n) {
  const C = Math.min(4 + Math.ceil(n / 2), 8), R = Math.min(5 + Math.ceil(n / 2), 9);
  const nb = Math.min(Math.round(C * R * (0.22 + Math.min(n, 12) * 0.022)), 26);
  return { C, R, nb };
}

function lancerNiveau() {
  voitures.forEach(v => scene.remove(v.obj)); voitures = [];
  const p = parametresNiveau(niveau);
  grille = { C: p.C, R: p.R };
  monde.redimensionner();
  construirePlateau();
  const liste = generer(p.nb) || generer(p.nb - 3);
  coeurs = 3; occupe = false;
  liste.forEach((v, i) => {
    const obj = voiture(choisir(COULEURS));
    obj.scale.setScalar(1.13);
    const fleche = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.85), matFleche);
    fleche.rotation.x = -Math.PI / 2; fleche.position.set(-0.15, 1.06, 0); obj.add(fleche);
    const [dx, dz] = DIRS[v.dir];
    obj.rotation.y = Math.atan2(-dz, dx);
    const centre = versMonde(v.c - dx / 2, v.r - dz / 2);
    obj.position.copy(centre).add(new THREE.Vector3(0, 6, 0));
    obj.traverse(m => { m.userData.voiture = v; });
    scene.add(obj);
    v.obj = obj; v.centre = centre;
    voitures.push(v);
    // arrivée en cascade
    setTimeout(() => anime(0.45, k => { obj.position.y = 6 * (1 - k); }, ease.rebond), i * 45);
  });
  ui.maj('niveau', niveau); ui.maj('coeurs', '♥'.repeat(coeurs));
  ui.maj('reste', voitures.length);
}

// ---------- Toucher une voiture ----------
monde.renderer.domElement.addEventListener('pointerdown', async e => {
  if (occupe) return;
  const hit = monde.toucher(e, voitures.filter(v => !v.parti).map(v => v.obj));
  if (!hit) return;
  const v = hit.object.userData.voiture;
  if (!v || v.parti || v.bouge) return;
  const libre = cheminLibre(v, voitures);
  const [dx, dz] = DIRS[v.dir];
  const dirV = new THREE.Vector3(dx, 0, dz);
  v.bouge = true;
  if (libre === Infinity) {
    son.moteur();
    v.parti = true;
    ui.maj('reste', voitures.filter(x => !x.parti).length);
    const depart = v.obj.position.clone();
    const distance = (Math.max(grille.C, grille.R) + 6) * CASE;
    monde.particules.jet(depart.clone().add(dirV.clone().multiplyScalar(-1.2)).setY(0.3), 0xd8d8d8, { n: 10, vitesse: 1.2, gravite: -1, vie: 0.8, taille: 0.12 });
    await anime(0.75, k => { v.obj.position.copy(depart).addScaledVector(dirV, distance * k); }, ease.entree);
    scene.remove(v.obj);
    if (voitures.every(x => x.parti)) victoire();
  } else {
    son.klaxon();
    const depart = v.obj.position.clone();
    const avance = libre * CASE + 0.25;
    await anime(0.16 + libre * 0.05, k => { v.obj.position.copy(depart).addScaledVector(dirV, avance * k); }, ease.entree);
    monde.particules.jet(v.obj.position.clone().addScaledVector(dirV, 1.1).setY(0.8), 0xffc928, { n: 14, vitesse: 3, vie: 0.4, eclat: 2 });
    await anime(0.3, k => { v.obj.position.copy(depart).addScaledVector(dirV, avance * (1 - k)); }, ease.sortie);
    coeurs--; ui.maj('coeurs', coeurs > 0 ? '♥'.repeat(coeurs) : '0');
    son.erreur();
    if (coeurs <= 0) defaite();
  }
  v.bouge = false;
});

async function victoire() {
  occupe = true; son.victoire();
  monde.particules.confettis(new THREE.Vector3(0, 2, 0), 90);
  const etoiles = etoilesPour(coeurs, 2, 3);
  niveau++; stock.ecrire('route-niveau', niveau);
  await ui.ecran({ titre: 'Route libre !', sousTitre: `Niveau ${niveau - 1} réussi`, etoiles, texte: 'Tout le monde roule enfin vers La Possession.', boutons: [{ id: 'ok', texte: 'Niveau suivant' }] });
  lancerNiveau();
}
async function defaite() {
  occupe = true;
  await ui.ecran({ titre: 'Gros bouchon…', texte: 'Trois coups de klaxon de trop ! Regarde bien les flèches avant de toucher une voiture.', boutons: [{ id: 'ok', texte: 'Réessayer' }] });
  lancerNiveau();
}

// ---------- Démarrage ----------
ui.init({ titre: 'Route du Littoral' });
ui.stat('niveau', 'Niveau', niveau);
ui.stat('reste', 'Voitures', 0);
ui.stat('coeurs', 'Klaxons', '♥♥♥');
son.ambiance('mer');
lancerNiveau();
ui.chargementFini();
ui.ecran({
  titre: 'Route du Littoral', sousTitre: 'Libère la route entre Saint-Denis et La Possession',
  texte: 'Chaque voiture ne peut avancer que dans le sens de sa flèche. Touche-la : si la voie est libre, elle s’en va. Si elle est bloquée, elle klaxonne… et tu perds un cœur.',
  info: 'La route du Littoral longe une haute falaise de basalte, au bord de l’océan Indien. Des filets la protègent des chutes de pierres, et ses embouteillages sont bien connus des Réunionnais.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
