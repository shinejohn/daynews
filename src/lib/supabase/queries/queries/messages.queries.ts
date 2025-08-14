import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Message = Message['Row'];

// Server queries
export async function getMessages() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('messages').select('*');

  // Add specific logic per table





  return query;
}

// Client queries
export const messagesQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('messages').
    select('*').


    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('messages').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('messages').
    select('*').

    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byUser: async (userId: string) => {
    const { data, error } = await (supabase as any).from('messages').
    select('*').
    eq('user_id', userId).
    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

// Client mutations
export const messagesMutations = {
  create: async (data: Message['Insert']) => {
    const { data: message, error } = await (supabase as any).from('messages').
    insert(data).
    select().
    single();
    if (error) throw error;
    return message;
  },

  update: async (id: string, data: Message['Update']) => {
    const { data: message, error } = await (supabase as any).from('messages').
    update(data).
    eq('id', id).
    select().
    single();
    if (error) throw error;
    return message;
  },

  delete: async (id: string) => {
    const { error } = await (supabase as any).from('messages').
    delete().
    eq('id', id);
    if (error) throw error;
  }
};