// =====================================================================
// APRÈS LE CYCLONE - jeu de remise en état très satisfaisant (« ASMR »)
// Le cyclone est passé. Ramasse les débris, recloue les tôles du toit,
// puis frotte la façade pour enlever la boue. Le soleil revient peu à peu.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, choisir, hasard, attendre, protegerZones } from '../commun/kwelafe.js';
import { kaz, cocotier, bananier, payanke, montagnes, solHerbe, galet, texPlanches, ombrer } from '../commun/decor.js';

const KAZ = [
  { mur: '#f4c95d', toit: '#b8352a', volets: '#2f8f5b' },
  { mur: '#8fd3e8', toit: '#5b6770', volets: '#ffffff' },
  { mur: '#f28db2', toit: '#2f6f5b', volets: '#ffffff' },
];
let niveau = stock.lire('cyclone-niveau', 1);

const monde = creerMonde({
  soleil: { elevation: 34, azimut: 215, intensite: 0.6 }, exposition: 0.85,
  ombre: { taille: 12 },
  brouillard: { couleur: 0x8d99a3, pres: 20, loin: 90 },
  cadrer(cam, ratio) {
    const portrait = ratio < 1;
    const dist = portrait ? Math.max(13, 9.5 / ratio) : 12.5;
    cam.position.set(portrait ? 2 : 3, portrait ? 6.5 : 5.5, dist);
    cam.lookAt(0, 1.8, 0.5);
  },
});
const { scene, soleil } = monde;
scene.add(solHerbe(200));
const mont = montagnes(300, 50, 2); mont.position.set(0, -0.5, -85); scene.add(mont);
const arbres = [];
for (const [x, z, h] of [[-8, -3, 7], [8.5, -4, 7.5], [-10, 4, 6]]) { const c = cocotier(h, 0.8); c.position.set(x, 0, z); scene.add(c); arbres.push(c); }
for (const [x, z] of [[6, 3], [-6, -6]]) { const b = bananier(3); b.position.set(x, 0, z); b.rotation.z = 0.15; scene.add(b); }
// flaques
for (let i = 0; i < 6; i++) {
  const f = new THREE.Mesh(new THREE.CircleGeometry(hasard(0.6, 1.4), 24), new THREE.MeshPhysicalMaterial({ color: 0x4a5a66, roughness: 0.05, metalness: 0.3, clearcoat: 1 }));
  f.rotation.x = -Math.PI / 2; f.position.set(hasard(-7, 7), 0.01, hasard(4, 8)); f.scale.y = 0.6; scene.add(f);
}
// brouette
const brouette = new THREE.Group();
{
  const metal = new THREE.MeshStandardMaterial({ color: 0x2f6f5b, metalness: 0.6, roughness: 0.4 });
  const bac = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.45, 0.55, 4, 1, true), metal); bac.rotation.y = Math.PI / 4; bac.scale.set(1.3, 1, 0.9); bac.position.y = 0.75; bac.material.side = THREE.DoubleSide; brouette.add(bac);
  const roue = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 8, 20), new THREE.MeshStandardMaterial({ color: 0x151515 })); roue.position.set(0.9, 0.3, 0); brouette.add(roue);
  for (const z of [-0.35, 0.35]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), metal); b.rotation.z = Math.PI / 2 - 0.2; b.position.set(-0.2, 0.55, z); brouette.add(b); }
  brouette.position.set(4.6, 0, 3.6); brouette.rotation.y = -0.6;
  scene.add(ombrer(brouette));
}

// ---------- Pluie ----------
const nbGouttes = 900;
const pluie = new THREE.InstancedMesh(new THREE.BoxGeometry(0.015, 0.45, 0.015), new THREE.MeshBasicMaterial({ color: 0xcfe0ee, transparent: true, opacity: 0.45 }), nbGouttes);
const gouttes = Array.from({ length: nbGouttes }, () => new THREE.Vector3(hasard(-14, 14), hasard(0, 14), hasard(-8, 12)));
scene.add(pluie);
let forcePluie = 1;
const mtx = new THREE.Matrix4();
monde.chaque(dt => {
  for (let i = 0; i < nbGouttes; i++) {
    const g = gouttes[i]; g.y -= 16 * dt; g.x += 2.5 * dt;
    if (g.y < 0) { g.y = 14; g.x = hasard(-14, 14); }
    mtx.makeTranslation(g.x, g.y, g.z); mtx.scale(new THREE.Vector3(1, 1, 1).multiplyScalar(i / nbGouttes < forcePluie ? 1 : 0));
    pluie.setMatrixAt(i, mtx);
  }
  pluie.instanceMatrix.needsUpdate = true;
  arbres.forEach((a, i) => { a.rotation.z = Math.sin(monde.temps() * 2 + i) * 0.03 * forcePluie; });
});
function meteo(k) { // k : 0 = tempête, 1 = grand soleil
  forcePluie = Math.max(0, 1 - k * 1.4);
  soleil.intensity = 0.6 + k * 2.0;
  scene.fog.color.setRGB(0.55 + k * 0.25, 0.6 + k * 0.29, 0.64 + k * 0.31);
  scene.fog.near = 20 + k * 40; scene.fog.far = 90 + k * 160;
  monde.renderer.toneMappingExposure = 0.85 + k * 0.15;
}

// ---------- La kaz abîmée ----------
let maison, toles = [], debris = [], boue, ctxBoue, texBoue, etape, fini, chrono, arcEnCiel, oiseau;
const groupeNiveau = new THREE.Group(); scene.add(groupeNiveau);
function construire() {
  groupeNiveau.clear(); debris = []; toles = [];
  const couleurs = KAZ[(niveau - 1) % KAZ.length];
  maison = kaz({ ...couleurs, varangue: false });
  groupeNiveau.add(maison);
  const P = 4.4, L = 6, H = 2.6, haut = 0.45 + H, rh = 1.45, run = P / 2 + 0.45;
  // le pan avant est remplacé par 6 bandes de tôle, certaines arrachées
  const pan = maison.userData.pans[0];
  pan.visible = false;
  const nb = 6, largeur = (L + 0.9) / nb;
  const geo = new THREE.PlaneGeometry(largeur * 1.04, Math.hypot(run, rh), 24, 1);
  const pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * Math.PI * 2 / 0.19) * 0.028);
  geo.computeVertexNormals(); geo.rotateX(-Math.PI / 2);
  const nbArrachees = Math.min(2 + niveau, 5);
  const arrachees = new Set([0, 1, 2, 3, 4, 5].sort(() => Math.random() - .5).slice(0, nbArrachees));
  for (let i = 0; i < nb; i++) {
    const t = new THREE.Mesh(geo, maison.userData.matToit);
    t.castShadow = true;
    const place = { x: -(L + 0.9) / 2 + largeur * (i + 0.5), y: haut + rh / 2, z: run / 2, rx: Math.atan2(rh, run) };
    t.userData.place = place;
    if (arrachees.has(i)) {
      t.position.set(place.x + hasard(-0.3, 0.3), place.y + hasard(0.4, 0.9), place.z + hasard(0.2, 0.6));
      t.rotation.set(place.rx + hasard(-0.5, 0.3), hasard(-0.4, 0.4), hasard(-0.35, 0.35));
      t.userData.arrachee = true;
      t.userData.tole = true;
    } else { t.position.set(place.x, place.y, place.z); t.rotation.x = place.rx; }
    maison.add(t); toles.push(t);
  }
  // boue sur la façade (calque que l'on efface au doigt)
  texBoue = toile(512, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = h - Math.pow(Math.random(), 1.6) * h;
      const r = hasard(12, 46);
      const g = c.createRadialGradient(x, y, 2, x, y, r);
      const brun = `${90 + Math.random() * 30},${62 + Math.random() * 20},${35 + Math.random() * 15}`;
      g.addColorStop(0, `rgba(${brun},.95)`); g.addColorStop(1, `rgba(${brun},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
    c.fillStyle = 'rgba(95,68,40,.85)'; c.fillRect(0, h * 0.72, w, h * 0.28);
  });
  ctxBoue = texBoue.userData.canvas.getContext('2d');
  boue = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.02, H), new THREE.MeshStandardMaterial({ map: texBoue, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  boue.position.set(0, 0.45 + H / 2, P / 2 + 0.07); boue.renderOrder = 2;
  maison.add(boue);
  // débris : branches, palmes, morceaux de tôle, galets
  const nbDebris = 7 + niveau * 2;
  for (let i = 0; i < nbDebris; i++) {
    let d; const type = i % 4;
    if (type === 0) { d = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x5a4636 })); b.rotation.z = Math.PI / 2; d.add(b); for (let k = 0; k < 3; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), new THREE.MeshStandardMaterial({ color: 0x3f7a2a })); f.position.set(hasard(-0.6, 0.6), 0.1, hasard(-0.2, 0.2)); d.add(f); } }
    else if (type === 1) { d = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 2.2), new THREE.MeshStandardMaterial({ color: 0x8a7a3a, side: THREE.DoubleSide })); d.rotation.x = -Math.PI / 2; }
    else if (type === 2) { d = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 0.7, roughness: 0.4 })); }
    else d = galet(0.3);
    const ang = Math.random() * Math.PI * 2, r = hasard(3.2, 6.5);
    d.position.set(Math.cos(ang) * r * 1.2, 0.08, Math.abs(Math.sin(ang)) * r * 0.8 + 1.5);
    d.rotation.y = Math.random() * 6;
    ombrer(d);
    d.traverse(m => { m.userData.debris = d; });
    groupeNiveau.add(d); debris.push(d);
  }
  // arc-en-ciel et paille-en-queue (invisibles au début)
  arcEnCiel = new THREE.Group();
  ['#e8402a', '#ff8c1a', '#ffc928', '#2fa84f', '#1f6fd1', '#7b4bd6'].forEach((c, i) => {
    const a = new THREE.Mesh(new THREE.TorusGeometry(26 - i * 0.7, 0.35, 6, 80, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    arcEnCiel.add(a);
  });
  arcEnCiel.position.set(-6, -2, -45);
  groupeNiveau.add(arcEnCiel);
  oiseau = null;
  etape = 0; fini = false; chrono = 0;
  meteo(0); majConsigne();
}

// ---------- Étapes ----------
const ETAPES = ['Ramasse les débris', 'Recloue les tôles du toit', 'Frotte la façade pour enlever la boue'];
const consigne = ui.el('div', 'k-bas');
document.body.appendChild(consigne);
const style = document.createElement('style');
style.textContent = `.consigne{background:rgba(255,250,236,.95);color:#2b1a0c;border-radius:20px;padding:10px 18px;font:800 16px var(--titre);box-shadow:0 8px 22px rgba(0,0,0,.3);display:flex;gap:12px;align-items:center}
.jauge{width:110px;height:10px;border-radius:9px;background:rgba(0,0,0,.12);overflow:hidden}.jauge div{height:100%;background:linear-gradient(90deg,#2fa84f,#ffc928);width:0}`;
document.head.appendChild(style);
consigne.innerHTML = '<div class="consigne zone-interactive"><span></span><div class="jauge"><div></div></div></div>';
const texteConsigne = consigne.querySelector('span'), jauge = consigne.querySelector('.jauge div');
function majConsigne(p = 0) { texteConsigne.textContent = `${etape + 1}/3 · ${ETAPES[Math.min(etape, 2)]}`; jauge.style.width = (p * 100) + '%'; ui.maj('etape', `${Math.min(etape + 1, 3)}/3`); }
monde.chaque(dt => { if (!fini) { chrono += dt; ui.maj('temps', Math.floor(chrono) + ' s'); } });

// ---------- Interactions ----------
const canvas = monde.renderer.domElement;
let frotte = false;
canvas.addEventListener('pointerdown', e => {
  if (fini) return;
  if (etape === 0) {
    const hit = monde.toucher(e, debris);
    if (!hit) return;
    const d = hit.object.userData.debris;
    debris.splice(debris.indexOf(d), 1);
    son.pop();
    const de = d.position.clone(), vers = brouette.position.clone().setY(1);
    anime(0.5, t => { d.position.lerpVectors(de, vers, t); d.position.y += Math.sin(t * Math.PI) * 2.5; d.rotation.x += 0.2; d.scale.setScalar(1 - t * 0.5); }, ease.douce).then(() => { groupeNiveau.remove(d); son.pose(); anime(0.2, t => brouette.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.1)); });
    const total = 7 + niveau * 2;
    majConsigne(1 - debris.length / total);
    meteo((1 - debris.length / total) * 0.33);
    if (!debris.length) etapeSuivante();
  } else if (etape === 1) {
    const hit = monde.toucher(e, toles.filter(t => t.userData.arrachee));
    if (!hit) return;
    const t = hit.object; t.userData.arrachee = false;
    const p = t.userData.place, dp = t.position.clone(), dr = t.rotation.clone();
    anime(0.35, k => { t.position.set(dp.x + (p.x - dp.x) * k, dp.y + (p.y - dp.y) * k, dp.z + (p.z - dp.z) * k); t.rotation.set(dr.x + (p.rx - dr.x) * k, dr.y * (1 - k), dr.z * (1 - k)); }, ease.rebond).then(() => {
      for (let k = 0; k < 3; k++) setTimeout(() => { son.marteau(); const w = t.getWorldPosition(new THREE.Vector3()); monde.particules.jet(w.add(new THREE.Vector3(hasard(-0.4, 0.4), 0.3, 0.6)), 0xffe08a, { n: 6, vitesse: 3, vie: 0.3, eclat: 2.5, taille: 0.04 }); }, k * 140);
    });
    const restantes = toles.filter(x => x.userData.arrachee).length;
    const total = toles.filter(x => x.userData.tole).length;
    majConsigne(1 - restantes / total);
    meteo(0.33 + (1 - restantes / total) * 0.33);
    if (!restantes) setTimeout(etapeSuivante, 600);
  } else if (etape === 2) { frotte = true; frotter(e); }
});
canvas.addEventListener('pointermove', e => { if (frotte) frotter(e); });
window.addEventListener('pointerup', () => { frotte = false; });
let compteurFrotte = 0;
function frotter(e) {
  const hit = monde.toucher(e, [boue]);
  if (!hit || !hit.uv) return;
  const x = hit.uv.x * 512, y = (1 - hit.uv.y) * 256;
  ctxBoue.globalCompositeOperation = 'destination-out';
  const g = ctxBoue.createRadialGradient(x, y, 4, x, y, 30);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctxBoue.fillStyle = g; ctxBoue.beginPath(); ctxBoue.arc(x, y, 30, 0, 7); ctxBoue.fill();
  ctxBoue.globalCompositeOperation = 'source-over';
  texBoue.needsUpdate = true;
  if (Math.random() < 0.5) son.frotte();
  monde.particules.jet(hit.point.clone().add(new THREE.Vector3(0, 0, 0.1)), Math.random() < 0.5 ? 0x7a5a36 : 0xffffff, { n: 2, vitesse: 1.2, vie: 0.4, taille: 0.04, gravite: 4 });
  if (++compteurFrotte % 12 === 0) {
    const d = ctxBoue.getImageData(0, 0, 512, 256).data;
    let sale = 0; for (let i = 3; i < d.length; i += 64) if (d[i] > 40) sale++;
    const propre = 1 - sale / (d.length / 64) / 0.55;
    majConsigne(Math.min(1, Math.max(0, propre)));
    meteo(0.66 + Math.min(1, Math.max(0, propre)) * 0.34);
    if (propre > 0.9) { ctxBoue.clearRect(0, 0, 512, 256); texBoue.needsUpdate = true; etapeSuivante(); }
  }
}
async function etapeSuivante() {
  etape++;
  son.succes();
  if (etape < 3) { majConsigne(0); ui.bulle(['', 'Les tôles maintenant !', 'Un bon coup de brosse !'][etape]); return; }
  fini = true; meteo(1);
  son.victoire();
  arcEnCiel.children.forEach(a => anime(2, t => { a.material.opacity = t * 0.55; }));
  oiseau = payanke(); groupeNiveau.add(oiseau);
  monde.chaque((dt, t) => { if (!oiseau) return; const a = t * 0.35; oiseau.position.set(Math.cos(a) * 7, 7.5, Math.sin(a) * 3 - 2); oiseau.rotation.y = -a; oiseau.maj(t); });
  monde.particules.confettis(new THREE.Vector3(0, 4, 2), 120);
  const temps = Math.round(chrono);
  await attendre(2.2);
  niveau++; stock.ecrire('cyclone-niveau', niveau);
  await ui.ecran({ titre: 'La kaz est sauvée !', sousTitre: `Remise en état en ${temps} s`, etoiles: temps < 60 ? 3 : temps < 100 ? 2 : 1, info: 'Après le passage d’un cyclone, tout le quartier s’entraide : on dégage les routes, on vérifie les toitures et on remet les tôles en place.', boutons: [{ id: 'ok', texte: 'Kaz suivante' }] });
  construire();
}

ui.init({ titre: 'Après le cyclone' });
ui.stat('etape', 'Étape', '1/3');
ui.stat('temps', 'Temps', '0 s');
protegerZones();
son.ambiance('pluie');
construire();
ui.chargementFini();
ui.ecran({
  titre: 'Après le cyclone', sousTitre: 'Remets la kaz en état',
  texte: '1. Touche les débris pour les jeter dans la brouette. 2. Touche les tôles arrachées pour les reclouer. 3. Frotte la façade du bout du doigt pour enlever la boue. Plus tu avances, plus le soleil revient !',
  info: 'La saison cyclonique à La Réunion va de novembre à avril. Les vents violents peuvent arracher les tôles des toits et coucher les arbres.',
  boutons: [{ id: 'ok', texte: 'Au travail !' }],
});
