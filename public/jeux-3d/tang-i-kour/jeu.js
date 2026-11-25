// =====================================================================
// TANG I KOUR - course sans fin façon « Subway Surfers »
// Le tangue court sur le chemin entre les champs de cannes. Change de voie,
// saute par-dessus les obstacles et ramasse les letchis.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, choisir, hasard, attendre } from '../commun/kwelafe.js';
import { tangue, champCannes, cocotier, kaz, flamboyant, galet, voiture, letchi, vanille, montagnes, piton, texAsphalte, texHerbe, ombrer } from '../commun/decor.js';

const VOIE = 1.7, SEGMENT = 40, NB_SEGMENTS = 4;
const monde = creerMonde({
  soleil: { elevation: 35, azimut: 160, intensite: 2.5 },
  ombre: { taille: 14, centre: new THREE.Vector3(0, 0, -6) },
  brouillard: { couleur: 0xbcd9ea, pres: 70, loin: 170 },
  cadrer(cam, ratio) {
    const portrait = ratio < 1;
    cam.fov = portrait ? 62 : 52;
    cam.position.set(0, portrait ? 3.6 : 3.2, portrait ? 6.8 : 6.2);
    cam.lookAt(0, 1.0, -5);
  },
});
const { scene, camera } = monde;

// ---------- Décor qui défile ----------
const fond = new THREE.Group(); scene.add(fond);
const m1 = montagnes(400, 60, 5); m1.position.set(0, -1, -180); fond.add(m1);
const pt = piton(60, 22, true); pt.position.set(70, -2, -150); fond.add(pt);
const segments = [];
const matChemin = new THREE.MeshStandardMaterial({ map: texAsphalte([3, 12]), color: 0xe0c9a6, roughness: 0.95 });
const matHerbe = new THREE.MeshStandardMaterial({ map: texHerbe([6, 20]), roughness: 1 });
function creerSegment(i) {
  const g = new THREE.Group();
  const chemin = new THREE.Mesh(new THREE.PlaneGeometry(VOIE * 3 + 0.8, SEGMENT), matChemin);
  chemin.rotation.x = -Math.PI / 2; chemin.receiveShadow = true; g.add(chemin);
  for (const s of [-1, 1]) {
    const h = new THREE.Mesh(new THREE.PlaneGeometry(40, SEGMENT), matHerbe);
    h.rotation.x = -Math.PI / 2; h.position.set(s * 22.7, -0.01, 0); h.receiveShadow = true; g.add(h);
    const champ = champCannes(9, SEGMENT, 0.55); champ.position.set(s * 8.6, 0, 0); g.add(champ);
  }
  // bordures de galets
  for (let z = -SEGMENT / 2; z < SEGMENT / 2; z += 1.3) for (const s of [-1, 1]) {
    const gl = galet(0.22 + Math.random() * 0.1); gl.position.set(s * (VOIE * 1.5 + 0.55), 0.05, z); g.add(gl);
  }
  g.position.z = -i * SEGMENT;
  decorerSegment(g);
  scene.add(g); segments.push(g);
}
function decorerSegment(g) {
  if (g.userData.extra) g.remove(g.userData.extra);
  const extra = new THREE.Group();
  const type = Math.random();
  const cote = Math.random() < 0.5 ? -1 : 1;
  if (type < 0.4) { const k = kaz(choisir([{ mur: '#f4c95d' }, { mur: '#8fd3e8', toit: '#2f6f5b' }, { mur: '#f28db2', toit: '#5b6770' }])); k.position.set(cote * 9, 0, hasard(-12, 12)); k.rotation.y = -cote * Math.PI / 2; k.scale.setScalar(0.9); extra.add(k); }
  else if (type < 0.7) { const f = flamboyant(1); f.position.set(cote * 6.5, 0, hasard(-15, 15)); extra.add(f); }
  for (let i = 0; i < 2; i++) { const c = cocotier(hasard(6, 8), 0.5); c.position.set((Math.random() < 0.5 ? -1 : 1) * hasard(4.6, 5.5), 0, hasard(-18, 18)); extra.add(c); }
  g.add(extra); g.userData.extra = extra;
}
for (let i = 0; i < NB_SEGMENTS; i++) creerSegment(i);

// ---------- Le tangue ----------
const heros = tangue(); heros.rotation.y = Math.PI; heros.scale.setScalar(1.15); scene.add(heros);
let voie = 0, xCible = 0, y = 0, vy = 0, auSol = true;

// ---------- Obstacles et letchis ----------
const objets = [];
function obstacle(type, v, z) {
  let o, h;
  if (type === 'galets') { o = new THREE.Group(); for (let i = 0; i < 4; i++) { const g = galet(0.38); g.position.set(hasard(-0.4, 0.4), 0.2 + (i > 2 ? 0.25 : 0), hasard(-0.3, 0.3)); o.add(g); } h = 0.7; }
  else if (type === 'bambou') {
    o = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xc9b26a, roughness: 0.6 });
    for (const yy of [0.25, 0.6]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 8), mat); b.rotation.z = Math.PI / 2; b.position.y = yy; o.add(b); }
    for (const x of [-0.65, 0.65]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), mat); p.position.set(x, 0.45, 0); o.add(p); }
    h = 0.75;
  } else { o = voiture(choisir([0xd32f2f, 0x1f6fd1, 0xffffff, 0x2fa84f])); o.rotation.y = Math.PI / 2; o.scale.setScalar(0.85); h = 9; }
  ombrer(o);
  o.position.set(v * VOIE, 0, z); scene.add(o);
  objets.push({ type: 'obstacle', o, v, h, profondeur: type === 'voiture' ? 1.0 : 0.45 });
}
const geoLetchi = letchi(0.26);
function bonus(v, z, rare) {
  const o = rare ? vanille() : geoLetchi.clone();
  if (rare) o.scale.setScalar(0.5);
  o.position.set(v * VOIE, 0.8, z); scene.add(o);
  objets.push({ type: rare ? 'vanille' : 'letchi', o, v });
}
let prochain = -25;
function generer(zLimite) {
  while (prochain > zLimite) {
    const motif = Math.random();
    const voies = [-1, 0, 1].sort(() => Math.random() - .5);
    if (motif < 0.35) obstacle(choisir(['galets', 'bambou']), voies[0], prochain);
    else if (motif < 0.6) { obstacle('voiture', voies[0], prochain); obstacle(choisir(['galets', 'bambou']), voies[1], prochain); }
    else if (motif < 0.75) { obstacle('voiture', voies[0], prochain); obstacle('voiture', voies[1], prochain - 2); }
    // une file de letchis sur la voie restante
    const vl = voies[2];
    for (let k = 0; k < 5; k++) bonus(vl, prochain + 3 - k * 1.4, k === 2 && Math.random() < 0.08);
    prochain -= hasard(11, 16) - Math.min(vitesse * 0.12, 3);
  }
}

// ---------- Contrôles : glisser, toucher les côtés, clavier ----------
function gauche() { if (voie > -1) { voie--; son.clic(); } }
function droite() { if (voie < 1) { voie++; son.clic(); } }
function sauter() { if (auSol && enCours) { vy = 9.2; auSol = false; son.saut(); } }
let depart = null;
const canvas = monde.renderer.domElement;
canvas.addEventListener('pointerdown', e => { depart = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  if (!depart || !enCours) return;
  const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
  if (Math.abs(dx) < 25 && Math.abs(dy) < 25) { // simple toucher
    if (e.clientY < window.innerHeight * 0.45) sauter();
    else if (e.clientX < window.innerWidth / 2) gauche(); else droite();
  } else if (Math.abs(dx) > Math.abs(dy)) { dx < 0 ? gauche() : droite(); }
  else if (dy < 0) sauter();
  depart = null;
});
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'q') gauche();
  if (e.key === 'ArrowRight' || e.key === 'd') droite();
  if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'z') sauter();
});

// ---------- Boucle de jeu ----------
let vitesse = 11, distance = 0, letchis = 0, enCours = false, meilleur = stock.lire('tang-meilleur', 0);
monde.chaque((dt, t) => {
  heros.maj(t, enCours ? vitesse / 11 : 0.3);
  fond.position.z = camera.position.z - 6;
  for (const o of objets) if (o.type !== 'obstacle') o.o.rotation.y += dt * 3;
  if (!enCours) return;
  vitesse = Math.min(11 + distance / 90, 24);
  const dz = vitesse * dt;
  distance += dz;
  // le monde avance vers le joueur
  for (const s of segments) { s.position.z += dz; if (s.position.z > SEGMENT) { s.position.z -= SEGMENT * NB_SEGMENTS; decorerSegment(s); } }
  for (const o of objets) o.o.position.z += dz;
  prochain += dz;
  generer(-110);
  // déplacements du tangue
  xCible = voie * VOIE;
  heros.position.x += (xCible - heros.position.x) * Math.min(1, dt * 14);
  heros.rotation.z = (heros.position.x - xCible) * 0.25;
  if (!auSol) { vy -= 26 * dt; y += vy * dt; if (y <= 0) { y = 0; auSol = true; monde.particules.jet(heros.position.clone(), 0xb8a58a, { n: 8, vitesse: 1.5, vie: 0.4, taille: 0.06 }); } }
  heros.position.y = y;
  // collisions
  for (let i = objets.length - 1; i >= 0; i--) {
    const o = objets[i], z = o.o.position.z;
    if (z > 8) { scene.remove(o.o); objets.splice(i, 1); continue; }
    const memeVoie = Math.abs(o.o.position.x - heros.position.x) < 0.8;
    if (!memeVoie || Math.abs(z) > (o.profondeur ?? 0.5) + 0.35) continue;
    if (o.type === 'obstacle') { if (y < o.h) { perdu(); return; } }
    else {
      scene.remove(o.o); objets.splice(i, 1);
      if (o.type === 'vanille') { letchis += 10; son.victoire(); ui.bulle('Vanille ! +10'); }
      else { letchis++; son.piece(); }
      monde.particules.jet(o.o.position.clone(), o.type === 'vanille' ? 0xffe9a8 : 0xd02040, { n: 10, vitesse: 2.5, vie: 0.5, eclat: 1.6 });
      ui.maj('letchis', letchis);
    }
  }
  ui.maj('distance', Math.floor(distance) + ' m');
});

async function perdu() {
  enCours = false;
  son.erreur();
  monde.particules.jet(heros.position.clone().setY(0.6), 0xffc928, { n: 30, vitesse: 4, vie: 0.6, eclat: 2 });
  anime(0.5, t => { heros.rotation.z = t * Math.PI * 2; heros.position.y = Math.sin(t * Math.PI) * 1.2; });
  const score = Math.floor(distance) + letchis * 10;
  if (score > meilleur) { meilleur = score; stock.ecrire('tang-meilleur', meilleur); ui.maj('record', meilleur); }
  await attendre(1);
  await ui.ecran({ titre: 'Bam !', sousTitre: `Score : ${score}`, etoiles: score >= 2000 ? 3 : score >= 800 ? 2 : 1, texte: `${Math.floor(distance)} m parcourus et ${letchis} letchis ramassés. Record : ${meilleur}.`, boutons: [{ id: 'ok', texte: 'Rejouer' }] });
  demarrer();
}
function demarrer() {
  objets.forEach(o => scene.remove(o.o)); objets.length = 0;
  prochain = -25; distance = 0; letchis = 0; vitesse = 11; voie = 0; y = 0; vy = 0; auSol = true;
  heros.position.set(0, 0, 0); heros.rotation.set(0, Math.PI, 0);
  ui.maj('letchis', 0); ui.maj('distance', '0 m');
  generer(-110);
  enCours = true;
}

ui.init({ titre: 'Tang i kour' });
ui.stat('distance', 'Distance', '0 m');
ui.stat('letchis', 'Letchis', 0);
ui.stat('record', 'Record', meilleur);
son.ambiance('foret');
generer(-110);
ui.chargementFini();
ui.ecran({
  titre: 'Tang i kour', sousTitre: 'Cours, petit tangue, cours !',
  texte: 'Glisse à gauche ou à droite pour changer de voie, glisse vers le haut pour sauter (ou touche les côtés et le haut de l’écran). Saute par-dessus les galets et les barrières de bambou, évite les voitures et ramasse un maximum de letchis.',
  info: 'Le tangue (Tenrec ecaudatus) est un petit mammifère au dos piquant, originaire de Madagascar. On le croise parfois à la tombée de la nuit, au bord des chemins et des champs de cannes.',
  boutons: [{ id: 'ok', texte: 'Courir' }],
}).then(demarrer);
