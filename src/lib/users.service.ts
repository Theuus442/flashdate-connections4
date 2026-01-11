import { supabase, isSupabaseConfigured } from './supabase';
import { User } from '@/context/UsersContext';
import { storageService } from './storage.service';

export const usersService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<{ data: User[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Fetching users from Supabase...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[usersService] Supabase error:', error);
        throw error;
      }

      console.log('[usersService] Successfully fetched users, count:', data?.length || 0);

      const transformedData = data?.map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        gender: user.gender,
        role: user.role || 'client',
        profileImage: user.profile_image_url,
        password: user.password,
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[usersService] Error fetching users:', {
        message: errorMessage,
        type: error instanceof TypeError ? 'Network/Fetch Error' : 'Other Error',
        error,
      });

      // Check if it's a network error
      if (error instanceof TypeError && errorMessage.includes('Failed to fetch')) {
        console.error('[usersService] Network error detected - Supabase may be unreachable from this environment');
      }

      return { data: null, error };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedData = data ? {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        whatsapp: data.whatsapp,
        gender: data.gender,
        role: data.role || 'client',
        profileImage: data.profile_image_url,
        password: data.password,
      } : null;

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create new user - creates user directly in database without auth emails
   */
  async createUser(user: Omit<User, 'id'>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      console.error('[usersService] Supabase not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Creating user:', user);
      let profileImageUrl: string | undefined;

      // Generate a unique ID for the user
      const userId = crypto.randomUUID();
      console.log('[usersService] Generated user ID:', userId);

      // Upload profile image if provided
      if (profileImage) {
        console.log('[usersService] Uploading profile image...');
        const result = await storageService.uploadUserProfileImage(userId, profileImage);
        if (result.error) throw result.error;
        profileImageUrl = result.data;
        console.log('[usersService] Image uploaded:', profileImageUrl);
      }

      console.log('[usersService] Inserting user into database with data:', {
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        gender: user.gender,
        role: user.role || 'client',
        hasImage: !!profileImageUrl,
      });

      // Create user directly in database - no auth system needed!
      // This avoids email confirmations completely
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          name: user.name,
          username: user.username,
          email: user.email,
          whatsapp: user.whatsapp,
          gender: user.gender,
          role: user.role || 'client',
          password: user.password ? user.password.trim() : null, // Store password as-is for local auth
          profile_image_url: profileImageUrl,
          created_at: new Date().toISOString(),
        }])
        .select();

      if (error) {
        const errorMsg = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.error('[usersService] Database insert error:', {
          message: errorMsg,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        });
        throw error;
      }

      console.log('[usersService] Insert result:', { hasData: !!data, dataLength: data?.length });

      if (!data || data.length === 0) {
        throw new Error('Failed to insert user - no data returned');
      }

      const userData = data[0];
      const transformedData: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        whatsapp: userData.whatsapp,
        gender: userData.gender,
        role: userData.role || 'client',
        profileImage: userData.profile_image_url,
      };

      console.log('[usersService] User created successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error creating user:', errorMessage);
      return { data: null, error };
    }
  },

  /**
   * Update user
   */
  async updateUser(id: string, updates: Partial<User>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Updating user:', id);
      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileImage) {
        console.log('[usersService] Uploading profile image for user:', id);
        const result = await storageService.uploadUserProfileImage(id, profileImage);
        if (result.error) {
          console.error('[usersService] Error uploading profile image:', result.error);
          throw result.error;
        }
        profileImageUrl = result.data;
        console.log('[usersService] Profile image uploaded:', profileImageUrl);
      }

      // If password is being updated, update it in auth system first
      if (updates.password && updates.password.trim()) {
        console.log('[usersService] Updating password in auth system...');
        const authResult = await authService.updateUserPasswordAsAdmin(id, updates.password);
        if (authResult.error) {
          const errorMsg = authResult.error instanceof Error
            ? authResult.error.message
            : JSON.stringify(authResult.error);
          console.warn('[usersService] Could not update password via auth API:', errorMsg);
          // Don't throw error - password update is secondary, continue with other updates
        }
      } else if (updates.password === '') {
        // Empty password means don't update password - remove from updates
        console.log('[usersService] Password field is empty, skipping password update');
      }

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.username) updateData.username = updates.username;
      if (updates.email) updateData.email = updates.email;
      if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.role) updateData.role = updates.role;
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl;
      updateData.updated_at = new Date().toISOString();

      console.log('[usersService] Updating user:', id, 'with', Object.keys(updateData).length, 'fields');

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select();

      console.log('[usersService] Update response received:', { hasData: !!data, hasError: !!error, dataLength: data?.length });

      if (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : (error?.message || JSON.stringify(error));
        console.error('[usersService] Update error:', {
          message: errorMessage,
          code: error?.code,
          details: error?.details,
          hint: error?.hint,
        });
        throw error;
      }

      // If select() didn't return data (RLS issue), fetch the user separately
      let userData: any;
      if (!data || data.length === 0) {
        const { data: fetchedUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('[usersService] Failed to fetch updated user:', fetchError);
          throw new Error(`User with ID ${id} not found`);
        }

        if (!fetchedUser) {
          console.error('[usersService] No user found with ID:', id);
          throw new Error(`User with ID ${id} not found`);
        }

        userData = fetchedUser;
      } else {
        userData = data[0];
      }
      const transformedData: User = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        whatsapp: userData.whatsapp,
        gender: userData.gender,
        role: userData.role || 'client',
        profileImage: userData.profile_image_url,
      };

      console.log('[usersService] User updated successfully');
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      console.error('[usersService] Error updating user:', errorMessage);
      return { data: null, error };
    }
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Delete all users by role
   */
  async deleteAllByRole(role: 'admin' | 'client'): Promise<{ count: number; error: any }> {
    if (!isSupabaseConfigured()) {
      return { count: 0, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Deleting all users with role:', role);

      // First, get count of users to delete
      const { data: countData, error: countError } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', role);

      if (countError) throw countError;
      const count = countData?.length || 0;

      console.log('[usersService] Found', count, 'users to delete');

      // Then delete them
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('role', role);

      if (error) throw error;

      console.log('[usersService] Successfully deleted', count, 'users with role:', role);
      return { count, error: null };
    } catch (error) {
      console.error('[usersService] Error deleting users by role:', error);
      return { count: 0, error };
    }
  },
};
