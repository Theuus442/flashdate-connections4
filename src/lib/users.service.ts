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
   * Create new user
   */
  async createUser(user: Omit<User, 'id'>, profileImage?: File): Promise<{ data: User | null; error: any }> {
    if (!isSupabaseConfigured()) {
      console.error('[usersService] Supabase not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[usersService] Creating user:', user);
      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileImage) {
        console.log('[usersService] Uploading profile image...');
        const result = await storageService.uploadUserProfileImage(
          Date.now().toString(),
          profileImage
        );
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

      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: user.name,
          username: user.username,
          email: user.email,
          whatsapp: user.whatsapp,
          gender: user.gender,
          role: user.role || 'client',
          profile_image_url: profileImageUrl,
          // Note: password is managed by Supabase Auth, not inserted via REST API
        }])
        .select()
        .single();

      if (error) {
        console.error('[usersService] Database insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      }
      console.log('[usersService] Insert result:', { hasData: !!data, hasError: !!error });

      if (error) throw error;

      const transformedData: User = {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        whatsapp: data.whatsapp,
        gender: data.gender,
        role: data.role || 'client',
        profileImage: data.profile_image_url,
        password: data.password,
      };

      console.log('[usersService] User created successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('[usersService] Error creating user:', errorMessage);
      console.error('[usersService] Full error:', error);
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

      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.username) updateData.username = updates.username;
      if (updates.email) updateData.email = updates.email;
      if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
      if (updates.gender) updateData.gender = updates.gender;
      if (updates.role) updateData.role = updates.role;
      // Note: password should not be updated via REST API - it's managed by Supabase Auth
      if (profileImageUrl) updateData.profile_image_url = profileImageUrl;
      updateData.updated_at = new Date().toISOString();

      console.log('[usersService] Update data to send:', updateData);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[usersService] Update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      const transformedData: User = {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        whatsapp: data.whatsapp,
        gender: data.gender,
        role: data.role || 'client',
        profileImage: data.profile_image_url,
        password: data.password,
      };

      console.log('[usersService] User updated successfully:', transformedData);
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('[usersService] Error updating user:', {
        message: errorMessage,
        error,
      });
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
