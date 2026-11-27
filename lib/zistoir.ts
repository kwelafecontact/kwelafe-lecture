// Fabrique à zistoir péi : l'enfant choisit un héros, un lieu, un compagnon et un objet, puis lit son histoire.
export type Choix = { id: string; nom: string; emoji: string };
export const HEROS: (Choix & { il: string; le: string })[] = [
  { id: "lina", nom: "Lina", emoji: "👧🏽", il: "elle", le: "la" },
  { id: "noa", nom: "Noa", emoji: "👦🏽", il: "il", le: "le" },
  { id: "timeo", nom: "Timéo", emoji: "🧢", il: "il", le: "le" },
];
export const LIEUX: (Choix & { decor: string; defi: string; fin: string })[] = [
  { id: "volcan", nom: "le volcan", emoji: "🌋", decor: "au pied du Piton de la Fournaise, où la terre est noire et les fougères toutes douces", defi: "un brouillard épais tombe d'un coup sur le sentier", fin: "le cratère s'allume en orange, comme une grande lampe pour leur dire au revoir" },
  { id: "lagon", nom: "le lagon", emoji: "🏝️", decor: "au bord du lagon de L'Hermitage, où l'eau est claire comme une vitre", defi: "la marée monte et cache le chemin de sable", fin: "une tortue verte sort la tête de l'eau pour les saluer" },
  { id: "mafate", nom: "Mafate", emoji: "⛰️", decor: "dans le cirque de Mafate, où l'on marche à pied entre les îlets", defi: "le sentier se sépare en trois et personne ne sait lequel prendre", fin: "les gramoun de l'îlet leur offrent un bon café et des bonbons piment" },
  { id: "foret", nom: "la forêt de Bébour", emoji: "🌳", decor: "dans la forêt de Bébour-Bélouve, où les grands tamarins des Hauts dansent avec le vent", defi: "la pluie se met à tomber, fariné d'abord, puis très fort", fin: "un arc-en-ciel se pose juste au-dessus de la forêt" },
];
export const COMPAGNONS: (Choix & { aide: string })[] = [
  { id: "pailleenqueue", nom: "un paille-en-queue", emoji: "🐦", aide: "s'envole très haut, regarde partout, puis revient montrer le bon chemin avec sa longue queue blanche" },
  { id: "tangue", nom: "un petit tang", emoji: "🦔", aide: "renifle le sol, trouve une trace et trottine devant en faisant de petits bruits" },
  { id: "tortue", nom: "une tortue", emoji: "🐢", aide: "avance doucement, sans jamais se presser, et rappelle à tout le monde que ti pa, ti pa, on arrive" },
  { id: "gecko", nom: "un gecko vert", emoji: "🦎", aide: "grimpe sur un tronc, voit loin, et fait signe avec sa petite patte" },
];
export const OBJETS: (Choix & { usage: string })[] = [
  { id: "lanterne", nom: "une lanterne", emoji: "🏮", usage: "allume la lanterne, et sa lumière douce chasse la peur" },
  { id: "carte", nom: "une vieille carte", emoji: "🗺️", usage: "déplie la vieille carte de gramoun, et le chemin apparaît, dessiné à la main" },
  { id: "tambour", nom: "un petit roulèr", emoji: "🥁", usage: "joue quelques notes de maloya sur le petit roulèr, et tout le monde reprend courage" },
  { id: "panier", nom: "un panier de goûter", emoji: "🧺", usage: "ouvre le panier : bouchons, samoussas et letchis donnent des forces à toute l'équipe" },
];

export function histoire(h: (typeof HEROS)[number], l: (typeof LIEUX)[number], c: (typeof COMPAGNONS)[number], o: (typeof OBJETS)[number]) {
  const Il = h.il[0].toUpperCase() + h.il.slice(1);
  return {
    titre: `${h.nom} et ${c.nom} à ${l.nom}`,
    pages: [
      `Oté ! Ce matin-là, ${h.nom} se réveille avec une grande envie d'aventure. Dans son sac, ${h.il} glisse ${o.nom}. « On ne sait jamais », dit sa gramoun en souriant.`,
      `${Il} part ${l.decor}. En chemin, ${h.il} rencontre ${c.nom}. « Ou vé vien avèk moin ? » demande ${h.nom}. Et voilà nos deux amis qui avancent ensemble.`,
      `Mais soudain, ${l.defi}. ${h.nom} s'arrête. ${Il} a un petit peu peur. « Koman nou va fé ? »`,
      `Alors ${c.nom} ${c.aide}. Et ${h.nom} ${o.usage}.`,
      `Ensemble, ils retrouvent leur chemin. Et au moment de rentrer, ${l.fin}. ${h.nom} sourit : « Lé gayar, la vi ! »`,
      `Le soir, ${h.nom} raconte tout à sa famille. Et toi, avec qui partirais-tu à l'aventure ?`,
    ],
  };
}
