# Kadea Chat

Application web de messagerie développée dans le cadre du projet chef-d’œuvre de **Kadea Academy**. Kadea Chat permet aux utilisateurs d'échanger des messages dans des conversations privées ou des groupes depuis un navigateur.

## Liens du projet

- **Application hébergée :** https://kadea-chat-3ygn.onrender.com
- **Dépôt GitHub personnel :** https://github.com/ChristianImbha/Kadea-Chat
- **Dépôt GitHub Kadea Academy :** https://github.com/kadea-academy-learners/26-01-kd-dev-web-matin-c-mon-thu-kin-capstone-kadea-chat-christianimbha

## Fonctionnalités

### Comptes et authentification
- Inscription et connexion
- Déconnexion
- Confirmation de l'adresse e-mail
- Réinitialisation du mot de passe
- Modification du profil et de la photo

### Conversations et messages
- Conversations privées et de groupe
- Affichage de la liste des conversations
- Envoi et conservation des messages
- Suppression logique d'un message (`is_deleted`)
- Suppression d'une conversation de sa propre liste, selon le comportement implémenté dans l'application
- Réception des messages en temps réel sans rechargement
- Gestion des membres des groupes et contrôle d'accès aux conversations

### Interface
- Interface adaptée aux écrans d'ordinateur et de téléphone
- Affichage des conversations et de l'historique des messages

## Technologies utilisées

| Technologie | Utilisation |
|---|---|
| AdonisJS 7 | Framework backend suivant l'architecture MVC |
| TypeScript | Langage de programmation |
| Edge.js | Moteur de templates côté serveur |
| PostgreSQL | Base de données relationnelle |
| Lucid ORM | Modèles, relations et migrations |
| AdonisJS Auth | Authentification |
| AdonisJS Transmit | Communication en temps réel |
| AdonisJS Mail et Brevo API | Envoi des e-mails |
| Tailwind CSS 4 | Styles et interface responsive |
| Alpine.js | Interactions côté navigateur |
| Vite | Compilation des ressources frontend |
| Cloudinary | Gestion des images |
| Git et GitHub | Versionnement du code source |

## Prérequis

- Node.js 24 ou supérieur (voir `engines` dans `package.json`)
- npm
- PostgreSQL
- Git
- Un compte Brevo et une clé API pour l'envoi des e-mails
- Un compte Cloudinary pour la gestion des images

## Installation en local

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/ChristianImbha/Kadea-Chat.git
   cd Kadea-Chat
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Copier `.env.example` vers `.env` (sous Windows, effectuer la copie depuis l'Explorateur de fichiers ou utiliser PowerShell) :

   ```bash
   cp .env.example .env
   ```

4. Créer une base PostgreSQL et renseigner les variables de connexion dans `.env`.

5. Renseigner les clés Brevo et Cloudinary ainsi que les autres variables requises.

6. Exécuter les migrations :

   ```bash
   node ace migration:run
   ```

7. Démarrer l'application en développement :

   ```bash
   npm run dev
   ```

   Ouvrir l'URL locale affichée dans le terminal.

## Variables d'environnement

Créer le fichier `.env` à partir de `.env.example`. Les valeurs ci-dessous sont des exemples ou des champs à compléter ; elles ne sont pas des identifiants de production.

| Variable | Description |
|---|---|
| `TZ` | Fuseau horaire du processus |
| `PORT` | Port d'écoute de l'application |
| `HOST` | Adresse d'écoute du serveur |
| `NODE_ENV` | Environnement (`development`, `production` ou `test`) |
| `LOG_LEVEL` | Niveau de journalisation |
| `APP_KEY` | Clé secrète de l'application AdonisJS |
| `APP_URL` | URL de l'application |
| `SESSION_DRIVER` | Pilote de session (`cookie`, `memory` ou `database`) |
| `DB_HOST` | Hôte PostgreSQL |
| `DB_PORT` | Port PostgreSQL |
| `DB_USER` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `DB_DATABASE` | Nom de la base PostgreSQL |
| `MAIL_MAILER` | Transport e-mail ; la configuration actuelle attend `brevo` |
| `MAIL_FROM_NAME` | Nom affiché comme expéditeur |
| `MAIL_FROM_ADDRESS` | Adresse e-mail de l'expéditeur |
| `BREVO_API_KEY` | Clé API Brevo |
| `CLOUDINARY_CLOUD_NAME` | Nom du compte Cloudinary |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary |

**Sécurité :** ne jamais publier le fichier `.env`, les mots de passe ou les clés API. Le dépôt doit contenir uniquement `.env.example` avec des valeurs fictives ou vides.

### Envoi des e-mails

Kadea Chat utilise **AdonisJS Mail avec le transport Brevo API**. Brevo sert notamment à envoyer les e-mails de confirmation de compte et de réinitialisation du mot de passe. Cette application n'utilise pas le transport SMTP classique dans la configuration fournie.

### Gestion des images

Cloudinary est configuré pour la gestion des images de profil. Les identifiants Cloudinary doivent être fournis par variables d'environnement et conservés secrets.

## Base de données

La base utilise PostgreSQL et Lucid ORM. Les migrations sont conservées dans `database/migrations`.

Les principales tables métier sont :

- `users` : comptes, informations de profil et adresse e-mail vérifiée ;
- `conversations` : conversations privées ou de groupe et utilisateur créateur ;
- `conversation_members` : association entre les utilisateurs et les conversations, avec la référence facultative au dernier message lu ;
- `messages` : contenu des messages, conversation, auteur et indicateur de suppression ;
- `email_verification_tokens` : jetons de confirmation d'adresse e-mail ;
- `password_reset_tokens` : jetons de réinitialisation du mot de passe.

La table `adonis_schema`, si elle est présente dans la base, est une table technique utilisée par Lucid pour suivre les migrations.

Le diagramme relationnel et la description des relations sont disponibles dans [`docs/database-schema.md`](./docs/database-schema.md).

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer le serveur de développement avec HMR |
| `npm run build` | Construire l'application pour la production |
| `npm start` | Démarrer l'application construite |
| `npm test` | Exécuter les tests configurés |
| `npm run lint` | Vérifier le code avec ESLint |
| `npm run format` | Formater les fichiers avec Prettier |
| `npm run typecheck` | Vérifier les types TypeScript |

## Architecture du projet

L'application suit l'organisation MVC d'AdonisJS :

- `app/controllers` : réception des requêtes et orchestration des actions ;
- `app/models` : modèles Lucid et accès aux données ;
- `app/validators` : validation des données entrantes ;
- `app/middleware` : traitements exécutés avant les contrôleurs ;
- `resources/views` : vues Edge ;
- `resources/css` et `resources/js` : ressources frontend ;
- `database/migrations` : évolution du schéma PostgreSQL ;
- `config` et `start` : configuration et initialisation de l'application.

## Déploiement

L'application est hébergée sur Render. Les paramètres de production (base PostgreSQL, clé d'application, Brevo et Cloudinary) sont configurés dans l'environnement d'exécution de l'hébergeur et ne doivent pas être committés dans Git.

- **URL publique :** https://kadea-chat-3ygn.onrender.com

## Utilisation de l'intelligence artificielle

Les assistants d'intelligence artificielle utilisés, leur rôle et les parties concernées doivent être déclarés de manière transparente conformément aux consignes du projet chef-d'œuvre. L'auteur doit être capable d'expliquer et de justifier le code livré, y compris les parties réalisées avec assistance.

## Auteur

Projet réalisé par **Christian Imbha** dans le cadre du projet chef-d'œuvre en développement web à Kadea Academy.
