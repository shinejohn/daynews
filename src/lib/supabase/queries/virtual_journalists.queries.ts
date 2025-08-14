import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Virtual_journalist = Database['public']['Tables']['virtual_journalists']['Row'];

// Server queries
export async function getVirtual_journalists() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('virtual_journalists').select('*');

  // Add specific logic per table





  return query;
}

// Client queries
export const virtual_journalistsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('virtual_journalists').
    select('*').


    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('virtual_journalists').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('virtual_journalists').
    select('*').

    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};