/**
 * Cloudflare Pages Configuration
 * This file provides documentation about the Cloudflare Pages setup
 * and can be used as a reference for the deployment process.
 */

const configuration = {
  // Build configuration settings for Cloudflare Pages
  buildSettings: {
    // Build command - this should be run before each deployment
    buildCommand: "npm run build",
    
    // Output directory - this is where the built files are located
    outputDirectory: "dist/public",
    
    // Root directory - where the build command should be run from
    rootDirectory: "/",
    
    // Environment variables needed for the build
    environmentVariables: {
      // API URL of the Cloudflare Worker that handles the backend requests
      VITE_API_URL: "https://qudup-waitlist-api.YOUR_SUBDOMAIN.workers.dev"
    }
  },
  
  // Configuration of routes for the frontend application
  routes: {
    // This configuration handles client-side routing
    // It should be in a file named "_redirects" in the outputDirectory
    redirects: "/* /index.html 200"
  },
  
  // Deployment checklist
  deploymentSteps: [
    "1. Update .env.production with the correct Cloudflare Worker URL",
    "2. Build the application using the deploy-to-cloudflare.sh script",
    "3. Login to Cloudflare Dashboard and navigate to Pages",
    "4. Create a new Pages project",
    "5. Upload the dist/public directory as a Direct Upload",
    "6. Configure the build settings as listed above",
    "7. Deploy the application"
  ]
};

// This file is for documentation purposes only
export default configuration;