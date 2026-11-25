// =====================================================================
// PIXEL PÉI - puzzle de tapis roulant façon « Pixel Flow »
// Une image de La Réunion est cachée sous des pixels blancs. Lance les pots
// de peinture sur le tapis : chacun peint, en tournant, le premier pixel
// blanc qu'il voit dans sa ligne… seulement si c'est sa couleur.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, melanger, attendre } from '../commun/kwelafe.js';
import { cocotier, montagnes, solHerbe, ocean, flamboyant, texPlanches, ombrer } from '../commun/decor.js';

// ---------- Les images (16 x 16) ----------
const IMAGES = [
  {
    titre: 'Le paille-en-queue', palette: { '.': '#6ec6f0', w: '#ffffff', k: '#1b1b1b', o: '#ff9a1f', g: '#c9d6de' },
    lignes: ['................', '.......kk.......', '......kww.......', '......www.......', '.....gwww.......', '.....www........', '.owwkwwwwwwg....', 'oowwwwwwwwwwwww.', '...gwwwwwwwg..ww', '......www.......', '......gww.......', '.......ww.......', '.......kw.......', '........k.......', '................', '................'],
    info: 'Le paille-en-queue (Phaethon lepturus), « payanké » en créole, est l’oiseau emblème de La Réunion. On le reconnaît à ses deux longues plumes blanches au bout de la queue. Il niche dans les falaises et les remparts.',
  },
  {
    titre: 'Le Piton de la Fournaise', palette: { '.': '#7cc8f2', r: '#ff4b1f', y: '#ffc928', b: '#3b2a24', m: '#6b4a36', v: '#3f8a35', f: '#d9d9d9' },
    lignes: ['......ff........', '.....fff.ff.....', '......ffff......', '.......ry.......', '......ryyr......', '.....bbrrbb.....', '....bbbrbbbb....', '...bbmbrbmbbb...', '...bmmbbrmmbb...', '..bmmmbbrrmmbb..', '.bmmmmmbbrmmmmb.', 'bmmmmmmmbrrmmmmb', 'vmmmmmmmmbrmmmmv', 'vvvmmmmmmmrrmmvv', 'vvvvvvmmmmmrrvvv', 'vvvvvvvvvvvvrvvv'],
    info: 'Le Piton de la Fournaise, dans le sud-est de l’île, est l’un des volcans les plus actifs du monde. Ses éruptions sont surveillées en permanence par l’Observatoire volcanologique.',
  },
  {
    titre: 'Les letchis', palette: { '.': '#fff3d6', r: '#c8203a', d: '#8a1426', p: '#ff6b6b', v: '#3f8a35', n: '#6b4a2a' },
    lignes: ['.......nn.vv....', '......n..vvvv...', '.....n....vv....', '....n.n.........', '...n...n........', '..rrr..rrr......', '.rprrr.rprr.n...', '.rrrrr.rrrrrn...', '.drrrd.drrd.n...', '..ddd...dd.rrr..', '..........rprrr.', '....rrr...rrrrr.', '...rprrr..drrrd.', '...rrrrr...ddd..', '...drrrd........', '....ddd.........'],
    info: 'Le letchi est le fruit des fêtes de fin d’année à La Réunion : sa saison va de novembre à janvier. Sous sa coque rouge et rugueuse se cache une chair blanche et sucrée.',
  },
  {
    titre: 'La kaz créole', palette: { '.': '#8fd3f5', t: '#b8352a', w: '#ffffff', j: '#f4c95d', v: '#2f8f5b', g: '#4f9a36', s: '#5a5a5a' },
    lignes: ['................', '................', '.......tt.......', '......tttt......', '.....tttttt.....', '....tttttttt....', '...tttttttttt...', '..tttttttttttt..', '..wjwjwwjwjwjw..', '...jjjjjjjjjj...', '...jvjjvvjjvj...', '...jvjjvvjjvj...', '...jjjjvvjjjj...', '..ssssssssssss..', 'gggggggggggggggg', 'gggggggggggggggg'],
    info: 'La kaz créole a souvent un toit en tôle, des murs en bois peints de couleurs vives, des contrevents et des lambrequins blancs découpés en bord de toiture.',
  },
];
const N = 16, T = 0.5; // pixels par côté, taille d'un pixel
const CAPACITE_TAPIS = 5, PLACES_ATTENTE = 5, VITESSE = 7; // cases par seconde

let niveau = stock.lire('pixel-niveau', 1);
const monde = creerMonde({
  soleil: { elevation: 50, azimut: 200, intensite: 2.3 },
  ombre: { taille: 10 },
  brouillard: { couleur: 0xcfe6f3, pres: 60, loin: 260 },
  cadrer(cam, ratio) {
    const dist = ratio < 1 ? Math.max(16, 13.2 / ratio) : 21.5;
    cam.position.set(0, dist * 0.93, dist * 0.42 + 1.5);
    cam.lookAt(0, 0, ratio < 1 ? 2.1 : 1.4);
  },
});
const { scene } = monde;

// ---------- Décor : table d'atelier dehors, au bord de l'océan ----------
scene.add(solHerbe(240));
const mer = ocean(600); mer.position.set(0, -2, -200); scene.add(mer);
monde.chaque((dt, t) => mer.maj(t));
const table = new THREE.Mesh(new THREE.BoxGeometry(N * T + 3.2, 0.6, N * T + 7.2), new THREE.MeshStandardMaterial({ map: texPlanches('#8a5a32', [5, 1]), roughness: 0.75 }));
table.position.set(0, -0.3, 1.9); table.receiveShadow = table.castShadow = true; scene.add(table);
for (const [x, z] of [[-9, -5], [9, -6], [-10, 6], [10, 5]]) { const c = cocotier(7, 0.6); c.position.set(x, 0, z); scene.add(c); }
const fl = flamboyant(0.9); fl.position.set(-6, 0, -14); scene.add(fl);
const mont = montagnes(320, 55, 11); mont.position.set(0, -0.5, -100); mont.visible = false; scene.add(mont);

// tapis roulant (anneau sombre autour de l'image)
const marge = N * T / 2 + 0.55;
const tapis = new THREE.Mesh(new THREE.RingGeometry(0, 1, 4, 1), new THREE.MeshStandardMaterial({ color: 0x23272b }));
{
  const forme = new THREE.Shape();
  const a = marge + 0.4, b = marge - 0.35;
  forme.moveTo(-a, -a); forme.lineTo(a, -a); forme.lineTo(a, a); forme.lineTo(-a, a); forme.closePath();
  const trou = new THREE.Path(); trou.moveTo(-b, -b); trou.lineTo(-b, b); trou.lineTo(b, b); trou.lineTo(b, -b); trou.closePath();
  forme.holes.push(trou);
  tapis.geometry = new THREE.ExtrudeGeometry(forme, { depth: 0.12, bevelEnabled: false });
  tapis.geometry.rotateX(-Math.PI / 2);
  tapis.material = new THREE.MeshStandardMaterial({ color: 0x2a2f34, roughness: 0.6, metalness: 0.3 });
  tapis.receiveShadow = true;
  scene.add(tapis);
}
// zone des pots en attente (au-dessus du tapis, côté joueur)
const zAttente = marge + 1.4, zFile = marge + 2.9;
for (let i = 0; i < PLACES_ATTENTE; i++) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
  p.position.set((i - 2) * 0.95, 0.03, zAttente); scene.add(p);
}

// ---------- Pixels ----------
const geoPix = new THREE.BoxGeometry(T * 0.94, 0.3, T * 0.94);
const matBlanc = new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 0.95 });
let pixels = [], pots = [], files = [[], [], []], attente = [], surTapis = [], image, fini, couleursMat = {};
const posPixel = (x, y) => new THREE.Vector3((x - (N - 1) / 2) * T, 0.15, (y - (N - 1) / 2) * T);

function potMaillage(couleur, munitions) {
  const g = new THREE.Group();
  const corps = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.5, 20), new THREE.MeshPhysicalMaterial({ color: couleur, roughness: 0.35, clearcoat: 0.8 }));
  corps.position.y = 0.25; g.add(corps);
  const bord = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 8, 20), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.3 }));
  bord.rotation.x = Math.PI / 2; bord.position.y = 0.5; g.add(bord);
  const peinture = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.15 }));
  peinture.rotation.x = -Math.PI / 2; peinture.position.y = 0.48; g.add(peinture);
  const tex = toile(128, 128, () => {});
  const nombre = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  nombre.position.set(0.3, 0.78, 0.25); nombre.rotation.x = -0.9; g.add(nombre);
  g.scale.setScalar(1.2);
  g.userData.ecrire = n => {
    const c = tex.userData.canvas, ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(16,32,74,.85)'; ctx.beginPath(); ctx.arc(64, 64, 52, 0, 7); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '800 62px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(n), 64, 68); tex.needsUpdate = true;
  };
  g.userData.ecrire(munitions);
  return ombrer(g, true, false);
}

function lancerNiveau() {
  pixels.forEach(p => scene.remove(p.m)); pots.forEach(p => scene.remove(p.obj));
  image = IMAGES[(niveau - 1) % IMAGES.length];
  pixels = []; pots = []; files = [[], [], []]; attente = new Array(PLACES_ATTENTE).fill(null); surTapis = []; fini = false;
  couleursMat = {};
  for (const [k, c] of Object.entries(image.palette)) couleursMat[k] = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, clearcoat: 0.3 });
  const compte = {};
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const k = image.lignes[y][x] || '.';
    const m = new THREE.Mesh(geoPix, matBlanc);
    m.position.copy(posPixel(x, y)); m.castShadow = m.receiveShadow = true;
    scene.add(m);
    const p = { x, y, k, m, peint: false };
    pixels.push(p);
    compte[k] = (compte[k] || 0) + 1;
    m.scale.setScalar(0.01);
    setTimeout(() => anime(0.3, t => m.scale.setScalar(Math.max(t, 0.01)), ease.rebond), (x + y) * 18);
  }
  // pots : découpe des munitions par couleur (plus le niveau monte, plus les pots sont petits)
  const tailles = niveau <= 2 ? [20, 20, 15] : niveau <= 5 ? [15, 10, 20] : [10, 5, 15, 10];
  const profondeur = {}; // à quelle distance du bord apparaît chaque couleur
  for (const p of pixels) { const d = Math.min(p.x, p.y, N - 1 - p.x, N - 1 - p.y); profondeur[p.k] = Math.min(profondeur[p.k] ?? 99, d); }
  const liste = [];
  for (const [k, n] of Object.entries(compte)) {
    let reste = n, i = 0;
    while (reste > 0) { const t = Math.min(reste, tailles[i++ % tailles.length]); liste.push({ k, n: t, ordre: profondeur[k] * 2 + liste.filter(q => q.k === k).length * 1.6 + Math.random() * 2.5 }); reste -= t; }
  }
  liste.sort((a, b) => a.ordre - b.ordre);
  liste.forEach((q, i) => {
    const obj = potMaillage(image.palette[q.k], q.n);
    const pot = { k: q.k, munitions: q.n, obj, etat: 'file', colonne: i % 3 };
    obj.traverse(m => { m.userData.pot = pot; });
    files[i % 3].push(pot); pots.push(pot); scene.add(obj);
  });
  rangerFiles(true);
  ui.maj('niveau', niveau); ui.maj('image', image.titre); majReste();
}
function majReste() { ui.maj('reste', pixels.filter(p => !p.peint).length); }
function rangerFiles(direct) {
  files.forEach((f, c) => f.forEach((pot, i) => {
    const cible = new THREE.Vector3((c - 1) * 1.6, 0, zFile + i * 0.85);
    pot.obj.visible = i < 4;
    if (direct) pot.obj.position.copy(cible);
    else { const d = pot.obj.position.clone(); anime(0.2, t => pot.obj.position.lerpVectors(d, cible, t)); }
  }));
}

// ---------- Tapis : position d'un pot selon s (0 à 4N) ----------
function surTapisPos(s) {
  const cote = Math.floor(s / N) % 4, u = (s % N) - (N - 1) / 2; // u : position le long du côté
  const v = new THREE.Vector3();
  if (cote === 0) v.set(u * T, 0.12, marge);        // bas, va vers +x, regarde -z
  else if (cote === 1) v.set(marge, 0.12, -u * T);  // droite, va vers -z, regarde -x
  else if (cote === 2) v.set(-u * T, 0.12, -marge); // haut, va vers -x, regarde +z
  else v.set(-marge, 0.12, u * T);                  // gauche, va vers +z, regarde +x
  return { v, cote, index: Math.floor(s % N) };
}
/** premier pixel blanc vu depuis le tapis */
function premierVisible(cote, index) {
  for (let d = 0; d < N; d++) {
    let x, y;
    if (cote === 0) { x = index; y = N - 1 - d; }
    else if (cote === 1) { x = N - 1 - d; y = N - 1 - index; }
    else if (cote === 2) { x = N - 1 - index; y = d; }
    else { x = d; y = index; }
    const p = pixels[y * N + x];
    if (!p.peint && !p.reserve) return p;
  }
  return null;
}

monde.chaque(dt => {
  if (fini) return;
  for (const pot of surTapis.slice()) {
    const avant = pot.s;
    pot.s += VITESSE * dt;
    const { v } = surTapisPos(pot.s);
    pot.obj.position.copy(v);
    // à chaque nouvelle case, on regarde la ligne
    for (let c = Math.floor(avant) + 1; c <= Math.floor(pot.s) && pot.munitions > 0; c++) {
      const { cote, index } = surTapisPos(c);
      const cible = premierVisible(cote, index);
      if (cible && cible.k === pot.k) tirer(pot, cible);
    }
    if (pot.munitions <= 0) { retirer(pot); continue; }
    if (pot.s >= pot.depart + 4 * N) finDeTour(pot);
  }
});
function tirer(pot, p) {
  p.reserve = true; pot.munitions--; pot.obj.userData.ecrire(pot.munitions);
  son.tir();
  const goutte = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(image.palette[pot.k]).multiplyScalar(1.6) }));
  const de = pot.obj.position.clone().setY(0.6), vers = p.m.position.clone().setY(0.35);
  scene.add(goutte);
  anime(0.18, t => { goutte.position.lerpVectors(de, vers, t); goutte.position.y += Math.sin(t * Math.PI) * 0.6; }, ease.lin).then(() => {
    scene.remove(goutte);
    p.peint = true; p.m.material = couleursMat[p.k];
    monde.particules.jet(vers, image.palette[p.k], { n: 4, vitesse: 1.8, vie: 0.35, taille: 0.05 });
    anime(0.2, t => { p.m.scale.y = 1 + Math.sin(t * Math.PI) * 0.8; });
    majReste();
    if (pixels.every(q => q.peint)) victoire();
  });
}
function retirer(pot) {
  surTapis.splice(surTapis.indexOf(pot), 1); pot.etat = 'fini';
  son.pop();
  monde.particules.jet(pot.obj.position.clone().setY(0.5), image.palette[pot.k], { n: 12, vitesse: 3, vie: 0.5, eclat: 1.4 });
  anime(0.25, t => pot.obj.scale.setScalar(1.2 * (1 - t))).then(() => scene.remove(pot.obj));
}
function finDeTour(pot) {
  surTapis.splice(surTapis.indexOf(pot), 1);
  const place = attente.indexOf(null);
  if (place < 0) { defaite(); return; }
  attente[place] = pot; pot.etat = 'attente';
  const d = pot.obj.position.clone(), cible = new THREE.Vector3((place - 2) * 0.95, 0, zAttente);
  anime(0.3, t => { pot.obj.position.lerpVectors(d, cible, t); pot.obj.position.y = Math.sin(t * Math.PI) * 0.8; });
  if (attente.every(Boolean)) ui.bulle('Plus de place !', '#ff8c1a');
}

// ---------- Toucher : lancer un pot ----------
monde.renderer.domElement.addEventListener('pointerdown', e => {
  if (fini) return;
  const candidats = pots.filter(p => (p.etat === 'file' && files[p.colonne][0] === p) || p.etat === 'attente');
  const hit = monde.toucher(e, candidats.map(p => p.obj));
  if (!hit) return;
  const pot = hit.object.userData.pot;
  if (surTapis.length >= CAPACITE_TAPIS) { son.erreur(); ui.bulle('Tapis plein', '#ff8c1a'); return; }
  // départ seulement si l'entrée du tapis est libre
  const sMin = surTapis.length ? Math.min(...surTapis.map(p => p.s - p.depart)) : 99;
  if (sMin < 1.2) { son.erreur(); return; }
  if (pot.etat === 'file') { files[pot.colonne].shift(); rangerFiles(); }
  else attente[attente.indexOf(pot)] = null;
  pot.etat = 'tapis'; pot.s = 0; pot.depart = 0;
  // recaler tous les pots sur le même repère (le nouveau entre à s = 0)
  surTapis.forEach(p => { p.depart -= 0; });
  surTapis.push(pot);
  pot.obj.visible = true;
  son.clic();
});

async function victoire() {
  if (fini) return; fini = true;
  son.victoire();
  monde.particules.confettis(new THREE.Vector3(0, 2, 0), 100);
  pots.filter(p => p.etat !== 'fini').forEach(p => scene.remove(p.obj));
  // l'image se soulève fièrement
  pixels.forEach(p => anime(0.6, t => { p.m.position.y = 0.15 + Math.sin(t * Math.PI) * 0.4 * (1 - Math.abs(p.x - 7.5) / 16); }));
  await attendre(1.2);
  const reste = attente.filter(Boolean).length;
  niveau++; stock.ecrire('pixel-niveau', niveau);
  await ui.ecran({ titre: image.titre, sousTitre: `Image ${niveau - 1} terminée`, etoiles: reste === 0 ? 3 : reste <= 2 ? 2 : 1, info: image.info, boutons: [{ id: 'ok', texte: 'Image suivante' }] });
  lancerNiveau();
}
async function defaite() {
  if (fini) return; fini = true;
  son.erreur();
  await ui.ecran({ titre: 'Plus de place !', texte: 'Un pot a fini son tour sans pouvoir se ranger. Lance d’abord les couleurs des bords de l’image.', boutons: [{ id: 'ok', texte: 'Réessayer' }] });
  lancerNiveau();
}

ui.init({ titre: 'Pixel Péi' });
ui.stat('niveau', 'Image', niveau);
ui.stat('reste', 'Pixels', 0);
son.ambiance('mer');
lancerNiveau();
ui.chargementFini();
ui.ecran({
  titre: 'Pixel Péi', sousTitre: 'Révèle les images de La Réunion',
  texte: 'Touche un pot de peinture pour le lancer sur le tapis. En faisant le tour, il peint le premier pixel blanc de chaque ligne… seulement si c’est sa couleur. S’il lui reste de la peinture, il attend sur une des 5 places.',
  info: 'Au programme : le paille-en-queue, le Piton de la Fournaise, les letchis, la kaz créole… et une petite fiche à découvrir à chaque image terminée.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
