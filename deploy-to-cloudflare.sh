#!/bin/bash

# Cloudflare Pages Deployment Helper Script
echo "🚀 Starting Cloudflare Pages deployment preparation..."

# Check if .env.production exists and has correct API URL
if [ ! -f .env.production ]; then
  echo "⚠️ ERROR: .env.production file does not exist"
  echo "Please create a .env.production file with your Cloudflare Worker URL"
  exit 1
fi

# Check if API URL is set correctly
if grep -q "YOUR_SUBDOMAIN" .env.production; then
  echo "⚠️ ERROR: Please set your actual Cloudflare Worker URL in .env.production"
  echo "Example: VITE_API_URL=https://qudup-waitlist-api.username.workers.dev"
  exit 1
fi

# Run the build
echo "📦 Building the application..."
npm run build

# Ensure _redirects is copied to dist/public
echo "📋 Ensuring _redirects file is in place..."
if [ -f public/_redirects ]; then
  cp public/_redirects dist/public/
  echo "✅ _redirects file copied to dist/public/"
else
  echo "⚠️ WARNING: public/_redirects does not exist, creating it..."
  echo "/* /index.html 200" > dist/public/_redirects
  echo "✅ Created _redirects file in dist/public/"
fi

echo "✅ Build completed successfully."
echo "🌐 Now deploy the 'dist' directory to Cloudflare Pages"