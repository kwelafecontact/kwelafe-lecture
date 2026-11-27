/* FXIA : chef d'orchestre des effets 3D des jeux Kwélafé.
   Ce n'est pas un grand modèle de langage : c'est une petite intelligence embarquée, 100 % locale, écrite pour Kwélafé, qui décide à chaque instant
   comment tout bouge sans que chaque jeu ait à le programmer.
   Elle fait quatre choses :
   1. VENT : un champ de flux sans divergence (type « curl noise ») avec rafales, qui fait tourner feuilles, pétales, fumée, brume et gouttes fines.
   2. ÉMOTION : elle mesure l'excitation du joueur (événements récents, enchaînements) et dose la richesse des effets, avec calme et montée en puissance.
   3. BUDGET : elle mesure le temps d'image et réduit ou rétablit la quantité d'effets pour garder 60 images par seconde.
   4. SCÉNARIOS : à partir d'un simple événement du jeu (coup, grand moment, cascade, rayon, bombe, feu d'artifice, ambiance), elle compose un
      scénario d'effets en couches, évite les surcharges (délais de recharge) et dirige les étoiles et gouttes vers la cible (le score).
   Elle pilote le moteur FX3D (Three.js). Aucun jeu n'a besoin de connaître les détails : il envoie des événements et appelle tick() à chaque image.
   Utilisation : FXIA.evenement("coup", { x, y, c:0xff0000, u:CELL, n:8 }) ; FXIA.tick(dt, { jouant, calme, cascade, W, H, zone:{x0,x1,y0,y1} }) ;
   FXIA.cible(x, y) pour indiquer où vont les étoiles gagnées. */
(function () {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const F = () => (window.FX3D && window.FX3D.ready ? window.FX3D : null);
  const ARC = [0xff5a5a, 0xffb23a, 0xffe25a, 0x8aff5a, 0x5ae0ff, 0x8a8aff, 0xff8ae8];

  const IA = {
    t: 0,
    excitation: 0, // 0 calme .. 1 explosion de joie
    budget: 1, // 0.3 .. 1 selon la fluidité mesurée
    ms: 16.7,
    cibleXY: null,
    rafale: 0, // force de la rafale de vent
    recharge: {},
    ambianceT: 0,
    file: [], // gouttes tardives programmées : le jus continue de couler après l'éclat
    etat: { jouant: false, calme: true, cascade: 1, W: 360, H: 640, zone: { x0: 0, x1: 360, y0: 0, y1: 640 } },

    /* ---- 1. VENT : champ de flux sans divergence + rafales, renvoie [vx, vy, vz] en pixels par seconde au carré ---- */
    vent(x, y, z, t) {
      const f = 0.006, tt = t * 0.55;
      // fonction de courant psi(x,y,t) ; vitesse = (dpsi/dy, -dpsi/dx) donc sans divergence (tourbillons naturels)
      const a = x * f + tt, b = y * f * 1.2 - tt * 0.7, c = (x + y) * f * 0.6 + tt * 0.3;
      const dpsix = f * Math.cos(a) * Math.cos(b) + 0.6 * f * 0.6 * Math.cos(c) * 0.8;
      const dpsiy = -f * 1.2 * Math.sin(a) * Math.sin(b) + 0.6 * f * 0.6 * Math.cos(c) * 0.8;
      const A = 9000, g = 1 + this.rafale * 3;
      return [(dpsiy * A + 14 * Math.sin(tt * 1.7) + this.rafale * 40) * g, -dpsix * A * g * 0.6 - 6 * Math.sin(y * 0.01 + tt), Math.sin(a + b) * 14 * g];
    },
    arrive(couleur) { // une étoile ou une goutte arrive à la cible : petite lueur
      const f = F(); if (!f || !this.cibleXY) return;
      f.etincelles(this.cibleXY.x, this.cibleXY.y, 3, 120, 40, couleur, 0.6);
      this.excitation = Math.min(1, this.excitation + 0.004);
    },
    cible(x, y) { this.cibleXY = { x, y }; },

    /* ---- 3. BUDGET ---- */
    surveille(dt) {
      this.ms = this.ms * 0.94 + dt * 1000 * 0.06;
      if (this.ms > 21) this.budget = Math.max(0.3, this.budget - 0.015);
      else if (this.ms < 18.2) this.budget = Math.min(1, this.budget + 0.004);
      const f = F(); if (f && f.nombre() > 1500) this.budget = Math.max(0.3, this.budget - 0.03);
    },
    n(base) { return Math.max(1, Math.round(base * this.budget * (0.75 + 0.6 * this.excitation))); },
    libre(nom, delai) { // évite la surcharge : un même scénario ne se relance pas trop vite
      if (this.t - (this.recharge[nom] || -9) < delai * (1.6 - this.budget)) return false;
      this.recharge[nom] = this.t; return true;
    },

    /* ---- 4. SCÉNARIOS à partir d'événements du jeu ---- */
    evenement(type, o) {
      const f = F(); if (!f) return;
      o = o || {};
      const u = o.u || 50, x = o.x, y = o.y, col = o.c ?? 0xffffff;
      switch (type) {
        case "coup": { // un fruit éclate
          this.excitation = Math.min(1, this.excitation + 0.03);
          f.jus(x, y, col, u, Math.max(2, Math.round(this.n(4 + Math.ceil((o.n || 6) / 2)) * rnd(0.6, 1.5))), this.excitation > 0.55 ? this.cibleXY : null);
          for (let i = Math.floor(rnd(0, 3.2)); i > 0; i--) this.file.push({ t: this.t + rnd(0.15, 0.9), x: x + rnd(-u * 0.4, u * 0.4), y: y + rnd(-u * 0.2, u * 0.5), u, c: col });
          if (this.excitation > 0.7 && this.libre("lucioles-coup", 0.25)) f.etincelles(x, y, this.n(5), u * 4, u, null, 0.8);
          break;
        }
        case "rayon": {
          this.excitation = Math.min(1, this.excitation + 0.1);
          f.faisceau(o.horiz, o.horiz ? o.cx : x, o.horiz ? y : o.cy, o.len, 0xfff2c0, u);
          const N = this.n(18); // braises le long du rayon, emportées par le vent
          if (o.horiz) f.braises(o.x0, o.x1, y, N, u);
          else for (let i = 0; i < N; i++) f.braises(x - 4, x + 4, o.y0 + (o.y1 - o.y0) * Math.random(), 1, u);
          this.rafale = Math.max(this.rafale, 0.5);
          break;
        }
        case "bombe": { // explosion de feu : onde, braises, vapeur, vent
          this.excitation = Math.min(1, this.excitation + 0.18);
          f.anneau(x, y, col, (o.R || 2.6) * u, 0, 0.55, 1.1);
          f.etincelles(x, y, this.n(16), u * 4, u, 0xffb23a, 0.9);
          f.braises(x - u, x + u, y, this.n(22), u * 1.2);
          f.vapeur(x, y, this.n(5), u * 1.3);
          this.rafale = 1;
          break;
        }
        case "grand": { // grand moment : tout en couches
          this.excitation = Math.min(1, this.excitation + 0.3);
          for (let i = 0; i < 6; i++) f.anneau(x, y, ARC[i], (2.6 + i * 0.5) * u, i * 0.07, 0.75, 1.2);
          f.bulle(x, y, col, u * 4.6, 0.8); f.bulle(x, y, 0xffe6a0, u * 2.4, 0.55);
          f.jus(x, y, col, u, this.n(20), this.cibleXY);
          f.etoiles(x, y, this.n(16), u * 5.5, u, this.cibleXY);
          f.etincelles(x, y, this.n(46), u * 6.5, u, null, 1);
          f.confettis(x, y, this.n(26), u * 5, u);
          f.vapeur(x, y, this.n(4), u * 1.6);
          this.rafale = 1;
          break;
        }
        case "cascade": {
          this.excitation = Math.min(1, this.excitation + 0.12);
          const niv = Math.min(5, o.niveau || 3);
          f.etoiles(x, y, this.n(8 + niv * 2), u * 5, u, this.cibleXY);
          f.confettis(x, y, this.n(10 + niv * 3), u * 4.5, u);
          f.anneau(x, y, ARC[Math.floor(Math.random() * ARC.length)], u * (3 + niv * 0.3), 0, 0.8, 1.2);
          this.rafale = Math.max(this.rafale, 0.6);
          break;
        }
        case "feu": { // feu d'artifice
          const c = o.c ?? ARC[Math.floor(Math.random() * ARC.length)];
          f.etincelles(x, y, this.n(36), u * 3.4, u, c, 1.2);
          f.etoiles(x, y, 3, u * 2.4, u);
          f.petales(o.x0, o.x1, o.y0, this.n(3), u);
          break;
        }
        case "petales": f.petales(o.x0, o.x1, o.y0, this.n(o.n || 3), u); break;
      }
    },

    /* ---- 2. ÉMOTION et ambiance naturelle, appelé à chaque image ---- */
    tick(dt, etat) {
      this.t += dt;
      if (etat) Object.assign(this.etat, etat);
      this.surveille(dt);
      for (let i = this.file.length - 1; i >= 0; i--) { const q = this.file[i]; if (this.t >= q.t) { const f2 = F(); if (f2) f2.jus(q.x, q.y, q.c, q.u * rnd(0.5, 0.9), 1 + Math.floor(rnd(0, 2.5))); this.file.splice(i, 1); } }
      this.excitation *= Math.exp(-dt * (this.etat.calme ? 0.9 : 0.55));
      this.rafale *= Math.exp(-dt * 1.4);
      const f = F(); if (!f || !this.etat.jouant) return;
      const e = this.etat, z = e.zone, u = e.u || 50;
      this.ambianceT -= dt;
      if (this.ambianceT > 0) return;
      // l'ambiance suit l'humeur : lucioles et pétales au calme, braises quand ça s'enflamme, brume de jus entre deux
      this.ambianceT = (e.calme ? 0.9 : 0.6) * (1.5 - this.budget * 0.5);
      if (e.ambiance === "volcan") { // volcan : braises montantes et vapeur, ni lucioles ni pétales
        f.braises(z.x0, z.x1, z.y1, this.n(this.excitation > 0.5 ? 5 : 2), u, 0xff8a2a);
        if (Math.random() < 0.35) f.vapeur(rnd(z.x0, z.x1), z.y1, 1, u * 1.2);
        return;
      }
      if (this.excitation < 0.25) {
        f.lucioles(z.x0, z.x1, z.y0, z.y1, this.n(e.calme ? 2 : 1), u);
        if (Math.random() < 0.5) f.petales(z.x0, z.x1, z.y0 - u * 0.5, 1, u);
      } else if (this.excitation > 0.55) {
        f.braises(z.x0, z.x1, z.y1, this.n(4), u);
      } else if (Math.random() < 0.4) f.petales(z.x0, z.x1, z.y0 - u * 0.5, 2, u);
    }
  };
  window.FXIA = IA;
})();
