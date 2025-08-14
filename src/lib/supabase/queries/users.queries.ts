import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

// Server-side queries (for SSR)
export async function getUsers() {
  const supabase = await createServerClient()
  return supabase.from('users').select('*').order('created_at', { ascending: false })
}

export async function getUserById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('users').select('*').eq('id' as any, id as any).single()
}

export async function getUsersByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('users').select('*').eq('user_id' as any, userId as any)
}

// Client-side queries (for React Query hooks)
export const userQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id' as any, id as any)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id' as any, userId as any)
    if (error) throw error
    return data
  }
}

// Mutations
export const userMutations = {
  create: async (data: UserInsert) => {
    const { data: result, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: UserUpdate) => {
    const { data: result, error } = await supabase
      .from('users')
      .update(data)
      .eq('id' as any, id as any)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id' as any, id as any)
    if (error) throw error
  }
}
