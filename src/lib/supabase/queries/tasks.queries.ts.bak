import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Task = Database['public']['Tables']['tasks']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Server-side queries (for SSR)
export async function getTasks() {
  const supabase = await createServerClient()
  return supabase.from('tasks').select('*').order('created_at', { ascending: false })
}

export async function getTaskById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('tasks').select('*').eq('id', id).single()
}

export async function getTasksByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('tasks').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const taskQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const taskMutations = {
  create: async (data: TaskInsert) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: TaskUpdate) => {
    const { data: result, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
