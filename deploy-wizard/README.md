# QudUP - Assistant de Déploiement Cloudflare

Cet assistant vous guidera à travers le processus de déploiement de votre application QudUP sur l'infrastructure Cloudflare (Pages + Workers + D1).

## 📚 Contenu de ce dossier

- **README.md** - Ce fichier d'introduction
- **cloudflare-setup-guide.md** - Guide détaillé étape par étape
- **deploy.js** - Script interactif pour automatiser le déploiement

## 🚀 Comment déployer

Vous avez deux options pour déployer votre application:

### Option 1: Utiliser l'assistant automatisé (recommandé)

1. Assurez-vous d'avoir installé Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Connectez-vous à Cloudflare:
   ```bash
   wrangler login
   ```

3. Exécutez le script d'assistant:
   ```bash
   node deploy-wizard/deploy.js
   ```

4. Suivez les instructions à l'écran pour déployer votre application.

### Option 2: Suivre le guide manuel

Si vous préférez comprendre chaque étape ou si vous rencontrez des problèmes avec l'assistant automatisé, consultez notre guide détaillé:

[Guide de Déploiement Cloudflare](./cloudflare-setup-guide.md)

## 🔧 Architecture du Déploiement

L'application QudUP sera déployée sur l'infrastructure Cloudflare avec les composants suivants:

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  Cloudflare │       │  Cloudflare  │       │  Cloudflare  │
│    Pages    │──────▶│    Workers   │──────▶│      D1      │
│  (Frontend) │       │   (Backend)  │       │  (Database)  │
└─────────────┘       └──────────────┘       └──────────────┘
```

- **Frontend**: Application React construite avec Vite, déployée sur Cloudflare Pages
- **Backend**: API serverless déployée sur Cloudflare Workers
- **Database**: Base de données SQL serverless D1 pour stocker les données de la liste d'attente

## 📋 Prérequis

- Un compte Cloudflare (inscrivez-vous sur [cloudflare.com](https://cloudflare.com) si nécessaire)
- Node.js et npm installés sur votre machine
- Wrangler CLI installé (`npm install -g wrangler`)

## 🆘 Besoin d'aide?

Si vous rencontrez des problèmes lors du déploiement, consultez la section "Dépannage" dans le guide détaillé ou contactez votre développeur.

## 📜 Après le déploiement

Une fois votre application déployée:

1. Vous pouvez associer votre domaine personnalisé via le dashboard Cloudflare Pages
2. Configurer des règles de cache pour optimiser les performances
3. Mettre en place des analyses pour suivre les visites et les inscriptions

---

*Note: Cet assistant a été conçu spécifiquement pour l'application QudUP.*