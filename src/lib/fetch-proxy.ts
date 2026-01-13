/**
 * Global fetch interceptor for development mode
 * Redirects Supabase requests through localhost proxy to bypass CORS
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const LOCALHOST_URL = `http://localhost:${import.meta.env.VITE_PROXY_PORT || 8080}`;

// Store original fetch
const originalFetch = globalThis.fetch;

/**
 * Intercept fetch requests and proxy Supabase URLs
 */
function interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url: string;

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
  if (import.meta.env.DEV && SUPABASE_URL && url.includes(SUPABASE_URL.replace('https://', '').replace('http://', ''))) {
    console.log('[FetchProxy] Intercepting Supabase request:', {
      original: url,
      // Don't log full proxied URL for clarity
    });

    // Replace the Supabase domain with localhost
    const localUrl = url.replace(SUPABASE_URL, LOCALHOST_URL);
    console.log('[FetchProxy] Proxying to:', localUrl);

    // Create new request with proxied URL
    const proxyInit = {
      ...init,
      // Add header to track proxied requests
      headers: {
        ...((init?.headers as Record<string, string>) || {}),
        'x-proxied-by': 'fetch-interceptor',
      },
    };

    return originalFetch(localUrl, proxyInit)
      .then(response => {
        console.log('[FetchProxy] Response status:', response.status, 'URL:', url);
        return response;
      })
      .catch(error => {
        console.error('[FetchProxy] Fetch error:', {
          url,
          localUrl,
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
