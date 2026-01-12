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
    const testUrl = `${url}/rest/v1/`;
    const response = await fetch(testUrl, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseAnonKey,
      },
    });

    if (response.ok) {
      console.log('[Supabase] ✅ Connectivity test passed');
    } else {
      console.warn('[Supabase] ⚠️  Connectivity test returned status:', response.status);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[Supabase] ❌ Connectivity test failed:', errorMsg);
    console.error('[Supabase] This indicates a network issue. Possible causes:');
    console.error('[Supabase]   1. Network is offline or blocked');
    console.error('[Supabase]   2. CORS policy is blocking requests');
    console.error('[Supabase]   3. Firewall is blocking access to Supabase');
    console.error('[Supabase]   4. Supabase URL is incorrect');
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
