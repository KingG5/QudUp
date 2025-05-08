# Guide de Déploiement sur Cloudflare pour QudUP

Ce guide vous aidera à déployer votre application QudUP sur l'infrastructure Cloudflare. Nous allons déployer à la fois le frontend (Pages) et le backend (Workers + D1).

## Prérequis

- Un compte Cloudflare (inscrivez-vous sur [cloudflare.com](https://cloudflare.com) si ce n'est pas déjà fait)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installé (via `npm install -g wrangler`)
- Authentification avec Cloudflare (`wrangler login`)

## Étape 1: Préparation du Projet

Votre projet est déjà configuré avec les fichiers nécessaires:
- `wrangler.toml` - Configuration Cloudflare Workers
- `worker/index.js` - Code du Worker pour le backend API

## Étape 2: Créer une Base de Données D1

```bash
# Créer une nouvelle base de données D1
wrangler d1 create qudup_waitlist

# La commande affichera un ID de base de données. Remplacez 'placeholder' 
# dans wrangler.toml par cet ID.
```

Après cette commande, mettez à jour le fichier `wrangler.toml` avec l'ID de base de données.

## Étape 3: Créer le Schéma de la Base de Données

La création du schéma est gérée automatiquement par le Worker lors de sa première exécution.

## Étape 4: Adapter le Frontend

Pour que votre frontend fonctionne avec le nouveau backend Cloudflare Workers, ajustez l'URL de l'API:

1. Créez un fichier `.env.production` à la racine du projet avec le contenu suivant:

```
VITE_API_URL=https://qudup-waitlist-api.<your-worker-subdomain>.workers.dev
```

2. Modifiez `client/src/lib/queryClient.ts` pour utiliser cette URL de base dans les requêtes API en production.

## Étape 5: Déployer le Backend (Worker)

```bash
# Déployer le Worker
wrangler deploy
```

Après le déploiement, notez l'URL de votre Worker (généralement `https://qudup-waitlist-api.<subdomain>.workers.dev`).

## Étape 6: Déployer le Frontend (Pages)

1. Construisez votre application:

```bash
npm run build
```

2. Déployez sur Cloudflare Pages:
   - Connectez-vous à Cloudflare Dashboard
   - Allez dans "Pages"
   - Cliquez sur "Create a project"
   - Vous pouvez soit:
     - Connecter votre dépôt GitHub (recommandé)
     - Ou télécharger le dossier `dist` directement

3. Configuration du projet Pages:
   - Commande de build: `npm run build` (déjà exécutée si vous uploadez directement)
   - Répertoire de sortie: `dist`
   - Variables d'environnement: Aucune nécessaire car intégrées dans le build

## Étape 7: Configurer les Redirections (facultatif)

Si vous utilisez le routing côté client, ajoutez un fichier `_redirects` dans votre dossier `public`:

```
/* /index.html 200
```

## Étape 8: Connecter un Domaine Personnalisé (facultatif)

Dans Cloudflare Pages:
1. Allez dans les paramètres de votre projet
2. Section "Custom domains"
3. Ajoutez votre domaine

## Dépannage

### Page Blanche après Déploiement
- Vérifiez les erreurs de console (F12)
- Assurez-vous que les URLs d'API sont correctes
- Vérifiez que le Worker est bien déployé et accessible

### Erreurs de CORS
Le Worker est déjà configuré pour gérer les en-têtes CORS. Si vous rencontrez des problèmes:
- Vérifiez les origines autorisées dans le worker
- Testez avec un outil comme Postman pour isoler le problème

## Commandes Utiles

```bash
# Tester le Worker en local
wrangler dev

# Voir les journaux du Worker 
wrangler tail

# Liste des bases de données D1
wrangler d1 list

# Exécuter des requêtes SQL sur D1
wrangler d1 execute qudup_waitlist --command "SELECT * FROM waitlist"
```