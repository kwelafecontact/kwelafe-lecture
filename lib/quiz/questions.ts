// Questions du quiz La Réunion (faits vérifiés, sources : Parc national, INSEE, Région Réunion)
export type Question = { q: string; r: string[]; ok: number; info: string; theme: "nature" | "histoire" | "culture" | "creole" };

export const QUESTIONS: Question[] = [
  { q: "Quel est le point culminant de La Réunion ?", r: ["Le piton de la Fournaise", "Le piton des Neiges", "Le Maïdo", "Le Grand Bénare"], ok: 1, info: "Le piton des Neiges culmine à 3 070 m.", theme: "nature" },
  { q: "Combien de cirques compte l'île ?", r: ["2", "3", "4", "5"], ok: 1, info: "Cilaos, Salazie et Mafate.", theme: "nature" },
  { q: "Quel cirque n'est accessible par aucune route ?", r: ["Cilaos", "Salazie", "Mafate", "Aucun"], ok: 2, info: "On rejoint Mafate à pied ou en hélicoptère.", theme: "nature" },
  { q: "Comment s'appelle l'oiseau blanc à longue queue, emblème de l'île ?", r: ["Le tuit-tuit", "Le paille-en-queue", "Le papangue", "Le merle péi"], ok: 1, info: "Le paille-en-queue (Phaethon lepturus).", theme: "nature" },
  { q: "Le papangue est…", r: ["Un poisson", "Un rapace", "Un lézard", "Un papillon"], ok: 1, info: "Le busard de Maillard, seul rapace nicheur de l'île.", theme: "nature" },
  { q: "En quelle année les pitons, cirques et remparts sont-ils inscrits au patrimoine mondial de l'UNESCO ?", r: ["1998", "2004", "2010", "2016"], ok: 2, info: "Inscription en août 2010.", theme: "nature" },
  { q: "Quelle vanille est cultivée à La Réunion ?", r: ["Vanille de Tahiti", "Vanille Bourbon", "Vanille du Mexique", "Vanille des Andes"], ok: 1, info: "La vanille Bourbon, Vanilla planifolia.", theme: "culture" },
  { q: "Qui a découvert la pollinisation manuelle de la vanille en 1841 ?", r: ["Edmond Albius", "Roland Garros", "Juliette Dodu", "Mahé de La Bourdonnais"], ok: 0, info: "Edmond Albius, âgé de 12 ans, alors esclave.", theme: "histoire" },
  { q: "En quelle année l'esclavage est-il aboli à La Réunion ?", r: ["1794", "1815", "1848", "1870"], ok: 2, info: "Décret de 1848, appliqué le 20 décembre.", theme: "histoire" },
  { q: "Comment s'appelle la fête du 20 décembre ?", r: ["La fête de la vanille", "Fèt Kaf", "Le Dipavali", "La fête du letchi"], ok: 1, info: "Fèt Kaf célèbre l'abolition de l'esclavage.", theme: "histoire" },
  { q: "Quel était l'ancien nom de l'île ?", r: ["Île de France", "Île Bourbon", "Île Maurice", "Île Rodrigues"], ok: 1, info: "Île Bourbon, nom porté à plusieurs reprises.", theme: "histoire" },
  { q: "Quel aviateur réunionnais a le premier traversé la Méditerranée en avion ?", r: ["Roland Garros", "Louis Blériot", "Jean Mermoz", "Henri Guillaumet"], ok: 0, info: "Roland Garros, né à Saint-Denis, en 1913.", theme: "histoire" },
  { q: "Quelle est la préfecture de La Réunion ?", r: ["Saint-Pierre", "Saint-Paul", "Saint-Denis", "Le Port"], ok: 2, info: "Saint-Denis est le chef-lieu.", theme: "culture" },
  { q: "Combien de communes compte l'île ?", r: ["18", "24", "32", "40"], ok: 1, info: "24 communes.", theme: "culture" },
  { q: "Quel instrument est un hochet plat fait de tiges de fleur de canne ?", r: ["Le roulèr", "Le kayamb", "Le bob", "Le piker"], ok: 1, info: "Le kayamb accompagne le maloya.", theme: "culture" },
  { q: "Le maloya est inscrit au patrimoine immatériel de l'UNESCO depuis…", r: ["2001", "2009", "2015", "2020"], ok: 1, info: "Inscription en 2009.", theme: "culture" },
  { q: "Le cari se mange le plus souvent avec…", r: ["Des frites", "Du riz", "Du pain", "Des pâtes"], ok: 1, info: "Riz, grains et rougail.", theme: "culture" },
  { q: "Le bouchon, c'est…", r: ["Un dessert", "Une bouchée vapeur farcie", "Une boisson", "Un fruit"], ok: 1, info: "D'origine chinoise, souvent servi avec sauce soja.", theme: "culture" },
  { q: "Que veut dire « marmay » ?", r: ["Les enfants", "Les grands-parents", "Le marché", "La maison"], ok: 0, info: "Marmay : les enfants.", theme: "creole" },
  { q: "Que veut dire « gramoun » ?", r: ["Un enfant", "Une personne âgée", "Un chien", "Un voisin"], ok: 1, info: "Gramoun : une personne âgée, avec respect.", theme: "creole" },
  { q: "« Kosa i lé ? » veut dire…", r: ["Où es-tu ?", "Qu'est-ce que c'est ?", "Comment ça va ?", "Quelle heure est-il ?"], ok: 1, info: "Formule des devinettes, les sirandanes.", theme: "creole" },
  { q: "Un « tangue », c'est…", r: ["Un poisson", "Un petit mammifère à piquants", "Un oiseau", "Un insecte"], ok: 1, info: "Le tangue ressemble à un hérisson.", theme: "creole" },
  { q: "Que veut dire « zoreil » ?", r: ["Une oreille seulement", "Un Français de métropole", "Un pêcheur", "Un fruit"], ok: 1, info: "Surnom donné aux métropolitains.", theme: "creole" },
  { q: "Le « kaz », c'est…", r: ["La maison", "La voiture", "L'école", "Le jardin"], ok: 0, info: "Kaz : la maison.", theme: "creole" },
  { q: "Quel volcan est l'un des plus actifs du monde ?", r: ["Le piton des Neiges", "Le piton de la Fournaise", "Le piton Maïdo", "Le Dimitile"], ok: 1, info: "Il entre en éruption en moyenne près d'une fois par an.", theme: "nature" },
  { q: "Quelle tortue vient pondre parfois sur les plages de l'île ?", r: ["La tortue verte", "La tortue géante", "La tortue d'eau douce", "La tortue luth uniquement"], ok: 0, info: "Kélonia à Saint-Leu étudie et protège les tortues marines.", theme: "nature" },
  { q: "Quelle plante a longtemps été la grande culture de l'île ?", r: ["Le café", "La canne à sucre", "Le blé", "Le riz"], ok: 1, info: "La canne domine depuis le XIXe siècle.", theme: "histoire" },
  { q: "Les baleines à bosse viennent près des côtes entre…", r: ["Janvier et mars", "Juin et octobre", "Novembre et décembre", "Toute l'année"], ok: 1, info: "Elles viennent pendant l'hiver austral.", theme: "nature" },
];

export function melanger<T>(t: T[]): T[] { const a = [...t]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
