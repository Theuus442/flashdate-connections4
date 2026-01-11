import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
let supabaseClient: SupabaseClient | null = null;

if (isConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseClient = null;
  }
}

// Export a proxy that returns null if not configured
export const supabase = supabaseClient;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return isConfigured && supabaseClient !== null;
};
