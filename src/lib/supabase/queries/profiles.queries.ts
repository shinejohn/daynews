import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Profile = Profile['Row']
type ProfileInsert = Profile['Insert']
type ProfileUpdate = Profile['Update']

// Server-side queries (for SSR)
export async function getProfiles() {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').order('created_at', { ascending: false })
}

export async function getProfileById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').eq('id' as any, id as any).single()
}

export async function getProfilesByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('profiles').select('*').eq('user_id' as any, userId as any)
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
      .eq('id' as any, id as any)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id' as any, userId as any)
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
      .eq('id' as any, id as any)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id' as any, id as any)
    if (error) throw error
  }
}
