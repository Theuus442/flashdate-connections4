import { supabase, isSupabaseConfigured } from './supabase';
import { eventParticipantsService } from './event-participants.service';

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

/**
 * Service to manage user finalization status for events
 * Once finalized, users cannot modify their profile, votes, or selections
 */
/**
 * Special event ID used for global finalization (not tied to a specific event)
 */
const GLOBAL_EVENT_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Ensure the global event exists in the database
 */
async function ensureGlobalEventExists(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.log('[finalizationService] Supabase not configured, skipping global event creation');
    return false;
  }

  try {
    console.log('[finalizationService] Checking if global event exists...');

    // Check if global event already exists
    const { data: existingEvent, error: selectError } = await supabase
      .from('events')
      .select('id')
      .eq('id', GLOBAL_EVENT_ID)
      .maybeSingle();

    if (selectError) {
      console.warn('[finalizationService] Error checking for global event:', selectError.message);
    }

    if (existingEvent) {
      console.log('[finalizationService] ✅ Global event already exists');
      return true;
    }

    console.log('[finalizationService] Creating global event for finalization tracking...');
    const { error: insertError } = await supabase
      .from('events')
      .insert([{
        id: GLOBAL_EVENT_ID,
        title: 'Global Finalization Event',
        description: 'Internal event for tracking user selection finalization status',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.warn('[finalizationService] ⚠️ Could not create global event:', insertError.message);
      // Check if it actually exists despite the error
      const { data: checkAfter } = await supabase
        .from('events')
        .select('id')
        .eq('id', GLOBAL_EVENT_ID)
        .maybeSingle();

      return !!checkAfter;
    }

    console.log('[finalizationService] ✅ Global event created successfully');
    return true;
  } catch (error) {
    console.error('[finalizationService] Exception ensuring global event:', error);
    return false;
  }
}

/**
 * Ensure user is registered as a participant in the event
 */
async function ensureUserIsParticipant(eventId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    console.log('[finalizationService] Checking if user is participant in event...', { eventId, userId });

    // Check if user is already a participant
    const { data: isParticipant } = await eventParticipantsService.isUserParticipant(eventId, userId);

    if (isParticipant) {
      console.log('[finalizationService] ✅ User is already a participant');
      return;
    }

    // Register user as participant
    console.log('[finalizationService] Registering user as participant...');
    const { data: registered, error: registerError } = await eventParticipantsService.registerParticipant(
      eventId,
      userId,
      'confirmed'
    );

    if (registerError) {
      console.warn('[finalizationService] Could not register as participant:', registerError);
      // Don't throw - we'll try anyway
    } else {
      console.log('[finalizationService] ✅ User registered as participant successfully', registered);
    }
  } catch (error) {
    console.warn('[finalizationService] Exception ensuring user is participant:', error);
    // Don't throw - continue anyway
  }
}

/**
 * Check if the 'finalizado' column exists in event_participants table
 */
let finalizadoColumnChecked = false;
let finalizadoColumnExists = false;

async function checkFinalizedColumnExists(): Promise<boolean> {
  if (finalizadoColumnChecked) {
    return finalizadoColumnExists;
  }

  if (!isSupabaseConfigured()) return false;

  try {
    console.log('[finalizationService] Checking if "finalizado" column exists...');

    // Try to query the column - if it doesn't exist, we'll get an error
    const { error } = await supabase
      .from('event_participants')
      .select('finalizado')
      .limit(1);

    finalizadoColumnChecked = true;

    if (error) {
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('column') || errorMsg.includes('finalizado')) {
        console.warn('[finalizationService] ⚠️ Column "finalizado" not found in event_participants table');
        console.warn('[finalizationService] ⚠️ Run the SQL script from ADD_FINALIZED_FIELD.sql in Supabase');
        finalizadoColumnExists = false;
      } else {
        // Some other error, but column probably exists
        console.log('[finalizationService] ✅ Column exists (other query error)');
        finalizadoColumnExists = true;
      }
    } else {
      console.log('[finalizationService] ✅ Column "finalizado" exists');
      finalizadoColumnExists = true;
    }

    return finalizadoColumnExists;
  } catch (error) {
    console.warn('[finalizationService] Error checking column:', error);
    finalizadoColumnChecked = true;
    finalizadoColumnExists = true; // Assume it exists to continue
    return true;
  }
}

export const finalizationService = {
  /**
   * Check if a user is finalized for a specific event
   */
  async isUserFinalized(eventId: string | null, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.warn('[finalizationService] Supabase not configured');
      return false;
    }

    if (!eventId) {
      console.warn('[finalizationService] No eventId provided');
      return false;
    }

    try {
      console.log('[finalizationService] Checking finalization status for:', { eventId, userId });

      // Ensure the event exists (especially for global event ID)
      if (eventId === GLOBAL_EVENT_ID) {
        await ensureGlobalEventExists();
      }

      const { data, error } = await supabase
        .from('event_participants')
        .select('id, finalizado, user_id, event_id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[finalizationService] ❌ Query error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          eventId,
          userId
        });
        return false;
      }

      if (!data) {
        console.log('[finalizationService] No event_participant record found for this user - status is NOT finalized');
        return false;
      }

      const isFinalized = data.finalizado === true;
      console.log('[finalizationService] ✅ Record found:', {
        isFinalized,
        finalizado: data.finalizado,
        id: data.id,
        eventId,
        userId
      });

      return isFinalized;
    } catch (error) {
      console.error('[finalizationService] ❌ Exception checking finalized status:', error);
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
      console.log('[finalizationService] 🔒 Finalizing selections for user', { eventId, userId });

      // Ensure the event exists (especially for global event ID)
      if (eventId === GLOBAL_EVENT_ID) {
        console.log('[finalizationService] Ensuring global event exists...');
        await ensureGlobalEventExists();
      }

      // Ensure user is registered as a participant in the event
      console.log('[finalizationService] Ensuring user is participant in event...');
      await ensureUserIsParticipant(eventId, userId);

      console.log('[finalizationService] Proceeding with finalization...');

      // First try to use the RPC function
      try {
        const { data, error } = await supabase
          .rpc('finalize_user_selections', {
            target_event_id: eventId,
            target_user_id: userId
          });

        if (error) {
          console.warn('[finalizationService] RPC function error:', error.message);
          // Fall through to manual update method
        } else {
          // data is an array with one row due to RETURNS TABLE
          const result = Array.isArray(data) ? data[0] : data;

          if (!result.success) {
            return {
              success: false,
              message: result.message
            };
          }

          console.log('[finalizationService] Selections finalized successfully via RPC');
          return {
            success: true,
            message: result.message,
            finalizedAt: result.finalized_at
          };
        }
      } catch (rpcError) {
        console.warn('[finalizationService] RPC exception:', rpcError);
        // Fall through to manual update
      }

      // Fallback: Manually create or update the event_participants record
      console.log('[finalizationService] Using fallback manual finalization...', { eventId, userId });

      // First, try to find existing record
      const { data: existingRecord, error: selectError } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      if (selectError) {
        console.warn('[finalizationService] Error checking for existing record:', selectError);
      }

      const now = new Date().toISOString();

      if (existingRecord) {
        console.log('[finalizationService] Updating existing participant record...');
        // Update existing record
        const { error: updateError } = await supabase
          .from('event_participants')
          .update({
            finalizado: true,
            updated_at: now
          })
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (updateError) {
          console.error('[finalizationService] ❌ Error updating participant:', updateError);
          return {
            success: false,
            message: 'Erro ao finalizar seleções: ' + (updateError.message || 'Não foi possível atualizar')
          };
        }
        console.log('[finalizationService] ✅ Participant record updated successfully');
      } else {
        console.log('[finalizationService] Creating new participant record...');
        // Insert new record
        const { error: insertError } = await supabase
          .from('event_participants')
          .insert([{
            event_id: eventId,
            user_id: userId,
            status: 'confirmed',
            finalizado: true,
            joined_at: now,
            updated_at: now
          }]);

        if (insertError) {
          console.error('[finalizationService] ❌ Error creating participant record:', insertError);
          return {
            success: false,
            message: 'Erro ao finalizar seleções: ' + (insertError.message || 'Não foi possível criar registro')
          };
        }
        console.log('[finalizationService] ✅ Participant record created successfully');
      }

      console.log('[finalizationService] ✅ Selections finalized successfully via manual update');
      return {
        success: true,
        message: 'Seleções finalizadas com sucesso',
        finalizedAt: now
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
  }
};
