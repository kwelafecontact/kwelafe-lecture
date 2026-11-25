// =====================================================================
// KAR PÉI - jeu de tri façon « Bus Jam / Bus Fever »
// À la gare routière, chaque voyageur a sa destination (Saint-Denis,
// Saint-Pierre, Saint-Paul…). Fais monter chacun dans le bon car jaune.
// Un voyageur ne peut sortir de la foule que si un passage est libre.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, grain, melanger, attendre } from '../commun/kwelafe.js';
import { kar, personnage, flamboyant, kaz, montagnes, cocotier, etiquette, ombrer } from '../commun/decor.js';

const VILLES = [
  { nom: 'Saint-Denis', couleur: '#1f6fd1' },
  { nom: 'Saint-Pierre', couleur: '#e8402a' },
  { nom: 'Saint-Paul', couleur: '#2fa84f' },
  { nom: 'Saint-Benoît', couleur: '#8e44ad' },
  { nom: 'Saint-André', couleur: '#ff8c1a' },
  { nom: 'Saint-Louis', couleur: '#13a6b8' },
];
const CASE = 1.05, PLACES_BANC = 5, PLACES_KAR = 3;
let COLS = 6, ROWS = 6;
let niveau = stock.lire('kar-niveau', 1);
let cellules = [], voyageurs = [], banc = [], fileKars = [], karActuel = null, fini = false, bancMax = 0;

const monde = creerMonde({
  soleil: { elevation: 42, azimut: 210, intensite: 2.4 },
  ombre: { taille: 14 },
  brouillard: { couleur: 0xcfe6f3, pres: 60, loin: 220 },
  cadrer(cam, ratio) {
    const w = COLS * CASE + 3.5, d = ROWS * CASE + 7;
    const dist = Math.max(d * 0.85, (w / ratio) * 1.0) + 2;
    cam.position.set(0, dist * 0.72, dist * 0.72);
    cam.lookAt(0, 0, -1.6);
  },
});
const { scene } = monde;
const zBus = () => -(ROWS * CASE) / 2 - 3.4;
const zBanc = () => -(ROWS * CASE) / 2 - 1.3;

// ---------- Décor de la gare routière ----------
const texPave = toile(256, 256, (c, w, h) => {
  c.fillStyle = '#a99f8e'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x < w + 32; x += 32) {
    const v = 150 + Math.random() * 25; c.fillStyle = `rgb(${v},${v - 8},${v - 20})`; c.fillRect(x - 15, y + 1, 30, 30);
  }
  grain(c, w, h, 16);
}, { repeter: [12, 12] });
const sol = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: texPave, roughness: 0.9 }));
sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
const voie = new THREE.Mesh(new THREE.PlaneGeometry(80, 3.4), new THREE.MeshStandardMaterial({ color: 0x41454a, roughness: 0.9 }));
voie.rotation.x = -Math.PI / 2; voie.position.y = 0.01; scene.add(voie);
const bordure = new THREE.Mesh(new THREE.BoxGeometry(80, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
bordure.receiveShadow = true; scene.add(bordure);
const decor = new THREE.Group(); scene.add(decor);
function placerDecor() {
  decor.clear();
  voie.position.z = zBus(); bordure.position.set(0, 0.09, zBus() + 1.85);
  // panneau de la gare de l'autre côté de la voie (ne cache pas le car)
  const abri = new THREE.Group();
  const matP = new THREE.MeshStandardMaterial({ color: 0x2f6f5b, metalness: 0.4, roughness: 0.5 });
  for (const x of [-1.8, 1.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 8), matP); p.position.set(x, 1.6, zBus() - 2.3); abri.add(p); }
  decor.add(ombrer(abri));
  const panneau = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.7), new THREE.MeshStandardMaterial({
    map: toile(512, 96, (c, w, h) => { c.fillStyle = '#10204a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffc928'; c.font = '800 52px Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GARE ROUTIÈRE', w / 2, h / 2 + 3); }),
  }));
  panneau.position.set(0, 3.0, zBus() - 2.25); decor.add(panneau);
  // places du banc
  for (let i = 0; i < PLACES_BANC; i++) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }));
    p.position.copy(placeBanc(i)).setY(0.03); p.receiveShadow = true; decor.add(p);
  }
  // fond : flamboyants, kaz, cocotiers, montagnes
  const f1 = flamboyant(0.9); f1.position.set(-8, 0, zBus() - 4); decor.add(f1);
  const f2 = flamboyant(0.8); f2.position.set(8.5, 0, zBus() - 5); decor.add(f2);
  const k = kaz({ mur: '#f6d06a', toit: '#b8352a', volets: '#2f8f5b' }); k.position.set(1, 0, zBus() - 8); k.scale.setScalar(0.9); decor.add(k);
  const k2 = kaz({ mur: '#8fd3e8', toit: '#5b6770', volets: '#ffffff', varangue: false }); k2.position.set(-14, 0, zBus() - 9); k2.rotation.y = 0.4; decor.add(k2);
  for (const [x, z] of [[12, 2], [-12, 1], [13, -3]]) { const c = cocotier(6, 0.7); c.position.set(x, 0, z); decor.add(c); }
  const m = montagnes(260, 45, 3); m.position.set(0, -0.5, zBus() - 75); decor.add(m);
}
function placeBanc(i) { return new THREE.Vector3((i - (PLACES_BANC - 1) / 2) * 1.1, 0, zBanc()); }
function versMonde(c, r) { return new THREE.Vector3((c - (COLS - 1) / 2) * CASE, 0, (r - (ROWS - 1) / 2) * CASE); }

// ---------- Génération du niveau ----------
function lancerNiveau() {
  voyageurs.forEach(v => scene.remove(v.obj)); banc.forEach(v => v && scene.remove(v.obj));
  if (karActuel) scene.remove(karActuel.obj);
  fileKars.forEach(k => k.obj && scene.remove(k.obj));
  const nbVilles = Math.min(3 + Math.floor((niveau - 1) / 2), 6);
  COLS = 6; ROWS = Math.min(5 + Math.floor(niveau / 3), 8);
  monde.redimensionner(); placerDecor();
  const total = COLS * ROWS;
  const nbObstacles = Math.min(Math.floor(niveau / 2), 5);
  let nbVoyageurs = Math.floor((total - nbObstacles) / 3) * 3;
  nbVoyageurs = Math.min(nbVoyageurs, nbVilles * 3 * Math.ceil(nbVoyageurs / (nbVilles * 3)));
  // répartition par ville en multiples de 3
  const parVille = new Array(nbVilles).fill(0);
  for (let i = 0; i < nbVoyageurs / 3; i++) parVille[i % nbVilles] += 3;
  const sacs = [];
  parVille.forEach((n, v) => { for (let i = 0; i < n; i++) sacs.push(v); });
  melanger(sacs);
  cellules = []; voyageurs = []; banc = new Array(PLACES_BANC).fill(null); fini = false; bancMax = 0;
  const positions = melanger([...Array(total).keys()]);
  const obstacles = new Set(positions.slice(0, nbObstacles).filter(i => Math.floor(i / COLS) > 0));
  let k = 0;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c;
    if (obstacles.has(i)) {
      const bac = new THREE.Group();
      const pot = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), new THREE.MeshStandardMaterial({ color: 0xb06a3c, roughness: 0.8 }));
      pot.position.y = 0.25; bac.add(pot);
      const plante = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), new THREE.MeshStandardMaterial({ color: 0x3f8a35, roughness: 0.8 }));
      plante.position.y = 0.75; bac.add(plante);
      bac.position.copy(versMonde(c, r)); scene.add(ombrer(bac)); voyageurs.push({ obstacle: true, obj: bac });
      cellules[i] = 'X';
    } else if (k < sacs.length) {
      const ville = sacs[k++];
      const obj = personnage(new THREE.Color(VILLES[ville].couleur).getHex());
      const disque = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ color: VILLES[ville].couleur, roughness: 0.6 }));
      disque.rotation.x = -Math.PI / 2; disque.position.y = 0.015; obj.add(disque);
      obj.position.copy(versMonde(c, r));
      obj.rotation.y = Math.PI + (Math.random() - .5) * 0.6;
      const v = { ville, c, r, obj };
      obj.traverse(m => { m.userData.voyageur = v; });
      scene.add(obj); voyageurs.push(v); cellules[i] = v;
      const y0 = Math.random() * 0.4;
      anime(0.5 + Math.random() * 0.3, t => { obj.scale.setScalar(t); }, ease.rebond);
      v.y0 = y0;
    }
  }
  // ordre des cars : villes dont les voyageurs sont les plus proches du quai d'abord (avec un peu de hasard)
  const moyenne = parVille.map((n, v) => { const l = voyageurs.filter(x => x.ville === v); return l.reduce((s, x) => s + x.r, 0) / l.length + Math.random() * 1.5; });
  const restants = parVille.map(n => n / PLACES_KAR);
  fileKars = [];
  while (restants.some(n => n > 0)) {
    const ordre = restants.map((n, v) => v).filter(v => restants[v] > 0).sort((a, b) => moyenne[a] - moyenne[b] + (Math.random() - .5) * 2.2);
    const v = ordre[0]; restants[v]--; moyenne[v] += 1.2;
    fileKars.push({ ville: v });
  }
  ui.maj('niveau', niveau); majCompteur();
  karActuel = null;
  arriveeKar();
}
function majCompteur() { ui.maj('kars', fileKars.length + (karActuel ? 1 : 0)); }

// ---------- Les cars ----------
async function arriveeKar() {
  if (!fileKars.length) { karActuel = null; return; }
  const info = fileKars.shift();
  const v = VILLES[info.ville];
  const obj = kar(v.nom, v.couleur);
  obj.position.set(-30, 0, zBus());
  // pastilles de places au-dessus du car
  const places = [];
  for (let i = 0; i < PLACES_KAR; i++) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.4 }));
    p.position.set(-0.45 + i * 0.45, 2.35, 0); obj.add(p); places.push(p);
  }
  const nom = etiquette(v.nom, { fond: v.couleur, largeur: 2.6, police: 60 });
  nom.position.set(0, 2.95, 0); nom.rotation.x = -0.75; obj.add(nom);
  scene.add(obj);
  karActuel = { ...info, obj, places, montes: 0, reserves: 0, pret: false };
  majCompteur();
  son.moteur();
  await anime(1.1, k => { obj.position.x = -30 * (1 - k); }, ease.sortie);
  karActuel.pret = true;
  // les voyageurs du banc qui vont dans cette ville montent tout de suite
  for (let i = 0; i < PLACES_BANC; i++) {
    const p = banc[i];
    if (p && p.ville === karActuel.ville && karActuel.reserves < PLACES_KAR) {
      banc[i] = null; karActuel.reserves++;
      monter(p, [p.obj.position.clone()]);
      await attendre(0.12);
    }
  }
}
async function monter(p, chemin) {
  const k = karActuel;
  const porte = new THREE.Vector3(1.6, 0, zBus() + 0.9);
  await marcher(p, [...chemin, porte]);
  await anime(0.2, t => { p.obj.scale.setScalar(1 - t); p.obj.position.z = porte.z - t * 0.6; });
  scene.remove(p.obj);
  k.places[k.montes].material = new THREE.MeshStandardMaterial({ color: VILLES[k.ville].couleur, emissive: VILLES[k.ville].couleur, emissiveIntensity: 1.6 });
  k.montes++;
  son.pop();
  monde.particules.jet(k.obj.position.clone().add(new THREE.Vector3(-0.45 + (k.montes - 1) * 0.45, 2.35, 0)), VILLES[k.ville].couleur, { n: 12, vitesse: 2.5, vie: 0.6, eclat: 2 });
  if (k.montes === PLACES_KAR) {
    son.succes();
    await attendre(0.25);
    son.moteur();
    const x0 = k.obj.position.x;
    anime(1.0, t => { k.obj.position.x = x0 + t * 32; }, ease.entree).then(() => scene.remove(k.obj));
    karActuel = null; majCompteur();
    await attendre(0.35);
    if (!fileKars.length) { victoire(); return; }
    arriveeKar();
  }
}
async function marcher(p, points) {
  for (const pt of points) {
    const depart = p.obj.position.clone();
    const d = depart.distanceTo(pt);
    if (d < 0.01) continue;
    p.obj.rotation.y = Math.atan2(pt.x - depart.x, pt.z - depart.z);
    await anime(d / 7, t => { p.obj.position.lerpVectors(depart, pt, t); p.obj.position.y = Math.abs(Math.sin(t * d * 3)) * 0.12; }, ease.lin);
  }
  p.obj.position.y = 0;
}

// ---------- Chemin dans la foule (parcours en largeur) ----------
function chemin(depart) {
  const prev = new Map(), file = [[depart.c, depart.r]], cle = (c, r) => c + ',' + r;
  prev.set(cle(depart.c, depart.r), null);
  while (file.length) {
    const [c, r] = file.shift();
    if (r === 0) { // sortie vers le quai
      const pts = []; let k = cle(c, r);
      while (k) { const [cc, rr] = k.split(',').map(Number); pts.unshift(versMonde(cc, rr)); k = prev.get(k); }
      pts.push(versMonde(c, -1));
      return pts;
    }
    for (const [dc, dr] of [[0, -1], [1, 0], [-1, 0], [0, 1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || prev.has(cle(nc, nr))) continue;
      if (cellules[nr * COLS + nc]) continue;
      prev.set(cle(nc, nr), cle(c, r)); file.push([nc, nr]);
    }
  }
  return null;
}

// ---------- Toucher un voyageur ----------
monde.renderer.domElement.addEventListener('pointerdown', async e => {
  if (fini) return;
  const cibles = voyageurs.filter(v => !v.obstacle && !v.parti).map(v => v.obj);
  const hit = monde.toucher(e, cibles);
  if (!hit) return;
  const p = hit.object.userData.voyageur;
  if (!p || p.parti) return;
  const pts = chemin(p);
  if (!pts) {
    son.erreur();
    const x0 = p.obj.position.x;
    anime(0.35, t => { p.obj.position.x = x0 + Math.sin(t * 30) * 0.08 * (1 - t); });
    return;
  }
  pts.shift(); // la case de départ
  const versKar = karActuel && karActuel.pret && karActuel.ville === p.ville && karActuel.reserves < PLACES_KAR;
  if (!versKar && banc.indexOf(null) < 0) { defaite(); return; }
  p.parti = true; cellules[p.r * COLS + p.c] = null;
  if (versKar) {
    karActuel.reserves++;
    monter(p, pts);
  } else {
    const libre = banc.indexOf(null);
    banc[libre] = p;
    son.clic();
    await marcher(p, [...pts, placeBanc(libre)]);
    p.obj.rotation.y = 0;
    bancMax = Math.max(bancMax, banc.filter(Boolean).length);
    // si le car attendu est arrivé entre-temps
    if (karActuel && karActuel.pret && karActuel.ville === p.ville && karActuel.reserves < PLACES_KAR && banc[libre] === p) {
      banc[libre] = null; karActuel.reserves++; monter(p, [p.obj.position.clone()]);
    } else if (banc.every(Boolean)) {
      ui.bulle('Quai plein !', '#ff8c1a');
    }
  }
});

async function victoire() {
  if (fini) return; fini = true;
  son.victoire();
  monde.particules.confettis(new THREE.Vector3(0, 2.5, zBanc()), 90);
  const etoiles = bancMax <= 2 ? 3 : bancMax <= 4 ? 2 : 1;
  niveau++; stock.ecrire('kar-niveau', niveau);
  await ui.ecran({ titre: 'Tout le monde est parti !', sousTitre: `Niveau ${niveau - 1} réussi`, etoiles, texte: 'Les cars jaunes roulent vers toute l’île.', boutons: [{ id: 'ok', texte: 'Niveau suivant' }] });
  lancerNiveau();
}
async function defaite() {
  if (fini) return; fini = true;
  son.erreur();
  await ui.ecran({ titre: 'Le quai est plein !', texte: 'Plus de place pour attendre. Fais d’abord sortir les voyageurs du car qui est à quai.', boutons: [{ id: 'ok', texte: 'Réessayer' }] });
  lancerNiveau();
}

ui.init({ titre: 'Kar Péi' });
ui.stat('niveau', 'Niveau', niveau);
ui.stat('kars', 'Cars', 0);
son.ambiance('ville');
lancerNiveau();
ui.chargementFini();
ui.ecran({
  titre: 'Kar Péi', sousTitre: 'La gare routière est pleine de voyageurs',
  texte: 'Touche un voyageur pour le faire sortir de la foule. S’il va dans la ville du car à quai, il monte. Sinon, il attend sur une des 5 places du quai. Si le quai est plein, c’est perdu !',
  info: 'Les cars jaunes du réseau interurbain relient les grandes villes de l’île : Saint-Denis, Saint-Paul, Saint-Pierre, Saint-Benoît, Saint-André, Saint-Louis…',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
