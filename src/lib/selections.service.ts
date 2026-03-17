import { supabase, isSupabaseConfigured } from './supabase';
import { Selection } from '@/context/SelectionsContext';
import { finalizationService } from './finalization.service';
import { networkDiagnostics } from './network-diagnostics';

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
      const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('[selectionsService.getSelections] Error:', errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('[selectionsService] Supabase error getting selections:', errorMsg, error);
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
      const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('[selectionsService] Exception getting selections:', errorMsg);

      // Log network-specific errors with diagnostics
      if (networkDiagnostics.isNetworkError(error)) {
        console.error('[selectionsService] ⚠️  Network connectivity issue detected');
        networkDiagnostics.logDiagnostics();
      }

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
   * First checks if selection already exists and removes it to avoid duplicates
   * Also checks if user is finalized - if so, prevents the addition
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
      // Check if user is finalized for this event
      if (eventId) {
        const isFinalized = await finalizationService.isUserFinalized(eventId, userId);
        if (isFinalized) {
          console.log('[selectionsService] Cannot add selection: user is finalized');
          return { data: null, error: 'User is finalized and cannot make new selections' };
        }
      }

      console.log('[selectionsService] Adding selection:', { eventId, userId, selectedUserId, vote });

      // First, remove any existing selection for this user->selectedUser pair to avoid duplicates when event_id is null
      // Build query to find existing selections
      let deleteQuery = supabase
        .from('selections')
        .delete()
        .eq('user_id', userId)
        .eq('selected_user_id', selectedUserId);

      // Handle event_id filter
      if (eventId) {
        deleteQuery = deleteQuery.eq('event_id', eventId);
      } else {
        deleteQuery = deleteQuery.is('event_id', null);
      }

      const { error: deleteError } = await deleteQuery;
      if (deleteError) {
        console.warn('[selectionsService] Warning deleting old selection:', deleteError?.message);
      }

      // Now insert the new selection
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
   * Checks if user is finalized - if so, prevents the update
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
      // Check if user is finalized for this event
      if (eventId) {
        const isFinalized = await finalizationService.isUserFinalized(eventId, userId);
        if (isFinalized) {
          console.log('[selectionsService] Cannot update selection: user is finalized');
          return { data: null, error: 'User is finalized and cannot modify selections' };
        }
      }

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
   * Checks if user is finalized - if so, prevents the deletion
   */
  async removeSelection(eventId: string | null, userId: string, selectedUserId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      // Return success for local state update
      return { error: null };
    }

    try {
      // Check if user is finalized for this event
      if (eventId) {
        const isFinalized = await finalizationService.isUserFinalized(eventId, userId);
        if (isFinalized) {
          console.log('[selectionsService] Cannot remove selection: user is finalized');
          return { error: 'User is finalized and cannot delete selections' };
        }
      }

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
   *
   * IMPORTANT: This function returns ALL mutual matches, regardless of finalization status.
   * The eventId is included so frontend can check finalization if needed.
   * Use getMutualMatchesIfFinalized() to get only matches where both users have finalized.
   */
  async getMutualMatches(): Promise<{ data: Array<{ userId: string; selectedUserId: string; matchType: 'MATCH' | 'AMIZADE'; createdAt: string; eventId: string | null }> | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      // Fetch all selections (not just SIM) - include event_id
      const { data: allSelections, error: queryError } = await supabase
        .from('selections')
        .select('id, user_id, selected_user_id, vote, created_at, event_id')
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
      const mutualMatches: Array<{ userId: string; selectedUserId: string; matchType: 'MATCH' | 'AMIZADE'; createdAt: string; eventId: string | null }> = [];
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
          eventId: selection.event_id,
        });

        seen.add(pair);
      }

      console.log('[getMutualMatches] Total mutual matches found:', mutualMatches.length, mutualMatches);
      return { data: mutualMatches, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get mutual matches ONLY if both users have finalized their selections.
   * This ensures contact information is only shared when both parties have confirmed.
   * Uses the RPC function get_mutual_matches_if_finalized() from the database.
   */
  async getMutualMatchesIfFinalized(): Promise<{ data: Array<{ userId: string; selectedUserId: string; matchType: 'MATCH' | 'AMIZADE'; createdAt: string }> | null; error: any }> {
    if (!isSupabaseConfigured()) {
      console.log('[getMutualMatchesIfFinalized] Supabase not configured');
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      console.log('[getMutualMatchesIfFinalized] Calling RPC function...');

      const { data, error } = await supabase.rpc('get_mutual_matches_if_finalized');

      if (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('[getMutualMatchesIfFinalized] RPC error:', errorMsg, error);

        // Log network-specific errors with diagnostics
        if (networkDiagnostics.isNetworkError(error)) {
          console.error('[getMutualMatchesIfFinalized] ⚠️  Network connectivity issue detected');
          networkDiagnostics.logDiagnostics();
        }

        throw error;
      }

      if (!data || data.length === 0) {
        console.log('[getMutualMatchesIfFinalized] No finalized matches found');
        return { data: [], error: null };
      }

      const transformedData = data.map((match: any) => ({
        userId: match.user_id,
        selectedUserId: match.selected_user_id,
        matchType: match.match_type as 'MATCH' | 'AMIZADE',
        createdAt: match.created_at,
      }));

      console.log('[getMutualMatchesIfFinalized] Found', transformedData.length, 'finalized matches');
      return { data: transformedData, error: null };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('[getMutualMatchesIfFinalized] Exception:', errorMsg);
      // Return empty array instead of error to allow app to continue
      return { data: [], error: null };
    }
  },
};
