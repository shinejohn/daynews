import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// Server-side queries (for SSR)
export async function getProfiles() {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').order('created_at', { ascending: false })
}

export async function getProfileById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').eq('id', id).single()
}

export async function getProfilesByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const profileQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const profileMutations = {
  create: async (data: ProfileInsert) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: ProfileUpdate) => {
    const { data: result, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
