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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((user: any) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        gender: user.gender,
        role: user.role || 'client',
        profileImage: user.profile_image_url,
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
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
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileImage) {
        const result = await storageService.uploadUserProfileImage(
          Date.now().toString(),
          profileImage
        );
        if (result.error) throw result.error;
        profileImageUrl = result.data;
      }

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
        }])
        .select()
        .single();

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
      };

      return { data: transformedData, error: null };
    } catch (error) {
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
      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileImage) {
        const result = await storageService.uploadUserProfileImage(id, profileImage);
        if (result.error) throw result.error;
        profileImageUrl = result.data;
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

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

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
      };

      return { data: transformedData, error: null };
    } catch (error) {
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
};
