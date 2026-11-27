/* Kwélafé Production : filet de sécurité commun à tous les jeux (script classique, à charger en premier).
 *
 * Il ne change ni le gameplay, ni les visuels, ni les sons. Il ne fait que :
 *  1. afficher un message doux avec un bouton « Rejouer » si le jeu se fige sur une erreur répétée ;
 *  2. afficher un message clair si le navigateur ne sait pas faire de WebGL (au lieu d'une page blanche) ;
 *  3. proposer « Rejouer » si la carte graphique ne revient pas après une perte de contexte WebGL ;
 *  4. empêcher le zoom par double toucher, le geste de pincement, le menu contextuel et le défilement ;
 *  5. appliquer le code Kwélafé qui bloque la propagation des touchers sur les zones .zone-interactive ;
 *  6. rendre la sauvegarde (localStorage) incassable : une écriture refusée ne fait plus planter le jeu.
 */
(function () {
  'use strict';
  if (window.__kwStabilite) return;
  window.__kwStabilite = true;

  // ---------------------------------------------------------------- message doux
  function carte(titre, texte, bouton, action, lien) {
    if (!document.body || document.getElementById('kw-doux')) return;
    var voile = document.createElement('div');
    voile.id = 'kw-doux';
    voile.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(10,12,30,.86);padding:24px;font-family:"Baloo 2",Nunito,system-ui,sans-serif;touch-action:manipulation';
    var c = document.createElement('div');
    c.style.cssText = 'max-width:340px;background:#fff8ea;color:#1b1a2e;border-radius:22px;padding:22px 22px 18px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.4)';
    var h = document.createElement('h2'); h.textContent = titre; h.style.cssText = 'margin:0 0 8px;font-size:21px';
    var p = document.createElement('p'); p.textContent = texte; p.style.cssText = 'margin:0 0 16px;font-size:15px;line-height:1.45';
    c.appendChild(h); c.appendChild(p);
    if (bouton) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = bouton;
      b.style.cssText = 'border:0;border-radius:999px;padding:13px 28px;font:800 18px "Baloo 2",system-ui,sans-serif;background:#ffc928;color:#3a1a04;cursor:pointer;margin:2px 4px';
      b.addEventListener('click', function () { action ? action() : location.reload(); });
      c.appendChild(b);
    }
    if (lien) {
      var a = document.createElement('a'); a.href = lien; a.textContent = '‹ Retour aux jeux';
      a.style.cssText = 'display:inline-block;margin:8px 4px 0;padding:10px 16px;font:700 15px "Baloo 2",system-ui,sans-serif;color:#1b1a2e';
      c.appendChild(a);
    }
    voile.appendChild(c); document.body.appendChild(voile);
  }
  window.kwMessageDoux = carte;

  // ---------------------------------------------------------------- erreurs répétées
  // Une erreur isolée ne gêne pas toujours le jeu : on n'interrompt le joueur que si ça se répète
  // (3 erreurs en 3 secondes = le jeu est probablement figé).
  var recentes = [];
  function erreur(msg) {
    try { console.error('[kwélafé] ' + msg); } catch (e) { /* rien */ }
    var t = Date.now(); recentes.push(t);
    recentes = recentes.filter(function (x) { return t - x < 3000; });
    if (recentes.length >= 3) {
      carte('Petit souci dans le jeu', "Quelque chose s'est mal passé. Ta progression est gardée : tu peux relancer la partie.", 'Rejouer');
    }
  }
  window.addEventListener('error', function (e) {
    var m = (e && e.message) || '';
    if (/ResizeObserver|Script error/i.test(m)) return;   // bruits sans conséquence
    erreur(m || 'erreur');
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason; erreur('promesse refusée : ' + ((r && r.message) || r || ''));
  });

  // ---------------------------------------------------------------- WebGL absent
  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }
  function controleWebGL() {
    // tous les jeux du dossier utilisent WebGL (Three.js ou PixiJS)
    if (!webglOK()) {
      carte("Ton navigateur ne peut pas afficher ce jeu", "Ce jeu a besoin de l'affichage 3D (WebGL). Essaie Safari ou Chrome à jour, ou active l'accélération graphique.", null, null, '/jeux-3d/');
    }
  }

  // ---------------------------------------------------------------- perte de contexte WebGL
  // Les jeux qui gèrent déjà la perte (Koup Koup…) ont leur propre panneau (#kw-secours) : on ne double pas.
  var perdus = 0;
  document.addEventListener('webglcontextlost', function () {
    perdus++;
    setTimeout(function () {
      if (document.visibilityState === 'hidden') return;
      if (perdus > 0 && !document.getElementById('kw-secours')) carte("L'affichage du jeu s'est interrompu", "Le téléphone a libéré la mémoire graphique. Ta progression est enregistrée.", 'Rejouer');
    }, 6000);
  }, true);
  document.addEventListener('webglcontextrestored', function () {
    perdus = Math.max(0, perdus - 1);
    var d = document.getElementById('kw-doux'); if (d && perdus === 0) d.remove();
  }, true);

  // ---------------------------------------------------------------- tactile et ergonomie
  var st = document.createElement('style');
  st.textContent = 'html,body{touch-action:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}';
  (document.head || document.documentElement).appendChild(st);
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(function (n) {
    document.addEventListener(n, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener('dblclick', function (e) { e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // Règle Kwélafé : les touchers sur les zones interactives ne se propagent pas.
  function zonesInteractives() {
    document.querySelectorAll('.zone-interactive').forEach(function (element) {
      if (element.__kwTouch) return; element.__kwTouch = true;
      element.addEventListener('touchend', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.currentTarget.click) event.currentTarget.click();
      }, { passive: false });
    });
  }

  // ---------------------------------------------------------------- sauvegarde incassable
  try {
    var set = Storage.prototype.setItem, get = Storage.prototype.getItem;
    Storage.prototype.setItem = function (k, v) { try { return set.call(this, k, v); } catch (e) { /* quota ou navigation privée : on continue sans sauvegarder */ } };
    Storage.prototype.getItem = function (k) { try { return get.call(this, k); } catch (e) { return null; } };
  } catch (e) { /* rien */ }

  // ---------------------------------------------------------------- son sur iPhone / iPad
  // On suit tous les AudioContext créés par le jeu : ils s'endorment quand la page passe en arrière-plan
  // (plus aucun son en fond) et se réveillent au retour ou au premier toucher (iOS les met en « interrompu »).
  var contextes = [];
  function suivreAudio(Natif, nom) {
    if (!Natif) return;
    try {
      var Suivi = function (opts) { var c = opts === undefined ? new Natif() : new Natif(opts); contextes.push(c); return c; };
      Suivi.prototype = Natif.prototype;
      window[nom] = Suivi;
    } catch (e) { /* rien */ }
  }
  suivreAudio(window.AudioContext, 'AudioContext');
  suivreAudio(window.webkitAudioContext, 'webkitAudioContext');
  // on ne réveille que ce qu'on a endormi nous-mêmes ou ce qu'iOS a « interrompu » : la pause du jeu reste respectée
  function reveillerSons() {
    contextes.forEach(function (c) { if (c.__kwEndormi || c.state === 'interrupted') { c.__kwEndormi = false; try { var r = c.resume(); r && r.catch && r.catch(function () {}); } catch (e) { /* rien */ } } });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) contextes.forEach(function (c) { if (c.state === 'running') { c.__kwEndormi = true; try { var r = c.suspend(); r && r.catch && r.catch(function () {}); } catch (e) { /* rien */ } } });
    else reveillerSons();
  });
  window.addEventListener('pagehide', function () { contextes.forEach(function (c) { if (c.state === 'running') { c.__kwEndormi = true; try { c.suspend(); } catch (e) { /* rien */ } } }); });
  ['pointerdown', 'touchend'].forEach(function (n) { document.addEventListener(n, reveillerSons, { passive: true, capture: true }); });

  document.addEventListener('DOMContentLoaded', function () { controleWebGL(); zonesInteractives(); });
  window.addEventListener('load', zonesInteractives);
})();
