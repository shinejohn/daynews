const fs = require('fs');

// Common table names to generate queries for
const tables = ['tasks', 'users', 'profiles', 'invoices', 'payments', 'messages', 'marketplace_items'];

tables.forEach(table => {
    const singular = table.slice(0, -1); // Simple singularization
    const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
    
    const queryContent = `import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type ${capitalized} = Database['public']['Tables']['${table}']['Row']
type ${capitalized}Insert = Database['public']['Tables']['${table}']['Insert']
type ${capitalized}Update = Database['public']['Tables']['${table}']['Update']

// Server-side queries (for SSR)
export async function get${capitalized}s() {
  const supabase = await createServerClient()
  return supabase.from('${table}').select('*').order('created_at', { ascending: false })
}

export async function get${capitalized}ById(id: string) {
  const supabase = await createServerClient()
  return supabase.from('${table}').select('*').eq('id', id).single()
}

export async function get${capitalized}sByUser(userId: string) {
  const supabase = await createServerClient()
  return supabase.from('${table}').select('*').eq('user_id', userId)
}

// Client-side queries (for React Query hooks)
export const ${singular}Queries = {
  all: async () => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  }
}

// Mutations
export const ${singular}Mutations = {
  create: async (data: ${capitalized}Insert) => {
    const { data: result, error } = await supabase
      .from('${table}')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  update: async (id: string, data: ${capitalized}Update) => {
    const { data: result, error } = await supabase
      .from('${table}')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return result
  },
  
  delete: async (id: string) => {
    const { error } = await supabase
      .from('${table}')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
`;

    fs.writeFileSync(`./src/lib/supabase/queries/${table}.queries.ts`, queryContent);
});

// Create an index file
const indexContent = tables.map(table => 
    `export * from './${table}.queries'`
).join('\n');

fs.writeFileSync('./src/lib/supabase/queries/index.ts', indexContent);

console.log(`✅ Generated query files for ${tables.length} tables`);
