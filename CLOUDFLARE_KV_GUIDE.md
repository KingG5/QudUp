# Guide de Déploiement QudUP avec Cloudflare KV

Ce guide étape par étape vous montre comment déployer l'application QudUP sur Cloudflare en utilisant KV pour le stockage des données.

## Prérequis

- Un compte Cloudflare
- Un compte GitHub (pour le déploiement automatique)

## Étape 1: Créer un Namespace KV

1. Connectez-vous à votre compte Cloudflare: https://dash.cloudflare.com/
2. Dans le menu latéral gauche, cliquez sur **Workers & Pages**
3. Cliquez sur l'onglet **KV** dans le menu horizontal (près de "Overview", "Triggers", etc.)
4. Cliquez sur **Create namespace**
5. Donnez le nom `qudup_waitlist_kv` et cliquez sur **Add**
6. Une fois créé, notez l'**ID du namespace** qui s'affiche à côté du nom - vous en aurez besoin plus tard

## Étape 2: Créer un Token API Cloudflare

1. Dans le menu latéral gauche, cliquez sur **Manage Account** (en bas à gauche) puis sur **API Tokens**
2. Cliquez sur **Create Token**
3. Sélectionnez **Create Custom Token**
4. Donnez-lui un nom comme "QudUP Deployment Token"
5. Sous "Permissions", ajoutez ces autorisations:
   - Account ➝ Workers KV Storage ➝ Edit
   - Account ➝ Workers Scripts ➝ Edit
   - Account ➝ Cloudflare Pages ➝ Edit
6. Sous "Account Resources", sélectionnez "Include ➝ All accounts"
7. Cliquez sur **Continue to summary** puis sur **Create Token**
8. **Copiez le token affiché** - vous ne pourrez plus le voir après avoir fermé cette page

## Étape 3: Obtenir Votre ID de Compte Cloudflare

1. Regardez l'URL de votre navigateur lorsque vous êtes sur le tableau de bord Cloudflare
2. Elle sera au format: `https://dash.cloudflare.com/IDENTIFIANT_DU_COMPTE/...`
3. L'IDENTIFIANT_DU_COMPTE est une série de caractères après `dash.cloudflare.com/`
4. **Notez cet identifiant** - vous en aurez besoin pour GitHub

## Étape 4: Configurer GitHub pour le Déploiement Automatique

1. Créez un nouveau dépôt sur GitHub ou utilisez un existant
2. Uploadez votre code sur ce dépôt
3. Allez dans **Settings** > **Secrets and variables** > **Actions**
4. Ajoutez ces trois secrets:
   - Nom: `CLOUDFLARE_API_TOKEN` - Valeur: *le token que vous avez copié à l'étape 2*
   - Nom: `CLOUDFLARE_ACCOUNT_ID` - Valeur: *l'ID de compte que vous avez noté à l'étape 3*
   - Nom: `KV_NAMESPACE_ID` - Valeur: *l'ID du namespace KV que vous avez noté à l'étape 1*

## Étape 5: Déployer l'Application

### Option A: Déploiement Automatique avec GitHub Actions

1. Allez dans l'onglet **Actions** de votre dépôt GitHub
2. Cliquez sur le workflow "Deploy QudUP to Cloudflare"
3. Cliquez sur **Run workflow**
4. Le déploiement se fera automatiquement!

### Option B: Déploiement Manuel

Si vous préférez déployer manuellement:

1. Installez Wrangler: `npm install -g wrangler`
2. Connectez-vous: `wrangler login`
3. Créez un fichier `.dev.vars` à la racine avec le contenu:
   ```
   KV_NAMESPACE_ID=votre-id-de-namespace-kv
   ```
4. Déployez le Worker: `wrangler deploy`
5. Construisez le frontend: `npm run build`
6. Déployez le frontend via le tableau de bord Cloudflare Pages

## Étape 6: Vérifier Votre Déploiement

1. Visitez votre site Pages: `https://qudup-waitlist.pages.dev` (ou le nom que vous avez choisi)
2. Testez le formulaire d'inscription
3. Pour vérifier que l'API fonctionne: `https://qudup-waitlist-api.your-subdomain.workers.dev/api/health`

## Dépannage

Si vous rencontrez un écran blanc:

1. Ouvrez la console développeur de votre navigateur (F12)
2. Regardez s'il y a des erreurs
3. Vérifiez que l'API Worker fonctionne en visitant l'URL de santé (/api/health)
4. Vérifiez que les CORS sont correctement configurés

## Pour les Mises à Jour Futures

Pour mettre à jour votre site:

1. Modifiez votre code localement
2. Poussez les modifications sur GitHub
3. Le déploiement se fera automatiquement via les GitHub Actions!