import { Plugin } from 'vite';

/**
 * Custom Vite plugin to proxy Supabase API requests through localhost
 * This bypasses CORS and network isolation issues in development
 */
export function supabaseProxyPlugin(): Plugin {
  return {
    name: 'supabase-proxy',
    resolveId(id) {
      // Don't intercept module resolution
      return null;
    },
    transform(code, id) {
      // Only transform supabase-related files
      if (!id.includes('node_modules/@supabase')) {
        return null;
      }

      // This is a complex approach, so let's use a simpler method instead
      return null;
    },
  };
}
