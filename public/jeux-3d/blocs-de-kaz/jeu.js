// =====================================================================
// BLOCS DE KAZ - puzzle de blocs façon « Block Blast »
// Glisse les pièces sur la varangue (grille 8 x 8). Chaque ligne ou colonne
// complète disparaît… et fait avancer la construction d'une kaz créole.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, grain, choisir, attendre } from '../commun/kwelafe.js';
import { kaz, cocotier, bananier, montagnes, solHerbe, flamboyant, texPlanches, ombrer } from '../commun/decor.js';

const N = 8, CASE = 1;
const TEINTES = ['#f4c95d', '#8fd3e8', '#f28db2', '#7bc96f', '#e8573f', '#b48be0', '#ffa24c'];
const FORMES = [
  [[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [1, 1]], [[0, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [1, 2], [0, 2]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
];

let grille, pieces, score, meilleur = stock.lire('blocs-meilleur', 0), serie, lignesTotal, numeroKaz, maKaz, fini;
let portrait = true;
const monde = creerMonde({
  soleil: { elevation: 40, azimut: 215, intensite: 2.4 },
  ombre: { taille: 16 },
  brouillard: { couleur: 0xcfe6f3, pres: 60, loin: 240 },
  cadrer(cam, ratio) {
    portrait = ratio < 1.05;
    if (portrait) {
      const dist = Math.max(17, 13.5 / ratio);
      cam.position.set(0, dist * 0.92, dist * 0.7 + 2);
      cam.lookAt(0, 0, -1.3);
    } else {
      const dist = Math.max(16, 26 / ratio);
      cam.position.set(-3.5, dist * 0.9, dist * 0.5 + 1);
      cam.lookAt(-3.5, 0, 0.3);
    }
    placerKaz();
  },
});
const { scene } = monde;

// ---------- Décor ----------
scene.add(solHerbe(240));
const varangue = new THREE.Mesh(new THREE.BoxGeometry(N * CASE + 0.8, 0.5, N * CASE + 0.8), new THREE.MeshStandardMaterial({ map: texPlanches('#a8743f', [4, 1]), roughness: 0.8 }));
varangue.position.y = -0.25; varangue.receiveShadow = true; varangue.castShadow = true; scene.add(varangue);
const texCase = toile(256, 256, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.strokeStyle = 'rgba(60,30,10,.45)'; c.lineWidth = 3;
  for (let i = 0; i <= N; i++) { const p = i / N * w; c.beginPath(); c.moveTo(p, 0); c.lineTo(p, h); c.stroke(); c.beginPath(); c.moveTo(0, p); c.lineTo(w, p); c.stroke(); }
});
const quadrillage = new THREE.Mesh(new THREE.PlaneGeometry(N * CASE, N * CASE), new THREE.MeshBasicMaterial({ map: texCase, transparent: true, depthWrite: false }));
quadrillage.rotation.x = -Math.PI / 2; quadrillage.position.y = 0.006; scene.add(quadrillage);
const plateauTray = new THREE.Mesh(new THREE.BoxGeometry(N * CASE + 0.8, 0.3, 3.4), new THREE.MeshStandardMaterial({ color: 0x5b3a22, roughness: 0.8 }));
plateauTray.position.set(0, -0.35, N / 2 + 2.5); plateauTray.receiveShadow = true; scene.add(plateauTray);
for (const [x, z, h] of [[-9, -6, 7], [9, -8, 6.5], [-11, 4, 6], [11, 5, 7]]) { const c = cocotier(h, 0.6); c.position.set(x, 0, z); scene.add(c); }
for (const [x, z] of [[-7.5, -11], [7, -12]]) { const b = bananier(3); b.position.set(x, 0, z); scene.add(b); }
const f = flamboyant(0.9); f.position.set(10, 0, -16); scene.add(f);
const mont = montagnes(300, 50, 7); mont.position.set(0, -0.5, -90); scene.add(mont);

// ---------- Bloc arrondi (planche peinte) ----------
const geoBloc = (() => {
  const s = new THREE.Shape(), a = 0.44, r = 0.1;
  s.moveTo(-a + r, -a); s.lineTo(a - r, -a); s.quadraticCurveTo(a, -a, a, -a + r); s.lineTo(a, a - r); s.quadraticCurveTo(a, a, a - r, a);
  s.lineTo(-a + r, a); s.quadraticCurveTo(-a, a, -a, a - r); s.lineTo(-a, -a + r); s.quadraticCurveTo(-a, -a, -a + r, -a);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.42, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3, curveSegments: 6 });
  g.rotateX(-Math.PI / 2); g.translate(0, 0.06, 0);
  return g;
})();
const texBloc = texPlanches('#ffffff', [1, 1]);
const materiaux = TEINTES.map(t => new THREE.MeshPhysicalMaterial({ map: texBloc, color: t, roughness: 0.7, clearcoat: 0.5, clearcoatRoughness: 0.3 }));
function bloc(teinte) { const m = new THREE.Mesh(geoBloc, materiaux[teinte]); m.castShadow = m.receiveShadow = true; return m; }
const matFantome = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });

// ---------- État ----------
const centreCase = (c, r) => new THREE.Vector3((c - (N - 1) / 2) * CASE, 0, (r - (N - 1) / 2) * CASE);
const slotTray = i => new THREE.Vector3((i - 1) * 3, 0.1, N / 2 + 2.5);

// ---------- La kaz qui se construit ----------
const COULEURS_KAZ = [
  { mur: '#f4c95d', toit: '#b8352a', volets: '#2f8f5b' }, { mur: '#8fd3e8', toit: '#5b6770', volets: '#ffffff' },
  { mur: '#f28db2', toit: '#2f6f5b', volets: '#ffffff' }, { mur: '#ffffff', toit: '#c0392b', volets: '#1f6fd1' },
  { mur: '#b6e3a1', toit: '#7a4a2a', volets: '#e8573f' },
];
const ETAPES = 12;
function nouvelleKaz() {
  if (maKaz) scene.remove(maKaz.groupe);
  const g = kaz(COULEURS_KAZ[(numeroKaz - 1) % COULEURS_KAZ.length]);
  g.scale.setScalar(0.85);
  // silhouette transparente de la kaz à construire (pour montrer l'objectif)
  const fantomeKaz = kaz(COULEURS_KAZ[(numeroKaz - 1) % COULEURS_KAZ.length]);
  const matF = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.13, depthWrite: false });
  fantomeKaz.traverse(m => { if (m.isMesh) { m.material = matF; m.castShadow = false; } });
  g.add(fantomeKaz);
  const morceaux = g.children.filter(m => m !== fantomeKaz);
  morceaux.forEach((m, i) => { if (i > 0) m.visible = false; });
  maKaz = { groupe: g, morceaux, etape: 0 };
  scene.add(g); placerKaz();
}
function placerKaz() {
  if (!maKaz) return;
  if (portrait) { maKaz.groupe.position.set(0, 0, -N / 2 - 5.2); maKaz.groupe.rotation.y = 0; }
  else { maKaz.groupe.position.set(-N / 2 - 5.5, 0, -1); maKaz.groupe.rotation.y = 0.5; }
}
async function avancerKaz(nb) {
  for (let i = 0; i < nb; i++) {
    if (maKaz.etape >= ETAPES) break;
    maKaz.etape++;
    const avant = Math.ceil((maKaz.morceaux.length - 1) * (maKaz.etape - 1) / ETAPES) + 1;
    const apres = Math.ceil((maKaz.morceaux.length - 1) * maKaz.etape / ETAPES) + 1;
    for (let k = avant; k < apres; k++) {
      const m = maKaz.morceaux[k]; m.visible = true;
      const s0 = m.scale.clone();
      anime(0.5, t => m.scale.copy(s0).multiplyScalar(Math.max(t, 0.01)), ease.rebond);
    }
    const p = maKaz.groupe.position.clone().add(new THREE.Vector3(0, 2, 0));
    monde.particules.jet(p, 0xffe9a8, { n: 14, vitesse: 3, vie: 0.7, eclat: 1.6, dispersion: 3 });
  }
  if (maKaz.etape >= ETAPES) {
    son.victoire();
    ui.bulle(`Kaz n° ${numeroKaz} finie !`);
    monde.particules.confettis(maKaz.groupe.position.clone().add(new THREE.Vector3(0, 4, 0)), 80);
    score += 200; ui.maj('score', score);
    await attendre(2.2);
    numeroKaz++; ui.maj('kaz', numeroKaz - 1);
    nouvelleKaz();
  }
}

// ---------- Pièces ----------
function peutPoser(forme, c0, r0) {
  return forme.every(([x, z]) => { const c = c0 + x, r = r0 + z; return c >= 0 && c < N && r >= 0 && r < N && !grille[r][c]; });
}
function poseQuelquePart(forme) {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (peutPoser(forme, c, r)) return true;
  return false;
}
function creerPiece(i) {
  let forme;
  for (let k = 0; k < 25; k++) { forme = choisir(FORMES); if (poseQuelquePart(forme)) break; }
  const teinte = Math.floor(Math.random() * TEINTES.length);
  const g = new THREE.Group();
  const lx = Math.max(...forme.map(f => f[0])), lz = Math.max(...forme.map(f => f[1]));
  for (const [x, z] of forme) { const b = bloc(teinte); b.position.set((x - lx / 2) * CASE, 0, (z - lz / 2) * CASE); g.add(b); }
  g.position.copy(slotTray(i)); g.scale.setScalar(0.7);
  g.traverse(m => { m.userData.piece = i; });
  scene.add(g);
  anime(0.35, t => g.scale.setScalar(0.7 * t), ease.rebond);
  return { forme, teinte, g, lx, lz, utilisee: false };
}
function nouvellesPieces() { pieces = [0, 1, 2].map(creerPiece); }

// ---------- Glisser-déposer ----------
let prise = null;
const fantome = new THREE.Group(); scene.add(fantome);
const canvas = monde.renderer.domElement;
canvas.addEventListener('pointerdown', e => {
  if (fini) return;
  const hit = monde.toucher(e, pieces.filter(p => !p.utilisee).map(p => p.g));
  if (!hit) return;
  const p = pieces[hit.object.userData.piece];
  prise = p; son.clic();
  anime(0.12, t => p.g.scale.setScalar(0.7 + 0.3 * t));
  deplacer(e);
});
function caseSous(p) {
  const pos = p.g.position;
  const c0 = Math.round(pos.x / CASE + (N - 1) / 2 - p.lx / 2);
  const r0 = Math.round(pos.z / CASE + (N - 1) / 2 - p.lz / 2);
  return [c0, r0];
}
function deplacer(e) {
  if (!prise) return;
  const pt = monde.versPlan(e, 0.5);
  if (!pt) return;
  // la pièce flotte au-dessus du doigt pour rester visible
  prise.g.position.set(pt.x, 0.7, pt.z - 2.0);
  const [c0, r0] = caseSous(prise);
  fantome.clear();
  if (peutPoser(prise.forme, c0, r0)) {
    for (const [x, z] of prise.forme) { const m = new THREE.Mesh(geoBloc, matFantome); m.position.copy(centreCase(c0 + x, r0 + z)); fantome.add(m); }
  }
}
canvas.addEventListener('pointermove', deplacer);
canvas.addEventListener('pointerup', async () => {
  if (!prise) return;
  const p = prise; prise = null; fantome.clear();
  const [c0, r0] = caseSous(p);
  if (!peutPoser(p.forme, c0, r0)) {
    const dep = p.g.position.clone();
    anime(0.25, t => { p.g.position.lerpVectors(dep, slotTray(pieces.indexOf(p)), t); p.g.scale.setScalar(1 - 0.3 * t); });
    return;
  }
  p.utilisee = true; scene.remove(p.g);
  son.pose();
  for (const [x, z] of p.forme) {
    const b = bloc(p.teinte); b.position.copy(centreCase(c0 + x, r0 + z)); b.position.y = 0.5;
    scene.add(b); grille[r0 + z][c0 + x] = b;
    anime(0.18, t => { b.position.y = 0.5 * (1 - t); }, ease.entree);
  }
  score += p.forme.length; ui.maj('score', score);
  await attendre(0.2);
  await verifierLignes();
  if (pieces.every(q => q.utilisee)) nouvellesPieces();
  if (!pieces.some(q => !q.utilisee && poseQuelquePart(q.forme))) finPartie();
});

async function verifierLignes() {
  const lignes = [], colonnes = [];
  for (let r = 0; r < N; r++) if (grille[r].every(Boolean)) lignes.push(r);
  for (let c = 0; c < N; c++) if (grille.every(l => l[c])) colonnes.push(c);
  const nb = lignes.length + colonnes.length;
  if (!nb) { serie = 0; return; }
  serie++;
  const aVider = new Set();
  lignes.forEach(r => grille[r].forEach((b, c) => aVider.add(r + ',' + c)));
  colonnes.forEach(c => grille.forEach((l, r) => aVider.add(r + ',' + c)));
  son.combo(serie + nb);
  const gain = nb * 10 * nb * Math.max(1, serie);
  score += gain; ui.maj('score', score);
  if (nb > 1 || serie > 1) ui.bulle(nb > 1 ? `Combo x${nb} !` : `Série x${serie} !`);
  let i = 0;
  for (const cle of aVider) {
    const [r, c] = cle.split(',').map(Number);
    const b = grille[r][c]; grille[r][c] = null;
    const delai = i++ * 0.02;
    setTimeout(() => {
      monde.particules.jet(b.position.clone().setY(0.4), b.material.color, { n: 8, vitesse: 4, vie: 0.7, taille: 0.1, eclat: 1.4 });
      anime(0.25, t => { b.scale.setScalar(1 + t * 0.4); b.position.y = t * 0.8; b.rotation.y = t * 2; }).then(() => scene.remove(b));
    }, delai * 1000);
  }
  lignesTotal += nb;
  await avancerKaz(nb);
}

async function finPartie() {
  fini = true;
  if (score > meilleur) { meilleur = score; stock.ecrire('blocs-meilleur', meilleur); }
  son.erreur();
  const r = await ui.ecran({ titre: 'Plus de place !', sousTitre: `Score : ${score}`, texte: `Kaz construites : ${numeroKaz - 1}. Meilleur score : ${meilleur}.`, boutons: [{ id: 'ok', texte: 'Rejouer' }] });
  nouvellePartie();
}

function nouvellePartie() {
  if (grille) grille.flat().forEach(b => b && scene.remove(b));
  if (pieces) pieces.forEach(p => scene.remove(p.g));
  grille = Array.from({ length: N }, () => new Array(N).fill(null));
  score = 0; serie = 0; lignesTotal = 0; numeroKaz = 1; fini = false;
  ui.maj('score', 0); ui.maj('kaz', 0); ui.maj('record', meilleur);
  nouvelleKaz(); nouvellesPieces();
}

ui.init({ titre: 'Blocs de kaz' });
ui.stat('score', 'Score', 0);
ui.stat('kaz', 'Kaz', 0);
ui.stat('record', 'Record', meilleur);
son.ambiance('foret');
nouvellePartie();
ui.chargementFini();
ui.ecran({
  titre: 'Blocs de kaz', sousTitre: 'Construis des kaz créoles, ligne après ligne',
  texte: 'Fais glisser les pièces sur la varangue. Une ligne ou une colonne pleine disparaît et fait avancer la construction de la kaz : soubassement, murs, toit en tôle, lambrequins, contrevents…',
  info: 'La kaz créole réunionnaise se reconnaît à sa toiture en tôle, à sa varangue (la véranda) et à ses lambrequins, ces frises de bois découpé qui ornent le bord du toit.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
