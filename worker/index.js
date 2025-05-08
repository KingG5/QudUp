/**
 * QudUP Waitlist API
 * Cloudflare Worker implementation
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

// Create waitlist schema in D1 database
async function setupDatabase(db) {
  return db.prepare(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

// Main worker event handler
export default {
  async fetch(request, env, ctx) {
    try {
      // Setup database if needed
      await setupDatabase(env.DB);
      
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return handleOptions(request, env);
      }
      
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Add a health check endpoint
      if (path === '/api/health') {
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }, 200, request, env);
      }
      
      // API endpoints
      if (path === '/api/waitlist') {
        // GET - retrieve all waitlist entries
        if (request.method === 'GET') {
          try {
            const entries = await env.DB.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
            return jsonResponse(entries.results, 200, request, env);
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
            const existingEntry = await env.DB.prepare('SELECT * FROM waitlist WHERE email = ?')
              .bind(data.email)
              .first();
              
            if (existingEntry) {
              return jsonResponse({ 
                message: 'Cette adresse email est déjà inscrite sur notre liste d\'attente.' 
              }, 409, request, env);
            }
            
            // Create the new entry
            const result = await env.DB.prepare('INSERT INTO waitlist (name, email) VALUES (?, ?)')
              .bind(data.name, data.email)
              .run();
            
            if (result.success) {
              // Get the inserted entry
              const newEntry = await env.DB.prepare('SELECT * FROM waitlist WHERE email = ?')
                .bind(data.email)
                .first();
                
              return jsonResponse({ 
                message: 'Inscription réussie', 
                data: newEntry 
              }, 201, request, env);
            } else {
              throw new Error('Failed to insert data');
            }
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