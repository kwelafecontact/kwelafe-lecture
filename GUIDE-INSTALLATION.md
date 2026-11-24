# Kwélafé Lecture : guide d'installation (Cloudflare)

Tout se passe sur **un seul service : Cloudflare**. L'application, la base de données (D1) et le stockage des livres (R2) y sont regroupés. Aucune ligne de commande n'est nécessaire : tout se fait dans le navigateur.

Compte environ 1 h la première fois. Tu peux aussi donner ce dossier à Codex en lui demandant : « Suis GUIDE-INSTALLATION.md avec moi, étape par étape ».

---

## Combien ça coûte

| Service | Pendant les tests | Avec des clients |
|---|---|---|
| Cloudflare Workers (l'application) | Gratuit | **5 $ / mois conseillés** (formule Workers Paid) |
| Cloudflare R2 (les livres) | Gratuit jusqu'à 10 Go | Gratuit jusqu'à 10 Go, puis 0,015 $ par Go |
| Cloudflare D1 (la base) | Gratuit | Gratuit (5 Go inclus) |
| GitHub (le code) | Gratuit | Gratuit |

Pourquoi 5 $ avec des clients : la formule gratuite limite le temps de calcul à 10 millisecondes par page affichée. C'est souvent trop court pour une application comme celle-ci, et certaines pages pourraient afficher une erreur. La formule à 5 $ supprime ce risque et inclut beaucoup plus de visites. Vérifie les tarifs sur cloudflare.com au moment de t'inscrire.

---

## Étape 1 : mettre le code sur GitHub

1. Crée un compte sur **github.com**, puis un dépôt **privé** nommé `kwelafe-lecture`.
2. Envoie-y tout le contenu de ce dossier (bouton « uploading an existing file »).

## Étape 2 : créer le compte Cloudflare, la base et le stockage

1. Crée un compte gratuit sur **dash.cloudflare.com**.
2. **Stockage R2** : ✓ déjà fait par Claude (bucket privé `kwelafe-livres`).
3. **Base D1** : ✓ déjà faite par Claude (base `kwelafe-lecture`, tables installées, identifiant déjà inscrit dans `wrangler.jsonc`).

## Étape 3 : mettre l'application en ligne (mode démonstration)

1. Cloudflare > **Workers & Pages** > **Créer** > **Importer un dépôt** (Import a repository) > connecte GitHub et choisis `kwelafe-lecture`.
2. Réglages de construction :
   - Commande de build : `npx opennextjs-cloudflare build`
   - Commande de déploiement : `npx opennextjs-cloudflare deploy`
3. Lance le déploiement. Cloudflare donne une adresse provisoire du type `https://kwelafe-lecture.ton-nom.workers.dev`.
4. Le secret de session est créé automatiquement par l'application (rien à saisir).
5. Ouvre l'adresse et touche « Me connecter ». En mode démo, tu entres directement avec l'accès éditeur.
6. **Mon compte > Gérer les livres** : importe 2 ou 3 livres (un EPUB interactif, un EPUB classique, un PDF), coche « Publié », puis teste sur ton iPhone et ton iPad, en portrait et en paysage.
   Fais l'import depuis Chrome sur ordinateur, c'est plus rapide.
7. Installe l'app sur ton téléphone : Safari > Partager > « Sur l'écran d'accueil ».

## Étape 4 : Shopify, connexion des clients (une seule chose à récupérer)

L'application lit les achats, les abonnements Appstle et les cadeaux **directement dans le compte du client** quand il se connecte. Aucune clé secrète Shopify n'est nécessaire.

1. Les nouveaux comptes clients sont déjà activés sur la boutique ✓.
2. Installe l'application gratuite **Headless** (Shopify App Store), puis **Créer un storefront** nommé « Kwélafé Lecture ».
3. Dans ce storefront : **Customer Account API > Gérer** :
   - Type de client : **Public**
   - URI de rappel : `https://kwelafe-lecture.kwelafe-contact.workers.dev/auth/callback` (puis plus tard `https://lire.kwelafeproduction.com/auth/callback`)
   - Origine JavaScript : `https://kwelafe-lecture.kwelafe-contact.workers.dev`
   - URL de déconnexion : `https://kwelafe-lecture.kwelafe-contact.workers.dev/bienvenue`
   - Autorisations : lecture des commandes et des abonnements du client.
4. Copie l'**ID client** (il n'est pas secret) et donne-le à Claude : il l'inscrit dans `wrangler.jsonc` (`SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID`) et passe `DEMO_MODE` à `"0"`.

## Étape 5 : webhooks (facultatif)

Sans webhook, les droits d'un client se mettent à jour à chaque connexion et toutes les 6 heures. Les codes cadeaux sont créés dès que l'acheteur ouvre l'application. Les webhooks Shopify ne sont donc plus indispensables.

## Étape 6 : abonnements Appstle

1. Dans Appstle, relie « Abonnement Kwélafé – Mensuel » et « Annuel » à un plan d'abonnement. Aujourd'hui aucun plan n'y est rattaché : ces produits ne peuvent pas être achetés.
2. Dans les réglages Appstle, ajoute une étiquette client automatique pour les abonnés actifs, par exemple `kwelafe-abonne`. Elle doit figurer dans `ABONNE_TAGS` (fichier `wrangler.jsonc`).
3. L'application reconnaît un abonné de deux façons : un contrat d'abonnement actif chez Shopify, **ou** une étiquette client listée dans `ABONNE_TAGS`.

## Étape 7 : l'adresse lire.kwelafeproduction.com et l'ouverture aux clients

1. Worker > **Paramètres > Domaines et routes** > **Ajouter un domaine personnalisé** : `lire.kwelafeproduction.com`.
   - Si ton domaine n'est pas géré par Cloudflare, Cloudflare t'indique l'enregistrement **CNAME** à ajouter chez ton gestionnaire de domaine (dans Shopify si le domaine a été acheté chez Shopify : Paramètres > Domaines > Gérer > Paramètres DNS).
2. Dans `wrangler.jsonc` (GitHub) : `APP_URL` = `https://lire.kwelafeproduction.com` et `DEMO_MODE` = `"0"`. Enregistre : Cloudflare redéploie automatiquement.
3. Passe à la formule **Workers Paid** (5 $ / mois) : Workers & Pages > Plans.

## Étape 8 : la boutique

1. Publie les produits « Cadeau Kwélafé Bibliothèque » 3, 6 et 12 mois (vérifie que le 12 mois est réglé « sans expédition »).
2. Ajoute « Ma bibliothèque » dans le menu de la boutique, avec un lien vers `https://lire.kwelafeproduction.com`.
3. Ajoute ce lien dans l'e-mail de confirmation de commande (Paramètres > Notifications).
4. Pour chaque livre importé, renseigne le lien du produit Shopify dans l'espace éditeur : c'est ce qui ouvre le livre aux clients qui l'ont acheté à l'unité.

---

## Tests à faire avant d'annoncer l'application

- [ ] Un client test achète un livre à l'unité : il le voit dans « Mes livres » après connexion.
- [ ] Un client test s'abonne : il voit tous les livres « Inclus ».
- [ ] Achat d'un cadeau 3 mois : le code apparaît dans « Mon compte » de l'acheteur, puis s'active sur un autre compte.
- [ ] EPUB interactif : les jeux fonctionnent, toucher un bouton ne tourne pas la page.
- [ ] iPad : une page en portrait, deux pages en paysage.
- [ ] La reprise de lecture fonctionne entre l'iPhone et l'iPad.

## Ce qui a été testé avant la livraison

Dans un Cloudflare simulé, avec des livres de test : import d'un EPUB interactif, d'un EPUB texte et d'un PDF ; jeu interactif fonctionnel sans tournage de page ; lien interne vers une autre page ; double page en paysage ; pagination du texte ; reprise de lecture ; carte « Continuer ma lecture » ; contenus refusés sans jeton valide. La connexion Shopify réelle et les abonnements restent à tester avec ta boutique (étapes 4 à 6).

## Ce qui n'est pas encore fait (version 2)

- Limite de 3 appareils par compte.
- Lecture hors connexion.
- Marque-pages avec notes.
- Envoi automatique du code cadeau par e-mail (pour l'instant, l'acheteur le retrouve dans « Mon compte »).
- Remplacer le paille-en-queue dessiné de l'écran d'accueil (`components/Oiseau.tsx`) et les icônes (`public/icone-*.png`) par tes illustrations officielles.

## Protection des livres

Aucune protection n'est parfaite sur le web. Mais ici, il n'y a aucun bouton de téléchargement. Le fichier complet n'est jamais transmis : les pages sont envoyées une par une, avec un lien valable 30 minutes. Le menu « Enregistrer l'image » est bloqué, et l'e-mail du lecteur apparaît discrètement en bas de chaque page.

---

### Pour Codex ou un développeur

- Test local : `npm install`, copier `.dev.vars.exemple` en `.dev.vars`, `npm run db:init:local`, puis `npm run preview` (http://localhost:8787).
- Déploiement en ligne de commande : `npx wrangler login`, `npm run db:init`, `npm run deploy`.
- Secrets : `npx wrangler secret put NOM`.

---

## Les jeux (rubrique « Jeux »)

- Les jeux sont dans `app/jeux/` (pages) et `lib/jeux/` (moteurs). Le premier jeu est **Koup Koup**, écrit en TypeScript avec Three.js (WebGL) : fruits péi modélisés en 3D par le code, vraie découpe, jus, taches et halo lumineux.
- Les records et le « panier » de fruits découverts sont enregistrés dans la table `scores_jeux` (migration `0003_jeux.sql`, déjà appliquée sur la base en ligne par Claude).
- Accès : abonnés, éditeur, ou tout le monde tant que `DEMO_MODE` vaut `1`.
- Sur un appareil trop lent, le jeu retire tout seul le halo lumineux et baisse la définition pour rester fluide.
