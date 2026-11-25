// =====================================================================
// KOSA IN SHOZ ? - devinettes rapides façon « Brain Puzzle »
// « Kosa in shoz ? » est la formule qui lance les devinettes créoles.
// Lis la devinette et touche le bon objet de La Réunion avant la fin du temps.
// Les devinettes sont écrites en français par Kwélafé (ce ne sont pas des
// sirandanes traditionnelles).
// =====================================================================
import { THREE, creerMonde, anime, ease, son, ui, stock, melanger, attendre, protegerZones } from '../commun/kwelafe.js';
import * as D from '../commun/decor.js';

const OBJETS = {
  letchi: { nom: 'Le letchi', faire: () => D.grappeLetchis(8), echelle: 1.1,
    devinette: 'Ma coque rouge est toute rugueuse, ma chair blanche est sucrée, et on me mange surtout pour Noël et le jour de l’an.',
    info: 'Le letchi est le fruit des fêtes de fin d’année à La Réunion.' },
  payanke: { nom: 'Le paille-en-queue', faire: () => D.payanke(), echelle: 1.1, y: 1.0,
    devinette: 'Je suis tout blanc, j’ai deux longues plumes au bout de la queue et je niche dans les falaises. Je suis l’oiseau emblème de l’île.',
    info: 'En créole, on l’appelle « payanké ».' },
  piton: { nom: 'Le Piton de la Fournaise', faire: () => D.piton(0.82, 0.85, true), echelle: 1,
    devinette: 'De temps en temps, je crache de la lave dans le sud-est de l’île, et l’on vient de loin pour me voir gronder.',
    info: 'C’est l’un des volcans les plus actifs du monde.' },
  kaz: { nom: 'La kaz créole', faire: () => D.kaz({ mur: '#f4c95d' }), echelle: 0.24,
    devinette: 'J’ai un toit en tôle, une varangue pour prendre le frais, et des lambrequins qui me font une jolie dentelle.',
    info: 'Les lambrequins sont des frises de bois découpé, en bord de toiture.' },
  canne: { nom: 'La canne à sucre', faire: () => D.canne(), echelle: 0.62,
    devinette: 'Je pousse en grandes tiges dans les champs. Coupée puis broyée à l’usine, je donne du sucre et du rhum.',
    info: 'La coupe de la canne a lieu chaque année de juillet à décembre environ.' },
  tangue: { nom: 'Le tangue', faire: () => D.tangue(), echelle: 1.1,
    devinette: 'Je suis un petit mammifère au museau pointu et au dos piquant. Mes ancêtres sont venus de Madagascar.',
    info: 'Le tangue est un tenrec, originaire de Madagascar.' },
  cocotier: { nom: 'Le cocotier', faire: () => D.cocotier(5, 0.4), echelle: 0.3,
    devinette: 'Mon tronc est long et souvent penché vers la mer, et mes fruits renferment une eau bien fraîche.',
    info: 'On en voit le long des plages de l’ouest et du sud.' },
  kar: { nom: 'Le car jaune', faire: () => D.kar('Saint-Pierre', '#e8402a'), echelle: 0.36,
    devinette: 'Je suis jaune, je roule d’une ville à l’autre tout autour de l’île et je m’arrête dans les gares routières.',
    info: 'Les cars jaunes forment le réseau qui relie les villes de l’île.' },
  flamboyant: { nom: 'Le flamboyant', faire: () => D.flamboyant(0.32), echelle: 1,
    devinette: 'À l’approche de Noël, je me couvre de fleurs rouges, comme un grand parasol en feu.',
    info: 'Sa floraison annonce l’été austral et les fêtes.' },
  vanille: { nom: 'La vanille', faire: () => D.vanille(), echelle: 0.8,
    devinette: 'Je suis une longue gousse brune et parfumée. Pour que je naisse, il faut féconder ma fleur à la main.',
    info: 'En 1841, Edmond Albius, un jeune esclave de 12 ans, a trouvé à La Réunion comment polliniser la fleur de vanille à la main.' },
  ananas: { nom: 'L’ananas Victoria', faire: () => D.ananas(), echelle: 0.85,
    devinette: 'Je suis un petit fruit très sucré, couronné de feuilles. Je porte le nom d’une reine.',
    info: 'L’ananas Victoria est réputé pour son parfum et sa douceur.' },
  piment: { nom: 'Le piment', faire: () => D.piment(), echelle: 0.9,
    devinette: 'Je suis petit, rouge et brillant. Dans le rougail, je mets le feu à la bouche !',
    info: 'On l’écrase souvent avec un peu de sel pour faire un rougail piment.' },
  chouchou: { nom: 'Le chouchou', faire: () => D.chouchou(), echelle: 1.1,
    devinette: 'Je suis vert pâle et tout plissé. Je pousse en liane, et le cirque de Salazie est célèbre pour moi.',
    info: 'On le cuisine en gratin, en salade ou en daube.' },
  tectec: { nom: 'Le tec-tec', faire: () => D.tecTec(), echelle: 1.3, y: 0.45,
    devinette: 'Je suis un petit oiseau rond des hauts, très curieux. J’aime suivre les randonneurs sur les sentiers.',
    info: 'Le tec-tec est endémique : il ne vit qu’à La Réunion.' },
  galet: { nom: 'Le galet', faire: () => D.galet(0.55), echelle: 1, y: 0.3,
    devinette: 'Je suis noir et rond, poli par l’eau. On a même donné mon nom à une rivière de l’île.',
    info: 'La Rivière des Galets se jette dans la mer près du Port.' },
};
const CLES = Object.keys(OBJETS);
const TEMPS = 15;
const socles = [];

const monde = creerMonde({
  soleil: { elevation: 30, azimut: 230, intensite: 2.0 }, exposition: 0.85,
  ombre: { taille: 8 },
  cadrer(cam, ratio) {
    const portrait = ratio < 1;
    const dist = portrait ? Math.max(10.5, 8 / ratio) : 8.5;
    cam.position.set(0, portrait ? 5.2 : 4.2, dist);
    cam.lookAt(0, portrait ? 2.2 : 1.6, 0);
    disposer(portrait);
  },
});
const { scene } = monde;
// décor : place de village au bord de la mer
const sable = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: 0xb89c6c, roughness: 1 }));
sable.rotation.x = -Math.PI / 2; sable.receiveShadow = true; scene.add(sable);
const mer = D.ocean(600); mer.position.set(0, -0.6, -330); scene.add(mer);
monde.chaque((dt, t) => mer.maj(t));
for (const [x, z] of [[-7, -5], [7, -6], [-10, 0], [10, 1]]) { const c = D.cocotier(7, 0.6); c.position.set(x, 0, z); scene.add(c); }
const k = D.kaz({ mur: '#8fd3e8', toit: '#b8352a', volets: '#ffffff' }); k.position.set(-2, 0, -12); k.rotation.y = 0.2; scene.add(k);

// 4 socles
const matSocle = new THREE.MeshPhysicalMaterial({ color: 0xfff6e6, roughness: 0.4, clearcoat: 0.6 });
for (let i = 0; i < 4; i++) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 0.5, 40), matSocle.clone()); s.position.y = 0.25; s.castShadow = s.receiveShadow = true; g.add(s);
  const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 40), new THREE.MeshStandardMaterial({ color: 0xffc928, metalness: 0.7, roughness: 0.3 }));
  anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.5; g.add(anneau);
  g.userData.socle = i; g.traverse(m => { m.userData.socle = i; });
  scene.add(g); socles.push({ g, objet: null, cle: null });
}
disposer(window.innerWidth / window.innerHeight < 1);
function disposer(portrait) {
  socles.forEach((s, i) => {
    if (portrait) s.g.position.set((i % 2 ? 1 : -1) * 1.45, 0, (i < 2 ? -1.5 : 1.5));
    else s.g.position.set((i - 1.5) * 2.4, 0, 0);
  });
}

// ---------- Carte de devinette ----------
const style = document.createElement('style');
style.textContent = `.devinette{position:fixed;z-index:11;left:50%;transform:translateX(-50%);top:calc(max(18px,env(safe-area-inset-top)) + 124px);width:min(560px,calc(100% - 2*var(--marge) - 20px));background:rgba(255,250,236,.96);color:#2b1a0c;border-radius:22px;padding:14px 18px 16px;box-shadow:0 12px 30px rgba(0,0,0,.3)}
.devinette b{display:block;font:800 22px var(--titre);color:#c0392b;margin-bottom:2px}.devinette p{margin:0;font:700 16px/1.45 var(--corps)}
.temps{height:8px;border-radius:9px;background:rgba(0,0,0,.1);margin-top:10px;overflow:hidden}.temps div{height:100%;background:linear-gradient(90deg,#2fa84f,#ffc928,#e8402a);background-size:300% 100%;border-radius:9px}`;
document.head.appendChild(style);
const carte = ui.el('div', 'devinette', '<b>Kosa in shoz ?</b><p></p><div class="temps"><div></div></div>');
document.body.appendChild(carte);
const texte = carte.querySelector('p'), barre = carte.querySelector('.temps div');

// ---------- Partie ----------
let pioche = [], bonne, score, vies, serie, restant, actif = false, meilleur = stock.lire('kosa-meilleur', 0);
function nouvelleQuestion() {
  if (!pioche.length) pioche = melanger(CLES.slice());
  const cle = pioche.pop();
  const autres = melanger(CLES.filter(c => c !== cle)).slice(0, 3);
  const choix = melanger([cle, ...autres]);
  bonne = choix.indexOf(cle);
  socles.forEach((s, i) => {
    if (s.objet) s.g.remove(s.objet);
    const o = OBJETS[choix[i]];
    const obj = o.faire();
    obj.scale.multiplyScalar(o.echelle * 1.25);
    obj.position.y = 0.52 + (o.y ?? 0);
    obj.traverse(m => { m.userData.socle = i; });
    s.g.add(obj); s.objet = obj; s.cle = choix[i];
    s.g.children[0].material.color.set(0xfff6e6);
    obj.scale.multiplyScalar(0.01);
    const cible = obj.scale.clone().multiplyScalar(100);
    setTimeout(() => anime(0.4, t => obj.scale.copy(cible).multiplyScalar(Math.max(t, 0.01)), ease.rebond), i * 80);
  });
  texte.textContent = OBJETS[cle].devinette;
  restant = TEMPS; actif = true;
}
monde.chaque((dt, t) => {
  socles.forEach((s, i) => { if (s.objet) s.objet.rotation.y += dt * 0.6; });
  if (!actif) return;
  restant -= dt;
  barre.style.width = Math.max(0, restant / TEMPS * 100) + '%';
  barre.style.backgroundPosition = `${(1 - restant / TEMPS) * 100}% 0`;
  if (restant <= 0) repondre(-1);
});
monde.renderer.domElement.addEventListener('pointerdown', e => {
  if (!actif) return;
  const hit = monde.toucher(e, socles.map(s => s.g));
  if (hit && hit.object.userData.socle !== undefined) repondre(hit.object.userData.socle);
});
async function repondre(i) {
  actif = false;
  const s = socles[bonne], o = OBJETS[s.cle];
  if (i === bonne) {
    serie++;
    const gain = Math.round(100 + restant * 10) * Math.min(serie, 5);
    score += gain; ui.maj('score', score);
    son.succes(); if (serie > 1) son.combo(serie);
    s.g.children[0].material.color.set(0x8be08f);
    monde.particules.confettis(s.g.position.clone().setY(1.5), 50);
    anime(0.8, t => { s.objet.position.y = 0.52 + (o.y ?? 0) + Math.sin(t * Math.PI) * 0.8; s.objet.rotation.y += 0.25; });
    ui.bulle(serie > 1 ? `${o.nom} ! x${Math.min(serie, 5)}` : `${o.nom} !`);
  } else {
    serie = 0; vies--; ui.maj('vies', '♥'.repeat(Math.max(vies, 0)) || '0');
    son.erreur();
    if (i >= 0) { const m = socles[i]; m.g.children[0].material.color.set(0xff8a80); const x0 = m.g.position.x; anime(0.4, t => { m.g.position.x = x0 + Math.sin(t * 30) * 0.08 * (1 - t); }); }
    s.g.children[0].material.color.set(0x8be08f);
    ui.bulle(i < 0 ? 'Temps écoulé !' : 'Raté !', '#ff8a80');
  }
  texte.innerHTML = `<b style="color:#2fa84f;font:800 18px var(--titre);display:inline">${o.nom}</b> : ${o.info}`;
  ui.maj('serie', serie);
  await attendre(2.6);
  if (vies <= 0) { finPartie(); return; }
  nouvelleQuestion();
}
async function finPartie() {
  if (score > meilleur) { meilleur = score; stock.ecrire('kosa-meilleur', meilleur); }
  await ui.ecran({ titre: 'Fin de partie', sousTitre: `Score : ${score}`, etoiles: score >= 4000 ? 3 : score >= 1500 ? 2 : 1, texte: `Meilleur score : ${meilleur}`, boutons: [{ id: 'ok', texte: 'Rejouer' }] });
  nouvellePartie();
}
function nouvellePartie() { score = 0; vies = 3; serie = 0; ui.maj('score', 0); ui.maj('vies', '♥♥♥'); ui.maj('serie', 0); nouvelleQuestion(); }

ui.init({ titre: 'Kosa in shoz ?' });
ui.stat('score', 'Score', 0);
ui.stat('serie', 'Série', 0);
ui.stat('vies', 'Vies', '♥♥♥');
protegerZones();
son.ambiance('mer');
ui.chargementFini();
ui.ecran({
  titre: 'Kosa in shoz ?', sousTitre: 'Devinettes de La Réunion',
  texte: 'Lis la devinette et touche le bon objet avant la fin du temps. Plus tu réponds vite, plus tu gagnes de points. Enchaîne les bonnes réponses pour multiplier ton score !',
  info: '« Kosa in shoz ? » est la formule qui lance traditionnellement les devinettes créoles. Les devinettes de ce jeu ont été écrites pour Kwélafé.',
  boutons: [{ id: 'ok', texte: 'Jouer' }],
}).then(nouvellePartie);
