import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Marketplace_item = Database['public']['Tables']['marketplace_items']['Row']
type Marketplace_itemInsert = Database['public']['Tables']['marketplace_items']['Insert']
type Marketplace_itemUpdate = Database['public']['Tables']['marketplace_items']['Update']

// Server-side queries (for SSR)
export async function getMarketplace_items() {
  const supabase = await createServerClient()
  return supabase.from('marketplace_items').select('*').order('created_at', { ascending: false })
}

export async function getMarketplace_itemById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('marketplace_items').select('*').eq('id', id).single()
}

export async function getMarketplace_itemsByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('marketplace_items').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const marketplace_itemQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const marketplace_itemMutations = {
  create: async (data: Marketplace_itemInsert) => {
    const { data: result, error } = await supabase
      .from('marketplace_items')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: Marketplace_itemUpdate) => {
    const { data: result, error } = await supabase
      .from('marketplace_items')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('marketplace_items')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
