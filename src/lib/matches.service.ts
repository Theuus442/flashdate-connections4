import { supabase, isSupabaseConfigured } from './supabase';
import { sendMatchEmail } from './email.service';

export interface ParticipantStatus {
  userId: string;
  name: string;
  email: string;
  finalizado: boolean;
}

export interface EventMatchStatus {
  eventId: string;
  eventTitle: string;
  totalParticipants: number;
  finalizedCount: number;
  matchesSent: boolean;
  participants: ParticipantStatus[];
}

export interface MatchResult {
  userId: string;
  matchedUserId: string;
  matchedName: string;
  matchedEmail: string;
  matchedWhatsapp?: string;
}

/**
 * Service to manage match sending from admin dashboard
 * Matches are calculated but NOT sent until admin approves
 */
export const matchesService = {
  /**
   * Get status of participants and finalization for an event
   */
  async getEventMatchStatus(eventId: string): Promise<EventMatchStatus | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      // Get all participants for the event with their finalization status
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          finalizado,
          matches_sent,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('event_id', eventId);

      if (participantsError) throw participantsError;

      console.log('[matchesService.getEventMatchStatus] Raw participants data:', {
        eventId,
        count: participants?.length || 0,
        participants,
      });

      // Get event title
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      const participantStatuses = (participants || []).map((p: any) => {
        // Log if user data is missing
        if (!p.users) {
          console.warn('[matchesService.getEventMatchStatus] Missing user data for participant:', {
            eventId,
            userId: p.user_id,
          });
        }
        
        return {
          userId: p.user_id,
          name: p.users?.name || 'Usuário Desconhecido',
          email: p.users?.email || 'Email não encontrado',
          finalizado: p.finalizado || false,
        };
      });

      const finalizedCount = participantStatuses.filter((p) => p.finalizado).length;
      const matchesSent = (participants || [])[0]?.matches_sent || false;

      console.log('[matchesService.getEventMatchStatus] Processed status:', {
        eventId,
        eventTitle: eventData?.title,
        totalParticipants: participants?.length || 0,
        finalizedCount,
        matchesSent,
      });

      return {
        eventId,
        eventTitle: eventData?.title || 'Unknown Event',
        totalParticipants: participants?.length || 0,
        finalizedCount,
        matchesSent,
        participants: participantStatuses,
      };
    } catch (error) {
      console.error('[matchesService.getEventMatchStatus] Error:', error);
      return null;
    }
  },

  /**
   * Calculate matches for an event
   * Returns mutual "SIM" votes between users
   */
  async calculateMatches(eventId: string): Promise<Map<string, MatchResult[]>> {
    if (!isSupabaseConfigured()) {
      return new Map();
    }

    try {
      // Get all "SIM" votes for this event
      const { data: selections, error } = await supabase
        .from('selections')
        .select(`
          user_id,
          selected_user_id,
          vote,
          users:user_id (
            id,
            name,
            email,
            whatsapp
          )
        `)
        .eq('event_id', eventId)
        .eq('vote', 'SIM');

      if (error) throw error;

      // Calculate mutual matches
      const matchesMap = new Map<string, MatchResult[]>();

      if (!selections || selections.length === 0) {
        return matchesMap;
      }

      // Group selections by user
      for (const selection of selections as any[]) {
        const userId = selection.user_id;
        const selectedUserId = selection.selected_user_id;

        // Check if there's a mutual "SIM" vote
        const mutualVote = selections.find(
          (s: any) =>
            s.user_id === selectedUserId &&
            s.selected_user_id === userId &&
            s.vote === 'SIM'
        );

        if (mutualVote && selection.users) {
          const userData = Array.isArray(selection.users) ? selection.users[0] : selection.users;
          
          // Avoid duplicates by only recording once (smaller UUID first)
          if (userId < selectedUserId) {
            const matchResult: MatchResult = {
              userId: selectedUserId,
              matchedUserId: userId,
              matchedName: userData?.name || 'Unknown',
              matchedEmail: userData?.email || 'Unknown',
              matchedWhatsapp: userData?.whatsapp,
            };

            if (!matchesMap.has(selectedUserId)) {
              matchesMap.set(selectedUserId, []);
            }
            matchesMap.get(selectedUserId)!.push(matchResult);
          }
        }
      }

      return matchesMap;
    } catch (error) {
      console.error('[matchesService.calculateMatches] Error:', error);
      return new Map();
    }
  },

  /**
   * Send matches to all participants
   * Called only when admin clicks "Enviar Matchs"
   */
  async sendMatchesToAll(eventId: string): Promise<{ success: boolean; message: string; sentCount: number }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured', sentCount: 0 };
    }

    try {
      // Get event details
      const { data: eventData } = await supabase
        .from('events')
        .select('id, title, email')
        .eq('id', eventId)
        .single();

      if (!eventData) {
        return { success: false, message: 'Event not found', sentCount: 0 };
      }

      // Calculate matches
      const matchesMap = await this.calculateMatches(eventId);

      // Get all finalized participants
      const { data: participants } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          finalizado,
          users:user_id (
            id,
            name,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('finalizado', true);

      if (!participants || participants.length === 0) {
        return { success: false, message: 'No finalized participants', sentCount: 0 };
      }

      let sentCount = 0;
      const errors: string[] = [];

      // Send email to each participant with their matches
      for (const participant of participants as any[]) {
        try {
          const userMatches = matchesMap.get(participant.user_id) || [];

          // Skip if no matches
          if (userMatches.length === 0) {
            continue;
          }

          // Get user data (handle both object and array formats)
          const userData = Array.isArray(participant.users) ? participant.users[0] : participant.users;
          
          // Send email with matches
          await sendMatchEmail({
            recipientEmail: userData?.email || '',
            recipientName: userData?.name || 'User',
            eventTitle: eventData.title,
            matches: userMatches,
          });

          sentCount++;

          // Mark as matches_sent for this participant
          await supabase
            .from('event_participants')
            .update({ matches_sent: true })
            .eq('event_id', eventId)
            .eq('user_id', participant.user_id);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          const userData = Array.isArray(participant.users) ? participant.users[0] : participant.users;
          errors.push(`Error sending to ${userData?.email}: ${errorMsg}`);
        }
      }

      if (errors.length > 0) {
        console.warn('[matchesService.sendMatchesToAll] Some emails failed:', errors);
      }

      return {
        success: true,
        message: `Matchs enviados para ${sentCount} participante(s)`,
        sentCount,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[matchesService.sendMatchesToAll] Error:', errorMsg);
      return { success: false, message: `Error: ${errorMsg}`, sentCount: 0 };
    }
  },

  /**
   * Check if matches have been sent for an event
   */
  async areMatchesSent(eventId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return false;
    }

    try {
      const { data } = await supabase
        .from('event_participants')
        .select('matches_sent')
        .eq('event_id', eventId)
        .eq('matches_sent', true)
        .limit(1);

      return (data || []).length > 0;
    } catch (error) {
      console.error('[matchesService.areMatchesSent] Error:', error);
      return false;
    }
  },
};
