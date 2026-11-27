/* Effets 3D de Cascade Péi v2 (Three.js, MIT). Couche transparente au-dessus de PixiJS.
   Tout est géométrie 3D éclairée ou shader procédural : gouttes en larme qui s'étirent, éclaboussures qui se divisent, gelées de jus
   élastiques, ondelettes, bulles d'onde de choc, faisceaux, étoiles dorées, confettis, pétales, lucioles, braises, brume, pluie. Aucune image.
   Le mouvement est piloté par le chef d'orchestre commun FXIA (../commun/fx-ia.js) : vent en champ de flux, attraction vers le score.
   Coordonnées d'entrée en pixels, y vers le bas. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;
const D = 1000;

let R, scene, cam, W = 360, H = 640, ready = false, idle = true, T = 0;
const col = new THREE.Color(), tmpC = new THREE.Color(), dummy = new THREE.Object3D(), vA = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
const wx = (x) => x - W / 2, wy = (y) => H / 2 - y;
const ia = () => window.FXIA;

/* ---------- réserves de particules instanciées ---------- */
function etoileGeo() {
  const s = new THREE.Shape(), n = 5;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * TAU + Math.PI / 2, r = i % 2 ? 0.46 : 1;
    i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.34, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.1, bevelSegments: 2 });
  g.center();
  return g;
}

function larmeGeo() { // larme : ronde en bas, pointe en haut (+Y)
  const pts = [];
  for (let i = 0; i <= 22; i++) {
    const a = (i / 22) * Math.PI, y = -Math.cos(a);
    pts.push(new THREE.Vector2(Math.max(0.0001, Math.sin(a) * (1 - 0.62 * Math.pow((y + 1) / 2, 1.4))), y * 1.15));
  }
  return new THREE.LatheGeometry(pts, 18);
}
function brumeMat() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec2 vUv;varying vec3 vC;void main(){vUv=uv;vC=vec3(1.);\n#ifdef USE_INSTANCING_COLOR\nvC=instanceColor;\n#endif\ngl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 vUv;varying vec3 vC;void main(){vec2 p=vUv-.5;float d=length(p)*2.;float a=smoothstep(1.,0.,d);a=a*a*(.78+.22*sin(p.x*11.+p.y*8.));gl_FragColor=vec4(vC*a,1.);}"
  });
}

const kinds = {};
function reserve(nom, geo, mat, max, add) {
  const m = new THREE.InstancedMesh(geo, mat, max);
  m.count = 0; m.frustumCulled = false;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.setColorAt(0, col.set(0xffffff));
  m.instanceColor.setUsage(THREE.DynamicDrawUsage);
  kinds[nom] = { m, max, p: [], add: !!add };
  return m;
}
function ajoute(nom, o) {
  const k = kinds[nom];
  if (!k || !ready || k.p.length >= k.max) return;
  o.t = o.t ?? 0; o.rx = o.rx ?? rnd(0, TAU); o.ry = o.ry ?? rnd(0, TAU); o.rz = o.rz ?? rnd(0, TAU);
  o.vrx = o.vrx ?? 0; o.vry = o.vry ?? 0; o.vrz = o.vrz ?? 0; o.g = o.g ?? 0; o.drag = o.drag ?? 0; o.z = o.z ?? 0; o.vz = o.vz ?? 0;
  o.c = new THREE.Color(o.c ?? 0xffffff); o.sx = o.sx ?? 1; o.sy = o.sy ?? 1; o.sz = o.sz ?? 1; o.pop = o.pop ?? 0.1;
  o.vent = o.vent ?? 0; o.ph = rnd(0, TAU);
  k.p.push(o); idle = false;
}
function majReserve(k, dt) {
  const P = k.p, nouvelles = [], brain = ia();
  let n = 0;
  for (let i = 0; i < P.length; i++) {
    const q = P[i];
    q.t += dt;
    if (q.t < 0) continue;
    if (q.t >= q.life) { if (q.split) nouvelles.push(q); continue; }
    // vent en champ de flux et attraction vers la cible, décidés par le chef d'orchestre
    if (q.vent && brain && brain.vent) { const w = brain.vent(q.x, q.y, q.z, T); q.vx += w[0] * q.vent * dt; q.vy += w[1] * q.vent * dt; q.vz += w[2] * q.vent * dt; }
    if (q.seek && q.t > q.seek.delai) {
      const dx = q.seek.x - q.x, dy = q.seek.y - q.y, d = Math.hypot(dx, dy) + 0.001;
      q.vx += (dx / d) * q.seek.f * dt; q.vy += (dy / d) * q.seek.f * dt;
      const sp = Math.hypot(q.vx, q.vy), mx = q.seek.f * 0.5 + 200; if (sp > mx) { q.vx *= mx / sp; q.vy *= mx / sp; }
      if (d < q.seek.r) { if (brain && brain.arrive) brain.arrive(q.c); q.t = q.life; continue; }
    }
    const dr = Math.max(0, 1 - q.drag * dt);
    q.vx *= dr; q.vy *= dr; q.vz *= dr;
    q.vy -= q.g * dt; // y monde vers le haut
    q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt;
    q.rx += q.vrx * dt; q.ry += q.vry * dt; q.rz += q.vrz * dt;
    const u = q.t / q.life;
    const ap = Math.min(1, q.t / q.pop), fin = u > 0.72 ? 1 - (u - 0.72) / 0.28 : 1;
    let s = q.s * ap * Math.max(0.001, fin);
    if (q.wob) s *= 1 + q.wob * Math.sin(q.t * 24) * Math.exp(-q.t * 6);
    if (q.puls) s *= 0.55 + 0.45 * Math.sin(q.t * q.puls + q.ph);
    dummy.position.set(q.x, q.y, q.z);
    if (q.orient) { // la larme s'étire dans le sens du mouvement, pointe en arrière
      vA.set(-q.vx, -q.vy, -q.vz); const sp = vA.length();
      let sy = q.sy;
      if (sp > 1) { vA.multiplyScalar(1 / sp); dummy.quaternion.setFromUnitVectors(Y, vA); sy = q.sy * (1 + Math.min(q.etire ?? 1.1, sp / (q.ref ?? 500))); }
      dummy.scale.set(s * q.sx * (1 - Math.min(0.28, (sy - q.sy) * 0.2)), s * sy, s * q.sz);
    } else {
      dummy.rotation.set(q.rx, q.ry, q.rz);
      dummy.scale.set(s * q.sx, s * q.sy, s * q.sz);
    }
    dummy.updateMatrix();
    k.m.setMatrixAt(n, dummy.matrix);
    if (k.add) { const a = Math.pow(Math.max(0, 1 - u), q.fade ?? 1.1) * (q.al ?? 1) * ap; tmpC.copy(q.c).multiplyScalar(a); k.m.setColorAt(n, tmpC); }
    else k.m.setColorAt(n, q.c);
    n++;
  }
  let j = 0;
  for (let i = 0; i < P.length; i++) if (P[i].t < P[i].life) P[j++] = P[i];
  P.length = j;
  k.m.count = n;
  k.m.instanceMatrix.needsUpdate = true;
  if (k.m.instanceColor) k.m.instanceColor.needsUpdate = true;
  // les gouttes éclatent en micro-gouttes en retombant
  for (const q of nouvelles) {
    for (let i = 0; i < q.split; i++) {
      const a = rnd(0, TAU), v = rnd(0.3, 1) * (q.s * 14 + 50);
      ajoute("gouttes", { x: q.x, y: q.y, z: q.z, vx: Math.cos(a) * v + q.vx * 0.2, vy: Math.abs(Math.sin(a)) * v * 0.9 + 30, vz: rnd(-30, 30), g: q.g, s: q.s * rnd(0.22, 0.38), c: q.c, life: rnd(0.3, 0.55), orient: 1, ref: 320, drag: 0.6 });
    }
  }
}

/* ---------- anneaux, bulles, faisceaux (objets individuels) ---------- */
const anneaux = [], bulles = [], faisceaux = [];
function mkAnneau() {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5, metalness: 0.6, roughness: 0.28, transparent: true });
  const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.055, 14, 72), mat);
  m.visible = false; m.frustumCulled = false; scene.add(m);
  return { m, mat, on: false };
}
function mkBulle() {
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { c: { value: new THREE.Color(1, 1, 1) }, a: { value: 1 } },
    vertexShader: "varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader: "uniform vec3 c;uniform float a;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2);gl_FragColor=vec4(c*(.25+1.6*f),a*(.15+.85*f));}"
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), mat);
  m.visible = false; m.frustumCulled = false; scene.add(m);
  return { m, mat, on: false };
}
function mkFaisceau() {
  const g = new THREE.Group(); g.visible = false;
  const cm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const hm = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const geo = new THREE.CylinderGeometry(1, 1, 1, 28, 1, true);
  const core = new THREE.Mesh(geo, cm), halo = new THREE.Mesh(geo, hm);
  const em = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2, metalness: 0.5, roughness: 0.25, transparent: true });
  const spine = new THREE.Mesh(new THREE.CapsuleGeometry(1, 1, 6, 18), em);
  g.add(halo, core, spine); g.frustumCulled = false; scene.add(g);
  return { g, core, halo, spine, cm, hm, em, on: false };
}
const prend = (arr, mk) => { for (const o of arr) if (!o.on) return o; if (arr.length < 20) { const o = mk(); arr.push(o); return o; } return null; };
const actifs = { anneaux: [], bulles: [], faisceaux: [] };

/* ---------- API ---------- */
const FX3D = {
  ready: false,
  init(canvas) {
    try {
      R = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      R.setClearColor(0x000000, 0);
      R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
      scene = new THREE.Scene();
      const pm = new THREE.PMREMGenerator(R);
      scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 1;
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const k1 = new THREE.DirectionalLight(0xfff2dd, 2.6); k1.position.set(-400, 700, 900); scene.add(k1);
      const k2 = new THREE.DirectionalLight(0x9fd8ff, 1.1); k2.position.set(500, -300, 600); scene.add(k2);
      cam = new THREE.PerspectiveCamera(50, 1, 10, 4000);
      scene.add(reserve("gouttes", larmeGeo(),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.9, emissive: 0x3a1a0c, emissiveIntensity: 0.9 }), 640));
      scene.add(reserve("gelees", new THREE.SphereGeometry(1, 28, 20),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, emissive: 0x1a0c06, emissiveIntensity: 0.5, transparent: true, opacity: 0.93 }), 48));
      scene.add(reserve("etincelles", new THREE.IcosahedronGeometry(1, 1),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 900, true));
      scene.add(reserve("brume", new THREE.PlaneGeometry(2, 2), brumeMat(), 160, true));
      scene.add(reserve("etoiles", etoileGeo(),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.2, emissive: 0xffa800, emissiveIntensity: 0.55, envMapIntensity: 1.8 }), 160));
      scene.add(reserve("confettis", new THREE.BoxGeometry(1, 0.62, 0.07),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.35, roughness: 0.38, side: THREE.DoubleSide, emissive: 0x111111 }), 260));
      scene.add(reserve("petales", new THREE.SphereGeometry(1, 14, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x180810 }), 140));
      ready = true; FX3D.ready = true;
      this.resize(W, H, Math.min(2, devicePixelRatio || 1));
    } catch (e) { ready = false; FX3D.ready = false; console.warn("Effets 3D indisponibles", e); }
    return ready;
  },
  resize(w, h, dpr) {
    W = w; H = h;
    if (!ready) return;
    R.setPixelRatio(Math.min(dpr || 1, 1.75)); R.setSize(w, h, false);
    cam.aspect = w / h; cam.fov = 2 * Math.atan(h / 2 / D) * 180 / Math.PI;
    cam.position.set(0, 0, D); cam.updateProjectionMatrix();
  },
  /* éclaboussure satisfaisante : gelée élastique, couronne de larmes en cône, éclats, brume fine, ondelette */
  jus(x, y, couleur, u, n = 8, seek) {
    if (!ready) return;
    const c = new THREE.Color(couleur);
    ajoute("gelees", { x: wx(x), y: wy(y), z: 6, s: u * 0.5, c: c.clone().lerp(new THREE.Color(0xffffff), 0.12), life: 0.6, wob: 0.38, pop: 0.05, sx: 1.1, sy: 0.9 });
    // chaque goutte est unique : taille en loi log-normale, forme, teinte, vitesse, pesanteur, départ décalé
    const ln = () => Math.exp(rnd(-0.55, 0.65) + (Math.random() < 0.12 ? 0.5 : 0)); // surtout petites, parfois très grosses
    const teinte = () => { const k = c.clone(); k.offsetHSL(rnd(-0.03, 0.03), rnd(-0.08, 0.1), rnd(-0.07, 0.1)); return k; };
    const total = Math.round(n * rnd(1.2, 1.8)), dispersion = rnd(0.7, 1.35), lourde = rnd(0.8, 1.25);
    for (let i = 0; i < total; i++) {
      const crown = Math.random() < 0.6, sz = ln();
      const a = crown ? (i / total) * TAU * 1.6 + rnd(-0.5, 0.5) : rnd(0, TAU);
      const v = rnd(1.2, 4.4) * u * 1.5 * dispersion / Math.sqrt(sz);   // les petites volent plus loin
      ajoute("gouttes", { x: wx(x) + rnd(-u * 0.12, u * 0.12), y: wy(y) + rnd(-u * 0.12, u * 0.12), z: rnd(-5, 16),
        vx: Math.cos(a) * v * rnd(0.7, 1.1), vy: (crown ? v * rnd(0.4, 1.1) : -Math.sin(a) * v * rnd(0.3, 1) + u * rnd(0.8, 2.2)), vz: Math.sin(a) * v * rnd(0.1, 0.55),
        g: u * rnd(8, 15) * lourde, s: Math.max(0.05, 0.19 * sz * rnd(0.7, 1.25)) * u, c: teinte(),
        sx: rnd(0.8, 1.25), sy: rnd(0.85, 1.2), life: rnd(0.45, 1.25) * (0.8 + 0.35 * sz) - rnd(0, 0.0) , t: -rnd(0, 0.16),
        orient: 1, ref: u * rnd(5, 9), etire: rnd(0.8, 1.9), split: Math.random() < 0.3 * sz ? (sz > 1.2 ? 3 : 2) : 0, drag: rnd(0.1, 0.8), vent: rnd(0.15, 0.7), wob: rnd(0, 0.25),
        seek: crown && seek ? { x: wx(seek.x), y: wy(seek.y), f: u * rnd(20, 34), delai: rnd(0.22, 0.5), r: u * 0.45 } : null });
    }
    for (let i = 0; i < Math.ceil(n / 2); i++) {
      const a = rnd(0, TAU), v = rnd(1, 4) * u * 1.4;
      ajoute("etincelles", { x: wx(x), y: wy(y), z: 10, vx: Math.cos(a) * v, vy: -Math.sin(a) * v + u, g: u * 6, s: rnd(0.025, 0.06) * u, c: 0xffffff, life: rnd(0.3, 0.6), drag: 1.5 });
    }
    ajoute("brume", { x: wx(x), y: wy(y), z: -6, s: u * 0.75, c: c.clone().lerp(new THREE.Color(0xffffff), 0.35).multiplyScalar(0.55), life: 0.55, vy: u * 0.4, vent: 0.5, al: 0.9, pop: 0.06, vrz: rnd(-1, 1) });
    this.anneau(x, y, couleur, u * 1.05, 0, 0.42, 0.45, 1.25);
  },
  etincelles(x, y, n, vit, u, c, life = 1) {
    if (!ready) return;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), b = rnd(-1, 1), v = rnd(0.3, 1) * vit;
      const cc = c ?? new THREE.Color().setHSL(rnd(0, 1), 1, 0.62);
      ajoute("etincelles", { x: wx(x), y: wy(y), z: 0, vx: Math.cos(a) * v * Math.sqrt(1 - b * b), vy: -Math.sin(a) * v * Math.sqrt(1 - b * b),
        vz: b * v, g: u * 6, s: rnd(0.03, 0.085) * u, c: cc, life: rnd(0.5, 1.1) * life, drag: 1.1, vent: 0.3 });
    }
  },
  etoiles(x, y, n, vit, u, seek) {
    if (!ready) return;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = rnd(0.35, 1) * vit;
      ajoute("etoiles", { x: wx(x), y: wy(y), z: rnd(0, 30), vx: Math.cos(a) * v, vy: -Math.sin(a) * v + vit * 0.25, vz: rnd(0, 1.4) * u * 2,
        g: u * 4.5, s: rnd(0.12, 0.3) * u, c: new THREE.Color().setHSL(rnd(0.08, 0.14), 1, 0.62), life: rnd(0.9, 1.5),
        vrx: rnd(-6, 6), vry: rnd(-6, 6), vrz: rnd(-6, 6), drag: 0.6, vent: 0.15,
        seek: seek && i % 2 === 0 ? { x: wx(seek.x), y: wy(seek.y), f: u * 34, delai: 0.55, r: u * 0.5 } : null });
    }
  },
  confettis(x, y, n, vit, u) {
    if (!ready) return;
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU), v = rnd(0.3, 1) * vit;
      ajoute("confettis", { x: wx(x), y: wy(y), z: rnd(-10, 30), vx: Math.cos(a) * v, vy: -Math.sin(a) * v + vit * 0.4, vz: rnd(-1, 2) * u,
        g: u * 3.2, s: rnd(0.1, 0.19) * u, sy: rnd(0.5, 0.9), c: new THREE.Color().setHSL(rnd(0, 1), 0.9, 0.58), life: rnd(1.1, 1.9),
        vrx: rnd(-9, 9), vry: rnd(-9, 9), vrz: rnd(-7, 7), drag: 1.6, vent: 0.7 });
    }
  },
  /* pétales et feuilles portés par le vent */
  petales(x0, x1, y, n, u) {
    if (!ready) return;
    for (let i = 0; i < n; i++) {
      const feuille = i % 2 === 0;
      ajoute("petales", { x: wx(rnd(x0, x1)), y: wy(y), z: rnd(-20, 60), vx: rnd(-30, 30), vy: -rnd(50, 110), vz: 0, g: 18,
        s: rnd(0.2, 0.34) * u, sy: feuille ? 0.42 : 0.62, sz: 0.08, c: feuille ? new THREE.Color().setHSL(rnd(0.27, 0.36), 0.6, 0.38) : new THREE.Color().setHSL(rnd(0.93, 0.99), 0.75, 0.68),
        life: rnd(2.4, 3.8), vrx: rnd(-3, 3), vry: rnd(-3, 3), vrz: rnd(-2, 2), drag: 0.9, pop: 0.3, vent: 1.6 });
    }
  },
  /* effets naturels */
  lucioles(x0, x1, y0, y1, n, u) {
    if (!ready) return;
    for (let i = 0; i < n; i++) ajoute("etincelles", { x: wx(rnd(x0, x1)), y: wy(rnd(y0, y1)), z: rnd(-30, 60), vx: rnd(-8, 8), vy: rnd(-6, 10), s: rnd(0.05, 0.09) * u,
      c: new THREE.Color().setHSL(rnd(0.14, 0.2), 1, 0.62), life: rnd(3, 5), puls: rnd(4, 8), vent: 0.5, pop: 0.6, fade: 0.5, drag: 0.4 });
  },
  braises(x0, x1, y, n, u, c) {
    if (!ready) return;
    for (let i = 0; i < n; i++) ajoute("etincelles", { x: wx(rnd(x0, x1)), y: wy(y), z: rnd(-20, 40), vx: rnd(-14, 14), vy: rnd(40, 110), g: -u * 0.4, s: rnd(0.03, 0.07) * u,
      c: c ?? new THREE.Color().setHSL(rnd(0.02, 0.09), 1, 0.58), life: rnd(1.1, 2), puls: rnd(14, 26), vent: 1.1, fade: 0.8, drag: 0.2 });
  },
  vapeur(x, y, n, u, c) {
    if (!ready) return;
    for (let i = 0; i < n; i++) ajoute("brume", { x: wx(x) + rnd(-u, u) * 0.4, y: wy(y), z: rnd(-10, 20), vy: rnd(30, 80), vx: rnd(-10, 10), s: rnd(0.5, 1) * u, c: c ?? new THREE.Color(0.55, 0.55, 0.5),
      life: rnd(0.9, 1.5), vent: 1.4, al: 0.5, pop: 0.2, vrz: rnd(-0.6, 0.6) });
  },
  pluie(x0, x1, y, n, u) {
    if (!ready) return;
    for (let i = 0; i < n; i++) ajoute("gouttes", { x: wx(rnd(x0, x1)), y: wy(y), z: rnd(-40, 60), vx: rnd(-20, 5), vy: -rnd(520, 760), s: u * rnd(0.035, 0.06), c: new THREE.Color(0.7, 0.88, 1),
      life: rnd(0.9, 1.3), orient: 1, ref: 240, etire: 5, vent: 0.9, split: 0, pop: 0.02 });
  },
  /* anneau 3D incliné qui s'agrandit */
  anneau(x, y, couleur, R0, delai = 0, vie = 0.6, epais = 1, tilt) {
    if (!ready) return;
    const o = prend(anneaux, mkAnneau);
    if (!o) return;
    o.on = true; o.t = -delai; o.life = vie; o.R = R0; o.x = wx(x); o.y = wy(y);
    o.mat.color.set(couleur); o.mat.emissive.set(couleur); o.m.rotation.set(tilt ?? rnd(0.6, 1.2), tilt ? 0 : rnd(-0.5, 0.5), rnd(0, TAU)); o.vz = rnd(-1.6, 1.6);
    o.m.scale.setScalar(0.001); o.ep = epais; o.m.visible = false; idle = false;
    if (!actifs.anneaux.includes(o)) actifs.anneaux.push(o);
  },
  /* bulle d'énergie translucide (onde de choc) */
  bulle(x, y, couleur, R0, vie = 0.8) {
    if (!ready) return;
    const o = prend(bulles, mkBulle);
    if (!o) return;
    o.on = true; o.t = 0; o.life = vie; o.R = R0; o.m.position.set(wx(x), wy(y), 0); o.mat.uniforms.c.value.set(couleur); o.m.visible = true; idle = false;
    if (!actifs.bulles.includes(o)) actifs.bulles.push(o);
  },
  /* faisceau lumineux en volume (rayure / colonne) */
  faisceau(horiz, x, y, longueur, couleur, u) {
    if (!ready) return;
    const o = prend(faisceaux, mkFaisceau);
    if (!o) return;
    o.on = true; o.t = 0; o.life = 0.5; o.len = longueur; o.u = u; o.horiz = horiz;
    o.g.position.set(wx(x), wy(y), 0); o.g.rotation.set(0, 0, horiz ? Math.PI / 2 : 0); o.g.visible = true;
    o.cm.color.set(couleur); o.hm.color.set(couleur); o.em.emissive.set(couleur); idle = false;
    if (!actifs.faisceaux.includes(o)) actifs.faisceaux.push(o);
  },
  clear() {
    if (!ready || idle) return;
    for (const k of Object.values(kinds)) { k.p.length = 0; k.m.count = 0; }
    for (const a of [...actifs.anneaux, ...actifs.bulles, ...actifs.faisceaux]) { a.on = false; (a.m || a.g).visible = false; }
    actifs.anneaux.length = actifs.bulles.length = actifs.faisceaux.length = 0;
    R.clear(); idle = true;
  },
  nombre() { let n = 0; for (const k of Object.values(kinds)) n += k.p.length; return n; },
  update(dt) {
    if (!ready || idle) return;
    T += dt;
    for (const k of Object.values(kinds)) majReserve(k, dt);
    let vivant = false;
    for (const k of Object.values(kinds)) if (k.p.length) vivant = true;
    for (let i = actifs.anneaux.length - 1; i >= 0; i--) {
      const o = actifs.anneaux[i]; o.t += dt;
      if (o.t < 0) continue;
      const p = o.t / o.life;
      if (p >= 1) { o.on = false; o.m.visible = false; actifs.anneaux.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - p, 2.2);
      o.m.visible = true; o.m.position.set(o.x, o.y, o.vz * e * 40);
      o.m.scale.set(o.R * e + 6, o.R * e + 6, (o.R * e + 6) * (1.1 - p * 0.6) * o.ep);
      o.m.rotation.z += dt * 2.2; o.mat.opacity = Math.min(1, (1 - p) * 1.6); o.mat.emissiveIntensity = 1.2 + 1.2 * (1 - p);
      vivant = true;
    }
    for (let i = actifs.bulles.length - 1; i >= 0; i--) {
      const o = actifs.bulles[i]; o.t += dt; const p = o.t / o.life;
      if (p >= 1) { o.on = false; o.m.visible = false; actifs.bulles.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - p, 2.6);
      o.m.scale.setScalar(o.R * e + 4); o.mat.uniforms.a.value = Math.pow(1 - p, 1.4); vivant = true;
    }
    for (let i = actifs.faisceaux.length - 1; i >= 0; i--) {
      const o = actifs.faisceaux[i]; o.t += dt; const p = o.t / o.life;
      if (p >= 1) { o.on = false; o.g.visible = false; actifs.faisceaux.splice(i, 1); continue; }
      const r = o.u * 0.3 * (1 - p) + 2, l = o.len;
      o.core.scale.set(r * 0.9, l, r * 0.9); o.halo.scale.set(r * 2.6, l, r * 2.6);
      o.spine.scale.set(r * 0.5, l * 0.5, r * 0.5);
      o.cm.opacity = (1 - p) * 0.5; o.hm.opacity = (1 - p) * 0.2; o.em.opacity = Math.min(1, (1 - p) * 2);
      vivant = true;
    }
    if (!vivant) { idle = true; R.clear(); }
  },
  render() { if (!ready || idle) return; R.render(scene, cam); }
};
window.FX3D = FX3D;
window.dispatchEvent(new Event("fx3d-pret"));
