import { supabase, isSupabaseConfigured } from './supabase';
import { storageService } from './storage.service';
import { getProxiedUrl } from './url-proxy';
import { parse, format } from 'date-fns';

export interface EventData {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  nextDate: string;
  schedule: string;
  checkIn: string;
  environment: string;
  music: string;
  dressCode: string;
  parking: string;
  price: string;
  description: string;
  eventImage: string;
  email: string;
  whatsapp: string;
  vagas: string;
  vagasLimitDate: string;
}

/**
 * Helper function to convert date to YYYY-MM-DD format for Supabase
 */
function convertDateToSupabaseFormat(dateString: string): string {
  if (!dateString) return '';
  try {
    // Check if it's already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    // Try parsing as DD/MM/YYYY
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const date = parse(dateString, 'dd/MM/yyyy', new Date());
      return format(date, 'yyyy-MM-dd');
    }
    // Return as is if format is unknown
    return dateString;
  } catch {
    return dateString;
  }
}

/**
 * Helper function to transform raw event data with proxied URLs
 */
function transformEventData(event: any): EventData {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    city: event.city,
    date: event.date,
    nextDate: event.next_date,
    schedule: event.schedule,
    checkIn: event.check_in,
    environment: event.environment,
    music: event.music,
    dressCode: event.dress_code,
    parking: event.parking,
    price: event.price,
    description: event.description,
    eventImage: getProxiedUrl(event.event_image_url), // Apply proxy transformation
    email: event.email,
    whatsapp: event.whatsapp,
    vagas: event.vagas?.toString() || '',
    vagasLimitDate: event.vagas_limit_date,
  };
}

export const eventsService = {
  /**
   * Get all events
   */
  async getEvents(): Promise<{ data: EventData[] | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('next_date', { ascending: true });

      if (error) throw error;

      const transformedData = data?.map(transformEventData);

      return { data: transformedData || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<{ data: EventData | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedData = data ? transformEventData(data) : null;

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Create new event
   */
  async createEvent(eventData: Omit<EventData, 'id'>, eventImage?: File): Promise<{ data: EventData | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      let eventImageUrl = eventData.eventImage;

      // Upload event image if provided
      if (eventImage) {
        const result = await storageService.uploadEventImage(Date.now().toString(), eventImage);
        if (result.error) throw result.error;
        eventImageUrl = result.data || eventData.eventImage;
      }

      const { data, error } = await supabase
        .from('events')
        .insert([{
          title: eventData.title,
          location: eventData.location,
          city: eventData.city,
          date: eventData.date,
          next_date: eventData.nextDate,
          schedule: eventData.schedule,
          check_in: eventData.checkIn,
          environment: eventData.environment,
          music: eventData.music,
          dress_code: eventData.dressCode,
          parking: eventData.parking,
          price: eventData.price,
          description: eventData.description,
          event_image_url: eventImageUrl,
          email: eventData.email,
          whatsapp: eventData.whatsapp,
          vagas: parseInt(eventData.vagas) || 0,
          vagas_limit_date: eventData.vagasLimitDate,
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedData = transformEventData(data);

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Update event
   */
  async updateEvent(id: string, updates: Partial<EventData>, eventImage?: File): Promise<{ data: EventData | null; error: any }> {
    if (!isSupabaseConfigured()) {
      return { data: null, error: 'Supabase not configured' };
    }

    try {
      let eventImageUrl: string | undefined;

      // Upload event image if provided
      if (eventImage) {
        const result = await storageService.uploadEventImage(id, eventImage);
        if (result.error) throw result.error;
        eventImageUrl = result.data;
      }

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.location) updateData.location = updates.location;
      if (updates.city) updateData.city = updates.city;
      if (updates.date) updateData.date = updates.date;
      if (updates.nextDate) updateData.next_date = updates.nextDate;
      if (updates.schedule) updateData.schedule = updates.schedule;
      if (updates.checkIn) updateData.check_in = updates.checkIn;
      if (updates.environment) updateData.environment = updates.environment;
      if (updates.music) updateData.music = updates.music;
      if (updates.dressCode) updateData.dress_code = updates.dressCode;
      if (updates.parking) updateData.parking = updates.parking;
      if (updates.price) updateData.price = updates.price;
      if (updates.description) updateData.description = updates.description;
      if (eventImageUrl) updateData.event_image_url = eventImageUrl;
      if (updates.email) updateData.email = updates.email;
      if (updates.whatsapp) updateData.whatsapp = updates.whatsapp;
      if (updates.vagas) updateData.vagas = parseInt(updates.vagas) || 0;
      if (updates.vagasLimitDate) updateData.vagas_limit_date = updates.vagasLimitDate;

      // Update event without .single() - RLS might affect return value
      const { error: updateError } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Fetch the updated event to return
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        // Event might not exist or RLS blocked it
        throw new Error(`Falha ao recuperar evento após atualização: ${fetchError.message}`);
      }

      if (!data) {
        throw new Error('Evento não encontrado após atualização');
      }

      const transformedData = transformEventData(data);

      return { data: transformedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<{ error: any }> {
    if (!isSupabaseConfigured()) {
      return { error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
};
