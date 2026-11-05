

# Kadea Chat

Application web de messagerie développée dans le cadre du projet de fin de formation **Kadea Academy**. Kadea Chat permet aux utilisateurs d’échanger des messages dans des conversations privées ou des groupes, depuis un navigateur.

## Liens du projet

- **Application hébergée :** https://kadea-chat-3ygn.onrender.com
- **Dépôt GitHub :** [https://github.com/ChristianImbha/Kadea-Chat](https://github.com/ChristianImbha/Kadea-Chat)
- **Dépôt GitHub :**[https://github.com/kadea-academy-learners/26-01-kd-dev-web-matin-c-mon-thu-kin-capstone-kadea-chat-christianimbha](https://github.com/kadea-academy-learners/26-01-kd-dev-web-matin-c-mon-thu-kin-capstone-kadea-chat-christianimbha)

## Technologies utilisées

- AdonisJS 7
- Edge
- PostgreSQL
- TypeScript
- HTML, CSS et JavaScript

## Fonctionnalités

### Comptes et authentification

- [x] Inscription et connexion
- [x] Déconnexion
- [x] Confirmation de l’adresse e-mail
- [x] Réinitialisation du mot de passe
- [x] Modification du profil et de la photo

### Conversations et messages

- [x] Conversations privées et de groupe
- [x] Affichage de la liste des conversations
- [x] Envoi et conservation des messages
- [x] Suppression d’un message — à confirmer
- [x] Suppression d’une conversation de sa propre liste
- [x] Réception des messages en temps réel sans rechargement — à confirmer

### Interface

- [x] Interface de messagerie adaptée aux écrans d’ordinateur et de téléphone
- [x] Affichage des conversations et de l’historique des messages


## Prérequis

Avant de commencer, installez :

- Node.js et npm
- PostgreSQL
- Git

## Installation en local

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/ChristianImbha/Kadea-Chat.git
   cd Kadea-Chat
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Créez un fichier `.env` à partir du fichier `.env.example`, s’il est présent :

   ```bash
   cp .env.example .env
   ```

   Sous Windows, vous pouvez aussi copier `.env.example` manuellement et nommer la copie `.env`.

4. Configurez les variables d’environnement décrites ci-dessous. Créez également une base de données PostgreSQL correspondant à la configuration.

5. Exécutez les migrations :

   ```bash
   node ace migration:run
   ```

6. Démarrez l’application en mode développement :

   ```bash
   npm run dev
   ```

   Ouvrez ensuite l’adresse locale affichée dans le terminal.

## Variables d’environnement

Renseignez les variables nécessaires dans votre fichier `.env`. **Ne publiez jamais les valeurs secrètes** et ne commitez pas ce fichier.

| Variable       | Description                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `PORT`         | Port d’écoute de l’application                                                                   |
| `HOST`         | Adresse d’écoute du serveur                                                                      |
| `APP_KEY`      | Clé secrète de l’application AdonisJS                                                            |
| `NODE_ENV`     | Environnement d’exécution                                                                        |
| `DB_HOST`      | Hôte PostgreSQL                                                                                  |
| `DB_PORT`      | Port PostgreSQL                                                                                  |
| `DB_USER`      | Utilisateur PostgreSQL                                                                           |
| `DB_PASSWORD`  | Mot de passe PostgreSQL                                                                          |
| `DB_DATABASE`  | Nom de la base de données                                                                        |
| Variables SMTP | Paramètres du serveur e-mail utilisé pour la confirmation et la réinitialisation du mot de passe |

Consultez le fichier `.env.example` du projet pour connaître les noms exacts des variables utilisées par cette version de l’application.

## Base de données

La base de données PostgreSQL contient notamment les tables suivantes :

- `users` : comptes utilisateurs ;
- `conversations` : conversations privées ou de groupe ;
- `conversation_members` : association entre les utilisateurs et les conversations ;
- `messages` : messages envoyés dans les conversations ;
- `email_verification_tokens` : jetons utilisés pour confirmer les adresses e-mail.

Les relations principales sont les suivantes :

- Un utilisateur peut participer à plusieurs conversations.
- Une conversation peut contenir plusieurs membres.
- Une conversation peut contenir plusieurs messages.
- Chaque message est associé à une conversation et à son auteur.

**Le schéma détaillé de la base de données est disponible dans** [docs/database-schema.md](./docs/database-schema.md).



## Sécurité

- Les mots de passe ne doivent pas être stockés en clair.
- Les données saisies par les utilisateurs sont validées côté serveur.
- L’accès aux conversations et aux messages est réservé aux membres autorisés.
- Les variables secrètes sont conservées dans `.env`, qui ne doit pas être versionné.

## Auteur

Projet réalisé par **Christian Imbha** dans le cadre du projet de fin de formation en développement web à Kadea Academy.
