// Script injecté dans chaque page de livre EPUB (s'exécute dans l'iframe isolée).
export const SCRIPT_CHAPITRE = String.raw`
(function () {
  /* 1. localStorage de secours (l'iframe isolée n'y a pas accès) */
  try { window.localStorage.getItem("_kw"); } catch (e) {
    var m = {};
    var s = { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; }, clear: function () { m = {}; },
      key: function (i) { return Object.keys(m)[i] || null; }, get length() { return Object.keys(m).length; } };
    try { Object.defineProperty(window, "localStorage", { value: s, configurable: true }); } catch (_) {}
    try { Object.defineProperty(window, "sessionStorage", { value: s, configurable: true }); } catch (_) {}
  }

  var P = {};
  location.hash.replace(/^#/, "").split("&").forEach(function (x) { var kv = x.split("="); if (kv[0]) P[kv[0]] = decodeURIComponent(kv[1] || ""); });
  function envoyer(o) { try { parent.postMessage(Object.assign({ kw: 1 }, o), "*"); } catch (_) {} }
  var INTERACTIF = "a,button,input,select,textarea,label,audio,video,canvas,summary,details,[onclick],[role=button],[draggable=true],[contenteditable],.zone-interactive";

  /* 2. Protection : pas de menu « Enregistrer », pas de glisser-déposer */
  document.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  document.addEventListener("dragstart", function (e) { if (!e.target.closest || !e.target.closest("[draggable=true]")) e.preventDefault(); });
  var st = document.createElement("style");
  st.textContent = "img,svg{-webkit-touch-callout:none;-webkit-user-drag:none}";
  (document.head || document.documentElement).appendChild(st);

  /* 3. Gestes : toucher et glisser transmis au lecteur, sauf sur les zones interactives */
  var t0 = null, dernierToucher = 0;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { t0 = null; return; }
    var t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY, el: e.target, tps: Date.now() };
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    dernierToucher = Date.now();
    if (!t0) return;
    var t = e.changedTouches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y, el = t0.el; t0 = null;
    if (el && el.closest && el.closest(INTERACTIF)) return;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) envoyer({ k: "glisser", dir: dx < 0 ? "suivant" : "precedent" });
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) envoyer({ k: "toucher", x: t.clientX / innerWidth });
  }, { passive: true });
  document.addEventListener("click", function (e) {
    if (Date.now() - dernierToucher < 600) return;
    if (e.target.closest && e.target.closest(INTERACTIF)) return;
    envoyer({ k: "toucher", x: e.clientX / innerWidth });
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input,textarea,select,[contenteditable]")) return;
    if (e.key === "ArrowRight") envoyer({ k: "glisser", dir: "suivant" });
    if (e.key === "ArrowLeft") envoyer({ k: "glisser", dir: "precedent" });
  });

  /* 4. Liens : internes = changement de page dans le lecteur ; externes = nouvel onglet */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var url = new URL(a.getAttribute("href"), location.href);
    if (url.origin === location.origin && url.pathname === location.pathname) return; // ancre interne
    e.preventDefault();
    if (url.origin === location.origin && url.pathname.indexOf("/c/") === 0) {
      var morceaux = url.pathname.split("/").slice(3).join("/");
      envoyer({ k: "lien", href: decodeURIComponent(morceaux), ancre: url.hash });
    } else {
      window.open(url.href, "_blank", "noopener");
    }
  }, true);

  /* 5. Code Kwélafé : les touchers sur les zones interactives ne font jamais tourner la page */
  function zonesInteractives() {
    document.querySelectorAll(".zone-interactive").forEach(function (element) {
      if (element.__kw) return; element.__kw = 1;
      element.addEventListener("touchend", function (event) { event.preventDefault(); event.stopPropagation(); }, { passive: false });
    });
  }

  /* 6. Livres à texte redimensionnable : pagination en colonnes */
  var page = 0, pages = 1, body;
  var THEMES = { clair: ["#fffdf8", "#2b2724"], sepia: ["#f4ecd8", "#4a3b2a"], nuit: ["#1c1b1a", "#e8e2d8"] };
  var stTheme = document.createElement("style");
  function largeur() { return window.innerWidth; }
  function calculer() { pages = Math.max(1, Math.round(body.scrollWidth / largeur())); if (page > pages - 1) page = pages - 1; }
  function afficher() { body.scrollLeft = page * largeur(); envoyer({ k: "etat", page: page, pages: pages }); }
  function theme(nom) { var c = THEMES[nom] || THEMES.clair; stTheme.textContent = "html,body{background:" + c[0] + "!important;color:" + c[1] + "!important}body *{color:inherit}a{color:#c8361d!important}"; }
  function preparerTexte() {
    body = document.body;
    var s = document.createElement("style");
    s.textContent = "html{height:100%!important;overflow:hidden!important}" +
      "html{--p:clamp(24px,7vw,64px)}" +
      "body{margin:0!important;height:100vh!important;max-width:none!important;box-sizing:border-box!important;padding:48px var(--p) 56px!important;" +
      "column-count:" + (P.c || 1) + "!important;column-gap:calc(2 * var(--p))!important;column-fill:auto!important;overflow:hidden!important;" +
      "line-height:1.6;-webkit-text-size-adjust:100%;font-family:Georgia,'Times New Roman',serif}" +
      "img,svg,video{max-width:100%!important;max-height:calc(100vh - 70px)!important;object-fit:contain;break-inside:avoid}" +
      "p{orphans:2;widows:2}";
    document.head.appendChild(s);
    document.head.appendChild(stTheme);
    theme(P.th);
    document.documentElement.style.fontSize = (P.t || 100) + "%";
    calculer();
    if (P.f === "fin") page = pages - 1; else page = Math.min(pages - 1, Math.round((parseFloat(P.f) || 0) * pages));
    afficher();
    window.addEventListener("resize", function () { var fr = page / pages; calculer(); page = Math.round(fr * pages); afficher(); });
  }
  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (P.m !== "r" || !body) return;
    if (d.cmd === "suivant") { if (page < pages - 1) { page++; afficher(); } else envoyer({ k: "bord", dir: "suivant" }); }
    if (d.cmd === "precedent") { if (page > 0) { page--; afficher(); } else envoyer({ k: "bord", dir: "precedent" }); }
    if (d.cmd === "police") { var fr = page / pages; document.documentElement.style.fontSize = d.t + "%"; calculer(); page = Math.round(fr * pages); afficher(); }
    if (d.cmd === "theme") theme(d.th);
  });

  function demarrer() {
    zonesInteractives();
    new MutationObserver(zonesInteractives).observe(document.documentElement, { childList: true, subtree: true });
    if (P.m === "r") preparerTexte(); else envoyer({ k: "pret" });
  }
  if (document.readyState === "complete") demarrer(); else window.addEventListener("load", demarrer);
})();
`;
