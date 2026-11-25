// =====================================================================
// LE MOT PÉI DU JOUR - jeu de lettres façon « Wordle », en créole réunionnais
// Un mot créole par jour, à trouver en 6 essais. Vert : bonne lettre bien
// placée. Jaune : bonne lettre mal placée. Gris : lettre absente.
// Graphie : proche du document cadre de l'Académie de La Réunion (Lékritir 2020).
// LISTE À FAIRE VALIDER : relire chaque mot avec les documents de l'Académie.
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, toile, protegerZones, surAppui, attendre, choisir } from '../commun/kwelafe.js';
import { kaz, cocotier, montagnes, solHerbe, flamboyant, payanke, ombrer } from '../commun/decor.js';

const MOTS = [
  ['KABAR', 'fête traditionnelle autour du maloya'], ['ZOIZO', 'oiseau'], ['DALON', 'ami, copain'], ['PIMAN', 'piment'],
  ['ZANFAN', 'enfant'], ['MARMAY', 'enfant, gamin (la marmaille)'], ['LONTAN', 'autrefois, il y a longtemps'], ['GRAMOUN', 'personne âgée, ancien'],
  ['DOMOUN', 'les gens, quelqu’un'], ['ROUGAY', 'rougail'], ['ZOURIT', 'poulpe, pieuvre'], ['PAPANG', 'papangue, le busard de La Réunion'],
  ['GONI', 'sac de jute'], ['KARI', 'cari, le plat'], ['LAPLI', 'la pluie'], ['MANZÉ', 'manger, la nourriture'],
  ['BÉBÈT', 'bête, insecte'], ['KOZÉ', 'parler, causer'], ['FONNKÈR', 'poésie du fond du cœur'], ['MALOYA', 'musique et danse traditionnelles'],
  ['ROULÈR', 'gros tambour du maloya'], ['BAZAR', 'marché'], ['KOUTO', 'couteau'], ['LÉKOL', 'l’école'],
  ['PIKAN', 'épine, piquant'], ['BRÈD', 'brède, feuilles cuisinées'], ['TANG', 'tangue (tenrec)'], ['SITRON', 'citron'],
];
const ESSAIS = 6;
const CLAVIER = ['AZERTYUIOP', 'QSDFGHJKLM', 'ÉÈWXCVBN'];

// ---------- Monde : une kaz au coucher du soleil ----------
const monde = creerMonde({
  soleil: { elevation: 9, azimut: 250, intensite: 2.6 }, turbidite: 6, rayleigh: 2.5,
  ombre: { taille: 16 }, exposition: 0.95,
  cadrer(cam, ratio) {
    const portrait = ratio < 1;
    cam.fov = 45;
    const dist = portrait ? Math.max(11, 8.4 / ratio) : 11.5;
    cam.position.set(0, 3.2 + (portrait ? 1.2 : 0), dist);
    cam.lookAt(0, portrait ? 2.2 : 2.4, 0);
  },
});
const { scene } = monde;
scene.add(solHerbe(240));
const maison = kaz({ mur: '#8fd3e8', toit: '#b8352a', volets: '#ffffff' }); maison.position.set(-7, 0, -12); maison.rotation.y = 0.35; scene.add(maison);
const maison2 = kaz({ mur: '#f4c95d', toit: '#2f6f5b', volets: '#e8573f', varangue: false }); maison2.position.set(8, 0, -14); maison2.rotation.y = -0.4; scene.add(maison2);
for (const [x, z] of [[-12, -6], [12, -8], [-3, -18], [4, -20]]) { const c = cocotier(7 + Math.random() * 2, 0.7); c.position.set(x, 0, z); scene.add(c); }
const fl = flamboyant(1); fl.position.set(0, 0, -22); scene.add(fl);
const mont = montagnes(300, 50, 9); mont.position.set(0, -0.5, -90); scene.add(mont);
const oiseau = payanke(); scene.add(oiseau);
monde.chaque((dt, t) => { const a = t * 0.3; oiseau.position.set(Math.cos(a) * 9, 9 + Math.sin(t) * 0.5, -10 + Math.sin(a) * 4); oiseau.rotation.y = -a; oiseau.maj(t); });

// ---------- Tuiles 3D ----------
const COUL = { vide: '#f6efe0', tape: '#fffaf0', bon: '#2fa84f', place: '#f0b323', absent: '#5d6670' };
const geoTuile = new THREE.BoxGeometry(0.86, 0.86, 0.16);
let mot, sens, longueur, ligne, saisie, tuiles = [], fini, modeLibre = false, historique = [];
const groupe = new THREE.Group(); scene.add(groupe);

function texLettre(lettre, fond, encre) {
  return toile(128, 128, (c, w, h) => {
    c.fillStyle = fond; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
    if (lettre) { c.fillStyle = encre; c.font = "800 84px 'Baloo 2', Nunito, Arial, sans-serif"; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lettre, w / 2, h / 2 + 6); }
  });
}
function peindre(t, lettre, etat) {
  const fond = COUL[etat], encre = etat === 'vide' || etat === 'tape' ? '#10204a' : '#ffffff';
  const tx = texLettre(lettre, fond, encre); t.material[4].map = tx; t.material[4].emissiveMap = tx; t.material[4].emissive.set(0xffffff); t.material[4].emissiveIntensity = 0.45; t.material[4].needsUpdate = true;
  t.material.forEach((m, i) => { if (i !== 4) m.color.set(fond); });
}
function construireGrille() {
  groupe.clear(); tuiles = [];
  const ecart = 0.98, x0 = -(longueur - 1) * ecart / 2;
  for (let r = 0; r < ESSAIS; r++) {
    tuiles[r] = [];
    for (let c = 0; c < longueur; c++) {
      const mats = Array.from({ length: 6 }, () => new THREE.MeshPhysicalMaterial({ color: COUL.vide, roughness: 0.45, clearcoat: 0.5 }));
      const t = new THREE.Mesh(geoTuile, mats);
      t.position.set(x0 + c * ecart, 6.1 - r * ecart, 0);
      t.castShadow = true;
      peindre(t, '', 'vide');
      groupe.add(t); tuiles[r][c] = t;
      t.scale.setScalar(0.01);
      setTimeout(() => anime(0.3, k => t.scale.setScalar(Math.max(k, 0.01)), ease.rebond), (r * longueur + c) * 20);
    }
  }
}

// ---------- Mot du jour ----------
function indexDuJour() {
  const d = new Date(), debut = new Date(2026, 0, 1);
  return Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - debut) / 86400000);
}
const cleJour = () => 'motpei-' + new Date().toISOString().slice(0, 10);
function nouvellePartie(libre) {
  modeLibre = libre;
  const entree = libre ? choisir(MOTS) : MOTS[((indexDuJour() % MOTS.length) + MOTS.length) % MOTS.length];
  [mot, sens] = entree; longueur = [...mot].length;
  ligne = 0; saisie = []; fini = false; historique = [];
  construireGrille(); majClavier({});
  ui.maj('mode', libre ? 'Libre' : 'Du jour'); ui.maj('lettres', longueur);
}

// ---------- Saisie ----------
function taper(l) {
  if (fini || saisie.length >= longueur) return;
  saisie.push(l); son.clic();
  const t = tuiles[ligne][saisie.length - 1];
  peindre(t, l, 'tape');
  anime(0.12, k => t.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.15));
}
function effacer() {
  if (fini || !saisie.length) return;
  saisie.pop(); peindre(tuiles[ligne][saisie.length], '', 'vide'); son.clic();
}
async function valider() {
  if (fini) return;
  if (saisie.length < longueur) {
    son.erreur(); ui.bulle('Mot trop court', '#ff8c1a');
    tuiles[ligne].forEach(t => { const x0 = t.position.x; anime(0.35, k => { t.position.x = x0 + Math.sin(k * 30) * 0.06 * (1 - k); }); });
    return;
  }
  fini = true; // bloque pendant l'animation
  const cible = [...mot], essai = saisie.slice();
  const etats = new Array(longueur).fill('absent');
  const reste = {};
  cible.forEach((l, i) => { if (essai[i] === l) etats[i] = 'bon'; else reste[l] = (reste[l] || 0) + 1; });
  essai.forEach((l, i) => { if (etats[i] !== 'bon' && reste[l] > 0) { etats[i] = 'place'; reste[l]--; } });
  historique.push(etats);
  for (let i = 0; i < longueur; i++) {
    const t = tuiles[ligne][i];
    await anime(0.14, k => { t.rotation.x = k * Math.PI / 2; });
    peindre(t, essai[i], etats[i]);
    if (etats[i] === 'bon') son.pop(); else if (etats[i] === 'place') son.clic();
    await anime(0.14, k => { t.rotation.x = Math.PI / 2 * (1 - k); });
  }
  const connu = {};
  historique.forEach((h, r) => h.forEach((e, i) => { const l = r === historique.length - 1 ? essai[i] : null; if (l) { const rang = { absent: 0, place: 1, bon: 2 }; if (!(l in connu) || rang[e] > rang[connu[l]]) connu[l] = e; } }));
  Object.assign(etatClavier, Object.fromEntries(Object.entries(connu).filter(([l, e]) => !(l in etatClavier) || { absent: 0, place: 1, bon: 2 }[e] > { absent: 0, place: 1, bon: 2 }[etatClavier[l]])));
  majClavier(etatClavier);
  if (etats.every(e => e === 'bon')) { gagne(); return; }
  ligne++; saisie = [];
  if (ligne >= ESSAIS) { perdu(); return; }
  fini = false;
}
let etatClavier = {};

async function gagne() {
  son.victoire();
  tuiles[ligne].forEach((t, i) => setTimeout(() => anime(0.4, k => { t.position.y += Math.sin(k * Math.PI) * 0.02; t.position.z = Math.sin(k * Math.PI) * 0.6; }), i * 90));
  monde.particules.confettis(new THREE.Vector3(0, 4, 1), 100);
  const serie = stock.lire('motpei-serie', 0) + (modeLibre ? 0 : 1);
  if (!modeLibre) { stock.ecrire('motpei-serie', serie); stock.ecrire(cleJour(), true); }
  await attendre(1.2);
  fin(true, serie);
}
async function perdu() {
  son.erreur();
  if (!modeLibre) { stock.ecrire('motpei-serie', 0); stock.ecrire(cleJour(), true); }
  await attendre(0.6);
  fin(false, 0);
}
async function fin(victoire, serie) {
  const grilleTexte = historique.map(h => h.map(e => e === 'bon' ? '🟩' : e === 'place' ? '🟨' : '⬜').join('')).join('\n');
  const r = await ui.ecran({
    titre: victoire ? 'Bien joué !' : 'Pas cette fois…',
    sousTitre: victoire ? `Trouvé en ${historique.length} essai${historique.length > 1 ? 's' : ''}` : '',
    etoiles: victoire ? (historique.length <= 3 ? 3 : historique.length <= 5 ? 2 : 1) : null,
    info: `<b style="font-size:20px;letter-spacing:2px">${mot}</b> : ${sens}${!modeLibre && victoire ? `<br>Série en cours : ${serie} jour${serie > 1 ? 's' : ''}` : ''}`,
    boutons: [{ id: 'libre', texte: 'Jouer un autre mot' }, { id: 'copie', texte: 'Copier mon résultat' }],
  });
  if (r === 'copie') {
    try { await navigator.clipboard.writeText(`Le mot péi du jour (Kwélafé) ${victoire ? historique.length : 'X'}/6\n${grilleTexte}\nkwelafeproduction.com`); ui.bulle('Copié !'); } catch (e) { ui.bulle('Copie impossible', '#ff8c1a'); }
    await attendre(0.8);
  }
  etatClavier = {};
  nouvellePartie(true);
}

// ---------- Clavier à l'écran (AZERTY + É, È) ----------
const style = document.createElement('style');
style.textContent = `.clavier{display:flex;flex-direction:column;gap:6px;width:min(560px,100%)}
.rang{display:flex;gap:5px;justify-content:center}
.touche{flex:1;max-width:48px;min-height:46px;border:0;border-radius:10px;background:#f6efe0;color:#10204a;font:800 17px var(--titre);box-shadow:0 4px 0 rgba(0,0,0,.25);padding:0}
.touche.large{flex:1.7;max-width:84px;font-size:13px}.touche:active{transform:translateY(3px);box-shadow:0 1px 0 rgba(0,0,0,.25)}
.touche.bon{background:#2fa84f;color:#fff}.touche.place{background:#f0b323;color:#fff}.touche.absent{background:#5d6670;color:#fff}`;
document.head.appendChild(style);
const bas = ui.el('div', 'k-bas'), clavier = ui.el('div', 'clavier');
const touches = {};
CLAVIER.forEach((rang, i) => {
  const r = ui.el('div', 'rang');
  if (i === 2) { const v = ui.el('button', 'touche large zone-interactive', 'Valider'); surAppui(v, valider); r.appendChild(v); }
  [...rang].forEach(l => { const t = ui.el('button', 'touche zone-interactive', l); surAppui(t, () => taper(l)); touches[l] = t; r.appendChild(t); });
  if (i === 2) { const e = ui.el('button', 'touche large zone-interactive', '⌫'); surAppui(e, effacer); r.appendChild(e); }
  clavier.appendChild(r);
});
bas.appendChild(clavier); document.body.appendChild(bas);
function majClavier(etats) { for (const [l, t] of Object.entries(touches)) { t.className = 'touche zone-interactive' + (etats[l] ? ' ' + etats[l] : ''); } }
window.addEventListener('keydown', e => {
  if (e.key === 'Enter') valider(); else if (e.key === 'Backspace') effacer();
  else { const l = e.key.toUpperCase(); if (touches[l]) taper(l); }
});

ui.init({ titre: 'Le mot péi du jour' });
ui.stat('mode', 'Mot', 'Du jour');
ui.stat('lettres', 'Lettres', 5);
protegerZones();
son.ambiance('mer');
const dejaJoue = stock.lire(cleJour(), false);
nouvellePartie(dejaJoue);
ui.chargementFini();
ui.ecran({
  titre: 'Le mot péi du jour', sousTitre: dejaJoue ? 'Tu as déjà joué aujourd’hui : place au mode libre !' : 'Un mot créole à trouver chaque jour',
  texte: 'Trouve le mot en 6 essais. Après chaque essai, les lettres changent de couleur : vert = bien placée, jaune = dans le mot mais ailleurs, gris = absente. Le nombre de cases donne la longueur du mot.',
  info: 'Les mots sont écrits en créole réunionnais : le son « k » s’écrit toujours K (kabar, kari), beaucoup de mots commencent par Z (zanfan, zoizo, zourit), et É ou È notent les sons é et è.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
});
