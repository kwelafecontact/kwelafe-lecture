// =====================================================================
// Kwélafé Production - décors et objets 3D de La Réunion, modelés en code
// D'après des références réelles : kaz créole (tôle ondulée, lambrequins,
// varangue, contrevents), cocotier, bananier, flamboyant, champ de cannes,
// Piton de la Fournaise, falaise de basalte, océan, paille-en-queue,
// car jaune, letchi, tangue, galets, ananas Victoria, piment, chouchou, vanille.
// =====================================================================
import { THREE, toile, grain, qualite } from './kwelafe.js';

const Std = o => new THREE.MeshStandardMaterial(o);
const Phy = o => new THREE.MeshPhysicalMaterial(o);
export function ombrer(obj, porte = true, recoit = true) {
  obj.traverse(o => { if (o.isMesh) { o.castShadow = porte; o.receiveShadow = recoit; } });
  return obj;
}

// ---------- bruit de valeur 2D (relief, irrégularités naturelles) ----------
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
export function bruit2(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, oct = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { s += a * bruit2(x * f, y * f); a *= .5; f *= 2.03; } return s; }

// =====================================================================
// Textures
// =====================================================================
export function texPlanches(couleur, repet = [3, 1]) {
  return toile(256, 256, (c, w, h) => {
    c.fillStyle = couleur; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.06})`; c.fillRect(x, 0, 32, h);
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x, 0, 2, h);
      c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 2, 0, 1, h);
    }
    for (let i = 0; i < 40; i++) { c.strokeStyle = 'rgba(80,50,20,.06)'; c.beginPath(); const x = Math.random() * w; c.moveTo(x, 0); c.bezierCurveTo(x + 4, h / 3, x - 4, h * 2 / 3, x + 2, h); c.stroke(); }
    grain(c, w, h, 14);
  }, { repeter: repet });
}
export function texBasalte(repet = [2, 2]) {
  return toile(256, 256, (c, w, h) => {
    c.fillStyle = '#4b4846'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const g = 40 + Math.random() * 60; c.fillStyle = `rgb(${g},${g - 2},${g - 4})`; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, Math.random() * 2.2, 0, 7); c.fill(); }
    grain(c, w, h, 30, 1);
  }, { repeter: repet });
}
export function texAsphalte(repet = [4, 4]) {
  return toile(256, 256, (c, w, h) => {
    c.fillStyle = '#3d4145'; c.fillRect(0, 0, w, h);
    grain(c, w, h, 50, 1); grain(c, w, h, 25, 3);
  }, { repeter: repet });
}
export function texHerbe(repet = [8, 8]) {
  return toile(256, 256, (c, w, h) => {
    c.fillStyle = '#4f8f32'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { c.strokeStyle = `hsl(${85 + Math.random() * 30},${45 + Math.random() * 20}%,${25 + Math.random() * 25}%)`; c.beginPath(); const x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); c.lineTo(x + Math.random() * 3 - 1.5, y - 3 - Math.random() * 5); c.stroke(); }
  }, { repeter: repet });
}
/** Lambrequin : frise de bois ajouré en bord de toiture (motif de gouttes et de fleurs) */
export function texLambrequin(couleur = '#ffffff') {
  return toile(256, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = couleur;
    c.fillRect(0, 0, w, 26);
    for (let i = 0; i < 4; i++) {
      const cx = i * 64 + 32;
      c.beginPath();
      c.moveTo(cx - 28, 26);
      c.bezierCurveTo(cx - 26, 60, cx - 10, 72, cx, 112);
      c.bezierCurveTo(cx + 10, 72, cx + 26, 60, cx + 28, 26);
      c.closePath(); c.fill();
      c.globalCompositeOperation = 'destination-out';
      c.beginPath(); c.arc(cx, 52, 9, 0, 7); c.fill();
      c.beginPath(); c.moveTo(cx, 70); c.lineTo(cx - 5, 84); c.lineTo(cx, 96); c.lineTo(cx + 5, 84); c.fill();
      c.beginPath(); c.arc(cx - 32, 40, 5, 0, 7); c.fill();
      c.globalCompositeOperation = 'source-over';
    }
  }, { repeter: [1, 1] });
}
function texFeuille(teinte = 110, largeur = 1) {
  return toile(128, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.strokeStyle = `hsl(${teinte},45%,26%)`; c.lineWidth = 5;
    c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2, 0); c.stroke();
    for (let y = 10; y < h; y += 9) {
      const l = (w / 2 - 4) * Math.sin((y / h) * Math.PI) * largeur;
      c.strokeStyle = `hsl(${teinte + Math.random() * 14},${50 + Math.random() * 15}%,${30 + Math.random() * 12}%)`;
      c.lineWidth = 5;
      c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2 - l, y - 26); c.stroke();
      c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2 + l, y - 26); c.stroke();
    }
  });
}

// =====================================================================
// Kaz créole
// =====================================================================
/**
 * kaz({ mur, toit, volets, largeur, profondeur, hauteur, varangue, lambrequin })
 * Renvoie un groupe ; group.userData contient les parties (pour les jeux qui
 * construisent, nettoient ou repeignent la kaz).
 */
export function kaz(o = {}) {
  const L = o.largeur ?? 6, P = o.profondeur ?? 4.4, H = o.hauteur ?? 2.6;
  const couleurMur = o.mur ?? '#f4c95d', couleurToit = o.toit ?? '#b8352a', couleurVolets = o.volets ?? '#2f8f5b';
  const g = new THREE.Group();
  const parties = { volets: [], lambrequins: [], pans: [] };

  const soub = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, 0.45, P + 0.3), Std({ map: texBasalte([3, 0.4]), roughness: 0.95 }));
  soub.position.y = 0.225; g.add(soub); parties.soubassement = soub;

  const matMur = Std({ map: texPlanches('#ffffff', [L / 1.6, 1]), color: couleurMur, roughness: 0.82 });
  const murs = new THREE.Mesh(new THREE.BoxGeometry(L, H, P), matMur);
  murs.position.y = 0.45 + H / 2; g.add(murs); parties.murs = murs; parties.matMur = matMur;
  const haut = 0.45 + H;

  // Pignons triangulaires
  const rh = 1.45, debord = 0.45, run = P / 2 + debord;
  const forme = new THREE.Shape();
  forme.moveTo(-P / 2, 0); forme.lineTo(P / 2, 0); forme.lineTo(0, rh * (P / 2) / run); forme.closePath();
  const geoPignon = new THREE.ShapeGeometry(forme);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(geoPignon, matMur);
    p.rotation.y = s * Math.PI / 2; p.position.set(s * L / 2, haut, 0);
    p.material.side = THREE.DoubleSide; g.add(p);
  }

  // Toiture en tôle ondulée (deux pans)
  const longPente = Math.hypot(run, rh);
  const angle = Math.atan2(rh, run);
  const geoTole = new THREE.PlaneGeometry(L + 0.9, longPente, qualite > 0 ? 110 : 60, 1);
  const pos = geoTole.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * Math.PI * 2 / 0.19) * 0.028);
  geoTole.computeVertexNormals();
  geoTole.rotateX(-Math.PI / 2);
  const matToit = Std({ color: couleurToit, roughness: 0.42, metalness: 0.55, side: THREE.DoubleSide });
  parties.matToit = matToit;
  const toit = new THREE.Group();
  for (const s of [0, 1]) {
    const pivot = new THREE.Group(); pivot.rotation.y = s * Math.PI;
    const pan = new THREE.Mesh(geoTole, matToit);
    pan.rotation.x = angle; pan.position.set(0, haut + rh / 2, run / 2);
    pivot.add(pan); toit.add(pivot); parties.pans.push(pan);
  }
  const faitage = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, L + 0.9, 8), matToit);
  faitage.rotation.z = Math.PI / 2; faitage.position.y = haut + rh + 0.02; toit.add(faitage);
  g.add(toit); parties.toit = toit;

  // Lambrequins blancs en bordure de toit
  const texL = texLambrequin(o.lambrequin ?? '#ffffff');
  texL.wrapS = THREE.RepeatWrapping; texL.repeat.set((L + 0.9) / 1.0, 1);
  const matL = Std({ map: texL, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 });
  const geoL = new THREE.PlaneGeometry(L + 0.9, 0.42);
  const ajouterLambrequin = (x, y, z, ry, largeur) => {
    const geo = largeur ? new THREE.PlaneGeometry(largeur, 0.42) : geoL;
    const t = largeur ? texL.clone() : texL;
    if (largeur) { t.repeat.set(largeur / 1.0, 1); t.needsUpdate = true; }
    const m = new THREE.Mesh(geo, largeur ? Std({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 }) : matL);
    m.position.set(x, y - 0.21, z); m.rotation.y = ry; g.add(m); parties.lambrequins.push(m); return m;
  };
  ajouterLambrequin(0, haut, -run, 0);

  // Façade : porte à deux battants et fenêtres à contrevents
  const matVolet = Std({ map: texPlanches('#ffffff', [1, 1]), color: couleurVolets, roughness: 0.7 });
  parties.matVolet = matVolet;
  const matCadre = Std({ color: 0xfaf7ef, roughness: 0.6 });
  const zf = P / 2 + 0.035;
  const cadrePorte = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.05, 0.05), matCadre);
  cadrePorte.position.set(0, 0.45 + 1.02, zf - 0.01); g.add(cadrePorte);
  for (const s of [-1, 1]) {
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.54, 1.9, 0.06), matVolet);
    v.position.set(s * 0.29, 0.45 + 0.98, zf + 0.02); g.add(v); parties.volets.push(v);
  }
  const nbFen = L >= 5 ? 2 : 1;
  for (let i = 0; i < nbFen; i++) {
    const x = nbFen === 1 ? L * 0.3 : (i === 0 ? -1 : 1) * L * 0.32;
    const cadre = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.05), matCadre);
    cadre.position.set(x, 0.45 + 1.35, zf - 0.01); g.add(cadre);
    const vitre = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), Phy({ color: 0x1d2b33, roughness: 0.05, metalness: 0.2, clearcoat: 1 }));
    vitre.position.set(x, 0.45 + 1.35, zf + 0.02); g.add(vitre);
    for (const s of [-1, 1]) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.12, 0.05), matVolet);
      v.position.set(x + s * 0.74, 0.45 + 1.35, zf + 0.04); v.rotation.y = s * 0.25; g.add(v); parties.volets.push(v);
    }
  }

  // Varangue : auvent, poteaux blancs, plancher
  if (o.varangue !== false) {
    const prof = 1.7, bas = haut - 0.55;
    const plancher = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, 0.12, prof), Std({ map: texPlanches('#9a6b3f', [L / 1.2, 1]), roughness: 0.8 }));
    plancher.position.set(0, 0.39, P / 2 + prof / 2 + 0.15); g.add(plancher);
    const geoAuvent = new THREE.PlaneGeometry(L + 0.6, Math.hypot(prof + 0.25, 0.5), qualite > 0 ? 100 : 50, 1);
    const pa = geoAuvent.attributes.position;
    for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * Math.PI * 2 / 0.19) * 0.026);
    geoAuvent.computeVertexNormals(); geoAuvent.rotateX(-Math.PI / 2);
    const auvent = new THREE.Mesh(geoAuvent, matToit);
    auvent.rotation.x = Math.atan2(0.5, prof + 0.25);
    auvent.position.set(0, (haut - 0.1 + bas) / 2, P / 2 + (prof + 0.25) / 2);
    g.add(auvent); parties.auvent = auvent;
    const matPoteau = Std({ color: 0xffffff, roughness: 0.5 });
    for (let i = 0; i < 4; i++) {
      const x = -L / 2 + 0.2 + i * (L - 0.4) / 3;
      const po = new THREE.Mesh(new THREE.BoxGeometry(0.13, bas - 0.45, 0.13), matPoteau);
      po.position.set(x, 0.45 + (bas - 0.45) / 2, P / 2 + prof + 0.05); g.add(po);
    }
    const garde = new THREE.Mesh(new THREE.BoxGeometry(L, 0.06, 0.06), matPoteau);
    garde.position.set(0, 1.25, P / 2 + prof + 0.05); g.add(garde);
    ajouterLambrequin(0, bas + 0.02, P / 2 + prof + 0.2, 0, L + 0.6);
    parties.varangue = plancher;
  } else {
    ajouterLambrequin(0, haut, run, 0);
  }
  g.userData = parties;
  return ombrer(g);
}

// =====================================================================
// Végétation
// =====================================================================
export function cocotier(h = 7, inclinaison = 1) {
  const g = new THREE.Group();
  const courbe = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.35 * inclinaison, h * 0.35, 0.1),
    new THREE.Vector3(0.9 * inclinaison, h * 0.7, 0.2), new THREE.Vector3(1.3 * inclinaison, h, 0.25)]);
  const texTronc = toile(64, 256, (c, w, hh) => {
    c.fillStyle = '#8b7355'; c.fillRect(0, 0, w, hh);
    for (let y = 0; y < hh; y += 10) { c.fillStyle = 'rgba(40,25,10,.45)'; c.fillRect(0, y, w, 3); c.fillStyle = 'rgba(255,240,210,.12)'; c.fillRect(0, y + 3, w, 2); }
    grain(c, w, hh, 30);
  }, { repeter: [1, h * 1.2] });
  const tronc = new THREE.Mesh(new THREE.TubeGeometry(courbe, 24, 0.17, 10), Std({ map: texTronc, roughness: 0.9 }));
  g.add(tronc);
  const sommet = courbe.getPoint(1);
  const texF = texFeuille(100, 1);
  const matF = Std({ map: texF, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.65 });
  const geoF = new THREE.PlaneGeometry(1.4, 4.2, 1, 14);
  const pf = geoF.attributes.position;
  for (let i = 0; i < pf.count; i++) { const y = pf.getY(i) + 2.1; pf.setY(i, y); pf.setZ(i, -y * y * 0.075); }
  geoF.computeVertexNormals();
  for (let i = 0; i < 10; i++) {
    const f = new THREE.Mesh(geoF, matF);
    f.position.copy(sommet);
    f.rotation.order = 'YXZ';
    f.rotation.y = (i / 10) * Math.PI * 2 + Math.random() * 0.3;
    f.rotation.x = -0.9 - Math.random() * 0.5;
    g.add(f);
  }
  const matCoco = Std({ color: 0x5d7a2a, roughness: 0.6 });
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), matCoco);
    c.position.copy(sommet).add(new THREE.Vector3(Math.cos(i * 1.6) * 0.22, -0.2, Math.sin(i * 1.6) * 0.22));
    g.add(c);
  }
  return ombrer(g, true, false);
}

export function bananier(h = 3) {
  const g = new THREE.Group();
  const tronc = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, h, 10), Std({ color: 0x7d8f45, roughness: 0.8 }));
  tronc.position.y = h / 2; g.add(tronc);
  const tex = toile(128, 512, (c, w, hh) => {
    c.clearRect(0, 0, w, hh);
    const grd = c.createLinearGradient(0, 0, w, 0);
    grd.addColorStop(0, '#3f7f2a'); grd.addColorStop(.5, '#6fb33e'); grd.addColorStop(1, '#3f7f2a');
    c.fillStyle = grd;
    c.beginPath(); c.ellipse(w / 2, hh / 2, w / 2 - 2, hh / 2 - 4, 0, 0, 7); c.fill();
    c.fillStyle = '#c9d77a'; c.fillRect(w / 2 - 2, 0, 4, hh);
    c.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 5; i++) { const y = 60 + Math.random() * (hh - 120); c.fillRect(Math.random() < .5 ? 0 : w / 2 + 6, y, w / 2 - 6, 3); }
  });
  const matF = Std({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 });
  const geo = new THREE.PlaneGeometry(0.9, 2.6, 1, 10);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) + 1.3; p.setY(i, y); p.setZ(i, -y * y * 0.12); }
  geo.computeVertexNormals();
  for (let i = 0; i < 7; i++) {
    const f = new THREE.Mesh(geo, matF);
    f.position.y = h - 0.1; f.rotation.order = 'YXZ';
    f.rotation.y = i * 0.9 + Math.random() * 0.4; f.rotation.x = -0.4 - Math.random() * 0.5;
    g.add(f);
  }
  return ombrer(g, true, false);
}

/** Flamboyant (Delonix regia) : grand parasol rouge orangé, floraison de décembre */
export function flamboyant(echelle = 1) {
  const g = new THREE.Group();
  const matBois = Std({ color: 0x6b5a4a, roughness: 0.9 });
  const tronc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.4, 10), matBois);
  tronc.position.y = 1.2; g.add(tronc);
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, 2.4, 6), matBois);
    const a = (i / 5) * Math.PI * 2;
    b.position.set(Math.cos(a) * 0.8, 2.7, Math.sin(a) * 0.8);
    b.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(b);
  }
  const n = [140, 260, 380][qualite];
  const touffes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.42, 1), Std({ roughness: 0.75 }), n);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 3.1;
    const y = 3.4 + (1 - r / 3.1) * 0.9 + Math.random() * 0.4;
    const s = 0.6 + Math.random() * 0.7;
    m.compose(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.7, s));
    touffes.setMatrixAt(i, m);
    if (Math.random() < 0.72) col.setHSL(0.015 + Math.random() * 0.035, 0.85, 0.42 + Math.random() * 0.1);
    else col.setHSL(0.27 + Math.random() * 0.05, 0.5, 0.28);
    touffes.setColorAt(i, col);
  }
  g.add(touffes);
  g.scale.setScalar(echelle);
  return ombrer(g, true, false);
}

/** Champ de cannes à sucre (instancié) sur un rectangle largeur x longueur */
export function champCannes(largeur, longueur, densite = 1) {
  const g = new THREE.Group();
  const n = Math.round(largeur * longueur * [1.2, 2, 3][qualite] * densite);
  const tige = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.045, 2.6, 5), Std({ color: 0xb8b060, roughness: 0.7 }), n);
  const geoF = new THREE.PlaneGeometry(0.12, 1.7, 1, 4);
  const pf = geoF.attributes.position;
  for (let i = 0; i < pf.count; i++) { const y = pf.getY(i) + 0.85; pf.setY(i, y); pf.setZ(i, y * y * 0.25); }
  const feuilles = new THREE.InstancedMesh(geoF, Std({ color: 0xffffff, side: THREE.DoubleSide, roughness: 0.6 }), n * 3);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - .5) * largeur, z = (Math.random() - .5) * longueur;
    const s = 0.75 + Math.random() * 0.5;
    e.set((Math.random() - .5) * 0.15, 0, (Math.random() - .5) * 0.15); q.setFromEuler(e);
    m.compose(new THREE.Vector3(x, 1.3 * s, z), q, new THREE.Vector3(1, s, 1)); tige.setMatrixAt(i, m);
    for (let k = 0; k < 3; k++) {
      e.set(0.2, Math.random() * 6.28, 0); q.setFromEuler(e);
      m.compose(new THREE.Vector3(x, 2.1 * s, z), q, new THREE.Vector3(1, s, 1));
      feuilles.setMatrixAt(i * 3 + k, m);
      c.setHSL(0.24 + Math.random() * 0.06, 0.55, 0.3 + Math.random() * 0.12); feuilles.setColorAt(i * 3 + k, c);
    }
  }
  g.add(tige, feuilles);
  return ombrer(g, qualite > 1, true);
}

// =====================================================================
// Reliefs : Piton de la Fournaise, montagnes, falaise, océan
// =====================================================================
/** Piton de la Fournaise : bouclier de lave, cratère Dolomieu rougeoyant */
export function piton(rayon = 40, hauteurMax = 16, lave = true) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(rayon * 2, rayon * 2, qualite > 0 ? 120 : 70, qualite > 0 ? 120 : 70);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const couleurs = [];
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const r = Math.hypot(x, z) / rayon;
    let y = r < 1 ? hauteurMax * Math.pow(1 - r, 1.35) : 0;
    if (r < 0.1) y -= (0.1 - r) * hauteurMax * 1.6; // cratère
    y += (fbm(x * 0.12, z * 0.12) - 0.5) * hauteurMax * 0.12 * (1 - r * 0.5);
    if (r > 1) y = -(r - 1) * hauteurMax * 3;
    p.setY(i, r > 1 ? y : Math.max(y, -0.5));
    const coulee = Math.pow(Math.abs(Math.sin(Math.atan2(z, x) * 7 + fbm(x * .2, z * .2) * 3)), 6);
    if (r > 0.78) c.setHSL(0.28, 0.5, 0.22 + fbm(x * .3, z * .3) * 0.08);
    else if (r > 0.55) c.setHSL(0.07, 0.35, 0.22 + coulee * 0.05).lerp(new THREE.Color(0x3d6b2a), (r - 0.55) / 0.23);
    else c.setHSL(0.03, 0.18 + coulee * 0.2, 0.1 + coulee * 0.05 + fbm(x * .4, z * .4) * 0.06);
    couleurs.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(couleurs, 3));
  geo.computeVertexNormals();
  const terrain = new THREE.Mesh(geo, Std({ vertexColors: true, roughness: 0.95 }));
  terrain.receiveShadow = true;
  g.add(terrain);
  if (lave) {
    const matLave = Std({ color: 0x220800, emissive: 0xff4d00, emissiveIntensity: 2.4, roughness: 0.6 });
    const bassin = new THREE.Mesh(new THREE.CircleGeometry(rayon * 0.07, 32), matLave);
    bassin.rotation.x = -Math.PI / 2; bassin.position.y = hauteurMax * 0.82; g.add(bassin);
    // une coulée qui descend le flanc
    const pts = [];
    for (let k = 0; k <= 20; k++) {
      const r = 0.08 + k * 0.035, a = 0.6 + Math.sin(k * 0.5) * 0.08;
      const x = Math.cos(a) * r * rayon, z = Math.sin(a) * r * rayon;
      pts.push(new THREE.Vector3(x, hauteurMax * Math.pow(1 - r, 1.35) + 0.15, z));
    }
    const coulee = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, rayon * 0.012, 6), matLave);
    g.add(coulee);
    g.userData.lave = matLave;
  }
  return g;
}

/** Ligne de montagnes vertes (remparts, cirques) pour l'arrière-plan */
export function montagnes(largeur = 300, hauteur = 40, graine = 1) {
  const geo = new THREE.PlaneGeometry(largeur, 120, 100, 30);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  const couleurs = [], c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const prof = (60 - z) / 120; // 0 devant, 1 derrière
    const crete = Math.abs(fbm(x * 0.02 + graine, graine) - 0.5) * 2;
    let y = hauteur * Math.pow(prof, 1.2) * (0.55 + 0.6 * (1 - crete)) * (0.75 + fbm(x * 0.05, z * 0.05 + graine) * 0.5);
    p.setY(i, y);
    const roche = Math.max(0, (y / hauteur) - 0.65) * 2;
    c.setHSL(0.27 + fbm(x * .1, z * .1) * 0.05, 0.45, 0.2 + fbm(x * .2, z * .2) * 0.1).lerp(new THREE.Color(0x6a6458), Math.min(roche, 0.7));
    couleurs.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(couleurs, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, Std({ vertexColors: true, roughness: 1 }));
}

/** Falaise de basalte (route du Littoral), sommet couvert de végétation */
export function falaise(longueur = 80, hauteur = 30) {
  const geo = new THREE.PlaneGeometry(longueur, hauteur, 120, 40);
  const p = geo.attributes.position;
  const couleurs = [], c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i) + hauteur / 2;
    const d = (fbm(x * 0.15, y * 0.15) - 0.5) * 3 + Math.sin(x * 0.8 + fbm(x, y * .1) * 4) * 0.3;
    p.setZ(i, d); p.setY(i, y);
    const v = y / hauteur;
    const strate = Math.abs(Math.sin(y * 1.3 + fbm(x * 0.1, y) * 2));
    const vegetation = fbm(x * 0.12 + 7, y * 0.12) > 0.62 - v * 0.25;
    if (v > 0.7 + fbm(x * 0.2, 3) * 0.12 || (vegetation && v > 0.25)) c.setHSL(0.27 + fbm(x, y) * 0.04, 0.5, 0.22 + fbm(x * .5, y * .5) * 0.12);
    else c.setHSL(0.06 + strate * 0.02, 0.22, 0.22 + strate * 0.1 + fbm(x * .3, y * .3) * 0.1);
    couleurs.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(couleurs, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, Std({ vertexColors: true, roughness: 0.95 }));
  m.receiveShadow = true;
  return m;
}

/** Océan Indien animé (houle) ; appeler ocean.maj(temps) à chaque image */
export function ocean(taille = 400, couleur = 0x0e6f9e) {
  const geo = new THREE.PlaneGeometry(taille, taille, qualite > 0 ? 160 : 80, qualite > 0 ? 160 : 80);
  geo.rotateX(-Math.PI / 2);
  const mat = Phy({ color: couleur, roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15 });
  const uTemps = { value: 0 };
  mat.onBeforeCompile = sh => {
    sh.uniforms.uTemps = uTemps;
    sh.vertexShader = 'uniform float uTemps;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `
        vec3 pw = position;
        float dx = 0., dz = 0.;
        dx += cos(pw.x*0.18 + uTemps*1.1)*0.18*0.4; dz += cos(pw.z*0.23 + uTemps*0.9)*0.23*0.35;
        dx += cos((pw.x+pw.z)*0.45 + uTemps*1.7)*0.45*0.12; dz += cos((pw.x+pw.z)*0.45 + uTemps*1.7)*0.45*0.12;
        vec3 objectNormal = normalize(vec3(-dx, 1.0, -dz));`)
      .replace('#include <begin_vertex>', `
        vec3 transformed = position;
        transformed.y += sin(pw.x*0.18 + uTemps*1.1)*0.4 + sin(pw.z*0.23 + uTemps*0.9)*0.35 + sin((pw.x+pw.z)*0.45 + uTemps*1.7)*0.12;`);
  };
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true;
  m.maj = t => { uTemps.value = t; };
  return m;
}

// =====================================================================
// Animaux
// =====================================================================
/** Paille-en-queue (Phaethon lepturus, « payanké ») : oiseau blanc à deux longs brins de queue */
export function payanke() {
  const g = new THREE.Group();
  const blanc = Std({ color: 0xffffff, roughness: 0.6 });
  const corps = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), blanc);
  corps.scale.set(1, 0.8, 1.7); g.add(corps);
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), blanc);
  tete.position.set(0, 0.08, 0.5); g.add(tete);
  const bec = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.24, 8), Std({ color: 0xffa21f, roughness: 0.4 }));
  bec.rotation.x = Math.PI / 2; bec.position.set(0, 0.05, 0.74); g.add(bec);
  const masque = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.045, 0.12), Std({ color: 0x111111 }));
  masque.position.set(0, 0.12, 0.55); g.add(masque);
  const texAile = toile(256, 64, (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#151515'; c.fillRect(w * 0.35, 4, w * 0.3, h * 0.45);
    c.fillRect(w * 0.82, 0, w * 0.18, h * 0.6);
  });
  const matAile = Std({ map: texAile, side: THREE.DoubleSide, roughness: 0.6 });
  const ailes = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(s * 0.15, 0.05, 0.05);
    const a = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.38), matAile);
    a.rotation.x = -Math.PI / 2; a.position.x = s * 0.65; if (s < 0) a.rotation.z = Math.PI;
    pivot.add(a); g.add(pivot); ailes.push({ pivot, s });
  }
  for (const s of [-1, 1]) {
    const brin = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 1.6), blanc);
    brin.material.side = THREE.DoubleSide;
    brin.rotation.x = -Math.PI / 2 + 0.06; brin.position.set(s * 0.02, 0, -1.25); g.add(brin);
  }
  g.maj = t => { for (const { pivot, s } of ailes) pivot.rotation.z = s * Math.sin(t * 6) * 0.5; };
  return ombrer(g, true, false);
}

/** Tangue (Tenrec ecaudatus) : petit mammifère au museau pointu et au dos piquant */
export function tangue() {
  const g = new THREE.Group();
  const tex = toile(256, 128, (c, w, h) => {
    c.fillStyle = '#5b4a3a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { c.strokeStyle = `rgba(${200 + Math.random() * 40},${170 + Math.random() * 40},120,${0.15 + Math.random() * .2})`; c.beginPath(); const x = Math.random() * w, y = Math.random() * h; c.moveTo(x, y); c.lineTo(x + 6, y + (Math.random() - .5) * 3); c.stroke(); }
  });
  const corps = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), Std({ map: tex, roughness: 0.95 }));
  corps.scale.set(0.85, 0.72, 1.25); corps.position.y = 0.42; g.add(corps);
  const nb = 70;
  const piquants = new THREE.InstancedMesh(new THREE.ConeGeometry(0.025, 0.2, 4), Std({ color: 0xe8d9b8, roughness: 0.8 }), nb);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < nb; i++) {
    const u = Math.random() * Math.PI * 0.5, v = Math.random() * Math.PI * 2;
    const n = new THREE.Vector3(Math.sin(u) * Math.cos(v) * 0.85, Math.cos(u) * 0.72, Math.sin(u) * Math.sin(v) * 1.25 - 0.1).normalize();
    const p = new THREE.Vector3(n.x * 0.42, n.y * 0.36 + 0.42, n.z * 0.62);
    q.setFromUnitVectors(up, n.clone().add(new THREE.Vector3(0, 0, -0.6)).normalize());
    m.compose(p, q, new THREE.Vector3(1, 1, 1)); piquants.setMatrixAt(i, m);
  }
  g.add(piquants);
  const museau = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 12), Std({ color: 0x6e5644, roughness: 0.8 }));
  museau.rotation.x = Math.PI / 2; museau.position.set(0, 0.38, 0.78); g.add(museau);
  const nez = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), Std({ color: 0x2a1a14 }));
  nez.position.set(0, 0.38, 1.03); g.add(nez);
  for (const s of [-1, 1]) {
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), Phy({ color: 0x050505, clearcoat: 1, roughness: 0.1 }));
    oeil.position.set(s * 0.13, 0.5, 0.6); g.add(oeil);
  }
  const pattes = [];
  const matPatte = Std({ color: 0x4a3a2e });
  for (const [x, z] of [[-0.22, 0.3], [0.22, 0.3], [-0.22, -0.3], [0.22, -0.3]]) {
    const pivot = new THREE.Group(); pivot.position.set(x, 0.22, z);
    const pa = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.24, 6), matPatte);
    pa.position.y = -0.1; pivot.add(pa); g.add(pivot); pattes.push(pivot);
  }
  g.maj = (t, vitesse = 1) => {
    pattes.forEach((p, i) => { p.rotation.x = Math.sin(t * 14 * vitesse + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.7; });
    corps.position.y = 0.42 + Math.abs(Math.sin(t * 14 * vitesse)) * 0.04;
  };
  return ombrer(g, true, false);
}

/** Tec-tec (Tarier de La Réunion, Saxicola tectes) : petit oiseau rond endémique */
export function tecTec() {
  const g = new THREE.Group();
  const corps = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 14), Std({ color: 0x5a4636, roughness: 0.8 }));
  corps.scale.set(0.9, 0.9, 1.1); g.add(corps);
  const ventre = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), Std({ color: 0xd9894a, roughness: 0.8 }));
  ventre.position.set(0, -0.05, 0.1); g.add(ventre);
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), Std({ color: 0x1a1612, roughness: 0.7 }));
  tete.position.set(0, 0.28, 0.25); g.add(tete);
  const sourcil = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 20, Math.PI), Std({ color: 0xffffff }));
  sourcil.position.set(0, 0.32, 0.3); sourcil.rotation.y = Math.PI / 2; g.add(sourcil);
  const bec = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 6), Std({ color: 0x111111 }));
  bec.rotation.x = Math.PI / 2; bec.position.set(0, 0.26, 0.5); g.add(bec);
  const queue = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.35), Std({ color: 0x2e2620 }));
  queue.position.set(0, 0.05, -0.45); queue.rotation.x = -0.4; g.add(queue);
  return ombrer(g, true, false);
}

// =====================================================================
// Véhicules et personnages
// =====================================================================
function profilArrondi(longueur, hauteur, rayon) {
  const s = new THREE.Shape(), l = longueur / 2;
  s.moveTo(-l + rayon, 0); s.lineTo(l - rayon, 0); s.quadraticCurveTo(l, 0, l, rayon);
  s.lineTo(l, hauteur - rayon); s.quadraticCurveTo(l, hauteur, l - rayon, hauteur);
  s.lineTo(-l + rayon, hauteur); s.quadraticCurveTo(-l, hauteur, -l, hauteur - rayon);
  s.lineTo(-l, rayon); s.quadraticCurveTo(-l, 0, -l + rayon, 0);
  return s;
}
function roues(g, positions, rayon = 0.22, largeur = 0.18) {
  const geo = new THREE.CylinderGeometry(rayon, rayon, largeur, 16); geo.rotateX(Math.PI / 2);
  const pneu = Std({ color: 0x151515, roughness: 0.9 });
  const jante = Std({ color: 0xbfc5cc, metalness: 0.8, roughness: 0.3 });
  const geoJ = new THREE.CylinderGeometry(rayon * 0.55, rayon * 0.55, largeur + 0.02, 12); geoJ.rotateX(Math.PI / 2);
  for (const [x, z] of positions) {
    const r = new THREE.Mesh(geo, pneu); r.position.set(x, rayon, z); g.add(r);
    const j = new THREE.Mesh(geoJ, jante); j.position.set(x, rayon, z); g.add(j);
  }
}
/** Voiture citadine, avant vers +x */
export function voiture(couleur = 0xd32f2f) {
  const g = new THREE.Group();
  const s = new THREE.Shape();
  s.moveTo(-1, 0.18); s.lineTo(1, 0.18); s.quadraticCurveTo(1.08, 0.2, 1.06, 0.45);
  s.lineTo(0.98, 0.58); s.lineTo(0.5, 0.62); s.quadraticCurveTo(0.3, 0.98, 0.05, 1.0);
  s.lineTo(-0.55, 1.0); s.quadraticCurveTo(-0.85, 0.98, -0.95, 0.66); s.lineTo(-1.04, 0.6);
  s.quadraticCurveTo(-1.08, 0.3, -1, 0.18);
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.84, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -0.42);
  const peinture = Phy({ color: couleur, roughness: 0.35, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.08 });
  g.add(new THREE.Mesh(geo, peinture));
  const verre = Phy({ color: 0x0d1820, roughness: 0.04, metalness: 0.4, clearcoat: 1 });
  const vitreS = new THREE.Shape();
  vitreS.moveTo(0.42, 0.66); vitreS.quadraticCurveTo(0.26, 0.93, 0.05, 0.94); vitreS.lineTo(-0.52, 0.94);
  vitreS.quadraticCurveTo(-0.78, 0.92, -0.86, 0.68); vitreS.closePath();
  for (const z of [0.475, -0.475]) {
    const v = new THREE.Mesh(new THREE.ShapeGeometry(vitreS), verre); v.position.z = z; if (z < 0) v.rotation.y = Math.PI, v.scale.x = -1; g.add(v);
  }
  const pare = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.86), verre);
  pare.position.set(0.47, 0.8, 0); pare.rotation.set(0, Math.PI / 2, 0); pare.rotateX(-0.75); g.add(pare);
  for (const z of [0.3, -0.3]) {
    const phare = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.2), Std({ color: 0xffffff, emissive: 0xfff2c0, emissiveIntensity: 0.7 }));
    phare.position.set(1.08, 0.42, z); g.add(phare);
    const feu = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.2), Std({ color: 0x550000, emissive: 0xff1a1a, emissiveIntensity: 0.8 }));
    feu.position.set(-1.07, 0.48, z); g.add(feu);
  }
  roues(g, [[0.62, 0.43], [0.62, -0.43], [-0.62, 0.43], [-0.62, -0.43]], 0.2, 0.16);
  g.userData.peinture = peinture;
  return ombrer(g);
}

/** Car interurbain jaune, avant vers +x, avec girouette de destination */
export function kar(destination = 'Saint-Denis', couleurLigne = '#1f6fd1') {
  const g = new THREE.Group();
  const L = 4.6, H = 1.45, W = 1.15;
  const geo = new THREE.ExtrudeGeometry(profilArrondi(L, H, 0.22), { depth: W, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
  geo.translate(0, 0.2, -W / 2);
  const jaune = Phy({ color: 0xffc400, roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
  g.add(new THREE.Mesh(geo, jaune));
  const verre = Phy({ color: 0x0b1620, roughness: 0.05, metalness: 0.4, clearcoat: 1 });
  for (const s of [-1, 1]) {
    const bande = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.9, 0.55), verre);
    bande.position.set(-0.15, 1.15, s * (W / 2 + 0.056)); if (s < 0) bande.rotation.y = Math.PI; g.add(bande);
    const ligne = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.3, 0.14), Std({ color: couleurLigne, roughness: 0.5 }));
    ligne.position.set(0, 0.62, s * (W / 2 + 0.057)); if (s < 0) ligne.rotation.y = Math.PI; g.add(ligne);
  }
  const pare = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.1, 0.7), verre);
  pare.position.set(L / 2 + 0.056, 1.05, 0); pare.rotation.y = Math.PI / 2; g.add(pare);
  const texDest = toile(512, 96, (c, w, h) => {
    c.fillStyle = '#120b00'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffb000'; c.font = 'bold 58px Nunito, Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(destination, w / 2, h / 2 + 3);
  });
  const dest = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.15, 0.2), Std({ map: texDest, emissive: 0xffffff, emissiveMap: texDest, emissiveIntensity: 1.3 }));
  dest.position.set(L / 2 + 0.06, 1.5, 0); dest.rotation.y = Math.PI / 2; g.add(dest);
  const pastille = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), Std({ color: couleurLigne, roughness: 0.4 }));
  pastille.position.set(1.3, 1.9, 0); pastille.rotation.x = -Math.PI / 2; g.add(pastille);
  roues(g, [[1.45, W / 2 - 0.05], [1.45, -W / 2 + 0.05], [-1.35, W / 2 - 0.05], [-1.35, -W / 2 + 0.05]], 0.3, 0.2);
  return ombrer(g);
}

const PEAUX = [0x5a3a24, 0x8a5a3c, 0xb07850, 0xd9a77c, 0x6e4630, 0xc49068];
/** Petit personnage (voyageur), corps de la couleur donnée */
export function personnage(couleur = 0x1f6fd1, chapeau = Math.random() < 0.4) {
  const g = new THREE.Group();
  const corps = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 6, 12), Std({ color: couleur, roughness: 0.6 }));
  corps.position.y = 0.42; g.add(corps);
  const tete = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), Std({ color: PEAUX[Math.floor(Math.random() * PEAUX.length)], roughness: 0.6 }));
  tete.position.y = 0.88; g.add(tete);
  if (chapeau) {
    const paille = Std({ color: 0xe0c27a, roughness: 0.9 });
    const bord = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 18), paille); bord.position.y = 0.98; g.add(bord);
    const calotte = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.14, 14), paille); calotte.position.y = 1.05; g.add(calotte);
  } else {
    const cheveux = new THREE.Mesh(new THREE.SphereGeometry(0.165, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), Std({ color: 0x1a120c, roughness: 0.8 }));
    cheveux.position.y = 0.9; g.add(cheveux);
  }
  return ombrer(g, true, false);
}

// =====================================================================
// Fruits, légumes et plantes péi
// =====================================================================
/** Letchi : coque rouge rugueuse couverte de petites protubérances */
export function letchi(rayon = 0.5) {
  const geo = new THREE.IcosahedronGeometry(rayon, qualite > 0 ? 4 : 3);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const bosse = Math.pow(Math.abs(Math.sin(v.x * 13) * Math.sin(v.y * 13) * Math.sin(v.z * 13)), 0.5);
    v.multiplyScalar(rayon * (1 + bosse * 0.06) * (v.y > 0 ? 1.04 : 1));
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, Phy({ color: 0xb3172e, roughness: 0.6, clearcoat: 0.15, sheen: 0.3, sheenColor: 0xff6a6a }));
  const g = new THREE.Group(); g.add(m);
  const queue = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, rayon * 0.5, 6), Std({ color: 0x6b5a2a }));
  queue.position.y = rayon * 1.15; g.add(queue);
  return ombrer(g);
}
export function grappeLetchis(n = 7) {
  const g = new THREE.Group();
  const bois = Std({ color: 0x6b5a2a, roughness: 0.8 });
  const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.2, 6), bois);
  tige.position.y = 1.0; g.add(tige);
  for (let i = 0; i < n; i++) {
    const l = letchi(0.22 + Math.random() * 0.04);
    const a = i * 2.4, r = 0.18 + (i % 3) * 0.1;
    l.position.set(Math.cos(a) * r, 0.25 + (i % 4) * 0.12, Math.sin(a) * r);
    g.add(l);
  }
  const feuille = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.8), Std({ map: texFeuille(115, 0.5), alphaTest: 0.4, side: THREE.DoubleSide }));
  feuille.position.set(0.2, 1.4, 0); feuille.rotation.z = -0.8; g.add(feuille);
  return ombrer(g);
}
/** Galet de basalte (bord de mer, rivière) */
export function galet(taille = 0.5) {
  const geo = new THREE.IcosahedronGeometry(taille, 2);
  const p = geo.attributes.position, v = new THREE.Vector3();
  const graine = Math.random() * 10;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 0.8 + fbm(v.x * 2 + graine, v.z * 2 + v.y) * 0.4; p.setXYZ(i, v.x * k, v.y * k * 0.65, v.z * k); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, Std({ map: texBasalte([1, 1]), roughness: 0.85 }));
  return ombrer(m);
}
/** Ananas Victoria : petit fruit doré à couronne serrée */
export function ananas() {
  const g = new THREE.Group();
  const tex = toile(256, 256, (c, w, h) => {
    c.fillStyle = '#c98a1c'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 26) for (let x = (y / 26) % 2 ? 13 : 0; x < w; x += 26) {
      const grd = c.createRadialGradient(x, y, 2, x, y, 14); grd.addColorStop(0, '#f2c14e'); grd.addColorStop(.7, '#c27a12'); grd.addColorStop(1, '#5e6b1e');
      c.fillStyle = grd; c.beginPath(); c.moveTo(x, y - 13); c.lineTo(x + 13, y); c.lineTo(x, y + 13); c.lineTo(x - 13, y); c.fill();
    }
  });
  const corps = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 18), Phy({ map: tex, roughness: 0.65, clearcoat: 0.2 }));
  corps.scale.set(1, 1.45, 1); corps.position.y = 0.6; g.add(corps);
  const vert = Std({ color: 0x4d7a3a, roughness: 0.6 });
  for (let i = 0; i < 16; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.75, 4), vert);
    f.scale.z = 0.3; const a = i * 2.4;
    f.position.set(Math.cos(a) * 0.06, 1.42, Math.sin(a) * 0.06);
    f.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(f);
  }
  return ombrer(g);
}
/** Piment rouge brillant (peau cireuse) */
export function piment() {
  const pts = [];
  for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(Math.sin(Math.pow(t, 0.7) * Math.PI) * 0.12 * (1 - t * 0.4) + 0.001, t * 1.1)); }
  const geo = new THREE.LatheGeometry(pts, 16);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + Math.pow(y, 2) * 0.25); }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, Phy({ color: 0xd4140c, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.1 }));
  m.rotation.z = Math.PI; m.position.y = 1.15; g.add(m);
  const queue = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.22, 6), Std({ color: 0x3f7a2a }));
  queue.position.y = 1.22; g.add(queue);
  return ombrer(g);
}
/** Chouchou (christophine) : vert pâle, plissé, peau mate */
export function chouchou() {
  const geo = new THREE.SphereGeometry(0.45, 32, 24);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const pli = 1 + Math.cos(a * 5) * 0.06 * (1 - Math.abs(v.y) / 0.45);
    const poire = 1 - (v.y / 0.45) * 0.22;
    p.setXYZ(i, v.x * pli * poire, v.y * 1.2, v.z * pli * poire);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, Phy({ color: 0xb9d982, roughness: 0.7, sheen: 0.6, sheenColor: 0xeaffc4 }));
  m.position.y = 0.55;
  const g = new THREE.Group(); g.add(m);
  return ombrer(g);
}
/** Gousses de vanille (Bourbon) */
export function vanille() {
  const g = new THREE.Group();
  const mat = Phy({ color: 0x2b170c, roughness: 0.45, sheen: 0.4, sheenColor: 0x8a5a30 });
  for (let i = 0; i < 4; i++) {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, 0.5, 0), new THREE.Vector3(0.02, 1, 0.02), new THREE.Vector3(-0.1, 1.5, 0)]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.045, 8), mat);
    m.position.set((i - 1.5) * 0.12, 0.1, (i % 2) * 0.05); m.rotation.z = (i - 1.5) * 0.12; g.add(m);
  }
  const lien = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 20), Std({ color: 0xd8c08a }));
  lien.rotation.x = Math.PI / 2; lien.position.y = 0.7; g.add(lien);
  return ombrer(g);
}
/** Morceau de canne à sucre avec nœuds et feuilles */
export function canne() {
  const g = new THREE.Group();
  const mat = Std({ color: 0xa88a3a, roughness: 0.5 });
  const noeud = Std({ color: 0x6e5a24, roughness: 0.6 });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.42, 12), mat); s.position.y = 0.21 + i * 0.44; g.add(s);
    const n = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 6, 16), noeud); n.rotation.x = Math.PI / 2; n.position.y = 0.43 + i * 0.44; g.add(n);
  }
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1.4), Std({ color: 0x5f9a35, side: THREE.DoubleSide }));
  f.position.set(0.3, 2.3, 0); f.rotation.z = -0.7; g.add(f);
  const f2 = f.clone(); f2.position.x = -0.3; f2.rotation.z = 0.7; g.add(f2);
  return ombrer(g);
}

// =====================================================================
// Divers
// =====================================================================
/** Étiquette 3D (texte sur plan) */
export function etiquette(texte, o = {}) {
  const largeur = o.largeur ?? 2, police = o.police ?? 64;
  const tex = toile(512, 128, (c, w, h) => {
    if (o.fond) { c.fillStyle = o.fond; c.beginPath(); c.roundRect(4, 4, w - 8, h - 8, 40); c.fill(); }
    c.fillStyle = o.couleur ?? '#ffffff'; c.font = `800 ${police}px 'Baloo 2', Nunito, Arial, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(texte, w / 2, h / 2 + 4);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(largeur, largeur / 4), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  return m;
}
/** Sol herbeux */
export function solHerbe(taille = 200) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(taille, taille), Std({ map: texHerbe([taille / 6, taille / 6]), roughness: 1 }));
  m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  return m;
}
