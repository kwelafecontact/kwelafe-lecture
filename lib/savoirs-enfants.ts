// Coin pédagogique des enfants : petites fiches vérifiées + mini-quiz.
// Sources : OVPF, Parc national, DEAL Réunion (Liste rouge UICN), SEOR, sites des musées.
export type Fiche = { emoji: string; titre: string; texte: string };
export type Question = { q: string; choix: string[]; ok: number };
export type Savoir = { id: string; titre: string; emoji: string; couleur: string; intro: string; fiches: Fiche[]; quiz: Question[] };

export const SAVOIRS: Savoir[] = [
  {
    id: "volcan", titre: "Le volcan", emoji: "🌋", couleur: "#d6332a",
    intro: "La Réunion est née de volcans. L'un d'eux est encore bien réveillé !",
    fiches: [
      { emoji: "🔥", titre: "Le Piton de la Fournaise", texte: "C'est le volcan actif de l'île. Son sommet monte à 2 632 mètres. C'est l'un des volcans les plus actifs du monde : il a connu plus de 200 éruptions en 350 ans." },
      { emoji: "🌊", titre: "Une lave qui coule", texte: "Ses éruptions sont surtout « effusives » : la lave est très chaude et coule comme une rivière de feu, au lieu d'exploser très fort." },
      { emoji: "🧱", titre: "L'Enclos Fouqué", texte: "Presque toutes les éruptions (environ 97 sur 100) se passent dans une grande cuvette autour du sommet, l'Enclos Fouqué. Les maisons sont donc rarement touchées." },
      { emoji: "🔭", titre: "Surveillé jour et nuit", texte: "Des scientifiques de l'Observatoire volcanologique du Piton de la Fournaise écoutent le volcan avec des appareils. Ils préviennent avant une éruption." },
      { emoji: "🏔️", titre: "Le Piton des Neiges", texte: "C'est le plus haut sommet de l'île, à plus de 3 000 mètres. Ce vieux volcan s'est endormi il y a très longtemps. Les trois cirques l'entourent : Mafate, Cilaos et Salazie." },
      { emoji: "🏛️", titre: "La Cité du Volcan", texte: "À Bourg-Murat, la Cité du Volcan est un musée pour découvrir, en jouant, comment fonctionne l'intérieur de la Terre." },
    ],
    quiz: [
      { q: "Comment s'appelle le volcan actif de La Réunion ?", choix: ["Le Piton des Neiges", "Le Piton de la Fournaise", "Le Grand Bénare"], ok: 1 },
      { q: "Où se passent presque toutes les éruptions ?", choix: ["Dans l'Enclos Fouqué", "Dans le lagon", "À Saint-Denis"], ok: 0 },
      { q: "Quel est le plus haut sommet de l'île ?", choix: ["Le Piton de la Fournaise", "Le Piton des Neiges", "Le Maïdo"], ok: 1 },
    ],
  },
  {
    id: "biodiversite", titre: "Les animaux de l'île", emoji: "🦎", couleur: "#2e9d4f",
    intro: "Certains animaux vivent ici et nulle part ailleurs dans le monde. On dit qu'ils sont endémiques.",
    fiches: [
      { emoji: "🐦", titre: "Le tuit-tuit", texte: "Ce petit oiseau gris ne vit qu'à La Réunion, dans la forêt de la Roche Écrite. Il est en danger, à cause des rats et des chats qui mangent ses œufs." },
      { emoji: "🦎", titre: "Le gecko vert de Manapany", texte: "Vert pomme avec des taches rouges, il vit dans le sud de l'île. Il est en danger critique : il a besoin qu'on protège les plantes où il habite." },
      { emoji: "🦅", titre: "Le papangue", texte: "C'est le seul rapace qui fait son nid à La Réunion. On le voit planer au-dessus des forêts et des champs." },
      { emoji: "🕊️", titre: "Le pétrel de Barau", texte: "Il pêche en mer, mais fait son nid tout là-haut, sur le Piton des Neiges, entre 2 700 et 2 900 mètres d'altitude !" },
      { emoji: "🤍", titre: "Le paille-en-queue", texte: "Oiseau blanc aux deux longues plumes de queue, il fait son nid dans les falaises et les remparts. C'est un symbole de l'île." },
      { emoji: "🐢", titre: "La tortue verte", texte: "Elle nage dans l'océan autour de l'île. Elle est en danger. À Saint-Leu, Kélonia soigne et fait connaître les tortues marines." },
    ],
    quiz: [
      { q: "Que veut dire « endémique » ?", choix: ["Qui vit seulement ici", "Qui vole très haut", "Qui mange des fruits"], ok: 0 },
      { q: "Où le pétrel de Barau fait-il son nid ?", choix: ["Sur la plage", "Sur le Piton des Neiges", "Dans les villes"], ok: 1 },
      { q: "Qui menace les œufs du tuit-tuit ?", choix: ["Les poissons", "Les rats et les chats", "Les papillons"], ok: 1 },
    ],
  },
  {
    id: "environnement", titre: "Protéger mon île", emoji: "🌿", couleur: "#1f8a7a",
    intro: "Des petits gestes de tous les jours aident la nature de La Réunion.",
    fiches: [
      { emoji: "🗑️", titre: "Pas de déchets dans les ravines", texte: "Quand il pleut fort, les ravines emportent tout vers la mer. Un déchet jeté dans une ravine finit souvent dans le lagon." },
      { emoji: "🐠", titre: "Le lagon est fragile", texte: "Les coraux sont des animaux vivants. Dans le lagon, on regarde avec les yeux, sans marcher sur les coraux et sans les toucher." },
      { emoji: "💡", titre: "Éteindre les lumières", texte: "Chaque année, de jeunes pétrels quittent leur nid la nuit. Les lumières des villes les attirent et les font tomber. Éteindre les lumières inutiles les aide à rejoindre la mer." },
      { emoji: "🌱", titre: "Les plantes qui envahissent", texte: "Certaines plantes venues d'ailleurs poussent si vite qu'elles étouffent les plantes de l'île. On plante plutôt des plantes indigènes dans son jardin." },
      { emoji: "🏞️", titre: "Le Parc national", texte: "Une grande partie de l'île est un Parc national. Depuis 2010, les « Pitons, cirques et remparts » sont inscrits au patrimoine mondial de l'UNESCO." },
      { emoji: "💧", titre: "L'eau est précieuse", texte: "On ferme le robinet en se brossant les dents : l'eau douce est précieuse, surtout pendant la saison sèche." },
    ],
    quiz: [
      { q: "Où finit un déchet jeté dans une ravine ?", choix: ["Il disparaît", "Souvent dans le lagon", "Dans le volcan"], ok: 1 },
      { q: "Pourquoi éteindre les lumières la nuit ?", choix: ["Pour aider les jeunes pétrels", "Pour faire peur aux geckos", "Pour faire pleuvoir"], ok: 0 },
      { q: "Dans le lagon, que fait-on avec les coraux ?", choix: ["On les ramasse", "On marche dessus", "On les regarde sans les toucher"], ok: 2 },
    ],
  },
  {
    id: "recettes", titre: "Gâteaux péi", emoji: "🍰", couleur: "#e07a1f",
    intro: "Des douceurs de chez nous, à préparer avec un adulte.",
    fiches: [
      { emoji: "🍠", titre: "Le gâteau patate", texte: "Il se fait avec de la patate douce cuite et écrasée, du sucre, des œufs, du beurre, un peu de lait et de la vanille. Moelleux et doux !" },
      { emoji: "🌿", titre: "La vanille de La Réunion", texte: "La vanille parfume beaucoup de gâteaux péi. C'est Edmond Albius, un jeune garçon de 12 ans, qui a trouvé en 1841 comment polliniser la fleur à la main." },
      { emoji: "🥥", titre: "Le bonbon coco", texte: "Noix de coco râpée cuite avec du sucre, puis mise en petits tas. Il faut un adulte : le sucre cuit est très chaud." },
      { emoji: "🍞", titre: "Le macatia", texte: "Un petit pain rond et un peu sucré, qu'on mange au goûter ou au petit déjeuner, parfois avec un morceau de chocolat." },
      { emoji: "🧑‍🍳", titre: "Recette : gâteau patate (avec un adulte)", texte: "1. Un adulte fait cuire 1 kg de patates douces, puis on les écrase. 2. On mélange avec 150 g de sucre, 2 œufs, 100 g de beurre fondu, 20 cl de lait et une gousse de vanille grattée. 3. On verse dans un moule beurré. 4. Au four 45 minutes à 180 °C, c'est l'adulte qui s'occupe du four." },
      { emoji: "🧼", titre: "Avant de cuisiner", texte: "On se lave les mains, on attache ses cheveux, et on demande toujours à un adulte pour le couteau, la plaque et le four." },
    ],
    quiz: [
      { q: "Avec quoi fait-on le gâteau patate ?", choix: ["Des pommes de terre", "De la patate douce", "Des carottes"], ok: 1 },
      { q: "Qui a trouvé comment polliniser la vanille à la main ?", choix: ["Edmond Albius", "Le roi Louis XIV", "Un pirate"], ok: 0 },
      { q: "Qui s'occupe du four ?", choix: ["L'enfant tout seul", "Le chat", "Un adulte"], ok: 2 },
    ],
  },
  {
    id: "musees", titre: "Les musées", emoji: "🏛️", couleur: "#7a2e8f",
    intro: "Des lieux pour découvrir l'histoire et la nature de La Réunion.",
    fiches: [
      { emoji: "🌋", titre: "La Cité du Volcan", texte: "À Bourg-Murat, pour tout comprendre du Piton de la Fournaise." },
      { emoji: "🐢", titre: "Kélonia", texte: "À Saint-Leu, l'observatoire des tortues marines : on y voit des tortues et on apprend à les protéger." },
      { emoji: "🏭", titre: "Stella Matutina", texte: "À Saint-Leu, dans une ancienne usine sucrière, pour découvrir l'histoire de la canne à sucre et de l'île." },
      { emoji: "🦋", titre: "Le Muséum d'histoire naturelle", texte: "À Saint-Denis, dans le Jardin de l'État : des animaux, des insectes et des oiseaux de La Réunion et de l'océan Indien." },
      { emoji: "📜", titre: "Le musée de Villèle", texte: "À Saint-Gilles-les-Hauts, un musée d'histoire qui raconte notamment l'esclavage à La Réunion." },
      { emoji: "⚓", titre: "Le lazaret de la Grande Chaloupe", texte: "Entre Saint-Denis et La Possession : c'est là que les nouveaux arrivants restaient en quarantaine, il y a longtemps." },
    ],
    quiz: [
      { q: "Où peut-on voir des tortues marines ?", choix: ["À Kélonia", "À la Cité du Volcan", "Au lazaret"], ok: 0 },
      { q: "Stella Matutina raconte l'histoire de…", choix: ["La canne à sucre", "Les dinosaures", "La neige"], ok: 0 },
      { q: "Où se trouve le Muséum d'histoire naturelle ?", choix: ["À Cilaos", "À Saint-Denis", "À Saint-Pierre"], ok: 1 },
    ],
  },
  {
    id: "lontan", titre: "Les objets lontan", emoji: "🏺", couleur: "#9a6a3a",
    intro: "Comment vivaient nos grands-parents, avant l'électricité partout ?",
    fiches: [
      { emoji: "🔥", titre: "Le fer à repasser à charbon", texte: "On mettait des braises dans le fer pour le chauffer. Il était lourd et il fallait faire très attention." },
      { emoji: "🪵", titre: "Le pilon", texte: "Un grand mortier en bois avec un gros bâton : on pilait le riz, le maïs ou les épices pour la cuisine." },
      { emoji: "🧺", titre: "Le van", texte: "Un grand plateau tressé. On secouait le riz dessus pour enlever les petites saletés et les grains abîmés." },
      { emoji: "🪔", titre: "La lampe à pétrole", texte: "Le soir, avant l'électricité dans toutes les maisons, on s'éclairait avec une petite flamme et une mèche." },
      { emoji: "🍲", titre: "La cuisine au feu de bois", texte: "On cuisinait le cari dans une marmite posée sur trois pierres, au feu de bois. Le goût fumé est resté célèbre !" },
      { emoji: "🌴", titre: "Le vacoa", texte: "Avec les feuilles de vacoa, on tressait des paniers, des sacs, des chapeaux et des nattes pour s'asseoir ou dormir." },
    ],
    quiz: [
      { q: "À quoi servait le van ?", choix: ["À trier le riz", "À se coiffer", "À pêcher"], ok: 0 },
      { q: "Comment chauffait-on le vieux fer à repasser ?", choix: ["Avec de l'électricité", "Avec des braises", "Au soleil"], ok: 1 },
      { q: "Avec quoi tressait-on des paniers ?", choix: ["Des feuilles de vacoa", "Du plastique", "Des fils de fer"], ok: 0 },
    ],
  },
];
