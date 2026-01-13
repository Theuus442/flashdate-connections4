/**
 * Global fetch interceptor for development mode
 * Redirects Supabase requests through Vite's local proxy to bypass CORS
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

// Store original fetch
const originalFetch = globalThis.fetch;

/**
 * Intercept fetch requests and proxy Supabase URLs
 */
function interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;
  let request = input;

  // Extract URL from input
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else if (input instanceof Request) {
    url = input.url;
  } else {
    return originalFetch(input, init);
  }

  // Only proxy Supabase requests in development
  if (import.meta.env.DEV && SUPABASE_URL && url.startsWith(SUPABASE_URL)) {
    const supabaseDomain = new URL(SUPABASE_URL).hostname;

    console.log('[FetchProxy] Intercepting Supabase request:', {
      original: url.substring(0, 100),
      method: init?.method || 'GET',
    });

    // Extract the path from the Supabase URL
    // E.g., https://kdwnptqxwnnzvdinhhin.supabase.co/rest/v1/users -> /rest/v1/users
    const supabaseUrlObj = new URL(url);
    const path = supabaseUrlObj.pathname + supabaseUrlObj.search;

    // Reroute to local proxy
    const localUrl = window.location.origin + path;

    console.log('[FetchProxy] Proxying to:', localUrl);

    // Create a new Request object with the local URL to avoid modifying original
    const newInit = {
      ...init,
      headers: {
        ...((init?.headers as Record<string, string>) || {}),
        'x-proxied-by': 'fetch-interceptor',
      },
    };

    // Use the local URL for the fetch
    return originalFetch(localUrl, newInit)
      .then(response => {
        console.log('[FetchProxy] Response status:', response.status);
        return response;
      })
      .catch(error => {
        console.error('[FetchProxy] Fetch error:', {
          original: url.substring(0, 100),
          local: localUrl,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      });
  }

  // Pass through non-Supabase requests
  return originalFetch(input, init);
}

// Install the interceptor
if (import.meta.env.DEV) {
  globalThis.fetch = interceptedFetch as typeof fetch;
  console.log('[FetchProxy] 🔍 Global fetch interceptor installed for development');
  console.log('[FetchProxy] Supabase URL:', SUPABASE_URL);
  console.log('[FetchProxy] Localhost URL:', LOCALHOST_URL);
}

export { interceptedFetch };
