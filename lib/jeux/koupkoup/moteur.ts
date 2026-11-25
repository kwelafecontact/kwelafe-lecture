// Koup Koup : moteur 3D (Three.js / WebGL) du jeu de découpe de fruits péi.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FRUITS, type DefFruit, modele, textureChair, fruitParId } from "./fruits";
import { Sons } from "./sons";
import { fbm, graine } from "./bruit";
import { GestionnairePerf, dprCible, libererCanvas } from "@/public/jeux-3d/commun/performances";

export type Mode = "classique" | "zen";
export type Resultat = { mode: Mode; score: number; coupes: Record<string, number>; meilleurCombo: number; duree: number };
export type Rappels = {
  etat: (e: { score: number; vies: number; temps: number | null; combo: number }) => void;
  fin: (r: Resultat) => void;
  decouverte?: (id: string) => void;
  /** L'application est passée en arrière-plan pendant la partie : l'interface affiche la pause. */
  interruption?: (raison: string) => void;
  /** Le contexte graphique n'est pas revenu : l'interface propose de relancer l'affichage. */
  secours?: () => void;
  /** Photo de la partie en cours, à enregistrer (arrière-plan, minuterie, fermeture). */
  sauvegarde?: (p: InstantaneKK | null) => void;
};
export type InstantaneKK = { mode: Mode; score: number; vies: number; tempsJeu: number; coupes: Record<string, number>; meilleurCombo: number };

const GRAVITE = 17;
const CAM_Z = 16;
const PLANCHE_Z = -5;
const TRAINEE_Z = 2;
const VIES = 3;
const DUREE_ZEN = 90;
const MAX_GOUTTES = 1400;
const MAX_BRAISES = 700;
const MAX_BRUME = 400;

type Fruit = {
  def: DefFruit;
  groupe: THREE.Group;
  corps: THREE.Mesh;
  vel: THREE.Vector3;
  rot: THREE.Vector3;
  monte: boolean;
  lumiere?: THREE.PointLight;
};
type Moitie = { groupe: THREE.Group; vel: THREE.Vector3; rot: THREE.Vector3; planLocal: THREE.Plane; plan: THREE.Plane; liberer: () => void };
type Goutte = { pos: THREE.Vector3; vel: THREE.Vector3; vie: number; taille: number; couleur: THREE.Color; versPlanche: boolean; graine: boolean; allonge: number };
type Particule = { pos: THREE.Vector3; vel: THREE.Vector3; vie: number; vieMax: number; couleur: THREE.Color; trainee?: number };
type Coulure = { x: number; y: number; v: number; l: number; w: number; couleur: string };
type GoutteEcran = { x: number; y: number; r: number; vy: number; vie: number; vieMax: number; couleur: string };
type Bulle = { texte: string; sous?: string; x: number; y: number; vie: number; couleur: string; taille: number };

const HAUT = new THREE.Vector3(0, 1, 0);
const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpM = new THREE.Matrix4();
const tmpS = new THREE.Vector3();

export class MoteurKoupKoup {
  private conteneur: HTMLElement;
  private rappels: Rappels;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private overlay: HTMLCanvasElement;
  private o2d: CanvasRenderingContext2D;
  private sons = new Sons();
  private dernierT = 0;
  private enPause = false;
  private perf!: GestionnairePerf;
  private ombresCoupees = false;
  private obs: ResizeObserver;
  private dpr = 1;
  private largeur = 1;
  private hauteur = 1;
  private demiH = 1;
  private demiL = 1;

  // Planche et taches
  private planche!: THREE.Mesh;
  private calqueTaches!: THREE.Mesh;
  private taches!: HTMLCanvasElement;
  private t2d!: CanvasRenderingContext2D;
  private texTaches!: THREE.CanvasTexture;
  private tailleP = 30;
  private tachesModifiees = false;
  private minuterieFondu = 0;
  private coulures: Coulure[] = [];

  // Objets
  private fruits: Fruit[] = [];
  private moities: Moitie[] = [];
  private gouttes: Goutte[] = [];
  private braises: Particule[] = [];
  private brume: Particule[] = [];
  private gouttesEcran: GoutteEcran[] = [];
  private bulles: Bulle[] = [];
  private mGouttes!: THREE.InstancedMesh;
  private pBraises!: THREE.Points;
  private pBrume!: THREE.Points;

  // Lame
  private trainee: { p: THREE.Vector3; t: number }[] = [];
  private mTrainee!: THREE.Mesh;
  private pointeurActif = false;
  private dernierPointeur: { x: number; y: number; t: number } | null = null;
  private derniereCoupe = 0;
  private comboEnCours = 0;
  private comboPos = new THREE.Vector3();

  // Partie
  private etat: "menu" | "jeu" | "fin" = "menu";
  private mode: Mode = "classique";
  private score = 0;
  private vies = VIES;
  private tempsJeu = 0;
  private prochaineVague = 0.8;
  private fileLancers: { def: DefFruit; dans: number }[] = [];
  private coupes: Record<string, number> = {};
  private meilleurCombo = 0;
  private ralenti = 0;
  private secousse = 0;
  private flash = 0;
  private qualiteBaissee = false;
  private mesuresFrames: number[] = [];
  private dejaVus = new Set<string>();
  private rnd = graine(Date.now() & 0xffff);
  private lumieres: { l: THREE.PointLight; fruit: Fruit | null }[] = [];

  constructor(conteneur: HTMLElement, rappels: Rappels) {
    this.conteneur = conteneur;
    this.rappels = rappels;
    // Résolution : 1,5 au plus sur iPhone (gestionnaire commun), 1,75 sur tablette, 2 sur ordinateur
    this.dpr = dprCible(2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const cv = this.renderer.domElement;
    cv.className = "kk-webgl";
    cv.style.touchAction = "none";
    conteneur.appendChild(cv);

    this.overlay = document.createElement("canvas");
    this.overlay.className = "kk-overlay";
    conteneur.appendChild(this.overlay);
    this.o2d = this.overlay.getContext("2d")!;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, CAM_Z);

    this.construireScene();
    this.construireEffets();

    this.obs = new ResizeObserver(() => this.redimensionner());
    this.obs.observe(conteneur);
    this.redimensionner();

    this.perf = new GestionnairePerf({
      nom: "koup-koup",
      niveauInitial: 2,
      surPause: (raison) => {
        // Arrière-plan / verrouillage : pause, et l'interface affiche l'écran de pause
        // (avant, le jeu repartait tout seul au retour et faisait perdre des vies).
        if (this.etat === "jeu" && !this.enPause) { this.pause(); this.rappels.interruption?.(raison); }
        this.sons.endormir();
      },
      surReprise: () => { this.dernierT = performance.now(); this.redimensionner(); },
      surSauvegarde: () => this.rappels.sauvegarde?.(this.instantane()),
      surQualite: (niveau) => this.appliquerQualite(niveau),
    });
    this.perf.ecouter(cv, "pointerdown", this.surDown);
    this.perf.ecouter(window, "pointermove", this.surMove, { passive: true });
    this.perf.ecouter(window, "pointerup", this.surUp);
    this.perf.ecouter(window, "pointercancel", this.surUp);
    // Perte du contexte WebGL (fréquente sur iOS après un passage en arrière-plan)
    this.perf.surveillerContexte(cv, {
      perdu: () => { if (this.etat === "jeu" && !this.enPause) { this.pause(); this.rappels.interruption?.("graphique"); } },
      restaure: () => this.apresRestauration(),
      secours: () => this.rappels.secours?.(),
    });

    this.prechauffer();

    this.dernierT = performance.now();
    this.perf.boucle(this.boucle);
  }

  /** Qualité : 2 = complète, 1 = sans halo et résolution réduite, 0 = sans ombres, résolution 1. */
  private appliquerQualite(niveau: number) {
    if (niveau <= 1) this.qualiteBaissee = true;
    if (niveau === 0 && !this.ombresCoupees) {
      this.ombresCoupees = true;
      this.renderer.shadowMap.enabled = false;
      this.scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m) m.needsUpdate = true; });
    }
    this.renderer.setPixelRatio(niveau >= 2 ? this.dpr : niveau === 1 ? Math.min(this.dpr, 1.25) : 1);
    this.redimensionner();
  }

  /** Après une restauration du contexte : ce qui vivait seulement dans la carte graphique est recréé. */
  private apresRestauration() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const ancien = this.scene.environment;
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    ancien?.dispose();
    pmrem.dispose();
    this.texTaches.needsUpdate = true;
    this.scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as (THREE.Material & { map?: THREE.Texture | null }) | undefined;
      if (m && m.map) m.map.needsUpdate = true;
    });
    this.redimensionner();
    this.dernierT = performance.now();
  }

  // -------------------------------------------------------------------------
  // Construction
  // -------------------------------------------------------------------------

  private construireScene() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.55;
    this.scene.background = new THREE.Color("#1a120c");

    this.scene.add(new THREE.HemisphereLight("#fff1dc", "#3a2616", 0.7));
    const soleil = new THREE.DirectionalLight("#ffe2b8", 2.6);
    soleil.position.set(5, 11, 14);
    soleil.target.position.set(0, 0, PLANCHE_Z);
    soleil.castShadow = true;
    soleil.shadow.mapSize.set(1024, 1024);
    soleil.shadow.camera.left = -16; soleil.shadow.camera.right = 16;
    soleil.shadow.camera.top = 16; soleil.shadow.camera.bottom = -16;
    soleil.shadow.camera.near = 1; soleil.shadow.camera.far = 50;
    soleil.shadow.bias = -0.0008;
    soleil.shadow.radius = 6;
    this.scene.add(soleil, soleil.target);
    const contre = new THREE.DirectionalLight("#9fd6ff", 1.4);
    contre.position.set(-9, 5, -3);
    this.scene.add(contre);
    // Deux lumières réservées au letchi doré et à la lave (jamais ajoutées en cours de partie,
    // pour ne pas forcer la carte graphique à tout recompiler)
    for (let i = 0; i < 2; i++) {
      const l = new THREE.PointLight("#ffffff", 0, 7, 1.6);
      l.position.set(0, -100, 0);
      this.scene.add(l);
      this.lumieres.push({ l, fruit: null });
    }

    // Planche en bois (texture dessinée par le code)
    const bois = new THREE.CanvasTexture(dessinerBois());
    bois.colorSpace = THREE.SRGBColorSpace;
    bois.anisotropy = 8;
    this.planche = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshStandardMaterial({ map: bois, color: "#9a7356", roughness: 0.8, metalness: 0 })
    );
    this.planche.position.z = PLANCHE_Z;
    this.planche.receiveShadow = true;
    this.scene.add(this.planche);

    // Calque des taches de jus, brillant comme du liquide
    this.taches = document.createElement("canvas");
    this.taches.width = this.taches.height = 1024;
    this.t2d = this.taches.getContext("2d")!;
    this.texTaches = new THREE.CanvasTexture(this.taches);
    this.texTaches.colorSpace = THREE.SRGBColorSpace;
    this.calqueTaches = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshPhysicalMaterial({ map: this.texTaches, transparent: true, roughness: 0.35, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: 0.35, depthWrite: false })
    );
    this.calqueTaches.position.z = PLANCHE_Z + 0.02;
    this.calqueTaches.receiveShadow = true;
    this.scene.add(this.calqueTaches);

    // Gouttes de jus, pépins et morceaux (une seule géométrie instanciée)
    this.mGouttes = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.MeshPhysicalMaterial({ roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0, ior: 1.33 }),
      MAX_GOUTTES
    );
    this.mGouttes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mGouttes.setColorAt(0, new THREE.Color());
    this.mGouttes.count = 0;
    this.mGouttes.frustumCulled = false;
    this.scene.add(this.mGouttes);

    const point = texturePoint();
    this.pBraises = creerPoints(MAX_BRAISES, new THREE.PointsMaterial({
      size: 0.32, map: point, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    }));
    this.pBrume = creerPoints(MAX_BRUME, new THREE.PointsMaterial({
      size: 0.9, map: point, vertexColors: true, transparent: true, opacity: 0.16, depthWrite: false,
    }));
    this.scene.add(this.pBraises, this.pBrume);

    // Traînée lumineuse de la lame
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(64 * 2 * 3), 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(64 * 2 * 4), 4).setUsage(THREE.DynamicDrawUsage));
    const index: number[] = [];
    for (let i = 0; i < 63; i++) { const a = i * 2; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    geo.setIndex(index);
    this.mTrainee = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false,
    }));
    this.mTrainee.frustumCulled = false;
    this.mTrainee.renderOrder = 10;
    this.scene.add(this.mTrainee);
  }

  private construireEffets() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.65, 0.35, 1.15);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  private redimensionner() {
    const r = this.conteneur.getBoundingClientRect();
    this.largeur = Math.max(1, r.width);
    this.hauteur = Math.max(1, r.height);
    this.renderer.setSize(this.largeur, this.hauteur, false);
    this.camera.aspect = this.largeur / this.hauteur;
    this.camera.updateProjectionMatrix();
    this.composer?.setSize(this.largeur, this.hauteur);
    this.composer?.setPixelRatio(this.renderer.getPixelRatio());
    this.bloom?.resolution.set(this.largeur / 2, this.hauteur / 2);
    this.overlay.width = Math.round(this.largeur * this.dpr);
    this.overlay.height = Math.round(this.hauteur * this.dpr);
    this.demiH = Math.tan(THREE.MathUtils.degToRad(22.5)) * CAM_Z;
    this.demiL = this.demiH * this.camera.aspect;
    const hP = 2 * Math.tan(THREE.MathUtils.degToRad(22.5)) * (CAM_Z - PLANCHE_Z);
    this.tailleP = Math.max(hP, hP * this.camera.aspect) * 1.12;
    this.planche.scale.set(this.tailleP, this.tailleP, 1);
    this.calqueTaches.scale.set(this.tailleP, this.tailleP, 1);
  }

  /** Prépare à l'avance tous les fruits, entiers et coupés, pour éviter les saccades. */
  private prechauffer() {
    const temp = new THREE.Group();
    temp.position.set(0, 0, 0);
    for (const f of FRUITS) {
      const m = modele(f.id);
      const entier = new THREE.Mesh(m.corps, m.materiau);
      entier.castShadow = true;
      temp.add(entier);
      m.accessoires().forEach((a) => temp.add(a));
      const mat = m.materiau.clone();
      mat.clippingPlanes = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)];
      mat.clipShadows = true;
      mat.side = THREE.DoubleSide;
      const moitie = new THREE.Mesh(m.corps, mat);
      moitie.castShadow = true;
      temp.add(moitie);
      const cap = sectionCoupe(m.corps, new THREE.Plane(new THREE.Vector3(1, 0, 0), 0));
      if (cap) temp.add(new THREE.Mesh(cap, this.materiauChair(f)));
    }
    this.scene.add(temp);
    this.renderer.compile(this.scene, this.camera);
    this.scene.remove(temp);
  }

  // -------------------------------------------------------------------------
  // Commandes publiques
  // -------------------------------------------------------------------------

  demarrer(mode: Mode) {
    this.sons.reveiller();
    [...this.fruits].forEach((f) => this.retirerFruit(f));
    this.moities.forEach((m) => { this.scene.remove(m.groupe); m.liberer(); });
    this.moities = [];
    this.t2d.clearRect(0, 0, 1024, 1024);
    this.coulures = [];
    this.tachesModifiees = true;
    this.mode = mode;
    this.etat = "jeu";
    this.score = 0;
    this.vies = VIES;
    this.tempsJeu = 0;
    this.prochaineVague = 1;
    this.fileLancers = [];
    this.coupes = {};
    this.meilleurCombo = 0;
    this.ralenti = 0;
    this.envoyerEtat();
  }

  /** Photo de la partie en cours (null hors partie). */
  instantane(): InstantaneKK | null {
    if (this.etat !== "jeu") return null;
    return { mode: this.mode, score: this.score, vies: this.vies, tempsJeu: this.tempsJeu, coupes: { ...this.coupes }, meilleurCombo: this.meilleurCombo };
  }

  /** Reprend une partie interrompue (rechargement, arrêt de l'onglet). */
  restaurer(p: InstantaneKK) {
    this.demarrer(p.mode);
    this.score = p.score | 0;
    this.vies = Math.max(1, Math.min(VIES, p.vies | 0));
    this.tempsJeu = Math.max(0, Math.min(p.mode === "zen" ? DUREE_ZEN - 5 : 1e6, +p.tempsJeu || 0));
    this.coupes = { ...(p.coupes || {}) };
    this.meilleurCombo = p.meilleurCombo | 0;
    this.envoyerEtat();
  }

  setSon(actif: boolean) {
    this.sons.actif = actif;
  }

  pause() {
    this.enPause = true;
  }

  reprendre() {
    if (!this.enPause) return;
    this.enPause = false;
    this.dernierT = performance.now();
  }

  detruire() {
    this.perf.detruire();      // boucle, écouteurs, minuteries
    this.obs.disconnect();
    const cv = this.renderer.domElement;
    this.moities.forEach((m) => m.liberer());
    this.moities = [];
    this.sons.detruire();
    this.composer?.dispose();
    // Toutes les géométries, matières et textures de la scène
    const textures = new Set<THREE.Texture>();
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const m of mats) {
        for (const v of Object.values(m)) if (v && (v as THREE.Texture).isTexture) textures.add(v as THREE.Texture);
        m.dispose();
      }
    });
    textures.forEach((t) => t.dispose());
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss(); // rend le contexte WebGL tout de suite (iOS en limite le nombre)
    libererCanvas(cv);
    libererCanvas(this.overlay);
    libererCanvas(this.taches);
  }

  // -------------------------------------------------------------------------
  // Pointeur et lame
  // -------------------------------------------------------------------------

  private versEcran(clientX: number, clientY: number) {
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }


  private surDown = (e: PointerEvent) => {
    this.sons.reveiller();
    this.pointeurActif = true;
    this.trainee = [];
    const p = this.versEcran(e.clientX, e.clientY);
    this.dernierPointeur = { ...p, t: performance.now() };
    this.ajouterTrainee(p.x, p.y);
  };

  private surUp = () => {
    this.pointeurActif = false;
    this.dernierPointeur = null;
    this.terminerCombo();
  };

  private surMove = (e: PointerEvent) => {
    if (!this.pointeurActif || this.enPause) return;
    const p = this.versEcran(e.clientX, e.clientY);
    const maintenant = performance.now();
    const prec = this.dernierPointeur;
    this.dernierPointeur = { ...p, t: maintenant };
    this.ajouterTrainee(p.x, p.y);
    if (!prec) return;
    const dx = p.x - prec.x, dy = p.y - prec.y;
    const dist = Math.hypot(dx, dy);
    const vitesse = dist / Math.max(1, maintenant - prec.t); // px par ms
    if (vitesse > 0.6) this.sons.souffle(vitesse / 3);
    if (vitesse < 0.25 || dist < 2) return;
    this.testerCoupes(prec, p);
  };

  private ajouterTrainee(x: number, y: number) {
    const ndc = new THREE.Vector3((x / this.largeur) * 2 - 1, -(y / this.hauteur) * 2 + 1, 0.5);
    ndc.unproject(this.camera).sub(this.camera.position).normalize();
    const t = (TRAINEE_Z - this.camera.position.z) / ndc.z;
    const p = this.camera.position.clone().addScaledVector(ndc, t);
    this.trainee.push({ p, t: performance.now() });
    if (this.trainee.length > 64) this.trainee.shift();
  }

  private ecran(v: THREE.Vector3) {
    tmpV.copy(v).project(this.camera);
    return { x: ((tmpV.x + 1) / 2) * this.largeur, y: ((1 - tmpV.y) / 2) * this.hauteur };
  }

  private testerCoupes(a: { x: number; y: number }, b: { x: number; y: number }) {
    const abx = b.x - a.x, aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;
    for (const f of [...this.fruits]) {
      const c = this.ecran(f.groupe.position);
      const bord = this.ecran(tmpV2.copy(f.groupe.position).add(new THREE.Vector3(f.def.rayon, 0, 0)));
      const rPx = Math.hypot(bord.x - c.x, bord.y - c.y);
      let t = ((c.x - a.x) * abx + (c.y - a.y) * aby) / len2;
      t = Math.max(0, Math.min(1, t));
      const px = a.x + abx * t, py = a.y + aby * t;
      if (Math.hypot(c.x - px, c.y - py) <= rPx) this.couper(f, a, b, c, rPx);
    }
  }

  // -------------------------------------------------------------------------
  // La découpe
  // -------------------------------------------------------------------------

  private couper(f: Fruit, a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, rPx: number) {
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const dx = (b.x - a.x) / len, dy = (b.y - a.y) / len;
    const dirM = new THREE.Vector3(dx, -dy, 0);           // sens du geste dans le monde
    const n = new THREE.Vector3(-dirM.y, dirM.x, 0);       // normale du plan de coupe
    const pxParUnite = rPx / f.def.rayon;
    const s = (c.x - a.x) * dy + (c.y - a.y) * -dx;         // distance signée du centre à la ligne (px)
    const decal = THREE.MathUtils.clamp(s / pxParUnite, -f.def.rayon * 0.35, f.def.rayon * 0.35);
    const pos = f.groupe.position.clone();
    const p0 = pos.clone().addScaledVector(n, -decal);

    this.retirerFruit(f);

    if (f.def.special === "lave") {
      this.exploser(pos);
      return;
    }

    // Plan de coupe en coordonnées locales du fruit
    f.groupe.updateMatrixWorld(true);
    const planMonde = new THREE.Plane().setFromNormalAndCoplanarPoint(n, p0);
    const inverse = tmpM.copy(f.corps.matrixWorld).invert();
    const planLocal = planMonde.clone().applyMatrix4(inverse);
    const geoCoupe = sectionCoupe(f.corps.geometry, planLocal);
    const matChair = this.materiauChair(f.def);
    const accessoires = f.groupe.children.filter((o) => o !== f.corps);
    // Ressources créées pour CETTE coupe : libérées quand les deux moitiés ont disparu
    let restantes = 2;

    for (const sens of [1, -1]) {
      const g = new THREE.Group();
      g.position.copy(f.groupe.position);
      g.quaternion.copy(f.groupe.quaternion);
      g.scale.copy(f.groupe.scale);
      const plan = sens === 1 ? planLocal.clone() : planLocal.clone().negate();
      const mat = (f.corps.material as THREE.MeshPhysicalMaterial).clone();
      const planClip = new THREE.Plane();
      mat.clippingPlanes = [planClip];
      mat.clipShadows = true;
      mat.side = THREE.DoubleSide;
      if (f.def.special === "or") mat.emissiveIntensity = 0.25;
      const corps = new THREE.Mesh(f.corps.geometry, mat);
      corps.castShadow = true;
      g.add(corps);
      if (geoCoupe) {
        const capuchon = new THREE.Mesh(geoCoupe, matChair);
        capuchon.castShadow = true;
        g.add(capuchon);
      }
      for (const acc of accessoires) {
        if (plan.distanceToPoint(acc.position) >= 0) g.add(acc.clone());
      }
      const vel = f.vel.clone().multiplyScalar(0.55)
        .addScaledVector(n, sens * (3 + this.rnd() * 1.5))
        .addScaledVector(dirM, 1.5 + this.rnd());
      vel.z += (this.rnd() - 0.5) * 2;
      const rot = f.rot.clone().multiplyScalar(0.5).addScaledVector(dirM, sens * (4 + this.rnd() * 4));
      g.rotateOnWorldAxis(dirM, sens * 0.35);
      this.scene.add(g);
      let libere = false;
      const liberer = () => {
        if (libere) return; libere = true;
        mat.dispose();
        if (--restantes === 0) geoCoupe?.dispose();
      };
      this.moities.push({ groupe: g, vel, rot, planLocal: plan, plan: planClip, liberer });
    }

    // Jus, taches, sons et score
    const def = f.def;
    this.giclee(pos, dirM, n, def);
    this.tacher(pos, dirM, n, def);
    if (def.jus.ecran && this.rnd() < 0.35 + def.jus.quantite * 0.3) this.eclabousserEcran(c.x, c.y, def);
    this.sons.decoupe(def.son, def.jus.quantite, def.jus.viscosite);

    if (def.special === "or") {
      this.ralenti = 2.6;
      this.sons.dore();
      this.etincelles(pos, new THREE.Color(4, 3, 1.2), 180);
    }

    const maintenant = performance.now();
    if (maintenant - this.derniereCoupe < 320) this.comboEnCours++;
    else { this.terminerCombo(); this.comboEnCours = 1; }
    this.derniereCoupe = maintenant;
    this.comboPos.copy(pos);

    if (this.etat === "jeu") {
      this.score += def.points;
      this.coupes[def.id] = (this.coupes[def.id] || 0) + 1;
      if (!this.dejaVus.has(def.id)) {
        this.dejaVus.add(def.id);
        this.rappels.decouverte?.(def.id);
      }
      this.bulle(`+${def.points}`, def.kreol, c.x, c.y - rPx * 0.6, "#ffe066", def.points > 1 ? 34 : 28);
      this.envoyerEtat();
    } else {
      this.bulle(def.kreol, undefined, c.x, c.y - rPx * 0.6, def.jus.couleur, 26);
    }
  }

  private chairs = new Map<string, THREE.MeshPhysicalMaterial>();
  /** Matière de la face coupée : humide mais pas éblouissante, la face reçoit la lumière de face. */
  private materiauChair(def: DefFruit) {
    let m = this.chairs.get(def.id);
    if (!m) {
      const juteux = def.jus.quantite > 0.3;
      m = new THREE.MeshPhysicalMaterial({
        map: textureChair(def.id), color: "#9c9c9c", roughness: 0.5, specularIntensity: 0.6,
        clearcoat: juteux ? 0.35 : 0, clearcoatRoughness: 0.45, envMapIntensity: 0.45, side: THREE.DoubleSide,
        emissive: def.special === "or" ? new THREE.Color("#ffb020") : new THREE.Color(0), emissiveIntensity: 0.15,
      });
      this.chairs.set(def.id, m);
    }
    return m;
  }

  private terminerCombo() {
    const n = this.comboEnCours;
    this.comboEnCours = 0;
    if (n < 3) return;
    this.meilleurCombo = Math.max(this.meilleurCombo, n);
    const c = this.ecran(this.comboPos);
    const mots = ["Lé bon !", "Gayar !", "Gayar gayar !"];
    this.bulle(`Combo x${n}`, `${mots[Math.min(2, n - 3)]}  +${n}`, c.x, c.y - 40, "#ffe066", 40);
    this.sons.combo(n);
    if (this.etat === "jeu") {
      this.score += n;
      this.envoyerEtat();
    }
  }

  private exploser(pos: THREE.Vector3) {
    this.sons.explosion();
    this.secousse = 0.6;
    this.flash = 0.85;
    this.etincelles(pos, new THREE.Color(5, 1.6, 0.25), 360);
    for (let i = 0; i < 40; i++) {
      const d = new THREE.Vector3(this.rnd() - 0.5, this.rnd() - 0.5, (this.rnd() - 0.5) * 0.4).normalize();
      this.ajouterGoutte(pos.clone(), d.multiplyScalar(6 + this.rnd() * 10), 0.06 + this.rnd() * 0.12, new THREE.Color("#2a1d18"), this.rnd() < 0.5, true);
    }
    // Trace de brûlure sur la planche
    const { x, y } = this.versPlanche(pos);
    const ctx = this.t2d;
    const r = 120 + this.rnd() * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(20,10,5,0.85)");
    g.addColorStop(0.5, "rgba(35,18,8,0.55)");
    g.addColorStop(1, "rgba(35,18,8,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    this.tachesModifiees = true;
    if (this.etat === "jeu" && this.mode === "classique") {
      const c = this.ecran(pos);
      this.bulle("Aïe, la lave !", "Pa grav !", c.x, c.y, "#ff8a3c", 34);
      this.perdreVie();
    }
  }

  // -------------------------------------------------------------------------
  // Particules
  // -------------------------------------------------------------------------

  private ajouterGoutte(pos: THREE.Vector3, vel: THREE.Vector3, taille: number, couleur: THREE.Color, versPlanche: boolean, grain = false) {
    if (this.gouttes.length >= MAX_GOUTTES) this.gouttes.shift();
    this.gouttes.push({ pos, vel, vie: 2.5, taille, couleur, versPlanche, graine: grain, allonge: grain ? 0.6 : 1 });
  }

  private giclee(pos: THREE.Vector3, dirM: THREE.Vector3, n: THREE.Vector3, def: DefFruit) {
    const jus = def.jus;
    const couleur = new THREE.Color(jus.couleur);
    const nb = Math.round((14 + 110 * jus.quantite) * (0.6 + def.rayon * 0.4));
    const vitesse = 5 + (1 - jus.viscosite) * 7;
    for (let i = 0; i < nb; i++) {
      const cote = this.rnd() < 0.5 ? 1 : -1;
      const d = n.clone().multiplyScalar(cote * (0.4 + this.rnd()))
        .addScaledVector(dirM, (this.rnd() - 0.3) * 1.6)
        .add(new THREE.Vector3(0, this.rnd() * 0.6, (this.rnd() - 0.5) * 0.8))
        .normalize();
      const versPlanche = this.rnd() < 0.3;
      const v = d.multiplyScalar(vitesse * (0.35 + this.rnd()));
      if (versPlanche) v.z = -(8 + this.rnd() * 8);
      const taille = (0.035 + this.rnd() * 0.09) * (0.7 + jus.viscosite * 0.6);
      this.ajouterGoutte(pos.clone().addScaledVector(d, def.rayon * 0.3), v, taille, couleur.clone().offsetHSL(0, 0, (this.rnd() - 0.5) * 0.08), versPlanche);
    }
    if (jus.graines) {
      const cg = new THREE.Color(jus.graines);
      for (let i = 0; i < 6 + Math.round(this.rnd() * 10); i++) {
        const d = new THREE.Vector3(this.rnd() - 0.5, this.rnd() * 0.8 - 0.1, (this.rnd() - 0.5) * 0.5).normalize();
        const v = d.multiplyScalar(4 + this.rnd() * 6);
        const vp = this.rnd() < 0.5;
        if (vp) v.z = -(9 + this.rnd() * 6);
        this.ajouterGoutte(pos.clone(), v, 0.06 + this.rnd() * 0.04, cg, vp, true);
      }
    }
    if (jus.morceaux) {
      const cm = new THREE.Color(jus.morceaux);
      for (let i = 0; i < 5 + Math.round(this.rnd() * 6); i++) {
        const d = new THREE.Vector3(this.rnd() - 0.5, this.rnd() * 0.9, (this.rnd() - 0.5) * 0.5).normalize();
        this.ajouterGoutte(pos.clone(), d.multiplyScalar(3 + this.rnd() * 5), 0.09 + this.rnd() * 0.08, cm, false, true);
      }
    }
    if (jus.viscosite < 0.45 && jus.quantite > 0.5) {
      for (let i = 0; i < 26; i++) {
        if (this.brume.length >= MAX_BRUME) this.brume.shift();
        const d = new THREE.Vector3(this.rnd() - 0.5, this.rnd() - 0.4, (this.rnd() - 0.5) * 0.3).normalize();
        this.brume.push({ pos: pos.clone(), vel: d.multiplyScalar(1.5 + this.rnd() * 3), vie: 0.7, vieMax: 0.7, couleur: couleur.clone() });
      }
    }
  }

  private etincelles(pos: THREE.Vector3, couleur: THREE.Color, nb: number) {
    for (let i = 0; i < nb; i++) {
      if (this.braises.length >= MAX_BRAISES) this.braises.shift();
      const d = new THREE.Vector3(this.rnd() - 0.5, this.rnd() - 0.5, (this.rnd() - 0.5) * 0.6).normalize();
      const vie = 0.6 + this.rnd() * 1.1;
      this.braises.push({ pos: pos.clone(), vel: d.multiplyScalar(3 + this.rnd() * 13), vie, vieMax: vie, couleur: couleur.clone().multiplyScalar(0.6 + this.rnd() * 0.6) });
    }
  }

  // -------------------------------------------------------------------------
  // Taches de jus sur la planche
  // -------------------------------------------------------------------------

  private versPlanche(p: THREE.Vector3) {
    const k = (CAM_Z - PLANCHE_Z) / (CAM_Z - p.z);
    const bx = p.x * k, by = p.y * k;
    return { x: (bx / this.tailleP + 0.5) * 1024, y: (0.5 - by / this.tailleP) * 1024 };
  }

  private tacher(pos: THREE.Vector3, dirM: THREE.Vector3, n: THREE.Vector3, def: DefFruit) {
    const jus = def.jus;
    if (jus.quantite < 0.05) return;
    const { x, y } = this.versPlanche(pos);
    const ctx = this.t2d;
    const echelle = 1024 / this.tailleP;
    const R = def.rayon * echelle * (0.55 + jus.quantite * 0.5);
    const coul = new THREE.Color(jus.couleur);
    const hsl = { h: 0, s: 0, l: 0 };
    coul.getHSL(hsl);
    // les jus très clairs (letchi, coco, banane) marquent moins le bois
    const alpha = (0.45 + jus.quantite * 0.3) * (hsl.l > 0.75 ? 0.45 : 1);
    const rgba = (a: number) => `rgba(${Math.round(coul.r * 255)},${Math.round(coul.g * 255)},${Math.round(coul.b * 255)},${a})`;
    // Si la couleur est stockée en linéaire, on revient en sRGB pour le canvas
    coul.convertLinearToSRGB();

    ctx.save();
    // Tache centrale irrégulière
    ctx.beginPath();
    const pts = 22;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2;
      const r = R * (0.65 + fbm(Math.cos(a) * 2 + x, Math.sin(a) * 2 + y, 1, 3) * 0.7);
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.fillStyle = rgba(alpha);
    ctx.fill();
    // Projections allongées dans le sens de la coupe et des deux côtés
    const nbJets = 8 + Math.round(jus.quantite * 14);
    for (let i = 0; i < nbJets; i++) {
      const cote = this.rnd() < 0.5 ? 1 : -1;
      const axe = this.rnd() < 0.55 ? n : dirM;
      const ang = Math.atan2(-(axe.y * cote), axe.x * cote) + (this.rnd() - 0.5) * 0.9;
      const l = R * (0.8 + this.rnd() * 1.8) * (1.2 - jus.viscosite * 0.5);
      const w = R * (0.08 + this.rnd() * 0.16);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.ellipse(l * 0.55, 0, l * 0.55, w, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(alpha * 0.9);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(l * (1.05 + this.rnd() * 0.3), 0, w * (0.7 + this.rnd() * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Gouttelettes autour
    for (let i = 0; i < 30 * jus.quantite; i++) {
      const a = this.rnd() * Math.PI * 2, r = R * (1.2 + this.rnd() * 2.2);
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.5 + this.rnd() * R * 0.07, 0, Math.PI * 2);
      ctx.fillStyle = rgba(alpha * 0.85);
      ctx.fill();
    }
    ctx.restore();

    // Coulures : longues et rapides si le jus est liquide, épaisses et lentes s'il est pâteux
    const nbC = 2 + Math.round(jus.quantite * 5);
    for (let i = 0; i < nbC; i++) {
      this.coulures.push({
        x: x + (this.rnd() - 0.5) * R * 1.4,
        y: y + R * (0.3 + this.rnd() * 0.4),
        v: (60 + this.rnd() * 80) * (1.25 - jus.viscosite),
        l: (80 + this.rnd() * 260) * (1.2 - jus.viscosite * 0.6),
        w: (2.5 + this.rnd() * 4) * (0.7 + jus.viscosite * 0.9),
        couleur: rgba(alpha * 0.85),
      });
    }
    this.tachesModifiees = true;
  }

  private petiteTache(p: THREE.Vector3, vel: THREE.Vector3, couleur: THREE.Color, taille: number, grain: boolean) {
    const { x, y } = this.versPlanche(p);
    const c = couleur.clone().convertLinearToSRGB();
    const ctx = this.t2d;
    const ang = Math.atan2(-vel.y, vel.x);
    const l = taille * 1024 / this.tailleP * (grain ? 1.4 : 2.6);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(2, l), Math.max(1.5, l * (grain ? 0.6 : 0.45)), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${grain ? 0.95 : 0.7})`;
    ctx.fill();
    ctx.restore();
    this.tachesModifiees = true;
  }

  private majTaches(dt: number) {
    const ctx = this.t2d;
    if (this.coulures.length) {
      for (const c of this.coulures) {
        const d = c.v * dt;
        const pas = Math.max(1, Math.ceil(d / 2));
        ctx.fillStyle = c.couleur;
        for (let i = 0; i < pas; i++) {
          c.y += d / pas;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.w, 0, Math.PI * 2);
          ctx.fill();
        }
        c.l -= d;
        c.v *= 1 - dt * 0.35;
        c.w = Math.max(1, c.w - dt * 0.6);
      }
      ctx.beginPath();
      this.coulures = this.coulures.filter((c) => c.l > 0 && c.v > 4);
      this.tachesModifiees = true;
    }
    this.minuterieFondu += dt;
    if (this.minuterieFondu > 0.3) {
      this.minuterieFondu = 0;
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.restore();
      this.tachesModifiees = true;
    }
    if (this.tachesModifiees) {
      this.texTaches.needsUpdate = true;
      this.tachesModifiees = false;
    }
  }

  // -------------------------------------------------------------------------
  // Éclaboussures sur l'écran et textes
  // -------------------------------------------------------------------------

  private eclabousserEcran(x: number, y: number, def: DefFruit) {
    const nb = 2 + Math.round(this.rnd() * 4 * def.jus.quantite);
    for (let i = 0; i < nb; i++) {
      const vie = 2.2 + this.rnd() * 2;
      this.gouttesEcran.push({
        x: x + (this.rnd() - 0.5) * 260, y: y + (this.rnd() - 0.5) * 200,
        r: 10 + this.rnd() * 26, vy: 6 + this.rnd() * 14, vie, vieMax: vie, couleur: def.jus.couleur,
      });
    }
  }

  private bulle(texte: string, sous: string | undefined, x: number, y: number, couleur: string, taille: number) {
    this.bulles.push({ texte, sous, x, y, vie: 1.1, couleur, taille });
  }

  private dessinerOverlay(dt: number) {
    const ctx = this.o2d;
    const k = this.dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    ctx.setTransform(k, 0, 0, k, 0, 0);

    // Gouttes sur la vitre
    for (const g of this.gouttesEcran) {
      g.vie -= dt;
      g.y += g.vy * dt;
      g.vy += 4 * dt;
      const a = Math.min(1, g.vie / g.vieMax * 1.6);
      ctx.save();
      ctx.globalAlpha = a;
      const grad = ctx.createRadialGradient(g.x - g.r * 0.3, g.y - g.r * 0.3, g.r * 0.1, g.x, g.y, g.r);
      grad.addColorStop(0, "rgba(255,255,255,0.55)");
      grad.addColorStop(0.25, hexA(g.couleur, 0.45));
      grad.addColorStop(0.85, hexA(g.couleur, 0.75));
      grad.addColorStop(1, "rgba(0,0,0,0.25)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, g.r, g.r * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.ellipse(g.x - g.r * 0.35, g.y - g.r * 0.4, g.r * 0.18, g.r * 0.1, -0.6, 0, Math.PI * 2);
      ctx.fill();
      // petite trace qui suit la goutte
      ctx.fillStyle = hexA(g.couleur, 0.25);
      ctx.fillRect(g.x - g.r * 0.15, g.y - g.r * 3, g.r * 0.3, g.r * 2.2);
      ctx.restore();
    }
    this.gouttesEcran = this.gouttesEcran.filter((g) => g.vie > 0);

    // Textes flottants
    for (const b of this.bulles) {
      b.vie -= dt;
      b.y -= 38 * dt;
      const a = Math.min(1, b.vie * 2.2);
      const echelle = 1 + Math.max(0, b.vie - 0.9) * 2.5;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(b.x, b.y);
      ctx.scale(echelle, echelle);
      ctx.textAlign = "center";
      ctx.lineJoin = "round";
      ctx.font = `800 ${b.taille}px Nunito, system-ui, sans-serif`;
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(40,20,10,0.85)";
      ctx.strokeText(b.texte, 0, 0);
      ctx.fillStyle = b.couleur;
      ctx.fillText(b.texte, 0, 0);
      if (b.sous) {
        ctx.font = `700 ${Math.round(b.taille * 0.6)}px Nunito, system-ui, sans-serif`;
        ctx.lineWidth = 5;
        ctx.strokeText(b.sous, 0, b.taille * 0.85);
        ctx.fillStyle = "#fffaf0";
        ctx.fillText(b.sous, 0, b.taille * 0.85);
      }
      ctx.restore();
    }
    this.bulles = this.bulles.filter((b) => b.vie > 0);

    // Flash blanc de l'explosion
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(255,236,200,${this.flash})`;
      ctx.fillRect(0, 0, this.largeur, this.hauteur);
      this.flash = Math.max(0, this.flash - dt * 2.2);
    }
  }

  // -------------------------------------------------------------------------
  // Lancers et partie
  // -------------------------------------------------------------------------

  private choisirFruit(): DefFruit {
    const enJeu = this.etat === "jeu";
    const d = enJeu ? Math.min(1, this.tempsJeu / 110) : 0;
    const laves = this.fruits.filter((f) => f.def.special === "lave").length;
    if (enJeu && this.mode === "classique" && this.tempsJeu > 7 && laves < 2 && this.rnd() < 0.06 + 0.12 * d) return fruitParId("lave");
    if (this.rnd() < (enJeu ? 0.03 : 0.05)) return fruitParId("letchi-or");
    const liste = FRUITS.filter((f) => f.poids > 0);
    const total = liste.reduce((s, f) => s + f.poids, 0);
    let r = this.rnd() * total;
    for (const f of liste) { r -= f.poids; if (r <= 0) return f; }
    return liste[0];
  }

  private planifierVague(dt: number) {
    this.prochaineVague -= dt;
    if (this.prochaineVague <= 0) {
      let nb: number, intervalle: number;
      if (this.etat !== "jeu") { nb = 1 + Math.floor(this.rnd() * 2); intervalle = 1.6 + this.rnd(); }
      else {
        const d = Math.min(1, this.tempsJeu / (this.mode === "zen" ? 60 : 110));
        nb = 1 + Math.floor(this.rnd() * (1.5 + d * (this.mode === "zen" ? 5 : 4)));
        intervalle = THREE.MathUtils.lerp(this.mode === "zen" ? 1.2 : 1.7, this.mode === "zen" ? 0.55 : 0.75, d) + this.rnd() * 0.35;
      }
      for (let i = 0; i < nb; i++) this.fileLancers.push({ def: this.choisirFruit(), dans: i * (0.08 + this.rnd() * 0.12) });
      this.prochaineVague = intervalle;
    }
    for (const l of this.fileLancers) l.dans -= dt;
    const prets = this.fileLancers.filter((l) => l.dans <= 0);
    this.fileLancers = this.fileLancers.filter((l) => l.dans > 0);
    prets.forEach((l) => this.lancer(l.def));
  }

  private lancer(def: DefFruit) {
    const m = modele(def.id);
    const groupe = new THREE.Group();
    const corps = new THREE.Mesh(m.corps, m.materiau);
    corps.castShadow = true;
    groupe.add(corps);
    m.accessoires().forEach((a) => { a.castShadow = true; groupe.add(a); });
    let vel: THREE.Vector3, rot: THREE.Vector3;
    if (def.id === "vanille") {
      // La gousse de vanille tombe toujours du ciel, en tournoyant doucement
      const x0 = (this.rnd() * 2 - 1) * this.demiL * 0.6;
      groupe.position.set(x0, this.demiH + 1.6, (this.rnd() - 0.5) * 1.5);
      groupe.rotation.set(0, this.rnd() * 6, (this.rnd() - 0.5) * 0.6);
      vel = new THREE.Vector3((this.rnd() - 0.5) * 1.5, -(0.5 + this.rnd() * 1.5), 0);
      rot = new THREE.Vector3((this.rnd() - 0.5) * 0.8, (this.rnd() - 0.5) * 1.2, (this.rnd() - 0.5) * 2.2);
    } else {
      const x0 = (this.rnd() * 2 - 1) * this.demiL * 0.75;
      const y0 = -this.demiH - 1.8;
      const sommet = THREE.MathUtils.lerp(this.demiH * 0.05, this.demiH - def.rayon - 0.4, this.rnd());
      const vy = Math.sqrt(2 * GRAVITE * (sommet - y0));
      const tSommet = vy / GRAVITE;
      const cible = (this.rnd() * 2 - 1) * this.demiL * 0.55;
      groupe.position.set(x0, y0, (this.rnd() - 0.5) * 2.4);
      groupe.rotation.set(this.rnd() * 6, this.rnd() * 6, this.rnd() * 6);
      vel = new THREE.Vector3((cible - x0) / (2 * tSommet), vy, 0);
      rot = new THREE.Vector3((this.rnd() - 0.5) * 4, (this.rnd() - 0.5) * 4, (this.rnd() - 0.5) * 4);
    }
    const fruit: Fruit = { def, groupe, corps, vel, rot, monte: false };
    if (def.special === "lave" || def.special === "or") {
      const libre = this.lumieres.find((x) => !x.fruit);
      if (libre) {
        libre.fruit = fruit;
        libre.l.color.set(def.special === "lave" ? "#ff5a10" : "#ffc640");
        fruit.lumiere = libre.l;
      }
    }
    this.scene.add(groupe);
    this.fruits.push(fruit);
    this.sons.lancer();
  }

  private retirerFruit(f: Fruit) {
    const lum = this.lumieres.find((x) => x.fruit === f);
    if (lum) { lum.fruit = null; lum.l.intensity = 0; lum.l.position.set(0, -100, 0); }
    this.scene.remove(f.groupe);
    this.fruits = this.fruits.filter((x) => x !== f);
  }

  private perdreVie() {
    if (this.mode !== "classique" || this.etat !== "jeu") return;
    this.vies--;
    this.envoyerEtat();
    if (this.vies <= 0) this.terminerPartie();
  }

  private terminerPartie() {
    this.etat = "fin";
    this.ralenti = 1.2;
    this.sons.fin();
    this.terminerCombo();
    const resultat: Resultat = { mode: this.mode, score: this.score, coupes: { ...this.coupes }, meilleurCombo: this.meilleurCombo, duree: Math.round(this.tempsJeu) };
    setTimeout(() => this.rappels.fin(resultat), 1100);
  }

  private envoyerEtat() {
    this.rappels.etat({
      score: this.score,
      vies: this.vies,
      temps: this.mode === "zen" ? Math.max(0, Math.ceil(DUREE_ZEN - this.tempsJeu)) : null,
      combo: this.comboEnCours,
    });
  }

  // -------------------------------------------------------------------------
  // Boucle
  // -------------------------------------------------------------------------

  private boucle = () => {
    if (this.enPause) return;
    const maintenantT = performance.now();
    const dtReel = Math.min(0.05, (maintenantT - this.dernierT) / 1000);
    this.dernierT = maintenantT;
    // (la qualité est pilotée par le gestionnaire commun : niveaux, puis mode 30 i/s)
    if (this.ralenti > 0) this.ralenti -= dtReel;
    const echelle = this.ralenti > 0 ? 0.35 : 1;
    const dt = dtReel * echelle;

    if (this.etat === "jeu") {
      const avant = Math.ceil(DUREE_ZEN - this.tempsJeu);
      this.tempsJeu += dt;
      if (this.mode === "zen") {
        const apres = Math.ceil(DUREE_ZEN - this.tempsJeu);
        if (apres !== avant) this.envoyerEtat();
        if (this.tempsJeu >= DUREE_ZEN) this.terminerPartie();
      }
    }
    if (this.etat !== "fin") this.planifierVague(dt);
    if (this.comboEnCours && performance.now() - this.derniereCoupe > 320) this.terminerCombo();

    this.majFruits(dt);
    this.majMoities(dt);
    this.majGouttes(dt);
    this.majParticules(dt);
    this.majTaches(dtReel);
    this.majTrainee();

    // Secousse de caméra
    if (this.secousse > 0) {
      this.secousse -= dtReel;
      const a = this.secousse * 0.6;
      this.camera.position.set((Math.random() - 0.5) * a, (Math.random() - 0.5) * a, CAM_Z);
    } else this.camera.position.set(0, 0, CAM_Z);

    if (this.composer && !this.qualiteBaissee) this.composer.render(dtReel);
    else this.renderer.render(this.scene, this.camera);
    this.dessinerOverlay(dtReel);
  };

  private surveillerPerformance(dt: number) {
    if (this.qualiteBaissee || this.etat === "menu") return;
    this.mesuresFrames.push(dt);
    if (this.mesuresFrames.length < 150) return;
    const moyenne = this.mesuresFrames.reduce((s, x) => s + x, 0) / this.mesuresFrames.length;
    this.mesuresFrames = [];
    if (moyenne > 0.026) {
      // L'appareil peine : on retire le halo lumineux et les ombres douces
      this.qualiteBaissee = true;
      this.renderer.setPixelRatio(Math.min(this.dpr, 1.25));
      this.redimensionner();
    }
  }

  private majFruits(dt: number) {
    const limite = -this.demiH - 2.6;
    for (const f of [...this.fruits]) {
      if (f.def.id === "vanille") { f.vel.y -= GRAVITE * 0.45 * dt; f.vel.y = Math.max(f.vel.y, -9); }
      else f.vel.y -= GRAVITE * dt;
      f.groupe.position.addScaledVector(f.vel, dt);
      tourner(f.groupe, f.rot, dt);
      if (f.groupe.position.y > -this.demiH) f.monte = true;
      if (f.lumiere) {
        const p = 0.5 + 0.5 * Math.sin(performance.now() / 120);
        f.lumiere.intensity = 4 + p * 4;
        f.lumiere.position.copy(f.groupe.position);
        const mu = (f.corps.material as THREE.MeshPhysicalMaterial).userData.pulsation;
        if (mu) mu.value = p;
        if (f.def.special === "lave" && this.rnd() < 0.5) {
          if (this.braises.length < MAX_BRAISES) {
            this.braises.push({ pos: f.groupe.position.clone().add(new THREE.Vector3((this.rnd() - 0.5) * 0.8, (this.rnd() - 0.5) * 0.8, 0)), vel: new THREE.Vector3((this.rnd() - 0.5) * 1.5, 1 + this.rnd() * 2, 0), vie: 0.5, vieMax: 0.5, couleur: new THREE.Color(3, 1, 0.15) });
          }
        }
        if (f.def.special === "or" && this.rnd() < 0.4 && this.braises.length < MAX_BRAISES) {
          this.braises.push({ pos: f.groupe.position.clone().add(new THREE.Vector3((this.rnd() - 0.5) * 1.4, (this.rnd() - 0.5) * 1.4, 0.5)), vel: new THREE.Vector3(0, 0.4, 0), vie: 0.6, vieMax: 0.6, couleur: new THREE.Color(3, 2.4, 0.8) });
        }
      }
      if (f.vel.y < 0 && f.groupe.position.y < limite) {
        this.retirerFruit(f);
        if (f.monte && f.def.special !== "lave" && f.def.id !== "vanille" && this.etat === "jeu" && this.mode === "classique") {
          this.sons.rate();
          const c = this.ecran(new THREE.Vector3(f.groupe.position.x, -this.demiH + 0.8, 0));
          this.bulle("✕", undefined, Math.max(40, Math.min(this.largeur - 40, c.x)), c.y, "#ff5040", 44);
          this.perdreVie();
        }
      }
    }
  }

  private majMoities(dt: number) {
    const limite = -this.demiH - 4;
    for (const m of this.moities) {
      m.vel.y -= GRAVITE * dt;
      m.groupe.position.addScaledVector(m.vel, dt);
      tourner(m.groupe, m.rot, dt);
      m.groupe.updateMatrixWorld(true);
      m.plan.copy(m.planLocal).applyMatrix4(m.groupe.matrixWorld);
    }
    const restantes: Moitie[] = [];
    for (const m of this.moities) {
      if (m.groupe.position.y < limite) { this.scene.remove(m.groupe); m.liberer(); }
      else restantes.push(m);
    }
    this.moities = restantes;
  }

  private majGouttes(dt: number) {
    const mesh = this.mGouttes;
    let n = 0;
    const restantes: Goutte[] = [];
    for (const g of this.gouttes) {
      g.vie -= dt;
      g.vel.y -= GRAVITE * 0.9 * dt;
      g.vel.multiplyScalar(1 - dt * 0.4);
      g.pos.addScaledVector(g.vel, dt);
      if (g.versPlanche && g.pos.z <= PLANCHE_Z + 0.05) {
        this.petiteTache(g.pos, g.vel, g.couleur, g.taille, g.graine);
        if (Math.random() < 0.35) this.sons.goutteTombe(g.taille);
        continue;
      }
      if (g.vie <= 0 || g.pos.y < -this.demiH - 3) continue;
      restantes.push(g);
      if (n >= MAX_GOUTTES) continue;
      const v = g.vel.length();
      tmpQ.setFromUnitVectors(HAUT, tmpV.copy(g.vel).divideScalar(v || 1));
      const etire = g.graine ? 1.6 : 1 + Math.min(1.8, v * 0.09);
      tmpS.set(g.taille * g.allonge, g.taille * etire, g.taille * g.allonge);
      tmpM.compose(g.pos, tmpQ, tmpS);
      mesh.setMatrixAt(n, tmpM);
      mesh.setColorAt(n, g.couleur);
      n++;
    }
    this.gouttes = restantes;
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }

  private majParticules(dt: number) {
    const ecrire = (liste: Particule[], pts: THREE.Points, gravite: number, freinage: number) => {
      const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
      const col = pts.geometry.attributes.color as THREE.BufferAttribute;
      let n = 0;
      const restantes: Particule[] = [];
      for (const p of liste) {
        p.vie -= dt;
        if (p.vie <= 0) continue;
        p.vel.y -= gravite * dt;
        p.vel.multiplyScalar(1 - dt * freinage);
        p.pos.addScaledVector(p.vel, dt);
        const a = p.vie / p.vieMax;
        pos.setXYZ(n, p.pos.x, p.pos.y, p.pos.z);
        col.setXYZ(n, p.couleur.r * a, p.couleur.g * a, p.couleur.b * a);
        n++;
        restantes.push(p);
      }
      pts.geometry.setDrawRange(0, n);
      pos.needsUpdate = true;
      col.needsUpdate = true;
      return restantes;
    };
    this.braises = ecrire(this.braises, this.pBraises, 6, 1.6);
    this.brume = ecrire(this.brume, this.pBrume, 1.5, 2.5);
  }

  private majTrainee() {
    const geo = this.mTrainee.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    const maintenant = performance.now();
    this.trainee = this.trainee.filter((p) => maintenant - p.t < 170);
    const pts = this.trainee;
    const n = pts.length;
    if (n < 2) { geo.setDrawRange(0, 0); return; }
    for (let i = 0; i < n; i++) {
      const p = pts[i].p;
      const suiv = pts[Math.min(n - 1, i + 1)].p, prec = pts[Math.max(0, i - 1)].p;
      tmpV.copy(suiv).sub(prec);
      const perp = new THREE.Vector3(-tmpV.y, tmpV.x, 0).normalize();
      const f = i / (n - 1);
      const largeur = 0.04 + f * 0.2;
      pos.setXYZ(i * 2, p.x + perp.x * largeur, p.y + perp.y * largeur, p.z);
      pos.setXYZ(i * 2 + 1, p.x - perp.x * largeur, p.y - perp.y * largeur, p.z);
      const a = f * f;
      // blanc chaud au bout de la lame, doré vers la queue ; valeurs > 1 pour le halo lumineux
      col.setXYZW(i * 2, 2.6 * a + 0.6, 2.2 * a + 0.4, 1.4 * a + 0.1, a);
      col.setXYZW(i * 2 + 1, 2.6 * a + 0.6, 2.2 * a + 0.4, 1.4 * a + 0.1, a);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    geo.setDrawRange(0, (n - 1) * 6);
  }
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

const axeRot = new THREE.Vector3();
function tourner(o: THREE.Object3D, w: THREE.Vector3, dt: number) {
  const angle = w.length() * dt;
  if (angle < 1e-6) return;
  axeRot.copy(w).normalize();
  tmpQ.setFromAxisAngle(axeRot, angle);
  o.quaternion.premultiply(tmpQ);
}

/** Calcule la face coupée : contour réel de la section du fruit, triangulé en éventail. */
export function sectionCoupe(geo: THREE.BufferGeometry, plan: THREE.Plane): THREE.BufferGeometry | null {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const idx = geo.index;
  const nTri = idx ? idx.count / 3 : pos.count / 3;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const points: THREE.Vector3[] = [];
  const bord = (p: THREE.Vector3, q: THREE.Vector3, dp: number, dq: number) => {
    if ((dp > 0) !== (dq > 0)) {
      const t = dp / (dp - dq);
      points.push(p.clone().lerp(q, t));
    }
  };
  for (let i = 0; i < nTri; i++) {
    const ia = idx ? idx.getX(i * 3) : i * 3, ib = idx ? idx.getX(i * 3 + 1) : i * 3 + 1, ic = idx ? idx.getX(i * 3 + 2) : i * 3 + 2;
    a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
    const da = plan.distanceToPoint(a), db = plan.distanceToPoint(b), dc = plan.distanceToPoint(c);
    bord(a, b, da, db); bord(b, c, db, dc); bord(c, a, dc, da);
  }
  if (points.length < 3) return null;
  // Repère 2D dans le plan
  const nrm = plan.normal;
  const u = Math.abs(nrm.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  u.sub(nrm.clone().multiplyScalar(u.dot(nrm))).normalize();
  const v = new THREE.Vector3().crossVectors(nrm, u);
  const origine = nrm.clone().multiplyScalar(-plan.constant);
  const p2 = points.map((p) => { const d = p.clone().sub(origine); return [d.dot(u), d.dot(v)] as [number, number]; });
  // Contour par angle : on garde le point le plus éloigné dans chaque direction.
  // Contrairement à une enveloppe convexe, cela respecte les formes en étoile (carambole) ou à sillons.
  let mx = 0, my = 0;
  p2.forEach(([x, y]) => { mx += x; my += y; });
  mx /= p2.length; my /= p2.length;
  const NB = 96;
  const bins: ([number, number] | null)[] = new Array(NB).fill(null);
  const dist: number[] = new Array(NB).fill(-1);
  for (const [x, y] of p2) {
    const a = Math.atan2(y - my, x - mx);
    const k = Math.min(NB - 1, Math.floor(((a + Math.PI) / (Math.PI * 2)) * NB));
    const d = Math.hypot(x - mx, y - my);
    if (d > dist[k]) { dist[k] = d; bins[k] = [x, y]; }
  }
  const enveloppe = bins.filter((b): b is [number, number] => !!b);
  if (enveloppe.length < 3) return null;
  const cx = mx, cy = my;
  const sommets: number[] = [];
  const uvs: number[] = [];
  const vers3D = (x: number, y: number) => origine.clone().addScaledVector(u, x).addScaledVector(v, y);
  const centre = vers3D(cx, cy);
  sommets.push(centre.x, centre.y, centre.z);
  uvs.push(0.5, 0.5);
  enveloppe.forEach(([x, y]) => {
    const p = vers3D(x, y);
    sommets.push(p.x, p.y, p.z);
    const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1;
    uvs.push(0.5 + (dx / l) * 0.488, 0.5 + (dy / l) * 0.488);
  });
  const index: number[] = [];
  for (let i = 1; i <= enveloppe.length; i++) index.push(0, i, i === enveloppe.length ? 1 : i + 1);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(sommets, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

function texturePoint() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  return t;
}

function creerPoints(max: number, mat: THREE.PointsMaterial) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(max * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setDrawRange(0, 0);
  const p = new THREE.Points(g, mat);
  p.frustumCulled = false;
  return p;
}

function hexA(hex: string, a: number) {
  const c = new THREE.Color(hex).convertLinearToSRGB();
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;
}

/** Planche de bois chaude, dessinée par le code. */
function dessinerBois(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const ctx = c.getContext("2d")!;
  const rnd = graine(42);
  const lames = 6;
  const lw = 1024 / lames;
  const teintes = ["#7a4f2c", "#6d4526", "#835834", "#734a29", "#7e5330", "#69422a"];
  for (let i = 0; i < lames; i++) {
    const x0 = i * lw;
    const base = ctx.createLinearGradient(x0, 0, x0 + lw, 0);
    base.addColorStop(0, teintes[i]);
    base.addColorStop(0.5, shade(teintes[i], 12));
    base.addColorStop(1, shade(teintes[i], -10));
    ctx.fillStyle = base;
    ctx.fillRect(x0, 0, lw, 1024);
    // veines du bois
    for (let k = 0; k < 46; k++) {
      const xv = x0 + rnd() * lw;
      const amp = 4 + rnd() * 14, freq = 0.004 + rnd() * 0.01, ph = rnd() * 10;
      ctx.strokeStyle = rnd() < 0.5 ? "rgba(40,22,10,0.22)" : "rgba(255,220,170,0.08)";
      ctx.lineWidth = 0.6 + rnd() * 1.8;
      ctx.beginPath();
      for (let y = 0; y <= 1024; y += 8) {
        const x = xv + Math.sin(y * freq + ph) * amp + (fbm(xv * 0.01, y * 0.004, i, 3) - 0.5) * 30;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // nœud
    if (rnd() < 0.7) {
      const nx = x0 + lw * (0.3 + rnd() * 0.4), ny = rnd() * 1024;
      for (let r = 26; r > 2; r -= 4) {
        ctx.strokeStyle = `rgba(45,25,12,${0.12 + (26 - r) * 0.012})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(nx, ny, r * 0.7, r * 1.3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    // rainure entre les lames
    ctx.fillStyle = "rgba(20,10,4,0.75)";
    ctx.fillRect(x0 - 2, 0, 4, 1024);
    ctx.fillStyle = "rgba(255,230,190,0.08)";
    ctx.fillRect(x0 + 2, 0, 2, 1024);
  }
  // rayures légères de couteau
  for (let k = 0; k < 120; k++) {
    const x = rnd() * 1024, y = rnd() * 1024, a = rnd() * Math.PI, l = 20 + rnd() * 90;
    ctx.strokeStyle = "rgba(255,225,185,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
  }
  return c;
}

function shade(hex: string, p: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, v + p));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
