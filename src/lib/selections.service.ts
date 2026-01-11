import { supabase, isSupabaseConfigured } from './supabase';
import { Selection } from '@/context/SelectionsContext';

export const selectionsService = {
  /**
   * Get all selections
   */
  async getSelections(): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((selection: any) => ({
        userId: selection.selected_user_id,
        type: selection.type as 'match' | 'friendship' | 'no-interest',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get selections by type
   */
  async getSelectionsByType(type: 'match' | 'friendship' | 'no-interest'): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((selection: any) => ({
        userId: selection.selected_user_id,
        type: selection.type as 'match' | 'friendship' | 'no-interest',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get selections for a specific user
   */
  async getSelectionsForUser(userId: string): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((selection: any) => ({
        userId: selection.selected_user_id,
        type: selection.type as 'match' | 'friendship' | 'no-interest',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Add selection
   */
  async addSelection(userId: string, selectedUserId: string, type: 'match' | 'friendship' | 'no-interest'): Promise<{ data: Selection | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .insert([{
          user_id: userId,
          selected_user_id: selectedUserId,
          type,
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Selection = {
        userId: data.selected_user_id,
        type: data.type as 'match' | 'friendship' | 'no-interest',
        timestamp: new Date(data.created_at).getTime(),
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update selection (replace type)
   */
  async updateSelection(userId: string, selectedUserId: string, type: 'match' | 'friendship' | 'no-interest'): Promise<{ data: Selection | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      // First, try to delete existing selection
      await supabase
        .from('selections')
        .delete()
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      // Then insert new one
      const { data, error } = await supabase
        .from('selections')
        .insert([{
          user_id: userId,
          selected_user_id: selectedUserId,
          type,
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Selection = {
        userId: data.selected_user_id,
        type: data.type as 'match' | 'friendship' | 'no-interest',
        timestamp: new Date(data.created_at).getTime(),
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Remove selection
   */
  async removeSelection(userId: string, selectedUserId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('selections')
        .delete()
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
