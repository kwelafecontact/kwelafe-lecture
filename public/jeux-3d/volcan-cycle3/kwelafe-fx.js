
/*!
 * KwFX — Directeur d'effets Kwélafé  v3.2
 * Kwélafé Production · kwelafeproduction.com
 *
 * Un « cerveau » d'effets pour les jeux Kwélafé (site Kwélafé Lecture et EPUB Apple Books).
 * Le jeu dit seulement CE QUI SE PASSE (bonne réponse, erreur, coupe, niveau, victoire...).
 * KwFX décide lui-même QUELS effets jouer, avec quelle force, quelles couleurs et quels sons,
 * en tenant compte du joueur : sa série, ses erreurs, sa vitesse, la durée de la partie.
 *
 * Utilisation minimale :
 *   <script src="kwelafe-fx.js"><\/script>
 *   const fx = KwFX.init({ theme: 'fruits', public: 'enfant', mode: 'trankil', support: 'web' });
 *   fx.evenement('bonne', { element: carteCliquee });
 *   fx.evenement('erreur', { x: 120, y: 300 });
 *   const d = fx.evenement('coupe', { x, y, couleur: '#F9C74F' });  // d.pepite, d.multiplicateur
 *
 * Vrais bruitages (pack ElevenLabs) : ajouter AVANT ce fichier
 *   <script src="kwelafe-fx-sons.js"><\/script>      (sons intégrés, marche partout, idéal EPUB)
 *   ou passer  KwFX.init({ sonsPack: 'kwfx-sons/' })  (dossier de fichiers .mp3, idéal site web)
 *
 * Nouveautés v2.1 :
 *   const lame = fx.lame();                    // traînée lumineuse sous le doigt (découpe, tracé)
 *   fx.compteur(elScore, score);               // le score défile puis fait « pop »
 *   fx.etoilesFin(3).then(rejouer);            // 1 à 3 étoiles révélées une par une
 *   fx.apparait(carte, 'rebond');  fx.cascade(cartes, 'carte');  fx.disparait(el, 'fondu', { retirer: true })
 *   fx.pause(); fx.reprendre();                // pause automatique quand la page est cachée
 *   Vibrations légères sur Android (option vibrations: false pour couper)
 *
 * Nouveautés v2.2 :
 *   fx.meteo('pluie' | 'orage' | 'cyclone' | 'alize' | null, { force: 1 })   // météo péi avec son
 *   fx.musique(true, { style: 'maloya' | 'sega' | 'trankil' | 'mystere' }); fx.musique(false)
 *   Version EPUB sans JavaScript : feuille kwelafe-fx-sansjs.css (quiz, étoiles, pluie en CSS seul)
 *
 * Nouveautés v2.4 (ombres) :
 *   fx.lumiere({ angle: 135, hauteur: .55, force: .3 })   // une seule lumière pour tout le jeu
 *   fx.ombre(element, .2); fx.soulever(element)          // ombres des éléments, qui suivent la lumière
 *   ombres portées sous les particules et ombres de contact au sol (option ombres: false pour couper)
 *
 * Nouveautés v2.5 (lumière, distance, reflets) :
 *   fx.heure('soir'); fx.rayons(true); const lanterne = fx.sourceLumiere(x, y, { couleur: '#FFC46B' })
 *   fx.profondeur(decor) avec data-kwfx-z="0..1" sur les calques ; fx.miseAuPoint(.8)
 *   fx.brillance(carte); fx.reflet(fruit); fx.reflets({ type: 'eau' })
 *
 * Nouveautés v2.6 (liquides, eau, apesanteur) :
 *   liquides qui se rejoignent (jus, gouttes, flaques) ; fx.joue('plouf') ; fx.joue('blobs') ; fx.fontaine(x, y) ; fx.goutte(x, y)
 *   const mer = fx.eau({ y: .75 }); mer.eclabousser(x, 15); fx.ondulation(x, y); fx.flotter(bateau)
 *   fx.apesanteur(true, { elements: cartes })
 *
 * Nouveautés v2.7 (éclaboussures, fumées, cendres) :
 *   fx.eclabousser(x, y, { type: 'jus', couleur: '#FFB000', angle: -60 }) ; fx.joue('fumeeNoire') ; fx.joue('vapeur')
 *   const fumee = fx.panache(x, y, { type: 'volcan' }); fx.cendres(true); fx.reduireEnCendres(carte); fx.vent(120)
 *
 * Nouveautés v2.8 (météo) :
 *   fx.meteo('orage') éclairs ramifiés qui éclairent la scène ; fx.eclair({ proche: true }) ; fx.meteo('ventFort', { elements: arbres })
 *   fx.meteo('cyclone', { alerte: 'rouge' }) spirale nuageuse, rafales, débris ; gouttes sur la vitre (vitre: false pour couper)
 *
 * Nouveautés v2.9 (transparence et reflets) :
 *   fx.verre(carte, { type: 'givre' }) ; fx.briser(vitre) ; fx.joue('savon') ; fx.joue('eclatsVerre')
 *   fx.refletVivant(bateau) reflet ondulé dans fx.eau ou au sol ; chemin de soleil sur la mer au coucher
 *
 * Nouveautés v3.0 (personnages articulés) :
 *   const ti = fx.personnage({ x: 80, y: 400, taille: 120, cheveux: 'tresses', haut: '#FFB000' })
 *   await ti.marcher(300); await ti.sauter(); ti.courir(50); ti.chuter(); ti.pose('mainsTete' | 'accroupi' | 'joie' | 'salut')
 *
 * Nouveautés v3.1 (aspect des personnages) :
 *   fx.personnage({ peau: 'cannelle', cheveux: 'tresses' | 'queue' | 'longs' | 'frise' | 'court' | 'casquette', motif: 'madras' | 'rayures', matiereBas: 'jean', perles: '#FFD23F' })
 *   ti.habiller({ haut: '#2A9D8F', cheveux: 'queue' }) ; fx.peaux = teintes péi ; les cheveux bougent avec le corps et fx.vent
 *
 * Nouveautés v3.2 (bulles, feuilles, foudre, feu, étincelles, braises) :
 *   const f = fx.feu(x, y, { type: 'bois' | 'bougie' | 'torche' | 'brasier' | 'braises' }) ; f.attiser() ; f.eteindre({ eau: true })
 *   fx.eclair({ proche: true, surface: 'sol' | 'eau', mouille: true }) ; fx.foudroyer(el) ; fx.bruler(el) ; fx.arbre(el).secouer()
 *   fx.souffleBulles(x, y) ; fx.gerbeEtincelles(x, y, { angle: -60 }) ; fx.joue('feuillesBadamier' | 'tourbillonFeuilles' | 'etincellesChaudes' | 'bullesEau')
 *
 * Conseils pour un nouveau jeu :
 *   KwFX.conseiller({ type: 'quiz', theme: 'volcan', public: 'enfant', mode: 'trankil' })
 */
(function (global) {
  'use strict';

  /* ======================================================================
   * 1. THÈMES : palettes et « signatures » d'effets
   * ==================================================================== */
  var THEMES = {
    reunion: { nom: 'La Réunion (couleurs du drapeau)',
      couleurs: ['#1E5AA8', '#FFD23F', '#E63946', '#2A9D5C', '#FFFFFF'], doux: ['#9EC5FF', '#FFE8A3', '#BDE7CF'],
      sig: { succes: ['eclat', 'etoiles', 'confettis'], grand: ['confettis', 'anneau'], erreur: ['poussiere'], victoire: ['feu', 'pluie'], ambiance: 'etoiles' } },
    volcan: { nom: 'Volcan (Piton de la Fournaise)',
      couleurs: ['#FF4D00', '#FF8C00', '#FFD23F', '#B3001B', '#FFF1C1'], doux: ['#FFB38A', '#FFD9B3', '#E9C2A6'],
      sig: { succes: ['braises', 'etincelles', 'eclat'], grand: ['eruption', 'anneau'], erreur: ['fumee'], victoire: ['eruption', 'feu'], ambiance: 'braises' } },
    lagon: { nom: 'Lagon et océan',
      couleurs: ['#00B4D8', '#48CAE4', '#90E0EF', '#0077B6', '#FFFFFF'], doux: ['#CAF0F8', '#ADE8F4', '#E0FBFC'],
      sig: { succes: ['bulles', 'eclat', 'anneau'], grand: ['vague', 'bulles'], erreur: ['bulles'], victoire: ['vague', 'pluie'], ambiance: 'bulles' } },
    fruits: { nom: 'Fruits et légumes péi',
      couleurs: ['#F94144', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B'], doux: ['#FFD6A5', '#FDFFB6', '#CAFFBF'],
      sig: { succes: ['jus', 'eclat', 'etoiles'], grand: ['jus', 'anneau', 'confettis'], erreur: ['poussiere'], victoire: ['pluie', 'feu'], ambiance: 'feuilles' } },
    flore: { nom: 'Fleurs et plantes',
      couleurs: ['#E63973', '#FF6FA5', '#FFB3C6', '#F9C74F', '#52B788'], doux: ['#FFE5EC', '#FFC2D1', '#D8F3DC'],
      sig: { succes: ['petales', 'etoiles'], grand: ['petales', 'anneau'], erreur: ['poussiere'], victoire: ['petales', 'pluie'], ambiance: 'petales' } },
    oiseaux: { nom: 'Oiseaux et forêt',
      couleurs: ['#FFFFFF', '#F1F1E6', '#FFD23F', '#2A9D5C', '#74C69D'], doux: ['#FFFFFF', '#E9F5DB', '#FFF3B0'],
      sig: { succes: ['plumes', 'eclat'], grand: ['plumes', 'anneau'], erreur: ['poussiere'], victoire: ['plumes', 'pluie'], ambiance: 'plumes' } },
    lontan: { nom: 'Lontan et patrimoine',
      couleurs: ['#C9A227', '#E9C46A', '#B5835A', '#8C5E3C', '#FFF3D6'], doux: ['#F4E3B5', '#EAD7C3', '#FFF8E7'],
      sig: { succes: ['poussiereOr', 'etoiles'], grand: ['pepite', 'anneau'], erreur: ['poussiere'], victoire: ['pluie', 'etoiles'], ambiance: 'poussiereOr' } },
    noel: { nom: 'Noël péi (flamboyants et letchis)',
      couleurs: ['#D62828', '#F77F00', '#FCBF49', '#2A9D5C', '#FFFFFF'], doux: ['#FFCCD5', '#FFE5B4', '#D8F3DC'],
      sig: { succes: ['etoiles', 'eclat'], grand: ['petales', 'anneau'], erreur: ['poussiere'], victoire: ['feu', 'pluie'], ambiance: 'etoiles' } },
    mystere: { nom: 'Mystère et frisson',
      couleurs: ['#7B2CBF', '#9D4EDD', '#C77DFF', '#3C096C', '#E0AAFF'], doux: ['#E0AAFF', '#CDB4DB', '#BDB2FF'],
      sig: { succes: ['etincelles', 'anneau'], grand: ['eclat', 'anneau'], erreur: ['fumee'], victoire: ['etincelles', 'feu'], ambiance: 'brume' } }
  };

  /* Messages en créole réunionnais (graphie de l'Académie de La Réunion), ton doux et encourageant */
  var MESSAGES = {
    serie: ['Lé bon !', 'Bravo !', 'Lé for !', 'Gayar !', 'Tro for !', 'Ou lé o top !', 'Kontinyé !'],
    encourage: ['Pa grav, éséy ankor !', 'Dousman, ou lé prèsk !', 'Kontinyé, lé bon !'],
    pepite: ['Pépit !', 'Gro bonus !', 'Lé rar sa !'],
    victoire: ['Ou la gagné !', 'Bravo, ou lé o top !', 'Gayar !'],
    defaite: ['Ou la fé byin !', 'Éséy ankor !'],
    presque: ['Prèsk !', 'Lé pa lwin !'],
    debut: ['Alon zoué !'],
    record: ['Nouvo rékor !']
  };

  var PUBLICS = {
    'petit': { nom: 'Enfant 3-6 ans', force: 0.7, secousse: 0, texte: 1.25, son: 0.6 },
    'enfant': { nom: 'Enfant 7-12 ans', force: 0.9, secousse: 0.5, texte: 1.1, son: 0.8 },
    'ado': { nom: 'Ado', force: 1.05, secousse: 1, texte: 1, son: 0.9 },
    'adulte': { nom: 'Adulte', force: 1, secousse: 0.9, texte: 0.95, son: 0.85 }
  };
  var MODES = {
    trankil: { nom: 'Mi vé zoué trankil', force: 0.8, combo: 0.7 },
    probleme: { nom: 'Mi rode problèm', force: 1.15, combo: 1.3 }
  };

  /* ======================================================================
   * 2. OUTILS
   * ==================================================================== */
  function hasard(a, b) { return a + Math.random() * (b - a); }
  function choisir(t) { return t[(Math.random() * t.length) | 0]; }
  function borne(v, a, b) { return v < a ? a : v > b ? b : v; }
  function maintenant() { return (global.performance && performance.now) ? performance.now() : Date.now(); }
  function versRgb(hex) {
    var h = String(hex || '#ffffff').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function eclaircir(hex, k) {
    var c = versRgb(hex);
    return 'rgb(' + c.map(function (v) { return Math.round(v + (255 - v) * k); }).join(',') + ')';
  }

  /* ======================================================================
   * 3. MOTEUR DE PARTICULES v2 (architecture inspirée de Niagara / VFX Graph)
   *    Système  -> plusieurs émetteurs (couches)
   *    Émetteur -> pile de modules : apparition, forces, courbes, collisions, événements, rendu
   *    Réserve mémoire en tableaux typés (aucun déchet mémoire, 60 images/s visées)
   *    Rendu WebGL2 instancié + bloom, repli automatique en Canvas 2D
   * ==================================================================== */
  var SPRITES = { doux: 0, etoile: 1, anneau: 2, etincelle: 3, rect: 4, petale: 5, plume: 6, piece: 7, fumee: 8, bulle: 9, goutte: 10, volute: 13, verre: 14 };
  var SPRITE_FLIP = { 4: 1, 5: 1, 6: 1, 7: 1 }; // formes qui « tournent sur elles-mêmes » (effet 3D)

  /* --- bruit et bruit curl (champ de vitesse sans divergence : tourbillons naturels) --- */
  function hash2(i, j) { var h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function bruit(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  var CURL = [0, 0];
  function curl(x, y) { var e = 0.07; CURL[0] = (bruit(x, y + e) - bruit(x, y - e)) / (2 * e); CURL[1] = -(bruit(x + e, y) - bruit(x - e, y)) / (2 * e); return CURL; }

  /* --- courbes et dégradés « sur la durée de vie » --- */
  function courbe(k, t) { if (!k) return 1; var n = k.length - 1; if (n <= 0) return k[0]; var f = t * n, i = Math.min(n - 1, f | 0), r = f - i; return k[i] + (k[i + 1] - k[i]) * r; }
  function compileDegrade(stops) { return stops ? stops.map(function (s) { return s === 'base' ? null : versRgb(s); }) : null; }
  var COUL = [0, 0, 0];
  function degrade(g, t, br, bg, bb) {
    var n = g.length - 1, f = t * n, i = Math.min(n - 1, f | 0), r = f - i;
    var a = g[i] || [br, bg, bb], b = g[i + 1] || [br, bg, bb];
    COUL[0] = a[0] + (b[0] - a[0]) * r; COUL[1] = a[1] + (b[1] - a[1]) * r; COUL[2] = a[2] + (b[2] - a[2]) * r; return COUL;
  }
  function plage(v) { return typeof v === 'number' ? v : hasard(v[0], v[1]); }

  /* --- compilation d'un émetteur : on prépare tout une fois pour toutes --- */
  function compileEmetteur(e) {
    var c = {};
    for (var k in e) c[k] = e[k];
    c.sp = SPRITES[e.sprite || 'doux'];
    c.add = e.melange === 'add';
    c.grad = compileDegrade(e.couleurVie);
    c.frein = e.frein || 0; c.gravite = e.gravite || 0;
    c.vie = e.vie || [0.6, 1]; c.taille = e.taille || [3, 5]; c.vitesse = e.vitesse || [0, 0];
    c.flip = !!SPRITE_FLIP[c.sp];
    if (!c.alphaVie) c.alphaVie = [1, 1, 1, 0];
    return c;
  }

  var TRACE = 10; // points mémorisés par particule pour les rubans de traînée

  function Moteur(fx) {
    this.fx = fx; this.temps = 1; this.tempsCible = 1; this.gravite = 1; this.apes = 0; this.vent = 0; this.qualite = 1; this.dtMoy = 16; this.fps = 60;
    this.actif = false; this.dernier = 0; this.horloge = 0; this.ambiances = [];
    var cap = this.cap = fx.opt.support === 'epub' ? 2500 : 9000;
    this.n = 0;
    var F = function () { return new Float32Array(cap); };
    this.X = F(); this.Y = F(); this.VX = F(); this.VY = F(); this.AGE = F(); this.VIE = F(); this.T = F();
    this.ROT = F(); this.VR = F(); this.R = F(); this.G = F(); this.B = F(); this.GR = F(); this.OX = F(); this.OY = F();
    this.EM = new Uint16Array(cap); this.FL = new Uint8Array(cap);
    this.TRX = new Float32Array(cap * TRACE); this.TRY = new Float32Array(cap * TRACE); this.TRN = new Uint8Array(cap);
    this.defs = []; this.defsIdx = {};
    // tampons de rendu
    this.inst = new Float32Array(cap * 10); this.instLiq = new Float32Array(cap * 10); this.nL = 0; this.instAdd = new Float32Array(cap * 10); this.instSol = new Float32Array(cap * 10); this.nS = 0; this.ruban = new Float32Array(cap * TRACE * 6 * 6);
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (fx.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9998';
    fx.conteneur.appendChild(c); this.c = c;
    this.rendu = null;
    if (fx.opt.rendu !== 'canvas') { try { this.rendu = new RenduGL(this, c, fx.opt.bloom == null ? fx.opt.support !== 'epub' : fx.opt.bloom); } catch (e) { this.rendu = null; } }
    if (!this.rendu) this.rendu = new RenduCanvas(this, c);
    var self = this;
    c.addEventListener('webglcontextlost', function (ev) { ev.preventDefault(); var n = document.createElement('canvas'); n.style.cssText = c.style.cssText; c.replaceWith(n); self.c = n; self.rendu = new RenduCanvas(self, n); self.redim(); });
    this.redim();
    if (global.ResizeObserver && !fx.plein) { this.ro = new ResizeObserver(function () { self.redim(); }); this.ro.observe(fx.conteneur); }
    global.addEventListener('resize', function () { self.redim(); });
    this.boucle = function (t) { self.image(t); };
  }
  Object.defineProperty(Moteur.prototype, 'liste', { get: function () { return { length: this.n }; } });
  Moteur.prototype.redim = function () {
    var r = this.fx.taille(), dpr = Math.min(global.devicePixelRatio || 1, this.qualite < 0.6 ? 1 : 2);
    this.L = r.l; this.H = r.h; this.dpr = dpr;
    this.c.width = Math.max(1, Math.round(r.l * dpr)); this.c.height = Math.max(1, Math.round(r.h * dpr));
    this.rendu.redim(this.c.width, this.c.height, dpr);
  };
  Moteur.prototype.def = function (cle, e) {
    if (this.defsIdx[cle] != null) return this.defsIdx[cle];
    this.defs.push(compileEmetteur(e)); return (this.defsIdx[cle] = this.defs.length - 1);
  };
  Moteur.prototype.demarre = function () { if (!this.actif) { this.actif = true; this.dernier = 0; requestAnimationFrame(this.boucle); } };

  /* --- point de départ selon la forme d'émission --- */
  Moteur.prototype.depart = function (d, x, y, o) {
    var z = d.zone || 'point', r = (d.rayon || 0) * (o.echelle || 1), s = this.fx.zoneSure();
    if (z === 'cercle') { var a = Math.random() * 6.283, rr = r * Math.sqrt(Math.random()); return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; }
    if (z === 'anneau') { var b = Math.random() * 6.283; return [x + Math.cos(b) * r, y + Math.sin(b) * r]; }
    if (z === 'ligne') return [x + hasard(-r, r), y];
    if (z === 'ecran-haut') return [hasard(-20, this.L + 20), -15];
    if (z === 'ecran-bas') return [hasard(s.x1, s.x2), this.H + 10];
    if (z === 'ecran') return [hasard(0, this.L), hasard(0, this.H)];
    if (z === 'ecran-bas-sur') return [hasard(s.x1, s.x2), s.y2];
    return [x, y];
  };

  /* --- émission d'un émetteur (rafale) --- */
  Moteur.prototype.emettre = function (di, x, y, k, o, nb, herite) {
    var d = this.defs[di], col = o.couleurs || this.fx.theme.couleurs;
    for (var j = 0; j < nb; j++) {
      if (this.n >= this.cap) return;
      var i = this.n++, p = this.depart(d, x, y, o);
      var ang, sp = plage(d.vitesse) * (0.65 + 0.55 * k), vieFixe = 0;
      if (d.hauteur && d.gravite > 0) { var hh = plage(d.hauteur) * (p[1] - 10); sp = Math.sqrt(2 * d.gravite * Math.max(40, hh)); vieFixe = sp / d.gravite; }
      if (d.cone) ang = (d.cone[0] + hasard(-d.cone[1] / 2, d.cone[1] / 2)) * Math.PI / 180;
      else if (d.radial && (p[0] !== x || p[1] !== y)) ang = Math.atan2(p[1] - y, p[0] - x);
      else ang = Math.random() * 6.283;
      this.X[i] = p[0]; this.Y[i] = p[1]; this.OX[i] = x; this.OY[i] = y;
      this.VX[i] = Math.cos(ang) * sp + (d.heriteVitesse && herite ? herite[3] * d.heriteVitesse : 0);
      this.VY[i] = Math.sin(ang) * sp + (d.heriteVitesse && herite ? herite[4] * d.heriteVitesse : 0);
      this.AGE[i] = -(d.etale ? Math.random() * d.etale : 0); this.VIE[i] = vieFixe || plage(d.vie);
      this.T[i] = plage(d.taille) * (o.taille || 1);
      this.ROT[i] = d.rotation ? plage(d.rotation) * Math.PI / 180 : Math.random() * 6.283;
      this.VR[i] = d.rotVitesse ? plage(d.rotVitesse) * Math.PI / 180 : 0;
      var c;
      if (herite && d.heriteCouleur) c = [herite[0], herite[1], herite[2]];
      else if (d.couleur === 'fruit') c = versRgb(o.couleur || col[0]);
      else if (d.couleur === 'palette' || !d.couleur) c = versRgb(o.couleur && d.couleurFruit ? o.couleur : choisir(col));
      else if (Array.isArray(d.couleur)) c = versRgb(choisir(d.couleur));
      else c = versRgb(d.couleur);
      if (d.variation) { var vv = hasard(-d.variation, d.variation); c = c.map(function (u) { return borne(u + vv * 255, 0, 255); }); }
      this.R[i] = c[0]; this.G[i] = c[1]; this.B[i] = c[2];
      this.GR[i] = Math.random(); this.EM[i] = di; this.FL[i] = 0; this.TRN[i] = 0;
    }
    this.demarre();
  };

  /* --- lance un système complet (toutes ses couches) --- */
  Moteur.prototype.systeme = function (nom, x, y, k, o, herite, profondeur) {
    var sys = SYSTEMES[nom]; if (!sys) return;
    o = o || {}; profondeur = profondeur || 0; if (profondeur > 3) return;
    var self = this, force = this.fx.pub.force;
    sys.forEach(function (e, idx) {
      var di = self.def(nom + ':' + idx, e);
      var base = e.nb || 0, n = e.fixe ? base : Math.round(base * (0.45 + k) * force * self.qualite);
      if (base > 0 && n < 1) n = 1;
      if (e.delai) setTimeout(function () { self.emettre(di, x, y, k, o, n, herite); }, e.delai * 1000);
      else self.emettre(di, x, y, k, o, n, herite);
    });
  };

  /* --- ambiances : émetteurs continus (débit par seconde) --- */
  Moteur.prototype.lancerAmbiance = function (nom) {
    var self = this;
    this.ambiances = nom && AMBIANCES[nom] ? AMBIANCES[nom].map(function (e, i) { return { di: self.def('amb:' + nom + ':' + i, e), debit: e.debit || 1, acc: 0 }; }) : [];
    if (this.ambiances.length) this.demarre();
  };

  /* --- cible des pièces (score du jeu) --- */
  Moteur.prototype.cibleScore = function () {
    var el = this.fx.opt.cibleScore; if (!el || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect(), b = this.fx.plein ? { left: 0, top: 0 } : this.fx.conteneur.getBoundingClientRect();
    return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top];
  };

  Moteur.prototype.tuer = function (i) {
    var l = --this.n; if (i === l) return;
    this.X[i] = this.X[l]; this.Y[i] = this.Y[l]; this.VX[i] = this.VX[l]; this.VY[i] = this.VY[l]; this.AGE[i] = this.AGE[l]; this.VIE[i] = this.VIE[l];
    this.T[i] = this.T[l]; this.ROT[i] = this.ROT[l]; this.VR[i] = this.VR[l]; this.R[i] = this.R[l]; this.G[i] = this.G[l]; this.B[i] = this.B[l];
    this.GR[i] = this.GR[l]; this.OX[i] = this.OX[l]; this.OY[i] = this.OY[l]; this.EM[i] = this.EM[l]; this.FL[i] = this.FL[l]; this.TRN[i] = this.TRN[l];
    if (this.TRN[l]) { var a = i * TRACE, b = l * TRACE; for (var q = 0; q < TRACE; q++) { this.TRX[a + q] = this.TRX[b + q]; this.TRY[a + q] = this.TRY[b + q]; } }
  };

  /* --- simulation d'une image --- */
  Moteur.prototype.image = function (t) {
    var dtms = this.dernier ? Math.min(50, t - this.dernier) : 16; this.dernier = t;
    // qualité adaptative (comme le « scalability » des moteurs) : moins de particules, puis plus de bloom, puis résolution réduite
    this.dtMoy = this.dtMoy * 0.92 + dtms * 0.08; this.fps = Math.round(1000 / this.dtMoy);
    var q0 = this.qualite;
    if (this.dtMoy > 24) this.qualite = Math.max(0.3, this.qualite - 0.01); else if (this.dtMoy < 18) this.qualite = Math.min(1, this.qualite + 0.003);
    if ((q0 >= 0.6) !== (this.qualite >= 0.6)) this.redim();
    this.temps += (this.tempsCible - this.temps) * 0.12;
    var dt = dtms / 1000 * this.temps; this.horloge += dt;
    // ambiances
    for (var a = 0; a < this.ambiances.length; a++) {
      var am = this.ambiances[a]; am.acc += am.debit * dt * this.qualite;
      while (am.acc >= 1) { am.acc -= 1; this.emettre(am.di, 0, 0, 0.5, {}, 1); }
    }
    var cible = null, cibleLue = false, morts = [];
    var H = this.H, sz = this.fx.zoneSure();
    for (var i = 0; i < this.n; i++) {
      var d = this.defs[this.EM[i]];
      this.AGE[i] += dt * (1 - 0.65 * this.apes);
      if (this.AGE[i] < 0) continue;
      if (this.AGE[i] >= this.VIE[i]) { morts.push(i); continue; }
      var tv = this.AGE[i] / this.VIE[i], vx = this.VX[i], vy = this.VY[i];
      // forces
      vy += d.gravite * dt * this.gravite;
      if (this.apes) { var cw = curl(this.X[i] * 0.004 + this.horloge * 0.15, this.Y[i] * 0.004 + this.GR[i]); vx += cw[0] * 70 * this.apes * dt; vy += (cw[1] * 70 - 6) * this.apes * dt; var fa = Math.exp(-0.9 * this.apes * dt); vx *= fa; vy *= fa; }
      if (this.vent && d.vent) { var vw = this.vent * d.vent * (1 + 0.4 * Math.sin(this.horloge * 0.9 + this.Y[i] * 0.005)); vx += (vw - vx) * Math.min(1, (d.ventPrise || 1.2) * dt); }
      if (d.curl) { var cf = d.curl.freq || 0.01, cv = curl(this.X[i] * cf + this.horloge * (d.curl.vitesse || 0.3), this.Y[i] * cf + this.GR[i] * 3); vx += cv[0] * d.curl.force * dt; vy += cv[1] * d.curl.force * dt; }
      if (d.vortex) { var ox = this.X[i] - this.OX[i], oy = this.Y[i] - this.OY[i], od = Math.hypot(ox, oy) + 1; vx += -oy / od * d.vortex * dt; vy += ox / od * d.vortex * dt; }
      if (d.attracteur) { var axx = this.OX[i] - this.X[i], ayy = this.OY[i] - this.Y[i], ad = Math.hypot(axx, ayy) + 1; vx += axx / ad * d.attracteur * dt; vy += ayy / ad * d.attracteur * dt; }
      if (d.frein) { var fr = Math.exp(-d.frein * dt); vx *= fr; vy *= fr; }
      if (d.versCible && tv > d.versCible.apres) {
        if (!cibleLue) { cible = this.cibleScore(); cibleLue = true; }
        if (cible) {
          var dx = cible[0] - this.X[i], dy = cible[1] - this.Y[i], dd = Math.hypot(dx, dy);
          var vmax = d.versCible.vitesse || 1400, st = Math.min(1, (d.versCible.force || 8) * dt);
          vx += (dx / (dd + 1) * vmax - vx) * st; vy += (dy / (dd + 1) * vmax - vy) * st;
          if (dd < 22) { this.fx.arrivee(); morts.push(i); continue; }
          this.AGE[i] = Math.min(this.AGE[i], this.VIE[i] * 0.95);
        }
      }
      var x = this.X[i] + vx * dt, y = this.Y[i] + vy * dt;
      if (d.ondule) x += Math.sin(this.AGE[i] * d.ondule + this.GR[i] * 6.283) * (d.amplitude || 20) * dt;
      if (d.feuille) {
        var auSol = d.sol && this.Y[i] >= sz.y2 + 4 && Math.abs(vy) < 40, fp = this.AGE[i] * (d.feuille.balance || 2.4) + this.GR[i] * 6.283, fa2 = (d.feuille.ampl || 44) * (auSol ? 0 : 1);
        x += Math.cos(fp) * fa2 * dt; y -= Math.cos(2 * fp) * fa2 * 0.35 * dt;
        if (!auSol) this.ROT[i] = Math.sin(fp) * 0.75 + (this.GR[i] - 0.5) * 1.2 + (d.rotVitesse ? this.VR[i] * this.AGE[i] * Math.min(1, Math.abs(this.vent) / 400) : 0);
        else { this.ROT[i] += (Math.PI / 2 * (this.GR[i] < 0.5 ? 1 : -1) - this.ROT[i]) * Math.min(1, dt * 4); if (Math.abs(this.vent) > 200 && Math.random() < dt * 0.7 * this.GR[i]) { vy = -hasard(60, 220); this.VY[i] = vy; y = this.Y[i] - 2; } }
      }
      // collision avec le sol (rebond, frottement, événement)
      if (d.sol) {
        var solY = d.sol.decalage != null ? this.OY[i] + d.sol.decalage : sz.y2 + 6;
        if (solY > H + 30) solY = H - 4;
        if (y > solY && vy > 0) {
          y = solY;
          if (!(this.FL[i] & 1) && d.sol.sous) { this.FL[i] |= 1; this.evenement(d.sol.sous, x, y, i); }
          if (d.sol.mort) { this.X[i] = x; this.Y[i] = y; morts.push(i); continue; }
          vy = -vy * (d.sol.rebond || 0.3); vx *= d.sol.friction || 0.7;
          if (Math.abs(vy) < 25) vy = 0;
        }
      }
      this.X[i] = x; this.Y[i] = y; this.VX[i] = vx; this.VY[i] = vy;
      this.ROT[i] += this.VR[i] * dt;
      if (d.traine) {
        var b0 = i * TRACE, nT = this.TRN[i];
        if (nT < TRACE) this.TRN[i] = ++nT;
        for (var qq = nT - 1; qq > 0; qq--) { this.TRX[b0 + qq] = this.TRX[b0 + qq - 1]; this.TRY[b0 + qq] = this.TRY[b0 + qq - 1]; }
        this.TRX[b0] = x; this.TRY[b0] = y;
      }
    }
    // morts (de la fin vers le début) + sous-émetteurs « à la mort »
    morts.sort(function (p, q) { return q - p; });
    for (var m = 0; m < morts.length; m++) {
      var im = morts[m], dm = this.defs[this.EM[im]];
      if (dm.aLaMort && Math.random() < (dm.proba == null ? 1 : dm.proba) && this.AGE[im] >= this.VIE[im] * 0.9) this.evenement(dm.aLaMort, this.X[im], this.Y[im], im);
      this.tuer(im);
    }
    this.rendu.dessiner();
    if (this.n || this.ambiances.length) requestAnimationFrame(this.boucle);
    else { this.actif = false; this.rendu.effacer(); }
  };
  Moteur.prototype.evenement = function (nom, x, y, i) {
    var h = [this.R[i], this.G[i], this.B[i], this.VX[i], this.VY[i]];
    this.systeme(nom, x, y, 0.6, {}, h, 1);
  };

  /* --- préparation des données de rendu (couleur, taille, alpha selon l'âge) --- */
  Moteur.prototype.preparer = function () {
    var nN = 0, nA = 0, nR = 0, nS = 0, nL = 0, LQ = this.instLiq, liqOK = this.rendu && this.rendu.liq, I = this.inst, A = this.instAdd, RB = this.ruban, S = this.instSol, lu = this.fx.lum, solDefaut = lu.contact ? this.fx.zoneSure().y2 + 6 : 0;
    for (var i = 0; i < this.n; i++) {
      if (this.AGE[i] < 0) continue;
      var d = this.defs[this.EM[i]], tv = this.AGE[i] / this.VIE[i];
      var r = this.R[i], g = this.G[i], b = this.B[i];
      if (d.grad) { var cc = degrade(d.grad, tv, r, g, b); r = cc[0]; g = cc[1]; b = cc[2]; }
      var al = courbe(d.alphaVie, tv) * (d.opacite == null ? 1 : d.opacite);
      if (d.scintille) al *= 0.5 + 0.5 * Math.sin(this.AGE[i] * 22 + this.GR[i] * 40);
      if (al <= 0.004) continue;
      var taille = this.T[i] * courbe(d.tailleVie, tv), vx = this.VX[i], vy = this.VY[i];
      if (d.profondeur && lu.profondeur) { var z = this.GR[i] * d.profondeur, bz = lu.brumeRgb; taille *= 1 - 0.55 * z; al *= 1 - 0.45 * z; r += (bz[0] - r) * 0.5 * z; g += (bz[1] - g) * 0.5 * z; b += (bz[2] - b) * 0.5 * z; }
      var rot = this.ROT[i], et = 0;
      if (d.etirement) { var sp = Math.hypot(vx, vy); et = Math.min(d.etirementMax || 6, sp * d.etirement); rot = Math.atan2(vy, vx); }
      else if (d.aligne) rot = Math.atan2(vy, vx);
      if (d.flip) et = Math.cos(this.AGE[i] * (d.flipVitesse || 9) + this.GR[i] * 6.283); // retournement 3D
      if (d.sp === 9 || d.sp === 16) et = this.AGE[i] + this.GR[i] * 7;
      if (d.feuille && d.flip) et = Math.cos(this.AGE[i] * (d.flipVitesse || 3) * (1 + Math.min(2, Math.abs(this.vent) / 250)) + this.GR[i] * 6.283);
      if (d.liquide && liqOK) { var ol = nL++ * 10; LQ[ol] = this.X[i]; LQ[ol + 1] = this.Y[i]; LQ[ol + 2] = taille * 2.1; LQ[ol + 3] = rot; LQ[ol + 4] = r / 255; LQ[ol + 5] = g / 255; LQ[ol + 6] = b / 255; LQ[ol + 7] = al * (d.liquide === true ? 0.62 : d.liquide); LQ[ol + 8] = 12; LQ[ol + 9] = Math.min(et, 1.2); continue; }
      var T = d.add ? A : I, o = (d.add ? nA++ : nN++) * 10;
      T[o] = this.X[i]; T[o + 1] = this.Y[i]; T[o + 2] = taille; T[o + 3] = rot;
      T[o + 4] = r / 255; T[o + 5] = g / 255; T[o + 6] = b / 255; T[o + 7] = al; T[o + 8] = d.sp + this.GR[i] * 0.9; T[o + 9] = et;
      // ombre de contact : une tache douce au sol, plus nette et plus sombre quand l'objet approche
      if (lu.contact && d.sol && !d.add && taille > 1.2) {
        var solY = d.sol.decalage != null ? this.OY[i] + d.sol.decalage : solDefaut, haut = solY - this.Y[i];
        if (haut > -4 && haut < 260) {
          var kk = 1 - Math.max(0, haut) / 260, os = nS++ * 10;
          S[os] = this.X[i] + this.fx.vecteurOmbre()[0] * (1 - kk) * 2; S[os + 1] = solY + 2; S[os + 2] = taille * (0.45 + 0.5 * (1 - kk)); S[os + 3] = 0;
          S[os + 4] = 0; S[os + 5] = 0; S[os + 6] = 0; S[os + 7] = al * kk * kk * 0.55 * lu.force / 0.3; S[os + 8] = 11; S[os + 9] = 1.6;
        }
      }
      // rubans de traînée
      if (d.traine && this.TRN[i] > 1) {
        var b0 = i * TRACE, nT = this.TRN[i], lw = d.traine.largeur || 2;
        for (var q = 0; q < nT - 1; q++) {
          var x1 = this.TRX[b0 + q], y1 = this.TRY[b0 + q], x2 = this.TRX[b0 + q + 1], y2 = this.TRY[b0 + q + 1];
          var dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
          var w1 = lw * (1 - q / nT), w2 = lw * (1 - (q + 1) / nT), a1 = al * (1 - q / nT), a2 = al * (1 - (q + 1) / nT);
          var pts = [x1 + nx * w1, y1 + ny * w1, a1, x1 - nx * w1, y1 - ny * w1, a1, x2 + nx * w2, y2 + ny * w2, a2, x1 - nx * w1, y1 - ny * w1, a1, x2 - nx * w2, y2 - ny * w2, a2, x2 + nx * w2, y2 + ny * w2, a2];
          for (var v = 0; v < 6; v++) { var ob = nR * 6; RB[ob] = pts[v * 3]; RB[ob + 1] = pts[v * 3 + 1]; RB[ob + 2] = r / 255; RB[ob + 3] = g / 255; RB[ob + 4] = b / 255; RB[ob + 5] = pts[v * 3 + 2]; nR++; }
        }
      }
    }
    this.nN = nN; this.nA = nA; this.nR = nR; this.nS = nS; this.nL = nL;
  };

  /* ======================================================================
   * 3 bis. RENDU WEBGL2 : sprites instanciés, formes calculées dans le shader, bloom
   * ==================================================================== */
  var VS_PART = '#version 300 es\nlayout(location=0) in vec2 coin;layout(location=1) in vec4 a0;layout(location=2) in vec4 a1;layout(location=3) in vec2 a2;' +
    'uniform vec2 res;uniform vec4 ombre;uniform vec4 miroir;uniform vec3 ldir;out vec2 uv;out vec4 col;flat out float forme;out float flip;out float refl;out vec3 lu2;flat out float graine;' +
    'void main(){float s=a0.z*(1.0+ombre.w);vec2 sc;float f=floor(a2.x+0.001);graine=max(a2.x-f,0.0);' +
    'if((f>3.5&&f<7.5)||(f>14.5&&f<15.5)){sc=vec2(s*max(abs(a2.y),0.12),s);flip=a2.y;}else if((f>8.5&&f<9.5)||(f>15.5&&f<16.5)){sc=vec2(s);flip=a2.y;}else{sc=vec2(s*(1.0+a2.y),s);flip=1.0;}' +
    'vec2 p=coin*sc;float c=cos(a0.w),si=sin(a0.w);p=vec2(p.x*c-p.y*si,p.x*si+p.y*c)+a0.xy+ombre.xy*(0.6+a0.z*0.08);refl=1.0;' +
    'if(miroir.w>0.5){float dy=miroir.x-a0.y;refl=a0.y<miroir.x?clamp(1.0-dy/220.0,0.0,1.0):0.0;p.y=2.0*miroir.x-p.y;p.x+=sin(p.y*0.07+miroir.z*2.6)*2.2*miroir.w;p.y+=sin(p.x*0.05+miroir.z*1.7)*1.2;}' +
    'lu2=vec3(ldir.x*c+ldir.y*si,-ldir.x*si+ldir.y*c,ldir.z);vec2 cl=p/res*2.0-1.0;gl_Position=vec4(cl.x,-cl.y,0.0,1.0);uv=coin;col=a1;forme=f;}';
  var FS_PART = '#version 300 es\nprecision mediump float;in vec2 uv;in vec4 col;flat in float forme;in float flip;uniform float amul;uniform highp vec4 ombre;uniform highp vec4 miroir;uniform vec3 teinte;in float refl;in vec3 lu2;flat in float graine;out vec4 o;' +
    'float hs(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}float vn(vec2 q){vec2 i=floor(q),g=fract(q);g=g*g*(3.0-2.0*g);return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),g.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),g.x),g.y);}' +
    'float sq(float x){return x*x;}void main(){vec2 p=uv;float r=length(p);float a=0.0;vec3 c=col.rgb;float f=forme;' +
    'if(f>11.5&&f<12.5){a=exp(-r*r*2.3)*col.a;o=vec4(col.rgb*a,a);return;}' +
    'if(miroir.w>0.5&&(refl<0.002||(f>10.5&&f<12.5))){discard;}' +
    'if(f>10.5&&f<11.5){a=exp(-r*r*2.6)*col.a;o=vec4(teinte*a,a);return;}' +
    'if(ombre.z>0.0&&(f<0.5||(f>1.5&&f<3.5)||(f>7.5&&f<9.5)||(f>12.5&&f<13.5)||(f>15.5&&f<17.5))){discard;}' +
    'if(f>12.5&&f<13.5){float n=vn(p*2.0+3.7)*0.62+vn(p*4.1-1.3)*0.28+vn(p*8.2+5.1)*0.1;float dd=r+(0.5-n)*0.7;a=smoothstep(1.0,0.3,dd);' +
    'vec2 q=p-lu2.xy*0.16;float nl=vn(q*2.0+3.7)*0.62+vn(q*4.1-1.3)*0.28+vn(q*8.2+5.1)*0.1;float rel=clamp((n-nl)*3.2+dot(p,lu2.xy)*0.6,-1.0,1.0);' +
    'c=c*(0.78+0.42*rel)*(1.0-0.15*smoothstep(0.6,0.0,r))+teinte*0.25*max(rel,0.0)*lu2.z;c=max(c,vec3(0.0));}' +
    'else if(f<0.5){a=exp(-r*r*4.0);c=mix(c,vec3(1.0),exp(-r*r*18.0)*0.7);}' +
    'else if(f<1.5){float an=atan(p.y,p.x);float rb=mix(0.42,1.0,pow(abs(cos(2.5*an)),2.2));a=smoothstep(rb,rb-0.14,r)+exp(-r*r*5.0)*0.35;c=mix(c,vec3(1.0),exp(-r*r*14.0)*0.6);}' +
    'else if(f<2.5){a=smoothstep(0.16,0.0,abs(r-0.78))+exp(-pow(r-0.78,2.0)*40.0)*0.4;}' +
    'else if(f<3.5){a=exp(-p.y*p.y*10.0)*smoothstep(1.0,0.1,abs(p.x));c=mix(c,vec3(1.0),exp(-p.y*p.y*40.0)*0.65);}' +
    'else if(f<4.5){vec2 q=abs(p);a=smoothstep(1.0,0.9,q.x)*smoothstep(0.62,0.52,q.y);c*=0.72+0.28*abs(flip);}' +
    'else if(f<5.5){float w=0.62*(1.0-p.y*0.55);a=1.0-smoothstep(0.84,1.0,length(vec2(p.x/max(w,0.05),p.y)));c*=0.8+0.2*(1.0-abs(p.x))+0.12*(-p.y);c*=0.75+0.25*abs(flip);}' +
    'else if(f<6.5){a=1.0-smoothstep(0.8,1.0,length(vec2(p.x/0.36,p.y)));c=mix(c,c*0.55,smoothstep(0.07,0.0,abs(p.x))*0.7);c*=0.88+0.12*sin(p.y*36.0+abs(p.x)*24.0);}' +
    'else if(f<7.5){a=1.0-smoothstep(0.88,1.0,r);c=c*(0.78+0.3*(1.0-r));c=mix(c,c*0.6,smoothstep(0.72,0.8,r)*0.8);c+=vec3(1.0)*exp(-dot(p-vec2(-0.35,-0.35),p-vec2(-0.35,-0.35))*9.0)*0.7;c*=0.7+0.3*abs(flip);}' +
    'else if(f<8.5){a=exp(-r*r*2.4)*(0.82+0.18*sin(p.x*4.0+p.y*5.0));}' +
    'else if(f<9.5){float an=atan(p.y,p.x);float ph=flip;float rr=r*1.07*(1.0+0.035*sin(2.0*an+ph*4.3)+0.025*sin(3.0*an-ph*6.1));' +
    'float th=vn(p*1.7+vec2(ph*0.35+graine*9.0,-ph*0.6))*0.7+vn(p*3.4-vec2(ph*0.5,graine*5.0))*0.3+0.35*rr*rr;' +
    'vec3 iri=0.55+0.45*cos(6.2832*(vec3(0.0,0.33,0.67)+th*2.4+rr*0.8));float fres=pow(smoothstep(0.2,0.99,rr),2.5);' +
    'float rim=smoothstep(0.62,0.975,rr)*smoothstep(1.0,0.955,rr);float edge=smoothstep(0.9,0.985,rr)*smoothstep(1.0,0.985,rr);' +
    'c=mix(c,iri,0.72);a=(rim*0.6+fres*0.18+0.035+edge*0.25)*step(rr,1.0);vec2 hp=lu2.xy*0.48;float hl=exp(-dot(p-hp,p-hp)*26.0);vec2 hq=-hp*0.85;float h2=exp(-dot(p-hq,p-hq)*70.0)*0.35;' +
    'a=min(1.0,a+(hl*0.9+h2)*step(rr,1.0));c=mix(c*(1.0-edge*0.35),vec3(1.0),min(1.0,hl+h2));}' +
    'else if(f>14.5&&f<15.5){float s=(p.y+1.0)*0.5;float kw=mix(0.4,0.66,fract(graine*7.3));float bl=clamp(s/0.86,0.0,1.0);' +
    'float w=kw*pow(sin(3.1416*bl),0.8)*(0.8+0.2*bl)*step(s,0.861)*(1.0-0.07*step(0.55,fract(graine*3.1))*abs(sin(bl*38.0)));' +
    'float ax=abs(p.x);float lame=smoothstep(w,w-0.08,ax);float pet=smoothstep(0.07,0.03,ax)*step(0.8,s)*smoothstep(1.0,0.94,s);a=max(lame,pet);' +
    'float vers=step(flip,0.0);float nerv=smoothstep(0.04,0.0,ax)*step(s,0.9);float lat=smoothstep(0.1,0.0,abs(fract(s*6.5+ax*1.8/max(kw,0.2))-0.5))*step(ax,w*0.85)*smoothstep(0.03,0.09,ax)*step(0.08,s);' +
    'vec3 b2=mix(c,mix(c,vec3(0.86,0.9,0.72),0.38),vers);float nx=sign(p.x)*0.5*(1.0-ax/max(w,0.05));float dif=0.8+0.38*(nx*lu2.x-0.15*lu2.y);' +
    'float spec=(1.0-vers)*pow(max(0.0,1.0-abs(nx-lu2.x*0.5)*2.2),6.0)*0.22*lu2.z;' +
    'c=b2*dif*(1.0-0.22*smoothstep(w*0.55,w+0.001,ax))*(0.72+0.28*abs(flip));c=mix(c,c*1.3+0.05,clamp(nerv*0.7+lat*0.35,0.0,1.0));c+=vec3(spec);}' +
    'else if(f>15.5&&f<16.5){float g=graine*13.0;float n=vn(p*2.2+g)*0.65+vn(p*4.7-g)*0.35;float rr=r+(n-0.5)*0.55;float corps=smoothstep(0.82,0.66,rr);' +
    'float heat=clamp((c.r-0.3)*1.4+(c.g-0.2)*0.6,0.0,1.0);float pul=0.62+0.38*sin(flip*6.0+g*3.0+n*5.0);' +
    'float cr=1.0-abs(vn(p*4.2+g*1.7)*2.0-1.0);cr=cr*cr*cr;float cracks=cr*corps*heat*pul;' +
    'vec3 crust=mix(vec3(0.09,0.05,0.04),c*0.35,0.35+0.3*heat);vec3 rgb=mix(crust,c*1.5+vec3(0.15,0.05,0.0)*heat,clamp(cracks*1.6+heat*0.25*pul,0.0,1.0));' +
    'float halo=exp(-r*r*2.2)*heat*pul*0.55;float rf2=miroir.w>0.5?refl*miroir.y:1.0;' +
    'o=vec4((rgb*corps+c*halo*(1.0-corps))*col.a*rf2,corps*col.a*amul*rf2);return;}' +
    'else if(f>16.5&&f<17.5){float al=(p.x+1.0)*0.5;float w=mix(0.07,0.36,al*al);float core=exp(-p.y*p.y/(w*w)*2.0)*smoothstep(0.0,0.7,al)*smoothstep(1.0,0.8,p.x);' +
    'float head=exp(-(sq(p.x-0.7)*28.0+p.y*p.y*28.0));a=min(1.0,core*0.9+head);c=mix(c,vec3(1.0,0.97,0.9),clamp(head*1.2+al*al*0.45,0.0,1.0));}' +
    'else if(f>13.5&&f<14.5){float d1=dot(p-vec2(0.0,-1.0),normalize(vec2(1.75,-0.9))),d2=dot(p-vec2(0.9,0.75),normalize(vec2(-0.2,1.65))),d3=dot(p-vec2(-0.75,0.55),normalize(vec2(-1.55,-0.75)));float dd=max(d1,max(d2,d3));' +
    'float corps=smoothstep(0.03,-0.02,dd);float bordv=smoothstep(0.1,0.0,abs(dd))*corps;float gl=pow(max(dot(normalize(vec2(0.7,-0.7)),lu2.xy),0.0),4.0);float st=exp(-pow(dot(p,vec2(0.707,0.707))+0.15,2.0)*90.0)*corps;' +
    'a=corps*(0.16+gl*0.45)+bordv*0.85+st*0.4;c=mix(c,vec3(1.0),min(1.0,bordv*0.8+gl*0.7+st));}' +
    'else{a=1.0-smoothstep(0.82,1.0,r);c*=0.82+0.25*(1.0-r);c+=vec3(1.0)*exp(-dot(p-vec2(0.3,-0.35),p-vec2(0.3,-0.35))*16.0)*0.75;}' +
    'a*=col.a;if(ombre.z>0.0){a=(a*0.7+exp(-r*r*1.6)*0.3*step(0.01,a))*ombre.z;o=vec4(teinte*a,a);return;}float rf=miroir.w>0.5?refl*miroir.y:1.0;o=vec4(c*a*rf,a*amul*rf);}';
  var VS_RUBAN = '#version 300 es\nlayout(location=0) in vec2 pos;layout(location=1) in vec4 coul;uniform vec2 res;out vec4 c;void main(){vec2 cl=pos/res*2.0-1.0;gl_Position=vec4(cl.x,-cl.y,0.0,1.0);c=coul;}';
  var FS_RUBAN = '#version 300 es\nprecision mediump float;in vec4 c;out vec4 o;void main(){o=vec4(c.rgb*c.a,c.a*0.35);}';
  var VS_PLEIN = '#version 300 es\nout vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
  var FS_FLOU = '#version 300 es\nprecision mediump float;in vec2 uv;uniform sampler2D tex;uniform vec2 dir;out vec4 o;' +
    'void main(){vec4 s=texture(tex,uv)*0.227;s+=(texture(tex,uv+dir*1.384)+texture(tex,uv-dir*1.384))*0.316;s+=(texture(tex,uv+dir*3.230)+texture(tex,uv-dir*3.230))*0.070;o=s;}';
  var FS_COMPO = '#version 300 es\nprecision mediump float;in vec2 uv;uniform sampler2D tex;uniform float force;out vec4 o;void main(){vec3 c=texture(tex,uv).rgb*force;o=vec4(c,max(c.r,max(c.g,c.b))*0.35);}';

  /* Liquides : seuil sur les taches accumulées -> une surface continue, éclairée par le soleil de KwFX
   * (normale tirée de l'épaisseur, reflet spéculaire, bord plus sombre, cœur plus clair) */
  var FS_LIQ = '#version 300 es\nprecision mediump float;in vec2 uv;uniform sampler2D tex;uniform vec2 px;uniform vec3 ld;uniform vec4 om;uniform vec3 teinte;out vec4 o;' +
    'void main(){if(om.w>0.5){float sa=texture(tex,uv-om.xy).a;float sm=smoothstep(0.3,0.5,sa)*om.z;o=vec4(teinte*sm,sm);return;}' +
    'vec4 t=texture(tex,uv);float a=t.a;float m=smoothstep(0.3,0.46,a);if(m<0.003){discard;}vec3 c=clamp(t.rgb/max(a,0.001),0.0,1.0);' +
    'float ax=texture(tex,uv+vec2(px.x,0.0)).a-texture(tex,uv-vec2(px.x,0.0)).a;float ay=texture(tex,uv+vec2(0.0,px.y)).a-texture(tex,uv-vec2(0.0,px.y)).a;' +
    'vec3 n=normalize(vec3(-ax*2.6,-ay*2.6,0.4));float dif=0.7+0.45*max(dot(n,ld),0.0);vec3 h=normalize(ld+vec3(0.0,0.0,1.0));float sp=pow(max(dot(n,h),0.0),36.0)*0.95;' +
    'float ep=smoothstep(0.45,1.5,a);float bord=smoothstep(0.5,0.34,a);vec3 col=c*dif*(0.82+0.3*ep)*(1.0-0.3*bord)+vec3(sp)+c*0.15*ep;float fr=pow(1.0-n.z,1.4);col+=c*0.3*fr+vec3(0.12)*fr;float al=m*min(1.0,0.5+0.32*ep+0.45*fr);o=vec4(col*al,al);}';

  function RenduGL(m, canvas, bloom) {
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('pas de WebGL2');
    this.m = m; this.gl = gl; this.bloom = bloom; this.nom = 'WebGL2' + (bloom ? ' + bloom' : '');
    function prog(vs, fs) {
      var p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
    }
    this.pPart = prog(VS_PART, FS_PART); this.pLiq = prog(VS_PLEIN, FS_LIQ); this.liq = true; this.f16 = !!gl.getExtension('EXT_color_buffer_float'); this.pRuban = prog(VS_RUBAN, FS_RUBAN); this.pFlou = prog(VS_PLEIN, FS_FLOU); this.pCompo = prog(VS_PLEIN, FS_COMPO);
    // quad + instances
    this.vao = gl.createVertexArray(); gl.bindVertexArray(this.vao);
    var q = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, q); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.bInst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bInst); gl.bufferData(gl.ARRAY_BUFFER, m.cap * 40, gl.DYNAMIC_DRAW);
    [[1, 4, 0], [2, 4, 16], [3, 2, 32]].forEach(function (a) { gl.enableVertexAttribArray(a[0]); gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, 40, a[2]); gl.vertexAttribDivisor(a[0], 1); });
    this.vaoR = gl.createVertexArray(); gl.bindVertexArray(this.vaoR);
    this.bRuban = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bRuban); gl.bufferData(gl.ARRAY_BUFFER, m.ruban.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 24, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 8);
    this.vaoV = gl.createVertexArray(); gl.bindVertexArray(null);
    this.u = {
      res: gl.getUniformLocation(this.pPart, 'res'), amul: gl.getUniformLocation(this.pPart, 'amul'), ombre: gl.getUniformLocation(this.pPart, 'ombre'), miroir: gl.getUniformLocation(this.pPart, 'miroir'), teinte: gl.getUniformLocation(this.pPart, 'teinte'), ldir: gl.getUniformLocation(this.pPart, 'ldir'), resR: gl.getUniformLocation(this.pRuban, 'res'),
      lTex: gl.getUniformLocation(this.pLiq, 'tex'), lPx: gl.getUniformLocation(this.pLiq, 'px'), lLd: gl.getUniformLocation(this.pLiq, 'ld'), lOm: gl.getUniformLocation(this.pLiq, 'om'), lTe: gl.getUniformLocation(this.pLiq, 'teinte'),
      tex: gl.getUniformLocation(this.pFlou, 'tex'), dir: gl.getUniformLocation(this.pFlou, 'dir'), texC: gl.getUniformLocation(this.pCompo, 'tex'), force: gl.getUniformLocation(this.pCompo, 'force')
    };
  }
  RenduGL.prototype.cible = function (w, h, flottant) {
    var gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    if (flottant) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (p) { gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR); });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  };
  RenduGL.prototype.redim = function (w, h) {
    this.w = w; this.h = h; var gl = this.gl;
    if (this.bA) { gl.deleteTexture(this.bA.t); gl.deleteTexture(this.bB.t); gl.deleteFramebuffer(this.bA.f); gl.deleteFramebuffer(this.bB.f); }
    var bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2);
    this.bA = this.cible(bw, bh); this.bB = this.cible(bw, bh);
    if (this.tL) { gl.deleteTexture(this.tL.t); gl.deleteFramebuffer(this.tL.f); }
    this.tL = this.cible(Math.max(1, w >> 1), Math.max(1, h >> 1), this.f16);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { this.f16 = false; gl.deleteTexture(this.tL.t); gl.deleteFramebuffer(this.tL.f); this.tL = this.cible(Math.max(1, w >> 1), Math.max(1, h >> 1), false); }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  RenduGL.prototype.effacer = function () { var gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); };
  RenduGL.prototype.particules = function (L, H, add) {
    var gl = this.gl, m = this.m;
    gl.useProgram(this.pPart); gl.uniform2f(this.u.res, L, H); gl.bindVertexArray(this.vao); gl.bindBuffer(gl.ARRAY_BUFFER, this.bInst);
    gl.uniform4f(this.u.ombre, 0, 0, 0, 0); gl.uniform4f(this.u.miroir, 0, 0, 0, 0); var lu = m.fx.lum, rf = m.fx.refl, lan = lu.angle * Math.PI / 180, lkk = 1 - lu.hauteur * 0.45;
    gl.uniform3f(this.u.ldir, Math.cos(lan) * lkk, -Math.sin(lan) * lkk, Math.min(1, lu.force * 2.5));
    if (!add && rf && rf.actif && (m.nN || m.nA)) {
      gl.uniform4f(this.u.miroir, rf.y, rf.force, m.horloge, rf.type === 'eau' ? 1 : 0.6);
      if (m.nN) { gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 1); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.inst, 0, m.nN * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nN); }
      if (m.nA) { gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 0.35); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.instAdd, 0, m.nA * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nA); }
      gl.uniform4f(this.u.miroir, 0, 0, 0, 0);
    }
    gl.uniform3f(this.u.teinte, lu.teinteRgb[0], lu.teinteRgb[1], lu.teinteRgb[2]);
    if (!add && m.nS) { gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 1); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.instSol, 0, m.nS * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nS); }
    if (!add && m.nN && lu.particules && lu.force > 0) {
      var ov = m.fx.vecteurOmbre(); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 1);
      gl.uniform4f(this.u.ombre, ov[0], ov[1], lu.force, 0.12 + (1 - lu.hauteur) * 0.15);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.inst, 0, m.nN * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nN);
      gl.uniform4f(this.u.ombre, 0, 0, 0, 0);
    }
    if (!add && m.nN) { gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 1); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.inst, 0, m.nN * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nN); }
    if (m.nA) { gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform1f(this.u.amul, 0.35); gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.instAdd, 0, m.nA * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nA); }
  };
  RenduGL.prototype.dessiner = function () {
    var gl = this.gl, m = this.m; m.preparer();
    var L = m.L, H = m.H; gl.enable(gl.BLEND);
    var bloom = this.bloom && m.qualite >= 0.55 && m.nA > 0;
    if (bloom) {
      // 1. les particules lumineuses dans une petite texture (1/4), 2. flou gaussien séparable x2, 3. ajout à l'image
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.bA.f); gl.viewport(0, 0, this.bA.w, this.bA.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      this.particules(L, H, true);
      gl.disable(gl.BLEND); gl.useProgram(this.pFlou); gl.bindVertexArray(this.vaoV); gl.uniform1i(this.u.tex, 0); gl.activeTexture(gl.TEXTURE0);
      for (var it = 0; it < 2; it++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bB.f); gl.bindTexture(gl.TEXTURE_2D, this.bA.t); gl.uniform2f(this.u.dir, 1 / this.bA.w, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bA.f); gl.bindTexture(gl.TEXTURE_2D, this.bB.t); gl.uniform2f(this.u.dir, 0, 1 / this.bA.h); gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.enable(gl.BLEND);
    }
    if (m.nL) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.tL.f); gl.viewport(0, 0, this.tL.w, this.tL.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(this.pPart); gl.uniform2f(this.u.res, L, H); gl.uniform4f(this.u.ombre, 0, 0, 0, 0); gl.uniform4f(this.u.miroir, 0, 0, 0, 0); gl.uniform1f(this.u.amul, 1);
      gl.bindVertexArray(this.vao); gl.bindBuffer(gl.ARRAY_BUFFER, this.bInst); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.instLiq, 0, m.nL * 10); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, m.nL);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.w, this.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if (m.nL) {
      var lu = m.fx.lum, la = lu.angle * Math.PI / 180, lk = 1 - lu.hauteur * 0.6, ov = m.fx.vecteurOmbre();
      gl.useProgram(this.pLiq); gl.bindVertexArray(this.vaoV); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tL.t); gl.uniform1i(this.u.lTex, 0);
      gl.uniform2f(this.u.lPx, 1.5 / this.tL.w, 1.5 / this.tL.h); var lz = 0.35 + lu.hauteur * 0.65, ll = Math.hypot(Math.cos(la) * lk, Math.sin(la) * lk, lz);
      gl.uniform3f(this.u.lLd, Math.cos(la) * lk / ll, Math.sin(la) * lk / ll, lz / ll); gl.uniform3f(this.u.lTe, lu.teinteRgb[0], lu.teinteRgb[1], lu.teinteRgb[2]);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      if (lu.particules && lu.force > 0) { gl.uniform4f(this.u.lOm, ov[0] / L, -ov[1] / H, lu.force * 0.9, 1); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      gl.uniform4f(this.u.lOm, 0, 0, 0, 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (m.nR) {
      gl.useProgram(this.pRuban); gl.uniform2f(this.u.resR, L, H); gl.bindVertexArray(this.vaoR); gl.bindBuffer(gl.ARRAY_BUFFER, this.bRuban);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, m.ruban, 0, m.nR * 6); gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, m.nR);
    }
    this.particules(L, H, false);
    if (bloom) {
      gl.useProgram(this.pCompo); gl.bindVertexArray(this.vaoV); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.bA.t); gl.uniform1i(this.u.texC, 0);
      gl.uniform1f(this.u.force, 1.6); gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.bindVertexArray(null);
  };

  /* ======================================================================
   * 3 ter. RENDU CANVAS 2D (repli si WebGL2 indisponible)
   * ==================================================================== */
  function m2y(r) { return r.m.fx.refl ? r.m.fx.refl.y : 1e9; }
  function RenduCanvas(m, canvas) { this.m = m; this.ctx = canvas.getContext('2d'); this.nom = 'Canvas 2D'; }
  RenduCanvas.prototype.redim = function (w, h, dpr) { this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  RenduCanvas.prototype.effacer = function () { this.ctx.clearRect(0, 0, this.m.L, this.m.H); };
  RenduCanvas.prototype.dessiner = function () {
    var m = this.m, ctx = this.ctx; m.preparer(); ctx.clearRect(0, 0, m.L, m.H);
    if (m.nR) { ctx.globalCompositeOperation = 'lighter'; for (var r = 0; r < m.nR; r += 3) { var o = r * 6, R = m.ruban; ctx.globalAlpha = R[o + 5]; ctx.fillStyle = 'rgb(' + (R[o + 2] * 255 | 0) + ',' + (R[o + 3] * 255 | 0) + ',' + (R[o + 4] * 255 | 0) + ')'; ctx.beginPath(); ctx.moveTo(R[o], R[o + 1]); ctx.lineTo(R[o + 6], R[o + 7]); ctx.lineTo(R[o + 12], R[o + 13]); ctx.fill(); } }
    var lu = m.fx.lum;
    if (m.nS) { ctx.globalCompositeOperation = 'source-over'; for (var s = 0; s < m.nS; s++) { var os = s * 10, S = m.instSol; ctx.globalAlpha = Math.min(1, S[os + 7]); ctx.fillStyle = lu.teinte; ctx.beginPath(); ctx.ellipse(S[os], S[os + 1], S[os + 2] * 2.6, S[os + 2], 0, 0, 6.3); ctx.fill(); } }
    if (lu.particules && lu.force > 0 && m.nN) { var ov = m.fx.vecteurOmbre(); this.ombre = { x: ov[0], y: ov[1], a: lu.force, c: lu.teinte }; this.lot(m.inst, m.nN, false); this.ombre = null; }
    var rf = m.fx.refl;
    if (rf && rf.actif) { ctx.save(); ctx.beginPath(); ctx.rect(0, rf.y, m.L, m.H - rf.y); ctx.clip(); ctx.translate(0, 2 * rf.y); ctx.scale(1, -1); this.attenue = rf.force * 0.8; this.lot(m.inst, m.nN, false); this.lot(m.instAdd, m.nA, true); this.attenue = 0; ctx.restore(); }
    this.lot(m.inst, m.nN, false); this.lot(m.instAdd, m.nA, true);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  };
  RenduCanvas.prototype.lot = function (T, n, add) {
    var ctx = this.ctx; ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    for (var i = 0; i < n; i++) {
      var o = i * 10, s = T[o + 2], f = Math.floor(T[o + 8] + 0.001), et = T[o + 9], om = this.ombre;
      if (s < 0.3) continue;
      if (om && (f === 0 || f === 2 || f === 3 || f === 8 || f === 9 || f === 13 || f === 16 || f === 17)) continue;
      var col = om ? om.c : 'rgb(' + (T[o + 4] * 255 | 0) + ',' + (T[o + 5] * 255 | 0) + ',' + (T[o + 6] * 255 | 0) + ')';
      if (this.attenue && T[o + 1] > m2y(this)) continue;
      ctx.save(); ctx.globalAlpha = Math.min(1, T[o + 7]) * (om ? om.a : 1) * (this.attenue || 1); ctx.translate(T[o] + (om ? om.x * (0.6 + s * 0.08) : 0), T[o + 1] + (om ? om.y * (0.6 + s * 0.08) : 0)); ctx.rotate(T[o + 3]);
      ctx.fillStyle = col; ctx.strokeStyle = col;
      if ((f >= 4 && f <= 7) || f === 15) ctx.scale(Math.max(Math.abs(et), 0.12), 1); else if (et > 0 && f !== 9 && f !== 16) ctx.scale(1 + et, 1);
      ctx.beginPath();
      if (f === 0 || f === 8 || f === 13) { var g = ctx.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.arc(0, 0, s, 0, 6.3); ctx.fill(); }
      else if (f === 1) { for (var k = 0; k < 10; k++) { var rr = k % 2 ? s * 0.45 : s, aa = k * Math.PI / 5; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.fill(); }
      else if (f === 2 || f === 9) { ctx.lineWidth = Math.max(1, s * 0.14); ctx.arc(0, 0, s * 0.8, 0, 6.3); ctx.stroke(); }
      else if (f === 3) { ctx.ellipse(0, 0, s, s * 0.3, 0, 0, 6.3); ctx.fill(); }
      else if (f === 4) ctx.fillRect(-s, -s * 0.55, s * 2, s * 1.1);
      else if (f === 5) { ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s); ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s); ctx.fill(); }
      else if (f === 6) { ctx.ellipse(0, 0, s * 0.34, s, 0, 0, 6.3); ctx.fill(); }
      else if (f === 15) { ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.75, -s * 0.1, 0, s * 0.75); ctx.quadraticCurveTo(-s * 0.75, -s * 0.1, 0, -s); ctx.fill(); ctx.globalAlpha *= 0.5; ctx.fillRect(-0.4, -s * 0.8, 0.8, s * 1.75); }
      else if (f === 16) { var gb = ctx.createRadialGradient(0, 0, 0, 0, 0, s); gb.addColorStop(0, col); gb.addColorStop(0.5, col); gb.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gb; ctx.arc(0, 0, s, 0, 6.3); ctx.fill(); }
      else if (f === 17) { ctx.ellipse(s * 0.2, 0, s, s * 0.22, 0, 0, 6.3); ctx.fill(); }
      else if (f === 14) { ctx.globalAlpha *= 0.55; ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, s * 0.75); ctx.lineTo(-s * 0.75, s * 0.55); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke(); }
      else { ctx.arc(0, 0, s * 0.9, 0, 6.3); ctx.fill(); }
      ctx.restore();
    }
  };

  /* ======================================================================
   * 4. BIBLIOTHÈQUE DE SYSTÈMES (chaque système = plusieurs couches d'émetteurs)
   *    Unités : vitesses en px/s, gravité en px/s², vie en secondes
   * ==================================================================== */
  var FEU_CORPS_NOIR = ['#FFFFFF', '#FFF1A8', '#FFB000', '#FF4D00', '#7A1600'];
  var SYSTEMES = {
    eclat: [
      { nb: 1, fixe: true, vie: 0.2, taille: 46, tailleVie: [0.3, 1.5], alphaVie: [1, 0], sprite: 'doux', melange: 'add', couleur: '#FFFFFF' },
      { nb: 26, vie: [0.35, 0.7], vitesse: [320, 820], taille: [2.2, 3.4], tailleVie: [1, 0.3], sprite: 'etincelle', etirement: 0.012, melange: 'add', couleur: 'palette', couleurVie: ['#FFFFFF', 'base', 'base'], frein: 3.5, gravite: 260 },
      { nb: 14, vie: [0.6, 1.1], vitesse: [80, 300], taille: [2, 4.5], tailleVie: [1, 0.2], sprite: 'doux', melange: 'add', couleur: 'palette', frein: 2, curl: { force: 380, freq: 0.012 }, scintille: true },
      { nb: 1, fixe: true, vie: 0.45, taille: 12, tailleVie: [1, 7], alphaVie: [0.9, 0], sprite: 'anneau', melange: 'add', couleur: 'palette' }
    ],
    etincelles: [
      { nb: 24, vie: [0.3, 0.6], vitesse: [450, 1000], taille: [1.4, 2.4], sprite: 'etincelle', etirement: 0.016, melange: 'add', couleur: 'palette', couleurVie: ['#FFFFFF', 'base'], frein: 4, gravite: 500, aLaMort: 'crepitement', proba: 0.18 }
    ],
    crepitement: [
      { nb: 4, fixe: true, vie: [0.08, 0.2], vitesse: [60, 160], taille: [1.5, 3], sprite: 'doux', melange: 'add', couleur: '#FFFFFF', scintille: true }
    ],
    confettis: [
      { nb: 36, vie: [1.4, 2.3], vitesse: [420, 900], cone: [-90, 110], taille: [4, 6.5], sprite: 'rect', couleur: 'palette', frein: 2.2, gravite: 420, curl: { force: 260, freq: 0.01 }, rotVitesse: [-360, 360], flipVitesse: 11, alphaVie: [1, 1, 1, 0] }
    ],
    etoiles: [
      { nb: 12, vie: [0.8, 1.3], vitesse: [90, 300], taille: [5, 9], tailleVie: [0.4, 1, 0.2], sprite: 'etoile', melange: 'add', couleur: 'palette', frein: 2.2, gravite: -40, rotVitesse: [-120, 120], scintille: true, curl: { force: 160, freq: 0.015 } }
    ],
    jus: [
      { nb: 1, fixe: true, vie: 0.18, taille: 30, tailleVie: [0.5, 1.4], alphaVie: [0.8, 0], sprite: 'doux', melange: 'add', couleur: 'fruit' },
      { nb: 28, vie: [0.6, 1.1], vitesse: [180, 640], cone: [-90, 260], taille: [2.4, 5.2], sprite: 'goutte', etirement: 0.006, etirementMax: 1.6, couleur: 'fruit', variation: 0.06, gravite: 1500, frein: 0.6, sol: { decalage: 130, mort: true, sous: 'eclaboussure' } },
      { nb: 10, vie: [0.4, 0.8], vitesse: [60, 220], taille: [6, 12], tailleVie: [0.6, 1.6], alphaVie: [0.55, 0], sprite: 'fumee', couleur: 'fruit', frein: 3, curl: { force: 200, freq: 0.02 } },
      { nb: 7, vie: [0.6, 1], vitesse: [150, 420], cone: [-90, 200], taille: [2, 3.5], sprite: 'rect', couleur: 'fruit', variation: -0.12, gravite: 1300, rotVitesse: [-600, 600], flipVitesse: 16, sol: { decalage: 130, rebond: 0.25, friction: 0.5 } },
      { nb: 1, fixe: true, vie: 0.35, taille: 10, tailleVie: [1, 6], alphaVie: [0.6, 0], sprite: 'anneau', couleur: 'fruit' }
    ],
    eclaboussure: [
      { nb: 4, fixe: true, vie: [0.25, 0.45], vitesse: [80, 260], cone: [-90, 150], taille: [1.2, 2.4], sprite: 'goutte', etirement: 0.008, etirementMax: 1.4, heriteCouleur: true, gravite: 1400 },
      { nb: 1, fixe: true, vie: [1.2, 1.8], taille: [5, 8], tailleVie: [0.6, 1.2, 1.2], alphaVie: [0.8, 0.6, 0], sprite: 'doux', heriteCouleur: true }
    ],
    braises: [
      { nb: 24, vie: [0.9, 1.7], zone: 'cercle', rayon: 22, vitesse: [60, 260], cone: [-90, 70], taille: [1.6, 3.6], tailleVie: [1, 0.3], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: FEU_CORPS_NOIR, gravite: -180, frein: 1.2, curl: { force: 520, freq: 0.014, vitesse: 0.8 }, scintille: true }
    ],
    eruption: [
      { nb: 1, fixe: true, vie: 0.3, taille: 70, tailleVie: [0.4, 1.4], alphaVie: [1, 0], sprite: 'doux', melange: 'add', couleur: '#FF8C00' },
      { nb: 26, vie: [1, 1.6], vitesse: [450, 1050], cone: [-90, 55], taille: [4, 9], tailleVie: [1, 0.6], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: FEU_CORPS_NOIR, gravite: 1100, frein: 0.4, sol: { rebond: 0.15, friction: 0.4, sous: 'braises-sol' } },
      { nb: 30, vie: [0.6, 1.2], vitesse: [400, 1200], cone: [-90, 70], taille: [1.4, 2.6], sprite: 'etincelle', etirement: 0.014, melange: 'add', couleur: '#FFD23F', couleurVie: FEU_CORPS_NOIR, gravite: 900, frein: 1 },
      { nb: 12, vie: [1.6, 2.6], zone: 'cercle', rayon: 20, vitesse: [40, 140], cone: [-90, 60], taille: [16, 26], tailleVie: [0.6, 2.4], alphaVie: [0, 0.5, 0], sprite: 'fumee', couleur: '#4a3b35', couleurVie: ['#3a2b25', '#6e625c', '#9a908a'], gravite: -60, frein: 0.8, curl: { force: 260, freq: 0.008 } },
      { nb: 1, fixe: true, vie: 0.5, taille: 14, tailleVie: [1, 9], alphaVie: [0.9, 0], sprite: 'anneau', melange: 'add', couleur: '#FF8C00' }
    ],
    'braises-sol': [
      { nb: 3, fixe: true, vie: [0.4, 0.8], vitesse: [40, 160], cone: [-90, 140], taille: [1.2, 2.2], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: FEU_CORPS_NOIR, gravite: 300, scintille: true }
    ],
    bulles: [
      { nb: 16, vie: [1.1, 1.9], zone: 'cercle', rayon: 26, vitesse: [30, 120], cone: [-90, 90], taille: [3, 9], tailleVie: [0.5, 1.1, 1.2], alphaVie: [0, 1, 1, 0], sprite: 'bulle', couleur: ['#FFFFFF', '#CAF0F8', '#90E0EF'], gravite: -260, frein: 1.5, curl: { force: 300, freq: 0.02 }, aLaMort: 'pop', proba: 0.6 }
    ],
    pop: [
      { nb: 1, fixe: true, vie: 0.18, taille: 4, tailleVie: [1, 3], alphaVie: [0.8, 0], sprite: 'anneau', couleur: '#FFFFFF' },
      { nb: 4, fixe: true, vie: 0.2, vitesse: [80, 160], taille: [1, 1.6], sprite: 'doux', melange: 'add', couleur: '#FFFFFF' }
    ],
    vague: [
      { nb: 3, fixe: true, vie: [0.6, 0.9], taille: [10, 18], tailleVie: [1, 14], alphaVie: [0.9, 0], sprite: 'anneau', couleur: 'palette', etale: 0.25 },
      { nb: 26, vie: [0.6, 1.1], vitesse: [200, 560], cone: [-90, 160], taille: [1.6, 3.4], sprite: 'goutte', etirement: 0.006, etirementMax: 1.5, couleur: ['#FFFFFF', '#CAF0F8', '#90E0EF'], gravite: 1100 },
      { nb: 10, vie: [1.1, 1.9], zone: 'cercle', rayon: 40, vitesse: [30, 100], cone: [-90, 90], taille: [3, 8], alphaVie: [0, 1, 0], sprite: 'bulle', couleur: '#FFFFFF', gravite: -220, curl: { force: 300, freq: 0.02 } }
    ],
    petales: [
      { nb: 18, vie: [1.6, 2.6], vitesse: [140, 420], taille: [6, 10], sprite: 'petale', couleur: 'palette', variation: 0.05, frein: 2.2, gravite: 90, curl: { force: 380, freq: 0.012, vitesse: 0.5 }, rotVitesse: [-140, 140], flipVitesse: 6, alphaVie: [1, 1, 1, 0] }
    ],
    feuilles: [
      { nb: 16, vie: [1.6, 2.6], vitesse: [140, 420], taille: [6, 10], sprite: 'petale', couleur: ['#52B788', '#74C69D', '#2D6A4F', '#95D5B2'], frein: 2.2, gravite: 90, curl: { force: 380, freq: 0.012, vitesse: 0.5 }, rotVitesse: [-140, 140], flipVitesse: 6, alphaVie: [1, 1, 1, 0] }
    ],
    plumes: [
      { nb: 10, vie: [2, 3], vitesse: [100, 320], taille: [9, 14], sprite: 'plume', couleur: ['#FFFFFF', '#FFFFFF', '#F4F1E6'], frein: 2.6, gravite: 55, curl: { force: 300, freq: 0.01, vitesse: 0.4 }, rotVitesse: [-60, 60], flipVitesse: 4, alphaVie: [1, 1, 1, 0] }
    ],
    poussiereOr: [
      { nb: 34, vie: [0.8, 1.6], zone: 'cercle', rayon: 18, vitesse: [30, 220], taille: [1, 2.6], sprite: 'doux', melange: 'add', couleur: ['#FFD23F', '#E9C46A', '#FFF3B0', '#C9A227'], frein: 2, gravite: -30, curl: { force: 220, freq: 0.02 }, scintille: true }
    ],
    pepite: [
      { nb: 1, fixe: true, vie: 0.25, taille: 60, tailleVie: [0.3, 1.4], alphaVie: [1, 0], sprite: 'doux', melange: 'add', couleur: '#FFE066' },
      { nb: 16, vie: [1.4, 1.9], vitesse: [300, 700], cone: [-90, 140], taille: [6, 8], sprite: 'piece', couleur: ['#FFD23F', '#FFC233', '#F4A300'], frein: 2.4, gravite: 700, flipVitesse: 12, versCible: { apres: 0.28, force: 9, vitesse: 1600 }, sol: { rebond: 0.45, friction: 0.7 } },
      { nb: 24, vie: [0.8, 1.4], zone: 'cercle', rayon: 20, vitesse: [40, 260], taille: [1, 2.4], sprite: 'doux', melange: 'add', couleur: ['#FFD23F', '#FFF3B0'], frein: 2, curl: { force: 260, freq: 0.02 }, scintille: true },
      { nb: 1, fixe: true, vie: 0.5, taille: 14, tailleVie: [1, 9], alphaVie: [1, 0], sprite: 'anneau', melange: 'add', couleur: '#FFE066' }
    ],
    anneau: [
      { nb: 1, fixe: true, vie: 0.42, taille: 10, tailleVie: [1, 8], alphaVie: [0.9, 0], sprite: 'anneau', melange: 'add', couleur: 'palette' }
    ],
    fumee: [
      { nb: 7, vie: [0.9, 1.4], zone: 'cercle', rayon: 12, vitesse: [20, 70], cone: [-90, 120], taille: [10, 16], tailleVie: [0.6, 2], alphaVie: [0, 0.45, 0], sprite: 'fumee', couleur: '#9a92a6', gravite: -40, frein: 1, curl: { force: 160, freq: 0.015 } }
    ],
    poussiere: [
      { nb: 12, vie: [0.5, 0.8], vitesse: [30, 120], taille: [1.4, 2.8], sprite: 'doux', couleur: '#A89F96', alphaVie: [0.8, 0], frein: 3, gravite: 60 }
    ],
    brume: [
      { nb: 7, vie: [0.9, 1.4], zone: 'cercle', rayon: 12, vitesse: [20, 70], taille: [10, 16], tailleVie: [0.6, 2], alphaVie: [0, 0.4, 0], sprite: 'fumee', couleur: '#C9B6E4', gravite: -30, curl: { force: 160, freq: 0.015 } }
    ],
    feu: [
      { nb: 4, hauteur: [0.5, 0.8], zone: 'ecran-bas-sur', cone: [-90, 14], taille: [2.2, 3], sprite: 'doux', melange: 'add', couleur: 'palette', gravite: 380, traine: { largeur: 2.2 }, aLaMort: 'explosion', etale: 0.9 }
    ],
    explosion: [
      { nb: 1, fixe: true, vie: 0.25, taille: 60, tailleVie: [0.3, 1.3], alphaVie: [1, 0], sprite: 'doux', melange: 'add', heriteCouleur: true },
      { nb: 46, vie: [0.9, 1.4], vitesse: [200, 420], taille: [1.6, 2.6], sprite: 'doux', melange: 'add', heriteCouleur: true, couleurVie: ['#FFFFFF', 'base', 'base'], frein: 1.6, gravite: 160, traine: { largeur: 1.4 }, aLaMort: 'crepitement', proba: 0.25 }
    ],
    pluie: [
      { nb: 110, vie: [2.2, 3.4], zone: 'ecran-haut', vitesse: [40, 160], cone: [90, 60], taille: [3.5, 6], sprite: 'rect', couleur: 'palette', gravite: 160, frein: 0.6, curl: { force: 240, freq: 0.008 }, rotVitesse: [-300, 300], flipVitesse: 10, alphaVie: [1, 1, 1, 0], etale: 0.6 }
    ]
  };
  var NOMS_EFFETS = { eclat: 'Éclat lumineux', etincelles: 'Étincelles', confettis: 'Confettis', etoiles: 'Pluie d\'étoiles', jus: 'Giclée de jus', braises: 'Braises qui montent',
    eruption: 'Éruption', bulles: 'Bulles', vague: 'Vague', petales: 'Pétales qui volent', feuilles: 'Feuilles', plumes: 'Plumes de paille-en-queue', poussiereOr: 'Poussière dorée',
    pepite: 'Pépite (pièces vers le score)', anneau: 'Onde de choc', fumee: 'Petite fumée douce', poussiere: 'Poussière légère', brume: 'Brume', feu: 'Feu d\'artifice', pluie: 'Pluie de confettis' };
  var EFFETS = {};
  Object.keys(NOMS_EFFETS).forEach(function (nom) {
    EFFETS[nom] = { nom: NOMS_EFFETS[nom], f: function (m, x, y, k, o) {
      m.systeme(nom, x, y, k, o);
      if (nom === 'eruption') m.fx.secousse(0.7 * k + 0.3);
      if (nom === 'feu') for (var i = 0; i < 4; i++) setTimeout(function () { m.fx.son('eclat'); }, 900 + i * 260);
    } };
  });

  /* Ambiances continues (débit = particules par seconde) */
  var AMBIANCES = {
    braises: [{ debit: 9, vie: [3, 5], zone: 'ecran-bas', vitesse: [30, 80], cone: [-90, 30], taille: [1, 2.4], tailleVie: [1, 0.3], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: FEU_CORPS_NOIR, gravite: -40, curl: { force: 120, freq: 0.006, vitesse: 0.3 }, scintille: true }],
    bulles: [{ debit: 3, vie: [4, 6], zone: 'ecran-bas', vitesse: [30, 60], cone: [-90, 20], taille: [2, 6], alphaVie: [0, 0.7, 0.7, 0], sprite: 'bulle', couleur: '#FFFFFF', gravite: -20, curl: { force: 70, freq: 0.01 } }],
    petales: [{ debit: 1.6, vie: [6, 9], zone: 'ecran-haut', vitesse: [30, 70], cone: [90, 40], taille: [5, 8], sprite: 'petale', couleur: ['#FF6FA5', '#FFB3C6', '#E63973'], gravite: 12, curl: { force: 90, freq: 0.006, vitesse: 0.3 }, rotVitesse: [-60, 60], flipVitesse: 3, alphaVie: [0, 1, 1, 0] }],
    feuilles: [{ debit: 1.4, vie: [6, 9], zone: 'ecran-haut', vitesse: [30, 70], cone: [90, 40], taille: [5, 8], sprite: 'petale', couleur: ['#52B788', '#74C69D', '#95D5B2'], gravite: 12, curl: { force: 90, freq: 0.006, vitesse: 0.3 }, rotVitesse: [-60, 60], flipVitesse: 3, alphaVie: [0, 1, 1, 0] }],
    plumes: [{ debit: 0.6, vie: [8, 11], zone: 'ecran-haut', vitesse: [20, 50], cone: [90, 40], taille: [8, 12], sprite: 'plume', couleur: '#FFFFFF', gravite: 8, curl: { force: 70, freq: 0.006, vitesse: 0.25 }, flipVitesse: 2, alphaVie: [0, 1, 1, 0] }],
    poussiereOr: [{ debit: 7, vie: [2.5, 4], zone: 'ecran', vitesse: [5, 20], taille: [0.8, 2], alphaVie: [0, 0.8, 0], sprite: 'doux', melange: 'add', couleur: '#FFE8A3', curl: { force: 40, freq: 0.01 }, scintille: true }],
    etoiles: [{ debit: 2.5, vie: [2, 3.5], zone: 'ecran', taille: [2, 4], tailleVie: [0.3, 1, 0.3], alphaVie: [0, 0.9, 0], sprite: 'etoile', melange: 'add', couleur: '#FFF3B0', rotVitesse: [-20, 20] }],
    brume: [{ debit: 1.2, vie: [6, 9], zone: 'ecran-bas', vitesse: [10, 30], cone: [-80, 40], taille: [40, 70], tailleVie: [0.7, 1.4], alphaVie: [0, 0.18, 0], sprite: 'fumee', couleur: '#C9B6E4', curl: { force: 30, freq: 0.004 } }]
  };

  /* ======================================================================
   * 5. SONS (bruitages synthétisés, sans voix, sans fichier)
   * ==================================================================== */
  var GAMME = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]; // pentatonique : toujours harmonieux
  function Sons(fx) { this.fx = fx; this.ctx = null; }
  Sons.prototype.pret = function () {
    if (!this.ctx) { var A = global.AudioContext || global.webkitAudioContext; if (!A) return null; try { this.ctx = new A(); } catch (e) { return null; } }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  };
  Sons.prototype.note = function (f, dur, type, vol, glisse, retard) {
    var c = this.pret(); if (!c) return;
    var t = c.currentTime + (retard || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (glisse) o.frequency.exponentialRampToValueAtTime(glisse, t + dur);
    var v = vol * this.fx.opt.volume * this.fx.pub.son;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  };
  Sons.prototype.souffle = function (dur, f1, f2, vol) {
    var c = this.pret(); if (!c) return;
    var t = c.currentTime, n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; fl.type = 'bandpass'; fl.Q.value = 1.2;
    fl.frequency.setValueAtTime(f1, t); fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.value = vol * this.fx.opt.volume * this.fx.pub.son;
    s.connect(fl); fl.connect(g); g.connect(c.destination); s.start(t);
  };
  function hz(demi) { return 523.25 * Math.pow(2, demi / 12); }

  /* ---- Pack de vrais bruitages (ElevenLabs) ----
   * Sources possibles, dans cet ordre :
   *   1. option sonsPack : { bonne: 'url ou data:...', ... }  ou  un dossier 'kwfx-sons/'
   *   2. window.KwFX_SONS (fichier kwelafe-fx-sons.js, sons intégrés : idéal pour les EPUB)
   * Si un son manque ou ne charge pas, le son synthétisé prend le relais. */
  var NOMS_SONS = ['bonne', 'combo', 'erreur', 'coupe', 'pepite', 'niveau', 'victoire', 'defaite', 'clic', 'presque', 'debut', 'eclat', 'bulles', 'volcan', 'impact', 'oiseau', 'vent'];
  var VOLUME_SONS = { bonne: 0.8, combo: 0.85, erreur: 0.55, coupe: 0.8, pepite: 0.9, niveau: 0.85, victoire: 0.9, defaite: 0.6, clic: 0.35, presque: 0.6, debut: 0.8, eclat: 0.55, bulles: 0.45, volcan: 0.6, impact: 0.7, oiseau: 0.45, vent: 0.45 };
  Sons.prototype.charger = function (pack) {
    var self = this; this.tampons = this.tampons || {};
    var src = {};
    if (typeof pack === 'string') NOMS_SONS.forEach(function (n) { src[n] = pack.replace(/\/?$/, '/') + n + '.mp3'; });
    else if (pack) src = pack;
    else if (global.KwFX_SONS) src = global.KwFX_SONS;
    this.attendus = Object.keys(src).length;
    Object.keys(src).forEach(function (n) {
      fetch(src[n]).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (ab) {
          var c = self.contexteSilencieux(); if (!c) return;
          return new Promise(function (ok, ko) { c.decodeAudioData(ab, ok, ko); });
        })
        .then(function (buf) { if (buf) self.tampons[n] = buf; })
        .catch(function () { /* on garde le son synthétisé */ });
    });
  };
  /* contexte audio créé sans le démarrer (il sera relancé au premier toucher) */
  Sons.prototype.contexteSilencieux = function () {
    if (!this.ctx) { var A = global.AudioContext || global.webkitAudioContext; if (!A) return null; try { this.ctx = new A(); } catch (e) { return null; } }
    return this.ctx;
  };
  Sons.prototype.echantillon = function (nom, opt) {
    var buf = this.tampons && this.tampons[nom]; if (!buf) return false;
    var c = this.pret(); if (!c) return false;
    opt = opt || {};
    var s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf;
    // hauteur : montée avec la série + petite variation aléatoire pour ne jamais lasser
    var demi = (opt.demi || 0) + (opt.varier === false ? 0 : hasard(-0.6, 0.6));
    s.playbackRate.value = Math.pow(2, demi / 12);
    g.gain.value = (opt.vol == null ? 1 : opt.vol) * (VOLUME_SONS[nom] || 0.7) * this.fx.opt.volume * this.fx.pub.son;
    s.connect(g); g.connect(c.destination); s.start(c.currentTime + (opt.retard || 0));
    return true;
  };
  /* accents sonores propres à chaque thème, joués sur les grands moments */
  var ACCENTS = { lagon: 'bulles', volcan: 'volcan', oiseaux: 'oiseau', flore: 'vent', fruits: 'vent', noel: 'eclat' };

  Sons.prototype.joue = function (nom, serie) {
    var s = this, n = GAMME[Math.min(serie || 0, GAMME.length - 1)];
    // 1. vrais bruitages si disponibles
    var monte = Math.min(serie || 0, 12) * 0.5; // +1/2 ton par réponse juste, jusqu'à +6 tons
    var fait = false;
    if (nom === 'bonne') fait = s.echantillon('bonne', { demi: monte });
    else if (nom === 'combo') fait = s.echantillon('combo', { demi: Math.min(monte, 4) });
    else if (nom === 'coupe') { fait = s.echantillon('coupe', { demi: hasard(-1.5, 1.5) }); if (fait) s.echantillon('bonne', { demi: monte, vol: 0.35, retard: 0.05 }); }
    else if (nom === 'erreurGrave') fait = s.echantillon('impact') || s.echantillon('erreur');
    else fait = s.echantillon(nom);
    if (fait) {
      var acc = ACCENTS[s.fx.opt.theme];
      if (acc && (nom === 'niveau' || nom === 'victoire' || nom === 'pepite' || (nom === 'combo' && serie >= 8))) s.echantillon(acc, { vol: 0.8, retard: 0.08 });
      return;
    }
    if (nom === 'erreurGrave') nom = 'erreur';
    // 2. sinon : sons synthétisés
    switch (nom) {
      case 'bonne': s.note(hz(n), 0.12, 'triangle', 0.22); s.note(hz(n + 7), 0.16, 'sine', 0.16, null, 0.06); break;
      case 'combo': [0, 4, 7, 12].forEach(function (d, i) { s.note(hz(n + d), 0.12, 'triangle', 0.16, null, i * 0.05); }); break;
      case 'erreur': s.note(330, 0.18, 'sine', 0.12, 250); break;
      case 'coupe': s.souffle(0.14, 3000, 700, 0.35); s.note(hz(n), 0.08, 'triangle', 0.1); break;
      case 'clic': s.note(1200, 0.04, 'sine', 0.06); break;
      case 'pepite': [12, 16, 19, 24, 28].forEach(function (d, i) { s.note(hz(d), 0.14, 'sine', 0.14, null, i * 0.045); }); break;
      case 'niveau': s.note(hz(0), 0.5, 'triangle', 0.14, hz(12)); s.note(hz(12), 0.3, 'sine', 0.12, null, 0.35); break;
      case 'victoire': [0, 4, 7, 12, 7, 12].forEach(function (d, i) { s.note(hz(d), i > 3 ? 0.45 : 0.15, 'triangle', 0.18, null, i * 0.12); }); break;
      case 'defaite': s.note(hz(4), 0.25, 'sine', 0.12); s.note(hz(0), 0.4, 'sine', 0.1, null, 0.2); break;
      case 'eclat': s.souffle(0.25, 1800, 400, 0.18); break;
      case 'presque': s.note(hz(7), 0.1, 'sine', 0.1); s.note(hz(5), 0.14, 'sine', 0.08, null, 0.08); break;
      case 'debut': s.note(hz(0), 0.1, 'triangle', 0.14); s.note(hz(7), 0.18, 'triangle', 0.14, null, 0.1); break;
    }
  };

  /* ======================================================================
   * 6. LE DIRECTEUR (l'« IA » qui décide)
   * ==================================================================== */
  function Directeur(opt) {
    opt = opt || {};
    var self = this;
    this.opt = {
      theme: opt.theme || 'reunion', public: opt.public || 'enfant', mode: opt.mode || 'trankil',
      support: opt.support || 'web', sons: opt.sons !== false, volume: opt.volume == null ? 1 : opt.volume,
      messages: opt.messages !== false, bonusRares: opt.bonusRares !== false, ambiance: !!opt.ambiance,
      secousses: opt.secousses !== false, manga: opt.manga == null ? null : opt.manga, jeu: opt.jeu || null, collection: opt.collection !== false,
      onHitStop: opt.onHitStop || null, cibleScore: opt.cibleScore || null, onArrivee: opt.onArrivee || null, rendu: opt.rendu || 'auto', bloom: opt.bloom == null ? null : opt.bloom, onDecision: opt.onDecision || null, zoneShake: opt.zoneShake || null,
      vibrations: opt.vibrations !== false, pauseAuto: opt.pauseAuto !== false
    };
    this.conteneur = opt.conteneur || document.body;
    this.plein = this.conteneur === document.body || this.conteneur === document.documentElement;
    if (!this.plein && getComputedStyle(this.conteneur).position === 'static') this.conteneur.style.position = 'relative';
    this.lum = { angle: 135, hauteur: 0.55, force: 0.3, teinte: '#0B1A33', teinteRgb: [0.04, 0.1, 0.2], profondeur: true, brume: '#BFD7EA', brumeRgb: [191, 215, 234], particules: opt.ombres !== false, contact: opt.ombres !== false, elements: opt.ombres !== false };
    this.regler(this.opt);
    this.particules = new Moteur(this);
    this.calque = document.createElement('div');
    this.calque.setAttribute('aria-hidden', 'true');
    this.calque.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:9999';
    this.conteneur.appendChild(this.calque);
    this.audio = new Sons(this);
    if (this.opt.sons) this.audio.charger(opt.sonsPack);
    this.journal = [];
    this.reinitialiser();
    // NB : on ignore volontairement « Réduire les animations » (prefers-reduced-motion) : choix Kwélafé.
    if (this.opt.support === 'epub' && opt.bloquerPropagation !== false) KwFX.proteger();
    if (this.opt.ambiance) this.ambiance(true);
    global.addEventListener('pointerdown', function () { if (self.opt.sons) self.audio.pret(); }, { once: true });
    this.installerV21();
    if (this.opt.support === 'epub' && document.documentElement.classList) document.documentElement.classList.add('kwfx-js');
  }
  Directeur.prototype.regler = function (o) {
    for (var k in o) if (o.hasOwnProperty(k)) this.opt[k] = o[k];
    this.theme = THEMES[this.opt.theme] || THEMES.reunion;
    this.pub = PUBLICS[this.opt.public] || PUBLICS.enfant;
    this.mode = MODES[this.opt.mode] || MODES.trankil;
    if (this.particules && this.particules.ambiances.length) this.ambiance(true);
    return this;
  };
  Directeur.prototype.reinitialiser = function () {
    this.e = { serie: 0, meilleure: 0, bonnes: 0, erreurs: 0, erreursSuite: 0, recents: [], excitation: 0, secheresse: 0,
      debut: maintenant(), derniereBonne: 0, historique: [], pepites: 0, aide: false };
    return this;
  };
  Directeur.prototype.taille = function () {
    if (this.plein) return { l: global.innerWidth, h: global.innerHeight };
    var r = this.conteneur.getBoundingClientRect(); return { l: r.width, h: r.height };
  };
  /* Zone sûre : jamais d'effet collé aux bords (Apple Books tourne la page si on touche les bords) */
  Directeur.prototype.zoneSure = function () {
    var t = this.taille(), mx = t.l * (this.opt.support === 'epub' ? 0.13 : 0.05), my = t.h * (this.opt.support === 'epub' ? 0.1 : 0.05);
    return { x1: mx, x2: t.l - mx, y1: my, y2: t.h - my, l: t.l, h: t.h };
  };
  Directeur.prototype.position = function (d) {
    var s = this.zoneSure(), x = s.l / 2, y = s.h / 2, base = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect();
    if (d.element && d.element.getBoundingClientRect) { var r = d.element.getBoundingClientRect(); x = r.left + r.width / 2 - base.left; y = r.top + r.height / 2 - base.top; }
    else if (d.event && d.event.clientX != null) { x = d.event.clientX - base.left; y = d.event.clientY - base.top; }
    else if (d.event && d.event.changedTouches) { x = d.event.changedTouches[0].clientX - base.left; y = d.event.changedTouches[0].clientY - base.top; }
    if (d.x != null) x = d.x; if (d.y != null) y = d.y;
    return { x: borne(x, s.x1, s.x2), y: borne(y, s.y1, s.y2) };
  };
  Directeur.prototype.tauxErreur = function () {
    var r = this.e.recents; if (!r.length) return 0;
    return r.filter(function (v) { return !v; }).length / r.length;
  };
  /* Choisit un effet parmi des candidats en évitant les répétitions (nouveauté = plaisir) */
  Directeur.prototype.varier = function (candidats) {
    var h = this.e.historique, meilleurs = [], score = -1e9;
    candidats.forEach(function (c, i) {
      var s = (candidats.length - i) * 0.6 + Math.random() * 1.2;
      var vu = h.lastIndexOf(c); if (vu >= 0) s -= 2.2 * (vu + 1) / h.length;
      if (s > score) { score = s; meilleurs = [c]; }
    });
    var choix = meilleurs[0]; h.push(choix); if (h.length > 6) h.shift();
    return choix;
  };
  Directeur.prototype.lance = function (nom, p, k, o) {
    var ef = EFFETS[nom]; if (!ef) return;
    o = o || {}; if (!o.couleurs) o.couleurs = this.theme.couleurs;
    ef.f(this.particules, p.x, p.y, borne(k, 0, 1), o);
  };

  /* ---- point d'entrée principal : le jeu signale un événement ---- */
  Directeur.prototype.evenement = function (type, d) {
    d = d || {};
    var e = this.e, th = this.theme, p = this.position(d), t = maintenant();
    var dec = { type: type, effets: [], intensite: 0, message: null, pepite: false, multiplicateur: 1, serie: e.serie, raison: '' };
    var force = this.pub.force * this.mode.force;
    var self = this;
    function fait(nom, k, o) { self.lance(nom, p, k, o); dec.effets.push(nom); }

    switch (type) {
      case 'bonne': case 'coupe': case 'trouve': {
        var rapide = d.rapide || (e.derniereBonne && t - e.derniereBonne < 1300);
        e.serie++; e.bonnes++; e.erreursSuite = 0; e.secheresse++; e.derniereBonne = t;
        e.meilleure = Math.max(e.meilleure, e.serie); e.recents.push(true); if (e.recents.length > 10) e.recents.shift();
        var k = borne((0.32 + e.serie * 0.06 * this.mode.combo + (rapide ? 0.12 : 0)) * force, 0.2, 1);
        if (e.aide) { k = Math.max(k, 0.75); dec.raison = 'Rebond positif après des erreurs : grosse célébration pour redonner confiance. '; e.aide = false; }
        dec.intensite = k;
        var palier = e.serie >= 10 ? 3 : e.serie >= 6 ? 2 : e.serie >= 3 ? 1 : 0;
        var effetSig = type === 'coupe' && th.sig.succes.indexOf('jus') < 0 ? 'jus' : this.varier(palier >= 3 ? th.sig.grand.concat(th.sig.succes) : th.sig.succes);
        if (type === 'coupe') effetSig = 'jus';
        fait(effetSig, k, { couleur: d.couleur });
        if (palier >= 1) fait('anneau', k * 0.7);
        if (palier >= 2) fait(this.varier(th.sig.succes), k * 0.6);
        if (palier >= 3) { this.halo(k * 0.6); if (this.pub.secousse) this.secousse(0.25 * k); }
        dec.multiplicateur = 1 + Math.floor(e.serie / 5) * 0.5;
        var kt = Math.min(1.5, k + e.serie * 0.035); // les chiffres grossissent avec le combo
        if (d.points != null) this.texte('+' + Math.round(d.points * dec.multiplicateur), p, kt);
        else if (palier >= 1) this.texte('x' + e.serie, p, kt);
        // effets manga selon le public
        var manga = this.styleManga();
        if (manga >= 2 && palier >= 2) { this.lignesVitesse(p, k); dec.effets.push('lignes de vitesse'); }
        if (manga >= 1 && palier >= 3) { this.aura(p, k); dec.effets.push('aura'); }
        if (type === 'coupe' && manga >= 2) { this.hitStop(Math.round(45 + 45 * k)); dec.effets.push('hit stop'); }
        if (manga >= 2 && k > 0.85) this.aberration(k * 0.6);
        if (d.element) this.pop(d.element, k);
        // paliers de série : message + son qui monte (la « montée » rend accro)
        var paliers = [3, 5, 8, 12, 16, 20];
        var palierAtteint = paliers.indexOf(e.serie) >= 0 || (e.serie > 20 && e.serie % 5 === 0);
        if (palierAtteint) {
          if (this.styleManga() >= 1 && Math.random() < 0.75) { this.onomatopee(choisir(type === 'coupe' ? ONOMATOPEES.coupe : ONOMATOPEES.combo), p, k); dec.effets.push('onomatopée'); }
          dec.message = MESSAGES.serie[Math.min(paliers.indexOf(e.serie) < 0 ? 6 : paliers.indexOf(e.serie) + (Math.random() < 0.3 ? 1 : 0), 6)];
          this.banniere(dec.message, k);
          this.son('combo');
          dec.raison += 'Palier de série ' + e.serie + ' : message et son montant. ';
        } else this.son(type === 'coupe' ? 'coupe' : 'bonne');
        // bonus rare imprévisible (récompense variable, avec « filet » : plus on attend, plus il est probable)
        var chance = Math.min(0.35, 0.05 + e.secheresse * 0.012);
        if (this.opt.bonusRares && e.serie >= 2 && Math.random() < chance) {
          dec.pepite = true; e.secheresse = 0; e.pepites++;
          var obj = this.opt.collection !== false ? this.tirerObjet() : null; dec.objet = obj;
          setTimeout(function () { self.lance('pepite', p, 1); self.son('pepite'); self.banniere(choisir(MESSAGES.pepite), 0.9, '#FFD23F');
            if (obj) setTimeout(function () { self.texte((obj.nouveau ? 'Nouveau : ' : '') + obj.nom, { x: p.x, y: Math.max(p.y, self.zoneSure().y1 + 60) }, 0.5); }, 450); }, 180);
          dec.effets.push('pepite'); dec.raison += 'Pépite surprise (chance ' + Math.round(chance * 100) + ' %) : le joueur ne sait jamais quand elle tombe. ';
          if (d.onPepite) d.onPepite();
        }
        if (!dec.raison) dec.raison = 'Bonne action, série ' + e.serie + (rapide ? ' (rapide : effet renforcé)' : '') + '.';
        e.excitation = Math.min(1, e.excitation + 0.12 + k * 0.1);
        break; }

      case 'erreur': case 'rate': {
        var perdue = e.serie;
        e.serie = 0; e.erreurs++; e.erreursSuite++; e.recents.push(false); if (e.recents.length > 10) e.recents.shift();
        var taux = this.tauxErreur();
        dec.intensite = 0.3;
        fait(th.sig.erreur[0], 0.3);
        if (d.element) this.tremble(d.element);
        if (d.grave && this.opt.secousses && this.pub.secousse) { this.secousse(0.6); this.flash('#E63946', 0.18); }
        this.son(d.grave ? 'erreurGrave' : 'erreur');
        if (d.grave && this.styleManga() >= 1) {
          if (this.styleManga() >= 2) { this.impactImage(0.8); this.hitStop(90); dec.effets.push('image d\'impact', 'hit stop'); }
          this.onomatopee(choisir(ONOMATOPEES.grave), p, 0.7); dec.effets.push('onomatopée');
        }
        if (e.erreursSuite >= 3 || (taux > 0.5 && e.recents.length >= 4 && e.erreursSuite >= 2)) {
          e.aide = true; e.erreursSuite = 0;
          dec.message = choisir(MESSAGES.encourage); this.banniere(dec.message, 0.4, '#9EC5FF');
          dec.raison = 'Le joueur peine (' + Math.round(taux * 100) + ' % d\'erreurs) : message doux, et la prochaine réussite sera fêtée en grand.';
          dec.conseilJeu = 'faciliter';
        } else dec.raison = perdue >= 5 ? 'Série de ' + perdue + ' perdue : effet discret pour ne pas décourager.' : 'Erreur : retour doux et discret.';
        e.excitation = Math.max(0, e.excitation - 0.2);
        break; }

      case 'presque':
        dec.intensite = 0.4; fait('anneau', 0.4, { couleurs: th.doux });
        dec.message = choisir(MESSAGES.presque); this.texte(dec.message, p, 0.5); this.son('presque');
        dec.raison = 'Presque réussi : on le montre, ça donne envie de réessayer tout de suite.'; break;

      case 'clic':
        fait('anneau', 0.12, { couleurs: th.doux }); this.son('clic'); dec.raison = 'Retour tactile léger.'; break;

      case 'niveau': {
        var niv = d.niveau || '';
        dec.intensite = 0.8; fait('anneau', 0.9); fait(this.varier(th.sig.grand), 0.8);
        dec.message = ('Nivo ' + niv).trim();
        if (d.transition) {
          var selfN = this, typeT = d.transition === true ? null : d.transition;
          dec.effets.push('transition ' + (typeT || TRANSITION_THEME[this.opt.theme] || 'pailleenqueue'));
          this.transition(typeT, d.onMilieu).then(function () { selfN.banniere(dec.message, 0.9); selfN.son('niveau'); });
          dec.raison = 'Passage de niveau avec transition plein écran adaptée au thème.';
        } else { this.halo(0.6); this.banniere(dec.message, 0.9); this.son('niveau'); dec.raison = 'Passage de niveau : moment fort, onde + bannière.'; }
        break; }

      case 'record':
        if (this.styleManga() >= 2) { this.planDramatique(p, 900); dec.effets.push('plan dramatique'); }
        dec.intensite = 1; fait('pepite', 1); dec.message = MESSAGES.record[0]; this.banniere(dec.message, 1, '#FFD23F'); this.son('pepite');
        dec.raison = 'Nouveau record personnel.'; break;

      case 'pepite':
        dec.intensite = 1; dec.pepite = true; fait('pepite', 1); dec.message = choisir(MESSAGES.pepite); this.banniere(dec.message, 1, '#FFD23F'); this.son('pepite');
        dec.raison = 'Bonus déclenché par le jeu.'; break;

      case 'victoire': {
        var precision = e.bonnes + e.erreurs ? e.bonnes / (e.bonnes + e.erreurs) : 1;
        var kv = borne(0.55 + precision * 0.45, 0, 1); dec.intensite = kv;
        th.sig.victoire.forEach(function (n) { fait(n, kv); });
        this.halo(0.8); dec.message = choisir(MESSAGES.victoire); this.banniere(dec.message, 1); this.son('victoire');
        if (this.styleManga() >= 2) { this.planDramatique(p, 1000); dec.effets.push('plan dramatique'); }
        else if (this.styleManga() === 1) { var pc = this.position({}); this.onomatopee('OTÉ !', { x: pc.x, y: pc.y + 90 }, 0.9); dec.effets.push('onomatopée'); }
        dec.raison = 'Victoire, précision ' + Math.round(precision * 100) + ' % : célébration ' + (kv > 0.85 ? 'maximale.' : 'forte.'); break; }

      case 'defaite':
        dec.intensite = 0.3; fait(th.sig.erreur[0], 0.4); dec.message = choisir(MESSAGES.defaite); this.banniere(dec.message, 0.4, '#9EC5FF'); this.son('defaite');
        dec.raison = 'Fin de partie : ton doux, on donne envie de rejouer.'; break;

      case 'debut':
        this.reinitialiser(); dec.message = MESSAGES.debut[0]; this.banniere(dec.message, 0.6); this.son('debut');
        dec.raison = 'Début de partie.'; break;

      default:
        if (EFFETS[type]) { fait(type, d.intensite == null ? 0.7 : d.intensite, { couleur: d.couleur }); dec.raison = 'Effet demandé directement.'; }
    }
    dec.serie = e.serie;
    this.journal.unshift(dec); if (this.journal.length > 40) this.journal.pop();
    if (this.opt.onDecision) this.opt.onDecision(dec);
    return dec;
  };

  /* ---- effets d'écran et d'éléments ---- */
  /* une pièce arrive sur le score : petit « pop » du compteur (limité à un toutes les 70 ms) */
  Directeur.prototype.arrivee = function () {
    var t = maintenant(); if (this._arr && t - this._arr < 70) return; this._arr = t;
    var el = this.opt.cibleScore; if (el && el.animate) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' });
    if (this.opt.sons) this.audio.echantillon('clic', { demi: hasard(4, 9), vol: 0.9 }) || this.audio.joue('clic');
    if (this.opt.onArrivee) this.opt.onArrivee();
  };
  Directeur.prototype.son = function (nom) { if (this.opt.sons) this.audio.joue(nom, this.e.serie); };
  Directeur.prototype.secousse = function (k) {
    if (!this.opt.secousses || !this.pub.secousse) return;
    var cible = this.cibleEcran();
    if (!cible || !cible.animate) return;
    var a = 3 + 9 * k * this.pub.secousse, im = [];
    for (var i = 0; i < 6; i++) im.push({ transform: 'translate(' + hasard(-a, a).toFixed(1) + 'px,' + hasard(-a, a).toFixed(1) + 'px)' });
    im.push({ transform: 'translate(0,0)' });
    cible.animate(im, { duration: 260 + 120 * k, easing: 'ease-out' });
  };
  Directeur.prototype.calqueDiv = function (css) {
    var el = document.createElement('div'); el.style.cssText = 'position:absolute;pointer-events:none;' + css;
    this.calque.appendChild(el); return el;
  };
  Directeur.prototype.flash = function (couleur, force) {
    var el = this.calqueDiv('inset:0;background:' + (couleur || '#fff'));
    var an = el.animate([{ opacity: force || 0.35 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.halo = function (k) {
    var c = this.theme.couleurs[0], rgb = versRgb(c).join(',');
    var el = this.calqueDiv('inset:0;background:radial-gradient(ellipse at center, rgba(' + rgb + ',0) 45%, rgba(' + rgb + ',' + (0.25 + 0.3 * k).toFixed(2) + ') 100%)');
    var an = el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.texte = function (txt, p, k) {
    var taille = Math.round((18 + 14 * k) * this.pub.texte);
    var el = this.calqueDiv('left:' + p.x + 'px;top:' + p.y + 'px;transform:translate(-50%,-50%);font:900 ' + taille + 'px/1 system-ui,-apple-system,sans-serif;color:#fff;white-space:nowrap;' +
      'text-shadow:0 2px 0 ' + this.theme.couleurs[0] + (this.lum.elements ? ',' + this.ombreCss(0.7, 'texte') : ',0 0 12px rgba(0,0,0,.35)'));
    el.textContent = txt;
    var an = el.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.2 },
      { transform: 'translate(-50%,-220%) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.banniere = function (txt, k, couleur) {
    if (!this.opt.messages) return;
    if (this.bann) this.bann.remove();
    var cs = this.theme.couleurs, s = this.zoneSure();
    var taille = Math.round(Math.min(s.x2 - s.x1, 700) / Math.max(6, txt.length) * 1.5 * this.pub.texte);
    taille = borne(taille, 28, 84);
    var el = this.calqueDiv('left:50%;top:38%;transform:translate(-50%,-50%);max-width:' + (s.x2 - s.x1) + 'px;text-align:center;font:900 ' + taille + 'px/1.05 system-ui,-apple-system,sans-serif;' +
      'color:' + (couleur || cs[1] || '#FFD23F') + ';-webkit-text-stroke:' + Math.max(2, taille / 18).toFixed(1) + 'px ' + (cs[3] || '#222') + ';paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.25),' + (this.lum.elements ? this.ombreCss(1, 'texte') + ',' : '') + '0 0 30px ' + (couleur || cs[1] || '#fff'));
    el.textContent = txt; this.bann = el;
    var an = el.animate([{ transform: 'translate(-50%,-50%) scale(.2) rotate(-8deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.12) rotate(2deg)', opacity: 1, offset: 0.18 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(0)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.8 },
      { transform: 'translate(-50%,-70%) scale(.9)', opacity: 0 }], { duration: 1300 + 400 * (k || 0.5), easing: 'ease-out' });
    var self = this; an.onfinish = function () { el.remove(); if (self.bann === el) self.bann = null; };
  };
  Directeur.prototype.pop = function (el, k) {
    if (!el.animate) return; var s = 1 + 0.12 + 0.15 * (k || 0.5);
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + s + ')' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    var fin = el._kwfxH != null ? this.ombreCss(el._kwfxH) : 'none', haut = this.lum.elements ? ' ' + this.ombreCss(0.9) : '';
    el.animate([{ filter: 'brightness(1.6) drop-shadow(0 0 14px ' + this.theme.couleurs[1] + ')' + haut }, { filter: fin }], { duration: 600 });
  };
  Directeur.prototype.tremble = function (el) {
    if (!el.animate) return;
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px) rotate(-2deg)' }, { transform: 'translateX(6px) rotate(2deg)' },
      { transform: 'translateX(-4px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
  };
  Directeur.prototype.ralenti = function (duree) {
    var m = this.particules; m.tempsCible = 0.25;
    setTimeout(function () { m.tempsCible = 1; }, duree || 600);
  };
  Directeur.prototype.ambiance = function (actif) {
    this.particules.lancerAmbiance(actif ? this.theme.sig.ambiance : null);
    return this;
  };
  /* Joue un effet précis à la main : fx.joue('confettis', { x, y, intensite: .8 }) */
  Directeur.prototype.joue = function (nom, d) {
    d = d || {}; var p = this.position(d), k = d.intensite == null ? 0.7 : d.intensite;
    if (EFFETS[nom]) this.lance(nom, p, k, { couleur: d.couleur, couleurs: d.couleurs });
    else if (nom === 'secousse') this.secousse(k);
    else if (nom === 'flash') this.flash(d.couleur, k * 0.5);
    else if (nom === 'halo') this.halo(k);
    else if (nom === 'banniere') this.banniere(d.texte || 'Bravo !', k);
    else if (nom === 'texte') this.texte(d.texte || '+1', p, k);
    else if (nom === 'ralenti') this.ralenti(d.duree);
    else if (nom === 'lignes') this.lignesVitesse(p, k);
    else if (nom === 'impact') this.impactImage(k);
    else if (nom === 'hitstop') this.hitStop(d.duree || 100);
    else if (nom === 'onomatopee') this.onomatopee(d.texte || choisir(ONOMATOPEES.combo), p, k);
    else if (nom === 'aura') this.aura(p, k);
    else if (nom === 'plan') this.planDramatique(p, d.duree);
    else if (nom === 'aberration') this.aberration(k);
    else if (nom === 'transition') return this.transition(d.type, d.onMilieu);
    return this;
  };
  Directeur.prototype.etat = function () {
    var e = this.e;
    return { serie: e.serie, meilleure: e.meilleure, bonnes: e.bonnes, erreurs: e.erreurs, pepites: e.pepites,
      tauxErreur: Math.round(this.tauxErreur() * 100), excitation: Math.round(e.excitation * 100),
      qualite: Math.round(this.particules.qualite * 100), fps: this.particules.fps, particules: this.particules.n, rendu: this.particules.rendu.nom,
      duree: Math.round((maintenant() - e.debut) / 1000) };
  };
  Directeur.prototype.detruire = function () { this.meteo(null); this.musique(false); if (this._vis) document.removeEventListener('visibilitychange', this._vis); this.particules.c.remove(); this.calque.remove(); if (this.particules.ro) this.particules.ro.disconnect(); this.particules.ambiances = []; };

  /* ======================================================================
   * 6 bis. EFFETS MANGA / ANIME et EFFETS « JEUX MOBILES À SUCCÈS »
   * ==================================================================== */
  var ONOMATOPEES = { coupe: ['VLAP !', 'FIOU !'], grave: ['BOUF !', 'KRAK !', 'PAF !'], combo: ['OTÉ !', 'PAF !', 'BAM !'], victoire: ['OTÉ !'] };
  /* 0 = aucun (3-6 ans), 1 = onomatopées seulement (7-12 ans), 2 = manga complet (ados, adultes) */
  Directeur.prototype.styleManga = function () {
    if (this.opt.manga != null) return this.opt.manga;
    return this.opt.public === 'ado' || this.opt.public === 'adulte' ? 2 : this.opt.public === 'enfant' ? 1 : 0;
  };
  Directeur.prototype.cibleEcran = function () {
    return this.opt.zoneShake || (this.plein ? document.body.firstElementChild : this.conteneur);
  };
  /* Hit stop : tout se fige 60 à 120 ms au moment du coup. Le jeu peut lire fx.estFige() dans sa boucle. */
  Directeur.prototype.hitStop = function (ms) {
    ms = ms || 80; var self = this, m = this.particules;
    this.fige = true; m.temps = 0; m.tempsCible = 0;
    if (this.opt.onHitStop) this.opt.onHitStop(ms);
    clearTimeout(this._hs);
    this._hs = setTimeout(function () { self.fige = false; m.temps = 1; m.tempsCible = 1; }, ms);
  };
  Directeur.prototype.estFige = function () { return !!this.fige; };
  /* Image d'impact : flash blanc 2 à 4 images, puis noir et blanc contrasté, puis retour à la couleur */
  Directeur.prototype.impactImage = function (k) {
    if (this.opt.public === 'petit') return;
    var el = this.calqueDiv('inset:0;background:#fff;opacity:' + (0.75 + 0.2 * (k || 0.8)).toFixed(2));
    setTimeout(function () { el.remove(); }, 50);
    var c = this.cibleEcran(); if (!c || !c.animate) return;
    c.animate([{ filter: 'grayscale(1) contrast(1.9) brightness(1.1)' }, { filter: 'grayscale(1) contrast(1.9) brightness(1.1)', offset: 0.55 }, { filter: 'none' }], { duration: 190, delay: 50, easing: 'ease-out' });
  };
  /* Lignes de vitesse qui convergent vers l'action */
  Directeur.prototype.lignesVitesse = function (p, k) {
    var t = this.taille(), dpr = Math.min(global.devicePixelRatio || 1, 2), c = document.createElement('canvas');
    c.width = Math.max(1, t.l * dpr); c.height = Math.max(1, t.h * dpr);
    c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;transform-origin:' + p.x + 'px ' + p.y + 'px';
    var x = c.getContext('2d'); x.scale(dpr, dpr);
    var R = Math.hypot(t.l, t.h), n = Math.round((40 + 50 * k) * this.particules.qualite), r0 = Math.min(t.l, t.h) * (0.24 - 0.08 * k);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, w = hasard(0.004, 0.02), r1 = r0 * hasard(1, 1.7);
      x.fillStyle = i % 5 ? 'rgba(255,255,255,.85)' : 'rgba(20,20,30,.45)';
      x.beginPath(); x.moveTo(p.x + Math.cos(a - w) * R, p.y + Math.sin(a - w) * R);
      x.lineTo(p.x + Math.cos(a) * r1, p.y + Math.sin(a) * r1); x.lineTo(p.x + Math.cos(a + w) * R, p.y + Math.sin(a + w) * R); x.fill();
    }
    this.calque.appendChild(c);
    var an = c.animate([{ opacity: 0, transform: 'scale(1.15)' }, { opacity: 0.9, transform: 'scale(1)', offset: 0.2 }, { opacity: 0, transform: 'scale(.97)' }], { duration: 420 + 220 * k, easing: 'ease-out' });
    an.onfinish = function () { c.remove(); };
  };
  /* Onomatopée géante sur un éclat en étoile tramé (halftone), contour épais, ombre franche */
  Directeur.prototype.onomatopee = function (txt, p, k) {
    k = k == null ? 0.8 : k;
    var cs = this.theme.couleurs, taille = borne(Math.round((44 + 40 * k) * this.pub.texte), 38, 108), s = this.zoneSure();
    var x = borne(p.x + hasard(-20, 20), s.x1 + taille * 1.3, s.x2 - taille * 1.3), y = borne(p.y - taille * 0.7, s.y1 + taille, s.y2 - taille * 0.5);
    // ne jamais chevaucher la bannière centrale (à 38 % de la hauteur)
    if (Math.abs(y - s.h * 0.38) < taille * 1.3) y = Math.min(s.y2 - taille * 0.6, s.h * 0.38 + taille * 1.9);
    var wrap = this.calqueDiv('left:' + x + 'px;top:' + y + 'px;width:0;height:0');
    var W = taille * 3.2, ext = W / 2, int = W / 3.3, pts = [];
    for (var i = 0; i < 28; i++) { var r = i % 2 ? int * hasard(0.85, 1.05) : ext * hasard(0.8, 1), a = i * Math.PI / 14; pts.push((Math.cos(a) * r).toFixed(1) + ',' + (Math.sin(a) * r * 0.62).toFixed(1)); }
    var id = 'kwfxtr' + ((Math.random() * 1e6) | 0);
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', W); svg.setAttribute('height', W); svg.setAttribute('viewBox', (-W / 2) + ' ' + (-W / 2) + ' ' + W + ' ' + W);
    svg.style.cssText = 'position:absolute;left:' + (-W / 2) + 'px;top:' + (-W / 2) + 'px;overflow:visible';
    svg.innerHTML = '<defs><pattern id="' + id + '" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.9" fill="rgba(0,0,0,.3)"/></pattern></defs>' +
      '<polygon points="' + pts.join(' ') + '" fill="' + (cs[1] || '#FFD23F') + '" stroke="#111" stroke-width="4" stroke-linejoin="round"/>' +
      '<polygon points="' + pts.join(' ') + '" fill="url(#' + id + ')"/>';
    wrap.appendChild(svg);
    var t = document.createElement('div');
    t.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-50%) rotate(-9deg) skewX(-8deg);font:900 ' + taille + 'px/1 Impact,"Arial Black",system-ui,sans-serif;letter-spacing:1px;color:' + (cs[2] || '#E63946') + ';-webkit-text-stroke:' + Math.max(3, taille / 14).toFixed(1) + 'px #111;paint-order:stroke fill;text-shadow:5px 6px 0 #111;white-space:nowrap';
    t.textContent = txt; wrap.appendChild(t);
    var an = wrap.animate([{ transform: 'scale(.15) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.3) rotate(4deg)', opacity: 1, offset: 0.14 },
      { transform: 'scale(1) rotate(0)', opacity: 1, offset: 0.26 }, { transform: 'scale(1.04) rotate(-1deg)', opacity: 1, offset: 0.75 }, { transform: 'scale(1.2)', opacity: 0 }], { duration: 950, easing: 'ease-out' });
    an.onfinish = function () { wrap.remove(); };
  };
  /* Aura lumineuse et étincelles autour de l'action lors d'un combo */
  Directeur.prototype.aura = function (p, k) {
    var c = versRgb(this.theme.couleurs[1] || '#FFD23F').join(','), r = Math.round(60 + 70 * k);
    var a = this.calqueDiv('left:' + p.x + 'px;top:' + p.y + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px;margin:-' + r + 'px 0 0 -' + r + 'px;border-radius:50%;' +
      'background:radial-gradient(circle,rgba(' + c + ',.6) 0%,rgba(' + c + ',.25) 42%,rgba(' + c + ',0) 70%);mix-blend-mode:screen');
    var an = a.animate([{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.45)', opacity: 0 }], { duration: 750, easing: 'ease-out' });
    an.onfinish = function () { a.remove(); };
    this.lance('etincelles', p, k * 0.6);
  };
  /* Plan rapproché dramatique : bandes noires + zoom vers l'action + ralenti */
  Directeur.prototype.planDramatique = function (p, duree) {
    duree = duree || 950; var h = Math.round(this.taille().h * 0.13);
    var haut = this.calqueDiv('left:0;right:0;top:-2px;height:' + h + 'px;background:#000'), bas = this.calqueDiv('left:0;right:0;bottom:-2px;height:' + h + 'px;background:#000');
    var kf = function (d) { return [{ transform: 'translateY(' + d + ')' }, { transform: 'translateY(0)', offset: 0.18 }, { transform: 'translateY(0)', offset: 0.82 }, { transform: 'translateY(' + d + ')' }]; };
    haut.animate(kf('-100%'), { duration: duree, easing: 'ease-in-out' }).onfinish = function () { haut.remove(); };
    bas.animate(kf('100%'), { duration: duree, easing: 'ease-in-out' }).onfinish = function () { bas.remove(); };
    var c = this.cibleEcran();
    if (c && c.animate && !this.plein) {
      var o = c.style.transformOrigin; c.style.transformOrigin = p.x + 'px ' + p.y + 'px';
      c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.25 }, { transform: 'scale(1.1)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: duree, easing: 'ease-in-out' })
        .onfinish = function () { c.style.transformOrigin = o; };
    }
    this.ralenti(duree * 0.7);
  };
  /* Aberration chromatique légère (web uniquement) */
  Directeur.prototype.aberration = function (k) {
    if (this.opt.support === 'epub') return;
    var c = this.cibleEcran(); if (!c || !c.animate) return; var d = (2 + 4 * (k || 0.6)).toFixed(1);
    c.animate([{ filter: 'drop-shadow(' + d + 'px 0 0 rgba(255,0,60,.55)) drop-shadow(-' + d + 'px 0 0 rgba(0,220,255,.55))' }, { filter: 'none' }], { duration: 230, easing: 'ease-out' });
  };
  /* Transitions de niveau spectaculaires : vague, lave, cyclone, envol de paille-en-queue.
   * auMilieu() est appelé quand l'écran est couvert (pour changer de niveau). Renvoie une promesse. */
  var TRANSITION_THEME = { volcan: 'lave', lagon: 'vague', oiseaux: 'pailleenqueue', flore: 'pailleenqueue', fruits: 'vague', lontan: 'pailleenqueue', noel: 'cyclone', mystere: 'cyclone', reunion: 'pailleenqueue' };
  Directeur.prototype.transition = function (type, auMilieu) {
    type = type || TRANSITION_THEME[this.opt.theme] || 'pailleenqueue';
    var self = this, D = this.opt.support === 'epub' ? 1200 : 1500, cs = this.theme.couleurs;
    var el = this.calqueDiv('inset:0;overflow:hidden'); el.style.pointerEvents = 'auto'; el.style.zIndex = '2';
    var couvre = [{ offset: 0 }, { offset: 0.42 }, { offset: 0.58 }, { offset: 1 }];
    function anime(node, a, b, c, d, opts) { var k = couvre.map(function (f, i) { var o = {}; o.offset = f.offset; o.transform = [a, b, c, d][i]; return o; }); return node.animate(k, opts || { duration: D, easing: 'cubic-bezier(.6,0,.4,1)' }); }
    if (type === 'vague') {
      el.innerHTML = '<svg viewBox="0 0 140 100" preserveAspectRatio="none" style="position:absolute;top:0;left:-20%;width:140%;height:100%"><defs><linearGradient id="kwv" x1="0" x2="1"><stop offset="0" stop-color="#0077B6"/><stop offset="1" stop-color="#48CAE4"/></linearGradient></defs>' +
        '<path d="M20 0 H118 Q132 8 122 18 Q112 28 126 38 Q138 50 122 60 Q110 70 126 80 Q136 90 120 100 H20 Q8 90 18 80 Q30 70 16 60 Q4 50 18 40 Q30 30 14 20 Q4 10 20 0Z" fill="url(#kwv)"/>' +
        '<path d="M118 0 Q132 8 122 18 Q112 28 126 38 Q138 50 122 60 Q110 70 126 80 Q136 90 120 100" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3" opacity=".9"/></svg>';
      anime(el.firstChild, 'translateX(-110%)', 'translateX(0)', 'translateX(0)', 'translateX(110%)');
      setTimeout(function () { self.lance('bulles', { x: self.taille().l / 2, y: self.taille().h * 0.6 }, 1); }, D * 0.45);
    } else if (type === 'lave') {
      el.innerHTML = '<svg viewBox="0 0 100 120" preserveAspectRatio="none" style="position:absolute;left:0;top:-20%;width:100%;height:120%"><defs><linearGradient id="kwl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a0d00"/><stop offset=".55" stop-color="#E63900"/><stop offset="1" stop-color="#FFB000"/></linearGradient></defs>' +
        '<path d="M0 0 H100 V100 Q95 112 90 100 Q84 92 78 106 Q72 118 66 102 Q60 94 52 110 Q46 120 40 103 Q34 94 26 108 Q20 116 14 101 Q8 94 0 104Z" fill="url(#kwl)"/></svg>';
      anime(el.firstChild, 'translateY(-105%)', 'translateY(0)', 'translateY(0)', 'translateY(105%)');
      setTimeout(function () { self.lance('braises', { x: self.taille().l / 2, y: self.taille().h * 0.8 }, 1); self.secousse(0.4); }, D * 0.4);
    } else if (type === 'cyclone') {
      var sp = document.createElement('div');
      sp.style.cssText = 'position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;border-radius:50%;background:repeating-conic-gradient(from 0deg,' + cs[0] + ' 0 15deg,#ffffff 15deg 22deg,' + (cs[3] || cs[1]) + ' 22deg 37deg,#ffffff 37deg 44deg)';
      el.appendChild(sp);
      sp.animate([{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.2) rotate(540deg)', offset: 0.42 }, { transform: 'scale(1.2) rotate(620deg)', offset: 0.58 }, { transform: 'scale(0) rotate(1080deg)' }], { duration: D, easing: 'cubic-bezier(.6,0,.4,1)' });
    } else {
      var ciel = document.createElement('div');
      ciel.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,#BDE3FF,#FFFFFF)';
      el.appendChild(ciel);
      ciel.animate([{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: D, easing: 'ease-in-out' });
      var t = this.taille();
      for (var i = 0; i < 7; i++) {
        var o = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), sz = hasard(50, 110);
        o.setAttribute('viewBox', '0 0 120 60'); o.setAttribute('width', sz); o.setAttribute('height', sz / 2);
        o.style.cssText = 'position:absolute;left:0;top:0;overflow:visible';
        // paille-en-queue stylisé : corps blanc, ailes, deux longues plumes de queue
        o.innerHTML = '<path d="M38 30 Q22 6 4 10 Q24 18 34 34Z M58 30 Q74 4 96 8 Q76 18 62 34Z" fill="#fff" stroke="#2b3a55" stroke-width="2"/>' +
          '<ellipse cx="48" cy="33" rx="16" ry="7" fill="#fff" stroke="#2b3a55" stroke-width="2"/><circle cx="62" cy="31" r="1.6" fill="#111"/><path d="M64 33 L71 32 L64 35Z" fill="#F4A300"/>' +
          '<path d="M33 35 Q14 44 -18 40 M33 36 Q12 50 -14 52" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M33 35 Q14 44 -18 40 M33 36 Q12 50 -14 52" fill="none" stroke="#2b3a55" stroke-width=".8"/>';
        el.appendChild(o);
        var y0 = t.h * hasard(0.55, 1), y1 = y0 - t.h * hasard(0.5, 0.9), dl = i * 70;
        o.animate([{ transform: 'translate(' + (-150) + 'px,' + y0 + 'px) rotate(-12deg)' }, { transform: 'translate(' + (t.l + 150) + 'px,' + y1 + 'px) rotate(-6deg)' }], { duration: D * 0.9, delay: dl, easing: 'ease-in-out', fill: 'both' });
      }
      setTimeout(function () { self.lance('plumes', { x: t.l / 2, y: t.h / 2 }, 1); }, D * 0.45);
    }
    if (this.opt.sons) { var s = { vague: 'bulles', lave: 'volcan', cyclone: 'vent', pailleenqueue: 'oiseau' }[type]; this.audio.echantillon(s) || this.son('niveau'); }
    return new Promise(function (ok) {
      setTimeout(function () { if (auMilieu) try { auMilieu(); } catch (e) {} }, D * 0.5);
      setTimeout(function () { el.remove(); ok(); }, D + 60);
    });
  };

  /* ======================================================================
   * 6 ter. PROGRESSION : record personnel, défi du jour, collection péi
   *         (sauvegarde sur l'appareil ; rien n'est acheté, aucune pression)
   * ==================================================================== */
  var COLLECTION = [
    { id: 'letchi', nom: 'Letchi doré' }, { id: 'vanille', nom: 'Gousse de vanille Bourbon' }, { id: 'bertel', nom: 'Bertel en vacoa' },
    { id: 'van', nom: 'Van tressé' }, { id: 'kayamb', nom: 'Kayamb' }, { id: 'plume', nom: 'Plume de paille-en-queue' },
    { id: 'flamboyant', nom: 'Fleur de flamboyant' }, { id: 'lambrequin', nom: 'Lambrequin de kaz créole' }, { id: 'lave', nom: 'Pierre de lave du Piton' },
    { id: 'coquillage', nom: 'Coquillage du lagon' }, { id: 'galet', nom: 'Galet de la rivière' }, { id: 'goni', nom: 'Sac goni' }
  ];
  var DEFIS = [
    { texte: 'Fais une série de 8', test: function (e) { return e.meilleure >= 8; } },
    { texte: 'Trouve 2 pépites dans une partie', test: function (e) { return e.pepites >= 2; } },
    { texte: 'Termine une partie sans erreur (au moins 5 réussites)', test: function (e) { return e.bonnes >= 5 && e.erreurs === 0; } },
    { texte: 'Fais une série de 12', test: function (e) { return e.meilleure >= 12; } },
    { texte: 'Réussis 25 actions dans une partie', test: function (e) { return e.bonnes >= 25; } },
    { texte: 'Fais une série de 5 trois fois de suite', test: function (e) { return e.meilleure >= 5; } }
  ];
  function jourDuJour() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  Directeur.prototype.cle = function () { return 'kwfx:' + (this.opt.jeu || (global.location ? location.pathname : 'jeu')); };
  Directeur.prototype.sauvegarde = function (v) {
    if (v) { this._sv = v; try { localStorage.setItem(this.cle(), JSON.stringify(v)); } catch (e) {} return v; }
    if (this._sv) return this._sv;
    var s = null; try { s = JSON.parse(localStorage.getItem(this.cle())); } catch (e) {}
    this._sv = s || { record: 0, collection: [], defis: {} };
    return this._sv;
  };
  Directeur.prototype.defiDuJour = function () {
    var j = jourDuJour(), h = 0; for (var i = 0; i < j.length; i++) h = (h * 31 + j.charCodeAt(i)) % 9973;
    var d = DEFIS[h % DEFIS.length], sv = this.sauvegarde();
    return { texte: d.texte, reussi: !!sv.defis[j], test: d.test, jour: j };
  };
  Directeur.prototype.tirerObjet = function () {
    var sv = this.sauvegarde(), manquants = COLLECTION.filter(function (o) { return sv.collection.indexOf(o.id) < 0; });
    var o = choisir(manquants.length ? manquants : COLLECTION), nouveau = sv.collection.indexOf(o.id) < 0;
    if (nouveau) sv.collection.push(o.id);
    this.sauvegarde(sv);
    return { id: o.id, nom: o.nom, nouveau: nouveau, total: sv.collection.length, sur: COLLECTION.length };
  };
  Directeur.prototype.collection = function () {
    var sv = this.sauvegarde();
    return COLLECTION.map(function (o) { return { id: o.id, nom: o.nom, obtenu: sv.collection.indexOf(o.id) >= 0 }; });
  };
  /* À appeler en fin de partie : fx.finPartie(score) */
  Directeur.prototype.finPartie = function (score) {
    var sv = this.sauvegarde(), e = this.e, res = { score: score || 0, ancienRecord: sv.record, nouveauRecord: false };
    if (score != null && score > sv.record) { res.nouveauRecord = sv.record > 0; sv.record = score; }
    res.record = sv.record;
    var d = this.defiDuJour();
    res.defi = { texte: d.texte, reussi: d.reussi, nouveau: false };
    if (!d.reussi && d.test(e)) { sv.defis[d.jour] = true; res.defi.reussi = true; res.defi.nouveau = true; }
    res.collection = { obtenus: sv.collection.length, total: COLLECTION.length };
    this.sauvegarde(sv);
    var self = this;
    if (res.nouveauRecord) this.evenement('record');
    if (res.defi.nouveau) setTimeout(function () { self.banniere('Défi du jour réussi !', 0.9, '#FFD23F'); self.lance('confettis', self.position({}), 0.9); self.son('pepite'); }, res.nouveauRecord ? 1500 : 0);
    return res;
  };

  /* ======================================================================
   * 7. LE CONSEILLER (propositions d'effets pour créer ou améliorer un jeu)
   * ==================================================================== */
  var TYPES = {
    quiz: { nom: 'Quiz / QCM', coeur: 'Chaque bonne réponse doit « claquer » ; la série est le moteur principal.',
      evts: { bonne: 'succès du thème + pop sur la réponse + son qui monte avec la série', erreur: 'tremblement de la mauvaise réponse + poussière légère, puis montrer la bonne en douceur', presque: 'si la réponse était proche (même famille de mots)', victoire: 'feu d\'artifice si 80 % et plus, pluie de confettis sinon', debut: 'bannière « Alon zoué ! »' },
      astuces: ['Afficher la série (x3, x5...) près du score', 'Une question bonus surprise quand une pépite tombe', 'Chrono doux en mode « Mi rode problèm » : réponse rapide = effet renforcé (passer { rapide: true })'] },
    memory: { nom: 'Memory / paires', coeur: 'La paire trouvée est le moment fort ; l\'échec doit rester presque invisible.',
      evts: { clic: 'retour tactile léger au retournement', bonne: 'éclat entre les deux cartes + pop sur chacune', erreur: 'simple tremblement, sans poussière ni son appuyé (on ne punit pas la mémoire)', victoire: 'pluie + feu d\'artifice, bannière' },
      astuces: ['Les 2 dernières paires : ralentir (fx.joue(\'ralenti\')) pour créer du suspense', 'Pépite = carte dorée qui rapporte double'] },
    decoupe: { nom: 'Découpe / arcade (type Koup Koup)', coeur: 'Sensation physique : jus, son de lame, combos en rafale.',
      evts: { coupe: 'giclée de jus à la couleur du fruit ({ couleur }) + souffle de lame + points flottants', bonne: 'combo si plusieurs coupes en moins d\'1,3 s', erreur: 'objet raté : poussière ; bombe/piment interdit : { grave: true } secousse + flash rouge léger', record: 'quand le meilleur score tombe', defaite: 'ton doux' },
      astuces: ['Passer la couleur exacte de chaque fruit (letchi rose, mangue orange, chouchou vert)', 'Ralenti de 0,6 s sur un combo de 5 coupes', 'Multiplicateur de score renvoyé par KwFX (décision.multiplicateur)'] },
    puzzle: { nom: 'Puzzle / blocs / alignements', coeur: 'Les réactions en chaîne doivent être de plus en plus spectaculaires.',
      evts: { bonne: 'une ligne/groupe = succès ; appeler plusieurs fois de suite pour une chaîne (l\'intensité monte seule)', niveau: 'onde + bannière « Nivo X »', presque: 'quand il manquait 1 pièce', victoire: 'feu d\'artifice' },
      astuces: ['Décaler chaque appel de 120 ms dans une chaîne pour un effet « cascade »', 'Ambiance légère activée (ambiance: true)'] },
    plantation: { nom: 'Plantation / gestion (type Mon ti zardin péi)', coeur: 'Rythme calme, récompenses fréquentes mais douces, gros moment à la récolte.',
      evts: { clic: 'arrosage/plantation : retour léger', bonne: 'plante qui pousse : feuilles ou pétales', pepite: 'récolte exceptionnelle', niveau: 'nouveau terrain débloqué', victoire: 'récolte complète' },
      astuces: ['Thème « flore » ou « fruits », mode « trankil »', 'Pépites rares = légume géant ou graine dorée', 'Pas de secousse : ambiance zen'] },
    course: { nom: 'Course / runner (type Route du Littoral)', coeur: 'Vitesse et adrénaline ; les effets ne doivent jamais cacher la route.',
      evts: { bonne: 'objet ramassé : petit éclat + son court', erreur: 'collision : { grave: true }', niveau: 'nouveau tronçon', record: 'distance record', defaite: 'ton doux, bouton rejouer immédiat' },
      astuces: ['Garder les effets dans la moitié haute (passer y)', 'Pépite = bonus de vitesse ou bouclier', 'Mode « Mi rode problèm » : combos plus forts'] },
    cherche: { nom: 'Cherche-et-trouve', coeur: 'Chaque objet trouvé est une petite fête ; les erreurs sont silencieuses.',
      evts: { trouve: 'éclat sur l\'objet + pop', presque: 'clic tout près de l\'objet (à moins de 40 px)', erreur: 'rien ou presque (clic dans le vide)', victoire: 'pluie + bannière' },
      astuces: ['Indice lumineux (halo) après 30 s sans trouver', 'Thème selon la scène'] },
    mots: { nom: 'Mots / lettres / mots croisés', coeur: 'Le mot complété doit briller ; les lettres justes donnent un petit retour.',
      evts: { clic: 'lettre posée', bonne: 'mot juste : étoiles + pop sur la ligne', erreur: 'lettre fausse : tremblement doux', victoire: 'grille finie : feu d\'artifice' },
      astuces: ['Thème « lontan » (poussière dorée) pour les mots anciens', 'Pépite = lettre offerte'] }
  };
  KwFX_conseiller = function (q) {
    q = q || {};
    var type = TYPES[q.type] || TYPES.quiz, th = THEMES[q.theme] || THEMES.reunion, pub = PUBLICS[q.public] || PUBLICS.enfant, mode = MODES[q.mode] || MODES.trankil;
    var epub = q.support === 'epub';
    var evts = Object.keys(type.evts).map(function (k) {
      var eff = k === 'bonne' || k === 'trouve' ? th.sig.succes : k === 'coupe' ? ['jus'] : k === 'erreur' ? th.sig.erreur : k === 'victoire' ? th.sig.victoire : k === 'niveau' || k === 'record' || k === 'pepite' ? th.sig.grand : ['anneau'];
      var noms = eff.map(function (n) { return EFFETS[n] ? EFFETS[n].nom : n; });
      var m = q.public === 'ado' || q.public === 'adulte' ? 2 : q.public === 'enfant' ? 1 : 0;
      if (m >= 2 && (k === 'bonne' || k === 'coupe' || k === 'trouve')) noms.push('lignes de vitesse (série 6+)', 'aura (série 10+)');
      if (m >= 2 && k === 'coupe') noms.push('hit stop');
      if (m >= 1 && (k === 'bonne' || k === 'coupe' || k === 'trouve')) noms.push('onomatopée aux paliers');
      if (m >= 2 && k === 'erreur') noms.push('image d\'impact + hit stop si piège');
      if (m >= 1 && k === 'erreur') noms.push('onomatopée BOUF ! si piège');
      if (m >= 2 && (k === 'victoire' || k === 'record')) noms.push('plan dramatique');
      if (k === 'niveau') noms.push('transition ' + ({ lave: 'coulée de lave', vague: 'vague', cyclone: 'cyclone', pailleenqueue: 'envol de paille-en-queue' })[TRANSITION_THEME[q.theme] || 'pailleenqueue']);
      var SONS_EVT = { bonne: 'Bonne réponse, qui monte avec la série', trouve: 'Bonne réponse, qui monte avec la série', coupe: 'Lame + jus', erreur: 'Erreur douce (Piège si grave)', presque: 'Presque', clic: 'Clic', niveau: 'Niveau + accent du thème', record: 'Pépite', pepite: 'Pépite', victoire: 'Victoire + accent du thème', defaite: 'Défaite douce', debut: 'Début' };
      return { evenement: k, effets: noms, son: SONS_EVT[k] || 'Clic', comment: type.evts[k] };
    });
    var eviter = ['Achats cachés, minuteurs culpabilisants, messages qui mettent la pression', 'Les effets collés aux bords de l\'écran' + (epub ? ' (Apple Books tourne la page)' : ''), 'Le même effet à chaque bonne réponse : KwFX varie déjà, ne pas forcer un effet fixe', 'Les sons agressifs ou les messages durs après une erreur'];
    if (q.public === 'petit') eviter.push('Les secousses, flashs et effets manga (désactivés automatiquement pour les 3-6 ans)');
    if (epub) eviter.push('Plus de 250 particules à la fois (KwFX limite déjà en EPUB)');
    var opts = "{ theme: '" + (q.theme || 'reunion') + "', public: '" + (q.public || 'enfant') + "', mode: '" + (q.mode || 'trankil') + "', support: '" + (q.support || 'web') + "'" + (q.type === 'plantation' || q.type === 'puzzle' ? ', ambiance: true' : '') + ' }';
    var exemples = ['const fx = KwFX.init(' + opts + ');', "fx.evenement('debut');"];
    Object.keys(type.evts).forEach(function (k) {
      if (k === 'coupe') exemples.push("fx.evenement('coupe', { event: e, couleur: fruit.couleur, points: 10 });");
      else if (k === 'bonne' || k === 'trouve') exemples.push("const d = fx.evenement('" + k + "', { element: cible, points: 10 });  // d.pepite, d.multiplicateur");
      else if (k === 'erreur') exemples.push("fx.evenement('erreur', { element: cible });");
      else if (k === 'niveau') exemples.push("fx.evenement('niveau', { niveau: 2 });");
      else if (k !== 'debut') exemples.push("fx.evenement('" + k + "');");
    });
    exemples.push("// fin de partie : record, défi du jour, collection", "const bilan = fx.finPartie(score);");
    return {
      type: type.nom, theme: th.nom, public: pub.nom, mode: mode.nom, support: epub ? 'EPUB Apple Books' : 'Site web',
      palette: th.couleurs, paletteDouce: th.doux,
      intensite: Math.round(pub.force * mode.force * 100),
      coeur: type.coeur, evenements: evts,
      astucesAddictives: type.astuces.concat([
        'Série visible et son qui monte d\'une note à chaque bonne réponse (déjà intégré)',
        'Pépites imprévisibles : 5 % de chance au départ, puis de plus en plus probables tant qu\'aucune n\'est tombée',
        'Après 3 erreurs, KwFX fête la réussite suivante en grand pour redonner confiance',
        mode === MODES.probleme ? 'Mode exigeant : combos renforcés (x1,3)' : 'Mode tranquille : effets adoucis (x0,8), ambiance détendue',
        'Défi du jour et record personnel : appeler fx.finPartie(score) à la fin de chaque partie',
        'Collection de 12 objets rares péi : chaque pépite en fait gagner un (bertel, kayamb, letchi doré...)',
        'Partie courte et bouton « Rejouer » géant, relance en un toucher'
      ]),
      aEviter: eviter,
      style: q.public === 'ado' || q.public === 'adulte' ? 'Manga complet : lignes de vitesse, hit stop, image d\'impact, onomatopées, plan dramatique' : q.public === 'enfant' ? 'Couleurs vives et onomatopées créoles, beaucoup de récompenses' : 'Effets doux, couleurs tendres, sons ronds, pas de flash',
      code: exemples.join('\n')
    };
  };
  var KwFX_conseiller;

  /* ======================================================================
   * 7 bis. NOUVEAUTÉS v2.1 : lame tactile, compteur qui roule, étoiles de fin,
   *        apparitions, vibrations, pause automatique
   * ==================================================================== */

  /* --- Vibrations (Android : Apple Books et Safari les ignorent sans erreur) --- */
  var VIBRATIONS = { bonne: 8, trouve: 8, coupe: 14, pepite: [15, 40, 15, 40, 30], record: [20, 50, 20, 50, 60], victoire: [20, 40, 20, 40, 80], niveau: [25, 50, 25], erreurGrave: [35, 30, 45] };
  Directeur.prototype.vibre = function (cle) {
    if (!this.opt.vibrations || !global.navigator || !navigator.vibrate) return;
    var v = VIBRATIONS[cle]; if (!v) return;
    if (this.opt.public === 'petit') v = typeof v === 'number' ? v : v.slice(0, 1);
    try { navigator.vibrate(v); } catch (e) { /* rien */ }
  };
  var evenementV20 = Directeur.prototype.evenement;
  Directeur.prototype.evenement = function (type, d) {
    var dec = evenementV20.call(this, type, d);
    this.vibre(type === 'erreur' && d && d.grave ? 'erreurGrave' : (type === 'bonne' && dec.multiplicateur > 1 ? 'coupe' : type));
    if (dec.pepite && type !== 'pepite') this.vibre('pepite');
    return dec;
  };

  /* --- Pause : fige les particules et coupe le son ; automatique quand la page est cachée --- */
  Directeur.prototype.pause = function () {
    this.enPause = true; var m = this.particules; m.tempsCible = 0; m.temps = 0;
    if (this.audio.ctx && this.audio.ctx.state === 'running') { this._sonEnPause = true; this.audio.ctx.suspend(); }
    return this;
  };
  Directeur.prototype.reprendre = function () {
    this.enPause = false; var m = this.particules; m.tempsCible = 1; m.temps = 1; m.dernier = 0;
    if (this._sonEnPause && this.audio.ctx) { this._sonEnPause = false; this.audio.ctx.resume(); }
    if (m.n || m.ambiances.length) m.demarre();
    return this;
  };
  Directeur.prototype.installerV21 = function () {
    var self = this;
    if (this.opt.pauseAuto !== false && global.document) {
      this._vis = function () { if (document.hidden) { if (!self.enPause) { self.pause(); self._pauseAuto = true; } } else if (self._pauseAuto) { self._pauseAuto = false; self.reprendre(); } };
      document.addEventListener('visibilitychange', this._vis);
    }
  };

  /* --- Lame tactile : traînée lumineuse qui suit le doigt (jeux de découpe, tracés, mots) --- */
  Directeur.prototype.lame = function (o) {
    o = o || {};
    var self = this, zone = o.zone || (this.plein ? document.body : this.conteneur);
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(c);
    var ctx = c.getContext('2d'), dpr = 1, pts = [], actif = false, raf = 0, dernierSon = 0, dernierEclat = 0;
    var cs = this.theme.couleurs, coul = o.couleur || cs[1] || '#FFD23F', largeur = o.largeur || (this.opt.public === 'petit' ? 16 : 12), duree = o.duree || 150;
    function redim() { var t = self.taille(); dpr = Math.min(2, global.devicePixelRatio || 1); c.width = Math.round(t.l * dpr); c.height = Math.round(t.h * dpr); }
    function local(ev) { var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(); return { x: ev.clientX - b.left, y: ev.clientY - b.top }; }
    function dessine() {
      var t = maintenant(); while (pts.length && t - pts[0].t > duree) pts.shift();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.width, c.height);
      if (pts.length > 1) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (var passe = 0; passe < 2; passe++) {
          for (var i = 1; i < pts.length; i++) {
            var a = pts[i - 1], b = pts[i], k = i / (pts.length - 1), vie = 1 - (t - b.t) / duree;
            ctx.globalAlpha = Math.max(0, vie) * (passe ? 1 : 0.55);
            ctx.strokeStyle = passe ? '#FFFFFF' : coul;
            ctx.shadowColor = coul; ctx.shadowBlur = passe ? 6 : 18;
            ctx.lineWidth = Math.max(1, largeur * k * (passe ? 0.4 : 1));
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (pts.length || actif) raf = requestAnimationFrame(dessine); else { raf = 0; ctx.clearRect(0, 0, c.width, c.height); }
    }
    function bouge(ev) {
      if (!actif) return;
      var p = local(ev), t = maintenant(), der = pts[pts.length - 1];
      var v = der ? Math.hypot(p.x - der.x, p.y - der.y) / Math.max(1, t - der.t) * 1000 : 0; // px/s
      pts.push({ x: p.x, y: p.y, t: t }); if (pts.length > 40) pts.shift();
      if (v > 1400 && t - dernierSon > 220 && self.opt.sons) { dernierSon = t; if (!self.audio.echantillon('vent', { vol: 0.35, demi: hasard(3, 7) })) self.audio.souffle(0.12, 2600, 900, 0.12); }
      if (v > 1800 && o.etincelles !== false && t - dernierEclat > 90) { dernierEclat = t; self.particules.systeme('crepitement', p.x, p.y, 0.4, { couleurs: self.theme.couleurs }); }
      if (o.onGlisse) o.onGlisse(p.x, p.y, v);
      if (!raf) raf = requestAnimationFrame(dessine);
    }
    function bas(ev) { actif = true; pts = []; bouge(ev); }
    function haut() { actif = false; }
    redim(); global.addEventListener('resize', redim);
    var toucheAvant = zone.style.touchAction; zone.style.touchAction = 'none'; // sinon le navigateur fait défiler la page au lieu de suivre le doigt
    zone.addEventListener('pointerdown', bas); zone.addEventListener('pointermove', bouge);
    global.addEventListener('pointerup', haut); global.addEventListener('pointercancel', haut);
    return {
      couleur: function (x) { coul = x; },
      arreter: function () {
        zone.removeEventListener('pointerdown', bas); zone.removeEventListener('pointermove', bouge);
        global.removeEventListener('pointerup', haut); global.removeEventListener('pointercancel', haut); global.removeEventListener('resize', redim);
        zone.style.touchAction = toucheAvant; if (raf) cancelAnimationFrame(raf); c.remove();
      }
    };
  };

  /* --- Compteur qui roule : le score défile jusqu'à sa nouvelle valeur, puis « pop » --- */
  Directeur.prototype.compteur = function (el, valeur, o) {
    if (!el) return this; o = o || {};
    var depart = el._kwfxVal != null ? el._kwfxVal : (parseInt(String(el.textContent).replace(/\D/g, ''), 10) || 0);
    var prefixe = o.prefixe || '', ecart = valeur - depart, duree = o.duree || borne(300 + Math.abs(ecart) * 6, 300, 1100), t0 = maintenant(), self = this;
    el._kwfxVal = valeur; if (el._kwfxRaf) cancelAnimationFrame(el._kwfxRaf);
    (function pas() {
      var k = Math.min(1, (maintenant() - t0) / duree), e = 1 - Math.pow(1 - k, 3);
      el.textContent = prefixe + Math.round(depart + ecart * e).toLocaleString('fr-FR');
      if (k < 1) el._kwfxRaf = requestAnimationFrame(pas);
      else if (ecart > 0 && el.animate) {
        el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
        el.animate([{ color: self.theme.couleurs[1] || '#FFD23F' }, { color: getComputedStyle(el).color }], { duration: 500 });
      }
    })();
    return this;
  };

  /* --- Étoiles de fin de niveau (1 à 3), révélées une par une avec son qui monte --- */
  var ETOILE_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 1.8l3 6.4 7 .8-5.2 4.8 1.4 6.9L12 17.2l-6.2 3.5 1.4-6.9L2 9l7-.8z" fill="FILL" stroke="STROKE" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  Directeur.prototype.etoilesFin = function (n, o) {
    o = o || {}; n = borne(Math.round(n || 0), 0, 3);
    var self = this, s = this.zoneSure(), taille = Math.round(borne((s.x2 - s.x1) / 5, 56, 120) * (this.opt.public === 'petit' ? 1.15 : 1));
    var boite = this.calqueDiv('left:50%;top:' + (o.y || '42%') + ';transform:translate(-50%,-50%);display:flex;gap:' + Math.round(taille * 0.18) + 'px;align-items:flex-end');
    var slots = [];
    for (var i = 0; i < 3; i++) {
      var d = document.createElement('div');
      d.style.cssText = 'width:' + taille + 'px;height:' + taille + 'px;' + (i === 1 ? 'transform:translateY(-' + Math.round(taille * 0.22) + 'px)' : '');
      d.innerHTML = ETOILE_SVG.replace('FILL', 'rgba(255,255,255,.18)').replace('STROKE', 'rgba(255,255,255,.55)'); if (this.lum.elements) d.style.filter = this.ombreCss(0.5);
      boite.appendChild(d); slots.push(d);
    }
    boite.animate([{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 280, easing: 'ease-out' });
    var base = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect();
    return new Promise(function (fin) {
      var i = 0;
      function suivante() {
        if (i >= n) { if (n === 3) { self.halo(0.8); self.banniere(o.message || 'Tro for !', 0.9); self.vibre('victoire'); }
          setTimeout(function () { if (!o.garder) { var an = boite.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }); an.onfinish = function () { boite.remove(); }; } fin(n); }, o.garder ? 0 : 1500); return; }
        var sl = slots[i];
        sl.innerHTML = ETOILE_SVG.replace('FILL', '#FFD23F').replace('STROKE', '#B8860B');
        sl.animate([{ transform: sl.style.transform + ' scale(2.2) rotate(-40deg)', opacity: 0 }, { transform: sl.style.transform + ' scale(.9) rotate(8deg)', opacity: 1, offset: 0.6 }, { transform: sl.style.transform + ' scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.3)' });
        setTimeout(function () {
          var r = sl.getBoundingClientRect(), p = { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
          self.lance('eclat', p, 0.55 + i * 0.15, { couleurs: ['#FFD23F', '#FFFFFF', '#FFB000'] });
          if (self.opt.sons) { if (!self.audio.echantillon('bonne', { demi: [0, 4, 7][i], varier: false })) self.audio.note(hz([0, 4, 7][i] + 12), 0.18, 'triangle', 0.18); }
          if (self.pub.secousse && i === 2) self.secousse(0.3);
          self.vibre('bonne');
          i++; setTimeout(suivante, 380);
        }, 250);
      }
      setTimeout(suivante, 300);
    });
  };

  /* --- Apparitions et disparitions d'éléments (cartes, boutons, fruits, bulles de texte) --- */
  var APPARITIONS = {
    rebond: [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.6 }, { transform: 'scale(.95)', offset: 0.8 }, { transform: 'scale(1)', opacity: 1 }],
    glisse: [{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'translateY(-6px)', opacity: 1, offset: 0.7 }, { transform: 'translateY(0)', opacity: 1 }],
    tourbillon: [{ transform: 'rotate(-200deg) scale(0)', opacity: 0 }, { transform: 'rotate(10deg) scale(1.08)', opacity: 1, offset: 0.75 }, { transform: 'rotate(0) scale(1)', opacity: 1 }],
    fondu: [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0)' }],
    carte: [{ transform: 'perspective(600px) rotateY(90deg)', opacity: 0 }, { transform: 'perspective(600px) rotateY(-10deg)', opacity: 1, offset: 0.7 }, { transform: 'perspective(600px) rotateY(0)', opacity: 1 }]
  };
  Directeur.prototype.apparait = function (el, style, o) {
    if (!el || !el.animate) return Promise.resolve(); o = o || {};
    var k = APPARITIONS[style] || APPARITIONS.rebond;
    var an = el.animate(k, { duration: o.duree || (this.opt.public === 'petit' ? 620 : 480), delay: o.retard || 0, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    if (this.lum.elements && el._kwfxH != null) el.animate([{ filter: this.ombreCss(1) }, { filter: this.ombreCss(el._kwfxH) }], { duration: o.duree || 480, delay: o.retard || 0, easing: 'ease-out', fill: 'backwards' });
    if (o.son !== false && this.opt.sons) { var self = this; setTimeout(function () { self.audio.echantillon('clic', { demi: hasard(5, 10), vol: 0.5 }); }, o.retard || 0); }
    return an.finished || Promise.resolve();
  };
  Directeur.prototype.disparait = function (el, style, o) {
    if (!el || !el.animate) return Promise.resolve(); o = o || {};
    var k = (APPARITIONS[style] || APPARITIONS.rebond).slice().reverse().map(function (f) { var c = {}; for (var x in f) c[x] = f[x]; if (c.offset != null) c.offset = 1 - c.offset; return c; });
    var an = el.animate(k, { duration: o.duree || 360, delay: o.retard || 0, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards' });
    if (o.retirer) an.onfinish = function () { el.remove(); };
    return an.finished || Promise.resolve();
  };
  /* Fait apparaître une liste d'éléments en cascade (cartes d'un memory, réponses d'un quiz) */
  Directeur.prototype.cascade = function (els, style, ecart) {
    var self = this; return Promise.all(Array.prototype.map.call(els, function (el, i) { return self.apparait(el, style, { retard: i * (ecart || 70), son: i % 2 === 0 }); }));
  };

  /* ======================================================================
   * 7 ter. NOUVEAUTÉS v2.2 : météo péi, musique d'ambiance en boucle
   * ==================================================================== */

  /* --- Météo péi : pluie tropicale, orage, cyclone, alizé (couche indépendante de l'ambiance) --- */
  SYSTEMES.eclaboussurePluie = [
    { nb: 3, fixe: true, vie: [0.18, 0.32], vitesse: [60, 180], cone: [-90, 120], taille: [0.9, 1.6], sprite: 'goutte', etirement: 0.008, etirementMax: 1.3, couleur: '#DCEFFF', gravite: 900, alphaVie: [0.8, 0] },
    { nb: 1, fixe: true, vie: 0.25, taille: 3, tailleVie: [0.4, 2.2], alphaVie: [0.45, 0], sprite: 'anneau', couleur: '#DCEFFF' }
  ];
  function goutte(debit, angle, vmin, vmax, alpha) {
    return { debit: debit, vie: [1.2, 1.8], zone: 'ecran-haut-large', vitesse: [vmin, vmax], cone: [angle, 5], taille: [0.9, 1.5], sprite: 'etincelle', etirement: 0.022, etirementMax: 9,
      couleur: ['#E8F4FF', '#CFE6FF', '#FFFFFF'], alphaVie: [alpha, alpha], gravite: 400, sol: { mort: true, sous: 'eclaboussurePluie' } };
  }
  var METEOS = {
    pluie: { nom: 'Pluie tropicale', calques: [goutte(110, 98, 950, 1250, 0.55), goutte(40, 98, 650, 800, 0.3)], voile: 'rgba(40,60,90,.18)', son: { f: 1400, q: 0.4, vol: 0.16 } },
    orage: { nom: 'Orage', calques: [goutte(170, 102, 1100, 1450, 0.6), goutte(60, 102, 700, 900, 0.3)], voile: 'rgba(20,30,55,.32)', son: { f: 1100, q: 0.5, vol: 0.22 }, eclairs: [3500, 9000] },
    cyclone: { nom: 'Cyclone', calques: [goutte(240, 150, 1300, 1800, 0.55), goutte(80, 145, 900, 1200, 0.3),
      { debit: 6, vie: [2.5, 4], zone: 'ecran-droite', vitesse: [500, 900], cone: [190, 30], taille: [5, 9], sprite: 'petale', couleur: ['#52B788', '#2D6A4F', '#95D5B2', '#8C5E3C'], gravite: 60, curl: { force: 700, freq: 0.008, vitesse: 0.8 }, rotVitesse: [-720, 720], flipVitesse: 9, alphaVie: [0, 1, 1, 0] }],
      voile: 'rgba(25,35,50,.42)', son: { f: 700, q: 0.9, vol: 0.3, hurle: true }, eclairs: [5000, 12000], balance: true },
    alize: { nom: 'Alizé (vent doux)', calques: [{ debit: 2.2, vie: [4, 6], zone: 'ecran-gauche', vitesse: [160, 260], cone: [-5, 20], taille: [5, 8], sprite: 'petale', couleur: ['#52B788', '#74C69D', '#FFB3C6'], gravite: 10, curl: { force: 160, freq: 0.006, vitesse: 0.4 }, rotVitesse: [-120, 120], flipVitesse: 4, alphaVie: [0, 1, 1, 0] }],
      son: { f: 500, q: 0.6, vol: 0.08, hurle: true } }
  };
  var departV21 = Moteur.prototype.depart;
  Moteur.prototype.depart = function (d, x, y, o) {
    var z = d.zone;
    if (z === 'ecran-haut-large') return [hasard(-this.L * 0.25, this.L * 1.6), -20]; // large : la pluie penchée couvre tout l'écran
    if (z === 'ecran-droite') return [this.L + 20, hasard(-20, this.H * 0.8)];
    if (z === 'ecran-gauche') return [-20, hasard(0, this.H * 0.8)];
    return departV21.call(this, d, x, y, o);
  };
  var lancerAmbianceV21 = Moteur.prototype.lancerAmbiance;
  Moteur.prototype.lancerAmbiance = function (nom) {
    var meteo = this.ambiances.filter(function (a) { return a.meteo; });
    lancerAmbianceV21.call(this, nom);
    this.ambiances = this.ambiances.concat(meteo); if (this.ambiances.length) this.demarre();
  };
  Directeur.prototype.meteo = function (nom, o) {
    o = o || {}; var self = this, m = this.particules, mt = METEOS[nom], force = o.force == null ? 1 : borne(o.force, 0.2, 1.5);
    if (this.opt.support === 'epub') force *= 0.6;
    m.ambiances = m.ambiances.filter(function (a) { return !a.meteo; });
    clearTimeout(this._eclair); if (this._balance) { this._balance.cancel(); this._balance = null; }
    if (this._voile) { var v = this._voile; v.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800 }).onfinish = function () { v.remove(); }; this._voile = null; }
    this.sonMeteo(null);
    this.meteoActive = mt ? nom : null;
    if (!mt) return this;
    mt.calques.forEach(function (e, i) { m.ambiances.push({ di: m.def('meteo:' + nom + ':' + i, e), debit: e.debit * force, acc: 0, meteo: true }); });
    m.demarre();
    if (mt.voile) { this._voile = this.calqueDiv('inset:0;background:radial-gradient(ellipse at 50% 0%, transparent 20%, ' + mt.voile + ' 100%)'); this._voile.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: 'forwards' }); }
    if (mt.son && this.opt.sons) this.sonMeteo(mt.son, force);
    if (mt.eclairs) { var eclair = function () { self.eclair(); self._eclair = setTimeout(eclair, hasard(mt.eclairs[0], mt.eclairs[1])); }; this._eclair = setTimeout(eclair, hasard(1200, 3000)); }
    if (mt.balance && this.opt.secousses) { var cible = this.cibleEcran(); if (cible && cible.animate) this._balance = cible.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-.6deg) translateX(-3px)' }, { transform: 'rotate(.4deg) translateX(2px)' }, { transform: 'rotate(0)' }], { duration: 2600, iterations: Infinity, easing: 'ease-in-out' }); }
    return this;
  };
  /* Éclair : double flash blanc-bleu puis tonnerre qui roule (bruit grave filtré) */
  Directeur.prototype.eclair = function () {
    var self = this; this.flash('#E8F0FF', 0.55); setTimeout(function () { self.flash('#FFFFFF', 0.35); }, 120);
    var c = this.opt.sons && this.audio.pret(); if (!c) return;
    var dur = hasard(1.6, 2.6), b = c.createBuffer(1, Math.round(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < d.length; i++) { last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = last * 3.2; }
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + hasard(0.25, 0.7);
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = 260; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9 * this.opt.volume * this.pub.son, t + 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  };
  /* Son de pluie / vent : bruit blanc en boucle, filtré ; le cyclone « hurle » (filtre modulé) */
  Directeur.prototype.sonMeteo = function (cfg, force) {
    if (this._sonMeteo) { var a = this._sonMeteo, c0 = this.audio.ctx; try { a.g.gain.setTargetAtTime(0, c0.currentTime, 0.4); setTimeout(function () { try { a.s.stop(); if (a.lfo) a.lfo.stop(); } catch (e) {} }, 1500); } catch (e) {} this._sonMeteo = null; }
    if (!cfg) return;
    var c = this.audio.pret(); if (!c) return;
    var b = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = null;
    s.buffer = b; s.loop = true; f.type = 'bandpass'; f.frequency.value = cfg.f; f.Q.value = cfg.q;
    if (cfg.hurle) { lfo = c.createOscillator(); var lg = c.createGain(); lfo.frequency.value = 0.13; lg.gain.value = cfg.f * 0.6; lfo.connect(lg); lg.connect(f.frequency); lfo.start(); }
    g.gain.value = 0; g.gain.setTargetAtTime(cfg.vol * (force || 1) * this.opt.volume * this.pub.son, c.currentTime, 0.8);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start();
    this._sonMeteo = { s: s, g: g, lfo: lfo };
  };

  /* --- Musique d'ambiance en boucle, jouée en direct (aucune voix, aucun fichier) --- v2.3
   *  MALOYA traditionnel : percussions + bobre, comme dans un kabar (la mélodie, c'est la voix : on la laisse au jeu).
   *    roulèr  : gros tambour-tonneau en peau de bœuf, joué à mains nues ; son ouvert grave, son étouffé
   *              quand le talon appuie sur la peau (la note monte un peu)
   *    kayamb  : radeau de tiges de fleurs de canne rempli de graines : un « bruit de vagues » continu,
   *              poussé-tiré, ternaire, avec l'accent sur les temps
   *    pikèr   : tronçon de bambou frappé avec deux baguettes : la « cloche » ternaire qui tient le temps
   *    sati    : boîte de fer-blanc frappée : son métallique sec sur les contretemps
   *    bobre   : arc musical à calebasse : corde frappée (2 notes, à vide et pincée par la pièce),
   *              calebasse ouverte-fermée contre le ventre (effet « wah »), petite cascavelle qui grésille
   *    Mesure ternaire (12/8) qui « balance » entre deux et trois : la 2e croche de chaque temps est un peu retardée,
 *    et le roulèr glisse des hémioles (3 frappes sur 2 temps). Tempo mesuré sur un cours de roulèr : environ 100 à la noire pointée.
   *  SÉGA : majeur et joyeux, ternaire balancé, tempo lent (environ 78 à la noire pointée, mesuré sur un séga lontan à l'accordéon),
 *    basse et roulèr imbriqués en hémiole.
   *    triangle (ouvert sur les temps, étouffé entre), kayamb, basse sur le temps, banjo en accords
   *    « chaloupés » sur les contretemps, accordéon (deux anches légèrement désaccordées) qui chante
   *    des phrases en tierces, roulèr léger ; progression I - IV - V7 - I.
   *  trankil et mystere : ambiances douces (pas de style péi imposé).
   *  Quand la série monte (5 puis 10), on ajoute des instruments : pikèr et sati au maloya, deuxième voix d'accordéon au séga. */
  var STYLES_MUSIQUE = {
    maloya: { nom: 'Maloya (kabar : roulèr, kayamb, pikèr, sati, bobre)', bpm: 100, pas: 12, ternaire: true, balance: 0.09 },
    sega: { nom: 'Séga (triangle, kayamb, banjo, accordéon)', bpm: 78, pas: 12, ternaire: true, balance: 0.06 },
    trankil: { nom: 'Trankil', bpm: 72, pas: 8, accords: [[0, 4, 7, 11], [5, 9, 12, 16], [9, 12, 16, 19], [7, 11, 14, 17]], gamme: [0, 2, 4, 7, 9, 12, 14, 16], base: 48 },
    mystere: { nom: 'Mystère', bpm: 64, pas: 8, accords: [[0, 3, 7], [1, 5, 8], [0, 3, 7], [-2, 2, 5]], gamme: [0, 1, 3, 7, 8, 12], base: 45 }
  };
  var STYLE_THEME = { volcan: 'maloya', lontan: 'maloya', mystere: 'mystere', noel: 'sega', fruits: 'sega', reunion: 'sega', lagon: 'sega' };
  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function Instruments(c, sortie) {
    var I = this; this.c = c; this.g = sortie;
    var bb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = bb.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.bruit = bb;
    // petite réverbération (cour de kabar) : bruit qui décroît
    var rl = Math.round(c.sampleRate * 1.4), rb = c.createBuffer(2, rl, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var rd = rb.getChannelData(ch); for (var j = 0; j < rl; j++) rd[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / rl, 3); }
    this.rev = c.createConvolver(); this.rev.buffer = rb; var rg = c.createGain(); rg.gain.value = 0.18; this.rev.connect(rg); rg.connect(sortie);
    this.env = function (p, t, a, v, r) { p.setValueAtTime(0.0001, t); p.exponentialRampToValueAtTime(Math.max(0.0002, v), t + a); p.exponentialRampToValueAtTime(0.0001, t + a + r); };
    this.vers = function (n, pan, rev) { var x = n; if (pan && c.createStereoPanner) { var sp = c.createStereoPanner(); sp.pan.value = pan; n.connect(sp); x = sp; } x.connect(sortie); if (rev) { var s = c.createGain(); s.gain.value = rev; x.connect(s); s.connect(I.rev); } };
    this.souffle = function (t, dur, type, f, q, v, a, pan, rev) {
      var s = c.createBufferSource(), fl = c.createBiquadFilter(), e = c.createGain(); s.buffer = bb; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
      I.env(e.gain, t, a, v, dur); s.connect(fl); fl.connect(e); I.vers(e, pan, rev); s.start(t, Math.random() * 0.7, a + dur + 0.05);
    };
    this.osc = function (type, f, t, a, v, r, pan, rev, fin) {
      var o = c.createOscillator(), e = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (fin) o.frequency.exponentialRampToValueAtTime(fin, t + a + r * 0.6);
      I.env(e.gain, t, a, v, r); o.connect(e); I.vers(e, pan, rev); o.start(t); o.stop(t + a + r + 0.05); return o;
    };
  }
  /* kayamb : « vagues » de graines, poussé (plus long) / tiré (plus court) */
  Instruments.prototype.kayamb = function (t, v, pousse) { this.souffle(t, pousse ? 0.13 : 0.08, 'bandpass', pousse ? 5200 : 6800, 0.9, v * 4, pousse ? 0.018 : 0.01, -0.25, 0.3); this.souffle(t, 0.05, 'highpass', 8000, 0.7, v * 2, 0.004, -0.25); };
  /* roulèr : son ouvert grave ou étouffé (talon sur la peau : plus court, un peu plus aigu) */
  Instruments.prototype.rouler = function (t, v, etouffe) {
    if (etouffe) { this.osc('sine', 118, t, 0.003, v * 0.8, 0.11, 0.05, 0.1, 96); this.souffle(t, 0.05, 'bandpass', 700, 1.2, v * 0.5, 0.002, 0.05); }
    else { this.osc('sine', 82, t, 0.004, v * 0.6, 0.38, 0.05, 0.2, 60); this.osc('triangle', 164, t, 0.003, v * 0.2, 0.12, 0.05); this.souffle(t, 0.07, 'lowpass', 380, 0.8, v * 0.55, 0.002, 0.05); }
  };
  /* pikèr : bambou creux frappé (bois résonnant) */
  Instruments.prototype.piker = function (t, v) { this.osc('sine', 1180, t, 0.001, v, 0.06, 0.35, 0.25); this.osc('sine', 1180 * 2.7, t, 0.001, v * 0.25, 0.025, 0.35); this.souffle(t, 0.02, 'bandpass', 2400, 3, v * 0.5, 0.001, 0.35); };
  /* sati : fer-blanc frappé, partiels métalliques non harmoniques */
  Instruments.prototype.sati = function (t, v) { var I = this; [1730, 2610, 3720, 5010].forEach(function (f, i) { I.osc('square', f, t, 0.001, v * [0.18, 0.12, 0.09, 0.06][i], 0.09, -0.4, 0.2); }); this.souffle(t, 0.04, 'highpass', 5000, 0.8, v * 0.6, 0.001, -0.4); };
  /* bobre : corde frappée, calebasse qui s'ouvre (filtre qui monte) + cascavelle qui grésille */
  Instruments.prototype.bobre = function (t, note, v, ouvert) {
    var c = this.c, o = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter(), e = c.createGain(), f = midi(note);
    o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = f; o2.frequency.value = f * 1.004;
    fl.type = 'bandpass'; fl.Q.value = 4; fl.frequency.setValueAtTime(ouvert ? 380 : 900, t); fl.frequency.exponentialRampToValueAtTime(ouvert ? 1300 : 420, t + 0.22);
    this.env(e.gain, t, 0.004, v, 0.42); var m = c.createGain(); m.gain.value = 0.5; o.connect(fl); o2.connect(m); m.connect(fl); fl.connect(e); this.vers(e, 0.15, 0.25);
    o.start(t); o2.start(t); o.stop(t + 0.5); o2.stop(t + 0.5);
    this.souffle(t + 0.005, 0.06, 'bandpass', 3800, 1.5, v * 0.25, 0.004, 0.15); // cascavelle
  };
  /* triangle : ouvert (ça sonne) ou étouffé (la main le bloque) */
  Instruments.prototype.triangle = function (t, v, ouvert) { var I = this, r = ouvert ? 0.7 : 0.06; [1260, 3480, 6800].forEach(function (f, i) { I.osc('sine', f, t, 0.001, v * [0.22, 0.12, 0.07][i], r, 0.45, 0.3); }); };
  /* basse acoustique (contrebasse / guitare basse) */
  Instruments.prototype.basse = function (t, note, v, dur) { this.osc('triangle', midi(note), t, 0.006, v, dur || 0.35, 0, 0.05); this.osc('sine', midi(note) * 2, t, 0.004, v * 0.25, 0.1, 0); };
  /* banjo : corde pincée brillante, accord égrené très vite */
  Instruments.prototype.banjo = function (t, notes, v) {
    var I = this, c = this.c; notes.forEach(function (n, i) {
      var tt = t + i * 0.009, o = c.createOscillator(), fl = c.createBiquadFilter(), e = c.createGain(); o.type = 'sawtooth'; o.frequency.value = midi(n);
      fl.type = 'lowpass'; fl.frequency.setValueAtTime(4500, tt); fl.frequency.exponentialRampToValueAtTime(900, tt + 0.15); I.env(e.gain, tt, 0.002, v, 0.2);
      o.connect(fl); fl.connect(e); I.vers(e, 0.3, 0.15); o.start(tt); o.stop(tt + 0.25);
    });
  };
  /* accordéon diatonique : deux anches légèrement désaccordées (musette), souffle du soufflet */
  Instruments.prototype.accordeon = function (t, note, dur, v) {
    var I = this, c = this.c, fl = c.createBiquadFilter(), e = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    fl.type = 'lowpass'; fl.frequency.value = 2600; fl.Q.value = 0.8;
    e.gain.setValueAtTime(0.0001, t); e.gain.linearRampToValueAtTime(v, t + 0.035); e.gain.setValueAtTime(v, t + Math.max(0.04, dur - 0.05)); e.gain.linearRampToValueAtTime(0.0001, t + dur);
    lfo.frequency.value = 5.5; lg.gain.value = v * 0.12; lfo.connect(lg); lg.connect(e.gain);
    [-7, 7].forEach(function (cents) { var o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = midi(note); o.detune.value = cents; o.connect(fl); o.start(t); o.stop(t + dur + 0.05); });
    var sq = c.createOscillator(), sg = c.createGain(); sq.type = 'square'; sq.frequency.value = midi(note - 12); sg.gain.value = 0.35; sq.connect(sg); sg.connect(fl); sq.start(t); sq.stop(t + dur + 0.05);
    fl.connect(e); I.vers(e, -0.1, 0.3); lfo.start(t); lfo.stop(t + dur + 0.05);
  };
  Instruments.prototype.douce = function (t, n, v) { this.osc('sine', midi(n), t, 0.004, v, 0.35, 0, 0.3); this.osc('sine', midi(n) * 4, t, 0.002, v * 0.18, 0.08); };
  Instruments.prototype.nappe = function (t, n, dur, v) { this.osc('triangle', midi(n), t, dur * 0.3, v, dur * 0.7, 0, 0.4); };

  /* Motifs d'accordéon du séga : phrases en degrés de la gamme majeure, [pas, degré, durée en pas] */
  var GAMME_MAJ = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19];
  var PHRASES_SEGA = [
    [[0, 4, 2], [3, 5, 1], [4, 4, 1], [5, 2, 1], [6, 4, 3], [9, 7, 2], [11, 6, 1]],
    [[0, 7, 2], [2, 6, 1], [3, 5, 2], [5, 4, 1], [6, 5, 2], [8, 4, 1], [9, 2, 3]],
    [[0, 3, 2], [2, 4, 1], [3, 5, 2], [5, 3, 1], [6, 1, 2], [8, 2, 1], [9, 3, 3]],
    [[0, 4, 1], [1, 2, 1], [2, 1, 1], [3, 0, 3], [6, 4, 2], [8, 2, 1], [9, 0, 3]]
  ];
  var ACCORDS_SEGA = [[0, 4, 7], [0, 4, 7], [5, 9, 12], [7, 11, 14, 17], [0, 4, 7], [5, 9, 12], [7, 11, 14, 17], [0, 4, 7]];
  var DEGRE_ACCORD = [0, 0, 3, 4, 0, 3, 4, 0]; // pour décaler la phrase sur l'accord

  Directeur.prototype.musique = function (actif, o) {
    o = o || {}; var self = this;
    if (this._mus) { var old = this._mus; clearInterval(old.timer); old.g.gain.setTargetAtTime(0, old.c.currentTime, 0.3); setTimeout(function () { old.g.disconnect(); }, 1500); this._mus = null; }
    if (actif === false || !this.opt.sons) return this;
    var c = this.audio.pret(); if (!c) return this;
    var nom = o.style || (this.opt.public === 'petit' ? 'trankil' : STYLE_THEME[this.opt.theme] || (this.opt.mode === 'probleme' ? 'sega' : 'trankil'));
    var st = STYLES_MUSIQUE[nom] || STYLES_MUSIQUE.trankil;
    var g = c.createGain(), comp = c.createDynamicsCompressor(); g.gain.value = 0;
    var vol = (o.volume == null ? 0.3 : o.volume) * this.opt.volume * this.pub.son;
    g.gain.setTargetAtTime(vol, c.currentTime, 0.8); g.connect(comp); comp.connect(c.destination);
    var I = new Instruments(c, g);
    var dPas = 60 / st.bpm / (st.ternaire ? 3 : 2), pas = 0, prochain = c.currentTime + 0.12, noteMel = 2, phrase = 0;
    // la 2e croche de chaque temps arrive un peu en retard : le balancement entre binaire et ternaire
    function quand(p) { return st.balance && p % 3 === 1 ? dPas * st.balance : st.balance && p % 3 === 2 ? -dPas * st.balance * 0.4 : 0; }
    var PIKER = [0, 2, 4, 5, 7, 9, 11]; // cloche ternaire (12/8)
    function maloya(t, p, mesure, niveau) {
      // kayamb : chaque croche, poussé sur les temps, tiré entre
      I.kayamb(t, (p % 3 === 0 ? 0.5 : p % 3 === 2 ? 0.28 : 0.18) * (niveau ? 1.15 : 1), p % 3 === 0);
      // roulèr : ouvert sur 1 et 3, étouffé sur les contretemps, relance syncopée en fin de cycle
      var hemiole = mesure % 4 === 1; // hémiole : 3 frappes régulières sur 2 temps, le « 3 contre 2 » du maloya
      if (hemiole) { if (p === 0) I.rouler(t, 0.85); else if (p === 4) I.rouler(t, 0.5, true); else if (p === 8) I.rouler(t, 0.65); }
      else if (p === 0) I.rouler(t, 0.9); else if (p === 6) I.rouler(t, 0.7);
      else if (p === 4 || p === 10) I.rouler(t, 0.45, true);
      else if (p === 11 && mesure % 2 === 1) I.rouler(t, 0.55);
      else if (niveau >= 2 && (p === 8 || p === 9)) I.rouler(t, 0.35, true);
      if (mesure % 4 === 3 && p >= 9) I.rouler(t, 0.4, p !== 11);
      // bobre : ostinato sur deux notes (à vide / pincée), calebasse ouverte sur les temps
      var bob = { 0: [43, 1], 3: [45, 0], 5: [43, 0], 6: [43, 1], 8: [45, 0], 9: [43, 1], 11: [45, 0] };
      if (bob[p]) I.bobre(t, bob[p][0], p % 6 === 0 ? 0.6 : 0.4, bob[p][1]);
      if (niveau >= 1 && PIKER.indexOf(p) >= 0) I.piker(t, p === 0 ? 0.32 : 0.2);
      if (niveau >= 2 && (p === 3 || p === 9)) I.sati(t, 0.5);
      if (niveau >= 2 && (p === 1 || p === 7) && Math.random() < 0.5) I.sati(t, 0.25);
    }
    function sega(t, p, mesure, niveau) {
      var idx = mesure % 8, ac = ACCORDS_SEGA[idx], base = 55; // sol majeur
      I.triangle(t, p % 3 === 0 ? 0.5 : 0.28, p % 6 === 0);
      I.kayamb(t, p % 3 === 0 ? 0.26 : 0.12, p % 3 === 0);
      if (p === 0) I.basse(t, base - 12 + ac[0], 0.5, 0.5); if (p === 6) I.basse(t, base - 12 + ac[0] + 7 - (ac[0] >= 5 ? 12 : 0), 0.42, 0.45);
      if (p === 0) I.rouler(t, 0.4); else if (p === 4 || p === 8) I.rouler(t, 0.3, true); // hémiole contre la basse
      // banjo chaloupé : accords sur les contretemps (2e et 3e croches)
      if (p % 3 !== 0) I.banjo(t, ac.slice(0, 3).map(function (n) { return base + 12 + n; }), p % 3 === 2 ? 0.07 : 0.045);
      // accordéon : une phrase par mesure, posée sur l'accord, en tierces quand ça s'emballe
      if (p === 0) phrase = (mesure % 4 === 3) ? 3 : (mesure % 2) ? 1 + ((mesure / 2) | 0) % 2 : 0;
      PHRASES_SEGA[phrase].forEach(function (n) {
        if (n[0] !== p) return; var deg = n[1] + DEGRE_ACCORD[idx]; if (deg > 9) deg -= 7; var note = base + 12 + GAMME_MAJ[Math.min(deg, GAMME_MAJ.length - 1)];
        I.accordeon(t, note, n[2] * dPas * 0.95, 0.075);
        if (niveau >= 1) I.accordeon(t, base + 12 + GAMME_MAJ[Math.max(0, deg - 2)], n[2] * dPas * 0.95, 0.045);
      });
      if (niveau >= 2 && (p === 4 || p === 10)) I.rouler(t, 0.4, true);
    }
    function doux(t, p, mesure, niveau) {
      var ac = st.accords[mesure % st.accords.length], racine = st.base;
      if (p === 0) { I.basse(t, racine - 12 + ac[0], 0.25, dPas * 3); ac.forEach(function (n) { I.nappe(t, racine + 12 + n, dPas * st.pas, 0.035); }); }
      if (p % 2 === 0) I.kayamb(t, nom === 'mystere' ? 0.05 : 0.1, false);
      if ((p % 2 === 0 || Math.random() < 0.2) && Math.random() < 0.3 + niveau * 0.12) {
        noteMel = borne(noteMel + choisir([-2, -1, -1, 0, 1, 1, 2]), 0, st.gamme.length - 1); I.douce(t, racine + 24 + st.gamme[noteMel], 0.14);
      }
    }
    function planifier() {
      var niveau = self.e.serie >= 10 ? 2 : self.e.serie >= 5 ? 1 : 0;
      while (prochain < c.currentTime + 0.15) {
        var p = pas % st.pas, mesure = Math.floor(pas / st.pas), t = prochain + quand(p) + (Math.random() - 0.5) * 0.006;
        if (nom === 'maloya') maloya(t, p, mesure, niveau); else if (nom === 'sega') sega(t, p, mesure, niveau); else doux(t, p, mesure, niveau);
        pas++; prochain += dPas;
      }
    }
    var timer = setInterval(planifier, 30); planifier();
    this._mus = { c: c, g: g, timer: timer, style: nom };
    return this;
  };

  /* ======================================================================
   * 7 quater. OMBRES v2.4 : une seule lumière pour tout le jeu
   *  - fx.lumiere({ angle, hauteur, force, teinte }) : angle = d'où vient le soleil (135 = en haut à gauche),
   *    hauteur 0 (soleil couchant, ombres longues) à 1 (midi, ombres courtes)
   *  - ombres portées douces sous les particules solides (confettis, jus, pièces, pétales, feuilles, plumes)
   *  - ombres de contact au sol (la tache grandit et pâlit quand l'objet s'élève)
   *  - ombres des éléments du jeu : fx.ombre(el, hauteur), fx.soulever(el), et textes, bannières, étoiles,
   *    « pop » et apparitions qui projettent une ombre cohérente avec la lumière
   *  - la météo change la lumière : ciel couvert = ombres diffuses, orage = ombres bleutées
   * ==================================================================== */
  Directeur.prototype.vecteurOmbre = function () {
    var l = this.lum, a = l.angle * Math.PI / 180, long = 4 + 14 * (1 - l.hauteur);
    // la lumière vient de l'angle donné (135 = en haut à gauche) : l'ombre part à l'opposé
    if (!this._vo || this._voA !== a || this._voL !== long) { this._vo = [-Math.cos(a) * long, Math.sin(a) * long]; this._voA = a; this._voL = long; }
    return this._vo;
  };
  Directeur.prototype.lumiere = function (o) {
    o = o || {}; var l = this.lum;
    ['angle', 'hauteur', 'force', 'teinte', 'particules', 'contact', 'elements'].forEach(function (k) { if (o[k] != null) l[k] = o[k]; });
    l.hauteur = borne(l.hauteur, 0, 1); l.force = borne(l.force, 0, 0.8);
    var c = versRgb(l.teinte); l.teinteRgb = [c[0] / 255, c[1] / 255, c[2] / 255];
    this._vo = null; if (this.particules) this.particules.demarre();
    var self = this; (this._ombrees || []).forEach(function (el) { if (el.isConnected) self.ombre(el, el._kwfxH); });
    return this;
  };
  /* Ombre CSS en trois couches (contact serré, ombre moyenne, ombre longue très floue), selon la lumière.
   *   h : hauteur de l'objet au-dessus du sol, de 0 (posé) à 1 (très haut) */
  Directeur.prototype.ombreCss = function (h, mode) {
    var l = this.lum, v = this.vecteurOmbre(), k = 0.4 + (h == null ? 0.3 : h) * 1.8, f = l.force / 0.3, rgb = versRgb(l.teinte).join(',');
    var c1 = 'rgba(' + rgb + ',' + (0.32 * f * (1.1 - Math.min(1, h || 0))).toFixed(2) + ')', c2 = 'rgba(' + rgb + ',' + (0.22 * f).toFixed(2) + ')', c3 = 'rgba(' + rgb + ',' + (0.14 * f).toFixed(2) + ')';
    var x1 = (v[0] * 0.12 * k).toFixed(1), y1 = (v[1] * 0.12 * k + 1).toFixed(1), x2 = (v[0] * 0.45 * k).toFixed(1), y2 = (v[1] * 0.45 * k).toFixed(1), x3 = (v[0] * k).toFixed(1), y3 = (v[1] * k).toFixed(1);
    if (mode === 'texte') return x1 + 'px ' + y1 + 'px 1px ' + c1 + ',' + x2 + 'px ' + y2 + 'px ' + (3 * k).toFixed(1) + 'px ' + c2 + ',' + x3 + 'px ' + y3 + 'px ' + (8 * k).toFixed(1) + 'px ' + c3;
    if (mode === 'boite') return x1 + 'px ' + y1 + 'px ' + (2 * k).toFixed(1) + 'px ' + c1 + ',' + x2 + 'px ' + y2 + 'px ' + (6 * k).toFixed(1) + 'px ' + c2 + ',' + x3 + 'px ' + y3 + 'px ' + (18 * k).toFixed(1) + 'px ' + c3;
    return 'drop-shadow(' + x1 + 'px ' + y1 + 'px ' + (1.5 * k).toFixed(1) + 'px ' + c1 + ') drop-shadow(' + x2 + 'px ' + y2 + 'px ' + (4 * k).toFixed(1) + 'px ' + c2 + ') drop-shadow(' + x3 + 'px ' + y3 + 'px ' + (10 * k).toFixed(1) + 'px ' + c3 + ')';
  };
  /* Donne à un élément une ombre qui suit la lumière (marche sur toute forme : fruit, carte, personnage) */
  Directeur.prototype.ombre = function (el, h) {
    if (!el || !this.lum.elements) return this; el._kwfxH = h == null ? 0.15 : h;
    el.style.filter = this.ombreCss(el._kwfxH);
    this._ombrees = (this._ombrees || []).filter(function (x) { return x.isConnected; }); if (this._ombrees.indexOf(el) < 0) this._ombrees.push(el);
    return this;
  };
  /* Soulève un élément : il grossit un peu, son ombre s'éloigne et s'adoucit, puis il se repose */
  Directeur.prototype.soulever = function (el, h, duree) {
    if (!el || !el.animate) return Promise.resolve(); var b = el._kwfxH == null ? 0.15 : el._kwfxH, hh = h == null ? 0.8 : h;
    var an = el.animate([{ transform: 'translateY(0) scale(1)', filter: this.ombreCss(b) }, { transform: 'translateY(-' + Math.round(10 + hh * 16) + 'px) scale(' + (1 + hh * 0.08).toFixed(3) + ')', filter: this.ombreCss(hh), offset: 0.4 },
      { transform: 'translateY(2px) scale(.98)', filter: this.ombreCss(0), offset: 0.85 }, { transform: 'translateY(0) scale(1)', filter: this.ombreCss(b) }], { duration: duree || 700, easing: 'cubic-bezier(.3,.7,.3,1)' });
    return an.finished || Promise.resolve();
  };
  /* la météo change la lumière */
  var LUM_METEO = { pluie: { force: 0.16, teinte: '#14243A', hauteur: 0.8 }, orage: { force: 0.12, teinte: '#1A2A55', hauteur: 0.9 }, cyclone: { force: 0.08, teinte: '#1B2633', hauteur: 0.95 }, alize: { force: 0.3, teinte: '#0B1A33' } };
  var meteoV23 = Directeur.prototype.meteo;
  Directeur.prototype.meteo = function (nom, o) {
    if (!this._lumAvantMeteo) this._lumAvantMeteo = { force: this.lum.force, teinte: this.lum.teinte, hauteur: this.lum.hauteur };
    meteoV23.call(this, nom, o);
    this.lumiere(LUM_METEO[nom] || this._lumAvantMeteo);
    if (!LUM_METEO[nom]) this._lumAvantMeteo = null;
    return this;
  };

  /* ======================================================================
   * 7 quinquies. LUMIÈRE, DISTANCE ET REFLETS v2.5 (tout suit la même lumière que les ombres)
   *  Lumière : fx.rayons(true) rayons de soleil ; fx.sourceLumiere(x, y, { couleur, rayon, scintille })
   *            lanterne, lave, bougie ; fx.heure('matin' | 'midi' | 'soir' | 'nuit') règle soleil, ombres et couleurs
   *  Distance : fx.profondeur(racine) parallaxe (souris, doigt, inclinaison de la tablette) + brume et flou
   *             sur les éléments [data-kwfx-z] (0 = près, 1 = loin) ; fx.miseAuPoint(z) flou de profondeur ;
   *             les particules d'ambiance et la pluie ont aussi leur profondeur (plus petites, plus pâles au loin)
   *  Reflets : fx.brillance(el) reflet spéculaire placé côté lumière + éclat qui balaye ;
   *            fx.reflet(el) reflet au sol ; fx.reflets({ actif, type: 'eau' | 'sol' }) reflets des particules
   * ==================================================================== */
  Object.keys(AMBIANCES).forEach(function (k) { AMBIANCES[k].forEach(function (e) { if (e.profondeur == null) e.profondeur = 0.85; }); });
  Object.keys(METEOS).forEach(function (k) { METEOS[k].calques.forEach(function (e) { if (e.profondeur == null) e.profondeur = 0.9; }); });

  /* position de la lumière sur l'écran (au bord, du côté d'où elle vient) */
  Directeur.prototype.positionLumiere = function () {
    var t = this.taille(), a = this.lum.angle * Math.PI / 180, dx = Math.cos(a), dy = -Math.sin(a), k = 0.62;
    return { x: t.l / 2 + dx * t.l * k, y: t.h / 2 + dy * t.h * k * 1.1, l: t.l, h: t.h };
  };

  /* --- rayons de soleil (god rays) qui partent de la lumière --- */
  Directeur.prototype.rayons = function (actif, o) {
    o = o || {};
    if (this._rayons) { var r0 = this._rayons; r0.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).onfinish = function () { r0.remove(); }; this._rayons = null; }
    if (actif === false) return this;
    var p = this.positionLumiere(), coul = o.couleur || this.lum.rayonsCouleur || '255,236,190', f = (o.force == null ? 1 : o.force) * (0.5 + this.lum.force * 1.6);
    var el = this.calqueDiv('inset:-20%;mix-blend-mode:screen;transform-origin:' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px;' +
      'background:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, rgba(' + coul + ',' + (0.5 * f).toFixed(2) + ') 0, rgba(' + coul + ',0) ' + Math.round(Math.max(p.l, p.h) * 0.35) + 'px),' +
      'repeating-conic-gradient(from 0deg at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, rgba(' + coul + ',0) 0deg, rgba(' + coul + ',' + (0.16 * f).toFixed(2) + ') 2.5deg, rgba(' + coul + ',0) 6deg, rgba(' + coul + ',0) 9deg, rgba(' + coul + ',' + (0.09 * f).toFixed(2) + ') 11deg, rgba(' + coul + ',0) 14deg);' +
      '-webkit-mask-image:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, #000 0, rgba(0,0,0,.6) 40%, transparent 85%);mask-image:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, #000 0, rgba(0,0,0,.6) 40%, transparent 85%)');
    el.animate([{ transform: 'rotate(-1.5deg)', opacity: 0.75 }, { transform: 'rotate(1.5deg)', opacity: 1 }], { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    this._rayons = el; return this;
  };

  /* --- sources de lumière (lanterne, bougie, lave, luciole) + nuit qui assombrit le reste --- */
  Directeur.prototype.sourceLumiere = function (x, y, o) {
    o = o || {}; var self = this;
    var src = { x: x, y: y, couleur: o.couleur || '#FFC46B', rayon: o.rayon || 140, scintille: o.scintille !== false, force: o.force == null ? 1 : o.force };
    var rgb = versRgb(src.couleur).join(',');
    var el = this.calqueDiv('left:0;top:0;width:' + src.rayon * 2 + 'px;height:' + src.rayon * 2 + 'px;margin:-' + src.rayon + 'px 0 0 -' + src.rayon + 'px;border-radius:50%;mix-blend-mode:screen;' +
      'background:radial-gradient(circle, rgba(' + rgb + ',' + (0.55 * src.force).toFixed(2) + ') 0, rgba(' + rgb + ',' + (0.22 * src.force).toFixed(2) + ') 30%, rgba(' + rgb + ',0) 70%)');
    src.el = el;
    function place() { el.style.transform = 'translate(' + src.x + 'px,' + src.y + 'px)'; }
    place();
    if (src.scintille) el.animate([{ opacity: 1, filter: 'brightness(1)' }, { opacity: 0.82, filter: 'brightness(.9)' }, { opacity: 1, filter: 'brightness(1.1)' }, { opacity: 0.9 }], { duration: 900 + Math.random() * 500, iterations: Infinity, direction: 'alternate' });
    this._sources = (this._sources || []).concat([src]); this.dessineNuit();
    return {
      deplacer: function (nx, ny) { src.x = nx; src.y = ny; place(); self.dessineNuit(); },
      eteindre: function () { el.remove(); self._sources = self._sources.filter(function (q) { return q !== src; }); self.dessineNuit(); }
    };
  };
  Directeur.prototype.dessineNuit = function () {
    var n = this._nuit; if (!n) return;
    var t = this.taille(), dpr = Math.min(2, global.devicePixelRatio || 1);
    if (n.width !== Math.round(t.l * dpr)) { n.width = Math.round(t.l * dpr); n.height = Math.round(t.h * dpr); }
    var ctx = n.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, t.l, t.h);
    ctx.fillStyle = n._couleur; ctx.fillRect(0, 0, t.l, t.h); ctx.globalCompositeOperation = 'destination-out';
    (this._sources || []).forEach(function (s) { var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.rayon * 1.3); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(s.x - s.rayon * 1.4, s.y - s.rayon * 1.4, s.rayon * 2.8, s.rayon * 2.8); });
  };

  /* --- heures du jour : soleil, ombres, couleurs et nuit d'un seul geste --- */
  var HEURES = {
    matin: { lum: { angle: 30, hauteur: 0.3, force: 0.26, teinte: '#2A2445' }, grade: 'linear-gradient(200deg, rgba(255,214,150,.30), rgba(255,180,200,.10) 60%, transparent)', rayons: '255,226,170' },
    midi: { lum: { angle: 100, hauteur: 0.92, force: 0.34, teinte: '#0B1A33' }, grade: null, rayons: '255,250,225' },
    soir: { lum: { angle: 165, hauteur: 0.1, force: 0.3, teinte: '#2B1030' }, grade: 'linear-gradient(160deg, rgba(255,140,60,.35), rgba(200,60,120,.18) 55%, rgba(40,20,80,.25))', rayons: '255,170,90' },
    nuit: { lum: { angle: 120, hauteur: 0.7, force: 0.12, teinte: '#000814' }, grade: 'linear-gradient(180deg, rgba(20,30,90,.35), rgba(5,10,40,.25))', rayons: '170,200,255', nuit: 'rgba(4,10,35,.62)' }
  };
  Directeur.prototype.heure = function (nom) {
    var h = HEURES[nom] || HEURES.midi, self = this;
    this.lumiere(h.lum); this.lum.rayonsCouleur = h.rayons;
    if (this._grade) { var g0 = this._grade; g0.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).onfinish = function () { g0.remove(); }; this._grade = null; }
    if (h.grade) { this._grade = this.calqueDiv('inset:0;mix-blend-mode:soft-light;background:' + h.grade); this._grade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: 'forwards' }); }
    if (this._nuit) { var n0 = this._nuit; n0.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).onfinish = function () { n0.remove(); }; this._nuit = null; }
    if (h.nuit) { var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; c._couleur = h.nuit; this.calque.insertBefore(c, this.calque.firstChild); this._nuit = c; this.dessineNuit(); c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1200 }); }
    if (this._rayons) this.rayons(true);
    this.heureActive = nom; return this;
  };

  /* --- distance : parallaxe, brume et flou de profondeur sur [data-kwfx-z] --- */
  Directeur.prototype.profondeur = function (racine, o) {
    o = o || {}; var self = this, R = racine || this.conteneur, amp = o.amplitude || 26, cible = [0, 0], cur = [0, 0], raf = 0, flouMax = o.flou == null ? 3 : o.flou;
    this._prof = { racine: R, focus: o.focus == null ? 0 : o.focus, flouMax: flouMax, brume: o.brume !== false };
    function calques() { return R.querySelectorAll('[data-kwfx-z]'); }
    function filtres() {
      var P = self._prof, br = self.lum.brume;
      Array.prototype.forEach.call(calques(), function (el) {
        var z = parseFloat(el.getAttribute('data-kwfx-z')) || 0, ecart = Math.abs(z - P.focus);
        el.style.transition = 'filter .6s ease'; el.style.willChange = 'transform';
        el.style.filter = (P.brume ? 'saturate(' + (1 - 0.45 * z).toFixed(2) + ') contrast(' + (1 - 0.3 * z).toFixed(2) + ') brightness(' + (1 + 0.12 * z).toFixed(2) + ') ' : '') + (flouMax ? 'blur(' + (ecart * flouMax).toFixed(1) + 'px)' : '');
        if (P.brume && !el._kwfxBrume && z > 0.3) { el._kwfxBrume = true; el.style.opacity = (1 - 0.25 * z).toFixed(2); }
      });
    }
    function anime() {
      cur[0] += (cible[0] - cur[0]) * 0.08; cur[1] += (cible[1] - cur[1]) * 0.08;
      Array.prototype.forEach.call(calques(), function (el) { var z = parseFloat(el.getAttribute('data-kwfx-z')) || 0, k = (1 - z) * amp; el.style.transform = 'translate3d(' + (-cur[0] * k).toFixed(1) + 'px,' + (-cur[1] * k * 0.6).toFixed(1) + 'px,0) scale(' + (1 + 0.04 * (1 - z)).toFixed(3) + ')'; });
      if (Math.abs(cible[0] - cur[0]) + Math.abs(cible[1] - cur[1]) > 0.002) raf = requestAnimationFrame(anime); else raf = 0;
    }
    function vers(x, y) { cible[0] = borne(x, -1, 1); cible[1] = borne(y, -1, 1); if (!raf) raf = requestAnimationFrame(anime); }
    function souris(e) { var b = R.getBoundingClientRect(); vers((e.clientX - b.left) / b.width * 2 - 1, (e.clientY - b.top) / b.height * 2 - 1); }
    function incline(e) { if (e.gamma == null) return; vers(e.gamma / 30, (e.beta - 40) / 30); }
    R.addEventListener('pointermove', souris); global.addEventListener('deviceorientation', incline);
    filtres(); vers(0, 0);
    this._profStop = function () { R.removeEventListener('pointermove', souris); global.removeEventListener('deviceorientation', incline); if (raf) cancelAnimationFrame(raf); };
    this._profFiltres = filtres;
    return { arreter: function () { self._profStop(); }, actualiser: filtres };
  };
  /* mise au point : ce qui est à la distance z est net, le reste est flou (comme un objectif photo) */
  Directeur.prototype.miseAuPoint = function (z) { if (this._prof) { this._prof.focus = borne(z, 0, 1); this._profFiltres(); } return this; };

  /* --- reflets : brillance spéculaire côté lumière + éclat qui balaye --- */
  Directeur.prototype.brillance = function (el, o) {
    if (!el) return this; o = o || {};
    if (el._kwfxBrille) el._kwfxBrille.remove();
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var b = document.createElement('span'); b.setAttribute('aria-hidden', 'true');
    var a = this.lum.angle * Math.PI / 180, px = 50 + Math.cos(a) * 28, py = 50 - Math.sin(a) * 28, k = o.force == null ? 1 : o.force;
    b.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;overflow:hidden;mix-blend-mode:screen;' +
      'background:radial-gradient(ellipse 38% 30% at ' + px.toFixed(0) + '% ' + py.toFixed(0) + '%, rgba(255,255,255,' + (0.75 * k).toFixed(2) + '), rgba(255,255,255,0) 70%),' +
      'radial-gradient(ellipse 60% 50% at ' + (100 - px).toFixed(0) + '% ' + (100 - py).toFixed(0) + '%, rgba(255,255,255,' + (0.12 * k).toFixed(2) + '), rgba(255,255,255,0) 70%)';
    if (o.balaye !== false) {
      var bande = document.createElement('span'), ang = Math.round(90 - this.lum.angle + 90);
      bande.style.cssText = 'position:absolute;inset:-50%;background:linear-gradient(' + ang + 'deg, transparent 42%, rgba(255,255,255,' + (0.55 * k).toFixed(2) + ') 50%, transparent 58%)';
      b.appendChild(bande);
      bande.animate([{ transform: 'translateX(-60%)' }, { transform: 'translateX(60%)', offset: 0.35 }, { transform: 'translateX(60%)' }], { duration: o.periode || 3200, iterations: Infinity, delay: Math.random() * 1500, easing: 'ease-in-out' });
    }
    el.appendChild(b); el._kwfxBrille = b; el._kwfxBrilleO = o;
    this._brillants = (this._brillants || []).filter(function (x) { return x.isConnected; }); if (this._brillants.indexOf(el) < 0) this._brillants.push(el);
    return this;
  };
  /* reflet au sol (WebKit : Safari, Apple Books, Chrome ; ignoré ailleurs sans erreur) */
  Directeur.prototype.reflet = function (el, o) {
    if (!el) return this; o = o || {};
    el.style.webkitBoxReflect = o.actif === false ? 'none' : 'below ' + (o.ecart || 4) + 'px linear-gradient(transparent ' + (o.coupe || 55) + '%, rgba(255,255,255,' + (o.force || 0.3) + '))';
    return this;
  };
  /* reflets des particules sur une surface (eau du lagon qui ondule, ou sol brillant) */
  Directeur.prototype.reflets = function (o) {
    o = o || {}; var self = this;
    if (this._surface) { this._surface.remove(); this._surface = null; }
    if (o.actif === false) { this.refl = null; return this; }
    var t = this.taille(), y = o.y != null ? (o.y <= 1 ? o.y * t.h : o.y) : t.h * 0.78, type = o.type || 'eau';
    this.refl = { actif: true, y: y, type: type, force: o.force == null ? 0.45 : o.force };
    var sf = this.calqueDiv('left:0;right:0;top:' + y + 'px;bottom:0;' + (type === 'eau'
      ? 'background:linear-gradient(180deg, rgba(255,255,255,.28), rgba(144,224,239,.10) 2px, rgba(0,119,182,.18) 40%, rgba(3,4,94,.28));'
      : 'background:linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.05) 2px, rgba(0,0,0,.12));'));
    sf.style.zIndex = '-1'; this.calque.insertBefore(sf, this.calque.firstChild);
    if (type === 'eau') { var vag = document.createElement('div'); vag.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(180deg, rgba(255,255,255,.10) 0 1px, transparent 1px 9px);'; sf.appendChild(vag); vag.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(9px)' }], { duration: 1800, iterations: Infinity }); }
    this._surface = sf; this.particules.demarre(); return this;
  };
  /* quand la lumière change, les brillances et les rayons suivent */
  var lumiereV24 = Directeur.prototype.lumiere;
  Directeur.prototype.lumiere = function (o) {
    lumiereV24.call(this, o); var self = this;
    if (o && o.brume) { var c = versRgb(o.brume); this.lum.brumeRgb = c; }
    (this._brillants || []).forEach(function (el) { if (el.isConnected) self.brillance(el, el._kwfxBrilleO); });
    if (o && o.angle != null && this._rayons) this.rayons(true);
    return this;
  };

  /* ======================================================================
   * 7 sexies. LIQUIDES, EAU QUI BOUGE ET APESANTEUR v2.6
   *  Liquides : les gouttes se rejoignent en une seule surface (métaballes), éclairée par le soleil de KwFX,
   *             avec ombre portée ; jus de fruit qui finit en petite flaque ; fx.joue('plouf') éclaboussure d'eau,
   *             fx.joue('blobs') bulles de liquide qui flottent ; fx.fontaine(x, y) ; fx.goutte(x, y)
   *  Eau : fx.eau({ y: .75 }) surface qui ondule (ressorts), réagit au doigt et aux objets, écume, reflets du
   *        soleil et lumière qui danse sous l'eau ; fx.ondulation(x, y) ronds dans l'eau ; fx.flotter(el)
   *  Apesanteur : fx.apesanteur(true) particules et liquides qui flottent et tournoient, objets qui dérivent
   * ==================================================================== */
  var EAU = ['#CFF4FF', '#8EDBF5', '#5BC0EB', '#FFFFFF'], JET = ['#5BC0EB', '#3FA9E0', '#8EDBF5'];
  SYSTEMES.jus[1].liquide = true; SYSTEMES.jus[1].taille = [3, 6];
  SYSTEMES.eclaboussure.forEach(function (e) { if (e.sprite === 'goutte') e.liquide = true; });
  SYSTEMES.eclaboussure.push(
    { nb: 2, fixe: true, vie: [0.9, 1.5], vitesse: [30, 90], cone: [0, 26], taille: [3, 4.5], tailleVie: [0.7, 1.25, 1.25, 0], heriteCouleur: true, frein: 5, liquide: true, alphaVie: [1, 1, 0.9, 0] },
    { nb: 2, fixe: true, vie: [0.9, 1.5], vitesse: [30, 90], cone: [180, 26], taille: [3, 4.5], tailleVie: [0.7, 1.25, 1.25, 0], heriteCouleur: true, frein: 5, liquide: true, alphaVie: [1, 1, 0.9, 0] });
  SYSTEMES.gouttelette = [{ nb: 3, fixe: true, vie: [0.2, 0.35], vitesse: [60, 160], cone: [-90, 120], taille: [1.4, 2.2], couleur: EAU, gravite: 900, liquide: true }];
  SYSTEMES.plouf = [
    { nb: 26, vie: [0.6, 1.0], vitesse: [260, 640], cone: [-90, 70], taille: [2.4, 4.6], couleur: EAU, gravite: 1500, frein: 0.4, etirement: 0.004, etirementMax: 1.2, liquide: true, sol: { decalage: 4, mort: true, sous: 'gouttelette' } },
    { nb: 10, vie: [0.4, 0.7], vitesse: [120, 260], cone: [-90, 150], taille: [4, 7], couleur: EAU, gravite: 900, liquide: true, sol: { decalage: 4, mort: true } },
    { nb: 1, fixe: true, vie: 0.6, taille: 14, tailleVie: [0.4, 5], alphaVie: [0.7, 0], sprite: 'anneau', couleur: '#FFFFFF' },
    { nb: 8, vie: [0.5, 0.9], vitesse: [30, 120], cone: [-90, 160], taille: [10, 18], tailleVie: [0.6, 1.5], alphaVie: [0.35, 0], sprite: 'fumee', couleur: '#FFFFFF', frein: 2 },
    { nb: 6, vie: [0.8, 1.4], vitesse: [20, 60], cone: [90, 80], taille: [1.5, 3.5], sprite: 'bulle', couleur: '#FFFFFF', gravite: -120, alphaVie: [0, 0.8, 0] }
  ];
  SYSTEMES.blobs = [
    { nb: 9, vie: [3.5, 5.5], vitesse: [20, 110], taille: [10, 20], tailleVie: [0.4, 1, 1, 0.2], alphaVie: [0, 1, 1, 0], couleur: 'palette', couleurFruit: true, liquide: 1.5, frein: 0.6, curl: { force: 140, freq: 0.012, vitesse: 0.4 } },
    { nb: 18, vie: [2.5, 4], vitesse: [30, 140], taille: [3.5, 6], alphaVie: [0, 1, 1, 0], couleur: 'palette', couleurFruit: true, liquide: 1.3, frein: 0.8, curl: { force: 180, freq: 0.014, vitesse: 0.5 } }
  ];
  SYSTEMES.jetEau = [{ nb: 5, fixe: true, vie: [1.0, 1.4], vitesse: [520, 640], cone: [-90, 9], taille: [2.6, 3.8], couleur: EAU, gravite: 950, liquide: true, sol: { decalage: 2, mort: true, sous: 'gouttelette' } }];
  [['plouf', 'Plouf (éclaboussure d\'eau)'], ['blobs', 'Bulles de liquide qui flottent']].forEach(function (p) {
    NOMS_EFFETS[p[0]] = p[1]; EFFETS[p[0]] = { nom: p[1], f: function (m, x, y, k, o) { m.systeme(p[0], x, y, k, o); if (p[0] === 'plouf') m.fx.sonEau(k); } };
  });
  /* bruit d'eau : « ploc » (note qui descend, comme une goutte) + éclaboussure (bruit filtré) */
  Directeur.prototype.sonEau = function (k) {
    if (!this.opt.sons) return; var c = this.audio.pret(); if (!c) return; k = k == null ? 0.6 : k;
    this.audio.note(hasard(700, 1000), 0.12, 'sine', 0.18 * k, hasard(240, 340));
    this.audio.souffle(0.25 + 0.2 * k, 3200, 800, 0.16 * k);
  };
  Directeur.prototype.fontaine = function (x, y, o) {
    o = o || {}; var self = this, m = this.particules, actif = true, p = { x: x, y: y };
    (function jet() { if (!actif) return; if (!self.enPause) m.systeme('jetEau', p.x, p.y, 0.5, { couleurs: JET }); setTimeout(jet, o.cadence || 45); })();
    return { deplacer: function (nx, ny) { p.x = nx; p.y = ny; }, arreter: function () { actif = false; } };
  };
  Directeur.prototype.goutte = function (x, y, o) {
    o = o || {}; var self = this, m = this.particules, y0 = Math.max(0, y - (o.hauteur || 260)), cle = 'chute:' + Math.round((y - y0) / 20) * 20;
    var di = m.def(cle, { nb: 1, fixe: true, vie: 3, vitesse: 0, taille: o.taille || 4.5, couleur: o.couleur ? 'fruit' : EAU, gravite: 1600, liquide: true, etirement: 0.003, etirementMax: 1.4, sol: { decalage: Math.round((y - y0) / 20) * 20, mort: true, sous: o.couleur ? 'eclaboussure' : 'plouf' } });
    m.emettre(di, x, y0, 0.5, { couleur: o.couleur, couleurs: EAU }, 1);
    setTimeout(function () { if (!o.couleur) { self.sonEau(0.5); if (self._eau) self._eau.eclabousser(x, 6); else self.ondulation(x, y); } }, Math.sqrt(2 * (y - y0) / 1600) * 1000);
    return this;
  };

  /* --- surface d'eau vivante (ressorts) --- */
  Directeur.prototype.eau = function (o) {
    o = o || {}; var self = this;
    if (this._eau) { this._eau.arreter(); this._eau = null; }
    if (o.actif === false) { if (this._surface) this._surface.style.display = ''; return this; }
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(c);
    var ctx = c.getContext('2d'), dpr = 1, L = 0, H = 0, pas = this.opt.support === 'epub' ? 10 : 6, n = 0, h = [], v = [], raf = 0, t0 = maintenant(), niveau = o.y == null ? 0.75 : o.y;
    var coul = o.couleur || '#1E88C8', rgb = versRgb(coul), actif = true, flotteurs = [];
    function redim() { var t = self.taille(); L = t.l; H = t.h; dpr = Math.min(2, global.devicePixelRatio || 1); c.width = Math.round(L * dpr); c.height = Math.round(H * dpr); n = Math.ceil(L / pas) + 2; h = new Float32Array(n); v = new Float32Array(n); }
    function base() { return niveau <= 1 ? niveau * H : niveau; }
    function hauteur(x) { var i = x / pas, a = Math.floor(i), f = i - a; a = borne(a, 0, n - 2); var tt = (maintenant() - t0) / 1000; return base() + h[a] + (h[a + 1] - h[a]) * f + Math.sin(x * 0.018 + tt * 1.6) * 3 + Math.sin(x * 0.043 - tt * 2.3) * 1.6; }
    function eclabousser(x, force, particules) {
      var i = borne(Math.round(x / pas), 1, n - 2); force = force == null ? 10 : force;
      for (var k = -2; k <= 2; k++) if (i + k >= 0 && i + k < n) v[i + k] += force * (1 - Math.abs(k) * 0.3);
      if (particules !== false && force > 5) { self.lance('plouf', { x: x, y: hauteur(x) }, borne(force / 25, 0.25, 1), { couleurs: EAU }); self.sonEau(borne(force / 25, 0.2, 1)); }
    }
    function pas1() {
      var tension = 0.028, amort = 0.018, etal = 0.24;
      for (var i = 0; i < n; i++) { v[i] += -tension * h[i] - amort * v[i]; h[i] += v[i]; }
      for (var p = 0; p < 2; p++) {
        var dl = new Float32Array(n), dr = new Float32Array(n);
        for (var j = 0; j < n; j++) { if (j > 0) { dl[j] = etal * (h[j] - h[j - 1]); v[j - 1] += dl[j]; } if (j < n - 1) { dr[j] = etal * (h[j] - h[j + 1]); v[j + 1] += dr[j]; } }
        for (var q = 0; q < n; q++) { if (q > 0) h[q - 1] += dl[q]; if (q < n - 1) h[q + 1] += dr[q]; }
      }
      if (Math.random() < 0.04) v[(Math.random() * n) | 0] += hasard(-1.2, 1.2); // la mer n'est jamais immobile
    }
    function dessine() {
      if (!actif) return;
      if (!self.enPause) pas1();
      var tt = (maintenant() - t0) / 1000, y0 = base(), lu = self.lum, nuit = self.heureActive === 'nuit' ? 0.45 : 1, a = lu.angle * Math.PI / 180, lx = Math.cos(a), ly = -Math.sin(a);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, L, H);
      ctx.beginPath(); ctx.moveTo(0, H); var pts = [];
      for (var x = 0; x <= L + pas; x += pas) { var yy = hauteur(x); pts.push(yy); ctx.lineTo(x, yy); }
      ctx.lineTo(L, H); ctx.closePath();
      var g = ctx.createLinearGradient(0, y0 - 10, 0, H);
      g.addColorStop(0, 'rgba(' + Math.min(255, rgb[0] + 70) + ',' + Math.min(255, rgb[1] + 70) + ',' + Math.min(255, rgb[2] + 50) + ',' + (0.72 * nuit + 0.2).toFixed(2) + ')');
      g.addColorStop(0.35, 'rgba(' + rgb.join(',') + ',.78)'); g.addColorStop(1, 'rgba(' + Math.round(rgb[0] * 0.25) + ',' + Math.round(rgb[1] * 0.3) + ',' + Math.round(rgb[2] * 0.5) + ',.92)');
      ctx.fillStyle = g; ctx.fill();
      // lumière qui danse sous l'eau (caustiques)
      ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,' + (0.07 * nuit * (0.5 + lu.force * 1.6)).toFixed(3) + ')'; ctx.lineWidth = 2;
      for (var r = 0; r < 7; r++) { ctx.beginPath(); for (var cx = 0; cx <= L; cx += 14) { var cy = y0 + 18 + r * 22 + Math.sin(cx * 0.03 + tt * (1.2 + r * 0.17) + r) * 6 + Math.sin(cx * 0.011 - tt * 0.8) * 4; if (cx) ctx.lineTo(cx, cy); else ctx.moveTo(cx, cy); } ctx.stroke(); }
      ctx.restore();
      // écume et reflets du soleil sur les crêtes tournées vers la lumière
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,' + (0.75 * nuit).toFixed(2) + ')'; ctx.beginPath();
      for (var k = 0; k < pts.length; k++) { if (k) ctx.lineTo(k * pas, pts[k]); else ctx.moveTo(0, pts[0]); } ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      for (var e = 1; e < pts.length; e++) { var pente = (pts[e] - pts[e - 1]) / pas, face = -pente * lx * 1.4 + ly * 0.3 + 0.2; if (face > 0.35) { ctx.fillStyle = 'rgba(255,250,230,' + Math.min(0.55, (face - 0.35) * 0.9 * nuit * (0.4 + lu.force * 2)).toFixed(3) + ')'; ctx.fillRect(e * pas - pas, pts[e] + 1, pas, 2.5); } }
      ctx.globalCompositeOperation = 'source-over';
      if (lu.force > 0.04 && lu.hauteur < 0.75) { // chemin de lumière : le soleil bas se reflète en paillettes sur l'eau
        var sx = L / 2 + Math.cos(a) * L * 0.42, kk = (0.75 - lu.hauteur) * nuit * Math.min(1, lu.force * 4), fr8 = Math.floor(tt * 7); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#FFD9A0';
        for (var yy2 = y0 + 5; yy2 < H; yy2 += 4 + ((yy2 * 7) % 5)) { var lw = 8 + (yy2 - y0) * 0.45; for (var q2 = 0; q2 < 2; q2++) { var hsh = Math.sin(yy2 * 12.9898 + (fr8 + q2) * 78.233) * 43758.5453; hsh -= Math.floor(hsh); var hs2 = Math.sin(yy2 * 3.1 + q2 * 9.7 + fr8 * 1.3) * 0.5 + 0.5; ctx.globalAlpha = Math.min(1, kk * 1.6) * hs2 * hs2 * (0.5 + 0.5 * hsh) * (1 - (yy2 - y0) / (H - y0 + 1) * 0.5); ctx.fillRect(sx + (hsh - 0.5) * lw * 2, yy2, 1.5 + hs2 * hsh * 7, 1.3); } }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
      if (self.refl) self.refl.y = y0;
      flotteurs.forEach(function (f) { f(); });
      raf = requestAnimationFrame(dessine);
    }
    var der = null;
    function bouge(ev) { var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top, t = maintenant();
      if (der) { var vy = (y - der.y) / Math.max(1, t - der.t) * 16, dist = Math.abs(y - hauteur(x)); if (dist < 30) eclabousser(x, borne(Math.abs(vy) * 1.2 + Math.abs(x - der.x) * 0.15, 0, 20), Math.abs(vy) > 9); }
      der = { x: x, y: y, t: t }; }
    redim(); global.addEventListener('resize', redim); this.conteneur.addEventListener('pointermove', bouge);
    if (this._surface) this._surface.style.display = 'none';
    raf = requestAnimationFrame(dessine);
    this._eau = {
      eclabousser: eclabousser, hauteur: hauteur, niveau: function (y) { niveau = y; }, _flotteurs: flotteurs,
      arreter: function () { actif = false; cancelAnimationFrame(raf); self.conteneur.removeEventListener('pointermove', bouge); global.removeEventListener('resize', redim); c.remove(); }
    };
    return this._eau;
  };

  /* --- ronds dans l'eau (vue de côté : ellipses ; vue de dessus : cercles) --- */
  Directeur.prototype.ondulation = function (x, y, o) {
    o = o || {}; var k = o.vueDessus ? 1 : 0.32, R = o.rayon || 90;
    for (var i = 0; i < 3; i++) (function (i, self) {
      var el = self.calqueDiv('left:' + x + 'px;top:' + y + 'px;width:' + R * 2 + 'px;height:' + R * 2 * k + 'px;margin:-' + R * k + 'px 0 0 -' + R + 'px;border-radius:50%;' +
        'border:2px solid rgba(255,255,255,.75);box-shadow:inset 0 2px 3px rgba(255,255,255,.45),0 2px 3px rgba(0,40,80,.25)');
      el.animate([{ transform: 'scale(.05)', opacity: 0 }, { transform: 'scale(.3)', opacity: 0.9, offset: 0.15 }, { transform: 'scale(1)', opacity: 0 }], { duration: 1400, delay: i * 260, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'backwards' }).onfinish = function () { el.remove(); };
    })(i, this);
    return this;
  };

  /* --- faire flotter un élément : sur l'eau (suit les vagues) ou en apesanteur (dérive lente) --- */
  Directeur.prototype.flotter = function (el, o) {
    if (!el) return { arreter: function () {} }; o = o || {}; var self = this, t0 = maintenant() + Math.random() * 4000, actif = true, raf = 0, ph = Math.random() * 6.28;
    var baseT = el.style.transform || '';
    function surEau() {
      var e = self._eau; if (!e) return false;
      var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), cx = r.left + r.width / 2 - b.left;
      var bas = el.offsetTop + el.offsetHeight, hy = e.hauteur(cx), pente = (e.hauteur(cx + 10) - e.hauteur(cx - 10)) / 20;
      var dy = hy - bas + el.offsetHeight * (o.immersion == null ? 0.35 : o.immersion);
      el.style.transform = baseT + ' translateY(' + dy.toFixed(1) + 'px) rotate(' + (Math.atan(pente) * 57).toFixed(1) + 'deg)';
      return true;
    }
    function boucle() {
      if (!actif) return;
      if (!surEau()) { var t = (maintenant() - t0) / 1000, amp = o.amplitude || 14;
        el.style.transform = baseT + ' translate(' + (Math.sin(t * 0.7 + ph) * amp * 0.8).toFixed(1) + 'px,' + (Math.sin(t * 0.9 + ph * 2) * amp).toFixed(1) + 'px) rotate(' + (Math.sin(t * 0.5 + ph) * 12).toFixed(1) + 'deg)'; }
      raf = requestAnimationFrame(boucle);
    }
    boucle();
    return { arreter: function () { actif = false; cancelAnimationFrame(raf); el.style.transform = baseT; } };
  };

  /* --- apesanteur --- */
  Directeur.prototype.apesanteur = function (actif, o) {
    o = o || {}; var m = this.particules, self = this, de = { g: m.gravite, a: m.apes }, vers = actif === false ? { g: 1, a: 0 } : { g: o.gravite == null ? 0.02 : o.gravite, a: 1 }, t0 = maintenant(), D = o.duree || 900;
    (function pas() { var k = Math.min(1, (maintenant() - t0) / D), e = k * k * (3 - 2 * k); m.gravite = de.g + (vers.g - de.g) * e; m.apes = de.a + (vers.a - de.a) * e; if (k < 1) requestAnimationFrame(pas); })();
    if (this._flottes) { this._flottes.forEach(function (f) { f.arreter(); }); this._flottes = null; }
    if (actif !== false && o.elements) this._flottes = Array.prototype.map.call(o.elements, function (el) { return self.flotter(el, { amplitude: 18 }); });
    if (this.opt.sons) { this.audio.souffle(1.2, actif === false ? 300 : 900, actif === false ? 900 : 260, 0.12); this.audio.note(actif === false ? 520 : 260, 0.9, 'sine', 0.06, actif === false ? 260 : 520); }
    this.enApesanteur = actif !== false; m.demarre(); return this;
  };

  /* ======================================================================
   * 7 septies. ÉCLABOUSSURES, FUMÉES ET CENDRES v2.7
   *  Éclaboussures : fx.eclabousser(x, y, { type: 'eau'|'jus'|'lave'|'boue', angle, force, couleur })
   *                  nappe de liquide qui se rejoint, couronne de gouttes, brume fine, tache au sol
   *  Fumées : sprite 'volute' en relief éclairé par le soleil ; fx.joue('fumeeNoire'|'vapeur') ;
   *           fx.panache(x, y, { type: 'volcan'|'feu'|'vapeur' }) colonne continue poussée par le vent
   *  Cendres : fx.cendres(true) pluie de cendres et de braises qui refroidissent et se posent au sol ;
   *            fx.reduireEnCendres(element) l'objet brûle de bas en haut et part en cendres
   *  Vent : fx.vent(120) pousse fumées, cendres et gouttes (la météo règle le vent toute seule)
   * ==================================================================== */
  var GRIS_FUMEE = ['#2e2724', '#4a403b', '#6e645e', '#9a918b'], CENDRE = ['#3f3a36', '#6b635d', '#8a817a', '#a59d96', '#c4bdb6'];
  var BRAISE_FROIDE = ['#FFF1B0', '#FFB000', '#FF5A00', '#8a2a10', '#3a2b25', '#6b635d'];
  SYSTEMES.fumee = [
    { nb: 6, vie: [1.3, 2.1], zone: 'cercle', rayon: 14, vitesse: [20, 70], cone: [-90, 100], taille: [14, 22], tailleVie: [0.5, 1.6, 2.4], alphaVie: [0, 0.55, 0.4, 0], sprite: 'volute', couleur: '#a49cad', couleurVie: ['#8d8597', '#b3acb9', '#cfc9d4'], gravite: -55, frein: 1, rotVitesse: [-25, 25], curl: { force: 140, freq: 0.012 }, vent: 1 }
  ];
  SYSTEMES.eruption.forEach(function (e) { if (e.sprite === 'fumee') { e.sprite = 'volute'; e.vent = 1; e.rotVitesse = [-20, 20]; e.alphaVie = [0, 0.7, 0.5, 0]; } });
  SYSTEMES.fumeeNoire = [
    { nb: 14, vie: [2, 3.2], zone: 'cercle', rayon: 26, vitesse: [40, 160], cone: [-90, 70], taille: [18, 30], tailleVie: [0.4, 1.4, 2.6], alphaVie: [0, 0.85, 0.6, 0], sprite: 'volute', couleur: GRIS_FUMEE[1], couleurVie: GRIS_FUMEE, gravite: -90, frein: 1.1, rotVitesse: [-20, 20], curl: { force: 200, freq: 0.008, vitesse: 0.4 }, vent: 1 },
    { nb: 8, vie: [0.4, 0.8], zone: 'cercle', rayon: 18, vitesse: [30, 120], cone: [-90, 90], taille: [10, 16], tailleVie: [1, 0.3], alphaVie: [0.6, 0], sprite: 'doux', melange: 'add', couleur: '#FF8C00', couleurVie: ['#FFD23F', '#FF5A00', '#5a1a08'] },
    { nb: 10, vie: [2.5, 4], zone: 'cercle', rayon: 24, vitesse: [60, 200], cone: [-90, 80], taille: [1.4, 2.6], sprite: 'rect', couleur: CENDRE, gravite: 25, frein: 1.4, flipVitesse: 4, rotVitesse: [-200, 200], curl: { force: 120, freq: 0.01 }, vent: 1, alphaVie: [0, 1, 1, 0] }
  ];
  SYSTEMES.vapeur = [
    { nb: 9, vie: [0.9, 1.6], zone: 'cercle', rayon: 12, vitesse: [60, 150], cone: [-90, 40], taille: [10, 16], tailleVie: [0.4, 1.6, 2.6], alphaVie: [0, 0.45, 0.22, 0], sprite: 'volute', couleur: '#F4F7FA', couleurVie: ['#F4F7FA', '#E6EDF2', '#D8E2EA'], gravite: -140, frein: 1.4, rotVitesse: [-40, 40], curl: { force: 160, freq: 0.014, vitesse: 0.6 }, vent: 1.3 }
  ];
  SYSTEMES.cendresVol = [
    { nb: 34, vie: [1.6, 3], zone: 'cercle', rayon: 10, vitesse: [40, 180], cone: [-90, 100], taille: [1.4, 3.2], sprite: 'rect', couleur: CENDRE, gravite: 30, frein: 1.6, flipVitesse: 5, rotVitesse: [-260, 260], curl: { force: 160, freq: 0.012 }, vent: 1, alphaVie: [1, 1, 0.8, 0] },
    { nb: 14, vie: [0.7, 1.6], zone: 'cercle', rayon: 10, vitesse: [40, 200], cone: [-90, 80], taille: [1.2, 2.4], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: BRAISE_FROIDE, gravite: -60, frein: 1.2, curl: { force: 260, freq: 0.014, vitesse: 0.8 }, scintille: true, vent: 1 }
  ];
  /* éclaboussures plus riches : couronne de gouttes étirées + brume fine */
  SYSTEMES.plouf.push(
    { nb: 14, vie: [0.35, 0.6], vitesse: [220, 420], cone: [-90, 130], taille: [1.2, 2], sprite: 'goutte', etirement: 0.01, etirementMax: 1.8, couleur: '#FFFFFF', gravite: 1300, frein: 0.6 },
    { nb: 16, vie: [0.5, 1], vitesse: [40, 180], cone: [-90, 170], taille: [1, 2], alphaVie: [0.7, 0], sprite: 'doux', couleur: '#FFFFFF', gravite: 120, frein: 2.4, vent: 1.5 });
  SYSTEMES.eclaboussure.push({ nb: 5, fixe: true, vie: [0.3, 0.6], vitesse: [30, 110], cone: [-90, 150], taille: [0.8, 1.5], alphaVie: [0.6, 0], sprite: 'doux', heriteCouleur: true, frein: 2 });
  [['fumeeNoire', 'Fumée noire épaisse'], ['vapeur', 'Vapeur'], ['cendresVol', 'Envol de cendres']].forEach(function (p) {
    NOMS_EFFETS[p[0]] = p[1]; EFFETS[p[0]] = { nom: p[1], f: function (m, x, y, k, o) { m.systeme(p[0], x, y, k, o); } };
  });
  AMBIANCES.cendres = [
    { debit: 14, vie: [7, 11], zone: 'ecran-haut-large', vitesse: [10, 40], cone: [90, 50], taille: [1.3, 3], sprite: 'rect', couleur: CENDRE, gravite: 16, frein: 0.7, flipVitesse: 2.5, rotVitesse: [-120, 120], curl: { force: 70, freq: 0.006, vitesse: 0.3 }, vent: 1, alphaVie: [0, 1, 1, 0], sol: { rebond: 0, friction: 0.15 } },
    { debit: 2.5, vie: [4, 7], zone: 'ecran-haut-large', vitesse: [10, 40], cone: [90, 40], taille: [1.2, 2.4], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: BRAISE_FROIDE, gravite: 14, curl: { force: 90, freq: 0.006, vitesse: 0.4 }, scintille: true, vent: 1, alphaVie: [0, 1, 1, 0] },
    { debit: 0.5, vie: [8, 12], zone: 'ecran-haut-large', vitesse: [5, 20], cone: [90, 40], taille: [50, 90], tailleVie: [0.8, 1.3], alphaVie: [0, 0.16, 0], sprite: 'volute', couleur: '#6e645e', gravite: 6, vent: 0.8, rotVitesse: [-8, 8] }
  ];

  Directeur.prototype.vent = function (v, o) {
    o = o || {}; var m = this.particules, de = m.vent, t0 = maintenant(), D = o.duree || 1200; v = v || 0;
    (function pas() { var k = Math.min(1, (maintenant() - t0) / D); m.vent = de + (v - de) * k * k * (3 - 2 * k); if (k < 1) requestAnimationFrame(pas); })();
    this.ventActif = v; return this;
  };
  var VENT_METEO = { pluie: 30, orage: 110, cyclone: 320, alize: 80 };
  var meteoV26 = Directeur.prototype.meteo;
  Directeur.prototype.meteo = function (nom, o) {
    var m = this.particules, gardees = m.ambiances.filter(function (a) { return a.cendres; });
    meteoV26.call(this, nom, o);
    if (gardees.length) { m.ambiances = m.ambiances.filter(function (a) { return !a.cendres; }).concat(gardees); m.demarre(); }
    this.vent(VENT_METEO[nom] || 0); return this;
  };
  Directeur.prototype.cendres = function (actif, o) {
    o = o || {}; var m = this.particules, k = (o.force == null ? 1 : o.force) * (this.opt.support === 'epub' ? 0.6 : 1);
    m.ambiances = m.ambiances.filter(function (a) { return !a.cendres; });
    if (actif !== false) AMBIANCES.cendres.forEach(function (e, i) { m.ambiances.push({ di: m.def('amb:cendres:' + i, e), debit: e.debit * k, acc: 0, meteo: true, cendres: true }); });
    this.cendresActives = actif !== false; m.demarre(); return this;
  };
  Directeur.prototype.panache = function (x, y, o) {
    o = o || {}; var self = this, m = this.particules, actif = true, p = { x: x, y: y }, type = o.type || 'volcan', k = o.force == null ? 1 : o.force;
    var defs = {
      volcan: { cle: 'pan:volcan', e: { nb: 1, vie: [3.5, 5.5], zone: 'cercle', rayon: 10, vitesse: [90, 170], cone: [-90, 22], taille: [16, 26], tailleVie: [0.35, 1.5, 3.2], alphaVie: [0, 0.85, 0.55, 0], sprite: 'volute', couleur: GRIS_FUMEE[1], couleurVie: GRIS_FUMEE, gravite: -30, frein: 0.45, rotVitesse: [-15, 15], curl: { force: 130, freq: 0.006, vitesse: 0.3 }, vent: 1, ventPrise: 0.5 }, cad: 110, extra: 'cendresVol', pe: 0.06, lueur: true },
      feu: { cle: 'pan:feu', e: { nb: 1, vie: [1.8, 2.8], zone: 'cercle', rayon: 6, vitesse: [50, 100], cone: [-90, 20], taille: [9, 14], tailleVie: [0.4, 1.6, 2.6], alphaVie: [0, 0.6, 0.35, 0], sprite: 'volute', couleur: '#5a514c', couleurVie: ['#3a322e', '#6e645e', '#a39b95'], gravite: -60, frein: 0.8, rotVitesse: [-25, 25], curl: { force: 150, freq: 0.012, vitesse: 0.5 }, vent: 1 }, cad: 120, extra: 'braises', pe: 0.08 },
      vapeur: { cle: 'pan:vapeur', e: { nb: 1, vie: [1.2, 2], zone: 'cercle', rayon: 6, vitesse: [60, 120], cone: [-90, 18], taille: [8, 12], tailleVie: [0.4, 1.6, 2.6], alphaVie: [0, 0.55, 0.25, 0], sprite: 'volute', couleur: '#FFFFFF', couleurVie: ['#FFFFFF', '#EEF3F7'], gravite: -90, frein: 1, rotVitesse: [-35, 35], curl: { force: 150, freq: 0.014, vitesse: 0.6 }, vent: 1.3 }, cad: 90 }
    }[type] || {};
    var di = m.def(defs.cle, defs.e), lu = null;
    if (defs.lueur) lu = this.calqueDiv('left:' + (x - 60) + 'px;top:' + (y - 40) + 'px;width:120px;height:80px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,120,0,.55),rgba(255,60,0,0));mix-blend-mode:screen');
    (function jet() {
      if (!actif) return;
      if (!self.enPause) { m.emettre(di, p.x, p.y, 0.5, {}, 1); if (defs.extra && Math.random() < defs.pe * k) m.systeme(defs.extra, p.x, p.y, 0.3, {}); m.demarre(); }
      setTimeout(jet, (defs.cad || 110) / Math.max(0.2, k));
    })();
    return { deplacer: function (nx, ny) { p.x = nx; p.y = ny; if (lu) { lu.style.left = (nx - 60) + 'px'; lu.style.top = (ny - 40) + 'px'; } }, arreter: function () { actif = false; if (lu) lu.remove(); } };
  };

  /* --- éclaboussure dirigée --- */
  var LIQ_TYPES = {
    eau: { couleurs: ['#CFF4FF', '#8EDBF5', '#5BC0EB', '#3FA9E0'], brume: '#FFFFFF', sous: 'gouttelette' },
    jus: { couleurs: null, brume: null, sous: 'eclaboussure' },
    boue: { couleurs: ['#6b4a2b', '#5a3d22', '#7a5733', '#4a3220'], brume: '#8a6d4d', sous: 'eclaboussure' },
    lave: { couleurs: ['#FFD23F', '#FFB000', '#FF6A00'], brume: null, sous: 'braises-sol', lave: true }
  };
  Directeur.prototype.eclabousser = function (x, y, o) {
    o = o || {}; var m = this.particules, T = LIQ_TYPES[o.type || 'eau'] || LIQ_TYPES.eau, ang = o.angle == null ? -90 : o.angle, k = o.force == null ? 0.8 : borne(o.force, 0.2, 1.5);
    var a15 = Math.round(ang / 15) * 15, sol = o.sol == null ? 60 : o.sol, cle = 'gerbe:' + (o.type || 'eau') + ':' + a15 + ':' + sol;
    var cv = T.lave ? BRAISE_FROIDE.slice(0, 4) : null, opts = { couleur: o.couleur, couleurs: T.couleurs || undefined };
    var nappe = m.def(cle + ':n', { nb: 1, vie: [0.7, 1.2], vitesse: [260, 700], cone: [a15, 60], taille: [2.6, 5.5], couleur: T.couleurs ? 'palette' : 'fruit', couleurFruit: true, variation: 0.05, couleurVie: cv, gravite: 1500, frein: 0.5, etirement: 0.004, etirementMax: 1.3, liquide: T.lave ? 1.1 : true, vent: 0.3, sol: { decalage: sol, mort: true, sous: T.sous } });
    var couronne = m.def(cle + ':c', { nb: 1, vie: [0.3, 0.6], vitesse: [260, 520], cone: [a15, 130], taille: [0.7, 1.3], sprite: 'goutte', etirement: 0.01, etirementMax: 1.6, couleur: T.couleurs ? 'palette' : 'fruit', couleurFruit: true, melange: T.lave ? 'add' : undefined, couleurVie: cv, gravite: 1300, frein: 0.5 });
    var tache = m.def(cle + ':t', { nb: 1, fixe: true, vie: [1.6, 2.6], vitesse: [20, 110], cone: [0, 360], taille: [4, 7], tailleVie: [0.5, 1.2, 1.2, 0], alphaVie: [1, 1, 0.8, 0], couleur: T.couleurs ? 'palette' : 'fruit', couleurFruit: true, couleurVie: cv, frein: 6, liquide: true });
    m.emettre(nappe, x, y, k, opts, Math.round(26 * k * m.qualite) + 4);
    m.emettre(couronne, x, y, k, opts, Math.round(16 * k * m.qualite) + 2);
    m.emettre(tache, x, y + Math.min(sol, 12), k, opts, 5);
    if (T.brume) m.emettre(m.def(cle + ':b', { nb: 1, vie: [0.5, 1], vitesse: [40, 200], cone: [a15, 160], taille: [1, 2.2], alphaVie: [0.6, 0], sprite: 'doux', couleur: T.brume, gravite: 120, frein: 2.4, vent: 1.5 }), x, y, k, {}, Math.round(14 * k));
    if (T.lave) { m.systeme('braises', x, y, k, {}); m.systeme('fumee', x, y - 10, 0.5 * k, {}); }
    m.demarre();
    if (this.opt.sons) { if (T.lave) { this.audio.note(110, 0.35, 'sine', 0.2 * k, 70); this.audio.souffle(0.7, 4000, 1500, 0.14 * k); } else this.sonEau(k); }
    if (this._eau && !T.lave && o.type !== 'boue') this._eau.eclabousser(x, 8 * k, false);
    return this;
  };

  /* --- réduire un élément en cendres (brûle de bas en haut) --- */
  Directeur.prototype.reduireEnCendres = function (el, o) {
    if (!el) return this; o = o || {}; var self = this, D = o.duree || 1300, t0 = maintenant(), m = this.particules;
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top;
    el.animate([{ filter: 'none', clipPath: 'inset(0 0 0 0)' }, { filter: 'sepia(.8) brightness(.75) contrast(1.3)', offset: 0.25, clipPath: 'inset(0 0 20% 0)' }, { filter: 'sepia(1) brightness(.25) contrast(1.6)', clipPath: 'inset(0 0 100% 0)' }], { duration: D, easing: 'cubic-bezier(.4,0,.7,1)', fill: 'forwards' });
    (function brule() {
      var k = Math.min(1, (maintenant() - t0) / D), yl = y0 + r.height * (1 - k);
      for (var i = 0; i < 2; i++) { var xx = x0 + Math.random() * r.width; m.systeme('cendresVol', xx, yl, 0.25, {}); }
      if (Math.random() < 0.5) m.systeme('fumee', x0 + Math.random() * r.width, yl, 0.4, {});
      if (k < 1) setTimeout(brule, 45); else { m.systeme('fumeeNoire', x0 + r.width / 2, y0 + r.height * 0.3, 0.5, {}); if (o.fini) o.fini(); }
    })();
    if (this.opt.sons) { this.audio.souffle(D / 1000, 2500, 600, 0.13); for (var c = 0; c < 9; c++) this.audio.note(hasard(1500, 3200), 0.03, 'square', 0.05, hasard(600, 1200), c * D / 9000); }
    return this;
  };

  /* ======================================================================
   * 7 octies. MÉTÉO PÉI v2.8 : ciel, pluie, orage, vent fort, cyclone
   *  Ciel : nuages en deux couches qui filent avec le vent ; spirale nuageuse du cyclone ; rideaux de pluie
   *  Orage : vrais éclairs ramifiés, la scène et les ombres s'éclairent depuis l'éclair, impact au sol,
   *          tonnerre qui claque (proche) ou qui roule plus tard (loin) ; fx.eclair({ proche: true })
   *  Vent : rafales (le vent monte et retombe), débris, traînées de poussière, éléments qui plient :
   *         fx.meteo('ventFort', { elements: arbres }) ou attribut data-kwfx-vent
   *  Pluie : gouttes qui suivent le vent, brume au sol, gouttes qui coulent sur la vitre (vitre: false pour couper)
   *  Cyclone : fx.meteo('cyclone', { alerte: 'orange' | 'rouge' }) badge d'alerte cyclonique
   * ==================================================================== */
  VENT_METEO.pluie = -35; VENT_METEO.orage = -120; VENT_METEO.cyclone = -380; VENT_METEO.ventFort = -280; VENT_METEO.alize = 80;
  var BRUME_SOL = { debit: 0.9, vie: [5, 8], zone: 'ecran-bas', vitesse: [10, 30], cone: [-90, 30], taille: [60, 110], tailleVie: [0.8, 1.3], alphaVie: [0, 0.14, 0], sprite: 'volute', couleur: '#cfd8e3', vent: 0.6, gravite: -4, rotVitesse: [-6, 6] };
  var POUSSIERE_VENT = { debit: 14, vie: [0.8, 1.3], zone: 'ecran-droite', vitesse: [1000, 1500], cone: [181, 4], taille: [0.8, 1.3], sprite: 'etincelle', etirement: 0.03, etirementMax: 14, couleur: '#efe6d6', alphaVie: [0, 0.22, 0.22, 0] };
  var DEBRIS = { debit: 5, vie: [2.5, 4], zone: 'ecran-droite', vitesse: [500, 900], cone: [188, 30], taille: [4, 9], sprite: 'petale', couleur: ['#52B788', '#2D6A4F', '#8C5E3C', '#B08D57'], gravite: 70, curl: { force: 600, freq: 0.008, vitesse: 0.8 }, rotVitesse: [-720, 720], flipVitesse: 9, vent: 1, ventPrise: 0.8, alphaVie: [1, 1, 1, 0] };
  METEOS.ventFort = { nom: 'Vent fort', calques: [DEBRIS, POUSSIERE_VENT, { debit: 1.5, vie: [2, 3.2], zone: 'ecran-droite', vitesse: [600, 900], cone: [185, 20], taille: [1.6, 2.6], sprite: 'rect', couleur: ['#6b4a2b', '#8C5E3C'], gravite: 120, rotVitesse: [-900, 900], flipVitesse: 12, vent: 1 }],
    voile: 'rgba(60,55,45,.16)', son: { f: 600, q: 0.8, vol: 0.2, hurle: true }, balance: true };
  ['pluie', 'orage', 'cyclone'].forEach(function (k) { METEOS[k].calques.forEach(function (e) { if (e.sprite === 'etincelle') { e.vent = 1; e.ventPrise = 0.7; } }); METEOS[k].calques.push(BRUME_SOL); });
  METEOS.cyclone.calques.push(POUSSIERE_VENT);
  var CIEL = {
    pluie: { nuages: 0.7, teinte: [70, 82, 100], rideaux: 0.6, vitre: 5 },
    orage: { nuages: 0.95, teinte: [38, 42, 66], rideaux: 0.8, vitre: 9 },
    cyclone: { nuages: 1, teinte: [44, 50, 60], rideaux: 1, vitre: 16, spirale: true },
    ventFort: { nuages: 0.4, teinte: [120, 118, 112], rideaux: 0 },
    alize: { nuages: 0.2, teinte: [235, 240, 248], rideaux: 0 }
  };
  function texNuage(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d');
    for (var pass = 0; pass < 2; pass++) for (var i = 0; i < 70; i++) {
      var r = 22 + Math.random() * 44, x = Math.random() * w, y = r * 0.3 + Math.random() * Math.max(1, h * 0.92 - r * 1.3);
      for (var dx = -w; dx <= w; dx += w) {
        var gr = g.createRadialGradient(x + dx, y - (pass ? r * 0.25 : -r * 0.2), 0, x + dx, y, r);
        if (pass) { gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); }
        else { gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(0.6, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
        g.fillStyle = gr; g.beginPath(); g.arc(x + dx, y, r, 0, 6.3); g.fill();
      }
    }
    g.globalCompositeOperation = 'destination-in'; var fm = g.createLinearGradient(0, 0, 0, h); fm.addColorStop(0, '#000'); fm.addColorStop(0.55, '#000'); fm.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fm; g.fillRect(0, 0, w, h);
    return c;
  }
  function spriteGoutte() {
    var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d');
    var gr = g.createRadialGradient(16, 18, 2, 16, 16, 15); gr.addColorStop(0, 'rgba(210,230,255,.18)'); gr.addColorStop(0.75, 'rgba(160,190,220,.28)'); gr.addColorStop(0.92, 'rgba(20,35,60,.55)'); gr.addColorStop(1, 'rgba(20,35,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(16, 16, 15, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(11, 10, 3.2, 2.2, -0.6, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(19, 24, 4, 1.6, 0, 0, 6.3); g.fill();
    return c;
  }
  function segmentsEclair(x0, y0, x1, y1, dep, w, out, prof) {
    if (prof > 7 || Math.hypot(x1 - x0, y1 - y0) < 10) { out.push([x0, y0, x1, y1, w]); return; }
    var mx = (x0 + x1) / 2 + hasard(-dep, dep), my = (y0 + y1) / 2 + hasard(-dep, dep) * 0.35;
    segmentsEclair(x0, y0, mx, my, dep * 0.55, w, out, prof + 1); segmentsEclair(mx, my, x1, y1, dep * 0.55, w, out, prof + 1);
    if (prof < 4 && Math.random() < 0.32) { var a = Math.atan2(y1 - y0, x1 - x0) + hasard(-0.9, 0.9), l = Math.hypot(x1 - x0, y1 - y0) * hasard(0.4, 0.7); segmentsEclair(mx, my, mx + Math.cos(a) * l, my + Math.sin(a) * l, dep * 0.5, w * 0.5, out, prof + 2); }
  }
  Directeur.prototype._cielInit = function () {
    if (this._ciel) return this._ciel; var self = this, m = this.particules;
    var mk = function (z) { var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (self.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + z; self.conteneur.appendChild(c); return c; };
    var C = { c: mk(9996), v: null, cfg: null, nuages: 0, rideaux: 0, flash: 0, fx: 0, eclairs: [], gouttes: [], vitre: 0, rot: 0, t: 0, ox: [0, 0], els: [], raf: 0, der: 0, ventBase: 0, rafale: 0.5, tex: texNuage(640, 220), sg: spriteGoutte(), teinte: [60, 70, 90] };
    C.ctx = C.c.getContext('2d'); C.puff = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })();
    function taille() { var t = self.taille(), d = Math.min(2, global.devicePixelRatio || 1); C.L = t.l; C.H = t.h; C.dpr = d; [C.c, C.v].forEach(function (c) { if (c) { c.width = Math.round(t.l * d); c.height = Math.round(t.h * d); } }); }
    C.taille = taille; taille(); global.addEventListener('resize', taille);
    function boucle(ts) {
      var dt = C.der ? Math.min(0.05, (ts - C.der) / 1000) : 0.016; C.der = ts; if (self.enPause) dt = 0; C.t += dt;
      var cf = C.cfg || {}, L = C.L, H = C.H, ctx = C.ctx;
      C.nuages += ((cf.nuages || 0) - C.nuages) * Math.min(1, dt * 0.8); C.rideaux += ((cf.rideaux || 0) - C.rideaux) * Math.min(1, dt * 0.8);
      for (var q = 0; q < 3; q++) C.teinte[q] += ((cf.teinte || C.teinte)[q] - C.teinte[q]) * Math.min(1, dt);
      // rafales : le vent monte et retombe
      if (C.ventBase) {
        var g = borne(bruit(C.t * 0.35, 7.3) * 1.3 - 0.15 + (Math.random() < 0.004 ? 0.5 : 0), 0, 1); C.rafale += (g - C.rafale) * Math.min(1, dt * 2);
        var cible = C.ventBase * (0.45 + 1.0 * C.rafale); m.vent += (cible - m.vent) * Math.min(1, dt * 1.5);
        if (self._sonMeteo && self._sonMeteo.base && ((C.t * 10) | 0) !== C.sonT) { C.sonT = (C.t * 10) | 0; try { self._sonMeteo.g.gain.setTargetAtTime(self._sonMeteo.base * (0.55 + 0.9 * C.rafale), self.audio.ctx.currentTime, 0.25); } catch (e) {} }
        var amp = Math.min(14, Math.abs(C.ventBase) / 26) * (C.ventBase < 0 ? -1 : 1);
        C.els.forEach(function (el, i) { el.style.transformOrigin = '50% 100%'; el.style.rotate = (amp * (0.35 + 0.65 * C.rafale) + Math.sin(C.t * 6 + i * 1.7) * C.rafale * 1.6 * Math.sign(amp || 1)).toFixed(2) + 'deg'; });
      }
      ctx.setTransform(C.dpr, 0, 0, C.dpr, 0, 0); ctx.clearRect(0, 0, L, H);
      var tc = 'rgb(' + C.teinte.map(Math.round).join(',') + ')', hb = H * (cf.spirale ? 0.45 : 0.32);
      if (C.nuages > 0.01) {
        var gr = ctx.createLinearGradient(0, 0, 0, hb * 1.2); gr.addColorStop(0, 'rgba(' + C.teinte.map(function (v) { return Math.round(v * 0.6); }).join(',') + ',' + (0.75 * C.nuages).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, L, hb * 1.2);
        var tw = Math.max(L, 640) * 1.1;
        for (var k = 0; k < 2; k++) {
          C.ox[k] += (m.vent * (k ? 0.22 : 0.1) + (k ? 9 : 4) * (m.vent < 0 ? -1 : 1)) * dt; var ox = ((C.ox[k] % tw) + tw) % tw;
          ctx.globalAlpha = C.nuages * (k ? 0.95 : 0.6);
          for (var xx = ox - tw; xx < L; xx += tw) ctx.drawImage(C.tex, xx, k ? -hb * 0.18 : -hb * 0.05, tw, hb * (k ? 1.05 : 0.8));
        }
        // teinte des nuages (gris bleuté, violet d'orage…)
        ctx.globalCompositeOperation = 'source-atop'; ctx.globalAlpha = 0.55; ctx.fillStyle = tc; ctx.fillRect(0, 0, L, hb * 1.3); ctx.globalCompositeOperation = 'source-over';
        if (cf.spirale) {
          C.rot += dt * 0.35 * (m.vent < 0 ? 1 : -1); var cx = L * 0.92, cy = -H * 0.12, sc = Math.max(L, H) / 900;
          ctx.globalAlpha = 0.5 * C.nuages;
          for (var a = 0; a < 3; a++) for (var j = 2; j < 20; j++) { var th = j * 0.32 + a * 2.094 + C.rot, r = (24 + j * j * 2.4) * sc, s2 = (40 + j * 7) * sc; ctx.drawImage(C.puff, cx + Math.cos(th) * r - s2, cy + Math.sin(th) * r * 0.7 - s2, s2 * 2, s2 * 2); }
        }
        ctx.globalAlpha = 1;
      }
      // rideaux de pluie poussés par les rafales
      if (C.rideaux > 0.01) {
        var pente = (m.vent / 900) * H;
        for (var b = 0; b < 3; b++) {
          var bw = L * (0.35 + b * 0.12), vx = ((C.t * (m.vent * 0.9 - 40) + b * L * 0.55) % (L + bw * 2) + (L + bw * 2)) % (L + bw * 2) - bw;
          var al = C.rideaux * (0.05 + 0.1 * C.rafale) * (b === 1 ? 1.3 : 1), lg = ctx.createLinearGradient(vx, 0, vx + bw, 0);
          lg.addColorStop(0, 'rgba(200,215,235,0)'); lg.addColorStop(0.5, 'rgba(200,215,235,' + al.toFixed(3) + ')'); lg.addColorStop(1, 'rgba(200,215,235,0)');
          ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(vx - pente, 0); ctx.lineTo(vx + bw - pente, 0); ctx.lineTo(vx + bw, H); ctx.lineTo(vx, H); ctx.fill();
        }
      }
      // éclairs
      C.flash = Math.max(0, C.flash - dt * 4);
      if (C.flash > 0.01 && C.nuages > 0.05) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = C.flash * 0.6; var tw2 = Math.max(L, 640) * 1.1, o2 = ((C.ox[1] % tw2) + tw2) % tw2; for (var x3 = o2 - tw2; x3 < L; x3 += tw2) ctx.drawImage(C.tex, x3, -hb * 0.18, tw2, hb * 1.05);
        var rg = ctx.createRadialGradient(C.fx, hb * 0.4, 0, C.fx, hb * 0.4, L * 0.5); rg.addColorStop(0, 'rgba(190,205,255,' + (C.flash * 0.5).toFixed(2) + ')'); rg.addColorStop(1, 'rgba(190,205,255,0)'); ctx.fillStyle = rg; ctx.fillRect(0, 0, L, H);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
      var now = maintenant();
      C.eclairs = C.eclairs.filter(function (e) {
        var age = now - e.t0; if (age > 420) return false;
        var vis = age < 70 || (age > 110 && age < 170) || (e.triple && age > 230 && age < 280) || age > 280; var fade = age > 280 ? 1 - (age - 280) / 140 : 1;
        if (!vis) return true;
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        [[7, 0.12, '#9fb8ff'], [3, 0.45, '#d8e4ff'], [1.2, 1, '#ffffff']].forEach(function (p) {
          ctx.strokeStyle = p[2]; ctx.globalAlpha = p[1] * fade * (age > 280 ? 0.5 : 1);
          e.segs.forEach(function (sg) { ctx.lineWidth = p[0] * sg[4]; ctx.beginPath(); ctx.moveTo(sg[0], sg[1]); ctx.lineTo(sg[2], sg[3]); ctx.stroke(); });
        });
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return true;
      });
      if (C.impacts) dessineImpacts(C, ctx, now);
      // gouttes qui coulent sur la vitre
      var nv = (cf.vitre || 0) * (C.vitreOn ? 1 : 0);
      if (nv || C.gouttes.length) {
        if (!C.v) { C.v = mk(10000); C.vctx = C.v.getContext('2d'); taille(); }
        var vc = C.vctx; vc.setTransform(C.dpr, 0, 0, C.dpr, 0, 0); vc.clearRect(0, 0, L, H);
        if (nv && C.gouttes.length < 130 && Math.random() < nv * dt) C.gouttes.push({ x: Math.random() * L, y: Math.random() * H * 0.9, r: hasard(1.6, 5.5), vy: 0, vie: hasard(6, 11), age: 0, tr: 0 });
        var nouv = [];
        C.gouttes = C.gouttes.filter(function (g) {
          g.age += dt; if (g.age > g.vie || g.y > H + 10) return false;
          if (g.r > 4) { g.vy += (hasard(60, 170) - g.vy) * dt * 2; if (Math.random() < 0.02) g.vy *= 0.2; g.y += g.vy * dt; g.x += (Math.sin(g.y * 0.05 + g.r) * 6 + m.vent * 0.08) * dt; g.tr += g.vy * dt; g.r -= dt * 0.12;
            if (g.tr > 16) { g.tr = 0; nouv.push({ x: g.x + hasard(-1, 1), y: g.y - g.r, r: hasard(0.8, 1.6), vy: 0, vie: hasard(1.5, 3.5), age: 0, tr: 0 }); } }
          else if (Math.random() < 0.002 * g.r) g.r += 1.2;
          var al = Math.min(1, g.age * 3, (g.vie - g.age) * 1.5), st = 1 + Math.min(0.6, g.vy / 300);
          vc.globalAlpha = al; vc.drawImage(C.sg, g.x - g.r, g.y - g.r * st, g.r * 2, g.r * 2 * st); return true;
        });
        if (C.gouttes.length < 160) C.gouttes = C.gouttes.concat(nouv); vc.globalAlpha = 1;
      }
      var vivant = C.cfg || C.nuages > 0.01 || C.rideaux > 0.01 || C.eclairs.length || C.gouttes.length || C.flash > 0.01 || (C.impacts && C.impacts.length);
      if (vivant) C.raf = requestAnimationFrame(boucle); else { C.raf = 0; C.der = 0; ctx.clearRect(0, 0, L, H); if (C.vctx) C.vctx.clearRect(0, 0, L, H); }
    }
    C.reveille = function () { if (!C.raf) C.raf = requestAnimationFrame(boucle); };
    this._ciel = C; return C;
  };

  /* éclair ramifié : la scène s'éclaire depuis l'éclair, impact au sol s'il est proche, tonnerre retardé selon la distance */
  Directeur.prototype.eclair = function (o) {
    o = o || {}; var self = this, C = this._cielInit(), L = C.L, H = C.H, proche = o.proche != null ? o.proche : Math.random() < 0.4;
    var x = o.x != null ? o.x : L * hasard(0.15, 0.85), y0 = H * hasard(0.05, 0.15), y1 = proche ? this.zoneSure().y2 : H * hasard(0.22, 0.38), segs = [];
    segmentsEclair(x + hasard(-60, 60), y0, x, y1, (y1 - y0) * 0.22, proche ? 1.3 : 0.8, segs, 0);
    C.eclairs.push({ segs: segs, t0: maintenant(), triple: Math.random() < 0.5 }); C.flash = proche ? 1 : 0.6; C.fx = x; C.reveille();
    this.flash('#E8F0FF', proche ? 0.5 : 0.22); setTimeout(function () { self.flash('#FFFFFF', proche ? 0.3 : 0.12); C.flash = Math.max(C.flash, 0.7); }, 120);
    if (proche) {
      var lu = this.lum, av = { angle: lu.angle, hauteur: lu.hauteur, force: lu.force, teinte: lu.teinte }, ang = Math.atan2(H / 2 - y0, x - L / 2) * 180 / Math.PI;
      this.lumiere({ angle: ang, hauteur: 0.55, force: 0.6, teinte: '#0a1230' }); setTimeout(function () { self.lumiere(av); }, 300);
      this.particules.systeme('etincelles', x, y1, 1, { couleurs: ['#FFFFFF', '#CFE0FF', '#9fb8ff'] }); this.particules.systeme('fumee', x, y1 - 6, 0.6, {});
      if (this.opt.secousses) this.secousse(0.35); this.vibre('erreur');
    }
    this.tonnerre(proche);
    return this;
  };
  Directeur.prototype.tonnerre = function (proche) {
    var c = this.opt.sons && this.audio.pret(); if (!c) return; var vol = this.opt.volume * this.pub.son;
    function bruitBrun(dur) { var b = c.createBuffer(1, Math.round(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0), l = 0; for (var i = 0; i < d.length; i++) { l = (l + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = l * 3.2 * (1 + 0.6 * Math.sin(i / c.sampleRate * hasard(3, 7))); } return b; }
    var t = c.currentTime + (proche ? 0.03 : hasard(1, 2.6)), dur = proche ? hasard(2.4, 3.4) : hasard(2.6, 4);
    if (proche) { // claquement sec
      var b2 = c.createBuffer(1, Math.round(c.sampleRate * 0.3), c.sampleRate), d2 = b2.getChannelData(0); for (var i = 0; i < d2.length; i++) d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d2.length, 3);
      var s2 = c.createBufferSource(), f2 = c.createBiquadFilter(), g2 = c.createGain(); s2.buffer = b2; f2.type = 'highpass'; f2.frequency.value = 900; g2.gain.value = 0.55 * vol; s2.connect(f2); f2.connect(g2); g2.connect(c.destination); s2.start(t);
    }
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = bruitBrun(dur); f.type = 'lowpass'; f.frequency.value = proche ? 380 : 190;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((proche ? 1 : 0.6) * vol, t + (proche ? 0.06 : 0.4)); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  };
  Directeur.prototype.alerteCyclone = function (niveau) {
    if (this._alerte) { this._alerte.remove(); this._alerte = null; } if (!niveau) return this;
    var coul = { jaune: '#E9B500', orange: '#F07C00', rouge: '#D62828', violette: '#6A2C91' }[niveau] || '#F07C00';
    var el = this.calqueDiv('right:16px;top:16px;padding:6px 12px;border-radius:999px;background:' + coul + ';color:#fff;font:700 13px/1.2 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:3');
    el.textContent = 'Alerte ' + niveau + ' cyclonique'; el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1600, iterations: Infinity });
    this._alerte = el; return this;
  };
  var meteoV27 = Directeur.prototype.meteo;
  Directeur.prototype.meteo = function (nom, o) {
    o = o || {}; var C = this._cielInit(), cf = CIEL[nom] || null;
    C.els.forEach(function (el) { el.style.rotate = ''; }); C.els = [];
    meteoV27.call(this, nom, o);
    C.cfg = cf; C.ventBase = cf ? (VENT_METEO[nom] || 0) * (o.force == null ? 1 : o.force) : 0; C.vitreOn = o.vitre != null ? o.vitre : this.opt.support !== 'epub';
    if (cf && Math.abs(C.ventBase) > 60) C.els = Array.prototype.slice.call(o.elements || this.conteneur.querySelectorAll('[data-kwfx-vent]'));
    if (this._sonMeteo && METEOS[nom] && METEOS[nom].son) this._sonMeteo.base = METEOS[nom].son.vol * (o.force || 1) * this.opt.volume * this.pub.son;
    this.alerteCyclone(nom === 'cyclone' ? o.alerte : null);
    C.reveille(); return this;
  };

  /* ======================================================================
   * 7 nonies. TRANSPARENCE ET REFLETS v2.9
   *  Verre : fx.verre(el, { type: 'clair'|'givre'|'teinte', couleur }) panneau de verre (flou d'arrière-plan,
   *          reflet et arête lumineuse du côté du soleil, lumière colorée qui traverse) ; fx.verre(el, false)
   *          fx.briser(el) l'objet éclate en morceaux de verre qui tournent, scintillent et tintent
   *  Bulles : bulles irisées (film de savon) avec reflet du soleil ; fx.joue('savon') ; fx.joue('eclatsVerre')
   *  Liquides : plus translucides au centre, bord plus clair (effet de Fresnel)
   *  Reflets : fx.refletVivant(el, { ligne, flou, ondule, opacite }) reflet qui suit l'objet (dans l'eau : ondulé)
   *            chemin de soleil en paillettes sur fx.eau quand le soleil est bas
   * ==================================================================== */
  var VERRE = ['#E6F4FF', '#CFE8FF', '#FFFFFF', '#BFE3F5'];
  SYSTEMES.eclatsVerre = [
    { nb: 16, vie: [1.2, 2], vitesse: [140, 460], taille: [6, 14], sprite: 'verre', couleur: VERRE, gravite: 950, frein: 0.6, rotVitesse: [-720, 720], sol: { rebond: 0.25, friction: 0.5 }, alphaVie: [1, 1, 1, 0] },
    { nb: 6, vie: [0.3, 0.6], vitesse: [60, 220], taille: [3, 6], tailleVie: [0.3, 1, 0], sprite: 'etoile', melange: 'add', couleur: '#FFFFFF', rotVitesse: [-90, 90] },
    { nb: 6, vie: [0.4, 0.8], vitesse: [80, 300], taille: [0.7, 1.2], sprite: 'doux', melange: 'add', couleur: '#E6F4FF', gravite: 600, scintille: true }
  ];
  SYSTEMES.savon = [
    { nb: 9, vie: [4, 7], vitesse: [30, 110], cone: [-90, 140], taille: [7, 18], sprite: 'bulle', couleur: '#FFFFFF', gravite: -12, frein: 0.5, curl: { force: 70, freq: 0.008, vitesse: 0.3 }, vent: 1, ventPrise: 0.6, alphaVie: [0, 1, 1, 1], aLaMort: 'pop', proba: 1 }
  ];
  [['eclatsVerre', 'Éclats de verre'], ['savon', 'Bulles de savon irisées']].forEach(function (p) {
    NOMS_EFFETS[p[0]] = p[1]; EFFETS[p[0]] = { nom: p[1], f: function (m, x, y, k, o) { m.systeme(p[0], x, y, k, o); if (p[0] === 'eclatsVerre') m.fx.sonVerre(k); } };
  });
  Directeur.prototype.sonVerre = function (k) {
    if (!this.opt.sons) return; var c = this.audio.pret(); if (!c) return; k = k == null ? 0.7 : k;
    this.audio.souffle(0.18, 6000, 2500, 0.2 * k);
    for (var i = 0; i < 9; i++) this.audio.note(hasard(2200, 5200), hasard(0.15, 0.4), 'sine', 0.06 * k, null, 0.02 + i * hasard(0.03, 0.09));
  };
  function grainGivre() { return "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>\")"; }
  Directeur.prototype.verre = function (el, o) {
    if (!el) return this; var self = this; this._verres = this._verres || [];
    if (o === false) { if (el._kwfxVerreAvant != null) el.style.cssText = el._kwfxVerreAvant; el._kwfxVerreAvant = null; this._verres = this._verres.filter(function (x) { return x !== el; }); return this; }
    o = o || el._kwfxVerreO || {}; if (el._kwfxVerreAvant == null) { el._kwfxVerreAvant = el.style.cssText; this._verres.push(el); } el._kwfxVerreO = o;
    var lu = this.lum, a = lu.angle * Math.PI / 180, deg = Math.atan2(-Math.cos(a), -Math.sin(a)) * 180 / Math.PI, v = this.vecteurOmbre(), type = o.type || 'givre', tc = versRgb(o.couleur || '#BFE3F5').join(',');
    var fond = { clair: 'rgba(255,255,255,.07)', givre: 'rgba(255,255,255,.16)', teinte: 'rgba(' + tc + ',.26)' }[type] || 'rgba(255,255,255,.12)';
    var flou = { clair: 'blur(2px) saturate(140%) brightness(1.06)', givre: 'blur(14px) saturate(160%)', teinte: 'blur(6px) saturate(150%)' }[type];
    var ix = (-v[0] * 0.08).toFixed(1), iy = (-v[1] * 0.08).toFixed(1), f = lu.force / 0.3;
    el.style.cssText = (el._kwfxVerreAvant || '') + ';background:linear-gradient(' + deg.toFixed(0) + 'deg,rgba(255,255,255,' + (0.42 * Math.min(1.3, f)).toFixed(2) + '),rgba(255,255,255,0) 38%,rgba(255,255,255,0) 70%,rgba(255,255,255,.12))' + (type === 'givre' ? ',' + grainGivre() : '') + ',' + fond + ';' +
      'backdrop-filter:' + flou + ';-webkit-backdrop-filter:' + flou + ';border:1px solid rgba(255,255,255,.38);' +
      'box-shadow:inset ' + ix + 'px ' + iy + 'px 0 rgba(255,255,255,.65),inset ' + (-ix) + 'px ' + (-iy) + 'px 0 rgba(0,0,0,.08),' + (v[0] * 0.5).toFixed(1) + 'px ' + (v[1] * 0.5).toFixed(1) + 'px 22px rgba(' + (type === 'teinte' ? tc : '170,215,240') + ',' + (0.35 * Math.min(1.2, f)).toFixed(2) + '),0 2px 10px rgba(0,0,0,.12)';
    return this;
  };
  var lumiereV28 = Directeur.prototype.lumiere;
  Directeur.prototype.lumiere = function (o) { lumiereV28.call(this, o); var self = this; (this._verres || []).forEach(function (el) { if (el.isConnected) self.verre(el); }); return this; };
  Directeur.prototype.briser = function (el, o) {
    if (!el) return this; o = o || {}; var m = this.particules, b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect();
    var x0 = r.left - b.left, y0 = r.top - b.top, cx = x0 + r.width / 2, cy = y0 + r.height / 2, cols = o.couleur ? [o.couleur, '#FFFFFF', o.couleur] : VERRE;
    var di = m.def('bris', SYSTEMES.eclatsVerre[0]), n = Math.round(Math.min(40, 10 + r.width * r.height / 500) * m.qualite);
    for (var i = 0; i < n; i++) { var px = x0 + Math.random() * r.width, py = y0 + Math.random() * r.height; m.emettre(di, px, py, 0.6 + Math.random() * 0.6, { couleurs: cols }, 1); var j = m.n - 1; if (j >= 0) { var dx = px - cx, dy = py - cy, dd = Math.hypot(dx, dy) + 1; m.VX[j] = dx / dd * hasard(120, 420); m.VY[j] = dy / dd * hasard(120, 420) - 180; } }
    m.systeme('eclatsVerre', cx, cy, 0.5, { couleurs: cols }); m.demarre();
    el.animate([{ opacity: 1, transform: getComputedStyle(el).transform === 'none' ? 'scale(1)' : getComputedStyle(el).transform }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 140, fill: 'forwards' });
    if (this.opt.secousses) this.secousse(0.25); this.sonVerre(0.9); this.vibre('erreur');
    return this;
  };
  /* reflet vivant : un double de l'élément, retourné sous la ligne d'eau ou de sol, qui suit ses mouvements */
  Directeur.prototype.refletVivant = function (el, o) {
    if (!el) return { arreter: function () {} }; o = o || {}; var self = this;
    if (!this._ondeSvg) { var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('width', '0'); sv.setAttribute('height', '0'); sv.style.position = 'absolute';
      sv.innerHTML = '<filter id="kwfx-onde" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="1" seed="3"><animate attributeName="baseFrequency" dur="5s" values="0.012 0.09;0.016 0.12;0.012 0.09" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>';
      document.body.appendChild(sv); this._ondeSvg = sv; }
    var cl = el.cloneNode(true); cl.removeAttribute('id'); cl.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); }); cl.setAttribute('aria-hidden', 'true'); cl.tabIndex = -1;
    var hote = this.calqueDiv('inset:0'); hote.appendChild(cl);
    var ondule = o.ondule != null ? o.ondule : !!(this._eau || (this.refl && this.refl.type === 'eau')), flou = o.flou == null ? (ondule ? 1 : 2.5) : o.flou, op = o.opacite == null ? 0.42 : o.opacite;
    cl.style.position = 'absolute'; cl.style.margin = '0'; cl.style.pointerEvents = 'none'; cl.style.transformOrigin = '50% 50%'; cl.style.animation = 'none';
    cl.style.webkitMaskImage = cl.style.maskImage = 'linear-gradient(to top,rgba(0,0,0,.95),rgba(0,0,0,0) 85%)';
    cl.style.filter = 'blur(' + flou + 'px)' + (ondule ? ' url(#kwfx-onde)' : ''); var actif = true, raf = 0;
    (function suit() {
      if (!actif) return; if (!el.isConnected) { arreter(); return; }
      var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), cs = getComputedStyle(el), bas = r.bottom - b.top, cx = r.left - b.left + r.width / 2;
      var ligne = typeof o.ligne === 'function' ? o.ligne() : o.ligne != null ? o.ligne : self._eau ? self._eau.hauteur(cx) : self.refl ? self.refl.y : bas;
      var w = el.offsetWidth, h = el.offsetHeight, ecart = Math.max(0, ligne - bas);
      cl.style.width = w + 'px'; cl.style.height = h + 'px'; cl.style.left = (cx - w / 2) + 'px'; cl.style.top = (2 * ligne - (r.top - b.top + r.height / 2) - h / 2) + 'px';
      cl.style.transform = 'scaleY(-1) ' + (el.style.transform || '') + (el.style.rotate ? ' rotate(' + el.style.rotate + ')' : '');
      cl.style.opacity = (op * Math.max(0, 1 - ecart / 260) * (parseFloat(cs.opacity) || 0)).toFixed(3); cl.style.visibility = cs.visibility;
      raf = requestAnimationFrame(suit);
    })();
    function arreter() { actif = false; cancelAnimationFrame(raf); hote.remove(); }
    return { arreter: arreter };
  };

  /* ======================================================================
   * 7 decies. PERSONNAGES ARTICULÉS v3.0
   *  const ti = fx.personnage({ x, y (sol), taille: 120, peau, haut, bas, cheveux: 'frise'|'tresses'|'court'|'casquette', couleurCheveux, dir: 1 })
   *  Squelette : bassin, buste, cou, tête, épaules-coudes-mains, hanches-genoux-chevilles-pieds (savates)
   *  Mouvements : ti.marcher(x), ti.courir(x), ti.sauter(), ti.chuter(), ti.relever()  (renvoient une promesse)
   *  Poses : ti.pose('debout'|'accroupi'|'mainsTete'|'joie'|'salut'|'reflechit') ; ti.tourner(-1) ; ti.supprimer()
   *  Transitions douces entre tous les états ; ombre portée et lumière du soleil de KwFX ; poussière, étoiles et
   *  petits bruits de pas ; la gravité suit fx.apesanteur
   * ==================================================================== */
  var PI = Math.PI;
  function D(t) { return [Math.sin(t), Math.cos(t)]; }
  function ik(sx, sy, tx, ty, l1, l2, sgn) {
    var dx = tx - sx, dy = ty - sy, d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.001), phi = Math.atan2(dx, dy);
    var ca = borne((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), cb = borne((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1);
    var t1 = phi - sgn * Math.acos(ca); return [t1, sgn * (PI - Math.acos(cb))];
  }
  var CLES_POSE = ['lean', 'head', 'sL', 'eL', 'sR', 'eR', 'hL', 'kL', 'hR', 'kR', 'fL', 'fR', 'rot', 'dy'];
  function pose(o) { var p = {}; CLES_POSE.forEach(function (k) { p[k] = o[k] || 0; }); p.expr = o.expr || 'sourire'; p.snap = o.snap == null ? 1 : o.snap; return p; }
  function melangePose(a, b, k) { var p = {}; CLES_POSE.forEach(function (c) { p[c] = a[c] + (b[c] - a[c]) * k; }); p.expr = k < 0.5 ? a.expr : b.expr; p.snap = a.snap + (b.snap - a.snap) * k; return p; }
  function piedsPlats(p) { p.fL = -(p.hL + p.kL); p.fR = -(p.hR + p.kR); return p; }
  /* proportions d'un enfant (grosse tête), en fractions de la taille */
  var OS = { R: 0.13, cou: 0.035, buste: 0.27, bras: 0.165, avant: 0.155, cuisse: 0.18, tibia: 0.18, pied: 0.075, cheville: 0.025 };
  function bras(P, lean, cote, H) { // cible des mains pour « mains sur la tête », calculée par cinématique inverse
    var ep = [Math.sin(lean) * OS.buste * 0.9 * H, -Math.cos(lean) * OS.buste * 0.9 * H], tc = [Math.sin(lean) * (OS.buste + OS.cou + OS.R) * H, -Math.cos(lean) * (OS.buste + OS.cou + OS.R) * H];
    var t = [tc[0] - OS.R * (cote ? 0.35 : 0.6) * H, tc[1] - OS.R * (cote ? 0.75 : 0.6) * H], s1 = ik(ep[0], ep[1], t[0], t[1], OS.bras * H, OS.avant * H, 1), s2 = ik(ep[0], ep[1], t[0], t[1], OS.bras * H, OS.avant * H, -1), s = Math.sin(s1[0]) > Math.sin(s2[0]) ? s1 : s2;
    return [s[0] - lean, s[1]];
  }
  var POSES = {
    debout: function (t) { var b = Math.sin(t * 2.2); return piedsPlats(pose({ lean: 0.03 + 0.012 * b, head: -0.02 + 0.03 * Math.sin(t * 0.7), sL: 0.1 + 0.03 * b, eL: 0.18, sR: -0.06, eR: 0.22, hL: 0.05, kL: -0.05, hR: -0.04, kR: -0.03 })); },
    accroupi: function (t) { var b = Math.sin(t * 2.2) * 0.02; return piedsPlats(pose({ lean: 0.62 + b, head: -0.5, sL: 0.75, eL: 0.55, sR: 0.55, eR: 0.7, hL: 1.85, kL: -2.75, hR: 1.65, kR: -2.6 })); },
    mainsTete: function (t, H) { var lean = -0.03 + 0.02 * Math.sin(t * 1.5), a = [PI - 0.3 - lean, 1.4], b = [PI - 0.5 - lean, 1.3]; return piedsPlats(pose({ lean: lean, head: 0.06 + 0.04 * Math.sin(t * 1.1), sL: a[0], eL: a[1], sR: b[0], eR: b[1], hL: 0.06, kL: -0.06, hR: -0.06, kR: -0.04, expr: 'oh' })); },
    joie: function (t) { var h = Math.abs(Math.sin(t * 5)); return piedsPlats(pose({ lean: -0.05, head: -0.15, sL: 2.4 + 0.15 * Math.sin(t * 10), eL: 0.3, sR: 2.7 - 0.15 * Math.sin(t * 10), eR: 0.25, hL: 0.25 * (1 - h), kL: -0.5 * (1 - h), hR: 0.2 * (1 - h), kR: -0.45 * (1 - h), expr: 'joie' })); },
    salut: function (t) { var p = POSES.debout(t); p.sL = 2.55; p.eL = 0.7 + 0.45 * Math.sin(t * 9); p.head = -0.08; p.expr = 'joie'; return p; },
    reflechit: function (t, H) { var p = POSES.debout(t); p.sL = 0.55; p.eL = 2.35; p.sR = 0.35; p.eR = 1.5; p.head = 0.12 + 0.05 * Math.sin(t * 0.8); p.expr = 'hmm'; return p; },
    elan: function () { return piedsPlats(pose({ lean: 0.42, head: -0.25, sL: -0.9, eL: 0.3, sR: -1.05, eR: 0.35, hL: 1.15, kL: -1.85, hR: 1.0, kR: -1.7 })); },
    air: function (t) { return pose({ lean: 0.08, head: -0.12, sL: 2.6, eL: 0.35, sR: 2.2, eR: 0.5, hL: 1.0, kL: -1.6, hR: 0.35, kR: -0.9, fL: 0.5, fR: 0.3, snap: 0, expr: 'joie' }); },
    reception: function () { return piedsPlats(pose({ lean: 0.45, head: -0.3, sL: 0.9, eL: 0.4, sR: 0.6, eR: 0.5, hL: 1.3, kL: -2.1, hR: 1.15, kR: -1.95 })); },
    trebuche: function () { return pose({ lean: 0.3, head: -0.3, sL: 2.2, eL: 0.5, sR: 1.5, eR: 0.3, hL: -0.45, kL: -0.7, hR: 0.2, kR: -0.1, fL: 0.6, rot: 0.3, expr: 'oh' }); },
    allonge: function () { return pose({ lean: 0.05, head: 0.25, sL: 2.95, eL: 0.15, sR: 2.75, eR: 0.25, hL: -0.05, kL: -0.25, hR: 0.05, kR: -0.1, fL: 1.3, fR: 1.2, rot: PI / 2, snap: 0, expr: 'aie' }); },
    appui: function () { return pose({ lean: 0.1, head: -0.35, sL: 0.05, eL: -0.05, sR: 0.15, eR: -0.1, hL: 0.4, kL: -1.9, hR: 0.6, kR: -2.0, fL: 0.6, fR: 0.6, rot: 1.05, snap: 0, expr: 'aie' }); },
    genou: function () { return piedsPlats(pose({ lean: 0.7, head: -0.5, sL: 0.6, eL: 0.4, sR: 0.4, eR: 0.5, hL: 1.7, kL: -2.7, hR: 1.2, kR: -2.2, rot: 0.08 })); }
  };
  function cycleMarche(ph, course) {
    var A = course ? 0.75 : 0.42, Bk = course ? 1.55 : 0.75, p = {};
    [['L', 0], ['R', PI]].forEach(function (c) {
      var f = ph + c[1], h = A * Math.sin(f) + (course ? 0.12 : 0), k = -((course ? 0.25 : 0.06) + Bk * Math.max(0, Math.cos(f)));
      p['h' + c[0]] = h; p['k' + c[0]] = k; p['f' + c[0]] = -(h + k) - 0.35 * Math.max(0, Math.cos(f));
      p['s' + c[0]] = -(course ? 0.85 : 0.5) * A * Math.sin(f) * (course ? 1.3 : 1) + (course ? 0.25 : 0.05);
      p['e' + c[0]] = (course ? 1.35 : 0.25) + (course ? 0.25 : 0.25) * Math.max(0, -Math.sin(f));
    });
    p.lean = course ? 0.28 : 0.07; p.head = (course ? -0.18 : -0.05) + 0.02 * Math.sin(2 * ph);
    p.dy = course ? -0.045 * Math.max(0, Math.sin(2 * ph)) : 0;
    return pose(p);
  }

  function Perso(fx, o) {
    this.fx = fx; this.x = o.x == null ? 100 : o.x; this.sol = o.y == null ? 300 : o.y; this.H = o.taille || 120; this.dir = o.dir || 1;
    this.peau = o.peau || '#8D5A3B'; this.haut = o.haut || '#E63946'; this.bas = o.bas || '#1D3557'; this.cheveux = o.cheveux || 'frise'; this.cCheveux = o.couleurCheveux || '#1b1311'; this.savate = o.savate || '#2A9D8F';
    this.etat = 'debout'; this.t = Math.random() * 10; this.ph = 0; this.z = 0; this.vz = 0; this.prec = null; this.mel = 1; this.dernier = POSES.debout(0);
    this.cible = null; this.une = null; this.cligne = 2 + Math.random() * 3; this.idle = o.pose || 'debout'; this.pasPrec = 0;
  }
  Perso.prototype.changer = function (etat) { if (etat === this.etat) return; this.prec = this.dernier; this.mel = 0; this.etat = etat; };
  Perso.prototype.pose = function (nom) { if (this.une && this.une.saut) { this.une.garde = null; this.idle = POSES[nom] ? nom : 'debout'; return this; } this.une = null; this.cible = null; this.idle = POSES[nom] ? nom : 'debout'; this.changer(this.idle); return this; };
  Perso.prototype.tourner = function (d) { this.dir = d < 0 ? -1 : 1; return this; };
  Perso.prototype.aller = function (x, course) {
    var self = this; this.une = null; this.cible = { x: x, course: course }; this.changer(course ? 'course' : 'marche');
    return new Promise(function (r) { self.cible.fin = r; });
  };
  Perso.prototype.marcher = function (x) { return this.aller(x, false); };
  Perso.prototype.courir = function (x) { return this.aller(x, true); };
  Perso.prototype.sequence = function (kfs, fin) {
    var self = this; this.cible = null; this.une = { kfs: kfs, t: 0, fin: fin }; this.prec = this.dernier; this.mel = 1;
    return new Promise(function (r) { self.une.resoudre = r; });
  };
  Perso.prototype.sauter = function (o) {
    o = o || {}; var self = this, H = this.H, garde = this.cible; this.cible = null;
    if (this.une && this.une.saut) return Promise.resolve(); this.une = { saut: true, t: 0, phase: 0, h: o.hauteur || 0.6, garde: garde }; this.prec = this.dernier; this.mel = 0;
    return new Promise(function (r) { self.une.resoudre = r; });
  };
  Perso.prototype.chuter = function (o) {
    o = o || {}; var self = this, fx = this.fx;
    return this.sequence([[0, null], [0.12, POSES.trebuche()], [0.55, POSES.allonge(), 'in']], function () {
      fx.particules.systeme('poussiere', self.x + self.dir * self.H * 0.5, self.sol, 0.8, {}); fx.particules.systeme('etoiles', self.x + self.dir * self.H * 0.85, self.sol - self.H * 0.2, 0.25, { couleurs: ['#FFD23F', '#FFFFFF'] });
      if (fx.opt.secousses) fx.secousse(0.18); self.son('chute'); self.etat = 'allonge'; self.idle = 'debout';
      self.dernier = POSES.allonge(); self.prec = null;
      if (o.releve !== false) return new Promise(function (r) { setTimeout(function () { self.relever().then(r); }, o.attente || 900); });
    });
  };
  Perso.prototype.relever = function () {
    var self = this;
    return this.sequence([[0, null], [0.4, POSES.appui()], [0.8, POSES.genou()], [1.15, POSES.debout(0)]], function () { self.idle = 'debout'; self.etat = 'debout'; });
  };
  Perso.prototype.son = function (type) {
    var fx = this.fx; if (!fx.opt.sons || this.muet) return; var a = fx.audio;
    if (type === 'pas') a.souffle(0.05, 700, 250, 0.035);
    else if (type === 'saut') a.note(320, 0.16, 'sine', 0.05, 640);
    else if (type === 'reception') { a.note(130, 0.1, 'sine', 0.12, 70); a.souffle(0.12, 600, 200, 0.06); }
    else if (type === 'chute') { a.note(95, 0.22, 'sine', 0.2, 45); a.souffle(0.25, 900, 200, 0.12); }
  };
  Perso.prototype.supprimer = function () { this.mort = true; };
  Perso.prototype.position = function () { return { x: this.x, y: this.sol - this.z }; };

  Perso.prototype.maj = function (dt) {
    var H = this.H, cible = POSES[this.idle] ? POSES[this.idle](this.t, H) : POSES.debout(this.t), fx = this.fx;
    this.t += dt; this.cligne -= dt; if (this.cligne < -0.12) this.cligne = 2 + Math.random() * 3.5;
    if (this.cible) {
      var c = this.cible, d = c.x - this.x, v = (c.course ? 2.7 : 0.95) * H; this.dir = d < 0 ? -1 : 1;
      var pas = Math.min(Math.abs(d), v * dt); this.x += pas * this.dir; this.ph += pas / ((c.course ? 1.25 : 0.62) * H) * PI;
      cible = cycleMarche(this.ph, c.course);
      var ct = Math.floor(this.ph / PI); if (ct !== this.pasPrec) { this.pasPrec = ct; this.son('pas'); if (c.course && Math.random() < 0.5) fx.particules.systeme('poussiere', this.x - this.dir * H * 0.1, this.sol, 0.15, {}); }
      if (Math.abs(d) < 1) { var fin = c.fin; this.cible = null; this.changer(this.idle); if (fin) fin(); }
    }
    if (this.une && this.une.saut) {
      var u = this.une, g = 3.6 * H * Math.max(0.05, fx.particules.gravite); u.t += dt;
      if (u.phase === 0) { cible = POSES.elan(); if (u.t > 0.14) { u.phase = 1; this.vz = Math.sqrt(2 * g * u.h * H); this.prec = this.dernier; this.mel = 0; this.son('saut'); fx.particules.systeme('poussiere', this.x, this.sol, 0.3, {}); } }
      else if (u.phase === 1) { this.vz -= g * dt; this.z += this.vz * dt; cible = POSES.air(this.t); if (u.garde) this.x += (u.garde.course ? 2.7 : 0.95) * H * this.dir * dt;
        if (this.z <= 0 && this.vz < 0) { this.z = 0; u.phase = 2; u.t = 0; this.prec = this.dernier; this.mel = 0; this.son('reception'); fx.particules.systeme('poussiere', this.x, this.sol, 0.5, {}); } }
      else { cible = POSES.reception(); if (u.t > 0.16) { var r = u.resoudre, gd = u.garde; this.une = null; this.prec = this.dernier; this.mel = 0; if (gd) { this.cible = gd; } this.etat = gd ? (gd.course ? 'course' : 'marche') : this.idle; if (r) r(); } }
    } else if (this.une) {
      var s = this.une, k = s.kfs; s.t += dt; if (!k[0][1]) k[0][1] = this.dernier;
      var i = 1; while (i < k.length - 1 && s.t > k[i][0]) i++;
      var a = k[i - 1], b = k[i], kk = borne((s.t - a[0]) / (b[0] - a[0]), 0, 1); kk = b[2] === 'in' ? kk * kk : kk * kk * (3 - 2 * kk);
      cible = melangePose(a[1], b[1], kk);
      if (s.t >= k[k.length - 1][0]) { var res = s.resoudre, fn = s.fin; this.une = null; this.prec = null; this.mel = 1; this.dernier = cible; var suite = fn && fn(); if (suite && suite.then) suite.then(res); else if (res) res(); return; }
      this.dernier = cible; this.mel = 1; return;
    } else if (this.etat === 'allonge') cible = POSES.allonge();
    if (!(this.une && this.une.saut) && this.z > 0) { this.vz -= 3.6 * H * dt; this.z = Math.max(0, this.z + this.vz * dt); if (!this.z) this.vz = 0; }
    if (this.prec && this.mel < 1) { this.mel = Math.min(1, this.mel + dt / 0.22); var m = this.mel * this.mel * (3 - 2 * this.mel); cible = melangePose(this.prec, cible, m); }
    this.dernier = cible;
  };

  /* cinématique directe : renvoie les points du squelette (repère local, pieds au sol en 0,0, x vers l'avant) */
  Perso.prototype.squelette = function (p) {
    var H = this.H, L = function (k) { return OS[k] * H; }, hauteurBassin = L('cuisse') + L('tibia') + L('cheville');
    var P = [0, -hauteurBassin + p.dy * H], tor = D(PI - p.lean);
    var cou = [P[0] + tor[0] * L('buste'), P[1] + tor[1] * L('buste')], ep = [P[0] + tor[0] * L('buste') * 0.92, P[1] + tor[1] * L('buste') * 0.92];
    var dt2 = D(PI - p.lean - p.head), tete = [cou[0] + dt2[0] * (L('cou') + L('R')), cou[1] + dt2[1] * (L('cou') + L('R'))];
    var pts = { P: P, cou: cou, ep: ep, tete: tete, aT: p.lean + p.head };
    ['L', 'R'].forEach(function (c) {
      var t1 = p['s' + c] + p.lean, co = [ep[0] + D(t1)[0] * L('bras'), ep[1] + D(t1)[1] * L('bras')], t2 = t1 + p['e' + c], ma = [co[0] + D(t2)[0] * L('avant'), co[1] + D(t2)[1] * L('avant')];
      var h = p['h' + c], ge = [P[0] + D(h)[0] * L('cuisse'), P[1] + D(h)[1] * L('cuisse')], h2 = h + p['k' + c], ch = [ge[0] + D(h2)[0] * L('tibia'), ge[1] + D(h2)[1] * L('tibia')];
      var h3 = h2 + PI / 2 + p['f' + c], bo = [ch[0] + D(h3)[0] * L('pied'), ch[1] + D(h3)[1] * L('pied')];
      pts['co' + c] = co; pts['ma' + c] = ma; pts['ge' + c] = ge; pts['ch' + c] = ch; pts['bo' + c] = bo;
    });
    // les pieds touchent le sol
    var bas = Math.max(pts.chL[1] + L('cheville'), pts.chR[1] + L('cheville'), pts.boL[1], pts.boR[1]), dyS = -bas * p.snap;
    var r = p.rot, cr = Math.cos(r), sr = Math.sin(r), lev = 0.075 * H * sr;
    for (var k in pts) if (pts[k].length === 2) { var x = pts[k][0], y = pts[k][1] + dyS; pts[k] = [x * cr - y * sr, x * sr + y * cr - lev]; }
    pts.aT += r; pts.rot = r; return pts;
  };

  function ombreCoul(hex, k) { var c = versRgb(hex); return 'rgb(' + c.map(function (v) { return Math.round(v * k); }).join(',') + ')'; }
  Perso.prototype.dessiner = function (ctx) {
    var H = this.H, p = this.dernier, s = this.squelette(p), fx = this.fx, lu = fx.lum, la = lu.angle * PI / 180, lx = Math.cos(la) * this.dir, ly = -Math.sin(la), self = this;
    var X0 = this.x, Y0 = this.sol - this.z, dir = this.dir;
    // ombre au sol : contact + ombre portée selon le soleil
    var v = fx.vecteurOmbre(), haut = this.z / H, al = Math.min(0.5, 0.12 + lu.force) / (1 + haut * 2), cx = X0 + (s.tete[0] * 0.5) * dir;
    ctx.save(); ctx.fillStyle = lu.teinte; ctx.globalAlpha = al; ctx.beginPath(); ctx.ellipse(cx, this.sol, H * (0.2 + Math.abs(Math.sin(p.rot)) * 0.3) / (1 + haut), H * 0.035, 0, 0, 6.3); ctx.fill();
    if (lu.force > 0.02) { var lg = Math.hypot(v[0], v[1]) / 18 * H * 0.6; ctx.globalAlpha = al * 0.6; ctx.translate(cx, this.sol); ctx.rotate(Math.atan2(v[1] * 0.3, v[0])); ctx.beginPath(); ctx.ellipse(lg * 0.5, 0, Math.max(H * 0.15, lg * 0.55), H * 0.05, 0, 0, 6.3); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.translate(X0, Y0); ctx.scale(dir, 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function seg(a, b, w, col, k) { // membre en relief : côté ombre puis côté éclairé
      ctx.strokeStyle = ombreCoul(col, 0.72 * (k || 1)); ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.strokeStyle = k && k < 1 ? ombreCoul(col, 0.95 * k) : col; ctx.lineWidth = w * 0.62; ctx.beginPath(); ctx.moveTo(a[0] + lx * w * 0.16, a[1] + ly * w * 0.16); ctx.lineTo(b[0] + lx * w * 0.16, b[1] + ly * w * 0.16); ctx.stroke();
    }
    function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
    function jambe(c, k) {
      seg(s['ch' + c], s['bo' + c], H * 0.035, self.peau, k); // pied
      ctx.strokeStyle = ombreCoul(self.savate, k); ctx.lineWidth = H * 0.016; ctx.beginPath(); var so = H * 0.022, a = s['ch' + c], b = s['bo' + c], n = [b[1] - a[1], a[0] - b[0]], nl = Math.hypot(n[0], n[1]) || 1;
      ctx.moveTo(a[0] - n[0] / nl * so, a[1] - n[1] / nl * so); ctx.lineTo(b[0] - n[0] / nl * so, b[1] - n[1] / nl * so); ctx.stroke(); // savate
      seg(s['ge' + c], s['ch' + c], H * 0.062, self.peau, k); seg(s.P, s['ge' + c], H * 0.075, self.peau, k);
      seg(s.P, mix(s.P, s['ge' + c], 0.55), H * 0.084, self.bas, k); // short
    }
    function bras2(c, k) { seg(s['co' + c], s['ma' + c], H * 0.045, self.peau, k); seg(s.ep, s['co' + c], H * 0.052, self.peau, k); seg(s.ep, mix(s.ep, s['co' + c], 0.45), H * 0.066, self.haut, k);
      ctx.fillStyle = ombreCoul(self.peau, 0.9 * k); ctx.beginPath(); ctx.arc(s['ma' + c][0], s['ma' + c][1], H * 0.03, 0, 6.3); ctx.fill(); }
    jambe('R', 0.78); bras2('R', 0.78);
    seg(s.P, s.ep, H * 0.2, this.haut); // buste (t-shirt)
    seg(mix(s.P, s.ep, -0.05), mix(s.P, s.ep, 0.12), H * 0.19, this.bas); // ceinture du short
    seg(s.cou, mix(s.cou, s.tete, 0.4), H * 0.05, this.peau);
    jambe('L', 1);
    this.tete(ctx, s, lx, ly);
    bras2('L', 1);
    ctx.restore();
  };
  Perso.prototype.tete = function (ctx, s, lx, ly) {
    var H = this.H, R = OS.R * H, p = this.dernier, c = this.cCheveux;
    ctx.save(); ctx.translate(s.tete[0], s.tete[1]); ctx.rotate(s.aT * 0.6);
    // cheveux de derrière
    if (this.cheveux === 'tresses') { ctx.strokeStyle = c; ctx.lineWidth = R * 0.32; for (var i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(-R * 0.55, -R * 0.1 + i * R * 0.2); ctx.quadraticCurveTo(-R * 1.15, R * 0.6, -R * (0.75 + i * 0.25), R * 1.25 + Math.sin(this.t * 4 + i) * R * 0.1); ctx.stroke(); } ctx.fillStyle = '#FFD23F'; ctx.beginPath(); ctx.arc(-R * 0.8, R * 1.3, R * 0.13, 0, 6.3); ctx.fill(); }
    var g = ctx.createRadialGradient(lx * R * 0.4, ly * R * 0.4, R * 0.1, 0, 0, R * 1.05); g.addColorStop(0, eclaircir(this.peau, 0.18)); g.addColorStop(1, ombreCoul(this.peau, 0.78));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.98, R, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = ombreCoul(this.peau, 0.85); ctx.beginPath(); ctx.arc(-R * 0.12, R * 0.12, R * 0.2, 0, 6.3); ctx.fill(); // oreille
    ctx.fillStyle = this.peau; ctx.beginPath(); ctx.arc(R * 0.95, R * 0.12, R * 0.15, 0, 6.3); ctx.fill(); // nez
    // cheveux
    ctx.fillStyle = c;
    if (this.cheveux === 'frise' || this.cheveux === 'tresses') { for (var j = 0; j < 9; j++) { var an = PI * (0.95 + j * 0.13); ctx.beginPath(); ctx.arc(Math.cos(an) * R * 0.82, Math.sin(an) * R * 0.82 - R * 0.05, R * (this.cheveux === 'frise' ? 0.38 : 0.3), 0, 6.3); ctx.fill(); } }
    else if (this.cheveux === 'court') { ctx.beginPath(); ctx.ellipse(-R * 0.1, -R * 0.3, R * 0.95, R * 0.72, -0.2, PI * 0.95, PI * 2.05); ctx.fill(); }
    else if (this.cheveux === 'casquette') { ctx.beginPath(); ctx.ellipse(-R * 0.05, -R * 0.35, R * 1.0, R * 0.7, 0, PI, 0); ctx.fill(); ctx.fillRect(-R * 0.1, -R * 0.42, R * 1.65, R * 0.16); ctx.fillStyle = eclaircir(c, 0.3); ctx.beginPath(); ctx.arc(-R * 0.05, -R * 0.95, R * 0.1, 0, 6.3); ctx.fill(); }
    // visage
    var oeil = [R * 0.5, -R * 0.08];
    if (this.cligne > 0 && p.expr !== 'aie') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(oeil[0], oeil[1], R * 0.17, R * 0.21, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(oeil[0] + R * 0.06, oeil[1] + R * 0.02, R * 0.1, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(oeil[0] + R * 0.09, oeil[1] - R * 0.03, R * 0.035, 0, 6.3); ctx.fill(); }
    else { ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = R * 0.07; ctx.beginPath(); if (p.expr === 'aie') { ctx.moveTo(oeil[0] - R * 0.12, oeil[1] - R * 0.1); ctx.lineTo(oeil[0] + R * 0.12, oeil[1] + R * 0.1); ctx.moveTo(oeil[0] + R * 0.12, oeil[1] - R * 0.1); ctx.lineTo(oeil[0] - R * 0.12, oeil[1] + R * 0.1); } else { ctx.moveTo(oeil[0] - R * 0.14, oeil[1]); ctx.lineTo(oeil[0] + R * 0.14, oeil[1]); } ctx.stroke(); }
    ctx.strokeStyle = ombreCoul(c, 1); ctx.lineWidth = R * 0.08; ctx.beginPath(); var sour = p.expr === 'oh' || p.expr === 'hmm' ? 0.12 : -0.04; ctx.moveTo(oeil[0] - R * 0.16, oeil[1] - R * (0.32 + sour)); ctx.lineTo(oeil[0] + R * 0.18, oeil[1] - R * 0.3); ctx.stroke(); // sourcil
    ctx.strokeStyle = '#5a2a1a'; ctx.fillStyle = '#7a2e22'; ctx.lineWidth = R * 0.07; ctx.beginPath(); var bx = R * 0.62, by = R * 0.5;
    if (p.expr === 'oh') { ctx.ellipse(bx, by, R * 0.09, R * 0.12, 0, 0, 6.3); ctx.fill(); }
    else if (p.expr === 'joie') { ctx.moveTo(bx - R * 0.22, by - R * 0.06); ctx.quadraticCurveTo(bx, by + R * 0.3, bx + R * 0.22, by - R * 0.08); ctx.closePath(); ctx.fill(); }
    else if (p.expr === 'aie') { ctx.moveTo(bx - R * 0.18, by); for (var z = 1; z <= 4; z++) ctx.lineTo(bx - R * 0.18 + z * R * 0.09, by + (z % 2 ? -1 : 1) * R * 0.05); ctx.stroke(); }
    else if (p.expr === 'hmm') { ctx.moveTo(bx - R * 0.15, by + R * 0.03); ctx.lineTo(bx + R * 0.12, by - R * 0.02); ctx.stroke(); }
    else { ctx.moveTo(bx - R * 0.18, by - R * 0.02); ctx.quadraticCurveTo(bx, by + R * 0.16, bx + R * 0.18, by - R * 0.05); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,120,110,.25)'; ctx.beginPath(); ctx.arc(R * 0.35, R * 0.28, R * 0.14, 0, 6.3); ctx.fill(); // joue
    ctx.restore();
  };

  Directeur.prototype.personnage = function (o) {
    var self = this;
    if (!this._scene) {
      var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9995';
      this.conteneur.appendChild(c); var S = this._scene = { c: c, ctx: c.getContext('2d'), persos: [], raf: 0, der: 0 };
      var redim = function () { var t = self.taille(), d = Math.min(2, global.devicePixelRatio || 1); S.L = t.l; S.H = t.h; S.d = d; c.width = Math.round(t.l * d); c.height = Math.round(t.h * d); };
      redim(); global.addEventListener('resize', redim);
      S.boucle = function (ts) {
        var dt = S.der ? Math.min(0.05, (ts - S.der) / 1000) : 0.016; S.der = ts; if (self.enPause) dt = 0; dt *= self.particules.temps;
        S.persos = S.persos.filter(function (p) { return !p.mort; });
        var ctx = S.ctx; ctx.setTransform(S.d, 0, 0, S.d, 0, 0); ctx.clearRect(0, 0, S.L, S.H);
        S.persos.sort(function (a, b) { return a.sol - b.sol; }).forEach(function (p) { p.maj(dt); p.dessiner(ctx); });
        if (S.persos.length) S.raf = requestAnimationFrame(S.boucle); else { S.raf = 0; S.der = 0; }
      };
    }
    var p = new Perso(this, o || {}); this._scene.persos.push(p); if (!this._scene.raf) this._scene.raf = requestAnimationFrame(this._scene.boucle);
    return p;
  };

  /* ======================================================================
   * 7 undecies. ASPECT DES PERSONNAGES v3.1
   *  Peau : modelé en dégradé sur chaque membre, chaleur rouge sous la peau à la limite ombre-lumière,
   *         reflet brillant (plus marqué sur les peaux foncées), oreille translucide ; teintes : fx.peaux
   *  Cheveux : 'frise' (boucles qui rebondissent), 'tresses' (nattes tressées qui se balancent, perles),
   *            'queue' (queue de cheval), 'longs' (mèches), 'court', 'casquette' ; tout bouge avec le corps et fx.vent
   *  Vêtements : tissu en texture (coton, toile, jean), motifs 'uni' | 'rayures' | 'madras', plis qui suivent
   *              le mouvement, ourlets et coutures
   *  fx.personnage({ peau: 'cannelle', cheveux: 'tresses', motif: 'madras', perles: '#FFD23F', cils: true })
   * ==================================================================== */
  var PEAUX = { claire: '#F3CFA6', doree: '#E2AE74', cannelle: '#C68642', cafe: '#8D5524', ebene: '#5A3520', chocolat: '#6E4129' };
  Directeur.prototype.peaux = PEAUX;
  function rgbM(c, k) { return [c[0] * k, c[1] * k, c[2] * k]; }
  function rgbMix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function css(c, a) { return 'rgba(' + Math.round(borne(c[0], 0, 255)) + ',' + Math.round(borne(c[1], 0, 255)) + ',' + Math.round(borne(c[2], 0, 255)) + ',' + (a == null ? 1 : a) + ')'; }
  var CACHE_PAL = {};
  function palette(hex, k, peau) {
    var cle = hex + k + peau; if (CACHE_PAL[cle]) return CACHE_PAL[cle];
    var b = rgbM(versRgb(hex), k), lum = (b[0] * 0.3 + b[1] * 0.59 + b[2] * 0.11) / 255;
    var p = { ombre: css(rgbM(b, peau ? 0.62 : 0.6)), chaud: css(peau ? rgbMix(rgbM(b, 0.84), [210, 70, 50], 0.16) : rgbM(b, 0.8)), base: css(b),
      clair: css(rgbMix(b, [255, 245, 230], peau ? 0.16 : 0.14)), bord: css(rgbM(b, 0.9)), brille: peau ? 0.1 + (1 - lum) * 0.22 : 0 };
    return (CACHE_PAL[cle] = p);
  }
  /* membre en relief : dégradé à travers le membre, orienté vers le soleil */
  function membre(ctx, a, b, w, hex, k, lx, ly, peau) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 0.001, nx = -dy / L, ny = dx / L; if (nx * lx + ny * ly < 0) { nx = -nx; ny = -ny; }
    var r = w / 2, pa = palette(hex, k, peau), g = ctx.createLinearGradient(a[0] - nx * r, a[1] - ny * r, a[0] + nx * r, a[1] + ny * r);
    g.addColorStop(0, pa.ombre); g.addColorStop(0.32, pa.chaud); g.addColorStop(0.58, pa.base); g.addColorStop(0.86, pa.clair); g.addColorStop(1, pa.bord);
    ctx.strokeStyle = g; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    if (pa.brille) { ctx.strokeStyle = 'rgba(255,250,240,' + pa.brille.toFixed(3) + ')'; ctx.lineWidth = w * 0.14; ctx.beginPath(); ctx.moveTo(a[0] + nx * r * 0.5 + dx * 0.15, a[1] + ny * r * 0.5 + dy * 0.15); ctx.lineTo(b[0] + nx * r * 0.5 - dx * 0.15, b[1] + ny * r * 0.5 - dy * 0.15); ctx.stroke(); }
    return [nx, ny];
  }
  /* textures de tissu (petites tuiles répétées, une par couleur et matière) */
  var CACHE_TISSU = {};
  function tissu(ctx, hex, type) {
    var cle = hex + type; if (CACHE_TISSU[cle]) return CACHE_TISSU[cle];
    var c = document.createElement('canvas'), n = type === 'madras' ? 48 : 24; c.width = c.height = n; var g = c.getContext('2d'), b = versRgb(hex);
    g.fillStyle = css(b); g.fillRect(0, 0, n, n);
    if (type === 'madras') {
      [['#F4C430', 0, 7, 0.75], ['#2E8B57', 14, 4, 0.7], ['#C1121F', 24, 9, 0.55], ['#FFFFFF', 37, 1.5, 0.6], ['#1D3557', 41, 3, 0.5]].forEach(function (r) {
        g.globalAlpha = r[3]; g.fillStyle = r[0]; g.fillRect(r[1], 0, r[2], n); g.globalAlpha = r[3] * 0.75; g.fillRect(0, r[1], n, r[2]); });
      g.globalAlpha = 0.12; g.fillStyle = '#000'; for (var y = 0; y < n; y += 2) g.fillRect(0, y, n, 1);
    } else if (type === 'rayures') { g.fillStyle = 'rgba(255,255,255,.85)'; for (var y2 = 0; y2 < n; y2 += 8) g.fillRect(0, y2, n, 3); }
    else if (type === 'jean' || type === 'toile') { g.strokeStyle = css(rgbMix(b, [255, 255, 255], 0.14), 0.8); g.lineWidth = 1; for (var d = -n; d < n * 2; d += 3) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + n, n); g.stroke(); } if (type === 'jean') { g.strokeStyle = css(rgbM(b, 0.8), 0.6); for (var e = -n; e < n * 2; e += 6) { g.beginPath(); g.moveTo(e, 0); g.lineTo(e + n, n); g.stroke(); } } }
    var im = g.getImageData(0, 0, n, n), dd = im.data; for (var i = 0; i < dd.length; i += 4) { var v = (Math.random() - 0.5) * 16; dd[i] += v; dd[i + 1] += v; dd[i + 2] += v; } g.putImageData(im, 0, 0); // grain du coton
    return (CACHE_TISSU[cle] = ctx.createPattern(c, 'repeat'));
  }
  /* pièce de vêtement : tissu + modelé + plis */
  function vetement(ctx, a, b, w, hex, motif, k, lx, ly, ech) {
    var pat = tissu(ctx, hex, motif || 'coton'); if (pat.setTransform && global.DOMMatrix) pat.setTransform(new DOMMatrix().translateSelf(a[0], a[1]).rotateSelf(Math.atan2(b[1] - a[1], b[0] - a[0]) * 57.3 + 90).scaleSelf(ech || 1, ech || 1));
    ctx.strokeStyle = pat; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 0.001, nx = -dy / L, ny = dx / L; if (nx * lx + ny * ly < 0) { nx = -nx; ny = -ny; }
    var r = w / 2, g = ctx.createLinearGradient(a[0] - nx * r, a[1] - ny * r, a[0] + nx * r, a[1] + ny * r);
    g.addColorStop(0, 'rgba(0,0,0,' + (0.42 - k * 0.1) + ')'); g.addColorStop(0.4, 'rgba(0,0,0,' + (0.12 + (1 - k) * 0.3) + ')'); g.addColorStop(0.75, 'rgba(255,255,255,' + (0.1 * k) + ')'); g.addColorStop(1, 'rgba(0,0,0,.12)');
    ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    return [nx, ny, dx / L, dy / L, L];
  }

  var dessinerV30 = Perso.prototype.dessiner;
  Perso.prototype.dessiner = function (ctx) {
    var H = this.H, p = this.dernier, s = this.squelette(p), fx = this.fx, lu = fx.lum, la = lu.angle * PI / 180, lx = Math.cos(la) * this.dir, ly = -Math.sin(la), self = this, o = this.opt || {};
    var X0 = this.x, Y0 = this.sol - this.z, dir = this.dir;
    this.simCheveux(s, X0, Y0);
    var v = fx.vecteurOmbre(), haut = this.z / H, al = Math.min(0.5, 0.12 + lu.force) / (1 + haut * 2), cx = X0 + (s.tete[0] * 0.5) * dir;
    ctx.save(); ctx.fillStyle = lu.teinte; ctx.globalAlpha = al; ctx.beginPath(); ctx.ellipse(cx, this.sol, H * (0.2 + Math.abs(Math.sin(p.rot)) * 0.3) / (1 + haut), H * 0.035, 0, 0, 6.3); ctx.fill();
    if (lu.force > 0.02) { var lg = Math.hypot(v[0], v[1]) / 18 * H * 0.6; ctx.globalAlpha = al * 0.6; ctx.translate(cx, this.sol); ctx.rotate(Math.atan2(v[1] * 0.3, v[0])); ctx.beginPath(); ctx.ellipse(lg * 0.5, 0, Math.max(H * 0.15, lg * 0.55), H * 0.05, 0, 0, 6.3); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.translate(X0, Y0); ctx.scale(dir, 1); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
    var peau = this.peau, bas = this.bas, motifBas = o.matiereBas || 'toile', motifHaut = o.motif === 'madras' || o.motif === 'rayures' ? o.motif : 'coton';
    function jambe(c, k) {
      var a = s['ch' + c], b = s['bo' + c], n = [b[1] - a[1], a[0] - b[0]], nl = Math.hypot(n[0], n[1]) || 1, so = H * 0.024;
      membre(ctx, a, b, H * 0.036, peau, k, lx, ly, true);
      ctx.strokeStyle = css(rgbM(versRgb(self.savate), k)); ctx.lineWidth = H * 0.018; ctx.beginPath(); ctx.moveTo(a[0] - n[0] / nl * so, a[1] - n[1] / nl * so); ctx.lineTo(b[0] - n[0] / nl * so, b[1] - n[1] / nl * so); ctx.stroke(); // semelle
      ctx.strokeStyle = css(rgbM(versRgb(self.savate), k * 0.8)); ctx.lineWidth = H * 0.008; ctx.beginPath(); var m1 = mix(a, b, 0.75); ctx.moveTo(m1[0] - n[0] / nl * so, m1[1] - n[1] / nl * so); ctx.lineTo(m1[0] + n[0] / nl * so * 0.2, m1[1] + n[1] / nl * so * 0.2); ctx.stroke(); // bride de la savate deux doigts
      membre(ctx, s['ge' + c], s['ch' + c], H * 0.062, peau, k, lx, ly, true);
      membre(ctx, s.P, s['ge' + c], H * 0.076, peau, k, lx, ly, true);
      var fin = mix(s.P, s['ge' + c], 0.58), f = vetement(ctx, s.P, fin, H * 0.088, bas, motifBas, k, lx, ly, H / 160);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.28 * k) + ')'; ctx.lineWidth = Math.max(0.6, H * 0.004); ctx.setLineDash([H * 0.012, H * 0.01]); ctx.beginPath(); var hm = mix(s.P, fin, 0.88); ctx.moveTo(hm[0] - f[0] * H * 0.04, hm[1] - f[1] * H * 0.04); ctx.lineTo(hm[0] + f[0] * H * 0.04, hm[1] + f[1] * H * 0.04); ctx.stroke(); ctx.setLineDash([]); // couture de l'ourlet
      ctx.strokeStyle = 'rgba(0,0,0,' + (0.18 * k) + ')'; ctx.lineWidth = Math.max(0.8, H * 0.006); ctx.beginPath(); var pl = mix(s.P, fin, 0.45); ctx.moveTo(pl[0] - f[0] * H * 0.03, pl[1] - f[1] * H * 0.03); ctx.quadraticCurveTo(pl[0] + f[2] * H * 0.02, pl[1] + f[3] * H * 0.02, pl[0] + f[0] * H * 0.02, pl[1] + f[1] * H * 0.02); ctx.stroke(); // pli
    }
    function bras(c, k) {
      membre(ctx, s['co' + c], s['ma' + c], H * 0.046, peau, k, lx, ly, true); membre(ctx, s.ep, s['co' + c], H * 0.053, peau, k, lx, ly, true);
      var fm = mix(s.ep, s['co' + c], 0.46), f = vetement(ctx, s.ep, fm, H * 0.068, self.haut, motifHaut, k, lx, ly, H / 160);
      ctx.strokeStyle = 'rgba(0,0,0,' + (0.2 * k) + ')'; ctx.lineWidth = Math.max(0.6, H * 0.005); ctx.beginPath(); var hm = mix(s.ep, fm, 0.93); ctx.moveTo(hm[0] - f[0] * H * 0.033, hm[1] - f[1] * H * 0.033); ctx.lineTo(hm[0] + f[0] * H * 0.033, hm[1] + f[1] * H * 0.033); ctx.stroke(); // ourlet de la manche
      var m = s['ma' + c], pa = palette(peau, k, true), gm = ctx.createRadialGradient(m[0] + lx * H * 0.01, m[1] + ly * H * 0.01, 0, m[0], m[1], H * 0.032); gm.addColorStop(0, pa.clair); gm.addColorStop(0.7, pa.base); gm.addColorStop(1, pa.ombre);
      ctx.fillStyle = gm; ctx.beginPath(); ctx.arc(m[0], m[1], H * 0.031, 0, 6.3); ctx.fill();
    }
    this.cheveuxDerriere(ctx, X0, Y0, 0.8, 'derriere');
    jambe('R', 0.78); bras('R', 0.78);
    var f = vetement(ctx, s.P, s.ep, H * 0.2, this.haut, motifHaut, 1, lx, ly, H / 160); // buste en tissu
    // plis du t-shirt : à la taille, et en diagonale depuis l'aisselle (plus marqués quand il se penche)
    var pk = 0.16 + Math.min(0.25, Math.abs(p.lean) * 0.4);
    ctx.lineWidth = Math.max(0.8, H * 0.006);
    for (var i = 0; i < 3; i++) { var t0 = 0.12 + i * 0.07, c0 = mix(s.P, s.ep, t0), wv = H * (0.06 - i * 0.012); ctx.strokeStyle = 'rgba(0,0,0,' + pk.toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(c0[0] - f[0] * wv, c0[1] - f[1] * wv); ctx.quadraticCurveTo(c0[0] + f[2] * H * 0.015, c0[1] + f[3] * H * 0.015, c0[0] + f[0] * wv * 0.8, c0[1] + f[1] * wv * 0.8); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,' + (pk * 0.5).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(c0[0] - f[0] * wv + f[2] * 2, c0[1] - f[1] * wv + f[3] * 2); ctx.quadraticCurveTo(c0[0] + f[2] * (H * 0.015 + 2), c0[1] + f[3] * (H * 0.015 + 2), c0[0] + f[0] * wv * 0.8 + f[2] * 2, c0[1] + f[1] * wv * 0.8 + f[3] * 2); ctx.stroke(); }
    var ax = mix(s.P, s.ep, 0.82); ctx.strokeStyle = 'rgba(0,0,0,' + (pk * 0.9).toFixed(2) + ')'; ctx.beginPath(); ctx.moveTo(ax[0] - f[0] * H * 0.02, ax[1] - f[1] * H * 0.02); ctx.quadraticCurveTo(ax[0] - f[2] * H * 0.08, ax[1] - f[3] * H * 0.08, ax[0] - f[2] * H * 0.15 + f[0] * H * 0.04, ax[1] - f[3] * H * 0.15 + f[1] * H * 0.04); ctx.stroke();
    vetement(ctx, mix(s.P, s.ep, -0.05), mix(s.P, s.ep, 0.13), H * 0.19, bas, motifBas, 1, lx, ly, H / 160); // ceinture du short
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = Math.max(0.8, H * 0.007); var cz = mix(s.P, s.ep, 0.13); ctx.beginPath(); ctx.moveTo(cz[0] - f[0] * H * 0.095, cz[1] - f[1] * H * 0.095); ctx.lineTo(cz[0] + f[0] * H * 0.095, cz[1] + f[1] * H * 0.095); ctx.stroke(); // haut du short
    // cou, avec l'ombre du menton
    membre(ctx, s.cou, mix(s.cou, s.tete, 0.45), H * 0.052, peau, 1, lx, ly, true);
    ctx.fillStyle = 'rgba(40,10,0,.18)'; ctx.beginPath(); var mc = mix(s.cou, s.tete, 0.35); ctx.ellipse(mc[0] + H * 0.01, mc[1], H * 0.03, H * 0.012, s.aT, 0, 6.3); ctx.fill();
    // col du t-shirt
    ctx.strokeStyle = css(rgbM(versRgb(this.haut), 0.7)); ctx.lineWidth = Math.max(1, H * 0.012); ctx.beginPath(); var cc = mix(s.P, s.ep, 1.02); ctx.moveTo(cc[0] - f[0] * H * 0.045, cc[1] - f[1] * H * 0.045); ctx.lineTo(cc[0] + f[0] * H * 0.04, cc[1] + f[1] * H * 0.04); ctx.stroke();
    jambe('L', 1);
    this.cheveuxDerriere(ctx, X0, Y0, 1, 'devant');
    this.tete(ctx, s, lx, ly);
    this.cheveuxDevant(ctx, X0, Y0);
    bras('L', 1);
    ctx.restore();
  };

  /* --- cheveux : chaînes de points (Verlet) accrochées à la tête, poussées par le mouvement, la gravité et le vent --- */
  Perso.prototype.versMonde = function (s, lx, ly, X0, Y0) { var r = s.aT * 0.6, c = Math.cos(r), sn = Math.sin(r), hx = s.tete[0] + lx * c - ly * sn, hy = s.tete[1] + lx * sn + ly * c; return [X0 + hx * this.dir, Y0 + hy]; };
  Perso.prototype.simCheveux = function (s, X0, Y0) {
    var H = this.H, R = OS.R * H, st = this.cheveux, self = this, fx = this.fx;
    if (!this.meches) {
      this.meches = [];
      var ajoute = function (ax, ay, n, lg, l) { var pts = []; for (var i = 0; i < n; i++) pts.push([0, 0, 0, 0]); self.meches.push({ ax: ax, ay: ay, pts: pts, seg: lg / (n - 1), larg: l, init: false }); };
      if (st === 'tresses') { ajoute(-R * 0.8, -R * 0.05, 8, R * 1.9, R * 0.3); ajoute(-R * 0.62, R * 0.25, 8, R * 1.7, R * 0.28); }
      else if (st === 'queue') ajoute(-R * 0.75, -R * 0.45, 7, R * 1.5, R * 0.42);
      else if (st === 'longs') { for (var k = 0; k < 6; k++) ajoute(-R * (0.2 + k * 0.14), -R * (0.75 - k * 0.22), 6, R * (1.35 + k * 0.08), R * 0.3); }
    }
    var dt = Math.min(0.033, this._dt || 0.016), g = 900 * (H / 120) * Math.max(0.05, fx.particules.gravite), vent = (fx.particules.vent || 0) * 3.2 * (H / 120) * (1 + 0.5 * Math.sin(this.t * 3.1)), tc = this.versMonde(s, 0, 0, X0, Y0);
    this.meches.forEach(function (m) {
      var a = self.versMonde(s, m.ax, m.ay, X0, Y0), P = m.pts;
      if (m.init && Math.hypot(a[0] - m.pts[0][0], a[1] - m.pts[0][1]) > H * 0.25) m.init = false;
      if (!m.init) { for (var i = 0; i < P.length; i++) { P[i][0] = P[i][2] = a[0]; P[i][1] = P[i][3] = a[1] + i * m.seg; } m.init = true; }
      P[0][0] = P[0][2] = a[0]; P[0][1] = P[0][3] = a[1];
      for (var j = 1; j < P.length; j++) { var q = P[j], vx = (q[0] - q[2]) * 0.965, vy = (q[1] - q[3]) * 0.965; q[2] = q[0]; q[3] = q[1]; q[0] += vx + vent * dt * dt; q[1] += vy + g * dt * dt; }
      for (var it = 0; it < 3; it++) for (var j2 = 1; j2 < P.length; j2++) {
        var p0 = P[j2 - 1], p1 = P[j2], dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 0.001, e = (d - m.seg) / d; p1[0] -= dx * e; p1[1] -= dy * e;
        var hx = p1[0] - tc[0], hy = p1[1] - tc[1], hd = Math.hypot(hx, hy); if (hd < R * 1.02) { p1[0] = tc[0] + hx / hd * R * 1.02; p1[1] = tc[1] + hy / hd * R * 1.02; }
      }
    });
    // ressort des boucles (frisé) : elles retardent un peu sur le mouvement de la tête
    var tv = this._tetePrec ? [(tc[0] - this._tetePrec[0]) / dt, (tc[1] - this._tetePrec[1]) / dt] : [0, 0]; this._tetePrec = tc;
    this.ressort = this.ressort || [0, 0]; var cible = [borne(-tv[0] * 0.006 * this.dir + vent * 0.0004 * this.dir, -0.12, 0.12) * R, borne(-tv[1] * 0.004, -0.1, 0.1) * R];
    this.ressort[0] += (cible[0] - this.ressort[0]) * Math.min(1, dt * 9); this.ressort[1] += (cible[1] - this.ressort[1]) * Math.min(1, dt * 9);
  };
  Perso.prototype.cheveuxDerriere = function (ctx, X0, Y0, k, mode) {
    if (!this.meches) return; var H = this.H, c = versRgb(this.cCheveux), dir = this.dir, st = this.cheveux, perle = (this.opt || {}).perles || '#FFD23F', self = this;
    this.meches.forEach(function (m, mi) {
      if (st === 'tresses' ? (mode === 'devant') !== (mi % 2 === 0) : mode === 'devant') return;
      var P = m.pts.map(function (q) { return [(q[0] - X0) * dir, q[1] - Y0]; }), kk = (mi % 2 ? 0.82 : 1) * k;
      if (st === 'tresses') { // natte : maillons croisés
        for (var i = 1; i < P.length; i++) { var a = P[i - 1], b = P[i], an = Math.atan2(b[1] - a[1], b[0] - a[0]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, w = m.larg * (1 - i / P.length * 0.35);
          for (var z = 0; z < 2; z++) { ctx.save(); ctx.translate(mx + Math.cos(an) * (z - 0.5) * m.seg * 0.5, my + Math.sin(an) * (z - 0.5) * m.seg * 0.5); ctx.rotate(an + (z ? 0.5 : -0.5));
            ctx.fillStyle = css(rgbM(c, kk)); ctx.beginPath(); ctx.ellipse(0, 0, m.seg * 0.42, w * 0.55, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = css(rgbMix(c, [255, 255, 255], 0.22), 0.6); ctx.beginPath(); ctx.ellipse(-m.seg * 0.08, -w * 0.18, m.seg * 0.22, w * 0.16, 0, 0, 6.3); ctx.fill(); ctx.restore(); } }
        var e = P[P.length - 1], gp = ctx.createRadialGradient(e[0] - 1, e[1] - 1, 0, e[0], e[1], m.larg * 0.55); gp.addColorStop(0, '#fff'); gp.addColorStop(0.35, perle); gp.addColorStop(1, css(rgbM(versRgb(perle), 0.6)));
        ctx.fillStyle = gp; ctx.beginPath(); ctx.arc(e[0], e[1] + m.larg * 0.2, m.larg * 0.5, 0, 6.3); ctx.fill();
      } else { // mèche effilée
        for (var w2 = 0; w2 < 3; w2++) { ctx.strokeStyle = w2 === 2 ? css(rgbMix(c, [255, 255, 255], 0.25), 0.5) : css(rgbM(c, kk * (w2 ? 1.15 : 0.8))); ctx.lineWidth = m.larg * [1, 0.6, 0.15][w2];
          ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (var j = 1; j < P.length - 1; j++) ctx.quadraticCurveTo(P[j][0], P[j][1], (P[j][0] + P[j + 1][0]) / 2, (P[j][1] + P[j + 1][1]) / 2); ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); ctx.stroke(); }
        if (st === 'queue' && mi === 0) { var q0 = P[0]; ctx.fillStyle = perle; ctx.beginPath(); ctx.arc(q0[0], q0[1], m.larg * 0.35, 0, 6.3); ctx.fill(); } // élastique
      }
    });
  };
  Perso.prototype.cheveuxDevant = function () {};

  Perso.prototype.tete = function (ctx, s, lx, ly) {
    var H = this.H, R = OS.R * H, p = this.dernier, c = versRgb(this.cCheveux), pe = versRgb(this.peau), o = this.opt || {}, rs = this.ressort || [0, 0], st = this.cheveux;
    var lum = (pe[0] * 0.3 + pe[1] * 0.59 + pe[2] * 0.11) / 255;
    ctx.save(); ctx.translate(s.tete[0], s.tete[1]); ctx.rotate(s.aT * 0.6);
    var rl = Math.hypot(lx, ly) || 1, Lx = lx / rl, Ly = ly / rl;
    // volume arrière des boucles
    if (st === 'frise') { ctx.fillStyle = css(rgbM(c, 0.75)); ctx.beginPath(); ctx.ellipse(-R * 0.25 + rs[0], -R * 0.3 + rs[1], R * 1.12, R * 1.0, -0.2, 0, 6.3); ctx.fill(); }
    // tête : modelé, chaleur sous la peau, reflet
    var g = ctx.createRadialGradient(Lx * R * 0.45, Ly * R * 0.45, R * 0.05, -Lx * R * 0.1, -Ly * R * 0.1, R * 1.08);
    g.addColorStop(0, css(rgbMix(pe, [255, 240, 220], 0.2))); g.addColorStop(0.45, css(pe)); g.addColorStop(0.78, css(rgbMix(rgbM(pe, 0.85), [200, 60, 40], 0.12))); g.addColorStop(1, css(rgbM(pe, 0.62)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, R * 0.98, R, 0, 0, 6.3); ctx.fill();
    // mâchoire et menton
    ctx.fillStyle = css(rgbM(pe, 0.97)); ctx.beginPath(); ctx.ellipse(R * 0.42, R * 0.55, R * 0.48, R * 0.38, 0.3, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,240,' + (0.12 + (1 - lum) * 0.2).toFixed(2) + ')'; ctx.beginPath(); ctx.ellipse(R * 0.25 + Lx * R * 0.25, -R * 0.45 + Ly * R * 0.15, R * 0.28, R * 0.12, -0.4, 0, 6.3); ctx.fill(); // reflet du front
    // oreille translucide (le soleil la traverse : plus rouge)
    var go = ctx.createRadialGradient(-R * 0.1, R * 0.12, 0, -R * 0.12, R * 0.12, R * 0.22); go.addColorStop(0, css(rgbMix(pe, [230, 80, 60], 0.28))); go.addColorStop(1, css(rgbM(pe, 0.78)));
    ctx.fillStyle = go; ctx.beginPath(); ctx.ellipse(-R * 0.12, R * 0.12, R * 0.17, R * 0.22, 0, 0, 6.3); ctx.fill();
    ctx.strokeStyle = css(rgbM(pe, 0.6)); ctx.lineWidth = R * 0.04; ctx.beginPath(); ctx.arc(-R * 0.12, R * 0.12, R * 0.1, -1.2, 1.6); ctx.stroke();
    // nez avec ombre portée
    ctx.fillStyle = css(rgbM(pe, 0.75)); ctx.beginPath(); ctx.ellipse(R * 0.93, R * 0.2, R * 0.13, R * 0.08, 0.3, 0, 6.3); ctx.fill();
    ctx.fillStyle = css(rgbMix(pe, [255, 230, 210], 0.1)); ctx.beginPath(); ctx.arc(R * 0.96, R * 0.1, R * 0.14, 0, 6.3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + (0.18 + (1 - lum) * 0.2).toFixed(2) + ')'; ctx.beginPath(); ctx.arc(R * 1.0, R * 0.05, R * 0.04, 0, 6.3); ctx.fill();
    // cheveux du dessus
    var ch = css(c), chC = css(rgbMix(c, [255, 235, 200], 0.22)), chO = css(rgbM(c, 0.6));
    if (st === 'frise' || st === 'tresses' || st === 'queue') {
      var nb = st === 'frise' ? 16 : 11, rr = st === 'frise' ? 0.34 : 0.26;
      for (var pass = 0; pass < 2; pass++) for (var j = 0; j < nb; j++) {
        var an = PI * (0.92 + j * (1.22 / nb)), rad = R * (st === 'frise' ? 0.9 : 0.86), x = Math.cos(an) * rad + (st === 'frise' ? rs[0] * (0.5 + j / nb) : 0), y = Math.sin(an) * rad - R * 0.05 + (st === 'frise' ? rs[1] : 0), r0 = R * rr * (0.85 + 0.3 * ((j * 7) % 3) / 2);
        if (!pass) { ctx.fillStyle = chO; ctx.beginPath(); ctx.arc(x, y, r0, 0, 6.3); ctx.fill(); }
        else { ctx.fillStyle = ch; ctx.beginPath(); ctx.arc(x + Lx * r0 * 0.15, y + Ly * r0 * 0.15, r0 * 0.78, 0, 6.3); ctx.fill(); ctx.strokeStyle = chC; ctx.lineWidth = Math.max(0.6, r0 * 0.14); ctx.beginPath(); ctx.arc(x + Lx * r0 * 0.2, y + Ly * r0 * 0.2, r0 * 0.45, an + 2, an + 3.6); ctx.stroke(); }
      }
      if (st !== 'frise') { ctx.strokeStyle = chO; ctx.lineWidth = Math.max(0.6, R * 0.035); for (var r2 = 0; r2 < 3; r2++) { ctx.beginPath(); ctx.arc(-R * 0.1, -R * 0.05, R * (0.55 + r2 * 0.12), PI * 1.05, PI * 1.75); ctx.stroke(); } } // raies des tresses
    } else if (st === 'court' || st === 'longs') {
      ctx.fillStyle = ch; ctx.beginPath(); ctx.ellipse(-R * 0.08, -R * 0.28, R * 1.0, R * 0.76, -0.2, PI * 0.92, PI * 2.08); ctx.fill();
      if (st === 'longs') { ctx.beginPath(); ctx.ellipse(-R * 0.45, R * 0.05, R * 0.6, R * 0.85, 0.1, 0, 6.3); ctx.fill(); }
      ctx.strokeStyle = chO; ctx.lineWidth = Math.max(0.6, R * 0.04); for (var m = 0; m < 9; m++) { var a0 = PI * (1.0 + m * 0.11); ctx.beginPath(); ctx.moveTo(Math.cos(a0) * R * 0.95 - R * 0.08, Math.sin(a0) * R * 0.7 - R * 0.28); ctx.quadraticCurveTo(-R * 0.1, -R * 0.55, R * 0.45, -R * 0.62 + m * R * 0.02); ctx.stroke(); }
      ctx.strokeStyle = chC; ctx.lineWidth = Math.max(0.6, R * 0.06); ctx.beginPath(); ctx.arc(-R * 0.1 + Lx * R * 0.2, -R * 0.2 + Ly * R * 0.2, R * 0.72, PI * 1.25, PI * 1.6); ctx.stroke(); // reflet des cheveux
    } else if (st === 'casquette') {
      ctx.fillStyle = o.cheveuxSous || '#1b1311'; ctx.beginPath(); ctx.ellipse(-R * 0.6, -R * 0.02, R * 0.36, R * 0.36, 0, 0, 6.3); ctx.fill(); // cheveux qui dépassent derrière
      var gc = ctx.createLinearGradient(Lx * R, Ly * R - R * 0.6, -Lx * R, -Ly * R - R * 0.2); gc.addColorStop(0, css(rgbMix(c, [255, 255, 255], 0.25))); gc.addColorStop(1, css(rgbM(c, 0.62)));
      ctx.fillStyle = gc; ctx.beginPath(); ctx.ellipse(-R * 0.05, -R * 0.33, R * 1.02, R * 0.74, 0, PI, 0); ctx.fill();
      ctx.fillStyle = css(rgbM(c, 0.75)); ctx.beginPath(); ctx.moveTo(R * 0.55, -R * 0.4); ctx.quadraticCurveTo(R * 1.35, -R * 0.42, R * 1.62, -R * 0.26); ctx.lineTo(R * 0.6, -R * 0.24); ctx.fill(); // visière
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(0.6, R * 0.03); ctx.setLineDash([R * 0.08, R * 0.06]); ctx.beginPath(); ctx.ellipse(-R * 0.05, -R * 0.33, R * 0.9, R * 0.62, 0, PI * 1.05, PI * 1.95); ctx.stroke(); ctx.setLineDash([]); // coutures
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.moveTo(-R * 0.05, -R * 1.05); ctx.quadraticCurveTo(R * 0.45, -R * 0.75, R * 0.55, -R * 0.38); ctx.stroke();
      ctx.fillStyle = css(rgbMix(c, [255, 255, 255], 0.35)); ctx.beginPath(); ctx.arc(-R * 0.05, -R * 1.06, R * 0.09, 0, 6.3); ctx.fill();
    }
    // œil : iris, reflet, paupière, cils
    var oe = [R * 0.5, -R * 0.08], iris = o.yeux || '#5a3418';
    if (this.cligne > 0 && p.expr !== 'aie') {
      ctx.fillStyle = '#fbfbf8'; ctx.beginPath(); ctx.ellipse(oe[0], oe[1], R * 0.17, R * 0.21, 0, 0, 6.3); ctx.fill();
      var gi = ctx.createRadialGradient(oe[0] + R * 0.07, oe[1] + R * 0.04, 0, oe[0] + R * 0.06, oe[1] + R * 0.02, R * 0.12); gi.addColorStop(0, css(rgbMix(versRgb(iris), [255, 220, 150], 0.35))); gi.addColorStop(0.75, iris); gi.addColorStop(1, css(rgbM(versRgb(iris), 0.5)));
      ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(oe[0] + R * 0.06, oe[1] + R * 0.02, R * 0.115, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(oe[0] + R * 0.075, oe[1] + R * 0.02, R * 0.055, 0, 6.3); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(oe[0] + R * 0.1, oe[1] - R * 0.04, R * 0.035, 0, 6.3); ctx.fill();
      ctx.strokeStyle = css(rgbM(pe, 0.45)); ctx.lineWidth = R * 0.055; ctx.beginPath(); ctx.ellipse(oe[0], oe[1], R * 0.18, R * 0.22, 0, PI * 1.1, PI * 1.95); ctx.stroke(); // paupière
      if (o.cils) { ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = R * 0.03; for (var l = 0; l < 3; l++) { var la2 = PI * (1.55 + l * 0.14); ctx.beginPath(); ctx.moveTo(oe[0] + Math.cos(la2) * R * 0.18, oe[1] + Math.sin(la2) * R * 0.22); ctx.lineTo(oe[0] + Math.cos(la2) * R * 0.29, oe[1] + Math.sin(la2) * R * 0.31); ctx.stroke(); } }
    } else {
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = R * 0.07; ctx.beginPath();
      if (p.expr === 'aie') { ctx.moveTo(oe[0] - R * 0.12, oe[1] - R * 0.1); ctx.lineTo(oe[0] + R * 0.12, oe[1] + R * 0.1); ctx.moveTo(oe[0] + R * 0.12, oe[1] - R * 0.1); ctx.lineTo(oe[0] - R * 0.12, oe[1] + R * 0.1); }
      else { ctx.moveTo(oe[0] - R * 0.15, oe[1]); ctx.quadraticCurveTo(oe[0], oe[1] + R * 0.07, oe[0] + R * 0.15, oe[1]); } ctx.stroke();
    }
    ctx.strokeStyle = css(rgbM(c, 0.9)); ctx.lineWidth = R * 0.085; ctx.beginPath(); var so = p.expr === 'oh' || p.expr === 'hmm' ? 0.12 : -0.03; ctx.moveTo(oe[0] - R * 0.17, oe[1] - R * (0.3 + so)); ctx.quadraticCurveTo(oe[0], oe[1] - R * (0.4 + so), oe[0] + R * 0.2, oe[1] - R * 0.3); ctx.stroke(); // sourcil
    // bouche et lèvres
    var lv = css(rgbMix(rgbM(pe, 0.7), [170, 60, 60], 0.35)), bx = R * 0.64, by = R * 0.5;
    ctx.strokeStyle = lv; ctx.fillStyle = css(rgbM(versRgb('#7a2e22'), 0.9)); ctx.lineWidth = R * 0.075; ctx.beginPath();
    if (p.expr === 'oh') { ctx.ellipse(bx, by, R * 0.09, R * 0.12, 0, 0, 6.3); ctx.fill(); ctx.stroke(); }
    else if (p.expr === 'joie') { ctx.moveTo(bx - R * 0.22, by - R * 0.06); ctx.quadraticCurveTo(bx, by + R * 0.32, bx + R * 0.22, by - R * 0.08); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(bx - R * 0.17, by - R * 0.04); ctx.lineTo(bx + R * 0.17, by - R * 0.06); ctx.lineTo(bx + R * 0.12, by + R * 0.03); ctx.lineTo(bx - R * 0.12, by + R * 0.04); ctx.fill(); }
    else if (p.expr === 'aie') { ctx.moveTo(bx - R * 0.18, by); for (var z = 1; z <= 4; z++) ctx.lineTo(bx - R * 0.18 + z * R * 0.09, by + (z % 2 ? -1 : 1) * R * 0.05); ctx.stroke(); }
    else if (p.expr === 'hmm') { ctx.moveTo(bx - R * 0.15, by + R * 0.03); ctx.lineTo(bx + R * 0.12, by - R * 0.02); ctx.stroke(); }
    else { ctx.moveTo(bx - R * 0.19, by - R * 0.02); ctx.quadraticCurveTo(bx, by + R * 0.17, bx + R * 0.19, by - R * 0.05); ctx.stroke(); }
    var gj = ctx.createRadialGradient(R * 0.32, R * 0.28, 0, R * 0.32, R * 0.28, R * 0.2); gj.addColorStop(0, 'rgba(235,90,80,' + (0.18 + lum * 0.12).toFixed(2) + ')'); gj.addColorStop(1, 'rgba(235,90,80,0)'); ctx.fillStyle = gj; ctx.beginPath(); ctx.arc(R * 0.32, R * 0.28, R * 0.2, 0, 6.3); ctx.fill(); // joue
    ctx.restore();
  };
  var majV30 = Perso.prototype.maj;
  Perso.prototype.maj = function (dt) { this._dt = dt; return majV30.call(this, dt); };
  var personnageV30 = Directeur.prototype.personnage;
  Directeur.prototype.personnage = function (o) {
    o = o || {}; var p = personnageV30.call(this, o); p.opt = o; if (PEAUX[o.peau]) p.peau = PEAUX[o.peau];
    if (o.cils == null && (o.cheveux === 'tresses' || o.cheveux === 'queue' || o.cheveux === 'longs')) o.cils = true;
    return p;
  };
  Perso.prototype.habiller = function (o) { for (var k in o) { this.opt[k] = o[k]; } if (o.peau) this.peau = PEAUX[o.peau] || o.peau; if (o.haut) this.haut = o.haut; if (o.bas) this.bas = o.bas; if (o.cheveux) { this.cheveux = o.cheveux; this.meches = null; } if (o.couleurCheveux) this.cCheveux = o.couleurCheveux; return this; };

  /* ======================================================================
   * 7 quinquies. v3.2 : BULLES, FEUILLES AU VENT, FOUDRE AU SOL, FEU, ÉTINCELLES, BRAISES
   *  Bulles : film de savon qui tourne et ondule, bulle qui se déforme, éclatement en gouttelettes
   *           fx.souffleBulles(x, y, { duree }) ; fx.joue('bullesSavon') ; fx.joue('bullesEau')
   *  Feuilles : vraie feuille (nervures, recto brillant, verso clair) qui se balance en tombant,
   *           se retourne dans les rafales et glisse au sol ; fx.joue('feuilles' | 'feuillesBadamier' | 'tourbillonFeuilles')
   *           fx.arbre(el) l'arbre perd ses feuilles quand le vent souffle ; .secouer() pour une poignée de feuilles
   *  Foudre : point d'impact aveuglant, figure de Lichtenberg qui brûle le sol puis refroidit,
   *           reflet de l'éclair sur sol mouillé, arcs électriques sur l'eau
   *           fx.eclair({ proche: true, x, surface: 'sol' | 'eau', mouille: true }) ; fx.foudroyer(el)
   *  Feu : flammes calculées dans un shader (langues qui montent et se détachent, cœur blanc, base bleue),
   *        bûches qui rougeoient, lit de braises qui respire, fumée, braises, crépitement
   *        const f = fx.feu(x, y, { type: 'bois' | 'bougie' | 'torche' | 'brasier' | 'braises', taille, couleur })
   *        f.attiser() ; f.eteindre() ; f.rallumer() ; f.deplacer(x, y) ; fx.bruler(el)
   *  Étincelles : traînée chaude (tête blanche, queue orange) qui refroidit et rebondit au sol ;
   *        fx.joue('etincellesChaudes') ; fx.gerbeEtincelles(x, y, { angle, duree }) (meuleuse, forge)
   *  Braises : braise irrégulière, croûte sombre et fissures qui pulsent, refroidit en cendre ; fx.joue('braises')
   * ==================================================================== */
  SPRITES.feuille = 15; SPRITES.braise = 16; SPRITES.trait = 17; SPRITE_FLIP[15] = 1;
  var BRAISE_VIE = ['#FFF6C8', '#FFC233', '#FF6A00', '#B32000', '#4a2a20', '#2a2420'];
  var ETINCELLE_VIE = ['#FFFFFF', '#FFF1A8', '#FFB000', '#FF5A00', '#9A1A00'];
  var VERTS = ['#2D6A4F', '#40916C', '#52B788', '#74C69D', '#1B4332', '#6A994E'];
  var BADAMIER = ['#C1121F', '#E85D04', '#F48C06', '#FFBA08', '#9D0208', '#DC2F02'];
  var FEUILLE = { balance: 2.3, ampl: 44 };
  function feuilleDef(o) { var c = { sprite: 'feuille', feuille: FEUILLE, vent: 1, ventPrise: 0.9, flipVitesse: 2.6 }; for (var k in o) c[k] = o[k]; return c; }

  /* --- bulles --- */
  SYSTEMES.pop = [
    { nb: 1, fixe: true, vie: 0.16, taille: 5, tailleVie: [1, 3.4], alphaVie: [0.9, 0], sprite: 'anneau', couleur: '#FFFFFF' },
    { nb: 9, fixe: true, vie: [0.25, 0.5], vitesse: [120, 320], taille: [0.9, 1.6], sprite: 'goutte', etirement: 0.006, etirementMax: 1.4, couleur: ['#FFFFFF', '#E0F7FF', '#FFE8F7'], gravite: 700, alphaVie: [0.9, 0.7, 0] },
    { nb: 5, fixe: true, vie: [0.15, 0.3], vitesse: [60, 200], taille: [1.4, 2.6], sprite: 'trait', etirement: 0.01, etirementMax: 3, melange: 'add', couleur: ['#BDE0FE', '#FFC8DD', '#CDB4DB', '#FFFFFF'], frein: 6, alphaVie: [0.7, 0] }
  ];
  SYSTEMES.bullesSavon = [
    { nb: 12, vie: [3.5, 6.5], zone: 'cercle', rayon: 10, vitesse: [40, 150], cone: [-70, 90], taille: [5, 26], sprite: 'bulle', couleur: ['#FFFFFF', '#F1FAFF', '#FFF5FB'], gravite: -8, frein: 0.7, curl: { force: 60, freq: 0.006, vitesse: 0.3 }, vent: 1, ventPrise: 0.5, alphaVie: [0, 1, 1, 1], aLaMort: 'pop', proba: 1, etale: 0.8 }
  ];
  SYSTEMES.bullesEau = [
    { nb: 14, vie: [1.6, 2.8], zone: 'cercle', rayon: 14, vitesse: [20, 60], cone: [-90, 40], taille: [1.5, 6], tailleVie: [0.7, 1.25], sprite: 'bulle', couleur: ['#FFFFFF', '#CAF0F8'], gravite: -320, frein: 2.2, ondule: 9, amplitude: 40, alphaVie: [0, 1, 1, 0], aLaMort: 'pop', proba: 0.5, etale: 0.6 }
  ];
  Directeur.prototype.souffleBulles = function (x, y, o) {
    o = o || {}; var self = this, D = o.duree || 1600, t0 = maintenant(), m = this.particules;
    var di = m.def('souffle:bulle', { nb: 1, vie: [4, 7], vitesse: [90, 220], cone: [o.angle == null ? -60 : o.angle, 50], taille: [5, 28], sprite: 'bulle', couleur: ['#FFFFFF', '#F1FAFF', '#FFF5FB'], gravite: -10, frein: 0.9, curl: { force: 70, freq: 0.006, vitesse: 0.3 }, vent: 1, ventPrise: 0.5, alphaVie: [0, 1, 1, 1], aLaMort: 'pop', proba: 1 });
    (function souffle() { m.emettre(di, x + hasard(-4, 4), y + hasard(-4, 4), 0.5, { taille: o.taille || 1 }, Math.random() < 0.5 ? 1 : 2); if (maintenant() - t0 < D) setTimeout(souffle, hasard(90, 200)); })();
    if (this.opt.sons) this.audio.souffle(D / 1000 * 0.8, 900, 500, 0.05);
    return this;
  };

  /* --- feuilles --- */
  SYSTEMES.feuilles = [feuilleDef({ nb: 14, vie: [2.6, 4], vitesse: [160, 420], cone: [-90, 160], taille: [8, 13], couleur: VERTS, frein: 2.6, gravite: 140, alphaVie: [1, 1, 1, 0], curl: { force: 160, freq: 0.01, vitesse: 0.4 } })];
  SYSTEMES.feuillesBadamier = [feuilleDef({ nb: 14, vie: [2.6, 4], vitesse: [160, 420], cone: [-90, 160], taille: [9, 14], couleur: BADAMIER, frein: 2.6, gravite: 140, alphaVie: [1, 1, 1, 0], curl: { force: 160, freq: 0.01, vitesse: 0.4 } })];
  SYSTEMES.tourbillonFeuilles = [
    feuilleDef({ nb: 26, vie: [2.6, 3.8], zone: 'anneau', rayon: 40, vitesse: [20, 60], taille: [7, 12], couleur: VERTS.concat(['#F48C06', '#FFBA08', '#8C5E3C']), gravite: -70, frein: 1.8, vortex: 520, attracteur: 260, feuille: { balance: 3, ampl: 20 }, flipVitesse: 7, alphaVie: [0, 1, 1, 0] }),
    { nb: 22, vie: [1.2, 2.2], zone: 'anneau', rayon: 50, vitesse: [10, 40], taille: [8, 16], tailleVie: [0.5, 1.8], alphaVie: [0, 0.22, 0], sprite: 'fumee', couleur: '#cdbfa8', vortex: 460, attracteur: 200, frein: 1.8, gravite: -50 }
  ];
  AMBIANCES.feuilles = [feuilleDef({ debit: 1.6, vie: [8, 11], zone: 'ecran-haut', vitesse: [20, 60], cone: [90, 40], taille: [7, 11], couleur: VERTS, gravite: 60, frein: 0.8, alphaVie: [0, 1, 1, 0], curl: { force: 50, freq: 0.006, vitesse: 0.3 } })];
  AMBIANCES.feuillesBadamier = [feuilleDef({ debit: 1.3, vie: [8, 11], zone: 'ecran-haut', vitesse: [20, 60], cone: [90, 40], taille: [8, 12], couleur: BADAMIER, gravite: 60, frein: 0.8, alphaVie: [0, 1, 1, 0], curl: { force: 50, freq: 0.006, vitesse: 0.3 } })];
  // les débris verts du vent fort et de l'alizé deviennent de vraies feuilles
  Object.keys(METEOS).forEach(function (k) { (METEOS[k].calques || []).forEach(function (c) { if (c.sprite === 'petale' && Array.isArray(c.couleur) && c.couleur.indexOf('#52B788') >= 0) { c.sprite = 'feuille'; c.flipVitesse = c.flipVitesse || 6; } }); });

  Directeur.prototype.arbre = function (el, o) {
    o = o || {}; var self = this, m = this.particules, actif = true, der = 0, acc = 0, t = 0;
    var di = m.def('arbre:' + (o.couleurs ? o.couleurs.join('') : o.badamier ? 'b' : 'v'), feuilleDef({ nb: 1, vie: [5, 8], vitesse: [10, 60], cone: [90, 140], taille: [7, 12], couleur: o.couleurs || (o.badamier ? BADAMIER : VERTS), gravite: 70, frein: 0.9, alphaVie: [0, 1, 1, 1, 0], sol: { rebond: 0.05, friction: 0.35 } }));
    function lache(n) {
      var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect();
      for (var i = 0; i < n; i++) m.emettre(di, r.left - b.left + r.width * hasard(0.15, 0.85), r.top - b.top + r.height * hasard(0.05, 0.5), 0.5, {}, 1);
    }
    function boucle(ts) {
      if (!actif) return; var dt = der ? Math.min(0.05, (ts - der) / 1000) : 0.016; der = ts; if (self.enPause) dt = 0; t += dt;
      var v = m.vent; acc += ((o.debit == null ? 0.12 : o.debit) + Math.abs(v) / 160 * (o.sensibilite || 1)) * dt;
      while (acc >= 1) { acc -= 1; lache(1); }
      if (o.balance !== false) { el.style.transformOrigin = '50% 100%'; el.style.rotate = (Math.sin(t * 1.3) * (0.4 + Math.abs(v) / 300) + v / 120).toFixed(2) + 'deg'; }
      requestAnimationFrame(boucle);
    }
    requestAnimationFrame(boucle);
    return {
      secouer: function (n) { lache(n || 10); el.animate([{ rotate: '0deg' }, { rotate: '-3deg' }, { rotate: '2.5deg' }, { rotate: '-1.5deg' }, { rotate: '0deg' }], { duration: 650, easing: 'ease-out' }); if (self.opt.sons) self.audio.souffle(0.5, 2200, 900, 0.1); },
      arreter: function () { actif = false; el.style.rotate = ''; }
    };
  };

  /* --- étincelles et braises --- */
  SYSTEMES.etincelles = [
    { nb: 22, vie: [0.35, 0.8], vitesse: [420, 980], taille: [1.3, 2.3], sprite: 'trait', etirement: 0.014, etirementMax: 5, melange: 'add', couleur: 'palette', couleurVie: ['#FFFFFF', 'base', 'base'], frein: 3.2, gravite: 620, aLaMort: 'crepitement', proba: 0.15 },
    { nb: 1, fixe: true, vie: 0.12, taille: 18, tailleVie: [0.4, 1.3], alphaVie: [0.9, 0], sprite: 'doux', melange: 'add', couleur: '#FFFFFF' }
  ];
  SYSTEMES.crepitement = [
    { nb: 4, fixe: true, vie: [0.08, 0.2], vitesse: [60, 160], taille: [1.5, 3], sprite: 'doux', melange: 'add', couleur: '#FFFFFF', scintille: true },
    { nb: 3, fixe: true, vie: [0.1, 0.2], vitesse: [120, 260], taille: [0.8, 1.3], sprite: 'trait', etirement: 0.012, etirementMax: 3, melange: 'add', heriteCouleur: true, frein: 4 }
  ];
  SYSTEMES.etincellesChaudes = [
    { nb: 30, vie: [0.6, 1.3], vitesse: [300, 900], cone: [-90, 150], taille: [1.2, 2.2], sprite: 'trait', etirement: 0.016, etirementMax: 6, melange: 'add', couleur: '#FFFFFF', couleurVie: ETINCELLE_VIE, gravite: 900, frein: 0.9, sol: { rebond: 0.4, friction: 0.55, sous: 'rebondEtincelle' } },
    { nb: 1, fixe: true, vie: 0.15, taille: 26, tailleVie: [0.4, 1.4], alphaVie: [1, 0], sprite: 'doux', melange: 'add', couleur: '#FFD27A' }
  ];
  SYSTEMES.rebondEtincelle = [{ nb: 2, fixe: true, vie: [0.15, 0.35], vitesse: [80, 260], cone: [-90, 140], taille: [0.8, 1.4], sprite: 'trait', etirement: 0.014, etirementMax: 3, melange: 'add', heriteCouleur: true, gravite: 800 }];
  SYSTEMES.braises = [
    { nb: 18, vie: [1.2, 2.2], zone: 'cercle', rayon: 22, vitesse: [60, 240], cone: [-90, 70], taille: [2.4, 4.6], sprite: 'braise', couleur: '#FFF1A8', couleurVie: BRAISE_VIE, gravite: -150, frein: 1.1, curl: { force: 480, freq: 0.014, vitesse: 0.8 }, vent: 0.7, alphaVie: [0, 1, 1, 0] },
    { nb: 10, vie: [0.8, 1.5], zone: 'cercle', rayon: 18, vitesse: [60, 220], cone: [-90, 70], taille: [1.2, 2.4], tailleVie: [1, 0.3], sprite: 'doux', melange: 'add', couleur: '#FFB000', couleurVie: FEU_CORPS_NOIR, gravite: -170, frein: 1.2, curl: { force: 520, freq: 0.014, vitesse: 0.8 }, scintille: true }
  ];
  AMBIANCES.braises = [{ debit: 8, vie: [3, 5], zone: 'ecran-bas', vitesse: [30, 80], cone: [-90, 30], taille: [2, 3.8], sprite: 'braise', couleur: '#FFF1A8', couleurVie: BRAISE_VIE, gravite: -40, curl: { force: 120, freq: 0.006, vitesse: 0.3 }, vent: 0.6, alphaVie: [0, 1, 1, 0] }];
  SYSTEMES.etincellesFoudre = [
    { nb: 34, vie: [0.4, 1], vitesse: [300, 950], cone: [-90, 170], taille: [1.2, 2.2], sprite: 'trait', etirement: 0.016, etirementMax: 6, melange: 'add', couleur: '#FFFFFF', couleurVie: ['#FFFFFF', '#CFE0FF', '#FFD27A', '#FF6A00'], gravite: 900, frein: 0.8, sol: { rebond: 0.35, friction: 0.5, sous: 'rebondEtincelle' } },
    { nb: 14, vie: [0.8, 1.4], vitesse: [200, 600], cone: [-90, 120], taille: [1.4, 3], sprite: 'rect', couleur: ['#3b2f28', '#5c4a3d', '#7a6a5a'], gravite: 1300, frein: 0.6, rotVitesse: [-720, 720], sol: { rebond: 0.3, friction: 0.5 }, alphaVie: [1, 1, 1, 0] },
    { nb: 10, vie: [1.2, 2.4], zone: 'cercle', rayon: 10, vitesse: [40, 180], cone: [-90, 80], taille: [2.4, 4], sprite: 'braise', couleur: '#FFF1A8', couleurVie: BRAISE_VIE, gravite: -90, frein: 1.2, curl: { force: 300, freq: 0.02 }, alphaVie: [0, 1, 1, 0] }
  ];
  [['bullesSavon', 'Bulles de savon (film qui tourne)'], ['bullesEau', 'Bulles sous l\'eau'], ['feuillesBadamier', 'Feuilles de badamier'], ['tourbillonFeuilles', 'Tourbillon de feuilles'], ['etincellesChaudes', 'Étincelles chaudes qui rebondissent']].forEach(function (p) {
    NOMS_EFFETS[p[0]] = p[1]; EFFETS[p[0]] = { nom: p[1], f: function (m, x, y, k, o) { m.systeme(p[0], x, y, k, o); } };
  });

  Directeur.prototype.gerbeEtincelles = function (x, y, o) {
    o = o || {}; var self = this, m = this.particules, D = o.duree || 1200, t0 = maintenant(), actif = true, a = Math.round((o.angle == null ? -60 : o.angle) / 10) * 10;
    var di = m.def('gerbe-et:' + a, { nb: 1, vie: [0.5, 1.1], vitesse: [450, 1100], cone: [a, 34], taille: [1, 2], sprite: 'trait', etirement: 0.018, etirementMax: 7, melange: 'add', couleur: '#FFFFFF', couleurVie: ETINCELLE_VIE, gravite: 900, frein: 0.7, sol: { rebond: 0.35, friction: 0.55, sous: 'rebondEtincelle' } });
    var lu = m.def('gerbe-et:lueur', { nb: 1, fixe: true, vie: 0.08, taille: [14, 22], alphaVie: [0.8, 0], sprite: 'doux', melange: 'add', couleur: '#FFD27A' });
    (function jet() { if (!actif) return; m.emettre(di, x, y, 0.7, {}, Math.round(hasard(3, 6) * (o.force || 1))); if (Math.random() < 0.6) m.emettre(lu, x, y, 0.5, {}, 1); if (maintenant() - t0 < D) requestAnimationFrame(jet); })();
    if (this.opt.sons) { this.audio.souffle(D / 1000, 3400, 2800, 0.07); this.audio.souffle(D / 1000, 7000, 6000, 0.03); }
    return { arreter: function () { actif = false; } };
  };

  /* --- foudre : impact, brûlure en figure de Lichtenberg, reflet sur sol mouillé, arcs sur l'eau --- */
  function figureLichtenberg(k) {
    var segs = [];
    function br(x, z, a, l, w, p) {
      var n = 3 + (Math.random() * 4 | 0), st = l / n;
      for (var i = 0; i < n; i++) {
        a += hasard(-0.55, 0.55); var nx = x + Math.cos(a) * st, nz = z + Math.sin(a) * st; segs.push([x, z, nx, nz, w]);
        if (p < 3 && Math.random() < 0.42) br(nx, nz, a + hasard(0.5, 1.1) * (Math.random() < 0.5 ? -1 : 1), l * hasard(0.35, 0.6), w * 0.6, p + 1);
        x = nx; z = nz; w *= 0.86;
      }
    }
    var nb = 5 + (Math.random() * 4 | 0);
    for (var j = 0; j < nb; j++) br(0, 0, j / nb * 6.283 + hasard(-0.3, 0.3), hasard(70, 140) * k, 2.4, 0);
    return segs;
  }
  function rendFigure(segs, k) {
    var R = 165 * k + 20, W = Math.ceil(R * 2), Hh = Math.ceil(R * 2 * 0.34) + 24, cx = W / 2, cy = Hh / 2, out = { W: W, H: Hh };
    [['blanc', [[6, 0.16, '#9fb8ff'], [2.4, 0.6, '#dfe8ff'], [1, 1, '#ffffff']]], ['orange', [[4.5, 0.25, '#ff5a00'], [1.8, 0.85, '#ffb000']]], ['suie', [[4, 0.3, '#1a120d'], [1.6, 0.85, '#120c08']]]].forEach(function (pp) {
      var c = document.createElement('canvas'); c.width = W; c.height = Hh; var g = c.getContext('2d'); g.lineCap = 'round';
      if (pp[0] === 'suie') { var rg = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.32); rg.addColorStop(0, 'rgba(18,12,8,.75)'); rg.addColorStop(1, 'rgba(18,12,8,0)'); g.fillStyle = rg; g.save(); g.translate(cx, cy); g.scale(1, 0.34); g.translate(-cx, -cy); g.beginPath(); g.arc(cx, cy, R * 0.32, 0, 6.3); g.fill(); g.restore(); }
      pp[1].forEach(function (p) { g.strokeStyle = p[2]; g.globalAlpha = p[1]; segs.forEach(function (s) { g.lineWidth = Math.max(0.6, p[0] * s[4] / 2.4); g.beginPath(); g.moveTo(cx + s[0], cy + s[1] * 0.34); g.lineTo(cx + s[2], cy + s[3] * 0.34); g.stroke(); }); });
      out[pp[0]] = c;
    });
    return out;
  }
  function visibleEclair(age, e) { return age < 70 || (age > 110 && age < 170) || (e.triple && age > 230 && age < 280) || age > 280; }
  function dessineImpacts(C, ctx, now) {
    var L = C.L, H = C.H;
    // reflet de l'éclair sur le sol mouillé (miroir écrasé et ondulé) + traînée de lumière verticale
    C.eclairs.forEach(function (e) {
      if (!e.mouille || !e.sol) return; var age = now - e.t0; if (!visibleEclair(age, e)) return; var fade = age > 280 ? (1 - (age - 280) / 140) * 0.5 : 1;
      ctx.save(); ctx.beginPath(); ctx.rect(0, e.sol, L, H - e.sol); ctx.clip(); ctx.translate(0, e.sol); ctx.scale(1, -0.42); ctx.translate(0, -e.sol);
      ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      [[7, 0.1, '#9fb8ff'], [2.4, 0.32, '#e8eeff']].forEach(function (p) {
        ctx.strokeStyle = p[2]; ctx.globalAlpha = p[1] * fade;
        e.segs.forEach(function (sg, i) { var w = Math.sin(sg[1] * 0.08 + now * 0.01) * 3; ctx.lineWidth = p[0] * sg[4]; ctx.beginPath(); ctx.moveTo(sg[0] + w, sg[1]); ctx.lineTo(sg[2] + w, sg[3]); ctx.stroke(); });
      });
      ctx.restore();
      var lg = ctx.createLinearGradient(0, e.sol, 0, Math.min(H, e.sol + 170)); lg.addColorStop(0, 'rgba(225,235,255,' + (0.55 * fade).toFixed(3) + ')'); lg.addColorStop(1, 'rgba(225,235,255,0)');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lg; ctx.fillRect(e.x - 7, e.sol, 14, 170); ctx.globalAlpha = 0.5; ctx.fillRect(e.x - 22, e.sol, 44, 90); ctx.globalAlpha = 1;
    });
    // l'éclair illumine le sol mouillé : bande de lumière froide qui brille sur les flaques
    if (C.flash > 0.02 && C.mouille) {
      var y = C.solY || H * 0.85, g = ctx.createLinearGradient(0, y - 6, 0, H); g.addColorStop(0, 'rgba(200,215,255,0)'); g.addColorStop(0.1, 'rgba(200,215,255,' + (0.3 * C.flash).toFixed(3) + ')'); g.addColorStop(1, 'rgba(200,215,255,' + (0.08 * C.flash).toFixed(3) + ')');
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, y - 6, L, H - y + 6);
      for (var f = 0; f < 6; f++) { var fx2 = (f * 0.173 + 0.07) % 1 * L, rg = ctx.createRadialGradient(fx2, y + 14 + f * 4, 0, fx2, y + 14 + f * 4, 60 + f * 8); rg.addColorStop(0, 'rgba(230,238,255,' + (0.25 * C.flash).toFixed(3) + ')'); rg.addColorStop(1, 'rgba(230,238,255,0)'); ctx.fillStyle = rg; ctx.save(); ctx.translate(fx2, y + 14 + f * 4); ctx.scale(1, 0.18); ctx.translate(-fx2, -(y + 14 + f * 4)); ctx.fillRect(fx2 - 80, y - 60, 160, 160); ctx.restore(); }
    }
    ctx.globalCompositeOperation = 'source-over';
    C.impacts = C.impacts.filter(function (im) {
      var age = (now - im.t0) / 1000; if (age > 9.5) return false;
      ctx.globalCompositeOperation = 'lighter';
      // flaque de lumière autour de l'impact puis cœur aveuglant
      if (age < 0.7) { var k = Math.pow(1 - age / 0.7, 2), R = 230 * im.k, pg = ctx.createRadialGradient(im.x, im.y, 0, im.x, im.y, R); pg.addColorStop(0, 'rgba(215,228,255,' + (0.75 * k).toFixed(3) + ')'); pg.addColorStop(0.35, 'rgba(170,190,255,' + (0.3 * k).toFixed(3) + ')'); pg.addColorStop(1, 'rgba(170,190,255,0)');
        ctx.fillStyle = pg; ctx.save(); ctx.translate(im.x, im.y); ctx.scale(1, im.type === 'objet' ? 1 : 0.38); ctx.translate(-im.x, -im.y); ctx.fillRect(im.x - R, im.y - R, R * 2, R * 2); ctx.restore(); }
      if (age < 0.18) { var cg = ctx.createRadialGradient(im.x, im.y, 0, im.x, im.y, 46); cg.addColorStop(0, 'rgba(255,255,255,' + (1 - age / 0.18).toFixed(3) + ')'); cg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = cg; ctx.fillRect(im.x - 46, im.y - 46, 92, 92); }
      if (im.fig) {
        var F = im.fig, x0 = im.x - F.W / 2, y0 = im.y - F.H / 2;
        var aS = Math.min(1, age / 0.8) * (age > 5 ? Math.max(0, 1 - (age - 5) / 4.5) : 1);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = aS * 0.85; ctx.drawImage(F.suie, x0, y0);
        ctx.globalCompositeOperation = 'lighter';
        var aO = age < 0.15 ? age / 0.15 : Math.max(0, 1 - (age - 0.15) / 2.6); if (aO > 0.01) { ctx.globalAlpha = aO * (0.75 + 0.25 * Math.sin(age * 30)); ctx.drawImage(F.orange, x0, y0); }
        var aB = age < 0.4 ? 1 : Math.max(0, 1 - (age - 0.4) / 0.35); if (aB > 0.01) { ctx.globalAlpha = aB; ctx.drawImage(F.blanc, x0, y0); }
        ctx.globalAlpha = 1;
      }
      if (im.type === 'eau' && age < 0.6) { // arcs électriques qui courent sur l'eau
        ctx.lineCap = 'round'; ctx.strokeStyle = '#d8e6ff';
        for (var a = 0; a < 5; a++) { var dir = a % 2 ? 1 : -1, l = (60 + a * 30) * im.k * Math.min(1, age * 6), px = im.x, py = im.y; ctx.globalAlpha = (1 - age / 0.6) * (0.5 + Math.random() * 0.5); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px, py);
          for (var s = 1; s <= 7; s++) { px = im.x + dir * l * s / 7; py = im.y + hasard(-5, 5) + (a - 2) * s * 1.6; ctx.lineTo(px, py); } ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over'; return true;
    });
  }
  Directeur.prototype.solMouille = function (v) { this._solMouille = v !== false; return this; };
  Directeur.prototype.eclair = function (o) {
    o = o || {}; var self = this, C = this._cielInit(), L = C.L, H = C.H, m = this.particules;
    var proche = o.proche != null ? o.proche : (o.x != null || o.cible ? true : Math.random() < 0.4);
    var x = o.x != null ? o.x : L * hasard(0.15, 0.85), sol = this.zoneSure().y2, y1 = o.y != null ? o.y : (proche ? sol : H * hasard(0.22, 0.38)), y0 = H * hasard(0.03, 0.12), segs = [];
    if (o.cible) { var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = o.cible.getBoundingClientRect(); x = r.left - b.left + r.width / 2; y1 = r.top - b.top + Math.min(6, r.height * 0.1); }
    segmentsEclair(x + hasard(-60, 60), y0, x, y1, (y1 - y0) * 0.22, proche ? 1.3 : 0.8, segs, 0);
    C.impacts = C.impacts || [];
    var mouille = o.mouille != null ? !!o.mouille : !!(this._solMouille || (C.cfg && C.cfg.rideaux));
    C.mouille = mouille; C.solY = sol;
    C.eclairs.push({ segs: segs, t0: maintenant(), triple: Math.random() < 0.5, sol: proche && !o.cible ? y1 : 0, mouille: mouille, x: x });
    C.flash = proche ? 1 : 0.6; C.fx = x; C.reveille();
    this.flash('#E8F0FF', proche ? 0.5 : 0.22); setTimeout(function () { self.flash('#FFFFFF', proche ? 0.3 : 0.12); C.flash = Math.max(C.flash, 0.7); }, 120);
    if (proche) {
      var lu = this.lum, av = { angle: lu.angle, hauteur: lu.hauteur, force: lu.force, teinte: lu.teinte }, ang = Math.atan2(H / 2 - y0, x - L / 2) * 180 / Math.PI;
      this.lumiere({ angle: ang, hauteur: 0.55, force: 0.6, teinte: '#0a1230' }); setTimeout(function () { self.lumiere(av); }, 300);
      var surf = o.surface || (o.cible ? 'objet' : 'sol'), k = o.taille || 1;
      C.impacts = C.impacts || [];
      C.impacts.push({ x: x, y: y1, t0: maintenant(), type: surf, k: k, fig: surf === 'sol' ? rendFigure(figureLichtenberg(k), k) : null });
      if (surf === 'eau') {
        if (this.eclabousser) this.eclabousser(x, y1, { type: 'eau', force: 1.2, sol: 40 });
        for (var v = 0; v < 3; v++) setTimeout(function () { m.systeme('fumee', x + hasard(-30, 30), y1 - 4, 0.7, { couleurs: ['#FFFFFF'] }); }, v * 140);
        m.systeme('etincellesFoudre', x, y1, 0.6, {});
      } else {
        m.systeme('etincellesFoudre', x, y1, 1, {}); m.systeme('fumee', x, y1 - 6, 0.7, {});
        if (SYSTEMES.fumeeNoire) setTimeout(function () { m.systeme('fumeeNoire', x, y1 - 8, 0.45, {}); }, 250);
      }
      if (this.opt.secousses) this.secousse(0.4); this.vibre('erreur');
    }
    this.tonnerre(proche);
    return this;
  };
  Directeur.prototype.foudroyer = function (el, o) {
    o = o || {}; var self = this, m = this.particules; if (!el) return Promise.resolve();
    this.eclair({ cible: el, proche: true, mouille: o.mouille });
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top;
    var fin = o.noircir === false ? 'none' : 'sepia(.7) brightness(.55) contrast(1.35)';
    el.animate([{ filter: 'none', translate: '0 0' }, { filter: 'brightness(3) saturate(0)', translate: '-3px 1px', offset: 0.06 }, { filter: 'brightness(.4) saturate(0)', translate: '3px -1px', offset: 0.14 }, { filter: 'brightness(2.2) saturate(.3)', translate: '-2px 0', offset: 0.22 }, { filter: fin, translate: '0 0' }], { duration: 900, fill: 'forwards' });
    var t0 = maintenant();
    (function arcs() { // petites étincelles électriques qui courent sur les bords
      var bord = Math.random() * 4 | 0, px = x0 + (bord === 1 ? r.width : bord === 3 ? 0 : Math.random() * r.width), py = y0 + (bord === 2 ? r.height : bord === 0 ? 0 : Math.random() * r.height);
      m.systeme('crepitement', px, py, 0.6, { couleurs: ['#CFE0FF'] });
      if (maintenant() - t0 < 420) setTimeout(arcs, 30);
    })();
    for (var i = 0; i < 6; i++) setTimeout(function () { m.systeme('fumee', x0 + r.width * hasard(0.2, 0.8), y0 + r.height * 0.2, 0.5, {}); }, 300 + i * 220);
    return new Promise(function (ok) { setTimeout(ok, 950); });
  };

  /* --- feu : flammes calculées dans un shader --- */
  var VS_FEU = '#version 300 es\nlayout(location=0) in vec2 coin;uniform vec4 rect;uniform vec2 res;uniform vec2 base;out vec2 d;out vec2 qc;' +
    'void main(){vec2 p=mix(rect.xy,rect.zw,coin*0.5+0.5);d=vec2(p.x-base.x,base.y-p.y);qc=coin;vec2 cl=p/res*2.0-1.0;gl_Position=vec4(cl.x,-cl.y,0.0,1.0);}';
  var FS_FEU = '#version 300 es\nprecision highp float;in vec2 d;in vec2 qc;uniform float W;uniform float HF;uniform float k;uniform float kb;uniform float t;uniform float seed;uniform float typ;uniform float lean;uniform float mag;uniform vec3 teinte;out vec4 o;' +
    'float sq(float x){return x*x;}float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hs(i),hs(i+vec2(1.0,0.0)),f.x),mix(hs(i+vec2(0.0,1.0)),hs(i+vec2(1.0,1.0)),f.x),f.y);}' +
    'float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<3;i++){s+=a*vn(p);p=p*2.07+vec2(1.7,9.2);a*=0.5;}return s/0.875;}' +
    'vec3 rampe(float T){vec3 c=mix(vec3(0.0),vec3(0.55,0.04,0.0),smoothstep(0.06,0.24,T));c=mix(c,vec3(1.0,0.3,0.02),smoothstep(0.2,0.45,T));c=mix(c,vec3(1.0,0.66,0.12),smoothstep(0.42,0.68,T));return mix(c,vec3(1.0,0.94,0.72),smoothstep(0.66,0.95,T));}' +
    'float flamme(float u,float v,float h,float w,float n1,float n2,float tb){float vv=v/h;if(vv<-0.25||vv>1.7)return 0.0;' +
    'float x=u-lean*vv*vv*0.9+(n1-0.5)*tb*clamp(vv,0.0,1.4)*1.15;float wid=w*pow(max(1.0-vv*0.92,0.0),0.62)*sqrt(clamp((vv+0.18)/0.32,0.0,1.0));' +
    'if(wid<0.002)return 0.0;float body=smoothstep(wid,wid*0.12,abs(x));float top=smoothstep(0.0,0.45,(1.0-vv)*1.05+(n2-0.5)*tb*1.3+0.12);return body*top*(0.72+0.55*n2);}' +
    'vec2 voro(vec2 p){vec2 i=floor(p),f=fract(p);float d1=8.0,d2=8.0;vec2 id=vec2(0.0);for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 oo=vec2(hs(i+g),hs(i+g+19.1));float dd=length(g+oo-f);if(dd<d1){d2=d1;d1=dd;id=i+g;}else if(dd<d2)d2=dd;}return vec2(d2-d1,hs(id+3.3));}' +
    'float segd(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}' +
    'void main(){float u=d.x/W,v=d.y/HF,vi=d.y/W;vec3 bc=vec3(0.0);float ba=0.0;float fl=0.85+0.15*sin(t*13.0+seed)*sin(t*7.3+seed*2.0);' +
    // lit de braises (bois, brasier, braises)
    'if(typ<0.5||typ>2.5){float e=sq(u/0.98)+sq((vi+0.05)/0.18);e+=(vn(vec2(u*5.0,vi*9.0)+seed)-0.5)*0.35;if(e<1.0){vec2 vr=voro(vec2(u*5.5,vi*9.0)+seed*3.0);float hh=vr.y;' +
    'float pul=0.55+0.45*sin(t*(1.2+hh*2.2)+hh*31.0);float chaud=kb*hh*pul;vec3 croute=mix(vec3(0.11,0.055,0.035),vec3(0.36,0.34,0.32),smoothstep(0.3,0.0,hh)*(1.0-kb*0.4));' +
    'float fis=smoothstep(0.16,0.0,vr.x);bc=croute*(0.7+0.5*hh)+rampe(0.35+0.45*chaud)*(fis*kb*(0.5+0.7*pul)+chaud*0.55);ba=smoothstep(1.0,0.8,e);}}' +
    // bûches croisées (bois)
    'if(typ<0.5){vec2 P=vec2(u,vi);float l1=segd(P,vec2(-0.85,0.02),vec2(0.8,0.2))-0.13;float l2=segd(P,vec2(-0.8,0.22),vec2(0.85,0.0))-0.12;float lg=min(l1,l2);if(lg<0.0){float gr=vn(vec2(dot(P,vec2(0.98,0.2))*14.0,dot(P,vec2(-0.2,0.98))*3.0)+seed);' +
    'float cr=pow(1.0-abs(vn(P*9.0+seed*5.0)*2.0-1.0),4.0);float pul2=0.6+0.4*sin(t*2.3+P.x*6.0);vec3 bois=vec3(0.17,0.095,0.055)*(0.75+0.45*gr)*(0.7+0.6*smoothstep(-0.13,0.0,-lg-0.06));' +
    'vec3 lc=bois+rampe(0.5+0.3*pul2)*cr*kb*0.9+rampe(0.4)*smoothstep(-0.05,0.0,lg)*kb*0.5;float la=smoothstep(0.0,-0.02,lg);bc=mix(bc,lc,la);ba=max(ba,la);}}' +
    // mèche de bougie
    'if(typ>0.5&&typ<1.5){float wk=smoothstep(0.09,0.04,abs(u+0.04*vi))*step(-0.35,vi)*step(vi,0.42);vec3 wc=mix(vec3(0.08,0.06,0.05),vec3(1.0,0.45,0.1),smoothstep(0.25,0.42,vi)*kb);bc=mix(bc,wc,wk);ba=max(ba,wk);}' +
    // flammes
    'float F=0.0,tb=typ>0.5&&typ<1.5?0.22:(typ>1.5&&typ<2.5?1.15:0.95);float bou=typ>0.5&&typ<1.5?0.45:1.0;float tt=t*bou;' +
    'float n1=0.5,n2=0.5;if(abs(u)<1.5&&v>-0.3&&v<1.75){n1=fbm(vec2(u*1.5+seed*7.0,v*1.3-tt*1.45));n2=fbm(vec2(u*3.1-seed*3.0,v*2.5-tt*2.55));' +
    'if(typ>0.5&&typ<1.5){F=flamme(u,v-0.03,1.0,0.6,n1,n2,tb);}' +
    'else if(typ>1.5&&typ<2.5){F=max(flamme(u+0.08,v,1.0,0.95,n1,n2,tb),flamme(u-0.2,v,0.72,0.65,n2,n1,tb));}' +
    'else if(typ>3.5){F=max(flamme(u+0.3,v,0.6,0.25,n1,n2,0.8),flamme(u-0.35,v,0.45,0.22,n2,n1,0.8))*0.8;}' +
    'else{float a1=flamme(u-0.03,v,1.0,0.72,n1,n2,tb),a2=flamme(u+0.36,v,0.74,0.52,n2,n1,tb),a3=flamme(u-0.4,v,0.8,0.54,1.0-n1,n2,tb);F=1.0-(1.0-a1)*(1.0-a2)*(1.0-a3);' +
    'if(typ>2.5){float a4=flamme(u-0.72,v,0.55,0.42,1.0-n2,n1,tb);F=1.0-(1.0-F)*(1.0-a4);}}}' +
    'float T=F*(0.98-0.5*clamp(v,0.0,1.0))*k;vec3 fc=rampe(T);' +
    'if(typ>0.5&&typ<1.5){float bl=exp(-sq((v-0.06)/0.09))*smoothstep(0.42,0.1,abs(u))*k;fc=mix(fc,vec3(0.25,0.45,1.0),bl*0.75);T=max(T,bl*0.5);}' +
    'else{float bl=exp(-sq((v-0.03)/0.06))*F*k*0.5;fc=mix(fc,vec3(0.35,0.5,1.0),bl*0.4);}' +
    'if(mag>0.5){float lm=dot(fc,vec3(0.3,0.55,0.15));fc=mix(teinte*lm*1.7,vec3(1.0),smoothstep(0.72,1.0,T));}' +
    'float A=smoothstep(0.06,0.5,T);float win=smoothstep(1.0,0.55,abs(qc.x))*smoothstep(1.0,0.6,abs(qc.y));vec3 hc=mag>0.5?teinte:vec3(1.0,0.52,0.14);' +
    'float halo=exp(-(u*u*0.5+sq(v-0.3)*2.6))*0.26*k*fl*win;float sol=exp(-u*u*0.45)*exp(-sq((vi+0.02)/0.32))*0.22*max(k,kb*0.6)*fl*win;' +
    'vec3 rgb=bc*ba*(1.0-A)+fc*A+hc*(halo+sol)*(1.0-A);float al=ba*(1.0-A)+A*0.88;o=vec4(rgb,al);}';

  var TYPES_FEU = {
    bois: { id: 0, h: 110, w: 50, ux: 1.9, braises: 6, fumee: 2.2, crepite: 0.9 },
    bougie: { id: 1, h: 34, w: 8, ux: 4.5, braises: 0, fumee: 0, crepite: 0 },
    torche: { id: 2, h: 120, w: 26, ux: 2.6, braises: 4, fumee: 1.6, crepite: 0.4 },
    brasier: { id: 3, h: 170, w: 95, ux: 1.7, braises: 14, fumee: 4, crepite: 1.6 },
    braises: { id: 4, h: 34, w: 60, ux: 1.6, braises: 2, fumee: 0.3, crepite: 0.3 }
  };
  Directeur.prototype._foyerInit = function () {
    if (this._foyer) return this._foyer; var self = this, m = this.particules;
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(c);
    var F = { c: c, feux: [], raf: 0, der: 0, t: 0, gl: null, ctx: null };
    try {
      var gl = c.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
      if (gl) {
        var p = gl.createProgram();
        [[gl.VERTEX_SHADER, VS_FEU], [gl.FRAGMENT_SHADER, FS_FEU]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
        gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        var vao = gl.createVertexArray(); gl.bindVertexArray(vao); var q = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, q); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        var U = {}; ['rect', 'res', 'base', 'W', 'HF', 'k', 'kb', 't', 'seed', 'typ', 'lean', 'mag', 'teinte'].forEach(function (n) { U[n] = gl.getUniformLocation(p, n); });
        F.gl = gl; F.p = p; F.vao = vao; F.U = U;
      }
    } catch (e) { F.gl = null; if (global.console) console.warn('KwFX feu : repli Canvas 2D', e); }
    if (!F.gl) F.ctx = c.getContext('2d');
    function taille() { var t = self.taille(), s = Math.max(1, Math.min(2, global.devicePixelRatio || 1) * 0.6); F.L = t.l; F.H = t.h; F.s = s; c.width = Math.max(1, Math.round(t.l * s)); c.height = Math.max(1, Math.round(t.h * s)); }
    taille(); global.addEventListener('resize', taille); F.taille = taille;
    var dCrep = m.def('feu:crepite', { nb: 1, vie: [0.4, 0.9], vitesse: [150, 400], cone: [-90, 70], taille: [1.1, 1.9], sprite: 'trait', etirement: 0.013, etirementMax: 4, melange: 'add', couleur: '#FFF1A8', couleurVie: ETINCELLE_VIE, gravite: 520, frein: 1, sol: { decalage: 4, rebond: 0.3, friction: 0.5 } });
    var dBraise = m.def('feu:braise', { nb: 1, vie: [1.4, 2.8], vitesse: [40, 130], cone: [-90, 50], taille: [2.2, 4], sprite: 'braise', couleur: '#FFF1A8', couleurVie: BRAISE_VIE, gravite: -110, frein: 0.9, curl: { force: 260, freq: 0.02, vitesse: 1 }, vent: 0.8, alphaVie: [0, 1, 1, 0] });
    var dFumee = m.def('feu:fumee', { nb: 1, vie: [2.2, 3.4], vitesse: [30, 70], cone: [-90, 20], taille: [10, 16], tailleVie: [0.5, 1.6, 2.8], alphaVie: [0, 0.3, 0.16, 0], sprite: 'volute', couleur: '#5d5550', couleurVie: ['#4a4440', '#7a726c', '#a09890'], gravite: -60, frein: 0.6, curl: { force: 120, freq: 0.01 }, vent: 1, ventPrise: 0.8 });
    var dVapeur = m.def('feu:vapeur', { nb: 1, vie: [1.2, 2], vitesse: [50, 120], cone: [-90, 40], taille: [10, 18], tailleVie: [0.5, 2.2], alphaVie: [0, 0.5, 0], sprite: 'volute', couleur: '#F4F4F4', gravite: -80, frein: 0.8, curl: { force: 160, freq: 0.012 } });
    F.dVapeur = dVapeur;
    function crepiter(f) {
      m.emettre(dCrep, f.x + hasard(-0.4, 0.4) * f.w, f.y - f.hf * 0.25, 0.6, { taille: Math.min(1.4, f.e) }, Math.round(hasard(2, 6)));
      var a = self.opt.sons && f.son && self.audio.pret(); if (!a) return;
      var vol = self.opt.volume * self.pub.son * 0.6 * Math.min(1, f.k + 0.2), t0 = a.currentTime;
      for (var i = 0, n = 1 + (Math.random() * 3 | 0); i < n; i++) {
        var len = Math.round(a.sampleRate * hasard(0.004, 0.018)), b = a.createBuffer(1, len, a.sampleRate), dd = b.getChannelData(0);
        for (var j = 0; j < len; j++) dd[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / len, 2);
        var s = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; bp.type = 'bandpass'; bp.frequency.value = hasard(1400, 4800); bp.Q.value = 1.4; g.gain.value = hasard(0.12, 0.4) * vol;
        s.connect(bp); bp.connect(g); g.connect(a.destination); s.start(t0 + i * hasard(0.01, 0.05));
      }
    }
    F.crepiter = crepiter;
    function boucle(ts) {
      var dt = F.der ? Math.min(0.05, (ts - F.der) / 1000) : 0.016; F.der = ts; if (self.enPause) dt = 0; F.t += dt;
      var L = F.L, H = F.H, ventL = borne(m.vent / 520, -1, 1);
      F.feux = F.feux.filter(function (f) {
        f.k += (f.kc - f.k) * Math.min(1, dt * (f.kc < f.k ? 1.6 : 2.2)); f.kb += (f.kbc - f.kb) * Math.min(1, dt * (f.kbc < f.kb ? 0.35 : 1.5)); f.boost = Math.max(0, f.boost - dt * 0.9);
        f.lean += ((f.T.id === 1 ? ventL * 0.5 : ventL) * 0.9 + Math.sin(F.t * 1.7 + f.seed) * 0.05 - f.lean) * Math.min(1, dt * 3);
        f.hf = f.h * (0.35 + 0.65 * f.k) * (1 + 0.45 * f.boost);
        if (f.meurt && f.k < 0.02 && f.kb < 0.03) { if (f.lum) f.lum.eteindre(); if (f.bruit) try { f.bruit.stop(); } catch (e) {} if (f.fini) f.fini(); return false; }
        if (f.lum) { f.lum.deplacer(f.x, f.y - f.hf * 0.4); if (f.meurt && f.k < 0.1 && f.kb < 0.35) { f.lum.eteindre(); f.lum = null; } }
        if (f.bruit) f.bruit.g.gain.value = f.bruit.v * f.k * (1 + f.boost);
        var q = m.qualite * dt, T = f.T, kk = f.k * (1 + f.boost * 2);
        f.acB += T.braises * kk * q * (f.opt.braises === false ? 0 : 1); while (f.acB >= 1) { f.acB--; m.emettre(dBraise, f.x + hasard(-0.5, 0.5) * f.w, f.y - f.hf * hasard(0.05, 0.45), 0.5, { taille: Math.min(1.5, f.e) }, 1); }
        f.acF += T.fumee * Math.max(f.k, f.kb * 0.25) * q * (f.opt.fumee === false ? 0 : 1); while (f.acF >= 1) { f.acF--; m.emettre(dFumee, f.x + hasard(-0.3, 0.3) * f.w, f.y - f.hf * 0.95, 0.5, { taille: f.e }, 1); }
        f.acC += T.crepite * kk * dt * (1 + 1.5 * f.boost); while (f.acC >= 1) { f.acC--; crepiter(f); }
        return true;
      });
      if (F.gl) {
        var gl = F.gl, U = F.U; gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(F.p); gl.bindVertexArray(F.vao); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.uniform2f(U.res, L, H); gl.uniform1f(U.t, F.t);
        F.feux.forEach(function (f) {
          var w = f.w, top = f.y - Math.max(f.hf * 1.55, w * 0.6), bot = f.y + Math.max(w * 0.45, 10);
          gl.uniform4f(U.rect, f.x - w * f.T.ux, top, f.x + w * f.T.ux, bot); gl.uniform2f(U.base, f.x, f.y);
          gl.uniform1f(U.W, w); gl.uniform1f(U.HF, Math.max(4, f.hf)); gl.uniform1f(U.k, f.k * (1 + 0.15 * f.boost)); gl.uniform1f(U.kb, f.kb); gl.uniform1f(U.seed, f.seed); gl.uniform1f(U.typ, f.T.id); gl.uniform1f(U.lean, f.lean);
          var tm = f.mag || [1, 0.5, 0.1]; gl.uniform1f(U.mag, f.mag ? 1 : 0); gl.uniform3f(U.teinte, tm[0], tm[1], tm[2]);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        });
      } else if (F.ctx) {
        var x = F.ctx; x.setTransform(F.s, 0, 0, F.s, 0, 0); x.clearRect(0, 0, L, H); x.globalCompositeOperation = 'lighter';
        F.feux.forEach(function (f) {
          var fl = 0.85 + 0.15 * Math.sin(F.t * 13 + f.seed), hh = f.hf * fl, cy = f.y - hh * 0.4;
          var g = x.createRadialGradient(f.x, cy, 0, f.x, cy, hh * 0.9); g.addColorStop(0, 'rgba(255,240,180,' + (0.9 * f.k) + ')'); g.addColorStop(0.35, 'rgba(255,140,20,' + (0.6 * f.k) + ')'); g.addColorStop(1, 'rgba(200,40,0,0)');
          x.fillStyle = g; x.save(); x.translate(f.x, cy); x.scale(f.w / hh * 1.3, 1); x.beginPath(); x.arc(0, 0, hh * 0.9, 0, 6.3); x.restore(); x.fill();
        });
        x.globalCompositeOperation = 'source-over';
      }
      if (F.feux.length) F.raf = requestAnimationFrame(boucle); else { F.raf = 0; F.der = 0; if (F.gl) { F.gl.clearColor(0, 0, 0, 0); F.gl.clear(F.gl.COLOR_BUFFER_BIT); } else if (F.ctx) F.ctx.clearRect(0, 0, c.width, c.height); }
    }
    F.reveille = function () { if (!F.raf) F.raf = requestAnimationFrame(boucle); };
    this._foyer = F; return F;
  };
  Directeur.prototype.feu = function (x, y, o) {
    if (x && x.getBoundingClientRect) { o = y; var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = x.getBoundingClientRect(); y = r.bottom - b.top; x = r.left - b.left + r.width / 2; }
    o = o || {}; var self = this, F = this._foyerInit(), T = TYPES_FEU[o.type] || TYPES_FEU.bois, e = o.taille || 1;
    var f = { x: x, y: y, T: T, e: e, h: T.h * e, w: T.w * e, hf: 0, k: 0, kc: o.force == null ? 1 : o.force, kb: 0, kbc: 1, boost: 0, lean: 0, seed: Math.random() * 50, acB: 0, acF: 0, acC: 0, opt: o, son: o.son !== false, mag: o.couleur ? versRgb(o.couleur).map(function (v) { return v / 255; }) : 0 };
    if (o.eclaire !== false && this.sourceLumiere) f.lum = this.sourceLumiere(x, y - f.h * 0.4, { couleur: o.couleur || (T.id === 1 ? '#FFC46B' : '#FF9A3C'), rayon: Math.max(70, f.h * (T.id === 1 ? 3.5 : 2.2)), scintille: true, force: T.id === 1 ? 0.7 : 0.9 });
    var a = this.opt.sons && f.son && T.id !== 1 && this.audio.pret();
    if (a) { // souffle grave et continu du feu
      var len = a.sampleRate * 2, buf = a.createBuffer(1, len, a.sampleRate), dd = buf.getChannelData(0), l = 0;
      for (var i = 0; i < len; i++) { l = (l + 0.03 * (Math.random() * 2 - 1)) / 1.03; dd[i] = l * 4; }
      var s = a.createBufferSource(), lp = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; s.loop = true; lp.type = 'lowpass'; lp.frequency.value = T.id === 3 ? 520 : 380; g.gain.value = 0;
      s.connect(lp); lp.connect(g); g.connect(a.destination); s.start(); f.bruit = { stop: function () { s.stop(); }, g: g, v: (T.id === 3 ? 0.16 : 0.09) * this.opt.volume * this.pub.son };
    }
    F.feux.push(f); F.reveille();
    var api = {
      attiser: function () { f.boost = 1; for (var i = 0; i < 3; i++) setTimeout(function () { F.crepiter(f); }, i * 90); self.particules.systeme('braises', f.x, f.y - f.hf * 0.3, 0.5 * f.e, {}); if (self.opt.sons && f.son) self.audio.souffle(0.7, 350, 1400, 0.12); return api; },
      eteindre: function (o2) {
        o2 = o2 || {}; f.kc = 0; f.meurt = true; if (o2.eau) { f.kbc = 0; for (var i = 0; i < 8; i++) setTimeout(function () { self.particules.emettre(F.dVapeur, f.x + hasard(-0.5, 0.5) * f.w, f.y - 10, 0.5, { taille: f.e }, 2); }, i * 80); if (self.opt.sons) self.audio.souffle(1.1, 5000, 2500, 0.14); }
        else setTimeout(function () { f.kbc = 0; }, T.id === 1 ? 0 : 1600);
        if (T.id === 1) self.particules.emettre(F.dVapeur, f.x, f.y - f.h * 0.3, 0.3, { taille: 0.4 }, 2);
        return new Promise(function (ok) { f.fini = ok; });
      },
      rallumer: function () { f.kc = 1; f.kbc = 1; f.meurt = false; if (F.feux.indexOf(f) < 0) { F.feux.push(f); F.reveille(); } return api; },
      deplacer: function (nx, ny) { f.x = nx; f.y = ny; return api; },
      force: function (v) { f.kc = v; return api; },
      supprimer: function () { f.kc = f.k = f.kb = f.kbc = 0; f.meurt = true; return api; }
    };
    return api;
  };
  Directeur.prototype.bruler = function (el, o) {
    o = o || {}; var self = this, D = o.duree || 2600; if (!el) return Promise.resolve();
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top, feux = [];
    var n = Math.max(1, Math.min(4, Math.round(r.width / 60))), e = Math.max(0.35, Math.min(1, r.width / (n * 90)));
    for (var i = 0; i < n; i++) (function (i) { setTimeout(function () { feux.push(self.feu(x0 + r.width * (i + 0.5) / n, y0 + r.height * 0.25, { type: 'torche', taille: e, eclaire: i === 0, son: i === 0 })); }, i * 180); })(i);
    el.animate([{ filter: 'none' }, { filter: 'sepia(.6) brightness(.8) contrast(1.2)', offset: 0.5 }, { filter: 'sepia(.9) brightness(.45) contrast(1.4)' }], { duration: D * 0.8, fill: 'forwards' });
    return new Promise(function (ok) {
      setTimeout(function () {
        feux.forEach(function (f) { f.eteindre(); });
        if (o.cendres !== false && self.reduireEnCendres) self.reduireEnCendres(el, { duree: 1100, fini: ok }); else ok();
      }, D);
    });
  };

  /* ======================================================================
   * 8. API PUBLIQUE
   * ==================================================================== */
  var KwFX = {
    version: '3.2', heures: Object.keys(HEURES), apparitions: Object.keys(APPARITIONS), meteos: METEOS, stylesMusique: STYLES_MUSIQUE,
    init: function (opt) { return new Directeur(opt); },
    conseiller: function (q) { return KwFX_conseiller(q); },
    nomsSons: NOMS_SONS, onomatopees: ONOMATOPEES, collection: COLLECTION, defis: DEFIS, transitions: ['vague', 'lave', 'cyclone', 'pailleenqueue'],
    themes: THEMES, effets: EFFETS, types: TYPES, publics: PUBLICS, modes: MODES, messages: MESSAGES,
    /* Bloque la propagation des touchers sur les zones interactives (règle EPUB Kwélafé) */
    proteger: function () {
      document.querySelectorAll('.zone-interactive').forEach(element => { element.addEventListener('touchend', function(event) { event.preventDefault(); event.stopPropagation(); }, { passive: false }); });
    }
  };
  global.KwFX = KwFX;
})(typeof window !== 'undefined' ? window : this);

