// =====================================================================
// LA KAZ GRAMOUN - jeu de fusion façon « Gossip Harbor / Merge »
// Fusionne deux objets lontan identiques pour obtenir un objet plus beau,
// réponds aux demandes de gramoun et remets sa kaz créole en état.
// Visuels : chaque objet a un dessin de repli ; une image fournie dans
// images/<identifiant>.png le remplace automatiquement.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, textureOuRepli, choisir, attendre, protegerZones, surAppui } from '../commun/kwelafe.js';
import { kaz, bananier, flamboyant, cocotier, payanke, montagnes, solHerbe, grappeLetchis, texPlanches, ombrer } from '../commun/decor.js';

// ---------- Les chaînes d'objets lontan ----------
const CHAINES = [
  { id: 'cafe', couleur: '#8a5a32', objets: ['Cerise de café', 'Grains de café', 'Café grillé', 'Moulin à café', 'Cafetière émaillée'] },
  { id: 'lum', couleur: '#e0a21b', objets: ['Allumette', 'Bougie', 'Bougeoir', 'Lampe à pétrole', 'Fanal'] },
  { id: 'linge', couleur: '#2f7fc1', objets: ['Savon', 'Battoir', 'Baquet en fer-blanc', 'Fer à charbon', 'Malle à linge'] },
  { id: 'cuis', couleur: '#c0392b', objets: ['Piment', 'Roche à cari', 'Marmite en fonte', 'Foyer au bois', 'Kari fumant'] },
];
const COLS = 6, ROWS = 6, CASE = 1.15;

// ---------- Dessins de repli (un par objet) ----------
function dessiner(c, chaine, n) {
  const W = 256; c.save(); c.translate(W / 2, W / 2); c.lineJoin = c.lineCap = 'round';
  const disque = (x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  const rect = (x, y, w, h, f, r = 10) => { c.fillStyle = f; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
  const trait = (pts, s, l = 8) => { c.strokeStyle = s; c.lineWidth = l; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const id = chaine + n;
  switch (id) {
    case 'cafe1': disque(-20, 10, 34, '#c0272d'); disque(22, -8, 30, '#d93a2f'); disque(-10, 2, 10, 'rgba(255,255,255,.35)'); trait([[0, -40], [10, -70]], '#3f7a2a', 8); break;
    case 'cafe2': for (const [x, y] of [[-30, 10], [10, -20], [25, 25], [-5, 40]]) { c.save(); c.translate(x, y); c.rotate(x); c.fillStyle = '#9b8a4a'; c.beginPath(); c.ellipse(0, 0, 26, 18, 0, 0, 7); c.fill(); trait([[0, -14], [0, 14]], '#6b5a2a', 4); c.restore(); } break;
    case 'cafe3': rect(-70, 20, 140, 40, '#6b4a2a', 20); for (let i = 0; i < 9; i++) { c.save(); c.translate(-50 + (i % 5) * 25, 5 - Math.floor(i / 5) * 18); c.fillStyle = '#3a2210'; c.beginPath(); c.ellipse(0, 0, 14, 10, 0.5, 0, 7); c.fill(); c.restore(); } break;
    case 'cafe4': rect(-50, -10, 100, 80, '#7a4a24', 8); rect(-40, -40, 80, 34, '#c9c9c9', 6); trait([[0, -40], [0, -70], [50, -70]], '#555', 10); disque(52, -70, 10, '#8a5a32'); rect(-14, 30, 28, 18, '#3a2210', 3); break;
    case 'cafe5': c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-45, 70); c.lineTo(45, 70); c.lineTo(30, -40); c.lineTo(-30, -40); c.closePath(); c.fill(); trait([[30, -20], [70, -50]], '#ffffff', 14); trait([[-45, -10], [-70, 20], [-45, 40]], '#ffffff', 10); rect(-30, -58, 60, 18, '#1f4fa0', 8); trait([[-40, 70], [40, 70]], '#1f4fa0', 8); trait([[-10, -80], [0, -100], [10, -80]], 'rgba(255,255,255,.7)', 5); break;
    case 'lum1': trait([[-40, 50], [40, -40]], '#e8d2a0', 12); disque(44, -44, 16, '#c0392b'); break;
    case 'lum2': rect(-18, -40, 36, 110, '#fff6dc', 8); trait([[0, -40], [0, -55]], '#333', 4); c.fillStyle = '#ffb000'; c.beginPath(); c.ellipse(0, -72, 12, 22, 0, 0, 7); c.fill(); break;
    case 'lum3': c.fillStyle = '#c9a43a'; c.beginPath(); c.ellipse(0, 62, 60, 14, 0, 0, 7); c.fill(); rect(-8, 10, 16, 52, '#c9a43a', 4); rect(-18, -50, 36, 66, '#fff6dc', 8); c.fillStyle = '#ffb000'; c.beginPath(); c.ellipse(0, -70, 11, 20, 0, 0, 7); c.fill(); trait([[55, 62], [75, 40]], '#c9a43a', 8); break;
    case 'lum4': c.fillStyle = '#2e7d57'; c.beginPath(); c.ellipse(0, 50, 50, 24, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(255,240,200,.85)'; c.beginPath(); c.moveTo(-26, 30); c.quadraticCurveTo(-46, -20, -14, -60); c.lineTo(14, -60); c.quadraticCurveTo(46, -20, 26, 30); c.fill(); c.fillStyle = '#ffb000'; c.beginPath(); c.ellipse(0, -10, 10, 22, 0, 0, 7); c.fill(); break;
    case 'lum5': rect(-40, -50, 80, 100, 'rgba(255,230,160,.9)', 12); trait([[-40, -50], [40, -50], [40, 50], [-40, 50], [-40, -50]], '#3a3a3a', 10); trait([[-30, -80], [0, -98], [30, -80]], '#3a3a3a', 8); c.fillStyle = '#ff9a00'; c.beginPath(); c.ellipse(0, 0, 14, 28, 0, 0, 7); c.fill(); break;
    case 'linge1': rect(-55, -30, 110, 60, '#f3e3a0', 18); disque(-60, -40, 10, 'rgba(255,255,255,.9)'); disque(-40, -55, 14, 'rgba(255,255,255,.9)'); disque(55, -45, 8, 'rgba(255,255,255,.9)'); break;
    case 'linge2': rect(-30, -70, 60, 90, '#b0874f', 14); rect(-10, 20, 20, 55, '#8a6236', 6); break;
    case 'linge3': c.fillStyle = '#b8c2cc'; c.beginPath(); c.moveTo(-80, -20); c.lineTo(80, -20); c.lineTo(60, 60); c.lineTo(-60, 60); c.closePath(); c.fill(); trait([[-80, -20], [80, -20]], '#8a96a2', 10); disque(-30, -28, 18, 'rgba(255,255,255,.9)'); disque(10, -34, 22, 'rgba(255,255,255,.9)'); break;
    case 'linge4': c.fillStyle = '#3a3a3a'; c.beginPath(); c.moveTo(-80, 40); c.lineTo(70, 40); c.quadraticCurveTo(80, -10, 20, -20); c.lineTo(-60, -20); c.closePath(); c.fill(); trait([[-40, -20], [-40, -60], [30, -60], [30, -20]], '#7a4a24', 12); disque(-30, 12, 6, '#ff6a00'); disque(-5, 12, 6, '#ff6a00'); disque(20, 12, 6, '#ff6a00'); break;
    case 'linge5': rect(-80, -40, 160, 100, '#7a4a24', 12); rect(-80, -40, 160, 26, '#5b3519', 12); trait([[-50, -40], [-50, 60]], '#c9a43a', 8); trait([[50, -40], [50, 60]], '#c9a43a', 8); rect(-12, -20, 24, 22, '#c9a43a', 4); break;
    case 'cuis1': c.fillStyle = '#d4140c'; c.beginPath(); c.moveTo(-20, -50); c.quadraticCurveTo(60, -30, 40, 70); c.quadraticCurveTo(0, 0, -20, -50); c.fill(); trait([[-22, -50], [-40, -70]], '#3f7a2a', 9); disque(10, -20, 8, 'rgba(255,255,255,.4)'); break;
    case 'cuis2': c.fillStyle = '#5a5a5a'; c.beginPath(); c.ellipse(0, 40, 80, 30, 0, 0, 7); c.fill(); c.fillStyle = '#6e6e6e'; c.beginPath(); c.ellipse(0, 30, 70, 22, 0, 0, 7); c.fill(); rect(-15, -60, 30, 90, '#4a4a4a', 14); break;
    case 'cuis3': c.fillStyle = '#2a2a2a'; c.beginPath(); c.ellipse(0, 10, 75, 55, 0, 0, Math.PI); c.fill(); rect(-80, -10, 160, 20, '#3a3a3a', 8); trait([[-80, 0], [-95, -10]], '#3a3a3a', 10); trait([[80, 0], [95, -10]], '#3a3a3a', 10); break;
    case 'cuis4': for (let i = 0; i < 3; i++) disque(-45 + i * 45, 50, 16, '#5a5a5a'); trait([[-60, 40], [50, 10]], '#7a4a24', 14); trait([[-50, 10], [60, 40]], '#6b3f1e', 14); c.fillStyle = '#ff7a00'; c.beginPath(); c.moveTo(-30, 20); c.quadraticCurveTo(0, -80, 30, 20); c.fill(); c.fillStyle = '#ffd040'; c.beginPath(); c.moveTo(-14, 20); c.quadraticCurveTo(0, -40, 14, 20); c.fill(); break;
    case 'cuis5': c.fillStyle = '#2a2a2a'; c.beginPath(); c.ellipse(0, 20, 75, 50, 0, 0, Math.PI); c.fill(); c.fillStyle = '#c96a1a'; c.beginPath(); c.ellipse(0, 20, 72, 18, 0, 0, 7); c.fill(); disque(-25, 16, 12, '#8a3a12'); disque(20, 22, 14, '#8a3a12'); trait([[-30, -10], [-20, -50], [-30, -80]], 'rgba(255,255,255,.75)', 6); trait([[10, -10], [20, -50], [10, -85]], 'rgba(255,255,255,.75)', 6); break;
  }
  c.restore();
}
// Images fournies : ajouter ici l'identifiant (ex. 'cafe1') quand le fichier images/cafe1.png existe
const IMAGES_FOURNIES = [];
const cacheTex = {}, cacheImages = {};
function texObjet(ch, n) {
  const cle = ch.id + n;
  if (!cacheTex[cle]) {
    const t = toile(256, 256, (c, w, h) => {
      const g = c.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 128);
      g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f1e4c8'); c.fillStyle = g; c.beginPath(); c.arc(w / 2, h / 2, 124, 0, 7); c.fill();
      c.lineWidth = 8; c.strokeStyle = ch.couleur; c.stroke();
      dessiner(c, ch.id, n);
      for (let i = 0; i < n; i++) { c.fillStyle = ch.couleur; c.beginPath(); c.arc(w / 2 + (i - (n - 1) / 2) * 20, 232, 7, 0, 7); c.fill(); }
    });
    cacheTex[cle] = IMAGES_FOURNIES.includes(cle) ? textureOuRepli(`images/${cle}.png`, t) : t;
    cacheImages[cle] = t.userData.canvas.toDataURL();
  }
  return cacheTex[cle];
}

// ---------- Monde ----------
const monde = creerMonde({
  soleil: { elevation: 38, azimut: 220, intensite: 2.4 },
  ombre: { taille: 16 },
  brouillard: { couleur: 0xcfe6f3, pres: 60, loin: 240 },
  cadrer(cam, ratio) {
    const portrait = ratio < 1.05;
    const dist = portrait ? Math.max(18, 15 / ratio) : Math.max(17, 24 / ratio);
    cam.position.set(0, dist * 0.85, dist * 0.62 + 2);
    cam.lookAt(0, 0, portrait ? -0.4 : 0);
  },
});
const { scene } = monde;
scene.add(solHerbe(240));
const table = new THREE.Mesh(new THREE.BoxGeometry(COLS * CASE + 1, 0.4, ROWS * CASE + 1), new THREE.MeshStandardMaterial({ map: texPlanches('#a8743f', [5, 1]), roughness: 0.8 }));
table.position.y = -0.2; table.receiveShadow = table.castShadow = true; scene.add(table);
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 24), new THREE.MeshStandardMaterial({ color: (r + c) % 2 ? 0xe9d9b6 : 0xdcc89e, roughness: 0.9 }));
  t.position.set((c - (COLS - 1) / 2) * CASE, 0.015, (r - (ROWS - 1) / 2) * CASE); t.receiveShadow = true; scene.add(t);
}
const mont = montagnes(320, 55, 4); mont.position.set(0, -0.5, -95); scene.add(mont);
for (const [x, z] of [[-10, -4], [10, -6], [-11, 5]]) { const c = cocotier(7, 0.6); c.position.set(x, 0, z); scene.add(c); }

// la malle (générateur d'objets)
const malle = new THREE.Group();
{
  const bois = new THREE.MeshStandardMaterial({ map: texPlanches('#7a4a24', [2, 1]), roughness: 0.7 });
  const caisse = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.9), bois); caisse.position.y = 0.4; malle.add(caisse);
  const couvercle = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.4, 16, 1, false, 0, Math.PI), bois);
  couvercle.rotation.z = Math.PI / 2; couvercle.rotation.y = Math.PI / 2; couvercle.position.y = 0.8; malle.add(couvercle);
  const ferrure = new THREE.MeshStandardMaterial({ color: 0xc9a43a, metalness: 0.8, roughness: 0.3 });
  for (const x of [-0.5, 0.5]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 0.95), ferrure); f.position.set(x, 0.62, 0); malle.add(f); }
  malle.position.set(-(COLS * CASE) / 2 - 1.3, 0, (ROWS * CASE) / 2 - 0.4);
  malle.traverse(m => { m.userData.malle = true; });
  scene.add(ombrer(malle));
}

// ---------- La kaz à restaurer ----------
const COULEURS_KAZ = [{ mur: '#f4c95d', toit: '#b8352a', volets: '#2f8f5b' }, { mur: '#8fd3e8', toit: '#2f6f5b', volets: '#ffffff' }, { mur: '#f28db2', toit: '#5b6770', volets: '#ffffff' }];
let maison, decorKaz = new THREE.Group(); scene.add(decorKaz);
let numeroKaz = stock.lire('gramoun-kaz', 1), etape = 0;
const ETAPES = [
  ['Murs repeints', () => { maison.userData.matMur.color.set(maison.userData.cible.mur); }],
  ['Tôle neuve', () => { maison.userData.matToit.color.set(maison.userData.cible.toit); maison.userData.matToit.metalness = 0.55; }],
  ['Contrevents remis', () => maison.userData.volets.forEach(v => apparaitre(v))],
  ['Lambrequins posés', () => maison.userData.lambrequins.forEach(v => apparaitre(v))],
  ['Varangue réparée', () => { if (maison.userData.varangue) apparaitre(maison.userData.varangue); if (maison.userData.auvent) apparaitre(maison.userData.auvent); }],
  ['Bananiers plantés', () => { for (const x of [-5.2, 5.4]) { const b = bananier(3); b.position.set(x, 0, -1.5); decorKaz.add(b); apparaitre(b); } }],
  ['Pied de letchis', () => { const l = grappeLetchis(9); l.position.set(4.2, 0, 1.5); l.scale.setScalar(1.4); decorKaz.add(l); apparaitre(l); }],
  ['Jardin fleuri', () => {
    const n = 40, fleurs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.16, 0), new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const m = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < n; i++) { m.makeTranslation(-3.2 + Math.random() * 6.4, 0.2, 3.4 + Math.random() * 0.8); fleurs.setMatrixAt(i, m); c.set(choisir(['#e8402a', '#ffc928', '#f28db2', '#ffffff', '#ff8c1a'])); fleurs.setColorAt(i, c); }
    decorKaz.add(fleurs); apparaitre(fleurs);
  }],
  ['Flamboyant en fleur', () => { const f = flamboyant(0.85); f.position.set(-6.5, 0, -3); decorKaz.add(f); apparaitre(f); }],
  ['Les paille-en-queue reviennent', () => {
    const o = payanke(); decorKaz.add(o);
    monde.chaque((dt, t) => { const a = t * 0.4; o.position.set(Math.cos(a) * 6, 6.5 + Math.sin(t) * 0.4, Math.sin(a) * 3); o.rotation.y = -a; o.maj(t); });
  }],
];
function apparaitre(o) { o.visible = true; const s = o.scale.clone(); anime(0.6, t => o.scale.copy(s).multiplyScalar(Math.max(t, 0.01)), ease.rebond); }
function construireKaz() {
  if (maison) maison.parent.remove(maison);
  decorKaz.clear();
  const cible = COULEURS_KAZ[(numeroKaz - 1) % COULEURS_KAZ.length];
  maison = kaz({ ...cible });
  maison.userData.cible = cible;
  maison.userData.matMur.color.set('#9d968a'); // murs délavés
  maison.userData.matToit.color.set('#7a4a30'); maison.userData.matToit.metalness = 0.1; // tôle rouillée
  maison.userData.volets.forEach(v => v.visible = false);
  maison.userData.lambrequins.forEach(v => v.visible = false);
  if (maison.userData.varangue) maison.userData.varangue.visible = false;
  if (maison.userData.auvent) maison.userData.auvent.visible = false;
  decorKaz.position.set(0, 0, -(ROWS * CASE) / 2 - 5.5);
  maison.scale.setScalar(0.9);
  decorKaz.add(maison);
  for (let i = 0; i < etape; i++) ETAPES[i][1]();
}

// ---------- Objets sur le plateau ----------
const geoJeton = new THREE.CylinderGeometry(0.47, 0.5, 0.22, 32);
let plateau = [], commandes = [], fini = false;
const posCase = (c, r) => new THREE.Vector3((c - (COLS - 1) / 2) * CASE, 0.13, (r - (ROWS - 1) / 2) * CASE);
function creerObjet(ch, n, c, r) {
  const chaine = CHAINES[ch];
  const g = new THREE.Group();
  const socle = new THREE.Mesh(geoJeton, new THREE.MeshPhysicalMaterial({ color: chaine.couleur, roughness: 0.4, clearcoat: 0.6 }));
  g.add(socle);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.44, 32), new THREE.MeshStandardMaterial({ map: texObjet(chaine, n), roughness: 0.6 }));
  face.rotation.x = -Math.PI / 2; face.position.y = 0.115; g.add(face);
  g.position.copy(posCase(c, r));
  ombrer(g, true, true);
  const o = { ch, n, c, r, g };
  g.traverse(m => { m.userData.objet = o; });
  scene.add(g); plateau.push(o);
  return o;
}
const objetEn = (c, r) => plateau.find(o => o.c === c && o.r === r);
function caseLibre() {
  const libres = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (!objetEn(c, r)) libres.push([c, r]);
  return libres.length ? choisir(libres) : null;
}

// ---------- Interaction ----------
const canvas = monde.renderer.domElement;
let tenu = null, departTenu = null;
canvas.addEventListener('pointerdown', e => {
  if (fini) return;
  const hit = monde.toucher(e, [malle, ...plateau.map(o => o.g)]);
  if (!hit) return;
  if (hit.object.userData.malle) { produire(); return; }
  tenu = hit.object.userData.objet; departTenu = tenu.g.position.clone();
  anime(0.1, t => tenu && tenu.g.scale.setScalar(1 + t * 0.15));
  son.clic();
});
canvas.addEventListener('pointermove', e => {
  if (!tenu) return;
  const p = monde.versPlan(e, 0.13);
  if (p) tenu.g.position.set(p.x, 0.6, p.z - 0.6);
});
canvas.addEventListener('pointerup', async () => {
  if (!tenu) return;
  const o = tenu; tenu = null;
  o.g.scale.setScalar(1);
  const c = Math.round(o.g.position.x / CASE + (COLS - 1) / 2), r = Math.round(o.g.position.z / CASE + (ROWS - 1) / 2);
  const dedans = c >= 0 && c < COLS && r >= 0 && r < ROWS;
  const autre = dedans ? objetEn(c, r) : null;
  if (!dedans || autre === o) { glisser(o, o.c, o.r); return; }
  if (!autre) { o.c = c; o.r = r; glisser(o, c, r); son.pose(); return; }
  if (autre.ch === o.ch && autre.n === o.n && o.n < 5) {
    // fusion !
    scene.remove(o.g); scene.remove(autre.g);
    plateau = plateau.filter(x => x !== o && x !== autre);
    const nouv = creerObjet(o.ch, o.n + 1, c, r);
    nouv.g.scale.setScalar(0.01);
    anime(0.45, t => nouv.g.scale.setScalar(Math.max(t, 0.01)), ease.elastique);
    son.combo(o.n);
    monde.particules.jet(nouv.g.position.clone().setY(0.5), CHAINES[o.ch].couleur, { n: 18, vitesse: 4, vie: 0.7, eclat: 1.6 });
    monde.particules.jet(nouv.g.position.clone().setY(0.6), 0xffe9a8, { n: 10, vitesse: 2.5, vie: 0.8, eclat: 2.2, taille: 0.05 });
    if (o.n + 1 === 5) ui.bulle(CHAINES[o.ch].objets[4] + ' !');
    majCommandes();
    return;
  }
  // échange de place
  const [oc, or] = [o.c, o.r];
  o.c = autre.c; o.r = autre.r; autre.c = oc; autre.r = or;
  glisser(o, o.c, o.r); glisser(autre, autre.c, autre.r);
});
function glisser(o, c, r) { const d = o.g.position.clone(), f = posCase(c, r); anime(0.18, t => o.g.position.lerpVectors(d, f, t)); }

function produire() {
  const libre = caseLibre();
  if (!libre) { son.erreur(); ui.bulle('Plateau plein', '#ff8c1a'); return; }
  son.pop();
  anime(0.25, t => { malle.scale.set(1 + Math.sin(t * Math.PI) * 0.12, 1 - Math.sin(t * Math.PI) * 0.1, 1); });
  const chainesDispo = Math.min(2 + Math.floor((etape + (numeroKaz - 1) * 10) / 3), 4);
  const ch = Math.floor(Math.random() * chainesDispo);
  const o = creerObjet(ch, 1, libre[0], libre[1]);
  const f = o.g.position.clone(), d = malle.position.clone().setY(1.2);
  anime(0.4, t => { o.g.position.lerpVectors(d, f, t); o.g.position.y += Math.sin(t * Math.PI) * 1.5; }, ease.lin);
}

// ---------- Commandes de gramoun (cartes en bas d'écran) ----------
const zone = ui.el('div', 'k-bas');
document.body.appendChild(zone);
const style = document.createElement('style');
style.textContent = `.k-bas{flex-wrap:nowrap}
.cmd{background:rgba(255,250,236,.95);color:#2b1a0c;border-radius:18px;padding:6px 8px 6px 6px;display:flex;gap:7px;align-items:center;width:min(44vw,230px);box-shadow:0 8px 22px rgba(0,0,0,.3);border:3px solid transparent}
.cmd img{width:46px;height:46px;flex:none}.cmd b{display:block;font:800 13px/1.1 var(--titre)}.cmd small{font-size:11px;opacity:.75;display:block}
.cmd.pret{border-color:#2fa84f;animation:kFlamme 1s infinite alternate}.cmd button{margin-top:4px;font:800 13px var(--titre);border:0;border-radius:12px;padding:6px 12px;background:#cfc6b4;color:#6b5a44;min-height:34px}
.cmd.pret button{background:#2fa84f;color:#fff}`;
document.head.appendChild(style);
function nouvelleCommande() {
  const progres = etape + (numeroKaz - 1) * 10;
  const chainesDispo = Math.min(2 + Math.floor(progres / 3), 4);
  const ch = Math.floor(Math.random() * chainesDispo);
  const n = Math.min(2 + Math.floor(Math.random() * (1 + progres / 4)), 5);
  if (commandes.some(c => c && c.ch === ch && c.n === n)) return { ch: (ch + 1) % chainesDispo, n };
  return { ch, n };
}
function majCommandes() {
  zone.innerHTML = '';
  commandes.forEach((cmd, i) => {
    const chaine = CHAINES[cmd.ch];
    texObjet(chaine, cmd.n);
    const pret = plateau.some(o => o.ch === cmd.ch && o.n === cmd.n);
    const d = ui.el('div', 'cmd zone-interactive' + (pret ? ' pret' : ''), `<img alt="" src="${cacheImages[chaine.id + cmd.n]}"><div><small>Gramoun demande</small><b>${chaine.objets[cmd.n - 1]}</b><button class="zone-interactive">Donner</button></div>`);
    surAppui(d.querySelector('button'), () => donner(i));
    zone.appendChild(d);
  });
  protegerZones();
}
async function donner(i) {
  const cmd = commandes[i];
  const o = plateau.find(x => x.ch === cmd.ch && x.n === cmd.n);
  if (!o) { son.erreur(); ui.bulle('Pas encore sur la table', '#ff8c1a'); return; }
  plateau = plateau.filter(x => x !== o);
  const d = o.g.position.clone(), f = decorKaz.position.clone().add(new THREE.Vector3(0, 1.5, 3));
  anime(0.6, t => { o.g.position.lerpVectors(d, f, t); o.g.position.y += Math.sin(t * Math.PI) * 3; o.g.scale.setScalar(1 - t * 0.7); }, ease.douce).then(() => scene.remove(o.g));
  son.succes();
  commandes[i] = nouvelleCommande();
  majCommandes();
  await attendre(0.5);
  // une étape de restauration
  if (etape < ETAPES.length) {
    ETAPES[etape][1]();
    ui.bulle(ETAPES[etape][0]);
    monde.particules.jet(decorKaz.position.clone().add(new THREE.Vector3(0, 2.5, 0)), 0xffe9a8, { n: 30, vitesse: 4, vie: 1, eclat: 2, dispersion: 4 });
    etape++; stock.ecrire('gramoun-etape', etape); ui.maj('etape', `${etape}/${ETAPES.length}`);
  }
  if (etape >= ETAPES.length) {
    fini = true;
    son.victoire();
    monde.particules.confettis(decorKaz.position.clone().add(new THREE.Vector3(0, 4, 2)), 120);
    await attendre(1.5);
    await ui.ecran({ titre: 'La kaz est belle !', sousTitre: `Kaz n° ${numeroKaz} restaurée`, etoiles: 3, texte: 'Gramoun est fière de sa kaz. Une autre kaz du quartier attend ton aide…', boutons: [{ id: 'ok', texte: 'Kaz suivante' }] });
    numeroKaz++; etape = 0; stock.ecrire('gramoun-kaz', numeroKaz); stock.ecrire('gramoun-etape', 0);
    nouvellePartie();
  }
}

function nouvellePartie() {
  plateau.forEach(o => scene.remove(o.g)); plateau = []; fini = false;
  construireKaz();
  for (let i = 0; i < 6; i++) { const l = caseLibre(); creerObjet(Math.floor(Math.random() * 2), 1, l[0], l[1]); }
  commandes = [{ ch: 0, n: 2 }];
  commandes.push(nouvelleCommande());
  majCommandes();
  ui.maj('etape', `${etape}/${ETAPES.length}`); ui.maj('kaz', numeroKaz);
}

ui.init({ titre: 'La kaz gramoun' });
ui.stat('kaz', 'Kaz', numeroKaz);
ui.stat('etape', 'Travaux', '0/10');
etape = stock.lire('gramoun-etape', 0);
son.ambiance('foret');
nouvellePartie();
ui.chargementFini();
ui.ecran({
  titre: 'La kaz gramoun', sousTitre: 'Objets lontan et kaz créole',
  texte: 'Touche la malle pour sortir des objets. Glisse un objet sur un objet identique pour les fusionner : une allumette devient une bougie, puis un bougeoir, une lampe à pétrole, un fanal… Donne à gramoun ce qu’elle demande pour remettre sa kaz en état.',
  info: 'Cafetière émaillée, fer à charbon, roche à cari, marmite en fonte, fanal : ces objets lontan faisaient partie de la vie quotidienne dans les kaz réunionnaises d’autrefois.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
