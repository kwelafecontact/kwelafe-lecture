/*!
 * KwFX — Directeur d'effets Kwélafé  v2.1
 * Kwélafé Production · kwelafeproduction.com
 *
 * Un « cerveau » d'effets pour les jeux Kwélafé (site Kwélafé Lecture et EPUB Apple Books).
 * Le jeu dit seulement CE QUI SE PASSE (bonne réponse, erreur, coupe, niveau, victoire...).
 * KwFX décide lui-même QUELS effets jouer, avec quelle force, quelles couleurs et quels sons,
 * en tenant compte du joueur : sa série, ses erreurs, sa vitesse, la durée de la partie.
 *
 * Utilisation minimale :
 *   <script src="kwelafe-fx.js"></script>
 *   const fx = KwFX.init({ theme: 'fruits', public: 'enfant', mode: 'trankil', support: 'web' });
 *   fx.evenement('bonne', { element: carteCliquee });
 *   fx.evenement('erreur', { x: 120, y: 300 });
 *   const d = fx.evenement('coupe', { x, y, couleur: '#F9C74F' });  // d.pepite, d.multiplicateur
 *
 * Vrais bruitages (pack ElevenLabs) : ajouter AVANT ce fichier
 *   <script src="kwelafe-fx-sons.js"></script>      (sons intégrés, marche partout, idéal EPUB)
 *   ou passer  KwFX.init({ sonsPack: 'kwfx-sons/' })  (dossier de fichiers .mp3, idéal site web)
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
  var SPRITES = { doux: 0, etoile: 1, anneau: 2, etincelle: 3, rect: 4, petale: 5, plume: 6, piece: 7, fumee: 8, bulle: 9, goutte: 10 };
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
    this.fx = fx; this.temps = 1; this.tempsCible = 1; this.qualite = 1; this.dtMoy = 16; this.fps = 60;
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
    this.inst = new Float32Array(cap * 10); this.instAdd = new Float32Array(cap * 10); this.ruban = new Float32Array(cap * TRACE * 6 * 6);
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
    var r = this.fx.taille(), dpr = Math.min(global.devicePixelRatio || 1, this.qualite < 0.6 ? 1 : (this.fx.opt.dprMax || 2));
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
      this.AGE[i] += dt;
      if (this.AGE[i] < 0) continue;
      if (this.AGE[i] >= this.VIE[i]) { morts.push(i); continue; }
      var tv = this.AGE[i] / this.VIE[i], vx = this.VX[i], vy = this.VY[i];
      // forces
      vy += d.gravite * dt;
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
    var nN = 0, nA = 0, nR = 0, I = this.inst, A = this.instAdd, RB = this.ruban;
    for (var i = 0; i < this.n; i++) {
      if (this.AGE[i] < 0) continue;
      var d = this.defs[this.EM[i]], tv = this.AGE[i] / this.VIE[i];
      var r = this.R[i], g = this.G[i], b = this.B[i];
      if (d.grad) { var cc = degrade(d.grad, tv, r, g, b); r = cc[0]; g = cc[1]; b = cc[2]; }
      var al = courbe(d.alphaVie, tv) * (d.opacite == null ? 1 : d.opacite);
      if (d.scintille) al *= 0.5 + 0.5 * Math.sin(this.AGE[i] * 22 + this.GR[i] * 40);
      if (al <= 0.004) continue;
      var taille = this.T[i] * courbe(d.tailleVie, tv), vx = this.VX[i], vy = this.VY[i];
      var rot = this.ROT[i], et = 0;
      if (d.etirement) { var sp = Math.hypot(vx, vy); et = Math.min(d.etirementMax || 6, sp * d.etirement); rot = Math.atan2(vy, vx); }
      else if (d.aligne) rot = Math.atan2(vy, vx);
      if (d.flip) et = Math.cos(this.AGE[i] * (d.flipVitesse || 9) + this.GR[i] * 6.283); // retournement 3D
      var T = d.add ? A : I, o = (d.add ? nA++ : nN++) * 10;
      T[o] = this.X[i]; T[o + 1] = this.Y[i]; T[o + 2] = taille; T[o + 3] = rot;
      T[o + 4] = r / 255; T[o + 5] = g / 255; T[o + 6] = b / 255; T[o + 7] = al; T[o + 8] = d.sp; T[o + 9] = et;
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
    this.nN = nN; this.nA = nA; this.nR = nR;
  };

  /* ======================================================================
   * 3 bis. RENDU WEBGL2 : sprites instanciés, formes calculées dans le shader, bloom
   * ==================================================================== */
  var VS_PART = '#version 300 es\nlayout(location=0) in vec2 coin;layout(location=1) in vec4 a0;layout(location=2) in vec4 a1;layout(location=3) in vec2 a2;' +
    'uniform vec2 res;out vec2 uv;out vec4 col;flat out float forme;out float flip;' +
    'void main(){float s=a0.z;vec2 sc;float f=a2.x;' +
    'if(f>3.5&&f<7.5){sc=vec2(s*max(abs(a2.y),0.12),s);flip=a2.y;}else{sc=vec2(s*(1.0+a2.y),s);flip=1.0;}' +
    'vec2 p=coin*sc;float c=cos(a0.w),si=sin(a0.w);p=vec2(p.x*c-p.y*si,p.x*si+p.y*c)+a0.xy;' +
    'vec2 cl=p/res*2.0-1.0;gl_Position=vec4(cl.x,-cl.y,0.0,1.0);uv=coin;col=a1;forme=f;}';
  var FS_PART = '#version 300 es\nprecision mediump float;in vec2 uv;in vec4 col;flat in float forme;in float flip;uniform float amul;out vec4 o;' +
    'void main(){vec2 p=uv;float r=length(p);float a=0.0;vec3 c=col.rgb;float f=forme;' +
    'if(f<0.5){a=exp(-r*r*4.0);c=mix(c,vec3(1.0),exp(-r*r*18.0)*0.7);}' +
    'else if(f<1.5){float an=atan(p.y,p.x);float rb=mix(0.42,1.0,pow(abs(cos(2.5*an)),2.2));a=smoothstep(rb,rb-0.14,r)+exp(-r*r*5.0)*0.35;c=mix(c,vec3(1.0),exp(-r*r*14.0)*0.6);}' +
    'else if(f<2.5){a=smoothstep(0.16,0.0,abs(r-0.78))+exp(-pow(r-0.78,2.0)*40.0)*0.4;}' +
    'else if(f<3.5){a=exp(-p.y*p.y*10.0)*smoothstep(1.0,0.1,abs(p.x));c=mix(c,vec3(1.0),exp(-p.y*p.y*40.0)*0.65);}' +
    'else if(f<4.5){vec2 q=abs(p);a=smoothstep(1.0,0.9,q.x)*smoothstep(0.62,0.52,q.y);c*=0.72+0.28*abs(flip);}' +
    'else if(f<5.5){float w=0.62*(1.0-p.y*0.55);a=1.0-smoothstep(0.84,1.0,length(vec2(p.x/max(w,0.05),p.y)));c*=0.8+0.2*(1.0-abs(p.x))+0.12*(-p.y);c*=0.75+0.25*abs(flip);}' +
    'else if(f<6.5){a=1.0-smoothstep(0.8,1.0,length(vec2(p.x/0.36,p.y)));c=mix(c,c*0.55,smoothstep(0.07,0.0,abs(p.x))*0.7);c*=0.88+0.12*sin(p.y*36.0+abs(p.x)*24.0);}' +
    'else if(f<7.5){a=1.0-smoothstep(0.88,1.0,r);c=c*(0.78+0.3*(1.0-r));c=mix(c,c*0.6,smoothstep(0.72,0.8,r)*0.8);c+=vec3(1.0)*exp(-dot(p-vec2(-0.35,-0.35),p-vec2(-0.35,-0.35))*9.0)*0.7;c*=0.7+0.3*abs(flip);}' +
    'else if(f<8.5){a=exp(-r*r*2.4)*(0.82+0.18*sin(p.x*4.0+p.y*5.0));}' +
    'else if(f<9.5){a=smoothstep(0.14,0.0,abs(r-0.84))*0.9+exp(-r*r*2.0)*0.12;a+=exp(-dot(p-vec2(-0.38,-0.38),p-vec2(-0.38,-0.38))*30.0);c=mix(c,vec3(1.0),0.35);}' +
    'else{a=1.0-smoothstep(0.82,1.0,r);c*=0.82+0.25*(1.0-r);c+=vec3(1.0)*exp(-dot(p-vec2(0.3,-0.35),p-vec2(0.3,-0.35))*16.0)*0.75;}' +
    'a*=col.a;o=vec4(c*a,a*amul);}';
  var VS_RUBAN = '#version 300 es\nlayout(location=0) in vec2 pos;layout(location=1) in vec4 coul;uniform vec2 res;out vec4 c;void main(){vec2 cl=pos/res*2.0-1.0;gl_Position=vec4(cl.x,-cl.y,0.0,1.0);c=coul;}';
  var FS_RUBAN = '#version 300 es\nprecision mediump float;in vec4 c;out vec4 o;void main(){o=vec4(c.rgb*c.a,c.a*0.35);}';
  var VS_PLEIN = '#version 300 es\nout vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
  var FS_FLOU = '#version 300 es\nprecision mediump float;in vec2 uv;uniform sampler2D tex;uniform vec2 dir;out vec4 o;' +
    'void main(){vec4 s=texture(tex,uv)*0.227;s+=(texture(tex,uv+dir*1.384)+texture(tex,uv-dir*1.384))*0.316;s+=(texture(tex,uv+dir*3.230)+texture(tex,uv-dir*3.230))*0.070;o=s;}';
  var FS_COMPO = '#version 300 es\nprecision mediump float;in vec2 uv;uniform sampler2D tex;uniform float force;out vec4 o;void main(){vec3 c=texture(tex,uv).rgb*force;o=vec4(c,max(c.r,max(c.g,c.b))*0.35);}';

  function RenduGL(m, canvas, bloom) {
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('pas de WebGL2');
    this.m = m; this.gl = gl; this.bloom = bloom; this.nom = 'WebGL2' + (bloom ? ' + bloom' : '');
    function prog(vs, fs) {
      var p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p;
    }
    this.pPart = prog(VS_PART, FS_PART); this.pRuban = prog(VS_RUBAN, FS_RUBAN); this.pFlou = prog(VS_PLEIN, FS_FLOU); this.pCompo = prog(VS_PLEIN, FS_COMPO);
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
      res: gl.getUniformLocation(this.pPart, 'res'), amul: gl.getUniformLocation(this.pPart, 'amul'), resR: gl.getUniformLocation(this.pRuban, 'res'),
      tex: gl.getUniformLocation(this.pFlou, 'tex'), dir: gl.getUniformLocation(this.pFlou, 'dir'), texC: gl.getUniformLocation(this.pCompo, 'tex'), force: gl.getUniformLocation(this.pCompo, 'force')
    };
  }
  RenduGL.prototype.cible = function (w, h) {
    var gl = this.gl, t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(function (p) { gl.texParameteri(gl.TEXTURE_2D, p, gl.LINEAR); });
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  };
  RenduGL.prototype.redim = function (w, h) {
    this.w = w; this.h = h; var gl = this.gl;
    if (this.bA) { gl.deleteTexture(this.bA.t); gl.deleteTexture(this.bB.t); gl.deleteFramebuffer(this.bA.f); gl.deleteFramebuffer(this.bB.f); }
    var bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2);
    this.bA = this.cible(bw, bh); this.bB = this.cible(bw, bh); gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };
  RenduGL.prototype.effacer = function () { var gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); };
  RenduGL.prototype.particules = function (L, H, add) {
    var gl = this.gl, m = this.m;
    gl.useProgram(this.pPart); gl.uniform2f(this.u.res, L, H); gl.bindVertexArray(this.vao); gl.bindBuffer(gl.ARRAY_BUFFER, this.bInst);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, this.w, this.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
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
  function RenduCanvas(m, canvas) { this.m = m; this.ctx = canvas.getContext('2d'); this.nom = 'Canvas 2D'; }
  RenduCanvas.prototype.redim = function (w, h, dpr) { this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  RenduCanvas.prototype.effacer = function () { this.ctx.clearRect(0, 0, this.m.L, this.m.H); };
  RenduCanvas.prototype.dessiner = function () {
    var m = this.m, ctx = this.ctx; m.preparer(); ctx.clearRect(0, 0, m.L, m.H);
    if (m.nR) { ctx.globalCompositeOperation = 'lighter'; for (var r = 0; r < m.nR; r += 3) { var o = r * 6, R = m.ruban; ctx.globalAlpha = R[o + 5]; ctx.fillStyle = 'rgb(' + (R[o + 2] * 255 | 0) + ',' + (R[o + 3] * 255 | 0) + ',' + (R[o + 4] * 255 | 0) + ')'; ctx.beginPath(); ctx.moveTo(R[o], R[o + 1]); ctx.lineTo(R[o + 6], R[o + 7]); ctx.lineTo(R[o + 12], R[o + 13]); ctx.fill(); } }
    this.lot(m.inst, m.nN, false); this.lot(m.instAdd, m.nA, true);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  };
  RenduCanvas.prototype.lot = function (T, n, add) {
    var ctx = this.ctx; ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
    for (var i = 0; i < n; i++) {
      var o = i * 10, s = T[o + 2], f = T[o + 8], et = T[o + 9];
      if (s < 0.3) continue;
      var col = 'rgb(' + (T[o + 4] * 255 | 0) + ',' + (T[o + 5] * 255 | 0) + ',' + (T[o + 6] * 255 | 0) + ')';
      ctx.save(); ctx.globalAlpha = Math.min(1, T[o + 7]); ctx.translate(T[o], T[o + 1]); ctx.rotate(T[o + 3]);
      ctx.fillStyle = col; ctx.strokeStyle = col;
      if (f >= 4 && f <= 7) ctx.scale(Math.max(Math.abs(et), 0.12), 1); else if (et > 0) ctx.scale(1 + et, 1);
      ctx.beginPath();
      if (f === 0 || f === 8) { var g = ctx.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.arc(0, 0, s, 0, 6.3); ctx.fill(); }
      else if (f === 1) { for (var k = 0; k < 10; k++) { var rr = k % 2 ? s * 0.45 : s, aa = k * Math.PI / 5; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.fill(); }
      else if (f === 2 || f === 9) { ctx.lineWidth = Math.max(1, s * 0.14); ctx.arc(0, 0, s * 0.8, 0, 6.3); ctx.stroke(); }
      else if (f === 3) { ctx.ellipse(0, 0, s, s * 0.3, 0, 0, 6.3); ctx.fill(); }
      else if (f === 4) ctx.fillRect(-s, -s * 0.55, s * 2, s * 1.1);
      else if (f === 5) { ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s); ctx.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s); ctx.fill(); }
      else if (f === 6) { ctx.ellipse(0, 0, s * 0.34, s, 0, 0, 6.3); ctx.fill(); }
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
      case 'combo': {
        // plusieurs cibles d'un seul geste (coupe multiple, chaîne, cascade)
        var nC = d.n || 2, kC = borne(0.45 + nC * 0.13, 0, 1), mC = this.styleManga();
        dec.intensite = kC;
        if (mC >= 1) { this.onomatopee(choisir(nC >= 4 ? ONOMATOPEES.combo.concat(['OTÉ !']) : ONOMATOPEES.coupe), p, kC); dec.effets.push('onomatopée'); }
        if (mC >= 2 && nC >= 3) { this.lignesVitesse(p, kC); this.aberration(kC * 0.6); dec.effets.push('lignes de vitesse'); }
        if (nC >= 4) { this.aura(p, kC); this.hitStop(70 + nC * 8); dec.effets.push('aura', 'hit stop'); }
        if (!this.opt.complement) fait('eclat', kC);
        if (nC >= 5) { fait('etoiles', kC); this.halo(0.6); }
        if (this.opt.sons) this.son('combo');
        dec.raison = 'Combo x' + nC + ' : mise en scène qui grandit avec le nombre de cibles d\'un seul geste.';
        break; }

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
      onHitStop: opt.onHitStop || null, cibleScore: opt.cibleScore || null, complement: !!opt.complement, dprMax: opt.dprMax || null, onArrivee: opt.onArrivee || null, rendu: opt.rendu || 'auto', bloom: opt.bloom == null ? null : opt.bloom, onDecision: opt.onDecision || null, zoneShake: opt.zoneShake || null
    };
    this.conteneur = opt.conteneur || document.body;
    this.plein = this.conteneur === document.body || this.conteneur === document.documentElement;
    if (!this.plein && getComputedStyle(this.conteneur).position === 'static') this.conteneur.style.position = 'relative';
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
        var comp = this.opt.complement; // le jeu a déjà ses propres particules : KwFX n'ajoute que la mise en scène
        if (!comp) {
          fait(effetSig, k, { couleur: d.couleur });
          if (palier >= 1) fait('anneau', k * 0.7);
          if (palier >= 2) fait(this.varier(th.sig.succes), k * 0.6);
        }
        if (palier >= 3) { this.halo(k * 0.6); if (this.pub.secousse) this.secousse(0.25 * k); }
        dec.multiplicateur = 1 + Math.floor(e.serie / 5) * 0.5;
        var kt = Math.min(1.5, k + e.serie * 0.035); // les chiffres grossissent avec le combo
        if (!comp && d.points != null) this.texte('+' + Math.round(d.points * dec.multiplicateur), p, kt);
        else if (!comp && palier >= 1) this.texte('x' + e.serie, p, kt);
        // effets manga selon le public
        var manga = this.styleManga();
        if (manga >= 2 && palier >= 2) { this.lignesVitesse(p, k); dec.effets.push('lignes de vitesse'); }
        if (manga >= 1 && palier >= 3) { this.aura(p, k); dec.effets.push('aura'); }
        if (type === 'coupe' && manga >= 2) { this.hitStop(Math.round(45 + 45 * k)); dec.effets.push('hit stop'); }
        if (manga >= 2 && k > 0.85) this.aberration(k * 0.6);
        if (d.element && !comp) this.pop(d.element, k);
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
        if (!this.opt.complement) fait(th.sig.erreur[0], 0.3);
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
      'text-shadow:0 2px 0 ' + this.theme.couleurs[0] + ',0 0 12px rgba(0,0,0,.35)');
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
      'color:' + (couleur || cs[1] || '#FFD23F') + ';-webkit-text-stroke:' + Math.max(2, taille / 18).toFixed(1) + 'px ' + (cs[3] || '#222') + ';paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.25),0 0 30px ' + (couleur || cs[1] || '#fff'));
    el.textContent = txt; this.bann = el;
    var an = el.animate([{ transform: 'translate(-50%,-50%) scale(.2) rotate(-8deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.12) rotate(2deg)', opacity: 1, offset: 0.18 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(0)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.8 },
      { transform: 'translate(-50%,-70%) scale(.9)', opacity: 0 }], { duration: 1300 + 400 * (k || 0.5), easing: 'ease-out' });
    var self = this; an.onfinish = function () { el.remove(); if (self.bann === el) self.bann = null; };
  };
  Directeur.prototype.pop = function (el, k) {
    if (!el.animate) return; var s = 1 + 0.12 + 0.15 * (k || 0.5);
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(' + s + ')' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    el.animate([{ filter: 'brightness(1.6) drop-shadow(0 0 14px ' + this.theme.couleurs[1] + ')' }, { filter: 'none' }], { duration: 600 });
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
  Directeur.prototype.detruire = function () { this.particules.c.remove(); this.calque.remove(); if (this.particules.ro) this.particules.ro.disconnect(); this.particules.ambiances = []; };

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
   * 8. API PUBLIQUE
   * ==================================================================== */
  var KwFX = {
    version: '2.1',
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
