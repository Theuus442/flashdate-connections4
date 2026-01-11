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
        id: selection.id,
        eventId: selection.event_id,
        userId: selection.user_id,
        selectedUserId: selection.selected_user_id,
        vote: selection.vote as 'SIM' | 'TALVEZ' | 'NÃO',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get selections by vote type
   */
  async getSelectionsByVote(vote: 'SIM' | 'TALVEZ' | 'NÃO'): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .eq('vote', vote)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((selection: any) => ({
        id: selection.id,
        eventId: selection.event_id,
        userId: selection.user_id,
        selectedUserId: selection.selected_user_id,
        vote: selection.vote as 'SIM' | 'TALVEZ' | 'NÃO',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get selections for a specific user in an event
   */
  async getSelectionsForUserInEvent(eventId: string, userId: string): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error getting selections:', error);
        throw error;
      }

      const transformedData = data?.map((selection: any) => ({
        id: selection.id,
        eventId: selection.event_id,
        userId: selection.user_id,
        selectedUserId: selection.selected_user_id,
        vote: selection.vote as 'SIM' | 'TALVEZ' | 'NÃO',
        timestamp: new Date(selection.created_at).getTime(),
      }));

      return { data: transformedData || [], error: null };
    } catch (error: any) {
      console.error('Exception getting selections:', error?.message || error);
      // Return empty array instead of error to allow app to continue
      return { data: [], error: null };
    }
  },

  /**
   * Get all selections for an event
   */
  async getSelectionsForEvent(eventId: string): Promise<{ data: Selection[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((selection: any) => ({
        id: selection.id,
        eventId: selection.event_id,
        userId: selection.user_id,
        selectedUserId: selection.selected_user_id,
        vote: selection.vote as 'SIM' | 'TALVEZ' | 'NÃO',
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
  async addSelection(eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO'): Promise<{ data: Selection | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('selections')
        .insert([{
          event_id: eventId,
          user_id: userId,
          selected_user_id: selectedUserId,
          vote,
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: Selection = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        selectedUserId: data.selected_user_id,
        vote: data.vote as 'SIM' | 'TALVEZ' | 'NÃO',
        timestamp: new Date(data.created_at).getTime(),
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update selection (change vote)
   */
  async updateSelection(eventId: string, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO'): Promise<{ data: Selection | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      // Update existing selection
      const { data, error } = await supabase
        .from('selections')
        .update({ vote })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId)
        .select()
        .single();

      if (error) throw error;

      const transformedData: Selection = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        selectedUserId: data.selected_user_id,
        vote: data.vote as 'SIM' | 'TALVEZ' | 'NÃO',
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
  async removeSelection(eventId: string, userId: string, selectedUserId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('selections')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
