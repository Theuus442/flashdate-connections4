import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
let supabaseClient: SupabaseClient | null = null;
let supbaseInitError: string | null = null;

// Log diagnostic information
console.log('[Supabase] Initialization Check:');
console.log('[Supabase]   - URL provided:', !!supabaseUrl);
console.log('[Supabase]   - URL length:', supabaseUrl.length);
console.log('[Supabase]   - Key provided:', !!supabaseAnonKey);
console.log('[Supabase]   - Key length:', supabaseAnonKey.length);
console.log('[Supabase]   - Mode:', isConfigured ? 'ENABLED' : 'DISABLED');

if (!isConfigured) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  supbaseInitError = `Supabase not configured. Missing: ${missingVars.join(', ')}`;
  console.warn(
    '⚠️  Supabase não configurado. O aplicativo funcionará em modo local.\n' +
    `Variáveis de ambiente faltando: ${missingVars.join(', ')}\n` +
    'Para ativar o Supabase, configure as variáveis de ambiente:\n' +
    '  VITE_SUPABASE_URL=https://seu-projeto.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=sua-chave-anonima\n' +
    'Consulte SUPABASE_SETUP.md para detalhes.'
  );
} else {
  try {
    console.log('[Supabase] Initializing client with URL:', supabaseUrl);
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      // Add request configuration to handle network issues
      global: {
        headers: {
          'x-request-id': crypto.randomUUID(),
        },
        fetch: globalThis.fetch, // Ensure we use the intercepted fetch
      },
    });
    console.log('[Supabase] ✅ Client initialized successfully');

    // Test connectivity to Supabase
    testSupabaseConnectivity(supabaseUrl);
  } catch (error) {
    supbaseInitError = `Failed to initialize Supabase client: ${error instanceof Error ? error.message : String(error)}`;
    console.error('[Supabase] ❌ Initialization error:', error);
    supabaseClient = null;
  }
}

/**
 * Test connectivity to Supabase
 */
async function testSupabaseConnectivity(url: string) {
  try {
    console.log('[Supabase] Testing connectivity to:', url);

    // Test 1: Simple fetch to REST API
    try {
      const testUrl = `${url}/rest/v1/`;
      console.log('[Supabase] Test 1: Fetching', testUrl);
      const response = await Promise.race([
        fetch(testUrl, {
          method: 'OPTIONS',
          headers: {
            'apikey': supabaseAnonKey,
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);

      if ((response as Response).ok) {
        console.log('[Supabase] ✅ Test 1 passed: API accessible');
      } else {
        console.warn('[Supabase] ⚠️  Test 1: API returned status:', (response as Response).status);
      }
    } catch (e1) {
      const msg1 = e1 instanceof Error ? e1.message : String(e1);
      console.error('[Supabase] ❌ Test 1 failed:', msg1);

      // Test 2: Try a simple GET request without CORS
      try {
        console.log('[Supabase] Test 2: Trying simple fetch without headers...');
        const response2 = await Promise.race([
          fetch(url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        console.log('[Supabase] Test 2: Response status:', (response2 as Response).status);
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : String(e2);
        console.error('[Supabase] ❌ Test 2 failed:', msg2);
      }
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Supabase] ❌ Connectivity test error:', errorMsg);
    console.error('[Supabase] Network issue detected. Possible causes:');
    console.error('[Supabase]   1. Network is offline');
    console.error('[Supabase]   2. CORS policy is blocking requests');
    console.error('[Supabase]   3. Firewall/proxy is blocking access');
    console.error('[Supabase]   4. Supabase URL is incorrect:', url);
    console.error('[Supabase]   5. Supabase service is unavailable');
  }
}

// Export a proxy that returns null if not configured
export const supabase = supabaseClient;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return isConfigured && supabaseClient !== null;
};

// Helper to get initialization error
export const getSupabaseInitError = (): string | null => {
  return supbaseInitError;
};
