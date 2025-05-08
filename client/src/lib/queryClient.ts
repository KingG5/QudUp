import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
  // Utiliser l'URL de base de l'API en production
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const fullUrl = baseUrl + url;
  
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
    // Utiliser l'URL de base de l'API en production
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const fullUrl = baseUrl + (queryKey[0] as string);
    
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
