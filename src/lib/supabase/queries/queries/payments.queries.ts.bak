import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Payment = Database['public']['Tables']['payments']['Row']
type PaymentInsert = Database['public']['Tables']['payments']['Insert']
type PaymentUpdate = Database['public']['Tables']['payments']['Update']

// Server-side queries (for SSR)
export async function getPayments() {
  const supabase = await createServerClient()
  return supabase.from('payments').select('*').order('created_at', { ascending: false })
}

export async function getPaymentById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('payments').select('*').eq('id', id).single()
}

export async function getPaymentsByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('payments').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const paymentQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const paymentMutations = {
  create: async (data: PaymentInsert) => {
    const { data: result, error } = await supabase
      .from('payments')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: PaymentUpdate) => {
    const { data: result, error } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
