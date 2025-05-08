/**
 * QudUP Waitlist API
 * Cloudflare Worker implementation
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to handle OPTIONS requests (CORS preflight)
function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// Helper to return JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
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
    // Setup database if needed
    await setupDatabase(env.DB);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API endpoints
    if (path === '/api/waitlist') {
      // GET - retrieve all waitlist entries
      if (request.method === 'GET') {
        try {
          const entries = await env.DB.prepare('SELECT * FROM waitlist ORDER BY created_at DESC').all();
          return jsonResponse(entries.results);
        } catch (error) {
          return jsonResponse({ message: 'Error fetching waitlist entries', error: error.message }, 500);
        }
      }
      
      // POST - add a new waitlist entry
      if (request.method === 'POST') {
        try {
          const data = await request.json();
          
          // Validate input
          if (!data.name || !data.name.trim()) {
            return jsonResponse({ message: 'Le nom est requis' }, 400);
          }
          
          if (!data.email || !isValidEmail(data.email)) {
            return jsonResponse({ message: 'Adresse email invalide' }, 400);
          }
          
          // Check if email already exists
          const existingEntry = await env.DB.prepare('SELECT * FROM waitlist WHERE email = ?')
            .bind(data.email)
            .first();
            
          if (existingEntry) {
            return jsonResponse({ 
              message: 'Cette adresse email est déjà inscrite sur notre liste d\'attente.' 
            }, 409);
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
            }, 201);
          } else {
            throw new Error('Failed to insert data');
          }
        } catch (error) {
          return jsonResponse({ 
            message: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.', 
            error: error.message 
          }, 500);
        }
      }
    }
    
    // Default route - not found
    return jsonResponse({ message: 'Not Found' }, 404);
  }
};