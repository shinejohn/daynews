import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Category = Category['Row'];

// Server queries
export async function getCategories() {
  const supabase = await createServerClient();

  const query = (supabase as any).
  from('categories').
  select('*').
  eq('is_active', true).
  order('display_order', { ascending: true });

  return query;
}

export async function getBusinessCategories() {
  const supabase = await createServerClient();

  const query = (supabase as any).
  from('categories').
  select('*').
  eq('category_type', 'business').
  eq('is_active', true).
  order('display_order', { ascending: true });

  return query;
}

// Client queries
export const categoriesQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('categories').
    select('*').
    eq('is_active', true).
    order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  byType: async (categoryType: string) => {
    const { data, error } = await (supabase as any).from('categories').
    select('*').
    eq('category_type', categoryType).
    eq('is_active', true).
    order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  business: async () => {
    const { data, error } = await (supabase as any).from('categories').
    select('*').
    eq('category_type', 'business').
    eq('is_active', true).
    order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('categories').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  }
};