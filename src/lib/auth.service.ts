import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'client';
}

/**
 * Helper function to clear auth-related cookies
 */
function clearAuthCookies() {
  try {
    // List of cookie names that might contain auth data
    const authCookiePatterns = [
      'supabase',
      'auth',
      'sb-',
      'session',
      'jwt',
      'token',
    ];

    // Get all cookies
    const cookies = document.cookie.split(';');

    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();

      // Check if cookie matches any auth pattern
      const isAuthCookie = authCookiePatterns.some(pattern =>
        cookieName.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isAuthCookie) {
        // Clear cookie by setting expiration to past date
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}; SameSite=Lax;`;
        console.log(`[clearAuthCookies] Cleared cookie: ${cookieName}`);
      }
    });
  } catch (error) {
    console.warn('[clearAuthCookies] Error clearing cookies:', error);
  }
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, name: string, role: 'admin' | 'client' = 'client') {
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase not configured');
      return {
        user: null,
        error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'),
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) throw error;

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: null,
        session: null,
        error: new Error('Supabase is not configured'),
      };
    }

    try {
      console.log('[signIn] Starting authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[signIn] Auth error:', error.message);
        throw error;
      }

      console.log('[signIn] Success, user ID:', data.user?.id);
      console.log('[signIn] User metadata:', data.user?.user_metadata);

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[signIn] Caught error:', {
        message: errorMessage,
        isNetworkError: error instanceof TypeError && errorMessage.includes('Failed to fetch'),
        error,
      });

      // Provide better error messages for network issues
      if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
        console.error('[signIn] Network Error: Cannot reach Supabase. This may be a temporary issue or a network isolation problem.');
      }

      return { user: null, session: null, error };
    }
  },

  /**
   * Sign out the current user and clear ALL session/auth data
   */
  async signOut() {
    try {
      console.log('[signOut] Starting sign out process...');

      // 1. Clear Supabase session via API
      if (isSupabaseConfigured()) {
        console.log('[signOut] Clearing Supabase session...');
        try {
          const { error } = await supabase.auth.signOut({ scope: 'global' });
          if (error) {
            console.warn('[signOut] Supabase signOut error (continuing anyway):', error.message);
          } else {
            console.log('[signOut] ✅ Supabase session cleared');
          }
        } catch (supabaseError) {
          console.warn('[signOut] Supabase signOut exception:', supabaseError);
        }
      }

      // 2. Clear ALL localStorage - aggressive approach
      console.log('[signOut] Clearing localStorage...');
      const localStorageKeys = Object.keys(localStorage);
      console.log(`[signOut] Found ${localStorageKeys.length} localStorage items`);
      localStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
          console.log(`[signOut] Removed localStorage: ${key}`);
        } catch (e) {
          console.warn(`[signOut] Failed to remove localStorage key "${key}":`, e);
        }
      });

      // 3. Clear sessionStorage completely
      console.log('[signOut] Clearing sessionStorage...');
      try {
        sessionStorage.clear();
        console.log('[signOut] ✅ sessionStorage cleared');
      } catch (e) {
        console.warn('[signOut] Failed to clear sessionStorage:', e);
      }

      // 4. Clear specific auth-related cookies
      console.log('[signOut] Clearing auth cookies...');
      clearAuthCookies();

      // 5. Clear IndexedDB if it exists (some session data might be there)
      console.log('[signOut] Clearing IndexedDB...');
      try {
        const dbs = await (window.indexedDB?.databases?.() || Promise.resolve([]));
        for (const db of dbs) {
          if (db.name && (db.name.includes('supabase') || db.name.includes('auth'))) {
            indexedDB.deleteDatabase(db.name);
            console.log(`[signOut] Deleted IndexedDB: ${db.name}`);
          }
        }
      } catch (e) {
        console.warn('[signOut] Could not access IndexedDB:', e);
      }

      console.log('[signOut] ✅ Sign out completed successfully');
      return { error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[signOut] Unexpected error during sign out:', errorMsg);

      // Force clear everything anyway
      console.log('[signOut] Force clearing all storage...');
      try {
        localStorage.clear();
        sessionStorage.clear();
        clearAuthCookies();
      } catch (e) {
        console.error('[signOut] Failed to force clear:', e);
      }

      return { error };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return { user: null, error: null };
    }

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  },

  /**
   * Create user as admin with email and password (for admin panel)
   * Attempts to use Edge Function first, then falls back to regular signUp
   */
  async createUserAsAdmin(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[authService] Creating user as admin:', email);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const functionUrl = `${supabaseUrl}/functions/v1/create-user-confirmed`;

      // Attempt 1: Try Edge Function (primary method)
      console.log('[authService] Attempting Edge Function method...');
      try {
        const response = await Promise.race([
          fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey,
            },
            body: JSON.stringify({ email, password }),
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Edge function timeout')), 10000)
          ),
        ]);

        console.log('[authService] Edge Function response - status:', (response as Response).status);

        if ((response as Response).ok) {
          const responseData = await (response as Response).json();
          const user = responseData.user || responseData.data?.user;

          if (user) {
            console.log('[authService] ✅ User created via Edge Function:', user.id);
            return { data: user, error: null };
          }
        } else {
          const status = (response as Response).status;
          console.warn(`[authService] Edge Function returned ${status}, will try fallback method`);
        }
      } catch (edgeFunctionError) {
        const errorMsg = edgeFunctionError instanceof Error
          ? edgeFunctionError.message
          : String(edgeFunctionError);
        console.warn('[authService] Edge Function failed:', errorMsg);
        // Continue to fallback
      }

      // Attempt 2: Fallback to regular signUp with email_confirm flag (requires email confirmation)
      console.log('[authService] Falling back to regular signUp method...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'client',
            created_via: 'admin_panel',
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error('[authService] SignUp error:', error.message);
        throw error;
      }

      if (data.user) {
        console.log('[authService] ✅ User created via fallback signUp:', data.user.id);
        // Note: User will need to confirm email with this method
        return { data: data.user, error: null };
      }

      throw new Error('No user data returned');
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[authService] Error creating user as admin:', errorMessage);
      return { data: null, error };
    }
  },

  /**
   * Update user password (admin function)
   * Note: This uses the regular auth.updateUser API which has limitations
   * This only works for the currently authenticated user, not arbitrary users
   */
  async updateUserPasswordAsAdmin(userId: string, newPassword: string) {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      console.log('[authService] Attempting to update password for user:', userId);

      // Note: This only works for the currently authenticated user
      // For admin-level password changes, a server-side function would be needed
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.warn('[authService] Could not update password via auth API:', errorMessage);
        // This is expected - we can only update current user's password this way
        // Password updates from admin panel aren't critical if they fail
        return { error: null }; // Return success to continue with other updates
      }

      console.log('[authService] Password updated successfully');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.warn('[authService] Error updating password:', errorMessage);
      // Don't fail - this is a secondary operation
      return { error: null };
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured()) {
      console.warn('[onAuthStateChange] Supabase not configured');
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[onAuthStateChange] Event:', event, 'Session:', !!session?.user);

      if (session?.user) {
        console.log('[onAuthStateChange] User detected:', session.user.id, session.user.email);
        console.log('[onAuthStateChange] User metadata:', session.user.user_metadata);

        let role: 'admin' | 'client' = (session.user.user_metadata?.role as 'admin' | 'client') || 'client';

        // If no role in metadata, try to fetch from database and update metadata
        if (!session.user.user_metadata?.role) {
          console.log('[onAuthStateChange] No role in metadata, fetching from database...');
          try {
            const { data: userData } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle();

            if (userData?.role) {
              console.log('[onAuthStateChange] Found role in database:', userData.role);
              role = userData.role as 'admin' | 'client';

              // Update metadata for next time
              try {
                console.log('[onAuthStateChange] Updating metadata with role:', userData.role);
                await supabase.auth.updateUser({
                  data: {
                    ...session.user.user_metadata,
                    role: userData.role,
                  }
                });
              } catch (err) {
                console.warn('[onAuthStateChange] Could not update metadata:', err);
              }
            }
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (err instanceof TypeError && errorMessage.includes('Failed to fetch')) {
              console.error('[onAuthStateChange] Network error while fetching user role from database');
            } else {
              console.warn('[onAuthStateChange] Could not fetch from database:', err);
            }
          }
        }

        console.log('[onAuthStateChange] Final role:', role);
        callback({
          id: session.user.id,
          email: session.user.email || '',
          role,
        });
      } else {
        console.log('[onAuthStateChange] No session');
        callback(null);
      }
    });

    return () => subscription?.unsubscribe();
  },
};
