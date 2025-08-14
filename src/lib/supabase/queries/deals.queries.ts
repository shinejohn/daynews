import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Deal = Database['public']['Tables']['deals']['Row'];

// Server queries
export async function getDeals() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('deals').select('*');

  // Add specific logic per table





  return query;
}

// Client queries
export const dealsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('deals').
    select('*').


    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('deals').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('deals').
    select('*').

    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};