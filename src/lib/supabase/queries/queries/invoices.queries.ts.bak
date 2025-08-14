import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Invoice = Database['public']['Tables']['invoices']['Row']
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

// Server-side queries (for SSR)
export async function getInvoices() {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').order('created_at', { ascending: false })
}

export async function getInvoiceById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').eq('id', id).single()
}

export async function getInvoicesByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const invoiceQueries = {
  all: async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const invoiceMutations = {
  create: async (data: InvoiceInsert) => {
    const { data: result, error } = await supabase
      .from('invoices')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: InvoiceUpdate) => {
    const { data: result, error } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
