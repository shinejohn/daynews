import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found. Using mock mode.')
}

// Create singleton instance
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  // Production mode - require real credentials
  if (process.env.NODE_ENV === 'production') {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are required in production')
    }
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
    return supabaseClient
  }

  // Development mode - allow mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for development
    supabaseClient = {
      from: (table: string) => ({
        select: () => Promise.resolve({ data: [], error: null, count: null }),
        insert: () => Promise.resolve({ data: null, error: null, count: null }),
        update: () => Promise.resolve({ data: null, error: null, count: null }),
        delete: () => Promise.resolve({ data: null, error: null, count: null }),
        upsert: () => Promise.resolve({ data: null, error: null, count: null }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Mock mode' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } }
        },
      },
      storage: {
        from: (bucket: string) => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          download: () => Promise.resolve({ data: null, error: null }),
          list: () => Promise.resolve({ data: [], error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
        }),
      }
    } as any
  } else {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  }
  
  return supabaseClient
}

// Export default instance
export const supabase = getSupabaseClient()

// Export types
export type { Database } from '@/types/database.types'
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
