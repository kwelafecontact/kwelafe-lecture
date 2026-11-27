// Série « Mémoire et transmission » (Kwélafé Éducation, nov. 2026).
// Faits vérifiés et recoupés : Portail histoire et mémoires de l'esclavage à La Réunion (Département),
// INSEE (repères historiques), Archives départementales, Sénat, Ministère de la Culture, UNESCO.
// Règle : aucun fait inventé ; les récits non attestés par les archives sont présentés comme tradition.

export type Evenement = { id: string; tri: number; date: string; texte: string; savoir: string };

export const EVENEMENTS: Record<string, Evenement> = {
  "1663": { id: "1663", tri: 1663.0, date: "1663", texte: "Louis Payen, un autre Français et dix Malgaches s'installent dans l'île.", savoir: "Arrivés de Madagascar, ils forment le premier peuplement durable de l'île, alors inhabitée." },
  "1715": { id: "1715", tri: 1715.0, date: "1715", texte: "Le café de Moka est introduit dans l'île.", savoir: "La culture du café réclame beaucoup de bras : le nombre de personnes réduites en esclavage augmente fortement." },
  "1723": { id: "1723", tri: 1723.9, date: "1723", texte: "Des lettres patentes, dites Code noir, encadrent l'esclavage à Bourbon.", savoir: "Ce texte de décembre 1723 considère les personnes esclavisées comme des biens. Il reste en vigueur jusqu'en 1848." },
  "1738": { id: "1738", tri: 1738.0, date: "1738", texte: "Saint-Denis remplace Saint-Paul comme capitale.", savoir: "Saint-Paul avait été le premier centre de la colonie. Saint-Denis est toujours le chef-lieu aujourd'hui." },
  "1794": { id: "1794", tri: 1794.0, date: "1794", texte: "L'île Bourbon prend le nom d'île de La Réunion.", savoir: "Le nouveau nom date de la Révolution française. L'île changera encore de nom avant de redevenir La Réunion en 1848." },
  "1810": { id: "1810", tri: 1810.0, date: "1810", texte: "Les Anglais prennent possession de l'île.", savoir: "L'occupation anglaise dure jusqu'en 1815, pendant les guerres napoléoniennes." },
  "1811": { id: "1811", tri: 1811.85, date: "1811", texte: "Des esclaves se révoltent à Saint-Leu.", savoir: "En novembre 1811, des hommes réduits en esclavage se soulèvent pour leur liberté. La révolte est durement réprimée." },
  "1848a": { id: "1848a", tri: 1848.32, date: "27 avril 1848", texte: "À Paris, un décret abolit l'esclavage dans les colonies françaises.", savoir: "Le décret est signé par le Gouvernement provisoire de la République. Il faut encore l'appliquer dans chaque colonie." },
  "1848o": { id: "1848o", tri: 1848.78, date: "13 octobre 1848", texte: "Sarda Garriga arrive à La Réunion avec le décret d'abolition.", savoir: "Commissaire général de la République, il prépare l'abolition malgré la pression des colons qui demandent un délai." },
  "1848d": { id: "1848d", tri: 1848.97, date: "20 décembre 1848", texte: "L'abolition de l'esclavage est proclamée à La Réunion.", savoir: "Plus de 60 000 personnes deviennent libres et citoyennes. C'est le 20 désanm, la fête de la liberté." },
  "1946": { id: "1946", tri: 1946.2, date: "19 mars 1946", texte: "La Réunion devient un département français.", savoir: "La loi de départementalisation est votée le 19 mars 1946. On a fêté ses 80 ans en 2026." },
  "1983": { id: "1983", tri: 1983.5, date: "1983", texte: "Le 20 décembre devient un jour férié à La Réunion.", savoir: "La loi du 30 juin 1983 crée la commémoration de l'abolition. Un décret de novembre 1983 fixe la date du 20 décembre pour La Réunion." },
  "2001": { id: "2001", tri: 2001.4, date: "2001", texte: "La loi Taubira reconnaît la traite et l'esclavage comme crime contre l'humanité.", savoir: "Cette loi demande aussi que l'histoire de l'esclavage ait sa place dans les programmes scolaires." },
  "2009": { id: "2009", tri: 2009.8, date: "2009", texte: "Le maloya est inscrit au patrimoine culturel immatériel de l'humanité.", savoir: "Autrefois chant des esclaves, le maloya est devenu une musique qui exprime l'identité réunionnaise." },
  "2010": { id: "2010", tri: 2010.6, date: "2010", texte: "Les Pitons, cirques et remparts sont inscrits au patrimoine mondial.", savoir: "Inscrits par l'UNESCO le 1er août 2010 pour leurs paysages et leur biodiversité exceptionnels." },
};

/** Lieux de mémoire du marronnage : le lieu et ce qu'il rappelle. */
export type LieuLibre = { lieu: string; sens: string; savoir: string };
export const LIEUX_LIBRES: LieuLibre[] = [
  { lieu: "Le piton d'Anchaing", sens: "Selon la tradition, un marron venu de Madagascar y vécut libre avec Héva.", savoir: "Aucune archive ne parle de ce couple : leur histoire est arrivée jusqu'à nous par la tradition orale, à Salazie." },
  { lieu: "Le Cimendef", sens: "Ce sommet entre Salazie et Mafate porte le nom d'un chef marron.", savoir: "Le Cimendef culmine à 2 228 mètres. La crête qui en descend s'appelle la crête de la Marianne." },
  { lieu: "Le cirque de Mafate", sens: "Ce cirque sans route porte le nom d'un chef marron.", savoir: "Les marrons trouvaient refuge dans les Hauts, loin des habitations du littoral." },
  { lieu: "Le Dimitile", sens: "Massif du sud où se trouvait un camp marron.", savoir: "Le Dimitile, au-dessus de l'Entre-Deux, porte le nom d'un marron. On y a reconstitué un camp marron." },
  { lieu: "La crête de la Marianne", sens: "Cette crête porte le nom d'une femme marronne.", savoir: "Les noms des marronnes sont moins connus que ceux des chefs, mais ils restent dans les montagnes." },
  { lieu: "Îlet à Cordes", sens: "Son nom viendrait des cordes utilisées pour atteindre ce plateau.", savoir: "Dans le cirque de Cilaos, les esclaves en fuite grimpaient avec des cordes pour échapper aux poursuites." },
  { lieu: "La statue d'Héva à Hell-Bourg", sens: "Une sculpture de 2000 qui rend hommage à une femme marronne.", savoir: "Elle a été sculptée par Gilbert Clain et se trouve sur la place de Hell-Bourg, dans le cirque de Salazie." },
  { lieu: "Les cavernes des Hauts", sens: "Des fouilles y ont retrouvé des traces de la vie des marrons.", savoir: "Depuis une dizaine d'années, des archéologues fouillent des grottes et abris, comme la Caverne Lépinay ou la Vallée Secrète." },
];

/** Niveaux du jeu « Sur les traces des libres » : frise à remettre dans l'ordre, ou lieux à relier. */
export type NiveauTraces = { type: "frise"; ids: string[] } | { type: "lieux"; idx: number[] };
export const NIVEAUX_TRACES: NiveauTraces[] = [
  { type: "frise", ids: ["1663", "1723", "1811", "1848d"] },
  { type: "lieux", idx: [0, 1, 2, 3] },
  { type: "frise", ids: ["1715", "1738", "1794", "1810"] },
  { type: "frise", ids: ["1848a", "1848o", "1848d", "1946"] },
  { type: "lieux", idx: [4, 5, 6, 7] },
  { type: "frise", ids: ["1946", "1983", "2001", "2009"] },
  { type: "frise", ids: ["1663", "1738", "1811", "1983", "2010"] },
  { type: "lieux", idx: [0, 2, 5, 6] },
  { type: "frise", ids: ["1715", "1794", "1848d", "2001", "2009"] },
  { type: "lieux", idx: [1, 3, 4, 7] },
  { type: "frise", ids: ["1723", "1810", "1848a", "1946", "2001", "2010"] },
  { type: "frise", ids: ["1663", "1715", "1738", "1811", "1848o", "1983"] },
];

/** Kabar Marmay : défis de parole libres (en plus des sirandanes, expressions et mots tirés des livres). */
export const DEFIS_PAROLE: { niveau: 1 | 2 | 3; texte: string }[] = [
  { niveau: 1, texte: "Dis bonjour en créole à tout le monde, bien fort et avec le sourire." },
  { niveau: 1, texte: "Dis ton prénom et ton fruit péi préféré, en créole ou en français." },
  { niveau: 1, texte: "Cite trois animaux de La Réunion, le plus vite possible." },
  { niveau: 1, texte: "Dis le nom de ton quartier et une chose que tu aimes là-bas." },
  { niveau: 1, texte: "Cite trois plats péi que tu aimes manger." },
  { niveau: 2, texte: "Raconte en trois phrases ce que tu as fait ce week-end." },
  { niveau: 2, texte: "Décris ton endroit préféré de l'île sans dire son nom : les autres devinent." },
  { niveau: 2, texte: "Présente un objet lontan comme si tu le vendais au marché forain." },
  { niveau: 2, texte: "Explique à quelqu'un comment on prépare un plat que tu connais." },
  { niveau: 2, texte: "Dis pourquoi le 20 décembre est un jour important à La Réunion." },
  { niveau: 3, texte: "Invente le début d'un zistoir qui commence par « Lontan, lontan… »." },
  { niveau: 3, texte: "Fais un petit fonnkèr de deux phrases sur la mer ou la montagne." },
  { niveau: 3, texte: "Défends ton cirque préféré en une minute : Cilaos, Salazie ou Mafate ?" },
  { niveau: 3, texte: "Raconte un souvenir avec ta famille, en le disant comme un conteur." },
  { niveau: 3, texte: "Explique à un touriste pourquoi il doit goûter un cari péi." },
];

/** Nout Léritaz : questions à poser à un gramoun (ou à un proche plus âgé). */
export const QUESTIONS_OBJET = [
  "As-tu déjà utilisé {nom} ? À quoi ça servait, à la maison ?",
  "Qui s'en servait chez toi, et à quel moment de la journée ?",
  "Raconte-moi un souvenir avec {nom}.",
];
export const QUESTIONS_RECETTE = [
  "Qui cuisinait « {nom} » quand tu étais petit ?",
  "Quels ingrédients faut-il, et où les trouvait-on lontan ?",
  "Pour quelle occasion préparait-on ce plat ?",
];
export const QUESTIONS_VIE = [
  { theme: "L'école lontan", emoji: "🎒", qs: ["Comment allais-tu à l'école ?", "Qu'est-ce que tu emportais dans ton cartable ?", "Quel jeu faisiez-vous à la récréation ?"] },
  { theme: "Les jeux lontan", emoji: "🪀", qs: ["À quoi jouais-tu quand tu avais mon âge ?", "Avec quoi fabriquiez-vous vos jouets ?", "Peux-tu m'apprendre un de ces jeux ?"] },
  { theme: "Les cyclones", emoji: "🌀", qs: ["Te souviens-tu d'un gros cyclone ?", "Comment la famille se préparait-elle ?", "Qu'avez-vous fait après le passage du cyclone ?"] },
  { theme: "La langue créole", emoji: "🗣️", qs: ["Quel mot créole n'entend-on plus beaucoup aujourd'hui ?", "Connais-tu une sirandane ? Pose-la-moi !", "Quel proverbe te disait-on quand tu étais petit ?"] },
  { theme: "Les fêtes", emoji: "🎉", qs: ["Comment fêtiez-vous Noël ou le Nouvel An ?", "Que mangeait-on ce jour-là ?", "Quelle musique écoutait-on ?"] },
  { theme: "Le quartier", emoji: "🏘️", qs: ["À quoi ressemblait ton quartier quand tu étais petit ?", "Où allait-on chercher l'eau ?", "Qu'est-ce qui a le plus changé depuis ?"] },
];

export const BONUS_LERITAZ = [
  "Demande-lui un mot créole qu'il ou elle utilisait souvent, et ce qu'il veut dire.",
  "Demande-lui de te montrer un geste d'autrefois (piler, tresser, laver, cuisiner…).",
  "Demande-lui une sirandane ou un proverbe de son enfance.",
  "Demande-lui le nom du lieu où il ou elle a grandi, et pourquoi il s'appelle ainsi.",
  "Demande-lui une photo ancienne et ce qu'elle raconte.",
  "Demande-lui ce qu'il ou elle aimerait que les enfants d'aujourd'hui n'oublient pas.",
];
