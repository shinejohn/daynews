const fs = require('fs');

const tables = ['tasks', 'users', 'profiles', 'invoices', 'payments', 'messages', 'marketplace_items'];

tables.forEach(table => {
    const singular = table.slice(0, -1);
    const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
    
    const hookContent = `'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { ${singular}Queries, ${singular}Mutations } from '@/lib/supabase/queries/${table}.queries'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type ${capitalized} = Database['public']['Tables']['${table}']['Row']
type ${capitalized}Insert = Database['public']['Tables']['${table}']['Insert']
type ${capitalized}Update = Database['public']['Tables']['${table}']['Update']

// Query hooks
export function use${capitalized}s() {
  return useQuery({
    queryKey: ['${table}'],
    queryFn: ${singular}Queries.all,
  })
}

export function use${capitalized}(id: string) {
  return useQuery({
    queryKey: ['${table}', id],
    queryFn: () => ${singular}Queries.byId(id),
    enabled: !!id,
  })
}

export function use${capitalized}sByUser(userId: string) {
  return useQuery({
    queryKey: ['${table}', 'user', userId],
    queryFn: () => ${singular}Queries.byUser(userId),
    enabled: !!userId,
  })
}

// Mutation hooks
export function useCreate${capitalized}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ${singular}Mutations.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${table}'] })
    },
  })
}

export function useUpdate${capitalized}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ${capitalized}Update }) =>
      ${singular}Mutations.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['${table}'] })
      queryClient.invalidateQueries({ queryKey: ['${table}', id] })
    },
  })
}

export function useDelete${capitalized}() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ${singular}Mutations.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${table}'] })
    },
  })
}

// Real-time subscription hook
export function use${capitalized}sRealtime() {
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('${table}_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: '${table}' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['${table}'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
`;

    fs.writeFileSync(`./src/hooks/queries/use${capitalized}.ts`, hookContent);
});

// Create index file
const indexContent = `// Export all hooks
${tables.map(table => {
    const singular = table.slice(0, -1);
    const capitalized = singular.charAt(0).toUpperCase() + singular.slice(1);
    return `export * from './use${capitalized}'`;
}).join('\n')}
`;

fs.writeFileSync('./src/hooks/queries/index.ts', indexContent);

console.log(`✅ Generated hooks for ${tables.length} tables`);
