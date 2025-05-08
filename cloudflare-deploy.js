/**
 * Cloudflare Pages Deployment Helper
 * 
 * This script:
 * 1. Ensures the _redirects file is properly copied to the dist directory
 * 2. Creates a proper .env.production file with the correct API URL
 * 3. Performs the build process
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const DIST_DIR = './dist';
const PUBLIC_DIR = './public';
const REDIRECTS_FILE = '_redirects';
const ENV_PROD_FILE = '.env.production';

async function main() {
  try {
    console.log('🚀 Starting Cloudflare Pages deployment preparation...');
    
    // Ensure we have Cloudflare Worker URL in .env.production
    const envProdContent = await fs.readFile(ENV_PROD_FILE, 'utf-8');
    const apiUrlMatch = envProdContent.match(/VITE_API_URL=(.+)/);
    
    if (!apiUrlMatch || apiUrlMatch[1].includes('YOUR_SUBDOMAIN')) {
      console.error('⚠️ ERROR: Please set your actual Cloudflare Worker URL in .env.production');
      console.error('Example: VITE_API_URL=https://qudup-waitlist-api.username.workers.dev');
      process.exit(1);
    }
    
    console.log('✅ .env.production check passed');
    
    // Run the build
    console.log('📦 Building the application...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Ensure _redirects is copied to dist/public
    console.log('📋 Ensuring _redirects file is in place...');
    const redirectsContent = await fs.readFile(join(PUBLIC_DIR, REDIRECTS_FILE), 'utf-8');
    await fs.writeFile(join(DIST_DIR, 'public', REDIRECTS_FILE), redirectsContent);
    
    console.log('✅ Build completed successfully.');
    console.log('🌐 Deploy the "dist" directory to Cloudflare Pages');
  } catch (error) {
    console.error('❌ Build preparation failed:', error);
    process.exit(1);
  }
}

main();