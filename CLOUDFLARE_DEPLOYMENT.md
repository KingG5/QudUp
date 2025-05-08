# Déploiement de QudUP sur Cloudflare

Ce guide explique comment déployer QudUP sur Cloudflare en utilisant GitHub. Ces modifications ont été faites pour résoudre les problèmes d'écran blanc lors du déploiement.

## Prérequis

1. Un compte GitHub
2. Un compte Cloudflare avec accès à:
   - Cloudflare Pages
   - Cloudflare Workers
   - Cloudflare D1 (base de données)

## Configuration sur GitHub

### Étape 1: Créer un nouveau dépôt GitHub

1. Connectez-vous à GitHub et créez un nouveau dépôt
2. Poussez votre code dans ce dépôt:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
   git push -u origin main
   ```

### Étape 2: Configurer les secrets GitHub

Pour permettre le déploiement automatique, vous devez ajouter ces secrets dans les paramètres de votre dépôt GitHub:

1. Allez à **Settings > Secrets and variables > Actions**
2. Ajoutez les secrets suivants:
   - `CLOUDFLARE_API_TOKEN`: Votre token API Cloudflare avec permissions pour Pages et Workers
   - `CLOUDFLARE_ACCOUNT_ID`: L'ID de votre compte Cloudflare
   - `D1_DATABASE_ID`: L'ID de votre base de données D1 (créé plus tard)

## Configuration sur Cloudflare

### Étape 1: Créer une base de données D1

1. Connectez-vous au tableau de bord Cloudflare
2. Allez à **Workers & Pages > D1**
3. Cliquez sur **Create Database**
4. Nommez-la `qudup_waitlist`
5. Notez l'ID de la base de données qui sera affiché (commençant par "xxxxx-xxxx-...")
6. Ajoutez cet ID dans les secrets GitHub comme `D1_DATABASE_ID`

### Étape 2: Déployer avec GitHub Actions

Une fois que vous avez configuré votre dépôt avec les secrets nécessaires, poussez une modification sur la branche main pour déclencher le déploiement automatique:

```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

### Étape 3: Vérifier le déploiement

1. Allez à **Actions** dans votre dépôt GitHub pour suivre le déploiement
2. Une fois terminé, vous devriez voir deux workflows complétés:
   - "Deploy to Cloudflare Workers"
   - "Deploy to Cloudflare Pages"

3. Dans le tableau de bord Cloudflare, allez à **Workers & Pages** pour voir vos déploiements

## Configuration manuelle (si nécessaire)

Si vous préférez configurer manuellement, vous pouvez:

### Pour le Worker:

1. Installez Wrangler: `npm install -g wrangler`
2. Connectez-vous: `wrangler login`
3. Créez la base de données: `wrangler d1 create qudup_waitlist`
4. Mettez à jour `wrangler.toml` avec l'ID de la base de données
5. Déployez le Worker: `wrangler deploy`

### Pour le frontend:

1. Construisez le frontend: `npm run build`
2. Allez à **Cloudflare Dashboard > Pages**
3. Cliquez sur **Create a project**
4. Choisissez **Direct Upload**
5. Téléchargez le contenu du dossier `dist/public`

## Dépannage

Si vous rencontrez encore un écran blanc après le déploiement:

1. Vérifiez les journaux de déploiement dans GitHub Actions
2. Ouvrez la console développeur du navigateur (F12) pour voir les erreurs
3. Vérifiez que l'API Worker fonctionne en visitant: `https://qudup-waitlist-api.VOTRE-SUBDOMAIN.workers.dev/api/health`
4. Consultez le fichier `CLOUDFLARE_TROUBLESHOOTING.md` pour plus d'informations

## Modifications Techniques

Les problèmes d'écran blanc ont été résolus par:

1. Amélioration de la gestion des erreurs dans `queryClient.ts`
2. Détection automatique des URLs de l'API
3. Amélioration de la gestion CORS dans le Worker
4. Mise en place des redirections pour le routage côté client
5. Configuration du déploiement automatique via GitHub Actions