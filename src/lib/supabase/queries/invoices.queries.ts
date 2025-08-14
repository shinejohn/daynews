import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Invoice = Invoice['Row']
type InvoiceInsert = Invoice['Insert']
type InvoiceUpdate = Invoice['Update']

// Server-side queries (for SSR)
export async function getInvoices() {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').order('created_at', { ascending: false })
}

export async function getInvoiceById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').eq('id' as any, id as any).single()
}

export async function getInvoicesByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('invoices').select('*').eq('user_id' as any, userId as any)
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
      .eq('id' as any, id as any)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id' as any, userId as any)
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
      .eq('id' as any, id as any)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id' as any, id as any)
    if (error) throw error
  }
}
