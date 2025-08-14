import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Categories type would be defined in database.types.ts
// For now, using any to avoid circular reference
type Category = any

// Server queries
export async function getCategories() {
  const supabase = await createServerClient()
  
  const query = (supabase as any)
    .from('categories')
    .select('*')
    .eq('is_active' as any, true as any) as any
    .order('display_order', { ascending: true })
  
  return query
}

export async function getBusinessCategories() {
  const supabase = await createServerClient()
  
  const query = (supabase as any)
    .from('categories')
    .select('*')
    .eq('category_type' as any, 'business' as any) as any
    .eq('is_active' as any, true as any) as any
    .order('display_order', { ascending: true })
  
  return query
}

// Client queries
export const categoriesQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('categories')
      .select('*')
      .eq('is_active' as any, true as any) as any
      .order('display_order', { ascending: true })
    if (error) throw error
    return data
  },
  
  byType: async (categoryType: string) => {
    const { data, error } = await (supabase as any).from('categories')
      .select('*')
      .eq('category_type' as any, categoryType as any) as any
      .eq('is_active' as any, true as any) as any
      .order('display_order', { ascending: true })
    if (error) throw error
    return data
  },
  
  business: async () => {
    const { data, error } = await (supabase as any).from('categories')
      .select('*')
      .eq('category_type' as any, 'business' as any) as any
      .eq('is_active' as any, true as any) as any
      .order('display_order', { ascending: true })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('categories')
      .select('*')
      .eq('id' as any, id as any) as any
      .single()
    if (error) throw error
    return data
  }
}