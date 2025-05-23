/**
 * QudUP Waitlist API
 * Cloudflare Worker implementation with KV Storage
 */

/**
 * Generate CORS headers based on the request origin and allowed origins config
 * This function ensures that CORS works correctly in both development and production
 */
function getCorsHeaders(request, env) {
  // Get the Origin header from the request
  const origin = request.headers.get('Origin');
  
  // Default CORS headers
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  // If no Origin header is present, use wildcard
  if (!origin) {
    headers['Access-Control-Allow-Origin'] = '*';
    return headers;
  }
  
  // Get allowed origins from the environment variable (set in wrangler.toml)
  const allowedOriginsStr = env.ALLOWED_ORIGINS || '*.pages.dev,*.cloudflare.com';
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim());
  
  // Check if the request origin matches any of the allowed patterns
  let isAllowed = false;
  
  for (const pattern of allowedOrigins) {
    if (pattern === '*') {
      isAllowed = true;
      break;
    }
    
    if (pattern.startsWith('*.')) {
      // For wildcard subdomains (*.example.com)
      const domain = pattern.substring(2);
      if (origin.endsWith(domain)) {
        isAllowed = true;
        break;
      }
    } else if (pattern === origin) {
      // Exact match
      isAllowed = true;
      break;
    }
  }
  
  // If allowed, reflect the origin
  if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    // Default to all in development mode
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  return headers;
}

// Helper function to handle OPTIONS requests (CORS preflight)
function handleOptions(request, env) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request, env)
  });
}

// Helper to return JSON responses
function jsonResponse(data, status = 200, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(request, env)
    }
  });
}

// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate a unique ID (since KV doesn't have auto-incrementing IDs like D1)
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper to get all waitlist entries
async function getAllWaitlistEntries(kv) {
  // Get the list of all waitlist entry keys
  const listResult = await kv.list({ prefix: 'waitlist:' });
  
  if (!listResult.keys || listResult.keys.length === 0) {
    return [];
  }
  
  // Fetch all entries in parallel
  const entries = await Promise.all(
    listResult.keys.map(async (key) => {
      const value = await kv.get(key.name, 'json');
      return value;
    })
  );
  
  // Sort by created_at timestamp (most recent first)
  return entries.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Helper to check if an email already exists
async function getWaitlistByEmail(kv, email) {
  // Get the entry index
  const emailIndex = await kv.get(`email:${email}`);
  
  if (!emailIndex) {
    return null;
  }
  
  // Get the actual entry
  return await kv.get(emailIndex, 'json');
}

// Helper to create a new waitlist entry
async function createWaitlistEntry(kv, data) {
  const id = generateId();
  const timestamp = new Date().toISOString();
  
  const entry = {
    id,
    name: data.name,
    email: data.email,
    created_at: timestamp
  };
  
  const key = `waitlist:${id}`;
  
  // Store the entry
  await kv.put(key, JSON.stringify(entry));
  
  // Create an email index for quick lookups
  await kv.put(`email:${data.email}`, key);
  
  return entry;
}

// Main worker event handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleOptions(request, env);
      }
      
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Add a health check endpoint
      if (path === '/api/health') {
        return jsonResponse({ 
          status: 'ok', 
          storage: 'KV',
          timestamp: new Date().toISOString() 
        }, 200, request, env);
      }
      
      // API endpoints
      if (path === '/api/waitlist') {
        // GET - retrieve all waitlist entries
        if (request.method === 'GET') {
          try {
            const entries = await getAllWaitlistEntries(env.WAITLIST_KV);
            return jsonResponse(entries, 200, request, env);
          } catch (error) {
            console.error('Error fetching waitlist entries:', error);
            return jsonResponse(
              { message: 'Error fetching waitlist entries', error: error.message }, 
              500, 
              request, 
              env
            );
          }
        }
        
        // POST - add a new waitlist entry
        if (request.method === 'POST') {
          try {
            const data = await request.json();
            
            // Validate input
            if (!data.name || !data.name.trim()) {
              return jsonResponse({ message: 'Le nom est requis' }, 400, request, env);
            }
            
            if (!data.email || !isValidEmail(data.email)) {
              return jsonResponse({ message: 'Adresse email invalide' }, 400, request, env);
            }
            
            // Check if email already exists
            const existingEntry = await getWaitlistByEmail(env.WAITLIST_KV, data.email);
              
            if (existingEntry) {
              return jsonResponse({ 
                message: 'Cette adresse email est déjà inscrite sur notre liste d\'attente.' 
              }, 409, request, env);
            }
            
            // Create the new entry
            const newEntry = await createWaitlistEntry(env.WAITLIST_KV, data);
            
            return jsonResponse({ 
              message: 'Inscription réussie', 
              data: newEntry 
            }, 201, request, env);
          } catch (error) {
            console.error('Error processing waitlist submission:', error);
            return jsonResponse({ 
              message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.', 
              error: error.message 
            }, 500, request, env);
          }
        }
      }
      
      // Default route - not found
      return jsonResponse({ message: 'Not Found' }, 404, request, env);
    } catch (error) {
      // Global error handler
      console.error('Unhandled error in worker:', error);
      return jsonResponse({ 
        message: 'An unexpected error occurred', 
        error: error.message 
      }, 500, request, env);
    }
  }
};