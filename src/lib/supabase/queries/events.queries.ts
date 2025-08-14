import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Event = Database['public']['Tables']['events']['Row'];

// Server queries
export async function getEvents() {
  const supabase = await createServerClient();

  const query = (supabase as any).
  from('events').
  select('*').
  gte('start_date', new Date().toISOString().split('T')[0]) // Use date only for better filtering
  .or('is_canceled.is.null,is_canceled.eq.false') // Only show non-canceled events (including null)
  .order('start_date', { ascending: true }); // Order by start date

  return query;
}

// Client queries
export const eventsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('events').
    select('*').
    gte('start_date', new Date().toISOString().split('T')[0]) // Use date only for better filtering
    .or('is_canceled.is.null,is_canceled.eq.false') // Only show non-canceled events (including null)
    .order('start_date', { ascending: true }); // Order by start date
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('events').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('events').
    select('*').
    eq('community_id', communityId).
    gte('start_date', new Date().toISOString().split('T')[0]).
    or('is_canceled.is.null,is_canceled.eq.false').
    order('start_date', { ascending: true });
    if (error) throw error;
    return data;
  }
};