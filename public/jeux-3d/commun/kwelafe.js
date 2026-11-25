// =====================================================================
// Kwélafé Production - socle commun des jeux web 3D
// Rendu PBR, ciel tropical, ombres douces, bloom, vignette, qualité auto,
// particules, petites animations, sons de synthèse (aucune voix),
// interface (écrans, scores, lien enflammé) et sauvegarde locale.
// =====================================================================
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Sky } from 'three/addons/objects/Sky.js';

export { THREE };

// ---------------------------------------------------------------------
// 1. Détection de la puissance de l'appareil : 0 = bas, 1 = moyen, 2 = haut
// ---------------------------------------------------------------------
function detecterQualite() {
  try {
    const forcee = new URLSearchParams(location.search).get('qualite');
    if (forcee !== null) return Math.max(0, Math.min(2, +forcee));
  } catch (e) { /* rien */ }
  let note = 1;
  const coeurs = navigator.hardwareConcurrency || 4;
  const memoire = navigator.deviceMemory || 4;
  if (coeurs >= 8 && memoire >= 4) note = 2;
  if (coeurs <= 2 || memoire <= 2) note = 0;
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (/Apple GPU|Apple M|RTX|Radeon RX|Arc/i.test(gpu)) note = Math.max(note, 2);
    if (/Mali-4|Adreno \(TM\) [3-5]|PowerVR SGX|SwiftShader|llvmpipe/i.test(gpu)) note = 0;
  } catch (e) { /* rien */ }
  return note;
}
export const qualite = detecterQualite();

// ---------------------------------------------------------------------
// 2. Petites animations (tweens) et minuteries synchronisées sur le rendu
// ---------------------------------------------------------------------
const animations = new Set();
export const ease = {
  lin: k => k,
  sortie: k => 1 - Math.pow(1 - k, 3),
  entree: k => k * k * k,
  douce: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  rebond: k => { const c = 1.70158 + 1; return 1 + c * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2); },
  elastique: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI) / 3) + 1,
};
/** anime(durée en secondes, fonction(k de 0 à 1), courbe) -> promesse */
export function anime(duree, maj, courbe = ease.sortie) {
  return new Promise(ok => {
    animations.add({ t: 0, duree: Math.max(duree, 0.0001), maj, courbe, ok });
  });
}
export function attendre(secondes) { return anime(secondes, () => {}); }
function majAnimations(dt) {
  for (const a of animations) {
    a.t += dt;
    const k = Math.min(1, a.t / a.duree);
    a.maj(a.courbe(k), k);
    if (k >= 1) { animations.delete(a); a.ok(); }
  }
}

// ---------------------------------------------------------------------
// 3. Création du monde 3D
// ---------------------------------------------------------------------
/**
 * creerMonde({
 *   soleil: { elevation, azimut, intensite },   // position du soleil en degrés
 *   ciel: true | false, fond: 0x...,            // ciel physique ou couleur unie
 *   brouillard: { couleur, pres, loin },
 *   ombre: { taille, centre }, exposition, bloom: { force, seuil },
 *   cadrer(camera, ratio)                        // adapte la caméra au portrait / paysage
 * })
 */
export function creerMonde(opts = {}) {
  const conteneur = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ antialias: qualite > 0, powerPreference: 'high-performance' });
  const ratioMax = [1.25, 1.75, 2][qualite];
  let ratioPixels = Math.min(window.devicePixelRatio || 1, ratioMax);
  renderer.setPixelRatio(ratioPixels);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposition ?? 0.95;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  conteneur.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov ?? 45, 1, 0.1, 6000);

  // Ciel tropical physique + éclairage d'environnement (remplace un fichier HDRI)
  const s = opts.soleil || {};
  const elevation = s.elevation ?? 32, azimut = s.azimut ?? 200;
  const dirSoleil = new THREE.Vector3().setFromSphericalCoords(1,
    THREE.MathUtils.degToRad(90 - elevation), THREE.MathUtils.degToRad(azimut));
  const ciel = new Sky();
  ciel.scale.setScalar(4500);
  const u = ciel.material.uniforms;
  u.turbidity.value = opts.turbidite ?? 3.2;
  u.rayleigh.value = opts.rayleigh ?? 1.4;
  u.mieCoefficient.value = 0.004;
  u.mieDirectionalG.value = 0.82;
  u.sunPosition.value.copy(dirSoleil);
  // Environnement d'éclairage maîtrisé : dôme dégradé (zénith bleu, horizon clair,
  // sol chaud) + tache douce de soleil, puis PMREM (évite la surexposition du disque solaire)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const sceneCiel = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { soleil: { value: dirSoleil.clone() } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 soleil; varying vec3 vDir;
      void main(){
        float h = vDir.y;
        vec3 zenith = vec3(0.18, 0.42, 0.85), horizon = vec3(0.78, 0.88, 0.95), sol = vec3(0.32, 0.28, 0.2);
        vec3 c = h > 0. ? mix(horizon, zenith, pow(h, 0.6)) : mix(horizon * 0.8, sol, pow(-h, 0.5));
        float s = max(dot(normalize(vDir), normalize(soleil)), 0.);
        c += vec3(1.0, 0.85, 0.6) * (pow(s, 64.) * 6. + pow(s, 6.) * 0.35);
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sceneCiel.add(dome);
  scene.environment = pmrem.fromScene(sceneCiel, 0.03).texture;
  scene.environmentIntensity = opts.intensiteEnv ?? 0.6;
  if (opts.ciel === false) scene.background = new THREE.Color(opts.fond ?? 0x87c6ec);
  else scene.add(ciel);
  if (opts.brouillard) {
    const b = opts.brouillard;
    scene.fog = new THREE.Fog(b.couleur ?? 0xbfe3f5, b.pres ?? 60, b.loin ?? 400);
  }

  // Soleil chaud de fin d'après-midi + lumière de contour + ciel
  const soleil = new THREE.DirectionalLight(0xffe0b0, s.intensite ?? 2.4);
  soleil.position.copy(dirSoleil).multiplyScalar(60);
  soleil.castShadow = true;
  const tailleOmbre = [1024, 2048, 2048][qualite];
  soleil.shadow.mapSize.set(tailleOmbre, tailleOmbre);
  const o = opts.ombre || {};
  const t = o.taille ?? 14;
  Object.assign(soleil.shadow.camera, { left: -t, right: t, top: t, bottom: -t, near: 1, far: 200 });
  soleil.shadow.bias = -0.0004;
  soleil.shadow.normalBias = 0.02;
  soleil.shadow.radius = 4;
  const cibleSoleil = new THREE.Object3D();
  if (o.centre) cibleSoleil.position.copy(o.centre);
  soleil.target = cibleSoleil;
  soleil.position.add(cibleSoleil.position);
  scene.add(soleil, cibleSoleil);
  const contour = new THREE.DirectionalLight(0xa8dcff, 0.9);
  contour.position.set(-dirSoleil.x * 40, 25, -dirSoleil.z * 40);
  scene.add(contour);
  scene.add(new THREE.HemisphereLight(0xcfeaff, 0x5a4a30, 0.35));

  // Post-traitement : bloom léger, vignette douce, sortie ACES + sRGB
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bl = opts.bloom || {};
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), bl.force ?? 0.22, 0.5, bl.seuil ?? 0.96);
  bloom.enabled = qualite > 0;
  composer.addPass(bloom);
  const vignette = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, force: { value: 0.32 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float force; varying vec2 vUv;
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 d = vUv - .5;
      float v = smoothstep(.85, .25, length(d) * 1.15);
      gl_FragColor = vec4(c.rgb * mix(1. - force, 1., v), c.a); }`,
  });
  composer.addPass(vignette);
  composer.addPass(new OutputPass());

  // Redimensionnement
  function redimensionner() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    composer.setPixelRatio(ratioPixels);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    if (opts.cadrer) opts.cadrer(camera, w / h);
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', redimensionner);
  window.addEventListener('orientationchange', () => setTimeout(redimensionner, 250));
  redimensionner();

  // Boucle de rendu + surveillance des images par seconde (qualité qui s'ajuste seule)
  const fonctions = new Set();
  const horloge = new THREE.Timer();
  let tempsTotal = 0, cumul = 0, images = 0, niveauAuto = 0;
  renderer.setAnimationLoop(() => {
    horloge.update(); const dt = Math.min(horloge.getDelta(), 1 / 20);
    tempsTotal += dt;
    for (const f of fonctions) f(dt, tempsTotal);
    majAnimations(dt);
    composer.render(dt);
    cumul += dt; images++;
    if (cumul > 2.5) {
      const ips = images / cumul;
      if (ips < 38 && niveauAuto < 3) {
        niveauAuto++;
        if (niveauAuto === 1) ratioPixels = Math.max(1, ratioPixels * 0.8);
        if (niveauAuto === 2) { bloom.enabled = false; ratioPixels = 1; }
        if (niveauAuto === 3) { renderer.shadowMap.enabled = false; scene.traverse(m => { if (m.material) m.material.needsUpdate = true; }); }
        renderer.setPixelRatio(ratioPixels);
        redimensionner();
      }
      cumul = 0; images = 0;
    }
  });

  // Outils de pointage : rayon depuis le doigt ou la souris
  const rayon = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function versNdc(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayon.setFromCamera(ndc, camera);
    return rayon;
  }
  const plan = new THREE.Plane();
  const monde = {
    THREE, scene, camera, renderer, composer, soleil, contour, bloom, ciel,
    temps: () => tempsTotal,
    chaque(f) { fonctions.add(f); return () => fonctions.delete(f); },
    redimensionner,
    /** premier objet touché parmi la liste (récursif) */
    toucher(e, objets) { const i = versNdc(e).intersectObjects(objets, true); return i[0] || null; },
    /** point du plan horizontal y = hauteur sous le doigt */
    versPlan(e, hauteur = 0) {
      plan.set(new THREE.Vector3(0, 1, 0), -hauteur);
      const p = new THREE.Vector3();
      return versNdc(e).ray.intersectPlane(plan, p) ? p : null;
    },
    versEcran(v) {
      const p = v.clone().project(camera);
      return { x: (p.x + 1) / 2 * window.innerWidth, y: (1 - p.y) / 2 * window.innerHeight };
    },
  };
  monde.particules = creerParticules(monde);
  return monde;
}

// ---------------------------------------------------------------------
// 4. Particules instanciées (jus, étincelles, poussière, confettis)
// ---------------------------------------------------------------------
function creerParticules(monde) {
  const max = [260, 600, 1100][qualite];
  const geo = new THREE.IcosahedronGeometry(1, 0);
  const mat = new THREE.MeshBasicMaterial({ toneMapped: true });
  const maillage = new THREE.InstancedMesh(geo, mat, max);
  maillage.frustumCulled = false;
  maillage.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const zero = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < max; i++) { maillage.setMatrixAt(i, zero); maillage.setColorAt(i, new THREE.Color(1, 1, 1)); }
  monde.scene.add(maillage);
  const parts = [];
  let curseur = 0;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3();
  const c = new THREE.Color();
  monde.chaque(dt => {
    for (const p of parts) {
      if (p.vie <= 0) continue;
      p.vie -= dt;
      p.v.y -= p.g * dt;
      p.v.multiplyScalar(1 - p.frein * dt);
      p.pos.addScaledVector(p.v, dt);
      if (p.sol !== null && p.pos.y < p.sol) { p.pos.y = p.sol; p.v.y *= -0.3; p.v.x *= 0.6; p.v.z *= 0.6; }
      p.rot += p.vr * dt;
      const k = Math.max(0, p.vie / p.vieMax);
      const t = p.taille * (p.retrecit ? Math.sqrt(k) : 1);
      e.set(p.rot, p.rot * 0.7, 0); q.setFromEuler(e); sc.set(t, t, t * p.plat);
      m4.compose(p.pos, q, p.vie > 0 ? sc : sc.set(0, 0, 0));
      maillage.setMatrixAt(p.i, m4);
    }
    maillage.instanceMatrix.needsUpdate = true;
  });
  return {
    /** jet(position, couleur, options) */
    jet(pos, couleur, o = {}) {
      const n = Math.round((o.n ?? 20) * [0.5, 0.8, 1][qualite]);
      c.set(couleur);
      if (o.eclat) c.multiplyScalar(o.eclat); // > 1 : la particule brille avec le bloom
      for (let k = 0; k < n; k++) {
        const i = curseur; curseur = (curseur + 1) % max;
        const dir = new THREE.Vector3(Math.random() - .5, Math.random() * (o.haut ?? 0.8) + (o.haut ? 0 : 0.1), Math.random() - .5).normalize();
        if (o.direction) dir.add(o.direction).normalize();
        const vit = (o.vitesse ?? 4) * (0.4 + Math.random() * 0.8);
        const p = parts[i] || (parts[i] = { i, pos: new THREE.Vector3(), v: new THREE.Vector3() });
        p.pos.copy(pos).add(new THREE.Vector3((Math.random() - .5) * (o.dispersion ?? 0.2), (Math.random() - .5) * (o.dispersion ?? 0.2), (Math.random() - .5) * (o.dispersion ?? 0.2)));
        p.v.copy(dir).multiplyScalar(vit);
        p.g = o.gravite ?? 9; p.frein = o.frein ?? 0.6;
        p.vie = p.vieMax = (o.vie ?? 0.9) * (0.6 + Math.random() * 0.6);
        p.taille = (o.taille ?? 0.08) * (0.5 + Math.random());
        p.plat = o.plat ?? 1; p.rot = Math.random() * 6; p.vr = (Math.random() - .5) * 10;
        p.retrecit = o.retrecit ?? true; p.sol = o.sol ?? null;
        const variation = o.variation ?? 0.12;
        maillage.setColorAt(i, new THREE.Color(c.r * (1 - variation / 2 + Math.random() * variation), c.g * (1 - variation / 2 + Math.random() * variation), c.b * (1 - variation / 2 + Math.random() * variation)));
      }
      maillage.instanceColor.needsUpdate = true;
    },
    confettis(pos, n = 60) {
      for (const col of [0x1f6fd1, 0xffc928, 0xe8402a, 0x2fa84f, 0xffffff])
        this.jet(pos, col, { n: n / 5, vitesse: 7, haut: 1, gravite: 5, vie: 1.8, taille: 0.09, plat: 0.15, frein: 1.2, eclat: 1.3 });
    },
  };
}

// ---------------------------------------------------------------------
// 5. Textures dessinées en code (canvas)
// ---------------------------------------------------------------------
export function toile(largeur, hauteur, dessin, opts = {}) {
  const c = document.createElement('canvas');
  c.width = largeur; c.height = hauteur;
  const ctx = c.getContext('2d');
  dessin(ctx, largeur, hauteur);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = opts.donnees ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (opts.repeter) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(...opts.repeter); }
  tex.userData.canvas = c;
  return tex;
}
/** bruit aléatoire léger sur une texture (grain naturel) */
export function grain(ctx, w, h, force = 18, taille = 2) {
  for (let i = 0; i < (w * h) / (taille * taille * 3); i++) {
    const v = (Math.random() - .5) * force;
    ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v / 255})` : `rgba(0,0,0,${-v / 255})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, taille, taille);
  }
}
/** Charge une image fournie (dossier /images/) ; sinon garde le visuel de repli */
export function textureOuRepli(url, repli) {
  const loader = new THREE.TextureLoader();
  loader.load(url, tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    repli.image = tex.image; repli.needsUpdate = true;
  }, undefined, () => { /* pas d'image fournie : le repli dessiné reste affiché */ });
  return repli;
}

// ---------------------------------------------------------------------
// 6. Sons de synthèse : bruitages et ambiances (aucune voix)
// ---------------------------------------------------------------------
let actx = null, maitre = null, sonActif = true;
try { sonActif = localStorage.getItem('kwelafe-son') !== 'non'; } catch (e) { /* rien */ }
function audio() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    actx = new AC();
    maitre = actx.createGain();
    maitre.gain.value = sonActif ? 0.8 : 0;
    maitre.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
window.addEventListener('pointerdown', () => audio(), { capture: true });
function bip(freq, duree = 0.12, type = 'sine', vol = 0.25, vers = null, retard = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + retard;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (vers) o.frequency.exponentialRampToValueAtTime(vers, t + duree);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g).connect(maitre); o.start(t); o.stop(t + duree + 0.05);
}
let tamponBruit = null;
function bruit(duree = 0.2, filtre = 1200, vol = 0.3, type = 'lowpass', retard = 0) {
  const a = audio(); if (!a) return;
  if (!tamponBruit) {
    tamponBruit = a.createBuffer(1, a.sampleRate * 2, a.sampleRate);
    const d = tamponBruit.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = a.currentTime + retard;
  const s = a.createBufferSource(); s.buffer = tamponBruit;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = filtre;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  s.connect(f).connect(g).connect(maitre);
  s.start(t, Math.random()); s.stop(t + duree + 0.05);
}
export const son = {
  clic: () => bip(880, 0.06, 'triangle', 0.18, 660),
  pop: () => { bip(520, 0.09, 'sine', 0.3, 980); },
  pose: () => { bip(220, 0.08, 'triangle', 0.25, 160); bruit(0.05, 2400, 0.12); },
  succes: () => [523, 659, 784, 1046].forEach((f, i) => bip(f, 0.22, 'triangle', 0.2, null, i * 0.08)),
  victoire: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => bip(f, 0.3, 'triangle', 0.22, null, i * 0.11)),
  erreur: () => { bip(200, 0.22, 'sawtooth', 0.12, 120); },
  combo: n => [0, 1, 2].forEach(i => bip(660 * Math.pow(1.26, i + Math.min(n, 6) * 0.5), 0.15, 'square', 0.08, null, i * 0.05)),
  klaxon: () => { bip(415, 0.25, 'square', 0.1); bip(523, 0.25, 'square', 0.08); },
  moteur: () => { bip(70, 0.5, 'sawtooth', 0.12, 140); bruit(0.4, 500, 0.1); },
  marteau: () => { bruit(0.07, 3000, 0.4, 'bandpass'); bip(160, 0.08, 'square', 0.15, 90); },
  frotte: () => bruit(0.09, 1800 + Math.random() * 1200, 0.07, 'bandpass'),
  saut: () => bip(300, 0.18, 'sine', 0.22, 700),
  piece: () => { bip(988, 0.07, 'square', 0.1); bip(1318, 0.16, 'square', 0.1, null, 0.06); },
  tir: () => bip(1200, 0.06, 'triangle', 0.08, 500),
  zoizo() { const f = 2200 + Math.random() * 1500; bip(f, 0.07, 'sine', 0.06, f * 1.4); bip(f * 1.1, 0.06, 'sine', 0.05, f * 0.8, 0.09); },
  actif: () => sonActif,
  basculer() {
    sonActif = !sonActif;
    try { localStorage.setItem('kwelafe-son', sonActif ? 'oui' : 'non'); } catch (e) { /* rien */ }
    if (maitre) maitre.gain.value = sonActif ? 0.8 : 0;
    return sonActif;
  },
  /** ambiance de fond : 'mer', 'foret', 'pluie', 'ville' */
  ambiance(type) {
    const demarrer = () => {
      const a = audio(); if (!a || son._amb) return;
      son._amb = true;
      if (!tamponBruit) bruit(0.01, 100, 0.0001);
      const s = a.createBufferSource(); s.buffer = tamponBruit; s.loop = true;
      const f = a.createBiquadFilter();
      const g = a.createGain(); g.gain.value = 0;
      s.connect(f).connect(g).connect(maitre); s.start();
      if (type === 'pluie') { f.type = 'highpass'; f.frequency.value = 1400; g.gain.value = 0.05; }
      else if (type === 'ville') { f.type = 'lowpass'; f.frequency.value = 300; g.gain.value = 0.05; }
      else {
        // vagues : un souffle qui monte et descend lentement
        f.type = 'lowpass'; f.frequency.value = type === 'foret' ? 900 : 520;
        const lfo = a.createOscillator(), lg = a.createGain();
        lfo.frequency.value = type === 'foret' ? 0.05 : 0.11; lg.gain.value = type === 'foret' ? 0.012 : 0.045;
        g.gain.value = type === 'foret' ? 0.02 : 0.05;
        lfo.connect(lg).connect(g.gain); lfo.start();
      }
      if (type === 'foret' || type === 'mer') {
        const chants = () => { if (Math.random() < (type === 'foret' ? 0.7 : 0.25)) { son.zoizo(); if (Math.random() < .5) setTimeout(son.zoizo, 180); } setTimeout(chants, 1500 + Math.random() * 3500); };
        setTimeout(chants, 1200);
      }
    };
    window.addEventListener('pointerdown', demarrer, { once: true });
  },
};

// ---------------------------------------------------------------------
// 7. Sauvegarde locale (meilleur score, niveau atteint)
// ---------------------------------------------------------------------
export const stock = {
  lire(cle, defaut) { try { const v = localStorage.getItem('kwelafe-' + cle); return v === null ? defaut : JSON.parse(v); } catch (e) { return defaut; } },
  ecrire(cle, valeur) { try { localStorage.setItem('kwelafe-' + cle, JSON.stringify(valeur)); } catch (e) { /* rien */ } },
};

// ---------------------------------------------------------------------
// 8. Interface : barre du haut, scores, écrans, bulle, lien enflammé
// ---------------------------------------------------------------------
/** Règle Kwélafé : bloque la propagation des touchers sur les zones interactives */
export function protegerZones() {
  document.querySelectorAll('.zone-interactive').forEach(element => { element.addEventListener('touchend', function(event) { event.preventDefault(); event.stopPropagation(); }, { passive: false }); });
}
/** Les boutons réagissent au relâchement du doigt (le « click » est bloqué par la règle ci-dessus) */
export function surAppui(el, f) {
  let dedans = false;
  el.addEventListener('pointerdown', e => { dedans = true; e.stopPropagation(); });
  el.addEventListener('pointerleave', () => { dedans = false; });
  el.addEventListener('pointerup', e => { if (dedans) { dedans = false; e.stopPropagation(); f(e); } });
}
function el(tag, classe, html) { const e = document.createElement(tag); if (classe) e.className = classe; if (html !== undefined) e.innerHTML = html; return e; }

export const ui = {
  init({ titre }) {
    const haut = el('div', 'k-haut');
    const retour = el('button', 'k-retour zone-interactive', '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 2 4 8l6 6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Jeux');
    surAppui(retour, () => {
      // Dans Kwélafé Lecture (cadre du même site) : retour à la page Jeux du site ; sinon : page des jeux 3D
      try { if (window.top !== window && window.top.location.origin === location.origin) { window.top.location.href = '/jeux'; return; } } catch (e) { /* cadre d'un autre site */ }
      location.href = '../index.html';
    });
    const t = el('div', 'k-titre', titre);
    const bSon = el('button', 'k-btn-rond zone-interactive');
    const dessinSon = () => { bSon.innerHTML = son.actif()
      ? '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="m16 9 6 6m0-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'; };
    dessinSon();
    surAppui(bSon, () => { son.basculer(); dessinSon(); });
    haut.append(retour, t, bSon);
    this.stats = el('div', 'k-stats');
    this.voile = el('div', 'k-voile');
    // Lien simple (pas de blocage du toucher, pour qu'il s'ouvre partout)
    const lien = el('a', 'k-lien', 'kwelafeproduction.com');
    lien.href = 'https://kwelafeproduction.com'; lien.target = '_blank'; lien.rel = 'noopener';
    document.body.append(haut, this.stats, this.voile, lien);
    this.valeurs = {};
    protegerZones();
  },
  stat(cle, nom, valeur) {
    const b = el('div', 'k-stat', `<small>${nom}</small><b>${valeur}</b>`);
    this.stats.appendChild(b); this.valeurs[cle] = b.querySelector('b');
  },
  maj(cle, valeur) { if (this.valeurs[cle]) this.valeurs[cle].textContent = valeur; },
  /** Écran modal ; renvoie une promesse avec l'identifiant du bouton choisi */
  ecran({ titre, sousTitre = '', texte = '', info = '', etoiles = null, boutons = [{ id: 'ok', texte: 'Jouer' }] }) {
    return new Promise(ok => {
      const c = el('div', 'k-carte');
      c.innerHTML = `<h1>${titre}</h1>${sousTitre ? `<h2>${sousTitre}</h2>` : ''}`
        + (etoiles !== null ? `<div class="k-etoiles">${[0, 1, 2].map(() => '<span>★</span>').join('')}</div>` : '')
        + (texte ? `<p>${texte}</p>` : '') + (info ? `<div class="k-info">${info}</div>` : '');
      const zone = el('div', 'k-boutons');
      boutons.forEach((b, i) => {
        const btn = el('button', 'k-bouton zone-interactive' + (i > 0 ? ' second' : ''), b.texte);
        surAppui(btn, () => { son.clic(); this.voile.classList.remove('ouvert'); ok(b.id); });
        zone.appendChild(btn);
      });
      c.appendChild(zone);
      this.voile.innerHTML = ''; this.voile.appendChild(c);
      this.voile.classList.add('ouvert');
      protegerZones();
      if (etoiles !== null) c.querySelectorAll('.k-etoiles span').forEach((s, i) => setTimeout(() => { if (i < etoiles) { s.classList.add('on'); son.pop(); } }, 300 + i * 300));
    });
  },
  bulle(texte, couleur) {
    const b = el('div', 'k-bulle', texte);
    if (couleur) b.style.color = couleur;
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 1150);
  },
  chargementFini() {
    const c = document.querySelector('.k-chargement');
    if (c) { c.style.opacity = 0; setTimeout(() => c.remove(), 520); }
  },
  el,
};

/** Calcule 0 à 3 étoiles selon un score et deux seuils */
export function etoilesPour(valeur, seuil2, seuil3, inverse = false) {
  if (inverse) return valeur <= seuil3 ? 3 : valeur <= seuil2 ? 2 : 1;
  return valeur >= seuil3 ? 3 : valeur >= seuil2 ? 2 : 1;
}
export const hasard = (a, b) => a + Math.random() * (b - a);
export const choisir = t => t[Math.floor(Math.random() * t.length)];
export function melanger(t) { for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; }
