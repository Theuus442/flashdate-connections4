import { supabase, isSupabaseConfigured } from './supabase';

export interface FinalizationStatus {
  eventId: string;
  userId: string;
  finalizado: boolean;
  updatedAt?: string;
}

export interface FinalizationResult {
  success: boolean;
  message: string;
  finalizedAt?: string;
}

export interface ContactVisibilityInfo {
  canViewContact: boolean;
  reason?: 'both_finalized' | 'user_not_finalized' | 'other_user_not_finalized' | 'same_user' | 'event_not_found';
}

/**
 * Service to manage user finalization status for events
 * Once finalized, users cannot modify their profile, votes, or selections
 */
export const finalizationService = {
  /**
   * Check if a user is finalized for a specific event
   */
  async isUserFinalized(eventId: string | null, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !eventId) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('finalizado')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('[finalizationService] Error checking finalized status:', error);
        return false;
      }

      return data?.finalizado || false;
    } catch (error) {
      console.error('[finalizationService] Exception checking finalized status:', error);
      return false;
    }
  },

  /**
   * Get finalization status for a user across all events
   */
  async getUserFinalizationStatus(userId: string): Promise<FinalizationStatus[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_finalization_status', {
          target_user_id: userId
        });

      if (error) {
        console.warn('[finalizationService] Error getting finalization status:', error);
        return [];
      }

      return data.map((item: any) => ({
        eventId: item.event_id,
        userId,
        finalizado: item.finalized,
        updatedAt: item.finalized_at
      })) || [];
    } catch (error) {
      console.error('[finalizationService] Exception getting finalization status:', error);
      return [];
    }
  },

  /**
   * Finalize user selections for an event
   * After finalization, all profile data and votes become read-only
   */
  async finalizeUserSelections(eventId: string | null, userId: string): Promise<FinalizationResult> {
    // If no event, treat as successful (local state only)
    if (!eventId) {
      return {
        success: true,
        message: 'Selections finalized locally',
        finalizedAt: new Date().toISOString()
      };
    }

    if (!isSupabaseConfigured()) {
      return {
        success: true,
        message: 'Selections finalized (local)',
        finalizedAt: new Date().toISOString()
      };
    }

    try {
      console.log('[finalizationService] Finalizing selections for user', { eventId, userId });

      // Call the finalize_user_selections function
      const { data, error } = await supabase
        .rpc('finalize_user_selections', {
          target_event_id: eventId,
          target_user_id: userId
        });

      if (error) {
        console.error('[finalizationService] Error finalizing selections:', error);
        return {
          success: false,
          message: 'Erro ao finalizar seleções: ' + (error.message || 'Unknown error')
        };
      }

      // data is an array with one row due to RETURNS TABLE
      const result = Array.isArray(data) ? data[0] : data;

      if (!result.success) {
        return {
          success: false,
          message: result.message
        };
      }

      console.log('[finalizationService] Selections finalized successfully');
      return {
        success: true,
        message: result.message,
        finalizedAt: result.finalized_at
      };
    } catch (error: any) {
      console.error('[finalizationService] Exception finalizing selections:', error?.message || error);
      return {
        success: false,
        message: 'Erro ao finalizar seleções'
      };
    }
  },

  /**
   * Unfinalizer user selections (admin only, used for corrections)
   * Note: This should only be callable by admins via database
   */
  async unfinalizeUserSelections(eventId: string, userId: string): Promise<FinalizationResult> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase not configured'
      };
    }

    try {
      console.log('[finalizationService] Unfinalizing selections for user', { eventId, userId });

      // Update directly (admin operation)
      const { error } = await supabase
        .from('event_participants')
        .update({ finalizado: false, updated_at: new Date().toISOString() })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('[finalizationService] Error unfinalizing selections:', error);
        return {
          success: false,
          message: 'Error unfinalizing selections'
        };
      }

      return {
        success: true,
        message: 'Selections unfinalized'
      };
    } catch (error: any) {
      console.error('[finalizationService] Exception unfinalizing selections:', error?.message || error);
      return {
        success: false,
        message: 'Error unfinalizing selections'
      };
    }
  },

  /**
   * Get the finalization status for an event
   * Returns count of finalized and non-finalized users
   */
  async getEventFinalizationStats(eventId: string): Promise<{
    totalParticipants: number;
    finalizedCount: number;
    pendingCount: number;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        totalParticipants: 0,
        finalizedCount: 0,
        pendingCount: 0
      };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('finalizado')
        .eq('event_id', eventId);

      if (error) throw error;

      const finalizedCount = (data || []).filter(p => p.finalizado).length;
      const totalParticipants = data?.length || 0;

      return {
        totalParticipants,
        finalizedCount,
        pendingCount: totalParticipants - finalizedCount
      };
    } catch (error) {
      console.error('[finalizationService] Error getting event stats:', error);
      return {
        totalParticipants: 0,
        finalizedCount: 0,
        pendingCount: 0
      };
    }
  },

  /**
   * Check if a user can view another user's contact information
   * Contact info should only be visible when BOTH users have finalized their selections
   *
   * @param eventId - The event ID
   * @param viewerId - The user trying to view the contact info
   * @param targetUserId - The user whose contact info is being viewed
   * @returns Object with canViewContact boolean and reason for decision
   */
  async canUserViewContact(
    eventId: string | null,
    viewerId: string,
    targetUserId: string
  ): Promise<ContactVisibilityInfo> {
    // Can't view your own contact info
    if (viewerId === targetUserId) {
      return {
        canViewContact: false,
        reason: 'same_user'
      };
    }

    // Without event context, contact cannot be shared
    if (!eventId) {
      return {
        canViewContact: false,
        reason: 'event_not_found'
      };
    }

    if (!isSupabaseConfigured()) {
      // Without Supabase, assume contact can be shared in fallback mode
      return {
        canViewContact: true,
        reason: 'both_finalized'
      };
    }

    try {
      // Check if BOTH users have finalized
      const viewerFinalized = await this.isUserFinalized(eventId, viewerId);
      const targetFinalized = await this.isUserFinalized(eventId, targetUserId);

      if (!viewerFinalized) {
        return {
          canViewContact: false,
          reason: 'user_not_finalized'
        };
      }

      if (!targetFinalized) {
        return {
          canViewContact: false,
          reason: 'other_user_not_finalized'
        };
      }

      // Both finalized, contact can be shared
      return {
        canViewContact: true,
        reason: 'both_finalized'
      };
    } catch (error) {
      console.error('[finalizationService] Error checking contact visibility:', error);
      // On error, deny contact access for safety
      return {
        canViewContact: false,
        reason: 'event_not_found'
      };
    }
  }
};
