import { supabase, isSupabaseConfigured } from './supabase';

export const storageService = {
  /**
   * Upload user profile image
   */
  async uploadUserProfileImage(userId: string, file: File): Promise<{ data: string | null; error: any }> {
    if (!isSupabaseConfigured()) {
      // Return a data URL for local development
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ data: reader.result as string, error: null });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `${userId}-${Date.now()}-${file.name}`;
      const filePath = `profiles/${fileName}`;

      console.log('[storageService] Uploading profile image to bucket: profiles');
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      console.log('[storageService] Profile image uploaded successfully:', data.publicUrl);
      return { data: data.publicUrl, error: null };
    } catch (error) {
      console.error('[storageService] Error uploading profile image:', error);
      return { data: null, error };
    }
  },

  /**
   * Upload event image
   */
  async uploadEventImage(eventId: string, file: File): Promise<{ data: string | null; error: any }> {
    if (!isSupabaseConfigured()) {
      // Return a data URL for local development
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ data: reader.result as string, error: null });
        };
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileName = `${eventId}-${Date.now()}-${file.name}`;
      const filePath = `events/${fileName}`;

      console.log('[storageService] Uploading event image to bucket: events');
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);

      console.log('[storageService] Event image uploaded successfully:', data.publicUrl);
      return { data: data.publicUrl, error: null };
    } catch (error) {
      console.error('[storageService] Error uploading event image:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete user profile image
   */
  async deleteUserProfileImage(filePath: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      console.log('[storageService] Deleting profile image:', filePath);
      const { error } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (error) throw error;
      console.log('[storageService] Profile image deleted successfully');
      return { error: null };
    } catch (error) {
      console.error('[storageService] Error deleting profile image:', error);
      return { error };
    }
  },

  /**
   * Delete event image
   */
  async deleteEventImage(filePath: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    try {
      console.log('[storageService] Deleting event image:', filePath);
      const { error } = await supabase.storage
        .from('events')
        .remove([filePath]);

      if (error) throw error;
      console.log('[storageService] Event image deleted successfully');
      return { error: null };
    } catch (error) {
      console.error('[storageService] Error deleting event image:', error);
      return { error };
    }
  },
};
