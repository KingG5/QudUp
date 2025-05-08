import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Determines the base URL for API requests based on the environment
 * - In development: empty string (relative URL, handled by the dev server)
 * - In production with env variable: Uses VITE_API_URL
 * - In production without env variable: Auto-detects based on Cloudflare Worker naming convention
 */
function getApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    // In development, use relative URLs
    return '';
  }

  // In production, try to use the environment variable first
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // If no env variable is set, auto-detect the API URL based on Cloudflare naming convention
  // This assumes your worker is deployed as qudup-waitlist-api.*.workers.dev
  // and your Pages site is deployed under *.pages.dev
  const currentHost = window.location.hostname;
  
  // If we're on Cloudflare Pages (*.pages.dev)
  if (currentHost.endsWith('.pages.dev')) {
    // Extract the account subdomain from the pages URL
    const subdomain = currentHost.split('.')[0];
    return `https://qudup-waitlist-api.${subdomain}.workers.dev`;
  }
  
  // For custom domains or other deployments, fallback to relative URLs
  return '';
}

// Get the base URL once at module load time
const API_BASE_URL = getApiBaseUrl();
console.log(`API base URL: ${API_BASE_URL}`);

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = API_BASE_URL + url;
  
  console.log(`Making ${method} request to: ${fullUrl}`);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    console.error(`API request failed: ${res.status} ${res.statusText}`);
    try {
      const errorText = await res.text();
      console.error(`Error details: ${errorText}`);
    } catch (e) {
      console.error('Could not read error details');
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const fullUrl = API_BASE_URL + (queryKey[0] as string);
    
    console.log(`Making GET request to: ${fullUrl}`);
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });
    
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log('Received 401 status, returning null as configured');
        return null;
      }
      
      if (!res.ok) {
        console.error(`Query request failed: ${res.status} ${res.statusText}`);
        try {
          const errorText = await res.text();
          console.error(`Error details: ${errorText}`);
        } catch (e) {
          console.error('Could not read error details');
        }
      }
    
      await throwIfResNotOk(res);
      const data = await res.json();
      console.log('Query data received:', data);
      return data;
    } catch (error) {
      console.error(`Query error for ${fullUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
