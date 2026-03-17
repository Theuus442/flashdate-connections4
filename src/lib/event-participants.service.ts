import { supabase, isSupabaseConfigured } from './supabase';

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  status: 'registered' | 'confirmed' | 'no-show';
  joinedAt: string;
}

export const eventParticipantsService = {
  /**
   * Get all participants for an event
   */
  async getEventParticipants(eventId: string): Promise<{ data: EventParticipant[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((participant: any) => ({
        id: participant.id,
        eventId: participant.event_id,
        userId: participant.user_id,
        status: participant.status as 'registered' | 'confirmed' | 'no-show',
        joinedAt: participant.joined_at,
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get participant by ID
   */
  async getParticipantById(id: string): Promise<{ data: EventParticipant | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedData = data ? {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        status: data.status as 'registered' | 'confirmed' | 'no-show',
        joinedAt: data.joined_at,
      } : null;

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Check if user is participant in an event
   */
  async isUserParticipant(eventId: string, userId: string): Promise<{ data: boolean; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

      return { data: !!data, error: null };
    } catch (error) {
      return { data: false, error };
    }
  },

  /**
   * Register user as participant in an event
   */
  async registerParticipant(eventId: string, userId: string, status: 'registered' | 'confirmed' = 'registered'): Promise<{ data: EventParticipant | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .insert([{
          event_id: eventId,
          user_id: userId,
          status,
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData: EventParticipant = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        status: data.status as 'registered' | 'confirmed' | 'no-show',
        joinedAt: data.joined_at,
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update participant status
   */
  async updateParticipantStatus(eventId: string, userId: string, status: 'registered' | 'confirmed' | 'no-show'): Promise<{ data: EventParticipant | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      const transformedData: EventParticipant = {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        status: data.status as 'registered' | 'confirmed' | 'no-show',
        joinedAt: data.joined_at,
      };

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Remove participant from event
   */
  async removeParticipant(eventId: string, userId: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  /**
   * Get participants by status
   */
  async getParticipantsByStatus(eventId: string, status: 'registered' | 'confirmed' | 'no-show'): Promise<{ data: EventParticipant[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('status', status)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const transformedData = data?.map((participant: any) => ({
        id: participant.id,
        eventId: participant.event_id,
        userId: participant.user_id,
        status: participant.status as 'registered' | 'confirmed' | 'no-show',
        joinedAt: participant.joined_at,
      }));

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get count of participants by status
   */
  async getParticipantCountByStatus(eventId: string): Promise<{ data: { registered: number; confirmed: number; noShow: number } | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('status')
        .eq('event_id', eventId);

      if (error) throw error;

      const counts = {
        registered: 0,
        confirmed: 0,
        noShow: 0,
      };

      data?.forEach((participant: any) => {
        if (participant.status === 'registered') counts.registered++;
        else if (participant.status === 'confirmed') counts.confirmed++;
        else if (participant.status === 'no-show') counts.noShow++;
      });

      return { data: counts, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get all event IDs where user is a participant
   */
  async getUserEventIds(userId: string): Promise<{ data: string[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const eventIds = data?.map((participant: any) => participant.event_id) || [];

      return { data: eventIds, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
};
