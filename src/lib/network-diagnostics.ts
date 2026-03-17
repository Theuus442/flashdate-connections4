/**
 * Network Diagnostics Utility
 * Helps diagnose and handle network connectivity issues with Supabase
 */

import { getSupabaseStatus } from './supabase';

export interface NetworkDiagnostics {
  isOnline: boolean;
  supabaseConfigured: boolean;
  supabaseInitialized: boolean;
  issues: string[];
  suggestions: string[];
}

export const networkDiagnostics = {
  /**
   * Run a comprehensive network diagnostics check
   */
  diagnose(): NetworkDiagnostics {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const supabaseStatus = getSupabaseStatus();
    const isOnline = navigator.onLine;

    // Check 1: Internet connection
    if (!isOnline) {
      issues.push('Device is offline');
      suggestions.push('Check your internet connection');
    }

    // Check 2: Supabase configuration
    if (!supabaseStatus.configured) {
      issues.push('Supabase not configured');
      suggestions.push('Set VITE_SUPABASE_URL environment variable');
      suggestions.push('Set VITE_SUPABASE_ANON_KEY environment variable');
    }

    // Check 3: Supabase initialization
    if (supabaseStatus.configured && !supabaseStatus.initialized) {
      issues.push('Supabase initialization failed');
      if (supabaseStatus.error) {
        issues.push(`Details: ${supabaseStatus.error}`);
      }
      suggestions.push('Check Supabase environment variables are correct');
      suggestions.push('Verify Supabase URL is accessible');
    }

    return {
      isOnline,
      supabaseConfigured: supabaseStatus.configured,
      supabaseInitialized: supabaseStatus.initialized,
      issues,
      suggestions,
    };
  },

  /**
   * Check if an error is a network-related error
   */
  isNetworkError(error: any): boolean {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return (
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('NetworkError') ||
      errorMsg.includes('offline') ||
      errorMsg.includes('CORS') ||
      errorMsg.includes('Connection refused') ||
      errorMsg.includes('timeout')
    );
  },

  /**
   * Get a user-friendly error message for network errors
   */
  getNetworkErrorMessage(error: any): string {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes('CORS')) {
      return 'Erro CORS: Verifique a configuração do Supabase';
    }

    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('offline')) {
      return 'Erro de conectividade: Verifique sua conexão com a internet e a configuração do Supabase';
    }

    if (errorMsg.includes('timeout')) {
      return 'Tempo limite excedido: Tente novamente em alguns segundos';
    }

    return 'Erro de rede: Tente novamente mais tarde';
  },

  /**
   * Log detailed diagnostics information
   */
  logDiagnostics(): void {
    const diagnostics = this.diagnose();
    console.error('[Network Diagnostics]');
    console.error('  Online:', diagnostics.isOnline);
    console.error('  Supabase Configured:', diagnostics.supabaseConfigured);
    console.error('  Supabase Initialized:', diagnostics.supabaseInitialized);
    if (diagnostics.issues.length > 0) {
      console.error('  Issues:');
      diagnostics.issues.forEach(issue => console.error('    -', issue));
    }
    if (diagnostics.suggestions.length > 0) {
      console.error('  Suggestions:');
      diagnostics.suggestions.forEach(suggestion => console.error('    -', suggestion));
    }
  },
};
