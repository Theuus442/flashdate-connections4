import { supabase, isSupabaseConfigured } from './supabase';
import { Selection } from '@/context/SelectionsContext';

/**
 * Check if a string is a valid UUID v4
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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

    // Skip if event_id is not a valid UUID (placeholder like 'default-event-id')
    if (!isValidUUID(eventId)) {
      console.log('Skipping selections load: invalid event_id format');
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
   * Add selection (event_id can be null)
   */
  async addSelection(eventId: string | null, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO'): Promise<{ data: Selection | null; error: any }> {
    // Return local selection object as fallback (always works, even without Supabase)
    const selection: Selection = {
      eventId: eventId || '',
      userId,
      selectedUserId,
      vote,
      timestamp: Date.now(),
    };

    if (!isSupabaseConfigured()) {
      return { data: selection, error: null };
    }

    try {
      console.log('[selectionsService] Adding selection:', { eventId, userId, selectedUserId, vote });

      const { data, error } = await supabase
        .from('selections')
        .insert([{
          event_id: eventId,  // Can be null
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

      console.log('[selectionsService] Selection added successfully');
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error adding selection to database:', error?.message || error);
      // Return local selection object as fallback
      return { data: selection, error: null };
    }
  },

  /**
   * Update selection (change vote) - event_id can be null
   */
  async updateSelection(eventId: string | null, userId: string, selectedUserId: string, vote: 'SIM' | 'TALVEZ' | 'NÃO'): Promise<{ data: Selection | null; error: any }> {
    // Return local selection object as fallback (always works, even without Supabase)
    const selection: Selection = {
      eventId: eventId || '',
      userId,
      selectedUserId,
      vote,
      timestamp: Date.now(),
    };

    if (!isSupabaseConfigured()) {
      return { data: selection, error: null };
    }

    try {
      console.log('[selectionsService] Updating selection:', { eventId, userId, selectedUserId, vote });

      // Build query
      let query = supabase
        .from('selections')
        .update({ vote })
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      // Only add event_id filter if it's not null
      if (eventId) {
        query = query.eq('event_id', eventId);
      } else {
        query = query.is('event_id', null);
      }

      const { data, error } = await query
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

      console.log('[selectionsService] Selection updated successfully');
      return { data: transformedData, error: null };
    } catch (error: any) {
      console.error('Error updating selection in database:', error?.message || error);
      // Return local selection object as fallback
      return { data: selection, error: null };
    }
  },

  /**
   * Remove selection (event_id can be null)
   */
  async removeSelection(eventId: string | null, userId: string, selectedUserId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      // Return success for local state update
      return { error: null };
    }

    try {
      console.log('[selectionsService] Removing selection:', { eventId, userId, selectedUserId });

      // Build query
      let query = supabase
        .from('selections')
        .delete()
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      // Only add event_id filter if it's not null
      if (eventId) {
        query = query.eq('event_id', eventId);
      } else {
        query = query.is('event_id', null);
      }

      const { error } = await query;

      if (error) throw error;

      console.log('[selectionsService] Selection removed successfully');
      return { error: null };
    } catch (error: any) {
      console.error('Error removing selection from database:', error?.message || error);
      // Return success even on error to allow local state update
      return { error: null };
    }
  },

  /**
   * Get mutual matches with priority rule:
   * - SIM + SIM = MATCH
   * - SIM + TALVEZ = AMIZADE (friendship has priority)
   * - TALVEZ + SIM = AMIZADE
   * - TALVEZ + TALVEZ = AMIZADE
   * - Anything with NÃO = no match
   */
  async getMutualMatches(): Promise<{ data: Array<{ userId: string; selectedUserId: string; matchType: 'MATCH' | 'AMIZADE'; createdAt: string }> | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      // Fetch all selections (not just SIM)
      const { data: allSelections, error: queryError } = await supabase
        .from('selections')
        .select('id, user_id, selected_user_id, vote, created_at')
        .in('vote', ['SIM', 'TALVEZ'])
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      if (!allSelections || allSelections.length === 0) {
        return { data: [], error: null };
      }

      // Build a map of votes: votesMap[userA][userB] = vote
      type VotesMap = Record<string, Record<string, 'SIM' | 'TALVEZ'>>;
      const votesMap: VotesMap = {};

      for (const selection of allSelections) {
        if (!votesMap[selection.user_id]) {
          votesMap[selection.user_id] = {};
        }
        votesMap[selection.user_id][selection.selected_user_id] = selection.vote;
      }

      // Find mutual connections and apply priority rule
      const mutualMatches: Array<{ userId: string; selectedUserId: string; matchType: 'MATCH' | 'AMIZADE'; createdAt: string }> = [];
      const seen = new Set<string>();

      for (const selection of allSelections) {
        const userA = selection.user_id;
        const userB = selection.selected_user_id;
        const pair = [userA, userB].sort().join('|');

        // Skip if we already processed this pair
        if (seen.has(pair)) continue;

        // Check if reverse selection exists
        const voteAtoB = votesMap[userA]?.[userB];
        const voteBtoA = votesMap[userB]?.[userA];

        if (!voteAtoB || !voteBtoA) {
          // No mutual selection
          continue;
        }

        // Apply priority rule
        let matchType: 'MATCH' | 'AMIZADE';

        if (voteAtoB === 'SIM' && voteBtoA === 'SIM') {
          // Both said SIM = MATCH
          matchType = 'MATCH';
        } else {
          // One or both said TALVEZ = AMIZADE (friendship has priority)
          matchType = 'AMIZADE';
        }

        console.log(`[getMutualMatches] Mutual connection: ${userA} (${voteAtoB}) <-> ${userB} (${voteBtoA}) = ${matchType}`);

        mutualMatches.push({
          userId: userA,
          selectedUserId: userB,
          matchType,
          createdAt: selection.created_at,
        });

        seen.add(pair);
      }

      console.log('[getMutualMatches] Total mutual matches found:', mutualMatches.length, mutualMatches);
      return { data: mutualMatches, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
