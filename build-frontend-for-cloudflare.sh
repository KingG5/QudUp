#!/bin/bash

# Simplified build script for deploying frontend to Cloudflare Pages
echo "🚀 Building frontend for Cloudflare Pages deployment..."

# Step 1: Check if .env.production exists and has correct API URL
if [ ! -f .env.production ]; then
  echo "⚠️ ERROR: .env.production file does not exist"
  echo "Creating a template file. Please update it with your Worker URL before continuing."
  echo "VITE_API_URL=https://qudup-waitlist-api.YOUR_SUBDOMAIN.workers.dev" > .env.production
  exit 1
fi

# Step 2: Build only the frontend (don't build the server)
echo "📦 Building only the frontend..."
npx vite build

# Step 3: Ensure _redirects is copied to dist/public
echo "📋 Ensuring _redirects file is in place..."
if [ -f public/_redirects ]; then
  mkdir -p dist/public
  cp public/_redirects dist/public/
  echo "✅ _redirects file copied to dist/public/"
else
  echo "⚠️ Creating _redirects file..."
  mkdir -p dist/public
  echo "/* /index.html 200" > dist/public/_redirects
  echo "✅ Created _redirects file in dist/public/"
fi

# Step 4: Create a simple index.html for testing if not present
if [ ! -f dist/public/index.html ]; then
  echo "⚠️ WARNING: No index.html found in build output!"
  echo "Creating a test HTML file to debug the issue..."
  cat > dist/public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QudUP Deployment Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    .card { background: #f4f4f4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>QudUP Deployment Test Page</h1>
  <div class="card">
    <h2>API Connection Test</h2>
    <p>Testing connection to Worker API...</p>
    <pre id="api-result">Testing...</pre>
  </div>
  <div class="card">
    <h2>Environment Variables</h2>
    <pre id="env-vars">Loading...</pre>
  </div>
  
  <script>
    // Display environment variables
    document.getElementById('env-vars').textContent = 
      'VITE_API_URL: ' + (window.ENV_VITE_API_URL || 'Not set');
    
    // Test API connection
    const apiUrl = window.ENV_VITE_API_URL || '';
    const testUrl = apiUrl + '/api/waitlist';
    
    fetch(testUrl)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('API request failed with status: ' + response.status);
      })
      .then(data => {
        document.getElementById('api-result').innerHTML = 
          '<span class="success">✅ Connection successful!</span><br>Data: ' + 
          JSON.stringify(data, null, 2);
      })
      .catch(error => {
        document.getElementById('api-result').innerHTML = 
          '<span class="error">❌ Connection failed</span><br>Error: ' + 
          error.message;
      });
  </script>
</body>
</html>
EOL
  echo "✅ Created test HTML file in dist/public/index.html"
fi

echo "✅ Frontend build completed!"
echo "📝 Now deploy the dist/public directory to Cloudflare Pages"
echo "🔍 If you still see a white page, open browser dev tools and check for errors"