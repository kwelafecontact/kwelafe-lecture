// =====================================================================
// ZOIZODOKU - sudoku 6 x 6 façon « Meowdoku », avec les oiseaux de La Réunion
// Chaque ligne, chaque colonne et chaque bloc de 2 x 3 doit contenir
// les six oiseaux une seule fois.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, textureOuRepli, melanger, protegerZones, surAppui, attendre } from '../commun/kwelafe.js';
import { texPlanches, ombrer, bruit2 } from '../commun/decor.js';

// ---------- Les six oiseaux (noms usuels à La Réunion) ----------
const OISEAUX = [
  { id: 'tectec', nom: 'Tec-tec', latin: 'Saxicola tectes', corps: '#6b4f3a', tete: '#1b1612', ventre: '#e08a46', aile: '#4a3828', bec: '#151515', sourcil: '#ffffff', fond: '#f3dcc0',
    info: 'Le tec-tec est un petit oiseau endémique des hauts de l’île. Très curieux, il accompagne souvent les randonneurs sur les sentiers.' },
  { id: 'zoizoblan', nom: 'Zoizo blan', latin: 'Zosterops borbonicus', corps: '#8a7b6a', tete: '#9aa1a8', ventre: '#e9e4dc', aile: '#6e604f', bec: '#2a2a2a', anneau: '#ffffff', fond: '#e6e9ee',
    info: 'Le zoizo blan est le passereau endémique le plus commun de La Réunion. Son plumage change selon les régions de l’île : plus gris ou plus brun.' },
  { id: 'oiseauvert', nom: 'Oiseau vert', latin: 'Zosterops olivaceus', corps: '#6f8a2c', tete: '#7d9a34', ventre: '#c9d38a', aile: '#55701e', bec: '#2a2a2a', anneau: '#ffffff', fond: '#e4efcf',
    info: 'L’oiseau vert est un petit zostérops endémique, vert olive, avec un fin cercle blanc autour de l’œil. Il butine volontiers les fleurs.' },
  { id: 'merlepays', nom: 'Merle pays', latin: 'Hypsipetes borbonicus', corps: '#6d7378', tete: '#1e1e1e', ventre: '#9aa0a4', aile: '#575c60', bec: '#f2a51a', fond: '#e3e6e8',
    info: 'Le merle pays vit dans les forêts de La Réunion. Il mange des fruits et des insectes, et son chant mélodieux résonne dans les bois.' },
  { id: 'tuittuit', nom: 'Tuit-tuit', latin: 'Coracina newtoni', corps: '#9aa3ab', tete: '#8e979f', ventre: '#e8ecef', aile: '#1e1e1e', bec: '#1a1a1a', fond: '#e8edf2',
    info: 'Le tuit-tuit doit son nom à son chant, une série de « tuit » répétés. Endémique et menacé, il fait l’objet d’un programme de protection.' },
  { id: 'papangue', nom: 'Papangue', latin: 'Circus maillardi', corps: '#4e3a2c', tete: '#5d4636', ventre: '#d9c3a3', aile: '#3a2a1f', bec: '#2a2a2a', crochu: true, fond: '#efe1cc',
    info: 'Le papangue est le seul rapace qui niche à La Réunion. Il chasse en volant tout près de la végétation. C’est une espèce menacée et protégée.' },
];
// Images fournies : ajouter l'identifiant (ex. 'tectec') quand images/tectec.png existe
const IMAGES_FOURNIES = [];

function portrait(o) {
  return toile(256, 256, (c, w, h) => {
    c.fillStyle = o.fond; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill();
    c.save(); c.translate(128, 140);
    // branche
    c.strokeStyle = '#6b4a2a'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-110, 70); c.lineTo(110, 60); c.stroke();
    // queue
    c.fillStyle = o.aile; c.beginPath(); c.moveTo(-30, 30); c.lineTo(-100, 80); c.lineTo(-80, 95); c.lineTo(-10, 45); c.fill();
    // corps
    c.fillStyle = o.corps; c.beginPath(); c.ellipse(0, 10, 62, 52, -0.25, 0, 7); c.fill();
    c.fillStyle = o.ventre; c.beginPath(); c.ellipse(18, 28, 40, 36, -0.4, 0, 7); c.fill();
    // aile
    c.fillStyle = o.aile; c.beginPath(); c.ellipse(-14, 8, 42, 26, -0.35, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-40 + i * 12, 4 + i * 4); c.lineTo(-2 + i * 10, 18 + i * 3); c.stroke(); }
    // tête
    c.fillStyle = o.tete; c.beginPath(); c.arc(40, -42, 36, 0, 7); c.fill();
    // bec
    c.fillStyle = o.bec; c.beginPath();
    if (o.crochu) { c.moveTo(70, -48); c.quadraticCurveTo(100, -46, 92, -24); c.lineTo(84, -32); c.lineTo(70, -34); }
    else { c.moveTo(72, -50); c.lineTo(102, -42); c.lineTo(72, -34); }
    c.fill();
    // œil
    if (o.anneau) { c.fillStyle = o.anneau; c.beginPath(); c.arc(50, -48, 11, 0, 7); c.fill(); }
    c.fillStyle = '#0b0b0b'; c.beginPath(); c.arc(50, -48, 6.5, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(52, -50, 2, 0, 7); c.fill();
    if (o.sourcil) { c.strokeStyle = o.sourcil; c.lineWidth = 5; c.beginPath(); c.arc(46, -50, 16, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    // pattes
    c.strokeStyle = '#3a3a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 58); c.lineTo(-4, 68); c.moveTo(16, 56); c.lineTo(16, 66); c.stroke();
    c.restore();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 123, 0, 7); c.stroke();
  });
}
const textures = OISEAUX.map(o => { const t = portrait(o); return IMAGES_FOURNIES.includes(o.id) ? textureOuRepli(`images/${o.id}.png`, t) : t; });
const imagesPalette = textures.map(t => t.userData.canvas.toDataURL());

// ---------- Monde : forêt de bois de couleurs des hauts ----------
const CASE = 1.25;
const monde = creerMonde({
  soleil: { elevation: 50, azimut: 200, intensite: 1.8 },
  ombre: { taille: 10 }, intensiteEnv: 0.6, exposition: 0.9,
  brouillard: { couleur: 0xa9c4b4, pres: 18, loin: 70 },
  cadrer(cam, ratio) {
    const dist = ratio < 1 ? Math.max(13, 10.5 / ratio) : 14.5;
    cam.position.set(0, dist * 0.95, dist * 0.36);
    cam.lookAt(0, 0, ratio < 1 ? 0.9 : 0.6);
  },
});
const { scene } = monde;
const solForet = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({
  map: toile(256, 256, (c, w, h) => { c.fillStyle = '#3d5a2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = `hsl(${80 + Math.random() * 40},${30 + Math.random() * 30}%,${15 + Math.random() * 20}%)`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, { repeter: [30, 30] }), roughness: 1,
}));
solForet.rotation.x = -Math.PI / 2; solForet.receiveShadow = true; scene.add(solForet);
// grand tronc couché qui sert de plateau
const souche = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.8, 0.8, 40), new THREE.MeshStandardMaterial({
  map: toile(512, 512, (c, w, h) => { c.fillStyle = '#b08a5a'; c.fillRect(0, 0, w, h); for (let r = 6; r < 256; r += 6 + Math.random() * 6) { c.strokeStyle = `rgba(90,55,25,${0.2 + Math.random() * 0.3})`; c.lineWidth = 2; c.beginPath(); c.arc(256, 256, r, 0, 7); c.stroke(); } }), roughness: 0.85,
}));
souche.position.y = -0.4; souche.receiveShadow = true; scene.add(souche);
// arbres et fougères arborescentes autour
const matTronc = new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.95 });
const matFeuillage = new THREE.MeshStandardMaterial({ color: 0x2f5a2a, roughness: 0.9 });
const texFronde = toile(128, 512, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#3f6a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2, 0); c.stroke(); for (let y = 8; y < h; y += 7) { const l = (w / 2 - 6) * Math.sin(y / h * Math.PI); c.strokeStyle = `hsl(${95 + Math.random() * 15},50%,${28 + Math.random() * 10}%)`; c.lineWidth = 4; c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2 - l, y - 8); c.moveTo(w / 2, y); c.lineTo(w / 2 + l, y - 8); c.stroke(); } });
function fougere(h) {
  const g = new THREE.Group();
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, h, 8), new THREE.MeshStandardMaterial({ color: 0x3a2a1f, roughness: 1 })); t.position.y = h / 2; g.add(t);
  const geo = new THREE.PlaneGeometry(0.9, 3, 1, 8); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 1.5; p.setY(i, y); p.setZ(i, -y * y * 0.12); }
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texFronde, alphaTest: 0.4, side: THREE.DoubleSide })); f.position.y = h; f.rotation.order = 'YXZ'; f.rotation.y = i * 0.7; f.rotation.x = -0.6; g.add(f); }
  return ombrer(g, true, false);
}
for (let i = 0; i < 26; i++) {
  const a = (i / 26) * Math.PI * 2 + Math.random() * 0.2, r = 9 + Math.random() * 12;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (i % 3 === 0) { const f = fougere(2.5 + Math.random() * 2); f.position.set(x, 0, z); scene.add(f); continue; }
  const h = 8 + Math.random() * 6;
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, h, 8), matTronc); tr.position.set(x, h / 2, z); tr.rotation.z = (Math.random() - .5) * 0.15; tr.castShadow = true; scene.add(tr);
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1.8 + Math.random(), 1), matFeuillage); b.position.set(x + (Math.random() - .5) * 2.5, h + (Math.random() - .5) * 1.5, z + (Math.random() - .5) * 2.5); b.castShadow = true; scene.add(b); }
}

// ---------- Plateau 6 x 6 ----------
const posCase = (c, r) => new THREE.Vector3((c - 2.5) * CASE + (c >= 3 ? 0.08 : -0.08), 0.02, (r - 2.5) * CASE + (r >= 2 && r < 4 ? 0 : r >= 4 ? 0.12 : -0.12));
const geoTuile = new THREE.BoxGeometry(CASE * 0.92, 0.12, CASE * 0.92);
const tuiles = [];
for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
  const bloc = Math.floor(r / 2) * 2 + Math.floor(c / 3);
  const t = new THREE.Mesh(geoTuile, new THREE.MeshStandardMaterial({ color: bloc % 2 ? 0xd8c7a3 : 0xc4ad82, roughness: 0.85 }));
  t.position.copy(posCase(c, r)); t.position.y = 0.06; t.receiveShadow = true;
  t.userData.cellule = { c, r }; scene.add(t); tuiles.push(t);
}
const curseur = new THREE.Mesh(new THREE.RingGeometry(CASE * 0.44, CASE * 0.52, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc928).multiplyScalar(1.6) }));
curseur.rotation.x = -Math.PI / 2; curseur.position.y = 0.14; scene.add(curseur);

// ---------- Génération d'une grille à solution unique ----------
function grilleSolution() {
  let g = Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => (3 * (r % 2) + Math.floor(r / 2) + c) % 6));
  const chiffres = melanger([0, 1, 2, 3, 4, 5]);
  g = g.map(l => l.map(v => chiffres[v]));
  const bandes = melanger([0, 1, 2]), lignes = [];
  bandes.forEach(b => melanger([0, 1]).forEach(k => lignes.push(b * 2 + k)));
  g = lignes.map(i => g[i]);
  const piles = melanger([0, 1]), cols = [];
  piles.forEach(p => melanger([0, 1, 2]).forEach(k => cols.push(p * 3 + k)));
  return g.map(l => cols.map(i => l[i]));
}
function valide(g, r, c, v) {
  for (let i = 0; i < 6; i++) if (g[r][i] === v || g[i][c] === v) return false;
  const r0 = Math.floor(r / 2) * 2, c0 = Math.floor(c / 3) * 3;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) if (g[r0 + i][c0 + j] === v) return false;
  return true;
}
function compterSolutions(g, limite = 2) {
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (g[r][c] < 0) {
    let n = 0;
    for (let v = 0; v < 6; v++) if (valide(g, r, c, v)) { g[r][c] = v; n += compterSolutions(g, limite - n); g[r][c] = -1; if (n >= limite) return n; }
    return n;
  }
  return 1;
}
function genererPuzzle(indices) {
  const sol = grilleSolution();
  const g = sol.map(l => l.slice());
  for (const k of melanger([...Array(36).keys()])) {
    const r = Math.floor(k / 6), c = k % 6, v = g[r][c];
    g[r][c] = -1;
    if (compterSolutions(g.map(l => l.slice())) !== 1) g[r][c] = v;
    if (g.flat().filter(x => x >= 0).length <= indices) break;
  }
  return { sol, depart: g };
}

// ---------- Partie ----------
let niveau = stock.lire('zoizo-niveau', 1), sol, grille, jetons, choix = null, erreurs, indicesRestants, chrono, fini;
const geoJeton = new THREE.CylinderGeometry(CASE * 0.42, CASE * 0.42, 0.12, 40);
function poserJeton(c, r, v, donne) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(geoJeton, new THREE.MeshPhysicalMaterial({ color: donne ? 0xd8c7a6 : 0xffffff, roughness: 0.5, clearcoat: 0.6 }));
  g.add(base);
  const face = new THREE.Mesh(new THREE.CircleGeometry(CASE * 0.4, 40), new THREE.MeshStandardMaterial({ map: textures[v], roughness: 0.6 }));
  face.rotation.x = -Math.PI / 2; face.position.y = 0.061; g.add(face);
  g.position.copy(posCase(c, r)); g.position.y = 0.2;
  ombrer(g, true, false);
  scene.add(g); jetons[r][c] = g;
  return g;
}
function nouvellePartie() {
  if (jetons) jetons.flat().forEach(j => j && scene.remove(j));
  const indices = Math.max(20 - niveau, 12);
  const p = genererPuzzle(indices);
  sol = p.sol; grille = p.depart; jetons = Array.from({ length: 6 }, () => new Array(6).fill(null));
  erreurs = 0; indicesRestants = 3; chrono = 0; fini = false;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (grille[r][c] >= 0) {
    const j = poserJeton(c, r, grille[r][c], true);
    j.scale.setScalar(0.01);
    setTimeout(() => anime(0.35, t => j.scale.setScalar(Math.max(t, 0.01)), ease.rebond), (r * 6 + c) * 25);
  }
  choisirCase(...premiereVide());
  ui.maj('niveau', niveau); ui.maj('erreurs', '0/3'); majIndice();
}
function premiereVide() { for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (grille[r][c] < 0) return [c, r]; return [0, 0]; }
function choisirCase(c, r) { choix = { c, r }; curseur.position.x = posCase(c, r).x; curseur.position.z = posCase(c, r).z; }
monde.chaque(dt => { if (!fini) chrono += dt; curseur.material.opacity = 0.7 + Math.sin(monde.temps() * 5) * 0.3; });

monde.renderer.domElement.addEventListener('pointerdown', e => {
  const hit = monde.toucher(e, tuiles.concat(jetons ? jetons.flat().filter(Boolean) : []));
  if (!hit) return;
  let o = hit.object; while (o && !o.userData.cellule && o.parent) o = o.parent;
  let cel = o.userData.cellule;
  if (!cel) { // jeton touché : retrouver sa case
    for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (jetons[r][c] === o) cel = { c, r };
  }
  if (cel) { choisirCase(cel.c, cel.r); son.clic(); }
});

function jouer(v) {
  if (fini || !choix) return;
  const { c, r } = choix;
  if (grille[r][c] >= 0) { son.erreur(); return; }
  if (sol[r][c] !== v) {
    erreurs++; ui.maj('erreurs', `${erreurs}/3`); son.erreur();
    const j = poserJeton(c, r, v, false);
    j.children[0].material.color.set(0xff6b6b);
    anime(0.6, t => { j.position.x = posCase(c, r).x + Math.sin(t * 25) * 0.08 * (1 - t); }).then(() => scene.remove(j));
    jetons[r][c] = null;
    if (erreurs >= 3) defaite();
    return;
  }
  grille[r][c] = v;
  const j = poserJeton(c, r, v, false);
  j.position.y = 1.2;
  anime(0.3, t => { j.position.y = 1.2 - t; }, ease.rebond);
  son.zoizo(); son.pose();
  monde.particules.jet(posCase(c, r).setY(0.4), OISEAUX[v].ventre, { n: 10, vitesse: 2.5, vie: 0.6 });
  verifierGroupes(c, r);
  if (grille.flat().every(x => x >= 0)) victoire();
  else { const [nc, nr] = suivanteVide(c, r); choisirCase(nc, nr); }
}
function suivanteVide(c, r) { for (let k = 1; k <= 36; k++) { const i = (r * 6 + c + k) % 36; if (grille[Math.floor(i / 6)][i % 6] < 0) return [i % 6, Math.floor(i / 6)]; } return [c, r]; }
function verifierGroupes(c, r) {
  const vagues = [];
  if (grille[r].every(x => x >= 0)) vagues.push([...Array(6).keys()].map(i => [i, r]));
  if (grille.every(l => l[c] >= 0)) vagues.push([...Array(6).keys()].map(i => [c, i]));
  const r0 = Math.floor(r / 2) * 2, c0 = Math.floor(c / 3) * 3, bloc = [];
  for (let i = 0; i < 2; i++) for (let k = 0; k < 3; k++) bloc.push([c0 + k, r0 + i]);
  if (bloc.every(([x, y]) => grille[y][x] >= 0)) vagues.push(bloc);
  if (!vagues.length) return;
  son.combo(vagues.length * 2);
  if (vagues.length > 1) ui.bulle(`Combo x${vagues.length} !`);
  vagues.forEach(v => v.forEach(([x, y], i) => setTimeout(() => {
    const j = jetons[y][x]; if (!j) return;
    anime(0.4, t => { j.position.y = 0.2 + Math.sin(t * Math.PI) * 0.5; j.rotation.y = t * Math.PI * 2; });
    monde.particules.jet(posCase(x, y).setY(0.6), 0xffe9a8, { n: 4, vitesse: 2, vie: 0.6, eclat: 2, taille: 0.05 });
  }, i * 60)));
}
function majIndice() { boutonIndice.textContent = `Indice (${indicesRestants})`; }
function indice() {
  if (fini || indicesRestants <= 0) { son.erreur(); return; }
  const vides = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) if (grille[r][c] < 0) vides.push([c, r]);
  if (!vides.length) return;
  const [c, r] = choix && grille[choix.r][choix.c] < 0 ? [choix.c, choix.r] : vides[Math.floor(Math.random() * vides.length)];
  indicesRestants--; majIndice();
  choisirCase(c, r); jouer(sol[r][c]);
}
async function victoire() {
  fini = true; son.victoire();
  monde.particules.confettis(new THREE.Vector3(0, 2, 0), 100);
  const temps = Math.round(chrono);
  const etoiles = erreurs === 0 && temps < 240 ? 3 : erreurs <= 1 ? 2 : 1;
  const oiseau = OISEAUX[(niveau - 1) % 6];
  niveau++; stock.ecrire('zoizo-niveau', niveau);
  await attendre(0.8);
  await ui.ecran({ titre: 'Bravo !', sousTitre: `Grille ${niveau - 1} en ${Math.floor(temps / 60)} min ${temps % 60} s`, etoiles, info: `<b>${oiseau.nom}</b> (<i>${oiseau.latin}</i>) : ${oiseau.info}`, boutons: [{ id: 'ok', texte: 'Grille suivante' }] });
  nouvellePartie();
}
async function defaite() {
  fini = true;
  await ui.ecran({ titre: 'Trois erreurs…', texte: 'Les oiseaux se sont envolés ! Regarde bien chaque ligne, chaque colonne et chaque bloc avant de poser un oiseau.', boutons: [{ id: 'ok', texte: 'Nouvelle grille' }] });
  nouvellePartie();
}

// ---------- Palette d'oiseaux (en bas de l'écran) ----------
ui.init({ titre: 'Zoizodoku' });
ui.stat('niveau', 'Grille', niveau);
ui.stat('erreurs', 'Erreurs', '0/3');
const style = document.createElement('style');
style.textContent = `.palette{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;width:min(560px,100%)}
.zo{background:rgba(255,250,236,.95);border:0;border-radius:16px;padding:5px 2px 4px;color:#2b1a0c;font:800 11px/1.05 var(--corps);display:flex;flex-direction:column;align-items:center;gap:2px;min-height:44px;box-shadow:0 5px 0 rgba(0,0,0,.18)}
.zo img{width:min(13vw,58px);height:min(13vw,58px)}.zo:active{transform:translateY(3px)}
.k-indice{position:fixed;z-index:11;right:calc(var(--marge) + 10px);top:calc(max(18px,env(safe-area-inset-top)) + 124px);font:800 14px var(--titre);background:var(--verre);color:#fff;border:1.5px solid rgba(255,255,255,.25);border-radius:999px;min-height:44px;padding:0 16px}`;
document.head.appendChild(style);
const bas = ui.el('div', 'k-bas'), palette = ui.el('div', 'palette');
OISEAUX.forEach((o, i) => {
  const b = ui.el('button', 'zo zone-interactive', `<img alt="" src="${imagesPalette[i]}">${o.nom}`);
  surAppui(b, () => jouer(i));
  palette.appendChild(b);
});
bas.appendChild(palette); document.body.appendChild(bas);
const boutonIndice = ui.el('button', 'k-indice zone-interactive', 'Indice');
surAppui(boutonIndice, indice);
document.body.appendChild(boutonIndice);
protegerZones();
son.ambiance('foret');
nouvellePartie();
ui.chargementFini();
ui.ecran({
  titre: 'Zoizodoku', sousTitre: 'Le sudoku des oiseaux de La Réunion',
  texte: 'Touche une case, puis un oiseau. Chaque ligne, chaque colonne et chaque bloc de 6 cases doit contenir les six oiseaux une seule fois. Trois erreurs et ils s’envolent !',
  info: 'Tec-tec, zoizo blan, oiseau vert, merle pays, tuit-tuit et papangue : six oiseaux endémiques de La Réunion, qu’on ne trouve nulle part ailleurs au monde.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
