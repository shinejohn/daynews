import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

// Server queries
export async function getAnnouncements() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('announcements').select('*');

  // Add specific logic per table





  return query;
}

// Client queries
export const announcementsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').


    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  active: async (limit: number = 5) => {
    const currentDate = new Date().toISOString();
    const { data, error } = await (supabase as any).from('announcements').
    select('*').
    eq('ai_moderation_passed', true).
    order('created_at', { ascending: false }).
    limit(limit);
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').

    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};