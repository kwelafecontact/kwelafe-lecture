
/*!
 * KwFX — Directeur d'effets Kwélafé  v4.2 Lamèr
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
 * Nouveautés v3.3 (ciel vivant) :
 *   const ciel = fx.cielVivant({ heure: 17.5, vitesse: 0.4, nuages: 0.5, lune: 'auto' }) ; fx.cycleJourNuit(120) (une journée en 2 min)
 *   ciel.heure(6, { duree: 3000 }) ; ciel.nuages(0.8, ['cumulus', 'cirrus', 'stratus']) ; ciel.lune('pleine') ; ciel.etoileFilante() ; fx.heure('soir') glisse vers le soir
 *
 * Nouveautés v3.4 (brouillard volumétrique) :
 *   const b = fx.brouillard({ type: 'matin' | 'brume' | 'sol' | 'bancs' | 'epais' | 'merNuages', densite: 1, couche: 'devant' | 'fond' })
 *   b.leve(8000) (la brume se lève) ; b.densite(0.4, 3000) ; b.souffle(x, y) ; b.suivre(personnage) ; b.type('bancs') ; fx.meteo('brouillard') ; fx.brouillard(false)
 *
 * Nouveautés v3.5 (sable, poussière, lancer de rayons) :
 *   const sable = fx.sable({ couleur: 'volcan' | 'corail' | 'dore' | 'terre', solides: '.plateforme' }) ; sable.verser(x, y) ; sable.tas(x, 300, 80) ; sable.souffler(x, y) ; fx.vent(-400) fait voler le sable
 *   fx.nuagePoussiere(x, y, { couleur: 'terre', force: 1.5 }) ; fx.poussiereLumiere({ x, y: 0, angle: 65 })
 *   const rt = fx.lancerRayons({ objets: '.perso, .arbre', solMouille: true }) ; rt.lumiere(x, y, { couleur: '#FFB347' })
 *
 * Nouveautés v3.6 (atelier de fabrication, jeux de procédés) :
 *   const at = fx.atelier(el, { recette: 'geranium' | 'rhum' | 'sucre' | 'jus' }) ; at.sur('fini', d => fx.finPartie(d.qualite))
 *   à la main : const ch = at.appareil('alambic', { x: .05, y: .2, l: .3, h: .7, contenu: { eau: 40, feuilles: 60 } }) ; const s = at.appareil('serpentin', {...}) ; at.tuyau(ch, s) ; at.feu(ch, .6)
 *   appareils : moulin, cuve, alambic, serpentin, essencier, bouteille, verre, fermenteur, cristallisoir, turbine ; at.mesure(app) → °C, °Brix, % alcool, essence
 *
 * Nouveautés v3.8 (cuisine : découpe précise, morceaux, bol, pilon) :
 *   const cu = fx.cuisine(el, { recette: 'rougail' | 'pimentPile' | 'libre' }) ; cu.sur('fini', d => fx.finPartie(d.qualite))
 *   cu.ajouter('carotte') ; cu.guides('carotte', { ecart: 1 }) ; cu.prevoir(x1,y1,x2,y2) ; cu.couper(x1,y1,x2,y2)   (cm sur la planche 40×26)
 *   cu.tout('tomate', 'bol') ; cu.melanger() ; cu.tout('piment', 'mortier') ; cu.piler(5) ; cu.piler(10, true) ; cu.resultat()
 *   événements : coupe, precision, pose, texture, fini. Repli EPUB : .kwfx-cuisine-sansjs
 *
 * Nouveautés v4.0 « Lumyèr » (idées d'Unreal Engine 5.8 et de la préversion 5.9, adaptées au web et aux EPUB) :
 *   const ml = fx.megaLumieres({ nuit: .75, objets: '.arbre, .kaz' })   // chaque particule lumineuse éclaire le décor, coût fixe
 *   const lampe = ml.lumiere(x, y, { couleur: '#FFC46B', rayon: 140, scintille: .2 }) ; lampe.suivre(element) ; lampe.eteindre()
 *   ml.zone({ x, y, l, h, mode: 'assombrir' | 'eclaircir', force: .5 }) ; ml.obstacle(x, y, l, h) ; ml.lucioles(200) ; ml.regler({ nuit: .3, duree: 2000 })
 *   la lumière rebondit et s'arrête derrière les obstacles (rebond: .45, sol: '#B05A34') ; ombres portées pour les lumières les plus fortes
 *   transparence stable : fumée, verre et pétales ne changent plus d'ordre d'une image à l'autre (couche: 0..1 par émetteur)
 *   KwFX.profil() ; KwFX.outils() ; fx.executer([{ outil: 'joue', nom: 'eruption', x: .5, y: .8 }, { outil: 'attendre', ms: 400 }])
 *   KwFX.definirSysteme('monEffet', [{ nb: 30, sprite: 'petale', vie: [1, 2], vitesse: [80, 200], couleur: '#E63946' }]) puis fx.joue('monEffet')
 *   Les animations ne suivent plus le réglage « Réduire les animations » de l'appareil (option reduireAnimations: true pour le demander).
 *
 * Nouveautés v4.1 (un seul moteur pour le studio et le site Kwélafé Lecture) :
 *   KwFX.init({ complement: true })            // jeux 3D qui ont déjà leurs particules : KwFX n'ajoute que la mise en scène
 *   sonsEvenements: ['combo', 'pepite'], messagesTypes: ['serie', 'record'], echelleMessages: .55, hautMessages: '22%', dprMax: 1.5
 *   fx.evenement('combo', { n: 4, x, y })      // plusieurs cibles d'un seul geste
 *   fx.megaLumieres({ z: 3 })                  // place les calques de lumière sous l'interface du jeu
 *
 * Rivière vue de dessus (venue de Bichik Rush v4, intégrée en v4.2) :
 *   const riv = fx.riviere({ decor: 'decor.webp' }) ; riv.onde(x, y, .6) ; riv.sillage(x1, y1, x2, y2) ; riv.obstacles([{ x, y, r }]) ; riv.crue(1, 3500) ; riv.ambiance('matin' | 'jour' | 'soir' | 'nuit')
 *
 * Nouveautés v4.2 « Lamèr » (la mer et la nuit, pour les jeux three.js) :
 *   const mer = fx.mer3d({ THREE, renderer, scene, camera }) ; mer.placer({ x, haut, bas, largeur, z })   // la mer est dessinée par le moteur
 *   à chaque image, avant le rendu : mer.rendre(dt)   // elle reflète vraiment la scène : feux, lune, lumières de la ville
 *   mer.onde(positionMonde ou { x, y }, force) ; mer.eclair(couleur, force) ; mer.regler({ agitation, reflet, scintillement, compression, fond, brume })
 *   const ciel = fx.ciel3d({ THREE, scene, lune: { u: .7, v: .8, rayon: .035 }, nuages: .5 }) ; ciel.placer({...}) ; ciel.cadre(vHaut, vHorizon) ; ciel.maj(dt)
 *   ciel.lune(u, v, rayon) ; ciel.phase('croissant' | 'quartier' | 'pleine', halo) ; ciel.nuages(.4, { bande: .6, epaisseur: .1 }) ; ciel.eclair(couleur, force, u, v)   // les nuages s'allument avec les feux
 *   Le décor (image) doit avoir le ciel et la mer TRANSPARENTS : le moteur les dessine derrière.
 *
 * Conseils pour un nouveau jeu :
 *   KwFX.conseiller({ type: 'quiz', theme: 'volcan', public: 'enfant', mode: 'trankil' })
 */
(function (global) {
  'use strict';

  /* v3.7 Stability — ressources propres à chaque instance, sans modification des API du navigateur. */
  var instancesEPUB = 0;
  function VieFX() {
    var self = this, jobs = new Map(), listeners = [], observers = new Set(), roots = new Set(), animations = new Set(), gpu = new Map(), restorations = [];
    var seq = 0, paused = false, dead = false, pauseAt = 0, elapsedPause = 0;
    function clock() { return global.performance.now(); }
    function arm(j) {
      if (paused || dead || !jobs.has(j.id)) return;
      if (j.kind === 'raf') j.native = global.requestAnimationFrame(function (t) {
        j.native = null; if (!jobs.has(j.id) || paused || dead) return; jobs.delete(j.id); j.fn(t - elapsedPause);
      });
      else { j.due = clock() + j.remaining; j.native = global.setTimeout(function () {
        j.native = null; if (!jobs.has(j.id) || paused || dead) return;
        if (j.kind === 'interval') { j.remaining = j.delay; arm(j); } else jobs.delete(j.id);
        j.fn.apply(null, j.args);
      }, j.remaining); }
    }
    function schedule(kind, fn, delay, args) {
      if (dead) return 0;
      var d = Math.max(0, Number(delay) || 0), j = { id: ++seq, kind: kind, fn: fn, delay: d, remaining: d, args: args || [], native: null };
      jobs.set(j.id, j); arm(j); return j.id;
    }
    function disarm(j) { if (j.native != null) { if (j.kind === 'raf') global.cancelAnimationFrame(j.native); else global.clearTimeout(j.native); j.native = null; } }
    function clear(id) { var j = jobs.get(id); if (j) { disarm(j); jobs.delete(id); } }
    this.requestAnimationFrame = function (f) { return schedule('raf', f); };
    this.cancelAnimationFrame = this.clearTimeout = this.clearInterval = clear;
    this.setTimeout = function (f, d) { return schedule('timeout', f, d, Array.prototype.slice.call(arguments, 2)); };
    this.setInterval = function (f, d) { return schedule('interval', f, d, Array.prototype.slice.call(arguments, 2)); };
    this.maintenant = function () { return (paused ? pauseAt : clock()) - elapsedPause; };
    this.ecoute = function (target, type, fn, options) {
      if (dead) return; var cap = typeof options === 'boolean' ? options : !!(options && options.capture);
      if (listeners.some(function (r) { return r.target === target && r.type === type && r.fn === fn && r.cap === cap; })) return;
      var r = { target: target, type: type, fn: fn, cap: cap, wrap: function (event) {
        if (options && options.once) self.oublie(target, type, fn, options); if (!dead) return fn.call(this, event);
      } }; listeners.push(r); target.addEventListener(type, r.wrap, options);
    };
    this.oublie = function (target, type, fn, options) {
      var cap = typeof options === 'boolean' ? options : !!(options && options.capture);
      listeners = listeners.filter(function (r) { if (r.target === target && r.type === type && r.fn === fn && r.cap === cap) { target.removeEventListener(type, r.wrap, cap); return false; } return true; });
    };
    this.observer = function (fn) { var ro = new global.ResizeObserver(function (entries, obs) { if (!dead && !paused) fn(entries, obs); }); observers.add(ro); return ro; };
    this.root = function (el) { roots.forEach(function (n) { if (!n.parentNode) { self.libereGL(n); roots.delete(n); } }); roots.add(el); return el; };
    this.gl = function (canvas, opts) { var gl = canvas.getContext('webgl2', opts); if (gl) gpu.set(canvas, gl); return gl; };
    this.oublieObserver = function (ro) { if (ro) { ro.disconnect(); observers.delete(ro); } };
    this.libereGL = function (canvas) { var gl = gpu.get(canvas); if (gl) { try { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); } catch (_) {} gpu.delete(canvas); } };
    this.nouveauCanvas = function (c) { self.libereGL(c); var n = c.cloneNode(false); c.replaceWith(n); roots.delete(c); self.root(n); c.width = c.height = 1; return n; };
    this.restore = function (fn) { restorations.push(fn); };
    this.anime = function (el, frames, options) {
      var a = el.animate(frames, options); if (dead) { a.cancel(); return a; }
      animations.forEach(function (old) { if (old.playState === 'idle' || !old.effect || !old.effect.target || !old.effect.target.isConnected) animations.delete(old); });
      animations.add(a); if (a.finished && a.finished.catch) a.finished.catch(function () {});
      a.addEventListener('cancel', function () { animations.delete(a); }, { once: true });
      a.addEventListener('finish', function () { var fill = a.effect && a.effect.getTiming().fill; if (fill !== 'forwards' && fill !== 'both') animations.delete(a); }, { once: true });
      if (paused) a.pause(); return a;
    };
    this.pause = function () { if (dead || paused) return; paused = true; pauseAt = clock(); jobs.forEach(function (j) { if (j.kind !== 'raf' && j.native != null) j.remaining = Math.max(0, j.due - pauseAt); disarm(j); }); animations.forEach(function (a) { if (a.playState === 'running') { a._kwPause = true; a.pause(); } }); };
    this.reprendre = function () { if (dead || !paused) return; elapsedPause += clock() - pauseAt; paused = false; jobs.forEach(arm); animations.forEach(function (a) { if (a._kwPause) { a._kwPause = false; a.play(); } }); };
    this.etat = function () { var raf = 0; jobs.forEach(function (j) { if (j.kind === 'raf') raf++; }); return { detruit: dead, pause: paused || dead, animationsFrame: raf, minuteries: jobs.size - raf, callbacksActifs: Array.from(jobs.values()).filter(function(j) { return j.native != null; }).length, ecouteurs: listeners.length, observateurs: observers.size, calques: roots.size, contextesGL: gpu.size, animationsDOM: animations.size }; };
    this.detruire = function () {
      if (dead) return; dead = true; jobs.forEach(disarm); jobs.clear(); listeners.forEach(function (r) { r.target.removeEventListener(r.type, r.wrap, r.cap); }); listeners = [];
      observers.forEach(function (r) { r.disconnect(); }); observers.clear(); animations.forEach(function (a) { try { a.cancel(); } catch (_) {} }); animations.clear();
      gpu.forEach(function (_, canvas) { self.libereGL(canvas); }); roots.forEach(function (n) { n.remove(); if (n.tagName === 'CANVAS') n.width = n.height = 1; }); roots.clear();
      restorations.reverse().forEach(function (fn) { try { fn(); } catch (_) {} }); restorations = [];
    };
  }
  function promesseAudio(p) { if (p && p.catch) p.catch(function () {}); }


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
    c.couche = e.couche != null ? borne(Number(e.couche) || 0, 0, 1) : (c.sp === 8 || c.sp === 13 ? 0.25 : c.sp === 9 || c.sp === 10 || c.sp === 14 ? 0.75 : 0.5);
    if (!c.alphaVie) c.alphaVie = [1, 1, 1, 0];
    return c;
  }

  var TRACE = 10; // points mémorisés par particule pour les rubans de traînée

  function Moteur(fx) { var _kwVie = fx._vie;
    this.fx = fx; this.temps = 1; this.tempsCible = 1; this.gravite = 1; this.apes = 0; this.vent = 0; this.qualite = 1; this.dtMoy = 16; this.fps = 60;
    this.actif = false; this.dernier = 0; this.horloge = 0; this.ambiances = [];
    var cap = this.cap = fx.opt.particulesMax;
    this.n = 0;
    var F = function () { return new Float32Array(cap); };
    this.X = F(); this.Y = F(); this.VX = F(); this.VY = F(); this.AGE = F(); this.VIE = F(); this.T = F();
    this.ROT = F(); this.VR = F(); this.R = F(); this.G = F(); this.B = F(); this.GR = F(); this.OX = F(); this.OY = F();
    this.EM = new Uint16Array(cap); this.FL = new Uint8Array(cap);
    this.NE = new Uint32Array(cap); this._ne = 0; this._cles = new Float64Array(cap); this._tri = new Float32Array(cap * 10); // v4.0 transparence stable
    this.TRX = new Float32Array(cap * TRACE); this.TRY = new Float32Array(cap * TRACE); this.TRN = new Uint8Array(cap);
    this.defs = []; this.defsIdx = {};
    // tampons de rendu
    this.inst = new Float32Array(cap * 10); this.instLiq = new Float32Array(cap * 10); this.nL = 0; this.instAdd = new Float32Array(cap * 10); this.instSol = new Float32Array(cap * 10); this.nS = 0; this.ruban = new Float32Array(cap * TRACE * 6 * 6);
    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (fx.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9998';
    fx.conteneur.appendChild(_kwVie.root(c)); this.c = c;
    this.rendu = null;
    if (fx.opt.rendu !== 'canvas') { try { this.rendu = new RenduGL(this, c, fx.opt.bloom == null ? fx.opt.support !== 'epub' : fx.opt.bloom); } catch (e) { this.rendu = null; } }
    if (!this.rendu) { c = this.c = fx._vie.nouveauCanvas(c); this.rendu = new RenduCanvas(this, c); }
    var self = this;
    function perdu(ev) { ev.preventDefault(); if (!fx._detruit && self.c === c && self.rendu && self.rendu.gl) repli(); }
    function repli() { _kwVie.oublie(c, 'webglcontextlost', perdu); c = self.c = _kwVie.nouveauCanvas(c); self.rendu = new RenduCanvas(self, c); self.redim(); }
    if (this.rendu.gl) _kwVie.ecoute(c, 'webglcontextlost', perdu);
    try { this.redim(); } catch (e) { if (!this.rendu.gl) throw e; repli(); }
    if (global.ResizeObserver && !fx.plein) { this.ro = _kwVie.observer(function () { self.redim(); }); this.ro.observe(fx.conteneur); }
    _kwVie.ecoute(global, 'resize', function () { self.redim(); });
    this.boucle = function (t) { self.image(t); };
  }
  Object.defineProperty(Moteur.prototype, 'liste', { get: function () { return { length: this.n }; } });
  Moteur.prototype.redim = function () {
    if (this.fx._detruit || this.fx.enPause) return;
    var r = this.fx.taille(), dpr = Math.min(global.devicePixelRatio || 1, this.qualite < 0.6 ? 1 : (this.fx.opt.dprMax || 2));
    this.L = r.l; this.H = r.h; this.dpr = dpr;
    this.c.width = Math.max(1, Math.round(r.l * dpr)); this.c.height = Math.max(1, Math.round(r.h * dpr));
    this.rendu.redim(this.c.width, this.c.height, dpr);
  };
  Moteur.prototype.def = function (cle, e) {
    if (this.defsIdx[cle] != null) return this.defsIdx[cle];
    this.defs.push(compileEmetteur(e)); return (this.defsIdx[cle] = this.defs.length - 1);
  };
  Moteur.prototype.demarre = function () { var _kwVie = this.fx._vie; if (!this.actif && !this.fx._detruit) { this.actif = true; this.dernier = 0; _kwVie.requestAnimationFrame(this.boucle); } };

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
    if (this.fx._detruit) return;
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
      this.GR[i] = Math.random(); this.NE[i] = this._ne = (this._ne + 1) >>> 0; this.EM[i] = di; this.FL[i] = 0; this.TRN[i] = 0;
    }
    this.demarre();
  };

  /* --- lance un système complet (toutes ses couches) --- */
  Moteur.prototype.systeme = function (nom, x, y, k, o, herite, profondeur) { var _kwVie = this.fx._vie; if (this.fx._detruit) return;
    var sys = SYSTEMES[nom]; if (!sys) return;
    o = o || {}; profondeur = profondeur || 0; if (profondeur > 3) return;
    var self = this, force = this.fx.pub.force;
    sys.forEach(function (e, idx) {
      var di = self.def(nom + ':' + (sys._v || 0) + ':' + idx, e);
      var base = e.nb || 0, n = e.fixe ? base : Math.round(base * (0.45 + k) * force * self.qualite);
      if (base > 0 && n < 1) n = 1;
      if (e.delai) _kwVie.setTimeout(function () { self.emettre(di, x, y, k, o, n, herite); }, e.delai * 1000);
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
    this.GR[i] = this.GR[l]; this.NE[i] = this.NE[l]; this.OX[i] = this.OX[l]; this.OY[i] = this.OY[l]; this.EM[i] = this.EM[l]; this.FL[i] = this.FL[l]; this.TRN[i] = this.TRN[l];
    if (this.TRN[l]) { var a = i * TRACE, b = l * TRACE; for (var q = 0; q < TRACE; q++) { this.TRX[a + q] = this.TRX[b + q]; this.TRY[a + q] = this.TRY[b + q]; } }
  };

  /* --- simulation d'une image --- */
  Moteur.prototype.image = function (t) { var _kwVie = this.fx._vie;
    if (this.fx._detruit) return;
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
    if (this.n || this.ambiances.length) _kwVie.requestAnimationFrame(this.boucle);
    else { this.actif = false; this.rendu.effacer(); }
  };
  Moteur.prototype.evenement = function (nom, x, y, i) {
    var h = [this.R[i], this.G[i], this.B[i], this.VX[i], this.VY[i]];
    this.systeme(nom, x, y, 0.6, {}, h, 1);
  };

  /* --- préparation des données de rendu (couleur, taille, alpha selon l'âge) --- */
  Moteur.prototype.preparer = function () {
    var tri = this.fx.opt.transparenceStable && this._cles, CL = this._cles;
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
      if (tri && !d.add) CL[o / 10] = (((d.couche * 7 + 0.5) | 0) * 4294967296 + this.NE[i]) * 16384 + o / 10;
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
    // v4.0 transparence stable (idée de la transparence sans erreur d'ordre d'Unreal Engine 5.9) :
    // les particules sont rangées par tranche de profondeur puis par ordre de naissance, donc jamais de « saut » entre deux images
    if (tri && nN > 1) {
      var cl = CL.subarray(0, nN), TR = this._tri; cl.sort();
      for (var s2 = 0; s2 < nN; s2++) { var so = (cl[s2] % 16384) * 10, de = s2 * 10; for (var u = 0; u < 10; u++) TR[de + u] = I[so + u]; }
      this.inst = TR; this._tri = I;
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
    var gl = m.fx._vie.gl(canvas, { premultipliedAlpha: true, alpha: true, antialias: false, powerPreference: 'high-performance' });
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
  function RenduCanvas(m, canvas) { this.m = m; this.ctx = canvas.getContext('2d'); if (!this.ctx) throw new Error('KwFX: Canvas 2D indisponible'); this.nom = 'Canvas 2D'; }
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
      if (nom === 'feu') for (var i = 0; i < 4; i++) m.fx._vie.setTimeout(function () { m.fx.son('eclat'); }, 900 + i * 260);
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
    if (this.fx._detruit || this.fx.enPause) return null;
    if (!this.ctx) { var A = global.AudioContext || global.webkitAudioContext; if (!A) return null; try { this.ctx = new A(); } catch (e) { return null; } }
    if (this.ctx.state === 'suspended') promesseAudio(this.ctx.resume());
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
    var self = this; this.tampons = this.tampons || {}; this._abort = global.AbortController ? new AbortController() : null;
    var src = {};
    if (typeof pack === 'string') NOMS_SONS.forEach(function (n) { src[n] = pack.replace(/\/?$/, '/') + n + '.mp3'; });
    else if (pack) src = pack;
    else if (global.KwFX_SONS) src = global.KwFX_SONS;
    this.attendus = Object.keys(src).length;
    Object.keys(src).forEach(function (n) {
      fetch(src[n], self._abort ? { signal: self._abort.signal } : undefined).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
        .then(function (ab) {
          var c = self.contexteSilencieux(); if (!c) return;
          return new Promise(function (ok, ko) { c.decodeAudioData(ab, ok, ko); });
        })
        .then(function (buf) { if (buf && !self.fx._detruit) self.tampons[n] = buf; })
        .catch(function () { /* on garde le son synthétisé */ });
    });
  };
  /* contexte audio créé sans le démarrer (il sera relancé au premier toucher) */
  Sons.prototype.contexteSilencieux = function () {
    if (this.fx._detruit) return null;
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
    this._vie = new VieFX(); var _kwVie = this._vie;
    this.opt = {
      theme: opt.theme || 'reunion', public: opt.public || 'enfant', mode: opt.mode || 'trankil',
      support: opt.support || 'web', sons: opt.sons !== false, volume: opt.volume == null ? 1 : opt.volume,
      messages: opt.messages !== false, bonusRares: opt.bonusRares !== false, ambiance: !!opt.ambiance,
      secousses: opt.secousses !== false, manga: opt.manga == null ? null : opt.manga, jeu: opt.jeu || null, collection: opt.collection !== false,
      onHitStop: opt.onHitStop || null, cibleScore: opt.cibleScore || null, onArrivee: opt.onArrivee || null, rendu: opt.rendu || 'auto', bloom: opt.bloom == null ? null : opt.bloom, onDecision: opt.onDecision || null, zoneShake: opt.zoneShake || null,
      vibrations: opt.vibrations !== false, pauseAuto: opt.pauseAuto !== false,
      particulesMax: Math.round(borne(Number(opt.particulesMax) || (opt.support === 'epub' ? 600 : /iPhone|iPod/i.test(navigator.userAgent) ? 1200 : /iPad/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 1800 : 3000), 100, 9000)),
      reduireAnimations: !!opt.reduireAnimations, complement: !!opt.complement, sonsEvenements: opt.sonsEvenements || null, messagesTypes: opt.messagesTypes || null, echelleMessages: opt.echelleMessages || 1, hautMessages: opt.hautMessages || '38%', dprMax: opt.dprMax || null, transparenceStable: opt.transparenceStable !== false
    };
    if (this.opt.reduireAnimations) { this.opt.secousses = false; this.opt.vibrations = false; this.opt.ambiance = false; this.opt.manga = 0; this.opt.bloom = false; }
    this.conteneur = opt.conteneur || document.body;
    this.plein = this.conteneur === document.body || this.conteneur === document.documentElement;
    if (!this.plein && getComputedStyle(this.conteneur).position === 'static') { var root = this.conteneur, positionAvant = root.style.position; root.style.position = 'relative'; this._vie.restore(function () { if (root.style.position === 'relative') root.style.position = positionAvant; }); }
    this.lum = { angle: 135, hauteur: 0.55, force: 0.3, teinte: '#0B1A33', teinteRgb: [0.04, 0.1, 0.2], profondeur: true, brume: '#BFD7EA', brumeRgb: [191, 215, 234], particules: opt.ombres !== false, contact: opt.ombres !== false, elements: opt.ombres !== false };
    this.regler(this.opt);
    this.particules = new Moteur(this);
    this.calque = document.createElement('div');
    this.calque.setAttribute('aria-hidden', 'true');
    this.calque.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:9999';
    this.conteneur.appendChild(_kwVie.root(this.calque));
    this.audio = new Sons(this);
    if (this.opt.sons) this.audio.charger(opt.sonsPack);
    this.journal = [];
    this.reinitialiser();
    if (this.opt.support === 'epub' && opt.bloquerPropagation !== false) this._vie.restore(KwFX.proteger(this.conteneur));
    if (this.opt.ambiance) this.ambiance(true);
    _kwVie.ecoute(global, 'pointerdown', function () { if (self.opt.sons) self.audio.pret(); }, { once: true });
    this.installerV21();
    if (this.opt.support === 'epub' && document.documentElement.classList) { instancesEPUB++; document.documentElement.classList.add('kwfx-js'); this._vie.restore(function () { if (--instancesEPUB === 0) document.documentElement.classList.remove('kwfx-js'); }); }
    if (this.opt.pauseAuto && document.hidden) { this.pause(); this._pauseAuto = true; }
  }
  Directeur.prototype.regler = function (o) {
    for (var k in o) if (o.hasOwnProperty(k)) this.opt[k] = o[k];
    this.theme = THEMES[this.opt.theme] || THEMES.reunion;
    this.pub = PUBLICS[this.opt.public] || PUBLICS.enfant;
    this.mode = MODES[this.opt.mode] || MODES.trankil;
    if (this.opt.reduireAnimations) { this.opt.secousses = false; this.opt.vibrations = false; this.opt.manga = 0; }
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
  Directeur.prototype.evenement = function (type, d) { var _kwVie = this._vie;
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
          this.banniere(dec.message, k, null, 'serie');
          this.son('combo');
          dec.raison += 'Palier de série ' + e.serie + ' : message et son montant. ';
        } else this.son(type === 'coupe' ? 'coupe' : 'bonne');
        // bonus rare imprévisible (récompense variable, avec « filet » : plus on attend, plus il est probable)
        var chance = Math.min(0.35, 0.05 + e.secheresse * 0.012);
        if (this.opt.bonusRares && e.serie >= 2 && Math.random() < chance) {
          dec.pepite = true; e.secheresse = 0; e.pepites++;
          var obj = this.opt.collection !== false ? this.tirerObjet() : null; dec.objet = obj;
          _kwVie.setTimeout(function () { self.lance('pepite', p, 1); self.son('pepite'); self.banniere(choisir(MESSAGES.pepite), 0.9, '#FFD23F', 'pepite');
            if (obj) _kwVie.setTimeout(function () { self.texte((obj.nouveau ? 'Nouveau : ' : '') + obj.nom, { x: p.x, y: Math.max(p.y, self.zoneSure().y1 + 60) }, 0.5); }, 450); }, 180);
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
          dec.message = choisir(MESSAGES.encourage); this.banniere(dec.message, 0.4, '#9EC5FF', 'encourage');
          dec.raison = 'Le joueur peine (' + Math.round(taux * 100) + ' % d\'erreurs) : message doux, et la prochaine réussite sera fêtée en grand.';
          dec.conseilJeu = 'faciliter';
        } else dec.raison = perdue >= 5 ? 'Série de ' + perdue + ' perdue : effet discret pour ne pas décourager.' : 'Erreur : retour doux et discret.';
        e.excitation = Math.max(0, e.excitation - 0.2);
        break; }

      case 'combo': {
        // plusieurs cibles d'un seul geste (coupe multiple, chaîne, cascade)
        var nC = d.n || 2, kC = borne(0.45 + nC * 0.13, 0, 1), mC = this.styleManga();
        dec.intensite = kC;
        if (mC >= 1) { this.onomatopee(choisir(nC >= 4 ? ONOMATOPEES.combo.concat(['OTÉ !']) : ONOMATOPEES.coupe), p, kC); dec.effets.push('onomatopée'); }
        if (mC >= 2 && nC >= 3) { this.lignesVitesse(p, kC); this.aberration(kC * 0.6); dec.effets.push('lignes de vitesse'); }
        if (nC >= 4) { this.aura(p, kC); this.hitStop(70 + nC * 8); dec.effets.push('aura', 'hit stop'); }
        if (!this.opt.complement) fait('eclat', kC);
        if (nC >= 5) { if (!this.opt.complement) fait('etoiles', kC); this.halo(0.6); }
        this.son('combo');
        dec.raison = 'Combo x' + nC + ' : mise en scène qui grandit avec le nombre de cibles d\'un seul geste.';
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
          this.transition(typeT, d.onMilieu).then(function () { selfN.banniere(dec.message, 0.9, null, 'niveau'); selfN.son('niveau'); });
          dec.raison = 'Passage de niveau avec transition plein écran adaptée au thème.';
        } else { this.halo(0.6); this.banniere(dec.message, 0.9, null, 'niveau'); this.son('niveau'); dec.raison = 'Passage de niveau : moment fort, onde + bannière.'; }
        break; }

      case 'record':
        if (this.styleManga() >= 2) { this.planDramatique(p, 900); dec.effets.push('plan dramatique'); }
        dec.intensite = 1; fait('pepite', 1); dec.message = MESSAGES.record[0]; this.banniere(dec.message, 1, '#FFD23F', 'record'); this.son('pepite');
        dec.raison = 'Nouveau record personnel.'; break;

      case 'pepite':
        dec.intensite = 1; dec.pepite = true; fait('pepite', 1); dec.message = choisir(MESSAGES.pepite); this.banniere(dec.message, 1, '#FFD23F', 'pepite'); this.son('pepite');
        dec.raison = 'Bonus déclenché par le jeu.'; break;

      case 'victoire': {
        var precision = e.bonnes + e.erreurs ? e.bonnes / (e.bonnes + e.erreurs) : 1;
        var kv = borne(0.55 + precision * 0.45, 0, 1); dec.intensite = kv;
        th.sig.victoire.forEach(function (n) { fait(n, kv); });
        this.halo(0.8); dec.message = choisir(MESSAGES.victoire); this.banniere(dec.message, 1, null, 'victoire'); this.son('victoire');
        if (this.styleManga() >= 2) { this.planDramatique(p, 1000); dec.effets.push('plan dramatique'); }
        else if (this.styleManga() === 1) { var pc = this.position({}); this.onomatopee('OTÉ !', { x: pc.x, y: pc.y + 90 }, 0.9); dec.effets.push('onomatopée'); }
        dec.raison = 'Victoire, précision ' + Math.round(precision * 100) + ' % : célébration ' + (kv > 0.85 ? 'maximale.' : 'forte.'); break; }

      case 'defaite':
        dec.intensite = 0.3; fait(th.sig.erreur[0], 0.4); dec.message = choisir(MESSAGES.defaite); this.banniere(dec.message, 0.4, '#9EC5FF', 'defaite'); this.son('defaite');
        dec.raison = 'Fin de partie : ton doux, on donne envie de rejouer.'; break;

      case 'debut':
        this.reinitialiser(); dec.message = MESSAGES.debut[0]; this.banniere(dec.message, 0.6, null, 'debut'); this.son('debut');
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
  Directeur.prototype.arrivee = function () { var _kwVie = this._vie;
    var t = maintenant(); if (this._arr && t - this._arr < 70) return; this._arr = t;
    var el = this.opt.cibleScore; if (el && el.animate) _kwVie.anime(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'ease-out' });
    var fsA = this.opt.sonsEvenements; if (this.opt.sons && (!fsA || fsA.indexOf('arrivee') >= 0)) this.audio.echantillon('clic', { demi: hasard(4, 9), vol: 0.9 }) || this.audio.joue('clic');
    if (this.opt.onArrivee) this.opt.onArrivee();
  };
  Directeur.prototype.son = function (nom) {
    if (!this.opt.sons) return;
    var f = this.opt.sonsEvenements; if (f && f.indexOf(nom) < 0 && !(nom === 'erreurGrave' && f.indexOf('erreur') >= 0)) return; // le jeu choisit les sons qu'il laisse à KwFX
    this.audio.joue(nom, this.e.serie);
  };
  Directeur.prototype.secousse = function (k) { var _kwVie = this._vie;
    if (!this.opt.secousses || !this.pub.secousse) return;
    var cible = this.cibleEcran();
    if (!cible || !cible.animate) return;
    var a = 3 + 9 * k * this.pub.secousse, im = [];
    for (var i = 0; i < 6; i++) im.push({ transform: 'translate(' + hasard(-a, a).toFixed(1) + 'px,' + hasard(-a, a).toFixed(1) + 'px)' });
    im.push({ transform: 'translate(0,0)' });
    _kwVie.anime(cible, im, { duration: 260 + 120 * k, easing: 'ease-out' });
  };
  Directeur.prototype.calqueDiv = function (css) { var _kwVie = this._vie;
    var el = document.createElement('div'); el.style.cssText = 'position:absolute;pointer-events:none;' + css;
    this.calque.appendChild(el); return el;
  };
  Directeur.prototype.flash = function (couleur, force) { var _kwVie = this._vie;
    if (this.opt.reduireAnimations || this._detruit) return;
    var el = this.calqueDiv('inset:0;background:' + (couleur || '#fff'));
    var an = _kwVie.anime(el, [{ opacity: force || 0.35 }, { opacity: 0 }], { duration: 320, easing: 'ease-out' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.halo = function (k) { var _kwVie = this._vie;
    var c = this.theme.couleurs[0], rgb = versRgb(c).join(',');
    var el = this.calqueDiv('inset:0;background:radial-gradient(ellipse at center, rgba(' + rgb + ',0) 45%, rgba(' + rgb + ',' + (0.25 + 0.3 * k).toFixed(2) + ') 100%)');
    var an = _kwVie.anime(el, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 900, easing: 'ease-out' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.texte = function (txt, p, k) { var _kwVie = this._vie;
    var taille = Math.round((18 + 14 * k) * this.pub.texte);
    var el = this.calqueDiv('left:' + p.x + 'px;top:' + p.y + 'px;transform:translate(-50%,-50%);font:900 ' + taille + 'px/1 system-ui,-apple-system,sans-serif;color:#fff;white-space:nowrap;' +
      'text-shadow:0 2px 0 ' + this.theme.couleurs[0] + (this.lum.elements ? ',' + this.ombreCss(0.7, 'texte') : ',0 0 12px rgba(0,0,0,.35)'));
    el.textContent = txt;
    var an = _kwVie.anime(el, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.2 },
      { transform: 'translate(-50%,-220%) scale(1)', opacity: 0 }], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' });
    an.onfinish = function () { el.remove(); };
  };
  Directeur.prototype.banniere = function (txt, k, couleur, typ) { var _kwVie = this._vie;
    if (!this.opt.messages) return;
    var fm = this.opt.messagesTypes; if (fm && typ && fm.indexOf(typ) < 0) return; // le jeu choisit les messages qu'il laisse à KwFX
    if (this.bann) this.bann.remove();
    var cs = this.theme.couleurs, s = this.zoneSure();
    var taille = Math.round(Math.min(s.x2 - s.x1, 700) / Math.max(6, txt.length) * 1.5 * this.pub.texte);
    taille = Math.round(borne(taille, 28, 84) * this.opt.echelleMessages);
    var el = this.calqueDiv('left:50%;top:' + this.opt.hautMessages + ';transform:translate(-50%,-50%);max-width:' + (s.x2 - s.x1) + 'px;text-align:center;font:900 ' + taille + 'px/1.05 system-ui,-apple-system,sans-serif;' +
      'color:' + (couleur || cs[1] || '#FFD23F') + ';-webkit-text-stroke:' + Math.max(2, taille / 18).toFixed(1) + 'px ' + (cs[3] || '#222') + ';paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.25),' + (this.lum.elements ? this.ombreCss(1, 'texte') + ',' : '') + '0 0 30px ' + (couleur || cs[1] || '#fff'));
    el.textContent = txt; this.bann = el;
    var an = _kwVie.anime(el, [{ transform: 'translate(-50%,-50%) scale(.2) rotate(-8deg)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.12) rotate(2deg)', opacity: 1, offset: 0.18 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(0)', opacity: 1, offset: 0.3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: 0.8 },
      { transform: 'translate(-50%,-70%) scale(.9)', opacity: 0 }], { duration: 1300 + 400 * (k || 0.5), easing: 'ease-out' });
    var self = this; an.onfinish = function () { el.remove(); if (self.bann === el) self.bann = null; };
  };
  Directeur.prototype.pop = function (el, k) { var _kwVie = this._vie;
    if (!el.animate) return; var s = 1 + 0.12 + 0.15 * (k || 0.5);
    _kwVie.anime(el, [{ transform: 'scale(1)' }, { transform: 'scale(' + s + ')' }, { transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
    var fin = el._kwfxH != null ? this.ombreCss(el._kwfxH) : 'none', haut = this.lum.elements ? ' ' + this.ombreCss(0.9) : '';
    _kwVie.anime(el, [{ filter: 'brightness(1.6) drop-shadow(0 0 14px ' + this.theme.couleurs[1] + ')' + haut }, { filter: fin }], { duration: 600 });
  };
  Directeur.prototype.tremble = function (el) { var _kwVie = this._vie;
    if (!el.animate) return;
    _kwVie.anime(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px) rotate(-2deg)' }, { transform: 'translateX(6px) rotate(2deg)' },
      { transform: 'translateX(-4px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
  };
  Directeur.prototype.ralenti = function (duree) { var _kwVie = this._vie;
    var m = this.particules; m.tempsCible = 0.25;
    _kwVie.setTimeout(function () { m.tempsCible = 1; }, duree || 600);
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
      qualite: Math.round(this.particules.qualite * 100), fps: this.particules.fps, particules: this.particules.n, rendu: this.particules.rendu ? this.particules.rendu.nom : null, profil: profil().niveau, lumieres: this._ml ? this._ml.api.etat() : null,
      duree: Math.round((maintenant() - e.debut) / 1000) };
  };
  Directeur.prototype.detruire = function () {
    if (this._detruit) return; this._detruit = true; this.enPause = true;
    this._vie.detruire();
    if (this.audio) { if (this.audio._abort) this.audio._abort.abort(); if (this.audio.ctx && this.audio.ctx.state !== 'closed') promesseAudio(this.audio.ctx.close()); this.audio.ctx = null; this.audio.tampons = {}; }
    if (this.particules) { var m = this.particules; m.actif = false; m.n = 0; m.ambiances = []; Object.keys(m).forEach(function (k) { if (ArrayBuffer.isView(m[k])) m[k] = null; }); m.rendu = null; }
    this._ciel = this._prof = this._profStop = this._ondeSvg = null;
    this._mus = this._sonMeteo = this._eau = this._voute = this._brumes = this._sable = this._rt = this._foyer = this._scene = this._ml = this._mlCles = null;
  };
  Directeur.prototype.diagnostic = function () { var d = this._vie.etat(); d.capacite = this.particules.cap; d.rendu = this.particules.rendu ? this.particules.rendu.nom : null; d.fps = this.particules.fps; return d; };

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
  Directeur.prototype.hitStop = function (ms) { var _kwVie = this._vie;
    ms = ms || 80; var self = this, m = this.particules;
    this.fige = true; m.temps = 0; m.tempsCible = 0;
    if (this.opt.onHitStop) this.opt.onHitStop(ms);
    _kwVie.clearTimeout(this._hs);
    this._hs = _kwVie.setTimeout(function () { self.fige = false; m.temps = 1; m.tempsCible = 1; }, ms);
  };
  Directeur.prototype.estFige = function () { return !!this.fige; };
  /* Image d'impact : flash blanc 2 à 4 images, puis noir et blanc contrasté, puis retour à la couleur */
  Directeur.prototype.impactImage = function (k) { var _kwVie = this._vie;
    if (this.opt.public === 'petit') return;
    var el = this.calqueDiv('inset:0;background:#fff;opacity:' + (0.75 + 0.2 * (k || 0.8)).toFixed(2));
    _kwVie.setTimeout(function () { el.remove(); }, 50);
    var c = this.cibleEcran(); if (!c || !c.animate) return;
    _kwVie.anime(c, [{ filter: 'grayscale(1) contrast(1.9) brightness(1.1)' }, { filter: 'grayscale(1) contrast(1.9) brightness(1.1)', offset: 0.55 }, { filter: 'none' }], { duration: 190, delay: 50, easing: 'ease-out' });
  };
  /* Lignes de vitesse qui convergent vers l'action */
  Directeur.prototype.lignesVitesse = function (p, k) { var _kwVie = this._vie;
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
    var an = _kwVie.anime(c, [{ opacity: 0, transform: 'scale(1.15)' }, { opacity: 0.9, transform: 'scale(1)', offset: 0.2 }, { opacity: 0, transform: 'scale(.97)' }], { duration: 420 + 220 * k, easing: 'ease-out' });
    an.onfinish = function () { c.remove(); };
  };
  /* Onomatopée géante sur un éclat en étoile tramé (halftone), contour épais, ombre franche */
  Directeur.prototype.onomatopee = function (txt, p, k) { var _kwVie = this._vie;
    k = k == null ? 0.8 : k;
    var tOno = global.performance.now(); if (this._dernOno && tOno - this._dernOno < 500) return; this._dernOno = tOno; // en rafale (chaîne), une seule onomatopée à la fois
    var cs = this.theme.couleurs, taille = Math.round(borne(Math.round((44 + 40 * k) * this.pub.texte), 38, 108) * (this.opt.echelleMessages || 1)), s = this.zoneSure();
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
    var an = _kwVie.anime(wrap, [{ transform: 'scale(.15) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.3) rotate(4deg)', opacity: 1, offset: 0.14 },
      { transform: 'scale(1) rotate(0)', opacity: 1, offset: 0.26 }, { transform: 'scale(1.04) rotate(-1deg)', opacity: 1, offset: 0.75 }, { transform: 'scale(1.2)', opacity: 0 }], { duration: 950, easing: 'ease-out' });
    an.onfinish = function () { wrap.remove(); };
  };
  /* Aura lumineuse et étincelles autour de l'action lors d'un combo */
  Directeur.prototype.aura = function (p, k) { var _kwVie = this._vie;
    var c = versRgb(this.theme.couleurs[1] || '#FFD23F').join(','), r = Math.round(60 + 70 * k);
    var a = this.calqueDiv('left:' + p.x + 'px;top:' + p.y + 'px;width:' + 2 * r + 'px;height:' + 2 * r + 'px;margin:-' + r + 'px 0 0 -' + r + 'px;border-radius:50%;' +
      'background:radial-gradient(circle,rgba(' + c + ',.6) 0%,rgba(' + c + ',.25) 42%,rgba(' + c + ',0) 70%);mix-blend-mode:screen');
    var an = _kwVie.anime(a, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.1)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.45)', opacity: 0 }], { duration: 750, easing: 'ease-out' });
    an.onfinish = function () { a.remove(); };
    this.lance('etincelles', p, k * 0.6);
  };
  /* Plan rapproché dramatique : bandes noires + zoom vers l'action + ralenti */
  Directeur.prototype.planDramatique = function (p, duree) { var _kwVie = this._vie;
    duree = duree || 950; var h = Math.round(this.taille().h * 0.13);
    var haut = this.calqueDiv('left:0;right:0;top:-2px;height:' + h + 'px;background:#000'), bas = this.calqueDiv('left:0;right:0;bottom:-2px;height:' + h + 'px;background:#000');
    var kf = function (d) { return [{ transform: 'translateY(' + d + ')' }, { transform: 'translateY(0)', offset: 0.18 }, { transform: 'translateY(0)', offset: 0.82 }, { transform: 'translateY(' + d + ')' }]; };
    _kwVie.anime(haut, kf('-100%'), { duration: duree, easing: 'ease-in-out' }).onfinish = function () { haut.remove(); };
    _kwVie.anime(bas, kf('100%'), { duration: duree, easing: 'ease-in-out' }).onfinish = function () { bas.remove(); };
    var c = this.cibleEcran();
    if (c && c.animate && !this.plein) {
      var o = c.style.transformOrigin; c.style.transformOrigin = p.x + 'px ' + p.y + 'px';
      _kwVie.anime(c, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.25 }, { transform: 'scale(1.1)', offset: 0.75 }, { transform: 'scale(1)' }], { duration: duree, easing: 'ease-in-out' })
        .onfinish = function () { c.style.transformOrigin = o; };
    }
    this.ralenti(duree * 0.7);
  };
  /* Aberration chromatique légère (web uniquement) */
  Directeur.prototype.aberration = function (k) { var _kwVie = this._vie;
    if (this.opt.support === 'epub') return;
    var c = this.cibleEcran(); if (!c || !c.animate) return; var d = (2 + 4 * (k || 0.6)).toFixed(1);
    _kwVie.anime(c, [{ filter: 'drop-shadow(' + d + 'px 0 0 rgba(255,0,60,.55)) drop-shadow(-' + d + 'px 0 0 rgba(0,220,255,.55))' }, { filter: 'none' }], { duration: 230, easing: 'ease-out' });
  };
  /* Transitions de niveau spectaculaires : vague, lave, cyclone, envol de paille-en-queue.
   * auMilieu() est appelé quand l'écran est couvert (pour changer de niveau). Renvoie une promesse. */
  var TRANSITION_THEME = { volcan: 'lave', lagon: 'vague', oiseaux: 'pailleenqueue', flore: 'pailleenqueue', fruits: 'vague', lontan: 'pailleenqueue', noel: 'cyclone', mystere: 'cyclone', reunion: 'pailleenqueue' };
  Directeur.prototype.transition = function (type, auMilieu) { var _kwVie = this._vie;
    type = type || TRANSITION_THEME[this.opt.theme] || 'pailleenqueue';
    var self = this, D = this.opt.support === 'epub' ? 1200 : 1500, cs = this.theme.couleurs;
    var el = this.calqueDiv('inset:0;overflow:hidden'); el.style.pointerEvents = 'auto'; el.style.zIndex = '2';
    var couvre = [{ offset: 0 }, { offset: 0.42 }, { offset: 0.58 }, { offset: 1 }];
    function anime(node, a, b, c, d, opts) { var k = couvre.map(function (f, i) { var o = {}; o.offset = f.offset; o.transform = [a, b, c, d][i]; return o; }); return _kwVie.anime(node, k, opts || { duration: D, easing: 'cubic-bezier(.6,0,.4,1)' }); }
    if (type === 'vague') {
      el.innerHTML = '<svg viewBox="0 0 140 100" preserveAspectRatio="none" style="position:absolute;top:0;left:-20%;width:140%;height:100%"><defs><linearGradient id="kwv" x1="0" x2="1"><stop offset="0" stop-color="#0077B6"/><stop offset="1" stop-color="#48CAE4"/></linearGradient></defs>' +
        '<path d="M20 0 H118 Q132 8 122 18 Q112 28 126 38 Q138 50 122 60 Q110 70 126 80 Q136 90 120 100 H20 Q8 90 18 80 Q30 70 16 60 Q4 50 18 40 Q30 30 14 20 Q4 10 20 0Z" fill="url(#kwv)"/>' +
        '<path d="M118 0 Q132 8 122 18 Q112 28 126 38 Q138 50 122 60 Q110 70 126 80 Q136 90 120 100" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="4 3" opacity=".9"/></svg>';
      anime(el.firstChild, 'translateX(-110%)', 'translateX(0)', 'translateX(0)', 'translateX(110%)');
      _kwVie.setTimeout(function () { self.lance('bulles', { x: self.taille().l / 2, y: self.taille().h * 0.6 }, 1); }, D * 0.45);
    } else if (type === 'lave') {
      el.innerHTML = '<svg viewBox="0 0 100 120" preserveAspectRatio="none" style="position:absolute;left:0;top:-20%;width:100%;height:120%"><defs><linearGradient id="kwl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a0d00"/><stop offset=".55" stop-color="#E63900"/><stop offset="1" stop-color="#FFB000"/></linearGradient></defs>' +
        '<path d="M0 0 H100 V100 Q95 112 90 100 Q84 92 78 106 Q72 118 66 102 Q60 94 52 110 Q46 120 40 103 Q34 94 26 108 Q20 116 14 101 Q8 94 0 104Z" fill="url(#kwl)"/></svg>';
      anime(el.firstChild, 'translateY(-105%)', 'translateY(0)', 'translateY(0)', 'translateY(105%)');
      _kwVie.setTimeout(function () { self.lance('braises', { x: self.taille().l / 2, y: self.taille().h * 0.8 }, 1); self.secousse(0.4); }, D * 0.4);
    } else if (type === 'cyclone') {
      var sp = document.createElement('div');
      sp.style.cssText = 'position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;border-radius:50%;background:repeating-conic-gradient(from 0deg,' + cs[0] + ' 0 15deg,#ffffff 15deg 22deg,' + (cs[3] || cs[1]) + ' 22deg 37deg,#ffffff 37deg 44deg)';
      el.appendChild(sp);
      _kwVie.anime(sp, [{ transform: 'scale(0) rotate(0deg)' }, { transform: 'scale(1.2) rotate(540deg)', offset: 0.42 }, { transform: 'scale(1.2) rotate(620deg)', offset: 0.58 }, { transform: 'scale(0) rotate(1080deg)' }], { duration: D, easing: 'cubic-bezier(.6,0,.4,1)' });
    } else {
      var ciel = document.createElement('div');
      ciel.style.cssText = 'position:absolute;inset:0;background:linear-gradient(180deg,#BDE3FF,#FFFFFF)';
      el.appendChild(ciel);
      _kwVie.anime(ciel, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], { duration: D, easing: 'ease-in-out' });
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
        _kwVie.anime(o, [{ transform: 'translate(' + (-150) + 'px,' + y0 + 'px) rotate(-12deg)' }, { transform: 'translate(' + (t.l + 150) + 'px,' + y1 + 'px) rotate(-6deg)' }], { duration: D * 0.9, delay: dl, easing: 'ease-in-out', fill: 'both' });
      }
      _kwVie.setTimeout(function () { self.lance('plumes', { x: t.l / 2, y: t.h / 2 }, 1); }, D * 0.45);
    }
    if (this.opt.sons) { var s = { vague: 'bulles', lave: 'volcan', cyclone: 'vent', pailleenqueue: 'oiseau' }[type]; this.audio.echantillon(s) || this.son('niveau'); }
    return new Promise(function (ok) {
      _kwVie.setTimeout(function () { if (auMilieu) try { auMilieu(); } catch (e) {} }, D * 0.5);
      _kwVie.setTimeout(function () { el.remove(); ok(); }, D + 60);
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
  Directeur.prototype.finPartie = function (score) { var _kwVie = this._vie;
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
    if (res.defi.nouveau) _kwVie.setTimeout(function () { self.banniere('Défi du jour réussi !', 0.9, '#FFD23F'); self.lance('confettis', self.position({}), 0.9); self.son('pepite'); }, res.nouveauRecord ? 1500 : 0);
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
    if (this._detruit || this.enPause) return this; this.enPause = true; this._vie.pause(); var m = this.particules; m.tempsCible = 0; m.temps = 0;
    if (this.audio.ctx && this.audio.ctx.state === 'running') { this._sonEnPause = true; promesseAudio(this.audio.ctx.suspend()); }
    return this;
  };
  Directeur.prototype.reprendre = function () {
    if (this._detruit || !this.enPause) return this; this.enPause = false; this._vie.reprendre(); var m = this.particules; m.tempsCible = 1; m.temps = 1; m.dernier = 0;
    if (this._sonEnPause && this.audio.ctx) { this._sonEnPause = false; promesseAudio(this.audio.ctx.resume()); }
    m.redim(); if (m.n || m.ambiances.length) m.demarre();
    return this;
  };
  Directeur.prototype.installerV21 = function () { var _kwVie = this._vie;
    var self = this;
    if (this.opt.pauseAuto !== false && global.document) {
      this._vis = function () { if (document.hidden) { if (!self.enPause) { self.pause(); self._pauseAuto = true; } } else if (self._pauseAuto) { self._pauseAuto = false; self.reprendre(); } };
      _kwVie.ecoute(document, 'visibilitychange', this._vis);
    }
  };

  /* --- Lame tactile : traînée lumineuse qui suit le doigt (jeux de découpe, tracés, mots) --- */
  Directeur.prototype.lame = function (o) { var _kwVie = this._vie;
    o = o || {};
    var self = this, zone = o.zone || (this.plein ? document.body : this.conteneur);
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(_kwVie.root(c));
    var ctx = c.getContext('2d'), dpr = 1, pts = [], actif = false, raf = 0, dernierSon = 0, dernierEclat = 0;
    var cs = this.theme.couleurs, coul = o.couleur || cs[1] || '#FFD23F', largeur = o.largeur || (this.opt.public === 'petit' ? 16 : 12), duree = o.duree || 150;
    function redim() { var t = self.taille(); dpr = Math.min(2, global.devicePixelRatio || 1); c.width = Math.round(t.l * dpr); c.height = Math.round(t.h * dpr); }
    function local(ev) { var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(); return { x: ev.clientX - b.left, y: ev.clientY - b.top }; }
    function dessine() {
      var t = _kwVie.maintenant(); while (pts.length && t - pts[0].t > duree) pts.shift();
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
      if (pts.length || actif) raf = _kwVie.requestAnimationFrame(dessine); else { raf = 0; ctx.clearRect(0, 0, c.width, c.height); }
    }
    function bouge(ev) {
      if (!actif) return;
      var p = local(ev), t = _kwVie.maintenant(), der = pts[pts.length - 1];
      var v = der ? Math.hypot(p.x - der.x, p.y - der.y) / Math.max(1, t - der.t) * 1000 : 0; // px/s
      pts.push({ x: p.x, y: p.y, t: t }); if (pts.length > 40) pts.shift();
      if (v > 1400 && t - dernierSon > 220 && self.opt.sons) { dernierSon = t; if (!self.audio.echantillon('vent', { vol: 0.35, demi: hasard(3, 7) })) self.audio.souffle(0.12, 2600, 900, 0.12); }
      if (v > 1800 && o.etincelles !== false && t - dernierEclat > 90) { dernierEclat = t; self.particules.systeme('crepitement', p.x, p.y, 0.4, { couleurs: self.theme.couleurs }); }
      if (o.onGlisse) o.onGlisse(p.x, p.y, v);
      if (!raf) raf = _kwVie.requestAnimationFrame(dessine);
    }
    function bas(ev) { actif = true; pts = []; bouge(ev); }
    function haut() { actif = false; }
    redim(); _kwVie.ecoute(global, 'resize', redim);
    var toucheAvant = zone.style.touchAction; _kwVie.restore(function () { zone.style.touchAction = toucheAvant; }); zone.style.touchAction = 'none'; // sinon le navigateur fait défiler la page au lieu de suivre le doigt
    _kwVie.ecoute(zone, 'pointerdown', bas); _kwVie.ecoute(zone, 'pointermove', bouge);
    _kwVie.ecoute(global, 'pointerup', haut); _kwVie.ecoute(global, 'pointercancel', haut);
    return {
      couleur: function (x) { coul = x; },
      arreter: function () {
        _kwVie.oublie(zone, 'pointerdown', bas); _kwVie.oublie(zone, 'pointermove', bouge);
        _kwVie.oublie(global, 'pointerup', haut); _kwVie.oublie(global, 'pointercancel', haut); _kwVie.oublie(global, 'resize', redim);
        zone.style.touchAction = toucheAvant; if (raf) _kwVie.cancelAnimationFrame(raf); c.remove();
      }
    };
  };

  /* --- Compteur qui roule : le score défile jusqu'à sa nouvelle valeur, puis « pop » --- */
  Directeur.prototype.compteur = function (el, valeur, o) { var _kwVie = this._vie;
    if (!el) return this; o = o || {};
    var depart = el._kwfxVal != null ? el._kwfxVal : (parseInt(String(el.textContent).replace(/\D/g, ''), 10) || 0);
    var prefixe = o.prefixe || '', ecart = valeur - depart, duree = o.duree || borne(300 + Math.abs(ecart) * 6, 300, 1100), t0 = _kwVie.maintenant(), self = this;
    el._kwfxVal = valeur; if (el._kwfxRaf) _kwVie.cancelAnimationFrame(el._kwfxRaf);
    (function pas() {
      var k = Math.min(1, (_kwVie.maintenant() - t0) / duree), e = 1 - Math.pow(1 - k, 3);
      el.textContent = prefixe + Math.round(depart + ecart * e).toLocaleString('fr-FR');
      if (k < 1) el._kwfxRaf = _kwVie.requestAnimationFrame(pas);
      else if (ecart > 0 && el.animate) {
        _kwVie.anime(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
        _kwVie.anime(el, [{ color: self.theme.couleurs[1] || '#FFD23F' }, { color: getComputedStyle(el).color }], { duration: 500 });
      }
    })();
    return this;
  };

  /* --- Étoiles de fin de niveau (1 à 3), révélées une par une avec son qui monte --- */
  var ETOILE_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M12 1.8l3 6.4 7 .8-5.2 4.8 1.4 6.9L12 17.2l-6.2 3.5 1.4-6.9L2 9l7-.8z" fill="FILL" stroke="STROKE" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  Directeur.prototype.etoilesFin = function (n, o) { var _kwVie = this._vie;
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
    _kwVie.anime(boite, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }], { duration: 280, easing: 'ease-out' });
    var base = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect();
    return new Promise(function (fin) {
      var i = 0;
      function suivante() {
        if (i >= n) { if (n === 3) { self.halo(0.8); self.banniere(o.message || 'Tro for !', 0.9); self.vibre('victoire'); }
          _kwVie.setTimeout(function () { if (!o.garder) { var an = _kwVie.anime(boite, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }); an.onfinish = function () { boite.remove(); }; } fin(n); }, o.garder ? 0 : 1500); return; }
        var sl = slots[i];
        sl.innerHTML = ETOILE_SVG.replace('FILL', '#FFD23F').replace('STROKE', '#B8860B');
        _kwVie.anime(sl, [{ transform: sl.style.transform + ' scale(2.2) rotate(-40deg)', opacity: 0 }, { transform: sl.style.transform + ' scale(.9) rotate(8deg)', opacity: 1, offset: 0.6 }, { transform: sl.style.transform + ' scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.3)' });
        _kwVie.setTimeout(function () {
          var r = sl.getBoundingClientRect(), p = { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
          self.lance('eclat', p, 0.55 + i * 0.15, { couleurs: ['#FFD23F', '#FFFFFF', '#FFB000'] });
          if (self.opt.sons) { if (!self.audio.echantillon('bonne', { demi: [0, 4, 7][i], varier: false })) self.audio.note(hz([0, 4, 7][i] + 12), 0.18, 'triangle', 0.18); }
          if (self.pub.secousse && i === 2) self.secousse(0.3);
          self.vibre('bonne');
          i++; _kwVie.setTimeout(suivante, 380);
        }, 250);
      }
      _kwVie.setTimeout(suivante, 300);
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
  Directeur.prototype.apparait = function (el, style, o) { var _kwVie = this._vie;
    if (!el || !el.animate) return Promise.resolve(); o = o || {};
    var k = APPARITIONS[style] || APPARITIONS.rebond;
    var an = _kwVie.anime(el, k, { duration: o.duree || (this.opt.public === 'petit' ? 620 : 480), delay: o.retard || 0, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'backwards' });
    if (this.lum.elements && el._kwfxH != null) _kwVie.anime(el, [{ filter: this.ombreCss(1) }, { filter: this.ombreCss(el._kwfxH) }], { duration: o.duree || 480, delay: o.retard || 0, easing: 'ease-out', fill: 'backwards' });
    if (o.son !== false && this.opt.sons) { var self = this; _kwVie.setTimeout(function () { self.audio.echantillon('clic', { demi: hasard(5, 10), vol: 0.5 }); }, o.retard || 0); }
    return an.finished || Promise.resolve();
  };
  Directeur.prototype.disparait = function (el, style, o) { var _kwVie = this._vie;
    if (!el || !el.animate) return Promise.resolve(); o = o || {};
    var k = (APPARITIONS[style] || APPARITIONS.rebond).slice().reverse().map(function (f) { var c = {}; for (var x in f) c[x] = f[x]; if (c.offset != null) c.offset = 1 - c.offset; return c; });
    var an = _kwVie.anime(el, k, { duration: o.duree || 360, delay: o.retard || 0, easing: 'cubic-bezier(.6,0,.8,.4)', fill: 'forwards' });
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
  Directeur.prototype.meteo = function (nom, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules, mt = METEOS[nom], force = o.force == null ? 1 : borne(o.force, 0.2, 1.5);
    if (this.opt.support === 'epub') force *= 0.6;
    m.ambiances = m.ambiances.filter(function (a) { return !a.meteo; });
    _kwVie.clearTimeout(this._eclair); if (this._balance) { this._balance.cancel(); this._balance = null; }
    if (this._voile) { var v = this._voile; _kwVie.anime(v, [{ opacity: 1 }, { opacity: 0 }], { duration: 800 }).onfinish = function () { v.remove(); }; this._voile = null; }
    this.sonMeteo(null);
    this.meteoActive = mt ? nom : null;
    if (!mt) return this;
    mt.calques.forEach(function (e, i) { m.ambiances.push({ di: m.def('meteo:' + nom + ':' + i, e), debit: e.debit * force, acc: 0, meteo: true }); });
    m.demarre();
    if (mt.voile) { this._voile = this.calqueDiv('inset:0;background:radial-gradient(ellipse at 50% 0%, transparent 20%, ' + mt.voile + ' 100%)'); _kwVie.anime(this._voile, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: 'forwards' }); }
    if (mt.son && this.opt.sons) this.sonMeteo(mt.son, force);
    if (mt.eclairs) { var eclair = function () { self.eclair(); self._eclair = _kwVie.setTimeout(eclair, hasard(mt.eclairs[0], mt.eclairs[1])); }; this._eclair = _kwVie.setTimeout(eclair, hasard(1200, 3000)); }
    if (mt.balance && this.opt.secousses) { var cible = this.cibleEcran(); if (cible && cible.animate) this._balance = _kwVie.anime(cible, [{ transform: 'rotate(0)' }, { transform: 'rotate(-.6deg) translateX(-3px)' }, { transform: 'rotate(.4deg) translateX(2px)' }, { transform: 'rotate(0)' }], { duration: 2600, iterations: Infinity, easing: 'ease-in-out' }); }
    return this;
  };
  /* Éclair : double flash blanc-bleu puis tonnerre qui roule (bruit grave filtré) */
  Directeur.prototype.eclair = function () { var _kwVie = this._vie;
    var self = this; this.flash('#E8F0FF', 0.55); _kwVie.setTimeout(function () { self.flash('#FFFFFF', 0.35); }, 120);
    var c = this.opt.sons && this.audio.pret(); if (!c) return;
    var dur = hasard(1.6, 2.6), b = c.createBuffer(1, Math.round(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < d.length; i++) { last = (last + 0.04 * (Math.random() * 2 - 1)) / 1.04; d[i] = last * 3.2; }
    var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + hasard(0.25, 0.7);
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = 260; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.9 * this.opt.volume * this.pub.son, t + 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t);
  };
  /* Son de pluie / vent : bruit blanc en boucle, filtré ; le cyclone « hurle » (filtre modulé) */
  Directeur.prototype.sonMeteo = function (cfg, force) { var _kwVie = this._vie;
    if (this._sonMeteo) { var a = this._sonMeteo, c0 = this.audio.ctx; try { a.g.gain.setTargetAtTime(0, c0.currentTime, 0.4); _kwVie.setTimeout(function () { try { a.s.stop(); if (a.lfo) a.lfo.stop(); } catch (e) {} }, 1500); } catch (e) {} this._sonMeteo = null; }
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

  Directeur.prototype.musique = function (actif, o) { var _kwVie = this._vie;
    o = o || {}; var self = this;
    if (this._mus) { var old = this._mus; _kwVie.clearInterval(old.timer); old.g.gain.setTargetAtTime(0, old.c.currentTime, 0.3); _kwVie.setTimeout(function () { old.g.disconnect(); }, 1500); this._mus = null; }
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
      if (self.enPause || self._detruit) return; if (prochain < c.currentTime - 0.3) prochain = c.currentTime + 0.05;
      var niveau = self.e.serie >= 10 ? 2 : self.e.serie >= 5 ? 1 : 0;
      while (prochain < c.currentTime + 0.15) {
        var p = pas % st.pas, mesure = Math.floor(pas / st.pas), t = prochain + quand(p) + (Math.random() - 0.5) * 0.006;
        if (nom === 'maloya') maloya(t, p, mesure, niveau); else if (nom === 'sega') sega(t, p, mesure, niveau); else doux(t, p, mesure, niveau);
        pas++; prochain += dPas;
      }
    }
    var timer = _kwVie.setInterval(planifier, 30); planifier();
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
  Directeur.prototype.soulever = function (el, h, duree) { var _kwVie = this._vie;
    if (!el || !el.animate) return Promise.resolve(); var b = el._kwfxH == null ? 0.15 : el._kwfxH, hh = h == null ? 0.8 : h;
    var an = _kwVie.anime(el, [{ transform: 'translateY(0) scale(1)', filter: this.ombreCss(b) }, { transform: 'translateY(-' + Math.round(10 + hh * 16) + 'px) scale(' + (1 + hh * 0.08).toFixed(3) + ')', filter: this.ombreCss(hh), offset: 0.4 },
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
  Directeur.prototype.rayons = function (actif, o) { var _kwVie = this._vie;
    o = o || {};
    if (this._rayons) { var r0 = this._rayons; _kwVie.anime(r0, [{ opacity: 1 }, { opacity: 0 }], { duration: 600 }).onfinish = function () { r0.remove(); }; this._rayons = null; }
    if (actif === false) return this;
    var p = this.positionLumiere(), coul = o.couleur || this.lum.rayonsCouleur || '255,236,190', f = (o.force == null ? 1 : o.force) * (0.5 + this.lum.force * 1.6);
    var el = this.calqueDiv('inset:-20%;mix-blend-mode:screen;transform-origin:' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px;' +
      'background:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, rgba(' + coul + ',' + (0.5 * f).toFixed(2) + ') 0, rgba(' + coul + ',0) ' + Math.round(Math.max(p.l, p.h) * 0.35) + 'px),' +
      'repeating-conic-gradient(from 0deg at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, rgba(' + coul + ',0) 0deg, rgba(' + coul + ',' + (0.16 * f).toFixed(2) + ') 2.5deg, rgba(' + coul + ',0) 6deg, rgba(' + coul + ',0) 9deg, rgba(' + coul + ',' + (0.09 * f).toFixed(2) + ') 11deg, rgba(' + coul + ',0) 14deg);' +
      '-webkit-mask-image:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, #000 0, rgba(0,0,0,.6) 40%, transparent 85%);mask-image:radial-gradient(circle at ' + (p.x + p.l * 0.2) + 'px ' + (p.y + p.h * 0.2) + 'px, #000 0, rgba(0,0,0,.6) 40%, transparent 85%)');
    _kwVie.anime(el, [{ transform: 'rotate(-1.5deg)', opacity: 0.75 }, { transform: 'rotate(1.5deg)', opacity: 1 }], { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    this._rayons = el; return this;
  };

  /* --- sources de lumière (lanterne, bougie, lave, luciole) + nuit qui assombrit le reste --- */
  Directeur.prototype.sourceLumiere = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var self = this;
    var src = { x: x, y: y, couleur: o.couleur || '#FFC46B', rayon: o.rayon || 140, scintille: o.scintille !== false, force: o.force == null ? 1 : o.force };
    var rgb = versRgb(src.couleur).join(',');
    var el = this.calqueDiv('left:0;top:0;width:' + src.rayon * 2 + 'px;height:' + src.rayon * 2 + 'px;margin:-' + src.rayon + 'px 0 0 -' + src.rayon + 'px;border-radius:50%;mix-blend-mode:screen;' +
      'background:radial-gradient(circle, rgba(' + rgb + ',' + (0.55 * src.force).toFixed(2) + ') 0, rgba(' + rgb + ',' + (0.22 * src.force).toFixed(2) + ') 30%, rgba(' + rgb + ',0) 70%)');
    src.el = el;
    function place() { el.style.transform = 'translate(' + src.x + 'px,' + src.y + 'px)'; }
    place();
    if (src.scintille) _kwVie.anime(el, [{ opacity: 1, filter: 'brightness(1)' }, { opacity: 0.82, filter: 'brightness(.9)' }, { opacity: 1, filter: 'brightness(1.1)' }, { opacity: 0.9 }], { duration: 900 + Math.random() * 500, iterations: Infinity, direction: 'alternate' });
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
  Directeur.prototype.heure = function (nom) { var _kwVie = this._vie;
    var h = HEURES[nom] || HEURES.midi, self = this;
    this.lumiere(h.lum); this.lum.rayonsCouleur = h.rayons;
    if (this._grade) { var g0 = this._grade; _kwVie.anime(g0, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).onfinish = function () { g0.remove(); }; this._grade = null; }
    if (h.grade) { this._grade = this.calqueDiv('inset:0;mix-blend-mode:soft-light;background:' + h.grade); _kwVie.anime(this._grade, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200, fill: 'forwards' }); }
    if (this._nuit) { var n0 = this._nuit; _kwVie.anime(n0, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 }).onfinish = function () { n0.remove(); }; this._nuit = null; }
    if (h.nuit) { var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; c._couleur = h.nuit; this.calque.insertBefore(c, this.calque.firstChild); this._nuit = c; this.dessineNuit(); _kwVie.anime(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 1200 }); }
    if (this._rayons) this.rayons(true);
    this.heureActive = nom; return this;
  };

  /* --- distance : parallaxe, brume et flou de profondeur sur [data-kwfx-z] --- */
  Directeur.prototype.profondeur = function (racine, o) { var _kwVie = this._vie;
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
      if (Math.abs(cible[0] - cur[0]) + Math.abs(cible[1] - cur[1]) > 0.002) raf = _kwVie.requestAnimationFrame(anime); else raf = 0;
    }
    function vers(x, y) { cible[0] = borne(x, -1, 1); cible[1] = borne(y, -1, 1); if (!raf) raf = _kwVie.requestAnimationFrame(anime); }
    function souris(e) { var b = R.getBoundingClientRect(); vers((e.clientX - b.left) / b.width * 2 - 1, (e.clientY - b.top) / b.height * 2 - 1); }
    function incline(e) { if (e.gamma == null) return; vers(e.gamma / 30, (e.beta - 40) / 30); }
    _kwVie.ecoute(R, 'pointermove', souris); _kwVie.ecoute(global, 'deviceorientation', incline);
    filtres(); vers(0, 0);
    this._profStop = function () { _kwVie.oublie(R, 'pointermove', souris); _kwVie.oublie(global, 'deviceorientation', incline); if (raf) _kwVie.cancelAnimationFrame(raf); };
    this._profFiltres = filtres;
    return { arreter: function () { self._profStop(); }, actualiser: filtres };
  };
  /* mise au point : ce qui est à la distance z est net, le reste est flou (comme un objectif photo) */
  Directeur.prototype.miseAuPoint = function (z) { if (this._prof) { this._prof.focus = borne(z, 0, 1); this._profFiltres(); } return this; };

  /* --- reflets : brillance spéculaire côté lumière + éclat qui balaye --- */
  Directeur.prototype.brillance = function (el, o) { var _kwVie = this._vie;
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
      _kwVie.anime(bande, [{ transform: 'translateX(-60%)' }, { transform: 'translateX(60%)', offset: 0.35 }, { transform: 'translateX(60%)' }], { duration: o.periode || 3200, iterations: Infinity, delay: Math.random() * 1500, easing: 'ease-in-out' });
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
  Directeur.prototype.reflets = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this;
    if (this._surface) { this._surface.remove(); this._surface = null; }
    if (o.actif === false) { this.refl = null; return this; }
    var t = this.taille(), y = o.y != null ? (o.y <= 1 ? o.y * t.h : o.y) : t.h * 0.78, type = o.type || 'eau';
    this.refl = { actif: true, y: y, type: type, force: o.force == null ? 0.45 : o.force };
    var sf = this.calqueDiv('left:0;right:0;top:' + y + 'px;bottom:0;' + (type === 'eau'
      ? 'background:linear-gradient(180deg, rgba(255,255,255,.28), rgba(144,224,239,.10) 2px, rgba(0,119,182,.18) 40%, rgba(3,4,94,.28));'
      : 'background:linear-gradient(180deg, rgba(255,255,255,.22), rgba(255,255,255,.05) 2px, rgba(0,0,0,.12));'));
    sf.style.zIndex = '-1'; this.calque.insertBefore(sf, this.calque.firstChild);
    if (type === 'eau') { var vag = document.createElement('div'); vag.style.cssText = 'position:absolute;inset:0;background:repeating-linear-gradient(180deg, rgba(255,255,255,.10) 0 1px, transparent 1px 9px);'; sf.appendChild(vag); _kwVie.anime(vag, [{ transform: 'translateY(0)' }, { transform: 'translateY(9px)' }], { duration: 1800, iterations: Infinity }); }
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
  Directeur.prototype.fontaine = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules, actif = true, p = { x: x, y: y };
    (function jet() { if (!actif) return; if (!self.enPause) m.systeme('jetEau', p.x, p.y, 0.5, { couleurs: JET }); _kwVie.setTimeout(jet, o.cadence || 45); })();
    return { deplacer: function (nx, ny) { p.x = nx; p.y = ny; }, arreter: function () { actif = false; } };
  };
  Directeur.prototype.goutte = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules, y0 = Math.max(0, y - (o.hauteur || 260)), cle = 'chute:' + Math.round((y - y0) / 20) * 20;
    var di = m.def(cle, { nb: 1, fixe: true, vie: 3, vitesse: 0, taille: o.taille || 4.5, couleur: o.couleur ? 'fruit' : EAU, gravite: 1600, liquide: true, etirement: 0.003, etirementMax: 1.4, sol: { decalage: Math.round((y - y0) / 20) * 20, mort: true, sous: o.couleur ? 'eclaboussure' : 'plouf' } });
    m.emettre(di, x, y0, 0.5, { couleur: o.couleur, couleurs: EAU }, 1);
    _kwVie.setTimeout(function () { if (!o.couleur) { self.sonEau(0.5); if (self._eau) self._eau.eclabousser(x, 6); else self.ondulation(x, y); } }, Math.sqrt(2 * (y - y0) / 1600) * 1000);
    return this;
  };

  /* --- surface d'eau vivante (ressorts) --- */
  Directeur.prototype.eau = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this;
    if (this._eau) { this._eau.arreter(); this._eau = null; }
    if (o.actif === false) { if (this._surface) this._surface.style.display = ''; return this; }
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(_kwVie.root(c));
    var ctx = c.getContext('2d'), dpr = 1, L = 0, H = 0, pas = this.opt.support === 'epub' ? 10 : 6, n = 0, h = [], v = [], raf = 0, t0 = _kwVie.maintenant(), niveau = o.y == null ? 0.75 : o.y;
    var coul = o.couleur || '#1E88C8', rgb = versRgb(coul), actif = true, flotteurs = [];
    function redim() { var t = self.taille(); L = t.l; H = t.h; dpr = Math.min(2, global.devicePixelRatio || 1); c.width = Math.round(L * dpr); c.height = Math.round(H * dpr); n = Math.ceil(L / pas) + 2; h = new Float32Array(n); v = new Float32Array(n); }
    function base() { return niveau <= 1 ? niveau * H : niveau; }
    function hauteur(x) { var i = x / pas, a = Math.floor(i), f = i - a; a = borne(a, 0, n - 2); var tt = (_kwVie.maintenant() - t0) / 1000; return base() + h[a] + (h[a + 1] - h[a]) * f + Math.sin(x * 0.018 + tt * 1.6) * 3 + Math.sin(x * 0.043 - tt * 2.3) * 1.6; }
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
      var tt = (_kwVie.maintenant() - t0) / 1000, y0 = base(), lu = self.lum, nuit = self.heureActive === 'nuit' ? 0.45 : 1, a = lu.angle * Math.PI / 180, lx = Math.cos(a), ly = -Math.sin(a);
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
      raf = _kwVie.requestAnimationFrame(dessine);
    }
    var der = null;
    function bouge(ev) { var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), x = ev.clientX - b.left, y = ev.clientY - b.top, t = _kwVie.maintenant();
      if (der) { var vy = (y - der.y) / Math.max(1, t - der.t) * 16, dist = Math.abs(y - hauteur(x)); if (dist < 30) eclabousser(x, borne(Math.abs(vy) * 1.2 + Math.abs(x - der.x) * 0.15, 0, 20), Math.abs(vy) > 9); }
      der = { x: x, y: y, t: t }; }
    redim(); _kwVie.ecoute(global, 'resize', redim); _kwVie.ecoute(this.conteneur, 'pointermove', bouge);
    if (this._surface) this._surface.style.display = 'none';
    raf = _kwVie.requestAnimationFrame(dessine);
    this._eau = {
      eclabousser: eclabousser, hauteur: hauteur, niveau: function (y) { niveau = y; }, _flotteurs: flotteurs,
      arreter: function () { actif = false; _kwVie.cancelAnimationFrame(raf); _kwVie.oublie(self.conteneur, 'pointermove', bouge); _kwVie.oublie(global, 'resize', redim); c.remove(); }
    };
    return this._eau;
  };

  /* --- ronds dans l'eau (vue de côté : ellipses ; vue de dessus : cercles) --- */
  Directeur.prototype.ondulation = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var k = o.vueDessus ? 1 : 0.32, R = o.rayon || 90;
    for (var i = 0; i < 3; i++) (function (i, self) {
      var el = self.calqueDiv('left:' + x + 'px;top:' + y + 'px;width:' + R * 2 + 'px;height:' + R * 2 * k + 'px;margin:-' + R * k + 'px 0 0 -' + R + 'px;border-radius:50%;' +
        'border:2px solid rgba(255,255,255,.75);box-shadow:inset 0 2px 3px rgba(255,255,255,.45),0 2px 3px rgba(0,40,80,.25)');
      _kwVie.anime(el, [{ transform: 'scale(.05)', opacity: 0 }, { transform: 'scale(.3)', opacity: 0.9, offset: 0.15 }, { transform: 'scale(1)', opacity: 0 }], { duration: 1400, delay: i * 260, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'backwards' }).onfinish = function () { el.remove(); };
    })(i, this);
    return this;
  };

  /* --- faire flotter un élément : sur l'eau (suit les vagues) ou en apesanteur (dérive lente) --- */
  Directeur.prototype.flotter = function (el, o) { var _kwVie = this._vie;
    if (!el) return { arreter: function () {} }; o = o || {}; var self = this, t0 = _kwVie.maintenant() + Math.random() * 4000, actif = true, raf = 0, ph = Math.random() * 6.28;
    var baseT = el.style.transform || ''; _kwVie.restore(function () { el.style.transform = baseT; });
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
      if (!surEau()) { var t = (_kwVie.maintenant() - t0) / 1000, amp = o.amplitude || 14;
        el.style.transform = baseT + ' translate(' + (Math.sin(t * 0.7 + ph) * amp * 0.8).toFixed(1) + 'px,' + (Math.sin(t * 0.9 + ph * 2) * amp).toFixed(1) + 'px) rotate(' + (Math.sin(t * 0.5 + ph) * 12).toFixed(1) + 'deg)'; }
      raf = _kwVie.requestAnimationFrame(boucle);
    }
    boucle();
    return { arreter: function () { actif = false; _kwVie.cancelAnimationFrame(raf); el.style.transform = baseT; } };
  };

  /* --- apesanteur --- */
  Directeur.prototype.apesanteur = function (actif, o) { var _kwVie = this._vie;
    o = o || {}; var m = this.particules, self = this, de = { g: m.gravite, a: m.apes }, vers = actif === false ? { g: 1, a: 0 } : { g: o.gravite == null ? 0.02 : o.gravite, a: 1 }, t0 = _kwVie.maintenant(), D = o.duree || 900;
    (function pas() { var k = Math.min(1, (_kwVie.maintenant() - t0) / D), e = k * k * (3 - 2 * k); m.gravite = de.g + (vers.g - de.g) * e; m.apes = de.a + (vers.a - de.a) * e; if (k < 1) _kwVie.requestAnimationFrame(pas); })();
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

  Directeur.prototype.vent = function (v, o) { var _kwVie = this._vie;
    o = o || {}; var m = this.particules, de = m.vent, t0 = _kwVie.maintenant(), D = o.duree || 1200; v = v || 0;
    (function pas() { var k = Math.min(1, (_kwVie.maintenant() - t0) / D); m.vent = de + (v - de) * k * k * (3 - 2 * k); if (k < 1) _kwVie.requestAnimationFrame(pas); })();
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
  Directeur.prototype.panache = function (x, y, o) { var _kwVie = this._vie;
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
      _kwVie.setTimeout(jet, (defs.cad || 110) / Math.max(0.2, k));
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
  Directeur.prototype.reduireEnCendres = function (el, o) { var _kwVie = this._vie;
    if (!el) return this; o = o || {}; var self = this, D = o.duree || 1300, t0 = maintenant(), m = this.particules;
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top;
    _kwVie.anime(el, [{ filter: 'none', clipPath: 'inset(0 0 0 0)' }, { filter: 'sepia(.8) brightness(.75) contrast(1.3)', offset: 0.25, clipPath: 'inset(0 0 20% 0)' }, { filter: 'sepia(1) brightness(.25) contrast(1.6)', clipPath: 'inset(0 0 100% 0)' }], { duration: D, easing: 'cubic-bezier(.4,0,.7,1)', fill: 'forwards' });
    (function brule() {
      var k = Math.min(1, (maintenant() - t0) / D), yl = y0 + r.height * (1 - k);
      for (var i = 0; i < 2; i++) { var xx = x0 + Math.random() * r.width; m.systeme('cendresVol', xx, yl, 0.25, {}); }
      if (Math.random() < 0.5) m.systeme('fumee', x0 + Math.random() * r.width, yl, 0.4, {});
      if (k < 1) _kwVie.setTimeout(brule, 45); else { m.systeme('fumeeNoire', x0 + r.width / 2, y0 + r.height * 0.3, 0.5, {}); if (o.fini) o.fini(); }
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
  Directeur.prototype._cielInit = function () { var _kwVie = this._vie;
    if (this._ciel) return this._ciel; var self = this, m = this.particules;
    var mk = function (z) { var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (self.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + z; self.conteneur.appendChild(_kwVie.root(c)); return c; };
    var C = { c: mk(9996), v: null, cfg: null, nuages: 0, rideaux: 0, flash: 0, fx: 0, eclairs: [], gouttes: [], vitre: 0, rot: 0, t: 0, ox: [0, 0], els: [], raf: 0, der: 0, ventBase: 0, rafale: 0.5, tex: texNuage(640, 220), sg: spriteGoutte(), teinte: [60, 70, 90] };
    C.ctx = C.c.getContext('2d'); C.puff = (function () { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; })();
    function taille() { var t = self.taille(), d = Math.min(2, global.devicePixelRatio || 1); C.L = t.l; C.H = t.h; C.dpr = d; [C.c, C.v].forEach(function (c) { if (c) { c.width = Math.round(t.l * d); c.height = Math.round(t.h * d); } }); }
    C.taille = taille; taille(); _kwVie.ecoute(global, 'resize', taille);
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
      var now = _kwVie.maintenant();
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
      if (vivant) C.raf = _kwVie.requestAnimationFrame(boucle); else { C.raf = 0; C.der = 0; ctx.clearRect(0, 0, L, H); if (C.vctx) C.vctx.clearRect(0, 0, L, H); }
    }
    C.reveille = function () { if (!C.raf) C.raf = _kwVie.requestAnimationFrame(boucle); };
    this._ciel = C; return C;
  };

  /* éclair ramifié : la scène s'éclaire depuis l'éclair, impact au sol s'il est proche, tonnerre retardé selon la distance */
  Directeur.prototype.eclair = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this, C = this._cielInit(), L = C.L, H = C.H, proche = o.proche != null ? o.proche : Math.random() < 0.4;
    var x = o.x != null ? o.x : L * hasard(0.15, 0.85), y0 = H * hasard(0.05, 0.15), y1 = proche ? this.zoneSure().y2 : H * hasard(0.22, 0.38), segs = [];
    segmentsEclair(x + hasard(-60, 60), y0, x, y1, (y1 - y0) * 0.22, proche ? 1.3 : 0.8, segs, 0);
    C.eclairs.push({ segs: segs, t0: maintenant(), triple: Math.random() < 0.5 }); C.flash = proche ? 1 : 0.6; C.fx = x; C.reveille();
    this.flash('#E8F0FF', proche ? 0.5 : 0.22); _kwVie.setTimeout(function () { self.flash('#FFFFFF', proche ? 0.3 : 0.12); if (!self.opt.reduireAnimations) C.flash = Math.max(C.flash, 0.7); }, 120);
    if (proche) {
      var lu = this.lum, av = { angle: lu.angle, hauteur: lu.hauteur, force: lu.force, teinte: lu.teinte }, ang = Math.atan2(H / 2 - y0, x - L / 2) * 180 / Math.PI;
      this.lumiere({ angle: ang, hauteur: 0.55, force: 0.6, teinte: '#0a1230' }); _kwVie.setTimeout(function () { self.lumiere(av); }, 300);
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
  Directeur.prototype.alerteCyclone = function (niveau) { var _kwVie = this._vie;
    if (this._alerte) { this._alerte.remove(); this._alerte = null; } if (!niveau) return this;
    var coul = { jaune: '#E9B500', orange: '#F07C00', rouge: '#D62828', violette: '#6A2C91' }[niveau] || '#F07C00';
    var el = this.calqueDiv('right:16px;top:16px;padding:6px 12px;border-radius:999px;background:' + coul + ';color:#fff;font:700 13px/1.2 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);z-index:3');
    el.textContent = 'Alerte ' + niveau + ' cyclonique'; _kwVie.anime(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1600, iterations: Infinity });
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
  Directeur.prototype.briser = function (el, o) { var _kwVie = this._vie;
    if (!el) return this; o = o || {}; var m = this.particules, b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect();
    var x0 = r.left - b.left, y0 = r.top - b.top, cx = x0 + r.width / 2, cy = y0 + r.height / 2, cols = o.couleur ? [o.couleur, '#FFFFFF', o.couleur] : VERRE;
    var di = m.def('bris', SYSTEMES.eclatsVerre[0]), n = Math.round(Math.min(40, 10 + r.width * r.height / 500) * m.qualite);
    for (var i = 0; i < n; i++) { var px = x0 + Math.random() * r.width, py = y0 + Math.random() * r.height; m.emettre(di, px, py, 0.6 + Math.random() * 0.6, { couleurs: cols }, 1); var j = m.n - 1; if (j >= 0) { var dx = px - cx, dy = py - cy, dd = Math.hypot(dx, dy) + 1; m.VX[j] = dx / dd * hasard(120, 420); m.VY[j] = dy / dd * hasard(120, 420) - 180; } }
    m.systeme('eclatsVerre', cx, cy, 0.5, { couleurs: cols }); m.demarre();
    _kwVie.anime(el, [{ opacity: 1, transform: getComputedStyle(el).transform === 'none' ? 'scale(1)' : getComputedStyle(el).transform }, { opacity: 0, transform: 'scale(1.06)' }], { duration: 140, fill: 'forwards' });
    if (this.opt.secousses) this.secousse(0.25); this.sonVerre(0.9); this.vibre('erreur');
    return this;
  };
  /* reflet vivant : un double de l'élément, retourné sous la ligne d'eau ou de sol, qui suit ses mouvements */
  Directeur.prototype.refletVivant = function (el, o) { var _kwVie = this._vie;
    if (!el) return { arreter: function () {} }; o = o || {}; var self = this;
    if (!this._ondeSvg) { var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('width', '0'); sv.setAttribute('height', '0'); sv.style.position = 'absolute';
      sv.innerHTML = '<filter id="kwfx-onde" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="1" seed="3"><animate attributeName="baseFrequency" dur="5s" values="0.012 0.09;0.016 0.12;0.012 0.09" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>';
      document.body.appendChild(_kwVie.root(sv)); this._ondeSvg = sv; }
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
      raf = _kwVie.requestAnimationFrame(suit);
    })();
    function arreter() { actif = false; _kwVie.cancelAnimationFrame(raf); hote.remove(); }
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
  Perso.prototype.chuter = function (o) { var _kwVie = this.fx._vie;
    o = o || {}; var self = this, fx = this.fx;
    return this.sequence([[0, null], [0.12, POSES.trebuche()], [0.55, POSES.allonge(), 'in']], function () {
      fx.particules.systeme('poussiere', self.x + self.dir * self.H * 0.5, self.sol, 0.8, {}); fx.particules.systeme('etoiles', self.x + self.dir * self.H * 0.85, self.sol - self.H * 0.2, 0.25, { couleurs: ['#FFD23F', '#FFFFFF'] });
      if (fx.opt.secousses) fx.secousse(0.18); self.son('chute'); self.etat = 'allonge'; self.idle = 'debout';
      self.dernier = POSES.allonge(); self.prec = null;
      if (o.releve !== false) return new Promise(function (r) { _kwVie.setTimeout(function () { self.relever().then(r); }, o.attente || 900); });
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

  Directeur.prototype.personnage = function (o) { var _kwVie = this._vie;
    var self = this;
    if (!this._scene) {
      var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9995';
      this.conteneur.appendChild(_kwVie.root(c)); var S = this._scene = { c: c, ctx: c.getContext('2d'), persos: [], raf: 0, der: 0 };
      var redim = function () { var t = self.taille(), d = Math.min(2, global.devicePixelRatio || 1); S.L = t.l; S.H = t.h; S.d = d; c.width = Math.round(t.l * d); c.height = Math.round(t.h * d); };
      redim(); _kwVie.ecoute(global, 'resize', redim);
      S.boucle = function (ts) {
        var dt = S.der ? Math.min(0.05, (ts - S.der) / 1000) : 0.016; S.der = ts; if (self.enPause) dt = 0; dt *= self.particules.temps;
        S.persos = S.persos.filter(function (p) { return !p.mort; });
        var ctx = S.ctx; ctx.setTransform(S.d, 0, 0, S.d, 0, 0); ctx.clearRect(0, 0, S.L, S.H);
        S.persos.sort(function (a, b) { return a.sol - b.sol; }).forEach(function (p) { p.maj(dt); p.dessiner(ctx); });
        if (S.persos.length) S.raf = _kwVie.requestAnimationFrame(S.boucle); else { S.raf = 0; S.der = 0; }
      };
    }
    var p = new Perso(this, o || {}); this._scene.persos.push(p); if (!this._scene.raf) this._scene.raf = _kwVie.requestAnimationFrame(this._scene.boucle);
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
  Directeur.prototype.souffleBulles = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, D = o.duree || 1600, t0 = maintenant(), m = this.particules;
    var di = m.def('souffle:bulle', { nb: 1, vie: [4, 7], vitesse: [90, 220], cone: [o.angle == null ? -60 : o.angle, 50], taille: [5, 28], sprite: 'bulle', couleur: ['#FFFFFF', '#F1FAFF', '#FFF5FB'], gravite: -10, frein: 0.9, curl: { force: 70, freq: 0.006, vitesse: 0.3 }, vent: 1, ventPrise: 0.5, alphaVie: [0, 1, 1, 1], aLaMort: 'pop', proba: 1 });
    (function souffle() { m.emettre(di, x + hasard(-4, 4), y + hasard(-4, 4), 0.5, { taille: o.taille || 1 }, Math.random() < 0.5 ? 1 : 2); if (maintenant() - t0 < D) _kwVie.setTimeout(souffle, hasard(90, 200)); })();
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

  Directeur.prototype.arbre = function (el, o) { var _kwVie = this._vie;
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
      _kwVie.requestAnimationFrame(boucle);
    }
    _kwVie.requestAnimationFrame(boucle);
    return {
      secouer: function (n) { lache(n || 10); _kwVie.anime(el, [{ rotate: '0deg' }, { rotate: '-3deg' }, { rotate: '2.5deg' }, { rotate: '-1.5deg' }, { rotate: '0deg' }], { duration: 650, easing: 'ease-out' }); if (self.opt.sons) self.audio.souffle(0.5, 2200, 900, 0.1); },
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

  Directeur.prototype.gerbeEtincelles = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules, D = o.duree || 1200, t0 = _kwVie.maintenant(), actif = true, a = Math.round((o.angle == null ? -60 : o.angle) / 10) * 10;
    var di = m.def('gerbe-et:' + a, { nb: 1, vie: [0.5, 1.1], vitesse: [450, 1100], cone: [a, 34], taille: [1, 2], sprite: 'trait', etirement: 0.018, etirementMax: 7, melange: 'add', couleur: '#FFFFFF', couleurVie: ETINCELLE_VIE, gravite: 900, frein: 0.7, sol: { rebond: 0.35, friction: 0.55, sous: 'rebondEtincelle' } });
    var lu = m.def('gerbe-et:lueur', { nb: 1, fixe: true, vie: 0.08, taille: [14, 22], alphaVie: [0.8, 0], sprite: 'doux', melange: 'add', couleur: '#FFD27A' });
    (function jet() { if (!actif) return; m.emettre(di, x, y, 0.7, {}, Math.round(hasard(3, 6) * (o.force || 1))); if (Math.random() < 0.6) m.emettre(lu, x, y, 0.5, {}, 1); if (_kwVie.maintenant() - t0 < D) _kwVie.requestAnimationFrame(jet); })();
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
  Directeur.prototype.eclair = function (o) { var _kwVie = this._vie;
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
    this.flash('#E8F0FF', proche ? 0.5 : 0.22); _kwVie.setTimeout(function () { self.flash('#FFFFFF', proche ? 0.3 : 0.12); if (!self.opt.reduireAnimations) C.flash = Math.max(C.flash, 0.7); }, 120);
    if (proche) {
      var lu = this.lum, av = { angle: lu.angle, hauteur: lu.hauteur, force: lu.force, teinte: lu.teinte }, ang = Math.atan2(H / 2 - y0, x - L / 2) * 180 / Math.PI;
      this.lumiere({ angle: ang, hauteur: 0.55, force: 0.6, teinte: '#0a1230' }); _kwVie.setTimeout(function () { self.lumiere(av); }, 300);
      var surf = o.surface || (o.cible ? 'objet' : 'sol'), k = o.taille || 1;
      C.impacts = C.impacts || [];
      C.impacts.push({ x: x, y: y1, t0: maintenant(), type: surf, k: k, fig: surf === 'sol' ? rendFigure(figureLichtenberg(k), k) : null });
      if (surf === 'eau') {
        if (this.eclabousser) this.eclabousser(x, y1, { type: 'eau', force: 1.2, sol: 40 });
        for (var v = 0; v < 3; v++) _kwVie.setTimeout(function () { m.systeme('fumee', x + hasard(-30, 30), y1 - 4, 0.7, { couleurs: ['#FFFFFF'] }); }, v * 140);
        m.systeme('etincellesFoudre', x, y1, 0.6, {});
      } else {
        m.systeme('etincellesFoudre', x, y1, 1, {}); m.systeme('fumee', x, y1 - 6, 0.7, {});
        if (SYSTEMES.fumeeNoire) _kwVie.setTimeout(function () { m.systeme('fumeeNoire', x, y1 - 8, 0.45, {}); }, 250);
      }
      if (this.opt.secousses) this.secousse(0.4); this.vibre('erreur');
    }
    this.tonnerre(proche);
    return this;
  };
  Directeur.prototype.foudroyer = function (el, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules; if (!el) return Promise.resolve();
    this.eclair({ cible: el, proche: true, mouille: o.mouille });
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top;
    var fin = o.noircir === false ? 'none' : 'sepia(.7) brightness(.55) contrast(1.35)';
    _kwVie.anime(el, [{ filter: 'none', translate: '0 0' }, { filter: 'brightness(3) saturate(0)', translate: '-3px 1px', offset: 0.06 }, { filter: 'brightness(.4) saturate(0)', translate: '3px -1px', offset: 0.14 }, { filter: 'brightness(2.2) saturate(.3)', translate: '-2px 0', offset: 0.22 }, { filter: fin, translate: '0 0' }], { duration: 900, fill: 'forwards' });
    var t0 = maintenant();
    (function arcs() { // petites étincelles électriques qui courent sur les bords
      var bord = Math.random() * 4 | 0, px = x0 + (bord === 1 ? r.width : bord === 3 ? 0 : Math.random() * r.width), py = y0 + (bord === 2 ? r.height : bord === 0 ? 0 : Math.random() * r.height);
      m.systeme('crepitement', px, py, 0.6, { couleurs: ['#CFE0FF'] });
      if (maintenant() - t0 < 420) _kwVie.setTimeout(arcs, 30);
    })();
    for (var i = 0; i < 6; i++) _kwVie.setTimeout(function () { m.systeme('fumee', x0 + r.width * hasard(0.2, 0.8), y0 + r.height * 0.2, 0.5, {}); }, 300 + i * 220);
    return new Promise(function (ok) { _kwVie.setTimeout(ok, 950); });
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
  Directeur.prototype._foyerInit = function () { var _kwVie = this._vie;
    if (this._foyer) return this._foyer; var self = this, m = this.particules;
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9997';
    this.conteneur.appendChild(_kwVie.root(c));
    var F = { c: c, feux: [], raf: 0, der: 0, t: 0, gl: null, ctx: null };
    try {
      var gl = this.opt.rendu === 'canvas' ? null : _kwVie.gl(c, { premultipliedAlpha: true, alpha: true, antialias: false });
      if (gl) {
        var p = gl.createProgram();
        [[gl.VERTEX_SHADER, VS_FEU], [gl.FRAGMENT_SHADER, FS_FEU]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
        gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        var vao = gl.createVertexArray(); gl.bindVertexArray(vao); var q = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, q); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        var U = {}; ['rect', 'res', 'base', 'W', 'HF', 'k', 'kb', 't', 'seed', 'typ', 'lean', 'mag', 'teinte'].forEach(function (n) { U[n] = gl.getUniformLocation(p, n); });
        F.gl = gl; F.p = p; F.vao = vao; F.U = U;
      }
    } catch (e) { F.gl = null; if (global.console) console.warn('KwFX feu : repli Canvas 2D', e); }
    if (!F.gl) { c = F.c = this._vie.nouveauCanvas(c); F.ctx = c.getContext('2d'); }
    function taille() { var t = self.taille(), s = Math.max(1, Math.min(2, global.devicePixelRatio || 1) * 0.6); F.L = t.l; F.H = t.h; F.s = s; c.width = Math.max(1, Math.round(t.l * s)); c.height = Math.max(1, Math.round(t.h * s)); }
    taille(); _kwVie.ecoute(global, 'resize', taille); F.taille = taille;
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
      if (F.feux.length) F.raf = _kwVie.requestAnimationFrame(boucle); else { F.raf = 0; F.der = 0; if (F.gl) { F.gl.clearColor(0, 0, 0, 0); F.gl.clear(F.gl.COLOR_BUFFER_BIT); } else if (F.ctx) F.ctx.clearRect(0, 0, c.width, c.height); }
    }
    F.reveille = function () { if (!F.raf) F.raf = _kwVie.requestAnimationFrame(boucle); };
    this._foyer = F; return F;
  };
  Directeur.prototype.feu = function (x, y, o) { var _kwVie = this._vie;
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
      attiser: function () { f.boost = 1; for (var i = 0; i < 3; i++) _kwVie.setTimeout(function () { F.crepiter(f); }, i * 90); self.particules.systeme('braises', f.x, f.y - f.hf * 0.3, 0.5 * f.e, {}); if (self.opt.sons && f.son) self.audio.souffle(0.7, 350, 1400, 0.12); return api; },
      eteindre: function (o2) {
        o2 = o2 || {}; f.kc = 0; f.meurt = true; if (o2.eau) { f.kbc = 0; for (var i = 0; i < 8; i++) _kwVie.setTimeout(function () { self.particules.emettre(F.dVapeur, f.x + hasard(-0.5, 0.5) * f.w, f.y - 10, 0.5, { taille: f.e }, 2); }, i * 80); if (self.opt.sons) self.audio.souffle(1.1, 5000, 2500, 0.14); }
        else _kwVie.setTimeout(function () { f.kbc = 0; }, T.id === 1 ? 0 : 1600);
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
  Directeur.prototype.bruler = function (el, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, D = o.duree || 2600; if (!el) return Promise.resolve();
    var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = el.getBoundingClientRect(), x0 = r.left - b.left, y0 = r.top - b.top, feux = [];
    var n = Math.max(1, Math.min(4, Math.round(r.width / 60))), e = Math.max(0.35, Math.min(1, r.width / (n * 90)));
    for (var i = 0; i < n; i++) (function (i) { _kwVie.setTimeout(function () { feux.push(self.feu(x0 + r.width * (i + 0.5) / n, y0 + r.height * 0.25, { type: 'torche', taille: e, eclaire: i === 0, son: i === 0 })); }, i * 180); })(i);
    _kwVie.anime(el, [{ filter: 'none' }, { filter: 'sepia(.6) brightness(.8) contrast(1.2)', offset: 0.5 }, { filter: 'sepia(.9) brightness(.45) contrast(1.4)' }], { duration: D * 0.8, fill: 'forwards' });
    return new Promise(function (ok) {
      _kwVie.setTimeout(function () {
        feux.forEach(function (f) { f.eteindre(); });
        if (o.cendres !== false && self.reduireEnCendres) self.reduireEnCendres(el, { duree: 1100, fini: ok }); else ok();
      }, D);
    });
  };

  /* ======================================================================
   * 7 sexies. v3.3 : CIEL VIVANT (cycle jour / nuit, soleil, lune, nuages, étoiles)
   *  Le ciel se peint DERRIÈRE le jeu (canvas en z-index -1 dans le conteneur).
   *  const ciel = fx.cielVivant({ heure: 17.5, vitesse: 0.4, nuages: 0.5, lune: 'auto' })
   *     vitesse = heures de jeu par seconde (0 = arrêté ; 0.4 = une journée en une minute)
   *     ciel.heure(6, { duree: 3000 }) ; ciel.vitesse(0.2) ; ciel.nuages(0.8, ['cumulus', 'cirrus']) ; ciel.lune('pleine') ; ciel.etoileFilante()
   *  Vue vers le nord comme à La Réunion : le soleil se lève à droite (est), passe au nord et se couche à gauche.
   *  Couleurs du ciel selon la hauteur du soleil (nuit, aube bleue, aurore, jour, heure dorée, crépuscule),
   *  lueur autour du soleil, ceinture de Vénus rose et ombre de la Terre à l'opposé au crépuscule.
   *  Lune : vraie phase du jour (ou au choix), côté éclairé tourné vers le soleil, lumière cendrée, mers et cratères, visible pâle le jour.
   *  Nuages : cumulus (base plate, dôme en chou-fleur), cirrus (filaments), stratus (voile), cumulonimbus (enclume) ;
   *    ils naissent, dérivent avec le vent, se défont ; éclairés par le soleil (dessous roses au couchant) ou par la lune.
   *  Étoiles : beaucoup de faibles, peu de brillantes, couleurs selon la température, scintillement plus fort près de l'horizon,
   *    Voie lactée avec bandes sombres, Croix du Sud, le ciel tourne avec les heures, étoiles filantes.
   *  La lumière de KwFX (ombres, reflets, verre) suit le soleil puis la lune ; la nuit assombrit le jeu en douceur.
   * ==================================================================== */
  var CIEL_STOPS = [
    [-90, '#02040d', '#050a1c', '#0a1230'], [-18, '#03060f', '#071029', '#101a3c'], [-12, '#080e2a', '#141d48', '#262a58'],
    [-6, '#16204a', '#323a72', '#7a587c'], [-2, '#24346f', '#5d5a94', '#de8466'], [2, '#3a5aa2', '#8a96c8', '#ffb07a'],
    [8, '#4a80cc', '#98bde6', '#ffd8a6'], [20, '#3d8ade', '#8cc2f0', '#d2e8f7'], [90, '#2f7ddd', '#78b6ef', '#c2e1f8']
  ].map(function (s) { return [s[0], versRgb(s[1]), versRgb(s[2]), versRgb(s[3])]; });
  var LUM_SOLEIL = [[-12, [90, 105, 150]], [-5, [200, 110, 150]], [-1, [255, 112, 70]], [3, [255, 165, 100]], [8, [255, 212, 155]], [20, [255, 245, 228]], [90, [255, 255, 255]]];
  var PHASES_LUNE = { nouvelle: 0, croissant: 0.14, premierQuartier: 0.25, gibbeuse: 0.38, pleine: 0.5, gibbeuseDecroissante: 0.62, dernierQuartier: 0.75, dernierCroissant: 0.86 };
  var HEURES_CIEL = { aube: 5.6, matin: 7.5, midi: 12.3, apresMidi: 15, soir: 17.7, crepuscule: 18.4, nuit: 22.5, minuit: 0 };
  function melange(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function rgbs(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a == null ? 1 : Math.max(0, Math.min(1, a)).toFixed(3)) + ')'; }
  function lisse(a, b, x) { var t = borne((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function couleursCiel(el) {
    for (var i = 0; i < CIEL_STOPS.length - 1; i++) { var a = CIEL_STOPS[i], b = CIEL_STOPS[i + 1]; if (el <= b[0]) { var k = lisse(0, 1, (el - a[0]) / (b[0] - a[0])); return [melange(a[1], b[1], k), melange(a[2], b[2], k), melange(a[3], b[3], k)]; } }
    var z = CIEL_STOPS[CIEL_STOPS.length - 1]; return [z[1], z[2], z[3]];
  }
  function couleurSoleil(el) {
    if (el <= LUM_SOLEIL[0][0]) return LUM_SOLEIL[0][1];
    for (var i = 0; i < LUM_SOLEIL.length - 1; i++) { var a = LUM_SOLEIL[i], b = LUM_SOLEIL[i + 1]; if (el <= b[0]) return melange(a[1], b[1], (el - a[0]) / (b[0] - a[0])); }
    return LUM_SOLEIL[LUM_SOLEIL.length - 1][1];
  }
  function phaseLuneDate(d) { var j = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000, p = (j / 29.530588853) % 1; return p < 0 ? p + 1 : p; }
  function hauteurAstre(h, A) { h = ((h % 24) + 24) % 24; return h >= 6 && h <= 18 ? A * Math.sin(Math.PI * (h - 6) / 12) : -60 * Math.sin(Math.PI * (((h - 18) % 24 + 24) % 24) / 12); }
  function texLune(n) {
    var c = document.createElement('canvas'); c.width = c.height = n; var g = c.getContext('2d'), r = n / 2;
    var gr = g.createRadialGradient(r * 0.85, r * 0.8, 0, r, r, r); gr.addColorStop(0, '#f6f3ea'); gr.addColorStop(0.8, '#dedacd'); gr.addColorStop(1, '#bab5a7');
    g.fillStyle = gr; g.beginPath(); g.arc(r, r, r, 0, 6.3); g.fill(); g.save(); g.clip();
    [[0.38, 0.33, 0.2], [0.6, 0.3, 0.15], [0.3, 0.56, 0.17], [0.6, 0.52, 0.12], [0.48, 0.7, 0.09], [0.72, 0.42, 0.08], [0.2, 0.38, 0.08]].forEach(function (m) {
      var gg = g.createRadialGradient(m[0] * n, m[1] * n, 0, m[0] * n, m[1] * n, m[2] * n); gg.addColorStop(0, 'rgba(118,116,110,.6)'); gg.addColorStop(0.7, 'rgba(118,116,110,.35)'); gg.addColorStop(1, 'rgba(118,116,110,0)'); g.fillStyle = gg; g.fillRect(0, 0, n, n);
    });
    for (var i = 0; i < 30; i++) { var x = hasard(0.08, 0.92) * n, y = hasard(0.08, 0.92) * n, rr = hasard(0.008, 0.035) * n; g.fillStyle = 'rgba(85,83,78,.28)'; g.beginPath(); g.arc(x, y, rr, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,255,248,.22)'; g.beginPath(); g.arc(x - rr * 0.3, y - rr * 0.3, rr * 0.55, 0, 6.3); g.fill(); }
    g.fillStyle = 'rgba(255,255,250,.5)'; g.beginPath(); g.arc(0.42 * n, 0.86 * n, 0.018 * n, 0, 6.3); g.fill(); // Tycho
    g.restore(); return c;
  }
  function texVoieLactee(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'), id = g.createImageData(w, h), d = id.data;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var v = (y / h - 0.5) * 2, band = Math.exp(-v * v * 3.4) * (0.45 + 0.55 * Math.sin(x / w * Math.PI));
      var n = bruit(x * 0.03, y * 0.08) * 0.5 + bruit(x * 0.08 + 3, y * 0.2) * 0.3 + bruit(x * 0.22, y * 0.55) * 0.2;
      var rv = (v - 0.1 * Math.sin(x * 0.021) - 0.05) / 0.13, rift = Math.exp(-rv * rv) * lisse(0.35, 0.7, bruit(x * 0.04 + 9, y * 0.09));
      var a = borne(band * (0.25 + 1.0 * n) * (1 - 0.8 * rift), 0, 1), i = (y * w + x) * 4, core = Math.exp(-v * v * 9);
      d[i] = 200 + 50 * n * core; d[i + 1] = 196 + 34 * n; d[i + 2] = 228 - 20 * core; d[i + 3] = a * 150;
    }
    g.putImageData(id, 0, 0);
    for (var k = 0; k < w * h / 45; k++) { var yy = h / 2 + (Math.random() + Math.random() + Math.random() - 1.5) * h * 0.4; g.fillStyle = 'rgba(255,255,255,' + hasard(0.15, 0.6).toFixed(2) + ')'; g.fillRect(Math.random() * w, yy, 1, 1); }
    return c;
  }
  function spriteEtoile(pointes) {
    var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.08, 'rgba(255,255,255,.9)'); gr.addColorStop(0.25, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    if (pointes) { g.globalCompositeOperation = 'lighter'; [0, Math.PI / 2].forEach(function (a) { var l = g.createLinearGradient(32 - 32 * Math.cos(a), 32 - 32 * Math.sin(a), 32 + 32 * Math.cos(a), 32 + 32 * Math.sin(a)); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(0.5, 'rgba(255,255,255,.7)'); l.addColorStop(1, 'rgba(255,255,255,0)'); g.strokeStyle = l; g.lineWidth = 1.2; g.beginPath(); g.moveTo(32 - 32 * Math.cos(a), 32 - 32 * Math.sin(a)); g.lineTo(32 + 32 * Math.cos(a), 32 + 32 * Math.sin(a)); g.stroke(); }); }
    return c;
  }
  var COUL_ETOILES = [[170, 191, 255], [205, 218, 255], [244, 246, 255], [255, 244, 222], [255, 222, 180], [255, 190, 150]];
  function formesNuage(type, w, h) {
    var P = [];
    if (type === 'cirrus') {
      var nb = 5 + (Math.random() * 4 | 0);
      for (var i = 0; i < nb; i++) { var cy = h * hasard(0.25, 0.75), cx = w * hasard(0.1, 0.9), l = w * hasard(0.12, 0.3), ang = hasard(-0.25, 0.1); for (var j = 0; j < 7; j++) { var t = j / 6; P.push({ x: cx + Math.cos(ang) * l * (t - 0.5) * 2, y: cy + Math.sin(ang) * l * (t - 0.5) * 2 - Math.pow(t, 3) * h * 0.25, rx: l * 0.35 * (1 - t * 0.5), ry: h * hasard(0.03, 0.07), rot: ang + t * -0.3, a: 0.5 * (1 - t * 0.6) }); } }
    } else if (type === 'stratus') {
      for (var k = 0; k < 14; k++) P.push({ x: w * hasard(0.08, 0.92), y: h * hasard(0.35, 0.65), rx: w * hasard(0.12, 0.26), ry: h * hasard(0.22, 0.4), rot: hasard(-0.05, 0.05), a: hasard(0.35, 0.6) });
    } else if (type === 'cumulonimbus') {
      for (var m = 0; m < 16; m++) { var tt = m / 15; P.push({ x: w * (0.5 + hasard(-0.14, 0.14) * (1 - tt * 0.3)), y: h * (0.9 - tt * 0.62), r: w * hasard(0.12, 0.2) }); }
      for (var q = 0; q < 9; q++) P.push({ x: w * hasard(0.1, 0.9), y: h * hasard(0.12, 0.24), rx: w * hasard(0.14, 0.24), ry: h * hasard(0.05, 0.09), rot: 0, enclume: true });
    } else {
      var yb = h * 0.9, n = 10 + (Math.random() * 8 | 0);
      for (var p = 0; p < n; p++) { var u = 0.5 + (Math.random() - 0.5) * 0.92, dome = Math.pow(Math.sin(Math.PI * u), 0.7), r = h * (0.17 + 0.2 * dome) * hasard(0.8, 1.2); P.push({ x: u * w, y: yb - r * 0.55 - dome * h * 0.3 * Math.random(), r: r }); }
      for (var s = 0; s < 5; s++) { var u2 = 0.5 + (Math.random() - 0.5) * 0.5, r2 = h * hasard(0.13, 0.22); P.push({ x: u2 * w, y: yb - h * hasard(0.45, 0.62), r: r2 }); }
    }
    return P;
  }
  function rendNuage(n, lu, s) {
    var mg = 0.25, cw = n.w * (1 + mg * 2), ch = n.h * (1 + mg * 2), c = n.can || document.createElement('canvas');
    c.width = Math.max(2, Math.round(cw * s)); c.height = Math.max(2, Math.round(ch * s)); var g = c.getContext('2d');
    g.setTransform(s, 0, 0, s, n.w * mg * s, n.h * mg * s); g.clearRect(-n.w, -n.h, n.w * 3, n.h * 3);
    var lit = lu.lit, om = lu.ombre, dx = lu.dx, dy = lu.dy;
    function ell(p, coul, a, ox, oy, k) { g.save(); g.translate(p.x + (ox || 0), p.y + (oy || 0)); g.rotate(p.rot || 0); g.scale(1, p.ry / p.rx); var R = p.rx * (k || 1), gr = g.createRadialGradient(0, 0, 0, 0, 0, R); gr.addColorStop(0, rgbs(coul, a)); gr.addColorStop(0.55, rgbs(coul, a * 0.7)); gr.addColorStop(1, rgbs(coul, 0)); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R, 0, 6.3); g.fill(); g.restore(); }
    if (n.type === 'cirrus') { n.P.forEach(function (p) { ell(p, melange(om, lit, 0.75), p.a * 0.75); }); }
    else if (n.type === 'stratus') { n.P.forEach(function (p) { ell(p, melange(om, lit, 0.35), p.a); }); n.P.forEach(function (p) { ell(p, lit, p.a * 0.35, dx * p.rx * 0.2, dy * p.ry * 0.4, 0.7); }); }
    else {
      n.P.forEach(function (p) { if (p.enclume) ell(p, melange(om, lit, 0.3), 0.8); else { var gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); gr.addColorStop(0, rgbs(om, 0.97)); gr.addColorStop(0.74, rgbs(om, 0.93)); gr.addColorStop(1, rgbs(om, 0)); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill(); } });
      n.P.forEach(function (p) { if (p.enclume) { ell(p, lit, 0.45, dx * p.rx * 0.2, dy * p.ry * 0.5, 0.8); return; } var hx = p.x + dx * p.r * 0.38, hy = p.y + dy * p.r * 0.38, gr = g.createRadialGradient(hx, hy, 0, hx, hy, p.r * 0.85); gr.addColorStop(0, rgbs(lit, 0.97 * lu.k)); gr.addColorStop(0.6, rgbs(lit, 0.7 * lu.k)); gr.addColorStop(1, rgbs(lit, 0)); g.fillStyle = gr; g.beginPath(); g.arc(hx, hy, p.r * 0.85, 0, 6.3); g.fill(); });
      // le dessous du nuage reste dans l'ombre (sauf si la lumière vient d'en bas, au couchant)
      g.globalCompositeOperation = 'source-atop'; var lb = g.createLinearGradient(0, n.h * 0.2, 0, n.h); lb.addColorStop(0, rgbs(om, 0)); lb.addColorStop(1, rgbs(om, dy > 0.2 ? 0.15 : 0.55)); g.fillStyle = lb; g.fillRect(-n.w * mg, -n.h * mg, cw, ch);
      // base plate des cumulus
      if (n.type !== 'cumulonimbus') { g.globalCompositeOperation = 'destination-out'; var fb = g.createLinearGradient(0, n.h * 0.84, 0, n.h * 0.98); fb.addColorStop(0, 'rgba(0,0,0,0)'); fb.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = fb; g.fillRect(-n.w * mg, n.h * 0.84, cw, ch); }
      g.globalCompositeOperation = 'source-over';
    }
    n.can = c; n.mg = mg;
  }

  Directeur.prototype.cielVivant = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this, m = this.particules;
    if (this._voute) { this._voute.regler(o); return this._voute.api; }
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:-1';
    if (!this.plein) this.conteneur.style.isolation = 'isolate';
    this.conteneur.insertBefore(_kwVie.root(c), this.conteneur.firstChild);
    var V = { c: c, ctx: c.getContext('2d'), h: 10, vit: 0, glide: null, couv: 0.4, couvBase: 0.4, types: ['cumulus', 'cumulus', 'cirrus'], sombre: 0, nuages: [], filantes: [], t: 0, der: 0, raf: 0, horizon: 0.8,
      etoiles: true, voie: true, croix: true, assombrir: true, lune: 'auto', phase: phaseLuneDate(new Date()), ventBase: -9, derLum: 0, derNuit: -1, lumCle: '', meteoNom: null };
    V.tl = texLune(128); V.sp = spriteEtoile(false); V.spP = spriteEtoile(true); V.vl = texVoieLactee(512, 128);
    function taille() { var t = self.taille(); V.L = t.l; V.H = t.h; V.dpr = Math.min(2, global.devicePixelRatio || 1); c.width = Math.round(t.l * V.dpr); c.height = Math.round(t.h * V.dpr); V.hor = V.H * V.horizon; V.sN = Math.min(1.5, V.dpr * 0.75); genererEtoiles(); V.nuages.forEach(function (n) { n.cle = ''; }); }
    function genererEtoiles() {
      var L = V.L, H = V.H, N = Math.round(borne(L * H / 1000, 260, 1500)), R = Math.hypot(L, H) * 1.05; V.pole = [L / 2, V.hor + H * 0.55]; V.R = R; V.st = [];
      var ba = 1.05, bc = Math.cos(ba), bs = Math.sin(ba), off = -R * 0.45; V.bande = { a: ba, off: off };
      for (var i = 0; i < N; i++) {
        var x, y; if (Math.random() < 0.38) { var t = hasard(-1, 1) * R, q = (Math.random() + Math.random() + Math.random() - 1.5) * R * 0.09; x = t * bc - (q + off) * bs; y = t * bs + (q + off) * bc; } else { var rr = R * Math.sqrt(Math.random()), aa = Math.random() * 6.283; x = Math.cos(aa) * rr; y = Math.sin(aa) * rr; }
        var b = Math.pow(Math.random(), 5.5), cc = Math.random(), col = cc < 0.08 ? 0 : cc < 0.25 ? 1 : cc < 0.62 ? 2 : cc < 0.82 ? 3 : cc < 0.95 ? 4 : 5;
        V.st.push({ x: x, y: y, b: b, s: 0.5 + b * 1.6, c: col, f: hasard(1.5, 5), ph: Math.random() * 6.283 });
      }
      // Croix du Sud et ses deux « pointeurs » (alpha et bêta du Centaure)
      if (V.croix) { var cx = -R * 0.28, cy = -R * 0.36, e = Math.min(L, H) * 0.05; [[0, -1.4, 0.75, 2], [0, 1.5, 0.9, 1], [-0.95, 0.15, 0.7, 1], [0.8, -0.05, 0.55, 2], [0.38, 0.55, 0.25, 2], [-3.2, 1.9, 1, 3], [-2.3, 2.5, 0.85, 1]].forEach(function (s) { V.st.push({ x: cx + s[0] * e, y: cy + s[1] * e, b: s[2], s: 0.6 + s[2] * 1.6, c: s[3], f: hasard(2, 4), ph: Math.random() * 6.283 }); }); }
      V.st.sort(function (a, b) { return a.c - b.c; });
    }
    function nouveauNuage(type, initial) {
      var L = V.L, hor = V.hor, sc = Math.max(0.55, Math.min(1.5, L / 900)), n = { type: type, age: 0, vie: hasard(45, 110), forme: 6, cle: '' };
      if (type === 'cirrus') { n.w = hasard(220, 420) * sc; n.h = n.w * 0.3; n.y = hor * hasard(0.04, 0.28); n.prof = 0.35; }
      else if (type === 'stratus') { n.w = hasard(320, 620) * sc; n.h = n.w * 0.18; n.y = hor * hasard(0.3, 0.68); n.prof = 0.75; }
      else if (type === 'cumulonimbus') { n.w = hasard(260, 380) * sc; n.h = n.w * 0.95; n.y = hor * 0.95 - n.h; n.prof = 0.6; }
      else { n.w = hasard(110, 260) * sc; n.h = n.w * hasard(0.45, 0.6); n.y = hor * hasard(0.1, 0.62); n.prof = 0.45 + n.y / hor * 0.7; }
      var surPlace = initial || Math.random() < 0.55; n.x = surPlace ? hasard(-0.1, 1.05) * L : (V.vx() < 0 ? L + n.w * 0.1 : -n.w * 1.1);
      if (initial) { n.age = hasard(0, n.vie * 0.6); n.forme = 0.01; } else if (!surPlace) n.forme = 0.01;
      n.P = formesNuage(type, n.w, n.h); return n;
    }
    V.vx = function () { return V.ventBase + m.vent * 0.05; };
    function etat() {
      var h = V.h, es = hauteurAstre(h, 72), L = V.L, hor = V.hor, top = V.H * 0.07;
      var ph = V.lune === 'auto' ? phaseLuneDate(new Date()) : (typeof V.lune === 'number' ? V.lune : (PHASES_LUNE[V.lune] != null ? PHASES_LUNE[V.lune] : 0.5)); V.phase = ph;
      function pos(hh, A) { var e = hauteurAstre(hh, A), p = ((((hh - 6) % 24) + 24) % 24) / 12; if (p > 1) p = p > 1.5 ? p - 2 : p; return { x: L * (0.95 - 0.9 * p), y: hor - (hor - top) * (e / A), e: e }; }
      var S = pos(h, 72), M = pos(h - ph * 24, 68), illum = (1 - Math.cos(ph * 6.283)) / 2;
      var dayK = lisse(-8, 6, es), moonUp = lisse(-3, 6, M.e), moonK = moonUp * illum * (1 - dayK);
      return { es: es, S: S, M: M, illum: illum, dayK: dayK, moonK: moonK, moonUp: moonUp, cols: couleursCiel(es), sun: couleurSoleil(es) };
    }
    function lumiereNuages(E, n) {
      var src = E.es > -6 ? E.S : (E.M.e > -2 ? E.M : null), cx = n.x + n.w / 2, cy = n.y + n.h / 2, dx = 0, dy = -1;
      if (src) { var vx = src.x - cx, vy = src.y - cy, d = Math.hypot(vx, vy) || 1; dx = vx / d; dy = vy / d; }
      var moonLit = [150, 165, 205].map(function (v) { return v * (0.3 + 0.45 * E.moonK); }), lit = melange(moonLit, E.sun, E.dayK), z = E.cols[0];
      var om = melange(melange(z, [150, 160, 176], 0.55 * E.dayK + 0.1), [0, 0, 0], 0.4 - 0.25 * E.dayK);
      if (E.es > -7 && E.es < 8) om = melange(om, [120, 80, 120], 0.35 * lisse(-7, -1, E.es) * (1 - lisse(3, 8, E.es)));
      var tw = lisse(-8, -2, E.es) * (1 - lisse(3, 9, E.es)); lit = melange(lit, couleurSoleil(Math.max(E.es, -4)), 0.85 * tw);
      var sb = 1 - 0.55 * V.sombre; lit = lit.map(function (v) { return v * (0.55 + 0.45 * sb); }); om = om.map(function (v) { return v * sb; });
      return { lit: lit, ombre: om, dx: dx, dy: dy, k: 0.55 + 0.45 * Math.max(E.dayK, E.moonK, tw) };
    }
    function phaseNuages(dt, E) {
      var L = V.L, cible = Math.round(V.couv * Math.max(3, L / 900 * 9)), vx = V.vx(), nb = 2;
      if (V.nuages.length < cible && Math.random() < dt * 0.5 * (cible - V.nuages.length + 1)) V.nuages.push(nouveauNuage(choisir(V.types), false));
      V.nuages = V.nuages.filter(function (n) {
        n.age += dt; n.x += vx * n.prof * dt; if (n.forme < 1) n.forme = Math.min(1, n.forme + dt / 7);
        var fin = n.age > n.vie || (V.nuages.length > cible + 1 && n.age > 8); if (fin) { n.fond = (n.fond || 1) - dt / 9; if (n.fond <= 0) return false; }
        if ((vx < 0 && n.x + n.w * 1.3 < 0) || (vx > 0 && n.x - n.w * 0.3 > L)) return false;
        var lu = lumiereNuages(E, n), cle = [Math.round(lu.dx * 5), Math.round(lu.dy * 5), Math.round(lu.lit[0] / 10), Math.round(lu.lit[1] / 10), Math.round(lu.lit[2] / 10), Math.round(lu.ombre[0] / 10), Math.round(lu.ombre[2] / 10)].join(',');
        if (cle !== n.cle && (nb > 0 || !n.can)) { nb--; n.cle = cle; rendNuage(n, lu, V.sN); }
        return true;
      });
    }
    function dessine(E, dt) {
      var ctx = V.ctx, L = V.L, H = V.H, hor = V.hor, cols = E.cols, es = E.es;
      ctx.setTransform(V.dpr, 0, 0, V.dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      var sb = 1 - 0.45 * V.sombre, gz = cols.map(function (cc) { return melange(cc, [110, 115, 125], 0.5 * V.sombre).map(function (v) { return v * sb; }); });
      var g = ctx.createLinearGradient(0, 0, 0, hor); g.addColorStop(0, rgbs(gz[0])); g.addColorStop(0.55, rgbs(gz[1])); g.addColorStop(1, rgbs(gz[2]));
      ctx.fillStyle = g; ctx.fillRect(0, 0, L, hor + 1); ctx.fillStyle = rgbs(melange(gz[2], [0, 0, 0], 0.25)); ctx.fillRect(0, hor, L, H - hor);
      // étoiles et Voie lactée (le ciel tourne d'un tour par jour autour du pôle, sous l'horizon nord)
      var vis = lisse(-4, -15, es) * (1 - 0.7 * V.sombre) * (1 - 0.35 * V.couv);
      if (V.etoiles && vis > 0.01) {
        var rot = -V.h / 24 * 6.283, cr = Math.cos(rot), sr = Math.sin(rot), P = V.pole, lunaire = E.moonK;
        if (V.voie) { ctx.save(); ctx.translate(P[0], P[1]); ctx.rotate(rot + V.bande.a); ctx.globalAlpha = vis * 0.55 * (1 - 0.65 * lunaire); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(V.vl, -V.R, V.bande.off - V.R * 0.18, V.R * 2, V.R * 0.36); ctx.restore(); }
        ctx.globalCompositeOperation = 'lighter'; var cc = -1;
        for (var i = 0; i < V.st.length; i++) {
          var s = V.st[i], x = P[0] + s.x * cr - s.y * sr, y = P[1] + s.x * sr + s.y * cr; if (x < -4 || x > L + 4 || y < -4 || y > hor) continue;
          var bas = 1 - (hor - y) / hor, tw = 1 - (0.15 + 0.55 * bas * bas) * (0.5 + 0.5 * Math.sin(V.t * s.f * (1 + s.b) + s.ph)) * (0.5 + s.b);
          var a = (0.22 + 0.78 * s.b) * vis * tw * (1 - lunaire * 0.55 * (1 - s.b)) * (1 - 0.6 * lisse(0.85, 1, 1 - (hor - y) / (hor * 0.12 + 1)));
          if (a < 0.02) continue;
          if (s.b > 0.35) { var z = s.s * (s.b > 0.75 ? 9 : 6); ctx.globalAlpha = Math.min(1, a); ctx.drawImage(s.b > 0.75 ? V.spP : V.sp, x - z, y - z, z * 2, z * 2); }
          if (s.c !== cc) { cc = s.c; ctx.fillStyle = rgbs(COUL_ETOILES[cc]); }
          ctx.globalAlpha = Math.min(1, a); var w = s.s; ctx.fillRect(x - w / 2, y - w / 2, w, w);
        }
        // étoiles filantes
        if (Math.random() < dt * 0.04 * vis) V.filantes.push({ x: hasard(0.1, 0.9) * L, y: hasard(0.05, 0.4) * hor, a: hasard(2.4, 2.9), v: hasard(500, 800), t: 0, d: hasard(0.5, 0.9) });
        V.filantes = V.filantes.filter(function (f) {
          f.t += dt; if (f.t > f.d) return false; var k = f.t / f.d, hx = f.x + Math.cos(f.a) * f.v * f.t, hy = f.y + Math.sin(f.a) * f.v * f.t, tl = Math.min(140, f.v * f.t);
          var lg = ctx.createLinearGradient(hx, hy, hx - Math.cos(f.a) * tl, hy - Math.sin(f.a) * tl); lg.addColorStop(0, 'rgba(255,255,255,' + (0.9 * Math.sin(Math.PI * k)).toFixed(2) + ')'); lg.addColorStop(1, 'rgba(180,200,255,0)');
          ctx.globalAlpha = Math.max(vis, 0.5); ctx.strokeStyle = lg; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - Math.cos(f.a) * tl, hy - Math.sin(f.a) * tl); ctx.stroke(); return true;
        });
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      // lueurs : autour du soleil, sur l'horizon côté soleil, ceinture de Vénus et ombre de la Terre à l'opposé
      var S = E.S, sun = E.sun, R0 = Math.max(L, H);
      ctx.globalCompositeOperation = 'screen';
      var gk = lisse(-12, 0, es) * (1 - 0.55 * lisse(15, 55, es)) * (1 - 0.7 * V.sombre);
      if (gk > 0.01) { var sy = Math.min(S.y, hor), rg = ctx.createRadialGradient(S.x, sy, 0, S.x, sy, R0 * 0.55); rg.addColorStop(0, rgbs(sun, 0.55 * gk)); rg.addColorStop(0.25, rgbs(sun, 0.22 * gk)); rg.addColorStop(1, rgbs(sun, 0)); ctx.fillStyle = rg; ctx.fillRect(0, 0, L, hor); }
      var tk = lisse(-11, -1, es) * (1 - lisse(5, 16, es)) * (1 - 0.7 * V.sombre);
      if (tk > 0.01) {
        ctx.save(); ctx.translate(S.x, hor); ctx.scale(1, 0.32); var hg = ctx.createRadialGradient(0, 0, 0, 0, 0, R0 * 0.8); hg.addColorStop(0, rgbs(couleurSoleil(Math.max(es, -2)), 0.95 * tk)); hg.addColorStop(0.45, rgbs([255, 120, 90], 0.32 * tk)); hg.addColorStop(1, 'rgba(255,120,90,0)'); ctx.fillStyle = hg; ctx.fillRect(-R0 * 2, -R0 * 3.2, R0 * 4, R0 * 3.2); ctx.restore();
        var vk = lisse(1, -2, es) * (1 - lisse(-6, -10, es)) * (1 - 0.7 * V.sombre), ox = L - S.x;
        if (vk > 0.01) { ctx.globalCompositeOperation = 'source-over'; var vb = ctx.createLinearGradient(0, hor * 0.55, 0, hor); vb.addColorStop(0, 'rgba(230,150,170,0)'); vb.addColorStop(0.45, 'rgba(230,150,170,' + (0.32 * vk).toFixed(3) + ')'); vb.addColorStop(0.7, 'rgba(70,80,140,' + (0.35 * vk).toFixed(3) + ')'); vb.addColorStop(1, 'rgba(40,50,100,' + (0.4 * vk).toFixed(3) + ')');
          ctx.save(); ctx.translate(ox, hor); ctx.scale(1, hor * 0.55 / (L * 0.7)); var bv = ctx.createRadialGradient(0, 0, 0, 0, 0, L * 0.7); bv.addColorStop(0, 'rgba(45,55,110,' + (0.45 * vk).toFixed(3) + ')'); bv.addColorStop(0.45, 'rgba(70,80,140,' + (0.3 * vk).toFixed(3) + ')'); bv.addColorStop(0.72, 'rgba(235,150,175,' + (0.3 * vk).toFixed(3) + ')'); bv.addColorStop(1, 'rgba(235,150,175,0)');
          ctx.fillStyle = bv; ctx.fillRect(-L * 0.7, -L * 0.7, L * 1.4, L * 0.7); ctx.restore(); }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, L, hor); ctx.clip();
      // lune
      var M = E.M, Rm = Math.min(L, H) * 0.038 * (1 + 0.15 * lisse(15, 0, M.e));
      if (M.e > -3) {
        var ma = (1 - 0.6 * E.dayK) * (1 - 0.6 * V.sombre), ds = Math.atan2(S.y - M.y, S.x - M.x), phi = V.phase * 6.283, cosp = Math.cos(phi);
        var lh = lisse(12, 0, M.e), mc = melange([255, 255, 255], [255, 200, 140], lh);
        if (E.illum > 0.05) { var hr = Rm * (3 + 4 * E.illum), hh = ctx.createRadialGradient(M.x, M.y, Rm * 0.8, M.x, M.y, hr); hh.addColorStop(0, rgbs(mc, 0.28 * E.illum * ma * (1 - E.dayK))); hh.addColorStop(1, rgbs(mc, 0)); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = hh; ctx.fillRect(M.x - hr, M.y - hr, hr * 2, hr * 2); ctx.globalCompositeOperation = 'source-over'; }
        ctx.save(); ctx.translate(M.x, M.y);
        ctx.globalAlpha = ma * (0.1 + 0.12 * (1 - E.dayK)) * (E.dayK > 0.5 ? 0.3 : 1); ctx.drawImage(V.tl, -Rm, -Rm, Rm * 2, Rm * 2); // lumière cendrée
        ctx.rotate(ds); ctx.beginPath(); ctx.arc(0, 0, Rm, -Math.PI / 2, Math.PI / 2, false); ctx.ellipse(0, 0, Rm * Math.abs(cosp) + 0.01, Rm, 0, Math.PI / 2, -Math.PI / 2, cosp > 0); ctx.clip(); ctx.rotate(-ds);
        ctx.globalAlpha = ma; ctx.drawImage(V.tl, -Rm, -Rm, Rm * 2, Rm * 2);
        if (lh > 0.01) { ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = lh * 0.6; ctx.fillStyle = 'rgb(255,190,120)'; ctx.fillRect(-Rm, -Rm, Rm * 2, Rm * 2); ctx.globalCompositeOperation = 'source-over'; }
        ctx.restore(); ctx.globalAlpha = 1;
      }
      // soleil (aplati et rougi près de l'horizon)
      if (es > -2) {
        var Rs = Math.min(L, H) * 0.045, sq = 0.82 + 0.18 * lisse(0, 7, es), ga = 1 - 0.75 * V.sombre;
        ctx.globalCompositeOperation = 'screen'; var hal = ctx.createRadialGradient(S.x, S.y, Rs * 0.6, S.x, S.y, Rs * 5); hal.addColorStop(0, rgbs(sun, 0.7 * ga)); hal.addColorStop(1, rgbs(sun, 0)); ctx.fillStyle = hal; ctx.fillRect(S.x - Rs * 5, S.y - Rs * 5, Rs * 10, Rs * 10);
        ctx.globalCompositeOperation = 'source-over'; ctx.save(); ctx.translate(S.x, S.y); ctx.scale(1, sq);
        var dsq = ctx.createRadialGradient(0, 0, 0, 0, 0, Rs); dsq.addColorStop(0, rgbs(melange(sun, [255, 255, 255], 0.75), ga)); dsq.addColorStop(0.75, rgbs(melange(sun, [255, 255, 255], 0.4), ga)); dsq.addColorStop(1, rgbs(melange(sun, [255, 255, 255], 0.25), ga * 0.95));
        ctx.fillStyle = dsq; ctx.beginPath(); ctx.arc(0, 0, Rs, 0, 6.3); ctx.fill(); ctx.restore();
      }
      ctx.restore();
      // nuages (cirrus hauts d'abord, puis les plus proches)
      V.nuages.sort(function (a, b) { return a.prof - b.prof; });
      V.nuages.forEach(function (n) {
        if (!n.can) return; var k = n.forme * (n.fond == null ? 1 : n.fond), sc = 0.75 + 0.25 * n.forme, w = n.w * (1 + n.mg * 2) * sc, h = n.h * (1 + n.mg * 2) * sc;
        ctx.globalAlpha = Math.min(1, k * (0.4 + 0.6 * n.forme)); ctx.drawImage(n.can, n.x + n.w / 2 - w / 2, n.y + n.h / 2 - h / 2 + (1 - sc) * n.h * 0.3, w, h);
      });
      ctx.globalAlpha = 1;
      // brume d'horizon
      var bz = ctx.createLinearGradient(0, hor - H * 0.12, 0, hor); bz.addColorStop(0, rgbs(gz[2], 0)); bz.addColorStop(1, rgbs(melange(gz[2], [255, 255, 255], 0.15 * E.dayK), 0.6)); ctx.fillStyle = bz; ctx.fillRect(0, hor - H * 0.12, L, H * 0.12);
    }
    function lumiereJeu(E, now) {
      if (now - V.derLum < 200) return; V.derLum = now;
      var src = E.es > -3 ? E.S : (E.M.e > 0 ? E.M : null), ang = self.lum.angle, ht = 0.4;
      if (src) { ang = Math.atan2(-(src.y - V.H * 0.5), src.x - V.L * 0.5) * 180 / Math.PI; ht = borne(src.e / 80, 0.05, 1); }
      var force = E.es > -3 ? 0.06 + 0.28 * lisse(-3, 25, E.es) : 0.04 + 0.1 * E.moonK, gold = lisse(-3, 2, E.es) * (1 - lisse(6, 14, E.es));
      force *= 1 - 0.6 * V.sombre; var te = E.es < -3 ? '#000814' : gold > 0.4 ? '#2B1030' : '#0B1A33';
      var cle = Math.round(ang / 2) + ':' + Math.round(ht * 40) + ':' + Math.round(force * 100) + te;
      if (cle !== V.lumCle) { V.lumCle = cle; self.lumiere({ angle: ang, hauteur: ht, force: force, teinte: te }); self.lum.rayonsCouleur = rgbs(E.sun).replace(/rgba\(|,1\.000\)/g, ''); }
      // la nuit assombrit le jeu (avec des trous de lumière autour des lanternes et des feux)
      var nf = V.assombrir ? lisse(2, -10, E.es) * (1 - 0.3 * E.moonK) : 0, al = Math.round(nf * 0.6 * 100) / 100;
      if (al !== V.derNuit) {
        V.derNuit = al;
        if (al > 0.01) {
          if (!self._nuit) { var nc = document.createElement('canvas'); nc.setAttribute('aria-hidden', 'true'); nc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; self.calque.insertBefore(nc, self.calque.firstChild); self._nuit = nc; }
          self._nuit._couleur = 'rgba(4,10,35,' + al + ')'; self.dessineNuit();
        } else if (self._nuit) { self._nuit.remove(); self._nuit = null; }
      }
      if (!V.grade) V.grade = self.calqueDiv('inset:0;mix-blend-mode:soft-light;opacity:0;background:linear-gradient(180deg, rgba(255,150,70,.45), rgba(210,80,140,.22) 60%, rgba(60,30,90,.2))');
      V.grade.style.opacity = (gold * (1 - V.sombre)).toFixed(2);
    }
    function boucle(ts) {
      var dt = V.der ? Math.min(0.05, (ts - V.der) / 1000) : 0.016; V.der = ts; if (self.enPause) dt = 0; V.t += dt;
      if (V.glide) { var gk = Math.min(1, (ts - V.glide.t0) / V.glide.d), e2 = gk * gk * (3 - 2 * gk); V.h = V.glide.de + V.glide.ecart * e2; if (gk >= 1) V.glide = null; }
      else V.h += V.vit * dt;
      V.h = ((V.h % 24) + 24) % 24;
      var E = V.E = etat(); phaseNuages(dt, E); dessine(E, dt); lumiereJeu(E, ts);
      V.raf = _kwVie.requestAnimationFrame(boucle);
    }
    V.regler = function (o) {
      if (o.horizon != null) { V.horizon = o.horizon; V.hor = V.H * V.horizon; }
      if (o.heure != null) { if (typeof o.heure === 'string') o.heure = HEURES_CIEL[o.heure] != null ? HEURES_CIEL[o.heure] : 12; if (o.duree) { var ec = ((o.heure - V.h) % 24 + 24) % 24; V.glide = { de: V.h, ecart: ec, t0: performance.now(), d: o.duree }; } else V.h = o.heure; }
      if (o.vitesse != null) V.vit = o.vitesse;
      if (o.lune != null) V.lune = o.lune;
      if (o.types) V.types = o.types;
      if (o.nuages != null) { V.couv = V.couvBase = borne(o.nuages, 0, 1); }
      ['etoiles', 'assombrir'].forEach(function (k) { if (o[k] != null) V[k] = o[k]; });
      if (o.voieLactee != null) V.voie = o.voieLactee;
      if (o.vent != null) V.ventBase = o.vent;
    };
    taille(); _kwVie.ecoute(global, 'resize', taille);
    if (o.heure == null) { var d = new Date(); o.heure = d.getHours() + d.getMinutes() / 60; }
    V.regler(o);
    for (var i = 0; i < Math.round(V.couv * Math.max(3, V.L / 900 * 9)); i++) V.nuages.push(nouveauNuage(choisir(V.types), true));
    V.raf = _kwVie.requestAnimationFrame(boucle);
    V.api = {
      heure: function (h, o2) { V.regler({ heure: h, duree: (o2 && o2.duree) || 0 }); return V.api; },
      vitesse: function (v) { V.vit = v; return V.api; },
      nuages: function (k, types) { V.regler({ nuages: k, types: types }); return V.api; },
      lune: function (p) { V.lune = p; return V.api; },
      etoileFilante: function () { V.filantes.push({ x: hasard(0.15, 0.85) * V.L, y: hasard(0.05, 0.3) * V.hor, a: hasard(2.4, 2.9), v: hasard(600, 850), t: 0, d: 0.8 }); return V.api; },
      etat: function () { var E = etat(); return { heure: V.h, hauteurSoleil: E.es, hauteurLune: E.M.e, phaseLune: V.phase, eclairement: E.illum, nuit: E.es < -6 }; },
      arreter: function () { _kwVie.cancelAnimationFrame(V.raf); _kwVie.oublie(global, 'resize', taille); c.remove(); if (V.grade) V.grade.remove(); if (self._nuit) { self._nuit.remove(); self._nuit = null; } self._voute = null; }
    };
    this._voute = V; return V.api;
  };
  Directeur.prototype.cycleJourNuit = function (secondes, o) { o = o || {}; o.vitesse = 24 / (secondes || 120); return this.cielVivant(o); };
  // fx.heure('soir') fait glisser le ciel vivant vers cette heure au lieu de changer de décor d'un coup
  var heureV25 = Directeur.prototype.heure;
  Directeur.prototype.heure = function (nom, o) {
    if (this._voute) { var h = typeof nom === 'number' ? nom : HEURES_CIEL[nom]; if (h != null) { this._voute.regler({ heure: h, duree: (o && o.duree) || 3000 }); this.heureActive = nom; return this; } }
    return heureV25.call(this, nom);
  };
  // la météo change aussi le ciel : nuages plus nombreux et plus sombres
  var meteoV32 = Directeur.prototype.meteo;
  Directeur.prototype.meteo = function (nom, o) {
    var r = meteoV32.apply(this, arguments), V = this._voute;
    if (V) {
      var T = { pluie: [0.95, ['stratus', 'cumulus', 'stratus'], 0.45], orage: [1, ['cumulonimbus', 'stratus', 'cumulus'], 0.7], cyclone: [1, ['stratus', 'stratus', 'cumulus'], 0.8], ventFort: [0.6, ['cumulus', 'cumulus', 'stratus'], 0.15], alize: [0.4, ['cumulus', 'cumulus', 'cirrus'], 0] }[nom];
      if (T) { V.couv = T[0]; V.types = T[1]; V.sombre = T[2]; } else { V.couv = V.couvBase; V.types = ['cumulus', 'cumulus', 'cirrus']; V.sombre = 0; }
      V.nuages.forEach(function (n) { n.cle = ''; });
    }
    return r;
  };

  /* ======================================================================
   * v3.4 BROUILLARD VOLUMÉTRIQUE
   *  fx.brouillard({ type, densite, couche, horizon, souris, auto }) : nappes au sol, bancs qui dérivent,
   *  brume du matin qui se lève, mer de nuages des cirques. Densité selon la distance (perspective du sol),
   *  éclairé par le soleil, la lune, les lanternes et les feux, rayons de soleil dans la brume,
   *  s'écarte au passage du doigt, des personnages et du vent. Suit le ciel vivant (v3.3).
   * ====================================================================== */
  var TYPES_BROUILLARD = {
    // camH : hauteur de l'œil (m) ; hf : épaisseur de la couche (m) ; dens : densité par mètre ; haze : voile de distance
    brume: { camH: 1.6, hf: 3, dens: 0.022, haze: 0.3, freq: 0.12, contraste: 0.55, bancs: 0.35, relief: 0.2, dMin: 0 },
    matin: { camH: 1.6, hf: 2.4, dens: 0.03, haze: 0.3, freq: 0.12, contraste: 0.6, bancs: 0.4, relief: 0.25, dMin: 0, auto: true },
    sol: { camH: 1.7, hf: 0.9, dens: 0.09, haze: 0.2, freq: 0.18, contraste: 0.7, bancs: 0.5, relief: 0.35, dMin: 0 },
    bancs: { camH: 1.6, hf: 7, dens: 0.03, haze: 0.2, freq: 0.07, contraste: 0.6, bancs: 1, relief: 0.3, dMin: 0 },
    epais: { camH: 1.6, hf: 40, dens: 0.022, haze: 0.8, freq: 0.1, contraste: 0.35, bancs: 0.15, relief: 0.15, dMin: 0 },
    merNuages: { camH: 60, hf: 35, dens: 0.4, haze: 0.1, freq: 0.03, contraste: 0.6, bancs: 0.45, relief: 1, dMin: 170, dMax: 3000 }
  };
  var CLES_BROUILLARD = ['camH', 'hf', 'dens', 'haze', 'freq', 'contraste', 'bancs', 'relief', 'dMin', 'dMax'];
  Object.keys(TYPES_BROUILLARD).forEach(function (k) { if (!TYPES_BROUILLARD[k].dMax) TYPES_BROUILLARD[k].dMax = 300; });
  var VS_BRUME = '#version 300 es\nlayout(location=0) in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  var FS_BRUME = [
    '#version 300 es', 'precision highp float;',
    'uniform vec2 res; uniform float sc, t, hor, foc, camH, hf, dens, haze, dMax, dMin, freq, contraste, bancs, relief, opac, rays;',
    'uniform vec2 drift; uniform vec3 cLit, cOmbre, sunC, sunP;',
    'uniform vec4 dist[8]; uniform vec2 distV[8]; uniform int nDist;',
    'uniform vec4 lum[8]; uniform vec3 lumC[8]; uniform int nLum;',
    'out vec4 o;',
    'float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }',
    'const mat2 R = mat2(1.6, 1.2, -1.2, 1.6);',
    'float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = R * p; a *= 0.5; } return s / 0.9375; }',
    'float fbm3(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ s += a * vn(p); p = R * p; a *= 0.5; } return s / 0.875; }',
    'void main(){',
    '  vec2 px = vec2(gl_FragCoord.x / sc, res.y - gl_FragCoord.y / sc);',
    // passages (doigt, personnages, souffle) : la brume s'écarte et tourbillonne
    '  float clr = 0.0; vec2 disp = vec2(0.0);',
    '  for (int i = 0; i < 8; i++){ if (i >= nDist) break; vec4 D = dist[i]; vec2 d = px - D.xy; float w = exp(-dot(d, d) / (D.z * D.z)); clr = max(clr, D.w * w); disp += (distV[i] * 0.3 + vec2(-d.y, d.x) * 0.22) * w * D.w; }',
    '  vec2 q = px - disp;',
    '  float v = (q.y - hor) / foc, xs = (q.x - res.x * 0.5) / foc;',
    // première estimation de la distance d'échantillonnage (perspective du sol)
    '  float Ds;',
    '  if (v > 0.0004) Ds = camH > hf ? (camH - hf * 0.7) / v : camH / v * 0.6;',
    '  else Ds = min(camH < hf ? (hf - camH) / max(-v, 0.0004) * 0.5 : 40.0, 60.0);',
    '  float Dc = dMax * 0.5; Ds = Dc * (1.0 - exp(-Ds / Dc));',  // distance compressée : pas de stries près de l\'horizon
    '  float lod = exp(-Ds / (Dc * 0.55));',
    '  vec2 w = vec2(xs * Ds, Ds + max(-v, 0.0) * 140.0) * freq + drift;',
    '  float n = fbm(w + vec2(0.0, t * 0.03));',
    '  float nb = fbm3(w * 0.22 - drift * 0.45 + vec2(t * 0.012, 0.0));',
    '  float bank = smoothstep(0.34, 0.7, nb);',
    // le dessus de la couche ondule (relief des nappes et de la mer de nuages)
    '  float top = hf * max(0.05, 1.0 + relief * (n - 0.5) * 1.6) * mix(1.0, 0.35 + bank, bancs * 0.6);',
    '  float path = 0.0, Dhit = dMax;',
    '  if (v > 0.0004){ if (camH > top){ path = top / v; Dhit = (camH - top) / v; } else { path = camH / v; Dhit = 0.0; } }',
    '  else if (camH < top) path = (top - camH) / max(-v, 0.0004);',
    '  path = min(path, dMax);',
    '  float Dg = v > 0.0004 ? min(camH / v, dMax) : min(dMax, 22.0 / max(-v, 0.0004));',
    '  float ct = contraste * (0.35 + 0.65 * lod); float dm = mix(1.0 - ct, 1.0 + ct, n) * mix(1.0, mix(0.85, bank * 1.7, 0.4 + 0.6 * lod), bancs);',
    '  float od = dens * path * dm + haze * 0.01 * Dg * (0.6 + 0.4 * n);',
    '  if (dMin > 0.0) od *= smoothstep(dMin * 0.75, dMin, Dhit + (nb - 0.5) * dMin * 0.6 + (n - 0.5) * dMin * 0.12);',
    '  float a = (1.0 - exp(-od)) * (1.0 - clr * 0.92) * opac;',
    // éclairage : dessus éclairé, creux dans l'ombre, côté astre plus lumineux
    '  vec2 sd = sunP.xy - px; float sl = length(sd); vec2 sdir = sd / max(sl, 1.0);',
    '  float n2 = fbm(w + vec2(sdir.x, -sdir.y) * 0.18 + vec2(0.0, t * 0.03));',
    '  float shade = clamp(0.55 + (n2 - n) * (2.0 + 3.0 * relief) + (n - 0.5) * 0.5, 0.0, 1.0);',
    '  vec3 col = mix(cOmbre, cLit, mix(0.75, shade, 0.35 + 0.5 * relief));',
    '  float sr = sl / res.y; col += sunC * sunP.z * (exp(-sr * sr * 7.0) * 0.9 + exp(-sr * 2.6) * 0.35);',
    '  if (rays > 0.0){ float an = atan(sd.y, sd.x); float ray = vn(vec2(an * 22.0, t * 0.08)) * vn(vec2(an * 9.0 + 3.0, -t * 0.05)); col += sunC * rays * ray * ray * 1.4 * smoothstep(0.03, 0.25, sr) * exp(-sr * 1.3); }',
    '  for (int i = 0; i < 8; i++){ if (i >= nLum) break; vec4 L = lum[i]; float d = length(px - L.xy) / L.z; col += lumC[i] * L.w * (exp(-d * d * 3.0) * 0.55 + exp(-d * 2.2) * 0.25); }',
    '  o = vec4(col * a, a);',
    '}'
  ].join('\n');

  Directeur.prototype.brouillard = function (o) { var _kwVie = this._vie;
    var self = this;
    if (o === false || o === null) { var tout = this._brumes || {}; Object.keys(tout).forEach(function (k) { tout[k].api.arreter(1500); }); return this; }
    o = o || {}; var couche = o.couche === 'fond' ? 'fond' : 'devant';
    this._brumes = this._brumes || {};
    if (this._brumes[couche]) { this._brumes[couche].regler(o); return this._brumes[couche].api; }
    var m = this.particules, c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + (couche === 'fond' ? -1 : 9990);
    if (couche === 'fond') {
      if (!this.plein) this.conteneur.style.isolation = 'isolate';
      var ciel = this._voute && this._voute.c; this.conteneur.insertBefore(_kwVie.root(c), ciel ? ciel.nextSibling : this.conteneur.firstChild);
    } else this.conteneur.appendChild(_kwVie.root(c));
    var type0 = TYPES_BROUILLARD[o.type] || TYPES_BROUILLARD.brume;
    var B = { c: c, couche: couche, P: {}, cible: {}, de: {}, tr: null, k: 0, kc: 1, kv: 0.6, lift: 0, liftC: 0, liftV: 0.15, auto: !!type0.auto, drift: [hasard(0, 50), hasard(0, 50)], t: 0, der: 0, raf: 0,
      horizon: null, couleur: null, souris: o.souris !== false, passages: [], suivis: [], derSouris: null, opac: 0.94, rays: true, fin: null, vitesse: 1 };
    CLES_BROUILLARD.forEach(function (k) { B.P[k] = type0[k]; });
    B.type = TYPES_BROUILLARD[o.type] ? o.type : 'brume';
    try {
      var gl = this.opt.rendu === 'canvas' ? null : _kwVie.gl(c, { premultipliedAlpha: true, alpha: true, antialias: false });
      if (gl) {
        var p = gl.createProgram();
        [[gl.VERTEX_SHADER, VS_BRUME], [gl.FRAGMENT_SHADER, FS_BRUME]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
        gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        var vao = gl.createVertexArray(); gl.bindVertexArray(vao); var qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        var U = {}; ['res', 'sc', 't', 'hor', 'foc', 'camH', 'hf', 'dens', 'haze', 'dMax', 'dMin', 'freq', 'contraste', 'bancs', 'relief', 'opac', 'rays', 'drift', 'cLit', 'cOmbre', 'sunC', 'sunP', 'dist', 'distV', 'nDist', 'lum', 'lumC', 'nLum'].forEach(function (n) { U[n] = gl.getUniformLocation(p, n); });
        B.gl = gl; B.p = p; B.vao = vao; B.U = U; B.fD = new Float32Array(32); B.fV = new Float32Array(16); B.fL = new Float32Array(32); B.fC = new Float32Array(24);
      }
    } catch (e) { B.gl = null; if (global.console) console.warn('KwFX brouillard : repli Canvas 2D', e); }
    if (!B.gl) { c = B.c = this._vie.nouveauCanvas(c); B.ctx = c.getContext('2d'); B.blobs = []; }
    function taille() { var t = self.taille(), s = Math.max(0.5, Math.min(2, global.devicePixelRatio || 1) * 0.5); if (self.opt.support === 'epub') s *= 0.8; B.L = t.l; B.H = t.h; B.s = s; c.width = Math.max(1, Math.round(t.l * s)); c.height = Math.max(1, Math.round(t.h * s)); }
    taille(); _kwVie.ecoute(global, 'resize', taille);
    function relatif(cx, cy) { if (self.plein) return [cx, cy]; var b = self.conteneur.getBoundingClientRect(); return [cx - b.left, cy - b.top]; }
    function passage(x, y, r, s, vx, vy, vie) { B.passages.push({ x: x, y: y, r: r, s: s, s0: s, vx: vx || 0, vy: vy || 0, age: 0, vie: vie || 2.6 }); if (B.passages.length > 24) B.passages.shift(); }
    function surSouris(e) {
      if (!B.souris) return; var pt = relatif(e.clientX, e.clientY), now = _kwVie.maintenant(), d = B.derSouris;
      if (pt[0] < 0 || pt[1] < 0 || pt[0] > B.L || pt[1] > B.H) return;
      if (d) { var dt = Math.max(16, now - d.t) / 1000, vx = (pt[0] - d.x) / dt, vy = (pt[1] - d.y) / dt, v = Math.hypot(vx, vy); if (now - d.t > 70 && v > 40) { passage(pt[0], pt[1], 45 + Math.min(60, v * 0.04), Math.min(0.9, 0.35 + v / 1800), vx * 0.05, vy * 0.05); B.derSouris = { x: pt[0], y: pt[1], t: now }; } }
      else B.derSouris = { x: pt[0], y: pt[1], t: now };
    }
    _kwVie.ecoute(global, 'pointermove', surSouris, { passive: true });
    // couleurs du brouillard : suivent le ciel vivant (soleil, heure dorée, nuit, lune) ou fx.heure()
    function lumieres() {
      var V = self._voute, E = V && V.E, L = B.L, H = B.H, r = {};
      if (E) {
        var dayK = E.dayK, gold = lisse(-4, 2, E.es) * (1 - lisse(7, 16, E.es)), sb = 1 - 0.5 * V.sombre;
        var hz = E.cols[2], jour = melange(melange([236, 240, 246], hz, 0.25), E.sun, 0.25 * gold), nuit = [26, 32, 50].map(function (x) { return x * (0.55 + 0.9 * E.moonK); });
        var lit = melange(melange(nuit, hz, 0.3 * lisse(-14, -3, E.es)), jour, dayK); lit = melange(lit, melange(E.sun, [255, 190, 170], 0.3), 0.45 * gold * dayK);
        var omb = melange(lit, melange(hz, [70, 80, 110], 0.5), 0.45).map(function (x) { return x * (0.72 + 0.1 * dayK); });
        r.lit = lit.map(function (x) { return x * sb / 255; }); r.omb = omb.map(function (x) { return x * sb / 255; });
        var src = E.es > -4 ? E.S : E.M, k = E.es > -4 ? (0.14 + 0.36 * gold) * lisse(-4, 1, E.es) * (1 - 0.7 * V.sombre) : 0.18 * E.moonK * E.moonUp;
        r.sunP = [src.x, src.y, k]; r.sunC = (E.es > -4 ? melange(E.sun, [255, 236, 200], 0.2) : [190, 205, 255]).map(function (x) { return x / 255; });
        r.rays = B.rays && E.es > -2 && E.es < 28 ? 0.5 * lisse(-2, 3, E.es) * (1 - lisse(14, 28, E.es)) * (1 - V.sombre) : 0;
        r.nuit = 1 - dayK; r.hor = V.hor;
      } else {
        var h = self.heureActive, pal = { nuit: [[0.1, 0.12, 0.2], [0.06, 0.07, 0.12], 0.9], soir: [[1, 0.78, 0.66], [0.62, 0.5, 0.58], 0.15], matin: [[0.96, 0.94, 0.9], [0.66, 0.7, 0.78], 0] }[h] || [[0.93, 0.95, 0.97], [0.66, 0.7, 0.77], 0];
        var ang = self.lum.angle * Math.PI / 180, ht = self.lum.hauteur;
        r.lit = pal[0]; r.omb = pal[1]; r.nuit = pal[2]; r.sunC = h === 'soir' ? [1, 0.6, 0.35] : [1, 0.95, 0.85];
        r.sunP = [L * 0.5 + Math.cos(ang) * L * 0.45, H * 0.62 - Math.sin(ang) * H * 0.5 * ht, h === 'nuit' ? 0.05 : 0.3]; r.rays = h === 'soir' || h === 'matin' ? 0.4 : 0.15; r.hor = H * 0.62;
      }
      if (B.couleur) { var cc = versRgb(B.couleur).map(function (x) { return x / 255; }); r.lit = melange(r.lit, cc, 0.7); r.omb = melange(r.omb, cc.map(function (x) { return x * 0.7; }), 0.6); }
      if (B.horizon != null) r.hor = B.horizon <= 1 ? H * B.horizon : B.horizon;
      return r;
    }
    function boucle(ts) {
      var dt = B.der ? Math.min(0.05, (ts - B.der) / 1000) : 0.016; B.der = ts; if (self.enPause) dt = 0; B.t += dt;
      var L = B.L, H = B.H, P = B.P;
      if (B.tr) { var tk = Math.min(1, (ts - B.tr.t0) / B.tr.d), e = tk * tk * (3 - 2 * tk); CLES_BROUILLARD.forEach(function (k) { P[k] = B.de[k] + (B.cible[k] - B.de[k]) * e; }); if (tk >= 1) B.tr = null; }
      B.k += (B.kc - B.k) * Math.min(1, dt * B.kv); B.lift += (B.liftC - B.lift) * Math.min(1, dt * B.liftV);
      var V = self._voute, autoK = 1, autoL = 0;
      if (B.auto && V) { var hh = V.h; autoK = Math.max(lisse(3.5, 5.5, hh) * (1 - lisse(7.5, 10.5, hh)), 0.4 * (lisse(19, 23, hh) + (hh < 5 ? 1 : 0))); autoL = lisse(6.8, 10, hh) * (hh < 14 ? 1 : 0); }
      var lift = Math.max(B.lift, autoL), kk = B.k * autoK * Math.pow(1 - lift, 1.6);
      if (B.fin && B.k < 0.01) { B.api.arreter(0); return; }
      // dérive avec le vent (fx.vent / météo) : la brume file dans le sens du vent
      var ventN = m.vent || 0; B.drift[0] -= (0.035 + ventN * 0.0009) * dt * B.vitesse; B.drift[1] += 0.012 * dt * B.vitesse;
      // personnages suivis : la brume s'ouvre autour d'eux et se referme derrière
      B.suivis = B.suivis.filter(function (sv) {
        if (!sv.el.isConnected) return false; var r = sv.el.getBoundingClientRect(), pt = relatif(r.left + r.width / 2, r.top + r.height * 0.6), now = ts;
        var vx = sv.x == null ? 0 : (pt[0] - sv.x) / Math.max(dt, 0.001), vy = sv.y == null ? 0 : (pt[1] - sv.y) / Math.max(dt, 0.001); sv.x = pt[0]; sv.y = pt[1]; sv.vx = vx; sv.vy = vy;
        sv.r = sv.rayon || Math.max(40, Math.max(r.width, r.height) * 0.75);
        if (Math.hypot(vx, vy) > 25 && now - (sv.der || 0) > 140) { sv.der = now; passage(pt[0], pt[1], sv.r * 0.9, 0.55, vx * 0.06, vy * 0.06, 2.2); }
        return true;
      });
      B.passages = B.passages.filter(function (pg) { pg.age += dt; pg.s = pg.s0 * (1 - lisse(0, pg.vie, pg.age)); pg.r *= 1 + dt * 0.35; pg.x += pg.vx * dt; pg.y += pg.vy * dt; pg.vx *= 1 - dt; pg.vy *= 1 - dt; return pg.age < pg.vie; });
      var Lm = lumieres();
      if (B.gl) {
        var gl = B.gl, U = B.U; gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        if (kk > 0.003) {
          gl.useProgram(B.p); gl.bindVertexArray(B.vao); gl.disable(gl.BLEND);
          gl.uniform2f(U.res, L, H); gl.uniform1f(U.sc, B.s); gl.uniform1f(U.t, B.t); gl.uniform1f(U.hor, Lm.hor); gl.uniform1f(U.foc, H * 0.9);
          gl.uniform1f(U.camH, P.camH); gl.uniform1f(U.hf, P.hf * (1 + 2.2 * lift)); gl.uniform1f(U.dens, P.dens * kk); gl.uniform1f(U.haze, P.haze * kk); gl.uniform1f(U.dMax, P.dMax); gl.uniform1f(U.dMin, P.dMin);
          gl.uniform1f(U.freq, P.freq); gl.uniform1f(U.contraste, P.contraste); gl.uniform1f(U.bancs, P.bancs); gl.uniform1f(U.relief, P.relief); gl.uniform1f(U.opac, B.opac); gl.uniform1f(U.rays, Lm.rays);
          gl.uniform2f(U.drift, B.drift[0], B.drift[1]); gl.uniform3fv(U.cLit, Lm.lit); gl.uniform3fv(U.cOmbre, Lm.omb); gl.uniform3fv(U.sunC, Lm.sunC); gl.uniform3fv(U.sunP, Lm.sunP);
          // passages : les suivis d'abord, puis les traces les plus récentes
          var D = B.suivis.map(function (sv) { return { x: sv.x, y: sv.y, r: sv.r, s: 0.8, vx: (sv.vx || 0) * 0.05, vy: (sv.vy || 0) * 0.05 }; }).concat(B.passages.slice().reverse()).slice(0, 8);
          D.forEach(function (d, i) { B.fD[i * 4] = d.x; B.fD[i * 4 + 1] = d.y; B.fD[i * 4 + 2] = Math.max(8, d.r); B.fD[i * 4 + 3] = d.s; B.fV[i * 2] = d.vx; B.fV[i * 2 + 1] = d.vy; });
          gl.uniform4fv(U.dist, B.fD); gl.uniform2fv(U.distV, B.fV); gl.uniform1i(U.nDist, D.length);
          // lanternes et feux : grands halos dans la brume, plus forts la nuit
          var S = (self._sources || []).slice(0, 8), fl = 0.35 + 0.9 * Lm.nuit;
          S.forEach(function (s, i) { var rgb = s._rgb || (s._rgb = versRgb(s.couleur)); B.fL[i * 4] = s.x; B.fL[i * 4 + 1] = s.y; B.fL[i * 4 + 2] = s.rayon * 1.25; B.fL[i * 4 + 3] = s.force * fl * (s.scintille ? 0.92 + 0.08 * Math.sin(B.t * 11 + i * 2.1) : 1); B.fC[i * 3] = rgb[0] / 255; B.fC[i * 3 + 1] = rgb[1] / 255; B.fC[i * 3 + 2] = rgb[2] / 255; });
          gl.uniform4fv(U.lum, B.fL); gl.uniform3fv(U.lumC, B.fC); gl.uniform1i(U.nLum, S.length);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
      } else if (B.ctx) {
        var x = B.ctx, hor = Lm.hor, col = Lm.lit.map(function (v) { return Math.round(v * 255); }).join(','), base = Math.min(1, P.dens * kk * 14);
        x.setTransform(B.s, 0, 0, B.s, 0, 0); x.clearRect(0, 0, L, H);
        var top = P.camH < P.hf ? 0 : hor - H * 0.04, g = x.createLinearGradient(0, top, 0, H);
        g.addColorStop(0, 'rgba(' + col + ',' + (P.camH < P.hf ? 0.5 * base : 0) + ')'); g.addColorStop(Math.max(0.01, (hor - top) / (H - top)), 'rgba(' + col + ',' + (0.85 * base) + ')'); g.addColorStop(1, 'rgba(' + col + ',' + (0.25 * base) + ')');
        x.fillStyle = g; x.fillRect(0, top, L, H - top);
        if (!B.blobs.length) for (var i = 0; i < 14; i++) B.blobs.push({ x: Math.random() * L, y: hor + hasard(-0.05, 0.3) * H, r: hasard(80, 200), v: hasard(6, 18) });
        B.blobs.forEach(function (b) { b.x -= (b.v + ventN * 0.04) * dt; if (b.x < -b.r) b.x = L + b.r; if (b.x > L + b.r) b.x = -b.r; var gg = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r); gg.addColorStop(0, 'rgba(' + col + ',' + (0.35 * base) + ')'); gg.addColorStop(1, 'rgba(' + col + ',0)'); x.fillStyle = gg; x.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2); });
      }
      B.raf = _kwVie.requestAnimationFrame(boucle);
    }
    B.regler = function (o2) {
      if (o2.type && TYPES_BROUILLARD[o2.type]) {
        var T = TYPES_BROUILLARD[o2.type]; B.type = o2.type; B.liftC = 0; B.auto = o2.auto != null ? !!o2.auto : !!T.auto;
        CLES_BROUILLARD.forEach(function (k) { B.de[k] = B.P[k]; B.cible[k] = T[k]; }); B.tr = { t0: _kwVie.maintenant(), d: o2.duree || 2500 };
      } else if (o2.auto != null) B.auto = !!o2.auto;
      if (o2.densite != null) { B.kc = Math.max(0, o2.densite); B.kv = o2.duree ? 3 / (o2.duree / 1000) : B.kv; }
      if (o2.horizon !== undefined) B.horizon = o2.horizon;
      if (o2.couleur !== undefined) B.couleur = o2.couleur;
      if (o2.souris != null) B.souris = !!o2.souris;
      if (o2.opacite != null) B.opac = borne(o2.opacite, 0, 1);
      if (o2.rayons != null) B.rays = !!o2.rayons;
      if (o2.vitesse != null) B.vitesse = o2.vitesse;
      ['hauteur', 'epaisseur'].forEach(function (k) { if (o2[k] != null) B.P.hf = B.cible.hf = o2[k]; });
      B.fin = null;
    };
    B.regler(o); if (o.densite == null) B.kc = 1; B.kv = o.apparition ? 3 / (o.apparition / 1000) : 0.8;
    B.raf = _kwVie.requestAnimationFrame(boucle);
    B.api = {
      type: function (nom, duree) { B.regler({ type: nom, duree: duree }); return B.api; },
      densite: function (k, duree) { B.regler({ densite: k, duree: duree || 2000 }); return B.api; },
      // la brume se lève : elle monte, s'amincit et disparaît (brume du matin)
      leve: function (duree) { B.liftC = 1; B.liftV = 3 / ((duree || 8000) / 1000); return B.api; },
      retombe: function (duree) { B.liftC = 0; B.liftV = 3 / ((duree || 6000) / 1000); return B.api; },
      souffle: function (x, y, force) { force = force == null ? 1 : force; passage(x, y, 90 + 110 * force, Math.min(1, 0.6 + 0.4 * force), 0, 0, 3.5); return B.api; },
      suivre: function (el, o3) { var sv = { el: el, rayon: o3 && o3.rayon }; B.suivis.push(sv); return { arreter: function () { B.suivis = B.suivis.filter(function (q) { return q !== sv; }); } }; },
      regler: function (o3) { B.regler(o3 || {}); return B.api; },
      etat: function () { return { type: B.type, densite: B.k, leve: B.lift, couche: B.couche, webgl: !!B.gl }; },
      arreter: function (duree) {
        if (duree) { B.kc = 0; B.kv = 3 / (duree / 1000); B.fin = true; return B.api; }
        _kwVie.cancelAnimationFrame(B.raf); _kwVie.libereGL(c); c.remove(); _kwVie.oublie(global, 'resize', taille); _kwVie.oublie(global, 'pointermove', surSouris);
        if (self._brumes && self._brumes[couche] === B) delete self._brumes[couche]; return B.api;
      }
    };
    this._brumes[couche] = B; return B.api;
  };
  // météo : 'brouillard' (bancs épais) et 'brume' (voile léger) ; la pluie et l'orage ajoutent un rideau de brume
  METEOS.brouillard = { nom: 'Brouillard', calques: [{ debit: 0.5, vie: [7, 10], zone: 'ecran-bas', vitesse: [8, 20], cone: [-90, 30], taille: [70, 120], tailleVie: [0.8, 1.3], alphaVie: [0, 0.1, 0], sprite: 'volute', couleur: '#dfe5ec', vent: 0.6, rotVitesse: [-6, 6] }] };
  METEOS.brume = { nom: 'Brume légère', calques: [] };
  var BRUME_METEO = { brouillard: ['bancs', 1], brume: ['matin', 1], pluie: ['brume', 0.5], orage: ['brume', 0.65], cyclone: ['bancs', 0.6] };
  var meteoV33 = Directeur.prototype.meteo;
  Directeur.prototype.meteo = function (nom, o) {
    var r = meteoV33.apply(this, arguments), bm = BRUME_METEO[nom], b = this._brumes && this._brumes.devant;
    if (bm) { if (!b || b._meteo || b.fin) { var api = this.brouillard({ type: bm[0], densite: bm[1] * (o && o.force != null ? o.force : 1), auto: false, duree: 3000 }); this._brumes.devant._meteo = true; } }
    else if (b && b._meteo) { b.api.arreter(2500); }
    return r;
  };
  AMBIANCES.brouillard = AMBIANCES.brume;

  /* ======================================================================
   * v3.5 SABLE, POUSSIÈRE ET LANCER DE RAYONS
   *  fx.sable({ couleur, solides }) : vrai sable grain par grain (chute, tas, avalanches, vent qui fait migrer les dunes)
   *  fx.nuagePoussiere(x, y, { couleur, force }) ; poussière des pas et des chutes plus riche ;
   *  fx.poussiereLumiere({ x, y, angle }) : grains de poussière qui brillent dans un rayon de lumière
   *  fx.lancerRayons({ objets }) : lancer de rayons à l'écran (WebGL2) : ombres douces, rayons, occlusion, reflets au sol
   * ====================================================================== */
  var PAL_SABLE = {
    volcan: ['#2b2a2c', '#3a3838', '#454240', '#1f1e20', '#57514c', '#33302f', '#4a4644', '#26292b'],   // plage de l'Étang-Salé
    corail: ['#f3ead8', '#ebe0c9', '#fbf5e8', '#e2d4b8', '#f7efdd', '#d9cbb0', '#efe6d2', '#fffaf0'],   // lagon de l'Ermitage
    dore: ['#e2b866', '#d6a855', '#ecc77b', '#c99a48', '#f1d08e', '#ddb062', '#cf9f4e', '#e8bf70'],
    terre: ['#9c4a2a', '#b05a34', '#8a3f22', '#a85230', '#c06a40', '#7d3a20', '#b4603a', '#94462a']    // terre rouge des hauts
  };
  function palSable(c) {
    if (PAL_SABLE[c]) return PAL_SABLE[c].map(versRgb);
    var b = versRgb(c || '#e2b866'), r = []; for (var i = 0; i < 8; i++) { var k = 0.86 + ((i * 37) % 8) / 8 * 0.28; r.push([b[0] * k, b[1] * k, b[2] * k].map(function (v) { return Math.min(255, v); })); } return r;
  }
  Directeur.prototype.sable = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this;
    if (this._sable) { if (o.couleur) this._sable.couleur = o.couleur; return this._sable.api; }
    var m = this.particules, c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:' + (o.zIndex || 9988);
    this.conteneur.appendChild(_kwVie.root(c));
    var S = { c: c, ctx: c.getContext('2d'), pals: [], palIdx: {}, couleur: o.couleur || 'dore', vol: [], flux: [], raf: 0, der: 0, t: 0, calme: 0, sens: 1, chute: 0, sol: o.sol == null ? 1 : o.sol, solides: o.solides || null, derSol: 0, son: o.son !== false };
    S.G = o.grain || (this.opt.support === 'epub' ? 4 : 3);
    function pal(nom) { if (S.palIdx[nom] == null) { if (S.pals.length >= 4) return 0; S.palIdx[nom] = S.pals.length; S.pals.push(palSable(nom)); } return S.palIdx[nom]; }
    function taille() {
      var t = self.taille(), W = Math.max(8, Math.ceil(t.l / S.G)), H = Math.max(8, Math.ceil(t.h / S.G)), ancien = S.g, aW = S.W, aH = S.H;
      S.L = t.l; S.Hp = t.h; S.W = W; S.H = H; S.g = new Uint8Array(W * H); c.width = W; c.height = H; S.img = S.ctx.createImageData(W, H); S.u32 = new Uint32Array(S.img.data.buffer);
      if (ancien) for (var y = 0; y < Math.min(H, aH); y++) for (var x = 0; x < Math.min(W, aW); x++) { var v = ancien[(aH - 1 - y) * aW + x]; if (v > 1) S.g[(H - 1 - y) * W + x] = v; }
      S.fond = Math.min(H, Math.round(H * S.sol)); S.solMaj = true;
    }
    taille(); _kwVie.ecoute(global, 'resize', taille);
    // obstacles : les éléments du jeu arrêtent le sable (le sable s'entasse dessus)
    function majSolides() {
      var g = S.g, W = S.W, H = S.H, G = S.G; for (var i = 0; i < g.length; i++) if (g[i] === 1) g[i] = 0;
      if (!S.solides) return; var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect();
      var els = typeof S.solides === 'string' ? self.conteneur.querySelectorAll(S.solides) : S.solides;
      Array.prototype.forEach.call(els, function (el) {
        var r = el.getBoundingClientRect(), x0 = Math.max(0, Math.floor((r.left - b.left) / G)), x1 = Math.min(W - 1, Math.floor((r.right - b.left) / G)), y0 = Math.max(0, Math.floor((r.top - b.top) / G)), y1 = Math.min(H - 1, Math.floor((r.bottom - b.top) / G));
        var rond = /50%|999/.test(getComputedStyle(el).borderRadius), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 0.5, ry = (y1 - y0) / 2 + 0.5;
        for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { if (rond && sq((x - cx) / rx) + sq((y - cy) / ry) > 1) continue; if (g[y * W + x] === 0) g[y * W + x] = 1; }
      });
    }
    function sq(v) { return v * v; }
    function libre(x, y) { return x >= 0 && x < S.W && y < S.fond && (y < 0 || S.g[y * S.W + x] === 0); }
    function grain(nomPal) { return 2 + pal(nomPal || S.couleur) * 8 + ((Math.random() * 8) | 0); }
    function envol(px, py, vx, vy, v) { if (S.vol.length > 5000) return false; S.vol.push({ x: px, y: py, vx: vx, vy: vy, v: v }); return true; }
    function poser(gx, gy, v) {
      gx = Math.round(gx); gy = Math.min(Math.round(gy), S.fond - 1); if (gx < 0 || gx >= S.W) return;
      for (var k = 0; k < 40 && gy >= 0; k++, gy--) { if (S.g[gy * S.W + gx] === 0) { S.g[gy * S.W + gx] = v; S.chute++; S.calme = 0; return; } }
    }
    // bruit de sable qui coule (bruit rose filtré, volume selon le nombre de grains qui tombent)
    function sonSable() {
      if (!S.son || !self.opt.sons) return; var a = self.audio.pret(); if (!a) return;
      if (!S.bruit) {
        var len = a.sampleRate * 2, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0), l = 0;
        for (var i = 0; i < len; i++) { l = 0.97 * l + 0.03 * (Math.random() * 2 - 1); d[i] = (Math.random() * 2 - 1) * 0.6 + l * 2; }
        var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = b; s.loop = true; f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = 0.6; g.gain.value = 0;
        s.connect(f); f.connect(g); g.connect(a.destination); s.start(); S.bruit = { s: s, g: g, a: a };
      }
      var cible = Math.min(0.22, S.chute * 0.0025) * self.opt.volume * self.pub.son; S.bruit.g.gain.setTargetAtTime(cible, S.bruit.a.currentTime, 0.12);
    }
    function boucle(ts) {
      var dt = S.der ? Math.min(0.033, (ts - S.der) / 1000) : 0.016; S.der = ts; if (self.enPause) { S.raf = _kwVie.requestAnimationFrame(boucle); return; } S.t += dt;
      var W = S.W, H = S.H, g = S.g, G = S.G, vent = m.vent || 0, i, x, y;
      if (ts - S.derSol > 400) { S.derSol = ts; majSolides(); }
      S.chute = 0;
      // versements en cours
      S.flux = S.flux.filter(function (f) {
        if (f.fin && ts > f.fin) return false; f.acc += f.debit * dt;
        while (f.acc >= 1) { f.acc--; envol(f.x / G + hasard(-f.l, f.l), f.y / G, hasard(-6, 6) + vent * 0.02, hasard(0, 30), grain(f.couleur)); }
        return true;
      });
      // grains en l'air : vraie chute (gravité), le vent les pousse, ils se posent sur le tas
      var gv = 900 / G, nv = [];
      for (i = 0; i < S.vol.length; i++) {
        var p = S.vol[i]; p.vy += gv * dt; p.vx += (vent * 0.25 / G - p.vx) * Math.min(1, dt * 1.5); var nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
        if (nx < -2 || nx > W + 2) continue;
        var cx = Math.round(nx), cyB = Math.round(ny) + 1;
        if (ny >= 0 && (cyB >= S.fond || (cyB >= 0 && cx >= 0 && cx < W && g[cyB * W + cx] !== 0))) { poser(nx, ny, p.v); continue; }
        if (ny >= 0 && cx >= 0 && cx < W && Math.round(ny) < H && g[Math.round(ny) * W + cx] !== 0) { poser(p.x, p.y - 1, p.v); continue; }
        p.x = nx; p.y = ny; nv.push(p);
      }
      S.vol = nv;
      // automate du tas : chute, glissement en diagonale (avalanches), érosion par le vent
      var bouge = 0, vf = Math.abs(vent) > 70 ? (Math.abs(vent) - 70) / 450 : 0, vd = vent > 0 ? 1 : -1;
      if (S.calme < 40 || vf > 0) {
        S.sens = -S.sens;
        for (y = S.fond - 2; y >= 0; y--) {
          var ligne = y * W;
          for (var k = 0; k < W; k++) {
            x = S.sens > 0 ? k : W - 1 - k; i = ligne + x; var v = g[i]; if (v < 2) continue;
            if (y + 1 < S.fond && g[i + W] === 0) { var dy = 1; while (dy < 4 && y + dy + 1 < S.fond && g[i + (dy + 1) * W] === 0) dy++; g[i] = 0; g[i + dy * W] = v; bouge++; continue; }
            var d = Math.random() < 0.5 ? 1 : -1;
            if (libre(x + d, y + 1) && libre(x + d, y) && Math.random() < 0.9) { g[i] = 0; g[i + W + d] = v; bouge++; continue; }
            if (libre(x - d, y + 1) && libre(x - d, y) && Math.random() < 0.9) { g[i] = 0; g[i + W - d] = v; bouge++; continue; }
            if (vf > 0 && (y === 0 || g[i - W] === 0) && Math.random() < vf * dt * 1.6) { g[i] = 0; envol(x, y - 1, vd * hasard(10, 40) * vf, -hasard(15, 45), v); bouge++; }
          }
        }
      }
      S.calme = bouge || S.vol.length || S.flux.length ? 0 : S.calme + 1;
      // rendu : surface éclairée, grains plus sombres en profondeur, petites variations de couleur
      if (S.calme < 3 || S.solMaj) {
        S.solMaj = false; var u = S.u32, pals = S.pals;
        u.fill(0);
        for (x = 0; x < W; x++) {
          var prof = 0;
          for (y = 0; y < S.fond; y++) {
            i = y * W + x; var v2 = g[i]; if (v2 < 2) { prof = 0; continue; }
            var pc = pals[(v2 - 2) >> 3][(v2 - 2) & 7], sh = prof === 0 ? 1.14 : 1 - Math.min(prof, 14) * 0.026;
            if (prof === 0 && x > 0 && g[i - 1] === 0) sh *= 1.05; else if (prof < 3 && x < W - 1 && g[i + 1] === 0) sh *= 0.86;
            u[i] = 0xff000000 | (Math.min(255, pc[2] * sh) << 16) | (Math.min(255, pc[1] * sh) << 8) | Math.min(255, pc[0] * sh); prof++;
          }
        }
        for (i = 0; i < S.vol.length; i++) { var q = S.vol[i], qx = Math.round(q.x), qy = Math.round(q.y); if (qx >= 0 && qx < W && qy >= 0 && qy < H) { var qc = pals[(q.v - 2) >> 3][(q.v - 2) & 7]; u[qy * W + qx] = 0xff000000 | (Math.min(255, qc[2] * 1.1) << 16) | (Math.min(255, qc[1] * 1.1) << 8) | Math.min(255, qc[0] * 1.1); } }
        S.ctx.putImageData(S.img, 0, 0);
      }
      sonSable();
      S.raf = _kwVie.requestAnimationFrame(boucle);
    }
    S.raf = _kwVie.requestAnimationFrame(boucle);
    S.api = {
      // verser du sable depuis un point (sablier, seau, main qui laisse filer)
      verser: function (x, y, o2) {
        o2 = o2 || {}; var f = { x: x, y: y, debit: (o2.debit || 260) * (self.opt.support === 'epub' ? 0.6 : 1), l: (o2.largeur || 4) / S.G * 0.5 + 0.3, acc: 0, couleur: o2.couleur, fin: o2.duree ? _kwVie.maintenant() + o2.duree : 0 };
        S.flux.push(f); S.calme = 0;
        return { deplacer: function (nx, ny) { f.x = nx; f.y = ny; }, arreter: function () { S.flux = S.flux.filter(function (q) { return q !== f; }); } };
      },
      // un tas déjà formé (x en px, largeur et hauteur en px)
      tas: function (x, largeur, hauteur, couleur) {
        var G = S.G, cx = x / G, hw = (largeur || 200) / G / 2, hh = (hauteur || 60) / G;
        for (var gx = Math.max(0, Math.floor(cx - hw)); gx <= Math.min(S.W - 1, Math.ceil(cx + hw)); gx++) {
          var e = 1 - Math.abs(gx - cx) / hw, hcol = Math.round(hh * (e * e * (3 - 2 * e)) + hasard(-0.6, 0.6));
          for (var k = 0; k < hcol; k++) poser(gx, S.fond - 1, grain(couleur));
        }
        S.solMaj = true; return S.api;
      },
      // souffle (explosion, coup de pied, vent violent) : les grains volent puis retombent
      souffler: function (x, y, force, rayon) {
        force = force == null ? 1 : force; var G = S.G, r = (rayon || 70) / G, cx = x / G, cy = y / G, n = 0;
        for (var gy = Math.max(0, Math.floor(cy - r)); gy <= Math.min(S.fond - 1, Math.ceil(cy + r)); gy++) for (var gx = Math.max(0, Math.floor(cx - r)); gx <= Math.min(S.W - 1, Math.ceil(cx + r)); gx++) {
          var i = gy * S.W + gx, v = S.g[i]; if (v < 2) continue; var dx = gx - cx, dy = gy - cy, d = Math.hypot(dx, dy); if (d > r) continue;
          var k = (1 - d / r) * force; if (Math.random() > 0.35 + k) continue;
          S.g[i] = 0; envol(gx, gy, dx / (d || 1) * hasard(20, 90) * k + hasard(-8, 8), -hasard(40, 160) * k - Math.abs(dy) * 0.5, v); n++;
        }
        if (n) { S.calme = 0; self.particules.systeme('poussiere', x, y, Math.min(1.2, n / 150), {}); }
        return S.api;
      },
      creuser: function (x, y, rayon) {
        var G = S.G, r = (rayon || 30) / G, cx = x / G, cy = y / G;
        for (var gy = Math.max(0, Math.floor(cy - r)); gy <= Math.min(S.fond - 1, Math.ceil(cy + r)); gy++) for (var gx = Math.max(0, Math.floor(cx - r)); gx <= Math.min(S.W - 1, Math.ceil(cx + r)); gx++) if (Math.hypot(gx - cx, gy - cy) <= r && S.g[gy * S.W + gx] > 1) S.g[gy * S.W + gx] = 0;
        S.calme = 0; S.solMaj = true; return S.api;
      },
      couleur: function (cc) { S.couleur = cc; return S.api; },
      solides: function (s) { S.solides = s; majSolides(); return S.api; },
      compter: function () { var n = 0; for (var i = 0; i < S.g.length; i++) if (S.g[i] > 1) n++; return n + S.vol.length; },
      vider: function () { S.g.fill(0); S.vol = []; S.flux = []; S.solMaj = true; return S.api; },
      canvas: c,
      arreter: function () { _kwVie.cancelAnimationFrame(S.raf); c.remove(); _kwVie.oublie(global, 'resize', taille); if (S.bruit) try { S.bruit.s.stop(); } catch (e) {} self._sable = null; }
    };
    this._sable = S; return S.api;
  };

  /* --- poussière plus vivante : volutes qui roulent, bouffée au ras du sol, grains fins qui retombent --- */
  var COUL_POUSSIERE = { terre: ['#a8603c', '#c27a52', '#8f4f32'], sable: ['#cdb48a', '#e0cba4', '#b89d72'], volcan: ['#5a5552', '#77706b', '#45403d'], cendre: ['#8d8781', '#aaa49d', '#6f6a65'], gris: ['#b2a898', '#c9bfb0', '#9c9284'] };
  function defsPoussiere(cc, e) {
    var C = COUL_POUSSIERE[cc] || [cc, cc, cc]; e = e || 1;
    return [
      { nb: 7, vie: [1, 1.9], zone: 'cercle', rayon: 8, vitesse: [20, 70], cone: [-90, 150], taille: [10 * e, 18 * e], tailleVie: [0.45, 1.5, 2.3], alphaVie: [0, 0.38, 0.2, 0], sprite: 'volute', couleur: C[1], couleurVie: [C[0], C[1], C[1]], gravite: -14, frein: 2.2, curl: { force: 70, freq: 0.02, vitesse: 0.6 }, vent: 0.9, ventPrise: 0.7, rotVitesse: [-40, 40] },
      { nb: 3, vie: [0.5, 0.9], vitesse: [90, 190], cone: [180, 18], taille: [6 * e, 10 * e], tailleVie: [0.6, 2], alphaVie: [0.45, 0], sprite: 'volute', couleur: C[0], gravite: -6, frein: 3.4, vent: 0.6 },
      { nb: 3, vie: [0.5, 0.9], vitesse: [90, 190], cone: [0, 18], taille: [6 * e, 10 * e], tailleVie: [0.6, 2], alphaVie: [0.45, 0], sprite: 'volute', couleur: C[0], gravite: -6, frein: 3.4, vent: 0.6 },
      { nb: 12, vie: [0.4, 0.9], vitesse: [60, 220], cone: [-90, 110], taille: [0.8, 1.7], sprite: 'rect', couleur: C[2], gravite: 520, frein: 0.6, rotVitesse: [-300, 300], sol: { decalage: 2, rebond: 0.2, friction: 0.6 } }
    ];
  }
  SYSTEMES.poussiere = defsPoussiere('gris', 1);
  SYSTEMES.poussiereTerre = defsPoussiere('terre', 1);
  SYSTEMES.poussiereSable = defsPoussiere('sable', 1);
  Directeur.prototype.nuagePoussiere = function (x, y, o) { var _kwVie = this._vie;
    o = o || {}; var cc = o.couleur || 'terre', f = o.force == null ? 1 : o.force, m = this.particules, cle = 'nuageP:' + cc + ':' + Math.round(f * 4);
    if (x && x.getBoundingClientRect) { var b = this.plein ? { left: 0, top: 0 } : this.conteneur.getBoundingClientRect(), r = x.getBoundingClientRect(); x = r.left - b.left + r.width / 2; y = r.bottom - b.top; }
    defsPoussiere(cc, 1 + f * 0.9).forEach(function (e, i) { var di = m.def(cle + ':' + i, e); m.emettre(di, x, y, 0.6 + f * 0.5, {}, Math.round((e.nb || 4) * (0.8 + f * 1.4) * m.qualite)); });
    // la grosse bouffée continue de rouler quelques instants
    var di2 = m.def(cle + ':suite', { nb: 1, vie: [1.8, 3], zone: 'cercle', rayon: 20 * f, vitesse: [10, 40], cone: [-90, 120], taille: [18 * f, 30 * f], tailleVie: [0.6, 1.6, 2.4], alphaVie: [0, 0.28, 0], sprite: 'volute', couleur: (COUL_POUSSIERE[cc] || [cc, cc])[1], gravite: -18, frein: 1.4, curl: { force: 50, freq: 0.012 }, vent: 1, rotVitesse: [-20, 20] });
    for (var k = 0; k < 4; k++) _kwVie.setTimeout(function () { m.emettre(di2, x + hasard(-30, 30) * f, y - hasard(0, 20), 0.6, {}, Math.max(1, Math.round(2 * f))); }, k * 120);
    if (this.opt.secousses && f > 1.2) this.secousse && this.secousse(0.3 * f);
    return this;
  };

  /* --- grains de poussière qui brillent dans un rayon de lumière --- */
  Directeur.prototype.poussiereLumiere = function (o) { var _kwVie = this._vie;
    o = o || {}; var self = this, t0 = this.taille();
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9991;mix-blend-mode:screen';
    this.conteneur.appendChild(_kwVie.root(c));
    var R = { x: o.x == null ? t0.l * 0.3 : o.x, y: o.y == null ? -10 : o.y, a: (o.angle == null ? 62 : o.angle) * Math.PI / 180, w0: o.largeur || 40, w1: (o.largeur || 40) * 3.2, long: o.longueur || Math.hypot(t0.l, t0.h) * 0.9, coul: versRgb(o.couleur || '#FFE7B0'), force: o.force == null ? 1 : o.force, g: [], raf: 0, der: 0, t: 0 };
    var N = Math.round((o.grains || 160) * (this.opt.support === 'epub' ? 0.5 : 1));
    function taille() { var t = self.taille(), d = Math.min(2, global.devicePixelRatio || 1); R.L = t.l; R.H = t.h; R.d = d; c.width = Math.round(t.l * d); c.height = Math.round(t.h * d); }
    taille(); _kwVie.ecoute(global, 'resize', taille);
    function place(p, partout) { var s = Math.random() * (partout ? 1 : 0.15), u = hasard(-1.4, 1.4); p.s = s; p.u = u; p.z = Math.random(); p.ph = Math.random() * 6.283; p.f = hasard(0.6, 3); p.sz = hasard(0.5, 1.6) * (0.6 + p.z * 0.8); }
    for (var i = 0; i < N; i++) { var p = {}; place(p, true); R.g.push(p); }
    function boucle(ts) {
      var dt = R.der ? Math.min(0.05, (ts - R.der) / 1000) : 0.016; R.der = ts; if (self.enPause) dt = 0; R.t += dt;
      var x = c.getContext('2d'), d = R.d, ca = Math.cos(R.a), sa = Math.sin(R.a), nx = -sa, ny = ca, rgb = R.coul.join(','), vent = (self.particules.vent || 0) * 0.0004;
      x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, R.L, R.H);
      // le rayon lui-même : plus large en bas, plus pâle au loin
      var ex = R.x + ca * R.long, ey = R.y + sa * R.long, gr = x.createLinearGradient(R.x, R.y, ex, ey);
      gr.addColorStop(0, 'rgba(' + rgb + ',' + (0.22 * R.force).toFixed(3) + ')'); gr.addColorStop(0.6, 'rgba(' + rgb + ',' + (0.1 * R.force).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)');
      x.fillStyle = gr; x.beginPath(); x.moveTo(R.x + nx * R.w0, R.y + ny * R.w0); x.lineTo(ex + nx * R.w1, ey + ny * R.w1); x.lineTo(ex - nx * R.w1, ey - ny * R.w1); x.lineTo(R.x - nx * R.w0, R.y - ny * R.w0); x.closePath();
      x.save(); x.filter = 'blur(' + Math.round(R.w0 * 0.35) + 'px)'; x.fill(); x.restore();
      // les grains : flottent lentement (mouvement brownien), scintillent quand ils tournent, ne se voient que dans le rayon
      for (var i = 0; i < R.g.length; i++) {
        var p = R.g[i]; p.s += (0.004 + Math.sin(R.t * 0.3 + p.ph) * 0.003) * dt + vent * dt * ca; p.u += (Math.sin(R.t * p.f * 0.4 + p.ph * 3) * 0.05 + vent * nx * 3) * dt;
        if (p.s > 1 || p.s < 0 || Math.abs(p.u) > 1.6) { place(p, false); if (p.s > 1) p.s = 0; }
        var w = R.w0 + (R.w1 - R.w0) * p.s, px = R.x + ca * R.long * p.s + nx * w * p.u, py = R.y + sa * R.long * p.s + ny * w * p.u;
        var dedans = Math.max(0, 1 - Math.abs(p.u)), sc = Math.pow(0.5 + 0.5 * Math.sin(R.t * p.f * 2 + p.ph), 6), al = dedans * dedans * (0.25 + 0.75 * sc) * (1 - p.s * 0.7) * R.force;
        if (al < 0.02) continue; x.fillStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')'; x.beginPath(); x.arc(px, py, p.sz * (1 + sc * 0.6), 0, 6.283); x.fill();
        if (sc > 0.7 && p.z > 0.6) { x.fillStyle = 'rgba(255,255,255,' + (al * 0.5).toFixed(3) + ')'; x.fillRect(px - p.sz * 2.5, py - 0.3, p.sz * 5, 0.6); }
      }
      R.raf = _kwVie.requestAnimationFrame(boucle);
    }
    R.raf = _kwVie.requestAnimationFrame(boucle);
    return {
      deplacer: function (nx2, ny2, angle) { R.x = nx2; R.y = ny2; if (angle != null) R.a = angle * Math.PI / 180; },
      force: function (k) { R.force = k; },
      arreter: function () { _kwVie.cancelAnimationFrame(R.raf); c.remove(); _kwVie.oublie(global, 'resize', taille); }
    };
  };

  /* --- lancer de rayons à l'écran (WebGL2) ---
   * Pour chaque point de l'écran, un rayon part vers chaque lumière (soleil, lanternes, feux) et avance pas à pas
   * dans une carte des objets du jeu : s'il en traverse un, le point est à l'ombre. La carte est floutée de plus en plus
   * loin de l'objet (mip-maps), ce qui donne des pénombres douces comme dans la réalité. Le même calcul donne les rayons
   * de lumière qui passent entre les objets, l'ombre de contact (occlusion) et le reflet des lumières sur un sol mouillé. */
  var VS_RT = '#version 300 es\nlayout(location=0) in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
  var FS_RT = [
    '#version 300 es', 'precision highp float;',
    'uniform sampler2D occ; uniform vec2 res; uniform float sc, ombre, aoK, diffus, mirY, mirK, flou, t;',
    'uniform vec4 L[6]; uniform vec3 LC[6]; uniform int nL; uniform vec3 teinte;',
    'out vec4 o;',
    'float occAt(vec2 p, float lod){ return textureLod(occ, clamp(p / res, 0.0, 1.0), lod).a; }',
    'float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }',
    'float sq(float x){ return x * x; }',
    'void main(){',
    '  vec2 px = vec2(gl_FragCoord.x / sc, res.y - gl_FragCoord.y / sc);',
    '  float dedans = smoothstep(0.3, 0.7, occAt(px, 0.0));',
    '  float jit = ign(gl_FragCoord.xy);',
    '  vec3 add = vec3(0.0); float vis = 0.0, wsum = 0.0;',
    '  for (int i = 0; i < 6; i++){',
    '    if (i >= nL) break; vec4 l = L[i]; vec2 d = l.xy - px; float dist = length(d); vec2 dir = d / max(dist, 1.0);',
    '    float maxT = l.z > 0.0 ? dist : min(dist, res.y * 1.2);',
    '    float T = 1.0;',
    '    for (int s = 0; s < 16; s++){',
    '      float f = (float(s) + jit) / 16.0; float tt = 3.0 + f * f * maxT;',
    '      if (tt > maxT) break;',
    '      float lod = clamp(log2(1.0 + tt * flou * 0.05), 0.0, 5.0);',
    '      T *= 1.0 - clamp(occAt(px + dir * tt, lod) * 1.25, 0.0, 1.0) * 0.85;',
    '      if (T < 0.02) break;',
    '    }',
    '    T = mix(T, 1.0, dedans * 0.75);',
    '    float att = l.z > 0.0 ? 1.0 / (1.0 + sq(dist / l.z) * 2.0) : 1.0;',
    '    float w = l.w * att; wsum += w; vis += w * T;',
    '    float sct = l.z > 0.0 ? att : exp(-dist / (res.y * 0.9)) * 0.35;',
    '    add += LC[i] * l.w * T * sct * diffus * (1.0 - dedans * 0.6);',
    '  }',
    '  float a = ombre * (wsum > 0.001 ? 1.0 - vis / wsum : 0.0) * min(1.0, wsum * 1.5);',
    '  float aoV = occAt(px, 3.5); a += aoK * smoothstep(0.04, 0.45, aoV) * (1.0 - dedans) * 0.55;',
    // sol mouillé : reflet des objets et colonnes de lumière qui ondulent
    '  if (mirK > 0.0 && px.y > mirY){',
    '    float dy = px.y - mirY; float rip = sin(px.y * 0.35 - t * 3.0) * 1.8 + sin(px.x * 0.05 + t) * 1.2;',
    '    vec2 rp = vec2(px.x + rip * (0.4 + dy * 0.01), 2.0 * mirY - px.y); float fade = exp(-dy / (res.y * 0.25));',
    '    a += mirK * 0.35 * occAt(rp, 1.0 + dy * 0.01) * fade * (1.0 - dedans);',
    '    for (int i = 0; i < 6; i++){ if (i >= nL) break; vec4 l = L[i]; if (l.z <= 0.0 || l.y > mirY) continue; vec2 lr = vec2(l.x, 2.0 * mirY - l.y); vec2 e = px - lr; e.x += rip * 2.0; e.y *= 0.28;',
    '      float g = exp(-dot(e, e) / sq(l.z * 0.35)) * (0.6 + 0.4 * sin(px.y * 0.9 - t * 5.0)); add += LC[i] * l.w * g * mirK * fade * 0.9; }',
    '  }',
    '  a = clamp(a, 0.0, 0.85);',
    '  o = vec4(add + teinte * a, a);',
    '}'
  ].join('\n');
  Directeur.prototype.lancerRayons = function (o) { var _kwVie = this._vie;
    var self = this;
    if (o === false) { if (this._rt) this._rt.api.arreter(); return this; }
    o = o || {}; if (this._rt) { this._rt.regler(o); return this._rt.api; }
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'position:' + (this.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:9987';
    var ref = this._sable && this._sable.c; if (ref) this.conteneur.insertBefore(_kwVie.root(c), ref); else this.conteneur.appendChild(_kwVie.root(c));
    var gl = null; try { if (this.opt.rendu !== 'canvas') gl = _kwVie.gl(c, { premultipliedAlpha: true, alpha: true, antialias: false }); } catch (e) {}
    if (!gl) { c.remove(); if (global.console) console.warn('KwFX lancerRayons : WebGL2 absent, ombres CSS gardées'); var vide = function () { return vide; }; return { regler: vide, lumiere: vide, arreter: vide, etat: function () { return { webgl: false }; } }; }
    try {
    var p = gl.createProgram();
    [[gl.VERTEX_SHADER, VS_RT], [gl.FRAGMENT_SHADER, FS_RT]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(p, sh); });
    gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao); var qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['occ', 'res', 'sc', 'ombre', 'aoK', 'diffus', 'mirY', 'mirK', 'flou', 't', 'L', 'LC', 'nL', 'teinte'].forEach(function (n) { U[n] = gl.getUniformLocation(p, n); });
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var masque = document.createElement('canvas'), mx = masque.getContext('2d');
    var R = { c: c, gl: gl, objets: o.objets || '[data-kwfx-opaque]', ombre: 0.55, ao: 0.6, diffus: 0.5, mirY: null, mirK: 0, flou: 1, lumieres: [], soleil: true, raf: 0, der: 0, t: 0, rectSeul: false, rayons: [], styles: new WeakMap() };
    function taille() { var t = self.taille(), s = Math.max(0.3, Math.min(2, global.devicePixelRatio || 1) * (self.opt.support === 'epub' ? 0.25 : 0.36)); R.L = t.l; R.H = t.h; R.s = s; c.width = Math.max(1, Math.round(t.l * s)); c.height = Math.max(1, Math.round(t.h * s)); masque.width = Math.max(4, Math.round(t.l / 4)); masque.height = Math.max(4, Math.round(t.h / 4)); }
    taille(); _kwVie.ecoute(global, 'resize', taille);
    // carte des objets : leurs formes (images et canvas à leur vraie silhouette, ronds, rectangles arrondis), plus le sable
    function dessineMasque() {
      var b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), k = masque.width / R.L;
      mx.setTransform(1, 0, 0, 1, 0, 0); mx.clearRect(0, 0, masque.width, masque.height); mx.setTransform(k, 0, 0, k, 0, 0); mx.fillStyle = '#fff';
      var els = typeof R.objets === 'string' ? self.conteneur.querySelectorAll(R.objets) : R.objets;
      Array.prototype.forEach.call(els || [], function (el) {
        var r = el.getBoundingClientRect(); if (!r.width || !r.height) return; var x = r.left - b.left, y = r.top - b.top;
        var tg = el.tagName; if (!R.rectSeul && (tg === 'IMG' || tg === 'CANVAS')) { try { mx.drawImage(el, x, y, r.width, r.height); return; } catch (e) {} }
        var st = R.styles.get(el); if (!st || R.t - st.t > 1) { var cs = getComputedStyle(el); st = { t: R.t, br: cs.borderRadius }; R.styles.set(el, st); }
        var rad = /50%/.test(st.br) ? Math.min(r.width, r.height) / 2 : Math.min(parseFloat(st.br) || 0, Math.min(r.width, r.height) / 2);
        mx.beginPath(); if (mx.roundRect) mx.roundRect(x, y, r.width, r.height, rad); else mx.rect(x, y, r.width, r.height); mx.fill();
      });
      if (self._sable && R.sable !== false) mx.drawImage(self._sable.c, 0, 0, R.L, R.H);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, masque); } catch (e) { R.rectSeul = true; return; }
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    function lumieres() {
      var Ls = [], V = self._voute, E = V && V.E;
      if (R.soleil) {
        if (E) { if (E.es > -3) Ls.push({ x: E.S.x, y: E.S.y, r: 0, i: (0.35 + 0.65 * lisse(-3, 20, E.es)) * (1 - 0.7 * V.sombre), c: E.sun.map(function (v) { return v / 255; }) }); else if (E.M.e > 0 && E.moonK > 0.05) Ls.push({ x: E.M.x, y: E.M.y, r: 0, i: 0.5 * E.moonK, c: [0.65, 0.72, 1] }); }
        else { var pl = self.positionLumiere(); Ls.push({ x: pl.x, y: pl.y, r: 0, i: 0.4 + self.lum.force * 1.5, c: [1, 0.95, 0.85] }); }
      }
      (self._sources || []).forEach(function (s) { var rgb = s._rgb || (s._rgb = versRgb(s.couleur)); Ls.push({ x: s.x, y: s.y, r: s.rayon * 1.3, i: s.force * (s.scintille ? 0.93 + 0.07 * Math.sin(R.t * 12 + s.x) : 1), c: rgb.map(function (v) { return v / 255; }) }); });
      R.lumieres.forEach(function (l) { Ls.push(l); });
      return Ls.slice(0, 6);
    }
    var fL = new Float32Array(24), fC = new Float32Array(18);
    function boucle(ts) {
      var dt = R.der ? Math.min(0.05, (ts - R.der) / 1000) : 0.016; R.der = ts; if (self.enPause) dt = 0; R.t += dt;
      R.n = (R.n || 0) + 1; if (R.n % 2 === 1) dessineMasque();
      var Ls = lumieres(), nuit = self._voute && self._voute.E ? 1 - self._voute.E.dayK : (self.heureActive === 'nuit' ? 1 : 0);
      gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(p); gl.bindVertexArray(vao); gl.disable(gl.BLEND); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.occ, 0);
      gl.uniform2f(U.res, R.L, R.H); gl.uniform1f(U.sc, R.s); gl.uniform1f(U.t, R.t); gl.uniform1f(U.ombre, R.ombre * (0.6 + 0.4 * (1 - nuit * 0.5))); gl.uniform1f(U.aoK, R.ao); gl.uniform1f(U.diffus, R.diffus * (0.5 + 0.8 * nuit) * (self._brumes && self._brumes.devant ? 1.6 : 1));
      gl.uniform1f(U.mirY, R.mirY == null ? R.H * 0.82 : (R.mirY <= 1 ? R.H * R.mirY : R.mirY)); gl.uniform1f(U.mirK, R.mirK); gl.uniform1f(U.flou, R.flou);
      gl.uniform3f(U.teinte, 0.02, 0.03, 0.08 + 0.05 * nuit);
      Ls.forEach(function (l, i) { fL[i * 4] = l.x; fL[i * 4 + 1] = l.y; fL[i * 4 + 2] = l.r; fL[i * 4 + 3] = l.i; fC[i * 3] = l.c[0]; fC[i * 3 + 1] = l.c[1]; fC[i * 3 + 2] = l.c[2]; });
      gl.uniform4fv(U.L, fL); gl.uniform3fv(U.LC, fC); gl.uniform1i(U.nL, Ls.length);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      R.raf = _kwVie.requestAnimationFrame(boucle);
    }
    R.regler = function (o2) {
      if (o2.objets) R.objets = o2.objets; if (o2.ombre != null) R.ombre = o2.ombre; if (o2.occlusion != null) R.ao = o2.occlusion; if (o2.diffusion != null) R.diffus = o2.diffusion;
      if (o2.solMouille != null) R.mirK = o2.solMouille === true ? 1 : o2.solMouille === false ? 0 : o2.solMouille; if (o2.niveauSol !== undefined) R.mirY = o2.niveauSol;
      if (o2.flou != null) R.flou = o2.flou; if (o2.soleil != null) R.soleil = !!o2.soleil; if (o2.sable != null) R.sable = o2.sable;
    };
    R.regler(o); R.raf = _kwVie.requestAnimationFrame(boucle);
    R.api = {
      regler: function (o2) { R.regler(o2 || {}); return R.api; },
      // lumière ponctuelle en plus (lampe torche, objet qui brille) : renvoie deplacer / eteindre
      lumiere: function (x, y, o2) { o2 = o2 || {}; var l = { x: x, y: y, r: o2.rayon || 160, i: o2.force == null ? 1 : o2.force, c: versRgb(o2.couleur || '#FFD08A').map(function (v) { return v / 255; }) }; R.lumieres.push(l); return { deplacer: function (a, b) { l.x = a; l.y = b; }, eteindre: function () { R.lumieres = R.lumieres.filter(function (q) { return q !== l; }); } }; },
      etat: function () { return { webgl: true, lumieres: lumieres().length, objets: (typeof R.objets === 'string' ? self.conteneur.querySelectorAll(R.objets).length : R.objets.length) }; },
      arreter: function () { _kwVie.cancelAnimationFrame(R.raf); _kwVie.libereGL(c); c.remove(); _kwVie.oublie(global, 'resize', taille); self._rt = null; }
    };
    this._rt = R; return R.api;
    } catch (e) { _kwVie.libereGL(c); c.remove(); if (global.console) console.warn('KwFX lancerRayons : repli ombres CSS', e); var vide = function () { return vide; }; return { regler: vide, lumiere: vide, arreter: vide, etat: function () { return { webgl: false }; } }; }
  };
  Directeur.prototype.rayTracing = Directeur.prototype.lancerRayons;

  /* ======================================================================
   * v3.6 ATELIER DE FABRICATION : jeux où l'on expérimente un procédé
   *  const at = fx.atelier(el, { recette: 'geranium' | 'rhum' | 'sucre' | 'jus' })  → tout est monté, guidé et jouable
   *  ou à la main : at.appareil('alambic', { x, y, l, h, contenu: { eau: 40, feuilles: 60 } }), at.tuyau(a, b), at.feu(a, 0.6) …
   *  Moteur physique simplifié mais juste : chaleur, ébullition (le point d'ébullition monte avec le sucre et baisse avec
   *  l'alcool), vapeur, condensation (il faut assez d'eau froide), entraînement de l'essence par la vapeur, fermentation
   *  (levures heureuses vers 30-34 °C), écume à retirer, cristallisation, turbinage. Bulles, vapeur, gouttes, filets,
   *  feu, cristaux et bruit de bouillon suivent l'état réel. Étapes guidées, mesures, qualité, conseils doux.
   * ====================================================================== */
  var MATIERES = {
    eau: { c: [150, 200, 235], a: 0.35 }, sucre: { c: [214, 160, 70], a: 0.9 }, alcool: { c: [235, 240, 245], a: 0.15 }, tetes: { c: [235, 240, 245], a: 0.1 },
    essence: { c: [196, 196, 92], a: 0.9 }, impuretes: { c: [110, 120, 70], a: 0.9 }, cristaux: { c: [205, 150, 80], a: 1 }, melasse: { c: [60, 30, 12], a: 1 }, citron: { c: [200, 220, 120], a: 0.5 }
  };
  var SOLIDES = { feuilles: 1, cannes: 1, bagasse: 1, cristaux: 1, levure: 1 };
  function masseLiquide(C) { var m = 0; for (var k in C) if (!SOLIDES[k] || k === 'cristaux') m += C[k]; return m; }
  function brixDe(C) { var s = (C.sucre || 0) + (C.melasse || 0) * 0.5, e = C.eau || 0; return s + e > 0 ? s / (s + e) * 100 : 0; }
  function degreDe(C) { var a = (C.alcool || 0) + (C.tetes || 0), e = (C.eau || 0) + (C.sucre || 0); return a + e > 0 ? a / (a + e) * 100 : 0; }
  // point d'ébullition : 100 °C pour l'eau, monte avec le sucre (sirop 104, masse cuite 118), baisse avec l'alcool (vin de canne 92-94)
  function ebullition(C) { var b = brixDe(C), x = degreDe(C) / 100; return 100 + 18 * Math.pow(b / 92, 4) - 21.6 * Math.pow(x, 0.75); }
  function couleurContenu(C) {
    var b = brixDe(C), r = 0, g = 0, bl = 0, al = 0, t = 0;
    for (var k in C) { var M = MATIERES[k]; if (!M || C[k] <= 0 || k === 'essence' || k === 'cristaux') continue; var w = C[k]; r += M.c[0] * w; g += M.c[1] * w; bl += M.c[2] * w; al += M.a * w; t += w; }
    if (!t) return null; r /= t; g /= t; bl /= t; al /= t;
    if (b > 3) { // vesou vert-jaune → sirop ambré → masse cuite brune
      var P = [[3, [150, 200, 235, 0.35]], [15, [176, 172, 92, 0.85]], [40, [196, 150, 60, 0.88]], [65, [192, 118, 38, 0.92]], [90, [112, 56, 20, 0.96]], [100, [70, 34, 12, 0.98]]], q = P[P.length - 1][1];
      for (var j = 1; j < P.length; j++) if (b <= P[j][0]) { var u = (b - P[j - 1][0]) / (P[j][0] - P[j - 1][0]), A0 = P[j - 1][1], B0 = P[j][1]; q = [0, 1, 2, 3].map(function (z) { return A0[z] + (B0[z] - A0[z]) * u; }); break; }
      var km = Math.min(1, (C.melasse || 0) * 6 / Math.max(0.01, t)); r = q[0] * (1 - km) + 70 * km; g = q[1] * (1 - km) + 40 * km; bl = q[2] * (1 - km) + 18 * km; al = Math.max(q[3], 0.9 * km);
    }
    if ((C.impuretes || 0) > 0.01 && b > 5) { r = r * 0.8 + 30; g = g * 0.85 + 30; bl *= 0.7; }
    if (C._brule) { var kb = Math.min(1, C._brule); r *= 1 - 0.6 * kb; g *= 1 - 0.7 * kb; bl *= 1 - 0.7 * kb; }
    return [Math.round(r), Math.round(g), Math.round(bl), Math.min(0.95, al)];
  }
  var NS = 'http://www.w3.org/2000/svg';
  function sv(tag, at, parent) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (parent) parent.appendChild(e); return e; }
  var ATELIER_N = 0;

  Directeur.prototype.atelier = function (el, o) { var _kwVie = this._vie;
    o = o || {}; var self = this, id = 'kwat' + (++ATELIER_N);
    el = el || this.conteneur; if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var racine = document.createElement('div'); racine.className = 'kwfx-atelier';
    racine.style.cssText = 'position:relative;width:100%;font:600 14px/1.3 system-ui,-apple-system,sans-serif;color:#2a1f17';
    var scene = document.createElement('div'); scene.style.cssText = 'position:relative;width:100%;height:' + (o.hauteur || 'clamp(320px,52vw,460px)') + ';border-radius:16px;overflow:hidden;background:linear-gradient(180deg,#f3e3c6 0%,#ead2a8 62%,#8a6a4a 62%,#6e5238 100%)';
    var svg = sv('svg', { width: '100%', height: '100%', style: 'position:absolute;inset:0;overflow:visible' }); scene.appendChild(svg);
    var cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; scene.appendChild(cv);
    var hud = document.createElement('div'); hud.style.cssText = 'position:absolute;inset:0;pointer-events:none'; scene.appendChild(hud);
    var barre = document.createElement('div'); barre.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px';
    var guide = document.createElement('div'); guide.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px;margin-top:10px';
    racine.appendChild(scene); racine.appendChild(barre); racine.appendChild(guide); el.appendChild(_kwVie.root(racine));
    var defs = sv('defs', {}, svg);
    function grad(nom, stops, x2, y2) { var g = sv('linearGradient', { id: id + nom, x1: 0, y1: 0, x2: x2 == null ? 1 : x2, y2: y2 == null ? 0 : y2 }, defs); stops.forEach(function (s) { sv('stop', { offset: s[0], 'stop-color': s[1] }, g); }); return 'url(#' + id + nom + ')'; }
    var CUIVRE = grad('cu', [[0, '#6a2f12'], [0.3, '#e8a066'], [0.55, '#c26a34'], [1, '#5a2810']]), ACIER = grad('ac', [[0, '#5d6670'], [0.35, '#dfe5ea'], [0.6, '#9aa4ad'], [1, '#4c545c']]);
    var BOIS = grad('bo', [[0, '#5b3a22'], [0.5, '#9a6a40'], [1, '#5b3a22']]), BRIQUE = grad('br', [[0, '#7a3a26'], [1, '#a5543a']], 0, 1), VERRE = grad('ve', [[0, 'rgba(255,255,255,.55)'], [0.25, 'rgba(255,255,255,.12)'], [0.8, 'rgba(255,255,255,.05)'], [1, 'rgba(255,255,255,.35)']]);
    var A = { el: racine, scene: scene, svg: svg, cv: cv, ctx: cv.getContext('2d'), hud: hud, barre: barre, guide: guide, app: [], tuyaux: [], t: 0, der: 0, raf: 0, vitesse: o.vitesse || 1, qualite: 100, notes: [], ecoute: {}, msgT: 0, puffs: [], gouttes: [], bulles: [], etincelles: [], recette: null, fini: false };
    function taille() { var r = scene.getBoundingClientRect(), d = Math.min(2, global.devicePixelRatio || 1); A.W = r.width; A.H = r.height; cv.width = Math.round(A.W * d); cv.height = Math.round(A.H * d); A.d = d; svg.setAttribute('viewBox', '0 0 ' + A.W + ' ' + A.H); A.app.forEach(placer); A.tuyaux.forEach(dessineTuyau); }
    function emettre(nom, d) { (A.ecoute[nom] || []).forEach(function (f) { try { f(d); } catch (e) { if (global.console) console.error(e); } }); }
    // message doux en bas de la scène
    var bulleMsg = document.createElement('div'); bulleMsg.setAttribute('role', 'status'); bulleMsg.style.cssText = 'position:absolute;left:50%;bottom:10px;transform:translateX(-50%);max-width:min(92%,560px);background:rgba(255,250,240,.95);border-radius:14px;padding:8px 14px;box-shadow:0 6px 20px rgba(60,30,10,.18);font-weight:700;text-align:center;opacity:0;transition:opacity .4s;pointer-events:none';
    scene.appendChild(bulleMsg);
    function dire(txt, ton, duree) { bulleMsg.textContent = txt; bulleMsg.style.color = ton === 'doux' ? '#8a4b1a' : ton === 'bravo' ? '#1d6b3a' : '#2a1f17'; bulleMsg.style.opacity = 1; _kwVie.clearTimeout(A.msgT); A.msgT = _kwVie.setTimeout(function () { bulleMsg.style.opacity = 0; }, duree || 4200); }
    function evenementFx(type, x, y, extra) { var r = scene.getBoundingClientRect(), b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(); var d = { x: r.left - b.left + x, y: r.top - b.top + y }; for (var k in extra || {}) d[k] = extra[k]; return self.evenement(type, d); }

    /* ---------- appareils ---------- */
    var DESSINS = {
      alambic: function (R, g) {
        R.foyer = true; R.vue = 'hublot';
        R.p.corps = sv('path', { fill: CUIVRE, stroke: '#4a1f0a', 'stroke-width': 1.5 }, g); R.p.dome = sv('ellipse', { fill: CUIVRE, stroke: '#4a1f0a', 'stroke-width': 1.5 }, g);
        R.p.col = sv('path', { fill: 'none', stroke: CUIVRE, 'stroke-width': 7, 'stroke-linecap': 'round' }, g); R.p.hub = sv('rect', { fill: 'rgba(30,20,10,.55)', stroke: '#3b1a08', 'stroke-width': 2, rx: 5 }, g);
        R.p.briques = sv('rect', { fill: BRIQUE, stroke: '#5a2616', 'stroke-width': 1 }, g); R.p.bouche = sv('rect', { fill: '#1b0d07', rx: 6 }, g);
      },
      cuve: function (R, g) {
        R.foyer = R.opt.chauffe !== false; R.vue = 'coupe';
        R.p.fond = sv('path', { fill: 'rgba(40,25,15,.55)' }, g); R.p.paroi = sv('path', { fill: 'none', stroke: R.opt.matiere === 'acier' ? ACIER : CUIVRE, 'stroke-width': 7, 'stroke-linejoin': 'round' }, g);
        if (R.foyer) { R.p.briques = sv('rect', { fill: BRIQUE, stroke: '#5a2616' }, g); R.p.bouche = sv('rect', { fill: '#1b0d07', rx: 6 }, g); }
      },
      fermenteur: function (R, g) {
        R.vue = 'coupe'; R.p.fond = sv('path', { fill: 'rgba(40,25,15,.5)' }, g); R.p.paroi = sv('path', { fill: 'none', stroke: BOIS, 'stroke-width': 9, 'stroke-linejoin': 'round' }, g);
        R.p.cercles = [0.25, 0.75].map(function () { return sv('line', { stroke: '#3a3a3a', 'stroke-width': 4 }, g); });
      },
      serpentin: function (R, g) {
        R.vue = 'eau'; R.p.bac = sv('rect', { fill: 'rgba(40,25,15,.35)', stroke: BOIS, 'stroke-width': 7, rx: 6 }, g); R.p.eau = sv('rect', { fill: 'rgba(90,160,220,.55)' }, g);
        R.p.spire = sv('path', { fill: 'none', stroke: CUIVRE, 'stroke-width': 5, 'stroke-linecap': 'round' }, g); R.p.bec = sv('path', { fill: 'none', stroke: CUIVRE, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
        R.eauT = 22;
      },
      essencier: function (R, g) {
        R.vue = 'verre'; R.p.fiole = sv('path', { fill: 'rgba(255,255,255,.18)', stroke: 'rgba(80,110,120,.9)', 'stroke-width': 2.5 }, g); R.p.bec = sv('path', { fill: 'none', stroke: 'rgba(80,110,120,.9)', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
        R.p.couche = sv('rect', { fill: 'rgba(205,200,80,.92)' }, null);
      },
      bouteille: function (R, g) {
        R.vue = 'verre'; R.p.fiole = sv('path', { fill: 'rgba(255,255,255,.16)', stroke: 'rgba(70,100,90,.9)', 'stroke-width': 2.5 }, g);
        if (R.opt.etiquette) { R.p.eti = sv('text', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: '#3b2a1c' }, g); R.p.eti.textContent = R.opt.etiquette; }
      },
      verre: function (R, g) { R.vue = 'verre'; R.p.fiole = sv('path', { fill: 'rgba(255,255,255,.18)', stroke: 'rgba(80,110,120,.9)', 'stroke-width': 2.5 }, g); },
      moulin: function (R, g) {
        R.vue = 'aucune'; R.p.bati = sv('path', { fill: '#4b3a2c', stroke: '#2b2018', 'stroke-width': 2 }, g); R.p.tremie = sv('path', { fill: '#7a5a3a', stroke: '#3b2a1c', 'stroke-width': 2 }, g);
        R.p.rouleaux = [0, 1, 2].map(function () { var gg = sv('g', {}, g); sv('circle', { r: 10, fill: ACIER, stroke: '#333', 'stroke-width': 1.5 }, gg); for (var i = 0; i < 6; i++) sv('line', { x1: 0, y1: 0, x2: 10 * Math.cos(i * 1.047), y2: 10 * Math.sin(i * 1.047), stroke: '#555', 'stroke-width': 1.2 }, gg); return gg; });
        R.p.cannes = sv('g', {}, g); R.p.bagasse = sv('path', { fill: '#c9b27a', stroke: '#9c8452' }, g); R.angle = 0;
      },
      cristallisoir: function (R, g) {
        R.vue = 'coupe'; R.p.fond = sv('path', { fill: 'rgba(40,25,15,.5)' }, g); R.p.paroi = sv('path', { fill: 'none', stroke: ACIER, 'stroke-width': 7, 'stroke-linejoin': 'round' }, g);
        R.p.pale = sv('line', { stroke: '#555', 'stroke-width': 5, 'stroke-linecap': 'round' }, g); R.angle = 0;
      },
      turbine: function (R, g) {
        R.vue = 'aucune'; R.p.cuve = sv('rect', { fill: ACIER, stroke: '#333', 'stroke-width': 2, rx: 8 }, g); R.p.panier = sv('rect', { fill: '#2b2b2b', rx: 4 }, g);
        R.p.raies = sv('g', {}, g); for (var i = 0; i < 6; i++) sv('rect', { fill: 'rgba(255,255,255,.18)' }, R.p.raies); R.p.tas = sv('path', { fill: '#c98f4a', stroke: '#9b6630' }, g); R.angle = 0;
      }
    };
    function placer(R) {
      var x = R.fx * A.W, y = R.fy * A.H, w = R.fw * A.W, h = R.fh * A.H, p = R.p; R.x = x; R.y = y; R.w = w; R.h = h;
      var t = R.type;
      if (t === 'alambic') {
        var by = y + h * 0.78; p.corps.setAttribute('d', 'M' + (x + w * 0.16) + ',' + (y + h * 0.36) + ' Q' + (x - w * 0.02) + ',' + by + ' ' + (x + w * 0.5) + ',' + by + ' Q' + (x + w * 1.02) + ',' + by + ' ' + (x + w * 0.84) + ',' + (y + h * 0.36) + ' Z');
        sa(p.dome, { cx: x + w * 0.5, cy: y + h * 0.3, rx: w * 0.3, ry: h * 0.14 }); p.col.setAttribute('d', 'M' + (x + w * 0.5) + ',' + (y + h * 0.17) + ' Q' + (x + w * 0.55) + ',' + (y + h * 0.02) + ' ' + (x + w * 0.95) + ',' + (y + h * 0.08));
        sa(p.hub, { x: x + w * 0.43, y: y + h * 0.42, width: w * 0.14, height: h * 0.3 }); R.int = { x: x + w * 0.43 + 3, y: y + h * 0.42 + 3, w: w * 0.14 - 6, h: h * 0.3 - 6 };
        sa(p.briques, { x: x + w * 0.08, y: y + h * 0.78, width: w * 0.84, height: h * 0.22 }); sa(p.bouche, { x: x + w * 0.32, y: y + h * 0.83, width: w * 0.36, height: h * 0.14 });
        R.ports = { haut: [x + w * 0.95, y + h * 0.08], sortie: [x + w * 0.84, y + h * 0.7], entree: [x + w * 0.3, y + h * 0.2] }; R.flamme = [x + w * 0.5, y + h * 0.96, w * 0.3];
      } else if (t === 'cuve' || t === 'fermenteur' || t === 'cristallisoir') {
        var hb = R.foyer ? h * 0.78 : h, x0 = x + 4, x1 = x + w - 4, y0 = y + 4, y1 = y + hb - 4, rr = t === 'cristallisoir' ? w * 0.35 : 12;
        var dU = 'M' + x0 + ',' + y0 + ' L' + x0 + ',' + (y1 - rr) + ' Q' + x0 + ',' + y1 + ' ' + (x0 + rr) + ',' + y1 + ' L' + (x1 - rr) + ',' + y1 + ' Q' + x1 + ',' + y1 + ' ' + x1 + ',' + (y1 - rr) + ' L' + x1 + ',' + y0;
        p.fond.setAttribute('d', dU + ' Z'); p.paroi.setAttribute('d', dU); R.int = { x: x0 + 4, y: y0, w: x1 - x0 - 8, h: y1 - y0 - 3, rr: rr };
        if (p.cercles) p.cercles.forEach(function (l, i) { var yy = y0 + (y1 - y0) * (i ? 0.75 : 0.25); sa(l, { x1: x0 - 5, y1: yy, x2: x1 + 5, y2: yy }); });
        if (R.foyer) { sa(p.briques, { x: x + w * 0.05, y: y + hb, width: w * 0.9, height: h - hb }); sa(p.bouche, { x: x + w * 0.3, y: y + hb + (h - hb) * 0.25, width: w * 0.4, height: (h - hb) * 0.6 }); R.flamme = [x + w * 0.5, y + h * 0.97, w * 0.32]; }
        if (p.pale) { R.pc = [x + w / 2, y0 + (y1 - y0) * 0.55, (y1 - y0) * 0.4]; }
        R.ports = { haut: [x + w / 2, y0], sortie: [x1 + 2, y1 - 8], entree: [x + w / 2, y0 - 6] };
      } else if (t === 'serpentin') {
        sa(p.bac, { x: x, y: y, width: w, height: h }); var ie = { x: x + 5, y: y + h * 0.12, w: w - 10, h: h * 0.85 }; sa(p.eau, { x: ie.x, y: ie.y, width: ie.w, height: ie.h }); R.int = ie;
        var d = 'M' + (x - 10) + ',' + (y + h * 0.08), n = 5; for (var i = 0; i < n; i++) { var yy2 = y + h * (0.2 + 0.68 * (i + 0.5) / n); d += ' L' + (x + w * (i % 2 ? 0.2 : 0.8)) + ',' + yy2; }
        d += ' L' + (x + w * 0.8) + ',' + (y + h * 0.92) + ' L' + (x + w + 8) + ',' + (y + h * 0.92); p.spire.setAttribute('d', d); p.bec.setAttribute('d', 'M' + (x + w + 8) + ',' + (y + h * 0.92) + ' L' + (x + w + 14) + ',' + (y + h * 0.98));
        R.ports = { entree: [x - 10, y + h * 0.08], sortie: [x + w + 14, y + h + 4] };
      } else if (t === 'essencier') {
        var cx = x + w * 0.45, d2 = 'M' + (cx - w * 0.08) + ',' + y + ' L' + (cx - w * 0.08) + ',' + (y + h * 0.22) + ' Q' + (x + 2) + ',' + (y + h * 0.4) + ' ' + (x + 4) + ',' + (y + h * 0.7) + ' Q' + (x + 6) + ',' + (y + h) + ' ' + cx + ',' + (y + h) + ' Q' + (x + w * 0.84) + ',' + (y + h) + ' ' + (x + w * 0.86) + ',' + (y + h * 0.7) + ' Q' + (x + w * 0.88) + ',' + (y + h * 0.4) + ' ' + (cx + w * 0.08) + ',' + (y + h * 0.22) + ' L' + (cx + w * 0.08) + ',' + y;
        p.fiole.setAttribute('d', d2); p.bec.setAttribute('d', 'M' + (x + w * 0.8) + ',' + (y + h * 0.9) + ' L' + (x + w * 0.97) + ',' + (y + h * 0.9) + ' L' + (x + w * 0.97) + ',' + (y + h * 0.45) + ' L' + (x + w * 1.08) + ',' + (y + h * 0.52));
        R.int = { x: x + 6, y: y + h * 0.25, w: w * 0.8 - 6, h: h * 0.73, verre: d2 }; R.ports = { entree: [cx, y - 4], sortie: [x + w * 1.08, y + h * 0.52] };
      } else if (t === 'bouteille' || t === 'verre') {
        var d3 = t === 'verre' ? 'M' + x + ',' + y + ' L' + (x + w * 0.12) + ',' + (y + h) + ' L' + (x + w * 0.88) + ',' + (y + h) + ' L' + (x + w) + ',' + y
          : 'M' + (x + w * 0.38) + ',' + y + ' L' + (x + w * 0.38) + ',' + (y + h * 0.25) + ' Q' + x + ',' + (y + h * 0.32) + ' ' + x + ',' + (y + h * 0.5) + ' L' + x + ',' + (y + h * 0.92) + ' Q' + x + ',' + (y + h) + ' ' + (x + w * 0.1) + ',' + (y + h) + ' L' + (x + w * 0.9) + ',' + (y + h) + ' Q' + (x + w) + ',' + (y + h) + ' ' + (x + w) + ',' + (y + h * 0.92) + ' L' + (x + w) + ',' + (y + h * 0.5) + ' Q' + (x + w) + ',' + (y + h * 0.32) + ' ' + (x + w * 0.62) + ',' + (y + h * 0.25) + ' L' + (x + w * 0.62) + ',' + y;
        p.fiole.setAttribute('d', d3); R.int = { x: x + 3, y: t === 'verre' ? y + 2 : y + h * 0.3, w: w - 6, h: t === 'verre' ? h - 4 : h * 0.68, verre: d3 }; R.ports = { entree: [x + w / 2, y - 4] };
        if (p.eti) sa(p.eti, { x: x + w / 2, y: y + h + 15 });
      } else if (t === 'moulin') {
        p.bati.setAttribute('d', 'M' + x + ',' + (y + h) + ' L' + (x + w * 0.12) + ',' + (y + h * 0.3) + ' L' + (x + w * 0.88) + ',' + (y + h * 0.3) + ' L' + (x + w) + ',' + (y + h) + ' Z');
        p.tremie.setAttribute('d', 'M' + (x + w * 0.1) + ',' + y + ' L' + (x + w * 0.9) + ',' + y + ' L' + (x + w * 0.6) + ',' + (y + h * 0.32) + ' L' + (x + w * 0.4) + ',' + (y + h * 0.32) + ' Z');
        var rr2 = Math.min(w, h) * 0.13; R.rp = [[x + w * 0.5, y + h * 0.42], [x + w * 0.35, y + h * 0.66], [x + w * 0.65, y + h * 0.66]]; R.rr = rr2;
        R.ports = { sortie: [x + w * 0.5, y + h * 0.9] }; R.int = null; dessineBagasse(R);
      } else if (t === 'turbine') {
        sa(p.cuve, { x: x, y: y + h * 0.15, width: w, height: h * 0.55 }); sa(p.panier, { x: x + w * 0.12, y: y + h * 0.22, width: w * 0.76, height: h * 0.41 });
        Array.prototype.forEach.call(p.raies.children, function (r, i) { sa(r, { x: x + w * 0.12, y: y + h * 0.22, width: w * 0.06, height: h * 0.41 }); });
        R.ports = { entree: [x + w / 2, y + h * 0.12], sortie: [x + w + 4, y + h * 0.6] }; R.tasP = [x + w * 0.5, y + h]; R.int = null;
      }
      if (R.jauge) placeJauge(R);
    }
    function sa(e, at) { for (var k in at) e.setAttribute(k, typeof at[k] === 'number' ? Math.round(at[k] * 10) / 10 : at[k]); }
    function dessineBagasse(R) { if (!R.p.bagasse) return; var k = Math.min(1, (R.c.bagasse || 0) / 40), bx = R.x + R.w * 1.02, by = R.y + R.h, bw = R.w * (0.25 + 0.4 * k), bh = R.h * 0.35 * k; R.p.bagasse.setAttribute('d', k > 0.01 ? 'M' + bx + ',' + by + ' Q' + (bx + bw * 0.5) + ',' + (by - bh * 2) + ' ' + (bx + bw) + ',' + by + ' Z' : ''); }

    function appareil(type, o2) {
      o2 = o2 || {}; var g = sv('g', { 'class': 'kwfx-app-' + type }, svg);
      var R = { type: type, opt: o2, g: g, p: {}, c: {}, T: o2.temperature || 25, chauffe: 0, cap: o2.contenance || 100, fx: o2.x || 0, fy: o2.y || 0, fw: o2.l || 0.2, fh: o2.h || 0.3, nom: o2.nom || type, robinet: 0, sortie: null, vapeurVers: null, evap: 0, vap: null, ecume: 0, brule: 0, ferm: 0, levure: false, malaxe: false, tourne: false, ebul: 0, fuite: 0, debitCond: 0, recu: {} };
      for (var k in o2.contenu || {}) R.c[k] = o2.contenu[k];
      if (o2.essenceFeuilles) R.essF = o2.essenceFeuilles; else if (R.c.feuilles) R.essF = R.c.feuilles * 0.004;
      DESSINS[type](R, g);
      if (R.vue === 'verre' || R.vue === 'coupe' || R.vue === 'hublot' || R.vue === 'eau') { R.p.liq = sv('rect', { fill: 'transparent' }, null); R.clip = sv('clipPath', { id: id + 'c' + A.app.length }, defs); R.clipEl = sv('path', {}, R.clip); var gl = sv('g', { 'clip-path': 'url(#' + id + 'c' + A.app.length + ')' }, g); gl.appendChild(R.p.liq); if (R.p.couche) gl.appendChild(R.p.couche); if (R.vue === 'verre') g.appendChild(R.p.fiole); }
      if (o2.mesure !== false && type !== 'moulin' && type !== 'turbine') { R.jauge = document.createElement('div'); R.jauge.style.cssText = 'position:absolute;transform:translateX(-50%);background:rgba(255,250,240,.92);border-radius:10px;padding:3px 8px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 2px 8px rgba(60,30,10,.15)'; hud.appendChild(R.jauge); }
      A.app.push(R); placer(R); return R;
    }
    function placeJauge(R) { var j = R.jauge; j.style.left = (R.x + R.w / 2) + 'px'; j.style.top = Math.max(2, R.y - (R.type === 'alambic' ? -R.h * 0.02 : 26)) + 'px'; if (R.type === 'alambic') { j.style.top = (R.y + R.h * 0.5) + 'px'; j.style.left = (R.x + R.w * 0.2) + 'px'; } }
    function mesures(R) {
      var C = R.c, m = masseLiquide(C), out = [];
      if (R.type === 'serpentin') return [Math.round(R.eauT) + ' °C eau'];
      if (R.foyer || R.type === 'fermenteur' || R.type === 'cristallisoir') out.push(Math.round(R.T) + ' °C');
      var b = brixDe(C); if (b > 1 && R.type !== 'essencier') out.push(Math.round(b) + ' °Brix');
      var dg = degreDe(C); if (dg > 0.5) out.push(Math.round(dg) + ' % alcool');
      if (R.type === 'essencier' && C.essence > 0) out.push((C.essence * 1000).toFixed(0) + ' g d\'essence');
      if (C.cristaux > 0.05) out.push(Math.round(C.cristaux / Math.max(0.01, m) * 100) + ' % cristaux');
      if (!out.length && m > 0.05) out.push(m.toFixed(1) + ' kg');
      return out;
    }
    function tuyau(a, b, o2) { o2 = o2 || {}; var T = { a: a, b: b, type: o2.type || 'vapeur', el: sv('path', { fill: 'none', stroke: o2.type === 'liquide' ? ACIER : CUIVRE, 'stroke-width': o2.type === 'liquide' ? 5 : 7, 'stroke-linecap': 'round' }, svg), flux: 0 }; svg.insertBefore(T.el, svg.firstChild.nextSibling); if (T.type === 'vapeur') a.vapeurVers = b; else a.sortie = b; A.tuyaux.push(T); dessineTuyau(T); return T; }
    function dessineTuyau(T) { var p0 = T.type === 'vapeur' ? T.a.ports.haut : T.a.ports.sortie, p1 = T.b.ports.entree; if (!p0 || !p1) return; var mx = (p0[0] + p1[0]) / 2; T.p0 = p0; T.p1 = p1; T.el.setAttribute('d', 'M' + p0[0] + ',' + p0[1] + ' C' + mx + ',' + p0[1] + ' ' + mx + ',' + p1[1] + ' ' + p1[0] + ',' + p1[1]); }

    /* ---------- physique ---------- */
    function ajoute(R, C, f) { for (var k in C) { if (k[0] === '_') continue; var v = C[k] * f; if (v > 0) R.c[k] = (R.c[k] || 0) + v; R.recu[k] = (R.recu[k] || 0) + v; } }
    function retire(R, f) { var out = {}; for (var k in R.c) { if (SOLIDES[k] && k !== 'cristaux') continue; if (k[0] === '_') continue; var v = R.c[k] * f; out[k] = v; R.c[k] -= v; } return out; }
    function pas(R, dt) {
      var C = R.c, m = masseLiquide(C), mT = m + (C.feuilles || 0) * 0.4 + 2;
      // chaleur : le feu chauffe, la cuve perd de la chaleur ; à l'ébullition, l'énergie en plus fait de la vapeur
      var P = R.chauffe * (R.opt.puissance || 70), perte = (R.T - 25) * 0.06 * (1 + Math.sqrt(m) * 0.15), Tb = ebullition(C);
      R.evap = 0;
      if (m > 0.05) {
        if (R.T < Tb || P <= perte) R.T += (P - perte) / mT * dt * 2.2; else { R.T = Tb + Math.min(1.5, (P - perte) * 0.01); R.evap = Math.min((C.eau || 0) + (C.alcool || 0) + (C.tetes || 0), (P - perte) / 1500 * dt * A.vitesse); }
      } else if (P > 0) R.T += P / mT * dt * 3; else R.T += (25 - R.T) * dt * 0.05;
      R.ebul = R.evap > 0 ? Math.min(1, R.evap / dt * 6) : Math.max(0, (R.T - Tb + 8) / 8) * 0.25 * (R.chauffe > 0 ? 1 : 0);
      if (R.evap > 0) {
        var eau = C.eau || 0, alc = C.alcool || 0, tet = C.tetes || 0, liq = eau + alc + tet, x = liq > 0 ? (alc + tet) / liq : 0;
        var y = x; for (var pl = 0; pl < (R.opt.plateaux || 1); pl++) { var al = 1 + 9 * (1 - y); y = al * y / (1 + (al - 1) * y); } if (!(liq > 0)) y = 0; var vA = R.evap * y, vE = R.evap - vA;
        var vT = Math.min(tet, vA * (tet / Math.max(1e-6, alc + tet)) * 12); vA = Math.min(alc, vA - Math.min(vA, vT) * 0.2);
        var V = { eau: Math.min(eau, vE), alcool: vA, tetes: vT };
        // entraînement à la vapeur : la vapeur traverse les feuilles et emporte l'essence
        if (R.essF > 0 && C.feuilles > 0) { var e = Math.min(R.essF, V.eau * 0.006 * (R.essF / (C.feuilles * 0.004)) * (1 + 0.5 * (R.essF / (C.feuilles * 0.004)))); R.essF -= e; V.essence = e; }
        C.eau = eau - V.eau; C.alcool = alc - V.alcool; C.tetes = tet - V.tetes; R.vap = V;
        if (R.vapeurVers) condense(R.vapeurVers, V, dt, R); else { R.fuite = R.evap / dt; }
      } else R.vap = null;
      // trop chaud : le sucre caramélise puis brûle, les feuilles à sec brûlent
      var sec = (C.feuilles || 0) > 0 && (C.eau || 0) < C.feuilles * 0.12, brule = (brixDe(C) > 70 && R.T > 124) || (sec && R.chauffe > 0.15 && R.T > 100);
      if (brule) { R.brule += dt; C._brule = Math.min(1, (C._brule || 0) + dt * 0.05); if (R.brule > 0.6 && !R.alerteB) { R.alerteB = true; perdre(8, R, sec ? 'Les feuilles attrapent au fond : remets de l\'eau ou baisse le feu.' : 'Doucement, ça commence à caraméliser : baisse un peu le feu.'); } } else { R.brule = 0; R.alerteB = false; }
      // fermentation : les levures transforment le sucre en alcool et en gaz (bulles) ; trop chaud, elles meurent
      R.ferm = 0;
      if (R.levure && (C.sucre || 0) > 0.01) {
        var fT = R.T < 18 ? 0.1 : R.T > 40 ? 0 : Math.exp(-sq((R.T - 32) / 6)), r = Math.min(C.sucre, 0.012 * C.sucre * fT * dt * A.vitesse + 0.0006 * fT * dt * A.vitesse);
        C.sucre -= r; C.alcool = (C.alcool || 0) + r * 0.49; C.tetes = (C.tetes || 0) + r * 0.004; C.eau = (C.eau || 0) + r * 0.02; R.ferm = r / dt; R.T += r * 0.25;
        if (R.T > 40 && !R.alerteF) { R.alerteF = true; R.levure = false; perdre(10, R, 'Trop chaud pour les levures : elles se sont arrêtées. Garde le vin de canne entre 30 et 34 °C.'); }
      }
      // écume : en chauffant le jus de canne avec la chaux, les impuretés montent en écume
      if ((C.impuretes || 0) > 0 && R.T > 70 && (C.chaux || 0) > 0) { var u = Math.min(C.impuretes, C.impuretes * 0.08 * dt); C.impuretes -= u; R.ecume += u * 40; }
      // cristallisation : sirop très concentré qui refroidit en étant brassé
      if (R.type === 'cristallisoir' && brixDe(C) > 82 && R.T < 95 && (C.sucre || 0) > 0.05) { var cr = Math.min(C.sucre, C.sucre * (R.malaxe ? 0.05 : 0.008) * dt * A.vitesse * Math.min(1, (95 - R.T) / 20)); C.sucre -= cr; C.cristaux = (C.cristaux || 0) + cr; if (Math.random() < cr * 40) A.etincelles.push({ x: R.int.x + Math.random() * R.int.w, y: R.int.y + R.int.h * (1 - niveau(R) * Math.random()), t: 0 }); }
      if (R.type === 'cristallisoir' && R.malaxe) R.angle += dt * 2.5;
      // moulin : les cannes passent entre les rouleaux, le vesou coule, la bagasse sort
      if (R.type === 'moulin') {
        if (R.tourne) R.angle += dt * 2.2;
        if (R.tourne && (C.cannes || 0) > 0) { var k3 = Math.min(C.cannes, 1.6 * dt * A.vitesse); C.cannes -= k3; C.bagasse = (C.bagasse || 0) + k3 * 0.3; var v = { eau: k3 * 0.57, sucre: k3 * 0.12, impuretes: k3 * 0.006 }; R.flux = k3 / dt; if (R.sortie) { ajoute(R.sortie, v, 1); A.filets.push({ a: R.ports.sortie, b: R.sortie.ports.entree, t: 0.2, coul: [150, 160, 90] }); } dessineBagasse(R); } else R.flux = 0;
        R.p.rouleaux.forEach(function (gg, i) { gg.setAttribute('transform', 'translate(' + R.rp[i][0] + ',' + R.rp[i][1] + ') scale(' + (R.rr / 10) + ') rotate(' + (R.angle * 57.3 * (i ? -1 : 1)) + ')'); });
      }
      if (R.type === 'turbine') {
        if (R.tourne) { R.angle += dt * 18; var cx2 = C.cristaux || 0, liq2 = masseLiquide(C) - cx2; if (liq2 > 0.01) { var s2 = Math.min(liq2, liq2 * 0.4 * dt * A.vitesse); var f2 = s2 / liq2; var out2 = {}; for (var k4 in C) { if (k4 === 'cristaux' || SOLIDES[k4] || k4[0] === '_') continue; out2[k4] = C[k4] * f2; C[k4] -= out2[k4]; } if (R.sortie) ajoute(R.sortie, { melasse: s2 }, 1); } if (cx2 > 0 && liq2 < cx2 * 0.15) { var s3 = Math.min(cx2, 0.4 * dt * A.vitesse); C.cristaux -= s3; R.sucreSec = (R.sucreSec || 0) + s3; } }
        Array.prototype.forEach.call(R.p.raies.children, function (rr, i) { var ph = (R.angle + i * 1.047) % 6.283, vis = Math.sin(ph); sa(rr, { x: R.x + R.w * (0.15 + 0.6 * (0.5 + 0.5 * Math.cos(ph))), opacity: vis > 0 ? 0.9 : 0 }); });
        var k5 = Math.min(1, (R.sucreSec || 0) / 8), tx = R.tasP[0], ty = R.tasP[1], tw = R.w * (0.2 + 0.4 * k5), th = R.h * 0.3 * k5; R.p.tas.setAttribute('d', k5 > 0.01 ? 'M' + (tx - tw) + ',' + ty + ' Q' + tx + ',' + (ty - th * 2) + ' ' + (tx + tw) + ',' + ty + ' Z' : '');
      }
      // robinet ouvert : le liquide coule vers l'appareil suivant
      if (R.robinet > 0 && R.sortie && R.type !== 'moulin' && R.type !== 'turbine') {
        var mm = masseLiquide(C) - (R.type === 'cristallisoir' ? 0 : (C.cristaux || 0)); if (mm > 0.01) { var q = Math.min(mm, R.robinet * 3 * dt * A.vitesse); var tr = R.type === 'cristallisoir' ? retireTout(R, q / Math.max(1e-6, masseLiquide(C))) : retire(R, q / mm); var Tm = (R.sortie.T * masseLiquide(R.sortie.c) + R.T * q) / Math.max(0.01, masseLiquide(R.sortie.c) + q); ajoute(R.sortie, tr, 1); R.sortie.T = Tm; if (tr.chaux) R.sortie.c.chaux = (R.sortie.c.chaux || 0) + tr.chaux; A.filets.push({ a: R.ports.sortie, b: R.sortie.ports.entree, t: 0.15, coul: (couleurContenu(tr) || [200, 200, 200]).slice(0, 3) }); }
      }
      if (R.type === 'serpentin') { R.eauT += ((R.debitEau || 0) * (12 - R.eauT) * 0.25 + (R.chaleurRecue || 0) * 0.9) * dt; R.chaleurRecue = 0; R.eauT = borne(R.eauT, 12, 100); }
    }
    function retireTout(R, f) { var out = {}; for (var k in R.c) { if (k[0] === '_' || k === 'levure') continue; var v = R.c[k] * f; out[k] = v; R.c[k] -= v; } return out; }
    function sq(v) { return v * v; }
    // condensation dans le serpentin : il faut de l'eau froide, sinon une partie de la vapeur s'échappe
    function condense(S, V, dt, src) {
      var tot = 0; for (var k in V) tot += V[k] || 0; if (tot <= 0) return;
      if (S.type !== 'serpentin') { ajoute(S, V, 1); return; }
      var capa = (S.debitEau || 0) * 0.5 * Math.max(0, (90 - S.eauT) / 70) * dt * A.vitesse + 0.0004 * dt, f = Math.min(1, capa / tot);
      S.chaleurRecue = (S.chaleurRecue || 0) + tot / dt * 40 * f; S.fuite = (1 - f) * tot / dt; S.debitCond = f * tot / dt; src.fuite = 0;
      var deg = (V.alcool + V.tetes) / Math.max(1e-6, tot) * 100; S.degreSortie = deg; S.tetesSortie = V.tetes / Math.max(1e-6, V.alcool + V.tetes);
      if (S.sortie) { ajoute(S.sortie, V, f); if (f > 0) A.gouttesDe.push(S); }
      if (f < 0.75 && tot / dt > 0.002) { S.fuiteT = (S.fuiteT || 0) + dt; if (S.fuiteT > 1.2 && !S.alerteV) { S.alerteV = true; perdre(5, S, 'La vapeur s\'échappe du serpentin : ouvre plus l\'eau froide ou baisse le feu.'); } } else { S.fuiteT = 0; if (f > 0.95) S.alerteV = false; }
    }
    function perdre(pts, R, txt) { A.qualite = Math.max(0, A.qualite - pts); dire(txt, 'doux', 5200); evenementFx('presque', R.x + R.w / 2, R.y + R.h * 0.3); emettre('conseil', { texte: txt, appareil: R }); majGuide(); }
    function niveau(R) { var m = masseLiquide(R.c) + (R.c.feuilles || 0) * 0.35 + (R.c.cannes || 0) * 0.5; return Math.min(1, m / R.cap); }

    /* ---------- rendu des liquides, bulles, vapeur, gouttes, filets, feu ---------- */
    A.filets = []; A.gouttesDe = [];
    function rendu(dt) {
      var x = A.ctx, d = A.d; x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, A.W, A.H);
      A.app.forEach(function (R) {
        if (R.p.liq && R.int) {
          var I = R.int, lv = niveau(R), col = couleurContenu(R.c);
          if (R.type === 'serpentin') { var tw = borne((R.eauT - 15) / 70, 0, 1); R.p.eau.setAttribute('fill', 'rgba(' + Math.round(90 + 150 * tw) + ',' + Math.round(160 - 40 * tw) + ',' + Math.round(220 - 120 * tw) + ',.55)'); }
          var hL = I.h * lv, yL = I.y + I.h - hL;
          if (R.clipEl.getAttribute('data-k') !== I.x + ',' + I.y + ',' + I.w) { R.clipEl.setAttribute('data-k', I.x + ',' + I.y + ',' + I.w); R.clipEl.setAttribute('d', I.verre ? I.verre : 'M' + I.x + ',' + I.y + ' h' + I.w + ' v' + (I.h - (I.rr || 0)) + ' q0,' + (I.rr || 0) + ' ' + (-(I.rr || 0)) + ',' + (I.rr || 0) + ' h' + (-(I.w - 2 * (I.rr || 0))) + ' q' + (-(I.rr || 0)) + ',0 ' + (-(I.rr || 0)) + ',' + (-(I.rr || 0)) + ' Z'); }
          if (R.type !== 'serpentin') { sa(R.p.liq, { x: I.x - 20, y: yL, width: I.w + 40, height: hL + 30, fill: col ? 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + col[3] + ')' : 'transparent' }); }
          if (R.p.couche) { var ep = Math.min(I.h * 0.5, (R.c.essence || 0) * 500 / Math.max(1, R.cap) * I.h * 0.9 + (R.c.essence > 0.0005 ? 2 : 0)); sa(R.p.couche, { x: I.x - 20, y: yL, width: I.w + 40, height: ep }); }
          // feuilles dans la chaudière (vues par le hublot), cannes dans la trémie
          if (R.c.feuilles > 0) { x.fillStyle = 'rgba(70,110,50,' + (0.5 * Math.min(1, R.c.feuilles / 30)) + ')'; for (var i = 0; i < 6; i++) { x.beginPath(); x.ellipse(I.x + I.w * (0.2 + 0.6 * ((i * 37) % 10) / 10), I.y + I.h * (0.15 + 0.12 * i), I.w * 0.18, 3, i, 0, 6.283); x.fill(); } }
          // bulles : ébullition ou fermentation
          var nb = R.ebul * 14 + Math.min(10, R.ferm * 2500);
          if (nb > 0.2 && hL > 4) { R.accB = (R.accB || 0) + nb * dt * 3; while (R.accB > 1) { R.accB--; A.bulles.push({ R: R, x: I.x + 4 + Math.random() * (I.w - 8), y: I.y + I.h - 2, r: hasard(1, R.ebul > 0.5 ? 4 : 2.2), v: hasard(30, 80) * (R.ebul > 0.5 ? 1.6 : 1), w: Math.random() * 6 }); } }
          // écume sur le jus qui chauffe
          if (R.ecume > 0.05 && hL > 2) { x.fillStyle = 'rgba(232,220,170,.95)'; var eh = Math.min(16, 3 + R.ecume * 2); x.beginPath(); x.moveTo(I.x, yL); for (var k = 0; k <= 12; k++) x.lineTo(I.x + I.w * k / 12, yL - eh * (0.5 + 0.5 * Math.sin(k * 1.7 + A.t * 2))); x.lineTo(I.x + I.w, yL + 3); x.lineTo(I.x, yL + 3); x.fill(); }
          // vaguelettes de surface
          if (hL > 2 && col) { x.strokeStyle = 'rgba(255,255,255,.45)'; x.lineWidth = 1.2; x.beginPath(); for (var k2 = 0; k2 <= 10; k2++) { var yy = yL + Math.sin(k2 * 1.3 + A.t * (2 + R.ebul * 8)) * (0.6 + R.ebul * 2); if (k2) x.lineTo(I.x + I.w * k2 / 10, yy); else x.moveTo(I.x, yy); } x.stroke(); }
        }
        // feu sous la chaudière
        if (R.flamme && R.chauffe > 0.01) {
          var f = R.flamme, n = 5, fk = R.chauffe; x.globalCompositeOperation = 'lighter';
          for (var j = 0; j < n; j++) { var fx2 = f[0] + (j - (n - 1) / 2) * f[2] / n * 1.6, hh = (12 + 30 * fk) * (0.75 + 0.25 * Math.sin(A.t * 13 + j * 2.1)) * (j === 2 ? 1.2 : 0.9), g = x.createRadialGradient(fx2, f[1] - hh * 0.3, 1, fx2, f[1] - hh * 0.3, hh);
            g.addColorStop(0, 'rgba(255,240,170,' + (0.9 * fk + 0.1) + ')'); g.addColorStop(0.4, 'rgba(255,140,30,' + (0.7 * fk + 0.1) + ')'); g.addColorStop(1, 'rgba(180,30,0,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(fx2, f[1] - hh * 0.35, hh * 0.32, hh * 0.75, 0, 0, 6.283); x.fill(); }
          x.globalCompositeOperation = 'source-over';
        }
        // vapeur : s'échappe d'une cuve ouverte qui bout, ou du serpentin qui n'arrive plus à tout condenser
        var fuite = (R.vapeurVers ? 0 : R.evap / Math.max(dt, 1e-3)) + (R.type === 'serpentin' ? R.fuite || 0 : 0), pp = R.type === 'serpentin' ? R.ports.sortie : (R.vue === 'coupe' ? [R.int.x + R.int.w / 2, R.int.y] : R.ports.haut);
        if (fuite > 0.001 && pp) { R.accV = (R.accV || 0) + Math.min(30, fuite * 900) * dt; while (R.accV > 1) { R.accV--; A.puffs.push({ x: pp[0] + hasard(-R.w * 0.25, R.w * 0.25) * (R.vue === 'coupe' ? 1 : 0.1), y: pp[1], r: hasard(6, 12), vx: hasard(-8, 8), vy: -hasard(25, 50), t: 0, vie: hasard(1.4, 2.4), c: R.c._brule > 0.3 ? 80 : 245 }); } }
        if (R.c._brule > 0.25 && R.chauffe > 0 && Math.random() < dt * 4) A.puffs.push({ x: R.x + R.w / 2, y: R.y, r: 8, vx: hasard(-5, 5), vy: -30, t: 0, vie: 2, c: 70 });
      });
      // gouttes qui tombent du bec du serpentin
      A.gouttesDe.forEach(function (S) { if (!S.sortie) return; S.accG = (S.accG || 0) + Math.min(20, S.debitCond * 1500) * dt; while (S.accG > 1) { S.accG--; A.gouttes.push({ x: S.ports.sortie[0], y: S.ports.sortie[1], vy: 0, cible: S.sortie.int ? S.sortie.int.y + S.sortie.int.h * (1 - niveau(S.sortie)) : S.ports.sortie[1] + 80, c: S.vap ? 240 : 240 }); } });
      A.gouttesDe = [];
      x.fillStyle = 'rgba(200,230,255,.95)'; A.gouttes = A.gouttes.filter(function (g) { g.vy += 900 * dt; g.y += g.vy * dt; if (g.y > g.cible) return false; x.beginPath(); x.ellipse(g.x, g.y, 1.8, 2.8, 0, 0, 6.283); x.fill(); return true; });
      // bulles
      A.bulles = A.bulles.filter(function (b) { var I = b.R.int, top = I.y + I.h * (1 - niveau(b.R)); b.y -= b.v * dt; b.x += Math.sin(A.t * 6 + b.w) * 0.4; if (b.y < top) return false; x.save(); x.beginPath(); x.rect(I.x, I.y, I.w, I.h); x.clip(); x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 1; x.beginPath(); x.arc(b.x, b.y, b.r, 0, 6.283); x.stroke(); x.restore(); return true; });
      if (A.bulles.length > 300) A.bulles.splice(0, A.bulles.length - 300);
      // filets de liquide entre deux appareils
      A.filets = A.filets.filter(function (f) { f.t -= dt; var a = f.a, b = f.b; x.strokeStyle = 'rgba(' + f.coul.join(',') + ',.85)'; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(a[0], a[1]); x.quadraticCurveTo(a[0] + (b[0] - a[0]) * 0.35, a[1] - 6, b[0], b[1]); x.setLineDash([6, 4]); x.lineDashOffset = -A.t * 60; x.stroke(); x.setLineDash([]); return f.t > 0; });
      if (A.filets.length > 12) A.filets.splice(0, A.filets.length - 12);
      // vapeur
      A.puffs = A.puffs.filter(function (p) { p.t += dt; if (p.t > p.vie) return false; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 14; var al = Math.sin(Math.PI * p.t / p.vie) * 0.35, g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, 'rgba(' + p.c + ',' + p.c + ',' + p.c + ',' + al + ')'); g.addColorStop(1, 'rgba(' + p.c + ',' + p.c + ',' + p.c + ',0)'); x.fillStyle = g; x.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); return true; });
      if (A.puffs.length > 220) A.puffs.splice(0, A.puffs.length - 220);
      // cristaux qui scintillent
      A.etincelles = A.etincelles.filter(function (e) { e.t += dt; if (e.t > 0.8) return false; var k = Math.sin(Math.PI * e.t / 0.8); x.fillStyle = 'rgba(255,250,220,' + k + ')'; x.fillRect(e.x - 3 * k, e.y - 0.5, 6 * k, 1); x.fillRect(e.x - 0.5, e.y - 3 * k, 1, 6 * k); return true; });
      // pales et jauges
      A.app.forEach(function (R) {
        if (R.p.pale && R.pc) sa(R.p.pale, { x1: R.pc[0] - Math.cos(R.angle) * R.pc[2], y1: R.pc[1] - Math.sin(R.angle) * R.pc[2] * 0.3, x2: R.pc[0] + Math.cos(R.angle) * R.pc[2], y2: R.pc[1] + Math.sin(R.angle) * R.pc[2] * 0.3 });
        if (R.jauge) { var txt = mesures(R).join(' · '), ok = R.zone && R.zone.ok; if (R.jauge._t !== txt + ok) { R.jauge._t = txt + ok; R.jauge.textContent = txt; R.jauge.style.outline = R.zone ? (ok ? '3px solid #3aa45c' : '2px dashed #c98a3a') : 'none'; R.jauge.style.display = txt ? '' : 'none'; } }
      });
    }
    // bruit de bouillon : petits « bloup » dont la cadence suit l'ébullition
    function bouillon(dt) {
      var b = 0; A.app.forEach(function (R) { b += R.ebul + Math.min(0.6, R.ferm * 200); }); if (!b || !self.opt.sons) return; var a = self.audio.pret(); if (!a) return;
      A.accS = (A.accS || 0) + b * dt * 7; while (A.accS > 1) { A.accS--; var o2 = a.createOscillator(), g = a.createGain(), t0 = a.currentTime + Math.random() * 0.05, f0 = hasard(160, 420); o2.frequency.setValueAtTime(f0, t0); o2.frequency.exponentialRampToValueAtTime(f0 * 2.2, t0 + 0.06); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.06 * self.opt.volume * self.pub.son, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09); o2.connect(g); g.connect(a.destination); o2.start(t0); o2.stop(t0 + 0.1); }
    }
    function boucle(ts) {
      var dt = A.der ? Math.min(0.05, (ts - A.der) / 1000) : 0.016; A.der = ts; if (self.enPause) dt = 0; A.t += dt;
      if (dt > 0) { A.app.forEach(function (R) { pas(R, dt); }); if (A.recette) suivreRecette(dt); }
      rendu(dt); bouillon(dt);
      A.raf = _kwVie.requestAnimationFrame(boucle);
    }

    /* ---------- contrôles ---------- */
    var STYLE_B = 'min-height:44px;padding:8px 14px;border-radius:12px;border:0;font:800 14px system-ui,sans-serif;cursor:pointer;background:#5a3a22;color:#fff8ee';
    function bouton(txt, f, opt) { var b = document.createElement('button'); b.type = 'button'; b.className = 'zone-interactive'; b.textContent = txt; b.style.cssText = STYLE_B + (opt && opt.couleur ? ';background:' + opt.couleur : ''); _kwVie.ecoute(b, 'click', function () { f(b); evenementFx('clic', A.W / 2, A.H - 20); }); barre.appendChild(b); return b; }
    function curseur(txt, f, v0, opt) {
      var l = document.createElement('label'); l.style.cssText = 'display:flex;align-items:center;gap:8px;font-weight:800;flex:1 1 200px;min-width:180px;background:rgba(90,58,34,.08);padding:4px 10px;border-radius:12px';
      l.textContent = txt; var r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = 1; r.step = 0.01; r.value = v0 || 0; r.style.cssText = 'flex:1;min-height:44px;accent-color:' + ((opt && opt.couleur) || '#c25b1e'); r.setAttribute('aria-label', txt);
      r.className = 'zone-interactive'; _kwVie.ecoute(r, 'input', function () { f(parseFloat(r.value)); }); l.appendChild(r); barre.appendChild(l); f(parseFloat(r.value)); return r;
    }

    /* ---------- recettes guidées ---------- */
    var etapesEl = document.createElement('ol'), resume = document.createElement('div');
    etapesEl.style.cssText = 'margin:0;padding:12px 14px 12px 34px;background:rgba(255,250,240,.9);border-radius:14px;line-height:1.5';
    resume.style.cssText = 'padding:12px 14px;background:rgba(255,250,240,.9);border-radius:14px';
    function majGuide() {
      var R = A.recette; if (!R) return;
      etapesEl.innerHTML = ''; R.etapes.forEach(function (e, i) { var li = document.createElement('li'); li.textContent = (e.fait ? '✓ ' : i === R.i ? '→ ' : '') + e.texte; li.style.cssText = 'font-weight:' + (i === R.i ? 900 : 600) + ';color:' + (e.fait ? '#1d6b3a' : i === R.i ? '#2a1f17' : '#8a7a6a'); etapesEl.appendChild(li); });
      resume.innerHTML = '<b style="font-size:16px">' + R.titre + '</b><div style="margin:.3em 0">' + R.info + '</div><div>Qualité : <b>' + Math.round(A.qualite) + ' %</b>' + (R.resultat ? ' · ' + R.resultat() : '') + '</div>';
    }
    function suivreRecette(dt) {
      var R = A.recette, e = R.etapes[R.i]; if (!e) return;
      if (R.zone) { var Z = R.zone, v = Z.mesure(); Z.app.zone = { ok: v >= Z.min && v <= Z.max }; }
      if (e.verif(dt)) {
        e.fait = true; R.i++; var p = e.ou ? e.ou() : [A.W / 2, A.H / 2];
        if (R.i >= R.etapes.length) { A.fini = true; var score = Math.round(A.qualite); dire(R.fin(score), 'bravo', 7000); evenementFx('victoire', p[0], p[1]); emettre('fini', { qualite: score, recette: R.nom }); }
        else { dire(R.etapes[R.i].conseil || R.etapes[R.i].texte, null, 5000); evenementFx('bonne', p[0], p[1], { points: 10 }); emettre('etape', { i: R.i, etape: R.etapes[R.i - 1] }); }
        majGuide();
      }
    }
    var RECETTES = {
      geranium: function () {
        var ch = appareil('alambic', { x: 0.05, y: 0.18, l: 0.3, h: 0.72, contenance: 110, contenu: { eau: 45, feuilles: 0 }, nom: 'Chaudière', puissance: 80 });
        var se = appareil('serpentin', { x: 0.47, y: 0.22, l: 0.22, h: 0.42, nom: 'Serpentin' });
        var es = appareil('essencier', { x: 0.7, y: 0.69, l: 0.12, h: 0.24, contenance: 6, nom: 'Essencier' });
        var bi = appareil('bouteille', { x: 0.87, y: 0.66, l: 0.1, h: 0.25, contenance: 10, etiquette: 'Eau florale' });
        tuyau(ch, se); se.sortie = es; es.sortie = bi;
        var feu = 0;
        bouton('Charger les feuilles de géranium', function (b) { ch.c.feuilles = 60; ch.essF = 60 * 0.004; b.disabled = true; b.style.opacity = 0.5; });
        curseur('Feu', function (v) { feu = v; A.feu(ch, v); }, 0);
        curseur('Eau froide', function (v) { se.debitEau = v * 1.2; }, 0, { couleur: '#2e7fc2' });
        // l'essence (plus légère) flotte : quand l'essencier est plein, l'eau florale déborde par le bec vers la bouteille
        var garde = 0;
        A.recette = { nom: 'geranium', titre: 'Distillation du géranium', info: 'La vapeur traverse les feuilles et emporte leur essence. Dans le serpentin elle redevient liquide ; dans l\'essencier, l\'essence plus légère flotte sur l\'eau florale.', i: 0,
          zone: { app: ch, mesure: function () { return ch.T; }, min: 99, max: 101.5 },
          etapes: [
            { texte: 'Charge la chaudière avec les feuilles de géranium.', verif: function () { return ch.c.feuilles > 0; }, ou: function () { return [ch.x + ch.w / 2, ch.y + ch.h / 2]; } },
            { texte: 'Allume le feu sous la chaudière.', verif: function () { return feu > 0.2; }, ou: function () { return ch.flamme; } },
            { texte: 'Ouvre l\'eau froide du serpentin avant que ça bouille.', conseil: 'Bien : la vapeur va pouvoir redevenir liquide.', verif: function () { return se.debitEau > 0.3; }, ou: function () { return [se.x + se.w / 2, se.y]; } },
            { texte: 'Laisse bouillir doucement : les premières gouttes tombent dans l\'essencier.', verif: function () { return es.c.eau > 0.4; }, ou: function () { return [es.x + es.w / 2, es.y]; } },
            { texte: 'Récolte au moins 8 g d\'essence sans laisser la vapeur s\'échapper.', verif: function () { return (es.c.essence || 0) >= 0.008; }, ou: function () { return [es.x + es.w / 2, es.y + es.h * 0.4]; } }
          ],
          resultat: function () { return 'essence : ' + ((es.c.essence || 0) * 1000).toFixed(1) + ' g · eau florale : ' + ((bi.c.eau || 0)).toFixed(1) + ' L'; },
          fin: function (q) { return q >= 85 ? 'Essence de géranium Bourbon de belle qualité ! (' + q + ' %)' : 'Essence récoltée (' + q + ' %). La prochaine fois, garde un feu plus doux et assez d\'eau froide.'; } };
        // l'essencier déborde : l'eau florale part, l'essence reste
        A.surPas = function () { var m = masseLiquide(es.c); if (m > es.cap) { var exc = m - es.cap, e = es.c.eau || 0; if (e > 0) { var q = Math.min(e, exc); es.c.eau -= q; bi.c.eau = (bi.c.eau || 0) + q; A.filets.push({ a: es.ports.sortie, b: bi.ports.entree, t: 0.2, coul: [235, 240, 235] }); } } };
      },
      rhum: function () {
        var fe = appareil('fermenteur', { x: 0.03, y: 0.3, l: 0.2, h: 0.58, contenance: 120, contenu: { eau: 60, melasse: 0, sucre: 0 }, nom: 'Cuve de fermentation', temperature: 26 });
        var al = appareil('alambic', { x: 0.27, y: 0.2, l: 0.24, h: 0.7, contenance: 120, nom: 'Alambic à colonne', puissance: 75, plateaux: 2 });
        var se = appareil('serpentin', { x: 0.57, y: 0.2, l: 0.18, h: 0.4, nom: 'Serpentin' });
        var bt = [['Têtes', 0.75], ['Cœur', 0.84], ['Queues', 0.93]].map(function (q) { return appareil('bouteille', { x: q[1], y: 0.7, l: 0.065, h: 0.2, contenance: 8, etiquette: q[0] }); });
        tuyau(al, se); fe.sortie = al; var choix = 0; se.sortie = bt[0];
        bouton('Verser la mélasse', function (b) { fe.c.sucre = 14; fe.c.melasse = 2; b.disabled = true; b.style.opacity = 0.5; });
        bouton('Ajouter les levures', function (b) { if (!fe.c.sucre) { dire('Verse d\'abord la mélasse : les levures ont besoin de sucre.', 'doux'); return; } fe.levure = true; fe.c.levure = 0.1; b.disabled = true; b.style.opacity = 0.5; });
        curseur('Chauffer la cuve (garder 30-34 °C)', function (v) { fe.chauffe = v * 0.25; fe.opt.puissance = 40; }, 0, { couleur: '#b98a2a' });
        bouton('Vider la cuve dans l\'alambic', function (b) { fe.robinet = fe.robinet ? 0 : 1; b.textContent = fe.robinet ? 'Fermer le robinet' : 'Vider la cuve dans l\'alambic'; });
        curseur('Feu de l\'alambic', function (v) { A.feu(al, v); }, 0);
        curseur('Eau froide', function (v) { se.debitEau = v * 1.2; }, 0, { couleur: '#2e7fc2' });
        var bC = bouton('Recueillir : têtes', function (b) { choix = (choix + 1) % 3; se.sortie = bt[choix]; b.textContent = 'Recueillir : ' + ['têtes', 'cœur', 'queues'][choix]; }, { couleur: '#7a2e5a' });
        A.recette = { nom: 'rhum', titre: 'Du vin de canne au rhum', info: 'Les levures transforment le sucre de la mélasse en alcool. À l\'alambic, l\'alcool bout avant l\'eau : on écarte les têtes (premières gouttes), on garde le cœur, on arrête aux queues.', i: 0,
          zone: { app: fe, mesure: function () { return fe.T; }, min: 30, max: 34 },
          etapes: [
            { texte: 'Verse la mélasse dans la cuve d\'eau.', verif: function () { return fe.c.sucre > 0; }, ou: function () { return [fe.x + fe.w / 2, fe.y]; } },
            { texte: 'Ajoute les levures.', verif: function () { return fe.levure; }, ou: function () { return [fe.x + fe.w / 2, fe.y + fe.h / 2]; } },
            { texte: 'Garde la cuve entre 30 et 34 °C jusqu\'à 8 % d\'alcool.', verif: function () { return degreDe(fe.c) >= 8 || (fe.c.sucre || 0) < 0.6; }, ou: function () { return [fe.x + fe.w / 2, fe.y]; } },
            { texte: 'Vide le vin de canne dans l\'alambic.', verif: function () { return masseLiquide(al.c) > 40; }, ou: function () { return [al.x + al.w / 2, al.y + al.h / 2]; } },
            { texte: 'Chauffe et refroidis : mets les premières gouttes (têtes) de côté.', verif: function () { return (bt[0].c.alcool || 0) + (bt[0].c.tetes || 0) > 0.15; }, ou: function () { return [bt[0].x, bt[0].y]; } },
            { texte: 'Passe au cœur et récolte 2 L de rhum.', verif: function () { return masseLiquide(bt[1].c) >= 2; }, ou: function () { return [bt[1].x, bt[1].y]; } },
            { texte: 'Quand le degré qui coule baisse sous 60 %, passe aux queues.', verif: function () { return masseLiquide(bt[2].c) > 0.3; }, ou: function () { return [bt[2].x, bt[2].y]; } }
          ],
          resultat: function () { return 'qui coule : ' + Math.round(se.degreSortie || 0) + ' % · cœur : ' + Math.round(degreDe(bt[1].c)) + ' %'; },
          fin: function () { var tc = (bt[1].c.tetes || 0) / Math.max(1e-6, (bt[1].c.alcool || 0) + (bt[1].c.tetes || 0)); if (tc > 0.004) A.qualite -= 15; var q = Math.round(Math.max(0, A.qualite)); return q >= 85 ? 'Beau rhum ! Cœur à ' + Math.round(degreDe(bt[1].c)) + ' %, têtes bien écartées. (' + q + ' %)' : 'Rhum obtenu (' + q + ' %). Écarte un peu plus de têtes au début pour un goût plus net.'; } };
        A.surPas = function () { if (A.recette.i === 4 && choix !== 0 && se.debitCond > 0 && (bt[0].c.alcool || 0) + (bt[0].c.tetes || 0) < 0.2 && !A.avT) { A.avT = true; perdre(10, se, 'Les têtes ne sont pas bonnes à boire : mets les premières gouttes dans la bouteille « Têtes ».'); } if (A.recette.i === 5 && choix === 1 && se.degreSortie < 45 && se.debitCond > 0 && !A.avQ) { A.avQ = true; perdre(6, se, 'Ce qui coule devient faible : il est temps de passer aux queues.'); } };
        A.vitesse = 2;
      },
      sucre: function () {
        var mo = appareil('moulin', { x: 0.02, y: 0.22, l: 0.16, h: 0.46, nom: 'Moulin', contenu: { cannes: 0 } });
        var cu = appareil('cuve', { x: 0.21, y: 0.42, l: 0.2, h: 0.48, contenance: 40, nom: 'Grande cuve', puissance: 90 });
        var ev = appareil('cuve', { x: 0.45, y: 0.5, l: 0.16, h: 0.4, contenance: 25, nom: 'Batterie', puissance: 120 });
        var cr = appareil('cristallisoir', { x: 0.65, y: 0.58, l: 0.15, h: 0.24, contenance: 10, nom: 'Cristallisoir', chauffe: false });
        var tu = appareil('turbine', { x: 0.84, y: 0.4, l: 0.13, h: 0.38, nom: 'Turbine' });
        mo.sortie = cu; cu.sortie = ev; ev.sortie = cr; cr.sortie = tu; tu.sortie = null;
        bouton('Donner des cannes au moulin', function () { mo.c.cannes = (mo.c.cannes || 0) + 20; mo.tourne = true; });
        bouton('Chauler (un peu de chaux)', function (b) { if (masseLiquide(cu.c) < 2) { dire('Il faut d\'abord du vesou dans la grande cuve.', 'doux'); return; } cu.c.chaux = 0.05; b.disabled = true; b.style.opacity = 0.5; });
        curseur('Feu grande cuve', function (v) { A.feu(cu, v); }, 0);
        bouton('Écumer', function () { if (cu.ecume > 0.1) { cu.ecume = 0; cu.ecumee = (cu.ecumee || 0) + 1; evenementFx('bonne', cu.x + cu.w / 2, cu.y); } else dire('Pas encore d\'écume : chauffe le jus chaulé.', 'doux'); });
        bouton('Passer à la batterie', function (b) { cu.robinet = cu.robinet ? 0 : 1; b.textContent = cu.robinet ? 'Fermer' : 'Passer à la batterie'; });
        curseur('Feu batterie', function (v) { A.feu(ev, v); }, 0);
        bouton('Couler au cristallisoir', function (b) { ev.robinet = ev.robinet ? 0 : 1; b.textContent = ev.robinet ? 'Fermer' : 'Couler au cristallisoir'; });
        bouton('Brasser', function (b) { cr.malaxe = !cr.malaxe; b.textContent = cr.malaxe ? 'Arrêter de brasser' : 'Brasser'; });
        bouton('Turbiner', function (b) { cr.robinet = 1; tu.tourne = true; b.disabled = true; b.style.opacity = 0.5; });
        cr.T = 90; cr.opt.puissance = 0;
        A.recette = { nom: 'sucre', titre: 'De la canne au sucre roux', info: 'Le moulin écrase la canne : le vesou coule. On le chaule et on retire l\'écume, puis on fait évaporer l\'eau jusqu\'au sirop (65 °Brix) et à la cuite (90 °Brix, 115-118 °C) sans brûler. En refroidissant brassé, le sucre cristallise ; la turbine sépare les cristaux de la mélasse.', i: 0,
          zone: { app: ev, mesure: function () { return brixDe(ev.c); }, min: 86, max: 94 },
          etapes: [
            { texte: 'Passe des cannes au moulin.', verif: function () { return masseLiquide(cu.c) > 10; }, ou: function () { return [mo.x + mo.w / 2, mo.y]; } },
            { texte: 'Chaule le vesou, chauffe et retire l\'écume.', verif: function () { return (cu.ecumee || 0) >= 1 && (cu.c.impuretes || 0) < 0.05; }, ou: function () { return [cu.x + cu.w / 2, cu.y]; } },
            { texte: 'Passe le jus à la batterie et cuis jusqu\'à 88 °Brix sans brûler.', verif: function () { return brixDe(ev.c) >= 88 && masseLiquide(ev.c) > 0.5; }, ou: function () { return [ev.x + ev.w / 2, ev.y]; } },
            { texte: 'Coule la cuite au cristallisoir et brasse pendant qu\'elle refroidit.', verif: function () { return (cr.c.cristaux || 0) > masseLiquide(cr.c) * 0.5 && masseLiquide(cr.c) > 0.3; }, ou: function () { return [cr.x + cr.w / 2, cr.y]; } },
            { texte: 'Turbine pour séparer le sucre roux de la mélasse.', verif: function () { return (tu.sucreSec || 0) > 0.6; }, ou: function () { return [tu.x + tu.w / 2, tu.y + tu.h]; } }
          ],
          resultat: function () { return 'sucre roux : ' + (tu.sucreSec || 0).toFixed(2) + ' kg'; },
          fin: function (q) { return q >= 85 ? 'Beau sucre roux bien cristallisé ! (' + q + ' %)' : 'Sucre obtenu (' + q + ' %). Écume bien et cuis plus doucement pour un sucre plus clair.'; } };
        A.surPas = function () { if (cu.T > 60 && !cu.c.chaux && masseLiquide(cu.c) > 5 && !A.avC) { A.avC = true; dire('Pense à chauler le vesou : la chaux fait monter les impuretés en écume.', 'doux'); } };
        A.vitesse = 4; cr.cap = 10;
      },
      jus: function () {
        var mo = appareil('moulin', { x: 0.1, y: 0.2, l: 0.24, h: 0.6, nom: 'Moulin', contenu: { cannes: 0 } });
        var fi = appareil('cuve', { x: 0.42, y: 0.5, l: 0.18, h: 0.3, contenance: 6, nom: 'Passoire', chauffe: false, matiere: 'acier' });
        var ve = appareil('verre', { x: 0.72, y: 0.55, l: 0.1, h: 0.26, contenance: 0.6, nom: 'Verre' });
        mo.sortie = fi; fi.sortie = ve; var citron = false, t0 = 0;
        bouton('Passer une canne', function () { mo.c.cannes = (mo.c.cannes || 0) + 3; mo.tourne = true; });
        bouton('Filtrer dans le verre', function (b) { fi.robinet = 0.25; fi.c.impuretes = 0; b.disabled = true; b.style.opacity = 0.5; });
        bouton('Un trait de citron vert', function (b) { if (!masseLiquide(ve.c)) { dire('Remplis d\'abord le verre.', 'doux'); return; } ve.c.citron = 0.02; citron = true; b.disabled = true; b.style.opacity = 0.5; });
        A.recette = { nom: 'jus', titre: 'Jus de canne frais', info: 'Le vesou se boit tout de suite : laissé au chaud, il commence à fermenter en quelques heures. Le citron vert relève son goût.', i: 0,
          etapes: [
            { texte: 'Passe des cannes entre les rouleaux.', verif: function () { return masseLiquide(fi.c) > 1.2; }, ou: function () { return [mo.x + mo.w / 2, mo.y]; } },
            { texte: 'Filtre le jus dans le verre.', verif: function () { return masseLiquide(ve.c) >= 0.5; }, ou: function () { return [ve.x + ve.w / 2, ve.y]; } },
            { texte: 'Ajoute un trait de citron vert, et à boire tout de suite !', verif: function () { return citron; }, ou: function () { return [ve.x + ve.w / 2, ve.y]; } }
          ],
          fin: function (q) { return 'Un bon verre de jus de canne bien frais ! (' + q + ' %)'; } };
        A.vitesse = 2;
      }
    };
    var suivreV = suivreRecette; suivreRecette = function (dt) { if (A.surPas) A.surPas(dt); suivreV(dt); };

    A.api = {
      appareil: appareil, tuyau: tuyau,
      feu: function (R, v) { A.feu(R, v); return A.api; },
      recette: function (nom) { if (!RECETTES[nom]) return A.api; RECETTES[nom](); guide.appendChild(etapesEl); guide.appendChild(resume); majGuide(); dire(A.recette.etapes[0].texte, null, 5000); evenementFx('debut', A.W / 2, A.H / 2); return A.api; },
      bouton: bouton, curseur: curseur, dire: dire,
      mesure: function (R) { return { temperature: R.T, brix: brixDe(R.c), alcool: degreDe(R.c), essence: R.c.essence || 0, masse: masseLiquide(R.c), contenu: R.c }; },
      sur: function (nom, f) { (A.ecoute[nom] = A.ecoute[nom] || []).push(f); return A.api; },
      qualite: function () { return A.qualite; },
      vitesse: function (v) { A.vitesse = v; return A.api; },
      etat: function () { return { recette: A.recette && A.recette.nom, etape: A.recette && A.recette.i, fini: A.fini, qualite: A.qualite, appareils: A.app.map(function (R) { return { nom: R.nom, T: Math.round(R.T), brix: Math.round(brixDe(R.c)), alcool: Math.round(degreDe(R.c)), masse: +masseLiquide(R.c).toFixed(2), essence: +(R.c.essence || 0).toFixed(4) }; }) }; },
      arreter: function () { _kwVie.cancelAnimationFrame(A.raf); _kwVie.clearTimeout(A.msgT); if (A.ro) _kwVie.oublieObserver(A.ro); _kwVie.oublie(global, 'resize', taille); racine.remove(); }
    };
    A.feu = function (R, v) { R.chauffe = borne(v, 0, 1); };
    taille(); _kwVie.ecoute(global, 'resize', taille);
    if (global.ResizeObserver) { A.ro = _kwVie.observer(taille); A.ro.observe(scene); }
    A.raf = _kwVie.requestAnimationFrame(boucle);
    if (o.recette) A.api.recette(o.recette);
    return A.api;
  };
  Directeur.prototype.ebullition = ebullition;

  /* ======================================================================
   * v3.8 CUISINE : découpe précise sur planche, morceaux mis de côté, bol de mélange, pilon
   *  const cu = fx.cuisine(el, { recette: 'rougail' | 'pimentPile' | 'libre' })
   *  cu.ajouter('tomate' | 'oignon' | 'carotte' | 'gingembre' | 'ail' | 'piment' | 'combava' | 'safran' | 'girofle' | 'sel' | 'cive')
   *  cu.guides('carotte', { ecart: 1 })  → lignes de coupe proposées ; cu.resultat() → morceaux, taille, régularité, texture du pilon
   *  La coupe est un vrai découpage géométrique : chaque trait partage les morceaux qu'il traverse, la chair se voit
   *  (cernes de l'oignon, loges et pépins de la tomate, cœur de la carotte, graines du piment…), les morceaux s'écartent.
   *  Au pilon, chaque aliment s'écrase selon sa dureté : gros morceaux → concassé → pâte grossière → pâte fine (jus pour
   *  la tomate et l'oignon, grains de sel qui fondent, clou de girofle qui résiste). Gérée par l'instance (pause, détruire).
   * ====================================================================== */
  var ALIMENTS = {
    tomate: { nom: 'Tomate', peau: '#d8322a', peau2: '#f0614a', chair: '#ef5a45', motif: 'tomate', durete: 0.35, jus: 0.9, forme: 'rond', l: 7, h: 7, queue: '#3f7d2c' },
    oignon: { nom: 'Oignon', peau: '#b9773c', peau2: '#e0a866', chair: '#f6efe2', motif: 'cernes', durete: 0.65, jus: 0.5, forme: 'rond', l: 7.5, h: 7.2, cerne: '#e2d3c0' },
    carotte: { nom: 'Carotte', peau: '#e8781e', peau2: '#f6a04a', chair: '#f58a26', motif: 'coeurLong', durete: 1.1, jus: 0.15, forme: 'long', l: 17, h: 2.6, queue: '#5f9b3a', coeur: '#f9b25c' },
    gingembre: { nom: 'Gingembre', peau: '#c4995e', peau2: '#dcb987', chair: '#f2dc8a', motif: 'fibres', durete: 1.3, jus: 0.3, forme: 'patte', l: 9, h: 4.5 },
    ail: { nom: 'Gousse d\'ail', peau: '#efe6dc', peau2: '#fff8ef', chair: '#fbf3d9', motif: 'uni', durete: 0.8, jus: 0.2, forme: 'gousse', l: 3.2, h: 1.8 },
    piment: { nom: 'Piment', peau: '#d61f1f', peau2: '#ff4b3a', chair: '#e93a2c', motif: 'graines', durete: 0.9, jus: 0.25, forme: 'piment', l: 6.5, h: 1.3, queue: '#3f7d2c' },
    combava: { nom: 'Combava', peau: '#4f8a2a', peau2: '#7bb04a', chair: '#dfeab0', motif: 'quartiers', durete: 0.7, jus: 0.6, forme: 'rond', l: 4.8, h: 4.8, bosses: 1 },
    safran: { nom: 'Safran péi (curcuma)', peau: '#9a6a3a', peau2: '#b8875a', chair: '#f39a12', motif: 'fibres', durete: 1.2, jus: 0.2, forme: 'long', l: 6, h: 1.6 },
    cive: { nom: 'Cive', peau: '#4f9b3a', peau2: '#8acb5e', chair: '#e8f3d6', motif: 'tige', durete: 0.4, jus: 0.3, forme: 'long', l: 20, h: 1.1, coeur: '#f2f8e6' },
    girofle: { nom: 'Clou de girofle', peau: '#5a3420', peau2: '#7a4a2e', chair: '#6b3e24', motif: 'uni', durete: 3, jus: 0, forme: 'clou', l: 1.4, h: 0.5 },
    sel: { nom: 'Gros sel', peau: '#f4f6f8', peau2: '#ffffff', chair: '#ffffff', motif: 'uni', durete: 1.6, jus: 0, forme: 'grains', l: 2, h: 2 }
  };
  var CLASSES_COUPE = [[0.15, 'haché fin'], [0.5, 'haché'], [1.2, 'brunoise'], [4, 'dés'], [12, 'morceaux'], [1e9, 'gros morceaux']];
  function aireP(p) { var a = 0; for (var i = 0, n = p.length; i < n; i++) { var q = p[(i + 1) % n]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; }
  function centreP(p) { var a = 0, cx = 0, cy = 0; for (var i = 0, n = p.length; i < n; i++) { var q = p[(i + 1) % n], c = p[i][0] * q[1] - q[0] * p[i][1]; a += c; cx += (p[i][0] + q[0]) * c; cy += (p[i][1] + q[1]) * c; } if (Math.abs(a) < 1e-9) return p[0].slice(); return [cx / (3 * a), cy / (3 * a)]; }
  function dansP(p, x, y) { var d = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) d = !d; } return d; }
  // découpe d'un polygone par une droite : garde un côté, marque les nouveaux bords comme « coupe »
  function demiPlan(p, fl, a, b, signe) {
    var dx = b[0] - a[0], dy = b[1] - a[1], o = [], of = [], eps = 1e-7;
    function s(q) { return signe * (dx * (q[1] - a[1]) - dy * (q[0] - a[0])); }
    function inter(P, Q) { var sp = s(P), sq2 = s(Q), t = sp / (sp - sq2); return [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t]; }
    for (var i = 0, n = p.length; i < n; i++) {
      var S = p[i], E = p[(i + 1) % n], f = fl[i], si = s(S) >= -eps, ei = s(E) >= -eps;
      if (si && ei) { o.push(S); of.push(f); }
      else if (si && !ei) { o.push(S); of.push(f); o.push(inter(S, E)); of.push(1); }
      else if (!si && ei) { o.push(inter(S, E)); of.push(f); }
    }
    return { p: o, f: of };
  }
  function longueurP(p) { var best = 0, ang = 0; for (var i = 0; i < p.length; i++) for (var j = i + 1; j < p.length; j++) { var d = Math.hypot(p[i][0] - p[j][0], p[i][1] - p[j][1]); if (d > best) { best = d; ang = Math.atan2(p[j][1] - p[i][1], p[j][0] - p[i][0]); } } return { l: best, a: ang }; }
  function formeAliment(A, cx, cy, rot) {
    var pts = [], n, i, t, r, L = A.l / 2, H = A.h / 2;
    if (A.forme === 'rond') { n = 30; for (i = 0; i < n; i++) { t = i / n * 6.283; r = 1 + 0.035 * Math.sin(t * 3 + cx) + (A.bosses ? 0.05 * Math.sin(t * 11) : 0); pts.push([Math.cos(t) * L * r, Math.sin(t) * H * r]); } }
    else if (A.forme === 'long') { n = 26; for (i = 0; i < n; i++) { t = i / n * 6.283; var x = Math.cos(t), w = A.motif === 'tige' ? 1 : 0.35 + 0.65 * (x + 1) / 2; pts.push([x * L, Math.sin(t) * H * w * (1 - 0.15 * Math.pow(Math.abs(x), 6))]); } }
    else if (A.forme === 'patte') { var lob = [[-1, 0.1, 0.55], [-0.25, -0.35, 0.6], [0.45, 0.2, 0.55], [0.85, -0.45, 0.35], [0.1, 0.55, 0.38]]; n = 40; for (i = 0; i < n; i++) { t = i / n * 6.283; var bx = Math.cos(t), by = Math.sin(t), best = 0.3; lob.forEach(function (q) { var dx = bx * 1.1 - q[0], dy = by * 0.9 - q[1]; best = Math.max(best, q[2] * 1.6 - Math.hypot(dx, dy) * 0.4); }); pts.push([bx * L * (0.75 + 0.3 * best), by * H * (0.6 + 0.5 * best)]); } }
    else if (A.forme === 'gousse') { n = 22; for (i = 0; i < n; i++) { t = i / n * 6.283; var gx = Math.cos(t), gy = Math.sin(t); pts.push([gx * L, (gy * H) * (gy > 0 ? 1 : 0.55) - gx * gx * H * 0.35 + H * 0.2]); } }
    else if (A.forme === 'piment') { n = 28; for (i = 0; i < n; i++) { t = i / n * 6.283; var px = Math.cos(t), w2 = Math.pow((px + 1) / 2, 0.6); pts.push([px * L, Math.sin(t) * H * w2 + px * px * H * 0.9]); } }
    else if (A.forme === 'clou') { pts = [[-L, -H * 0.4], [L * 0.4, -H * 0.4], [L * 0.55, -H * 1.3], [L, -H * 1.1], [L * 1.05, H * 1.1], [L * 0.55, H * 1.3], [L * 0.4, H * 0.4], [-L, H * 0.4]]; }
    else { n = 16; for (i = 0; i < n; i++) { t = i / n * 6.283; pts.push([Math.cos(t) * L, Math.sin(t) * H]); } }
    var c = Math.cos(rot), s = Math.sin(rot);
    return pts.map(function (q) { return [cx + q[0] * c - q[1] * s, cy + q[0] * s + q[1] * c]; });
  }

  Directeur.prototype.cuisine = function (el, o) {
    o = o || {}; var self = this, _kwVie = this._vie;
    el = el || this.conteneur; if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var racine = document.createElement('div'); racine.className = 'kwfx-cuisine'; racine.style.cssText = 'position:relative;width:100%;font:600 14px/1.35 system-ui,-apple-system,sans-serif;color:#2a1f17';
    var scene = document.createElement('div'); scene.style.cssText = 'position:relative;width:100%;height:' + (o.hauteur || 'clamp(420px,56vw,560px)') + ';border-radius:16px;overflow:hidden;background:#d9c3a0;touch-action:none;user-select:none;-webkit-user-select:none';
    var cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:crosshair'; cv.className = 'zone-interactive'; scene.appendChild(cv);
    var barre = document.createElement('div'); barre.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px';
    var garde = document.createElement('div'); garde.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px';
    var guide = document.createElement('div'); guide.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:10px;margin-top:10px';
    var bulle = document.createElement('div'); bulle.setAttribute('role', 'status'); bulle.style.cssText = 'position:absolute;left:50%;top:10px;transform:translateX(-50%);max-width:min(92%,560px);font-size:13px;background:rgba(255,250,240,.95);border-radius:14px;padding:7px 14px;box-shadow:0 6px 20px rgba(60,30,10,.18);font-weight:800;text-align:center;opacity:0;transition:opacity .35s;pointer-events:none';
    scene.appendChild(bulle); racine.appendChild(scene); racine.appendChild(barre); racine.appendChild(garde); racine.appendChild(guide); el.appendChild(_kwVie.root(racine));
    var K = { ctx: cv.getContext('2d'), pieces: [], outil: 'couteau', t: 0, der: 0, raf: 0, seq: 0, traits: [], gouttes: [], miettes: [], guides: [], mortier: [], bolA: 0, bolV: 0, pilonY: 0, pilonV: 0, prevision: null, geste: null, qualite: 100, ecoute: {}, recette: null, fini: false, msgT: 0, coupes: 0, precision: [] };
    function dire(txt, ton, d) { bulle.textContent = txt; bulle.style.color = ton === 'doux' ? '#8a4b1a' : ton === 'bravo' ? '#1d6b3a' : '#2a1f17'; bulle.style.opacity = 1; _kwVie.clearTimeout(K.msgT); K.msgT = _kwVie.setTimeout(function () { bulle.style.opacity = 0; }, d || 4000); }
    function emettre(nom, d) { (K.ecoute[nom] || []).forEach(function (f) { try { f(d); } catch (e) { if (global.console) console.error(e); } }); }
    function evenementFx(type, x, y, extra) { var r = scene.getBoundingClientRect(), b = self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(), d = { x: r.left - b.left + x, y: r.top - b.top + y }; for (var k in extra || {}) d[k] = extra[k]; return self.evenement(type, d); }

    /* ---------- mise en page : planche (en cm), assiette « de côté », bol, pilon ---------- */
    function taille() {
      var r = scene.getBoundingClientRect(), d = Math.min(2, global.devicePixelRatio || 1); K.W = r.width; K.H = r.height; K.d = d; cv.width = Math.round(K.W * d); cv.height = Math.round(K.H * d);
      var large = K.W >= 620, m = 12;
      if (large) { K.planche = { x: m, y: m + 30, w: K.W * 0.64 - m * 2, h: K.H - m * 2 - 30 }; var zx = K.W * 0.64, zw = K.W * 0.36 - m, zh = (K.H - m * 2) / 3; K.zones = { cote: { x: zx, y: m, w: zw, h: zh - 6 }, bol: { x: zx, y: m + zh, w: zw, h: zh - 6 }, mortier: { x: zx, y: m + zh * 2, w: zw, h: zh - 6 } }; }
      else { K.planche = { x: m, y: m + 36, w: K.W - m * 2, h: K.H * 0.62 - m - 36 }; var zy = K.H * 0.62 + 4, zw2 = (K.W - m * 2) / 3, zh2 = K.H - zy - m; K.zones = { cote: { x: m, y: zy, w: zw2 - 6, h: zh2 }, bol: { x: m + zw2, y: zy, w: zw2 - 6, h: zh2 }, mortier: { x: m + zw2 * 2, y: zy, w: zw2 - 6, h: zh2 } }; }
      var P = K.planche; K.cm = Math.min(P.w / 40, P.h / 26); K.ox = P.x + (P.w - 40 * K.cm) / 2; K.oy = P.y + (P.h - 26 * K.cm) / 2;
      K.bois = null; bulle.style.left = (P.x + P.w / 2) + 'px'; bulle.style.top = (P.y + 6) + 'px'; bulle.style.maxWidth = (P.w - 20) + 'px';
    }
    function vx(x) { return K.ox + x * K.cm; } function vy(y) { return K.oy + y * K.cm; }
    function cmX(px) { return (px - K.ox) / K.cm; } function cmY(py) { return (py - K.oy) / K.cm; }
    function dansZ(z, x, y) { return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h; }
    // fil du bois peint une fois (planche de tamarin)
    function peintBois() {
      var P = K.planche, c = document.createElement('canvas'), d = K.d; c.width = Math.round(P.w * d); c.height = Math.round(P.h * d); var x = c.getContext('2d'); x.scale(d, d);
      var g = x.createLinearGradient(0, 0, 0, P.h); g.addColorStop(0, '#c9965e'); g.addColorStop(0.5, '#b98450'); g.addColorStop(1, '#a87445'); x.fillStyle = g; rr(x, 0, 0, P.w, P.h, 18); x.fill();
      x.save(); rr(x, 0, 0, P.w, P.h, 18); x.clip();
      for (var i = 0; i < 70; i++) { var yy = Math.random() * P.h, amp = 2 + Math.random() * 6, f = 0.004 + Math.random() * 0.01, ph = Math.random() * 6; x.strokeStyle = 'rgba(' + (Math.random() < 0.5 ? '90,50,20' : '235,190,130') + ',' + (0.08 + Math.random() * 0.14) + ')'; x.lineWidth = 0.6 + Math.random() * 1.6; x.beginPath(); for (var xx = 0; xx <= P.w; xx += 8) { var y2 = yy + Math.sin(xx * f + ph) * amp + Math.sin(xx * f * 3.1 + ph) * amp * 0.3; if (xx) x.lineTo(xx, y2); else x.moveTo(xx, y2); } x.stroke(); }
      for (var k = 0; k < 2; k++) { var nx = Math.random() * P.w, ny = Math.random() * P.h; for (var r2 = 4; r2 < 26; r2 += 3) { x.strokeStyle = 'rgba(90,50,20,.12)'; x.beginPath(); x.ellipse(nx, ny, r2 * 1.8, r2 * 0.7, 0, 0, 6.283); x.stroke(); } }
      x.restore(); x.strokeStyle = 'rgba(70,40,15,.6)'; x.lineWidth = 2; rr(x, 1, 1, P.w - 2, P.h - 2, 18); x.stroke();
      K.marques = document.createElement('canvas'); K.marques.width = c.width; K.marques.height = c.height; K.bois = c;
    }
    function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }

    /* ---------- aliments et morceaux ---------- */
    function ajouter(nom, x, y, rot) {
      var A = ALIMENTS[nom]; if (!A) return null;
      if (x == null) { x = 6 + Math.random() * 28; y = 5 + Math.random() * 16; } if (rot == null) rot = A.forme === 'rond' ? Math.random() * 6.28 : (Math.random() - 0.5) * 0.6;
      if (nom === 'sel') { var pc = { id: ++K.seq, al: nom, A: A, grains: [], zone: 'planche', x: x, y: y, entier: true, masse: 6 }; for (var i = 0; i < 26; i++) pc.grains.push([hasard(-1, 1), hasard(-0.8, 0.8), hasard(0.18, 0.32), Math.random() * 6]); K.pieces.push(pc); return pc; }
      var pts = formeAliment(A, x, y, rot), P = { id: ++K.seq, al: nom, A: A, pts: pts, fl: pts.map(function () { return 0; }), ox: x, oy: y, rot: rot, entier: true, zone: 'planche', dx: 0, dy: 0, tx: 0, ty: 0, graine: Math.random() * 100 };
      P.aire = Math.abs(aireP(pts)); P.aire0 = P.aire; P.grp = P.id; K.pieces.push(P); return P;
    }
    // prévision : ce que donnerait la coupe (morceaux traversés, parts en %, trait trop court)
    function couperPiece(P, a, b, appliquer) {
      if (!P.pts || P.zone !== 'planche') return null;
      var dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; if (L2 < 0.25) return null;
      var pos = 0, neg = 0, tmin = 1e9, tmax = -1e9, n = P.pts.length;
      for (var i = 0; i < n; i++) { var q = P.pts[i], s = dx * (q[1] - a[1]) - dy * (q[0] - a[0]); if (s > 1e-6) pos++; else if (s < -1e-6) neg++; var Q = P.pts[(i + 1) % n], s2 = dx * (Q[1] - a[1]) - dy * (Q[0] - a[0]); if ((s > 0) !== (s2 > 0)) { var tt = s / (s - s2), ix = q[0] + (Q[0] - q[0]) * tt, iy = q[1] + (Q[1] - q[1]) * tt, tl = ((ix - a[0]) * dx + (iy - a[1]) * dy) / L2; tmin = Math.min(tmin, tl); tmax = Math.max(tmax, tl); } }
      if (!pos || !neg || tmax < -0.02 || tmin > 1.02) return null;
      var complet = tmin >= -0.04 && tmax <= 1.04, A1 = demiPlan(P.pts, P.fl, a, b, 1), A2 = demiPlan(P.pts, P.fl, a, b, -1), s1 = Math.abs(aireP(A1.p)), s2b = Math.abs(aireP(A2.p));
      if (s1 < 0.01 || s2b < 0.01) return null;
      var r = { piece: P, complet: complet, parts: [s1, s2b], polys: [A1, A2], milieu: [a[0] + dx * (tmin + tmax) / 2, a[1] + dy * (tmin + tmax) / 2] };
      if (appliquer && complet) {
        var nx = -dy / Math.sqrt(L2), ny = dx / Math.sqrt(L2), ecart = 0.12 + Math.min(0.35, Math.sqrt(Math.min(s1, s2b)) * 0.05);
        K.pieces.splice(K.pieces.indexOf(P), 1);
        [[A1, 1], [A2, -1]].forEach(function (q) { var N = { id: ++K.seq, al: P.al, A: P.A, pts: q[0].p, fl: q[0].f, ox: P.ox, oy: P.oy, rot: P.rot, entier: false, zone: 'planche', dx: 0, dy: 0, tx: nx * ecart * q[1], ty: ny * ecart * q[1], graine: P.graine, grp: P.grp }; N.aire = Math.abs(aireP(N.pts)); N.aire0 = P.aire0; K.pieces.push(N); });
      }
      return r;
    }
    function prevoir(a, b) { var res = []; K.pieces.forEach(function (P) { var r = couperPiece(P, a, b, false); if (r) res.push(r); }); return res; }
    function couper(a, b) {
      var res = prevoir(a, b), faits = res.filter(function (r) { return r.complet; });
      faits.forEach(function (r) { couperPiece(r.piece, a, b, true); jusDe(r); });
      if (faits.length) {
        K.coupes++; precisionCoupe(a, b, faits); marque(a, b); sonCoupe(faits[0].piece.A);
        emettre('coupe', { morceaux: faits.length, parts: faits.map(function (r) { return r.parts; }) });
      } else if (res.length) dire('Coupe jusqu\'au bout : le trait doit traverser l\'aliment.', 'doux', 2500);
      return faits.length;
    }
    function precisionCoupe(a, b, faits) {
      if (!K.guides.length) return; var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ang = Math.atan2(b[1] - a[1], b[0] - a[0]), best = null;
      K.guides.forEach(function (g) { if (g.fait) return; var d = Math.abs((mx - g.a[0]) * Math.sin(g.ang) - (my - g.a[1]) * Math.cos(g.ang)), da = Math.abs(Math.sin(ang - g.ang)); if (!best || d + da * 3 < best.s) best = { g: g, d: d, da: da, s: d + da * 3 }; });
      if (best && best.d < 1.2) { best.g.fait = true; var p = Math.max(0, 100 - best.d * 120 - best.da * 150); K.precision.push(p); emettre('precision', { precision: p }); if (p > 85) { var c = faits[0].milieu; evenementFx('bonne', vx(c[0]), vy(c[1]), { points: 5 }); } }
    }
    function jusDe(r) { var A = r.piece.A, c = r.milieu; if (A.jus > 0.3) for (var i = 0; i < Math.round(A.jus * 10); i++) K.gouttes.push({ x: c[0] + hasard(-0.6, 0.6), y: c[1] + hasard(-0.6, 0.6), r: hasard(0.08, 0.22) * (0.5 + A.jus), c: A.chair, t: 0, vie: hasard(2, 4) }); if (A.motif === 'graines' || A.motif === 'tomate') for (var j = 0; j < 4; j++) K.gouttes.push({ x: c[0] + hasard(-0.8, 0.8), y: c[1] + hasard(-0.8, 0.8), r: 0.12, c: '#fff3c4', t: 0, vie: 6, graine: true }); }
    function marque(a, b) { if (!K.marques) return; var x = K.marques.getContext('2d'), d = K.d, P = K.planche; x.setTransform(d, 0, 0, d, -P.x * d, -P.y * d); x.strokeStyle = 'rgba(80,45,15,.18)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(vx(a[0]), vy(a[1])); x.lineTo(vx(b[0]), vy(b[1])); x.stroke(); }

    /* ---------- dessin d'un morceau : peau si entier, chair et motif si coupé ---------- */
    function cheminP(x, P, ox, oy, k) { x.beginPath(); P.pts.forEach(function (q, i) { var X = ox + q[0] * k, Y = oy + q[1] * k; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); }); x.closePath(); }
    function dessinePiece(x, P, ox, oy, k, ombre) {
      var A = P.A; ox = ox || 0; oy = oy || 0; k = k || 1;
      if (P.al === 'sel') { P.grains.forEach(function (g) { var gx = ox + g[0] * k, gy = oy + g[1] * k, r = g[2] * k; x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(gx - r + 1, gy - r + 1.5, r * 2, r * 2); x.fillStyle = '#f7f9fb'; x.save(); x.translate(gx, gy); x.rotate(g[3]); x.fillRect(-r, -r, r * 2, r * 2); x.fillStyle = '#ffffff'; x.fillRect(-r, -r, r, r * 0.8); x.restore(); }); return; }
      if (ombre) { x.save(); x.translate(3, 4); cheminP(x, P, ox, oy, k); x.fillStyle = 'rgba(40,20,5,.22)'; x.fill(); x.restore(); }
      cheminP(x, P, ox, oy, k);
      var c = centreP(P.pts), cX = ox + c[0] * k, cY = oy + c[1] * k, Ox = ox + P.ox * k, Oy = oy + P.oy * k, cm = k;
      if (P.entier) {
        var g = x.createRadialGradient(cX - P.A.l * cm * 0.15, cY - P.A.h * cm * 0.2, 1, cX, cY, Math.max(A.l, A.h) * cm * 0.6); g.addColorStop(0, A.peau2); g.addColorStop(1, A.peau); x.fillStyle = g; x.fill();
        x.save(); x.clip();
        if (P.al === 'oignon') { x.strokeStyle = 'rgba(120,60,20,.35)'; x.lineWidth = 1; for (var i = -3; i <= 3; i++) { x.beginPath(); x.ellipse(Ox, Oy, Math.abs(i) * A.l * cm * 0.13 + 2, A.h * cm * 0.55, P.rot, 0, 6.283); x.stroke(); } }
        if (P.al === 'carotte' || P.al === 'safran') { x.strokeStyle = 'rgba(120,50,0,.25)'; x.lineWidth = 1; for (var j = -6; j <= 6; j++) { var px2 = Ox + Math.cos(P.rot) * j * A.l * cm / 14, py2 = Oy + Math.sin(P.rot) * j * A.l * cm / 14; x.beginPath(); x.moveTo(px2 - Math.sin(P.rot) * A.h * cm * 0.3, py2 + Math.cos(P.rot) * A.h * cm * 0.3); x.lineTo(px2 + Math.sin(P.rot) * A.h * cm * 0.25, py2 - Math.cos(P.rot) * A.h * cm * 0.25); x.stroke(); } }
        if (P.al === 'combava') { x.fillStyle = 'rgba(30,60,10,.25)'; for (var b2 = 0; b2 < 26; b2++) { x.beginPath(); x.arc(Ox + Math.cos(b2 * 2.4) * A.l * cm * 0.35 * (b2 % 3) / 2, Oy + Math.sin(b2 * 2.4) * A.l * cm * 0.35 * (b2 % 3) / 2, 1.6, 0, 6.283); x.fill(); } }
        x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.ellipse(cX - A.l * cm * 0.15, cY - A.h * cm * 0.18, A.l * cm * 0.16, A.h * cm * 0.1, P.rot, 0, 6.283); x.fill();
        x.restore();
        if (A.queue && (A.forme === 'rond' || A.forme === 'long' || A.forme === 'piment')) { var qx = A.forme === 'rond' ? Ox : Ox + Math.cos(P.rot) * A.l * cm * 0.5, qy = A.forme === 'rond' ? Oy : Oy + Math.sin(P.rot) * A.l * cm * 0.5; x.strokeStyle = A.queue; x.lineWidth = Math.max(2, cm * 0.3); x.lineCap = 'round'; x.beginPath(); x.moveTo(qx, qy); x.lineTo(qx + Math.cos(P.rot) * cm * (A.forme === 'rond' ? 0.6 : 1.2), qy + Math.sin(P.rot) * cm * (A.forme === 'rond' ? 0.6 : 1.2) - (A.forme === 'rond' ? cm * 0.4 : 0)); x.stroke(); }
      } else {
        x.fillStyle = A.chair; x.fill(); x.save(); x.clip(); motif(x, P, Ox, Oy, cm); x.restore();
        // bords : peau d'origine épaisse, bord coupé fin et brillant
        x.lineJoin = 'round';
        for (var e = 0, n = P.pts.length; e < n; e++) { var q1 = P.pts[e], q2 = P.pts[(e + 1) % n]; x.beginPath(); x.moveTo(ox + q1[0] * k, oy + q1[1] * k); x.lineTo(ox + q2[0] * k, oy + q2[1] * k); if (P.fl[e]) { x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1; } else { x.strokeStyle = A.peau; x.lineWidth = Math.max(1.5, cm * (P.al === 'oignon' ? 0.12 : 0.18)); } x.stroke(); }
      }
    }
    function motif(x, P, Ox, Oy, cm) {
      var A = P.A, rot = P.rot, c = Math.cos(rot), s = Math.sin(rot), i, R;
      if (A.motif === 'cernes') { x.strokeStyle = A.cerne; x.lineWidth = Math.max(1, cm * 0.08); for (R = 0.5; R < A.l / 2; R += 0.45) { x.beginPath(); x.ellipse(Ox, Oy, R * cm, R * cm * (A.h / A.l), rot, 0, 6.283); x.stroke(); } x.fillStyle = 'rgba(190,140,190,.12)'; x.fill(); }
      else if (A.motif === 'tomate') {
        x.fillStyle = '#f3887a'; x.beginPath(); x.arc(Ox, Oy, A.l * 0.42 * cm, 0, 6.283); x.fill();
        for (i = 0; i < 4; i++) { var a0 = rot + i * 1.571 + 0.25; x.fillStyle = 'rgba(250,190,150,.85)'; x.beginPath(); x.ellipse(Ox + Math.cos(a0) * A.l * 0.22 * cm, Oy + Math.sin(a0) * A.l * 0.22 * cm, A.l * 0.13 * cm, A.l * 0.08 * cm, a0, 0, 6.283); x.fill(); x.fillStyle = '#fff1c2'; for (var g = 0; g < 4; g++) { x.beginPath(); x.ellipse(Ox + Math.cos(a0) * (A.l * 0.17 + g * 0.18) * cm, Oy + Math.sin(a0) * (A.l * 0.17 + g * 0.18) * cm, cm * 0.1, cm * 0.06, a0 + 1.2, 0, 6.283); x.fill(); } }
        x.fillStyle = '#f9b4a6'; x.beginPath(); x.arc(Ox, Oy, A.l * 0.09 * cm, 0, 6.283); x.fill();
      }
      else if (A.motif === 'coeurLong') { x.fillStyle = A.coeur; x.beginPath(); x.ellipse(Ox, Oy, A.l * 0.48 * cm, A.h * 0.18 * cm, rot, 0, 6.283); x.fill(); }
      else if (A.motif === 'tige') { x.fillStyle = A.coeur; x.beginPath(); x.ellipse(Ox, Oy, A.l * 0.5 * cm, A.h * 0.28 * cm, rot, 0, 6.283); x.fill(); x.strokeStyle = 'rgba(80,150,60,.5)'; x.lineWidth = 1; x.stroke(); }
      else if (A.motif === 'fibres') { x.strokeStyle = 'rgba(160,110,30,.25)'; x.lineWidth = 0.8; for (i = -14; i <= 14; i++) { var dd = i * 0.2 * cm; x.beginPath(); x.moveTo(Ox - c * A.l * cm - s * dd, Oy - s * A.l * cm + c * dd); x.lineTo(Ox + c * A.l * cm - s * dd, Oy + s * A.l * cm + c * dd); x.stroke(); } }
      else if (A.motif === 'graines') { x.fillStyle = '#f7e9c8'; x.beginPath(); x.ellipse(Ox + c * A.l * 0.12 * cm, Oy + s * A.l * 0.12 * cm, A.l * 0.3 * cm, A.h * 0.18 * cm, rot, 0, 6.283); x.fill(); x.fillStyle = '#fff7d6'; for (i = 0; i < 9; i++) { var t = -0.2 + i * 0.07; x.beginPath(); x.ellipse(Ox + c * A.l * t * cm + s * ((i % 2) - 0.5) * cm * 0.18, Oy + s * A.l * t * cm - c * ((i % 2) - 0.5) * cm * 0.18, cm * 0.12, cm * 0.08, rot, 0, 6.283); x.fill(); } }
      else if (A.motif === 'quartiers') { x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 1; for (i = 0; i < 10; i++) { var aq = rot + i * 0.628; x.beginPath(); x.moveTo(Ox, Oy); x.lineTo(Ox + Math.cos(aq) * A.l * 0.45 * cm, Oy + Math.sin(aq) * A.l * 0.45 * cm); x.stroke(); } }
    }

    /* ---------- bol de mélange ---------- */
    function versBol(P) { P.zone = 'bol'; P.ba = Math.random() * 6.283; P.br = Math.sqrt(Math.random()) * 0.82; P.bv = 0; recadrer(P); emettre('pose', { piece: P, zone: 'bol' }); }
    function versCote(P) { P.zone = 'cote'; P.cp = [Math.random(), Math.random()]; recadrer(P); emettre('pose', { piece: P, zone: 'cote' }); }
    function recadrer(P) { if (!P.pts) return; var c = centreP(P.pts); P.pts = P.pts.map(function (q) { return [q[0] - c[0], q[1] - c[1]]; }); P.ox -= c[0]; P.oy -= c[1]; P.tx = P.ty = P.dx = P.dy = 0; }
    function melange() {
      var bol = K.pieces.filter(function (P) { return P.zone === 'bol'; }); if (bol.length < 2) return bol.length ? 1 : 0;
      var types = {}, sect = [{}, {}, {}, {}, {}, {}], tot = [0, 0, 0, 0, 0, 0];
      bol.forEach(function (P) { var w = P.aire || 1, s = Math.floor(((P.ba % 6.283) + 6.283) % 6.283 / 1.0472) % 3 + (P.br > 0.5 ? 3 : 0); types[P.al] = (types[P.al] || 0) + w; sect[s][P.al] = (sect[s][P.al] || 0) + w; tot[s] += w; });
      var T = 0; for (var k in types) T += types[k]; var dev = 0, nS = 0;
      sect.forEach(function (S, i) { if (!tot[i]) { dev += 1; nS++; return; } var d = 0; for (var k2 in types) d += Math.abs((S[k2] || 0) / tot[i] - types[k2] / T); dev += d / 2; nS++; });
      return Math.max(0, Math.min(1, 1 - dev / nS * 1.3));
    }

    /* ---------- pilon : chaque aliment s'écrase selon sa dureté ---------- */
    function versMortier(P) {
      var m = P.al === 'sel' ? P.masse : P.aire * (P.A.forme === 'rond' ? 0.9 : 0.6), ex = null;
      K.mortier.forEach(function (q) { if (q.al === P.al) ex = q; });
      if (ex) { ex.e = (ex.e * ex.m + 0) / (ex.m + m); ex.m += m; ex.n += P.entier ? 4 : 1; } else K.mortier.push({ al: P.al, A: P.A, m: m, e: P.entier ? 0 : Math.min(0.12, 2 / Math.max(1, P.aire)), n: P.entier ? 4 : 1, bits: [] });
      K.pieces.splice(K.pieces.indexOf(P), 1); regenBits(); emettre('pose', { piece: P, zone: 'mortier' });
    }
    function regenBits() { K.mortier.forEach(function (q) { var nb = Math.max(0, Math.round((q.n * 3 + q.m * 0.4) * Math.pow(1 - q.e, 1.4))); q.bits = []; for (var i = 0; i < Math.min(40, nb); i++) q.bits.push([Math.random() * 6.283, Math.sqrt(Math.random()) * 0.8, Math.random(), Math.random() * 6]); }); }
    function pilonner(force, tourne) {
      if (!K.mortier.length) { dire('Le pilon est vide : glisse des morceaux dedans.', 'doux', 2500); return; }
      var avant = textureMortier().code, totM = 0; K.mortier.forEach(function (q) { totM += q.m; });
      K.mortier.forEach(function (q) {
        var A = q.A, e = q.e, gain;
        if (tourne) gain = 0.006 * force * (0.4 + e) / A.durete; else gain = 0.05 * force / A.durete * (1 - e * 0.55) * (A.al === 'sel' && e < 0.3 ? 1.2 : 1);
        if (A.al === 'girofle' && e < 0.3 && !tourne && Math.random() < 0.5) gain *= 0.3; // le clou saute et résiste
        q.e = Math.min(1, e + gain * (1 + 0.15 * Math.min(4, totM / 40)));
      });
      regenBits();
      var apres = textureMortier(); if (apres.code !== avant) { dire('Texture : ' + apres.nom, null, 2200); emettre('texture', apres); }
    }
    function textureMortier() {
      var tm = 0, te = 0, tj = 0, sel = 0; K.mortier.forEach(function (q) { tm += q.m; te += q.e * q.m; tj += q.A.jus * q.e * q.m; if (q.al === 'sel') sel += q.m; });
      var e = tm ? te / tm : 0, jus = tm ? tj / tm : 0, code = e < 0.12 ? 0 : e < 0.35 ? 1 : e < 0.6 ? 2 : e < 0.85 ? 3 : 4;
      var noms = ['morceaux entiers', 'concassé', 'pâte grossière', 'pâte', 'pâte fine'], nom = noms[code]; if (code >= 3 && jus > 0.45) nom = code === 4 ? 'purée juteuse' : 'pâte juteuse';
      return { code: code, nom: nom, ecrasement: Math.round(e * 100), jus: Math.round(jus * 100), detail: K.mortier.map(function (q) { return { aliment: q.al, ecrasement: Math.round(q.e * 100) }; }) };
    }
    function couleurPate() { var r = 0, g = 0, b = 0, t = 0; K.mortier.forEach(function (q) { var c = versRgb(q.A.chair), w = q.m * (0.2 + q.e) * (q.al === 'sel' ? 0.15 : q.al === 'safran' ? 3 : q.al === 'piment' ? 2 : 1); r += c[0] * w; g += c[1] * w; b += c[2] * w; t += w; }); return t ? [r / t, g / t, b / t] : [200, 180, 150]; }

    /* ---------- sons : coupe sur le bois, coup de pilon (croquant puis mou) ---------- */
    function bruit(a, dur, f, q, vol, t0) { var len = Math.max(1, Math.round(a.sampleRate * dur)), bf = a.createBuffer(1, len, a.sampleRate), d = bf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); var s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain(); s.buffer = bf; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol; s.connect(fl); fl.connect(g); g.connect(a.destination); s.start(t0); }
    function sourd(a, f, dur, vol, t0) { var o2 = a.createOscillator(), g = a.createGain(); o2.frequency.setValueAtTime(f, t0); o2.frequency.exponentialRampToValueAtTime(f * 0.5, t0 + dur); g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); o2.connect(g); g.connect(a.destination); o2.start(t0); o2.stop(t0 + dur + 0.02); }
    function sonCoupe(A) { if (!self.opt.sons) return; var a = self.audio.pret(); if (!a) return; var v = self.opt.volume * self.pub.son, t0 = a.currentTime; bruit(a, 0.03 + A.durete * 0.02, 2200 + A.durete * 1200, 1.2, 0.5 * v, t0); sourd(a, 150, 0.08, 0.35 * v, t0 + 0.02); if (A.jus > 0.5) bruit(a, 0.08, 900, 0.8, 0.15 * v, t0 + 0.01); }
    function sonPilon(tex) { if (!self.opt.sons) return; var a = self.audio.pret(); if (!a) return; var v = self.opt.volume * self.pub.son, t0 = a.currentTime; sourd(a, 95, 0.16, 0.6 * v, t0); var cr = Math.max(0, 1 - tex.ecrasement / 70); if (cr > 0) bruit(a, 0.05, 2600, 1.5, 0.5 * v * cr, t0); bruit(a, 0.09, 500 + tex.jus * 3, 0.7, 0.25 * v * (1 - cr * 0.7), t0 + 0.01); }

    /* ---------- gestes : couteau (trait), main (déplacer), appui long = saisir, pilon, cuillère ---------- */
    function pt(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function pieceSous(x, y) {
      for (var i = K.pieces.length - 1; i >= 0; i--) { var P = K.pieces[i];
        if (P.zone === 'planche') { if (P.al === 'sel') { if (Math.hypot(cmX(x) - P.x, cmY(y) - P.y) < 1.4) return P; } else if (dansP(P.pts, cmX(x) - P.dx, cmY(y) - P.dy)) return P; }
        else { var c = posZone(P); if (c && Math.hypot(x - c[0], y - c[1]) < Math.max(10, c[2] * 2)) return P; } }
      return null;
    }
    function posZone(P) { var z = K.zones[P.zone]; if (!z) return null; var k = K.cm * 0.55; if (P.zone === 'bol') { var cx = z.x + z.w / 2, cy = z.y + z.h * 0.52, R = Math.min(z.w, z.h) * 0.36; return [cx + Math.cos(P.ba) * P.br * R, cy + Math.sin(P.ba) * P.br * R * 0.6, k]; } return [z.x + 14 + P.cp[0] * (z.w - 28), z.y + 28 + P.cp[1] * (z.h - 40), k]; }
    function deposer(P, x, y) {
      var z = K.zones; if (dansZ(z.mortier, x, y)) { versMortier(P); return; } if (dansZ(z.bol, x, y)) { versBol(P); return; } if (dansZ(z.cote, x, y)) { versCote(P); return; }
      if (P.zone !== 'planche' && dansZ(K.planche, x, y)) { P.zone = 'planche'; var cx = cmX(x), cy = cmY(y); if (P.pts) { P.pts = P.pts.map(function (q) { return [q[0] + cx, q[1] + cy]; }); P.ox += cx; P.oy += cy; } else { P.x = cx; P.y = cy; } }
    }
    function surBas(e) {
      var p = pt(e), x = p[0], y = p[1]; cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
      if (dansZ(K.zones.mortier, x, y) && !pieceSous(x, y)) { K.geste = { type: 'pilon', x: x, y: y, x0: x, y0: y, ang: 0, t0: K.t }; K.pilonV = 900; return; }
      if (dansZ(K.zones.bol, x, y) && !pieceSous(x, y)) { K.geste = { type: 'cuillere', x: x, y: y, a: null }; return; }
      var P = pieceSous(x, y);
      if (P && (K.outil === 'main' || P.zone !== 'planche' || P.al === 'sel')) { K.geste = { type: 'porte', P: P, x: x, y: y, x0: x, y0: y }; return; }
      if (dansZ(K.planche, x, y) || P) { K.geste = { type: 'couteau', a: [cmX(x), cmY(y)], b: [cmX(x), cmY(y)], P: P, x0: x, y0: y, t0: K.t }; if (P) K.geste.long = _kwVie.setTimeout(function () { if (K.geste && K.geste.type === 'couteau' && Math.hypot(K.geste.b[0] - K.geste.a[0], K.geste.b[1] - K.geste.a[1]) < 0.4) { K.geste = { type: 'porte', P: P, x: x, y: y, x0: x, y0: y }; dire('Morceau saisi : glisse-le sur l\'assiette, dans le bol ou le pilon.', null, 2200); } }, 380); }
    }
    function surMouve(e) {
      var G = K.geste, p = pt(e); K.survol = p; if (!G) return; var x = p[0], y = p[1];
      if (G.type === 'couteau') { G.b = [cmX(x), cmY(y)]; K.prevision = prevoir(G.a, G.b); }
      else if (G.type === 'porte') { G.x = x; G.y = y; }
      else if (G.type === 'cuillere') { var z = K.zones.bol, cx = z.x + z.w / 2, cy = z.y + z.h * 0.52, a = Math.atan2(y - cy, x - cx); if (G.a != null) { var da = a - G.a; if (da > 3.14) da -= 6.283; if (da < -3.14) da += 6.283; K.bolV += da * 8; } G.a = a; }
      else if (G.type === 'pilon') { var dz = Math.hypot(x - G.x, y - G.y); if (dz > 6) { G.ang += dz; G.x = x; G.y = y; if (G.ang > 40) { G.ang = 0; pilonner(1, true); K.pilonV = 200; miettes(0.3); } } }
    }
    function surHaut(e) {
      var G = K.geste; K.geste = null; K.prevision = null; if (!G) return; if (G.long) _kwVie.clearTimeout(G.long); var p = pt(e);
      if (G.type === 'couteau') { var lg = Math.hypot(G.b[0] - G.a[0], G.b[1] - G.a[1]); if (lg > 0.8) { K.trait = { a: G.a, b: G.b, t: 0 }; couper(G.a, G.b); } }
      else if (G.type === 'porte') { if (Math.hypot(p[0] - G.x0, p[1] - G.y0) < 4 && G.P.zone !== 'planche') { versBol(G.P); } else deposer(G.P, p[0], p[1]); }
      else if (G.type === 'pilon') { if (K.t - G.t0 < 0.45 && Math.hypot(p[0] - G.x0, p[1] - G.y0) < 20) { pilonner(1.2, false); K.pilonY = 1; var tx = textureMortier(); sonPilon(tx); miettes(1); if (self.opt.secousses && self.secousse) self.secousse(0.12); } }
    }
    function miettes(k) { var z = K.zones.mortier, cx = z.x + z.w / 2, cy = z.y + z.h * 0.55, c = couleurPate(); for (var i = 0; i < Math.round(8 * k); i++) K.miettes.push({ x: cx + hasard(-20, 20), y: cy, vx: hasard(-90, 90), vy: -hasard(80, 220), t: 0, c: 'rgb(' + c.map(Math.round).join(',') + ')' }); }

    /* ---------- rendu ---------- */
    function rendu(dt) {
      var x = K.ctx, d = K.d; x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, K.W, K.H);
      var fond = x.createLinearGradient(0, 0, 0, K.H); fond.addColorStop(0, '#e9d7b8'); fond.addColorStop(1, '#cdb48c'); x.fillStyle = fond; x.fillRect(0, 0, K.W, K.H);
      if (!K.bois) peintBois(); var P0 = K.planche; x.drawImage(K.bois, P0.x, P0.y, P0.w, P0.h); x.drawImage(K.marques, P0.x, P0.y, P0.w, P0.h);
      // jus et pépins sur la planche
      K.gouttes = K.gouttes.filter(function (g) { g.t += dt; if (g.t > g.vie) return false; x.globalAlpha = Math.min(1, (g.vie - g.t) / 1.5) * (g.graine ? 1 : 0.55); x.fillStyle = g.c; x.beginPath(); x.ellipse(vx(g.x), vy(g.y), g.r * K.cm * (g.graine ? 1 : 1 + g.t * 0.15), g.r * K.cm * (g.graine ? 0.6 : 1 + g.t * 0.15), 0.6, 0, 6.283); x.fill(); x.globalAlpha = 1; return true; });
      // guides de coupe proposés
      K.guides.forEach(function (g) { if (g.fait) return; x.setLineDash([6, 5]); x.strokeStyle = 'rgba(255,255,255,.85)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(vx(g.a[0]), vy(g.a[1])); x.lineTo(vx(g.b[0]), vy(g.b[1])); x.stroke(); x.setLineDash([]); });
      // morceaux sur la planche (ils glissent doucement après la coupe)
      K.pieces.forEach(function (P) {
        if (P.zone !== 'planche') return; if (P.tx || P.ty) { var kk = Math.min(1, dt * 10); P.dx += (P.tx - P.dx) * kk; P.dy += (P.ty - P.dy) * kk; if (Math.abs(P.tx - P.dx) < 0.003 && Math.abs(P.ty - P.dy) < 0.003) { P.pts = P.pts.map(function (q) { return [q[0] + P.tx, q[1] + P.ty]; }); P.ox += P.tx; P.oy += P.ty; P.dx = P.dy = P.tx = P.ty = 0; } }
        if (K.geste && K.geste.type === 'porte' && K.geste.P === P) return;
        if (P.al === 'sel') { dessinePiece(x, P, vx(P.x), vy(P.y), K.cm, true); return; }
        dessinePiece(x, P, vx(P.dx), vy(P.dy), K.cm, true);
      });
      // prévision de la coupe : ligne, parts en %, morceaux pas entièrement traversés en orange
      var G = K.geste;
      if (G && G.type === 'couteau' && Math.hypot(G.b[0] - G.a[0], G.b[1] - G.a[1]) > 0.3) {
        var a = G.a, b = G.b; x.setLineDash([8, 5]); x.lineWidth = 2; x.strokeStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.moveTo(vx(a[0]), vy(a[1])); x.lineTo(vx(b[0]), vy(b[1])); x.stroke(); x.setLineDash([]);
        (K.prevision || []).forEach(function (r) {
          var m = r.milieu, tot = r.parts[0] + r.parts[1], p1 = Math.round(r.parts[0] / tot * 100), txt = r.complet ? p1 + ' % / ' + (100 - p1) + ' %' : 'trait trop court';
          if (!r.complet) { x.strokeStyle = 'rgba(255,140,30,.95)'; x.lineWidth = 2.5; cheminP(x, r.piece, vx(0), vy(0), K.cm); x.stroke(); }
          x.font = '800 12px system-ui,sans-serif'; var tw = x.measureText(txt).width; x.fillStyle = r.complet ? 'rgba(30,90,50,.9)' : 'rgba(150,70,10,.9)'; rr(x, vx(m[0]) - tw / 2 - 6, vy(m[1]) - 26, tw + 12, 18, 9); x.fill(); x.fillStyle = '#fff'; x.fillText(txt, vx(m[0]) - tw / 2, vy(m[1]) - 13);
        });
      }
      // trait du couteau qui vient d'être fait : lame qui passe
      if (K.trait) { K.trait.t += dt; var T = K.trait, k2 = Math.min(1, T.t / 0.12), al = 1 - Math.max(0, (T.t - 0.12) / 0.25); if (al <= 0) K.trait = null; else { x.strokeStyle = 'rgba(255,255,255,' + al + ')'; x.lineWidth = 3; x.beginPath(); x.moveTo(vx(T.a[0]), vy(T.a[1])); x.lineTo(vx(T.a[0] + (T.b[0] - T.a[0]) * k2), vy(T.a[1] + (T.b[1] - T.a[1]) * k2)); x.stroke(); } }
      // zones : assiette, bol, pilon
      var Z = K.zones;
      zoneFond(x, Z.cote, 'Mis de côté'); var zc = Z.cote; x.fillStyle = '#fbfbf7'; x.beginPath(); x.ellipse(zc.x + zc.w / 2, zc.y + zc.h * 0.58, zc.w * 0.44, zc.h * 0.36, 0, 0, 6.283); x.fill(); x.strokeStyle = '#d9d2c4'; x.lineWidth = 3; x.stroke();
      zoneFond(x, Z.bol, 'Bol : ' + Math.round(melange() * 100) + ' % mélangé'); var zb = Z.bol, bcx = zb.x + zb.w / 2, bcy = zb.y + zb.h * 0.52, bR = Math.min(zb.w, zb.h) * 0.42;
      var gb = x.createRadialGradient(bcx, bcy - bR * 0.2, 2, bcx, bcy, bR); gb.addColorStop(0, '#f6efe4'); gb.addColorStop(1, '#c9b9a0'); x.fillStyle = gb; x.beginPath(); x.ellipse(bcx, bcy, bR, bR * 0.66, 0, 0, 6.283); x.fill(); x.strokeStyle = '#8a6a4a'; x.lineWidth = 4; x.stroke();
      x.save(); x.beginPath(); x.ellipse(bcx, bcy, bR * 0.94, bR * 0.62, 0, 0, 6.283); x.clip();
      K.bolA += K.bolV * dt; K.bolV *= Math.pow(0.15, dt);
      K.pieces.forEach(function (P) {
        if (P.zone === 'bol') { P.ba += K.bolV * dt * (0.6 + P.br * 0.8 + ((P.id * 37) % 10) / 25); if (Math.abs(K.bolV) > 0.3) P.br = borne(P.br + hasard(-1, 1) * Math.abs(K.bolV) * dt * 0.12, 0.05, 0.85); }
        if (P.zone === 'bol' && !(K.geste && K.geste.type === 'porte' && K.geste.P === P)) { var c = posZone(P); dessinePiece(x, P, c[0], c[1], c[2], false); }
      });
      x.restore();
      K.pieces.forEach(function (P) { if (P.zone === 'cote' && !(K.geste && K.geste.type === 'porte' && K.geste.P === P)) { var c = posZone(P); dessinePiece(x, P, c[0], c[1], c[2], true); } });
      var tx2 = textureMortier(); zoneFond(x, Z.mortier, K.mortier.length ? 'Pilon : ' + tx2.nom : 'Pilon (touche pour piler)');
      var zm = Z.mortier, mcx = zm.x + zm.w / 2, mcy = zm.y + zm.h * 0.6, mR = Math.min(zm.w * 0.42, zm.h * 0.5);
      x.fillStyle = '#5e3d22'; x.beginPath(); x.ellipse(mcx, mcy, mR, mR * 0.62, 0, 0, 6.283); x.fill(); x.fillStyle = '#3e2714'; x.beginPath(); x.ellipse(mcx, mcy, mR * 0.82, mR * 0.48, 0, 0, 6.283); x.fill();
      if (K.mortier.length) {
        var cp = couleurPate(), e = tx2.ecrasement / 100; x.save(); x.beginPath(); x.ellipse(mcx, mcy, mR * 0.8, mR * 0.46, 0, 0, 6.283); x.clip();
        x.fillStyle = 'rgba(' + cp.map(Math.round).join(',') + ',' + (0.25 + 0.75 * e) + ')'; x.beginPath(); x.ellipse(mcx, mcy + mR * 0.1 * (1 - e), mR * (0.45 + 0.35 * e), mR * (0.25 + 0.2 * e), 0, 0, 6.283); x.fill();
        if (tx2.jus > 30) { x.fillStyle = 'rgba(255,255,255,' + (tx2.jus / 300) + ')'; x.beginPath(); x.ellipse(mcx - mR * 0.15, mcy - mR * 0.08, mR * 0.25, mR * 0.08, -0.2, 0, 6.283); x.fill(); }
        K.mortier.forEach(function (q) { q.bits.forEach(function (b) { var bx = mcx + Math.cos(b[0]) * b[1] * mR * 0.7, by = mcy + Math.sin(b[0]) * b[1] * mR * 0.4, s = mR * (0.04 + 0.12 * (1 - q.e)) * (0.6 + b[2] * 0.6); x.fillStyle = q.al === 'sel' ? '#ffffff' : q.A.chair; x.save(); x.translate(bx, by); x.rotate(b[3]); x.beginPath(); x.moveTo(-s, -s * 0.5); x.lineTo(s * 0.8, -s * 0.7); x.lineTo(s, s * 0.6); x.lineTo(-s * 0.6, s * 0.8); x.closePath(); x.fill(); if (q.al !== 'sel') { x.strokeStyle = q.A.peau; x.lineWidth = 1; x.stroke(); } x.restore(); if (q.al === 'piment' && q.e < 0.8 && b[2] > 0.5) { x.fillStyle = '#fff3c4'; x.beginPath(); x.ellipse(bx + 3, by + 2, 1.6, 1, 0.5, 0, 6.283); x.fill(); } }); });
        x.restore();
      }
      // le pilon (bâton) qui frappe
      K.pilonY = Math.max(0, K.pilonY - dt * 5); var enMain = K.geste && K.geste.type === 'pilon', py = mcy - mR * (enMain ? 0.05 : 0.45) + K.pilonY * mR * 0.3;
      x.save(); rr(x, zm.x, zm.y, zm.w, zm.h, 14); x.clip(); x.translate(mcx + mR * 0.3, py); x.rotate(0.35); var gp = x.createLinearGradient(-6, 0, 6, 0); gp.addColorStop(0, '#6b4628'); gp.addColorStop(0.5, '#a0703f'); gp.addColorStop(1, '#5b3a20'); x.fillStyle = gp; rr(x, -mR * 0.09, -mR * 0.9, mR * 0.18, mR * 1.1, mR * 0.08); x.fill(); x.beginPath(); x.ellipse(0, mR * 0.18, mR * 0.13, mR * 0.1, 0, 0, 6.283); x.fill(); x.restore();
      K.miettes = K.miettes.filter(function (m) { m.t += dt; m.vy += 700 * dt; m.x += m.vx * dt; m.y += m.vy * dt; if (m.t > 0.8) return false; x.fillStyle = m.c; x.fillRect(m.x, m.y, 2.5, 2.5); return true; });
      // morceau porté au doigt
      if (G && G.type === 'porte') { var Pp = G.P; if (Pp.al === 'sel') dessinePiece(x, Pp, G.x, G.y, K.cm, true); else { var cc = centreP(Pp.pts); dessinePiece(x, Pp, G.x - (Pp.zone === 'planche' ? (cc[0] + Pp.dx) * K.cm : 0), G.y - (Pp.zone === 'planche' ? (cc[1] + Pp.dy) * K.cm : 0), K.cm, true); } }
    }
    function zoneFond(x, z, titre) { x.fillStyle = 'rgba(255,250,240,.55)'; rr(x, z.x, z.y, z.w, z.h, 14); x.fill(); x.fillStyle = '#4a3322'; x.font = '800 12px system-ui,sans-serif'; x.fillText(titre, z.x + 10, z.y + 17, z.w - 20); }
    function boucle(ts) { var dt = K.der ? Math.min(0.05, (ts - K.der) / 1000) : 0.016; K.der = ts; if (self.enPause) dt = 0; K.t += dt; if (K.recette) suivre(); rendu(dt); K.raf = _kwVie.requestAnimationFrame(boucle); }

    /* ---------- mesure du résultat ---------- */
    function resultat(filtre) {
      var ps = K.pieces.filter(function (P) { return P.pts && (!filtre || P.al === filtre) && P.zone !== 'mortier'; }), parAl = {};
      ps.forEach(function (P) { var r = parAl[P.al] || (parAl[P.al] = { aliment: P.al, nom: P.A.nom, morceaux: 0, aires: [], entiers: 0, emince: 0 }); r.morceaux++; if (P.entier) r.entiers++; r.aires.push(P.aire); var L = longueurP(P.pts).l, ep = P.aire / Math.max(0.1, L); if (ep < 0.9 && L > ep * 4) r.emince++; });
      Object.keys(parAl).forEach(function (k) { var r = parAl[k], n = r.aires.length, m = r.aires.reduce(function (s, v) { return s + v; }, 0) / n, sd = Math.sqrt(r.aires.reduce(function (s, v) { return s + (v - m) * (v - m); }, 0) / n); r.tailleMoyenne = +m.toFixed(2); r.regularite = Math.round(Math.max(0, 1 - sd / Math.max(0.01, m)) * 100); r.classe = r.entiers === n ? 'entier' : r.emince > n * 0.6 ? 'émincé' : CLASSES_COUPE.filter(function (c) { return m < c[0]; })[0][1]; delete r.aires; });
      return { parAliment: parAl, coupes: K.coupes, precision: K.precision.length ? Math.round(K.precision.reduce(function (s, v) { return s + v; }, 0) / K.precision.length) : null, cote: K.pieces.filter(function (P) { return P.zone === 'cote'; }).length, bol: { morceaux: K.pieces.filter(function (P) { return P.zone === 'bol'; }).length, melange: Math.round(melange() * 100) }, pilon: textureMortier() };
    }
    function poserGuides(nom, o2) {
      o2 = o2 || {}; var P = K.pieces.filter(function (q) { return q.al === nom && q.zone === 'planche' && q.pts; })[0]; if (!P) return;
      var L = longueurP(P.pts), c = centreP(P.pts), ang = o2.angle != null ? o2.angle : L.a + Math.PI / 2, ec = o2.ecart || 1, n = Math.floor(L.l / ec) - 1, ux = Math.cos(L.a), uy = Math.sin(L.a), vxx = Math.cos(ang), vyy = Math.sin(ang), half = Math.max(P.A.h, 2) * 0.9;
      for (var i = 1; i <= n; i++) { var t = -L.l / 2 + i * ec, mx = c[0] + ux * t, my = c[1] + uy * t; K.guides.push({ a: [mx - vxx * half, my - vyy * half], b: [mx + vxx * half, my + vyy * half], ang: ang, fait: false, al: nom }); }
    }

    /* ---------- contrôles et recettes ---------- */
    var STYLE_B = 'min-height:44px;padding:8px 14px;border-radius:12px;border:0;font:800 14px system-ui,sans-serif;cursor:pointer;background:#5a3a22;color:#fff8ee';
    function bouton(txt, f, parent, coul) { var b = document.createElement('button'); b.type = 'button'; b.className = 'zone-interactive'; b.textContent = txt; b.style.cssText = STYLE_B + (coul ? ';background:' + coul : ''); _kwVie.ecoute(b, 'click', function () { f(b); }); (parent || barre).appendChild(b); return b; }
    var bC = bouton('Couteau', function () { outil('couteau'); }), bM = bouton('Main', function () { outil('main'); });
    function outil(n) { K.outil = n; bC.style.outline = n === 'couteau' ? '3px solid #f0b23a' : 'none'; bM.style.outline = n === 'main' ? '3px solid #f0b23a' : 'none'; cv.style.cursor = n === 'couteau' ? 'crosshair' : 'grab'; }
    outil('couteau');
    var etapesEl = document.createElement('ol'), resume = document.createElement('div');
    etapesEl.style.cssText = 'margin:0;padding:12px 14px 12px 34px;background:rgba(255,250,240,.9);border-radius:14px;line-height:1.5'; resume.style.cssText = 'padding:12px 14px;background:rgba(255,250,240,.9);border-radius:14px';
    function majGuide() {
      var R = K.recette, res = resultat(); if (!R) return;
      etapesEl.innerHTML = ''; R.etapes.forEach(function (e, i) { var li = document.createElement('li'); li.textContent = (e.fait ? '✓ ' : i === R.i ? '→ ' : '') + e.texte; li.style.cssText = 'font-weight:' + (i === R.i ? 900 : 600) + ';color:' + (e.fait ? '#1d6b3a' : i === R.i ? '#2a1f17' : '#8a7a6a'); etapesEl.appendChild(li); });
      var lignes = Object.keys(res.parAliment).map(function (k) { var r = res.parAliment[k]; return r.nom + ' : ' + r.morceaux + ' morceau' + (r.morceaux > 1 ? 'x' : '') + ', ' + r.classe + (r.morceaux > 1 ? ', régularité ' + r.regularite + ' %' : ''); });
      if (K.mortier.length) lignes.push('Pilon : ' + res.pilon.nom + ' (' + res.pilon.ecrasement + ' %)');
      resume.innerHTML = '<b style="font-size:16px">' + R.titre + '</b><div style="margin:.3em 0">' + R.info + '</div><div style="font-size:13px">' + lignes.join('<br>') + '</div>';
    }
    function suivre() {
      var R = K.recette, e = R.etapes[R.i]; if (!e) return; K.majT = (K.majT || 0) + 1; if (K.majT % 15 === 0) majGuide();
      if (e.verif(resultat())) { e.fait = true; R.i++; if (R.i >= R.etapes.length) { K.fini = true; var q = Math.round(R.score ? R.score(resultat()) : 100); dire(R.fin(q), 'bravo', 6500); evenementFx('victoire', K.W / 2, K.H / 2); emettre('fini', { qualite: q, recette: R.nom, resultat: resultat() }); } else { dire(R.etapes[R.i].texte, null, 4500); evenementFx('bonne', K.W / 2, K.H * 0.3, { points: 10 }); if (R.etapes[R.i].avant) R.etapes[R.i].avant(); } majGuide(); }
    }
    function garde_(noms) { garde.innerHTML = ''; noms.forEach(function (n) { bouton('+ ' + ALIMENTS[n].nom, function () { ajouter(n); }, garde, '#7a5a3a'); }); }
    var RECETTES = {
      libre: function () { garde_(Object.keys(ALIMENTS)); ['tomate', 'oignon', 'carotte', 'piment'].forEach(function (n, i) { ajouter(n, 7 + i * 8.5, 9 + (i % 2) * 7); }); K.recette = { nom: 'libre', titre: 'Atelier libre', info: 'Coupe au couteau (trace un trait), appuie longtemps sur un morceau pour le saisir, pose-le de côté, dans le bol ou dans le pilon. Touche le pilon pour écraser, tourne dedans pour affiner.', i: 0, etapes: [{ texte: 'Coupe, mélange et pile ce que tu veux !', verif: function () { return false; } }], fin: function () { return ''; } }; },
      rougail: function () {
        garde_(['tomate', 'oignon', 'piment', 'gingembre', 'sel', 'cive']);
        ajouter('tomate', 8, 8, 0.3); ajouter('tomate', 16, 9, 1.2); ajouter('oignon', 26, 8, 0.4); ajouter('cive', 20, 20, 0.05); ajouter('piment', 33, 18, 0.5); ajouter('sel', 36, 7);
        K.recette = { nom: 'rougail', titre: 'Rougail tomate', info: 'Tomates en petits dés, oignon émincé, cive coupée fin, piment pilé avec le sel. On mélange tout dans le bol.', i: 0,
          etapes: [
            { texte: 'Coupe les deux tomates en dés (au moins 16 morceaux).', verif: function (r) { var t = r.parAliment.tomate; return t && t.morceaux >= 16 && t.tailleMoyenne < 5; } },
            { texte: 'Émince l\'oignon en fines lamelles.', verif: function (r) { var t = r.parAliment.oignon; return t && t.morceaux >= 6 && (t.classe === 'émincé' || t.tailleMoyenne < 3); } },
            { texte: 'Coupe la cive en petits tronçons (suis les traits blancs).', avant: function () { poserGuides('cive', { ecart: 1.2 }); }, verif: function (r) { var t = r.parAliment.cive; return t && t.morceaux >= 8; } },
            { texte: 'Mets le piment et le sel dans le pilon et pile jusqu\'à une pâte.', verif: function (r) { var d = r.pilon.detail, p = d.filter(function (q) { return q.aliment === 'piment'; })[0], s = d.filter(function (q) { return q.aliment === 'sel'; })[0]; return p && s && r.pilon.code >= 3; } },
            { texte: 'Mets tomates, oignon et cive dans le bol, puis mélange à la cuillère (tourne dans le bol).', verif: function (r) { return r.bol.morceaux >= 20 && r.bol.melange >= 70; } }
          ],
          score: function (r) { var s = 70, t = r.parAliment.tomate, ci = r.parAliment.cive; if (t) s += Math.min(15, t.regularite / 6); if (r.precision != null) s += r.precision / 10; else if (ci) s += 8; return Math.min(100, s + (r.bol.melange > 85 ? 5 : 0)); },
          fin: function (q) { return q >= 85 ? 'Rougail tomate bien coupé et bien mélangé ! (' + q + ' %)' : 'Rougail prêt (' + q + ' %). Des morceaux plus réguliers le rendront encore plus beau.'; } };
      },
      pimentPile: function () {
        garde_(['piment', 'ail', 'gingembre', 'sel', 'combava', 'girofle']);
        ajouter('piment', 8, 8, 0.2); ajouter('piment', 9, 12, -0.1); ajouter('piment', 10, 16, 0.15); ajouter('ail', 22, 9, 0.4); ajouter('ail', 25, 12, -0.6); ajouter('gingembre', 26, 19, 0.1); ajouter('sel', 34, 8);
        K.recette = { nom: 'pimentPile', titre: 'Piment pilé', info: 'Au pilon, on écrase d\'abord en tapant (ça casse les morceaux), puis en tournant (ça affine la pâte). Le gros sel aide à broyer, le gingembre est fibreux et demande plus de travail.', i: 0,
          etapes: [
            { texte: 'Coupe chaque piment en deux dans la longueur.', verif: function (r) { var t = r.parAliment.piment; return t && t.morceaux >= 6; } },
            { texte: 'Coupe le gingembre en petits morceaux.', verif: function (r) { var t = r.parAliment.gingembre; return t && t.morceaux >= 4 && t.tailleMoyenne < 8; } },
            { texte: 'Mets piments, ail, gingembre et sel dans le pilon.', verif: function (r) { var a = r.pilon.detail.map(function (q) { return q.aliment; }); return ['piment', 'ail', 'gingembre', 'sel'].every(function (n) { return a.indexOf(n) >= 0; }); } },
            { texte: 'Pile en tapant jusqu\'au concassé, puis tourne pour une pâte fine.', verif: function (r) { return r.pilon.code >= 4; } }
          ],
          score: function (r) { var d = r.pilon.detail, mn = Math.min.apply(null, d.map(function (q) { return q.ecrasement; })); return 70 + Math.min(30, mn / 3.3); },
          fin: function (q) { return q >= 85 ? 'Piment pilé bien fin, ça va piquer ! (' + q + ' %)' : 'Piment pilé prêt (' + q + ' %). Écrase encore un peu le gingembre pour une pâte plus lisse.'; } };
      }
    };
    _kwVie.ecoute(cv, 'pointerdown', surBas); _kwVie.ecoute(cv, 'pointermove', surMouve); _kwVie.ecoute(cv, 'pointerup', surHaut); _kwVie.ecoute(cv, 'pointercancel', function () { K.geste = null; K.prevision = null; });
    taille(); _kwVie.ecoute(global, 'resize', taille); if (global.ResizeObserver) { K.ro = _kwVie.observer(taille); K.ro.observe(scene); }
    K.raf = _kwVie.requestAnimationFrame(boucle);
    K.api = {
      ajouter: function (n, x, y, r) { var P = ajouter(n, x, y, r); return P ? P.id : null; },
      couper: function (x1, y1, x2, y2) { return couper([x1, y1], [x2, y2]); },
      prevoir: function (x1, y1, x2, y2) { return prevoir([x1, y1], [x2, y2]).map(function (r) { return { aliment: r.piece.al, complet: r.complet, parts: r.parts.map(function (v) { return +v.toFixed(2); }) }; }); },
      guides: function (n, o2) { poserGuides(n, o2); return K.api; },
      deposer: function (id, zone) { var P = K.pieces.filter(function (q) { return q.id === id; })[0]; if (!P) return K.api; if (zone === 'mortier') versMortier(P); else if (zone === 'bol') versBol(P); else versCote(P); return K.api; },
      tout: function (aliment, zone) { K.pieces.filter(function (q) { return q.al === aliment && q.zone !== zone; }).forEach(function (P) { if (zone === 'mortier') versMortier(P); else if (zone === 'bol') versBol(P); else versCote(P); }); return K.api; },
      piler: function (n, tourne) { for (var i = 0; i < (n || 1); i++) pilonner(tourne ? 1 : 1.2, !!tourne); return textureMortier(); },
      melanger: function (v) { K.bolV += v || 6; return K.api; },
      morceaux: function () { return K.pieces.map(function (P) { return { id: P.id, aliment: P.al, zone: P.zone, aire: P.aire ? +P.aire.toFixed(2) : null, entier: P.entier, centre: P.pts ? centreP(P.pts) : [P.x, P.y] }; }); },
      resultat: resultat, texture: textureMortier,
      recette: function (nom) { if (!RECETTES[nom]) return K.api; RECETTES[nom](); guide.appendChild(etapesEl); guide.appendChild(resume); majGuide(); dire(K.recette.etapes[0].texte, null, 5000); return K.api; },
      sur: function (nom, f) { (K.ecoute[nom] = K.ecoute[nom] || []).push(f); return K.api; },
      lignesGuides: function () { return K.guides.filter(function (g) { return !g.fait; }).map(function (g) { return { a: g.a.slice(), b: g.b.slice(), aliment: g.al }; }); },
      ecran: function (x, y) { return [vx(x), vy(y)]; }, planche: function (px, py) { return [cmX(px), cmY(py)]; },
      outil: function (n) { outil(n); return K.api; }, dire: dire,
      etat: function () { return { recette: K.recette && K.recette.nom, etape: K.recette && K.recette.i, fini: K.fini, morceaux: K.pieces.length, pilon: textureMortier().nom }; },
      arreter: function () { _kwVie.cancelAnimationFrame(K.raf); _kwVie.clearTimeout(K.msgT); if (K.ro) _kwVie.oublieObserver(K.ro); _kwVie.oublie(global, 'resize', taille); ['pointerdown', 'pointermove', 'pointerup'].forEach(function (t, i) { _kwVie.oublie(cv, t, [surBas, surMouve, surHaut][i]); }); racine.remove(); }
    };
    if (o.recette) K.api.recette(o.recette);
    return K.api;
  };


  /* ======================================================================
   * v4.0 LUMYÈR : idées reprises d'Unreal Engine 5.8 et de la préversion 5.9, adaptées au navigateur et aux EPUB
   *   MegaLights (5.8)                         -> fx.megaLumieres() : des centaines de lumières à coût fixe ;
   *                                               chaque particule lumineuse (braise, étincelle, luciole) éclaire le décor
   *   Lumen Lite (5.8), Lumen World Cache (5.9) -> grille de sondes gardée en mémoire : la lumière rebondit sur le décor
   *                                               et s'arrête derrière les obstacles
   *   Ambient Lighting Volumes (5.9)           -> ml.zone() : éclaircir, assombrir ou teinter l'ambiance à un endroit
   *   Transparence sans erreur d'ordre (5.9)   -> tri stable par tranches, dans le moteur de particules (section 3)
   *   Diffusion de la lumière dans la brume (5.8) -> le halo des lumières grandit quand fx.brouillard est actif
   *   Cible web et réglages de qualité (5.9)   -> KwFX.profil()
   *   Outils typés pour les agents (Unreal MCP) -> KwFX.outils(), fx.executer(plan), KwFX.definirSysteme()
   * ==================================================================== */
  var PROFIL = null;
  var REGLAGES_PROFIL = {
    leger: { lumieres: 48, ombres: 2, cellule: 12, penombre: 1, ips: 30 },
    moyen: { lumieres: 120, ombres: 4, cellule: 9, penombre: 3, ips: 60 },
    eleve: { lumieres: 240, ombres: 6, cellule: 7, penombre: 3, ips: 60 },
    max: { lumieres: 420, ombres: 8, cellule: 6, penombre: 3, ips: 60 }
  };
  function profil() {
    if (PROFIL) return PROFIL;
    var nav = global.navigator || {}, ua = nav.userAgent || '';
    var mobile = /iPhone|iPod|Android.*Mobile/i.test(ua), tablette = /iPad/i.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1) || (/Android/i.test(ua) && !mobile);
    var coeurs = nav.hardwareConcurrency || 4, memoire = nav.deviceMemory || (mobile ? 3 : 6), webgl2 = !!global.WebGL2RenderingContext;
    var note = (coeurs >= 8 ? 2 : coeurs >= 4 ? 1 : 0) + (memoire >= 8 ? 2 : memoire >= 4 ? 1 : 0) - (mobile ? 1 : 0);
    var niveau = !webgl2 ? 'leger' : note >= 4 ? 'max' : note >= 3 ? 'eleve' : note >= 1 ? 'moyen' : 'leger';
    var r = REGLAGES_PROFIL[niveau];
    PROFIL = { niveau: niveau, webgpu: !!nav.gpu, webgl2: webgl2, coeurs: coeurs, memoire: memoire, mobile: mobile, tablette: tablette, lumieres: r.lumieres, ombres: r.ombres, cellule: r.cellule };
    return PROFIL;
  }

  var ML_T = 48;
  function mlSprite(cache, r, g, b) {
    var k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4), s = cache.map[k];
    if (s) return s;
    if (cache.n > 200) { cache.map = {}; cache.n = 0; }
    s = document.createElement('canvas'); s.width = s.height = ML_T;
    var x = s.getContext('2d'), h = ML_T / 2, gr = x.createRadialGradient(h, h, 0, h, h, h), c = ((r >> 4) * 17) + ',' + ((g >> 4) * 17) + ',' + ((b >> 4) * 17);
    [[0, 1], [0.25, 0.88], [0.5, 0.56], [0.75, 0.19], [1, 0]].forEach(function (p) { gr.addColorStop(p[0], 'rgba(' + c + ',' + p[1] + ')'); });
    x.fillStyle = gr; x.fillRect(0, 0, ML_T, ML_T);
    cache.map[k] = s; cache.n++; return s;
  }
  /* le segment (x1,y1)-(x2,y2) traverse-t-il le rectangle ? (occlusion des sondes) */
  function segRect(x1, y1, x2, y2, r) {
    var t0 = 0, t1 = 1, dx = x2 - x1, dy = y2 - y1, p = [-dx, dx, -dy, dy], q = [x1 - r.x, r.x + r.l - x1, y1 - r.y, r.y + r.h - y1];
    for (var i = 0; i < 4; i++) {
      if (p[i] === 0) { if (q[i] < 0) return false; }
      else { var t = q[i] / p[i]; if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; } }
    }
    return t1 > t0;
  }

  Directeur.prototype.megaLumieres = function (o) { var _kwVie = this._vie;
    var self = this;
    if (o === false || o === null) { if (this._ml) this._ml.api.arreter(); return this; }
    o = o || {};
    if (this._ml) { this._ml.api.regler(o); return this._ml.api; }
    var pr = profil(), niv = REGLAGES_PROFIL[o.qualite] ? o.qualite : (this.opt.support === 'epub' ? 'leger' : pr.niveau), rg = REGLAGES_PROFIL[niv];
    var ancre = o.apres && o.apres.parentNode ? o.apres : null; // apres: element -> les calques se glissent juste après lui (sous l'interface du jeu)
    function calque(z, melange) {
      var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'position:' + (self.plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + (ancre ? 'auto' : z) + ';mix-blend-mode:' + melange;
      if (ancre && ancre.parentNode) { ancre.parentNode.insertBefore(_kwVie.root(c), ancre.nextSibling); ancre = c; } else self.conteneur.appendChild(_kwVie.root(c));
      return c;
    }
    var zB = o.z != null ? Math.round(Number(o.z) || 0) : 9990, cL = calque(zB, 'multiply'), cH = calque(zB + 1, 'screen');
    var xL = cL.getContext('2d'), xH = cH.getContext('2d');
    function hors(lu) { var c = document.createElement('canvas'); return { c: c, x: c.getContext('2d', lu ? { willReadFrequently: true } : undefined) }; }
    var acc = hors(true), tmp = hors(), msq = hors(), sond = hors();
    var ML = this._ml = {
      actif: true, niveau: niv, budget: rg.lumieres, maxOmbres: rg.ombres, cel: rg.cellule, pen: rg.penombre, ips: rg.ips,
      nuit: 0, nuitCible: 0.75, nuitVit: 1.2, amb: [11, 20, 48], rebond: 0.45, sol: [1, 1, 1], halo: 0.1, expo: 1, moy: 0, particules: true, objets: '[data-kwfx-opaque]', suivi: false,
      lums: [], zones: [], obst: [], occ: [], occT: -1, ess: null, cache: { map: {}, n: 0 },
      t: 0, der: 0, frame: 0, ms: 0, st: { particules: 0, dessinees: 0, ombrees: 0, pas: 1 }, P: null, gw: 0, gh: 0, gs: 0, clu: []
    };
    function couleur(v, def) { var c = versRgb(v || def); return c; }
    function regler(q) {
      q = q || {};
      if (q.nuit != null) { ML.nuitCible = borne(Number(q.nuit) || 0, 0, 1); if (q.duree === 0) ML.nuit = ML.nuitCible; else ML.nuitVit = q.duree ? Math.max(0.05, Math.abs(ML.nuitCible - ML.nuit) / (q.duree / 1000)) : 1.2; }
      if (q.ambiance) ML.amb = couleur(q.ambiance);
      if (q.rebond != null) ML.rebond = q.rebond === false ? 0 : borne(Number(q.rebond === true ? 0.45 : q.rebond) || 0, 0, 1.5);
      if (q.sol) ML.sol = couleur(q.sol).map(function (v) { return v / 255; });
      if (q.halo != null) ML.halo = q.halo === false ? 0 : borne(Number(q.halo === true ? 0.1 : q.halo) || 0, 0, 1);
      if (q.particules != null) ML.particules = !!q.particules;
      if (q.objets != null) { ML.objets = q.objets || ''; ML.occT = -1; }
      if (q.suivi != null) ML.suivi = !!q.suivi;
      if (q.lumieres != null) ML.budget = Math.round(borne(Number(q.lumieres) || rg.lumieres, 8, 1200));
      if (q.ombres != null) ML.maxOmbres = q.ombres === false ? 0 : Math.round(borne(Number(q.ombres === true ? rg.ombres : q.ombres) || 0, 0, 16));
      return ML.api;
    }
    function taille() {
      if (self._detruit) return;
      var t = self.taille(), s = ML.cel; ML.L = t.l; ML.H = t.h;
      var w = Math.max(2, Math.ceil(t.l / s)), h = Math.max(2, Math.ceil(t.h / s));
      [cL, cH, acc.c, tmp.c, msq.c].forEach(function (c) { c.width = w; c.height = h; });
      acc.x.fillStyle = '#000'; acc.x.fillRect(0, 0, w, h);
      ML.w = w; ML.h = h; ML.gs = s * 5; ML.gw = Math.ceil(t.l / ML.gs) + 1; ML.gh = Math.ceil(t.h / ML.gs) + 1;
      ML.P = new Float32Array(ML.gw * ML.gh * 3); sond.c.width = ML.gw; sond.c.height = ML.gh; ML.img = sond.x.createImageData(ML.gw, ML.gh);
      for (var i = 3; i < ML.img.data.length; i += 4) ML.img.data[i] = 255;
    }
    function base() { return self.plein ? { left: 0, top: 0 } : self.conteneur.getBoundingClientRect(); }
    function mesurer() {
      var occ = ML.obst.slice();
      if (ML.objets) {
        var b = base(), els; try { els = self.conteneur.querySelectorAll(ML.objets); } catch (e) { els = []; }
        for (var i = 0; i < els.length && occ.length < 24; i++) { var r = els[i].getBoundingClientRect(); if (r.width > 2 && r.height > 2) occ.push({ x: r.left - b.left, y: r.top - b.top, l: r.width, h: r.height }); }
      }
      ML.occ = occ; ML.occT = ML.t;
    }
    function point(cible) {
      if (typeof cible === 'function') { var p = cible(); return p ? [p[0] != null ? p[0] : p.x, p[1] != null ? p[1] : p.y] : null; }
      if (cible && cible.getBoundingClientRect) { if (!cible.isConnected) return null; var r = cible.getBoundingClientRect(), b = base(); return [r.left + r.width / 2 - b.left, r.top + r.height / 2 - b.top]; }
      return null;
    }
    /* masque d'ombre d'une lumière : chaque obstacle projette un quadrilatère, avec pénombre (lumière « de surface ») */
    function ombres(l, R) {
      var mx = msq.x, n = 0, s = ML.cel, pen = ML.pen, tl = l.taille;
      mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'source-over'; mx.globalAlpha = 1; mx.clearRect(0, 0, ML.w, ML.h);
      mx.setTransform(1 / s, 0, 0, 1 / s, 0, 0); mx.globalCompositeOperation = 'lighter'; mx.fillStyle = '#000';
      for (var k = 0; k < ML.occ.length; k++) {
        var r = ML.occ[k];
        if (l.x > r.x && l.x < r.x + r.l && l.y > r.y && l.y < r.y + r.h) continue;
        var px = borne(l.x, r.x, r.x + r.l), py = borne(l.y, r.y, r.y + r.h); if (Math.hypot(px - l.x, py - l.y) > R) continue;
        var C = [[r.x, r.y], [r.x + r.l, r.y], [r.x + r.l, r.y + r.h], [r.x, r.y + r.h]];
        mx.save(); mx.beginPath(); mx.rect(-R, -R, ML.L + 2 * R, ML.H + 2 * R); mx.rect(r.x, r.y, r.l, r.h); mx.clip('evenodd');
        for (var j = 0; j < pen; j++) {
          var jx = pen > 1 ? Math.cos(j * 2.094 + l.id) * tl : 0, jy = pen > 1 ? Math.sin(j * 2.094 + l.id) * tl : 0, lx = l.x + jx, ly = l.y + jy;
          var bi = 0, bj = 1, best = 2;
          for (var a = 0; a < 4; a++) for (var b2 = a + 1; b2 < 4; b2++) {
            var ax = C[a][0] - lx, ay = C[a][1] - ly, bx = C[b2][0] - lx, by = C[b2][1] - ly, cs = (ax * bx + ay * by) / ((Math.hypot(ax, ay) || 1) * (Math.hypot(bx, by) || 1));
            if (cs < best) { best = cs; bi = a; bj = b2; }
          }
          var A = C[bi], B = C[bj], da = Math.hypot(A[0] - lx, A[1] - ly) || 1, db = Math.hypot(B[0] - lx, B[1] - ly) || 1, far = R * 2.2;
          mx.globalAlpha = 1 / pen + 0.004; mx.beginPath(); mx.moveTo(A[0], A[1]); mx.lineTo(B[0], B[1]);
          mx.lineTo(B[0] + (B[0] - lx) / db * far, B[1] + (B[1] - ly) / db * far); mx.lineTo(A[0] + (A[0] - lx) / da * far, A[1] + (A[1] - ly) / da * far); mx.closePath(); mx.fill();
        }
        mx.restore(); n++;
      }
      return n;
    }
    function lueur(ctx, r, g, b, x, y, R, a) { if (a <= 0.004 || R < 1) return; ctx.globalAlpha = a > 1 ? 1 : a; ctx.drawImage(mlSprite(ML.cache, r, g, b), x - R, y - R, R * 2, R * 2); }
    function amas(x, y, r, g, b, w, R) { ML.clu.push({ x: x, y: y, r: r, g: g, b: b, w: w, R: R }); }

    function image(t) {
      if (!ML.actif || self._detruit) return;
      ML.raf = _kwVie.requestAnimationFrame(image);
      if (ML.der && t - ML.der < 1000 / ML.ips - 3) return;
      var i, l, t0 = maintenant(), dt = ML.der ? Math.min(0.1, (t - ML.der) / 1000) : 0.016; ML.der = t; ML.t += dt; ML.frame++;
      if (ML.nuit !== ML.nuitCible) { var dn = ML.nuitCible - ML.nuit, pas = ML.nuitVit * dt; ML.nuit = Math.abs(dn) <= pas ? ML.nuitCible : ML.nuit + (dn > 0 ? pas : -pas); }
      // veille : en plein jour, sans zone ni luciole, la lumière ne change rien à l'image ; on masque les calques et on ne dessine pas
      var dort = ML.nuit === 0 && ML.nuitCible === 0 && !ML.zones.length && !ML.ess;
      if (dort !== ML.dort) { ML.dort = dort; cL.style.display = cH.style.display = dort ? 'none' : ''; if (ML.cP) ML.cP.style.display = dort ? 'none' : ''; if (!dort) { acc.x.setTransform(1, 0, 0, 1, 0, 0); acc.x.globalCompositeOperation = 'source-over'; acc.x.globalAlpha = 1; acc.x.fillStyle = '#000'; acc.x.fillRect(0, 0, ML.w, ML.h); } }
      if (dort) { for (i = ML.lums.length - 1; i >= 0; i--) { l = ML.lums[i]; if (l.cible) { var pd = point(l.cible); if (pd) { l.x = pd[0] + l.dx; l.y = pd[1] + l.dy; } } if (l.fin) { l.k -= dt / l.fin; if (l.k <= 0) ML.lums.splice(i, 1); } } ML.st.dessinees = ML.st.ombrees = 0; ML.ms *= 0.9; return; }
      if (ML.occT < 0 || ML.suivi || ML.t - ML.occT > 0.25) mesurer();
      var s = ML.cel, ax = acc.x, m = self.particules, nP = (ML.particules && m && m.actif && m.instAdd) ? m.nA : 0, nE = ML.ess ? ML.ess.n : 0;
      ML.clu.length = 0;
      // 1. lumière directe, accumulée dans le temps : au-delà du budget, on ne dessine qu'une lumière sur « pas »
      //    à chaque image (en les faisant tourner) et l'accumulation lisse le résultat : le coût reste fixe
      // exposition automatique (comme l'œil qui s'habitue) : quand trop de lumières s'additionnent, on baisse leur gain pour garder les couleurs
      if (ML.frame % 6 === 0) {
        var dA = ax.getImageData(0, 0, ML.w, ML.h).data, som = 0, cnt = 0;
        for (i = 0; i < dA.length; i += 16) { var mxv = dA[i] > dA[i + 1] ? dA[i] : dA[i + 1]; if (dA[i + 2] > mxv) mxv = dA[i + 2]; som += mxv; cnt++; }
        ML.moy = som / (cnt * 255);
        if (ML.moy > 0.3) ML.expo = Math.max(0.06, ML.expo * (ML.moy > 0.6 ? 0.8 : 0.9)); else if (ML.moy < 0.2) ML.expo = Math.min(1, ML.expo * 1.07);
      }
      var ex = ML.expo, total = nP + nE, pasL = Math.max(1, Math.ceil(total / ML.budget)), garde = pasL > 1 ? 0.62 : 0.35, gain = 1 - garde, des = 0, omb = 0;
      ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalCompositeOperation = 'source-over'; ax.globalAlpha = gain; ax.fillStyle = '#000'; ax.fillRect(0, 0, ML.w, ML.h);
      ax.setTransform(1 / s, 0, 0, 1 / s, 0, 0); ax.globalCompositeOperation = 'lighter';
      // lumières posées par le jeu, les plus importantes reçoivent des ombres portées
      var ordre = ML.lums.slice();
      for (i = ordre.length - 1; i >= 0; i--) {
        l = ordre[i];
        if (l.cible) { var p = point(l.cible); if (p) { l.x = p[0] + l.dx; l.y = p[1] + l.dy; } }
        if (l.fin) { l.k -= dt / l.fin; if (l.k <= 0) { ML.lums.splice(ML.lums.indexOf(l), 1); ordre.splice(i, 1); continue; } } else if (l.k < 1) l.k = Math.min(1, l.k + dt * 4);
        l.f = l.force * l.k * (l.scintille ? 1 - l.scintille * bruit(ML.t * 7 + l.id * 13.7, l.id) : 1);
      }
      ordre.sort(function (a, b) { return b.f * b.rayon - a.f * a.rayon; });
      for (i = 0; i < ordre.length; i++) {
        l = ordre[i]; var R = l.rayon;
        if (l.ombres && omb < ML.maxOmbres && ML.occ.length) {
          var n = ombres(l, R);
          if (n) {
            var tx = tmp.x; tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'source-over'; tx.globalAlpha = 1; tx.clearRect(0, 0, ML.w, ML.h);
            tx.setTransform(1 / s, 0, 0, 1 / s, 0, 0); lueur(tx, l.c[0], l.c[1], l.c[2], l.x, l.y, R, 1);
            tx.setTransform(1, 0, 0, 1, 0, 0); tx.globalCompositeOperation = 'destination-out'; tx.globalAlpha = 1; tx.drawImage(msq.c, 0, 0);
            ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalAlpha = Math.min(1, l.f * gain); ax.drawImage(tmp.c, 0, 0); ax.setTransform(1 / s, 0, 0, 1 / s, 0, 0);
            omb++;
          } else lueur(ax, l.c[0], l.c[1], l.c[2], l.x, l.y, R, l.f * gain);
        } else lueur(ax, l.c[0], l.c[1], l.c[2], l.x, l.y, R, l.f * gain);
        des++; amas(l.x, l.y, l.c[0] / 255, l.c[1] / 255, l.c[2] / 255, l.f, R);
      }
      // chaque particule lumineuse du moteur est une lumière
      var B = 96, bw = Math.ceil(ML.L / B) + 1, bh = Math.ceil(ML.H / B) + 1, bins = ML.bins;
      if (!bins || bins.length !== bw * bh * 6) bins = ML.bins = new Float32Array(bw * bh * 6); else bins.fill(0);
      function bin(x, y, r, g, b, w) { if (x < 0 || y < 0 || x > ML.L || y > ML.H) return; var o2 = (((y / B) | 0) * bw + ((x / B) | 0)) * 6; bins[o2] += w; bins[o2 + 1] += w * x; bins[o2 + 2] += w * y; bins[o2 + 3] += w * r; bins[o2 + 4] += w * g; bins[o2 + 5] += w * b; }
      if (nP) {
        var A = m.instAdd, dec = ML.frame % pasL;
        for (i = 0; i < nP; i++) {
          var o1 = i * 10, al = A[o1 + 7], ta = A[o1 + 2]; if (al < 0.03) continue;
          var w = al * Math.min(12, ta); bin(A[o1], A[o1 + 1], A[o1 + 4], A[o1 + 5], A[o1 + 6], w);
          if ((i + dec) % pasL) continue;
          lueur(ax, A[o1 + 4] * 255 | 0, A[o1 + 5] * 255 | 0, A[o1 + 6] * 255 | 0, A[o1], A[o1 + 1], borne(ta * 7, 14, 120), Math.min(1, al * 0.32 * ex * pasL) * gain); des++;
        }
      }
      // essaim de lucioles : de petites lumières qui se promènent toutes seules
      var E = ML.ess;
      if (E) {
        var dec2 = (ML.frame + 1) % pasL, ec = E.c;
        for (i = 0; i < E.n; i++) {
          var cu = curl(E.X[i] * 0.006 + E.G[i] * 9, E.Y[i] * 0.006 + ML.t * 0.12);
          E.X[i] += cu[0] * E.vit * dt; E.Y[i] += cu[1] * E.vit * dt;
          if (E.X[i] < E.x1) E.X[i] = E.x2; else if (E.X[i] > E.x2) E.X[i] = E.x1; if (E.Y[i] < E.y1) E.Y[i] = E.y2; else if (E.Y[i] > E.y2) E.Y[i] = E.y1;
          var cli = Math.max(0, Math.sin(ML.t * (1.2 + E.G[i] * 1.6) + E.G[i] * 40)); cli = cli * cli * E.k; E.A[i] = cli;
          if (cli < 0.03) continue;
          bin(E.X[i], E.Y[i], ec[0] / 255, ec[1] / 255, ec[2] / 255, cli * 5);
          if ((i + dec2) % pasL) continue;
          lueur(ax, ec[0], ec[1], ec[2], E.X[i], E.Y[i], E.rayon, Math.min(1, cli * E.force * ex * pasL) * gain); des++;
        }
        if (E.fin) { E.k -= dt / E.fin; if (E.k <= 0) ML.ess = null; } else if (E.k < 1) E.k = Math.min(1, E.k + dt * 1.5);
      }
      for (i = 0; i < bw * bh; i++) { var o3 = i * 6, bwt = bins[o3]; if (bwt > 0.5) amas(bins[o3 + 1] / bwt, bins[o3 + 2] / bwt, bins[o3 + 3] / bwt, bins[o3 + 4] / bwt, bins[o3 + 5] / bwt, Math.min(1.4, bwt / 45), 120); }
      // 2. lumière indirecte : une grille de sondes gardée en mémoire, un quart seulement est recalculé à chaque image
      var P = ML.P, gw = ML.gw, gh = ML.gh, gs = ML.gs, clu = ML.clu, occ = ML.occ, D = ML.img.data, rb = ML.rebond;
      if (rb > 0) {
        for (var gy = 0; gy < gh; gy++) for (var gx = 0; gx < gw; gx++) {
          if (((gx + gy * 2 + ML.frame) & 3) !== 0) continue;
          var sx = gx * gs, sy = gy * gs, sr = 0, sg = 0, sb = 0, dedans = -1, q2;
          for (q2 = 0; q2 < occ.length; q2++) { var oc = occ[q2]; if (sx > oc.x && sx < oc.x + oc.l && sy > oc.y && sy < oc.y + oc.h) { dedans = q2; break; } }
          for (var c2 = 0; c2 < clu.length; c2++) {
            var cl = clu[c2], R3 = cl.R * 2.6, dd = Math.hypot(cl.x - sx, cl.y - sy); if (dd >= R3) continue;
            var f = 1 - dd / R3; f = f * f * cl.w;
            for (q2 = 0; q2 < occ.length; q2++) { if (q2 !== dedans && segRect(sx, sy, cl.x, cl.y, occ[q2])) { f *= 0.12; break; } }
            sr += cl.r * f; sg += cl.g * f; sb += cl.b * f;
          }
          var op = (gy * gw + gx) * 3; P[op] += (sr - P[op]) * 0.5; P[op + 1] += (sg - P[op + 1]) * 0.5; P[op + 2] += (sb - P[op + 2]) * 0.5;
        }
        for (i = 0; i < gw * gh; i++) { D[i * 4] = Math.min(255, P[i * 3] * ML.sol[0] * rb * 255); D[i * 4 + 1] = Math.min(255, P[i * 3 + 1] * ML.sol[1] * rb * 255); D[i * 4 + 2] = Math.min(255, P[i * 3 + 2] * ML.sol[2] * rb * 255); }
        sond.x.putImageData(ML.img, 0, 0);
      }
      // 3. composition : ambiance (avec ses zones) + lumière directe + lumière indirecte, le tout multiplié sur le décor
      var nu = ML.nuit, a0 = ML.amb, x = xL;
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      x.fillStyle = 'rgb(' + Math.round(255 + (a0[0] - 255) * nu) + ',' + Math.round(255 + (a0[1] - 255) * nu) + ',' + Math.round(255 + (a0[2] - 255) * nu) + ')'; x.fillRect(0, 0, ML.w, ML.h);
      x.setTransform(1 / s, 0, 0, 1 / s, 0, 0);
      for (i = ML.zones.length - 1; i >= 0; i--) {
        var z = ML.zones[i], zx = z.x, zy = z.y, zl = z.l, zh = z.h;
        if (z.el) { if (!z.el.isConnected) { ML.zones.splice(i, 1); continue; } var zr = z.el.getBoundingClientRect(), zb = base(); zx = zr.left - zb.left; zy = zr.top - zb.top; zl = zr.width; zh = zr.height; }
        if (z.fin) { z.k -= dt / z.fin; if (z.k <= 0) { ML.zones.splice(i, 1); continue; } } else if (z.k < 1) z.k = Math.min(1, z.k + dt * 2);
        var fo = z.force * z.k, zc = z.c, pasZ = 4;
        if (z.mode === 'eclaircir') { x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgb(' + zc[0] + ',' + zc[1] + ',' + zc[2] + ')'; x.globalAlpha = fo / pasZ; }
        else { x.globalCompositeOperation = 'multiply'; var mi = Math.pow(1 - fo, 1 / pasZ), me = 1 - mi; x.globalAlpha = 1; x.fillStyle = 'rgb(' + Math.round(255 - (255 - zc[0]) * me) + ',' + Math.round(255 - (255 - zc[1]) * me) + ',' + Math.round(255 - (255 - zc[2]) * me) + ')'; }
        for (var e = 0; e < pasZ; e++) {
          var g2 = z.bord * (1 - e / (pasZ - 1) * 2) * 0.5; x.beginPath();
          if (z.forme === 'ellipse') x.ellipse(zx + zl / 2, zy + zh / 2, Math.max(1, zl / 2 + g2), Math.max(1, zh / 2 + g2), 0, 0, 6.2832); else x.rect(zx - g2, zy - g2, Math.max(1, zl + 2 * g2), Math.max(1, zh + 2 * g2));
          x.fill();
        }
      }
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 1; x.drawImage(acc.c, 0, 0);
      if (rb > 0) { x.imageSmoothingEnabled = true; x.setTransform(1 / s, 0, 0, 1 / s, 0, 0); x.drawImage(sond.c, -gs / 2, -gs / 2, gw * gs, gh * gs); }
      // halo coloré par-dessus (mélange « écran »), plus large quand il y a du brouillard
      var brume = self._brumes && Object.keys(self._brumes).length ? 1.8 : 1, ha = Math.min(1, ML.halo * brume * (0.35 + 0.65 * nu) * (1 - 0.6 * Math.min(1, ML.moy * 2)));
      x = xH; x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = '#000'; x.fillRect(0, 0, ML.w, ML.h);
      if (ha > 0.004) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = ha; x.drawImage(acc.c, 0, 0); if (rb > 0) { x.imageSmoothingEnabled = true; x.globalAlpha = ha * 0.6; x.setTransform(1 / s, 0, 0, 1 / s, 0, 0); x.drawImage(sond.c, -gs / 2, -gs / 2, gw * gs, gh * gs); } }
      // les lucioles elles-mêmes : petits points nets, sur un calque à la vraie résolution
      if (E) {
        if (!ML.cP) { ML.cP = calque(zB + 2, 'normal'); ML.xP = ML.cP.getContext('2d'); ML.pT = 0; }
        var dpr = Math.min(2, global.devicePixelRatio || 1), pw = Math.round(ML.L * dpr), ph = Math.round(ML.H * dpr), xp = ML.xP;
        if (ML.cP.width !== pw || ML.cP.height !== ph) { ML.cP.width = pw; ML.cP.height = ph; }
        xp.setTransform(dpr, 0, 0, dpr, 0, 0); xp.globalCompositeOperation = 'source-over'; xp.globalAlpha = 1; xp.clearRect(0, 0, ML.L, ML.H); xp.globalCompositeOperation = 'lighter';
        var ec2 = E.c, clair = [Math.min(255, ec2[0] + 60), Math.min(255, ec2[1] + 40), Math.min(255, ec2[2] + 90)];
        for (i = 0; i < E.n; i++) if (E.A[i] > 0.05) { lueur(xp, ec2[0], ec2[1], ec2[2], E.X[i], E.Y[i], 7, E.A[i] * 0.8); lueur(xp, clair[0], clair[1], clair[2], E.X[i], E.Y[i], 2.6, E.A[i]); }
      } else if (ML.cP) { ML.cP.remove(); ML.cP = ML.xP = null; }
      var st = ML.st; st.particules = nP + nE; st.dessinees = des; st.ombrees = omb; st.pas = pasL; ML.ms += (maintenant() - t0 - ML.ms) * 0.1;
    }

    var idL = 0;
    ML.api = {
      regler: regler,
      /* une lumière posée par le jeu : lanterne, bougie, feu de camp, fenêtre de kaz... */
      lumiere: function (x, y, q) {
        q = q || {};
        var l = { id: ++idL, x: Number(x) || 0, y: Number(y) || 0, dx: 0, dy: 0, c: couleur(q.couleur, '#FFC46B'), rayon: borne(Number(q.rayon) || 130, 10, 900), force: borne(q.force == null ? 1 : Number(q.force) || 0, 0, 2),
          ombres: q.ombres !== false, scintille: borne(Number(q.scintille) || 0, 0, 0.9), taille: borne(q.taille == null ? 8 : Number(q.taille) || 0, 0, 40), k: q.duree ? 1 : 0, f: 0, fin: q.duree ? Math.max(0.03, q.duree / 1000) : 0, cible: null }; // duree : éclat qui s'éteint tout seul
        ML.lums.push(l);
        var la = {
          deplacer: function (nx, ny) { l.x = nx; l.y = ny; l.cible = null; return la; },
          regler: function (r) { r = r || {}; if (r.couleur) l.c = couleur(r.couleur); if (r.rayon != null) l.rayon = borne(Number(r.rayon) || 130, 10, 900); if (r.force != null) l.force = borne(Number(r.force) || 0, 0, 2); if (r.ombres != null) l.ombres = !!r.ombres; if (r.scintille != null) l.scintille = borne(Number(r.scintille) || 0, 0, 0.9); if (r.taille != null) l.taille = borne(Number(r.taille) || 0, 0, 40); return la; },
          suivre: function (cible, dx, dy) { l.cible = cible || null; l.dx = dx || 0; l.dy = dy || 0; return la; },
          eteindre: function (duree) { l.fin = Math.max(0.01, (duree == null ? 300 : duree) / 1000); return la; },
          position: function () { return [l.x, l.y]; }
        };
        return la;
      },
      /* zone d'ambiance : assombrir (sous-bois, grotte), éclaircir (clairière) ou teinter (intérieur de kaz) */
      zone: function (q) {
        q = q || {};
        var z = { x: Number(q.x) || 0, y: Number(q.y) || 0, l: Number(q.l) || 120, h: Number(q.h) || 120, el: q.element || null, mode: q.mode === 'eclaircir' ? 'eclaircir' : 'assombrir', forme: q.forme === 'ellipse' ? 'ellipse' : 'rect',
          c: couleur(q.couleur, q.mode === 'eclaircir' ? '#FFE9B5' : '#060A18'), force: borne(q.force == null ? 0.5 : Number(q.force) || 0, 0, 1), bord: borne(q.bord == null ? 40 : Number(q.bord) || 0, 0, 300), k: 0, fin: 0 };
        ML.zones.push(z);
        return { regler: function (r) { r = r || {}; ['x', 'y', 'l', 'h'].forEach(function (c) { if (r[c] != null) z[c] = Number(r[c]) || 0; }); if (r.force != null) z.force = borne(Number(r.force) || 0, 0, 1); if (r.couleur) z.c = couleur(r.couleur); return this; },
          retirer: function (duree) { z.fin = Math.max(0.01, (duree == null ? 400 : duree) / 1000); } };
      },
      /* obstacle à la main (jeux en canvas ou three.js, sans éléments HTML) */
      obstacle: function (x, y, l, h) {
        var r = { x: x, y: y, l: l, h: h }; ML.obst.push(r); ML.occT = -1;
        return { deplacer: function (nx, ny) { r.x = nx; r.y = ny; ML.occT = -1; return this; }, retirer: function () { ML.obst = ML.obst.filter(function (q) { return q !== r; }); ML.occT = -1; } };
      },
      /* essaim : des lucioles qui se promènent et éclairent ce qu'elles survolent */
      lucioles: function (n, q) {
        if (n === false || n === 0) { if (ML.ess) ML.ess.fin = 0.8; return ML.api; }
        q = q || {}; n = Math.round(borne(Number(n) || 60, 1, self.opt.support === 'epub' ? 120 : 2000));
        var sz = self.zoneSure(), z = q.zone || {}, E = { n: n, X: new Float32Array(n), Y: new Float32Array(n), G: new Float32Array(n), A: new Float32Array(n), c: couleur(q.couleur, '#D8FF7A'),
          rayon: borne(Number(q.rayon) || 28, 8, 200), force: borne(q.force == null ? 0.45 : Number(q.force) || 0, 0, 2), vit: borne(Number(q.vitesse) || 26, 0, 300), k: 0, fin: 0,
          x1: z.x1 != null ? z.x1 : sz.x1, x2: z.x2 != null ? z.x2 : sz.x2, y1: z.y1 != null ? z.y1 : sz.y1, y2: z.y2 != null ? z.y2 : sz.y2 };
        for (var i = 0; i < n; i++) { E.X[i] = hasard(E.x1, E.x2); E.Y[i] = hasard(E.y1, E.y2); E.G[i] = Math.random(); }
        ML.ess = E; return ML.api;
      },
      etat: function () { var st = ML.st; return { actif: ML.actif, veille: !!ML.dort, profil: ML.niveau, nuit: Math.round(ML.nuit * 100) / 100, lumieres: ML.lums.length, particulesLumineuses: st.particules, dessinees: st.dessinees, budget: ML.budget, unSur: st.pas, ombrees: st.ombrees, obstacles: ML.occ.length, zones: ML.zones.length, sondes: ML.gw * ML.gh, exposition: Math.round(ML.expo * 100) / 100, ms: Math.round(ML.ms * 100) / 100 }; },
      arreter: function (duree) {
        if (!ML.actif) return;
        function fin() { if (self._ml !== ML) return; ML.actif = false; _kwVie.cancelAnimationFrame(ML.raf); if (ML.ro) _kwVie.oublieObserver(ML.ro); _kwVie.oublie(global, 'resize', taille); cL.remove(); cH.remove(); if (ML.cP) ML.cP.remove(); self._ml = null; }
        if (duree) { regler({ nuit: 0, duree: duree }); ML.lums.forEach(function (l) { l.fin = duree / 1000; }); _kwVie.setTimeout(fin, duree + 60); } else fin();
      }
    };
    regler({ nuit: o.nuit == null ? 0.75 : o.nuit, duree: o.duree == null ? 900 : o.duree });
    regler(o); taille();
    _kwVie.ecoute(global, 'resize', taille);
    if (global.ResizeObserver && !this.plein) { ML.ro = _kwVie.observer(taille); ML.ro.observe(this.conteneur); }
    ML.raf = _kwVie.requestAnimationFrame(image);
    return ML.api;
  };

  /* --- Outils typés : une IA (ou un script) pilote KwFX avec des données vérifiées avant d'être jouées --- */
  var TYPES_OUTIL = {
    texte: function (v) { return typeof v === 'string' && v.length > 0; }, nombre: function (v) { return typeof v === 'number' && isFinite(v); },
    booleen: function (v) { return typeof v === 'boolean'; }, couleur: function (v) { return typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v); },
    liste: function (v) { return Array.isArray(v) && v.length > 0; }, objet: function (v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  };
  var NOMS_TYPES = { texte: 'un texte', nombre: 'un nombre', booleen: 'vrai ou faux', couleur: 'une couleur du type #FFB000', liste: 'une liste non vide', objet: 'un objet' };
  var EVTS_OUTIL = ['debut', 'bonne', 'coupe', 'trouve', 'erreur', 'presque', 'clic', 'niveau', 'record', 'pepite', 'victoire', 'defaite'];
  var CLES_ML = {};
  var OUTILS = {
    evenement: { d: 'Signale un moment du jeu ; KwFX choisit les effets, les couleurs et le son', p: { type: 'texte*', x: 'nombre', y: 'nombre', points: 'nombre', couleur: 'couleur', grave: 'booleen', transition: 'booleen' },
      v: function (a) { return EVTS_OUTIL.indexOf(a.type) < 0 ? '« type » doit valoir : ' + EVTS_OUTIL.join(', ') : null; }, f: function (fx, a) { return fx.evenement(a.type, a); } },
    joue: { d: 'Joue un effet précis de la bibliothèque (KwFX.effets) ou un effet manga', p: { nom: 'texte*', x: 'nombre', y: 'nombre', intensite: 'nombre', couleur: 'couleur', texte: 'texte', duree: 'nombre', type: 'texte' },
      v: function (a) { return !EFFETS[a.nom] && ['secousse', 'flash', 'halo', 'banniere', 'texte', 'ralenti', 'lignes', 'impact', 'hitstop', 'onomatopee', 'aura', 'plan', 'aberration', 'transition'].indexOf(a.nom) < 0 ? 'effet inconnu « ' + a.nom + ' » (voir KwFX.effets)' : null; }, f: function (fx, a) { return fx.joue(a.nom, a); } },
    son: { d: 'Joue un bruitage du pack', p: { nom: 'texte*' }, v: function (a) { return NOMS_SONS.indexOf(a.nom) < 0 ? 'son inconnu « ' + a.nom + ' » (voir KwFX.nomsSons)' : null; }, f: function (fx, a) { return fx.son(a.nom); } },
    meteo: { d: 'Change la météo péi ; sans nom, le beau temps revient', p: { nom: 'texte', force: 'nombre' }, v: function (a) { return a.nom && !METEOS[a.nom] ? 'météo inconnue « ' + a.nom + ' »' : null; }, f: function (fx, a) { return fx.meteo(a.nom || null, { force: a.force }); } },
    heure: { d: 'Fait glisser la lumière vers une heure du jour', p: { nom: 'texte*' }, v: function (a) { return !HEURES[a.nom] ? '« nom » doit valoir : ' + Object.keys(HEURES).join(', ') : null; }, f: function (fx, a) { return fx.heure(a.nom); } },
    megaLumieres: { d: 'Allume ou règle l\'éclairage du décor (nuit de 0 à 1) ; actif: false l\'arrête', p: { actif: 'booleen', nuit: 'nombre', ambiance: 'couleur', objets: 'texte', rebond: 'nombre', halo: 'nombre', sol: 'couleur', duree: 'nombre' }, f: function (fx, a) { return a.actif === false ? fx.megaLumieres(false) : fx.megaLumieres(a); } },
    lumiere: { d: 'Pose une lumière ; « cle » permet de la déplacer ou de l\'éteindre plus tard', p: { x: 'nombre*', y: 'nombre*', couleur: 'couleur', rayon: 'nombre', force: 'nombre', scintille: 'nombre', ombres: 'booleen', duree: 'nombre', cle: 'texte' },
      f: function (fx, a) { var l = fx.megaLumieres().lumiere(a.x, a.y, a); if (a.cle) { var t = fx._mlCles = fx._mlCles || {}; if (t[a.cle]) t[a.cle].eteindre(); t[a.cle] = l; } return l; } },
    eteindre: { d: 'Éteint une lumière posée avec une clé', p: { cle: 'texte*', duree: 'nombre' }, f: function (fx, a) { var t = fx._mlCles || {}; if (t[a.cle]) { t[a.cle].eteindre(a.duree); delete t[a.cle]; } } },
    zone: { d: 'Zone d\'ambiance : mode « assombrir » ou « eclaircir », forme « rect » ou « ellipse »', p: { x: 'nombre*', y: 'nombre*', l: 'nombre*', h: 'nombre*', mode: 'texte', forme: 'texte', couleur: 'couleur', force: 'nombre', bord: 'nombre' }, f: function (fx, a) { return fx.megaLumieres().zone(a); } },
    lucioles: { d: 'Lâche un essaim de lucioles ; nombre: 0 les fait partir', p: { nombre: 'nombre*', couleur: 'couleur', rayon: 'nombre', force: 'nombre' }, f: function (fx, a) { return fx.megaLumieres().lucioles(a.nombre, a); } },
    definirSysteme: { d: 'Ajoute un nouvel effet de particules à la bibliothèque (plusieurs couches d\'émetteurs)', p: { nom: 'texte*', couches: 'liste*', titre: 'texte', remplacer: 'booleen' }, f: function (fx, a) { return KwFX.definirSysteme(a.nom, a.couches, { nom: a.titre, remplacer: a.remplacer }); } },
    attendre: { d: 'Attend avant l\'étape suivante', p: { ms: 'nombre*' }, v: function (a) { return a.ms < 0 || a.ms > 60000 ? '« ms » doit être entre 0 et 60000' : null; }, f: function (fx, a) { return new Promise(function (ok) { fx._vie.setTimeout(ok, a.ms); }); } }
  };
  function verifierEtape(e, i, connus) {
    var ou = 'Étape ' + (i + 1);
    if (!TYPES_OUTIL.objet(e) || !TYPES_OUTIL.texte(e.outil)) return ou + ' : il manque « outil »';
    var O = OUTILS[e.outil]; if (!O) return ou + ' : outil inconnu « ' + e.outil + ' » (voir KwFX.outils())';
    ou += ' (' + e.outil + ')';
    for (var k in O.p) { var req = O.p[k].slice(-1) === '*', ty = req ? O.p[k].slice(0, -1) : O.p[k]; if (e[k] == null) { if (req) return ou + ' : il manque « ' + k + ' »'; continue; } if (!TYPES_OUTIL[ty](e[k])) return ou + ' : « ' + k + ' » doit être ' + NOMS_TYPES[ty]; }
    for (var c in e) if (c !== 'outil' && !O.p[c]) return ou + ' : paramètre inconnu « ' + c + ' »';
    if (e.outil === 'definirSysteme') { try { verifierSysteme(e.nom, e.couches); } catch (err) { return ou + ' : ' + err.message; } connus[e.nom] = 1; return null; }
    if (e.outil === 'joue' && connus[e.nom]) return null;
    var m = O.v ? O.v(e) : null; return m ? ou + ' : ' + m : null;
  }
  /* fx.executer([{ outil: 'joue', nom: 'eruption', x: .5, y: .8 }, { outil: 'attendre', ms: 400 }, ...])
   * Tout le plan est vérifié d'abord : s'il y a une erreur, rien n'est joué. x et y entre 0 et 1 = fraction de la zone de jeu. */
  Directeur.prototype.executer = function (plan, o) {
    var self = this; o = o || {};
    if (!Array.isArray(plan)) plan = [plan];
    var erreurs = [], connus = {};
    plan.forEach(function (e, i) { var m = verifierEtape(e, i, connus); if (m) erreurs.push(m); });
    if (erreurs.length || o.verifier) return Promise.resolve({ ok: !erreurs.length, etapes: 0, erreurs: erreurs });
    var i = 0, t = this.taille();
    function suite() {
      if (self._detruit || i >= plan.length) return { ok: true, etapes: i, erreurs: [] };
      var e = plan[i++], a = {}; for (var k in e) if (k !== 'outil') a[k] = e[k];
      if (e.outil !== 'attendre') { if (typeof a.x === 'number' && a.x >= 0 && a.x <= 1) a.x *= t.l; if (typeof a.y === 'number' && a.y >= 0 && a.y <= 1) a.y *= t.h; if (e.outil === 'zone') { if (a.l <= 1) a.l *= t.l; if (a.h <= 1) a.h *= t.h; } }
      var r; try { r = OUTILS[e.outil].f(self, a); } catch (err) { return { ok: false, etapes: i - 1, erreurs: ['Étape ' + i + ' (' + e.outil + ') : ' + err.message] }; }
      return (e.outil === 'attendre' && r && r.then) ? r.then(suite) : suite();
    }
    return Promise.resolve().then(suite);
  };
  /* --- Nouveaux effets de particules décrits par des données (comme un système Niagara écrit par un agent) --- */
  var TYPES_COUCHE = { nb: 'n', debit: 'n', delai: 'n', frein: 'n', gravite: 'n', rayon: 'n', opacite: 'n', variation: 'n', etale: 'n', etirement: 'n', couche: 'n', fixe: 'b', radial: 'b', scintille: 'b', vie: 'p', taille: 'p', vitesse: 'p', rotation: 'p', rotVitesse: 'p', hauteur: 'p', cone: 'a', alphaVie: 'a', tailleVie: 'a', couleurVie: 'a' };
  function verifierSysteme(nom, couches) {
    if (!TYPES_OUTIL.texte(nom) || !/^[a-zA-Z][a-zA-Z0-9]{1,31}$/.test(nom)) throw new Error('le nom d\'un effet doit faire 2 à 32 lettres ou chiffres, sans espace ni accent');
    if (!Array.isArray(couches) || !couches.length || couches.length > 8) throw new Error('un effet a de 1 à 8 couches');
    var avert = [];
    couches.forEach(function (e, i) {
      var ou = 'couche ' + (i + 1);
      if (!TYPES_OUTIL.objet(e)) throw new Error(ou + ' : doit être un objet');
      if (e.sprite != null && SPRITES[e.sprite] == null) throw new Error(ou + ' : forme inconnue « ' + e.sprite + ' » (' + Object.keys(SPRITES).join(', ') + ')');
      if (e.melange != null && e.melange !== 'add') throw new Error(ou + ' : « melange » ne peut valoir que \'add\'');
      if (e.zone != null && ['point', 'cercle', 'anneau', 'ligne', 'ecran', 'ecran-haut', 'ecran-bas', 'ecran-bas-sur'].indexOf(e.zone) < 0) throw new Error(ou + ' : zone inconnue « ' + e.zone + ' »');
      if (!(e.nb > 0) && !(e.debit > 0)) throw new Error(ou + ' : il faut « nb » (nombre de particules)');
      if (e.nb > 400) throw new Error(ou + ' : « nb » ne dépasse pas 400 par couche');
      for (var k in e) {
        var ty = TYPES_COUCHE[k], v = e[k]; if (!ty) continue;
        if (ty === 'n' && !TYPES_OUTIL.nombre(v)) throw new Error(ou + ' : « ' + k + ' » doit être un nombre');
        if (ty === 'b' && typeof v !== 'boolean') throw new Error(ou + ' : « ' + k + ' » doit valoir vrai ou faux');
        if (ty === 'p' && !(TYPES_OUTIL.nombre(v) || (Array.isArray(v) && v.length === 2 && TYPES_OUTIL.nombre(v[0]) && TYPES_OUTIL.nombre(v[1])))) throw new Error(ou + ' : « ' + k + ' » doit être un nombre ou [mini, maxi]');
        if (ty === 'a' && !Array.isArray(v)) throw new Error(ou + ' : « ' + k + ' » doit être une liste');
      }
      if (e.vie && (Array.isArray(e.vie) ? e.vie[1] : e.vie) > 12) avert.push(ou + ' : une vie de plus de 12 s charge l\'écran');
    });
    return avert;
  }
  var KwFX_definirSysteme = function (nom, couches, o) {
    o = o || {};
    var avert = verifierSysteme(nom, couches);
    if (SYSTEMES[nom] && !SYSTEMES[nom]._perso) throw new Error('« ' + nom + ' » est un effet de base de KwFX : choisis un autre nom');
    if (SYSTEMES[nom] && !o.remplacer) throw new Error('« ' + nom + ' » existe déjà (remplacer: true pour le redéfinir)');
    var v = SYSTEMES[nom] ? SYSTEMES[nom]._v + 1 : 1, sys = couches.map(function (e) { var c = {}; for (var k in e) c[k] = e[k]; return c; });
    sys._perso = true; sys._v = v; SYSTEMES[nom] = sys;
    EFFETS[nom] = { nom: o.nom || nom, perso: true, f: function (m, x, y, k, q) { m.systeme(nom, x, y, k, q); } };
    return { ok: true, nom: nom, couches: sys.length, avertissements: avert };
  };
  /* conseil d'éclairage ajouté aux propositions du conseiller */
  function conseilLumiere(q) {
    var petit = q.public === 'petit', epub = q.support === 'epub', sombre = { volcan: 1, mystere: 1, noel: 1 }[q.theme], nuit = sombre ? (petit ? 0.35 : q.mode === 'probleme' ? 0.8 : 0.65) : 0;
    var coul = { volcan: '#FF7A2E', mystere: '#B79CFF', noel: '#FFD27A', lagon: '#BFF3FF', lontan: '#FFC46B' }[q.theme] || '#FFE9B5';
    var texte = sombre ? 'Décor plongé dans la pénombre (nuit ' + Math.round(nuit * 100) + ' %) : chaque braise, étincelle ou étoile éclaire vraiment le décor, et une lumière suit l\'action.'
      : 'Décor de jour : pas de nuit, mais une zone claire sur la zone de jeu et des zones d\'ombre douce sous les arbres ou la varangue.';
    if (petit) texte += ' Pour les 3-6 ans, jamais de noir complet.';
    if (epub) texte += ' En EPUB, profil léger automatique et repli .kwfx-veillee sans JavaScript.';
    return { nuit: nuit, couleur: coul, conseil: texte,
      code: sombre ? "const ml = fx.megaLumieres({ nuit: " + nuit + ", objets: '.decor' });\nconst lampe = ml.lumiere(x, y, { couleur: '" + coul + "', scintille: .2 });" : "const ml = fx.megaLumieres({ nuit: 0 });\nml.zone({ element: sousBois, force: .35 });" };
  }

  /* ======================================================================
   * 8. API PUBLIQUE
   * ==================================================================== */
  var KwFX = {
    version: '4.2', heures: Object.keys(HEURES), apparitions: Object.keys(APPARITIONS), meteos: METEOS, stylesMusique: STYLES_MUSIQUE,
    init: function (opt) { var fx = Object.create(Directeur.prototype); try { Directeur.call(fx, opt); return fx; } catch (e) { if (fx._vie) fx.detruire(); throw e; } },
    conseiller: function (q) { var c = KwFX_conseiller(q); c.lumiere = conseilLumiere(q || {}); return c; },
    profil: function () { var p = profil(), c = {}; for (var k in p) c[k] = p[k]; return c; },
    outils: function () { return Object.keys(OUTILS).map(function (n) { var P = {}; Object.keys(OUTILS[n].p).forEach(function (k) { var t = OUTILS[n].p[k], r = t.slice(-1) === '*'; P[k] = { type: r ? t.slice(0, -1) : t, requis: r }; }); return { outil: n, description: OUTILS[n].d, parametres: P }; }); },
    definirSysteme: function (nom, couches, o) { return KwFX_definirSysteme(nom, couches, o); },
    nomsSons: NOMS_SONS, onomatopees: ONOMATOPEES, collection: COLLECTION, defis: DEFIS, transitions: ['vague', 'lave', 'cyclone', 'pailleenqueue'],
    themes: THEMES, effets: EFFETS, types: TYPES, publics: PUBLICS, modes: MODES, messages: MESSAGES,
    /* Bloque la propagation des touchers sur les zones interactives (règle EPUB Kwélafé) */
    proteger: function (racine) {
      racine = racine || document.body;
      function touche(event) { var el = event.target; if (el && el.closest && el.closest('.zone-interactive')) event.stopPropagation(); }
      racine.addEventListener('touchend', touche, { passive: true });
      return function () { racine.removeEventListener('touchend', touche); };
    }
  };

  /* ======================================================================
   * RIVIÈRE (intégrée en v4.2 depuis Bichik Rush v4) : l'eau vue de dessus, gérée par KwFX
   *  Le décor (image PNG/WebP dont la rivière est TRANSPARENTE) se pose AU-DESSUS ; KwFX dessine l'eau EN DESSOUS :
   *  courant, lit de galets, caustiques, reflets du soleil et du ciel, reflet des berges, écume le long des berges et des rochers,
   *  ondulations qui se propagent, crue (eau trouble et rapide), brume du matin. Les berges peu profondes sont déduites de l'alpha du décor.
   *
   *    const riv = fx.riviere({ decor: 'decor-portrait.webp' });         // le canvas d'eau passe sous tout le reste de la page
   *    riv.onde(x, y, 0.6);                    // un rond qui grandit (x, y en pixels)
   *    riv.sillage(x1, y1, x2, y2, 0.3);       // sillage d'un objet qui glisse (doigt, vouve, poisson)
   *    riv.obstacles([{ x, y, r }, ...]);      // rochers : écume autour, ombre sur le lit, sillage en aval (12 au plus)
   *    riv.crue(1, 3500);                      // eau trouble et rapide pendant 3,5 s
   *    riv.ambiance('matin' | 'jour' | 'soir' | 'nuit')   // lumière de KwFX + couleur de l'eau
   *    riv.palette({ peu: '#5CE0C8', profond: '#0B6A78', ciel: '#BFE3FF' }) ; riv.courant(0.35) ; riv.brume(0.5) ; riv.decor('autre.webp')
   * ==================================================================== */
  var RIV_AMBIANCES = {
    matin: { peu: [0.36, 0.92, 0.84], profond: [0.04, 0.5, 0.58], ciel: [1.0, 0.88, 0.7], brume: 0.12, expo: 1.08 },
    jour: { peu: [0.26, 0.92, 0.86], profond: [0.02, 0.52, 0.64], ciel: [0.78, 0.92, 1.0], brume: 0.0, expo: 1.1 },
    soir: { peu: [0.62, 0.78, 0.66], profond: [0.08, 0.28, 0.36], ciel: [1.0, 0.6, 0.36], brume: 0.15, expo: 0.9 },
    nuit: { peu: [0.12, 0.34, 0.42], profond: [0.01, 0.08, 0.2], ciel: [0.3, 0.4, 0.7], brume: 0.1, expo: 0.55 }
  };
  var RIV_VS = 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }';
  var RIV_FS = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uT; uniform sampler2D uDecor; uniform sampler2D uOnde; uniform vec4 uCover; uniform float uDecorOk;',
    'uniform vec2 uFlow; uniform float uCur; uniform vec3 uSun; uniform vec3 uPeu; uniform vec3 uProf; uniform vec3 uCiel; uniform float uTrouble; uniform float uBrume; uniform float uExpo;',
    'uniform vec4 uObs[12]; uniform vec2 uTexel;',
    'float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y); }',
    'float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.03 + vec2(7.1, 3.7); a *= 0.5; } return s; }',
    'vec2 toDecor(vec2 uv) { return uv * uCover.xy + uCover.zw; }',
    'float hgt(vec2 p, float t) { vec2 f = uFlow * t; return fbm(p * 3.0 - f) * 0.55 + fbm(p * vec2(7.0, 9.0) - f * 1.7 + 3.1) * 0.32; }',
    'vec3 lit(vec2 p) {',
    '  vec2 g = p * 17.0; vec2 i = floor(g), f = fract(g); float md = 8.0; vec2 mid = i;',
    '  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 b = vec2(float(x), float(y)); vec2 r = b + vec2(hash(i + b), hash(i + b + 7.7)) - f; float d = dot(r, r); if (d < md) { md = d; mid = i + b; } }',
    '  float h1 = hash(mid); vec3 col = mix(vec3(0.46, 0.41, 0.31), vec3(0.18, 0.2, 0.19), h1); col = mix(col, vec3(0.68, 0.6, 0.45), step(0.82, hash(mid + 3.3)));',
    '  col *= 0.5 + 0.7 * (1.0 - smoothstep(0.0, 0.62, sqrt(md))); col = mix(col, vec3(0.7, 0.64, 0.5), fbm(p * 2.2) * 0.35); return col; }',
    'float caus(vec2 p) { vec2 uv = mod(p * 6.28318 * 0.9, 6.28318) - 250.0; vec2 i = uv; float c = 1.0; float inten = 0.005; float tt = uT * 0.5 + 23.0;',
    '  for (int n = 0; n < 4; n++) { float t2 = tt * (1.0 - (3.5 / float(n + 1))); i = uv + vec2(cos(t2 - i.x) + sin(t2 + i.y), sin(t2 - i.y) + cos(t2 + i.x)); c += 1.0 / length(vec2(uv.x / (sin(i.x + t2) / inten), uv.y / (cos(i.y + t2) / inten))); }',
    '  c /= 4.0; c = 1.17 - pow(c, 1.4); return clamp(pow(abs(c), 8.0), 0.0, 1.0); }',
    'float proche(vec2 uv, float asp) { if (uDecorOk < 0.5) return 0.0; float a = 0.0; vec2 k = vec2(1.0 / asp, 1.0);',
    '  for (int i = 0; i < 8; i++) { float ang = float(i) * 0.785; vec2 d = vec2(cos(ang), sin(ang)) * k; a += texture2D(uDecor, toDecor(uv + d * 0.03)).a; a += texture2D(uDecor, toDecor(uv + d * 0.08)).a * 0.7; }',
    '  return clamp(a / 13.6 * 1.9, 0.0, 1.0); }',
    'void main() {',
    '  vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y); float asp = uRes.x / uRes.y; vec2 p = vec2(uv.x * asp, uv.y);',
    '  float near = proche(uv, asp); float depth = smoothstep(0.0, 0.75, 1.0 - near);',
    '  float e = 0.004; float h0 = hgt(p, uCur), hx = hgt(p + vec2(e, 0.0), uCur), hy = hgt(p + vec2(0.0, e), uCur);',
    '  vec3 n = normalize(vec3((h0 - hx) * 0.9, (h0 - hy) * 0.9, 0.12));',
    '  float r0 = texture2D(uOnde, uv).r * 2.0 - 1.0; float rx = texture2D(uOnde, uv + vec2(uTexel.x, 0.0)).r - texture2D(uOnde, uv - vec2(uTexel.x, 0.0)).r; float ry = texture2D(uOnde, uv + vec2(0.0, uTexel.y)).r - texture2D(uOnde, uv - vec2(0.0, uTexel.y)).r;',
    '  n.xy -= vec2(rx, ry) * 1.6; n = normalize(n);',
    '  vec2 off = n.xy * (0.05 + 0.04 * (1.0 - depth)) ; vec3 bed = lit(p + off + uFlow * 0.0);',
    '  vec3 wcol = mix(uPeu, uProf, depth * 0.88);',
    '  float clair = mix(0.95, 0.55, depth);',
    '  vec3 col = mix(wcol, bed * uPeu * 1.7, clair * 0.7);',
    '  col += caus(p + off * 2.0) * vec3(0.55, 0.85, 0.75) * (1.0 - depth * 0.65) * (0.6 + uSun.z * 2.2);',
    '  float foam = 0.0; float shade = 0.0;',
    '  for (int i = 0; i < 12; i++) { vec4 o = uObs[i]; if (o.z > 0.0) { vec2 q = p - o.xy; float d = length(q) - o.z;',
    '    float ring = smoothstep(0.075, 0.0, d); foam += ring * (0.45 + 0.55 * noise(p * 26.0 + vec2(0.0, uT * 1.6)));',
    '    float below = clamp(q.y, 0.0, 1.0); float wake = exp(-below * 5.5) * exp(-pow(q.x / (o.z * (1.0 + below * 2.2) + 0.012), 2.0)) * step(0.0, q.y);',
    '    foam += wake * 0.55 * (0.4 + 0.6 * noise(p * vec2(18.0, 9.0) - uFlow * uCur * 6.0));',
    '    float sd = length(p - o.xy - vec2(0.012, 0.022)) - o.z; shade += smoothstep(0.07, 0.0, sd) * 0.3; } }',
    '  col *= 1.0 - shade;',
    '  float bf = smoothstep(0.5, 0.92, near) * (0.35 + 0.65 * fbm(p * vec2(22.0, 14.0) + vec2(0.0, uT * 0.5)));',
    '  foam += bf * 0.85 + smoothstep(0.55, 0.95, abs(r0)) * 0.5;',
    '  // reflet de la végétation et des rochers des berges (le décor se mire dans l\'eau, surtout près du bord)',
    '  if (uDecorOk > 0.5) { vec2 dir = vec2(sign(0.5 - uv.x) * 0.045 / asp, 0.0); vec4 rf = texture2D(uDecor, toDecor(uv + dir + n.xy * 0.06)); col = mix(col, rf.rgb * 0.55 + uPeu * 0.15, rf.a * 0.34 * (0.35 + 0.65 * (1.0 - depth))); }',
    '  vec3 L = normalize(vec3(uSun.x * 0.55, uSun.y * 0.55, 0.75)); vec3 Hh = normalize(L + vec3(0.0, 0.0, 1.0));',
    '  float spec = pow(max(dot(n, Hh), 0.0), 160.0) * (0.4 + uSun.z * 7.0); spec *= 0.6 + 0.8 * noise(p * 40.0 + uT * 0.8);',
    '  float fres = 0.1 + 0.55 * pow(1.0 - max(n.z, 0.0), 2.2);',
    '  col = mix(col, uCiel, clamp(fres * 0.4, 0.0, 0.5)); col += uCiel * spec;',
    '  col = mix(col, vec3(0.56, 0.4, 0.26) * (0.65 + 0.35 * fbm(p * 3.0 + uT * 0.2)), uTrouble * 0.88);',
    '  foam *= 1.0 + uTrouble * 0.8;',
    '  col = mix(col, vec3(0.97, 1.0, 1.0), clamp(foam, 0.0, 1.0) * 0.88);',
    '  col = mix(col, uCiel, uBrume * 0.42 * (0.5 + 0.5 * fbm(p * 2.0 + uT * 0.05)));',
    '  col *= uExpo;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  Directeur.prototype.riviere = function (o) {
    o = o || {}; var self = this;
    if (this._riv) { this._riv.arreter(); this._riv = null; }
    if (o.actif === false) return this;
    var cont = o.conteneur || this.conteneur, plein = this.plein;
    var c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:' + (plein ? 'fixed' : 'absolute') + ';left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + (o.z == null ? 0 : o.z) + ';background:#0b6a78';
    cont.insertBefore(c, cont.firstChild);
    var gl = null; try { gl = c.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: !!o.test, powerPreference: 'high-performance' }); } catch (e) { gl = null; }
    var vide = { onde: function () { }, sillage: function () { }, obstacles: function () { }, crue: function () { }, ambiance: function () { return vide; }, palette: function () { return vide; }, courant: function () { return vide; }, brume: function () { return vide; }, decor: function () { return vide; }, echelle: function () { return vide; }, etat: function () { return { webgl: false }; }, arreter: function () { c.remove(); } };
    if (!gl) { this._riv = vide; return vide; }
    function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (global.console) console.warn('KwFX rivière :', gl.getShaderInfoLog(s)); return null; } return s; }
    var vs = shader(gl.VERTEX_SHADER, RIV_VS), fs = shader(gl.FRAGMENT_SHADER, RIV_FS), pg = gl.createProgram();
    if (!vs || !fs) { this._riv = vide; return vide; }
    gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg); gl.useProgram(pg);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pg, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uRes', 'uT', 'uDecor', 'uOnde', 'uCover', 'uDecorOk', 'uFlow', 'uCur', 'uSun', 'uPeu', 'uProf', 'uCiel', 'uTrouble', 'uBrume', 'uExpo', 'uObs', 'uTexel'].forEach(function (k) { U[k] = gl.getUniformLocation(pg, k); });
    function tex(unit) { var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); return t; }
    var tDecor = tex(0), tOnde = tex(1);
    gl.activeTexture(gl.TEXTURE0); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.uniform1i(U.uDecor, 0); gl.uniform1i(U.uOnde, 1);

    var R = { actif: true, t: 0, dpr: 1, L: 1, H: 1, ech: o.echelle || (global.innerWidth < 600 ? 0.5 : 0.7), echMax: o.echelle || (global.innerWidth < 600 ? 0.6 : 0.85), ema: 16, dernier: 0, derEch: 0,
      courant: o.courant == null ? 0.35 : o.courant, flow: 0.35, trouble: 0, troubleC: 0, tCrue: 0, brume: 0, brumeC: 0, expo: 1, decorOk: 0, imgA: 1, obs: new Float32Array(48), GW: 64, GH: 96, A: null, B: null, bytes: null };
    var pal = { peu: RIV_AMBIANCES.jour.peu.slice(), profond: RIV_AMBIANCES.jour.profond.slice(), ciel: RIV_AMBIANCES.jour.ciel.slice() }, palC = { peu: pal.peu.slice(), profond: pal.profond.slice(), ciel: pal.ciel.slice() };
    function rgbN(h) { var v = versRgb(h); return [v[0] / 255, v[1] / 255, v[2] / 255]; }
    function grille() { R.GW = 64; R.GH = borne(Math.round(R.GW * R.H / R.L), 40, 150); R.A = new Float32Array(R.GW * R.GH); R.B = new Float32Array(R.GW * R.GH); R.bytes = new Uint8Array(R.GW * R.GH); }
    function redim() {
      var t = self.plein && cont === self.conteneur ? { l: global.innerWidth, h: global.innerHeight } : { l: cont.clientWidth || global.innerWidth, h: cont.clientHeight || global.innerHeight };
      R.L = Math.max(1, t.l); R.H = Math.max(1, t.h); R.dpr = Math.min(2, global.devicePixelRatio || 1);
      c.width = Math.max(2, Math.round(R.L * R.dpr * R.ech)); c.height = Math.max(2, Math.round(R.H * R.dpr * R.ech)); gl.viewport(0, 0, c.width, c.height); grille(); couvre();
    }
    function couvre() { // même cadrage que « object-fit: cover ; object-position: center bottom » du décor
      var sa = R.L / R.H, ia = R.imgA, sx = 1, sy = 1, ox = 0, oy = 0;
      if (sa > ia) { sy = ia / sa; oy = 1 - sy; } else { sx = sa / ia; ox = (1 - sx) / 2; }
      gl.uniform4f(U.uCover, sx, sy, ox, oy);
    }
    function charge(src) {
      var im = new Image(); im.onload = function () {
        R.imgA = im.naturalWidth / im.naturalHeight; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tDecor); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im); R.decorOk = 1; couvre();
      }; im.src = src;
    }
    if (o.decor) charge(o.decor);
    redim();
    function onde(x, y, force, rayon) {
      force = force == null ? 0.5 : force; var gx = x / R.L * R.GW, gy = y / R.H * R.GH, r = rayon || 1.6;
      if (!isFinite(gx) || !isFinite(gy) || gx < -8 || gy < -8 || gx > R.GW + 8 || gy > R.GH + 8) return;
      for (var j = Math.floor(gy - r - 1); j <= Math.ceil(gy + r + 1); j++) for (var i = Math.floor(gx - r - 1); i <= Math.ceil(gx + r + 1); i++) {
        if (i < 1 || j < 1 || i >= R.GW - 1 || j >= R.GH - 1) continue; var d = Math.hypot(i - gx, j - gy); if (d > r + 1) continue;
        R.A[j * R.GW + i] -= force * Math.exp(-d * d / (r * r * 0.7));
      }
    }
    function sillage(x1, y1, x2, y2, force) {
      var d = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(d / 18));
      for (var k = 0; k <= n; k++) onde(x1 + (x2 - x1) * k / n, y1 + (y2 - y1) * k / n, (force == null ? 0.3 : force) / (1 + n * 0.25), 1.3);
    }
    function pasOndes() {
      var A = R.A, B = R.B, W = R.GW, Hh = R.GH;
      for (var j = 1; j < Hh - 1; j++) for (var i = 1; i < W - 1; i++) { var k = j * W + i; var n = (A[k - 1] + A[k + 1] + A[k - W] + A[k + W]) * 0.5 - B[k]; B[k] = n * 0.987; }
      R.A = B; R.B = A;
      var d = R.A, by = R.bytes; for (var q = 0; q < d.length; q++) { var v = d[q]; by[q] = 128 + (v > 1 ? 1 : v < -1 ? -1 : v) * 127; }
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tOnde); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, W, Hh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, by);
    }
    function obstacles(liste) {
      R.obs.fill(0); var n = Math.min(12, (liste || []).length);
      for (var i = 0; i < n; i++) { var q = liste[i]; R.obs[i * 4] = q.x / R.H; R.obs[i * 4 + 1] = q.y / R.H; R.obs[i * 4 + 2] = q.r / R.H; R.obs[i * 4 + 3] = 0; }
    }
    function majPalette(dt) {
      var k = 1 - Math.exp(-dt * 1.4); ['peu', 'profond', 'ciel'].forEach(function (n) { for (var i = 0; i < 3; i++) palC[n][i] += (pal[n][i] - palC[n][i]) * k; });
      R.brumeC += (R.brume - R.brumeC) * k; R.expoC = (R.expoC == null ? R.expo : R.expoC) + (R.expo - (R.expoC == null ? R.expo : R.expoC)) * k;
    }
    function boucle(now) {
      if (!R.actif) return; R.raf = requestAnimationFrame(boucle);
      var dt = Math.min(0.05, (now - (R.dernier || now)) / 1000); R.dernier = now; if (document.hidden) return;
      if (self.enPause) dt = 0;
      R.ema += (dt * 1000 - R.ema) * 0.05; R.t += dt;
      if (dt > 0 && now - R.derEch > 2000) { if (R.ema > 30 && R.ech > 0.38) { R.ech *= 0.85; R.derEch = now; redim(); } else if (R.ema < 15 && R.ech < R.echMax) { R.ech = Math.min(R.echMax, R.ech * 1.1); R.derEch = now; redim(); } }
      if (R.tCrue > 0) { R.tCrue -= dt; if (R.tCrue <= 0) R.troubleC = 0; }
      R.trouble += (R.troubleC - R.trouble) * (1 - Math.exp(-dt * (R.troubleC > R.trouble ? 3.5 : 0.9)));
      R.flow += (R.courant * (1 + R.trouble * 1.6) - R.flow) * (1 - Math.exp(-dt * 2));
      R.cur = (R.cur || 0) + R.flow * dt; majPalette(dt);
      if (!self.enPause) { pasOndes(); if (dt > 0.024) pasOndes(); }
      var lu = self.lum || { angle: 135, force: 0.3 }, a = lu.angle * Math.PI / 180;
      gl.uniform2f(U.uRes, c.width, c.height); gl.uniform1f(U.uT, R.t); gl.uniform1f(U.uDecorOk, R.decorOk);
      gl.uniform2f(U.uFlow, 0, 1); gl.uniform1f(U.uCur, R.cur); // le courant descend vers le bas de l'écran
      gl.uniform3f(U.uSun, Math.cos(a), -Math.sin(a), lu.force == null ? 0.3 : lu.force);
      gl.uniform3f(U.uPeu, palC.peu[0], palC.peu[1], palC.peu[2]); gl.uniform3f(U.uProf, palC.profond[0], palC.profond[1], palC.profond[2]); gl.uniform3f(U.uCiel, palC.ciel[0], palC.ciel[1], palC.ciel[2]);
      gl.uniform1f(U.uTrouble, R.trouble); gl.uniform1f(U.uBrume, R.brumeC); gl.uniform1f(U.uExpo, R.expoC);
      gl.uniform4fv(U.uObs, R.obs); gl.uniform2f(U.uTexel, 1 / R.GW, 1 / R.GH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    var api = {
      onde: onde, sillage: sillage, obstacles: obstacles,
      crue: function (k, ms) { R.troubleC = borne(k == null ? 1 : k, 0, 1); R.tCrue = (ms || 3500) / 1000; return api; },
      ambiance: function (nom) { var a = RIV_AMBIANCES[nom] || RIV_AMBIANCES.jour; pal.peu = a.peu.slice(); pal.profond = a.profond.slice(); pal.ciel = a.ciel.slice(); R.brume = a.brume; R.expo = a.expo; if (self.heure) try { self.heure(nom === 'jour' ? 'midi' : nom); } catch (e) { } return api; },
      palette: function (p) { if (p.peu) pal.peu = rgbN(p.peu); if (p.profond) pal.profond = rgbN(p.profond); if (p.ciel) pal.ciel = rgbN(p.ciel); return api; },
      courant: function (v) { R.courant = v; return api; }, brume: function (v) { R.brume = borne(v, 0, 1); return api; },
      decor: function (src) { charge(src); return api; }, echelle: function (v) { R.ech = R.echMax = v; redim(); return api; },
      etat: function () { return { webgl: true, echelle: +R.ech.toFixed(2), msImage: +R.ema.toFixed(1), decor: !!R.decorOk, trouble: +R.trouble.toFixed(2) }; },
      redimensionner: redim,
      arreter: function () { R.actif = false; cancelAnimationFrame(R.raf); global.removeEventListener('resize', redim); c.remove(); }
    };
    global.addEventListener('resize', redim);
    R.expoC = R.expo; R.raf = requestAnimationFrame(boucle);
    this._riv = api; return api;
  };

  /* ======================================================================
   * 9. NUIT 3D (v4.2 « Lamèr ») : pour les jeux three.js
   *    fx.mer3d  : la mer dessinée par le moteur. Elle reflète vraiment la scène (feux, lune, ville),
   *                avec vagues en perspective, traînées de lumière, scintillement et ondes.
   *    fx.ciel3d : ciel de nuit, étoiles, lune et quelques nuages au loin, éclairés par les feux.
   * ==================================================================== */
  var GLSL_BRUIT = [
    'float kwH(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }',
    'float kwN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);',
    '  return mix(mix(kwH(i), kwH(i + vec2(1.0, 0.0)), f.x), mix(kwH(i + vec2(0.0, 1.0)), kwH(i + vec2(1.0, 1.0)), f.x), f.y); }',
    'float kwF(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * kwN(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; } return s / 0.9375; }'
  ].join('\n');
  var GLSL_SOMMET = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  var GLSL_SORTIE = '\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n';

  var GLSL_MER = [
    'precision highp float;',
    '#define NB_ONDES 6',
    'uniform sampler2D tReflet; uniform vec2 uRes; uniform float uLigne, uT, uK, uAgit, uReflet, uAspect, uScint;',
    'uniform vec3 uFond, uBrume, uEclair; uniform vec4 uOndes[NB_ONDES];',
    GLSL_BRUIT,
    // coordonnées « au sol » : loin = serré, près = large (perspective d\'un plan d\'eau)
    'vec3 kwSol(vec2 s){ float dd = max(0.0, (uLigne - s.y) / max(uLigne, 0.001)); float z = 1.0 / (dd + 0.035); return vec3((s.x - 0.5) * uAspect * z, z, dd); }',
    'float kwHaut(vec2 g, float a1, float a2, float a3){',
    '  return kwN(g + vec2(uT * 0.35, uT * 0.55)) * 0.55 * a1 + kwN(g * 2.7 + vec2(-uT * 0.5, uT * 0.9)) * 0.30 * a2 + kwN(g * 6.1 + vec2(uT * 0.8, -uT * 1.3)) * 0.15 * a3; }',
    'void main(){',
    '  vec2 s = gl_FragCoord.xy / uRes; vec3 sol = kwSol(s); float dd = sol.z, z = sol.y; vec2 g = sol.xy * 14.0;',
    // on efface les vagues trop fines pour l\'écran (sinon ça fourmille au loin)
    '  float fy = 14.0 * z * z / (max(uLigne, 0.001) * uRes.y);',
    '  float a1 = clamp(0.7 / fy, 0.0, 1.0), a2 = clamp(0.7 / (fy * 2.7), 0.0, 1.0), a3 = clamp(0.7 / (fy * 6.1), 0.0, 1.0);',
    '  float e = 0.16, h0 = kwHaut(g, a1, a2, a3);',
    '  vec2 pente = vec2(kwHaut(g + vec2(e, 0.0), a1, a2, a3) - h0, kwHaut(g + vec2(0.0, e), a1, a2, a3) - h0) / e;',
    // au loin : fines rides horizontales
    '  float loin = kwN(vec2(s.x * uAspect * 70.0 + uT * 0.4, z * 1.7 + uT * 0.22)) - 0.5; pente += vec2(loin * 0.5, loin * 1.4) * (1.0 - a2);',
    // ondes rondes (départ de fusée, plouf)
    '  for (int i = 0; i < NB_ONDES; i++) { vec4 o = uOndes[i]; if (o.w <= 0.0) continue;',
    '    vec3 c = kwSol(o.xy); vec2 dv = sol.xy - c.xy; float dist = length(dv) + 1e-4, front = o.z * 0.11 * (0.6 + 0.4 * c.y);',
    '    float env = exp(-pow((dist - front) / (0.035 + o.z * 0.012), 2.0)) * o.w * max(0.0, 1.0 - o.z / 3.2);',
    '    pente += (dv / dist) * sin((dist - front) * 95.0) * env * 2.2; }',
    '  pente *= uAgit;',
    '  float dev = 0.010 + 0.085 * dd;',
    '  vec2 r0 = vec2(s.x + pente.x * dev * 0.35, uLigne + (uLigne - s.y) * uK + pente.y * dev * 0.9);',
    '  float jit = kwH(gl_FragCoord.xy + fract(uT) * 91.7) - 0.5, pas = (0.005 + 0.034 * dd) * (0.6 + 0.4 * uAgit);',
    '  vec3 refl = vec3(0.0);',
    '  for (int j = 0; j < 5; j++) { float fj = float(j) - 2.0 + jit; float w = j == 2 ? 0.30 : (j == 1 || j == 3) ? 0.22 : 0.13;',
    '    vec2 r = r0 + vec2(pente.x * fj * 0.0015, fj * pas); r.y = clamp(r.y, uLigne + 0.002, 0.999); r.x = clamp(r.x, 0.001, 0.999);',
    '    refl += texture2D(tReflet, r).rgb * w; }',
    '  float F = mix(0.34, 0.80, pow(1.0 - dd, 3.0));',
    '  refl = refl / (1.0 + 0.35 * max(refl.r, max(refl.g, refl.b)));',   // le reflet reste plus doux que le feu, et garde sa couleur
    '  vec3 col = uFond * (1.0 - 0.45 * F) * (0.75 + 0.5 * h0) + refl * F * uReflet;',
    // les crêtes accrochent la lumière qu\'elles reflètent : la mer scintille sous les feux et sous la lune
    '  float sc = pow(max(0.0, kwN(g * 7.0 + vec2(uT * 1.7, -uT * 2.3)) * kwN(g * 4.3 - vec2(uT * 1.1, uT * 0.6)) * 1.7), 5.0) * a2;',
    '  col += min(refl, vec3(1.2)) * sc * 1.5 * uScint;',
    '  col += uEclair * (0.012 + 0.03 * (1.0 - dd));',
    '  col = mix(col, uBrume, smoothstep(0.035, 0.0, dd) * 0.45);',
    '  col += (kwH(gl_FragCoord.xy) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(max(col, 0.0), 1.0);',
    GLSL_SORTIE, '}'
  ].join('\n');

  Directeur.prototype.mer3d = function (o) {
    o = o || {}; var T = o.THREE, rd = o.renderer, scene = o.scene, cam = o.camera, self = this;
    if (!T || !rd || !scene || !cam) throw new Error('KwFX.mer3d : il faut THREE, renderer, scene et camera');
    var niv = profil().niveau, ech = o.echelle || (niv === 'leger' ? 0.4 : niv === 'moyen' ? 0.5 : 0.6), mort = false;
    var cible = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true });
    var ondes = []; for (var i = 0; i < 6; i++) ondes.push(new T.Vector4(0, 0, 0, 0));
    var U = {
      tReflet: { value: cible.texture }, uRes: { value: new T.Vector2(1, 1) }, uLigne: { value: 0.4 }, uT: { value: 0 }, uK: { value: 1 },
      uAgit: { value: o.agitation == null ? 1 : o.agitation }, uReflet: { value: o.reflet == null ? 1 : o.reflet }, uScint: { value: o.scintillement == null ? 1 : o.scintillement }, uAspect: { value: 1 },
      uFond: { value: new T.Color(o.fond || '#050d24') }, uBrume: { value: new T.Color(o.brume || '#1b2a55') }, uEclair: { value: new T.Color(0, 0, 0) }, uOndes: { value: ondes }
    };
    var mat = new T.ShaderMaterial({ uniforms: U, vertexShader: GLSL_SOMMET, fragmentShader: GLSL_MER, depthWrite: false });
    var mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat); mesh.frustumCulled = false; mesh.renderOrder = o.ordre == null ? -2 : o.ordre; scene.add(mesh);
    var haut = 0, zPlan = 0, compression = o.compression || 0, eclairF = 0, eclairC = new T.Color(0, 0, 0), tmp = new T.Vector3(), taille = new T.Vector2(), dernier = 0, iOnde = 0, cacher = o.cacher || [];
    var mer = {
      mesh: mesh, cible: cible, uniforms: U,
      /* place le plan d'eau : haut = hauteur (monde) de la ligne d'eau, bas = bord inférieur, z = profondeur */
      placer: function (p) { haut = p.haut; zPlan = p.z || 0; var h = Math.max(0.01, p.haut - p.bas); mesh.scale.set(p.largeur, h, 1); mesh.position.set(p.x || 0, p.haut - h / 2, zPlan); return mer; },
      regler: function (r) { r = r || {}; if (r.agitation != null) U.uAgit.value = r.agitation; if (r.reflet != null) U.uReflet.value = r.reflet; if (r.scintillement != null) U.uScint.value = r.scintillement; if (r.compression != null) compression = r.compression; if (r.fond) U.uFond.value.set(r.fond); if (r.brume) U.uBrume.value.set(r.brume); return mer; },
      /* une onde ronde : position monde (Vector3) ou écran ({ x, y } en pixels CSS) */
      onde: function (p, force) {
        var u, v; if (p && p.isVector3) { tmp.copy(p).project(cam); u = (tmp.x + 1) / 2; v = (tmp.y + 1) / 2; } else { var c = rd.domElement, r = c.getBoundingClientRect(); u = (p.x - r.left) / Math.max(1, r.width); v = 1 - (p.y - r.top) / Math.max(1, r.height); }
        if (v > U.uLigne.value - 0.004) v = U.uLigne.value - 0.004;
        ondes[iOnde].set(u, v, 0.0001, force == null ? 1 : force); iOnde = (iOnde + 1) % ondes.length; return mer;
      },
      /* un feu éclaire la mer */
      eclair: function (couleur, force) { eclairC.set(couleur); eclairF = Math.min(1.2, Math.max(eclairF, force == null ? 1 : force)); return mer; },
      ligneEcran: function () { return U.uLigne.value; },
      /* à appeler à chaque image, juste avant le rendu du jeu : photographie la scène pour la refléter */
      rendre: function (dt) {
        if (mort) return;
        var t = global.performance.now() / 1000; if (dt == null) dt = dernier ? Math.min(0.1, t - dernier) : 0.016; dernier = t;
        U.uT.value += dt;
        for (var k = 0; k < ondes.length; k++) if (ondes[k].w > 0) { ondes[k].z += dt; if (ondes[k].z > 3.2) ondes[k].w = 0; }
        eclairF *= Math.pow(0.03, dt); U.uEclair.value.copy(eclairC).multiplyScalar(Math.min(2.5, eclairF));
        rd.getDrawingBufferSize(taille); U.uRes.value.copy(taille); U.uAspect.value = taille.x / Math.max(1, taille.y);
        var lw = Math.max(2, Math.round(taille.x * ech)), lh = Math.max(2, Math.round(taille.y * ech)); if (cible.width !== lw || cible.height !== lh) cible.setSize(lw, lh);
        tmp.set(cam.position.x * 0.6, haut, zPlan).project(cam); var L = borne((tmp.y + 1) / 2, 0.02, 0.98); U.uLigne.value = L;
        // tout le ciel doit tenir dans l'eau visible : on tasse un peu le reflet si la mer est basse à l'écran
        U.uK.value = compression || borne(0.9 * (1 - L) / L, 1, 2.6);
        var av = rd.getRenderTarget(), i2; mesh.visible = false; for (i2 = 0; i2 < cacher.length; i2++) cacher[i2].visible = false;
        rd.setRenderTarget(cible); rd.clear(); rd.render(scene, cam); rd.setRenderTarget(av);
        mesh.visible = true; for (i2 = 0; i2 < cacher.length; i2++) cacher[i2].visible = true;
      },
      detruire: function () { if (mort) return; mort = true; scene.remove(mesh); mesh.geometry.dispose(); mat.dispose(); cible.dispose(); }
    };
    this._vie.restore(function () { mer.detruire(); });
    return mer;
  };

  var GLSL_CIEL = [
    'precision highp float;',
    'varying vec2 vUv; uniform float uT, uAspect, uRayon, uNuages, uBande, uEpais, uHaut, uHorizon, uEtoiles, uVent;',
    'uniform vec2 uLune, uEclairPos; uniform vec3 uEclair, uLuneC, uVille, uLuneDir; uniform float uLuneHalo; uniform vec3 uC[6]; uniform float uS[6];',
    GLSL_BRUIT,
    'vec3 kwDegrade(float t){ vec3 c = uC[0]; for (int i = 1; i < 6; i++) c = mix(c, uC[i], clamp((t - uS[i - 1]) / max(1e-4, uS[i] - uS[i - 1]), 0.0, 1.0)); return c; }',
    'float kwEtoiles(vec2 p, float n, float seuil){ vec2 q = p * n, id = floor(q); float h = kwH(id); if (h < seuil) return 0.0;',
    '  vec2 c = id + 0.5 + (vec2(kwH(id + 3.1), kwH(id + 7.7)) - 0.5) * 0.7; float d = length(q - c);',
    '  return smoothstep(0.11, 0.0, d) * (0.45 + 0.55 * sin(uT * (0.8 + h * 3.0) + h * 60.0)) * (0.5 + (h - seuil) / (1.0 - seuil)); }',
    'void main(){',
    '  vec2 p = vec2(vUv.x * uAspect, vUv.y); float t = clamp((uHaut - vUv.y) / max(1e-4, uHaut - uHorizon), 0.0, 1.0);',
    '  vec3 ciel = kwDegrade(t), col = ciel;',
    '  col += vec3(0.75, 0.82, 1.0) * (kwEtoiles(p, 95.0, 0.955) + kwEtoiles(p + 13.0, 46.0, 0.975) * 1.6) * uEtoiles * (1.0 - 0.6 * t);',
    // la lune : un disque éclairé de côté, ses mers, son halo
    '  vec2 dl = (vUv - uLune) * vec2(uAspect, 1.0); float d = length(dl), rr = d / uRayon;',
    '  col += uLuneC * (exp(-rr * 0.95) * 0.16 + exp(-rr * 0.25) * 0.035) * uLuneHalo;',
    '  if (rr < 1.0) { vec2 q = dl / uRayon; vec3 n = vec3(q, sqrt(max(0.0, 1.0 - dot(q, q))));',
    '    float lum = smoothstep(-0.03, 0.16, dot(n, normalize(uLuneDir)));   // uLuneDir : d\'où vient la lumière du soleil (phase de la lune)',
    '    float mers = kwF(q * 1.9 + 4.0); float alb = mix(0.62, 1.0, smoothstep(0.38, 0.62, mers)) * (0.82 + 0.18 * n.z);',
    '    vec3 lune = uLuneC * alb * (0.035 + 1.15 * lum); col = mix(col, lune, smoothstep(1.0, 0.94, rr)); }',
    // quelques nuages au loin, étirés par l\'alizé, bordés d\'argent près de la lune
    '  vec2 cp = vec2(p.x * 2.4 + uT * uVent, (vUv.y - uBande) * 7.5);',
    '  float nb = kwF(cp * 1.25 + vec2(0.0, 3.7)), bande = exp(-pow((vUv.y - uBande) / uEpais, 2.0));',
    '  float couv = uNuages * (0.22 + 0.78 * bande), dens = smoothstep(1.0 - couv, 1.0 - couv + 0.26, nb + 0.12);',
    '  if (dens > 0.001) { vec2 versLune = normalize(dl + 1e-4);',
    '    float nb2 = kwF((cp - vec2(versLune.x * 0.22, versLune.y * 1.1)) * 1.25 + vec2(0.0, 3.7));',
    '    float relief = clamp(0.55 + (nb - nb2) * 3.2, 0.0, 1.5), pres = exp(-d * 2.4 / max(uRayon * 9.0, 1e-4) * 2.0);',
    '    vec3 nu = ciel * 1.25 + vec3(0.010, 0.014, 0.028) * (0.4 + 0.6 * uLuneHalo);',
    '    nu += uLuneC * (0.10 + 0.5 * pres) * uLuneHalo * relief * (0.35 + 0.65 * (1.0 - dens));',
    '    nu += uVille * smoothstep(0.55, 1.0, t) * 0.5;',
    '    nu += uEclair * exp(-length((vUv - uEclairPos) * vec2(uAspect, 1.0)) * 2.6) * (0.25 + 0.3 * relief);',
    '    col = mix(col, nu, dens * 0.92); }',
    '  col += uEclair * 0.012 * exp(-length((vUv - uEclairPos) * vec2(uAspect, 1.0)) * 1.6);',
    '  col += (kwH(gl_FragCoord.xy) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(max(col, 0.0), 1.0);',
    GLSL_SORTIE, '}'
  ].join('\n');

  Directeur.prototype.ciel3d = function (o) {
    o = o || {}; var T = o.THREE, scene = o.scene; if (!T || !scene) throw new Error('KwFX.ciel3d : il faut THREE et scene');
    var deg = o.degrade || [[0, '#030f3b'], [0.34, '#06164a'], [0.51, '#081c56'], [0.675, '#0d2766'], [0.765, '#163172'], [1, '#283e7d']];
    var C = [], S = [], i; for (i = 0; i < 6; i++) { var st = deg[Math.min(i, deg.length - 1)]; C.push(new T.Color(st[1])); S.push(i < deg.length ? st[0] : 1.0001 + i * 0.0001); }
    var teinte = o.teinte ? new T.Color(o.teinte) : null; if (teinte) C.forEach(function (c) { c.multiply(teinte); });
    var lu = o.lune || {}, nu = o.nuages == null ? 0.5 : o.nuages, mort = false, eclairF = 0, eclairC = new T.Color(0, 0, 0);
    var U = {
      uT: { value: Math.random() * 50 }, uAspect: { value: 1 }, uRayon: { value: lu.rayon || 0.035 }, uLune: { value: new T.Vector2(lu.u == null ? 0.7 : lu.u, lu.v == null ? 0.78 : lu.v) },
      uLuneC: { value: new T.Color(lu.couleur || '#fff3d6') }, uLuneDir: { value: new T.Vector3().fromArray(lu.phase || [-0.42, 0.30, 0.86]) }, uLuneHalo: { value: lu.halo == null ? 1 : lu.halo }, uNuages: { value: nu }, uBande: { value: o.bande == null ? 0.62 : o.bande }, uEpais: { value: o.epaisseur || 0.1 },
      uHaut: { value: 1 }, uHorizon: { value: 0.4 }, uEtoiles: { value: o.etoiles == null ? 1 : o.etoiles }, uVent: { value: o.vent == null ? 0.007 : o.vent },
      uVille: { value: new T.Color(o.ville || '#3a2408') }, uEclair: { value: new T.Color(0, 0, 0) }, uEclairPos: { value: new T.Vector2(0.5, 0.6) }, uC: { value: C }, uS: { value: S }
    };
    var mat = new T.ShaderMaterial({ uniforms: U, vertexShader: GLSL_SOMMET, fragmentShader: GLSL_CIEL, depthWrite: false });
    var mesh = new T.Mesh(new T.PlaneGeometry(1, 1), mat); mesh.frustumCulled = false; mesh.renderOrder = o.ordre == null ? -3 : o.ordre; scene.add(mesh);
    var ciel = {
      mesh: mesh, uniforms: U,
      placer: function (p) { mesh.scale.set(p.largeur, p.hauteur, 1); mesh.position.set(p.x || 0, p.y || 0, p.z || 0); U.uAspect.value = p.largeur / p.hauteur; return ciel; },
      /* v (0 en bas du plan, 1 en haut) du haut du dégradé et de l'horizon */
      cadre: function (vHaut, vHorizon) { U.uHaut.value = vHaut; U.uHorizon.value = vHorizon; return ciel; },
      lune: function (u, v, rayon) { U.uLune.value.set(u, v); if (rayon) U.uRayon.value = rayon; return ciel; },
      /* phase de la lune : direction de la lumière [x, y, z] ; 'croissant' (premier croissant du soir), 'quartier', 'pleine' ; halo 0..1 */
      phase: function (p, halo) { var P = { croissant: [0.18, -0.85, -0.5], quartier: [-1, -0.1, 0.05], pleine: [-0.2, 0.1, 1] }; U.uLuneDir.value.fromArray(P[p] || p); if (halo != null) U.uLuneHalo.value = halo; return ciel; },
      nuages: function (q, r) { if (q != null) U.uNuages.value = q; r = r || {}; if (r.bande != null) U.uBande.value = r.bande; if (r.epaisseur != null) U.uEpais.value = r.epaisseur; if (r.vent != null) U.uVent.value = r.vent; return ciel; },
      eclair: function (couleur, force, u, v) { eclairC.set(couleur); eclairF = Math.min(1.2, Math.max(eclairF, force == null ? 1 : force)); if (u != null) U.uEclairPos.value.set(u, v); return ciel; },
      maj: function (dt) { if (mort) return; U.uT.value += dt || 0.016; eclairF *= Math.pow(0.03, dt || 0.016); U.uEclair.value.copy(eclairC).multiplyScalar(Math.min(2.5, eclairF)); },
      detruire: function () { if (mort) return; mort = true; scene.remove(mesh); mesh.geometry.dispose(); mat.dispose(); }
    };
    this._vie.restore(function () { ciel.detruire(); });
    return ciel;
  };

  global.KwFX = KwFX;
})(typeof window !== 'undefined' ? window : this);
