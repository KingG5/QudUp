#!/usr/bin/env node

/**
 * Script de déploiement automatisé pour QudUP sur Cloudflare
 * 
 * Ce script guide l'utilisateur à travers le processus de déploiement
 * de l'application QudUP sur Cloudflare Pages et Workers.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Configuration
let config = {
  workerName: 'qudup-waitlist-api',
  d1DatabaseName: 'qudup_waitlist',
  d1DatabaseId: '',
  workerUrl: '',
  apiBaseUrl: '',
  frontendUrl: ''
};

/**
 * Affiche un message stylisé dans le terminal
 */
function print(message, color = colors.reset, newline = true) {
  process.stdout.write(color + message + colors.reset + (newline ? '\n' : ''));
}

/**
 * Exécute une commande et retourne le résultat
 */
function executeCommand(command, silent = false) {
  try {
    if (!silent) {
      print(`Exécution: ${command}`, colors.cyan);
    }
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    print(`Erreur: ${error.message}`, colors.red);
    return null;
  }
}

/**
 * Vérifie si wrangler est installé
 */
function checkWrangler() {
  try {
    executeCommand('wrangler --version', true);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Vérifie si l'utilisateur est connecté à Cloudflare
 */
function checkCloudflareLogin() {
  try {
    const result = executeCommand('wrangler whoami', true);
    return result.includes('You are logged in');
  } catch (error) {
    return false;
  }
}

/**
 * Met à jour le fichier wrangler.toml avec l'ID de la base de données
 */
function updateWranglerConfig(dbId) {
  try {
    let wranglerContent = fs.readFileSync(path.join(process.cwd(), 'wrangler.toml'), 'utf8');
    wranglerContent = wranglerContent.replace(/database_id = "placeholder"/, `database_id = "${dbId}"`);
    fs.writeFileSync(path.join(process.cwd(), 'wrangler.toml'), wranglerContent);
    print('✅ Fichier wrangler.toml mis à jour avec l\'ID de la base de données', colors.green);
  } catch (error) {
    print(`❌ Erreur lors de la mise à jour du fichier wrangler.toml: ${error.message}`, colors.red);
  }
}

/**
 * Crée un fichier .env.production pour le frontend
 */
function createEnvFile(apiUrl) {
  try {
    fs.writeFileSync(path.join(process.cwd(), '.env.production'), `VITE_API_URL=${apiUrl}`);
    print('✅ Fichier .env.production créé avec l\'URL de l\'API', colors.green);
  } catch (error) {
    print(`❌ Erreur lors de la création du fichier .env.production: ${error.message}`, colors.red);
  }
}

/**
 * Adapte le fichier queryClient.ts pour utiliser l'URL de l'API en production
 */
function updateQueryClient() {
  try {
    const queryClientPath = path.join(process.cwd(), 'client/src/lib/queryClient.ts');
    let content = fs.readFileSync(queryClientPath, 'utf8');
    
    // Vérifie si le code a déjà été modifié
    if (content.includes('import.meta.env.VITE_API_URL')) {
      print('✅ Le fichier queryClient.ts est déjà configuré pour l\'API Cloudflare', colors.green);
      return;
    }
    
    // Cherche la fonction apiRequest et la modifie
    const apiRequestRegex = /(export async function apiRequest\([^)]*\) \{[^{]*\{)/;
    const replacement = '$1\n  // Utiliser l\'URL de base de l\'API en production\n  const baseUrl = import.meta.env.VITE_API_URL || \'\';\n  const fullUrl = baseUrl + url;\n';
    
    // Remplace l'URL dans le fetch
    content = content.replace(apiRequestRegex, replacement);
    content = content.replace(/fetch\(url,/, 'fetch(fullUrl,');
    
    fs.writeFileSync(queryClientPath, content);
    print('✅ Le fichier queryClient.ts a été mis à jour pour utiliser l\'API Cloudflare', colors.green);
  } catch (error) {
    print(`❌ Erreur lors de la mise à jour du fichier queryClient.ts: ${error.message}`, colors.red);
  }
}

/**
 * Crée le fichier _redirects pour Cloudflare Pages
 */
function createRedirectsFile() {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, '_redirects'), '/* /index.html 200');
    print('✅ Fichier _redirects créé pour la navigation côté client', colors.green);
  } catch (error) {
    print(`❌ Erreur lors de la création du fichier _redirects: ${error.message}`, colors.red);
  }
}

/**
 * Affiche le rapport final
 */
function showSummary() {
  print('\n📋 RÉSUMÉ DU DÉPLOIEMENT', colors.bright + colors.magenta);
  print('========================', colors.magenta);
  print(`🔹 Nom du Worker: ${config.workerName}`, colors.cyan);
  print(`🔹 Base de données D1: ${config.d1DatabaseName}`, colors.cyan);
  print(`🔹 ID de la base de données: ${config.d1DatabaseId}`, colors.cyan);
  print(`🔹 URL du Worker: ${config.workerUrl || 'Non déployé'}`, colors.cyan);
  print(`🔹 URL de base de l'API: ${config.apiBaseUrl || 'Non configurée'}`, colors.cyan);
  print(`🔹 URL du frontend: ${config.frontendUrl || 'Non déployé'}`, colors.cyan);
  
  print('\n✅ PROCHAINES ÉTAPES', colors.bright + colors.green);
  print('=================', colors.green);
  print('1. Déployez le Worker (si ce n\'est pas déjà fait):', colors.reset);
  print('   wrangler deploy', colors.yellow);
  print('2. Construisez le frontend:', colors.reset);
  print('   npm run build', colors.yellow);
  print('3. Déployez le dossier "dist" sur Cloudflare Pages via le dashboard', colors.reset);
  print('\nPour plus d\'informations, consultez le fichier:', colors.reset);
  print('deploy-wizard/cloudflare-setup-guide.md', colors.bright);
}

/**
 * Assistant de déploiement interactif
 */
async function deploymentWizard() {
  return new Promise((resolve) => {
    print('\n🚀 ASSISTANT DE DÉPLOIEMENT QUDUP SUR CLOUDFLARE 🚀\n', colors.bright + colors.magenta);
    
    // Vérifie les prérequis
    print('Vérification des prérequis...', colors.cyan);
    
    if (!checkWrangler()) {
      print('❌ Wrangler n\'est pas installé. Veuillez l\'installer avec:', colors.red);
      print('npm install -g wrangler', colors.yellow);
      return resolve(false);
    }
    print('✅ Wrangler est installé', colors.green);
    
    if (!checkCloudflareLogin()) {
      print('❌ Vous n\'êtes pas connecté à Cloudflare. Veuillez vous connecter avec:', colors.red);
      print('wrangler login', colors.yellow);
      return resolve(false);
    }
    print('✅ Vous êtes connecté à Cloudflare', colors.green);
    
    print('\n1️⃣ CONFIGURATION DE LA BASE DE DONNÉES D1', colors.bright + colors.blue);
    
    rl.question('Voulez-vous créer une nouvelle base de données D1? (O/n): ', (answer) => {
      if (answer.toLowerCase() !== 'n') {
        print('\nCréation de la base de données D1...', colors.cyan);
        const result = executeCommand(`wrangler d1 create ${config.d1DatabaseName}`);
        
        if (result) {
          // Extrait l'ID de la base de données du résultat
          const match = result.match(/database_id\s*=\s*"([^"]+)"/);
          if (match && match[1]) {
            config.d1DatabaseId = match[1];
            print(`✅ Base de données D1 créée avec l'ID: ${config.d1DatabaseId}`, colors.green);
            updateWranglerConfig(config.d1DatabaseId);
          } else {
            print('❌ Impossible d\'extraire l\'ID de la base de données', colors.red);
          }
        }
      } else {
        rl.question('Veuillez entrer l\'ID de votre base de données D1 existante: ', (dbId) => {
          config.d1DatabaseId = dbId.trim();
          print(`✅ Utilisation de la base de données D1 avec l'ID: ${config.d1DatabaseId}`, colors.green);
          updateWranglerConfig(config.d1DatabaseId);
        });
      }
      
      print('\n2️⃣ CONFIGURATION DU WORKER', colors.bright + colors.blue);
      
      rl.question('Voulez-vous déployer le Worker maintenant? (O/n): ', (answer) => {
        if (answer.toLowerCase() !== 'n') {
          print('\nDéploiement du Worker...', colors.cyan);
          const result = executeCommand('wrangler deploy');
          
          if (result) {
            // Extrait l'URL du Worker
            const match = result.match(/https:\/\/[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.workers\.dev/);
            if (match) {
              config.workerUrl = match[0];
              config.apiBaseUrl = config.workerUrl;
              print(`✅ Worker déployé à l'URL: ${config.workerUrl}`, colors.green);
            }
          }
        } else {
          rl.question('Veuillez entrer l\'URL de base de votre API (ex: https://qudup-waitlist-api.workers.dev): ', (url) => {
            config.apiBaseUrl = url.trim();
            print(`✅ Utilisation de l'URL d'API: ${config.apiBaseUrl}`, colors.green);
          });
        }
        
        print('\n3️⃣ ADAPTATION DU FRONTEND', colors.bright + colors.blue);
        
        // Crée le fichier .env.production
        createEnvFile(config.apiBaseUrl);
        
        // Met à jour le client pour utiliser l'URL de l'API
        updateQueryClient();
        
        // Crée le fichier _redirects
        createRedirectsFile();
        
        print('\n4️⃣ CONSTRUCTION DU FRONTEND', colors.bright + colors.blue);
        
        rl.question('Voulez-vous construire le frontend maintenant? (O/n): ', (answer) => {
          if (answer.toLowerCase() !== 'n') {
            print('\nConstruction du frontend...', colors.cyan);
            executeCommand('npm run build');
            print('✅ Le frontend a été construit avec succès dans le dossier "dist"', colors.green);
          }
          
          // Affiche le rapport final
          showSummary();
          
          print('\n🎉 L\'assistant de déploiement a terminé! 🎉\n', colors.bright + colors.magenta);
          
          rl.close();
          resolve(true);
        });
      });
    });
  });
}

// Exécute l'assistant
deploymentWizard();