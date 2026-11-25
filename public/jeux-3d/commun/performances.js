// =====================================================================
// Kwélafé : gestionnaire de performances commun à TOUS les jeux
// (jeux 2D et Koup Koup du site, jeux 3D et Koup Koup 2 servis en statique).
//
// Ce fichier est la source unique : le site l'importe directement
// (voir performances.d.ts) et les jeux statiques le chargent en module.
//
// Il s'occupe de :
//  - reconnaître l'appareil (iPhone, iPad, PWA, mémoire) ;
//  - choisir la résolution graphique (DPR limité à 1,5 sur iPhone) ;
//  - surveiller les images par seconde et baisser la qualité, jusqu'au mode 30 i/s ;
//  - suivre le cycle de vie de la page (arrière-plan, verrouillage, retour, bfcache) ;
//  - garder la trace des boucles, minuteries et écouteurs pour tout libérer ;
//  - gérer la perte et la restauration du contexte WebGL ;
//  - sauvegarder la progression (IndexedDB, repli localStorage) ;
//  - tenir un petit journal pour distinguer rechargement, plantage et perte graphique.
// =====================================================================

// ---------------------------------------------------------------------
// 1. Appareil
// ---------------------------------------------------------------------
const nav = typeof navigator !== 'undefined' ? navigator : {};
const ua = nav.userAgent || '';
const tactile = typeof window !== 'undefined' && (('ontouchend' in window) || (nav.maxTouchPoints || 0) > 1);
const ipadDeguise = /Macintosh/.test(ua) && tactile; // iPadOS se présente comme un Mac
const iphone = /iPhone|iPod/.test(ua);
const ipad = /iPad/.test(ua) || ipadDeguise;
const ios = iphone || ipad;
const pwa = typeof window !== 'undefined' && (
  (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || nav.standalone === true
);

export const appareil = {
  ios, iphone, ipad, pwa, tactile,
  coeurs: nav.hardwareConcurrency || 4,
  memoire: nav.deviceMemory || (ios ? 3 : 4), // Safari ne donne pas la mémoire : prudence
  dpr: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
};

/** Plafond de résolution par appareil : 1,5 sur iPhone (au départ), 2 ailleurs. */
export function dprMax() {
  if (appareil.iphone) return 1.5;
  if (appareil.ipad) return 2;
  if (appareil.tactile) return 1.75;
  return 2;
}

/** Résolution graphique à utiliser : min(écran, plafond appareil, plafond du jeu). */
export function dprCible(plafondJeu = 2) {
  const ecran = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  return Math.max(1, Math.min(ecran, dprMax(), plafondJeu));
}

/** Taille maximale conseillée pour une texture (côté en pixels). */
export function tailleTextureMax() {
  if (appareil.iphone) return 512;
  if (appareil.ios || appareil.tactile) return 1024;
  return 2048;
}

// ---------------------------------------------------------------------
// 2. Journal de diagnostic (sessionStorage, partagé entre le site et ses cadres)
// ---------------------------------------------------------------------
const CLE_JOURNAL = 'kw-journal';
export function journal(type, detail = '') {
  const entree = { t: new Date().toISOString(), type, detail: String(detail).slice(0, 200), page: typeof location !== 'undefined' ? location.pathname : '' };
  try {
    const l = JSON.parse(sessionStorage.getItem(CLE_JOURNAL) || '[]');
    l.push(entree);
    while (l.length > 80) l.shift();
    sessionStorage.setItem(CLE_JOURNAL, JSON.stringify(l));
  } catch (e) { /* stockage indisponible */ }
  try { console.info('[kwélafé]', type, detail); } catch (e) { /* rien */ }
  return entree;
}
export function lireJournal() {
  try { return JSON.parse(sessionStorage.getItem(CLE_JOURNAL) || '[]'); } catch (e) { return []; }
}
if (typeof window !== 'undefined') window.kwelafeJournal = lireJournal;

/**
 * Au chargement d'un jeu : comment est-on arrivé ici ?
 *  - « navigation »  : ouverture normale ;
 *  - « rechargement »: l'utilisateur (ou le navigateur) a rechargé la page ;
 *  - « reprise-apres-arret » : la page précédente du même jeu s'est arrêtée sans se fermer
 *     proprement (onglet tué par iOS faute de mémoire, ou plantage du moteur Web).
 */
export function diagnosticDemarrage(nom) {
  let type = 'navigation';
  try {
    const n = performance.getEntriesByType('navigation')[0];
    if (n && n.type === 'reload') type = 'rechargement';
    if (n && n.type === 'back_forward') type = 'retour';
  } catch (e) { /* rien */ }
  let arretBrutal = false;
  try {
    const cle = 'kw-actif-' + nom;
    if (sessionStorage.getItem(cle)) arretBrutal = true;
    sessionStorage.setItem(cle, String(Date.now()));
  } catch (e) { /* rien */ }
  if (arretBrutal) type = 'reprise-apres-arret';
  journal('demarrage', nom + ' : ' + type);
  return type;
}
function finPropre(nom) { try { sessionStorage.removeItem('kw-actif-' + nom); } catch (e) { /* rien */ } }

// ---------------------------------------------------------------------
// 3. Sauvegarde de la progression : IndexedDB, avec repli localStorage
// ---------------------------------------------------------------------
let basePromesse = null;
function base() {
  if (basePromesse) return basePromesse;
  basePromesse = new Promise((ok) => {
    try {
      if (typeof indexedDB === 'undefined') return ok(null);
      const r = indexedDB.open('kwelafe-jeux', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('parties'); };
      r.onsuccess = () => {
        const db = r.result;
        db.onversionchange = () => { db.close(); basePromesse = null; };
        db.onclose = () => { basePromesse = null; };
        ok(db);
      };
      r.onerror = () => ok(null);
      r.onblocked = () => ok(null);
      setTimeout(() => ok(null), 2500); // iOS peut bloquer l'ouverture : on n'attend pas indéfiniment
    } catch (e) { ok(null); }
  });
  return basePromesse;
}
function operation(mode, f) {
  return base().then((db) => new Promise((ok, ko) => {
    if (!db) return ko(new Error('indexeddb indisponible'));
    try {
      const tx = db.transaction('parties', mode);
      const req = f(tx.objectStore('parties'));
      tx.oncomplete = () => ok(req && req.result);
      tx.onerror = tx.onabort = () => ko(tx.error);
    } catch (e) { basePromesse = null; ko(e); }
  }));
}
export const sauvegarde = {
  async lire(cle, defaut = null) {
    try { const v = await operation('readonly', (s) => s.get(cle)); if (v !== undefined) return v; } catch (e) { /* repli */ }
    try { const v = localStorage.getItem('kw-sauve-' + cle); return v === null ? defaut : JSON.parse(v); } catch (e) { return defaut; }
  },
  async ecrire(cle, valeur) {
    // Copie immédiate en localStorage (synchrone : survit à un arrêt brutal), puis IndexedDB.
    try { localStorage.setItem('kw-sauve-' + cle, JSON.stringify(valeur)); } catch (e) { /* plein ou indisponible */ }
    try { await operation('readwrite', (s) => s.put(valeur, cle)); } catch (e) { /* le repli suffit */ }
  },
  async effacer(cle) {
    try { localStorage.removeItem('kw-sauve-' + cle); } catch (e) { /* rien */ }
    try { await operation('readwrite', (s) => s.delete(cle)); } catch (e) { /* rien */ }
  },
};

// ---------------------------------------------------------------------
// 4. Gestionnaire de performances d'un jeu
// ---------------------------------------------------------------------
/**
 * const perf = new GestionnairePerf({
 *   nom: 'koup-koup',
 *   surPause(raison)       // l'application passe en arrière-plan, l'écran se verrouille…
 *   surReprise(raison)     // retour au premier plan
 *   surSauvegarde(raison)  // moment d'écrire la progression (arrière-plan, fermeture, minuterie)
 *   surQualite(niveau)     // 2 = haute, 1 = moyenne, 0 = basse ; le mode 30 i/s est géré ici
 * });
 * perf.boucle(fonction)    // une seule boucle d'animation, jamais deux
 * perf.doitDessiner(now)   // false une image sur deux en mode 30 i/s
 */
export class GestionnairePerf {
  constructor(opts = {}) {
    this.nom = opts.nom || 'jeu';
    this.opts = opts;
    this.niveau = opts.niveauInitial ?? (appareil.iphone ? 1 : 2);
    this.mode30 = !!opts.mode30;
    this.actif = true;          // page visible
    this.detruit = false;
    this.raf = 0;
    this.fonctionBoucle = null;
    this.minuteries = new Set();
    this.intervalles = new Set();
    this.desabonnements = [];
    this.mesures = { cumul: 0, images: 0, lentes: 0, rapides: 0 };
    this.derniereImage = 0;
    this.typeDemarrage = diagnosticDemarrage(this.nom);

    const vis = () => {
      if (document.visibilityState === 'hidden') this._pause('arriere-plan');
      else this._reprise('premier-plan');
    };
    this.ecouter(document, 'visibilitychange', vis);
    this.ecouter(window, 'pagehide', (e) => {
      this._sauver('pagehide');
      this._pause('pagehide');
      if (!e.persisted) finPropre(this.nom);
      journal('pagehide', this.nom + (e.persisted ? ' (mise en cache)' : ''));
    });
    this.ecouter(window, 'pageshow', (e) => {
      if (e.persisted) { journal('pageshow', this.nom + ' restauré du cache'); try { sessionStorage.setItem('kw-actif-' + this.nom, String(Date.now())); } catch (er) { /* rien */ } }
      this._reprise(e.persisted ? 'bfcache' : 'pageshow');
    });
    // Chrome / Android : gel de la page
    this.ecouter(document, 'freeze', () => { this._sauver('freeze'); this._pause('gel'); });
    this.ecouter(document, 'resume', () => this._reprise('reprise'));
    // Sauvegarde régulière (léger) pendant le jeu
    if (opts.surSauvegarde) this.intervalle(() => { if (this.actif) this._sauver('minuterie'); }, opts.intervalleSauvegarde || 5000);
    // Avertissements de mémoire faible (rares, mais utiles quand ils existent)
    this.ecouter(window, 'error', (e) => { if (e && e.message && /memory|mémoire|context/i.test(e.message)) journal('erreur', e.message); });
  }

  // ----- cycle de vie -----
  _pause(raison) {
    if (!this.actif && raison !== 'pagehide') return;
    this.actif = false;
    if (raison !== 'pagehide') this._sauver(raison);
    try { this.opts.surPause && this.opts.surPause(raison); } catch (e) { console.error(e); }
  }
  _reprise(raison) {
    if (this.actif || this.detruit || document.visibilityState === 'hidden') return;
    this.actif = true;
    this.derniereImage = 0;
    this.mesures = { cumul: 0, images: 0, lentes: 0, rapides: 0 }; // les images du retour ne comptent pas
    try { this.opts.surReprise && this.opts.surReprise(raison); } catch (e) { console.error(e); }
  }
  _sauver(raison) { try { this.opts.surSauvegarde && this.opts.surSauvegarde(raison); } catch (e) { console.error(e); } }
  sauverMaintenant(raison = 'demande') { this._sauver(raison); }

  // ----- ressources suivies (pour éviter toute accumulation) -----
  ecouter(cible, type, f, options) {
    cible.addEventListener(type, f, options);
    const d = () => cible.removeEventListener(type, f, options);
    this.desabonnements.push(d);
    return d;
  }
  minuterie(f, ms) {
    const id = setTimeout(() => { this.minuteries.delete(id); if (!this.detruit) f(); }, ms);
    this.minuteries.add(id);
    return id;
  }
  intervalle(f, ms) { const id = setInterval(f, ms); this.intervalles.add(id); return id; }

  /** Démarre LA boucle d'animation du jeu (une nouvelle remplace l'ancienne). */
  boucle(f) {
    this.fonctionBoucle = f;
    if (this.raf) cancelAnimationFrame(this.raf);
    const tour = (now) => {
      if (this.detruit) return;
      this.raf = requestAnimationFrame(tour);
      if (!this.actif) return;          // arrière-plan : on ne calcule rien
      if (!this.doitDessiner(now)) return;
      this.fonctionBoucle && this.fonctionBoucle(now);
    };
    this.raf = requestAnimationFrame(tour);
  }
  arreterBoucle() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; }

  /**
   * À appeler à chaque image (rAF) : renvoie false si l'image doit être sautée (mode 30 i/s)
   * et mesure la fluidité.
   */
  doitDessiner(now = performance.now()) {
    const ecart = this.derniereImage ? now - this.derniereImage : 16.7;
    if (this.mode30 && ecart < 30) return false;
    this.derniereImage = now;
    this._mesurer(Math.min(ecart, 250) / 1000);
    return true;
  }

  _mesurer(dt) {
    if (this.opts.qualiteAuto === false) return;
    const m = this.mesures;
    m.cumul += dt; m.images++;
    if (m.cumul < 2.5) return;
    const ips = m.images / m.cumul;
    const cible = this.mode30 ? 26 : 45;
    if (ips < cible) { m.lentes++; m.rapides = 0; } else if (ips > (this.mode30 ? 29 : 57)) { m.rapides++; m.lentes = 0; } else { m.lentes = 0; m.rapides = 0; }
    m.cumul = 0; m.images = 0;
    if (m.lentes >= 2) { m.lentes = 0; this.baisser(ips); }
    // Remontée prudente : seulement de 30 i/s vers 60 i/s quand tout est très fluide longtemps
    if (m.rapides >= 12 && this.mode30 && this.niveau === 0 && !appareil.iphone) { m.rapides = 0; this.mode30 = false; journal('qualite', this.nom + ' : retour à 60 i/s'); this._notifierQualite(); }
  }
  baisser(ips = 0) {
    if (this.niveau > 0) { this.niveau--; journal('qualite', `${this.nom} : niveau ${this.niveau} (${Math.round(ips)} i/s)`); }
    else if (!this.mode30) { this.mode30 = true; journal('qualite', `${this.nom} : mode 30 i/s (${Math.round(ips)} i/s)`); }
    else return;
    this._notifierQualite();
  }
  _notifierQualite() { try { this.opts.surQualite && this.opts.surQualite(this.niveau, this.mode30); } catch (e) { console.error(e); } }

  // ----- WebGL -----
  /**
   * Surveille la perte du contexte graphique d'un canvas WebGL.
   * perdu()    : le jeu se met en pause (le rendu s'arrête de lui-même)
   * restaure() : reconstruire ce qui vit dans la carte graphique (environnement PMREM…)
   * secours()  : appelé si le contexte ne revient pas (affiche une aide, sans recharger tout seul)
   */
  surveillerContexte(canvas, { perdu, restaure, secours, delai = 5000 } = {}) {
    let attente = 0;
    this.ecouter(canvas, 'webglcontextlost', (e) => {
      e.preventDefault(); // indispensable pour que le navigateur puisse rendre le contexte
      journal('webgl-perdu', this.nom);
      try { perdu && perdu(); } catch (er) { console.error(er); }
      clearTimeout(attente);
      const verifier = () => {
        if (this.detruit) return;
        // Tant que la page est cachée, on attend son retour avant de déclencher le secours.
        if (document.visibilityState === 'hidden') { attente = setTimeout(verifier, 1000); return; }
        journal('webgl-non-restaure', this.nom);
        try { secours && secours(); } catch (er) { console.error(er); }
      };
      attente = setTimeout(verifier, delai);
    }, false);
    this.ecouter(canvas, 'webglcontextrestored', () => {
      clearTimeout(attente);
      journal('webgl-restaure', this.nom);
      try { restaure && restaure(); } catch (er) { console.error(er); }
    }, false);
  }

  detruire() {
    if (this.detruit) return;
    this._sauver('fermeture');
    this.detruit = true;
    this.arreterBoucle();
    this.minuteries.forEach(clearTimeout); this.minuteries.clear();
    this.intervalles.forEach(clearInterval); this.intervalles.clear();
    this.desabonnements.forEach((d) => d()); this.desabonnements = [];
    finPropre(this.nom);
    journal('fermeture', this.nom);
  }
}

// ---------------------------------------------------------------------
// 5. Petits outils
// ---------------------------------------------------------------------
/** Libère vraiment la mémoire d'un canvas (iOS ne la rend pas tant que la taille reste). */
export function libererCanvas(c) {
  if (!c) return;
  try { c.width = 0; c.height = 0; } catch (e) { /* rien */ }
  try { c.remove && c.remove(); } catch (e) { /* rien */ }
}

/** Réveille un AudioContext suspendu ou « interrompu » (appel, verrouillage sur iOS). */
export function reveillerAudio(ctx) {
  if (ctx && ctx.state !== 'running' && ctx.state !== 'closed') { try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* rien */ } }
}
export function endormirAudio(ctx) {
  if (ctx && ctx.state === 'running') { try { const p = ctx.suspend(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* rien */ } }
}

/**
 * Panneau d'aide quand l'affichage 3D ne revient pas. Aucun rechargement automatique :
 * le joueur choisit, et sa progression est déjà enregistrée.
 */
export function afficherSecours({ titre = "L'affichage du jeu s'est interrompu", texte = "L'iPhone a libéré la mémoire graphique pendant que le jeu était en pause. Ta progression est enregistrée.", bouton = "Relancer l'affichage", action } = {}) {
  if (typeof document === 'undefined' || document.getElementById('kw-secours')) return;
  const voile = document.createElement('div');
  voile.id = 'kw-secours';
  voile.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(10,12,30,.82);padding:24px;font-family:Nunito,system-ui,sans-serif';
  const carte = document.createElement('div');
  carte.style.cssText = 'max-width:340px;background:#fff8ea;color:#1b1a2e;border-radius:22px;padding:22px 22px 18px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4)';
  const h = document.createElement('h2'); h.textContent = titre; h.style.cssText = 'margin:0 0 8px;font-size:20px';
  const p = document.createElement('p'); p.textContent = texte; p.style.cssText = 'margin:0 0 16px;font-size:15px;line-height:1.45';
  const b = document.createElement('button'); b.textContent = bouton; b.type = 'button';
  b.style.cssText = 'border:0;border-radius:999px;padding:13px 26px;font:800 17px Nunito,system-ui,sans-serif;background:#ffc928;color:#3a1a04;cursor:pointer';
  b.addEventListener('click', () => { voile.remove(); action && action(); });
  carte.append(h, p, b); voile.appendChild(carte); document.body.appendChild(voile);
}
