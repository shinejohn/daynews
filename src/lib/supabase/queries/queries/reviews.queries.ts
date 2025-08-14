import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Review = Database['public']['Tables']['reviews']['Row'];

// Server queries
export async function getReviews() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('reviews').select('*');

  // Add specific logic per table





  return query;
}

// Client queries
export const reviewsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('reviews').
    select('*').


    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('reviews').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('reviews').
    select('*').

    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};