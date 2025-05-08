# Troubleshooting White Page on Cloudflare Deployment

If you're experiencing a white/blank page when deploying your QudUP application to Cloudflare, follow this guide to resolve the issue.

## Common Issues and Solutions

### 1. Missing or Incorrect API URL Configuration

**Problem:** The frontend can't connect to the backend API worker because the URL isn't properly configured.

**Solution:**
1. Make sure your `.env.production` file contains the correct URL to your Cloudflare Worker:
   ```
   VITE_API_URL=https://qudup-waitlist-api.YOUR_SUBDOMAIN.workers.dev
   ```
   Replace `YOUR_SUBDOMAIN` with your actual Cloudflare Workers subdomain.

2. After updating the environment variable, rebuild your application:
   ```
   npm run build
   ```

### 2. CORS Issues

**Problem:** The Cloudflare Worker is blocking requests from your Pages domain due to CORS settings.

**Solution:**
1. Make sure your `worker/index.js` file has proper CORS headers (already implemented):
   ```javascript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
     'Access-Control-Max-Age': '86400',
   };
   ```

2. For more specific CORS settings, you can replace the wildcard '*' with your Pages domain:
   ```javascript
   const corsHeaders = {
     'Access-Control-Allow-Origin': 'https://your-pages-project.pages.dev',
     // other headers...
   };
   ```

### 3. Missing _redirects File

**Problem:** Client-side routing doesn't work because the _redirects file isn't properly configured.

**Solution:**
1. Ensure you have a `_redirects` file in your `public` folder with this content:
   ```
   /* /index.html 200
   ```

2. This file must be copied to the `dist/public` directory during the build process.

### 4. Build Configuration Issues

**Problem:** The build output might not include all necessary files or configurations.

**Solution:**
1. Run the troubleshooting build script:
   ```
   ./deploy-to-cloudflare.sh
   ```

2. After running this script, check the `dist/public` directory to verify all files are present, including:
   - index.html
   - _redirects
   - CSS and JavaScript assets

### 5. Missing Database Configuration

**Problem:** The Worker can't connect to the D1 database because the database ID is not properly configured.

**Solution:**
1. Update the `wrangler.toml` file with your actual D1 database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "qudup_waitlist"
   database_id = "your-actual-database-id"  # Replace with your actual D1 database ID
   ```

2. Run a test deployment of your worker to verify it can connect to the database:
   ```
   wrangler deploy
   ```

### 6. Debug with Browser Developer Tools

**Problem:** Hidden errors might be occurring in the browser.

**Solution:**
1. Open your deployed site in Chrome
2. Right-click and select "Inspect" or press F12
3. Go to the Console tab to check for any error messages
4. Go to the Network tab to see if API requests are failing

## Additional Debug Information

The following enhancements have been added to help diagnose issues:

1. API request logging in the `queryClient.ts` file
2. Detailed error reporting for API calls
3. Additional console logging for request/response handling

These changes will help identify the specific issue when viewing the browser's developer console.

## Deployment Checklist

Before deploying again, ensure you have:

1. Updated `.env.production` with your actual Cloudflare Worker URL
2. Updated `wrangler.toml` with your actual D1 database ID
3. Run `npm run build` to generate a fresh build
4. Verified that the `_redirects` file is present in the build output
5. Deployed the Worker first using `wrangler deploy`
6. Deployed the Pages site using the Cloudflare dashboard

If you continue experiencing issues after following these steps, please open the browser developer console and share any error messages that appear.